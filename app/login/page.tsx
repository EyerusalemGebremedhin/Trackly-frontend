"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";
import { useRouter } from "next/navigation";
import AuthSplitLayout from "@/components/AuthSplitLayout";
import AuthField from "@/components/AuthField";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
     } catch (err) {
      if (err instanceof ApiError) {
        const lower = err.message.toLowerCase();
        if (err.message.includes("EMAIL_NOT_VERIFIED") || lower.includes("not verified") || lower.includes("mfa") || lower.includes("verification code")) {
          router.push(`/verify-email?email=${encodeURIComponent(email)}`);
          return;
        }
        if (err.status === 401) {
          setError("Incorrect email or password");
        } else {
          setError("Something went wrong. Please try again.");
        }
      } else {
        setError("Couldn't sign in, please try again");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthSplitLayout
      variant="login"
      subtitle="Sign in to continue your journey"
    >
      <form onSubmit={handleSubmit} className="space-y-5" autoComplete="on">
        {error && (
          <div role="alert" className="text-sm bg-danger-bg/80 text-danger border-l-4 border-danger px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <AuthField
          label="Email address"
          icon={Mail}
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          name="email"
        />

        <AuthField
          label="Password"
          icon={Lock}
          type="password"
          required
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          name="password"
        />

        <div className="flex items-center justify-end">
          <Link href="/forgot-password" className="text-sm text-primary hover:underline font-medium">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          className="w-full flex items-center justify-center gap-2 bg-primary text-white rounded-md px-4 py-2.5 text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
          <ArrowRight size={16} />
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-primary hover:underline font-medium">
          Sign up
        </Link>
      </div>
    </AuthSplitLayout>
  );
}
