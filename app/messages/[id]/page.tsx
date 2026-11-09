"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import EmojiPicker from 'emoji-picker-react';
import { Menu, MoreVertical, Send, Trash2, Eraser, Smile, Image as ImageIcon, Mic, StopCircle, X } from "lucide-react";
import Avatar from "@/components/Avatar";
import { mediaUrl } from "@/lib/media";

import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useDmUI, displayName } from "@/components/DmContext";

type Msg = { id: number; sender_id: number; body: string; image_url?: string | null; audio_url?: string | null; created_at: string; edited_at?: string | null };

type Confirm = null | "clear" | "delete" | "everyone";

const dayLabel = (iso: string) => {
  const d = new Date(iso);
  const t = new Date(); t.setHours(0, 0, 0, 0);
  const x = new Date(d); x.setHours(0, 0, 0, 0);
  const diff = Math.round((+t - +x) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
};
const timeOf = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

export default function ChatPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { user: me } = useAuth();
  const { toggleList } = useDmUI();

  const [other, setOther] = useState<any>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [menu, setMenu] = useState(false);
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [confirmWord, setConfirmWord] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [msgMenu, setMsgMenu] = useState<number | null>(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const lastId = useRef(0);
  const bottom = useRef<HTMLDivElement>(null);

  async function load() {
    try {
      const fresh: Msg[] = await api.get(`/dm/${id}/messages?after_id=${lastId.current}`);
      if (fresh?.length) {
        lastId.current = fresh[fresh.length - 1].id;
        setMessages((m) => [...m, ...fresh]);
        api.post(`/dm/${id}/read`, {}).catch(() => {});
      }
    } catch {}
  }

  useEffect(() => {
    setMessages([]); lastId.current = 0; setOther(null);
    api.get(`/dm/${id}`).then((c: any) => setOther(c?.user ?? c?.other ?? c)).catch(() => {});
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, [id]);

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const picker = document.querySelector('emoji-picker');
      if (picker && !picker.contains(e.target as Node)) {
        const btn = document.querySelector('button[aria-label="Emojis"]');
        if (btn && !btn.contains(e.target as Node)) {
          setShowEmoji(false);
        }
      }
    };
    if (showEmoji) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmoji]);

async function send() {
    const body = text.trim();
    if (!body && !selectedImage) return;
    setText("");
    const image = selectedImage;
    setSelectedImage(null);
    setError("");

    const formData = new FormData();
    formData.append("body", body);
    if (image) {
      const response = await fetch(image);
      const blob = await response.blob();
      formData.append("image", blob, "image.png");
    }

    try {
      await api.post(`/dm/${id}/messages`, formData);
      load();
    } catch (e: any) {
      setError(e?.message ?? "Could not send message");
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
        setError("");
        try {
          await api.post(`/dm/${id}/messages`, formData);
          load();
        } catch (e: any) {
          setError(e?.message ?? "Could not send voice message");
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

  async function deleteForMe(mid: number) {
    setMsgMenu(null);
    if (!window.confirm("Delete this message for you only? It will still be visible to others.")) return;
    try {
      await api.delete(`/dm/${id}/messages/${mid}?scope=me`);
      setMessages((m) => m.filter((x) => x.id !== mid));
      setError("");
    } catch (e: any) { setError(e?.message ?? "Could not delete message"); }
  }

  async function deleteForEveryone(mid: number) {
    setMsgMenu(null);
    if (!window.confirm("Delete this message for everyone? This can’t be undone.")) return;
    const typed = window.prompt('Type "delete" to confirm:');
    if ((typed ?? "").trim().toLowerCase() !== "delete") return;
    try {
      await api.delete(`/dm/${id}/messages/${mid}?scope=everyone`);
      setMessages((m) => m.filter((x) => x.id !== mid));
      setError("");
    } catch (e: any) { setError(e?.message ?? "Could not delete message"); }
  }

  async function runConfirm() {
    if (confirm === "clear") {
      if (confirmWord.trim().toLowerCase() !== "clear") return;
      await api.post(`/dm/${id}/clear`, {}); setMessages([]);
    }
    if (confirm === "delete") { await api.delete(`/dm/${id}`); router.push("/messages"); }
    if (confirm === "everyone") { await api.delete(`/dm/${id}?everyone=true`); router.push("/messages"); }
    setConfirm(null);
    setConfirmWord("");
  }

  const isSelf = other && String(other.id) === String(me?.id);
  const name = other ? displayName(other) : "";

  const lastOtherId = Math.max(0, ...messages.filter((m) => m.sender_id !== me?.id).map((m) => m.id));
  const canDeleteEveryone = (m: Msg) => m.sender_id === me?.id && m.id > lastOtherId;
  const canEdit = (m: Msg) => {
    if (m.sender_id !== me?.id) return false;
    const age = Date.now() - new Date(m.created_at).getTime();
    return age <= 24 * 3600 * 1000;
  };

  const saveEdit = async (m: Msg) => {
    try {
      const res: any = await api.patch(`/dm/${id}/messages/${m.id}`, { body: draft });
      setMessages((prev) => prev.map((x) => (x.id === m.id ? (res?.id ? res : { ...x, body: draft, edited_at: new Date().toISOString() }) : x)));
      setEditingId(null);
      setError("");
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? "Could not edit message");
      setEditingId(null);
    }
  };

  let prevDay = "";
  const rows = messages.map((m, i) => {
    const day = dayLabel(m.created_at);
    const showDay = day !== prevDay; prevDay = day;
    const p = messages[i - 1];
    const grouped = !showDay && p && p.sender_id === m.sender_id &&
      +new Date(m.created_at) - +new Date(p.created_at) < 5 * 60000;
    return { m, day, showDay, grouped };
  });

  return (
    <>
      <header className="flex shrink-0 items-center gap-3 border-b border-border p-3">
        <button onClick={toggleList} aria-label="Toggle conversations" className="rounded p-1 hover:bg-primary/10">
          <Menu size={20} />
        </button>
        {other ? (
          <Link href={`/profile/${other.id}`} className="flex min-w-0 items-center gap-3">
            <Avatar src={other.avatar_url} name={displayName(other)} size={36} />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{isSelf ? "Saved (You)" : displayName(other)}</p>
              <p className="text-xs text-muted">
                {isSelf ? "Notes and links for yourself" : other.is_active ? "Active" : "Away"}
              </p>
            </div>
          </Link>
        ) : (
          <p className="text-sm text-muted">Loading…</p>
        )}

        <div className="relative ml-auto">
          <button onClick={() => setMenu((o) => !o)} aria-label="Chat options" className="rounded p-1 hover:bg-primary/10">
            <MoreVertical size={18} />
          </button>
          {menu && (
            <div className="absolute right-0 top-9 z-20 w-56 rounded-lg border border-border bg-surface py-1 text-sm shadow-lg"
                 onMouseLeave={() => setMenu(false)}>
              <button className="flex w-full items-center gap-2 px-3 py-2 hover:bg-primary/5"
                      onClick={() => { setConfirm("clear"); setConfirmWord(""); setMenu(false); }}>
                <Eraser size={15} /> Clear history
              </button>
              <button className="flex w-full items-center gap-2 px-3 py-2 hover:bg-primary/5"
                      onClick={() => { setConfirm("delete"); setMenu(false); }}>
                <Trash2 size={15} /> Delete chat
              </button>
              {!isSelf && (
                <button className="flex w-full items-center gap-2 px-3 py-2 text-danger hover:bg-primary/5"
                        onClick={() => { setConfirm("everyone"); setMenu(false); }}>
                  <Trash2 size={15} /> Delete for everyone
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto py-2">
        {messages.length === 0 && other && (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
            <Avatar src={other.avatar_url} name={name} size={80} />
            <p className="font-semibold">{isSelf ? "Saved (You)" : name}</p>
            <p className="text-sm text-muted">
              {isSelf ? "This space is just for you." : `This is the beginning of your conversation with ${name}.`}
            </p>
          </div>
        )}

        {rows.map(({ m, day, showDay, grouped }, i) => {
          const mine = String(m.sender_id) === String(me?.id);
          const who = mine ? me : other;
          const whoName = displayName(who);
          return (
            <div key={`${m.id}-${i}`}>
              {showDay && (
                <div className="sticky top-0 z-10 flex justify-center py-2">
                  <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium">{day}</span>
                </div>
              )}
              <div className={`group flex gap-3 px-4 hover:bg-primary/5 ${grouped ? "py-0.5" : "pt-2 pb-0.5"}`}>
                <div className="w-9 shrink-0">
                  {!grouped && <Avatar src={who?.avatar_url} name={whoName} size={36} />}
                </div>
                <div className="min-w-0 flex-1">
                  {!grouped && (
                    <p className="flex items-baseline gap-2">
                      <span className="text-sm font-bold">{whoName}</span>
                      <span className="text-xs text-muted">{timeOf(m.created_at)}</span>
                    </p>
                  )}
                   {editingId === m.id ? (
                     <div className="mt-1 flex items-center gap-2">
                       <input
                         value={draft}
                         onChange={(e) => setDraft(e.target.value)}
                         onKeyDown={(e) => {
                           if (e.key === "Enter") saveEdit(m);
                           if (e.key === "Escape") setEditingId(null);
                         }}
                         className="w-full rounded-md border px-2 py-1 text-sm"
                         autoFocus
                       />
                       <button onClick={() => saveEdit(m)} className="text-xs font-medium text-primary">Save</button>
                       <button onClick={() => setEditingId(null)} className="text-xs text-muted">Cancel</button>
                     </div>
                   ) : (
<div className="group relative flex items-start gap-2">
                        <div className="min-w-0 flex-1">
                          {m.image_url && (
                            <img src={mediaUrl(m.image_url) ?? ""} alt="Shared" className="max-h-32 rounded-lg mb-1" />
                          )}
                          {m.audio_url && (
                            <audio controls src={mediaUrl(m.audio_url) ?? ""} className="w-full max-w-xs mb-1" />
                          )}
                          <p className="text-sm">
                            {m.body}
                            {m.edited_at && <span className="ml-1 text-xs text-muted">(edited)</span>}
                          </p>
                        </div>
                        {mine && (
                          <div className="relative shrink-0">
                            <button type="button" aria-label="Message actions" onClick={() => setMsgMenu(msgMenu === m.id ? null : m.id)} className="rounded p-1 text-muted opacity-70 hover:bg-primary/10 group-hover:opacity-100">
                              <MoreVertical size={16} />
                            </button>
                            {msgMenu === m.id && (
                              <div className="absolute right-0 top-7 z-20 w-44 rounded-lg border border-border bg-surface py-1 text-sm shadow-lg">
                                {canEdit(m) && (
                                  <button className="block w-full px-3 py-2 text-left hover:bg-primary/5" onClick={() => { setEditingId(m.id); setDraft(m.body); setMsgMenu(null); }}>Edit</button>
                                )}
                                <button className="block w-full px-3 py-2 text-left hover:bg-primary/5" onClick={() => deleteForMe(m.id)}>Delete</button>
                                {canDeleteEveryone(m) && (
                                  <button className="block w-full px-3 py-2 text-left text-danger hover:bg-primary/5" onClick={() => deleteForEveryone(m.id)}>Delete for everyone</button>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                     </div>
                   )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottom} />
      </div>

      <div className="shrink-0 border-t border-border p-3">
        {error && <p className="mb-2 text-xs text-danger">{error}</p>}
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
            rows={1}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={isSelf ? "Jot something down…" : name ? `Message ${name}` : "Write a message… (Enter for new line, Shift+Enter to send)"}
            className="max-h-32 flex-1 resize-none bg-transparent text-sm outline-none"
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
            <button onClick={send} disabled={!text.trim() && !selectedImage} aria-label="Send"
                    className="rounded-md bg-primary p-2 text-white disabled:opacity-40 flex-shrink-0">
              <Send size={16} />
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

      {confirm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => { setConfirm(null); setConfirmWord(""); }}>
          <div className="w-full max-w-sm rounded-xl bg-surface p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-1 font-semibold">
              {confirm === "clear" ? "Clear history?" : confirm === "delete" ? "Delete this chat?" : "Delete for everyone?"}
            </h3>
            <p className="mb-3 text-sm text-muted">
              {confirm === "clear" && "Messages are removed for you only. This can’t be undone."}
              {confirm === "delete" && "It's removed from your list. The other person keeps their copy."}
              {confirm === "everyone" && "This permanently deletes the conversation for both of you."}
            </p>
            {confirm === "clear" && (
              <div className="mb-4">
                <label className="mb-1 block text-xs text-muted">Type <span className="font-semibold text-foreground">clear</span> to confirm</label>
                <input value={confirmWord} onChange={(e) => setConfirmWord(e.target.value)} placeholder="clear" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" autoFocus />
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button className="rounded-md border border-border px-3 py-2 text-sm" onClick={() => { setConfirm(null); setConfirmWord(""); }}>Cancel</button>
              <button className="rounded-md bg-primary px-3 py-2 text-sm text-white disabled:opacity-40" onClick={runConfirm} disabled={confirm === "clear" && confirmWord.trim().toLowerCase() !== "clear"}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
