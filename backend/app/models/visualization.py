"""Visualization model."""
from sqlalchemy import Column, Integer, ForeignKey, DateTime, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base_class import Base


class Visualization(Base):
    __tablename__ = "visualizations"

    id = Column(Integer, primary_key=True, index=True)
    algorithm_id = Column(Integer, ForeignKey("algorithms.id", ondelete="CASCADE"), nullable=False, index=True)
    input_data = Column(JSON, nullable=True)
    steps = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    algorithm = relationship("Algorithm", back_populates="visualizations")

    def __repr__(self) -> str:
        return f"<Visualization id={self.id} algorithm_id={self.algorithm_id}>"
