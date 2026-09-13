"""User progress router."""
from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.algorithm import Algorithm
from app.models.user_progress import UserProgress
from app.schemas.progress import UserProgressCreate, UserProgressResponse

router = APIRouter()


@router.get(
    "/me",
    response_model=List[UserProgressResponse],
    summary="Get current user's progress records",
)
def get_my_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[UserProgress]:
    """Retrieve progress records strictly for the currently authenticated user."""
    records = db.query(UserProgress).filter(UserProgress.user_id == current_user.id).all()
    return records


@router.post(
    "",
    response_model=UserProgressResponse,
    summary="Record or update progress for an algorithm",
)
def create_or_update_progress(
    progress_in: UserProgressCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserProgress:
    """Create or update progress for the authenticated user on a specific algorithm."""
    # Validate target algorithm exists
    algorithm = db.query(Algorithm).filter(Algorithm.id == progress_in.algorithm_id).first()
    if not algorithm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Algorithm not found",
        )

    # Check if a progress entry already exists for (current_user.id, algorithm_id)
    existing_record = (
        db.query(UserProgress)
        .filter(
            UserProgress.user_id == current_user.id,
            UserProgress.algorithm_id == progress_in.algorithm_id,
        )
        .first()
    )

    now = datetime.now(timezone.utc)

    if existing_record:
        existing_record.completed = progress_in.completed
        existing_record.score = progress_in.score
        existing_record.time_spent = progress_in.time_spent
        if progress_in.completed:
            existing_record.completed_at = now
        record = existing_record
    else:
        record = UserProgress(
            user_id=current_user.id,
            algorithm_id=progress_in.algorithm_id,
            completed=progress_in.completed,
            score=progress_in.score,
            time_spent=progress_in.time_spent,
            completed_at=now if progress_in.completed else None,
        )
        db.add(record)

    db.commit()
    db.refresh(record)
    return record
