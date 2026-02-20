from datetime import datetime

from pydantic import BaseModel, EmailStr


class UserRegister(BaseModel):
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class MessageResponse(BaseModel):
    message: str


class MeResponse(BaseModel):
    email: str


# --- Dataset schemas ---


class UploadStats(BaseModel):
    dataset_id: int
    status: str
    row_count: int
    rows_dropped: int
    date_min: datetime | None
    date_max: datetime | None
    total_sales: float


class DatasetSummary(BaseModel):
    id: int
    filename: str
    row_count: int
    rows_dropped: int
    total_sales: float
    date_min: datetime | None
    date_max: datetime | None
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class DatasetListResponse(BaseModel):
    datasets: list[DatasetSummary]


class SalesRecordOut(BaseModel):
    id: int
    order_number: int
    quantity_ordered: int
    price_each: float
    sales: float
    order_date: datetime
    status: str
    month_id: int
    year_id: int
    product_line: str
    product_code: str
    customer_name: str
    country: str
    deal_size: str
    total_sales: float
    order_quarter: str

    model_config = {"from_attributes": True}


class QuarterlySales(BaseModel):
    year: int
    quarter: str
    total_sales: float
    order_count: int


class CountrySales(BaseModel):
    country: str
    total_sales: float
    order_count: int


class CustomerSales(BaseModel):
    customer_name: str
    total_sales: float
    order_count: int


class DatasetAggregates(BaseModel):
    total_sales: float
    total_orders: int
    avg_order_value: float
    sales_by_quarter: list[QuarterlySales]
    sales_by_country: list[CountrySales]
    sales_by_customer: list[CustomerSales]


class DatasetDetailResponse(BaseModel):
    id: int
    filename: str
    row_count: int
    date_min: datetime | None
    date_max: datetime | None
    created_at: datetime
    status: str
    aggregates: DatasetAggregates
    records: list[SalesRecordOut]
    page: int
    page_size: int
    total_records: int
