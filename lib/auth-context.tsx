"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { api, setToken, clearToken, ApiError } from "./api";

export type User = {
  id: number;
  name: string;
  email: string;
  skills: string | null;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  async function refreshUser() {
    try {
      const me = await api.get<User>("/users/me");
      setUser(me);
    } catch {
      setUser(null);
    }
  }

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("ember_token") : null;
    if (token) {
      refreshUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  async function login(email: string, password: string) {
    const form = new URLSearchParams();
    form.set("username", email);
    form.set("password", password);
    try {
      const res = await api.postForm<{ access_token: string }>("/auth/login", form);
      setToken(res.access_token);
      await refreshUser();
      router.push("/dashboard");
      return;
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.includes("MFA") || msg.includes("Verification code")) {
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        throw err;
      }
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      throw err;
    }
  }

  async function register(name: string, email: string, password: string) {
    await api.post("/auth/register", { name, email, password });
    router.push(`/verify-email?email=${encodeURIComponent(email)}`);
  }

  function logout() {
    clearToken();
    setUser(null);
    router.push("/login");
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
