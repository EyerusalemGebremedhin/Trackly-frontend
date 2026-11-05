"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import RequireAuth from "@/components/RequireAuth";
import { api } from "@/lib/api";
import { Users } from "lucide-react";

function DiscussionContent() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<any[]>("/groups")
      .then((res) => setGroups(res || []))
      .catch(() => setGroups([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-sm text-muted">Loading…</p>;
  }

  return (
    <div>
      <h1 className="font-serif text-3xl mb-2">Discussion</h1>
      <p className="text-sm text-muted mb-6">Select a group to view messages, check-ins and members.</p>
      {groups.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-6 text-center text-sm text-muted">
          You are not in any groups yet.
        </div>
      ) : (
        <div className="grid gap-2">
          {groups.map((g) => (
            <Link
              key={g.id}
              href={`/discussion/${g.id}`}
              className="flex items-center gap-3 bg-surface border border-border rounded-xl px-4 py-3 hover:border-primary/50 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Users size={18} />
              </div>
              <div>
                <p className="font-medium">{g.name}</p>
                <p className="text-xs text-muted">{g.description || "Group discussion"}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DiscussionPage() {
  return (
    <RequireAuth>
      <DiscussionContent />
    </RequireAuth>
  );
}
