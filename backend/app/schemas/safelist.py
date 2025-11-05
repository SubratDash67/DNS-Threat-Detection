from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime


class SafelistDomainBase(BaseModel):
    domain: str = Field(..., min_length=1, max_length=255)
    tier: str = Field(..., pattern="^(tier1|tier2|tier3)$")
    notes: Optional[str] = None


class SafelistDomainCreate(SafelistDomainBase):
    pass


class SafelistDomainUpdate(BaseModel):
    tier: Optional[str] = Field(None, pattern="^(tier1|tier2|tier3)$")
    notes: Optional[str] = None


class SafelistDomainResponse(SafelistDomainBase):
    id: int
    added_by: Optional[int] = None
    source: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SafelistBulkImport(BaseModel):
    domains: list[str]
    tier: str = Field(..., pattern="^(tier1|tier2|tier3)$")
    source: str = "bulk_import"


class SafelistStats(BaseModel):
    total_domains: int
    tier1_count: int
    tier2_count: int
    tier3_count: int
    recently_added: int
    safelist_hit_rate: Optional[float] = None
