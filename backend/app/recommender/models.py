from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Float, ForeignKey, Index, Integer, JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class RecommendationImpression(Base):
    __tablename__ = "recommendation_impression"
    __table_args__ = (Index("ix_recommendation_impression_user_shown", "user_id", "shown_at"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)
    quest_id: Mapped[int] = mapped_column(ForeignKey("quest.id"), nullable=False)
    assignment_id: Mapped[Optional[int]] = mapped_column(ForeignKey("user_quest.id"), unique=True)
    recommended_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    shown_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    recommender: Mapped[str] = mapped_column(String(30), nullable=False)
    model_version: Mapped[str] = mapped_column(String(100), nullable=False)
    policy_version: Mapped[str] = mapped_column(String(30), nullable=False)
    selection_probability: Mapped[float] = mapped_column(Float, nullable=False)
    feature_snapshot: Mapped[dict] = mapped_column(JSON, nullable=False)
    decision_context: Mapped[dict] = mapped_column(JSON, nullable=False)
