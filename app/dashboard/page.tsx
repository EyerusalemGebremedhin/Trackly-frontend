"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Plus,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  MessageCircle,
  Users,
  MessagesSquare,
  Trophy,
  BarChart3,
  Bot,
  UserCog,
} from "lucide-react";
import AlertList from "@/components/AlertList";
import { StatCard } from "@/components/ui";
import NewPlanModal from "@/components/NewPlanModal";
import FeatureShowcase from "@/components/FeatureShowcase";
import { api } from "@/lib/api";
import type { MyDashboard } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";

const HERO_IMAGE = "/sunshine.jpg";
const HERO_IMAGES = [
  { src: "/wancha.jpg", pos: "center 30%" },
  { src: "/can.jpg", pos: "center 60%" },
  { src: "/sunshine.jpg", pos: "center" },
];

const flow = [
  { n: "1", title: "Plan", text: "Create a plan and break it into tasks." },
  { n: "2", title: "Do", text: "Move tasks across To be done, In progress, In review and Done." },
  { n: "3", title: "Check in", text: "Log what you achieved and any blockers, every day." },
  { n: "4", title: "Collaborate", text: "Work with your group in Discussion." },
  { n: "5", title: "Measure", text: "Watch Performance and Metrics to spot trends." },
  { n: "6", title: "Grow", text: "Learn from the data and improve next week." },
];




function Ring({ value }: { value: number }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="relative h-32 w-32">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="10" />
        <circle cx="60" cy="60" r={r} fill="none" stroke="#fff" strokeWidth="10" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (c * pct) / 100} className="transition-all duration-700" />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="font-serif text-3xl leading-none text-white">{pct}%</p>
          <p className="mt-1 text-[10px] uppercase tracking-wider text-white/70">complete</p>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-5">
      <h2 className="font-serif text-2xl text-accent">{title}</h2>
      {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [dash, setDash] = useState<MyDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [newPlanOpen, setNewPlanOpen] = useState(false);
  const greeting = "Hello";

  const load = useCallback(async () => {
    const data = await api.get<MyDashboard>("/dashboard/me");
    setDash(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const [heroIdx, setHeroIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setHeroIdx((i) => (i + 1) % HERO_IMAGES.length), 6000);
    return () => clearInterval(t);
  }, []);

  if (loading || !dash) {
    return <p className="text-sm text-muted">Loading your progress…</p>;
  }

  const firstName = user?.name?.split(" ")[0] ?? "";
  const open = dash.total_tasks - dash.done_tasks;
  const summary = dash.total_tasks === 0
    ? "Nothing planned yet. Start with a new plan whenever you're ready."
    : dash.overdue_tasks > 0
    ? `${dash.overdue_tasks} ${dash.overdue_tasks === 1 ? "task needs" : "tasks need"} your attention. You've got this.`
    : open === 0
    ? `All ${dash.done_tasks} tasks are done. Great work!`
    : `${open} to go, and ${dash.done_tasks} already done. Nice progress.`;

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-14">
  <section className="overflow-hidden rounded-3xl border bg-surface shadow-lg">
    <div className="relative h-[320px] overflow-hidden bg-gradient-to-br from-[#2e0410] to-[#8a2238] md:h-[480px]">
      {HERO_IMAGES.map((h, i) => (
        <div key={h.src} className={`absolute inset-0 bg-cover transition-opacity duration-1000 ${i === heroIdx ? "opacity-100" : "opacity-0"}`} style={{ backgroundImage: `url("${encodeURI(h.src)}")`, backgroundPosition: h.pos }} />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
      <button type="button" onClick={() => setHeroIdx((i) => (i - 1 + HERO_IMAGES.length) % HERO_IMAGES.length)} aria-label="Previous picture" className="absolute left-4 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/80 text-[#3d0612] shadow transition hover:bg-white">
        <ChevronLeft size={20} />
      </button>
      <button type="button" onClick={() => setHeroIdx((i) => (i + 1) % HERO_IMAGES.length)} aria-label="Next picture" className="absolute right-4 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/80 text-[#3d0612] shadow transition hover:bg-white">
        <ChevronRight size={20} />
      </button>
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {HERO_IMAGES.map((_, i) => (
          <button key={i} type="button" onClick={() => setHeroIdx(i)} aria-label={`Show picture ${i + 1}`} className={`h-2 rounded-full transition-all ${i === heroIdx ? "w-6 bg-white" : "w-2 bg-white/60"}`} />
        ))}
      </div>
    </div>

    <div className="relative grid items-center gap-6 p-6 md:grid-cols-[1fr_auto] md:p-8">
      <div>
        <h1 className="font-serif text-3xl text-accent md:text-4xl">{greeting} {firstName}</h1>
        <p className="mt-2 font-medium">{summary}</p>
        <p className="mt-1 max-w-xl text-sm text-muted">Trackly helps you plan your work, check in every day, and grow with your team, all in one place.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={() => setNewPlanOpen(true)} className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90">
            <Plus size={16} /> New plan
          </button>
          <Link href="/tasks" className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition hover:bg-black/5">
            Open my tasks <ArrowRight size={16} />
          </Link>
          <Link href="/messages" className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition hover:bg-black/5">
            Messages
          </Link>
        </div>
      </div>
      <div className="mx-auto flex flex-col items-center gap-2 rounded-2xl bg-gradient-to-br from-[#2e0410] to-[#8a2238] p-5">
        <Ring value={Number(dash.completion_rate) || 0} />
        <p className="text-xs text-white/80">{dash.done_tasks} of {dash.total_tasks} tasks done</p>
      </div>
    </div>
  </section>

      <section>
        <AlertList alerts={dash.alerts} />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Total tasks" value={dash.total_tasks} />
          <StatCard label="Done" value={dash.done_tasks} accent="success" />
          <StatCard label="Overdue" value={dash.overdue_tasks} accent="danger" />
          <StatCard label="Completion rate" value={`${dash.completion_rate}%`} accent="primary" />
        </div>
      </section>

      <section>
        <SectionTitle title="How Trackly works" sub="From a plan to real growth, in six simple steps." />
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {flow.map((s, i) => (
            <li key={s.n} className="relative rounded-2xl border bg-surface p-4 transition hover:-translate-y-1 hover:shadow-md">
              <span className="mb-3 grid h-9 w-9 place-items-center rounded-full bg-accent font-serif text-white">{s.n}</span>
              <p className="font-semibold">{s.title}</p>
              <p className="mt-1 text-xs text-muted">{s.text}</p>
              {i < flow.length - 1 && <ArrowRight size={16} className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-muted lg:block" />}
            </li>
          ))}
        </ol>
      </section>

      <section>
        <SectionTitle title="Everything in one place" sub="Choose an area to see what it does." />
        <FeatureShowcase />
      </section>


      {newPlanOpen && (
        <NewPlanModal
          onClose={() => setNewPlanOpen(false)}
          onDone={() => { setNewPlanOpen(false); load(); }}
        />
      )}
    </div>
  );
}
