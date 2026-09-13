"""Authentication router."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token
from app.core.security import get_password_hash, verify_password, create_access_token

router = APIRouter()


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
def register_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
) -> User:
    """Register a new user account with email and password."""
    # Check if email is already registered
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Hash password with passlib bcrypt
    hashed_password = get_password_hash(user_in.password)

    # Create new user record
    new_user = User(
        email=user_in.email,
        password_hash=hashed_password,
        role="student",
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.post(
    "/login",
    response_model=Token,
    summary="Authenticate user and obtain JWT token",
)
def login_user(
    user_in: UserLogin,
    db: Session = Depends(get_db),
) -> Token:
    """Authenticate user with email/password and return JWT access token."""
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Generate JWT token with user.id as subject
    access_token = create_access_token(subject=str(user.id))

    return Token(
        access_token=access_token,
        token_type="bearer",
    )
