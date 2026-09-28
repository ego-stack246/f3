from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Any
from datetime import datetime
from uuid import UUID

class ExerciseBase(BaseModel):
    name: str
    muscle_group: str
    level: str
    equipment: List[str] = []
    instructions: List[str] = []
    video_key: Optional[str] = None
    supports_pose_coach: bool = False
    target_angles: Optional[dict[str, Any]] = None

class ExerciseInDB(ExerciseBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)

class WorkoutSessionBase(BaseModel):
    client_id: UUID
    exercise_id: UUID
    started_at: datetime
    duration_s: int
    reps: int
    sets: int
    avg_form_score: int
    form_issues: List[dict[str, Any]] = []
    source: str

class WorkoutSessionCreate(WorkoutSessionBase):
    pass

class WorkoutSessionInDB(WorkoutSessionBase):
    id: UUID
    user_id: UUID
    model_config = ConfigDict(from_attributes=True)
