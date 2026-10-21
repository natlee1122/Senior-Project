from datetime import datetime, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.security import create_access_token, hash_password, verify_password
from app.db import get_db
from app.main import app
from app.models import Quest, User, UserQuest
from app.models.base import Base

SIGNUP = {
    "email": "Alfred@Case.edu",
    "password": "secret123",
    "firstName": "Alfred",
    "lastName": "Chen",
    "goal": "Be more active",
    "interests": ["Exercise", "Study"],
}


@pytest.fixture
def session_factory():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    yield sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
    engine.dispose()


@pytest.fixture
def client(session_factory):
    def override_get_db():
        db = session_factory()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()


def auth_header(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def test_password_hash_roundtrip():
    stored = hash_password("secret123")
    assert stored != "secret123"
    assert verify_password("secret123", stored)
    assert not verify_password("wrong", stored)
    assert not verify_password("secret123", None)


def test_register_returns_token_and_camelcase_profile(client):
    response = client.post("/api/auth/register", json=SIGNUP)
    assert response.status_code == 201
    body = response.json()
    assert body["token"] and body["tokenType"] == "bearer"
    user = body["user"]
    assert user["email"] == "alfred@case.edu"  # normalized
    assert user["firstName"] == "Alfred" and user["lastName"] == "Chen"
    assert user["interests"] == ["Exercise", "Study"]
    assert user["username"] == "alfred"
    assert "password" not in user and "passwordHash" not in user


def test_register_rejects_duplicate_email(client):
    client.post("/api/auth/register", json=SIGNUP)
    response = client.post("/api/auth/register", json={**SIGNUP, "email": "alfred@case.edu"})
    assert response.status_code == 409


@pytest.mark.parametrize(
    "override",
    [{"email": "not-an-email"}, {"password": "abc"}, {"firstName": ""}],
)
def test_register_validates_input(client, override):
    assert client.post("/api/auth/register", json={**SIGNUP, **override}).status_code == 422


def test_login_success_and_failure(client):
    client.post("/api/auth/register", json=SIGNUP)
    ok = client.post("/api/auth/login", json={"email": "alfred@case.edu", "password": "secret123"})
    assert ok.status_code == 200 and ok.json()["token"]

    wrong_pw = client.post("/api/auth/login", json={"email": "alfred@case.edu", "password": "nope"})
    unknown = client.post("/api/auth/login", json={"email": "ghost@case.edu", "password": "secret123"})
    assert wrong_pw.status_code == unknown.status_code == 401
    assert wrong_pw.json()["detail"] == unknown.json()["detail"]


def test_me_requires_valid_token(client):
    assert client.get("/api/users/me").status_code == 401
    assert client.get("/api/users/me", headers=auth_header("garbage")).status_code == 401
    assert client.get("/api/users/me", headers=auth_header(create_access_token(999))).status_code == 401

    token = client.post("/api/auth/register", json=SIGNUP).json()["token"]
    me = client.get("/api/users/me", headers=auth_header(token))
    assert me.status_code == 200 and me.json()["email"] == "alfred@case.edu"


def test_update_profile(client):
    token = client.post("/api/auth/register", json=SIGNUP).json()["token"]
    response = client.patch(
        "/api/users/me", headers=auth_header(token), json={"goal": "Learn something new", "interests": ["Creative"]}
    )
    assert response.status_code == 200
    assert response.json()["goal"] == "Learn something new"
    assert response.json()["interests"] == ["Creative"]
    assert response.json()["firstName"] == "Alfred"  # untouched


def test_stats_counts_completed_quests(client, session_factory):
    token = client.post("/api/auth/register", json=SIGNUP).json()["token"]
    with session_factory() as db:
        user = db.query(User).filter_by(email="alfred@case.edu").one()
        user.points = 620
        quest = Quest(title="Walk", category="Exercise", points=50)
        db.add(quest)
        db.flush()
        now = datetime.utcnow()
        db.add_all([
            UserQuest(user_id=user.id, quest_id=quest.id, status="COMPLETED", ended_at=now),
            UserQuest(user_id=user.id, quest_id=quest.id, status="COMPLETED", ended_at=now - timedelta(days=3)),
            UserQuest(user_id=user.id, quest_id=quest.id, status="COMPLETED", ended_at=now - timedelta(days=30)),
            UserQuest(user_id=user.id, quest_id=quest.id, status="AVAILABLE"),
        ])
        db.commit()

    stats = client.get("/api/users/me/stats", headers=auth_header(token)).json()
    assert stats["xp"] == 620 and stats["level"] == 2 and stats["xpIntoLevel"] == 120
    assert stats["completedToday"] == 1
    assert stats["completedThisWeek"] == 2


def test_demo_login(client, session_factory):
    assert client.post("/api/auth/demo").status_code == 404
    with session_factory() as db:
        db.add(User(username="demo_user", email="demo@lifescape.app", password_hash=hash_password("lifescape")))
        db.commit()
    response = client.post("/api/auth/demo")
    assert response.status_code == 200 and response.json()["user"]["email"] == "demo@lifescape.app"
