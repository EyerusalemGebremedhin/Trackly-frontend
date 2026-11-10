"use client";

import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

export default function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab") return;
      const root = dialogRef.current;
      if (!root) return;
      const focusable = Array.from(
        root.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])')
      ).filter((el) => !el.hasAttribute("disabled"));
      if (focusable.length === 0) { e.preventDefault(); return; }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      prev?.focus();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="bg-surface rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto p-5 border border-hairline outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4 gap-3">
          <h3 id={titleId} className="font-serif text-lg text-accent">{title}</h3>
          <button onClick={onClose} aria-label="Close dialog" className="text-muted hover:text-ink min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
