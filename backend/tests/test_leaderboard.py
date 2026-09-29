import asyncio
import datetime
import uuid
import pytest
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.future import select

from app.db.base import Base
from app.db.models.user import User
from app.db.models.models import WorkoutSession, LeaderboardScore
from app.core.security import get_password_hash
from app.services.leaderboard_service import LeaderboardService
from app.schemas.leaderboard import WorkoutCompleteRequest

TEST_DB_URL = "sqlite+aiosqlite:///./test_leaderboard.db"

def run_test(coro_fn):
    async def wrapper():
        engine = create_async_engine(TEST_DB_URL, echo=False)
        async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
            await conn.run_sync(Base.metadata.create_all)
        async with async_session() as session:
            try:
                await coro_fn(session)
            finally:
                await session.close()
        await engine.dispose()

    asyncio.run(wrapper())

async def create_test_user(db: AsyncSession, name: str, email: str, username: str, opt_in: bool = True) -> User:
    user = User(
        id=uuid.uuid4(),
        email=email,
        password_hash=get_password_hash("password123"),
        name=name,
        username=username,
        age=25,
        sex="Male",
        height_cm=175.0,
        weight_kg=70.0,
        leaderboard_opt_in=opt_in,
        created_at=datetime.datetime.now(datetime.timezone.utc),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

# ─── 1. Scoring Formula & Cap Tests ───

def test_score_calculation_formula():
    """Verify XP calculation matches formula components."""
    # 20 reps, difficulty 2 (mult 1.25), form accuracy 90, streak 3
    points, breakdown = LeaderboardService.calculate_session_points(
        duration_s=120,
        valid_reps=20,
        avg_form_score=90.0,
        difficulty=2,
        streak_days=3,
        confidence=1.0,
    )
    # Base: 100
    assert breakdown["workout_points"] == 100
    # Exercise: 20 * 3.0 * 1.25 = 75
    assert breakdown["exercise_points"] == 75
    # Accuracy: 90 * 1.0 = 90
    assert breakdown["accuracy_points"] == 90
    # Consistency: 3 * 20 = 60
    assert breakdown["consistency_points"] == 60
    # Difficulty bonus: (2 - 1) * 25 = 25
    assert breakdown["difficulty_points"] == 25
    expected_total = 100 + 75 + 90 + 60 + 25
    assert points == expected_total
    assert points == 350

def test_score_calculation_cap():
    """Verify XP calculation is capped at 500 XP maximum."""
    points, breakdown = LeaderboardService.calculate_session_points(
        duration_s=600,
        valid_reps=100,  # 100 * 3 * 1.5 = 450
        avg_form_score=98.0, # 98
        difficulty=3,    # 50
        streak_days=10,  # 200
        confidence=1.0,
    )
    # Raw sum = 100 + 450 + 98 + 200 + 50 = 898
    assert points == 500
    assert points == LeaderboardService.MAX_SESSION_XP_CAP

# ─── 2. Anti-Cheat Validation Tests ───

def test_anti_cheat_rejections():
    async def step(db: AsyncSession):
        user = await create_test_user(db, "Cheater", "cheat@test.com", "cheater")
        now = datetime.datetime.now(datetime.timezone.utc)

        # 1. Duration < 15 seconds rejected
        short_req = WorkoutCompleteRequest(
            client_id=uuid.uuid4(),
            exercise_name="Squat",
            started_at=now - datetime.timedelta(seconds=10),
            duration_s=10,
            reps=10,
            valid_reps=10,
            avg_form_score=90.0,
            confidence=0.9,
        )
        with pytest.raises(HTTPException) as exc_info:
            await LeaderboardService.record_workout_completion(db, user, short_req)
        assert exc_info.value.status_code == 400
        assert "shorter than minimum" in exc_info.value.detail

        # 2. Impossible rep speed (> 1.5 reps/sec) rejected
        fast_req = WorkoutCompleteRequest(
            client_id=uuid.uuid4(),
            exercise_name="Squat",
            started_at=now - datetime.timedelta(seconds=20),
            duration_s=20,
            reps=50,  # 50 / 20 = 2.5 reps/sec > 1.5
            valid_reps=50,
            avg_form_score=90.0,
            confidence=0.9,
        )
        with pytest.raises(HTTPException) as exc_info:
            await LeaderboardService.record_workout_completion(db, user, fast_req)
        assert exc_info.value.status_code == 400
        assert "exceeds biomechanical human limits" in exc_info.value.detail

        # 3. Low landmark confidence (< 0.40) rejected
        low_conf_req = WorkoutCompleteRequest(
            client_id=uuid.uuid4(),
            exercise_name="Squat",
            started_at=now - datetime.timedelta(seconds=60),
            duration_s=60,
            reps=15,
            valid_reps=15,
            avg_form_score=90.0,
            confidence=0.35,
        )
        with pytest.raises(HTTPException) as exc_info:
            await LeaderboardService.record_workout_completion(db, user, low_conf_req)
        assert exc_info.value.status_code == 400
        assert "confidence" in exc_info.value.detail.lower()

    run_test(step)

# ─── 3. Idempotency Test ───

def test_idempotency_duplicate_client_id():
    async def step(db: AsyncSession):
        user = await create_test_user(db, "Alice", "alice@test.com", "alice")
        cid = uuid.uuid4()
        now = datetime.datetime.now(datetime.timezone.utc)
        req = WorkoutCompleteRequest(
            client_id=cid,
            exercise_name="Squat",
            started_at=now - datetime.timedelta(seconds=60),
            duration_s=60,
            reps=15,
            valid_reps=14,
            avg_form_score=92.0,
            confidence=0.95,
        )
        # First submission
        res1 = await LeaderboardService.record_workout_completion(db, user, req)
        initial_score = res1.points_earned

        # Duplicate submission with same client_id
        res2 = await LeaderboardService.record_workout_completion(db, user, req)
        assert res2.session_id == res1.session_id
        assert res2.points_earned == initial_score
        assert "already recorded" in res2.message.lower()

        # Verify only 1 WorkoutSession exists in database
        stmt = select(WorkoutSession).where(WorkoutSession.client_id == cid)
        sessions = (await db.execute(stmt)).scalars().all()
        assert len(sessions) == 1

    run_test(step)

# ─── 4. Streak Calculation Test ───

def test_streak_consecutive_days():
    async def step(db: AsyncSession):
        user = await create_test_user(db, "Bob", "bob@test.com", "bob")
        now = datetime.datetime.now(datetime.timezone.utc)

        # Workout 2 days ago
        w1 = WorkoutSession(
            id=uuid.uuid4(),
            user_id=user.id,
            client_id=uuid.uuid4(),
            exercise_name="Squat",
            started_at=now - datetime.timedelta(days=2, minutes=20),
            completed_at=now - datetime.timedelta(days=2),
            duration_s=120,
            reps=20,
            valid_reps=18,
            avg_form_score=90.0,
            confidence=0.9,
            completed=True,
            points_earned=200,
        )
        # Workout yesterday
        w2 = WorkoutSession(
            id=uuid.uuid4(),
            user_id=user.id,
            client_id=uuid.uuid4(),
            exercise_name="Squat",
            started_at=now - datetime.timedelta(days=1, minutes=20),
            completed_at=now - datetime.timedelta(days=1),
            duration_s=120,
            reps=20,
            valid_reps=18,
            avg_form_score=90.0,
            confidence=0.9,
            completed=True,
            points_earned=200,
        )
        # Workout today
        w3 = WorkoutSession(
            id=uuid.uuid4(),
            user_id=user.id,
            client_id=uuid.uuid4(),
            exercise_name="Squat",
            started_at=now - datetime.timedelta(minutes=20),
            completed_at=now,
            duration_s=120,
            reps=20,
            valid_reps=18,
            avg_form_score=90.0,
            confidence=0.9,
            completed=True,
            points_earned=200,
        )
        db.add_all([w1, w2, w3])
        await db.commit()

        current_streak, longest_streak = await LeaderboardService.calculate_user_streak(db, user.id)
        assert current_streak == 3
        assert longest_streak == 3

    run_test(step)

# ─── 5. Deterministic Tie-Breaking Tests ───

def test_deterministic_tie_breaking():
    async def step(db: AsyncSession):
        # Setup 3 users with identical total_score (300)
        u1 = await create_test_user(db, "User HighAcc", "highacc@test.com", "u_highacc")
        u2 = await create_test_user(db, "User LowAccHighReps", "lowacc@test.com", "u_lowacc")
        u3 = await create_test_user(db, "User LowAccLowReps", "lowreps@test.com", "u_lowreps")

        now = datetime.datetime.now(datetime.timezone.utc)
        period_key = now.strftime("%Y-%m-%d")

        # u1: 300 score, 95.0% accuracy, 20 valid reps
        s1 = LeaderboardScore(
            id=uuid.uuid4(),
            user_id=u1.id,
            period="daily",
            period_key=period_key,
            total_score=300,
            average_accuracy=95.0,
            total_valid_repetitions=20,
            total_workouts=1,
            total_repetitions=20,
            updated_at=now,
        )
        # u2: 300 score, 90.0% accuracy, 40 valid reps
        s2 = LeaderboardScore(
            id=uuid.uuid4(),
            user_id=u2.id,
            period="daily",
            period_key=period_key,
            total_score=300,
            average_accuracy=90.0,
            total_valid_repetitions=40,
            total_workouts=1,
            total_repetitions=45,
            updated_at=now,
        )
        # u3: 300 score, 90.0% accuracy, 10 valid reps
        s3 = LeaderboardScore(
            id=uuid.uuid4(),
            user_id=u3.id,
            period="daily",
            period_key=period_key,
            total_score=300,
            average_accuracy=90.0,
            total_valid_repetitions=10,
            total_workouts=1,
            total_repetitions=12,
            updated_at=now,
        )
        db.add_all([s1, s2, s3])
        await db.commit()

        # Query leaderboard
        lb = await LeaderboardService.get_leaderboard(db, period="daily", limit=10)
        entries = lb.entries
        assert len(entries) == 3

        # Rank 1: u1 (highest accuracy 95.0%)
        assert entries[0].userId == str(u1.id)
        assert entries[0].rank == 1

        # Rank 2: u2 (tied accuracy with u3, but 40 valid reps > 10)
        assert entries[1].userId == str(u2.id)
        assert entries[1].rank == 2

        # Rank 3: u3
        assert entries[2].userId == str(u3.id)
        assert entries[2].rank == 3

    run_test(step)

# ─── 6. Leaderboard Opt-In / Opt-Out Tests ───

def test_leaderboard_opt_in_toggle():
    async def step(db: AsyncSession):
        user = await create_test_user(db, "Private User", "private@test.com", "private_u", opt_in=False)
        now = datetime.datetime.now(datetime.timezone.utc)
        req = WorkoutCompleteRequest(
            client_id=uuid.uuid4(),
            exercise_name="Squat",
            started_at=now - datetime.timedelta(seconds=60),
            duration_s=60,
            reps=20,
            valid_reps=18,
            avg_form_score=92.0,
            confidence=0.9,
        )
        await LeaderboardService.record_workout_completion(db, user, req)

        # Opted-out user should NOT appear in public leaderboard entries
        lb = await LeaderboardService.get_leaderboard(db, period="all_time")
        assert not any(e.userId == str(user.id) for e in lb.entries)

        # Opt-in user
        user.leaderboard_opt_in = True
        await db.commit()

        # Now user appears in public leaderboard
        lb_after = await LeaderboardService.get_leaderboard(db, period="all_time")
        assert any(e.userId == str(user.id) for e in lb_after.entries)

    run_test(step)

# ─── 7. User Profile Stats & Ranks ───

def test_user_profile_stats():
    async def step(db: AsyncSession):
        user = await create_test_user(db, "Elena Rostova", "elena@test.com", "elena_r", opt_in=True)
        now = datetime.datetime.now(datetime.timezone.utc)
        req = WorkoutCompleteRequest(
            client_id=uuid.uuid4(),
            exercise_name="Plank",
            started_at=now - datetime.timedelta(seconds=90),
            duration_s=90,
            reps=1,
            valid_reps=1,
            avg_form_score=98.0,
            difficulty=2,
            confidence=0.95,
        )
        res = await LeaderboardService.record_workout_completion(db, user, req)
        assert res.points_earned > 0

        # Query profile stats
        stats = await LeaderboardService.get_user_profile_stats(db, user)
        assert stats.userId == str(user.id)
        assert stats.allTimeScore == res.points_earned
        assert stats.allTimeRank == 1
        assert stats.totalWorkouts == 1
        assert stats.averageAccuracy == 98.0
        assert stats.tier in ["Bronze", "Silver", "Gold", "Platinum", "Diamond"]

    run_test(step)

# ─── 8. Current User Rank Resolution Outside Top Limit ───

def test_current_user_outside_top_limit():
    async def step(db: AsyncSession):
        u1 = await create_test_user(db, "User 1", "u1@test.com", "u1")
        u2 = await create_test_user(db, "User 2", "u2@test.com", "u2")
        u3 = await create_test_user(db, "User 3", "u3@test.com", "u3")

        now = datetime.datetime.now(datetime.timezone.utc)
        for u, score in [(u1, 500), (u2, 400), (u3, 200)]:
            s = LeaderboardScore(
                id=uuid.uuid4(),
                user_id=u.id,
                period="all_time",
                period_key="all_time",
                total_score=score,
                average_accuracy=90.0,
                total_valid_repetitions=20,
                total_workouts=1,
                total_repetitions=20,
                updated_at=now,
            )
            db.add(s)
        await db.commit()

        # Query top 2, but asking for u3 as current_user
        lb = await LeaderboardService.get_leaderboard(db, period="all_time", limit=2, current_user=u3)
        assert len(lb.entries) == 2
        assert lb.totalParticipants == 3
        # currentUser must be populated even though u3 is not in top 2!
        assert lb.currentUser is not None
        assert lb.currentUser.userId == str(u3.id)
        assert lb.currentUser.rank == 3
        assert lb.currentUser.score == 200

    run_test(step)

# ─── 9. Period Aggregations Test ───

def test_period_aggregations():
    async def step(db: AsyncSession):
        user = await create_test_user(db, "Period Tester", "period@test.com", "period_tester")
        now = datetime.datetime.now(datetime.timezone.utc)
        req = WorkoutCompleteRequest(
            client_id=uuid.uuid4(),
            exercise_name="Squat",
            started_at=now - datetime.timedelta(seconds=60),
            duration_s=60,
            reps=20,
            valid_reps=18,
            avg_form_score=92.0,
            confidence=0.9,
        )
        res = await LeaderboardService.record_workout_completion(db, user, req)

        # Query all periods
        daily_lb = await LeaderboardService.get_leaderboard(db, period="daily")
        weekly_lb = await LeaderboardService.get_leaderboard(db, period="weekly")
        monthly_lb = await LeaderboardService.get_leaderboard(db, period="monthly")
        all_time_lb = await LeaderboardService.get_leaderboard(db, period="all_time")

        assert any(e.userId == str(user.id) for e in daily_lb.entries)
        assert any(e.userId == str(user.id) for e in weekly_lb.entries)
        assert any(e.userId == str(user.id) for e in monthly_lb.entries)
        assert any(e.userId == str(user.id) for e in all_time_lb.entries)

    run_test(step)

# ─── 10. API Endpoints Integration Test ───

def test_api_endpoints_integration():
    from fastapi.testclient import TestClient
    from app.main import app

    client = TestClient(app)

    # 1. GET /api/v1/leaderboard with different periods
    for p in ["daily", "weekly", "monthly", "all_time"]:
        res = client.get(f"/api/v1/leaderboard?period={p}&limit=5")
        assert res.status_code == 200
        data = res.json()
        assert data["period"] == p
        assert "entries" in data
        assert isinstance(data["entries"], list)

    # 2. GET /api/v1/leaderboard/me without auth returns 401
    unauth_res = client.get("/api/v1/leaderboard/me")
    assert unauth_res.status_code in [401, 403]

