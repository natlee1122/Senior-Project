from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Quest(Base):
    __tablename__ = "quest"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    category: Mapped[str] = mapped_column(String(30), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(250))
    points: Mapped[int] = mapped_column(Integer, nullable=False)
    coins: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    location: Mapped[Optional[str]] = mapped_column(String(100))
    time_start: Mapped[Optional[datetime]] = mapped_column(DateTime)
    time_end: Mapped[Optional[datetime]] = mapped_column(DateTime)
    duration: Mapped[str] = mapped_column(String(30), nullable=False, default="Any time", server_default="Any time")
    difficulty: Mapped[str] = mapped_column(String(20), nullable=False, default="Easy", server_default="Easy")
    theme: Mapped[str] = mapped_column(String(30), nullable=False, default="forest", server_default="forest")
    photo_optional: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="0")

    assignments: Mapped[list["UserQuest"]] = relationship(back_populates="quest")

    @property
    def xp(self) -> int:
        return self.points

    @property
    def custom(self) -> bool:
        return False
