"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, X, Minimize2, Maximize2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function ChatWidget() {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!user || pathname === "/login" || pathname === "/signup" || pathname === "/" || pathname.startsWith("/verify") || pathname === "/chatbot") {
    return null;
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await api.post<{ response: string }>("/chat", {
        message: input.trim(),
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: res.response,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (e: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm Trackly AI. How can I help you with groups, tasks, or tracking?",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 lg:bottom-6 right-4 lg:right-6 w-14 h-14 bg-primary text-white rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center z-50"
      >
        <Bot size={24} />
      </button>
    );
  }

  return (
    <div className={clsx(
      "fixed bottom-20 lg:bottom-6 right-4 lg:right-6 bg-background border border-border rounded-2xl shadow-2xl z-50 flex flex-col transition-all",
      isMinimized ? "w-80 h-14" : "w-80 sm:w-96 h-[500px]"
    )}>
      <div className="flex items-center justify-between p-3 bg-primary text-white rounded-t-2xl">
        <div className="flex items-center gap-2">
          <Bot size={18} />
          <span className="text-sm font-medium">Trackly AI</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              const text = input.trim();
              if (text || messages.length > 0) {
                try {
                  localStorage.setItem(
                    "trackly_widget_handoff",
                    JSON.stringify(
                      messages.map((m, i) => ({
                        id: String(i),
                        role: m.role,
                        content: m.content,
                      }))
                    )
                  );
                } catch (e) {}
                router.push("/chatbot");
              } else {
                router.push("/chatbot?new=1");
              }
            }}
            className="p-1 hover:bg-white/10 rounded"
          >
            <Maximize2 size={14} />
          </button>
          <button onClick={() => setIsMinimized(!isMinimized)} className="p-1 hover:bg-white/10 rounded">
            <Minimize2 size={14} />
          </button>
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded">
            <X size={14} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-sm text-text-secondary mt-8">
                <Bot size={32} className="mx-auto mb-2 text-primary" />
                <p>Ask me anything about Trackly</p>
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={clsx("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                <div className={clsx(
                  "max-w-[80%] p-2 rounded-lg text-sm",
                  msg.role === "user" 
                    ? "bg-primary text-white" 
                    : "bg-surface border border-border"
                )}>
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-surface border border-border p-2 rounded-lg">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-2 border-t border-border flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Ask Trackly AI..."
              className="flex-1 px-2 py-1.5 text-sm border border-border rounded-lg bg-surface focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="p-1.5 bg-primary text-white rounded-lg disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
