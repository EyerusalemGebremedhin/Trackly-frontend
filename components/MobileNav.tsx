"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { navItems } from "@/lib/nav";

export default function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const primary = navItems.filter((i) => i.primary);
  const more = navItems.filter((i) => !i.primary);
  const moreActive = more.some((i) => pathname.startsWith(i.href));

  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setOpen(false)}>
          <div
            className="absolute bottom-16 inset-x-0 rounded-t-2xl bg-background p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="font-semibold">More</span>
              <button onClick={() => setOpen(false)} aria-label="Close menu"><X size={18} /></button>
            </div>
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
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 inset-x-0 z-50 flex h-16 items-center justify-around bg-primary text-white md:hidden pb-[env(safe-area-inset-bottom)]">
        {primary.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-1 text-[11px] ${active ? "opacity-100" : "opacity-70"}`}
            >
              <Icon size={20} />
              <span className="truncate max-w-full px-1">{label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setOpen((o) => !o)}
          className={`flex flex-1 flex-col items-center gap-1 text-[11px] ${open || moreActive ? "opacity-100" : "opacity-70"}`}
        >
          <Menu size={20} />
          <span>More</span>
        </button>
      </nav>
    </>
  );
}
