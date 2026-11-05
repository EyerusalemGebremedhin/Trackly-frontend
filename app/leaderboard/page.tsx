"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, Users, ChevronRight, Crown } from "lucide-react";
import RequireAuth from "@/components/RequireAuth";
import { api } from "@/lib/api";
import type { Group } from "@/lib/types";

export default function LeaderboardPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Group[]>("/groups")
      .then(setGroups)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-muted">Loading teams...</p>;

  return (
    <RequireAuth>
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3" style={{ fontFamily: 'var(--font-serif)' }}>
            <Trophy className="text-warning" size={32} />
            Team & Performance Management
          </h1>
          <p className="text-text-secondary">Comprehensive team analysis, member performance tracking, and leadership insights</p>
        </div>

        {groups.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-12 text-center">
            <Users size={56} className="mx-auto mb-4 text-muted" />
            <h2 className="text-xl font-semibold mb-2">No Teams Found</h2>
            <p className="text-muted mb-6">Create or join a team to start tracking performance</p>
            <Link href="/groups" className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover">
              Go to Groups
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {groups.map((group) => (
              <Link
                key={group.id}
                href={`/leaderboard/${group.id}`}
                className="bg-surface border border-border rounded-xl p-6 hover:border-primary hover:shadow-lg transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Users className="text-primary" size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold group-hover:text-primary transition-colors">{group.name}</h2>
                      <p className="text-sm text-text-secondary capitalize">
                        {group.my_role === "lead" ? "Team Lead" : "Team Member"}
                      </p>
                    </div>
                  </div>
                  {group.my_role === "lead" && <Crown className="text-warning" size={20} />}
                </div>
                {group.description && (
                  <p className="text-sm text-text-secondary mb-4 line-clamp-2">{group.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">View team performance & analytics</span>
                  <ChevronRight className="text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" size={20} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
