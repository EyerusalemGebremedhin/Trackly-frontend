"use client";

import { api } from "@/lib/api";
import type { Task } from "@/lib/types";
import { Clock } from "lucide-react";
import clsx from "clsx";

const STATUS = [
  { value: "todo", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "in_review", label: "In review" },
  { value: "blocked", label: "Blocked" },
  { value: "done", label: "Done" },
] as const;

export default function TaskBoard({ tasks, onChanged, isLead }: { tasks: Task[]; onChanged?: () => void; isLead?: boolean }) {
  async function updateStatus(id: number, status: string) {
    await api.patch(`/tasks/${id}`, { status });
    if (onChanged) onChanged();
  }

  if (!tasks || tasks.length === 0) {
    return <p className="text-sm text-muted">No tasks yet.</p>;
  }

  return (
    <div className="bg-surface border border-hairline rounded-md overflow-hidden shadow-sm">
      <div className="divide-y divide-hairline">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center gap-4 px-4 py-3">
            <div className="flex-1 min-w-0">
              <p className={clsx("text-sm", task.status === "done" && "line-through text-muted")}>
                {task.title}
              </p>
              {(task.deadline || task.due_date) && (
                <p className="text-xs text-muted flex items-center gap-1 mt-1">
                  <Clock size={12} /> Due {task.deadline || task.due_date}
                </p>
              )}
            </div>
            <select
              value={task.status}
              onChange={(e) => updateStatus(task.id, e.target.value)}
              className="text-xs border border-hairline rounded-md px-2 py-1 bg-paper"
            >
              {STATUS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
