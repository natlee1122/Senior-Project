from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token
from app.db import get_db
from app.models.user import User
from app.schemas.user import AuthResponse, LoginRequest, UserCreate, UserRead
from app.services.user_service import EmailAlreadyRegistered, authenticate, create_user

router = APIRouter(prefix="/auth", tags=["auth"])

DEMO_EMAIL = "demo@lifescape.app"
DEMO_PASSWORD = "lifescape"


def _auth_response(user: User) -> AuthResponse:
    return AuthResponse(token=create_access_token(user.id), user=UserRead.model_validate(user))


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)) -> AuthResponse:
    """Create an account and log the user in immediately (Signup.vue routes straight to home)."""
    try:
        user = create_user(db, payload)
    except EmailAlreadyRegistered:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with that email already exists.")
    return _auth_response(user)


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> AuthResponse:
    user = authenticate(db, payload.email, payload.password)
    if user is None:
        # Same message for unknown email and wrong password so accounts can't be enumerated.
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password.")
    return _auth_response(user)


@router.post("/demo", response_model=AuthResponse)
def demo_login(db: Session = Depends(get_db)) -> AuthResponse:
    """Log in as the seeded demo account (see scripts/seed_demo.py)."""
    user = authenticate(db, DEMO_EMAIL, DEMO_PASSWORD)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Demo account not seeded. Run scripts/seed_demo.py.")
    return _auth_response(user)
