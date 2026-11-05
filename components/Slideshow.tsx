"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";

type Slide = {
  caption: string;
  render: () => React.ReactNode;
};

function CheckinSlide() {
  return (
    <svg viewBox="0 0 500 200" className="w-full h-full">
      <rect x="0" y="0" width="500" height="200" fill="#F4E7EA" />
      <rect x="40" y="40" width="200" height="120" rx="10" fill="#FFFFFF" stroke="#E5E1E3" strokeWidth="1.5" />
      <rect x="40" y="40" width="200" height="34" rx="10" fill="#2E0219" />
      <rect x="40" y="64" width="200" height="10" fill="#2E0219" />
      <text x="58" y="62" fontFamily="Georgia, serif" fontSize="13" fill="#FFFFFF">Weekly check-in</text>
      <rect x="58" y="90" width="164" height="7" rx="3.5" fill="#F4E7EA" />
      <rect x="58" y="104" width="120" height="7" rx="3.5" fill="#F4E7EA" />
      <rect x="58" y="128" width="164" height="16" rx="4" fill="#FFFBEB" stroke="#FACC15" strokeWidth="1" />
      <g transform="translate(290,55)">
        <circle cx="40" cy="40" r="40" fill="#FFFFFF" stroke="#E5E1E3" strokeWidth="1.5" />
        <circle cx="40" cy="40" r="30" fill="none" stroke="#F4E7EA" strokeWidth="8" />
        <circle cx="40" cy="40" r="30" fill="none" stroke="#166534" strokeWidth="8" strokeDasharray="141 188" strokeLinecap="round" transform="rotate(-90 40 40)" />
        <text x="40" y="46" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="15" fontWeight="600" fill="#2E0219">75%</text>
      </g>
      <text x="410" y="70" fontFamily="Georgia, serif" fontSize="13" fill="#2E0219">This week's</text>
      <text x="410" y="88" fontFamily="Georgia, serif" fontSize="13" fill="#2E0219">goal</text>
    </svg>
  );
}

function TeamSlide() {
  return (
    <svg viewBox="0 0 500 200" className="w-full h-full">
      <rect x="0" y="0" width="500" height="200" fill="#F4E7EA" />
      {[
        { x: 60, h: 60, done: true },
        { x: 130, h: 90, done: true },
        { x: 200, h: 40, done: false },
        { x: 270, h: 75, done: true },
        { x: 340, h: 30, done: false },
      ].map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={160 - b.h} width="42" height={b.h} rx="4" fill={b.done ? "#2E0219" : "#8A6270"} />
        </g>
      ))}
      <circle cx="430" cy="60" r="18" fill="#2E0219" />
      <circle cx="452" cy="60" r="18" fill="#8A6270" />
      <circle cx="474" cy="60" r="18" fill="#166534" />
      <text x="430" y="100" fontFamily="Inter, sans-serif" fontSize="12" fill="#2E0219">Your team's</text>
      <text x="430" y="116" fontFamily="Inter, sans-serif" fontSize="12" fill="#2E0219">workload</text>
    </svg>
  );
}

function InsightSlide() {
  return (
    <svg viewBox="0 0 500 200" className="w-full h-full">
      <rect x="0" y="0" width="500" height="200" fill="#F4E7EA" />
      <rect x="60" y="40" width="380" height="120" rx="10" fill="#FFFFFF" stroke="#E5E1E3" strokeWidth="1.5" />
      <circle cx="94" cy="70" r="12" fill="#2E0219" />
      <path d="M89 70 l3 4 l8 -9" stroke="#FFFFFF" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <text x="116" y="66" fontFamily="Georgia, serif" fontSize="13" fill="#2E0219">Insight</text>
      <rect x="86" y="88" width="330" height="7" rx="3.5" fill="#F4E7EA" />
      <rect x="86" y="102" width="280" height="7" rx="3.5" fill="#F4E7EA" />
      <rect x="86" y="124" width="150" height="18" rx="9" fill="#EAF5EE" />
      <text x="98" y="137" fontFamily="Inter, sans-serif" fontSize="10" fill="#166534">low risk</text>
    </svg>
  );
}

const SLIDES: Slide[] = [
  { caption: "Check in with a real weekly rhythm", render: CheckinSlide },
  { caption: "See your whole team's workload at a glance", render: TeamSlide },
  { caption: "Let the AI read the details fairly", render: InsightSlide },
];

export default function Slideshow() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 4500);
    return () => clearInterval(id);
  }, []);

  const Current = SLIDES[index].render;

  return (
    <div className="relative bg-blush rounded-md overflow-hidden mb-8">
      <div className="h-40 md:h-48">
        <Current />
      </div>

      <button
        onClick={() => setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length)}
        aria-label="Previous slide"
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-surface/80 hover:bg-surface rounded-full p-1.5 border border-hairline"
      >
        <ChevronLeft size={16} className="text-ink" />
      </button>
      <button
        onClick={() => setIndex((i) => (i + 1) % SLIDES.length)}
        aria-label="Next slide"
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-surface/80 hover:bg-surface rounded-full p-1.5 border border-hairline"
      >
        <ChevronRight size={16} className="text-ink" />
      </button>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={clsx(i === index ? "bg-primary" : "bg-surface/70", "w-1.5 h-1.5 rounded-full")}
          />
        ))}
      </div>

      <p className="text-center text-xs text-muted py-2 border-t border-hairline bg-surface">
        {SLIDES[index].caption}
      </p>
    </div>
  );
}
