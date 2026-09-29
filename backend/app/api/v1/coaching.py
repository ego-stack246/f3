from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import date, datetime
from app.db.session import get_db
from app.db.models.models import DailyCheckin, Plan
from app.db.models.user import User
from app.schemas.coaching import DailyCheckinCreate, DailyCheckinInDB, PlanGenerateRequest, PlanInDB
from app.api.deps import get_current_user
from app.services.plan_engine import generate_adaptive_plan

router = APIRouter()

@router.post("/checkins", response_model=DailyCheckinInDB, status_code=status.HTTP_201_CREATED)
async def create_checkin(
    checkin_in: DailyCheckinCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    db_checkin = DailyCheckin(**checkin_in.model_dump(), user_id=current_user.id)
    db.add(db_checkin)
    await db.commit()
    await db.refresh(db_checkin)
    return db_checkin

@router.post("/plans/generate", response_model=PlanInDB)
async def generate_plan(
    request: PlanGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Fetch checkin (today's if not provided)
    if request.checkin_id:
        result = await db.execute(select(DailyCheckin).where(DailyCheckin.id == request.checkin_id))
        checkin = result.scalars().first()
    else:
        today_start = datetime.combine(date.today(), datetime.min.time())
        today_end = datetime.combine(date.today(), datetime.max.time())
        result = await db.execute(
            select(DailyCheckin)
            .where(
                DailyCheckin.user_id == current_user.id,
                DailyCheckin.date >= today_start,
                DailyCheckin.date <= today_end
            )
            .order_by(DailyCheckin.date.desc())
        )
        checkin = result.scalars().first()
        
    if not checkin:
        raise HTTPException(status_code=400, detail="Check-in required before generating a plan")
        
    # Delegate to the Plan Engine service
    plan = await generate_adaptive_plan(current_user, checkin, db)
    return plan

@router.get("/plans/today", response_model=PlanInDB)
async def get_todays_plan(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    today_start = datetime.combine(date.today(), datetime.min.time())
    today_end = datetime.combine(date.today(), datetime.max.time())
    result = await db.execute(
        select(Plan)
        .where(
            Plan.user_id == current_user.id,
            Plan.date >= today_start,
            Plan.date <= today_end
        )
        .order_by(Plan.date.desc())
    )
    plan = result.scalars().first()
    if not plan:
        raise HTTPException(status_code=404, detail="No plan found for today")
    return plan
