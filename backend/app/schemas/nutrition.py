from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime
from uuid import UUID

class NutritionItem(BaseModel):
    name: str
    portion: str
    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float

class NutritionScanResult(BaseModel):
    items: List[NutritionItem]
    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float
    confidence: str
    notes: Optional[str] = None

class EstimateRequest(BaseModel):
    text: str

class MealBase(BaseModel):
    eaten_at: datetime
    name: str
    items: List[dict]
    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float
    source: str
    confidence: Optional[str] = None

class MealCreate(MealBase):
    pass

class MealInDB(MealBase):
    id: UUID
    user_id: UUID
    model_config = ConfigDict(from_attributes=True)
