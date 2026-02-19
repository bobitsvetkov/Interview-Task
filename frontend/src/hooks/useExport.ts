import { useState } from "react";
import { exportDataset } from "../api/dataset";
import { getErrorMessage } from "../utils/error";

export function useExport(id: string | undefined) {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  const handleExport = async () => {
    if (!id || exporting) return;
    setExporting(true);
    setError("");
    try {
      await exportDataset(Number(id));
    } catch (err) {
      setError(getErrorMessage(err, "Export failed"));
    } finally {
      setExporting(false);
    }
  };

  return { exporting, exportError: error, handleExport };
}
