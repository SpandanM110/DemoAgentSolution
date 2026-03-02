export interface UploadResponse {
  session_id: string;
  filename: string;
  char_count: number;
  message: string;
}

export interface AnalyzeResponse {
  session_id: string;
  status: string;
  message: string;
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: "critical" | "high" | "medium" | "low";
}

export interface Task {
  id: string;
  problem_id: string;
  title: string;
  description: string;
  priority: "P0" | "P1" | "P2";
  estimated_effort: "small" | "medium" | "large";
  dependencies: string[];
}

export interface SpecialistOutput {
  agent: string;
  output?: Record<string, unknown>;
  error?: string;
}

export interface ResultsResponse {
  session_id: string;
  status: string;
  problems?: Problem[];
  prioritized_tasks?: Task[];
  specialist_outputs?: SpecialistOutput[];
  synthesized_solution?: Record<string, unknown>;
  final_report?: string;
  errors?: string[];
}

export interface WSMessage {
  type: "agent_start" | "agent_complete" | "agent_error" | "pipeline_complete" | "pipeline_error";
  agent: string | null;
  data: Record<string, unknown>;
  progress: number;
  message: string;
}

export type AgentName =
  | "problem_analyzer"
  | "task_prioritizer"
  | "research_agent"
  | "technical_agent"
  | "strategy_agent"
  | "solution_synthesizer"
  | "report_generator";

export type AgentStatus = "pending" | "running" | "complete" | "error";

export interface AgentInfo {
  name: AgentName;
  label: string;
  description: string;
  status: AgentStatus;
}

export const AGENTS: AgentInfo[] = [
  { name: "problem_analyzer", label: "Problem Analyzer", description: "Identifies problems from document", status: "pending" },
  { name: "task_prioritizer", label: "Task Prioritizer", description: "Creates prioritized task list", status: "pending" },
  { name: "research_agent", label: "Research Agent", description: "Best practices & frameworks", status: "pending" },
  { name: "technical_agent", label: "Technical Agent", description: "Implementation details", status: "pending" },
  { name: "strategy_agent", label: "Strategy Agent", description: "Roadmaps & KPIs", status: "pending" },
  { name: "solution_synthesizer", label: "Solution Synthesizer", description: "Merges specialist outputs", status: "pending" },
  { name: "report_generator", label: "Report Generator", description: "Executive-ready report", status: "pending" },
];
