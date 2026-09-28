from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import timedelta
from app.db.session import get_db
from app.db.models.user import User
from app.schemas.user import UserCreate
from app.schemas.auth import LoginRequest, AuthResponse
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.config import settings
import uuid

router = APIRouter()

@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if user exists
    result = await db.execute(select(User).where(User.email == user_in.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")
        
    # Create new user
    hashed_password = get_password_hash(user_in.password)
    db_user = User(
        email=user_in.email,
        password_hash=hashed_password,
        name=user_in.name,
        age=user_in.age,
        height_cm=user_in.height_cm,
        weight_kg=user_in.weight_kg,
        goal=user_in.goal,
        experience=user_in.experience,
        diet_pref=user_in.diet_pref,
        equipment=user_in.equipment,
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    
    # Create token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.email}, expires_delta=access_token_expires
    )
    
    return AuthResponse(access_token=access_token, refresh_token="dummy_refresh", user=db_user)

@router.post("/login", response_model=AuthResponse)
async def login(login_data: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == login_data.email))
    user = result.scalars().first()
    
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return AuthResponse(access_token=access_token, refresh_token="dummy_refresh", user=user)
