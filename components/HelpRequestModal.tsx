"use client";

import { useState } from "react";
import Modal from "./Modal";
import { api, ApiError } from "@/lib/api";

export default function HelpRequestModal({
  groupId,
  taskId,
  onClose,
  onDone,
}: {
  groupId: number;
  taskId?: number | null;
  onClose: () => void;
  onDone: () => void;
}) {
  const [skillNeeded, setSkillNeeded] = useState("");
  const [taskType, setTaskType] = useState("");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.post(`/groups/${groupId}/help-requests`, {
        task_id: taskId || null,
        skill_needed: skillNeeded,
        task_type: taskType || null,
        reason: reason || null,
        note: note || null,
      });
      onDone();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create help request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Request Help" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="text-xs text-muted block mb-1">Skill/Area Needed *</label>
          <input
            required
            value={skillNeeded}
            onChange={(e) => setSkillNeeded(e.target.value)}
            placeholder="e.g., React, Python, API, Database"
            className="w-full border border-hairline rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">Task Type / Issue Type *</label>
          <input
            required
            value={taskType}
            onChange={(e) => setTaskType(e.target.value)}
            placeholder="e.g., Backend API error, UI bug, Database issue, Authentication..."
            className="w-full border border-hairline rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">Reason for Help *</label>
          <textarea
            required
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe the issue you're facing in detail..."
            className="w-full border border-hairline rounded-md px-3 py-2 text-sm resize-none"
          />
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">Additional Notes</label>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Any additional context, error messages, or files..."
            className="w-full border border-hairline rounded-md px-3 py-2 text-sm resize-none"
          />
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-3 py-1.5 text-sm border border-hairline rounded-md">
            Cancel
          </button>
          <button disabled={submitting} className="px-3 py-1.5 text-sm bg-primary text-white rounded-md disabled:opacity-60">
            {submitting ? "Submitting..." : "Request Help"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
