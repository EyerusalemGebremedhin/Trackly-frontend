"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, ShieldCheck } from "lucide-react";
import { api, ApiError, setTokens } from "@/lib/api";
import AuthSplitLayout from "@/components/AuthSplitLayout";

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const autoTried = useRef(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const codeParam = searchParams.get("code");
    if (emailParam) setEmail(emailParam.replace(/ /g, "+"));
    if (codeParam && codeParam.length === 6 && emailParam && !autoTried.current) {
      autoTried.current = true;
      setCode(codeParam.split(""));
      setTimeout(() => {
        verifyCode(emailParam, codeParam);
      }, 500);
    }
  }, [searchParams]);

  async function verifyCode(em: string, cd: string) {
    setError(null);
    setLoading(true);
    try {
      const res = (await api.post("/auth/verify-email", { email: em, code: cd })) as any;
      console.log("verify-email response:", res);
      setSuccess(true);
      if (res?.access_token) {
        setTokens(res.access_token, res.refresh_token);
        window.location.href = "/dashboard";
      } else if (res?.token) {
        setTokens(res.token);
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/login?verified=1";
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  function handleChange(index: number, value: string) {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (value && index < 5) {
      document.getElementById(`code-${index + 1}`)?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      document.getElementById(`code-${index - 1}`)?.focus();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      setError("Email not found");
      return;
    }
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }
    await verifyCode(email, fullCode);
  }

  async function handleResend() {
    if (!email) {
      setError("Email not found");
      return;
    }
    setError(null);
    setResending(true);
    try {
      await api.post("/auth/resend-verification", { email });
      setError("New verification code sent!");
      setCode(["", "", "", "", "", ""]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setResending(false);
    }
  }

  const maskEmail = (em: string) => {
    if (!em) return "";
    const [local, domain] = em.split("@");
    if (!domain) return em;
    if (local.length <= 2) return em;
    return local.substring(0, 2) + "****" + local.substring(local.length - 1) + "@" + domain;
  };

  if (success) {
    return (
      <AuthSplitLayout variant="login" title="" subtitle="">
        <div className="text-center space-y-4">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          <h3 className="text-xl font-semibold">Verification Successful</h3>
          <p className="text-sm text-text-secondary">Redirecting to dashboard...</p>
        </div>
      </AuthSplitLayout>
    );
  }

  return (
    <AuthSplitLayout variant="login" title="" subtitle="">
      <div className="mb-6 text-center">
        <ShieldCheck className="w-12 h-12 text-primary mx-auto mb-3" />
        <h2 className="text-2xl font-bold mb-2 text-primary">Email Verification</h2>
        <p className="text-sm text-text-secondary">A verification code has been sent to</p>
        <p className="text-sm font-medium text-primary mt-1">{maskEmail(email)}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className={`text-sm px-4 py-3 rounded-lg border-l-4 ${error.includes("sent") ? "bg-green-50 text-green-700 border-green-500" : "bg-danger-bg/80 text-danger border-danger"}`}>
            {error}
          </div>
        )}

        <div>
          <p className="text-sm font-medium mb-3 text-center">Enter the 6 digit code</p>
          <div className="flex gap-2 justify-between">
            {code.map((digit, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-xl font-bold border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || code.join("").length !== 6}
          className="w-full bg-primary hover:bg-primary-hover text-white rounded-lg py-2.5 text-sm font-medium transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || !email}
            className="text-sm text-primary hover:underline disabled:opacity-60 font-medium"
          >
            {resending ? "Resending..." : "Resend code"}
          </button>
        </div>

        <div className="text-center pt-4 border-t border-border">
          <Link href="/login" className="text-sm text-text-secondary hover:text-primary">
            Back to login
          </Link>
        </div>
      </form>
    </AuthSplitLayout>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}
