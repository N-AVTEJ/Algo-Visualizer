"""Algorithm model."""
from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base


class Algorithm(Base):
    __tablename__ = "algorithms"

    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(Integer, ForeignKey("modules.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    code = Column(Text, nullable=True)
    time_complexity = Column(String(100), nullable=True)
    space_complexity = Column(String(100), nullable=True)
    video_url = Column(String(500), nullable=True)

    # Relationships
    module = relationship("Module", back_populates="algorithms")
    progress_records = relationship(
        "UserProgress",
        back_populates="algorithm",
        cascade="all, delete-orphan",
    )
    visualizations = relationship(
        "Visualization",
        back_populates="algorithm",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<Algorithm id={self.id} name={self.name} module_id={self.module_id}>"
