"""Database engine and session configuration."""
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    **settings.SQLALCHEMY_ENGINE_OPTIONS,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """Dependency for providing database session to FastAPI route endpoints."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
