from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, JSON, UUID
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
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    client_id = Column(UUID(as_uuid=True), unique=True)
    exercise_id = Column(UUID(as_uuid=True), ForeignKey("exercises.id"))
    started_at = Column(DateTime)
    duration_s = Column(Integer)
    reps = Column(Integer)
    sets = Column(Integer)
    avg_form_score = Column(Integer)
    form_issues = Column(JSON)
    source = Column(String)

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

