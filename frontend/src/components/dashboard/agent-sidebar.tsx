"use client";

import { useAnalysisStore } from "@/stores/analysis-store";
import { AGENTS } from "@/lib/types";
import { AgentCard } from "./agent-card";

export function AgentSidebar() {
  const agentStatuses = useAnalysisStore((s) => s.agentStatuses);
  const agentMessages = useAnalysisStore((s) => s.agentMessages);

  return (
    <aside className="w-72 border-r border-gray-800 p-4 space-y-3 overflow-y-auto bg-gray-950">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
        Agent Pipeline
      </h2>
      {AGENTS.map((agent) => (
        <AgentCard
          key={agent.name}
          label={agent.label}
          description={agent.description}
          status={agentStatuses[agent.name]}
          message={agentMessages[agent.name]}
        />
      ))}
    </aside>
  );
}
