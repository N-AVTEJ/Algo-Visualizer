"""Pydantic schemas for Algorithm entity."""
from typing import Optional
from pydantic import BaseModel, ConfigDict


class AlgorithmResponse(BaseModel):
    id: int
    module_id: int
    name: str
    code: Optional[str] = None
    time_complexity: Optional[str] = None
    space_complexity: Optional[str] = None
    video_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
