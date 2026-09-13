"""Pydantic schemas for Module entity."""
from typing import Optional
from pydantic import BaseModel, ConfigDict


class ModuleResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    order_index: int

    model_config = ConfigDict(from_attributes=True)
