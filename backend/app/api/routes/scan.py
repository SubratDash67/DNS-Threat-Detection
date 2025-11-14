from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.sql import func
from typing import List
from datetime import datetime
import logging
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.scan import Scan
from app.models.batch_job import BatchJob
from app.schemas.scan import (
    ScanRequest,
    ScanResponse,
    BatchScanRequest,
    BatchJobResponse,
    BatchJobStatus,
)
from app.services.detector_service import get_detector_service

router = APIRouter(prefix="/api/scan", tags=["Scanning"])
logger = logging.getLogger(__name__)


@router.post("/single", response_model=ScanResponse)
async def scan_single_domain(
    request: ScanRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    detector = get_detector_service()

    try:
        result = detector.predict_single(
            request.domain, use_safelist=request.use_safelist
        )

        scan = Scan(
            user_id=current_user.id,
            domain=result["domain"],
            result=result["prediction"],
            confidence=result["confidence"],
            method=result["method"],
            reason=result["reason"],
            stage=result.get("stage"),
            latency_ms=result["latency_ms"],
            features=result.get("features"),
            typosquatting_target=result.get("typosquatting_target"),
            edit_distance=result.get("edit_distance"),
            safelist_tier=result.get("safelist_tier"),
        )

        db.add(scan)
        await db.commit()
        await db.refresh(scan)

        response_data = {
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

        return response_data

    except Exception as e:
        logger.error(f"Scan failed for domain {request.domain}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Scan failed: {str(e)}",
        )


async def process_batch_job(
    job_id: int, domains: List[str], use_safelist: bool, db_url: str
):
    from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
    from sqlalchemy import update

    # Ensure URL uses asyncpg driver for PostgreSQL
    if db_url.startswith("postgresql://"):
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://")
    elif db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql+asyncpg://")

    engine = create_async_engine(db_url)
    SessionLocal = async_sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )

    async with SessionLocal() as db:
        try:
            await db.execute(
                update(BatchJob)
                .where(BatchJob.id == job_id)
                .values(status="processing")
            )
            await db.commit()

            detector = get_detector_service()

            # Use optimized batch prediction
            logger.info(
                f"Starting batch prediction for {len(domains)} domains (job {job_id})"
            )
            results = detector.predict_batch(domains, use_safelist=use_safelist)
            logger.info(f"Batch prediction completed for job {job_id}")

            # Get job info for user_id
            result_obj = await db.execute(select(BatchJob).where(BatchJob.id == job_id))
            job = result_obj.scalar_one()

            malicious_count = 0
            suspicious_count = 0
            benign_count = 0

            # Process all results and save to database
            for idx, result in enumerate(results):
                try:
                    scan = Scan(
                        user_id=job.user_id,
                        domain=result["domain"],
                        result=result["prediction"],
                        confidence=result["confidence"],
                        method=result["method"],
                        reason=result["reason"],
                        stage=result.get("stage"),
                        latency_ms=result["latency_ms"],
                        features=result.get("features"),
                        typosquatting_target=result.get("typosquatting_target"),
                        edit_distance=result.get("edit_distance"),
                        safelist_tier=result.get("safelist_tier"),
                        batch_job_id=job_id,
                    )

                    if result["prediction"] == "MALICIOUS":
                        malicious_count += 1
                    elif result["prediction"] == "SUSPICIOUS":
                        suspicious_count += 1
                    else:
                        benign_count += 1

                    db.add(scan)

                    # Update progress every 10 domains
                    if (idx + 1) % 10 == 0:
                        await db.execute(
                            update(BatchJob)
                            .where(BatchJob.id == job_id)
                            .values(
                                processed_domains=idx + 1,
                                malicious_count=malicious_count,
                                suspicious_count=suspicious_count,
                                benign_count=benign_count,
                            )
                        )
                        await db.commit()

                except Exception as e:
                    logger.warning(
                        f"Error saving scan result for domain {result.get('domain', 'unknown')} in batch {job_id}: {str(e)}"
                    )
                    continue

            # Final update with all results
            await db.execute(
                update(BatchJob)
                .where(BatchJob.id == job_id)
                .values(
                    processed_domains=len(domains),
                    malicious_count=malicious_count,
                    suspicious_count=suspicious_count,
                    benign_count=benign_count,
                    status="completed",
                    completed_at=func.now(),
                )
            )
            await db.commit()
            logger.info(
                f"Batch job {job_id} completed: {malicious_count} malicious, {suspicious_count} suspicious, {benign_count} benign"
            )

        except Exception as e:
            logger.error(f"Batch job {job_id} failed: {str(e)}")
            await db.execute(
                update(BatchJob)
                .where(BatchJob.id == job_id)
                .values(status="failed", error_message=str(e), completed_at=func.now())
            )
            await db.commit()


@router.post(
    "/batch", response_model=BatchJobResponse, status_code=status.HTTP_202_ACCEPTED
)
async def scan_batch_domains(
    request: BatchScanRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.core.config import get_settings

    settings = get_settings()

    if len(request.domains) > settings.MAX_BATCH_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Batch size exceeds maximum limit of {settings.MAX_BATCH_SIZE}",
        )

    if len(request.domains) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="No domains provided"
        )

    unique_domains = list(set(request.domains))

    batch_job = BatchJob(
        user_id=current_user.id, total_domains=len(unique_domains), status="pending"
    )

    db.add(batch_job)
    await db.commit()
    await db.refresh(batch_job)

    background_tasks.add_task(
        process_batch_job,
        batch_job.id,
        unique_domains,
        request.use_safelist,
        settings.DATABASE_URL,
    )

    return batch_job


@router.get("/batch/{job_id}", response_model=BatchJobStatus)
async def get_batch_job_status(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(BatchJob).where(
            BatchJob.id == job_id, BatchJob.user_id == current_user.id
        )
    )
    job = result.scalar_one_or_none()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Batch job not found"
        )

    progress_percentage = (
        (job.processed_domains / job.total_domains * 100)
        if job.total_domains > 0
        else 0
    )

    return {
        "id": job.id,
        "status": job.status,
        "total_domains": job.total_domains,
        "processed_domains": job.processed_domains,
        "malicious_count": job.malicious_count,
        "suspicious_count": job.suspicious_count,
        "benign_count": job.benign_count,
        "progress_percentage": progress_percentage,
        "estimated_time_remaining": None,
    }


@router.get("/batch/{job_id}/results", response_model=List[ScanResponse])
async def get_batch_job_results(
    job_id: int,
    page: int = 1,
    page_size: int = 50,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(BatchJob).where(
            BatchJob.id == job_id, BatchJob.user_id == current_user.id
        )
    )
    job = result.scalar_one_or_none()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Batch job not found"
        )

    offset = (page - 1) * page_size

    scans_result = await db.execute(
        select(Scan).where(Scan.batch_job_id == job_id).offset(offset).limit(page_size)
    )
    scans = scans_result.scalars().all()

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
