from fastapi import Depends, HTTPException

from app.deps.auth import CurrentUser, get_current_user


ROLE_ORDER = ["server", "expo", "sommelier", "manager"]


def require_roles(*allowed_roles: str):
    allowed = set(allowed_roles)

    def _dep(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if user.role not in allowed:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user

    return _dep
