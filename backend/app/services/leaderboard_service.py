import datetime
import math
from typing import Optional, List, Dict, Any, Tuple
from uuid import UUID
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, and_, desc, asc

from app.db.models.user import User
from app.db.models.models import WorkoutSession, LeaderboardScore
from app.schemas.leaderboard import (
    LeaderboardEntry,
    LeaderboardCurrentUser,
    LeaderboardResponse,
    LeaderboardMeResponse,
    WorkoutCompleteRequest,
    WorkoutCompleteResponse,
)

class LeaderboardService:
    # ─── Configurable Performance Scoring Parameters ───
    BASE_WORKOUT_XP: int = 100
    BASE_REP_XP: float = 3.0
    DIFFICULTY_MULTIPLIERS: Dict[int, float] = {1: 1.0, 2: 1.25, 3: 1.5}
    ACCURACY_MULTIPLIER: float = 1.0
    STREAK_BONUS_PER_DAY: int = 20
    MAX_STREAK_BONUS_DAYS: int = 10
    MAX_SESSION_XP_CAP: int = 500
    MIN_DURATION_SECONDS: int = 15

    @classmethod
    def get_tier(cls, score: int) -> str:
        if score >= 5000:
            return "Diamond"
        if score >= 3000:
            return "Platinum"
        if score >= 1500:
            return "Gold"
        if score >= 500:
            return "Silver"
        return "Bronze"

    @classmethod
    def get_period_keys(cls, dt: Optional[datetime.datetime] = None) -> Dict[str, str]:
        if dt is None:
            dt = datetime.datetime.utcnow()
        return {
            "daily": dt.strftime("%Y-%m-%d"),
            "weekly": f"{dt.year}-W{dt.isocalendar()[1]:02d}",
            "monthly": dt.strftime("%Y-%m"),
            "all_time": "all_time",
        }

    @classmethod
    def calculate_session_points(
        cls,
        duration_s: int,
        valid_reps: int,
        avg_form_score: float,
        difficulty: int,
        streak_days: int,
        confidence: float = 1.0,
    ) -> Tuple[int, Dict[str, int]]:
        """
        Calculates balanced, non-gameable XP for a verified workout session.
        Only completed sessions with duration >= MIN_DURATION_SECONDS earn points.
        """
        if duration_s < cls.MIN_DURATION_SECONDS or confidence < 0.40:
            return 0, {
                "workout_points": 0,
                "exercise_points": 0,
                "accuracy_points": 0,
                "consistency_points": 0,
                "difficulty_points": 0,
            }

        # 1. Base completion points
        workout_points = cls.BASE_WORKOUT_XP

        # 2. Valid repetition points (scaled by difficulty)
        diff_mult = cls.DIFFICULTY_MULTIPLIERS.get(difficulty, 1.0)
        exercise_points = int(math.floor(valid_reps * cls.BASE_REP_XP * diff_mult))

        # 3. Form accuracy bonus (up to 100 points for 100% posture)
        accuracy_points = int(math.floor(avg_form_score * cls.ACCURACY_MULTIPLIER))

        # 4. Consistency streak points (e.g. 5-day streak = 100 XP)
        capped_streak = min(streak_days, cls.MAX_STREAK_BONUS_DAYS)
        consistency_points = capped_streak * cls.STREAK_BONUS_PER_DAY

        # 5. Difficulty bonus
        difficulty_points = (difficulty - 1) * 25

        total = workout_points + exercise_points + accuracy_points + consistency_points + difficulty_points
        # Apply anti-cheat session cap
        total = min(total, cls.MAX_SESSION_XP_CAP)

        return total, {
            "workout_points": workout_points,
            "exercise_points": exercise_points,
            "accuracy_points": accuracy_points,
            "consistency_points": consistency_points,
            "difficulty_points": difficulty_points,
        }

    @classmethod
    async def calculate_user_streak(cls, db: AsyncSession, user_id: UUID) -> Tuple[int, int]:
        """
        Computes the user's current workout streak and longest streak in consecutive calendar days.
        """
        stmt = (
            select(WorkoutSession.completed_at)
            .where(and_(WorkoutSession.user_id == user_id, WorkoutSession.completed == True))
            .order_by(WorkoutSession.completed_at.desc())
        )
        res = await db.execute(stmt)
        dates = res.scalars().all()

        if not dates:
            return 0, 0

        # Unique workout dates in YYYY-MM-DD
        unique_days = sorted(
            list(set(d.date() for d in dates if d is not None)),
            reverse=True
        )

        if not unique_days:
            return 0, 0

        today = datetime.datetime.utcnow().date()
        yesterday = today - datetime.timedelta(days=1)

        # Check if streak is active (worked out today or yesterday)
        if unique_days[0] != today and unique_days[0] != yesterday:
            current_streak = 0
        else:
            current_streak = 1
            for i in range(len(unique_days) - 1):
                if (unique_days[i] - unique_days[i + 1]).days == 1:
                    current_streak += 1
                else:
                    break

        # Compute longest streak historically
        longest_streak = 1 if unique_days else 0
        temp_streak = 1
        for i in range(len(unique_days) - 1):
            if (unique_days[i] - unique_days[i + 1]).days == 1:
                temp_streak += 1
                if temp_streak > longest_streak:
                    longest_streak = temp_streak
            else:
                temp_streak = 1

        return current_streak, max(current_streak, longest_streak)

    @classmethod
    async def record_workout_completion(
        cls,
        db: AsyncSession,
        user: User,
        data: WorkoutCompleteRequest,
    ) -> WorkoutCompleteResponse:
        """
        Validates workout, checks anti-cheat limits, calculates XP, and updates leaderboard scores transactionally.
        """
        # 1. Anti-Cheat: Idempotency check via client_id
        check_stmt = select(WorkoutSession).where(WorkoutSession.client_id == data.client_id)
        existing_res = await db.execute(check_stmt)
        existing_session = existing_res.scalars().first()

        if existing_session:
            # Already processed; return existing data without duplicate scoring
            streak, _ = await cls.calculate_user_streak(db, user.id)
            user_all_time = await cls.get_user_score_record(db, user.id, "all_time", "all_time")
            return WorkoutCompleteResponse(
                session_id=str(existing_session.id),
                points_earned=existing_session.points_earned,
                total_score=user_all_time.total_score if user_all_time else existing_session.points_earned,
                current_rank=None,
                current_streak=streak,
                breakdown={},
                message="Session was already recorded.",
            )

        # 2. Anti-Cheat: Validate repetition speed, duration, and tracking confidence
        duration_s = max(0, data.duration_s)
        if duration_s < cls.MIN_DURATION_SECONDS:
            raise HTTPException(
                status_code=400,
                detail=f"Workout duration ({duration_s}s) is shorter than minimum required ({cls.MIN_DURATION_SECONDS}s)."
            )

        if data.confidence < 0.40:
            raise HTTPException(
                status_code=400,
                detail=f"Landmark tracking confidence ({data.confidence:.2f}) is too low to verify exercise form."
            )

        reps = max(0, data.reps)
        valid_reps = min(reps, max(0, data.valid_reps))

        # Check maximum human repetition speed (> 1.5 reps/sec is physically impossible for compound exercises)
        if duration_s > 0 and (reps / duration_s > 1.5 or valid_reps / duration_s > 1.5):
            raise HTTPException(
                status_code=400,
                detail=f"Repetition count ({reps} reps in {duration_s}s) exceeds biomechanical human limits."
            )

        completed_at = data.completed_at or datetime.datetime.utcnow()

        # 3. Calculate current streak
        streak_days, longest_streak = await cls.calculate_user_streak(db, user.id)
        # If this is user's first workout today, streak increases by 1
        streak_for_scoring = streak_days + 1

        # 4. Calculate Points
        points_earned, breakdown = cls.calculate_session_points(
            duration_s=duration_s,
            valid_reps=valid_reps,
            avg_form_score=data.avg_form_score,
            difficulty=data.difficulty,
            streak_days=streak_for_scoring,
            confidence=data.confidence,
        )

        # 5. Persist WorkoutSession
        session = WorkoutSession(
            user_id=user.id,
            client_id=data.client_id,
            exercise_name=data.exercise_name,
            started_at=data.started_at,
            completed_at=completed_at,
            duration_s=duration_s,
            reps=reps,
            valid_reps=valid_reps,
            difficulty=data.difficulty,
            avg_form_score=data.avg_form_score,
            confidence=data.confidence,
            calories=data.calories or 0.0,
            points_earned=points_earned,
            form_issues=data.form_issues,
            source=data.source,
            completed=True,
        )
        db.add(session)
        await db.flush()

        # Recalculate streak after adding this session
        final_streak, final_longest = await cls.calculate_user_streak(db, user.id)

        # 6. Update LeaderboardScore across Daily, Weekly, Monthly, All-Time
        period_keys = cls.get_period_keys(completed_at)
        user_all_time_score = 0

        for period, period_key in period_keys.items():
            record = await cls.get_user_score_record(db, user.id, period, period_key)
            if not record:
                record = LeaderboardScore(
                    user_id=user.id,
                    period=period,
                    period_key=period_key,
                    total_score=0,
                    workout_points=0,
                    exercise_points=0,
                    accuracy_points=0,
                    consistency_points=0,
                    difficulty_points=0,
                    total_workouts=0,
                    total_repetitions=0,
                    total_valid_repetitions=0,
                    average_accuracy=data.avg_form_score,
                    current_streak=final_streak,
                    longest_streak=final_longest,
                )
                db.add(record)
                await db.flush()

            # Accumulate scores
            record.total_score += points_earned
            record.workout_points += breakdown["workout_points"]
            record.exercise_points += breakdown["exercise_points"]
            record.accuracy_points += breakdown["accuracy_points"]
            record.consistency_points += breakdown["consistency_points"]
            record.difficulty_points += breakdown["difficulty_points"]

            # Update rolling stats
            prev_workouts = record.total_workouts
            record.total_workouts += 1
            record.total_repetitions += reps
            record.total_valid_repetitions += valid_reps

            # Rolling average accuracy
            if prev_workouts == 0:
                record.average_accuracy = round(data.avg_form_score, 1)
            else:
                new_avg = (record.average_accuracy * prev_workouts + data.avg_form_score) / (prev_workouts + 1)
                record.average_accuracy = round(new_avg, 1)

            record.current_streak = final_streak
            record.longest_streak = final_longest
            record.updated_at = datetime.datetime.utcnow()

            if period == "all_time":
                user_all_time_score = record.total_score

        await db.commit()

        # Determine current rank in weekly leaderboard
        weekly_key = period_keys["weekly"]
        current_rank = await cls.get_user_rank(db, user.id, "weekly", weekly_key)

        return WorkoutCompleteResponse(
            session_id=str(session.id),
            points_earned=points_earned,
            total_score=user_all_time_score,
            current_rank=current_rank,
            current_streak=final_streak,
            breakdown=breakdown,
            message="Workout verified & leaderboard score updated successfully!",
        )

    @classmethod
    async def get_user_score_record(
        cls, db: AsyncSession, user_id: UUID, period: str, period_key: str
    ) -> Optional[LeaderboardScore]:
        stmt = select(LeaderboardScore).where(
            and_(
                LeaderboardScore.user_id == user_id,
                LeaderboardScore.period == period,
                LeaderboardScore.period_key == period_key,
            )
        )
        res = await db.execute(stmt)
        return res.scalars().first()

    @classmethod
    async def get_user_rank(
        cls, db: AsyncSession, user_id: UUID, period: str, period_key: str
    ) -> Optional[int]:
        """
        Computes deterministic rank for a user based on tie-breaking rules:
        1. total_score DESC
        2. average_accuracy DESC
        3. total_valid_repetitions DESC
        4. updated_at ASC
        """
        user_record = await cls.get_user_score_record(db, user_id, period, period_key)
        if not user_record or user_record.total_score == 0:
            return None

        # Count all opted-in users who have a strictly higher ranking
        stmt = (
            select(func.count(LeaderboardScore.id))
            .join(User, User.id == LeaderboardScore.user_id)
            .where(
                and_(
                    LeaderboardScore.period == period,
                    LeaderboardScore.period_key == period_key,
                    User.leaderboard_opt_in == True,
                    # Tie-breaking hierarchy:
                    (
                        (LeaderboardScore.total_score > user_record.total_score)
                        | (
                            (LeaderboardScore.total_score == user_record.total_score)
                            & (LeaderboardScore.average_accuracy > user_record.average_accuracy)
                        )
                        | (
                            (LeaderboardScore.total_score == user_record.total_score)
                            & (LeaderboardScore.average_accuracy == user_record.average_accuracy)
                            & (LeaderboardScore.total_valid_repetitions > user_record.total_valid_repetitions)
                        )
                        | (
                            (LeaderboardScore.total_score == user_record.total_score)
                            & (LeaderboardScore.average_accuracy == user_record.average_accuracy)
                            & (LeaderboardScore.total_valid_repetitions == user_record.total_valid_repetitions)
                            & (LeaderboardScore.updated_at < user_record.updated_at)
                        )
                    ),
                )
            )
        )
        res = await db.execute(stmt)
        ahead_count = res.scalar() or 0
        return ahead_count + 1

    @classmethod
    async def get_leaderboard(
        cls,
        db: AsyncSession,
        period: str = "weekly",
        limit: int = 50,
        page: int = 1,
        current_user: Optional[User] = None,
    ) -> LeaderboardResponse:
        """
        Retrieves real, dynamic leaderboard rankings with deterministic tie-breaking.
        """
        period_keys = cls.get_period_keys()
        normalized_period = period.lower().replace("-", "_")
        if normalized_period not in period_keys:
            normalized_period = "weekly"
        period_key = period_keys[normalized_period]

        offset = max(0, (page - 1) * limit)

        # Query top users ordered by performance score
        stmt = (
            select(LeaderboardScore, User)
            .join(User, User.id == LeaderboardScore.user_id)
            .where(
                and_(
                    LeaderboardScore.period == normalized_period,
                    LeaderboardScore.period_key == period_key,
                    LeaderboardScore.total_score > 0,
                    User.leaderboard_opt_in == True,
                )
            )
            .order_by(
                desc(LeaderboardScore.total_score),
                desc(LeaderboardScore.average_accuracy),
                desc(LeaderboardScore.total_valid_repetitions),
                asc(LeaderboardScore.updated_at),
            )
            .offset(offset)
            .limit(limit)
        )

        res = await db.execute(stmt)
        rows = res.all()

        entries: List[LeaderboardEntry] = []
        for idx, (score_row, user_row) in enumerate(rows):
            rank = offset + idx + 1
            entries.append(
                LeaderboardEntry(
                    rank=rank,
                    userId=str(user_row.id),
                    name=user_row.name,
                    username=user_row.username or user_row.email.split("@")[0],
                    avatar=user_row.avatar or f"https://api.dicebear.com/7.x/avataaars/svg?seed={user_row.name}",
                    score=score_row.total_score,
                    workouts=score_row.total_workouts,
                    accuracy=score_row.average_accuracy,
                    streak=score_row.current_streak,
                    repetitions=score_row.total_repetitions,
                    tier=cls.get_tier(score_row.total_score),
                )
            )

        # Count total participants
        count_stmt = (
            select(func.count(LeaderboardScore.id))
            .join(User, User.id == LeaderboardScore.user_id)
            .where(
                and_(
                    LeaderboardScore.period == normalized_period,
                    LeaderboardScore.period_key == period_key,
                    LeaderboardScore.total_score > 0,
                    User.leaderboard_opt_in == True,
                )
            )
        )
        total_count = (await db.execute(count_stmt)).scalar() or 0

        # Current User Position
        current_user_entry: Optional[LeaderboardCurrentUser] = None
        if current_user:
            user_record = await cls.get_user_score_record(
                db, current_user.id, normalized_period, period_key
            )
            rank = await cls.get_user_rank(db, current_user.id, normalized_period, period_key)

            user_score = user_record.total_score if user_record else 0
            user_workouts = user_record.total_workouts if user_record else 0
            user_accuracy = user_record.average_accuracy if user_record else 0.0
            user_streak = user_record.current_streak if user_record else 0
            user_reps = user_record.total_repetitions if user_record else 0

            percentile = None
            if rank and total_count > 0:
                percentile = round(((total_count - rank + 1) / total_count) * 100, 1)

            current_user_entry = LeaderboardCurrentUser(
                rank=rank,
                userId=str(current_user.id),
                name=current_user.name,
                avatar=current_user.avatar or f"https://api.dicebear.com/7.x/avataaars/svg?seed={current_user.name}",
                score=user_score,
                workouts=user_workouts,
                accuracy=user_accuracy,
                streak=user_streak,
                repetitions=user_reps,
                tier=cls.get_tier(user_score),
                percentile=percentile,
            )

        return LeaderboardResponse(
            period=normalized_period,
            period_key=period_key,
            entries=entries,
            currentUser=current_user_entry,
            totalParticipants=total_count,
        )

    @classmethod
    async def get_user_profile_stats(
        cls, db: AsyncSession, user: User
    ) -> LeaderboardMeResponse:
        """
        Retrieves user personal performance dashboard statistics across all timeframes.
        """
        period_keys = cls.get_period_keys()

        all_time_rec = await cls.get_user_score_record(db, user.id, "all_time", "all_time")
        weekly_rec = await cls.get_user_score_record(db, user.id, "weekly", period_keys["weekly"])
        monthly_rec = await cls.get_user_score_record(db, user.id, "monthly", period_keys["monthly"])

        all_time_rank = await cls.get_user_rank(db, user.id, "all_time", "all_time")
        weekly_rank = await cls.get_user_rank(db, user.id, "weekly", period_keys["weekly"])
        monthly_rank = await cls.get_user_rank(db, user.id, "monthly", period_keys["monthly"])

        current_streak, longest_streak = await cls.calculate_user_streak(db, user.id)

        all_time_score = all_time_rec.total_score if all_time_rec else 0
        total_workouts = all_time_rec.total_workouts if all_time_rec else 0
        total_reps = all_time_rec.total_repetitions if all_time_rec else 0
        total_valid_reps = all_time_rec.total_valid_repetitions if all_time_rec else 0
        avg_accuracy = all_time_rec.average_accuracy if all_time_rec else 0.0

        return LeaderboardMeResponse(
            userId=str(user.id),
            name=user.name,
            avatar=user.avatar,
            allTimeScore=all_time_score,
            allTimeRank=all_time_rank,
            weeklyScore=weekly_rec.total_score if weekly_rec else 0,
            weeklyRank=weekly_rank,
            monthlyScore=monthly_rec.total_score if monthly_rec else 0,
            monthlyRank=monthly_rank,
            totalWorkouts=total_workouts,
            totalRepetitions=total_reps,
            totalValidRepetitions=total_valid_reps,
            averageAccuracy=avg_accuracy,
            currentStreak=current_streak,
            longestStreak=longest_streak,
            tier=cls.get_tier(all_time_score),
        )

    @classmethod
    async def recalculate_all_scores_from_history(cls, db: AsyncSession) -> int:
        """
        Clean migration & recalculation process:
        Wipes old leaderboard tables (without deleting users or workouts),
        extracts real historical workout performance, and recalculates the dynamic leaderboard.
        """
        # Delete only leaderboard score rows
        await db.execute(LeaderboardScore.__table__.delete())
        await db.flush()

        # Query all completed workout sessions ordered by completed_at
        stmt = (
            select(WorkoutSession, User)
            .join(User, User.id == WorkoutSession.user_id)
            .where(WorkoutSession.completed == True)
            .order_by(WorkoutSession.completed_at.asc())
        )
        res = await db.execute(stmt)
        sessions = res.all()

        processed_count = 0
        for session, user in sessions:
            if not session.completed_at:
                continue

            streak, longest = await cls.calculate_user_streak(db, user.id)
            points, breakdown = cls.calculate_session_points(
                duration_s=session.duration_s or 0,
                valid_reps=session.valid_reps or session.reps or 0,
                avg_form_score=session.avg_form_score or 100.0,
                difficulty=session.difficulty or 1,
                streak_days=streak,
                confidence=session.confidence or 1.0,
            )

            session.points_earned = points
            period_keys = cls.get_period_keys(session.completed_at)

            for period, period_key in period_keys.items():
                record = await cls.get_user_score_record(db, user.id, period, period_key)
                if not record:
                    record = LeaderboardScore(
                        user_id=user.id,
                        period=period,
                        period_key=period_key,
                        total_score=0,
                        workout_points=0,
                        exercise_points=0,
                        accuracy_points=0,
                        consistency_points=0,
                        difficulty_points=0,
                        total_workouts=0,
                        total_repetitions=0,
                        total_valid_repetitions=0,
                        average_accuracy=session.avg_form_score or 100.0,
                        current_streak=streak,
                        longest_streak=longest,
                    )
                    db.add(record)
                    await db.flush()

                record.total_score += points
                record.workout_points += breakdown["workout_points"]
                record.exercise_points += breakdown["exercise_points"]
                record.accuracy_points += breakdown["accuracy_points"]
                record.consistency_points += breakdown["consistency_points"]
                record.difficulty_points += breakdown["difficulty_points"]

                prev_w = record.total_workouts
                record.total_workouts += 1
                record.total_repetitions += session.reps or 0
                record.total_valid_repetitions += session.valid_reps or session.reps or 0
                if prev_w == 0:
                    record.average_accuracy = round(session.avg_form_score or 100.0, 1)
                else:
                    record.average_accuracy = round(
                        (record.average_accuracy * prev_w + (session.avg_form_score or 100.0)) / (prev_w + 1),
                        1,
                    )
                record.current_streak = streak
                record.longest_streak = longest
                record.updated_at = session.completed_at

            processed_count += 1

        await db.commit()
        return processed_count
