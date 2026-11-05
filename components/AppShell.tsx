"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BarChart3, Users, UserRound, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { Quote } from "@/lib/types";
import ThemeToggle from "./ThemeToggle";
import Logo from "./Logo";
import clsx from "clsx";

const NAV = [
  { href: "/dashboard", label: "My progress", icon: LayoutDashboard },
  { href: "/groups", label: "Groups", icon: Users },
  { href: "/metrics", label: "Metrics", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: UserRound },
];

function clean(text: string) {
  return text.replace(/\s*[\u2013\u2014\u2015]\s*/g, ", ");
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
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
    <div className="min-h-screen bg-paper">
      {}
      <header className="sticky top-0 z-10 bg-paper border-b border-hairline flex items-center justify-between px-5 py-3 shadow-sm gap-4">
        <div className="flex items-center gap-2.5 shrink-0">
          <Logo size={32} />
          <span className="font-serif text-lg text-accent">Trackly</span>
        </div>
        {quote && (
          <p className="hidden md:block flex-1 text-center font-serif text-base text-primary truncate px-4">
            &quot;{clean(quote.text)}&quot; <span className="text-muted font-sans text-sm">· {clean(quote.author)}</span>
          </p>
        )}
        <div className="flex items-center gap-3 shrink-0">
          <ThemeToggle />
          <div className="w-8 h-8 rounded-full bg-blush text-primary flex items-center justify-center text-sm font-medium">
            {user?.name?.[0]?.toUpperCase() ?? "?"}
          </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row">
        {}
        <aside className="md:w-60 md:min-h-[calc(100vh-57px)] border-b md:border-b-0 md:border-r border-hairline flex flex-col justify-between">
          <nav className="flex md:flex-col p-3 gap-1 overflow-x-auto md:overflow-visible">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={clsx(
                    "flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm whitespace-nowrap font-medium transition-colors",
                    active ? "bg-primary text-white" : "text-ink hover:bg-blush"
                  )}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="p-3 hidden md:block">
            <button
              onClick={logout}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium text-muted hover:bg-danger-bg hover:text-danger w-full transition-colors"
            >
              <LogOut size={16} />
              Log out
            </button>
          </div>
        </aside>

        <main className="flex-1 px-4 py-6 md:px-10 md:py-10 max-w-6xl mx-auto w-full">{children}</main>
      </div>
    </div>
  );
}