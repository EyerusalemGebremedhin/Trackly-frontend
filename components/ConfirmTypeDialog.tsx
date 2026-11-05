"use client";
import { useState } from "react";

export type DmAction = "clear" | "delete" | "everyone";

const META: Record<DmAction, { title: string; word: string; body: string; btn: string }> = {
  clear:    { title: "Clear history?",       word: "clear",  btn: "Clear history",
              body: "All messages are removed for you only. The other person keeps theirs." },
  delete:   { title: "Delete this chat?",    word: "delete", btn: "Delete chat",
              body: "The chat is removed from your list. The other person keeps their copy." },
  everyone: { title: "Delete for everyone?", word: "delete", btn: "Delete for everyone",
              body: "The whole conversation is permanently deleted for both of you. This can't be undone." },
};

export default function ConfirmTypeDialog({
  action, name, onCancel, onConfirm,
}: {
  action: DmAction;
  name: string;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}) {
  const m = META[action];
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const ok = value.trim().toLowerCase() === m.word;

  async function go() {
    if (!ok || busy) return;
    setBusy(true);
    try { await onConfirm(); } finally { setBusy(false); }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onCancel}>
      <div className="w-full max-w-sm rounded-xl bg-surface p-5" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-1 font-semibold">{m.title}</h3>
        <p className="text-sm text-muted">Chat with <span className="font-medium text-ink">{name}</span></p>
        <p className="mt-2 mb-4 text-sm text-muted">{m.body}</p>

        <label className="mb-1 block text-sm">
          Type <span className="font-mono font-semibold">{m.word}</span> to confirm
        </label>
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && go()}
          className="mb-4 w-full rounded-md border border-border px-3 py-2 text-sm"
          placeholder={m.word}
        />

        <div className="flex justify-end gap-2">
          <button className="rounded-md border border-border px-3 py-2 text-sm" onClick={onCancel}>Cancel</button>
          <button
            onClick={go}
            disabled={!ok || busy}
            className="rounded-md bg-red-600 px-3 py-2 text-sm text-white disabled:opacity-40"
          >
            {busy ? "Working..." : m.btn}
          </button>
        </div>
      </div>
    </div>
  );
}
