from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer

from app import schemas, models, auth_utils
from app.db import SessionLocal

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


# ----------- Dependency ----------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ----------- Get Current User ----------
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    data = auth_utils.decode_token(token)
    if not data:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(models.User).filter(models.User.username == data["sub"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# ----------- Login ----------
@router.post("/auth/login", response_model=schemas.TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth_utils.verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    
    token = auth_utils.create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}


# ----------- Register ----------
@router.post("/auth/register", response_model=schemas.TokenResponse)
def register(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.username == user_data.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    hashed_password = auth_utils.hash_password(user_data.password)
    user = models.User(
        username=user_data.username,
        password_hash=hashed_password,
        role=user_data.role
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = auth_utils.create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}


# ----------- Get Current Logged-in User ----------
@router.get("/auth/me", response_model=schemas.UserOut)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return {"username": current_user.username, "role": current_user.role}
