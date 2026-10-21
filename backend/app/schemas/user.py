from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator
from pydantic.alias_generators import to_camel

# The Vue frontend speaks camelCase (firstName, lastName...). These models accept and
# return camelCase on the wire while keeping snake_case attribute names in Python.
_camel = ConfigDict(alias_generator=to_camel, populate_by_name=True, from_attributes=True)


def _normalize_email(value: str) -> str:
    value = value.strip().lower()
    local, _, domain = value.partition("@")
    if not local or "." not in domain:
        raise ValueError("Please enter a valid email address.")
    return value


class UserCreate(BaseModel):
    """Sign-up payload sent by Signup.vue."""

    model_config = _camel

    email: str = Field(max_length=254)
    password: str = Field(min_length=4, max_length=128)
    first_name: str = Field(min_length=1, max_length=50)
    last_name: str = Field(default="", max_length=50)
    goal: str = Field(default="", max_length=120)
    interests: list[str] = Field(default_factory=list, max_length=10)

    _email = field_validator("email")(_normalize_email)

    @field_validator("first_name", "last_name", "goal")
    @classmethod
    def _strip(cls, value: str) -> str:
        return value.strip()


class LoginRequest(BaseModel):
    email: str
    password: str

    _email = field_validator("email")(_normalize_email)


class UserUpdate(BaseModel):
    """Partial profile update; omitted fields are left unchanged."""

    model_config = _camel

    first_name: Optional[str] = Field(default=None, min_length=1, max_length=50)
    last_name: Optional[str] = Field(default=None, max_length=50)
    goal: Optional[str] = Field(default=None, max_length=120)
    interests: Optional[list[str]] = Field(default=None, max_length=10)


class UserRead(BaseModel):
    model_config = _camel

    id: int
    username: str
    email: Optional[str] = None
    first_name: str = ""
    last_name: str = ""
    goal: str = ""
    interests: list[str] = Field(default_factory=list)
    points: int
    created_at: datetime


class AuthResponse(BaseModel):
    model_config = _camel

    token: str
    token_type: str = "bearer"
    user: UserRead


class UserStats(BaseModel):
    model_config = _camel

    xp: int
    coins: int
    level: int
    xp_into_level: int
    level_progress: float
    completed_today: int
    completed_this_week: int
