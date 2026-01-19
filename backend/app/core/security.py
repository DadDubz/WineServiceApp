# backend/app/core/security.py
from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any, Dict, Optional

import jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(
    subject: str | int,
    expires_delta: Optional[timedelta] = None,
    extra: Optional[Dict[str, Any]] = None,
) -> str:
    """
    Creates a JWT access token.
    """
    if expires_delta is None:
        expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    expire = datetime.utcnow() + expires_delta
    payload: Dict[str, Any] = {
        "sub": str(subject),
        "exp": expire,
        "iat": datetime.utcnow(),
    }
    if extra:
        payload.update(extra)

    token = jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALG)
    return token


def decode_token(token: str) -> Dict[str, Any]:
    """
    Decodes & validates a token. Raises jwt exceptions if invalid.
    """
    return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALG])
