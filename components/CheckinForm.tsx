"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { PeriodType } from "@/lib/types";

export default function CheckinForm({
  groupId,
  defaultGoal,
  cadence = "daily",
  onSubmitted,
}: {
  groupId?: number | null;
  defaultGoal?: string;
  cadence?: PeriodType;
  onSubmitted?: () => void;
}) {
  const [goal, setGoal] = useState(defaultGoal ?? "");
  const [achieved, setAchieved] = useState("");
  const [wentWell, setWentWell] = useState("");
  const [didntGoWell, setDidntGoWell] = useState("");
  const [improve, setImprove] = useState("");
  const [blocker, setBlocker] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [groups, setGroups] = useState<any[]>([]);
  const [scope, setScope] = useState<string>(groupId ? String(groupId) : "individual");

  useEffect(() => {
    if (groupId) {
      setScope(String(groupId));
      return;
    }
    api
      .get<any[]>("/groups")
      .then((res) => setGroups(res || []))
      .catch(() => setGroups([]));
  }, [groupId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post("/checkins", {
        group_id: scope === "individual" ? null : groupId ? groupId : isNaN(Number(scope)) ? scope : Number(scope),
        goal: goal || null,
        achieved,
        went_well: wentWell || null,
        didnt_go_well: didntGoWell || null,
        improve: improve || null,
        blocker: blocker || null,
        period_type: cadence,
      });
      setDone(true);
      setAchieved("");
      setWentWell("");
      setDidntGoWell("");
      setImprove("");
      setBlocker("");
      onSubmitted?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't submit that. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const periodLabel = cadence === "daily" ? "today" : cadence === "weekly" ? "this week" : "this sprint";

  return (
    <form onSubmit={handleSubmit} className="bg-surface border border-hairline rounded-md p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg text-accent">Check in for {periodLabel}</h3>
        {done && <span className="text-xs text-success">Submitted ✓</span>}
      </div>

      {error && (
        <div className="text-sm bg-danger-bg text-danger border-l-4 border-danger px-3 py-2 rounded">
          {error}
        </div>
      )}

      {!groupId && groups.length > 0 && (
        <div>
          <label className="block text-sm text-ink mb-1">This check-in is for</label>
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            className="border border-hairline rounded px-2 py-1.5 bg-paper text-ink"
          >
            <option value="individual">Individual</option>
            {groups.map((g: any) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
      )}

      <Field label="Goal" value={goal} onChange={setGoal} placeholder="What are you aiming for this period?" />
      <Field label="Achieved" required value={achieved} onChange={setAchieved} placeholder="What actually got done" />
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="What went well" value={wentWell} onChange={setWentWell} />
        <Field label="What didn't go well" value={didntGoWell} onChange={setDidntGoWell} />
      </div>
      <Field label="What to improve" value={improve} onChange={setImprove} />
      <Field
        label="Blocker (flags your lead)"
        value={blocker}
        onChange={setBlocker}
        placeholder="Anything stopping you right now?"
        accent
      />

      <button
        type="submit"
        disabled={submitting}
        className="bg-primary hover:bg-primary-hover text-white rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60"
      >
        {submitting ? "Submitting…" : "Submit check-in"}
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
  accent,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  accent?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm text-ink mb-1">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <textarea
        rows={2}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full border rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary ${
          accent ? "border-warning bg-warning-bg" : "border-hairline"
        }`}
      />
    </div>
  );
}
