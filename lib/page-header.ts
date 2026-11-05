"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type Quote = [string, string];

interface PageConfig {
  match: string[];
  title: string;
  isDashboard?: boolean;
  quotes: Quote[];
}

const PAGES: PageConfig[] = [
  {
    match: ["/dashboard"],
    title: "Dashboard",
    isDashboard: true,
    quotes: [
      ["The bad news is time flies. The good news is you're the pilot.", "Michael Altshuler"],
      ["Success is the sum of small efforts, repeated day in and day out.", "Robert Collier"],
      ["Do what you can, with what you have, where you are.", "Theodore Roosevelt"],
    ],
  },
  {
    match: ["/my-tasks", "/tasks"],
    title: "My Tasks",
    quotes: [
      ["Well done is better than well said.", "Benjamin Franklin"],
      ["Small deeds done are better than great deeds planned.", "Peter Marshall"],
      ["The way to get started is to quit talking and begin doing.", "Walt Disney"],
      ["Don't watch the clock; do what it does. Keep going.", "Sam Levenson"],
    ],
  },
  {
    match: ["/groups"],
    title: "Groups",
    quotes: [
      ["Alone we can do so little; together we can do so much.", "Helen Keller"],
      ["If you want to go fast, go alone. If you want to go far, go together.", "African proverb"],
      ["Teamwork makes the dream work.", "John C. Maxwell"],
      ["Coming together is a beginning; keeping together is progress; working together is success.", "Henry Ford"],
    ],
  },
  {
    match: ["/performance", "/leaderboard"],
    title: "Performance",
    quotes: [
      ["What gets measured gets managed.", "Peter Drucker"],
      ["Productivity is never an accident. It is always the result of a commitment to excellence.", "Paul J. Meyer"],
      ["It always seems impossible until it is done.", "Nelson Mandela"],
    ],
  },
  {
    match: ["/metrics"],
    title: "Metrics",
    quotes: [
      ["What gets measured gets managed.", "Peter Drucker"],
      ["Plans are only good intentions unless they immediately degenerate into hard work.", "Peter Drucker"],
      ["Success is the sum of small efforts, repeated day in and day out.", "Robert Collier"],
    ],
  },
  {
    match: ["/chatbot", "/chat"],
    title: "Trackly AI",
    quotes: [
      ["Well done is better than well said.", "Benjamin Franklin"],
      ["Do what you can, with what you have, where you are.", "Theodore Roosevelt"],
    ],
  },
];

const FALLBACK: PageConfig = {
  match: [],
  title: "Trackly",
  quotes: [["Teamwork makes the dream work.", "John C. Maxwell"]],
};

export function usePageHeader() {
  const pathname = usePathname() || "";
  const config =
    PAGES.find((p) => p.match.some((m) => pathname === m || pathname.startsWith(m + "/"))) || FALLBACK;

  const [quote, setQuote] = useState<Quote | null>(null);

  useEffect(() => {
    const pool = config.quotes;
    setQuote(pool[Math.floor(Math.random() * pool.length)]);
  }, [pathname]);

  return { title: config.title, isDashboard: !!config.isDashboard, quote };
}
