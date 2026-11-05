"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import RequireAuth from "@/components/RequireAuth";
import Link from "next/link";
import MyTaskBoard from "@/components/MyTaskBoard";
import NewPlanModal from "@/components/NewPlanModal";
import CheckinForm from "@/components/CheckinForm";
import InsightPanel from "@/components/InsightPanel";
import { api } from "@/lib/api";
import type { MyDashboard } from "@/lib/types";
import { Plus, CheckCircle2 } from "lucide-react";

const isDone = (t: any) => String(t.status).toLowerCase() === "done";

function TasksContent() {
  const [dash, setDash] = useState<MyDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [newPlanOpen, setNewPlanOpen] = useState(false);
  const [toast, setToast] = useState(false);
  const prevDone = useRef<number | null>(null);

  const load = useCallback(async () => {
    const data = await api.get<MyDashboard>("/dashboard/me");
    const doneNow = data.tasks.filter(isDone).length;

    if (prevDone.current !== null && doneNow > prevDone.current) {
      setToast(true);
      setTimeout(() => setToast(false), 4000);
    }
    prevDone.current = doneNow;

    setDash(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading || !dash) {
    return <p className="text-sm text-muted">Loading…</p>;
  }

  const active = dash.tasks.filter((t: any) => !isDone(t));
  const doneCount = dash.tasks.length - active.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-3xl text-accent">My tasks</h1>
          <p className="text-sm text-muted mt-1">All of your personal and assigned tasks in one place.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/completed"
            className="flex items-center gap-1.5 text-muted hover:text-ink border border-hairline rounded-md px-3 py-2 text-sm font-medium transition-colors"
          >
            <CheckCircle2 size={14} className="text-green-600" /> Completed
            {doneCount > 0 && (
              <span className="rounded-full bg-green-100 text-green-700 px-1.5 text-[11px] font-semibold">
                {doneCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => setNewPlanOpen(true)}
            className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white rounded-md px-3 py-2 text-sm font-medium"
          >
            <Plus size={14} /> New plan
          </button>
        </div>
      </div>

      {toast && (
        <div
          role="status"
          className="mb-4 flex items-center gap-2 rounded-md border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800"
        >
          <CheckCircle2 size={18} className="text-green-600 shrink-0" />
          Task completed.
          <Link href="/completed" className="ml-auto font-medium underline">
            View in Completed
          </Link>
        </div>
      )}

      {active.length === 0 && doneCount === 0 ? (
        <div className="bg-surface border border-hairline rounded-md p-8 text-center shadow-sm">
          <CheckCircle2 size={28} className="mx-auto mb-2 text-green-600" />
          <p className="text-sm text-muted">
            {doneCount > 0 ? "You're all caught up. Finished tasks are in Completed." : "No tasks yet."}
          </p>
        </div>
      ) : (
        <div className="mb-6">
          <MyTaskBoard tasks={active} doneCount={doneCount} onChanged={load} />
        </div>
      )}

      <div>
        <CheckinForm onDone={load} />
      </div>

      <div className="mt-6">
        <InsightPanel endpoint={(period, refresh) => `/insights/me?period=${period}&refresh=${refresh}`} />
      </div>

      {newPlanOpen && (
        <NewPlanModal
          onClose={() => setNewPlanOpen(false)}
          onDone={() => {
            setNewPlanOpen(false);
            load();
          }}
        />
      )}
    </div>
  );
}

export default function TasksPage() {
  return (
    <RequireAuth>
      <TasksContent />
    </RequireAuth>
  );
}
