import json
from datetime import timedelta

import pytest
from sklearn.metrics import log_loss

from app.models import UserQuest
from app.recommender.features import FEATURE_VERSION, NUMERIC_FEATURES
from app.recommender.model_io import ARTIFACT_SCHEMA_VERSION, get_bundle, load_bundle, score
from app.recommender.models import RecommendationImpression
from app.recommender.train import _partition_rows, fit_bundle


def _snapshot(category="Exercise", quest_points=50):
    return {
        "category": category,
        "quest_points": quest_points,
        "user_points": 25,
        "account_age_days": 2,
        "completed_count": 0,
        "category_completed_count": 0,
        "hour_utc": 12,
        "weekday_utc": 0,
    }


def _write_bundle(path, *, categories=("Exercise",), **overrides):
    metadata = {
        "artifact_schema_version": ARTIFACT_SCHEMA_VERSION,
        "model_version": "test-v1",
        "feature_version": FEATURE_VERSION,
        "numeric_features": NUMERIC_FEATURES,
        "categories": list(categories),
        "label_version": "completion-within-24-hours-v1",
        "label_window_hours": 24,
        "feature_count": len(NUMERIC_FEATURES) + len(categories),
    }
    metadata.update(overrides)
    path.mkdir()
    path.joinpath("metadata.json").write_text(json.dumps(metadata))
    path.joinpath("model.json").write_text("{}")


def _impression(db, user, quest, shown_at, *, ended_at=None, shown=True, category="Exercise"):
    assignment = None
    if ended_at is not None:
        assignment = UserQuest(
            user_id=user.id,
            quest_id=quest.id,
            status="COMPLETED",
            ended_at=ended_at,
        )
        db.add(assignment)
        db.flush()
    row = RecommendationImpression(
        user_id=user.id,
        quest_id=quest.id,
        assignment_id=assignment.id if assignment else None,
        recommended_at=shown_at,
        shown_at=shown_at if shown else None,
        recommender="rule-based",
        model_version="rules-v1",
        policy_version="uniform-v1",
        selection_probability=1.0,
        feature_snapshot=_snapshot(category),
        decision_context={},
    )
    db.add(row)
    return row


def test_partition_rows_obeys_display_maturity_attribution_and_gap(db, user, quest, now):
    validation_start = now
    train_shown = now - timedelta(hours=25)
    _impression(db, user, quest, train_shown, ended_at=train_shown - timedelta(seconds=1))
    _impression(db, user, quest, train_shown, ended_at=train_shown)
    _impression(db, user, quest, train_shown, ended_at=train_shown + timedelta(hours=24))
    _impression(db, user, quest, train_shown, ended_at=train_shown + timedelta(hours=24, seconds=1))
    _impression(db, user, quest, now - timedelta(hours=24), shown=False)
    _impression(db, user, quest, now - timedelta(hours=24))  # deadline equals split
    _impression(db, user, quest, now - timedelta(hours=23))  # chronological label gap
    _impression(db, user, quest, now, ended_at=now + timedelta(hours=2))
    _impression(db, user, quest, now + timedelta(hours=1))  # immature validation row
    db.commit()

    train, validation = _partition_rows(
        db, validation_start=validation_start, as_of=now + timedelta(hours=24)
    )

    assert [row.label for row in train] == [0, 1, 1, 0]
    assert [row.label for row in validation] == [1]


def test_fit_refuses_one_class_without_creating_output(db, user, quest, now, tmp_path):
    train_shown = now - timedelta(days=2)
    _impression(db, user, quest, train_shown)
    _impression(db, user, quest, now)
    db.commit()
    output = tmp_path / "rejected"

    with pytest.raises(ValueError, match="both classes"):
        fit_bundle(
            db,
            validation_start=now,
            as_of=now + timedelta(days=1),
            output=output,
        )

    assert not output.exists()


def test_real_fit_save_load_scores_unknown_category(db, user, quest, now, tmp_path):
    train_shown = now - timedelta(days=3)
    _impression(db, user, quest, train_shown, ended_at=train_shown + timedelta(hours=1))
    _impression(db, user, quest, train_shown + timedelta(hours=1))
    _impression(db, user, quest, now, ended_at=now + timedelta(hours=1))
    _impression(db, user, quest, now + timedelta(hours=1), category="Study")
    db.commit()
    output = tmp_path / "bundle"

    metadata = fit_bundle(
        db,
        validation_start=now,
        as_of=now + timedelta(days=1, hours=1),
        output=output,
    )
    bundle = load_bundle(output)
    predictions = score(bundle, [_snapshot("Exercise"), _snapshot("Unknown")])

    assert metadata["feature_version"] == FEATURE_VERSION
    assert metadata["numeric_features"] == NUMERIC_FEATURES
    assert metadata["categories"] == ["Exercise"]
    assert metadata["label_window_hours"] == 24
    assert metadata["metrics"]["train_rows"] == 2
    assert metadata["metrics"]["validation_rows"] == 2
    assert set(metadata["library_versions"]) == {"xgboost", "scikit-learn"}
    assert output.joinpath("model.json").is_file()
    assert output.joinpath("metadata.json").is_file()
    assert bundle.metadata == metadata
    assert len(predictions) == 2
    assert all(0.0 <= value <= 1.0 for value in predictions)
    assert log_loss([1, 0], predictions, labels=[0, 1]) == pytest.approx(
        metadata["metrics"]["validation_log_loss"]
    )


def test_load_bundle_rejects_absent_corrupt_and_incompatible_artifacts(tmp_path):
    with pytest.raises(FileNotFoundError):
        load_bundle(tmp_path / "missing")

    corrupt = tmp_path / "corrupt"
    corrupt.mkdir()
    corrupt.joinpath("metadata.json").write_text("not json")
    corrupt.joinpath("model.json").write_text("{}")
    with pytest.raises(ValueError, match="metadata"):
        load_bundle(corrupt)

    incompatible = tmp_path / "incompatible"
    _write_bundle(
        incompatible,
        categories=(),
        model_version="bad-v1",
        feature_version=FEATURE_VERSION + 1,
    )
    with pytest.raises(ValueError, match="feature version"):
        load_bundle(incompatible)


@pytest.mark.parametrize(
    ("field", "value", "message"),
    [
        ("label_version", "other-label", "label version"),
        ("label_window_hours", 12, "label window"),
        ("feature_count", len(NUMERIC_FEATURES) + 2, "feature count"),
    ],
)
def test_load_bundle_rejects_incompatible_label_and_feature_contract(
    tmp_path, field, value, message
):
    path = tmp_path / field
    _write_bundle(path, **{field: value})

    with pytest.raises(ValueError, match=message):
        load_bundle(path)


def test_load_bundle_does_not_hide_programming_errors(monkeypatch, tmp_path):
    from xgboost import XGBClassifier

    path = tmp_path / "programming-error"
    _write_bundle(path, categories=())

    def raise_programming_error(*_):
        raise RuntimeError("bug")

    monkeypatch.setattr(XGBClassifier, "load_model", raise_programming_error)

    with pytest.raises(RuntimeError, match="bug"):
        load_bundle(path)


def test_load_bundle_rejects_model_with_wrong_feature_count(tmp_path):
    from xgboost import XGBClassifier

    path = tmp_path / "wrong-model-shape"
    _write_bundle(path)
    model = XGBClassifier(n_estimators=1, n_jobs=1)
    model.fit([[0.0] * len(NUMERIC_FEATURES), [1.0] * len(NUMERIC_FEATURES)], [0, 1])
    model.save_model(path / "model.json")

    with pytest.raises(ValueError, match="feature count"):
        load_bundle(path)


def test_get_bundle_caches_rule_fallback_for_missing_default(monkeypatch, tmp_path):
    import app.recommender.model_io as model_io

    monkeypatch.setattr(model_io, "DEFAULT_BUNDLE_PATH", tmp_path / "missing")
    get_bundle.cache_clear()
    try:
        assert get_bundle() is None
        assert get_bundle() is None
        assert get_bundle.cache_info().misses == 1
        assert get_bundle.cache_info().hits == 1
    finally:
        get_bundle.cache_clear()
