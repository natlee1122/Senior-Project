from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import JSON, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class User(Base):
    __tablename__ = "user"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    # Account fields (nullable so pre-auth rows such as test fixtures stay valid).
    email: Mapped[Optional[str]] = mapped_column(String(254), unique=True, index=True)
    password_hash: Mapped[Optional[str]] = mapped_column(String(255))
    # Profile fields collected at sign-up.
    first_name: Mapped[str] = mapped_column(String(50), nullable=False, default="", server_default="")
    last_name: Mapped[str] = mapped_column(String(50), nullable=False, default="", server_default="")
    goal: Mapped[str] = mapped_column(String(120), nullable=False, default="", server_default="")
    interests: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    points: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    last_login_at: Mapped[Optional[datetime]] = mapped_column(DateTime)

    assignments: Mapped[list["UserQuest"]] = relationship(back_populates="user")
    inventory_items: Mapped[list["InventoryItem"]] = relationship(back_populates="user")
