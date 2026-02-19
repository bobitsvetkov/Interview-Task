import { useCallback, useEffect, useState, useTransition } from "react";
import { uploadCSV, listDatasets, getDatasetStatus } from "../api/dataset";
import { usePolling } from "./usePolling";
import { getErrorMessage } from "../utils/error";
import type { DatasetSummary, UploadStats } from "../types/dataset";

const POLL_INTERVAL = 500;

export function useDashboard() {
  const [datasets, setDatasets] = useState<DatasetSummary[]>([]);
  const [uploadResult, setUploadResult] = useState<UploadStats | null>(null);
  const [isUploading, startUpload] = useTransition();
  const [error, setError] = useState("");
  const [pollingId, setPollingId] = useState<number | null>(null);

  const refreshDatasets = useCallback(async () => {
    const res = await listDatasets();
    setDatasets(res.datasets);
  }, []);

  const handlePoll = useCallback(async () => {
    if (!pollingId) return true;
    const status = await getDatasetStatus(pollingId);
    if (status.status === "ready") {
      setUploadResult((prev) =>
        prev ? { ...prev, status: "ready", row_count: status.row_count, rows_dropped: status.rows_dropped } : prev,
      );
      await refreshDatasets();
      return true;
    }
    if (status.status === "failed") {
      setError("Processing failed");
      setUploadResult(null);
      return true;
    }
    return false;
  }, [pollingId, refreshDatasets]);

  const { start: startPolling } = usePolling(handlePoll, POLL_INTERVAL);

  useEffect(() => {
    listDatasets()
      .then((res) => setDatasets(res.datasets))
      .catch(() => setError("Failed to load datasets"));
  }, []);

  const handleUpload = (file: File) => {
    setError("");
    setUploadResult(null);
    startUpload(async () => {
      try {
        const stats = await uploadCSV(file);
        setUploadResult(stats);
        await refreshDatasets();
        if (stats.status === "processing") {
          setPollingId(stats.dataset_id);
          startPolling();
        }
      } catch (err) {
        setError(getErrorMessage(err, "Upload failed"));
      }
    });
  };

  return {
    datasets,
    uploadResult,
    isUploading,
    error,
    isProcessing: uploadResult?.status === "processing",
    handleUpload,
  };
}
