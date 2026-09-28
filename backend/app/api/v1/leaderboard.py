from fastapi import APIRouter, Depends
from app.api.deps import get_current_user
from app.db.models.user import User

router = APIRouter()

@router.get("/")
async def get_leaderboard(
    period: str = "weekly",
    metric: str = "score",
    current_user: User = Depends(get_current_user)
):
    # In a real implementation, we would query Redis sorted sets here.
    # For scaffolding, return mock data matching the frontend's expectations
    return {
        "period": period,
        "metric": metric,
        "rankings": [
            {"rank": 1, "name": "Sarah J.", "score": 2450, "streak": 14},
            {"rank": 2, "name": current_user.name, "score": 1200, "streak": current_user.streak if hasattr(current_user, 'streak') else 5, "is_current_user": True},
            {"rank": 3, "name": "Mike T.", "score": 1150, "streak": 8},
        ]
    }
