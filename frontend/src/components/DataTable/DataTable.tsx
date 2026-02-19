import type { SalesRecord } from "../../types/dataset";
import styles from "./DataTable.module.css";

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  format?: (value: unknown) => string;
}

function isSortable(col: Column): boolean {
  return col.sortable ?? true;
}

interface DataTableProps {
  records: SalesRecord[];
  columns: Column[];
  sortBy: string;
  sortDir: "asc" | "desc";
  onSort: (column: string) => void;
}

export default function DataTable({ records, columns, sortBy, sortDir, onSort }: Readonly<DataTableProps>) {
  if (records.length === 0) {
    return <div className={styles.empty}>No records found.</div>;
  }

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={isSortable(col) ? () => onSort(col.key) : undefined}
                style={isSortable(col) ? undefined : { cursor: "default" }}
              >
                {col.label}
                {isSortable(col) && sortBy === col.key && (
                  <span className={styles.sort_indicator}>
                    {sortDir === "asc" ? "▲" : "▼"}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id}>
              {columns.map((col) => {
                const value = record[col.key as keyof SalesRecord];
                return (
                  <td key={col.key}>
                    {col.format ? col.format(value) : String(value ?? "")}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
