"""Pydantic schemas for UserProgress entity."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class UserProgressCreate(BaseModel):
    algorithm_id: int
    completed: bool = True
    score: Optional[int] = 0
    time_spent: int = Field(default=0, ge=0, description="Time spent in seconds")


class UserProgressResponse(BaseModel):
    id: int
    user_id: int
    algorithm_id: int
    completed: bool
    score: Optional[int] = 0
    time_spent: int
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
