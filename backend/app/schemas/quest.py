from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.schemas.user import UserRead

class QuestPayload(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    title: str = Field(min_length=1, max_length=100)
    category: str = Field(min_length=1, max_length=30)
    description: str = Field(default="", max_length=250)
    duration: str = Field(default="Any time", max_length=30)
    difficulty: Literal["Easy", "Medium", "Hard"] = "Easy"

    @field_validator("title", "category", "description", "duration")
    @classmethod
    def strip_text(cls, value: str) -> str:
        return value.strip()


class QuestCreate(QuestPayload):
    pass


class QuestUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    title: Optional[str] = Field(default=None, min_length=1, max_length=100)
    category: Optional[str] = Field(default=None, min_length=1, max_length=30)
    description: Optional[str] = Field(default=None, max_length=250)
    duration: Optional[str] = Field(default=None, max_length=30)
    difficulty: Optional[Literal["Easy", "Medium", "Hard"]] = None

    @field_validator("title", "category", "description", "duration")
    @classmethod
    def strip_text(cls, value: Optional[str]) -> Optional[str]:
        return value.strip() if value is not None else None


class QuestRead(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int
    title: str
    category: str
    description: Optional[str] = None
    duration: str
    difficulty: str
    xp: int
    coins: int
    theme: str
    photo_optional: bool = Field(alias="photoOptional")
    custom: bool = False


class CompleteQuestRead(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    user: UserRead
    quest: QuestRead
    already_completed: bool = Field(alias="alreadyCompleted")


class AssignmentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    quest_id: int
    status: str
    started_at: Optional[datetime]
    ended_at: Optional[datetime]
