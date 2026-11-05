"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Archive, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import type { Group } from "@/lib/types";

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[] | null>(null);

  useEffect(() => {
    api.get<Group[]>("/groups").then(setGroups);
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-3xl text-accent">Groups</h1>
          <p className="text-sm text-muted mt-1">Teams, projects, or classes you lead or belong to.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/completed?from=groups"
            className="flex items-center gap-1.5 text-muted hover:text-ink border border-hairline rounded-md px-4 py-2 text-sm font-medium transition-colors"
          >
            <CheckCircle2 size={14} /> Completed work
          </Link>
          <Link
            href="/groups/past"
            className="flex items-center gap-1.5 text-muted hover:text-ink border border-hairline rounded-md px-4 py-2 text-sm font-medium transition-colors"
          >
            <Archive size={14} /> View past groups
          </Link>
          <Link
            href="/groups/new"
            className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white rounded-md px-4 py-2 text-sm font-medium transition-colors"
          >
            <Plus size={16} /> New group
          </Link>
        </div>
      </div>

      {groups === null ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : groups.length === 0 ? (
        <div className="bg-surface border border-hairline rounded-md p-8 text-center shadow-sm">
          <p className="text-sm text-muted">You&apos;re not part of any group yet.</p>
          <p className="text-sm text-muted mt-1">
            Create one to start assigning tasks and tracking a team&apos;s progress together.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {groups.map((g) => (
            <Link
              key={g.id}
              href={`/groups/${g.id}`}
              className="bg-surface border border-hairline rounded-md p-4 shadow-sm hover:shadow-md hover:border-primary transition-all"
            >
              <p className="font-serif text-lg text-accent">{g.name}</p>
              <p className="text-xs text-muted mt-1 capitalize">{g.checkin_cadence} check-ins</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
