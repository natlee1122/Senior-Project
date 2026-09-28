from datetime import datetime, timedelta

import pytest
from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from app.models import Quest, User
from app.models.base import Base


@pytest.fixture
def now():
    return datetime(2026, 9, 28, 12)


@pytest.fixture
def db():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)

    @event.listens_for(engine, "connect")
    def foreign_keys(connection, _):
        connection.execute("PRAGMA foreign_keys=ON")

    Base.metadata.create_all(engine)
    with Session(engine, expire_on_commit=False) as session:
        yield session
    engine.dispose()


@pytest.fixture
def user(db, now):
    user = User(username="reader", points=25, created_at=now - timedelta(days=2))
    db.add(user)
    db.commit()
    return user


@pytest.fixture
def quest(db):
    quest = Quest(title="Walk", category="Exercise", points=50)
    db.add(quest)
    db.commit()
    return quest


@pytest.fixture
def trained_bundle(db, user, quest, now, tmp_path, monkeypatch):
    from app.models import UserQuest
    from app.recommender.features import snapshot
    from app.recommender.models import RecommendationImpression
    from app.recommender.train import fit_bundle
    from app.recommender import model_io

    for days, completed in [(6, True), (5, False), (3, True), (2, False)]:
        shown = now - timedelta(days=days)
        assignment_id = None
        if completed:
            assignment = UserQuest(user_id=user.id, quest_id=quest.id, status="COMPLETED",
                                   ended_at=shown + timedelta(hours=1))
            db.add(assignment)
            db.flush()
            assignment_id = assignment.id
        db.add(RecommendationImpression(
            user_id=user.id, quest_id=quest.id, assignment_id=assignment_id,
            recommended_at=shown, shown_at=shown, recommender="rule-based",
            model_version="rules-v1", policy_version="uniform-v1", selection_probability=1,
            feature_snapshot=snapshot(db, user, quest, shown), decision_context={},
        ))
    db.commit()
    output = tmp_path / "bundle"
    fit_bundle(db, validation_start=now-timedelta(days=3), as_of=now, output=output)
    monkeypatch.setattr(model_io, "DEFAULT_BUNDLE_PATH", output)
    model_io.get_bundle.cache_clear()
    yield output
    model_io.get_bundle.cache_clear()
