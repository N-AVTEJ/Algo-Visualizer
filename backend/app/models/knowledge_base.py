"""KnowledgeBase model for RAG document storage."""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func

from app.db.base_class import Base


class KnowledgeBase(Base):
    """Stores curriculum knowledge chunks with vector embeddings for RAG retrieval.

    On Postgres + pgvector the ``embedding`` column is a native ``vector(1536)``
    column populated by the Alembic migration.  On SQLite (offline dev) it falls
    back to TEXT and the AI endpoint returns 503, leaving all other features intact.
    """

    __tablename__ = "knowledge_base"

    id = Column(Integer, primary_key=True, index=True)
    topic = Column(String(255), nullable=False, index=True)
    content = Column(Text, nullable=False)
    # embedding_json stores the raw list[float] as JSON text — used as a fallback
    # and for seeding.  The actual pgvector column is added by the migration.
    embedding_json = Column(Text, nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"<KnowledgeBase id={self.id} topic={self.topic!r}>"
