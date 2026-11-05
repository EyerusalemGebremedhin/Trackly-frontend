"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import RequireAuth from "@/components/RequireAuth";
import { api } from "@/lib/api";
import Avatar from "@/components/Avatar";
import CheckinMessage from "@/components/CheckinMessage";
import GroupMessages from "@/components/GroupMessages";

function splitName(full?: string) {
  const parts = (full || "").trim().split(" ");
  return { first_name: parts[0] || "Unknown", last_name: parts.slice(1).join(" ") };
}

function DiscussionGroupContent() {
  const params = useParams();
  const groupId = params.groupId as string;
  const [tab, setTab] = useState<"messages" | "checkins" | "members">("messages");
  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [checkins, setCheckins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/groups/${groupId}`).catch(() => null),
      api.get(`/groups/${groupId}/members`).catch(() => []),
      api.get(`/checkins/group/${groupId}`).catch(() => []),
    ])
      .then(([g, mem, ch]) => {
        setGroup(g);
        setMembers(mem || []);
        setCheckins(ch || []);
      })
      .finally(() => setLoading(false));
  }, [groupId]);

  if (loading) return <p className="text-sm text-muted">Loading…</p>;

  const byUserId: Record<string, any> = {};
  for (const m of members) byUserId[String(m.user_id ?? m.id)] = m;

  const enriched = checkins.map((c: any) => {
    const m = byUserId[String(c.user_id)];
    const fullName = c.user?.name || m?.name || c.user_name || `User ${c.user_id}`;
    const { first_name, last_name } = c.user?.first_name
      ? { first_name: c.user.first_name, last_name: c.user.last_name || "" }
      : splitName(fullName);

    return {
      ...c,
      date: c.period_date || (c.created_at ? c.created_at.slice(0, 10) : "Unknown"),
      created_at: c.created_at || c.period_date,
      needs_improvement: c.needs_improvement ?? c.improve,
      user: {
        id: c.user_id,
        first_name,
        last_name,
        job_title: c.user?.job_title || m?.job_title || c.job_title,
        avatar_url: c.user?.avatar_url || m?.avatar_url || c.avatar_url,
      },
    };
  });

  const byDay: Record<string, any[]> = {};
  for (const c of enriched) (byDay[c.date] ||= []).push(c);
  const days = Object.keys(byDay).sort((a, b) => b.localeCompare(a));

  const tabBtn = (key: typeof tab, label: string) => (
    <button
      onClick={() => setTab(key)}
      className={clsx("px-3 py-1.5 text-sm rounded-lg", tab === key ? "bg-primary text-white" : "bg-surface border border-border")}
    >
      {label}
    </button>
  );

  return (
    <div>
      <div className="mb-4">
        <h1 className="font-serif text-2xl">{group?.name || "Discussion"}</h1>
        <p className="text-sm text-muted">{group?.description}</p>
      </div>

      <div className="flex gap-2 mb-4">
        {tabBtn("messages", "Messages")}
        {tabBtn("checkins", "Check-ins")}
        {tabBtn("members", "Members & skills")}
      </div>

      {tab === "messages" && <GroupMessages groupId={groupId} />}

      {tab === "checkins" && (
        <div className="space-y-4">
          {days.length === 0 ? (
            <p className="text-sm text-muted">No check-ins yet.</p>
          ) : (
            days.map((d) => (
              <section key={d} className="bg-surface border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-2 bg-background/50 border-b border-border text-sm font-medium">{d}</div>
                <div className="divide-y divide-border">
                  {byDay[d].map((c) => (
                    <CheckinMessage key={c.id} c={c} />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      )}

      {tab === "members" && (
        <div className="bg-surface border border-border rounded-xl divide-y divide-border">
          {members.length === 0 ? (
            <p className="p-4 text-sm text-muted">No members.</p>
          ) : (
            members.map((m: any) => (
              <div key={m.id} className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Link href={`/profile/${m.user_id}`}>
                    <Avatar src={m.avatar_url} name={m.name || "?"} size={40} />
                  </Link>
                  <div className="min-w-0">
                    <Link href={`/profile/${m.user_id}`} className="font-medium hover:underline">{m.name}</Link>
                    <p className="text-xs text-muted truncate">{m.role} · {m.email}</p>
                    {m.job_title && <p className="text-xs text-primary mt-1">{m.job_title}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Link href={`/profile/${m.user_id}`} className="text-xs text-primary hover:underline">View profile</Link>
                  <span className="hidden sm:inline text-xs text-muted">Skills: {m.skills || "—"}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function DiscussionGroupPage() {
  return (
    <RequireAuth>
      <DiscussionGroupContent />
    </RequireAuth>
  );
}
