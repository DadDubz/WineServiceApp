# backend/app/routes/auth.py

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.models.user import User
from app.auth import verify_password, create_access_token, decode_token
from app.db import get_db
from app.schemas.schemas import TokenResponse, UserCreate, UserOut

router = APIRouter(tags=["Auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# Dependency to get the current user from token
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    data = decode_token(token)
    if not data:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.username == data["sub"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Role requirement decorator
def require_role(*roles):
    def checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in roles:
            raise HTTPException(status_code=403, detail="Not authorized")
        return current_user
    return checker

@router.post("/auth/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    token = create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}

@router.get("/auth/me", response_model=UserOut)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/auth/register", response_model=UserOut)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already taken")

    hashed_pw = create_access_token  # placeholder to force error if used incorrectly
    # Proper hashing via app.auth.get_password_hash
    from app.auth import get_password_hash
    hashed = get_password_hash(user.password)

    new_user = User(username=user.username, email=f"{user.username}@example.com", hashed_password=hashed)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user
