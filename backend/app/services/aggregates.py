from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import SalesRecord
from app.schemas import (
    CountrySales,
    CustomerSales,
    DatasetAggregates,
    QuarterlySales,
)


def build_aggregates(db: Session, dataset_id: int) -> DatasetAggregates:
    """Compute summary aggregates for a dataset."""
    total_sales = db.query(func.sum(SalesRecord.total_sales)).filter(
        SalesRecord.dataset_id == dataset_id
    ).scalar() or 0.0

    total_orders = db.query(func.count(func.distinct(SalesRecord.order_number))).filter(
        SalesRecord.dataset_id == dataset_id
    ).scalar() or 0

    avg_order = total_sales / total_orders if total_orders > 0 else 0.0

    sales_by_quarter = (
        db.query(
            SalesRecord.year_id,
            SalesRecord.order_quarter,
            func.sum(SalesRecord.total_sales).label("total_sales"),
            func.count().label("order_count"),
        )
        .filter(SalesRecord.dataset_id == dataset_id)
        .group_by(SalesRecord.year_id, SalesRecord.order_quarter)
        .order_by(SalesRecord.year_id, SalesRecord.order_quarter)
        .all()
    )

    sales_by_country = (
        db.query(
            SalesRecord.country,
            func.sum(SalesRecord.total_sales).label("total_sales"),
            func.count().label("order_count"),
        )
        .filter(SalesRecord.dataset_id == dataset_id)
        .group_by(SalesRecord.country)
        .order_by(func.sum(SalesRecord.total_sales).desc())
        .limit(10)
        .all()
    )

    sales_by_customer = (
        db.query(
            SalesRecord.customer_name,
            func.sum(SalesRecord.total_sales).label("total_sales"),
            func.count().label("order_count"),
        )
        .filter(SalesRecord.dataset_id == dataset_id)
        .group_by(SalesRecord.customer_name)
        .order_by(func.sum(SalesRecord.total_sales).desc())
        .limit(10)
        .all()
    )

    return DatasetAggregates(
        total_sales=total_sales,
        total_orders=total_orders,
        avg_order_value=round(avg_order, 2),
        sales_by_quarter=[
            QuarterlySales(year=r.year_id, quarter=r.order_quarter,
                           total_sales=r.total_sales, order_count=r.order_count)
            for r in sales_by_quarter
        ],
        sales_by_country=[
            CountrySales(country=r.country, total_sales=r.total_sales,
                         order_count=r.order_count)
            for r in sales_by_country
        ],
        sales_by_customer=[
            CustomerSales(customer_name=r.customer_name, total_sales=r.total_sales,
                          order_count=r.order_count)
            for r in sales_by_customer
        ],
    )
