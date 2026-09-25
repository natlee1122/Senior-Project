from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class EventLog(Base):
    __tablename__ = "event_log"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_quest_id: Mapped[int] = mapped_column(ForeignKey("user_quest.id"), nullable=False, index=True)
    recommender: Mapped[Optional[str]] = mapped_column(String(30))
    status: Mapped[str] = mapped_column(String(30), nullable=False)
    event_type: Mapped[str] = mapped_column(String(30), nullable=False)
    occurred_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    context: Mapped[Optional[dict]] = mapped_column(JSON)
    model_version: Mapped[Optional[str]] = mapped_column(String(50))
    evidence_url: Mapped[Optional[str]] = mapped_column(String(500))

    user_quest: Mapped["UserQuest"] = relationship(back_populates="events")
