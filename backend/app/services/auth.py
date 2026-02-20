from datetime import UTC, datetime, timedelta

import bcrypt
from fastapi import Response
from jose import JWTError, jwt

from app.config import get_settings

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE = timedelta(hours=1)
# TODO: add refresh token


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def create_access_token(user_id: int) -> str:
    now = datetime.now(UTC)
    payload = {
        "sub": str(user_id),
        "exp": now + ACCESS_TOKEN_EXPIRE,
    }
    return jwt.encode(payload, get_settings().JWT_SECRET, algorithm=ALGORITHM)


def set_auth_cookies(response: Response, user_id: int) -> None:
    token = create_access_token(user_id)
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=int(ACCESS_TOKEN_EXPIRE.total_seconds()),
        path="/api",
    )


def clear_auth_cookies(response: Response) -> None:
    response.delete_cookie(key="access_token", path="/api")


def decode_token(token: str) -> int | None:
    try:
        payload = jwt.decode(
            token, get_settings().JWT_SECRET, algorithms=[ALGORITHM]
        )
        sub = payload.get("sub")
        return int(sub) if sub else None
    except (JWTError, ValueError):
        return None
