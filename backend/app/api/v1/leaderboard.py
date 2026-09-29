from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.db.session import get_db
from app.db.models.user import User
from app.api.deps import get_current_user, get_current_user_optional
from app.schemas.leaderboard import LeaderboardResponse, LeaderboardMeResponse
from app.services.leaderboard_service import LeaderboardService

router = APIRouter()

@router.get("", response_model=LeaderboardResponse)
@router.get("/", response_model=LeaderboardResponse)
async def get_leaderboard(
    period: str = Query("weekly", description="Period: daily, weekly, monthly, all-time"),
    limit: int = Query(50, ge=1, le=100, description="Max entries to return"),
    page: int = Query(1, ge=1, description="Page number"),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns verified, dynamic leaderboard rankings based on real workout performance.
    """
    return await LeaderboardService.get_leaderboard(
        db=db,
        period=period,
        limit=limit,
        page=page,
        current_user=current_user,
    )

@router.get("/me", response_model=LeaderboardMeResponse)
async def get_my_leaderboard_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns the authenticated user's current rank, performance score, streaks, and statistics.
    """
    return await LeaderboardService.get_user_profile_stats(db=db, user=current_user)

@router.post("/recalculate")
async def recalculate_leaderboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Admin/Maintenance endpoint: Recalculates leaderboard tables from real historical workout sessions.
    """
    count = await LeaderboardService.recalculate_all_scores_from_history(db)
    return {
        "status": "success",
        "message": f"Successfully recalculated leaderboard from {count} verified workout sessions.",
    }

@router.post("/opt-in")
async def toggle_leaderboard_opt_in(
    opt_in: bool = Query(..., description="True to appear on public leaderboard, False to hide"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Privacy control: Allows user to opt in or out of public leaderboard rankings.
    """
    current_user.leaderboard_opt_in = opt_in
    await db.commit()
    return {
        "status": "success",
        "leaderboard_opt_in": current_user.leaderboard_opt_in,
    }
