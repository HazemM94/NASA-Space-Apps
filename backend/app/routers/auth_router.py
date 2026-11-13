from fastapi import APIRouter, Depends, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import (
    AppError,
    create_access_token,
    get_current_user,
    login_rate_limiter,
    verify_password,
)
from app.database import get_db
from app.models import User
from app.schemas import LoginRequest, LoginResponse, UserProfileResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=LoginResponse)
async def login(
    payload: LoginRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> LoginResponse:
    client_ip = request.client.host if request.client else "unknown"
    login_rate_limiter.check(f"login:{client_ip}")

    user = (
        await db.execute(select(User).where(User.email == payload.email))
    ).scalar_one_or_none()
    if user is None or not verify_password(payload.password, user.password_hash):
        raise AppError(
            status.HTTP_401_UNAUTHORIZED,
            "INVALID_CREDENTIALS",
            "Invalid email or password.",
        )

    token = create_access_token(user_id=user.id, role=user.role)
    return LoginResponse(
        access_token=token,
        user=UserProfileResponse.model_validate(user, from_attributes=True),
    )


@router.get("/me", response_model=UserProfileResponse)
async def get_me(current_user: User = Depends(get_current_user)) -> UserProfileResponse:
    return UserProfileResponse.model_validate(current_user, from_attributes=True)
