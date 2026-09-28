from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.user import User
from app.db.models.models import DailyCheckin, Plan
from app.services.gemini import generate_structured_response
from pydantic import BaseModel
from typing import List, Optional
import datetime

class PlanExercise(BaseModel):
    exercise_id: str
    sets: int
    reps: Optional[int] = None
    duration_s: Optional[int] = None
    rest_s: int
    notes: Optional[str] = None

class PlanSchema(BaseModel):
    intensity_level: str
    rationale: str
    warmup: List[PlanExercise] = []
    main: List[PlanExercise] = []
    cooldown: List[PlanExercise] = []
    nutrition_tip: str
    hydration_tip: str

def compute_readiness(checkin: DailyCheckin) -> str:
    """Deterministic pre-score capping intensity based on recovery."""
    score = 0
    if checkin.sleep_hours < 5 or checkin.soreness >= 4:
        return "light"
    elif checkin.sleep_hours < 7 or checkin.soreness == 3 or checkin.stress >= 4:
        return "moderate"
    else:
        return "hard"

async def generate_adaptive_plan(user: User, checkin: DailyCheckin, db: AsyncSession) -> Plan:
    intensity_cap = compute_readiness(checkin)
    
    prompt = f"""
    Create a {intensity_cap} intensity workout for a {user.experience} user whose goal is {user.goal}.
    They slept {checkin.sleep_hours} hours, soreness is {checkin.soreness}/5, stress is {checkin.stress}/5.
    Available time: {checkin.minutes_available} minutes.
    Generate a JSON response with warmup, main, and cooldown exercises.
    """
    
    # In a real app we'd fetch the allowed catalog IDs here.
    # We call Gemini to generate
    gemini_json = await generate_structured_response(prompt, PlanSchema)
    
    if gemini_json:
        source = "gemini"
        plan_json = gemini_json
    else:
        source = "fallback_rules"
        # Dummy fallback plan if Gemini fails
        plan_json = {
            "intensity_level": intensity_cap,
            "rationale": "Fallback routine applied due to AI timeout.",
            "warmup": [], "main": [], "cooldown": [],
            "nutrition_tip": "Stay hydrated.", "hydration_tip": "Drink water."
        }
    
    db_plan = Plan(
        user_id=user.id,
        checkin_id=checkin.id,
        date=datetime.date.today(),
        intensity_level=plan_json["intensity_level"],
        rationale=plan_json["rationale"],
        plan_json=plan_json,
        source=source
    )
    db.add(db_plan)
    await db.commit()
    await db.refresh(db_plan)
    return db_plan
