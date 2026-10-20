"""Generate synthetic recommendation history in a separate SQLite database."""
from __future__ import annotations

import argparse
from dataclasses import dataclass
from datetime import date, datetime, time, timedelta
import heapq
from itertools import count
import json
from pathlib import Path
import random
import shlex
import sys

from sqlalchemy import create_engine, event, or_, select
from sqlalchemy.engine import URL
from sqlalchemy.orm import Session

from app.models import Quest, User, UserQuest
from app.models.base import Base
from app.recommender.features import snapshot
from app.recommender.models import RecommendationImpression


@dataclass(frozen=True)
class Persona:
    name: str
    preferred_categories: tuple[str, ...]
    preferred_hours: tuple[int, ...]
    base_probability: float = 0.50


PERSONAS = (
    Persona("student", ("Study",), (18, 19, 20, 21)),
    Persona("outdoor", ("Exercise", "Explore"), (8, 9, 10, 15, 16)),
    Persona("balanced", (), (9, 12, 17, 20)),
)

CATALOG = (
    ("Take a 20 minute walk", "Exercise", 50),
    ("Study for 30 minutes", "Study", 40),
    ("Take a picture of something interesting", "Explore", 30),
)

# Complete events sort before displays when timestamps match.
COMPLETE, DISPLAY = 0, 1


def completion_probability(persona: Persona, category: str, hour: int) -> float:
    probability = persona.base_probability
    if persona.preferred_categories:
        probability += 0.20 if category in persona.preferred_categories else -0.15
    if hour in persona.preferred_hours:
        probability += 0.10
    return max(0.05, min(0.95, probability))


def _eligible_quests(db: Session, user_id: int, now: datetime) -> list[Quest]:
    unavailable = select(UserQuest.id).where(
        UserQuest.user_id == user_id,
        UserQuest.quest_id == Quest.id,
        or_(
            UserQuest.status != "COMPLETED",
            UserQuest.ended_at.is_(None),
            UserQuest.ended_at > now - timedelta(hours=24),
        ),
    ).exists()
    return list(db.scalars(select(Quest).where(
        ~unavailable,
        or_(Quest.time_start.is_(None), Quest.time_start <= now),
        or_(Quest.time_end.is_(None), Quest.time_end > now),
    ).order_by(Quest.id)))


def simulate(
    db: Session,
    *,
    start_date: date,
    days: int = 30,
    users_per_persona: int = 10,
    seed: int = 42,
) -> dict:
    """Add one simulated cohort; leave transaction ownership to the caller."""
    if days < 1 or users_per_persona < 1:
        raise ValueError("days and users_per_persona must be positive")
    if db.scalar(select(Quest.id).limit(1)) is None:
        raise ValueError("quest catalog is empty")
    if db.scalar(select(User.id).where(
        User.username.startswith("sim_", autoescape=True)
    ).limit(1)) is not None:
        raise ValueError("simulated users already exist; use a fresh database")

    rng = random.Random(seed)
    sequence = count()
    events: list[tuple[datetime, int, int, int, int]] = []
    users: dict[int, tuple[User, Persona]] = {}
    stats = {
        persona.name: {"impressions": 0, "completed": 0, "skipped": 0, "unavailable": 0}
        for persona in PERSONAS
    }
    start_at = datetime.combine(start_date, time())

    for persona in PERSONAS:
        for index in range(users_per_persona):
            user = User(
                username=f"sim_{persona.name}_{index + 1}",
                points=0,
                created_at=start_at,
            )
            db.add(user)
            db.flush()
            users[user.id] = (user, persona)
            for day_offset in range(days):
                hour = (
                    rng.choice(persona.preferred_hours)
                    if rng.random() < 0.8 else rng.randrange(24)
                )
                shown_at = start_at + timedelta(
                    days=day_offset, hours=hour, minutes=rng.randrange(60)
                )
                heapq.heappush(events, (shown_at, DISPLAY, next(sequence), user.id, 0))

    while events:
        now, kind, _, user_id, assignment_id = heapq.heappop(events)
        user, persona = users[user_id]
        if kind == COMPLETE:
            assignment = db.get(UserQuest, assignment_id)
            assignment.status = "COMPLETED"
            assignment.ended_at = now
            user.points += assignment.quest.points
            db.flush()
            continue

        candidates = _eligible_quests(db, user_id, now)
        if not candidates:
            stats[persona.name]["unavailable"] += 1
            continue
        quest = rng.choice(candidates)
        probability = completion_probability(persona, quest.category, now.hour)
        impression = RecommendationImpression(
            user_id=user_id,
            quest_id=quest.id,
            recommended_at=now,
            shown_at=now,
            recommender="simulator",
            model_version="synthetic-v1",
            policy_version="uniform-sim-v1",
            selection_probability=1 / len(candidates),
            feature_snapshot=snapshot(db, user, quest, now),
            decision_context={
                "simulated": True,
                "seed": seed,
                "persona": persona.name,
                "completion_probability": probability,
                "candidate_ids": [candidate.id for candidate in candidates],
            },
        )
        db.add(impression)
        stats[persona.name]["impressions"] += 1
        if rng.random() < probability:
            assignment = UserQuest(
                user_id=user_id,
                quest_id=quest.id,
                status="AVAILABLE",
                started_at=now,
            )
            db.add(assignment)
            db.flush()
            impression.assignment_id = assignment.id
            completed_at = now + timedelta(minutes=rng.randint(15, 8 * 60))
            heapq.heappush(
                events, (completed_at, COMPLETE, next(sequence), user_id, assignment.id)
            )
            stats[persona.name]["completed"] += 1
        else:
            stats[persona.name]["skipped"] += 1
        db.flush()

    for row in stats.values():
        row["completion_rate"] = (
            row["completed"] / row["impressions"] if row["impressions"] else None
        )
    return {
        "seed": seed,
        "users": len(users),
        "days": days,
        "impressions": sum(row["impressions"] for row in stats.values()),
        "completed": sum(row["completed"] for row in stats.values()),
        "skipped": sum(row["skipped"] for row in stats.values()),
        "unavailable": sum(row["unavailable"] for row in stats.values()),
        "by_persona": stats,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--start-date", type=date.fromisoformat, required=True)
    parser.add_argument("--days", type=int, default=30)
    parser.add_argument("--users-per-persona", type=int, default=10)
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()
    if args.days < 4 or args.users_per_persona < 1:
        parser.error("use at least 4 days and a positive users-per-persona value")
    output = args.output.absolute()
    try:
        output.touch(exist_ok=False)
    except OSError as exc:
        parser.error(f"cannot create a new database: {exc}")

    url = URL.create("sqlite", database=str(output))
    engine = create_engine(url)

    @event.listens_for(engine, "connect")
    def foreign_keys(connection, _):
        connection.execute("PRAGMA foreign_keys=ON")

    try:
        Base.metadata.create_all(engine)
        with Session(engine) as db, db.begin():
            db.add_all(Quest(title=title, category=category, points=points)
                       for title, category, points in CATALOG)
            db.flush()
            summary = simulate(
                db, start_date=args.start_date, days=args.days,
                users_per_persona=args.users_per_persona, seed=args.seed,
            )
    finally:
        engine.dispose()

    start_at = datetime.combine(args.start_date, time())
    validation_start = start_at + timedelta(days=int(args.days * 0.7))
    as_of = start_at + timedelta(days=args.days + 1)
    summary.update({
        "database": str(output),
        "validation_start": validation_start.isoformat(),
        "as_of": as_of.isoformat(),
    })
    print(json.dumps(summary, indent=2, sort_keys=True))
    print("\nTrain on this synthetic history (from backend/):")
    print(
        f"DATABASE_URL={shlex.quote(str(url))} "
        f"{shlex.quote(sys.executable)} -m app.recommender.train "
        f"--validation-start {validation_start.isoformat()} --as-of {as_of.isoformat()} "
        "--output app/recommender/artifacts/synthetic-001"
    )


if __name__ == "__main__":
    main()
