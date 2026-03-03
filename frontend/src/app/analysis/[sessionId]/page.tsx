"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useWebSocket } from "@/hooks/use-websocket";
import { useAnalysis } from "@/hooks/use-analysis";
import { useAnalysisStore } from "@/stores/analysis-store";
import { AgentSidebar } from "@/components/dashboard/agent-sidebar";
import { ProgressTracker } from "@/components/dashboard/progress-tracker";
import { ResultsPanel } from "@/components/dashboard/results-panel";

export default function AnalysisPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const status = useAnalysisStore((s) => s.status);
  const storeSessionId = useAnalysisStore((s) => s.sessionId);
  const { fetchResults } = useAnalysis();

  // Connect WebSocket
  useWebSocket(sessionId);

  // If navigated directly (no store session), set it
  useEffect(() => {
    if (!storeSessionId) {
      useAnalysisStore.setState({
        sessionId,
        status: "running",
      });
    }
  }, [sessionId, storeSessionId]);

  // Fetch results when completed or error (to get error message)
  useEffect(() => {
    if (status === "completed" || status === "error") {
      fetchResults(sessionId);
    }
  }, [status, sessionId, fetchResults]);

  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">
              Analysis Dashboard
            </h1>
            <p className="text-sm text-gray-400">Session: {sessionId.slice(0, 8)}...</p>
          </div>
          <ProgressTracker />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <AgentSidebar />
        <div className="flex-1 overflow-y-auto p-6">
          <ResultsPanel />
        </div>
      </div>
    </main>
  );
}
