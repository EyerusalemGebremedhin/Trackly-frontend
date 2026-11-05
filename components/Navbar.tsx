"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Bot, LogOut, LayoutDashboard, Users, CheckSquare, BarChart3, User } from "lucide-react";
import Logo from "./Logo";

export default function Navbar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <nav className="border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Logo />
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
                <LayoutDashboard size={18} />
                Dashboard
              </Link>
              <Link href="/groups" className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
                <Users size={18} />
                Groups
              </Link>
              <Link href="/tasks" className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
                <CheckSquare size={18} />
                Tasks
              </Link>
              <Link href="/metrics" className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
                <BarChart3 size={18} />
                Insights
              </Link>
              <Link href="/chatbot" className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-hover transition-colors">
                <Bot size={18} />
                AI Chatbot
                <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">New</span>
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/profile" className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
              <User size={18} />
              <span className="hidden sm:inline">{user.name}</span>
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-sm text-text-secondary hover:text-danger transition-colors"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
