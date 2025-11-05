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

router = APIRouter(prefix="/api/safelist", tags=["Safelist"])


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
