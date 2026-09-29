import os
from sqlalchemy import text
import asyncio
from app.db.session import engine
from app.db.base import Base
# Import all models here so Alembic/SQLAlchemy knows about them
from app.db.models.user import User
from app.db.models.models import DailyCheckin, Plan, Exercise, WorkoutSession, LeaderboardScore, Meal

async def init_models():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

if __name__ == "__main__":
    asyncio.run(init_models())
