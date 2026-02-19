import type { DatasetSummary } from "../../types/dataset";
import { formatCurrency } from "../../utils/format";
import styles from "./DatasetsTable.module.css";

interface DatasetsTableProps {
  datasets: DatasetSummary[];
  onSelect: (id: number) => void;
}

const STATUS_STYLES: Record<string, string> = {
  ready: styles.status_ready,
  failed: styles.status_failed,
};

export default function DatasetsTable({ datasets, onSelect }: Readonly<DatasetsTableProps>) {
  if (datasets.length === 0) {
    return <div className={styles.empty}>No datasets yet. Upload a CSV to get started.</div>;
  }

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Filename</th>
            <th>Status</th>
            <th>Rows</th>
            <th>Total Sales</th>
            <th>Date Range</th>
            <th>Uploaded</th>
          </tr>
        </thead>
        <tbody>
          {datasets.map((ds) => {
            const isReady = ds.status === "ready";
            return (
              <tr key={ds.id} onClick={() => isReady ? onSelect(ds.id) : undefined}>
                <td>{ds.filename}</td>
                <td>
                  <span className={`${styles.status_badge} ${STATUS_STYLES[ds.status] ?? styles.status_processing}`}>
                    {ds.status}
                  </span>
                </td>
                <td>{isReady ? ds.row_count : "—"}</td>
                <td>{isReady ? formatCurrency(ds.total_sales) : "—"}</td>
                <td>
                  {isReady && ds.date_min && ds.date_max
                    ? `${new Date(ds.date_min).toLocaleDateString()} – ${new Date(ds.date_max).toLocaleDateString()}`
                    : "—"}
                </td>
                <td>{new Date(ds.created_at).toLocaleDateString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
