# backend/app/routes/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.user import User
from app.auth import verify_password, create_access_token, decode_token, get_password_hash
from app.schemas.schemas import TokenResponse, UserCreate, UserOut

router = APIRouter(prefix="/auth", tags=["Auth"])

# Points FastAPI’s OAuth2 flow to our /auth/login endpoint
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Extract user from a JWT access token."""
    data = None
    try:
        data = decode_token(token)
    except Exception:
        # decode_token may already guard/return None; this is just extra safety
        pass

    if not data or "sub" not in data:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user = db.query(User).filter(User.username == data["sub"]).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


def require_role(*roles: str):
    """
    Optional role guard. If the User model doesn't have `role`, this won't crash;
    it only enforces when a role attribute exists.
    """
    def checker(current_user: User = Depends(get_current_user)) -> User:
        if roles:
            user_role = getattr(current_user, "role", None)
            if user_role is None:
                # You asked for role restrictions but the user has no role field.
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
            if user_role not in roles:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        return current_user
    return checker


@router.post("/login", response_model=TokenResponse)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """
    OAuth2 password flow expects form fields:
      - username
      - password
    Content-Type: application/x-www-form-urlencoded
    """
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect username or password")

    token = create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=UserOut)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register_user(payload: UserCreate, db: Session = Depends(get_db)):
    """
    Registers a user. Your `UserCreate` schema should have at least:
      - username: str
      - password: str
      - email: Optional[str]  (if not provided we generate one)
    """
    # Unique username check
    if db.query(User).filter(User.username == payload.username).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already taken")

    # Optional unique email check if email provided
    email = getattr(payload, "email", None) or f"{payload.username}@example.com"
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already in use")

    hashed = get_password_hash(payload.password)
    user = User(
        username=payload.username,
        email=email,
        hashed_password=hashed,
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    return user
