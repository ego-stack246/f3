from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import auth, fitness, coaching, coach, nutrition, sync, leaderboard, community
from contextlib import asynccontextmanager
from app.db.base import Base
from app.db.session import engine

# Import models so Base.metadata knows about all tables
from app.db.models.user import User
from app.db.models.models import (
    DailyCheckin,
    Plan,
    Exercise,
    WorkoutSession,
    LeaderboardScore,
    Meal,
    Post,
    Story,
    Challenge,
    UserChallenge,
    PostLike,
    PostComment,
    UserFollow,
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()

app = FastAPI(title="FitSync AI Backend", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(fitness.router, prefix="/api/v1", tags=["fitness"])
app.include_router(coaching.router, prefix="/api/v1", tags=["coaching"])
app.include_router(coaching.router, prefix="/api/v1/coaching", tags=["coaching"])
app.include_router(coach.router, prefix="/api/v1/coach", tags=["chat"])
app.include_router(nutrition.router, prefix="/api/v1/nutrition", tags=["nutrition"])
app.include_router(sync.router, prefix="/api/v1/sync", tags=["sync"])
app.include_router(leaderboard.router, prefix="/api/v1/leaderboard", tags=["leaderboard"])
app.include_router(community.router, prefix="/api/v1/community", tags=["community"])

@app.get("/api/v1/health")
async def health_check():
    return {"status": "healthy", "service": "FitSync API"}
