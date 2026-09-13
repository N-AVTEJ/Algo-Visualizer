"""Core application configuration."""
import os
from pathlib import Path
from dotenv import load_dotenv

# Path to backend directory and .env
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE = BACKEND_DIR / ".env"

if ENV_FILE.exists():
    load_dotenv(dotenv_path=ENV_FILE)
else:
    load_dotenv()


class Settings:
    PROJECT_NAME: str = "AlgoLens Pro API"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api"

    # Database configuration (Supabase Postgres or local fallback)
    _raw_db_url: str = os.getenv("DATABASE_URL", "")

    @property
    def DATABASE_URL(self) -> str:
        url = os.getenv("DATABASE_URL", self._raw_db_url).strip()
        if not url:
            # Fallback to local SQLite database for offline development & migration generation
            return f"sqlite:///{BACKEND_DIR / 'algolens_dev.db'}"

        # Normalize postgres:// to postgresql+psycopg2:// for SQLAlchemy 2.x
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+psycopg2://", 1)
        elif url.startswith("postgresql://") and not url.startswith("postgresql+"):
            url = url.replace("postgresql://", "postgresql+psycopg2://", 1)

        return url

    @property
    def SQLALCHEMY_ENGINE_OPTIONS(self) -> dict:
        url = self.DATABASE_URL
        options = {}
        if url.startswith("sqlite"):
            options["connect_args"] = {"check_same_thread": False}
        elif "supabase.co" in url or "sslmode=require" in url:
            # Supabase Postgres requires SSL connection
            options["connect_args"] = {"sslmode": "require"}
        return options

    # JWT & Security configuration
    @property
    def SECRET_KEY(self) -> str:
        key = os.getenv("SECRET_KEY", "").strip()
        if not key:
            raise RuntimeError(
                "SECRET_KEY environment variable is not set. Please configure it in backend/.env"
            )
        return key

    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24 hours


settings = Settings()
