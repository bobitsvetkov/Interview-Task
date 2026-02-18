from datetime import UTC, datetime, timedelta

import bcrypt
from fastapi import Response
from jose import JWTError, jwt

from app.config import get_settings

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE = timedelta(minutes=15)
REFRESH_TOKEN_EXPIRE = timedelta(days=7)


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def _get_secret(token_type: str) -> str:
    settings = get_settings()
    return settings.JWT_SECRET if token_type == "access" else settings.JWT_REFRESH_SECRET


def _create_token(user_id: int, token_type: str, expires: timedelta) -> str:
    now = datetime.now(UTC)
    payload = {
        "sub": str(user_id),
        "type": token_type,
        "exp": now + expires,
    }
    return jwt.encode(payload, _get_secret(token_type), algorithm=ALGORITHM)


def create_access_token(user_id: int) -> str:
    return _create_token(user_id, "access", ACCESS_TOKEN_EXPIRE)


def create_refresh_token(user_id: int) -> str:
    return _create_token(user_id, "refresh", REFRESH_TOKEN_EXPIRE)


def set_auth_cookies(response: Response, user_id: int) -> None:
    access = create_access_token(user_id)
    refresh = create_refresh_token(user_id)
    response.set_cookie(
        key="access_token",
        value=access,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=int(ACCESS_TOKEN_EXPIRE.total_seconds()),
        path="/api",
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=int(REFRESH_TOKEN_EXPIRE.total_seconds()),
        path="/api",
    )


def clear_auth_cookies(response: Response) -> None:
    response.delete_cookie(key="access_token", path="/api")
    response.delete_cookie(key="refresh_token", path="/api")


def decode_token(token: str, expected_type: str) -> int | None:
    """Returns user_id or None if token is invalid or wrong type."""
    try:
        payload = jwt.decode(
            token, _get_secret(expected_type), algorithms=[ALGORITHM]
        )
        if payload.get("type") != expected_type:
            return None
        sub = payload.get("sub")
        return int(sub) if sub else None
    except (JWTError, ValueError):
        return None
