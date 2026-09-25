from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Reward:
    points: int
    prop_id: int | None = None
