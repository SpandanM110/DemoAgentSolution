"use client";

import { useAnalysisStore } from "@/stores/analysis-store";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export function ProgressTracker() {
  const progress = useAnalysisStore((s) => s.progress);
  const status = useAnalysisStore((s) => s.status);
  const currentAgent = useAnalysisStore((s) => s.currentAgent);

  const percentage = Math.round(progress * 100);

  const statusLabel =
    status === "completed"
      ? "Analysis Complete"
      : status === "error"
      ? "Error Occurred"
      : currentAgent
      ? currentAgent.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : "Starting...";

  return (
    <div className="flex items-center gap-4 min-w-[300px]">
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
  );
}
