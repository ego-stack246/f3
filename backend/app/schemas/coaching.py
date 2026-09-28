from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Any
from datetime import date, datetime
from uuid import UUID

class DailyCheckinBase(BaseModel):
    date: date
    sleep_hours: float
    energy: int
    mood: int
    soreness: int
    stress: int
    minutes_available: int
    notes: Optional[str] = None

class DailyCheckinCreate(DailyCheckinBase):
    pass

class DailyCheckinInDB(DailyCheckinBase):
    id: UUID
    user_id: UUID
    model_config = ConfigDict(from_attributes=True)

class PlanGenerateRequest(BaseModel):
    checkin_id: Optional[UUID] = None

class PlanBase(BaseModel):
    date: date
    intensity_level: str
    rationale: str
    plan_json: dict[str, Any]
    source: str

class PlanInDB(PlanBase):
    id: UUID
    user_id: UUID
    checkin_id: UUID
    model_config = ConfigDict(from_attributes=True)
