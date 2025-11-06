from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.safelist import SafelistDomain
from datetime import datetime

router = APIRouter(prefix="/api/admin", tags=["Admin"])

# Safelist data
SAFELIST_DATA = {
    "tier1": {
        "Banking & Finance": [
            "chase.com", "bankofamerica.com", "wellsfargo.com", "citibank.com",
            "usbank.com", "capitalone.com", "discover.com", "americanexpress.com",
            "paypal.com", "venmo.com", "stripe.com", "square.com",
        ],
        "Government": [
            "usa.gov", "irs.gov", "ssa.gov", "cdc.gov", "fda.gov", "nasa.gov",
            "whitehouse.gov", "state.gov", "treasury.gov", "defense.gov",
        ],
        "Major Tech Companies": [
            "google.com", "microsoft.com", "apple.com", "amazon.com",
            "facebook.com", "twitter.com", "linkedin.com", "github.com",
            "youtube.com", "instagram.com", "whatsapp.com", "zoom.us",
            "netflix.com", "spotify.com", "reddit.com", "wikipedia.org",
        ],
    },
    "tier2": {
        "Education": [
            "mit.edu", "stanford.edu", "harvard.edu", "berkeley.edu",
            "princeton.edu", "yale.edu", "columbia.edu", "cornell.edu",
            "coursera.org", "edx.org", "khanacademy.org", "udemy.com",
        ],
        "News & Media": [
            "bbc.com", "cnn.com", "nytimes.com", "theguardian.com",
            "washingtonpost.com", "reuters.com", "apnews.com", "bloomberg.com",
            "wsj.com", "npr.org", "forbes.com", "economist.com",
        ],
        "E-commerce": [
            "ebay.com", "walmart.com", "target.com", "bestbuy.com",
            "homedepot.com", "costco.com", "alibaba.com", "etsy.com",
            "shopify.com", "wayfair.com",
        ],
        "Cloud Services": [
            "aws.amazon.com", "azure.microsoft.com", "cloud.google.com",
            "digitalocean.com", "heroku.com", "cloudflare.com",
            "dropbox.com", "box.com", "onedrive.com", "icloud.com",
        ],
    },
    "tier3": {
        "Development Tools": [
            "stackoverflow.com", "gitlab.com", "bitbucket.org",
            "npmjs.com", "pypi.org", "docker.com", "kubernetes.io",
            "jenkins.io", "jetbrains.com", "visualstudio.com",
        ],
        "Communication": [
            "slack.com", "discord.com", "telegram.org", "skype.com",
            "teams.microsoft.com", "webex.com",
        ],
        "Productivity": [
            "notion.so", "trello.com", "asana.com", "monday.com",
            "airtable.com", "evernote.com", "figma.com",
        ],
    },
}


@router.post("/populate-safelist")
async def populate_safelist(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Populate the safelist with default trusted domains.
    Only accessible by authenticated users.
    """
    total_added = 0
    total_skipped = 0
    errors = []

    try:
        for tier, categories in SAFELIST_DATA.items():
            for category, domains in categories.items():
                for domain in domains:
                    try:
                        # Check if domain already exists
                        result = await db.execute(
                            select(SafelistDomain).where(
                                SafelistDomain.domain == domain
                            )
                        )
                        existing = result.scalar_one_or_none()

                        if existing:
                            total_skipped += 1
                            continue

                        # Add new domain (added_by set to current user)
                        new_domain = SafelistDomain(
                            domain=domain,
                            tier=tier,
                            source="system",
                            notes=f"Category: {category}",
                            added_by=current_user.id,
                            created_at=datetime.utcnow(),
                        )
                        db.add(new_domain)
                        await db.flush()
                        total_added += 1

                    except Exception as e:
                        errors.append(f"{domain}: {str(e)}")
                        await db.rollback()
                        continue

        # Commit all changes
        await db.commit()

        return {
            "success": True,
            "message": f"Safelist populated successfully",
            "total_added": total_added,
            "total_skipped": total_skipped,
            "errors": errors if errors else None,
        }

    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to populate safelist: {str(e)}",
        )
