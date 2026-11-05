"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Send, MoreVertical, Pencil, Trash2, Copy, Pin } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

type Msg = {
  id: number;
  kind: "message" | "checkin" | "system";
  body: string;
  author_id: number | string | null;
  author_name: string;
  created_at: string;
  pinned?: boolean;
};

function dayLabel(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}
function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export default function GroupMessages({ groupId }: { groupId: number | string }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastCount = useRef(0);

  const load = useCallback(async () => {
    try {
      const data = await api.get<Msg[]>(`/groups/${groupId}/messages`);
      setMessages(data);
      setError(null);
    } catch (e: any) {
      setError(e?.message || "Couldn't load messages");
    }
  }, [groupId]);

  useEffect(() => {
    load();
    const t = setInterval(load, 8000);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(t);
      window.removeEventListener("focus", onFocus);
    };
  }, [load]);

  useEffect(() => {
    function onDocClick() { setOpenMenu(null); }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    if (messages.length !== lastCount.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      lastCount.current = messages.length;
    }
  }, [messages]);

  async function send() {
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setError(null);
    try {
      const created = await api.post<Msg>(`/groups/${groupId}/messages`, { body });
      setMessages((m) => [...m, created]);
      setText("");
    } catch (e: any) {
      setError(e?.message || "Couldn't send. Try again.");
    } finally {
      setSending(false);
    }
  }

  let lastDay = "";
  return (
    <div className="bg-surface border border-border rounded-xl flex flex-col h-[65vh]">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && !error && (
          <p className="text-sm text-text-secondary">No messages yet. Say hello to your group.</p>
        )}
        {messages.filter((m) => !search || m.body.toLowerCase().includes(search.toLowerCase())).map((m) => {
          const day = dayLabel(m.created_at);
          const showDay = day !== lastDay;
          lastDay = day;
          const mine = String(m.author_id) === String((user as any)?.id);
          return (
            <div key={m.id}>
              {showDay && (
                <div className="flex justify-center my-3">
                  <span className="text-xs border border-border rounded-full px-3 py-1 text-text-secondary">{day}</span>
                </div>
              )}
              {m.kind === "system" ? (
                <p className="text-xs text-text-secondary text-center">{m.body}</p>
              ) : (
                <div className="flex gap-3 items-start">
                  <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold shrink-0">
                    {m.author_name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm">
                        <span className="font-semibold">{m.author_name}</span>{" "}
                        <span className="text-xs text-text-secondary">{timeLabel(m.created_at)}</span>
                        {m.pinned && <span className="text-xs text-primary ml-2">📌</span>}
                      </p>
                      {mine && (
                        <div className="relative ml-auto">
                          <button type="button" className="p-1 rounded hover:bg-background text-primary font-bold" onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === m.id ? null : m.id); }} aria-label="More actions">
                            <MoreVertical size={14} />
                          </button>
                          {openMenu === m.id && (
                            <div className="absolute right-0 mt-1 bg-surface border border-border rounded-lg shadow-md z-10 w-36" onClick={(e) => e.stopPropagation()}>
                              <button type="button" className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-background" onClick={() => { navigator.clipboard?.writeText(m.body); setOpenMenu(null); }}>
                                <Copy size={14} /> Copy
                              </button>
                              <button type="button" className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-background" onClick={async () => {
                                setOpenMenu(null);
                                try {
                                  if (m.pinned) await api.delete(`/groups/${groupId}/messages/${m.id}/pin`); else await api.post(`/groups/${groupId}/messages/${m.id}/pin`, {});
                                  setMessages((prev) => prev.map((x) => x.id === m.id ? { ...x, pinned: !m.pinned } : x));
                                } catch (e: any) { setError(e?.message || "Couldn't pin"); }
                              }}>
                                <Pin size={14} /> {m.pinned ? "Unpin" : "Pin"}
                              </button>
                              <button type="button" className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-background" onClick={async () => {
                                setOpenMenu(null);
                                const nb = window.prompt("Edit message", m.body);
                                if (nb === null || nb.trim() === m.body) return;
                                try {
                                  const updated = await api.patch<Msg>(`/groups/${groupId}/messages/${m.id}`, { body: nb.trim() });
                                  setMessages((prev) => prev.map((x) => x.id === m.id ? updated : x));
                                } catch (e: any) { setError(e?.message || "Couldn't edit"); }
                              }}>
                                <Pencil size={14} /> Edit
                              </button>
                              <button type="button" className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-background" onClick={async () => {
                                setOpenMenu(null);
                                if (!confirm("Delete this message?")) return;
                                try {
                                  await api.delete(`/groups/${groupId}/messages/${m.id}`);
                                  setMessages((prev) => prev.filter((x) => x.id !== m.id));
                                } catch (e: any) { setError(e?.message || "Couldn't delete"); }
                              }}>
                                <Trash2 size={14} /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <p className="text-sm whitespace-pre-wrap break-words" onClick={() => setOpenMenu(null)}>{m.body}</p>
                    {m.kind === "checkin" && mine && (
                      <button type="button" className="text-xs text-primary hover:underline mt-1" onClick={() => { window.location.href = "/tasks"; }}>
                        Edit check-in
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="px-3 pt-2"><input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search messages" className="w-full px-3 py-1.5 border border-border rounded-lg bg-background text-sm" /></div>
      {error && <p className="px-4 pb-1 text-xs text-red-500">{error}</p>}

      <div className="border-t border-border p-3 flex items-end gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={1}
          maxLength={4000}
          placeholder="Message your group (Enter to send, Shift+Enter for a new line)"
          className="flex-1 resize-none px-3 py-2.5 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 max-h-32"
        />
        <button
          type="button"
          onClick={send}
          disabled={sending || !text.trim()}
          aria-label="Send message"
          className="p-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
