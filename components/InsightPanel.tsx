"use client";

import { useEffect, useState, useCallback } from "react";
import { Sparkles, RefreshCw, TrendingUp, CalendarClock } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { AIInsight, InsightPeriod } from "@/lib/types";

function RiskBadge({ level }: { level: "low" | "medium" | "high" }) {
  const styles = {
    low: "bg-success-bg text-success",
    medium: "bg-warning-bg text-ink",
    high: "bg-danger-bg text-danger",
  }[level];
  return <span className={`text-xs font-medium px-2 py-0.5 rounded ${styles}`}>{level} risk</span>;
}

const PERIODS: { key: InsightPeriod; label: string }[] = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "general", label: "General" },
];

export default function InsightPanel({ endpoint, dash }: { endpoint?: (period: InsightPeriod, refresh: boolean) => string, dash?: any }) {
  const [period, setPeriod] = useState<InsightPeriod>("weekly");
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (refresh = false) => {
      if (!endpoint) return;
      setLoading(true);
      setError(null);
      try {
        setInsight(await api.get<AIInsight>(endpoint(period, refresh)));
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Couldn't load Insight.");
      } finally {
        setLoading(false);
      }
    },
    [endpoint, period]
  );

  useEffect(() => {
    if (endpoint) load(false);
  }, [load]);

  return (
    <div>
      {dash && (
        <div className="bg-surface border border-hairline rounded-md p-4 shadow-sm mb-3 space-y-2">
          <div className="text-sm font-medium">Group Insights</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            {dash.members?.map((m: any, i: number) => (
              <div key={i} className="border border-hairline rounded-md p-2">
                <div className="font-medium">{m.user?.name}</div>
                <div className="text-muted">Completions: {m.done_tasks}/{m.total_tasks}</div>
                <div className="text-muted">Check-in: {m.has_checked_in ? "Yes" : "No"}</div>
                <div className="text-muted">Time spent (actual): {m.total_actual_hours}h</div>
                <div className="text-muted">Avg completion: {m.completion_time_avg_hours || 0}h</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-1 bg-surface border border-hairline rounded-md p-0.5">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`text-xs px-3 py-1.5 rounded font-medium transition-colors ${
                period === p.key ? "bg-primary text-white" : "text-muted hover:text-ink"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        {endpoint && (
          <button
            onClick={() => load(true)}
            disabled={loading}
            className="flex items-center gap-1.5 text-sm text-primary border border-primary rounded-md px-3 py-1.5 hover:bg-blush disabled:opacity-60"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> {loading ? "Analyzing…" : "Refresh"}
          </button>
        )}
      </div>

      {error && (
        <div className="text-sm bg-danger-bg text-danger border-l-4 border-danger px-3 py-2 rounded mb-3">{error}</div>
      )}

      {insight ? (
        <div className="bg-surface border border-hairline rounded-md p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-ink flex items-center gap-1.5">
              <Sparkles size={14} className="text-primary" /> {insight.summary}
            </p>
            <RiskBadge level={insight.risk_level} />
          </div>

          {(insight.predicted_workload_hours !== null || insight.predicted_completion_date) && (
            <div className="flex flex-wrap gap-4 pt-2 border-t border-hairline text-xs text-muted">
              {insight.predicted_workload_hours !== null && (
                <span className="flex items-center gap-1">
                  <TrendingUp size={13} /> ~{insight.predicted_workload_hours}h of open work remaining
                </span>
              )}
              {insight.predicted_completion_date && (
                <span className="flex items-center gap-1">
                  <CalendarClock size={13} /> Predicted finish: {insight.predicted_completion_date}
                </span>
              )}
            </div>
          )}

          {insight.wins.length > 0 && (
            <div className="pt-2 border-t border-hairline">
              <p className="text-xs text-muted mb-1">Good job on</p>
              <ul className="text-sm text-success space-y-0.5">
                {insight.wins.map((w, i) => (
                  <li key={i}>✓ {w}</li>
                ))}
              </ul>
            </div>
          )}

          {insight.member_breakdown.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-hairline">
              {insight.member_breakdown.map((b, i) => (
                <p key={i} className="text-sm">
                  <span className="font-medium text-ink">{b.name}</span>
                  {b.percent_achieved !== null && <span className="text-muted"> · {b.percent_achieved}%</span>}
                  {b.comment && <span className="text-muted"> : {b.comment}</span>}
                </p>
              ))}
            </div>
          )}

          {insight.risk_flags.length > 0 && (
            <div className="pt-2 border-t border-hairline">
              <p className="text-xs text-muted mb-1">Watch out for</p>
              <ul className="text-sm text-danger list-disc list-inside space-y-0.5">
                {insight.risk_flags.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}

          {insight.recommendations.length > 0 && (
            <div className="pt-2 border-t border-hairline">
              <p className="text-xs text-muted mb-1">Recommendations</p>
              <ul className="text-sm text-ink list-disc list-inside space-y-0.5">
                {insight.recommendations.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        !loading && <p className="text-sm text-muted">No analysis yet.</p>
      )}
    </div>
  );
}
