"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Send, MoreVertical, Pencil, Trash2, Copy, Pin, Image as ImageIcon, Mic, StopCircle, X, Smile } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { mediaUrl } from "@/lib/media";
import EmojiPicker from 'emoji-picker-react';

type Msg = {
  id: number;
  kind: "message" | "checkin" | "system";
  body: string;
  image_url?: string | null;
  audio_url?: string | null;
  author_id: number | string | null;
  author_name: string;
  created_at: string;
  edited_at?: string | null;
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
  const [showEmoji, setShowEmoji] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastCount = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

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
    function onDocDown(e: MouseEvent) {
      const t = e.target as HTMLElement | null;
      if (t?.closest?.("[data-msg-menu]")) return;
      setOpenMenu(null);
    }
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, []);

  useEffect(() => {
    if (messages.length !== lastCount.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      lastCount.current = messages.length;
    }
  }, [messages]);

  async function send() {
    const body = text.trim();
    if (!body && !selectedImage) return;
    setSending(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("body", body);
      if (selectedImage) {
        const response = await fetch(selectedImage);
        const blob = await response.blob();
        formData.append("image", blob, "image.png");
      }
      const created = await api.post<Msg>(`/groups/${groupId}/messages`, formData);
      setMessages((m) => [...m, created]);
      setText("");
      setSelectedImage(null);
    } catch (e: any) {
      setError(e?.message || "Couldn't send. Try again.");
    } finally {
      setSending(false);
    }
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  async function toggleRecording() {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("audio", blob, "voice-message.webm");
        setText("");
        try {
          const created = await api.post<Msg>(`/groups/${groupId}/messages`, formData);
          setMessages((m) => [...m, created]);
        } catch (e: any) {
          setError(e?.message || "Couldn't send voice message");
        }
      };
      recorder.start();
      setIsRecording(true);
    } catch (e) {
      setError("Could not access microphone");
    }
  }

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 128) + "px";
    }
  }, [text]);

  const lastOtherId = Math.max(0, ...messages.filter((m) => String(m.author_id) !== String((user as any)?.id)).map((m) => m.id));
  const canDeleteEveryone = (m: Msg) => String(m.author_id) === String((user as any)?.id) && m.id > lastOtherId;

  async function deleteForMe(m: Msg) {
    setOpenMenu(null);
    if (!window.confirm("Delete this message for you only? It will still be visible to others.")) return;
    try {
      await api.delete(`/groups/${groupId}/messages/${m.id}?scope=me`);
      setMessages((prev) => prev.filter((x) => x.id !== m.id));
    } catch (e: any) { setError(e?.message || "Couldn't delete"); }
  }

  async function deleteForEveryone(m: Msg) {
    setOpenMenu(null);
    if (!window.confirm("Delete this message for everyone? This can’t be undone.")) return;
    const typed = window.prompt('Type "delete" to confirm:');
    if ((typed ?? "").trim().toLowerCase() !== "delete") return;
    try {
      await api.delete(`/groups/${groupId}/messages/${m.id}?scope=everyone`);
      setMessages((prev) => prev.filter((x) => x.id !== m.id));
    } catch (e: any) { setError(e?.message || "Couldn't delete"); }
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
                        <div className="relative ml-auto" data-msg-menu>
                          <button type="button" className="p-1 rounded hover:bg-background text-primary" onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === m.id ? null : m.id); }} aria-label="More actions">
                            <MoreVertical size={16} />
                          </button>
                          {openMenu === m.id && (
                            <div className="absolute right-0 mt-1 bg-surface border border-border rounded-lg shadow-md z-20 w-48" data-msg-menu onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
                              <button type="button" className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-background" onClick={async () => { try { await navigator.clipboard?.writeText(m.body); } catch {} setOpenMenu(null); }}>
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
                              <button type="button" className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-background" onClick={() => void deleteForMe(m)}>
                                <Trash2 size={14} /> Delete
                              </button>
                              {canDeleteEveryone(m) && (
                                <button type="button" className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-background" onClick={() => void deleteForEveryone(m)}>
                                  <Trash2 size={14} /> Delete for everyone
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <p className="text-sm whitespace-pre-wrap break-words" onClick={() => setOpenMenu(null)}>
                      {m.image_url && <img src={mediaUrl(m.image_url) ?? ""} alt="Shared" className="max-h-40 rounded-lg mb-1 block" />}
                      {m.audio_url && <audio controls src={mediaUrl(m.audio_url) ?? ""} className="w-full max-w-xs mb-1 block" />}
                      {m.body}
                    </p>
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

      <div className="border-t border-border p-3">
        {selectedImage && (
          <div className="mb-2 relative inline-block">
            <img src={selectedImage} alt="Selected" className="h-16 rounded-lg" />
            <button onClick={() => setSelectedImage(null)} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">
              <X size={10} />
            </button>
          </div>
        )}
        <div className="flex items-end gap-2 rounded-lg border border-border px-3 py-2 relative">
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors flex-shrink-0" aria-label="Attach image">
            <ImageIcon size={18} />
          </button>
          <button onClick={toggleRecording} className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${isRecording ? "bg-red-500 text-white" : "hover:bg-primary/10"}`} aria-label="Voice message">
            {isRecording ? <StopCircle size={18} /> : <Mic size={18} />}
          </button>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            maxLength={4000}
            placeholder="Message your group (Enter for new line, Shift+Enter to send)"
            className="flex-1 resize-none px-3 py-2.5 border-0 bg-transparent focus:outline-none max-h-32"
          />
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowEmoji(!showEmoji)}
              className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors flex-shrink-0"
              aria-label="Emojis"
            >
              <Smile size={18} />
            </button>
            <button
              type="button"
              onClick={send}
              disabled={sending || (!text.trim() && !selectedImage)}
              aria-label="Send message"
              className="p-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50 flex-shrink-0"
            >
              <Send size={18} />
            </button>
          </div>
          {showEmoji && (
            <div className="absolute bottom-full right-0 mb-1 z-10 rounded-lg border border-border bg-surface shadow-lg">
              <div className="flex items-center justify-between border-b border-border px-2 py-1">
                <span className="text-xs font-medium text-muted">Emoji</span>
                <button type="button" onClick={() => setShowEmoji(false)} className="rounded p-1 hover:bg-primary/10" aria-label="Close emoji picker">
                  <X size={14} />
                </button>
              </div>
              <EmojiPicker onEmojiClick={(e) => { setText((t) => t + e.emoji); }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
