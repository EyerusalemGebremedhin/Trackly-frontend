"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import AuthSplitLayout from "@/components/AuthSplitLayout";
import AuthField from "@/components/AuthField";

const SIGNUP_DRAFT_KEY = "trackly_signup_draft";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SIGNUP_DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw);
      setForm((f) => ({ ...f, firstName: draft.firstName || "", lastName: draft.lastName || "", email: draft.email || "" }));
      setAgreed(!!draft.agreed);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(SIGNUP_DRAFT_KEY, JSON.stringify({ firstName: form.firstName, lastName: form.lastName, email: form.email, agreed }));
    } catch {}
  }, [form.firstName, form.lastName, form.email, agreed]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!agreed) {
      setError("Please accept the Terms and Privacy Policy");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const name = `${form.firstName.trim()} ${form.lastName.trim()}`.trim().replace(/\s+/g, " ");
      await api.post("/auth/register", { name, email: form.email, password: form.password, skills: "" });
      try { sessionStorage.removeItem(SIGNUP_DRAFT_KEY); } catch {}
      router.push(`/verify-email?email=${encodeURIComponent(form.email)}`);
    } catch (err: any) {
      setError(err?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthSplitLayout
      variant="signup"
      title=""
      subtitle="Create your account to start tracking"
    >
      <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
        {error && (
          <div className="text-sm bg-danger-bg/80 text-danger border-l-4 border-danger px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AuthField
            label="First name"
            icon={User}
            required
            placeholder="First name"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            autoComplete="given-name"
            name="given-name"
          />
          <AuthField
            label="Last name"
            icon={User}
            required
            placeholder="Last name (including middle/compound names)"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            autoComplete="family-name"
            name="family-name"
          />
        </div>

        <AuthField
          label="Email address"
          icon={Mail}
          type="email"
          required
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          autoComplete="email"
          name="email"
        />

        <AuthField
          label="Password"
          icon={Lock}
          type="password"
          required
          placeholder="At least 8 characters"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          autoComplete="new-password"
          name="new-password"
        />

        <AuthField
          label="Confirm password"
          icon={Lock}
          type="password"
          required
          placeholder="Re-enter password"
          value={form.confirmPassword}
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          autoComplete="new-password"
          name="confirm-password"
        />

        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 h-4 w-4"
          />
          <span className="text-muted">
            I agree to the{" "}
            <Link href="/terms" className="text-primary hover:underline font-bold">Terms of Service</Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary hover:underline font-bold">Privacy Policy</Link>
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-primary text-white rounded-md px-4 py-3 min-h-[44px] text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create account"}
          <ArrowRight size={16} />
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/activate" className="text-primary hover:underline font-medium">
            Activate account
          </Link>
          <span className="mx-2">|</span>
          <Link href="/login" className="text-primary hover:underline font-medium">
          Sign in
        </Link>
      </div>
    </AuthSplitLayout>
  );
}
