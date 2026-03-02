"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAnalysis } from "@/hooks/use-analysis";
import { useAnalysisStore } from "@/stores/analysis-store";

const ACCEPTED_TYPES = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "text/plain": [".txt"],
};

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export function DocumentUpload() {
  const [error, setError] = useState<string | null>(null);
  const status = useAnalysisStore((s) => s.status);
  const { handleUploadAndAnalyze } = useAnalysis();
  const isLoading = status === "uploading" || status === "running";

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setError(null);
      const file = acceptedFiles[0];
      if (!file) return;

      try {
        await handleUploadAndAnalyze(file);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      }
    },
    [handleUploadAndAnalyze]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_SIZE,
    multiple: false,
    disabled: isLoading,
    onDropRejected: (rejections) => {
      const rejection = rejections[0];
      if (rejection?.errors[0]?.code === "file-too-large") {
        setError("File too large. Maximum size is 10MB.");
      } else if (rejection?.errors[0]?.code === "file-invalid-type") {
        setError("Invalid file type. Use PDF, DOCX, or TXT.");
      } else {
        setError("File rejected. Please try again.");
      }
    },
  });

  return (
    <div className="space-y-4">
      <Card
        {...getRootProps()}
        className={`border-2 border-dashed cursor-pointer transition-colors bg-gray-900 ${
          isDragActive
            ? "border-blue-500 bg-blue-950/20"
            : "border-gray-700 hover:border-gray-500"
        } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
          <input {...getInputProps()} />
          {isLoading ? (
            <>
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
              <p className="text-gray-400">Processing document...</p>
            </>
          ) : isDragActive ? (
            <>
              <Upload className="h-12 w-12 text-blue-500" />
              <p className="text-blue-400">Drop your document here</p>
            </>
          ) : (
            <>
              <FileText className="h-12 w-12 text-gray-500" />
              <div className="space-y-2">
                <p className="text-gray-300">
                  Drag & drop your document here, or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  Supports PDF, DOCX, and TXT (max 10MB)
                </p>
              </div>
              <Button variant="outline" className="mt-2">
                Select File
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
