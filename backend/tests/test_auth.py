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
    assert "access_token" in r.cookies
    assert "refresh_token" in r.cookies


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
    assert "access_token" in r.cookies
    assert "refresh_token" in r.cookies


def test_login_wrong_password(client: TestClient):
    register(client)
    r = login(client, password="wrong")
    assert r.status_code == status.HTTP_401_UNAUTHORIZED


def test_login_nonexistent_user(client: TestClient):
    r = login(client, email="nobody@test.com")
    assert r.status_code == status.HTTP_401_UNAUTHORIZED


# ── Test Refresh Session───────────────────────────────────────────────


def test_refresh_success(client: TestClient):
    register(client)
    r = client.post("/api/refresh")
    assert r.status_code == status.HTTP_200_OK
    assert "access_token" in r.cookies
    assert "refresh_token" in r.cookies


def test_refresh_with_access_token_fails(client: TestClient):
    register(client)
    access = client.cookies["access_token"]
    client.cookies.clear()
    client.cookies.set("refresh_token", access, domain="testserver.local", path="/api")
    r = client.post("/api/refresh")
    assert r.status_code == status.HTTP_401_UNAUTHORIZED


def test_refresh_with_garbage_token_fails(client: TestClient):
    client.cookies.set("refresh_token", "garbage", domain="testserver.local", path="/api")
    r = client.post("/api/refresh")
    assert r.status_code == status.HTTP_401_UNAUTHORIZED


# ── Token types must be different ───────────────────


def test_tokens_are_different(client: TestClient):
    register(client)
    assert client.cookies.get("access_token") != client.cookies.get("refresh_token")
