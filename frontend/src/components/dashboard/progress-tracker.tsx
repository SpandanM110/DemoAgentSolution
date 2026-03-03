"use client";

import { useAnalysisStore } from "@/stores/analysis-store";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export function ProgressTracker() {
  const progress = useAnalysisStore((s) => s.progress);
  const status = useAnalysisStore((s) => s.status);
  const currentAgent = useAnalysisStore((s) => s.currentAgent);
  const errors = useAnalysisStore((s) => s.errors);

  const percentage = Math.round(progress * 100);
  const errorMessage = errors.length > 0 ? errors[errors.length - 1] : null;

  const statusLabel =
    status === "completed"
      ? "Analysis Complete"
      : status === "error"
      ? "Error Occurred"
      : currentAgent
      ? currentAgent.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : "Starting...";

  return (
    <div className="flex flex-col gap-2 min-w-[300px] max-w-md">
      <div className="flex items-center gap-4">
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">{statusLabel}</span>
            <span className="text-gray-500">{percentage}%</span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>
        <Badge
        variant={
          status === "completed"
            ? "secondary"
            : status === "error"
            ? "destructive"
            : "default"
        }
      >
        {status === "completed"
          ? "Done"
          : status === "error"
          ? "Error"
          : "Running"}
      </Badge>
      </div>
      {status === "error" && errorMessage && (
        <p className="text-xs text-red-400 truncate" title={errorMessage}>
          {errorMessage}
        </p>
      )}
    </div>
  );
}
