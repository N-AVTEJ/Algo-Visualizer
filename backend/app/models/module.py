"""Module model (curriculum module)."""
from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from app.db.base_class import Base


class Module(Base):
    __tablename__ = "modules"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    order_index = Column(Integer, nullable=False, index=True)

    # Relationships
    algorithms = relationship(
        "Algorithm",
        back_populates="module",
        cascade="all, delete-orphan",
        order_by="Algorithm.id",
    )

    def __repr__(self) -> str:
        return f"<Module id={self.id} order={self.order_index} name={self.name}>"
