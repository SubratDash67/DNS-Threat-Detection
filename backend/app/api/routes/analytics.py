from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, case
from typing import List, Dict
from datetime import datetime, timedelta
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.scan import Scan
from app.schemas.analytics import (
    AnalyticsDashboard,
    TrendData,
    TLDAnalysis,
    HeatmapData,
)

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/dashboard", response_model=AnalyticsDashboard)
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = now - timedelta(days=7)
    month_start = now - timedelta(days=30)

    total_result = await db.execute(
        select(func.count(Scan.id)).where(Scan.user_id == current_user.id)
    )
    total_scans = total_result.scalar() or 0

    unique_result = await db.execute(
        select(func.count(func.distinct(Scan.domain))).where(
            Scan.user_id == current_user.id
        )
    )
    unique_domains = unique_result.scalar() or 0

    malicious_result = await db.execute(
        select(func.count(Scan.id)).where(
            and_(Scan.user_id == current_user.id, Scan.result == "MALICIOUS")
        )
    )
    malicious_count = malicious_result.scalar() or 0

    threat_rate = (malicious_count / total_scans * 100) if total_scans > 0 else 0.0

    avg_latency_result = await db.execute(
        select(func.avg(Scan.latency_ms)).where(Scan.user_id == current_user.id)
    )
    avg_processing_time = avg_latency_result.scalar() or 0.0

    today_result = await db.execute(
        select(func.count(Scan.id)).where(
            and_(Scan.user_id == current_user.id, Scan.created_at >= today_start)
        )
    )
    today_scans = today_result.scalar() or 0

    week_result = await db.execute(
        select(func.count(Scan.id)).where(
            and_(Scan.user_id == current_user.id, Scan.created_at >= week_start)
        )
    )
    week_scans = week_result.scalar() or 0

    month_result = await db.execute(
        select(func.count(Scan.id)).where(
            and_(Scan.user_id == current_user.id, Scan.created_at >= month_start)
        )
    )
    month_scans = month_result.scalar() or 0

    return {
        "total_scans": total_scans,
        "unique_domains": unique_domains,
        "threat_rate": threat_rate,
        "avg_processing_time": avg_processing_time,
        "today_scans": today_scans,
        "week_scans": week_scans,
        "month_scans": month_scans,
    }


@router.get("/trends", response_model=List[TrendData])
async def get_scan_trends(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    start_date = datetime.utcnow() - timedelta(days=days)

    result = await db.execute(
        select(
            func.date(Scan.created_at).label("date"),
            func.count(Scan.id).label("total"),
            func.sum(case((Scan.result == "MALICIOUS", 1), else_=0)).label("malicious"),
            func.sum(case((Scan.result == "SUSPICIOUS", 1), else_=0)).label(
                "suspicious"
            ),
            func.sum(case((Scan.result == "BENIGN", 1), else_=0)).label("benign"),
        )
        .where(and_(Scan.user_id == current_user.id, Scan.created_at >= start_date))
        .group_by(func.date(Scan.created_at))
        .order_by(func.date(Scan.created_at))
    )

    rows = result.all()

    return [
        {
            "date": str(row.date),
            "total_scans": row.total,
            "malicious_count": row.malicious or 0,
            "suspicious_count": row.suspicious or 0,
            "benign_count": row.benign or 0,
        }
        for row in rows
    ]


@router.get("/tld-analysis", response_model=List[TLDAnalysis])
async def get_tld_analysis(
    current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Scan).where(Scan.user_id == current_user.id))
    scans = result.scalars().all()

    tld_stats = {}

    for scan in scans:
        domain_parts = scan.domain.split(".")
        if len(domain_parts) > 1:
            tld = "." + domain_parts[-1]
        else:
            tld = "unknown"

        if tld not in tld_stats:
            tld_stats[tld] = {"total": 0, "malicious": 0, "suspicious": 0, "benign": 0}

        tld_stats[tld]["total"] += 1
        if scan.result == "MALICIOUS":
            tld_stats[tld]["malicious"] += 1
        elif scan.result == "SUSPICIOUS":
            tld_stats[tld]["suspicious"] += 1
        else:
            tld_stats[tld]["benign"] += 1

    tld_analysis = []
    for tld, stats in tld_stats.items():
        # Risk score considers both malicious and suspicious (weighted)
        risk_score = (
            (
                (stats["malicious"] * 1.0 + stats["suspicious"] * 0.5)
                / stats["total"]
                * 100
            )
            if stats["total"] > 0
            else 0
        )
        tld_analysis.append(
            {
                "tld": tld,
                "total_count": stats["total"],
                "malicious_count": stats["malicious"],
                "suspicious_count": stats["suspicious"],
                "benign_count": stats["benign"],
                "risk_score": risk_score,
            }
        )

    tld_analysis.sort(key=lambda x: x["risk_score"], reverse=True)

    return tld_analysis[:20]


@router.get("/heatmap", response_model=List[HeatmapData])
async def get_activity_heatmap(
    current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Scan).where(Scan.user_id == current_user.id))
    scans = result.scalars().all()

    heatmap_data = {}

    for scan in scans:
        hour = scan.created_at.hour
        day = scan.created_at.strftime("%A")
        key = (hour, day)

        if key not in heatmap_data:
            heatmap_data[key] = 0

        heatmap_data[key] += 1

    heatmap_list = [
        {"hour": hour, "day": day, "count": count}
        for (hour, day), count in heatmap_data.items()
    ]

    return heatmap_list


@router.get("/detection-methods")
async def get_detection_methods(
    current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
) -> List[Dict]:
    """Get breakdown of detection methods used"""
    result = await db.execute(
        select(Scan.method, func.count(Scan.id).label("count"))
        .where(Scan.user_id == current_user.id)
        .group_by(Scan.method)
        .order_by(func.count(Scan.id).desc())
    )

    rows = result.all()

    return [{"method": row.method, "count": row.count} for row in rows]
