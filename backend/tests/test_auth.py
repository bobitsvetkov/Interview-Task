from fastapi import status
from fastapi.testclient import TestClient


def register(client: TestClient, email: str = "user@test.com", password: str = "secret123"):
    return client.post("/api/register", json={"email": email, "password": password})


def login(client: TestClient, email: str = "user@test.com", password: str = "secret123"):
    return client.post("/api/login", json={"email": email, "password": password})


# ── Test User Signup ──────────────────────────────────────────────


def test_register_success(client: TestClient):
    r = register(client)
    assert r.status_code == status.HTTP_201_CREATED
    body = r.json()
    assert "access_token" in body
    assert "refresh_token" in body
    assert body["token_type"] == "bearer"


def test_register_duplicate_email(client: TestClient):
    register(client)
    r = register(client)
    assert r.status_code == status.HTTP_409_CONFLICT


def test_register_invalid_email(client: TestClient):
    r = register(client, email="not-an-email")
    assert r.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


# ── Test Login ─────────────────────────────────────────────────


def test_login_success(client: TestClient):
    register(client)
    r = login(client)
    assert r.status_code == status.HTTP_200_OK
    body = r.json()
    assert "access_token" in body
    assert "refresh_token" in body


def test_login_wrong_password(client: TestClient):
    register(client)
    r = login(client, password="wrong")
    assert r.status_code == status.HTTP_401_UNAUTHORIZED


def test_login_nonexistent_user(client: TestClient):
    r = login(client, email="nobody@test.com")
    assert r.status_code == status.HTTP_401_UNAUTHORIZED


# ── Test Refresh Session───────────────────────────────────────────────


def test_refresh_success(client: TestClient):
    tokens = register(client).json()
    r = client.post("/api/refresh", json={"refresh_token": tokens["refresh_token"]})
    assert r.status_code == status.HTTP_200_OK
    body = r.json()
    assert "access_token" in body
    assert "refresh_token" in body


def test_refresh_with_access_token_fails(client: TestClient):
    tokens = register(client).json()
    r = client.post("/api/refresh", json={"refresh_token": tokens["access_token"]})
    assert r.status_code == status.HTTP_401_UNAUTHORIZED


def test_refresh_with_garbage_token_fails(client: TestClient):
    r = client.post("/api/refresh", json={"refresh_token": "garbage"})
    assert r.status_code == status.HTTP_401_UNAUTHORIZED


# ── Token types must be different ───────────────────


def test_tokens_are_different(client: TestClient):
    tokens = register(client).json()
    assert tokens["access_token"] != tokens["refresh_token"]
