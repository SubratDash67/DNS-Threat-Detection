from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, func, and_, or_
from typing import List
import json
import csv
import io
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.scan import Scan
from app.schemas.scan import ScanResponse
from app.schemas.analytics import HistoryFilter

router = APIRouter(prefix="/api/history", tags=["History"])


@router.get("", response_model=List[ScanResponse])
async def get_scan_history(
    domain: str = None,
    result: str = None,
    method: str = None,
    min_confidence: float = None,
    max_confidence: float = None,
    date_from: str = None,
    date_to: str = None,
    batch_only: bool = False,
    page: int = 1,
    page_size: int = 50,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Scan).where(Scan.user_id == current_user.id)

    if domain:
        query = query.where(Scan.domain.ilike(f"%{domain}%"))

    if result:
        query = query.where(Scan.result == result)

    if method:
        query = query.where(Scan.method == method)

    if min_confidence is not None:
        query = query.where(Scan.confidence >= min_confidence)

    if max_confidence is not None:
        query = query.where(Scan.confidence <= max_confidence)

    if date_from:
        query = query.where(Scan.created_at >= date_from)

    if date_to:
        query = query.where(Scan.created_at <= date_to)

    if batch_only:
        query = query.where(Scan.batch_job_id.isnot(None))

    query = query.order_by(Scan.created_at.desc())

    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)

    result_obj = await db.execute(query)
    scans = result_obj.scalars().all()

    return [
        {
            "id": scan.id,
            "domain": scan.domain,
            "prediction": scan.result,
            "confidence": scan.confidence,
            "method": scan.method,
            "reason": scan.reason,
            "stage": scan.stage,
            "latency_ms": scan.latency_ms,
            "typosquatting_target": scan.typosquatting_target,
            "edit_distance": scan.edit_distance,
            "safelist_tier": scan.safelist_tier,
            "features": scan.features,
            "created_at": scan.created_at,
        }
        for scan in scans
    ]


@router.get("/{scan_id}", response_model=ScanResponse)
async def get_scan_detail(
    scan_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Scan).where(Scan.id == scan_id, Scan.user_id == current_user.id)
    )
    scan = result.scalar_one_or_none()

    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found"
        )

    return {
        "id": scan.id,
        "domain": scan.domain,
        "prediction": scan.result,
        "confidence": scan.confidence,
        "method": scan.method,
        "reason": scan.reason,
        "stage": scan.stage,
        "latency_ms": scan.latency_ms,
        "typosquatting_target": scan.typosquatting_target,
        "edit_distance": scan.edit_distance,
        "safelist_tier": scan.safelist_tier,
        "features": scan.features,
        "created_at": scan.created_at,
    }


@router.delete("/{scan_id}")
async def delete_scan(
    scan_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Scan).where(Scan.id == scan_id, Scan.user_id == current_user.id)
    )
    scan = result.scalar_one_or_none()

    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found"
        )

    await db.execute(delete(Scan).where(Scan.id == scan_id))
    await db.commit()

    return {"message": "Scan deleted successfully"}


@router.post("/export")
async def export_history(
    filters: HistoryFilter,
    format: str = "csv",
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Scan).where(Scan.user_id == current_user.id)

    if filters.domain:
        query = query.where(Scan.domain.ilike(f"%{filters.domain}%"))

    if filters.result:
        query = query.where(Scan.result == filters.result)

    if filters.method:
        query = query.where(Scan.method == filters.method)

    if filters.min_confidence is not None:
        query = query.where(Scan.confidence >= filters.min_confidence)

    if filters.max_confidence is not None:
        query = query.where(Scan.confidence <= filters.max_confidence)

    if filters.date_from:
        query = query.where(Scan.created_at >= filters.date_from)

    if filters.date_to:
        query = query.where(Scan.created_at <= filters.date_to)

    if filters.batch_only:
        query = query.where(Scan.batch_job_id.isnot(None))

    query = query.order_by(Scan.created_at.desc())

    result = await db.execute(query)
    scans = result.scalars().all()

    if format == "json":
        data = [
            {
                "id": scan.id,
                "domain": scan.domain,
                "result": scan.result,
                "confidence": scan.confidence,
                "method": scan.method,
                "reason": scan.reason,
                "stage": scan.stage,
                "latency_ms": scan.latency_ms,
                "created_at": scan.created_at.isoformat(),
            }
            for scan in scans
        ]

        return Response(
            content=json.dumps(data, indent=2),
            media_type="application/json",
            headers={"Content-Disposition": "attachment; filename=scan_history.json"},
        )

    elif format == "csv":
        output = io.StringIO()
        writer = csv.writer(output)

        writer.writerow(
            [
                "ID",
                "Domain",
                "Result",
                "Confidence",
                "Method",
                "Reason",
                "Stage",
                "Latency (ms)",
                "Created At",
            ]
        )

        for scan in scans:
            writer.writerow(
                [
                    scan.id,
                    scan.domain,
                    scan.result,
                    scan.confidence,
                    scan.method,
                    scan.reason,
                    scan.stage,
                    scan.latency_ms,
                    scan.created_at.isoformat(),
                ]
            )

        return Response(
            content=output.getvalue(),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=scan_history.csv"},
        )

    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported format. Use 'json' or 'csv'",
        )
