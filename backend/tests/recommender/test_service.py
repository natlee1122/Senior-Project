import random
from datetime import timedelta

import pytest

from app.models import Quest, User, UserQuest
from app.recommender.models import RecommendationImpression
from app.recommender.service import recommend, confirm_shown, link_assignment


def test_candidates_are_user_scoped_and_completed_quests_have_cooldown(db, user, quest, now):
    other = User(username="other")
    db.add(other)
    db.flush()
    db.add(UserQuest(user_id=other.id, quest_id=quest.id, status="AVAILABLE"))
    db.commit()
    decision = recommend(db, user.id, now=now, rng=random.Random(1))
    assert decision.quest_id == quest.id
    record = db.get(RecommendationImpression, decision.impression_id)
    assert record.shown_at is None
    assert record.selection_probability == 1.0
    assert decision.assignment_id == 0
    assignment = UserQuest(user_id=user.id, quest_id=quest.id, status="AVAILABLE")
    db.add(assignment)
    db.commit()
    with pytest.raises(LookupError):
        recommend(db, user.id, now=now, rng=random.Random(1))
    assignment.status = "COMPLETED"
    assignment.ended_at = now - timedelta(hours=23)
    db.commit()
    with pytest.raises(LookupError):
        recommend(db, user.id, now=now, rng=random.Random(1))
    assignment.ended_at = now - timedelta(hours=24)
    db.commit()
    assert recommend(db, user.id, now=now, rng=random.Random(1)).quest_id == quest.id


def test_display_and_assignment_link_are_idempotent_and_validate_identity(db, user, quest, now):
    decision = recommend(db, user.id, now=now, rng=random.Random(1))
    assignment = UserQuest(user_id=user.id, quest_id=quest.id, status="AVAILABLE")
    other = User(username="other")
    db.add_all([assignment, other])
    db.commit()
    with pytest.raises(ValueError):
        link_assignment(db, decision.impression_id, user.id, assignment.id)
    with pytest.raises(LookupError):
        confirm_shown(db, decision.impression_id, other.id, now=now)
    confirm_shown(db, decision.impression_id, user.id, now=now)
    confirm_shown(db, decision.impression_id, user.id, now=now+timedelta(hours=1))
    assert db.get(RecommendationImpression, decision.impression_id).shown_at == now
    wrong = UserQuest(user_id=other.id, quest_id=quest.id, status="AVAILABLE")
    db.add(wrong)
    db.commit()
    with pytest.raises(LookupError):
        link_assignment(db, decision.impression_id, user.id, wrong.id)
    link_assignment(db, decision.impression_id, user.id, assignment.id)
    assignment.status = "COMPLETED"
    assignment.ended_at = now
    db.commit()
    link_assignment(db, decision.impression_id, user.id, assignment.id)
    assert db.get(RecommendationImpression, decision.impression_id).assignment_id == assignment.id


def test_availability_and_unknown_user(db, user, quest, now):
    quest.time_start = now + timedelta(hours=1)
    db.commit()
    with pytest.raises(LookupError):
        recommend(db, user.id, now=now, rng=random.Random(1))
    quest.time_start = None
    quest.time_end = now
    db.commit()
    with pytest.raises(LookupError):
        recommend(db, user.id, now=now, rng=random.Random(1))
    with pytest.raises(LookupError):
        recommend(db, 999, now=now, rng=random.Random(1))


def test_loaded_model_applies_recent_quest_penalty_and_logs_decision(db, user, quest, now, trained_bundle):
    study = Quest(title="Study", category="Study", points=50)
    db.add(study)
    db.add(RecommendationImpression(
        user_id=user.id, quest_id=quest.id, recommended_at=now-timedelta(hours=1),
        shown_at=now-timedelta(hours=1), recommender="rule-based", model_version="rules-v1",
        policy_version="uniform-v1", selection_probability=1, feature_snapshot={"category":"Exercise"},
        decision_context={},
    ))
    db.commit()
    decision = recommend(db, user.id, now=now, rng=random.Random(1))
    assert decision.recommender == "xgboost"
    assert decision.quest_id == study.id
    record = db.get(RecommendationImpression, decision.impression_id)
    assert record.selection_probability == pytest.approx(.9)
    assert record.policy_version == "epsilon-v1"
    assert record.decision_context["branch"] == "greedy"
    assert record.decision_context["raw_scores"][str(quest.id)] == pytest.approx(.5)
    assert record.decision_context["adjusted_scores"][str(quest.id)] == pytest.approx(.3)
