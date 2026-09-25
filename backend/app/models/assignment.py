from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class UserQuest(Base):
    __tablename__ = "user_quest"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False, index=True)
    quest_id: Mapped[int] = mapped_column(ForeignKey("quest.id"), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="AVAILABLE")
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    ended_at: Mapped[Optional[datetime]] = mapped_column(DateTime)

    user: Mapped["User"] = relationship(back_populates="assignments")
    quest: Mapped["Quest"] = relationship(back_populates="assignments")
    events: Mapped[list["EventLog"]] = relationship(back_populates="user_quest")
