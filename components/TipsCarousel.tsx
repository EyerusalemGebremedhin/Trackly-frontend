"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  ClipboardCheck,
  Lightbulb,
  Users,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

const tips = [
  { icon: CalendarCheck, label: "Rhythm", title: "Check in with a real weekly rhythm", text: "Set a weekly goal, then log a little progress each day so nothing piles up.", image: "/time.jpg", href: "/tasks", cta: "Open my tasks" },
  { icon: ClipboardCheck, label: "Honesty", title: "Check in, honestly", text: "A few minutes a day keeps your record straight, and your lead informed without a single meeting.", image: "/plan.jpg", href: "/tasks", cta: "Do today's check-in" },
  { icon: Lightbulb, label: "Insights", title: "Let the AI read the details fairly", text: "Insights flag risks from your check-ins, so you can fix problems early.", image: "/vision.jpg", href: "/performance", cta: "See performance" },
  { icon: Users, label: "Teamwork", title: "See your whole team's workload at a glance", text: "Leads get a clear read on who's blocked and who's carrying too much, without chasing anyone down.", image: "/team1.jpg", href: "/groups", cta: "Open my groups" },
];

export default function TipsCarousel() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [broken, setBroken] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((x) => (x + 1) % tips.length), 7000);
    return () => clearInterval(t);
  }, [paused]);

  const tip = tips[i];
  const Icon = tip.icon;
  const prev = () => setI((x) => (x - 1 + tips.length) % tips.length);
  const next = () => setI((x) => (x + 1) % tips.length);

  return (
    <div className="grid overflow-hidden rounded-3xl border bg-surface shadow-lg md:grid-cols-2" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="flex flex-col justify-between gap-6 p-6 md:p-10">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            <Icon size={14} /> {tip.label} · Tip {i + 1} of {tips.length}
          </p>
          <h3 className="mt-4 font-serif text-2xl text-accent md:text-3xl">{tip.title}</h3>
          <p className="mt-3 max-w-md text-muted">{tip.text}</p>
          <Link href={tip.href} className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90">
            {tip.cta} <ArrowRight size={16} />
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {tips.map((_, n) => (
              <button key={n} type="button" onClick={() => setI(n)} aria-label={`Show tip ${n + 1}`} className={`h-1.5 rounded-full transition-all ${n === i ? "w-10 bg-accent" : "w-5 bg-accent/25"}`} />
            ))}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={prev} aria-label="Previous tip" className="grid h-9 w-9 place-items-center rounded-full border transition hover:bg-black/5">
              <ChevronLeft size={18} />
            </button>
            <button type="button" onClick={next} aria-label="Next tip" className="grid h-9 w-9 place-items-center rounded-full border transition hover:bg-black/5">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
      <div className="relative h-56 bg-gradient-to-br from-[#2e0410] via-[#4a0a1b] to-[#8a2238] md:h-auto md:min-h-[20rem]">
        {tips.map((t, n) => (
          <div key={t.image} className={`absolute inset-0 transition-opacity duration-700 ${n === i ? "opacity-100" : "opacity-0"}`}>
            {!broken[t.image] ? (
              <img src={encodeURI(t.image)} alt="" onError={() => setBroken((b) => ({ ...b, [t.image]: true }))} className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center text-white/80">
                <t.icon size={64} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
