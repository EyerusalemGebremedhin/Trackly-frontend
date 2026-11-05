"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
import clsx from "clsx";
import { navItems } from "@/lib/nav";
import Avatar from "@/components/Avatar";
import { useAuth } from "@/lib/auth-context";

export default function MobileNavNew() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const primary = navItems.filter((i) => i.primary);
  const more = navItems.filter((i) => !i.primary);
  const moreActive = more.some((i) => pathname.startsWith(i.href)) || pathname.startsWith("/profile");

  useEffect(() => setOpen(false), [pathname]);

  const fullName = `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim() || user?.name || "";

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setOpen(false)}>
          <div
            className="absolute bottom-16 inset-x-0 max-h-[75dvh] overflow-y-auto rounded-t-2xl bg-background p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="font-semibold">More</span>
              <button onClick={() => setOpen(false)} aria-label="Close"><X size={18} /></button>
            </div>

            <Link href="/profile" className="mb-2 flex items-center gap-3 rounded-lg border p-3 hover:bg-primary/5">
              <Avatar src={user?.avatar_url} name={fullName || "?"} size={40} />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{fullName}</p>
                <p className="text-xs text-muted truncate">{user?.email}</p>
              </div>
              <span className="ml-auto text-xs text-primary">Profile</span>
            </Link>

            {more.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm ${
                  pathname.startsWith(href) ? "bg-primary/10 text-primary font-medium" : ""
                }`}
              >
                <Icon size={18} /> {label}
              </Link>
            ))}

            <button
              onClick={() => { setOpen(false); logout(); }}
              className="mt-2 flex w-full items-center gap-3 rounded-lg border-t px-3 py-3 text-sm text-danger"
            >
              <LogOut size={18} /> Log out
            </button>
          </div>
        </div>
      )}

      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 flex h-16 items-center justify-around bg-primary text-white pb-[env(safe-area-inset-bottom)] rounded-t-2xl">
        {primary.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx("flex flex-1 flex-col items-center gap-1 text-[11px]", active ? "opacity-100" : "opacity-70")}
            >
              <Icon size={20} />
              <span className="truncate max-w-full px-1">{label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setOpen((o) => !o)}
          className={clsx("flex flex-1 flex-col items-center gap-1 text-[11px]", open || moreActive ? "opacity-100" : "opacity-70")}
        >
          <Menu size={20} />
          <span>More</span>
        </button>
      </nav>
    </>
  );
}
