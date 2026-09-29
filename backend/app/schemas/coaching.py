from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Any
import datetime
from uuid import UUID

class DailyCheckinBase(BaseModel):
    date: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    sleep_hours: float = 7.0
    energy: int = 3
    mood: int = 3
    soreness: int = 1
    stress: int = 1
    minutes_available: int = 30
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
    date: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    intensity_level: str
    rationale: str
    plan_json: dict[str, Any]
    source: str

class PlanInDB(PlanBase):
    id: UUID
    user_id: UUID
    checkin_id: UUID
    model_config = ConfigDict(from_attributes=True)
