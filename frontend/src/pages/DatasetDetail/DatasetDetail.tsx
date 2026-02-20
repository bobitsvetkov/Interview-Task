import { useNavigate } from "react-router-dom";
import { useDatasetDetail } from "../../hooks/useDatasetDetail";
import { useExport } from "../../hooks/useExport";
import { formatCurrency } from "../../utils/format";
import BarChartCard from "../../components/BarChartCard/BarChartCard";
import DataTable from "../../components/DataTable/DataTable";
import Pagination from "../../components/Pagination/Pagination";
import Spinner from "../../components/Spinner/Spinner";
import styles from "./DatasetDetail.module.css";

const COLUMNS = [
  { key: "order_number", label: "Order #" },
  { key: "order_date", label: "Date", format: (v: unknown) => new Date(v as string).toLocaleDateString() },
  { key: "customer_name", label: "Customer" },
  { key: "product_line", label: "Product Line" },
  { key: "status", label: "Status" },
  { key: "sales", label: "Sales", format: (v: unknown) => formatCurrency(v as number) },
  { key: "total_sales", label: "Total Sales", format: (v: unknown) => formatCurrency(v as number) },
  { key: "deal_size", label: "Deal Size" },
  { key: "country", label: "Country" },
];

const PRODUCT_LINES = ["Classic Cars", "Vintage Cars", "Motorcycles", "Trucks and Buses", "Planes", "Ships", "Trains"];

export default function DatasetDetail() {
  const navigate = useNavigate();
  const {
    id,
    data,
    loading,
    error,
    page,
    sortBy,
    sortDir,
    filters,
    totalPages,
    setPage,
    updateFilter,
    handleSort,
  } = useDatasetDetail();
  const { exporting, exportError, handleExport } = useExport(id);

  let content: React.ReactNode = null;
  if (loading && !data) {
    content = <Spinner />;
  } else if (data) {
    content = (
      <>
          <div className={styles.stats}>
            <div className={styles.stat_card}>
              <div className={styles.stat_label}>Total Sales</div>
              <div className={styles.stat_value}>
                {formatCurrency(data.aggregates.total_sales)}
              </div>
            </div>
            <div className={styles.stat_card}>
              <div className={styles.stat_label}>Total Orders</div>
              <div className={styles.stat_value}>{data.aggregates.total_orders.toLocaleString()}</div>
            </div>
            <div className={styles.stat_card}>
              <div className={styles.stat_label}>Avg Order Value</div>
              <div className={styles.stat_value}>
                {formatCurrency(data.aggregates.avg_order_value)}
              </div>
            </div>
            <div className={styles.stat_card}>
              <div className={styles.stat_label}>Record Count</div>
              <div className={styles.stat_value}>{data.total_records.toLocaleString()}</div>
            </div>
          </div>

          <div className={styles.chart_section}>
            <BarChartCard
              title="Sales by Quarter"
              data={data.aggregates.sales_by_quarter.map((d) => ({
                name: `${d.year} ${d.quarter}`,
                sales: Math.round(d.total_sales),
              }))}
            />
          </div>

          <div className={styles.charts_grid}>
            <BarChartCard
              title="Top Countries by Sales"
              horizontal
              labelWidth={75}
              margin={{ top: 5, right: 20, bottom: 5, left: 80 }}
              data={data.aggregates.sales_by_country.map((d) => ({
                name: d.country,
                sales: Math.round(d.total_sales),
              }))}
            />
            <BarChartCard
              title="Top Customers by Sales"
              horizontal
              labelWidth={115}
              margin={{ top: 5, right: 20, bottom: 5, left: 120 }}
              data={data.aggregates.sales_by_customer.map((d) => ({
                name: d.customer_name,
                sales: Math.round(d.total_sales),
              }))}
            />
          </div>

          <div className={styles.filters}>
            <div className={styles.filter_group}>
              <span className={styles.filter_label}>Status</span>
              <select
                className={styles.filter_select}
                value={filters.status}
                onChange={(e) => updateFilter("status", e.target.value)}
              >
                <option value="">All</option>
                <option value="Shipped">Shipped</option>
                <option value="Resolved">Resolved</option>
                <option value="Cancelled">Cancelled</option>
                <option value="On Hold">On Hold</option>
                <option value="Disputed">Disputed</option>
                <option value="In Process">In Process</option>
              </select>
            </div>
            <div className={styles.filter_group}>
              <span className={styles.filter_label}>Product Line</span>
              <select
                className={styles.filter_select}
                value={filters.productLine}
                onChange={(e) => updateFilter("productLine", e.target.value)}
              >
                <option value="">All</option>
                {PRODUCT_LINES.map((pl) => (
                  <option key={pl} value={pl}>{pl}</option>
                ))}
              </select>
            </div>
            <div className={styles.filter_group}>
              <span className={styles.filter_label}>Date From</span>
              <input
                type="date"
                className={styles.filter_input}
                value={filters.dateFrom}
                onChange={(e) => updateFilter("dateFrom", e.target.value)}
              />
            </div>
            <div className={styles.filter_group}>
              <span className={styles.filter_label}>Date To</span>
              <input
                type="date"
                className={styles.filter_input}
                value={filters.dateTo}
                onChange={(e) => updateFilter("dateTo", e.target.value)}
              />
            </div>
          </div>

          <div className={styles.table_section}>
            <DataTable
              records={data.records}
              columns={COLUMNS}
              sortBy={sortBy}
              sortDir={sortDir}
              onSort={handleSort}
            />
            {totalPages > 1 && (
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            )}
          </div>
        </>
    );
  }

  return (
    <div className={styles.main}>
      <div className={styles.top_bar}>
        <button className={styles.back_button} onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>
        {data && (
          <button
            className={styles.export_button}
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? "Exporting..." : "Export CSV"}
          </button>
        )}
      </div>

      {(error || exportError) && <div className={styles.error}>{error || exportError}</div>}

      {content}
    </div>
  );
}
