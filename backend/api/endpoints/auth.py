from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from api.deps import get_db, get_current_user
from core import security
from models.user import User
from schemas.models import User as UserSchema, UserRole
from pydantic import BaseModel, EmailStr

router = APIRouter()


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.STUDENT


@router.post(
    "/register",
    response_model=UserSchema,
    status_code=status.HTTP_201_CREATED,
)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user.
    """
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )

    user = User(
        name=user_in.name,
        email=user_in.email,
        hashed_password=security.get_password_hash(user_in.password),
        role=user_in.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login")
def login(
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
):
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not security.verify_password(
        form_data.password, user.hashed_password
    ):
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    return {
        "access_token": security.create_access_token(user.id),
        "token_type": "bearer",
        "expires_in": security.settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": user,
    }


class RefreshTokenRequest(BaseModel):
    refresh_token: str


@router.post("/refresh")
def refresh_token(request: RefreshTokenRequest, db: Session = Depends(get_db)):
    """
    Refresh access token (In a real scenario, validate a refresh token. Here we simulate it).
    """
    try:
        payload = security.jwt.decode(
            request.refresh_token,
            security.settings.SECRET_KEY,
            algorithms=[security.settings.ALGORITHM],
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid refresh token")
    except security.JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return {
        "access_token": security.create_access_token(user.id),
        "token_type": "bearer",
        "expires_in": security.settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": user,
    }


@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    """
    User logout
    (For JWTs, true logout requires blacklisting or short expiration + refresh tokens. We simply return a success response here).
    """
    return {"message": "Logged out successfully"}


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str


@router.post("/change-password")
def change_password(
    request: PasswordChangeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Change the current user's password.
    """
    if not security.verify_password(
        request.current_password, current_user.hashed_password
    ):
        raise HTTPException(status_code=400, detail="Current password incorrect")

    current_user.hashed_password = security.get_password_hash(request.new_password)
    db.commit()

    return {"message": "Password changed successfully"}


@router.get("/test-token", response_model=UserSchema)
def test_token(current_user: User = Depends(get_current_user)):
    """
    Test access token
    """
    return current_user
