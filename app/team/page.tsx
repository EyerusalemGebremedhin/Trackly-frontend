"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Crown, Plus } from "lucide-react";
import RequireAuth from "@/components/RequireAuth";
import { api } from "@/lib/api";
import type { Group } from "@/lib/types";

export default function TeamPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [pastGroups, setPastGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<Group[]>("/groups"),
      api.get<Group[]>("/groups/past"),
    ])
      .then(([g, pg]) => {
        setGroups(g);
        setPastGroups(pg);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-muted">Loading teams...</p>;

  return (
    <RequireAuth>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-serif)' }}>Teams</h1>
            <p className="text-text-secondary">Manage your teams and view performance</p>
          </div>
          <Link
            href="/groups"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover"
          >
            <Plus size={16} />
            Create Team
          </Link>
        </div>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Users size={20} />
            Active Teams
          </h2>
          {groups.length === 0 ? (
            <div className="bg-surface border border-border rounded-xl p-8 text-center">
              <p className="text-muted">No active teams yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((group) => (
                <Link
                  key={group.id}
                  href={`/groups/${group.id}`}
                  className="bg-surface border border-border rounded-xl p-6 hover:border-primary transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold">{group.name}</h3>
                    {group.my_role === "lead" && <Crown size={18} className="text-warning" />}
                  </div>
                  {group.description && (
                    <p className="text-sm text-text-secondary mb-4 line-clamp-2">{group.description}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span className="capitalize">{group.my_role}</span>
                    <span>View details →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {pastGroups.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Past Teams</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pastGroups.map((group) => (
                <Link
                  key={group.id}
                  href={`/groups/${group.id}`}
                  className="bg-surface border border-border rounded-xl p-6 opacity-75 hover:opacity-100 transition-opacity"
                >
                  <h3 className="text-lg font-semibold mb-2">{group.name}</h3>
                  <p className="text-xs text-muted">Archived</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </RequireAuth>
  );
}
