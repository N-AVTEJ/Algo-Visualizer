"""Schemas package aggregating all Pydantic models."""
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token
from app.schemas.module import ModuleResponse
from app.schemas.algorithm import AlgorithmResponse
from app.schemas.progress import UserProgressCreate, UserProgressResponse
from app.schemas.module1 import Module1RunRequest, Module1RunResponse

__all__ = [
    "UserCreate",
    "UserLogin",
    "UserResponse",
    "Token",
    "ModuleResponse",
    "AlgorithmResponse",
    "UserProgressCreate",
    "UserProgressResponse",
    "Module1RunRequest",
    "Module1RunResponse",
]
