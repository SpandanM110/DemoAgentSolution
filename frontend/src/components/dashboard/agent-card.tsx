"use client";

import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { AgentStatus } from "@/lib/types";

interface AgentCardProps {
  label: string;
  description: string;
  status: AgentStatus;
  message?: string;
}

const statusConfig: Record<AgentStatus, { icon: React.ReactNode; variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
  pending: { icon: <Circle className="h-3 w-3" />, variant: "outline", label: "Pending" },
  running: { icon: <Loader2 className="h-3 w-3 animate-spin" />, variant: "default", label: "Running" },
  complete: { icon: <CheckCircle2 className="h-3 w-3" />, variant: "secondary", label: "Done" },
  error: { icon: <AlertCircle className="h-3 w-3" />, variant: "destructive", label: "Error" },
};

export function AgentCard({ label, description, status, message }: AgentCardProps) {
  const config = statusConfig[status];

  return (
    <div
      className={`rounded-lg border p-3 space-y-1.5 transition-colors ${
        status === "running"
          ? "border-blue-500/50 bg-blue-950/20"
          : status === "complete"
          ? "border-green-500/30 bg-green-950/10"
          : status === "error"
          ? "border-red-500/30 bg-red-950/10"
          : "border-gray-800 bg-gray-900/50"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-200">{label}</span>
        <Badge variant={config.variant} className="text-xs gap-1">
          {config.icon}
          {config.label}
        </Badge>
      </div>
      <p className="text-xs text-gray-500">{description}</p>
      {message && status === "running" && (
        <p className="text-xs text-blue-400">{message}</p>
      )}
    </div>
  );
}
