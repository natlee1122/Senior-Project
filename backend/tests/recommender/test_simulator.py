from datetime import date, datetime, timedelta
import json
import subprocess
import sys

import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from app.models import Quest, User, UserQuest
from app.models.base import Base
from app.recommender.features import NUMERIC_FEATURES
from app.recommender.model_io import load_bundle, score
from app.recommender.models import RecommendationImpression
from app.recommender.simulator import (
    CATALOG, PERSONAS, _eligible_quests, completion_probability, simulate,
)
from app.recommender.train import _partition_rows, fit_bundle


@pytest.fixture
def catalog(db):
    db.add_all(Quest(title=title, category=category, points=points)
               for title, category, points in CATALOG)
    db.flush()
    return db


def _run(seed):
    engine = create_engine("sqlite://")
    try:
        Base.metadata.create_all(engine)
        with Session(engine) as db:
            db.add_all(Quest(title=title, category=category, points=points)
                       for title, category, points in CATALOG)
            db.flush()
            summary = simulate(
                db, start_date=date(2026, 9, 1), days=10,
                users_per_persona=2, seed=seed,
            )
            history = []
            for row in db.scalars(select(RecommendationImpression).order_by(
                RecommendationImpression.id
            )):
                assignment = db.get(UserQuest, row.assignment_id) if row.assignment_id else None
                history.append((
                    row.user_id, row.quest_id, row.recommended_at, row.shown_at,
                    row.selection_probability, row.feature_snapshot, row.decision_context,
                    assignment.status if assignment else None,
                    assignment.ended_at if assignment else None,
                ))
            return summary, history
    finally:
        engine.dispose()


def test_same_seed_repeats_the_full_history():
    assert _run(42) == _run(42)
    assert _run(42) != _run(43)


def test_persona_preferences_change_completion_probability():
    student, outdoor, balanced = PERSONAS
    assert completion_probability(student, "Study", 19) > completion_probability(
        student, "Exercise", 19
    )
    assert completion_probability(outdoor, "Exercise", 9) > completion_probability(
        outdoor, "Study", 9
    )
    assert completion_probability(student, "Study", 19) > completion_probability(
        student, "Study", 9
    )
    assert completion_probability(balanced, "Study", 12) == completion_probability(
        balanced, "Exercise", 12
    )


def test_history_has_valid_links_and_uses_only_past_outcomes(catalog):
    db = catalog
    summary = simulate(
        db, start_date=date(2026, 9, 1), days=20, users_per_persona=3,
    )
    rows = list(db.scalars(select(RecommendationImpression)))
    assignments = list(db.scalars(select(UserQuest)))
    quests = {q.id: q for q in db.scalars(select(Quest))}

    assert summary["users"] == 9
    assert summary["impressions"] + summary["unavailable"] == 180
    assert summary["completed"] + summary["skipped"] == len(rows)
    assert len(assignments) == summary["completed"] > 0
    assert summary["skipped"] > 0
    linked = set()
    for row in rows:
        assert row.recommended_at == row.shown_at
        assert row.decision_context["simulated"] is True
        assert row.quest_id in row.decision_context["candidate_ids"]
        assert row.selection_probability == pytest.approx(
            1 / len(row.decision_context["candidate_ids"])
        )
        assert set(row.feature_snapshot) == set(NUMERIC_FEATURES) | {"category"}
        past = [a for a in assignments if a.user_id == row.user_id and a.ended_at <= row.shown_at]
        assert row.feature_snapshot["completed_count"] == len(past)
        assert row.feature_snapshot["user_points"] == sum(quests[a.quest_id].points for a in past)
        assert row.feature_snapshot["category_completed_count"] == sum(
            quests[a.quest_id].category == quests[row.quest_id].category for a in past
        )
        blocked = {
            a.quest_id for a in assignments
            if a.user_id == row.user_id and a.started_at < row.shown_at
            and a.ended_at > row.shown_at - timedelta(hours=24)
        }
        assert not blocked.intersection(row.decision_context["candidate_ids"])
        if row.assignment_id is not None:
            assignment = db.get(UserQuest, row.assignment_id)
            assert assignment.user_id == row.user_id
            assert assignment.quest_id == row.quest_id
            assert assignment.status == "COMPLETED"
            assert row.shown_at <= assignment.ended_at <= row.shown_at + timedelta(hours=24)
            assert assignment.id not in linked
            linked.add(assignment.id)

    for user in db.scalars(select(User)):
        assert user.points == sum(
            quests[a.quest_id].points for a in assignments if a.user_id == user.id
        )


def test_eligibility_respects_pending_cooldown_and_catalog_windows(db, user, now):
    quests = [
        Quest(title="Available", category="Study", points=10),
        Quest(title="Pending", category="Study", points=10),
        Quest(title="Recent", category="Study", points=10),
        Quest(title="At boundary", category="Study", points=10),
        Quest(title="Future", category="Study", points=10, time_start=now + timedelta(hours=1)),
        Quest(title="Expired", category="Study", points=10, time_end=now),
    ]
    db.add_all(quests)
    db.flush()
    db.add_all([
        UserQuest(user_id=user.id, quest_id=quests[1].id, status="AVAILABLE"),
        UserQuest(user_id=user.id, quest_id=quests[2].id, status="COMPLETED",
                  ended_at=now - timedelta(hours=23)),
        UserQuest(user_id=user.id, quest_id=quests[3].id, status="COMPLETED",
                  ended_at=now - timedelta(hours=24)),
    ])
    assert [q.id for q in _eligible_quests(db, user.id, now)] == [quests[0].id, quests[3].id]


def test_generated_history_trains_and_loads_with_the_existing_pipeline(catalog, tmp_path):
    db = catalog
    simulate(db, start_date=date(2026, 9, 1), days=12, users_per_persona=3)
    validation_start = datetime(2026, 9, 9)
    as_of = datetime(2026, 9, 14)
    train, validation = _partition_rows(db, validation_start=validation_start, as_of=as_of)
    assert {row.label for row in train} == {0, 1}
    assert {row.label for row in validation} == {0, 1}
    assert all(row.shown_at + timedelta(hours=24) < validation_start for row in train)
    assert all(validation_start <= row.shown_at <= as_of - timedelta(hours=24)
               for row in validation)
    output = tmp_path / "bundle"
    metadata = fit_bundle(db, validation_start=validation_start, as_of=as_of, output=output)
    bundle = load_bundle(output)
    predictions = score(bundle, [row.snapshot for row in validation])
    assert metadata["metrics"]["train_rows"] == len(train)
    assert len(predictions) == len(validation)
    assert all(0 <= value <= 1 for value in predictions)


def test_cli_creates_a_standalone_database_and_refuses_overwrite(tmp_path):
    output = tmp_path / "history.db"
    command = [
        sys.executable, "-m", "app.recommender.simulator",
        "--output", str(output), "--start-date", "2026-09-01",
        "--days", "4", "--users-per-persona", "1",
    ]
    result = subprocess.run(command, capture_output=True, text=True)
    assert result.returncode == 0, result.stderr
    summary = json.loads(result.stdout.split("\nTrain on", 1)[0])
    assert summary["users"] == 3
    assert summary["impressions"] == 12
    assert summary["as_of"] == "2026-09-06T00:00:00"
    assert "DATABASE_URL=sqlite:///" in result.stdout
    before = output.read_bytes()
    retry = subprocess.run(command, capture_output=True, text=True)
    assert retry.returncode != 0
    assert "cannot create a new database" in retry.stderr
    assert output.read_bytes() == before


def test_simulator_rejects_invalid_sizes_and_repeated_cohorts(db, quest):
    with pytest.raises(ValueError, match="positive"):
        simulate(db, start_date=date(2026, 9, 1), days=0)
    with pytest.raises(ValueError, match="positive"):
        simulate(db, start_date=date(2026, 9, 1), users_per_persona=0)
    simulate(db, start_date=date(2026, 9, 1), days=1, users_per_persona=1)
    with pytest.raises(ValueError, match="already exist"):
        simulate(db, start_date=date(2026, 9, 1), days=1, users_per_persona=1)


def test_simulator_rejects_a_missing_catalog(db):
    with pytest.raises(ValueError, match="catalog is empty"):
        simulate(db, start_date=date(2026, 9, 1))
