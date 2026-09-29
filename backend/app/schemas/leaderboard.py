from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Any
from datetime import datetime
from uuid import UUID

class LeaderboardEntry(BaseModel):
    rank: int
    userId: str
    name: str
    username: Optional[str] = None
    avatar: Optional[str] = None
    score: int
    workouts: int
    accuracy: float
    streak: int
    repetitions: int
    tier: str

class LeaderboardCurrentUser(BaseModel):
    rank: Optional[int] = None
    userId: str
    name: str
    avatar: Optional[str] = None
    score: int
    workouts: int
    accuracy: float
    streak: int
    repetitions: int
    tier: str
    percentile: Optional[float] = None

class LeaderboardResponse(BaseModel):
    period: str
    period_key: str
    entries: List[LeaderboardEntry]
    currentUser: Optional[LeaderboardCurrentUser] = None
    totalParticipants: int

class LeaderboardMeResponse(BaseModel):
    userId: str
    name: str
    avatar: Optional[str] = None
    allTimeScore: int
    allTimeRank: Optional[int] = None
    weeklyScore: int
    weeklyRank: Optional[int] = None
    monthlyScore: int
    monthlyRank: Optional[int] = None
    totalWorkouts: int
    totalRepetitions: int
    totalValidRepetitions: int
    averageAccuracy: float
    currentStreak: int
    longestStreak: int
    tier: str
    percentile: Optional[float] = None

import uuid

class WorkoutCompleteRequest(BaseModel):
    client_id: UUID = Field(default_factory=uuid.uuid4)
    exercise_name: str
    started_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    duration_s: int = Field(ge=0, description="Duration in seconds")
    reps: int = Field(ge=0, description="Total repetitions counted")
    valid_reps: int = Field(ge=0, description="Valid repetitions passing ROM")
    avg_form_score: float = Field(ge=0, le=100, description="Mean form/posture score")
    difficulty: int = Field(default=1, ge=1, le=3, description="1=Beginner, 2=Intermediate, 3=Advanced")
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    calories: Optional[float] = 0.0
    form_issues: List[dict[str, Any]] = []
    source: str = "camera_ai"

class WorkoutCompleteResponse(BaseModel):
    session_id: str
    points_earned: int
    total_score: int
    current_rank: Optional[int]
    current_streak: int
    breakdown: dict[str, int]
    message: str
