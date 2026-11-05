"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";

type N = { id: number; title?: string; message?: string; body?: string; read?: boolean; created_at?: string };

export default function NotificationsPage() {
  const [items, setItems] = useState<N[]>([]);
  useEffect(() => {
    api.get<N[]>("/notifications").then(setItems).catch(() => setItems([]));
  }, []);
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-primary mb-4">
        <ArrowLeft size={16} /> Back
      </Link>
      <h1 className="text-2xl mb-4">Notifications</h1>
      {items.length === 0 ? (
        <p className="text-sm opacity-70">No notifications yet.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((n) => (
            <li key={n.id} className="border border-border rounded-lg p-3">
              <p className="font-medium">{n.title || "Notification"}</p>
              <p className="text-sm text-muted">{n.message || n.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
