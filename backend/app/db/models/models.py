from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, JSON, UUID, UniqueConstraint
import uuid
import datetime
from app.db.base import Base

class DailyCheckin(Base):
    __tablename__ = "daily_checkins"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    date = Column(DateTime, default=datetime.datetime.utcnow)
    sleep_hours = Column(Float)
    energy = Column(Integer)
    mood = Column(Integer)
    soreness = Column(Integer)
    stress = Column(Integer)
    minutes_available = Column(Integer)
    notes = Column(String, nullable=True)

class Plan(Base):
    __tablename__ = "plans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    date = Column(DateTime, default=datetime.datetime.utcnow)
    checkin_id = Column(UUID(as_uuid=True), ForeignKey("daily_checkins.id"))
    intensity_level = Column(String)
    rationale = Column(String)
    plan_json = Column(JSON)
    source = Column(String)

class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String)
    muscle_group = Column(String)
    level = Column(String)
    equipment = Column(JSON)
    instructions = Column(JSON)
    video_key = Column(String, nullable=True)
    supports_pose_coach = Column(Boolean, default=False)
    target_angles = Column(JSON, nullable=True)

class WorkoutSession(Base):
    __tablename__ = "workout_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), index=True, nullable=False)
    client_id = Column(UUID(as_uuid=True), unique=True, index=True, default=uuid.uuid4, nullable=False)
    exercise_id = Column(UUID(as_uuid=True), ForeignKey("exercises.id"), nullable=True)
    exercise_name = Column(String, nullable=True)
    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, default=datetime.datetime.utcnow)
    duration_s = Column(Integer, default=0)
    reps = Column(Integer, default=0)
    valid_reps = Column(Integer, default=0)
    sets = Column(Integer, default=1)
    difficulty = Column(Integer, default=1)
    avg_form_score = Column(Float, default=100.0)
    confidence = Column(Float, default=1.0)
    calories = Column(Float, default=0.0)
    points_earned = Column(Integer, default=0)
    form_issues = Column(JSON, default=[])
    source = Column(String, default="camera_ai")
    completed = Column(Boolean, default=True)

class LeaderboardScore(Base):
    __tablename__ = "leaderboard_scores"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), index=True, nullable=False)
    period = Column(String, index=True, nullable=False)  # "daily", "weekly", "monthly", "all_time"
    period_key = Column(String, index=True, nullable=False)  # "2026-09-30", "2026-W40", "2026-09", "all_time"

    total_score = Column(Integer, default=0, index=True)
    workout_points = Column(Integer, default=0)
    exercise_points = Column(Integer, default=0)
    accuracy_points = Column(Integer, default=0)
    consistency_points = Column(Integer, default=0)
    difficulty_points = Column(Integer, default=0)

    total_workouts = Column(Integer, default=0)
    total_repetitions = Column(Integer, default=0)
    total_valid_repetitions = Column(Integer, default=0)
    average_accuracy = Column(Float, default=0.0)
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)

    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("user_id", "period", "period_key", name="uq_user_period_key"),
    )

class Meal(Base):
    __tablename__ = "meals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    eaten_at = Column(DateTime)
    name = Column(String)
    items = Column(JSON)
    calories = Column(Float)
    protein_g = Column(Float)
    carbs_g = Column(Float)
    fat_g = Column(Float)
    source = Column(String)
    confidence = Column(String, nullable=True)

class Post(Base):
    __tablename__ = 'posts'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    content = Column(String)
    image_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    likes_count = Column(Integer, default=0)
    shares_count = Column(Integer, default=0)

class Story(Base):
    __tablename__ = 'stories'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    image_url = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Challenge(Base):
    __tablename__ = 'challenges'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String)
    description = Column(String)
    icon = Column(String)
    participants_count = Column(Integer, default=0)

class UserChallenge(Base):
    __tablename__ = 'user_challenges'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), index=True)
    challenge_id = Column(UUID(as_uuid=True), ForeignKey('challenges.id'), index=True)
    joined_at = Column(DateTime, default=datetime.datetime.utcnow)
    progress = Column(Float, default=0.0)
    completed = Column(Boolean, default=False)

class PostLike(Base):
    __tablename__ = 'post_likes'
    __table_args__ = (UniqueConstraint('user_id', 'post_id', name='uq_post_like_user_post'),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), index=True)
    post_id = Column(UUID(as_uuid=True), ForeignKey('posts.id'), index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class PostComment(Base):
    __tablename__ = 'post_comments'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), index=True)
    post_id = Column(UUID(as_uuid=True), ForeignKey('posts.id'), index=True)
    content = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class UserFollow(Base):
    __tablename__ = 'user_follows'
    __table_args__ = (UniqueConstraint('follower_id', 'following_id', name='uq_user_follow'),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    follower_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), index=True)
    following_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


