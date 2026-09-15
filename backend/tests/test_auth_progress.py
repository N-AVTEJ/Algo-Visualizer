"""Comprehensive tests for Authentication and User Progress API."""
from __future__ import annotations

import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.db.session import SessionLocal
from app.models.user import User
from app.models.algorithm import Algorithm
from app.models.user_progress import UserProgress
from app.core.security import create_access_token

client = TestClient(app)


@pytest.fixture(scope="module")
def db_session():
    """Provide a database session and clean up test entities after tests."""
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        # Cleanup test entities
        test_emails = ["authtest_alice@example.com", "authtest_bob@example.com", "authtest_carol@example.com"]
        users = db.query(User).filter(User.email.in_(test_emails)).all()
        user_ids = [u.id for u in users]
        if user_ids:
            db.query(UserProgress).filter(UserProgress.user_id.in_(user_ids)).delete(synchronize_session=False)
            db.query(User).filter(User.id.in_(user_ids)).delete(synchronize_session=False)
            db.commit()
        db.close()


@pytest.fixture(scope="module")
def sample_algorithm(db_session: Session):
    """Ensure at least one algorithm exists in the DB for progress testing."""
    algo = db_session.query(Algorithm).first()
    if not algo:
        algo = Algorithm(
            name="Test Search Algo",
            module_id=1,
            time_complexity="O(n)",
            space_complexity="O(1)",
        )
        db_session.add(algo)
        db_session.commit()
        db_session.refresh(algo)
    return algo


# ---------------------------------------------------------------------------
# 1. Authentication Tests
# ---------------------------------------------------------------------------

class TestAuthentication:
    """Test register and login endpoints."""

    def test_register_success(self):
        email = "authtest_alice@example.com"
        password = "SecurePassword123!"
        username = "AliceAuth"

        response = client.post(
            "/api/auth/register",
            json={"email": email, "password": password, "username": username},
        )
        assert response.status_code in (201, 200)
        data = response.json()
        assert data["email"] == email
        assert "id" in data
        assert "role" in data
        assert "hashed_password" not in data

    def test_register_duplicate_email(self):
        email = "authtest_alice@example.com"
        response = client.post(
            "/api/auth/register",
            json={"email": email, "password": "AnotherPassword123!", "username": "AliceClone"},
        )
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"].lower()

    def test_register_invalid_email(self):
        response = client.post(
            "/api/auth/register",
            json={"email": "not-an-email", "password": "Password123!", "username": "BadEmail"},
        )
        assert response.status_code == 422

    def test_login_success(self):
        email = "authtest_alice@example.com"
        password = "SecurePassword123!"

        response = client.post(
            "/api/auth/login",
            json={"email": email, "password": password},
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert len(data["access_token"]) > 20

    def test_login_wrong_password(self):
        response = client.post(
            "/api/auth/login",
            json={"email": "authtest_alice@example.com", "password": "WrongPassword999!"},
        )
        assert response.status_code == 401
        assert "incorrect" in response.json()["detail"].lower()

    def test_login_nonexistent_user(self):
        response = client.post(
            "/api/auth/login",
            json={"email": "nonexistent_user_9999@example.com", "password": "Password123!"},
        )
        assert response.status_code == 401


# ---------------------------------------------------------------------------
# 2. Progress Tracking Tests
# ---------------------------------------------------------------------------

class TestProgressTracking:
    """Test user progress endpoints and user isolation."""

    @pytest.fixture
    def auth_headers_alice(self):
        email = "authtest_alice@example.com"
        token = create_access_token(subject=email)
        # Verify user exists in db
        db = SessionLocal()
        user = db.query(User).filter(User.email == email).first()
        db.close()
        if user:
            token = create_access_token(subject=str(user.id))
        return {"Authorization": f"Bearer {token}"}

    @pytest.fixture
    def auth_headers_bob(self, db_session: Session):
        email = "authtest_bob@example.com"
        user = db_session.query(User).filter(User.email == email).first()
        if not user:
            client.post(
                "/api/auth/register",
                json={"email": email, "password": "Password123!", "username": "BobAuth"},
            )
            user = db_session.query(User).filter(User.email == email).first()
        token = create_access_token(subject=str(user.id))
        return {"Authorization": f"Bearer {token}"}

    def test_progress_unauthorized(self, sample_algorithm):
        response = client.get("/api/progress/me")
        assert response.status_code == 401

        response = client.post(
            "/api/progress",
            json={"algorithm_id": sample_algorithm.id, "completed": True},
        )
        assert response.status_code == 401

    def test_record_progress_success(self, auth_headers_alice, sample_algorithm):
        payload = {
            "algorithm_id": sample_algorithm.id,
            "completed": True,
            "score": 100,
            "time_spent": 45,
        }
        response = client.post(
            "/api/progress",
            json=payload,
            headers=auth_headers_alice,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["algorithm_id"] == sample_algorithm.id
        assert data["completed"] is True
        assert data["score"] == 100
        assert data["time_spent"] == 45
        assert data["completed_at"] is not None

    def test_update_existing_progress(self, auth_headers_alice, sample_algorithm):
        payload = {
            "algorithm_id": sample_algorithm.id,
            "completed": True,
            "score": 95,
            "time_spent": 120,
        }
        response = client.post(
            "/api/progress",
            json=payload,
            headers=auth_headers_alice,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["score"] == 95
        assert data["time_spent"] == 120

    def test_get_my_progress_isolation(self, auth_headers_alice, auth_headers_bob, sample_algorithm):
        # Alice has progress
        res_alice = client.get("/api/progress/me", headers=auth_headers_alice)
        assert res_alice.status_code == 200
        records_alice = res_alice.json()
        assert len(records_alice) >= 1
        assert any(r["algorithm_id"] == sample_algorithm.id for r in records_alice)

        # Bob initially has no progress on sample_algorithm
        res_bob = client.get("/api/progress/me", headers=auth_headers_bob)
        assert res_bob.status_code == 200
        records_bob = res_bob.json()
        # Verify Bob does not see Alice's records
        assert not any(r["algorithm_id"] == sample_algorithm.id for r in records_bob)

    def test_record_progress_invalid_algorithm(self, auth_headers_alice):
        response = client.post(
            "/api/progress",
            json={"algorithm_id": 999999, "completed": True},
            headers=auth_headers_alice,
        )
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()
