from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class QuestRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    category: str
    description: Optional[str]
    points: int
    location: Optional[str]
    time_start: Optional[datetime]
    time_end: Optional[datetime]


class AssignmentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    quest_id: int
    status: str
    started_at: Optional[datetime]
    ended_at: Optional[datetime]
