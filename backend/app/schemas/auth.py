from pydantic import BaseModel
from app.schemas.user import UserInDB

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    refresh_token: str

class TokenData(BaseModel):
    email: str | None = None

class LoginRequest(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    user: UserInDB
