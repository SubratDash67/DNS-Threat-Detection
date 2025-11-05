from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base


class SafelistDomain(Base):
    __tablename__ = "safelist_domains"

    id = Column(Integer, primary_key=True, index=True)
    domain = Column(String(255), unique=True, nullable=False, index=True)
    tier = Column(String(50), nullable=False, index=True)
    added_by = Column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    notes = Column(String(500), nullable=True)
    source = Column(String(100), default="user")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
