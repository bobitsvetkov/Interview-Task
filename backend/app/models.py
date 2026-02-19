from datetime import UTC, datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC)
    )

    datasets: Mapped[list["Dataset"]] = relationship(back_populates="user")


class Dataset(Base):
    __tablename__ = "datasets"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    filename: Mapped[str] = mapped_column(String(255))
    row_count: Mapped[int] = mapped_column(Integer)
    rows_dropped: Mapped[int] = mapped_column(Integer, default=0)
    date_min: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    date_max: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    total_sales: Mapped[float] = mapped_column(Float, default=0.0)
    status: Mapped[str] = mapped_column(String(20), default="processing")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC)
    )

    user: Mapped["User"] = relationship(back_populates="datasets")
    records: Mapped[list["SalesRecord"]] = relationship(
        back_populates="dataset", cascade="all, delete-orphan"
    )


class SalesRecord(Base):
    __tablename__ = "sales_records"
    __table_args__ = (
        UniqueConstraint(
            "dataset_id", "order_number", "product_code",
            name="uq_dataset_order_product",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    dataset_id: Mapped[int] = mapped_column(ForeignKey("datasets.id"), index=True)

    order_number: Mapped[int] = mapped_column(Integer)
    quantity_ordered: Mapped[int] = mapped_column(Integer)
    price_each: Mapped[float] = mapped_column(Float)
    sales: Mapped[float] = mapped_column(Float)
    order_date: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    status: Mapped[str] = mapped_column(String(50))
    month_id: Mapped[int] = mapped_column(Integer)
    year_id: Mapped[int] = mapped_column(Integer)
    product_line: Mapped[str] = mapped_column(String(100))
    product_code: Mapped[str] = mapped_column(String(50))
    customer_name: Mapped[str] = mapped_column(String(255))
    country: Mapped[str] = mapped_column(String(100))
    deal_size: Mapped[str] = mapped_column(String(20))
    total_sales: Mapped[float] = mapped_column(Float)
    order_quarter: Mapped[str] = mapped_column(String(2), default="Q1")

    dataset: Mapped["Dataset"] = relationship(back_populates="records")
