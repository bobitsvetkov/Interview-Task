import io

import pandas as pd
from sqlalchemy.orm import Session

from app.models import SalesRecord

INTERNAL_COLUMNS = {"id", "dataset_id", "dataset"}


def export_csv(db: Session, dataset_id: int) -> io.BytesIO:
    records = (
        db.query(SalesRecord)
        .filter(SalesRecord.dataset_id == dataset_id)
        .order_by(SalesRecord.order_number)
        .all()
    )
    columns = [c.key for c in SalesRecord.__table__.columns if c.key not in INTERNAL_COLUMNS]
    rows = [{col: getattr(r, col) for col in columns} for r in records]
    buf = io.BytesIO()
    pd.DataFrame(rows, columns=columns).to_csv(buf, index=False)
    buf.seek(0)
    return buf
