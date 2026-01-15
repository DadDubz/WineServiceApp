from typing import Any, Dict
import jwt

from app.core.config import JWT_ALG, JWT_SECRET


def decode_jwt(token: str) -> Dict[str, Any]:
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
