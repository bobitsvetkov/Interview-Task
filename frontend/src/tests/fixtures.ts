import type { DatasetSummary, SalesRecord } from '../types/dataset'

export const READY_DATASET: DatasetSummary = {
  id: 1,
  filename: 'sales_2024.csv',
  row_count: 2823,
  rows_dropped: 12,
  date_min: '2024-01-15',
  date_max: '2024-12-28',
  total_sales: 1250000,
  status: 'ready',
  created_at: '2024-06-01T10:30:00Z',
}

export const PROCESSING_DATASET: DatasetSummary = {
  id: 2,
  filename: 'q3_report.csv',
  row_count: 0,
  rows_dropped: 0,
  date_min: null,
  date_max: null,
  total_sales: 0,
  status: 'processing',
  created_at: '2024-06-02T14:00:00Z',
}

export const FAILED_DATASET: DatasetSummary = {
  id: 3,
  filename: 'bad_data.csv',
  row_count: 0,
  rows_dropped: 0,
  date_min: null,
  date_max: null,
  total_sales: 0,
  status: 'failed',
  created_at: '2024-06-03T09:15:00Z',
}

export function makeSalesRecord(overrides: Partial<SalesRecord> = {}): SalesRecord {
  return {
    id: 1,
    order_number: 10100,
    quantity_ordered: 30,
    price_each: 100,
    sales: 3000,
    order_date: '2024-03-15',
    status: 'Shipped',
    month_id: 3,
    year_id: 2024,
    product_line: 'Classic Cars',
    product_code: 'S10_1678',
    customer_name: 'Land of Toys Inc.',
    country: 'USA',
    deal_size: 'Medium',
    total_sales: 3000,
    order_quarter: 'Q1-2024',
    ...overrides,
  }
}

export const SAMPLE_RECORDS: SalesRecord[] = [
  makeSalesRecord({ id: 1, order_number: 10100, customer_name: 'Land of Toys Inc.', sales: 3000 }),
  makeSalesRecord({ id: 2, order_number: 10101, customer_name: 'Reims Collectables', sales: 5500, country: 'France' }),
  makeSalesRecord({ id: 3, order_number: 10102, customer_name: 'Tekni Collectables', sales: 1200, deal_size: 'Small' }),
]
