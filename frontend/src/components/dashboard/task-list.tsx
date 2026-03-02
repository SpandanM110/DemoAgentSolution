"use client";

import { Task } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const priorityConfig = {
  P0: { label: "P0 - Critical", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  P1: { label: "P1 - High", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  P2: { label: "P2 - Medium", color: "bg-green-500/20 text-green-400 border-green-500/30" },
};

interface TaskListProps {
  tasks: Task[];
}

export function TaskList({ tasks }: TaskListProps) {
  if (!tasks.length) {
    return <p className="text-gray-500 text-sm">No tasks generated yet.</p>;
  }

  const grouped = {
    P0: tasks.filter((t) => t.priority === "P0"),
    P1: tasks.filter((t) => t.priority === "P1"),
    P2: tasks.filter((t) => t.priority === "P2"),
  };

  return (
    <div className="space-y-6">
      {(["P0", "P1", "P2"] as const).map((priority) => {
        const group = grouped[priority];
        if (!group.length) return null;
        const config = priorityConfig[priority];

        return (
          <div key={priority} className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-400">{config.label}</h3>
            <div className="space-y-2">
              {group.map((task) => (
                <Card key={task.id} className={`border ${config.color} bg-gray-900`}>
                  <CardHeader className="py-3 px-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-gray-200">
                        {task.id}: {task.title}
                      </CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {task.estimated_effort}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-3 pt-0">
                    <p className="text-xs text-gray-400">{task.description}</p>
                    {task.dependencies.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Depends on: {task.dependencies.join(", ")}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
