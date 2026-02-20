import io
import logging

import pandas as pd
from fastapi import HTTPException, UploadFile, status

from app.database import SessionLocal
from app.models import Dataset, SalesRecord

logger = logging.getLogger(__name__)

REQUIRED_COLUMNS = {
    "ORDERNUMBER", "PRODUCTCODE",
    "QUANTITYORDERED", "PRICEEACH",
    "ORDERDATE", "SALES", "STATUS",
    "MONTH_ID", "YEAR_ID", "PRODUCTLINE",
    "CUSTOMERNAME", "COUNTRY", "DEALSIZE",
}

NUMERIC_COLUMNS = [
    "QUANTITYORDERED", "PRICEEACH",
    "SALES", "MONTH_ID", "YEAR_ID",
]


def parse_csv(file: UploadFile) -> pd.DataFrame:
    content = file.file.read()
    try:
        # latin-1 handles special characters in customer/city names from the Kaggle dataset
        df = pd.read_csv(io.BytesIO(content), encoding="latin-1")
    except Exception:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Could not parse CSV file")

    missing = REQUIRED_COLUMNS - set(df.columns)
    if missing:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"Missing required columns: {', '.join(sorted(missing))}",
        )

    return df


def transform(df: pd.DataFrame) -> tuple[pd.DataFrame, int]:
    original_count = len(df)

    # same order+product = same line item, keep first
    df = df.drop_duplicates(subset=["ORDERNUMBER", "PRODUCTCODE"], keep="first")
    rows_dropped = original_count - len(df)

    # median over mean because SALES has big outliers that skew the average
    for col in NUMERIC_COLUMNS:
        if col in df.columns:
            median_val = df[col].median()
            df[col] = df[col].fillna(median_val)

    # format="mixed" because the Kaggle CSV has inconsistent date formats
    df["ORDERDATE"] = pd.to_datetime(df["ORDERDATE"], format="mixed", dayfirst=False)

    # TOTAL_SALES gives the actual revenue per line (SALES in the CSV is sometimes rounded)
    df["TOTAL_SALES"] = df["QUANTITYORDERED"] * df["PRICEEACH"]

    df["ORDER_QUARTER"] = df["ORDERDATE"].dt.quarter.map(
        {1: "Q1", 2: "Q2", 3: "Q3", 4: "Q4"}
    )

    return df, rows_dropped


def process_dataset(dataset_id: int, df: pd.DataFrame) -> None:
    db = SessionLocal()
    try:
        dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
        if not dataset:
            return

        df, rows_dropped = transform(df)

        date_min = df["ORDERDATE"].min()
        date_max = df["ORDERDATE"].max()

        records: list[SalesRecord] = []
        for _, row in df.iterrows():
            records.append(SalesRecord(
                dataset_id=dataset.id,
                order_number=int(row["ORDERNUMBER"]),
                quantity_ordered=int(row["QUANTITYORDERED"]),
                price_each=float(row["PRICEEACH"]),
                sales=float(row["SALES"]),
                order_date=row["ORDERDATE"].to_pydatetime(),
                status=str(row["STATUS"]),
                month_id=int(row["MONTH_ID"]),
                year_id=int(row["YEAR_ID"]),
                product_line=str(row["PRODUCTLINE"]),
                product_code=str(row["PRODUCTCODE"]),
                customer_name=str(row["CUSTOMERNAME"]),
                country=str(row["COUNTRY"]),
                deal_size=str(row["DEALSIZE"]),
                total_sales=float(row["TOTAL_SALES"]),
                order_quarter=str(row["ORDER_QUARTER"]),
            ))
        db.add_all(records)

        dataset.row_count = len(df)
        dataset.rows_dropped = rows_dropped
        dataset.date_min = date_min.to_pydatetime() if pd.notna(date_min) else None
        dataset.date_max = date_max.to_pydatetime() if pd.notna(date_max) else None
        dataset.total_sales = float(df["TOTAL_SALES"].sum())
        dataset.status = "ready"
        db.commit()
    except Exception:
        logger.exception("Background ETL failed for dataset %s", dataset_id)
        db.rollback()
        dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
        if dataset:
            dataset.status = "failed"
            db.commit()
    finally:
        db.close()
