from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Quest(Base):
    __tablename__ = "quest"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    category: Mapped[str] = mapped_column(String(30), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(250))
    points: Mapped[int] = mapped_column(Integer, nullable=False)
    location: Mapped[Optional[str]] = mapped_column(String(100))
    time_start: Mapped[Optional[datetime]] = mapped_column(DateTime)
    time_end: Mapped[Optional[datetime]] = mapped_column(DateTime)

    assignments: Mapped[list["UserQuest"]] = relationship(back_populates="quest")
