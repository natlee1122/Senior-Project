from __future__ import annotations

import json
import logging
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Any, Optional

from app.recommender.features import FEATURE_VERSION, NUMERIC_FEATURES, encode

logger = logging.getLogger(__name__)

DEFAULT_BUNDLE_PATH = Path(__file__).parent / "artifacts" / "current"
ARTIFACT_SCHEMA_VERSION = 1
LABEL_VERSION = "completion-within-24-hours-v1"
LABEL_WINDOW_HOURS = 24


@dataclass
class ModelBundle:
    model: Any
    metadata: dict


def _read_metadata(path: Path) -> dict:
    try:
        metadata = json.loads(path.read_text())
    except json.JSONDecodeError as exc:
        raise ValueError(f"invalid bundle metadata: {exc}") from exc
    if not isinstance(metadata, dict):
        raise ValueError("invalid bundle metadata: expected an object")
    return metadata


def _validate_metadata(metadata: dict) -> None:
    if metadata.get("artifact_schema_version") != ARTIFACT_SCHEMA_VERSION:
        raise ValueError("incompatible artifact schema version")
    if metadata.get("feature_version") != FEATURE_VERSION:
        raise ValueError("incompatible feature version")
    if metadata.get("numeric_features") != NUMERIC_FEATURES:
        raise ValueError("incompatible numeric feature order")
    categories = metadata.get("categories")
    if (
        not isinstance(categories, list)
        or any(not isinstance(category, str) for category in categories)
        or len(categories) != len(set(categories))
    ):
        raise ValueError("invalid category vocabulary")
    if not isinstance(metadata.get("model_version"), str) or not metadata["model_version"]:
        raise ValueError("invalid model version")
    if metadata.get("label_version") != LABEL_VERSION:
        raise ValueError("incompatible label version")
    if metadata.get("label_window_hours") != LABEL_WINDOW_HOURS:
        raise ValueError("incompatible label window")
    expected_feature_count = len(NUMERIC_FEATURES) + len(categories)
    if metadata.get("feature_count") != expected_feature_count:
        raise ValueError("incompatible feature count")


def load_bundle(path: Path) -> ModelBundle:
    metadata_path = path / "metadata.json"
    model_path = path / "model.json"
    if not metadata_path.is_file():
        raise FileNotFoundError(metadata_path)
    if not model_path.is_file():
        raise FileNotFoundError(model_path)

    metadata = _read_metadata(metadata_path)
    _validate_metadata(metadata)

    from xgboost import XGBClassifier
    from xgboost.core import XGBoostError

    model = XGBClassifier()
    try:
        model.load_model(model_path)
    except (XGBoostError, ValueError) as exc:
        raise ValueError(f"invalid model artifact: {exc}") from exc
    if model.n_features_in_ != metadata["feature_count"]:
        raise ValueError("incompatible model feature count")
    return ModelBundle(model=model, metadata=metadata)


def score(bundle: ModelBundle, snapshots: list[dict]) -> list[float]:
    if not snapshots:
        return []
    rows = encode(snapshots, bundle.metadata["categories"])
    return [float(value) for value in bundle.model.predict_proba(rows)[:, 1]]


@lru_cache(maxsize=1)
def get_bundle() -> Optional[ModelBundle]:
    try:
        return load_bundle(DEFAULT_BUNDLE_PATH)
    except (FileNotFoundError, ImportError, ValueError) as exc:
        logger.warning("recommendation model unavailable; using rule fallback: %s", exc)
        return None
