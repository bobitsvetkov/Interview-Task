import io

import pandas as pd
import pytest
from fastapi import HTTPException, UploadFile

from app.services.etl import REQUIRED_COLUMNS, parse_csv, transform


def _make_upload(content: str, filename: str = "test.csv") -> UploadFile:
    return UploadFile(file=io.BytesIO(content.encode("latin-1")), filename=filename)


def _base_row(**overrides) -> dict:
    """Return a valid row with all required columns, applying any overrides."""
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


def _csv(rows: list[dict]) -> str:
    return pd.DataFrame(rows).to_csv(index=False)



def test_parse_csv_valid():
    file = _make_upload(_csv([_base_row(), _base_row(ORDERNUMBER=1002)]))
    df = parse_csv(file)
    assert len(df) == 2
    assert set(REQUIRED_COLUMNS).issubset(set(df.columns))


def test_parse_csv_missing_required_columns():
    row = _base_row()
    del row["ORDERNUMBER"]
    del row["PRODUCTCODE"]
    file = _make_upload(_csv([row]))

    with pytest.raises(HTTPException) as exc_info:
        parse_csv(file)
    assert exc_info.value.status_code == 400
    assert "ORDERNUMBER" in str(exc_info.value.detail)


def test_parse_csv_invalid_content():
    file = _make_upload("not,a,valid\x00\x01\x02csv")
    try:
        parse_csv(file)
    except HTTPException as e:
        assert e.status_code == 400



def test_transform_deduplication():
    rows = [
        _base_row(ORDERNUMBER=1001, PRODUCTCODE="A", QUANTITYORDERED=30),
        _base_row(ORDERNUMBER=1001, PRODUCTCODE="A", QUANTITYORDERED=99),
        _base_row(ORDERNUMBER=1002, PRODUCTCODE="A", QUANTITYORDERED=10),
    ]
    result, dropped = transform(pd.DataFrame(rows))

    assert dropped == 1
    assert len(result) == 2
    assert result[result["ORDERNUMBER"] == 1001].iloc[0]["QUANTITYORDERED"] == 30


def test_transform_fills_nulls_with_median():
    rows = [
        _base_row(QUANTITYORDERED=10),
        _base_row(ORDERNUMBER=1002, PRODUCTCODE="B", QUANTITYORDERED=20),
        _base_row(ORDERNUMBER=1003, PRODUCTCODE="C", QUANTITYORDERED=30),
    ]
    df = pd.DataFrame(rows)
    df.loc[1, "QUANTITYORDERED"] = None

    result, _ = transform(df)
    assert result.iloc[1]["QUANTITYORDERED"] == 20.0  # median of [10, 30]


def test_transform_full_pipeline():
    """End-to-end: dedupe + null fill + date parse + derived columns."""
    rows = [
        _base_row(ORDERNUMBER=1001, PRODUCTCODE="A", QUANTITYORDERED=10, PRICEEACH=50.0, ORDERDATE="3/1/2004 0:00"),
        _base_row(ORDERNUMBER=1001, PRODUCTCODE="A", QUANTITYORDERED=99, PRICEEACH=99.0, ORDERDATE="3/1/2004 0:00"),
        _base_row(ORDERNUMBER=1001, PRODUCTCODE="B", QUANTITYORDERED=5, PRICEEACH=100.0, ORDERDATE="4/15/2004 0:00"),
        _base_row(ORDERNUMBER=1002, PRODUCTCODE="A", QUANTITYORDERED=20, PRICEEACH=75.0, ORDERDATE="5/20/2004 0:00"),
    ]
    result, dropped = transform(pd.DataFrame(rows))

    assert dropped == 1
    assert len(result) == 3
    assert pd.api.types.is_datetime64_any_dtype(result["ORDERDATE"])
    assert list(result["TOTAL_SALES"]) == [500.0, 500.0, 1500.0]
    assert list(result["ORDER_QUARTER"]) == ["Q1", "Q2", "Q2"]
