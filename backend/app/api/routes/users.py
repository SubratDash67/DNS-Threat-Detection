from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from datetime import datetime, timedelta
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.scan import Scan
from app.schemas.user import UserResponse
from pydantic import BaseModel
import os
import uuid

router = APIRouter(prefix="/api/users", tags=["Users"])


class UserStatistics(BaseModel):
    total_scans: int
    total_malicious: int
    total_benign: int
    avg_confidence: float
    safelist_contributions: int
    join_date: str
    last_scan: str | None


class ActivityLogEntry(BaseModel):
    id: int
    action: str
    details: str
    timestamp: str


class AvatarResponse(BaseModel):
    avatar_url: str


@router.get("/statistics", response_model=UserStatistics)
async def get_user_statistics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get user statistics including scan counts and activity metrics"""

    # Total scans
    total_scans_result = await db.execute(
        select(func.count(Scan.id)).where(Scan.user_id == current_user.id)
    )
    total_scans = total_scans_result.scalar() or 0

    # Malicious count
    malicious_result = await db.execute(
        select(func.count(Scan.id)).where(
            and_(Scan.user_id == current_user.id, Scan.result == "MALICIOUS")
        )
    )
    total_malicious = malicious_result.scalar() or 0

    # Benign count
    benign_result = await db.execute(
        select(func.count(Scan.id)).where(
            and_(Scan.user_id == current_user.id, Scan.result == "BENIGN")
        )
    )
    total_benign = benign_result.scalar() or 0

    # Average confidence
    avg_confidence_result = await db.execute(
        select(func.avg(Scan.confidence)).where(Scan.user_id == current_user.id)
    )
    avg_confidence = avg_confidence_result.scalar() or 0.0

    # Safelist contributions (count of scans that used safelist)
    safelist_contrib_result = await db.execute(
        select(func.count(Scan.id)).where(
            and_(Scan.user_id == current_user.id, Scan.safelist_tier.isnot(None))
        )
    )
    safelist_contributions = safelist_contrib_result.scalar() or 0

    # Last scan timestamp
    last_scan_result = await db.execute(
        select(Scan.created_at)
        .where(Scan.user_id == current_user.id)
        .order_by(Scan.created_at.desc())
        .limit(1)
    )
    last_scan_row = last_scan_result.scalar_one_or_none()
    last_scan = last_scan_row.isoformat() if last_scan_row else None

    return {
        "total_scans": total_scans,
        "total_malicious": total_malicious,
        "total_benign": total_benign,
        "avg_confidence": float(avg_confidence),
        "safelist_contributions": safelist_contributions,
        "join_date": current_user.created_at.isoformat(),
        "last_scan": last_scan,
    }


@router.post("/avatar", response_model=AvatarResponse)
async def upload_user_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Upload user avatar image"""

    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.",
        )

    # Validate file size (max 5MB)
    max_size = 5 * 1024 * 1024  # 5MB
    contents = await file.read()
    if len(contents) > max_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds 5MB limit.",
        )

    # Generate unique filename
    file_ext = file.filename.split(".")[-1] if file.filename else "jpg"
    unique_filename = f"{uuid.uuid4()}.{file_ext}"

    # Create uploads directory if it doesn't exist
    upload_dir = "static/avatars"
    os.makedirs(upload_dir, exist_ok=True)

    # Save file
    file_path = os.path.join(upload_dir, unique_filename)
    with open(file_path, "wb") as f:
        f.write(contents)

    # Update user avatar URL in database
    avatar_url = f"/static/avatars/{unique_filename}"

    from sqlalchemy import update

    await db.execute(
        update(User).where(User.id == current_user.id).values(avatar_url=avatar_url)
    )
    await db.commit()

    return {"avatar_url": avatar_url}


@router.get("/activity", response_model=List[ActivityLogEntry])
async def get_user_activity_log(
    page: int = 1,
    page_size: int = 20,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get user activity log with recent scans"""

    offset = (page - 1) * page_size

    # Get recent scans as activity
    scans_result = await db.execute(
        select(Scan)
        .where(Scan.user_id == current_user.id)
        .order_by(Scan.created_at.desc())
        .offset(offset)
        .limit(page_size)
    )
    scans = scans_result.scalars().all()

    activity_log = []
    for scan in scans:
        action = "Domain Scan"
        if scan.batch_job_id:
            action = "Batch Scan"

        details = f"Scanned {scan.domain} - Result: {scan.result} ({scan.confidence*100:.1f}% confidence)"

        activity_log.append(
            {
                "id": scan.id,
                "action": action,
                "details": details,
                "timestamp": scan.created_at.isoformat(),
            }
        )

    return activity_log


@router.get("/{user_id}", response_model=UserResponse)
async def get_user_profile(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get user profile by ID (admin only or own profile)"""

    # Allow users to view their own profile or admins to view any profile
    if current_user.id != user_id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this profile",
        )

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return user
