from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User
from app.schemas import UserRegister, UserLogin, MessageResponse, MeResponse
from app.services.auth import (
    hash_password,
    verify_password,
    set_auth_cookies,
    clear_auth_cookies,
)

router = APIRouter(prefix="/api", tags=["auth"])


@router.post(
    "/register",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
def register(body: UserRegister, response: Response, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status.HTTP_409_CONFLICT, "Email already registered")

    user = User(email=body.email, hashed_password=hash_password(body.password))
    db.add(user)
    db.commit()
    db.refresh(user)

    set_auth_cookies(response, user.id)
    return MessageResponse(message="ok")


@router.post(
    "/login",
    response_model=MessageResponse,
    summary="Log in with email and password",
)
def login(body: UserLogin, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password")

    set_auth_cookies(response, user.id)
    return MessageResponse(message="ok")


@router.post(
    "/logout",
    response_model=MessageResponse,
    summary="Log out and clear cookies",
)
def logout(response: Response):
    clear_auth_cookies(response)
    return MessageResponse(message="ok")


@router.get(
    "/me",
    response_model=MeResponse,
    summary="Get current user info",
)
def me(user: User = Depends(get_current_user)):
    return MeResponse(email=user.email)
