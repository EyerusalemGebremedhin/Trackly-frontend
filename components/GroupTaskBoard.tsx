"use client";

import { useState } from "react";
import { Clock, User, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import type { Task, TaskStatus, TaskPeriodType } from "@/lib/types";

const COLUMNS: { key: TaskStatus; label: string }[] = [
  { key: "todo", label: "To be done" },
  { key: "in_progress", label: "In progress" },
  { key: "in_review", label: "In review" },
  { key: "done", label: "Done" },
];

const STATUS_OPTIONS: TaskStatus[] = ["todo", "in_progress", "in_review", "done"];
const PERIOD_OPTIONS: TaskPeriodType[] = ["daily", "weekly", "monthly"];
const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "To be done",
  in_progress: "In progress",
  in_review: "In review",
  blocked: "Blocked",
  done: "Done",
};

function GroupTaskCard({ task, onChanged, members }: { task: Task; onChanged: () => void; members?: any[] }) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const overdue = task.deadline && task.status !== "done" && new Date(task.deadline) < new Date();
  const assignee = members?.find(m => m.user_id === task.assignee_id);

  async function patch(body: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    try {
      await api.patch(`/tasks/${task.id}`, body);
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't update that.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-surface border border-hairline rounded-md p-3 shadow-sm space-y-2">
      <p className="text-sm text-ink font-medium leading-snug">{task.title}</p>
      {task.description && <p className="text-xs text-muted">{task.description}</p>}

      <div className="flex items-center gap-2 flex-wrap">
        {task.deadline && (
          <span className={`flex items-center gap-1 text-xs ${overdue ? "text-danger" : "text-muted"}`}>
            <Clock size={11} /> {task.deadline}
          </span>
        )}
        {assignee && (
          <span className="flex items-center gap-1 text-xs text-muted">
            <User size={11} /> {assignee.name}
          </span>
        )}
        <select
          value={task.period_type ?? ""}
          disabled={busy}
          onChange={(e) => patch({ period_type: e.target.value || null })}
          className="text-xs border border-hairline rounded px-1.5 py-0.5 bg-paper text-ink capitalize focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">Once</option>
          {PERIOD_OPTIONS.map((p) => (
            <option key={p} value={p} className="capitalize">
              {p}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-xs text-danger">{error}</p>}

      <div className="pt-1">
        <select
          value={task.status}
          disabled={busy}
          onChange={(e) => patch({ status: e.target.value as TaskStatus })}
          className="text-xs border border-hairline rounded px-1.5 py-1 bg-paper text-ink focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default function GroupTaskBoard({ tasks, onChanged, members, doneCount = 0, groupId }: { tasks: Task[]; onChanged: () => void; members?: any[]; doneCount?: number; groupId?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {COLUMNS.map((col) => {
        if (col.key === "done") {
          return (
            <div key={col.key} className="bg-paper rounded-md">
              <div className="flex items-center justify-between mb-2 px-0.5">
                <p className="text-xs font-medium text-muted uppercase tracking-wide flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-green-600" /> Done
                </p>
                <span className="text-xs text-green-700 bg-green-100 rounded-full w-5 h-5 flex items-center justify-center">
                  {doneCount}
                </span>
              </div>
              <Link
                href={groupId ? `/completed?group=${groupId}` : "/completed"}
                className="mt-2 flex flex-col items-center gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-6 text-center transition-colors hover:bg-green-100"
              >
                <span className="grid h-12 w-12 place-items-center rounded-full bg-green-600 text-white">
                  <CheckCircle2 size={28} />
                </span>
                <span className="text-2xl font-semibold text-green-700">{doneCount}</span>
                <span className="text-sm text-green-800">
                  {doneCount === 1 ? "task completed" : "tasks completed"}
                </span>
                <span className="text-xs font-medium text-green-700 underline">View all completed</span>
              </Link>
            </div>
          );
        }
        const colTasks = tasks.filter((t) => t.status === col.key);
        return (
          <div key={col.key} className="bg-paper rounded-md">
            <div className="flex items-center justify-between mb-2 px-0.5">
              <p className="text-xs font-medium text-muted uppercase tracking-wide">{col.label}</p>
              <span className="text-xs text-muted bg-surface border border-hairline rounded-full w-5 h-5 flex items-center justify-center">
                {colTasks.length}
              </span>
            </div>
            <div className="space-y-2 min-h-[60px]">
              {colTasks.map((t) => (
                <GroupTaskCard key={t.id} task={t} onChanged={onChanged} members={members} />
              ))}
              {colTasks.length === 0 && (
                <div className="border border-dashed border-hairline rounded-md p-3 text-center text-xs text-muted">
                  Nothing here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
