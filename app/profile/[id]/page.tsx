"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MessageCircle, Mail, Bookmark } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import Avatar from "@/components/Avatar";

export default function ViewProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { user: me } = useAuth();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get(`/users/${id}`)
      .then((res) => setUser(res))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-sm text-muted">Loading…</p>;
  if (!user) return <p className="text-sm text-muted">User not found.</p>;

  const isMe = String(me?.id) === String(id);

  const skills: string[] = Array.isArray(user.skills)
    ? user.skills
    : (user.skills || "").split(",").map((s: string) => s.trim()).filter(Boolean);

  async function startMessage() {
    setBusy(true);
    setError(null);
    try {
      const res: any = await api.post("/dm/open", { user_id: Number(id) });
      router.push(`/messages/${res.conversation_id}`);
    } catch (e) {
      console.error(e);
      setError("Couldn't open the conversation. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <Avatar src={user.avatar_url} name={user.name || "?"} size={64} />

          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold">{user.name}</h1>
            {user.job_title && <p className="text-sm text-primary">{user.job_title}</p>}
            {"is_active" in user && (
              <p className="mt-1 flex items-center gap-2 text-xs text-muted">
                <span className={`h-2.5 w-2.5 rounded-full ${user.is_active ? "bg-green-500" : "bg-gray-400"}`} />
                {user.is_active ? "Active" : "Away"}
              </p>
            )}
          </div>

          <button
              onClick={startMessage}
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
            >
              {isMe ? <Bookmark size={16} /> : <MessageCircle size={16} />}
              {busy ? "Opening..." : isMe ? "Saved" : "Message"}
            </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 text-sm bg-danger-bg/80 text-danger border-l-4 border-danger px-4 py-3 rounded-lg" role="alert">
            {error}
          </div>
        )}

        <div className="p-6 space-y-5">
          <section>
            <p className="text-sm font-medium mb-1">Contact information</p>
            <a href={`mailto:${user.email}`} className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
              <Mail size={16} /> {user.email}
            </a>
          </section>

          <section>
            <p className="text-sm font-medium mb-2">Skills</p>
            {skills.length ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <span key={s} className="rounded-full bg-primary/10 text-primary px-3 py-1 text-xs">{s}</span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">No skills added</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
