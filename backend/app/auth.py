# app/auth.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer

from app import schemas, models, auth_utils
from app.db import SessionLocal

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# ---------- Database Dependency ----------

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------- Current User Dependency ----------

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    data = auth_utils.decode_token(token)
    if not data:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(models.User).filter(models.User.username == data["sub"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# ---------- Login Route ----------

@router.post("/auth/login", response_model=schemas.TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth_utils.verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    token = auth_utils.create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}

# ---------- Authenticated User Route ----------

@router.get("/auth/me", response_model=schemas.UserOut)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user
