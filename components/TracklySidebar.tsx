"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Users, CheckSquare, MessageCircle, UserRound, LogOut, BarChart3, Trophy, MessagesSquare, Bot } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import clsx from "clsx";
import { useState } from "react";
import Logo from "./Logo";

const NAV = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/tasks", label: "My Tasks", icon: CheckSquare },
  { href: "/groups", label: "Groups", icon: Users },
  { href: "/discussion", label: "Discussion", icon: MessagesSquare },
  { href: "/messages", label: "Direct Messages", icon: MessageCircle },
  { href: "/leaderboard", label: "Performance", icon: Trophy },
  { href: "/metrics", label: "Metrics", icon: BarChart3 },
  { href: "/chatbot", label: "Talk to Trackly", icon: Bot },
];

export default function TracklySidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 bg-sidebar shadow-2xl">
      <div className="flex items-center gap-3 px-6 py-7 border-b border-white/10">
        <Logo size={44} reversed />
        <div>
          <span className="text-2xl font-bold tracking-tight text-white" style={{ fontFamily: 'var(--font-serif)' }}>Trackly</span>
          <p className="text-xs text-white/80">Track. Achieve. Grow.</p>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all",
                active 
                  ? "bg-white text-primary shadow-lg" 
                  : "text-white/90 hover:text-primary hover:bg-white hover:shadow-md hover:translate-x-1"
              )}
            >
              <Icon size={20} />
              {label}
            </Link>
          );
        })}
      </nav>
      
      <div className="px-4 py-4 border-t border-white/10 relative">
        {showMenu && (
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-xl shadow-2xl overflow-hidden">
            <Link
              href="/profile"
              onClick={() => setShowMenu(false)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-900"
            >
              <UserRound size={18} />
              <span className="text-sm font-medium">Profile</span>
            </Link>
            <button
              onClick={() => {
                setShowMenu(false);
                logout();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600"
            >
              <LogOut size={18} />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        )}
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/10 transition-all"
        >
          <div className="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center text-sm font-semibold shadow-lg overflow-hidden">
            {(user as any)?.avatar_url ? (
              <img src={(user as any).avatar_url?.startsWith('http') ? (user as any).avatar_url : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') + (user as any).avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span>{user?.name?.[0]?.toUpperCase() ?? "U"}</span>
            )}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-white/80 truncate">{user?.email}</p>
          </div>
        </button>
      </div>
    </aside>
  );
}
