"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Lock, ArrowRight } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import AuthLayout from "@/components/AuthLayout";
import AuthField from "@/components/AuthField";

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, new_password: password });
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="space-y-4">
        <div className="text-sm bg-danger-bg text-danger border-l-4 border-danger px-4 py-3 rounded">
          This reset link is missing its code. Please request a new one.
        </div>
        <Link href="/forgot-password" className="text-sm text-primary font-medium hover:underline">
          Request a new link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="space-y-4">
        <div className="text-sm bg-success-bg text-success border-l-4 border-success px-4 py-3 rounded">
          Your password has been updated.
        </div>
        <Link
          href="/login"
          className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-xl py-3.5 text-sm font-medium transition-colors"
        >
          Log in <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="text-sm bg-danger-bg text-danger border-l-4 border-danger px-3 py-2 rounded">
          {error}{" "}
          {error.includes("expired") && (
            <Link href="/forgot-password" className="underline">
              Request a new link
            </Link>
          )}
        </div>
      )}

      <AuthField
        label="New password"
        icon={Lock}
        type="password"
        required
        minLength={8}
        placeholder="At least 8 characters"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <AuthField
        label="Confirm new password"
        icon={Lock}
        type="password"
        required
        minLength={8}
        placeholder="Type it again"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-xl py-3.5 text-sm font-medium transition-colors disabled:opacity-60"
      >
        {loading ? "Saving…" : "Save new password"}
        {!loading && <ArrowRight size={16} />}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      variant="signup"
      title="Choose a new password"
      subtitle="Pick something you have not used before."
      headline="Almost back in."
      blurb="Set your new password and your progress is right where you left it."
      footer={
        <>
          <Link href="/login" className="text-primary font-medium hover:underline">
            Back to log in
          </Link>
        </>
      }
    >
      <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
        <ResetForm />
      </Suspense>
    </AuthLayout>
  );
}
