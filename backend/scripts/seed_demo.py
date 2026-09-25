"""Seed one demo user and the three quests shown by the Vue placeholder UI."""
from __future__ import annotations

from sqlalchemy import select

from app.db import SessionLocal
from app.models.quest import Quest
from app.models.user import User

DEMO_USERNAME = "demo_user"

DEMO_QUESTS = (
    {
        "title": "Take a 20 minute walk",
        "category": "Exercise",
        "description": "Get outside and enjoy some fresh air. Walk anywhere you like.",
        "points": 50,
    },
    {
        "title": "Study for 30 minutes",
        "category": "Study",
        "description": "Focus on one thing that moves your day forward.",
        "points": 40,
    },
    {
        "title": "Take a picture of something interesting",
        "category": "Explore",
        "description": "Look around your surroundings and capture something you might otherwise miss.",
        "points": 30,
    },
)


def seed_demo() -> None:
    with SessionLocal.begin() as db:
        user = db.scalar(select(User).where(User.username == DEMO_USERNAME))
        if user is None:
            user = User(username=DEMO_USERNAME, points=0)
            db.add(user)
            db.flush()

        for quest_data in DEMO_QUESTS:
            quest = db.scalar(select(Quest).where(Quest.title == quest_data["title"]))
            if quest is None:
                db.add(Quest(**quest_data))
            else:
                for field, value in quest_data.items():
                    setattr(quest, field, value)

    print(f"Seeded demo user: {DEMO_USERNAME}")
    print(f"Seeded {len(DEMO_QUESTS)} demo quests.")


if __name__ == "__main__":
    seed_demo()
