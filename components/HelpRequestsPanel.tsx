"use client";

import { useEffect, useState, useCallback } from "react";
import { HandHelping, Check } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { HelpRequest, GroupMember } from "@/lib/types";

export default function HelpRequestsPanel({ groupId, isLead }: { groupId: number; members?: GroupMember[]; isLead?: boolean }) {
  const [requests, setRequests] = useState<HelpRequest[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setRequests(await api.get<HelpRequest[]>(`/groups/${groupId}/help-requests?open_only=true`));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load help requests.");
    }
  }, [groupId]);

  useEffect(() => {
    load();
  }, [load]);

  async function resolve(id: number) {
    await api.post(`/groups/${groupId}/help-requests/${id}/resolve`);
    load();
  }

  if (error) return <p className="text-sm text-danger">{error}</p>;
  if (requests === null) return <p className="text-sm text-muted">Loading…</p>;
  if (requests.length === 0) return <p className="text-sm text-muted">No open help requests right now.</p>;

  return (
    <div className="space-y-3">
      <h2 className="font-semibold text-lg">Help Requests</h2>
      {requests.map((r: any) => {
        return (
          <div key={r.id} className="bg-warning-bg border border-warning/30 rounded-lg p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-sm text-ink font-medium flex items-center gap-2 mb-2">
                  <HandHelping size={16} className="text-warning" /> 
                  {r.requested_by_name} needs help
                </p>
                {r.task_type && (
                  <div className="mb-2">
                    <span className="text-xs px-2 py-1 bg-warning/20 rounded-md font-medium text-ink">
                      Type: {r.task_type}
                    </span>
                  </div>
                )}
                {r.reason && (
                  <div className="mb-2">
                    <p className="text-xs font-medium text-ink mb-1">Reason:</p>
                    <p className="text-sm text-ink/90 bg-white/50 p-2 rounded">{r.reason}</p>
                  </div>
                )}
                {r.skill_needed && (
                  <p className="text-xs text-muted mb-1">
                    <span className="font-medium">Skill needed:</span> {r.skill_needed}
                  </p>
                )}
                {r.note && (
                  <p className="text-xs text-muted mt-2">
                    <span className="font-medium">Notes:</span> {r.note}
                  </p>
                )}
              </div>
              {isLead && (
                <button
                  onClick={() => resolve(r.id)}
                  title="Mark resolved"
                  className="shrink-0 text-success hover:bg-success-bg rounded p-1.5"
                >
                  <Check size={18} />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
