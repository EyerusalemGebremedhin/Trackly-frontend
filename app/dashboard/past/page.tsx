"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";
import RequireAuth from "@/components/RequireAuth";
import { StatusBadge } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import type { Task } from "@/lib/types";

function PastPlansContent() {
  const [plans, setPlans] = useState<Task[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    api.get<Task[]>("/tasks/past").then(setPlans);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function restore(id: number) {
    setError(null);
    try {
      await api.post(`/tasks/${id}/unarchive`);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't restore that plan.");
    }
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-muted hover:text-primary mb-3">
          <ArrowLeft size={14} /> Back to my progress
        </Link>
        <h1 className="font-serif text-3xl text-accent">Past plans</h1>
        <p className="text-sm text-muted mt-1">
          Personal plans you've finished and moved out of your active board. Nothing here is deleted -
          restore one if it shouldn't have been moved.
        </p>
      </div>

      {error && (
        <div className="text-sm bg-danger-bg text-danger border-l-4 border-danger px-3 py-2 rounded mb-4">{error}</div>
      )}

      {plans === null ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : plans.length === 0 ? (
        <div className="bg-surface border border-hairline rounded-md p-8 text-center shadow-sm">
          <p className="text-sm text-muted">No past plans yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {plans.map((p) => (
            <div key={p.id} className="bg-surface border border-hairline rounded-md p-3 shadow-sm flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-ink font-medium">{p.title}</p>
                  <StatusBadge status={p.status} />
                </div>
                {p.period_type && <p className="text-xs text-muted mt-1 capitalize">{p.period_type} plan</p>}
              </div>
              <button
                onClick={() => restore(p.id)}
                title="Restore to active board"
                className="shrink-0 flex items-center gap-1.5 text-xs text-primary border border-primary rounded-md px-2.5 py-1.5 hover:bg-blush"
              >
                <RotateCcw size={13} /> Restore
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PastPlansPage() {
  return (
    <RequireAuth>
      <PastPlansContent />
    </RequireAuth>
  );
}
