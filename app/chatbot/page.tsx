"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Bot, Send, Plus, User, Image as ImageIcon, Mic, StopCircle,
  Trash2, Edit2, Check, Menu, X, MoreVertical, Copy, Smile,
} from "lucide-react";
import { api } from "@/lib/api";
import clsx from "clsx";
import ReactMarkdown from "react-markdown";
import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/lib/auth-context";
import EmojiPicker from 'emoji-picker-react';

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  image?: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}

const STORAGE_KEY_BASE = "trackly_chat_history_v2";
const HANDOFF_KEY = "trackly_widget_handoff";

const SUGGESTIONS = [
  "How can I improve my team's performance?",
  "Help me plan this week's work",
  "How do I manage my time better?",
  "Give me tips to keep my team motivated",
];

const tidy = (t: string) =>
  t
    .replace(/(["”])\s*[—–]\s*/g, "$1 - ")
    .replace(/\s*—\s*/g, ", ")
    .replace(/–/g, "-");

function ChatbotContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const STORAGE_KEY = `${STORAGE_KEY_BASE}_${user?.id ?? "anon"}`;
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const textareaRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const loadedRef = useRef(false);

  const currentConversation = conversations.find((c) => c.id === currentConversationId);
  const messages = currentConversation?.messages || [];

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    let convs: Conversation[] = [];
    let currentId: string | null = null;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        convs = parsed.conversations || [];
        currentId = parsed.currentConversationId || null;
      }

      const handoff = localStorage.getItem(HANDOFF_KEY);
      if (handoff) {
        localStorage.removeItem(HANDOFF_KEY);
        const msgs: Message[] = JSON.parse(handoff);
        if (Array.isArray(msgs) && msgs.length > 0) {
          const firstUser = msgs.find((m) => m.role === "user");
          const conv: Conversation = {
            id: Date.now().toString(),
            title: (firstUser?.content || "Chat").slice(0, 30),
            messages: msgs,
          };
          convs = [conv, ...convs];
          currentId = conv.id;
        }
      }
    } catch (e) {}

    setConversations(convs);
    setCurrentConversationId(currentId);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (searchParams.get("new") === "1") {
      const latest = conversations[0];
      if (latest && latest.messages.length === 0) {
        setCurrentConversationId(latest.id);
      } else {
        const newConv: Conversation = {
          id: Date.now().toString(),
          title: "New chat",
          messages: [],
        };
        setConversations((prev) => [newConv, ...prev]);
        setCurrentConversationId(newConv.id);
      }
      router.replace("/chatbot");
    }
  }, [hydrated, searchParams]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ conversations, currentConversationId }));
    } catch (e) {}
  }, [conversations, currentConversationId, hydrated]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const createNewConversation = () => {
    const latest = conversations[0];
    if (latest && latest.messages.length === 0) {
      setCurrentConversationId(latest.id);
      setInput("");
      setSelectedImage(null);
      setShowMenu(false);
      setShowMore(false);
      return;
    }
    const newConv: Conversation = {
      id: Date.now().toString(),
      title: "New chat",
      messages: [],
    };
    setConversations((prev) => [newConv, ...prev]);
    setCurrentConversationId(newConv.id);
    setInput("");
    setSelectedImage(null);
    setShowMenu(false);
    setShowMore(false);
  };
  const startNewChat = createNewConversation;

  const deleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmText = prompt("Type 'delete' to confirm deleting this chat:");
    if (confirmText !== "delete") return;
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (currentConversationId === id) setCurrentConversationId(null);
  };

  const startEdit = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditTitle(title);
  };

  const saveEdit = (id: string, e: React.SyntheticEvent) => {
    e.stopPropagation();
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: editTitle.trim() || "New chat" } : c))
    );
    setEditingId(null);
  };

  const clearAllHistory = () => {
    const confirmText = prompt("Type 'clear' to confirm clearing all chat history:");
    if (confirmText !== "clear") return;
    setConversations([]);
    setCurrentConversationId(null);
    setShowMore(false);
    setShowMenu(false);
  };

  const copyMessage = async (id: string, text: string) => {
    const clean = text.replace(/\*\*/g, "");
    try {
      await navigator.clipboard.writeText(clean);
    } catch (e) {
      const ta = document.createElement("textarea");
      ta.value = clean;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 128) + "px";
    }
  }, [input]);

  const handleSend = async (override?: string) => {
    const msg = (override ?? input).trim();
    const img = override ? null : selectedImage;
    if ((!msg && !img) || isLoading) return;

    let convId = currentConversationId;
    if (!convId) {
      const newConv: Conversation = {
        id: Date.now().toString(),
        title: (msg || "Image chat").slice(0, 30),
        messages: [],
      };
      setConversations((prev) => [newConv, ...prev]);
      convId = newConv.id;
      setCurrentConversationId(convId);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: msg || (img ? "Image attached" : ""),
      image: img || undefined,
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? {
              ...c,
              title: c.title === "New chat" ? (msg || "Image chat").slice(0, 30) : c.title,
              messages: [...c.messages, userMessage],
            }
          : c
      )
    );

    const currentConv = conversations.find((c) => c.id === convId) || { messages: [], title: "New chat" };
    const historyMsgs = [...currentConv.messages, userMessage]
      .filter((m) => m.content && m.content !== "Image attached")
      .slice(-12)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 1500) }));

    const memory = conversations
      .filter((c) => c.id !== convId)
      .slice(0, 5)
      .map((c) => {
        const lastUser = [...c.messages].reverse().find((m) => m.role === "user");
        return lastUser ? `${c.title}: ${lastUser.content.slice(0, 120)}` : c.title;
      });

    setInput("");
    setSelectedImage(null);
    setIsLoading(true);

    try {
      let res;
      if (img) {
        res = await api.post<{ response: string }>("/chat/vision", { message: msg, image: img });
      } else {
        res = await api.post<{ response: string }>("/chat", { message: msg, context: "group-aware", history: historyMsgs, memory });
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: tidy(res.response),
      };

      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, messages: [...c.messages, assistantMessage] } : c))
      );
    } catch (e: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I could not get an answer just now. Please try again in a moment.",
      };
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, messages: [...c.messages, errorMessage] } : c))
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        alert("Image too large. Please use a smaller image.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("file", blob, "audio.webm");
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/chat/transcribe`, {
            method: "POST",
            headers: { Authorization: `Bearer ${localStorage.getItem("ember_token")}` },
            body: formData,
          });
          if (res.ok) {
            const data = await res.json();
            if (data.text) setInput(data.text);
          }
        } catch (e) {}
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (e) {
      alert("Microphone access denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) stopRecording();
    else startRecording();
  };

  return (
    <div className="relative flex flex-col h-[calc(100dvh-8rem)] min-h-[520px] rounded-2xl border border-border bg-background shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => setShowMenu(true)} className="p-2 rounded-lg hover:bg-background transition-colors" aria-label="Chat history">
            <Menu size={18} />
          </button>
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
            <Bot size={16} />
          </div>
          <div className="leading-tight">
            <p className="font-serif text-lg text-accent">Trackly AI</p>
            <p className="text-[11px] text-text-secondary">Your team assistant</p>
          </div>
        </div>
        <div className="relative flex items-center gap-1">
          <button onClick={createNewConversation} className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg px-3 py-1.5 text-xs font-medium">
            <Plus size={14} /> New chat
          </button>
          <button onClick={() => setShowMore((v) => !v)} className="p-2 rounded-lg hover:bg-background transition-colors" aria-label="More options">
            <MoreVertical size={18} />
          </button>
          {showMore && (
            <div className="absolute right-0 top-11 z-30 w-48 rounded-xl border border-border bg-surface shadow-lg p-1">
              <button onClick={clearAllHistory} disabled={conversations.length === 0} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs hover:bg-red-500/10 hover:text-red-500 disabled:opacity-50">
                <Trash2 size={13} /> Clear all history
              </button>
            </div>
          )}
        </div>
      </div>

      {showMenu && (
        <>
          <div className="absolute inset-0 z-10 bg-black/10" onClick={() => setShowMenu(false)} />
          <div className="absolute inset-y-0 left-0 z-20 w-48 max-w-[70%] flex flex-col bg-surface border-r border-border shadow-lg">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="font-serif text-base text-accent">Chat history</span>
              <button onClick={() => setShowMenu(false)} className="p-1.5 hover:bg-background rounded-lg"><X size={16} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {conversations.length === 0 && <p className="text-xs text-text-secondary p-3">No chats yet. Start one below.</p>}
              {conversations.map((conv) => (
                <div key={conv.id} onClick={() => { setCurrentConversationId(conv.id); setShowMenu(false); }} className={clsx("flex items-center gap-1 px-3 py-2 rounded-lg cursor-pointer text-sm mb-1", currentConversationId === conv.id ? "bg-primary/10 text-primary" : "hover:bg-background")}>
                  {editingId === conv.id ? (
                    <>
                      <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="flex-1 px-2 py-1 text-xs border border-border rounded bg-background" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.key === "Enter" && saveEdit(conv.id, e)} autoFocus />
                      <button onClick={(e) => saveEdit(conv.id, e)} className="p-1"><Check size={13} /></button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 truncate">{conv.title}</span>
                      <button onClick={(e) => startEdit(conv.id, conv.title, e)} className="p-1 hover:bg-background rounded"><Edit2 size={13} /></button>
                      <button onClick={(e) => deleteConversation(conv.id, e)} className="p-1 hover:bg-red-500/10 hover:text-red-500 rounded"><Trash2 size={13} /></button>
                    </>
                  )}
                </div>
              ))}
            </div>
            {conversations.length > 0 && (
              <div className="p-2 border-t border-border">
                <button onClick={clearAllHistory} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs hover:bg-red-500/10 hover:text-red-500"><Trash2 size={13} /> Clear all history</button>
              </div>
            )}
          </div>
        </>
      )}

      {messages.length === 0 ? (
        <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center px-4 py-8">
          <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center mb-4 shadow-md">
            <Bot size={28} />
          </div>
          <h2 className="font-serif text-3xl text-accent mb-2">Trackly AI</h2>
          <p className="text-sm text-text-secondary text-center max-w-md mb-6">Your friendly helper for team management, time management and getting more done together.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => handleSend(s)} className="text-left text-sm px-4 py-3 rounded-xl border border-border bg-surface hover:border-primary hover:bg-primary/5 transition-colors">{s}</button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
          {messages.map((message) => (
            <div key={message.id} className={clsx("flex gap-3 max-w-3xl mx-auto", message.role === "user" ? "flex-row-reverse" : "")}>
              <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", message.role === "user" ? "bg-primary text-white" : "bg-primary/10 text-primary")}>
                {message.role === "user" ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div className={clsx("px-4 py-3 text-sm leading-relaxed max-w-[85%]", message.role === "user" ? "bg-primary text-white rounded-2xl rounded-tr-sm" : "bg-surface border border-border rounded-2xl rounded-tl-sm")}>
                {message.image && <img src={message.image} alt="Uploaded" className="max-w-xs rounded-lg mb-2" />}
                {message.role === "assistant" ? (
                  <div>
                    <div className="space-y-2 break-words [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_blockquote]:border-l-2 [&_blockquote]:border-primary/40 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-text-secondary">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                    <button
                      onClick={() => copyMessage(message.id, message.content)}
                      className="mt-2 flex items-center gap-1 text-xs text-text-secondary hover:text-primary transition-colors"
                      aria-label="Copy reply"
                    >
                      {copiedId === message.id ? (
                        <>
                          <Check size={12} /> Copied
                        </>
                      ) : (
                        <>
                          <Copy size={12} /> Copy
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    <button
                      onClick={() => copyMessage(message.id, message.content)}
                      className="mt-2 ml-auto flex items-center gap-1 text-xs text-white/70 hover:text-white transition-colors"
                      aria-label="Copy message"
                    >
                      {copiedId === message.id ? (
                        <>
                          <Check size={12} /> Copied
                        </>
                      ) : (
                        <>
                          <Copy size={12} /> Copy
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 max-w-3xl mx-auto">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center"><Bot size={14} /></div>
              <div className="bg-surface border border-border px-4 py-3 rounded-2xl rounded-tl-sm"><div className="flex gap-1"><div className="w-1.5 h-1.5 bg-text-secondary rounded-full animate-bounce"></div><div className="w-1.5 h-1.5 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div><div className="w-1.5 h-1.5 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div></div></div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      <div className="px-4 pb-4 pt-2">
        {selectedImage && (
          <div className="mb-2 max-w-3xl mx-auto relative inline-block">
            <img src={selectedImage} alt="Selected" className="h-16 rounded-lg" />
            <button onClick={() => setSelectedImage(null)} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">×</button>
          </div>
        )}
        <div className="flex items-center gap-1 max-w-3xl mx-auto rounded-2xl border border-border bg-surface px-2 py-1.5 focus-within:ring-1 focus-within:ring-primary relative">
          <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-background rounded-lg" aria-label="Attach image"><ImageIcon size={17} /></button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          <button onClick={toggleRecording} className={clsx("p-2 rounded-lg", isRecording ? "bg-red-500 text-white" : "hover:bg-background")} aria-label="Voice input">{isRecording ? <StopCircle size={17} /> : <Mic size={17} />}</button>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Ask Trackly anything… (Enter for new line, Shift+Enter to send)"
            className="flex-1 px-2 py-2 text-sm bg-transparent focus:outline-none resize-none max-h-32"
            rows={1}
          />
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowEmoji(!showEmoji)}
              className="p-2 hover:bg-background rounded-lg transition-colors"
              aria-label="Emojis"
            >
              <Smile size={17} />
            </button>
            <button onClick={() => handleSend()} disabled={(!input.trim() && !selectedImage) || isLoading} className="w-9 h-9 flex items-center justify-center bg-primary hover:bg-primary-hover text-white rounded-full disabled:opacity-50" aria-label="Send"><Send size={16} /></button>
          </div>
          {showEmoji && (
            <div className="absolute bottom-full left-0 mb-1 z-10">
              <EmojiPicker
                onEmojiClick={(e) => setInput(input + e.emoji)}
                theme="light"
                showPreview={false}
                showSkinTones={false}
                showCategoryButtons={true}
                perLine={8}
                i18n={{ categories: { search: '', recent: '', people: '', nature: '', foods: '', activity: '', places: '', objects: '', symbols: '', flags: '' } }}
              />
            </div>
          )}
        </div>
        <p className="text-[11px] text-text-secondary text-center mt-2">Trackly AI can make mistakes. Check important details.</p>
      </div>
    </div>
  );
}

export default function ChatbotPage() {
  return (
    <RequireAuth>
      <Suspense fallback={null}>
        <ChatbotContent />
      </Suspense>
    </RequireAuth>
  );
}
