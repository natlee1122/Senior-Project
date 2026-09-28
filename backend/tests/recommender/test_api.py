from datetime import timedelta
import subprocess
import sys

from fastapi.testclient import TestClient

from app.db import get_db
from app.main import app
from app.models import UserQuest
from app.recommender.models import RecommendationImpression


def test_recommend_display_assign_link_complete(db, user, quest):
    def database():
        yield db
    app.dependency_overrides[get_db] = database
    try:
        with TestClient(app) as client:
            response = client.get(f"/api/recommendations/{user.id}")
            assert response.status_code == 200
            result = response.json()
            assert {"assignment_id", "quest_id", "recommender", "model_version", "impression_id"} <= result.keys()
            assert result["assignment_id"] == 0
            record = db.get(RecommendationImpression, result["impression_id"])
            assert record.shown_at is None
            prefix = f"/api/recommendations/impressions/{record.id}"
            assert client.post(prefix + "/shown", json={"user_id": 999}).status_code == 404
            assert client.post(prefix + "/shown", json={"user_id": user.id}).status_code == 204
            shown_at = record.shown_at
            assert client.post(prefix + "/shown", json={"user_id": user.id}).status_code == 204
            assert record.shown_at == shown_at
            response = client.post(f"/api/quests/{quest.id}/assign/{user.id}")
            assert response.status_code == 201
            assignment_id = response.json()["id"]
            link = {"user_id": user.id, "assignment_id": assignment_id}
            assert client.post(prefix + "/link-assignment", json=link).status_code == 204
            response = client.post(f"/api/rewards/claim/{assignment_id}")
            assert response.json() == {"points_awarded": 50}
            assert client.post(prefix + "/link-assignment", json=link).status_code == 204
            assignment = db.get(UserQuest, record.assignment_id)
            assert assignment.status == "COMPLETED"
            assert assignment.ended_at >= record.shown_at
            from app.recommender.train import _partition_rows
            _, validation = _partition_rows(
                db, validation_start=record.shown_at, as_of=record.shown_at + timedelta(hours=24)
            )
            assert [row.label for row in validation] == [1]
            assert client.get(f"/api/recommendations/{user.id}").status_code == 404
    finally:
        app.dependency_overrides.clear()


def test_base_api_imports_without_ml_dependencies(trained_bundle):
    script = '''
import builtins
import sys
from pathlib import Path
original = builtins.__import__
def without_ml(name, *args, **kwargs):
    if name.split('.')[0] in {'xgboost', 'sklearn', 'numpy'}:
        raise ImportError('Optional ML dependencies unavailable')
    return original(name, *args, **kwargs)
builtins.__import__ = without_ml
from app.main import app
from app.recommender import model_io
model_io.DEFAULT_BUNDLE_PATH = Path(sys.argv[1])
assert model_io.get_bundle() is None
assert app.title == 'Lifescape API'
'''
    result = subprocess.run([sys.executable, "-c", script, str(trained_bundle)], capture_output=True, text=True)
    assert result.returncode == 0, result.stderr
