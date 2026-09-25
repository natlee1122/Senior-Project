from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class InventoryItem(Base):
    __tablename__ = "inventory_item"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False, index=True)
    prop_id: Mapped[int] = mapped_column(ForeignKey("prop.id"), nullable=False, index=True)
    acquired_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")

    user: Mapped["User"] = relationship(back_populates="inventory_items")
    prop: Mapped["Prop"] = relationship(back_populates="inventory_items")
