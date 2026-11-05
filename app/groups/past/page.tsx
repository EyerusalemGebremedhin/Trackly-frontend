"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Archive, RotateCcw } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { Group } from "@/lib/types";

export default function PastGroupsPage() {
  const [groups, setGroups] = useState<Group[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    api.get<Group[]>("/groups/past").then(setGroups).catch(() => setGroups([]));
  };

  useEffect(() => {
    load();
  }, []);

  async function restore(id: number) {
    setError(null);
    try {
      await api.post(`/groups/${id}/unarchive`);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't restore that team.");
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/groups" className="p-2 hover:bg-surface rounded-lg">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'var(--font-serif)' }}>Past Teams</h1>
          <p className="text-text-secondary mt-1">Archived teams</p>
        </div>
      </div>

      {error && (
        <div className="text-sm bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {groups === null ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : groups.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-8 text-center">
          <Archive size={48} className="mx-auto text-text-secondary mb-4" />
          <p className="text-text-secondary">No archived teams</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((g) => (
            <div
              key={g.id}
              className="bg-surface border border-border rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <Archive size={20} className="text-text-secondary" />
                <h3 className="text-lg font-semibold">{g.name}</h3>
              </div>
              <p className="text-sm text-text-secondary capitalize mb-4">{g.checkin_cadence} check-ins</p>
              <button
                onClick={() => restore(g.id)}
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <RotateCcw size={14} />
                Restore team
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
