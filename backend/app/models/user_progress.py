"""UserProgress model."""
from sqlalchemy import Column, Integer, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db.base_class import Base


class UserProgress(Base):
    __tablename__ = "user_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    algorithm_id = Column(Integer, ForeignKey("algorithms.id", ondelete="CASCADE"), nullable=False, index=True)
    completed = Column(Boolean, default=False, nullable=False)
    score = Column(Integer, default=0, nullable=True)
    time_spent = Column(Integer, default=0, nullable=False)  # in seconds
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User", back_populates="progress_records")
    algorithm = relationship("Algorithm", back_populates="progress_records")

    def __repr__(self) -> str:
        return f"<UserProgress id={self.id} user_id={self.user_id} algorithm_id={self.algorithm_id} completed={self.completed}>"
