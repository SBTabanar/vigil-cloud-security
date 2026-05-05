from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
import re

from app.core.config import get_settings
from app.core.security import verify_password, get_password_hash, create_access_token, decode_access_token
from app.models.database import get_db, User, Organization, OrganizationMember
from app.schemas import UserCreate, UserLogin, UserResponse, TokenResponse

router = APIRouter(prefix="/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")
settings = get_settings()

# In-memory rate limiter for auth endpoints (production: use Redis)
_login_attempts = {}

def _check_rate_limit(client_ip: str, max_attempts: int = 5, window_seconds: int = 60):
    import time
    now = time.time()
    attempts = _login_attempts.get(client_ip, [])
    attempts = [t for t in attempts if now - t < window_seconds]
    if len(attempts) >= max_attempts:
        raise HTTPException(status_code=429, detail="Too many attempts. Please try again later.")
    attempts.append(now)
    _login_attempts[client_ip] = attempts

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    try:
        user_id_int = int(user_id)
    except (ValueError, TypeError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    user = db.query(User).filter(User.id == user_id_int).first()
    if user is None or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    return current_user

def validate_password_strength(password: str) -> str:
    """Validate password meets security requirements. Returns error message or empty string."""
    if len(password) < 8:
        return "Password must be at least 8 characters long"
    if not re.search(r"[A-Z]", password):
        return "Password must contain at least one uppercase letter"
    if not re.search(r"[a-z]", password):
        return "Password must contain at least one lowercase letter"
    if not re.search(r"\d", password):
        return "Password must contain at least one digit"
    return ""

@router.post("/register", response_model=TokenResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        # Do not reveal whether email exists (prevent user enumeration)
        raise HTTPException(status_code=400, detail="Registration failed")
    
    pwd_error = validate_password_strength(user_data.password)
    if pwd_error:
        raise HTTPException(status_code=400, detail=pwd_error)
    
    user = User(
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        first_name=user_data.first_name,
        last_name=user_data.last_name
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    access_token = create_access_token(data={"sub": str(user.id)})
    return TokenResponse(access_token=access_token, user=UserResponse.model_validate(user))

@router.post("/login", response_model=TokenResponse)
def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    client_ip = request.client.host if request.client else "unknown"
    _check_rate_limit(client_ip)
    
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": str(user.id)})
    return TokenResponse(access_token=access_token, user=UserResponse.model_validate(user))

@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_active_user)):
    return UserResponse.model_validate(current_user)
