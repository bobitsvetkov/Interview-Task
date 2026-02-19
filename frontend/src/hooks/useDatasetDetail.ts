import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDataset } from "../api/dataset";
import type { DatasetDetailResponse, DatasetQueryParams } from "../types/dataset";
import { getErrorMessage } from "../utils/error";

const PAGE_SIZE = 20;

export interface Filters {
  status: string;
  productLine: string;
  dateFrom: string;
  dateTo: string;
}

const INITIAL_FILTERS: Filters = {
  status: "",
  productLine: "",
  dateFrom: "",
  dateTo: "",
};

export function useDatasetDetail() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<DatasetDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("order_number");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const params: DatasetQueryParams = {
        page,
        page_size: PAGE_SIZE,
        sort_by: sortBy,
        sort_dir: sortDir,
      };
      if (filters.status) params.status_filter = filters.status;
      if (filters.productLine) params.product_line = filters.productLine;
      if (filters.dateFrom) params.date_from = filters.dateFrom;
      if (filters.dateTo) params.date_to = filters.dateTo;

      const result = await getDataset(Number(id), params);
      setData(result);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load dataset"));
    } finally {
      setLoading(false);
    }
  }, [id, page, sortBy, sortDir, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSort = (column: string) => {
    if (column === sortBy) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortDir("asc");
    }
    setPage(1);
  };

  const updateFilter = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const totalPages = data ? Math.ceil(data.total_records / PAGE_SIZE) : 0;

  return {
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
  };
}
