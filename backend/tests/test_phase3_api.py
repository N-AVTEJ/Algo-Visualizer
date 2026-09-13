"""Comprehensive Phase 3 API test suite."""
import sys
from pathlib import Path
from datetime import timedelta

# Ensure backend directory is in sys.path
BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.main import app
from app.db.session import SessionLocal
from app.models.user import User
from app.models.module import Module
from app.models.algorithm import Algorithm
from app.models.user_progress import UserProgress
from app.core.security import create_access_token

client = TestClient(app)


def cleanup_test_data():
    """Clean up test users and algorithms created during test execution."""
    db: Session = SessionLocal()
    try:
        # Delete test progress records
        test_user_emails = ["alice_phase3@example.com", "bob_phase3@example.com"]
        test_users = db.query(User).filter(User.email.in_(test_user_emails)).all()
        for u in test_users:
            db.delete(u)

        # Delete test algorithms
        test_algos = db.query(Algorithm).filter(Algorithm.name.like("Phase3 Test%")).all()
        for a in test_algos:
            db.delete(a)

        db.commit()
    finally:
        db.close()


def run_tests():
    print("==================================================")
    print("STARTING PHASE 3 API VALIDATION TEST SUITE")
    print("==================================================")

    cleanup_test_data()

    # 1. Health & Root endpoints
    print("\n[TEST 1] Testing Health & Root Endpoints...")
    res = client.get("/health")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    assert res.json()["status"] == "healthy"
    print("  [PASS] GET /health returns 200 and healthy status")

    res = client.get("/")
    assert res.status_code == 200
    assert "AlgoLens Pro" in res.json()["message"]
    print("  [PASS] GET / returns 200 and welcome metadata")

    # 2. Registration
    print("\n[TEST 2] Testing User Registration...")
    reg_payload = {
        "email": "alice_phase3@example.com",
        "password": "SecurePassword123!",
    }
    res = client.post("/api/auth/register", json=reg_payload)
    assert res.status_code == 201, f"Expected 201, got {res.status_code}: {res.text}"
    user_data = res.json()
    assert user_data["email"] == "alice_phase3@example.com"
    assert "id" in user_data
    assert "role" in user_data
    assert "created_at" in user_data
    assert "password_hash" not in user_data, "Security flaw: password_hash exposed in response!"
    alice_id = user_data["id"]
    print(f"  [PASS] POST /api/auth/register created user (id={alice_id}, password_hash NOT exposed)")

    # Duplicate registration
    res_dup = client.post("/api/auth/register", json=reg_payload)
    assert res_dup.status_code == 400, f"Expected 400, got {res_dup.status_code}"
    assert "already registered" in res_dup.json()["detail"].lower()
    print("  [PASS] POST /api/auth/register properly rejects duplicate email with 400")

    # Short password validation
    res_short = client.post("/api/auth/register", json={"email": "short@example.com", "password": "123"})
    assert res_short.status_code == 422, f"Expected 422 for short password, got {res_short.status_code}"
    print("  [PASS] POST /api/auth/register rejects password < 6 chars with 422")

    # 3. Login
    print("\n[TEST 3] Testing User Login...")
    login_payload = {
        "email": "alice_phase3@example.com",
        "password": "SecurePassword123!",
    }
    res = client.post("/api/auth/login", json=login_payload)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    token_data = res.json()
    assert "access_token" in token_data
    assert token_data["token_type"].lower() == "bearer"
    alice_token = token_data["access_token"]
    print(f"  [PASS] POST /api/auth/login returns valid bearer JWT token")

    # Wrong password
    res_wrong = client.post("/api/auth/login", json={"email": "alice_phase3@example.com", "password": "WrongPassword"})
    assert res_wrong.status_code == 401
    assert "incorrect" in res_wrong.json()["detail"].lower()
    print("  [PASS] POST /api/auth/login rejects wrong password with 401")

    # Nonexistent user
    res_nonexistent = client.post("/api/auth/login", json={"email": "nobody@example.com", "password": "AnyPassword"})
    assert res_nonexistent.status_code == 401
    print("  [PASS] POST /api/auth/login rejects nonexistent user with 401")

    # 4. JWT Protection & Authentication Dependency
    print("\n[TEST 4] Testing JWT Authentication Dependency...")
    # Missing token
    res_no_token = client.get("/api/progress/me")
    assert res_no_token.status_code == 401, f"Expected 401, got {res_no_token.status_code}"
    print("  [PASS] Request without token correctly rejected with 401")

    # Invalid token
    res_invalid_token = client.get(
        "/api/progress/me",
        headers={"Authorization": "Bearer totally_invalid_token_string"},
    )
    assert res_invalid_token.status_code == 401
    print("  [PASS] Request with malformed token correctly rejected with 401")

    # Expired token
    expired_token = create_access_token(subject=str(alice_id), expires_delta=timedelta(minutes=-10))
    res_expired_token = client.get(
        "/api/progress/me",
        headers={"Authorization": f"Bearer {expired_token}"},
    )
    assert res_expired_token.status_code == 401
    print("  [PASS] Request with expired token correctly rejected with 401")

    # Valid token
    res_valid_token = client.get(
        "/api/progress/me",
        headers={"Authorization": f"Bearer {alice_token}"},
    )
    assert res_valid_token.status_code == 200
    assert res_valid_token.json() == []
    print("  [PASS] Request with valid token returns 200 and user progress list")

    # 5. Modules Endpoints
    print("\n[TEST 5] Testing Modules Endpoints...")
    res_modules = client.get("/api/modules")
    assert res_modules.status_code == 200
    modules = res_modules.json()
    assert len(modules) == 10, f"Expected 10 seeded modules, got {len(modules)}"
    assert modules[0]["order_index"] == 1
    assert modules[0]["name"] == "Algorithm Analysis"
    print(f"  [PASS] GET /api/modules returned {len(modules)} curriculum modules ordered sequentially")

    mod_1_id = modules[0]["id"]
    res_mod_1 = client.get(f"/api/modules/{mod_1_id}")
    assert res_mod_1.status_code == 200
    assert res_mod_1.json()["name"] == "Algorithm Analysis"
    print(f"  [PASS] GET /api/modules/{mod_1_id} returned Module 1 details")

    res_mod_404 = client.get("/api/modules/99999")
    assert res_mod_404.status_code == 404
    print("  [PASS] GET /api/modules/99999 properly returns 404 Not Found")

    # 6. Algorithms Endpoints
    print("\n[TEST 6] Testing Algorithms Endpoints...")
    # Seed a test algorithm in Module 1 for testing
    db = SessionLocal()
    test_algo = Algorithm(
        module_id=mod_1_id,
        name="Phase3 Test Merge Sort",
        code="def merge_sort(arr): pass",
        time_complexity="O(n log n)",
        space_complexity="O(n)",
        video_url="https://example.com/merge_sort",
    )
    db.add(test_algo)
    db.commit()
    db.refresh(test_algo)
    test_algo_id = test_algo.id
    db.close()

    res_algos = client.get(f"/api/algorithms?module_id={mod_1_id}")
    assert res_algos.status_code == 200
    algos = res_algos.json()
    assert any(a["id"] == test_algo_id for a in algos)
    print(f"  [PASS] GET /api/algorithms?module_id={mod_1_id} returns algorithms filtered by module")

    res_algo_detail = client.get(f"/api/algorithms/{test_algo_id}")
    assert res_algo_detail.status_code == 200
    assert res_algo_detail.json()["name"] == "Phase3 Test Merge Sort"
    assert res_algo_detail.json()["time_complexity"] == "O(n log n)"
    print(f"  [PASS] GET /api/algorithms/{test_algo_id} returns algorithm details")

    res_algo_missing_mod = client.get("/api/algorithms?module_id=99999")
    assert res_algo_missing_mod.status_code == 404
    print("  [PASS] GET /api/algorithms?module_id=99999 returns 404 Not Found")

    res_algo_404 = client.get("/api/algorithms/99999")
    assert res_algo_404.status_code == 404
    print("  [PASS] GET /api/algorithms/99999 returns 404 Not Found")

    # 7. User Progress Endpoints & User Isolation
    print("\n[TEST 7] Testing User Progress & Isolation...")
    # Create progress for Alice
    progress_payload = {
        "algorithm_id": test_algo_id,
        "completed": True,
        "score": 95,
        "time_spent": 120,
    }
    res_prog = client.post(
        "/api/progress",
        json=progress_payload,
        headers={"Authorization": f"Bearer {alice_token}"},
    )
    assert res_prog.status_code == 200, f"Expected 200, got {res_prog.status_code}: {res_prog.text}"
    prog_data = res_prog.json()
    assert prog_data["user_id"] == alice_id
    assert prog_data["algorithm_id"] == test_algo_id
    assert prog_data["completed"] is True
    assert prog_data["score"] == 95
    assert prog_data["time_spent"] == 120
    assert prog_data["completed_at"] is not None
    print(f"  [PASS] POST /api/progress successfully recorded progress for Alice (user_id={alice_id})")

    # Verify Alice's progress list
    res_alice_list = client.get(
        "/api/progress/me",
        headers={"Authorization": f"Bearer {alice_token}"},
    )
    assert res_alice_list.status_code == 200
    alice_records = res_alice_list.json()
    assert len(alice_records) == 1
    assert alice_records[0]["algorithm_id"] == test_algo_id
    print("  [PASS] GET /api/progress/me returns Alice's progress record")

    # Register Bob and verify Bob CANNOT see Alice's progress
    res_bob_reg = client.post(
        "/api/auth/register",
        json={"email": "bob_phase3@example.com", "password": "BobSecurePassword123!"},
    )
    assert res_bob_reg.status_code == 201
    bob_id = res_bob_reg.json()["id"]

    res_bob_login = client.post(
        "/api/auth/login",
        json={"email": "bob_phase3@example.com", "password": "BobSecurePassword123!"},
    )
    assert res_bob_login.status_code == 200
    bob_token = res_bob_login.json()["access_token"]

    res_bob_list = client.get(
        "/api/progress/me",
        headers={"Authorization": f"Bearer {bob_token}"},
    )
    assert res_bob_list.status_code == 200
    assert res_bob_list.json() == [], "Security violation: Bob saw Alice's progress records!"
    print(f"  [PASS] Security verified: Bob (id={bob_id}) cannot access Alice's progress data")

    # Progress with invalid algorithm ID
    res_invalid_algo = client.post(
        "/api/progress",
        json={"algorithm_id": 99999, "completed": True},
        headers={"Authorization": f"Bearer {alice_token}"},
    )
    assert res_invalid_algo.status_code == 404
    print("  [PASS] POST /api/progress with invalid algorithm ID returns 404 Not Found")

    # 8. CORS Headers Verification
    print("\n[TEST 8] Testing CORS Configuration...")
    res_cors = client.options(
        "/api/modules",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert res_cors.headers.get("access-control-allow-origin") == "http://localhost:5173"
    assert res_cors.headers.get("access-control-allow-credentials") == "true"
    print("  [PASS] CORS allows origin 'http://localhost:5173' with credentials")

    res_cors_evil = client.options(
        "/api/modules",
        headers={
            "Origin": "http://evil-attacker.com",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert res_cors_evil.headers.get("access-control-allow-origin") != "http://evil-attacker.com"
    print("  [PASS] CORS rejects unauthorized arbitrary origin")

    # Cleanup
    cleanup_test_data()
    print("\n==================================================")
    print("ALL PHASE 3 VALIDATION TESTS PASSED SUCCESSFULLY!")
    print("==================================================")


if __name__ == "__main__":
    try:
        run_tests()
    except Exception as e:
        print(f"\n[FAIL] TEST FAILED: {e}")
        cleanup_test_data()
        sys.exit(1)
