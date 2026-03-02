import { create } from "zustand";
import {
  AgentName,
  AgentStatus,
  Problem,
  Task,
  SpecialistOutput,
  WSMessage,
} from "@/lib/types";

interface AnalysisState {
  sessionId: string | null;
  filename: string | null;
  status: "idle" | "uploading" | "running" | "completed" | "error";
  progress: number;
  currentAgent: string | null;
  agentStatuses: Record<AgentName, AgentStatus>;
  agentMessages: Record<string, string>;
  problems: Problem[];
  tasks: Task[];
  specialistOutputs: SpecialistOutput[];
  synthesizedSolution: Record<string, unknown> | null;
  finalReport: string | null;
  errors: string[];

  // Actions
  setSession: (sessionId: string, filename: string) => void;
  setStatus: (status: AnalysisState["status"]) => void;
  handleWSMessage: (msg: WSMessage) => void;
  setResults: (data: {
    problems?: Problem[];
    tasks?: Task[];
    specialistOutputs?: SpecialistOutput[];
    synthesizedSolution?: Record<string, unknown> | null;
    finalReport?: string | null;
    errors?: string[];
  }) => void;
  reset: () => void;
}

const initialAgentStatuses: Record<AgentName, AgentStatus> = {
  problem_analyzer: "pending",
  task_prioritizer: "pending",
  research_agent: "pending",
  technical_agent: "pending",
  strategy_agent: "pending",
  solution_synthesizer: "pending",
  report_generator: "pending",
};

export const useAnalysisStore = create<AnalysisState>((set) => ({
  sessionId: null,
  filename: null,
  status: "idle",
  progress: 0,
  currentAgent: null,
  agentStatuses: { ...initialAgentStatuses },
  agentMessages: {},
  problems: [],
  tasks: [],
  specialistOutputs: [],
  synthesizedSolution: null,
  finalReport: null,
  errors: [],

  setSession: (sessionId, filename) =>
    set({ sessionId, filename, status: "uploading" }),

  setStatus: (status) => set({ status }),

  handleWSMessage: (msg) =>
    set((state) => {
      const updates: Partial<AnalysisState> = {
        progress: msg.progress,
      };

      if (msg.agent) {
        updates.currentAgent = msg.agent;
        updates.agentMessages = {
          ...state.agentMessages,
          [msg.agent]: msg.message,
        };
      }

      switch (msg.type) {
        case "agent_start":
          if (msg.agent) {
            updates.agentStatuses = {
              ...state.agentStatuses,
              [msg.agent]: "running" as AgentStatus,
            };
          }
          break;
        case "agent_complete":
          if (msg.agent) {
            updates.agentStatuses = {
              ...state.agentStatuses,
              [msg.agent]: "complete" as AgentStatus,
            };
          }
          break;
        case "agent_error":
          if (msg.agent) {
            updates.agentStatuses = {
              ...state.agentStatuses,
              [msg.agent]: "error" as AgentStatus,
            };
            updates.errors = [...state.errors, msg.message];
          }
          break;
        case "pipeline_complete":
          updates.status = "completed";
          updates.progress = 1;
          break;
        case "pipeline_error":
          updates.status = "error";
          updates.errors = [...state.errors, msg.message];
          break;
      }

      return updates;
    }),

  setResults: (data) =>
    set({
      problems: data.problems || [],
      tasks: data.tasks || [],
      specialistOutputs: data.specialistOutputs || [],
      synthesizedSolution: data.synthesizedSolution || null,
      finalReport: data.finalReport || null,
      errors: data.errors || [],
    }),

  reset: () =>
    set({
      sessionId: null,
      filename: null,
      status: "idle",
      progress: 0,
      currentAgent: null,
      agentStatuses: { ...initialAgentStatuses },
      agentMessages: {},
      problems: [],
      tasks: [],
      specialistOutputs: [],
      synthesizedSolution: null,
      finalReport: null,
      errors: [],
    }),
}));
