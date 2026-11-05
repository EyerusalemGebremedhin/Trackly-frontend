"use client";

import { ReactNode, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import Logo from "./Logo";

interface AuthSplitLayoutProps {
  children: ReactNode;
  variant: "login" | "signup";
  title: string;
  subtitle: string;
}

const loginImages = [
  "/vision.jpg",
  "/time.jpg",
  "/learn.jpg",
  "/equal.jpg",
];

const signupImages = [
  "/progress.jpg",
  "/team1.jpg",
  "/direction.jpg",
];

export default function AuthSplitLayout({ children, variant, title, subtitle }: AuthSplitLayoutProps) {
  const images = variant === "login" ? loginImages : signupImages;
  const [currentImage, setCurrentImage] = useState(0);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      <div className="hidden lg:block relative overflow-hidden shadow-[0_30px_80px_-20px_rgba(60,5,15,0.5)]">
        {images.map((img, idx) => (
          <div
            key={img}
            className={`absolute inset-0 transition-opacity duration-1500 ${
              idx === currentImage ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={img}
              alt="Trackly"
              fill
              className="object-cover scale-105"
              priority={idx === 0}
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-14 text-white z-10">
          <Link href="/" className="flex items-center gap-3 mb-10">
            <Logo size={52} reversed={true} />
            <span className="text-4xl font-bold tracking-tight drop-shadow-lg" style={{ fontFamily: 'var(--font-serif)' }}>Trackly</span>
          </Link>
          <blockquote className="space-y-3">
            <p className="text-xl font-medium leading-relaxed italic drop-shadow-[0_3px_12px_rgba(0,0,0,0.95)]">
              "The key is not to prioritize what's on your schedule, but to schedule your priorities."
            </p>
            <p className="text-white/90 text-sm font-medium drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              Stephen R. Covey
            </p>
          </blockquote>
          <p className="text-white text-sm font-medium mt-6 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">Team Collaboration • Time Management • Goal Tracking</p>
        </div>
      </div>
      
      <div className="flex items-center justify-center p-4 sm:p-6 lg:p-10 bg-gradient-to-br from-background to-surface py-8 lg:py-12 relative min-h-screen">
        <button
          onClick={toggleTheme}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2.5 rounded-xl hover:bg-surface border border-border transition-colors shadow-sm"
          aria-label="Toggle theme"
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        <div className="w-full max-w-xl">
          <div className="mb-6 lg:mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-6 lg:mb-8 lg:hidden">
              <Link href="/" className="flex items-center gap-3">
                <Logo size={40} />
                <span className="text-2xl font-semibold tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>Trackly</span>
              </Link>
            </div>
            <div className="space-y-2 lg:space-y-3">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary" style={{ fontFamily: 'var(--font-serif)' }}>
                {variant === "login" ? "Welcome to Trackly" : "Join Trackly"}
              </h1>
              <p className="text-base lg:text-lg text-text-secondary">{subtitle}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-surface border border-border rounded-2xl p-6 sm:p-8 lg:p-10 shadow-[0_35px_75px_-20px_rgba(60,5,15,0.4)] mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
