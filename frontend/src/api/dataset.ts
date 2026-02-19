import type { DatasetDetailResponse, DatasetQueryParams, DatasetSummary, UploadStats } from "../types/dataset";
import { request } from "./client";

export async function uploadCSV(file: File): Promise<UploadStats> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await request("/upload", {
    method: "POST",
    body: formData,
  });
  return res.json();
}

export async function listDatasets(): Promise<{ datasets: DatasetSummary[] }> {
  const res = await request("/datasets");
  return res.json();
}

export async function getDataset(
  id: number,
  params: DatasetQueryParams = {},
): Promise<DatasetDetailResponse> {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  }
  const qs = searchParams.toString();
  const path = qs ? `/datasets/${id}?${qs}` : `/datasets/${id}`;
  const res = await request(path);
  return res.json();
}

export async function getDatasetStatus(id: number): Promise<DatasetSummary> {
  const res = await request(`/datasets/${id}/status`);
  return res.json();
}

export async function exportDataset(id: number): Promise<void> {
  const res = await request(`/datasets/${id}/export`);

  const disposition = res.headers.get("Content-Disposition") || "";
  const match = /filename="?([^"]+)"?/.exec(disposition);
  const filename = match ? match[1] : `dataset_${id}.csv`;

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
