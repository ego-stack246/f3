from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from app.db.session import get_db
from app.db.models.models import Exercise, WorkoutSession
from app.db.models.user import User
from app.schemas.fitness import ExerciseInDB, WorkoutSessionCreate, WorkoutSessionInDB
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/exercises", response_model=List[ExerciseInDB])
async def get_exercises(
    muscle: str = None, 
    level: str = None, 
    q: str = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(Exercise)
    if muscle:
        query = query.where(Exercise.muscle_group == muscle)
    if level:
        query = query.where(Exercise.level == level)
    if q:
        query = query.where(Exercise.name.ilike(f"%{q}%"))
        
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/sessions", response_model=WorkoutSessionInDB)
async def create_session(
    session_in: WorkoutSessionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Idempotency check
    result = await db.execute(
        select(WorkoutSession).where(WorkoutSession.client_id == session_in.client_id)
    )
    existing = result.scalars().first()
    if existing:
        return existing
        
    db_session = WorkoutSession(
        **session_in.model_dump(),
        user_id=current_user.id
    )
    db.add(db_session)
    await db.commit()
    await db.refresh(db_session)
    return db_session
