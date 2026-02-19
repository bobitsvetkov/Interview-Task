from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, Query, UploadFile, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Dataset, SalesRecord, User
from app.schemas import (
    DatasetDetailResponse,
    DatasetListResponse,
    DatasetSummary,
    SalesRecordOut,
    UploadStats,
)
from app.services.aggregates import build_aggregates
from app.services.export import export_csv
from app.services.etl import parse_csv, process_dataset

router = APIRouter(prefix="/api", tags=["datasets"])


@router.post(
    "/upload",
    response_model=UploadStats,
    status_code=status.HTTP_201_CREATED,
    summary="Upload a CSV file for ETL processing",
)
def upload_csv(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Only CSV files are accepted")

    df = parse_csv(file)

    dataset = Dataset(
        user_id=user.id,
        filename=file.filename,
        row_count=0,
        rows_dropped=0,
        total_sales=0.0,
        status="processing",
    )
    db.add(dataset)
    db.commit()
    db.refresh(dataset)

    background_tasks.add_task(process_dataset, dataset.id, df)

    return UploadStats(
        dataset_id=dataset.id,
        status="processing",
        row_count=0,
        rows_dropped=0,
        date_min=None,
        date_max=None,
        total_sales=0.0,
    )


@router.get(
    "/datasets",
    response_model=DatasetListResponse,
    summary="List all datasets for the current user",
)
def list_datasets(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    datasets = (
        db.query(Dataset)
        .filter(Dataset.user_id == user.id)
        .order_by(Dataset.created_at.desc())
        .all()
    )
    return DatasetListResponse(
        datasets=[DatasetSummary.model_validate(d) for d in datasets]
    )


@router.get(
    "/datasets/{dataset_id}/status",
    response_model=DatasetSummary,
    summary="Poll dataset processing status",
)
def get_dataset_status(
    dataset_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    dataset = db.query(Dataset).filter(
        Dataset.id == dataset_id, Dataset.user_id == user.id
    ).first()
    if not dataset:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Dataset not found")
    return DatasetSummary.model_validate(dataset)


@router.get(
    "/datasets/{dataset_id}",
    response_model=DatasetDetailResponse,
    summary="Get dataset detail with paginated records and aggregates",
)
def get_dataset(
    dataset_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    sort_by: str = Query("order_number"),
    sort_dir: str = Query("asc", pattern="^(asc|desc)$"),
    status_filter: str | None = Query(None),
    product_line: str | None = Query(None),
    date_from: str | None = Query(None),
    date_to: str | None = Query(None),
):
    dataset = db.query(Dataset).filter(
        Dataset.id == dataset_id, Dataset.user_id == user.id
    ).first()
    if not dataset:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Dataset not found")

    q = db.query(SalesRecord).filter(SalesRecord.dataset_id == dataset_id)
    if status_filter:
        q = q.filter(SalesRecord.status == status_filter)
    if product_line:
        q = q.filter(SalesRecord.product_line == product_line)
    if date_from:
        q = q.filter(SalesRecord.order_date >= date_from)
    if date_to:
        q = q.filter(SalesRecord.order_date <= date_to)

    allowed_sort = {
        "order_number", "order_date", "sales", "total_sales",
        "customer_name", "product_line", "status", "deal_size",
    }
    col_name = sort_by if sort_by in allowed_sort else "order_number"
    col = getattr(SalesRecord, col_name)
    q = q.order_by(col.desc() if sort_dir == "desc" else col.asc())

    total_records = q.count()
    records = q.offset((page - 1) * page_size).limit(page_size).all()

    return DatasetDetailResponse(
        id=dataset.id,
        filename=dataset.filename,
        row_count=dataset.row_count,
        date_min=dataset.date_min,
        date_max=dataset.date_max,
        created_at=dataset.created_at,
        status=dataset.status,
        aggregates=build_aggregates(db, dataset_id),
        records=[SalesRecordOut.model_validate(r) for r in records],
        page=page,
        page_size=page_size,
        total_records=total_records,
    )


@router.get(
    "/datasets/{dataset_id}/export",
    summary="Export dataset records as CSV",
)
def export_dataset(
    dataset_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    dataset = db.query(Dataset).filter(
        Dataset.id == dataset_id, Dataset.user_id == user.id
    ).first()
    if not dataset:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Dataset not found")

    stem = dataset.filename.rsplit(".", 1)[0] if "." in dataset.filename else dataset.filename

    return StreamingResponse(
        export_csv(db, dataset_id),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{stem}.csv"'},
    )
