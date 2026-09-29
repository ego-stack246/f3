from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, JSON, UUID
import uuid
import datetime
from app.db.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    age = Column(Integer)
    sex = Column(String, nullable=True)
    height_cm = Column(Float)
    weight_kg = Column(Float)
    goal = Column(String)
    experience = Column(String)
    diet_pref = Column(String)
    region_cuisine = Column(String, nullable=True)
    equipment = Column(JSON, default=[])
    username = Column(String, unique=True, index=True, nullable=True)
    avatar = Column(String, nullable=True)
    leaderboard_opt_in = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
