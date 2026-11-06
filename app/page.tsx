import Link from "next/link";
import { CheckCircle2, Users, Sparkles, ArrowDown } from "lucide-react";
import Logo from "@/components/Logo";
import HeroSlider from "@/components/HeroSlider";
import ThemeToggle from "@/components/ThemeToggle";

const FEATURES = [
  {
    icon: CheckCircle2,
    title: "Track your own progress",
    body: "Daily or weekly check-ins: what you aimed for, what got done, what's in the way. Your own honest record, kept over time.",
  },
  {
    icon: Users,
    title: "Lead a team with clarity",
    body: "See everyone's progress against a shared goal, who's blocked, and who's carrying too much, without chasing status updates.",
  },
  {
    icon: Sparkles,
    title: "AI that reads the details",
    body: "Not just done or not done. The analyzer weighs blockers and workload before judging, so it's a fair review, not a guess.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-paper">
      {}
      <div className="relative h-[70vh] min-h-[480px]">
        <HeroSlider />

        <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-5 md:px-12">
          <span className="flex items-center gap-2.5 font-serif text-2xl text-white">
            <Logo size={32} reversed />
            Trackly
          </span>
          <nav className="hidden sm:flex items-center gap-3">
            <div className="rounded-full bg-surface p-1 shadow">
              <ThemeToggle />
            </div>
            <Link
              href="/login"
              className="rounded-md px-3 py-2 text-sm text-white hover:bg-white/10"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-md bg-white px-4 py-2 text-sm font-medium text-[#3C050F] transition-colors hover:bg-[#F5DFE1]"
            >
              Get started free
            </Link>
          </nav>
          <div className="flex sm:hidden items-center gap-2">
            <div className="rounded-full bg-surface p-1 shadow">
              <ThemeToggle />
            </div>
          </div>
        </header>
      </div>

      <div className="sm:hidden px-6 py-4 flex flex-row gap-3">
        <Link href="/signup" className="rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white text-center flex-1 shadow-lg">Sign up</Link>
        <Link href="/login" className="rounded-md bg-white px-4 py-2.5 text-sm font-medium text-primary text-center flex-1 shadow-lg">Login</Link>
      </div>

      <section className="mx-auto max-w-3xl px-6 -mt-4 md:py-14 text-center md:py-16">
        <h1 className="font-serif text-3xl md:text-5xl leading-tight text-ink md:text-6xl">
          <span className="text-primary font-bold">Progress</span> <span className="text-primary font-bold">Tracked Honestly</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted">
          Whether it&apos;s just you, or a team you lead, check in on what you actually did,
          what&apos;s blocking you, and let the honest record speak for itself.
        </p>

        <p className="mt-6 text-xs text-muted">
          Daily, weekly or monthly check-ins · Personal plans and team boards · Fair AI feedback
        </p>
      </section>

      {}
      <section id="how-it-works" className="mx-auto grid max-w-6xl gap-6 px-6 pb-16 md:grid-cols-3 md:px-12">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-md border border-hairline bg-surface p-5">
            <Icon size={22} className="mb-3 text-primary" />
            <h3 className="mb-1.5 font-serif text-lg text-accent">{title}</h3>
            <p className="text-sm text-muted">{body}</p>
          </div>
        ))}
      </section>

      {}
      <section className="mx-auto max-w-3xl px-6 py-16 text-center md:px-12">
        <p className="font-serif text-2xl leading-snug text-ink md:text-3xl">
          &quot;What gets checked in, gets seen. What gets seen, gets fair credit.&quot;
        </p>
        <p className="mt-4 text-sm text-muted">The idea behind Trackly.</p>
      </section>

      <footer className="border-t border-hairline bg-surface/40">
        <div className="mx-auto max-w-6xl px-6 py-6 md:px-12">
          <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
            <span className="font-serif text-accent">Trackly</span>
            <span className="text-xs text-muted">© 2026 All rights reserved. Developed by Eyerusalem Gebremedhin</span>
            <span className="flex gap-4 text-xs items-center">
              <a href="mailto:trackly15@gmail.com" className="hover:opacity-80 flex flex-col items-center gap-1">
                <img src="/Email.png" alt="Email" className="h-5 w-5 object-contain" />
                <span className="text-blue-600 break-all">trackly15@gmail.com</span>
              </a>
              <a href="https://www.linkedin.com/in/eyerusalem-gebremedhin-793a493b4" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 flex flex-col items-center gap-1">
                <img src="/Ln.png" alt="LinkedIn" className="h-5 w-5 object-contain" />
                <span className="text-blue-600 break-all">linkedin.com/in/eyerusalem-gebremedhin-793a493b4</span>
              </a>
              <a href="https://github.com/EyerusalemGebremedhin" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 flex flex-col items-center gap-1">
                <img src="/github.jpeg" alt="GitHub" className="h-5 w-5 object-contain" />
                <span className="text-blue-600 break-all">github.com/EyerusalemGebremedhin</span>
              </a>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}