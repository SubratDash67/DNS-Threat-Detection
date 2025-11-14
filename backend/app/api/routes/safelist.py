from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, func, and_, or_
from typing import List
import csv
import io
from datetime import datetime, timedelta
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.safelist import SafelistDomain
from app.models.scan import Scan
from app.schemas.safelist import (
    SafelistDomainCreate,
    SafelistDomainUpdate,
    SafelistDomainResponse,
    SafelistBulkImport,
    SafelistStats,
)
from app.services.detector_service import get_detector_service
import logging

router = APIRouter(prefix="/api/safelist", tags=["Safelist"])
logger = logging.getLogger(__name__)


@router.get("", response_model=List[SafelistDomainResponse])
async def get_safelist_domains(
    tier: str = None,
    search: str = None,
    page: int = 1,
    page_size: int = 100,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(SafelistDomain)

    if tier:
        if tier not in ["tier1", "tier2", "tier3"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid tier. Must be tier1, tier2, or tier3",
            )
        query = query.where(SafelistDomain.tier == tier)

    if search:
        query = query.where(SafelistDomain.domain.ilike(f"%{search}%"))

    query = query.order_by(SafelistDomain.created_at.desc())

    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)

    result = await db.execute(query)
    domains = result.scalars().all()

    return domains


@router.post(
    "", response_model=SafelistDomainResponse, status_code=status.HTTP_201_CREATED
)
async def add_safelist_domain(
    domain_data: SafelistDomainCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SafelistDomain).where(
            SafelistDomain.domain == domain_data.domain.lower()
        )
    )
    existing = result.scalar_one_or_none()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Domain already exists in safelist",
        )

    new_domain = SafelistDomain(
        domain=domain_data.domain.lower(),
        tier=domain_data.tier,
        notes=domain_data.notes,
        added_by=current_user.id,
        source="user",
    )

    db.add(new_domain)
    await db.commit()
    await db.refresh(new_domain)

    return new_domain


@router.put("/{domain_id}", response_model=SafelistDomainResponse)
async def update_safelist_domain(
    domain_id: int,
    domain_update: SafelistDomainUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SafelistDomain).where(SafelistDomain.id == domain_id)
    )
    domain = result.scalar_one_or_none()

    if not domain:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Domain not found in safelist"
        )

    if domain.source == "system" and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot modify system safelist domains",
        )

    if domain_update.tier:
        domain.tier = domain_update.tier

    if domain_update.notes is not None:
        domain.notes = domain_update.notes

    await db.commit()
    await db.refresh(domain)

    return domain


@router.delete("/{domain_id}")
async def delete_safelist_domain(
    domain_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SafelistDomain).where(SafelistDomain.id == domain_id)
    )
    domain = result.scalar_one_or_none()

    if not domain:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Domain not found in safelist"
        )

    if domain.source == "system" and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete system safelist domains",
        )

    await db.execute(delete(SafelistDomain).where(SafelistDomain.id == domain_id))
    await db.commit()

    return {"message": "Domain removed from safelist"}


@router.post("/import")
async def bulk_import_safelist(
    import_data: SafelistBulkImport,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if len(import_data.domains) > 1000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 1000 domains per import",
        )

    added_count = 0
    skipped_count = 0

    for domain_str in import_data.domains:
        domain_lower = domain_str.lower().strip()

        if not domain_lower:
            continue

        result = await db.execute(
            select(SafelistDomain).where(SafelistDomain.domain == domain_lower)
        )
        existing = result.scalar_one_or_none()

        if existing:
            skipped_count += 1
            continue

        new_domain = SafelistDomain(
            domain=domain_lower,
            tier=import_data.tier,
            added_by=current_user.id,
            source=import_data.source,
        )

        db.add(new_domain)
        added_count += 1

    await db.commit()

    return {
        "message": "Bulk import completed",
        "added": added_count,
        "skipped": skipped_count,
        "total": len(import_data.domains),
    }


@router.get("/export")
async def export_safelist(
    tier: str = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(SafelistDomain)

    if tier:
        if tier not in ["tier1", "tier2", "tier3"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid tier"
            )
        query = query.where(SafelistDomain.tier == tier)

    result = await db.execute(query)
    domains = result.scalars().all()

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow(["Domain", "Tier", "Source", "Notes", "Created At"])

    for domain in domains:
        writer.writerow(
            [
                domain.domain,
                domain.tier,
                domain.source,
                domain.notes or "",
                domain.created_at.isoformat(),
            ]
        )

    filename = f"safelist_{tier if tier else 'all'}.csv"

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.get("/stats", response_model=SafelistStats)
async def get_safelist_stats(
    current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    total_result = await db.execute(select(func.count(SafelistDomain.id)))
    total_domains = total_result.scalar() or 0

    tier1_result = await db.execute(
        select(func.count(SafelistDomain.id)).where(SafelistDomain.tier == "tier1")
    )
    tier1_count = tier1_result.scalar() or 0

    tier2_result = await db.execute(
        select(func.count(SafelistDomain.id)).where(SafelistDomain.tier == "tier2")
    )
    tier2_count = tier2_result.scalar() or 0

    tier3_result = await db.execute(
        select(func.count(SafelistDomain.id)).where(SafelistDomain.tier == "tier3")
    )
    tier3_count = tier3_result.scalar() or 0

    week_ago = datetime.utcnow() - timedelta(days=7)
    recent_result = await db.execute(
        select(func.count(SafelistDomain.id)).where(
            SafelistDomain.created_at >= week_ago
        )
    )
    recently_added = recent_result.scalar() or 0

    total_scans_result = await db.execute(
        select(func.count(Scan.id)).where(Scan.user_id == current_user.id)
    )
    total_scans = total_scans_result.scalar() or 0

    safelist_hits_result = await db.execute(
        select(func.count(Scan.id)).where(
            and_(Scan.user_id == current_user.id, Scan.method == "safelist")
        )
    )
    safelist_hits = safelist_hits_result.scalar() or 0

    hit_rate = (safelist_hits / total_scans * 100) if total_scans > 0 else 0.0

    return {
        "total_domains": total_domains,
        "tier1_count": tier1_count,
        "tier2_count": tier2_count,
        "tier3_count": tier3_count,
        "recently_added": recently_added,
        "safelist_hit_rate": hit_rate,
    }


@router.post("/populate-from-detector")
async def populate_from_detector(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Populate database safelist with hardcoded trusted domains"""

    # Hardcoded major trusted domains
    tier1_domains = [
        "google.com",
        "youtube.com",
        "facebook.com",
        "instagram.com",
        "twitter.com",
        "amazon.com",
        "apple.com",
        "microsoft.com",
        "linkedin.com",
        "netflix.com",
        "reddit.com",
        "github.com",
        "stackoverflow.com",
        "wikipedia.org",
        "medium.com",
        "cloudflare.com",
        "zoom.us",
        "dropbox.com",
        "spotify.com",
        "twitch.tv",
        "paypal.com",
        "ebay.com",
        "adobe.com",
        "salesforce.com",
        "oracle.com",
        "ibm.com",
        "cisco.com",
        "intel.com",
        "nvidia.com",
        "amd.com",
        "whatsapp.com",
        "telegram.org",
        "discord.com",
        "slack.com",
        "zoom.com",
        "gmail.com",
        "outlook.com",
        "yahoo.com",
        "hotmail.com",
        "protonmail.com",
        "cnn.com",
        "bbc.com",
        "nytimes.com",
        "washingtonpost.com",
        "theguardian.com",
        "forbes.com",
        "bloomberg.com",
        "reuters.com",
        "wsj.com",
        "techcrunch.com",
    ]

    tier2_domains = [
        "shopify.com",
        "wordpress.com",
        "wix.com",
        "squarespace.com",
        "godaddy.com",
        "namecheap.com",
        "hostgator.com",
        "bluehost.com",
        "siteground.com",
        "digitalocean.com",
        "aws.amazon.com",
        "azure.microsoft.com",
        "cloud.google.com",
        "heroku.com",
        "vercel.com",
        "netlify.com",
        "cloudflare.com",
        "akamai.com",
        "fastly.com",
        "cloudfront.net",
        "stripe.com",
        "square.com",
        "braintree.com",
        "authorize.net",
        "venmo.com",
        "coinbase.com",
        "binance.com",
        "kraken.com",
        "gemini.com",
        "bitfinex.com",
        "mailchimp.com",
        "sendgrid.com",
        "mandrill.com",
        "hubspot.com",
        "marketo.com",
        "zendesk.com",
        "intercom.com",
        "freshdesk.com",
        "helpscout.com",
        "drift.com",
        "atlassian.com",
        "jira.com",
        "confluence.com",
        "trello.com",
        "asana.com",
        "monday.com",
        "notion.so",
        "clickup.com",
        "airtable.com",
        "basecamp.com",
    ]

    tier3_domains = [
        "stackoverflow.blog",
        "dev.to",
        "hashnode.com",
        "medium.dev",
        "substack.com",
        "patreon.com",
        "ko-fi.com",
        "gofundme.com",
        "kickstarter.com",
        "indiegogo.com",
        "etsy.com",
        "redbubble.com",
        "society6.com",
        "zazzle.com",
        "cafepress.com",
        "udemy.com",
        "coursera.org",
        "edx.org",
        "khanacademy.org",
        "skillshare.com",
        "pluralsight.com",
        "codecademy.com",
        "freecodecamp.org",
        "w3schools.com",
        "mdn.dev",
        "npmjs.com",
        "pypi.org",
        "rubygems.org",
        "packagist.org",
        "nuget.org",
        "docker.com",
        "kubernetes.io",
        "terraform.io",
        "ansible.com",
        "jenkins.io",
        "circleci.com",
        "travis-ci.org",
        "gitlab.com",
        "bitbucket.org",
        "sourceforge.net",
        "vimeo.com",
        "dailymotion.com",
        "soundcloud.com",
        "bandcamp.com",
        "mixcloud.com",
        "imgur.com",
        "flickr.com",
        "500px.com",
        "unsplash.com",
        "pexels.com",
    ]

    total_added = 0
    total_skipped = 0

    all_tiers = {
        "tier1": tier1_domains,
        "tier2": tier2_domains,
        "tier3": tier3_domains,
    }

    for tier, domains in all_tiers.items():
        logger.info(f"Processing {len(domains)} domains for {tier}")

        for domain in domains:
            domain_lower = domain.lower().strip()

            if not domain_lower:
                continue

            # Check if domain already exists
            result = await db.execute(
                select(SafelistDomain).where(SafelistDomain.domain == domain_lower)
            )
            existing = result.scalar_one_or_none()

            if existing:
                total_skipped += 1
                continue

            # Add domain
            new_domain = SafelistDomain(
                domain=domain_lower,
                tier=tier,
                added_by=current_user.id,
                source="system",
                notes="Pre-loaded trusted domain",
            )

            db.add(new_domain)
            total_added += 1

    # Commit all at once
    await db.commit()

    logger.info(
        f"Safelist population complete: {total_added} added, {total_skipped} skipped"
    )

    return {
        "message": "Safelist populated successfully",
        "added": total_added,
        "skipped": total_skipped,
        "tier1": len(tier1_domains),
        "tier2": len(tier2_domains),
        "tier3": len(tier3_domains),
    }
