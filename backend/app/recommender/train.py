from __future__ import annotations

import argparse
import json
from dataclasses import dataclass
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.assignment import UserQuest
from app.recommender.features import FEATURE_VERSION, NUMERIC_FEATURES, encode
from app.recommender.model_io import (
    ARTIFACT_SCHEMA_VERSION,
    LABEL_VERSION,
    LABEL_WINDOW_HOURS,
)
from app.recommender.models import RecommendationImpression

LABEL_WINDOW = timedelta(hours=LABEL_WINDOW_HOURS)


@dataclass(frozen=True)
class LabeledRow:
    snapshot: dict
    label: int
    user_id: int
    quest_id: int
    shown_at: datetime


def _label(status: Optional[str], ended_at: Optional[datetime], shown_at: datetime) -> int:
    return int(
        status == "COMPLETED"
        and ended_at is not None
        and shown_at <= ended_at <= shown_at + LABEL_WINDOW
    )


def _partition_rows(
    db: Session, *, validation_start: datetime, as_of: datetime
) -> tuple[list[LabeledRow], list[LabeledRow]]:
    records = db.execute(
        select(
            RecommendationImpression,
            UserQuest.status,
            UserQuest.ended_at,
        )
        .outerjoin(UserQuest, UserQuest.id == RecommendationImpression.assignment_id)
        .where(RecommendationImpression.shown_at.is_not(None))
        .order_by(RecommendationImpression.id)
    ).all()
    train: list[LabeledRow] = []
    validation: list[LabeledRow] = []
    for impression, status, ended_at in records:
        shown_at = impression.shown_at
        deadline = shown_at + LABEL_WINDOW
        row = LabeledRow(
            snapshot=impression.feature_snapshot,
            label=_label(status, ended_at, shown_at),
            user_id=impression.user_id,
            quest_id=impression.quest_id,
            shown_at=shown_at,
        )
        if deadline < validation_start:
            train.append(row)
        elif shown_at >= validation_start and deadline <= as_of:
            validation.append(row)
    return train, validation


def _seven_day_report(db: Session, *, as_of: datetime) -> dict:
    start = as_of - timedelta(days=7)
    impressions = db.scalars(
        select(RecommendationImpression)
        .where(
            RecommendationImpression.shown_at >= start,
            RecommendationImpression.shown_at <= as_of,
        )
        .order_by(RecommendationImpression.id)
    ).all()
    by_user: dict[str, dict] = {}
    mature_labels: list[int] = []
    for impression in impressions:
        key = str(impression.user_id)
        row = by_user.setdefault(key, {"impressions": 0, "quests": set(), "categories": set()})
        row["impressions"] += 1
        row["quests"].add(impression.quest_id)
        row["categories"].add(impression.feature_snapshot.get("category"))
        if impression.shown_at + LABEL_WINDOW <= as_of:
            status = ended_at = None
            if impression.assignment_id is not None:
                assignment = db.get(UserQuest, impression.assignment_id)
                if assignment is not None:
                    status, ended_at = assignment.status, assignment.ended_at
            mature_labels.append(_label(status, ended_at, impression.shown_at))

    users = {}
    for user_id, row in by_user.items():
        count = row["impressions"]
        unique_quests = len(row["quests"])
        users[user_id] = {
            "impressions": count,
            "unique_quests": unique_quests,
            "unique_categories": len(row["categories"]),
            "repeat_rate": (count - unique_quests) / count,
        }
    return {
        "window_days": 7,
        "users": users,
        "mature_impressions": len(mature_labels),
        "observed_completion_rate": (
            sum(mature_labels) / len(mature_labels) if mature_labels else None
        ),
    }


def fit_bundle(
    db: Session, *, validation_start: datetime, as_of: datetime, output: Path
) -> dict:
    if output.exists():
        raise FileExistsError(f"output already exists: {output}")
    train, validation = _partition_rows(
        db, validation_start=validation_start, as_of=as_of
    )
    if not train:
        raise ValueError("training partition is empty")
    if not validation:
        raise ValueError("validation partition is empty")
    train_labels = [row.label for row in train]
    if len(set(train_labels)) != 2:
        raise ValueError("training partition must contain both classes")

    from sklearn import __version__ as sklearn_version
    from sklearn.metrics import average_precision_score, log_loss
    from xgboost import XGBClassifier, __version__ as xgboost_version

    categories = sorted({row.snapshot["category"] for row in train})
    training_parameters = {
        "objective": "binary:logistic",
        "n_estimators": 50,
        "max_depth": 3,
        "learning_rate": 0.1,
        "tree_method": "hist",
        "n_jobs": 1,
        "random_state": 42,
    }
    classifier = XGBClassifier(**training_parameters)
    classifier.fit(encode([row.snapshot for row in train], categories), train_labels)

    validation_labels = [row.label for row in validation]
    validation_probabilities = classifier.predict_proba(
        encode([row.snapshot for row in validation], categories)
    )[:, 1]
    completion_rate = sum(train_labels) / len(train_labels)
    baseline_probabilities = [completion_rate] * len(validation_labels)
    metrics = {
        "train_rows": len(train),
        "validation_rows": len(validation),
        "train_completion_rate": completion_rate,
        "validation_log_loss": float(
            log_loss(validation_labels, validation_probabilities, labels=[0, 1])
        ),
        "baseline_log_loss": float(
            log_loss(validation_labels, baseline_probabilities, labels=[0, 1])
        ),
        "validation_average_precision": (
            float(average_precision_score(validation_labels, validation_probabilities))
            if len(set(validation_labels)) == 2
            else None
        ),
    }
    metadata = {
        "artifact_schema_version": ARTIFACT_SCHEMA_VERSION,
        "model_version": f"xgb-{as_of.strftime('%Y%m%dT%H%M%S')}",
        "model_type": "XGBClassifier",
        "feature_version": FEATURE_VERSION,
        "numeric_features": NUMERIC_FEATURES,
        "categories": categories,
        "feature_count": len(NUMERIC_FEATURES) + len(categories),
        "label_version": LABEL_VERSION,
        "label_window_hours": LABEL_WINDOW_HOURS,
        "training_cutoff": validation_start.isoformat(),
        "as_of": as_of.isoformat(),
        "library_versions": {
            "xgboost": xgboost_version,
            "scikit-learn": sklearn_version,
        },
        "training_parameters": training_parameters,
        "metrics": metrics,
        "seven_day_report": _seven_day_report(db, as_of=as_of),
    }

    output.mkdir(parents=True, exist_ok=False)
    classifier.save_model(output / "model.json")
    output.joinpath("metadata.json").write_text(
        json.dumps(metadata, indent=2, sort_keys=True) + "\n"
    )
    return metadata


def main() -> None:
    parser = argparse.ArgumentParser(description="Train the catalog quest recommender")
    parser.add_argument("--validation-start", type=datetime.fromisoformat, required=True)
    parser.add_argument("--as-of", type=datetime.fromisoformat, default=datetime.utcnow())
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    from app.db import SessionLocal

    with SessionLocal() as db:
        metadata = fit_bundle(
            db,
            validation_start=args.validation_start,
            as_of=args.as_of,
            output=args.output,
        )
    print(json.dumps(metadata, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
