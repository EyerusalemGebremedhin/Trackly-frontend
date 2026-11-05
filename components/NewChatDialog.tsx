"use client";
import { useEffect, useState } from "react";
import { X, Search } from "lucide-react";
import { api } from "@/lib/api";
import { displayName } from "@/components/DmContext";
import { avatarSrc } from "@/lib/avatar";
import { mediaUrl } from "@/lib/media";

export default function NewChatDialog({
  onClose,
  onPick,
}: {
  onClose: () => void;
  onPick: (userId: number) => void;
}) {
  const [q, setQ] = useState("");
  const [people, setPeople] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await api.get(`/dm/contacts${q ? `?q=${encodeURIComponent(q)}` : ""}`);
        setPeople(res || []);
      } catch {
        setPeople([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl border bg-surface p-4 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-serif text-lg">New chat</h3>
          <button onClick={onClose} aria-label="Close" className="text-muted hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        <div className="relative mb-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search people in your groups..."
            className="w-full rounded-md border py-2 pl-9 pr-3 text-sm"
          />
        </div>

        <ul className="max-h-80 divide-y overflow-y-auto">
          {loading && <li className="p-4 text-center text-sm text-muted">Loading…</li>}
          {!loading && people.length === 0 && (
            <li className="p-4 text-center text-sm text-muted">
              {q ? <>No one matches “{q}”.</> : "No one shares a group with you yet."}
            </li>
          )}
          {people.map((p) => {
            const src = mediaUrl(p.avatar_url);
            const name = displayName(p);
            return (
              <li key={p.id}>
                <button
                  onClick={() => onPick(p.id)}
                  className="flex w-full items-center gap-3 p-3 text-left hover:bg-black/5"
                >
                  {src ? (
                    <img src={src} alt="" className="h-9 w-9 rounded-full object-cover" />
                  ) : (
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-sm font-semibold text-white">
                      {name[0]?.toUpperCase()}
                    </span>
                  )}
                  <span className="truncate text-sm font-medium">{name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
