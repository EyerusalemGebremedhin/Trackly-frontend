"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRightLeft, Search } from "lucide-react";
import RequireAuth from "@/components/RequireAuth";
import Modal from "@/components/Modal";
import { api, ApiError } from "@/lib/api";
import type { Group, GroupMember, Task, TaskStatus } from "@/lib/types";

const RESTORE_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "To be done" },
  { value: "in_progress", label: "In progress" },
  { value: "in_review", label: "In review" },
];

function monthLabel(iso: string | null) {
  if (!iso) return "Earlier";
  return new Date(iso).toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function dayLabel(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function ReassignDoneModal({
  task,
  onClose,
  onDone,
}: {
  task: Task;
  onClose: () => void;
  onDone: () => void;
}) {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [newAssignee, setNewAssignee] = useState<number | "">("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get<GroupMember[]>(`/groups/${task.group_id}/members`).then(setMembers).catch(() => setMembers([]));
  }, [task.group_id]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!newAssignee || !reason.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.post(`/tasks/${task.id}/reassign`, { new_assignee_id: newAssignee, reason });
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't reassign this task.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title={`Assign "${task.title}" again`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <p className="text-xs text-muted">
          The task goes back to To be done for the person you choose. The reason is kept in its history.
        </p>
        <div>
          <label className="text-xs text-muted block mb-1">Assign to</label>
          <select
            required
            value={newAssignee}
            onChange={(e) => setNewAssignee(Number(e.target.value))}
            className="w-full border border-hairline rounded-md px-3 py-2 text-sm bg-paper text-ink focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Choose a member…</option>
            {members
              .filter((m) => m.user_id !== task.assignee_id)
              .map((m) => (
                <option key={m.user_id} value={m.user_id}>
                  {m.name}
                </option>
              ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">Reason (required)</label>
          <textarea
            required
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. the first version needs rework by someone with design skills"
            className="w-full border border-hairline rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary hover:bg-primary-hover text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-60"
        >
          {submitting ? "Assigning…" : "Assign again"}
        </button>
      </form>
    </Modal>
  );
}

function CompletedContent() {
  const searchParams = useSearchParams();
  const groupParam = searchParams.get("group");
  const groupId = groupParam ? Number(groupParam) : null;

  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [groups, setGroups] = useState<Record<number, Group>>({});
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reassignTask, setReassignTask] = useState<Task | null>(null);

  const load = useCallback(async () => {
    const path = groupId ? `/tasks/completed?group_id=${groupId}` : "/tasks/completed";
    setTasks(await api.get<Task[]>(path));
  }, [groupId]);

  useEffect(() => {
    load().catch(() => setTasks([]));
  }, [load]);

  useEffect(() => {
    Promise.all([
      api.get<Group[]>("/groups").catch(() => [] as Group[]),
      api.get<Group[]>("/groups/past").catch(() => [] as Group[]),
    ]).then(([active, past]) => {
      const map: Record<number, Group> = {};
      [...active, ...past].forEach((g) => {
        map[g.id] = g;
      });
      setGroups(map);
    });
  }, []);

  async function restore(task: Task, status: TaskStatus) {
    setError(null);
    setMessage(null);
    try {
      await api.patch(`/tasks/${task.id}`, { status });
      const label = RESTORE_OPTIONS.find((o) => o.value === status)?.label ?? status;
      setMessage(`"${task.title}" is back on the board under ${label}.`);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't restore that task.");
    }
  }

  const visible = useMemo(() => {
    if (!tasks) return [];
    const q = query.trim().toLowerCase();
    return q ? tasks.filter((t) => t.title.toLowerCase().includes(q)) : tasks;
  }, [tasks, query]);

  const byMonth = useMemo(() => {
    const out: { label: string; items: Task[] }[] = [];
    visible.forEach((t) => {
      const label = monthLabel(t.completed_at ?? t.created_at);
      const last = out[out.length - 1];
      if (last && last.label === label) last.items.push(t);
      else out.push({ label, items: [t] });
    });
    return out;
  }, [visible]);

  const scopeGroup = groupId ? groups[groupId] : null;
  const backHref = groupId ? `/groups/${groupId}` : "/dashboard";
  const backLabel = groupId ? "Back to the group" : "Back to my progress";

  return (
    <div>
      <div className="mb-6">
        <Link href={backHref} className="flex items-center gap-1.5 text-sm text-muted hover:text-primary mb-3">
          <ArrowLeft size={14} /> {backLabel}
        </Link>
        <h1 className="font-serif text-3xl text-accent">Completed work</h1>
        <p className="text-sm text-muted mt-1">
          {scopeGroup ? `Finished work in ${scopeGroup.name}. ` : "Everything you have finished. "}
          Nothing here is deleted. Bring a task back to the board, or assign it again if it needs to be redone.
        </p>
      </div>

      {message && (
        <div className="text-sm bg-success-bg text-success border-l-4 border-success px-3 py-2 rounded mb-4">{message}</div>
      )}
      {error && (
        <div className="text-sm bg-danger-bg text-danger border-l-4 border-danger px-3 py-2 rounded mb-4">{error}</div>
      )}

      {tasks === null ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : tasks.length === 0 ? (
        <div className="bg-surface border border-hairline rounded-md p-8 text-center shadow-sm">
          <p className="text-sm text-muted">Nothing completed yet. Finished tasks will be saved here.</p>
        </div>
      ) : (
        <>
          <div className="relative mb-6 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search completed work"
              className="w-full bg-paper text-ink border border-hairline rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {byMonth.length === 0 && <p className="text-sm text-muted">No completed work matches that search.</p>}

          <div className="space-y-8">
            {byMonth.map((section) => (
              <div key={section.label}>
                <h2 className="font-serif text-lg text-accent mb-3">
                  {section.label} <span className="text-sm text-muted font-sans">({section.items.length})</span>
                </h2>
                <div className="space-y-2">
                  {section.items.map((t) => {
                    const group = t.group_id ? groups[t.group_id] : null;
                    const canReassign = !!t.group_id && group?.my_role === "lead";
                    return (
                      <div
                        key={t.id}
                        className="bg-surface border border-hairline rounded-md p-3 shadow-sm flex items-center justify-between gap-3 flex-wrap"
                      >
                        <div className="min-w-0">
                          <p className="text-sm text-ink font-medium">{t.title}</p>
                          <div className="flex items-center gap-2 flex-wrap mt-1">
                            <span className="text-xs bg-blush text-primary px-1.5 py-0.5 rounded font-medium">
                              {t.group_id ? group?.name ?? "Group task" : "Personal"}
                            </span>
                            {t.period_type && <span className="text-xs text-muted capitalize">{t.period_type}</span>}
                            {t.completed_at && (
                              <span className="text-xs text-muted">Completed {dayLabel(t.completed_at)}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <select
                            value=""
                            onChange={(e) => e.target.value && restore(t, e.target.value as TaskStatus)}
                            className="text-xs border border-primary text-primary rounded-md px-2 py-1.5 bg-paper focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            <option value="">Restore to…</option>
                            {RESTORE_OPTIONS.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                          {canReassign && (
                            <button
                              onClick={() => setReassignTask(t)}
                              className="flex items-center gap-1.5 text-xs text-muted hover:text-primary border border-hairline rounded-md px-2.5 py-1.5"
                            >
                              <ArrowRightLeft size={13} /> Assign again
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {reassignTask && (
        <ReassignDoneModal
          task={reassignTask}
          onClose={() => setReassignTask(null)}
          onDone={() => {
            setMessage(`"${reassignTask.title}" was assigned again and is back on the board under To be done.`);
            setReassignTask(null);
            load();
          }}
        />
      )}
    </div>
  );
}

export default function CompletedPage() {
  return (
    <RequireAuth>
      <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
        <CompletedContent />
      </Suspense>
    </RequireAuth>
  );
}
