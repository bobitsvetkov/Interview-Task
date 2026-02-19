export interface UploadStats {
  dataset_id: number;
  status: string;
  row_count: number;
  rows_dropped: number;
  date_min: string | null;
  date_max: string | null;
  total_sales: number;
}

export interface DatasetSummary {
  id: number;
  filename: string;
  row_count: number;
  rows_dropped: number;
  date_min: string | null;
  date_max: string | null;
  total_sales: number;
  status: string;
  created_at: string;
}

export interface SalesRecord {
  id: number;
  order_number: number;
  quantity_ordered: number;
  price_each: number;
  sales: number;
  order_date: string;
  status: string;
  month_id: number;
  year_id: number;
  product_line: string;
  product_code: string;
  customer_name: string;
  country: string;
  deal_size: string;
  total_sales: number;
  order_quarter: string;
}

export interface QuarterlySales {
  year: number;
  quarter: string;
  total_sales: number;
  order_count: number;
}

export interface CountrySales {
  country: string;
  total_sales: number;
  order_count: number;
}

export interface CustomerSales {
  customer_name: string;
  total_sales: number;
  order_count: number;
}

export interface ProductLineSales {
  product_line: string;
  total_sales: number;
  order_count: number;
}

export interface DealSizeBreakdown {
  deal_size: string;
  total_sales: number;
}

export interface DatasetAggregates {
  total_sales: number;
  total_orders: number;
  avg_order_value: number;
  sales_by_quarter: QuarterlySales[];
  sales_by_country: CountrySales[];
  sales_by_customer: CustomerSales[];
}

export interface DatasetDetailResponse {
  id: number;
  filename: string;
  row_count: number;
  date_min: string | null;
  date_max: string | null;
  created_at: string;
  status: string;
  aggregates: DatasetAggregates;
  records: SalesRecord[];
  page: number;
  page_size: number;
  total_records: number;
}

export interface DatasetQueryParams {
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
  status_filter?: string;
  product_line?: string;
  date_from?: string;
  date_to?: string;
}
