from datetime import datetime, timedelta
import random

from sqlalchemy import or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.assignment import UserQuest
from app.models.quest import Quest
from app.models.user import User
from app.recommender import model_io
from app.recommender.features import snapshot
from app.recommender.models import RecommendationImpression
from app.recommender.policy import choose
from app.recommender.schemas import RecommendationRead


def recommend(db: Session, user_id: int, *, now: datetime, rng: random.Random) -> RecommendationRead:
    user = db.get(User, user_id)
    if user is None:
        raise LookupError("User not found")
    unavailable = select(UserQuest.id).where(
        UserQuest.user_id == user_id,
        UserQuest.quest_id == Quest.id,
        or_(UserQuest.status != "COMPLETED", UserQuest.ended_at.is_(None),
            UserQuest.ended_at > now - timedelta(hours=24)),
    ).exists()
    candidates = list(db.scalars(select(Quest).where(
        ~unavailable,
        or_(Quest.time_start.is_(None), Quest.time_start <= now),
        or_(Quest.time_end.is_(None), Quest.time_end > now),
    ).order_by(Quest.id)))
    if not candidates:
        raise LookupError("No quest available")
    bundle = model_io.get_bundle()
    if bundle is None:
        quest = rng.choice(candidates)
        values = snapshot(db, user, quest, now)
        recommender, model_version, policy_version = "rule-based", "rules-v1", "uniform-v1"
        probability = 1 / len(candidates)
        context = {"branch": "uniform", "raw_scores": {}, "adjusted_scores": {}}
    else:
        snapshots = [snapshot(db, user, candidate, now) for candidate in candidates]
        scores = dict(zip([q.id for q in candidates], model_io.score(bundle, snapshots)))
        recent = list(db.scalars(select(RecommendationImpression).where(
            RecommendationImpression.user_id == user_id,
            RecommendationImpression.shown_at >= now - timedelta(hours=24),
            RecommendationImpression.shown_at <= now,
        )))
        selection = choose(
            scores, {row.quest_id for row in recent},
            {row.feature_snapshot["category"] for row in recent},
            {q.id: q.category for q in candidates}, rng=rng,
        )
        index = next(i for i, q in enumerate(candidates) if q.id == selection.quest_id)
        quest, values = candidates[index], snapshots[index]
        recommender, model_version, policy_version = (
            "xgboost", bundle.metadata["model_version"], "epsilon-v1"
        )
        probability = selection.selection_probability
        context = {"branch": selection.branch, "raw_scores": selection.raw_scores,
                   "adjusted_scores": selection.adjusted_scores,
                   "epsilon": 0.2, "quest_penalty": 0.15, "category_penalty": 0.05}
    context["candidate_ids"] = [q.id for q in candidates]
    record = RecommendationImpression(
        user_id=user_id, quest_id=quest.id, recommended_at=now,
        recommender=recommender, model_version=model_version, policy_version=policy_version,
        selection_probability=probability, feature_snapshot=values, decision_context=context,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return RecommendationRead(assignment_id=0, quest_id=quest.id,
                              recommender=record.recommender, model_version=record.model_version,
                              impression_id=record.id)


def _owned_impression(db: Session, impression_id: int, user_id: int) -> RecommendationImpression:
    record = db.get(RecommendationImpression, impression_id)
    if record is None or record.user_id != user_id:
        raise LookupError("Impression not found")
    return record


def confirm_shown(db: Session, impression_id: int, user_id: int, *, now: datetime) -> None:
    record = _owned_impression(db, impression_id, user_id)
    if record.shown_at is None:
        record.shown_at = now
        db.commit()


def link_assignment(db: Session, impression_id: int, user_id: int, assignment_id: int) -> None:
    record = _owned_impression(db, impression_id, user_id)
    assignment = db.get(UserQuest, assignment_id)
    if assignment is None or assignment.user_id != user_id or assignment.quest_id != record.quest_id:
        raise LookupError("Assignment not found")
    if record.assignment_id == assignment_id:
        return
    if record.assignment_id is not None or record.shown_at is None:
        raise ValueError("Confirm display before linking one assignment")
    if assignment.status != "AVAILABLE":
        raise ValueError("Assignment must be available")
    record.assignment_id = assignment_id
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise ValueError("Assignment already linked") from exc
