import io
from datetime import UTC, datetime

import pandas as pd
from fastapi import status
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models import Dataset, SalesRecord, User
from app.services.auth import hash_password


# ── Helpers ──────────────────────────────────────────────────────


def _base_row(**overrides) -> dict:
    row = {
        "ORDERNUMBER": 1001,
        "QUANTITYORDERED": 30,
        "PRICEEACH": 95.70,
        "ORDERLINENUMBER": 2,
        "SALES": 2871.0,
        "ORDERDATE": "1/6/2003 0:00",
        "STATUS": "Shipped",
        "QTR_ID": 1,
        "MONTH_ID": 1,
        "YEAR_ID": 2003,
        "PRODUCTLINE": "Motorcycles",
        "MSRP": 95,
        "PRODUCTCODE": "S10_1678",
        "CUSTOMERNAME": "Land of Toys Inc.",
        "PHONE": "2125557818",
        "ADDRESSLINE1": "897 Long Airport Avenue",
        "ADDRESSLINE2": "",
        "CITY": "NYC",
        "STATE": "NY",
        "POSTALCODE": "10022",
        "COUNTRY": "USA",
        "TERRITORY": "NA",
        "CONTACTLASTNAME": "Yu",
        "CONTACTFIRSTNAME": "Kwai",
        "DEALSIZE": "Small",
    }
    row.update(overrides)
    return row


def _csv_bytes(rows: list[dict]) -> bytes:
    return pd.DataFrame(rows).to_csv(index=False).encode("latin-1")


def _register(client: TestClient, email="user@test.com", password="secret123"):
    return client.post("/api/register", json={"email": email, "password": password})


def _login(client: TestClient, email="user@test.com", password="secret123"):
    return client.post("/api/login", json={"email": email, "password": password})


def _seed_dataset(db: Session) -> tuple[User, Dataset]:
    """Create a user with a fully processed dataset and 3 records."""
    user = User(email="user@test.com", hashed_password=hash_password("secret123"))
    db.add(user)
    db.flush()

    dataset = Dataset(
        user_id=user.id,
        filename="test.csv",
        row_count=3,
        rows_dropped=0,
        total_sales=6000.0,
        date_min=datetime(2003, 1, 6, tzinfo=UTC),
        date_max=datetime(2003, 3, 15, tzinfo=UTC),
        status="ready",
    )
    db.add(dataset)
    db.flush()

    records = [
        SalesRecord(
            dataset_id=dataset.id,
            order_number=1001,
            quantity_ordered=30,
            price_each=100.0,
            sales=3000.0,
            order_date=datetime(2003, 1, 6, tzinfo=UTC),
            status="Shipped",
            month_id=1,
            year_id=2003,
            product_line="Motorcycles",
            product_code="S10_1678",
            customer_name="Land of Toys Inc.",
            country="USA",
            deal_size="Small",
            total_sales=3000.0,
            order_quarter="Q1",
        ),
        SalesRecord(
            dataset_id=dataset.id,
            order_number=1002,
            quantity_ordered=20,
            price_each=100.0,
            sales=2000.0,
            order_date=datetime(2003, 2, 10, tzinfo=UTC),
            status="Shipped",
            month_id=2,
            year_id=2003,
            product_line="Classic Cars",
            product_code="S18_1749",
            customer_name="Atelier graphique",
            country="France",
            deal_size="Medium",
            total_sales=2000.0,
            order_quarter="Q1",
        ),
        SalesRecord(
            dataset_id=dataset.id,
            order_number=1003,
            quantity_ordered=10,
            price_each=100.0,
            sales=1000.0,
            order_date=datetime(2003, 3, 15, tzinfo=UTC),
            status="Cancelled",
            month_id=3,
            year_id=2003,
            product_line="Motorcycles",
            product_code="S10_1678",
            customer_name="Land of Toys Inc.",
            country="USA",
            deal_size="Large",
            total_sales=1000.0,
            order_quarter="Q1",
        ),
    ]
    db.add_all(records)
    db.commit()
    db.refresh(user)
    db.refresh(dataset)
    return user, dataset


# ── Upload Endpoint ──────────────────────────────────────────────


def test_upload_csv(client: TestClient):
    _register(client)
    csv = _csv_bytes([
        _base_row(ORDERNUMBER=1001, PRODUCTCODE="A"),
        _base_row(ORDERNUMBER=1002, PRODUCTCODE="B"),
    ])
    r = client.post("/api/upload", files={"file": ("data.csv", io.BytesIO(csv), "text/csv")})
    assert r.status_code == status.HTTP_201_CREATED
    body = r.json()
    assert "dataset_id" in body
    assert body["status"] == "processing"


def test_upload_rejects_non_csv(client: TestClient):
    _register(client)
    r = client.post("/api/upload", files={"file": ("data.txt", io.BytesIO(b"hello"), "text/plain")})
    assert r.status_code == status.HTTP_400_BAD_REQUEST


def test_upload_requires_auth(client: TestClient):
    csv = _csv_bytes([_base_row()])
    r = client.post("/api/upload", files={"file": ("data.csv", io.BytesIO(csv), "text/csv")})
    assert r.status_code == status.HTTP_401_UNAUTHORIZED


# ── List Datasets ────────────────────────────────────────────────


def test_list_datasets_empty(client: TestClient):
    _register(client)
    r = client.get("/api/datasets")
    assert r.status_code == 200
    assert r.json()["datasets"] == []


def test_list_datasets(client: TestClient, db: Session):
    _seed_dataset(db)
    _login(client)
    r = client.get("/api/datasets")
    assert r.status_code == 200
    datasets = r.json()["datasets"]
    assert len(datasets) == 1
    assert datasets[0]["filename"] == "test.csv"
    assert datasets[0]["status"] == "ready"
    assert datasets[0]["row_count"] == 3


def test_list_datasets_user_isolation(client: TestClient, db: Session):
    """User A cannot see User B's datasets."""
    _seed_dataset(db)
    _register(client, email="other@test.com")
    r = client.get("/api/datasets")
    assert r.status_code == 200
    assert r.json()["datasets"] == []


# ── Dataset Detail ───────────────────────────────────────────────


def test_get_dataset_detail(client: TestClient, db: Session):
    _, dataset = _seed_dataset(db)
    _login(client)
    r = client.get(f"/api/datasets/{dataset.id}")
    assert r.status_code == 200
    body = r.json()
    assert body["id"] == dataset.id
    assert body["filename"] == "test.csv"
    assert body["row_count"] == 3
    assert len(body["records"]) == 3
    assert body["page"] == 1
    assert body["total_records"] == 3
    agg = body["aggregates"]
    assert agg["total_sales"] == 6000.0
    assert agg["total_orders"] == 3


def test_get_dataset_detail_pagination(client: TestClient, db: Session):
    _, dataset = _seed_dataset(db)
    _login(client)
    r = client.get(f"/api/datasets/{dataset.id}?page=1&page_size=2")
    assert r.status_code == 200
    body = r.json()
    assert len(body["records"]) == 2
    assert body["total_records"] == 3
    assert body["page_size"] == 2

    r2 = client.get(f"/api/datasets/{dataset.id}?page=2&page_size=2")
    body2 = r2.json()
    assert len(body2["records"]) == 1
    assert body2["page"] == 2


def test_get_dataset_detail_sorting(client: TestClient, db: Session):
    _, dataset = _seed_dataset(db)
    _login(client)
    r = client.get(f"/api/datasets/{dataset.id}?sort_by=total_sales&sort_dir=desc")
    assert r.status_code == 200
    records = r.json()["records"]
    sales = [rec["total_sales"] for rec in records]
    assert sales == sorted(sales, reverse=True)


def test_get_dataset_detail_filter_status(client: TestClient, db: Session):
    _, dataset = _seed_dataset(db)
    _login(client)
    r = client.get(f"/api/datasets/{dataset.id}?status_filter=Cancelled")
    assert r.status_code == 200
    records = r.json()["records"]
    assert len(records) == 1
    assert records[0]["status"] == "Cancelled"


def test_get_dataset_detail_filter_product_line(client: TestClient, db: Session):
    _, dataset = _seed_dataset(db)
    _login(client)
    r = client.get(f"/api/datasets/{dataset.id}?product_line=Motorcycles")
    assert r.status_code == 200
    records = r.json()["records"]
    assert len(records) == 2
    assert all(rec["product_line"] == "Motorcycles" for rec in records)


def test_get_dataset_not_found(client: TestClient):
    _register(client)
    r = client.get("/api/datasets/9999")
    assert r.status_code == status.HTTP_404_NOT_FOUND


# ── Dataset Status ───────────────────────────────────────────────


def test_get_dataset_status(client: TestClient, db: Session):
    _, dataset = _seed_dataset(db)
    _login(client)
    r = client.get(f"/api/datasets/{dataset.id}/status")
    assert r.status_code == 200
    body = r.json()
    assert body["id"] == dataset.id
    assert body["status"] == "ready"


def test_get_dataset_status_not_found(client: TestClient):
    _register(client)
    r = client.get("/api/datasets/9999/status")
    assert r.status_code == status.HTTP_404_NOT_FOUND


# ── Export ────────────────────────────────────────────────────────


def test_export_csv(client: TestClient, db: Session):
    _, dataset = _seed_dataset(db)
    _login(client)
    r = client.get(f"/api/datasets/{dataset.id}/export")
    assert r.status_code == 200
    assert "text/csv" in r.headers["content-type"]
    assert "attachment" in r.headers["content-disposition"]
    csv_content = r.content.decode()
    df = pd.read_csv(io.StringIO(csv_content))
    assert len(df) == 3
    assert "order_number" in df.columns
    assert "total_sales" in df.columns


def test_export_not_found(client: TestClient):
    _register(client)
    r = client.get("/api/datasets/9999/export")
    assert r.status_code == status.HTTP_404_NOT_FOUND
