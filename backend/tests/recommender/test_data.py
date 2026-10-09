from datetime import timedelta

import pytest
from sqlalchemy.exc import IntegrityError

from app.models import UserQuest
from app.recommender.features import encode, snapshot
from app.recommender.models import RecommendationImpression


def impression(user, quest, now, **extra):
    values = dict(user_id=user.id, quest_id=quest.id, recommended_at=now,
                  recommender="rule-based", model_version="rules-v1", policy_version="uniform-v1",
                  selection_probability=1.0, feature_snapshot={}, decision_context={})
    values.update(extra)
    return RecommendationImpression(**values)


def test_snapshot_uses_only_past_completions_and_survives_user_changes(db, user, quest, now):
    db.add_all([
        UserQuest(user_id=user.id, quest_id=quest.id, status="COMPLETED", ended_at=now-timedelta(days=1)),
        UserQuest(user_id=user.id, quest_id=quest.id, status="COMPLETED", ended_at=now+timedelta(days=1)),
    ])
    db.commit()
    values = snapshot(db, user, quest, now)
    assert values == dict(category="Exercise", quest_points=50, user_points=25,
                          account_age_days=2.0, completed_count=1, category_completed_count=1,
                          hour_utc=12, weekday_utc=0)
    record = impression(user, quest, now, feature_snapshot=values)
    db.add(record)
    db.commit()
    user.points = 999
    db.commit()
    db.refresh(record)
    assert record.feature_snapshot["user_points"] == 25
    assert record.shown_at is None
    assert encode([values], ["Exercise", "Study"]) == [[50, 25, 2.0, 1, 1, 12, 0, 1.0, 0.0]]
    values["category"] = "Unknown"
    assert encode([values], ["Exercise", "Study"])[0][-2:] == [0.0, 0.0]


def test_one_assignment_cannot_label_two_impressions(db, user, quest, now):
    assignment = UserQuest(user_id=user.id, quest_id=quest.id, status="AVAILABLE")
    db.add(assignment)
    db.flush()
    db.add_all([impression(user, quest, now, assignment_id=assignment.id),
                impression(user, quest, now, assignment_id=assignment.id)])
    with pytest.raises(IntegrityError):
        db.commit()
    db.rollback()
