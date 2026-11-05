"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import AuthLayout from "@/components/AuthLayout";

function ActivateContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid activation link");
      return;
    }

    api
      .post("/auth/activate", { token })
      .then((res: any) => {
        setStatus("success");
        setMessage(res.message);
        setTimeout(() => router.push("/login"), 3000);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err instanceof ApiError ? err.message : "Activation failed");
      });
  }, [token, router]);

  return (
    <AuthLayout
      variant="login"
      title="Account Activation"
      subtitle="Activating your account"
      headline="Team Account Activation"
      blurb="Your team leader has registered you on Trackly."
    >
      <div className="text-center space-y-4">
        {status === "loading" && (
          <p className="text-text-secondary">Activating your account...</p>
        )}
        {status === "success" && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <p className="text-green-700 font-medium">{message}</p>
            <p className="text-sm text-text-secondary">Redirecting to login...</p>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto" />
            <p className="text-red-700 font-medium">{message}</p>
            <button
              onClick={() => router.push("/login")}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover"
            >
              Go to Login
            </button>
          </>
        )}
      </div>
    </AuthLayout>
  );
}

export default function ActivatePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ActivateContent />
    </Suspense>
  );
}
