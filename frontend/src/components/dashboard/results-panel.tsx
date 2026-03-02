"use client";

import { useAnalysisStore } from "@/stores/analysis-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskList } from "./task-list";
import { ReportView } from "./report-view";

const severityColors: Record<string, string> = {
  critical: "bg-red-500/20 text-red-400",
  high: "bg-orange-500/20 text-orange-400",
  medium: "bg-yellow-500/20 text-yellow-400",
  low: "bg-green-500/20 text-green-400",
};

export function ResultsPanel() {
  const status = useAnalysisStore((s) => s.status);
  const problems = useAnalysisStore((s) => s.problems);
  const tasks = useAnalysisStore((s) => s.tasks);
  const specialistOutputs = useAnalysisStore((s) => s.specialistOutputs);
  const finalReport = useAnalysisStore((s) => s.finalReport);

  const researchOutput = specialistOutputs.find((s) => s.agent === "research_agent");
  const technicalOutput = specialistOutputs.find((s) => s.agent === "technical_agent");
  const strategyOutput = specialistOutputs.find((s) => s.agent === "strategy_agent");

  if (status === "running" && problems.length === 0) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <Tabs defaultValue="problems" className="w-full">
      <TabsList className="bg-gray-900 border border-gray-800">
        <TabsTrigger value="problems">Problems</TabsTrigger>
        <TabsTrigger value="tasks">Tasks</TabsTrigger>
        <TabsTrigger value="research">Research</TabsTrigger>
        <TabsTrigger value="technical">Technical</TabsTrigger>
        <TabsTrigger value="strategy">Strategy</TabsTrigger>
        <TabsTrigger value="report">Report</TabsTrigger>
      </TabsList>

      <TabsContent value="problems" className="mt-4 space-y-3">
        {problems.length === 0 ? (
          <p className="text-gray-500 text-sm">Waiting for problem analysis...</p>
        ) : (
          problems.map((problem) => (
            <Card key={problem.id} className="bg-gray-900 border-gray-800">
              <CardHeader className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-200">
                    {problem.id}: {problem.title}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">
                      {problem.category}
                    </Badge>
                    <Badge className={`text-xs ${severityColors[problem.severity] || ""}`}>
                      {problem.severity}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-3 pt-0">
                <p className="text-xs text-gray-400">{problem.description}</p>
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>

      <TabsContent value="tasks" className="mt-4">
        <TaskList tasks={tasks} />
      </TabsContent>

      <TabsContent value="research" className="mt-4">
        <SpecialistView output={researchOutput} label="Research" />
      </TabsContent>

      <TabsContent value="technical" className="mt-4">
        <SpecialistView output={technicalOutput} label="Technical" />
      </TabsContent>

      <TabsContent value="strategy" className="mt-4">
        <SpecialistView output={strategyOutput} label="Strategy" />
      </TabsContent>

      <TabsContent value="report" className="mt-4">
        <ReportView content={finalReport || ""} />
      </TabsContent>
    </Tabs>
  );
}

function SpecialistView({
  output,
  label,
}: {
  output: { agent: string; output?: Record<string, unknown>; error?: string } | undefined;
  label: string;
}) {
  if (!output) {
    return <p className="text-gray-500 text-sm">Waiting for {label} agent...</p>;
  }

  if (output.error) {
    return (
      <div className="text-red-400 text-sm">
        Error from {label} agent: {output.error}
      </div>
    );
  }

  const data = output.output;
  if (!data) return null;

  // Render the specialist output as structured cards
  const entries = Object.entries(data).filter(([key]) => key !== "agent");

  return (
    <div className="space-y-4">
      {entries.map(([key, value]) => (
        <Card key={key} className="bg-gray-900 border-gray-800">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-medium text-gray-300 capitalize">
              {key.replace(/_/g, " ")}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-0">
            {Array.isArray(value) ? (
              <div className="space-y-3">
                {(value as Record<string, unknown>[]).map((item, i) => (
                  <div key={i} className="border border-gray-800 rounded p-3 space-y-2">
                    {Object.entries(item).map(([k, v]) => (
                      <div key={k}>
                        <span className="text-xs font-medium text-gray-400 capitalize">
                          {k.replace(/_/g, " ")}:{" "}
                        </span>
                        <span className="text-xs text-gray-300">
                          {Array.isArray(v) ? (v as string[]).join(", ") : String(v)}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <pre className="text-xs text-gray-400 whitespace-pre-wrap">
                {typeof value === "string" ? value : JSON.stringify(value, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
