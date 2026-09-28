from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime
from uuid import UUID

class UserBase(BaseModel):
    email: EmailStr
    name: str
    age: Optional[int] = None
    sex: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    goal: Optional[str] = None
    experience: Optional[str] = None
    diet_pref: Optional[str] = None
    region_cuisine: Optional[str] = None
    equipment: List[str] = []
    leaderboard_opt_in: bool = False

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    goal: Optional[str] = None
    experience: Optional[str] = None
    diet_pref: Optional[str] = None
    leaderboard_opt_in: Optional[bool] = None

class UserInDB(UserBase):
    id: UUID
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
