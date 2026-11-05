"use client";

import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import { useAuth } from "@/lib/auth-context";
import { LogOut, Bell } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function NewAppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <MobileNav />
      
      <div className="md:pl-72">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
            <div>
              <h2 className="text-lg font-semibold">Welcome back, {user?.name?.split(' ')[0]}</h2>
              <p className="text-sm text-text-secondary">Track your progress and goals</p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button className="p-2 rounded-lg hover:bg-surface transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
              </button>
              <button
                onClick={logout}
                className="p-2 rounded-lg hover:bg-surface transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>
        
        <main className="px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-6 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
