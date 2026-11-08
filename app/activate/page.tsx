"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Lock, ShieldCheck } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import AuthSplitLayout from "@/components/AuthSplitLayout";
import AuthField from "@/components/AuthField";
import Link from "next/link";

function ActivateContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [status, setStatus] = useState<"form" | "success" | "error">("form");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const codeParam = searchParams.get("code");
    if (codeParam && codeParam.length === 6) setCode(codeParam.split(""));
    const emailParam = searchParams.get("email");
    if (emailParam) setEmail(emailParam.replace(/ /g, "+"));
    else if (token) {
      api.get(`/auth/activation-info?token=${token}`).then((r: any) => { if (r?.email) setEmail(r.email); }).catch(() => {});
    }
  }, [searchParams, token]);

  const maskEmail = (em: string) => {
    if (!em) return "";
    const [local, domain] = em.split("@");
    if (!domain) return em;
    if (local.length <= 2) return em;
    return local.substring(0, 2) + "****" + local.substring(local.length - 1) + "@" + domain;
  };

  function handleChange(index: number, value: string) {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (value && index < 5) document.getElementById(`acode-${index + 1}`)?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !code[index] && index > 0) document.getElementById(`acode-${index - 1}`)?.focus();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (!agreed) { setError("Please accept the terms and privacy policy"); return; }
    setError(null);
    setLoading(true);
    try {
      const fullCode = code.join("");
      const payload: any = { password };
      if (token) payload.token = token;
      if (email) payload.email = email;
      if (fullCode.length === 6) payload.code = fullCode;
      const res: any = await api.post("/auth/activate", payload);
      setStatus("success");
      setMessage(res.message || "Account activated successfully");
      setTimeout(() => router.push("/login"), 3000);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof ApiError ? err.message : "Activation failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!email) { setError("Email not found"); return; }
    setError(null);
    setResending(true);
    try {
      await api.post("/auth/resend-activation", { email });
      setError("New activation code sent!");
      setCode(["", "", "", "", "", ""]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setResending(false);
    }
  }

  if (status === "success") return (
    <AuthSplitLayout variant="login" title="" subtitle="">
      <div className="text-center space-y-4">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
        <p className="text-green-700 font-medium">{message}</p>
        <p className="text-sm text-text-secondary">Redirecting to login...</p>
      </div>
    </AuthSplitLayout>
  );
  if (status === "error") return (
    <AuthSplitLayout variant="login" title="" subtitle="">
      <div className="text-center space-y-4">
        <XCircle className="w-16 h-16 text-red-500 mx-auto" />
        <p className="text-red-700 font-medium">{message}</p>
        <button onClick={() => router.push("/login")} className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover">Go to Login</button>
      </div>
    </AuthSplitLayout>
  );

  return (
    <AuthSplitLayout variant="login" title="" subtitle="">
      <div className="mb-6 text-center">
        <ShieldCheck className="w-12 h-12 text-primary mx-auto mb-3" />
        <h2 className="text-2xl font-bold mb-2 text-primary">Account Activation</h2>
        <p className="text-sm text-text-secondary">An activation code has been sent to</p>
        <p className="text-sm font-medium text-primary mt-1">{maskEmail(email)}</p>
        <p className="text-sm text-text-secondary mt-2">Enter it below along with your new password</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <div className={`text-sm px-4 py-3 rounded-lg border-l-4 ${error.includes("sent") ? "bg-green-50 text-green-700 border-green-500" : "bg-danger-bg/80 text-danger border-danger"}`}>{error}</div>}
        <div>
          <p className="text-sm font-medium mb-3 text-center">Activation code</p>
          <div className="flex gap-2 justify-between" onPaste={(e) => {
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
        if (pasted.length >= 6) {
          e.preventDefault();
          const digits = pasted.slice(0, 6).split("");
          if (typeof setCode === "function") setCode(digits.concat(Array(6 - digits.length).fill("")));
        }
      }}>
            {code.map((digit, index) => (
              <input key={index} id={`acode-${index}`} type="text" inputMode="numeric" maxLength={1} value={digit}
                onChange={(e) => handleChange(index, e.target.value)} onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-xl font-bold border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary" />
            ))}
          </div>
        </div>
        <AuthField label="Password" icon={Lock} type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
        <AuthField label="Confirm Password" icon={Lock} type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
        <div className="flex items-start gap-2 text-sm">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1" />
          <span>I agree to the <Link href="/terms" className="text-primary font-bold hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-primary font-bold hover:underline">Privacy Policy</Link></span>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-primary text-white rounded-md px-4 py-2.5 text-sm font-medium hover:bg-primary-hover disabled:opacity-50">
          {loading ? "Activating..." : "Activate Account"}
        </button>
        <div className="text-center">
          <button type="button" onClick={handleResend} disabled={resending || !email} className="text-sm text-primary hover:underline disabled:opacity-60 font-medium">
            {resending ? "Resending..." : "Resend code"}
          </button>
        </div>
        <div className="text-center pt-4 border-t border-border">
          <Link href="/login" className="text-sm text-text-secondary hover:text-primary">Back to login</Link>
        </div>
      </form>
    </AuthSplitLayout>
  );
}

export default function ActivatePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ActivateContent />
    </Suspense>
  );
}
