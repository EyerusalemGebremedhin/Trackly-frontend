import Link from "next/link";
import { useState } from "react";
import { MoreVertical, Copy, Pencil, Trash2 } from "lucide-react";
import Avatar from "@/components/Avatar";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

export type Checkin = {
  id: number; date: string; created_at: string;
  goal?: string; achieved?: string; went_well?: string;
  didnt_go_well?: string; needs_improvement?: string; blocker?: string | null;
  user: { id: number; first_name: string; last_name: string; job_title?: string; avatar_url?: string | null };
};

const FIELDS: [keyof Checkin, string][] = [
  ["goal", "Goal"],
  ["achieved", "Achieved"],
  ["went_well", "What went well"],
  ["didnt_go_well", "What didn't go well"],
  ["needs_improvement", "What needs to be improved"],
];

export default function CheckinMessage({ c }: { c: Checkin }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const mine = String(c.user.id) === String((user as any)?.id);
  const name = `${c.user.first_name} ${c.user.last_name}`;
  const time = new Date(c.created_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  return (
    <article className="group flex gap-3 px-4 py-3 hover:bg-muted/5">
      <Link href={`/profile/${c.user.id}`} className="shrink-0" aria-label={`${name}'s profile`}>
        <Avatar src={c.user.avatar_url} name={name} size={40} />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2 flex-wrap">
          <Link href={`/profile/${c.user.id}`} className="font-bold text-sm hover:underline">{name}</Link>
          <span className="text-xs text-muted">{time}</span>
          {c.user.job_title && <span className="text-xs text-muted">· {c.user.job_title}</span>}
        </div>

        <div className="mt-1 space-y-0.5 text-sm break-words">
          {FIELDS.map(([key, label]) =>
            c[key] ? (
              <p key={key}><span className="font-semibold">{label}:</span> {c[key] as string}</p>
            ) : null
          )}
          {c.blocker && (
            <p className="text-danger"><span className="font-semibold">Blocker:</span> {c.blocker}</p>
          )}
        </div>
      </div>

      {mine && (
        <div className="relative self-start">
          <button type="button" className="p-1 rounded hover:bg-muted/10 text-primary font-bold" onClick={(e) => { e.stopPropagation(); setOpen(!open); }} aria-label="More actions">
            <MoreVertical size={14} />
          </button>
          {open && (
            <div className="absolute right-0 mt-1 bg-surface border border-border rounded-lg shadow-md z-10 w-36" onClick={(e) => e.stopPropagation()}>
              <button type="button" className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted/10" onClick={() => { navigator.clipboard?.writeText(JSON.stringify(c)); setOpen(false); }}>
                <Copy size={14} /> Copy
              </button>
              <button type="button" className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted/10" onClick={() => { setOpen(false); window.location.href = "/tasks"; }}>
                <Pencil size={14} /> Edit
              </button>
              <button type="button" className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-muted/10" onClick={async () => {
                setOpen(false);
                if (!confirm("Delete this check-in?")) return;
                try { await api.delete(`/checkins/${c.id}`); window.location.reload(); } catch {}
              }}>
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>
      )}
      <Link
        href={`/profile/${c.user.id}`}
        className="opacity-0 group-hover:opacity-100 self-start text-xs text-primary hover:underline hidden md:block"
      >
        View profile
      </Link>
    </article>
  );
}
