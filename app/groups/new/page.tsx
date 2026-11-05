"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Plus, X } from "lucide-react";

export default function NewGroupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", checkin_cadence: "weekly" });
  const [members, setMembers] = useState([{ email: "", role: "", reason: "" }]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function addMemberRow() {
    setMembers([...members, { email: "", role: "", reason: "" }]);
  }

  function removeMemberRow(i: number) {
    if (members.length === 1) return;
    setMembers(members.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const g = await api.post<{ id: number }>("/groups", form);
      for (const m of members) {
        if (m.email.trim()) {
          try {
          await api.post(`/groups/${g.id}/invite`, { email: m.email.trim(), role: m.role || "member" });
          } catch (err) {
            try {
              await api.post(`/groups/${g.id}/members`, { email: m.email.trim(), role: m.role || "member" });
            } catch {}
          }
        }
      }
      router.push(`/groups/${g.id}`);
    } catch (err: any) {
      setError(err?.message || "Failed to create group");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'var(--font-serif)' }}>Create new team</h1>
        <p className="text-text-secondary mt-1">Start collaborating with your team</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-xl p-6 space-y-4">
        {error && (
          <div className="text-sm bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">Team name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="w-full px-3 py-2.5 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Enter team name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Check-in cadence</label>
          <select
            value={form.checkin_cadence}
            onChange={(e) => setForm({ ...form, checkin_cadence: e.target.value })}
            className="w-full px-3 py-2.5 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Biweekly</option>
          </select>
        </div>

        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium">Add members (emails)</label>
            <button type="button" onClick={addMemberRow} className="flex items-center gap-1 text-sm text-primary hover:underline">
              <Plus size={16} /> Add another
            </button>
          </div>
          <div className="space-y-3">
            {members.map((m, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-start">
                <input
                  type="email"
                  value={m.email}
                  onChange={(e) => {
                    const copy = [...members];
                    copy[i].email = e.target.value;
                    setMembers(copy);
                  }}
                  placeholder="member@example.com"
                  className="sm:col-span-4 px-3 py-2 border border-border rounded-lg bg-background text-sm"
                />
                <input
                  value={m.role}
                  onChange={(e) => {
                    const copy = [...members];
                    copy[i].role = e.target.value;
                    setMembers(copy);
                  }}
                  placeholder="Role (free text, e.g. Developer)"
                  className="sm:col-span-7 px-3 py-2 border border-border rounded-lg bg-background text-sm"
                />
                <button type="button" onClick={() => removeMemberRow(i)} className="sm:col-span-1 p-2 text-muted hover:text-danger">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-border rounded-lg hover:bg-background transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Team"}
          </button>
        </div>
      </form>
    </div>
  );
}
