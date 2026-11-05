"use client";

import { ReactNode, useEffect, useState } from "react";
import TracklySidebar from "./TracklySidebar";
import MobileNavNew from "./MobileNavNew";
import { useAuth } from "@/lib/auth-context";
import { Bell, MessageCircle } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Quote } from "@/lib/types";
import ChatWidget from "./ChatWidget";

function clean(text: string) {
  return text.replace(/\s*[\u2013\u2014\u2015]\s*/g, ", ");
}

export default function TracklyAppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [quote, setQuote] = useState<Quote | null>(null);

  useEffect(() => {
    api
      .get<{ themes: string[]; quotes: Quote[] }>("/quotes")
      .then((res) => {
        if (res.quotes.length > 0) {
          setQuote(res.quotes[Math.floor(Math.random() * res.quotes.length)]);
        }
      })
      .catch(() => setQuote(null));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <TracklySidebar />
      <MobileNavNew />
      
      <div className="lg:pl-72">
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 gap-4">
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-semibold truncate" style={{ fontFamily: 'var(--font-serif)' }}>Welcome back, {user?.name?.split(' ')[0]}</h2>
               {quote ? (
                 <p className="text-xs text-muted line-clamp-2">
                   "{clean(quote.text)}" <span className="text-primary/70">- {clean(quote.author)}</span>
                 </p>
               ) : (
                <p className="text-sm text-text-secondary">Talk to Trackly • Manage your goals</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/chatbot"
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium"
              >
                <MessageCircle size={16} />
                Talk to Trackly
              </Link>
              <ThemeToggle />
              <Link href="/notifications" aria-label="Notifications" className="relative p-2 rounded-lg hover:bg-surface transition-colors">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
              </Link>
            </div>
          </div>
        </header>
        
        <main className="px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-6 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
      <ChatWidget />
    </div>
  );
}
