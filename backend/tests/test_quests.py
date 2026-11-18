import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db import get_db
from app.main import app
from app.models.base import Base


@pytest.fixture
def client():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    factory = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)

    def override_get_db():
        db = factory()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
    engine.dispose()


def test_quest_lifecycle_matches_frontend_shape(client):
    token = client.post(
        "/api/auth/register",
        json={
            "email": "quester@example.com",
            "password": "secret123",
            "firstName": "Quest",
        },
    ).json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    created = client.post(
        "/api/quests",
        headers=headers,
        json={
            "title": "Read outside",
            "category": "Explore",
            "description": "Read for ten minutes in the sun.",
            "duration": "10 min",
            "difficulty": "Medium",
        },
    )
    assert created.status_code == 201
    quest = created.json()
    assert quest["xp"] == 20
    assert quest["coins"] == 10
    assert quest["theme"] == "camera"
    assert quest["photoOptional"] is False

    updated = client.patch(
        f"/api/quests/{quest['id']}",
        headers=headers,
        json={"title": "Read outdoors", "difficulty": "Hard"},
    )
    assert updated.status_code == 200
    assert updated.json()["title"] == "Read outdoors"
    assert updated.json()["xp"] == 30

    completed = client.post(f"/api/quests/{quest['id']}/complete", headers=headers)
    assert completed.status_code == 200
    assert completed.json()["alreadyCompleted"] is False
    assert completed.json()["quest"]["id"] == quest["id"]

    repeated = client.post(f"/api/quests/{quest['id']}/complete", headers=headers)
    assert repeated.status_code == 200
    assert repeated.json()["alreadyCompleted"] is True
    today = client.get("/api/quests/today-completions", headers=headers)
    assert today.status_code == 200
    assert str(quest["id"]) in today.json()

    deleted = client.delete(f"/api/quests/{quest['id']}", headers=headers)
    assert deleted.status_code == 204
    assert client.get("/api/quests").json() == []
