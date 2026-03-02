import { UploadResponse, AnalyzeResponse, ResultsResponse } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function uploadDocument(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/api/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Upload failed" }));
    throw new Error(err.detail || "Upload failed");
  }

  return res.json();
}

export async function startAnalysis(sessionId: string): Promise<AnalyzeResponse> {
  const res = await fetch(`${API_URL}/api/analyze/${sessionId}`, {
    method: "POST",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Analysis failed to start" }));
    throw new Error(err.detail || "Analysis failed to start");
  }

  return res.json();
}

export async function getResults(sessionId: string): Promise<ResultsResponse> {
  const res = await fetch(`${API_URL}/api/results/${sessionId}`);

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to fetch results" }));
    throw new Error(err.detail || "Failed to fetch results");
  }

  return res.json();
}
