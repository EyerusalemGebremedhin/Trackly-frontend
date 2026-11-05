"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { UserPlus, Mail, User, Key } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import Navbar from "@/components/Navbar";
import RequireAuth from "@/components/RequireAuth";

function InviteMemberContent() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post(`/auth/team/register?group_id=${groupId}`, {
        name,
        email,
        password,
      });
      setSuccess(true);
      setTimeout(() => router.push(`/groups/${groupId}`), 2000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2 flex items-center gap-2">
            <UserPlus className="w-8 h-8 text-primary" />
            Invite Team Member
          </h1>
          <p className="text-text-secondary">Register a new user to join your team. They'll receive an activation email.</p>
        </div>

        {success ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-green-900 mb-2">Invitation Sent!</h2>
            <p className="text-green-700">An activation email has been sent to {email}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-xl p-6 space-y-4">
            {error && (
              <div className="bg-danger-bg text-danger border-l-4 border-danger px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Key className="w-4 h-4" />
                Temporary Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Minimum 6 characters"
              />
              <p className="text-xs text-text-secondary mt-1">User can change this after activation</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover text-white py-2.5 rounded-lg font-medium disabled:opacity-50 transition-colors"
            >
              {loading ? "Sending Invitation..." : "Send Invitation"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function InviteMemberPage() {
  return (
    <RequireAuth>
      <InviteMemberContent />
    </RequireAuth>
  );
}
