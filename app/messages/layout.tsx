"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, Search, X, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import NewChatDialog from "@/components/NewChatDialog";
import RequireAuth from "@/components/RequireAuth";
import Avatar from "@/components/Avatar";
import { api } from "@/lib/api";
import { DmUI, displayName } from "@/components/DmContext";

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const inChat = pathname !== "/messages";
  const [list, setList] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [listOpen, setListOpen] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const router = useRouter();

  const reloadList = () => api.get<any[]>("/dm").then((r) => setList(r || [])).catch(() => {});

  useEffect(() => {
    api.get("/dm/contacts").then((r: any) => setContacts(r || [])).catch(() => {});
  }, []);

  const startChat = async (userId: number) => {
    const res: any = await api.post("/dm/open", { user_id: userId });
    setShowNew(false);
    reloadList();
    router.push(`/messages/${res?.id ?? res?.conversation_id}`);
  };

  useEffect(() => {
    if (window.innerWidth < 768) setListOpen(false);
  }, [pathname]);

  useEffect(() => {
    reloadList();
    const t = setInterval(reloadList, 8000);
    return () => clearInterval(t);
  }, [pathname]);

  const needle = q.trim().toLowerCase();

  const shown = list.filter((c) => {
    if (!needle) return true;
    const person = c.user ?? c.other_user ?? c;
    const label = c.is_self ? "saved you notes" : displayName(person);
    return (
      label.toLowerCase().includes(needle) ||
      (c.last_message ?? "").toLowerCase().includes(needle)
    );
  });

  const asideClass = inChat
    ? `${listOpen ? "flex" : "hidden"} fixed md:static inset-y-0 left-0 z-40 w-72 md:w-80`
    : "flex w-full md:w-80";

  return (
    <RequireAuth>
      <DmUI.Provider value={{ listOpen, toggleList: () => setListOpen((o) => !o) }}>
        <div className="relative flex h-[calc(100dvh-9rem)] md:h-[calc(100dvh-8rem)] overflow-hidden rounded-xl border border-border bg-surface">
          {inChat && listOpen && (
            <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setListOpen(false)} />
          )}

          <aside className={`${asideClass} shrink-0 flex-col border-r border-border bg-surface`}>
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-3">
  <h1 className="font-serif text-xl">Direct Messages</h1>
  <div className="flex items-center gap-1">
  <button type="button" onClick={() => setShowNew(true)} aria-label="New chat" title="New chat" className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-black/5 hover:text-foreground">
    <Plus size={18} />
  </button>
  <button type="button" onClick={() => setListOpen(false)} aria-label="Close conversation list" title="Close" className="grid h-8 w-8 place-items-center rounded-full text-muted transition-colors hover:bg-black/5 hover:text-foreground">
    <X size={18} />
  </button>
</div>
</div>
              <div className="flex items-center gap-2 rounded-md border border-border px-3 py-2">
                <Search size={14} className="text-muted" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Find a conversation…"
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </div>

            <ul className="flex-1 min-h-0 overflow-y-auto">
              {shown.length === 0 && (
                <li className="p-6 text-center text-sm text-muted">
                  No conversations yet. Open a member's profile and press Message.
                </li>
              )}
              {shown.map((c) => {
                const name = displayName(c.other || c.user);
                const active = pathname === `/messages/${c.id}`;
                return (
                  <li key={c.id}>
                    <Link
                      href={`/messages/${c.id}`}
                      className={`flex items-center gap-3 px-4 py-3 hover:bg-primary/5 ${active ? "bg-primary/10" : ""}`}
                    >
                      <div className="relative shrink-0">
                        {c.is_self ? (
                          <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-white">
                            <Bookmark size={18} />
                          </div>
                        ) : (
                          <>
                            <Avatar src={(c.other || c.user)?.avatar_url} name={name} size={40} />
                            <span
                              className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
                                (c.other || c.user)?.is_online ? "bg-green-500" : "bg-gray-400"
                              }`}
                            />
                          </>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`truncate text-sm ${c.unread ? "font-bold" : "font-medium"}`}>
                          {c.is_self ? "Saved (You)" : name}
                        </p>
                        <p className={`truncate text-xs ${c.unread ? "" : "text-muted"}`}>
                          {c.last_message ?? "No messages yet"}
                        </p>
                      </div>
                      {c.unread > 0 && (
                        <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] text-white">{c.unread}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="border-t px-4 py-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium uppercase text-muted">People in your groups</p>
              <button type="button" onClick={() => setShowNew(true)} className="text-xs font-medium text-primary">
                View all / search
              </button>
            </div>
            {contacts.slice(0, 4).map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => startChat(u.id)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted/40"
              >
                {displayName(u)}
              </button>
            ))}
            {contacts.length === 0 && <p className="text-xs text-muted">No one shares a group with you yet.</p>}
          </div>
        </aside>

          <section className={`${inChat ? "flex" : "hidden md:flex"} min-w-0 flex-1 flex-col`}>
            {children}
          </section>
        </div>
        {showNew && <NewChatDialog onClose={() => setShowNew(false)} onPick={startChat} />}
    </DmUI.Provider>
    </RequireAuth>
  );
}
