"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { api } from "@/lib/api";
import type { Group } from "@/lib/types";

type MyMetrics = {
  status_breakdown: Record<string, number>;
  estimated_hours: number;
  actual_hours: number;
  checkin_trend: Record<string, number>;
};

type GroupMemberMetric = {
  name: string;
  done_tasks: number;
  total_tasks: number;
  workload_score: number;
  on_time_rate: number;
  estimated_hours: number;
  actual_hours: number;
  checkins_daily: number;
  checkins_weekly: number;
  checkins_monthly: number;
};

type GroupMetrics = { members: GroupMemberMetric[] };

const STATUS_COLORS: Record<string, string> = {
  todo: "#F4E7EA",
  in_progress: "#FACC15",
  in_review: "#8A6270",
  blocked: "#E10600",
  done: "#166534",
};

type ChartType = "bar" | "line";

const GROUP_METRIC_OPTIONS: { key: keyof GroupMemberMetric; label: string; color: string }[] = [
  { key: "done_tasks", label: "Done", color: "#166534" },
  { key: "total_tasks", label: "Total tasks", color: "#8A6270" },
  { key: "workload_score", label: "Open hours", color: "#450920" },
  { key: "on_time_rate", label: "On-time %", color: "#FACC15" },
  { key: "estimated_hours", label: "Estimated hours", color: "#2E0219" },
  { key: "actual_hours", label: "Actual hours", color: "#E10600" },
];

function ChartTypePicker({ value, onChange }: { value: ChartType; onChange: (t: ChartType) => void }) {
  return (
    <div className="flex items-center gap-1 bg-paper border border-hairline rounded-md p-0.5">
      {(["bar", "line"] as ChartType[]).map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`text-xs px-2.5 py-1 rounded font-medium capitalize transition-colors ${
            value === t ? "bg-primary text-white" : "text-muted hover:text-ink"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

export default function MetricsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<number | "me">("me");
  const [myMetrics, setMyMetrics] = useState<MyMetrics | null>(null);
  const [groupMetrics, setGroupMetrics] = useState<GroupMetrics | null>(null);

  const [hoursChartType, setHoursChartType] = useState<ChartType>("bar");
  const [trendChartType, setTrendChartType] = useState<ChartType>("line");
  const [groupChartType, setGroupChartType] = useState<ChartType>("bar");
  const [activeGroupMetrics, setActiveGroupMetrics] = useState<string[]>(["done_tasks", "total_tasks"]);

  useEffect(() => {
    api.get<Group[]>("/groups").then(setGroups);
  }, []);

  useEffect(() => {
    if (selectedGroup === "me") {
      api.get<MyMetrics>("/dashboard/metrics/me").then(setMyMetrics);
      setGroupMetrics(null);
    } else {
      api
        .get<GroupMetrics>(`/dashboard/metrics/group/${selectedGroup}`)
        .then(setGroupMetrics)
        .catch(() => setGroupMetrics(null));
      setMyMetrics(null);
    }
  }, [selectedGroup]);

  const pieData = myMetrics
    ? Object.entries(myMetrics.status_breakdown)
        .filter(([, v]) => v > 0)
        .map(([name, value]) => ({ name, value }))
    : [];

  const trendData = useMemo(
    () =>
      myMetrics
        ? Object.entries(myMetrics.checkin_trend)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, count]) => ({ date, checkins: count }))
        : [],
    [myMetrics]
  );

  function toggleGroupMetric(key: string) {
    setActiveGroupMetrics((cur) => (cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key]));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-serif text-3xl text-accent">Metrics</h1>
        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value === "me" ? "me" : Number(e.target.value))}
          className="border border-hairline rounded-md px-3 py-1.5 text-sm bg-paper text-ink focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="me">My own progress</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      {selectedGroup === "me" && myMetrics && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-surface border border-hairline rounded-md p-4 shadow-sm">
            <h2 className="font-serif text-lg text-accent mb-3">Task status</h2>
            {pieData.length === 0 ? (
              <p className="text-sm text-muted">No tasks yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={STATUS_COLORS[entry.name] ?? "#8A6270"} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-surface border border-hairline rounded-md p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-serif text-lg text-accent">Estimated vs. actual hours</h2>
              <ChartTypePicker value={hoursChartType} onChange={setHoursChartType} />
            </div>
            <ResponsiveContainer width="100%" height={240}>
              {hoursChartType === "bar" ? (
                <BarChart data={[{ name: "Hours", estimated: myMetrics.estimated_hours, actual: myMetrics.actual_hours }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E9DEE1" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="estimated" fill="#8A6270" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actual" fill="#450920" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <LineChart data={[{ name: "Hours", estimated: myMetrics.estimated_hours, actual: myMetrics.actual_hours }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E9DEE1" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="estimated" stroke="#8A6270" strokeWidth={2} />
                  <Line type="monotone" dataKey="actual" stroke="#450920" strokeWidth={2} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className="bg-surface border border-hairline rounded-md p-4 shadow-sm md:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-serif text-lg text-accent">Check-in trend (last 14 days)</h2>
              <ChartTypePicker value={trendChartType} onChange={setTrendChartType} />
            </div>
            {trendData.length === 0 ? (
              <p className="text-sm text-muted">No check-ins in this window yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                {trendChartType === "bar" ? (
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E9DEE1" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="checkins" fill="#2E0219" radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : (
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E9DEE1" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="checkins" stroke="#2E0219" strokeWidth={2} dot />
                  </LineChart>
                )}
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {selectedGroup !== "me" && groupMetrics && (
        <div className="bg-surface border border-hairline rounded-md p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
            <h2 className="font-serif text-lg text-accent">Workload & completion by member</h2>
            <ChartTypePicker value={groupChartType} onChange={setGroupChartType} />
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {GROUP_METRIC_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => toggleGroupMetric(opt.key)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  activeGroupMetrics.includes(opt.key)
                    ? "text-white border-transparent"
                    : "text-muted border-hairline hover:border-primary"
                }`}
                style={activeGroupMetrics.includes(opt.key) ? { backgroundColor: opt.color } : undefined}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={320}>
            {groupChartType === "bar" ? (
              <BarChart data={groupMetrics.members}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E9DEE1" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                {GROUP_METRIC_OPTIONS.filter((o) => activeGroupMetrics.includes(o.key)).map((o) => (
                  <Bar key={o.key} dataKey={o.key} name={o.label} fill={o.color} radius={[4, 4, 0, 0]} />
                ))}
              </BarChart>
            ) : (
              <LineChart data={groupMetrics.members}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E9DEE1" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                {GROUP_METRIC_OPTIONS.filter((o) => activeGroupMetrics.includes(o.key)).map((o) => (
                  <Line key={o.key} type="monotone" dataKey={o.key} name={o.label} stroke={o.color} strokeWidth={2} />
                ))}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      )}

      {selectedGroup !== "me" && groupMetrics && (
        <div className="bg-surface border border-hairline rounded-md p-4 shadow-sm mt-6">
          <h2 className="font-serif text-lg text-accent mb-3">Check-ins by member</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={groupMetrics.members}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E9DEE1" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="checkins_daily" name="Daily" fill="#450920" radius={[4, 4, 0, 0]} />
              <Bar dataKey="checkins_weekly" name="Weekly" fill="#8A6270" radius={[4, 4, 0, 0]} />
              <Bar dataKey="checkins_monthly" name="Monthly" fill="#2E0219" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {selectedGroup !== "me" && !groupMetrics && (
        <p className="text-sm text-muted">
          Only a group's lead can view its metrics. If you lead this group, data will appear here shortly.
        </p>
      )}
    </div>
  );
}
