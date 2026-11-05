"use client";

import { useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { User, Mail, Lock, Save, Eye, EyeOff, Camera, X, Briefcase } from "lucide-react";
import { api } from "@/lib/api";
import { mediaUrl } from "@/lib/media";

function PasswordField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="new-password"
        className="w-full pl-10 pr-11 py-2.5 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const u = user as any;

  const [form, setForm] = useState({
    firstName: user?.name?.split(" ")[0] || "",
    lastName: user?.name?.split(" ").slice(1).join(" ") || "",
    email: user?.email || "",
    currentPassword: "",
    password: "",
    confirmPassword: "",
  });
  const [jobTitle, setJobTitle] = useState<string>(u?.job_title ?? "");
  const [skills, setSkills] = useState<string[]>(Array.isArray(u?.skills) ? u.skills : (typeof u?.skills === "string" && u.skills ? u.skills.split(",").map((x:string)=>x.trim()).filter(Boolean) : []));
  const [skillDraft, setSkillDraft] = useState("");
  const [avatar, setAvatar] = useState<string | null>(u?.avatar_url ?? null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function fail(text: string) {
    setOk(false);
    setMessage(text);
  }

  function addSkill() {
    const s = skillDraft.trim().replace(/\s+/g, " ");
    if (!s || s.length > 40) return;
    if (skills.some((x) => x.toLowerCase() === s.toLowerCase())) {
      setSkillDraft("");
      return;
    }
    if (skills.length >= 30) return fail("You can add up to 30 skills.");
    setSkills([...skills, s]);
    setSkillDraft("");
  }

  async function uploadPhoto(file: File) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return fail("Use a JPG, PNG or WebP image.");
    if (file.size > MAX_PHOTO_BYTES) return fail("Image must be under 2 MB.");
    setMessage(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
      const token = localStorage.getItem("ember_token") || localStorage.getItem("token");
      const res = await fetch(`${base}/users/me/avatar`, {
        method: "PUT",
        body,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail ?? "Upload failed");
      const data = await res.json();
      const url = data.avatar_url?.startsWith("http") ? data.avatar_url : base + data.avatar_url;
      setAvatar(`${url}?t=${Date.now()}`);
      await refreshUser();
    } catch (e: any) {
      fail(e?.message || "Upload failed");
    }
  }

  async function removePhoto() {
    try {
      await api.delete("/users/me/avatar");
      setAvatar(null);
      await refreshUser();
    } catch (e: any) {
      fail(e?.message || "Couldn't remove the photo");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (form.password && form.password !== form.confirmPassword) {
      return fail("Passwords do not match");
    }
    if (form.password && form.password.length < 8) {
      return fail("Password must be at least 8 characters");
    }

    setLoading(true);
    try {
      const name = `${form.firstName} ${form.lastName}`.trim();
      await api.patch("/users/me", { name, email: form.email });
      await api.put("/users/me/skills", { job_title: jobTitle.trim() || null, skills });

      if (form.password) {
        try {
          await api.patch("/users/me/password", { current_password: form.currentPassword, password: form.password });
        } catch (err: any) {
          await refreshUser();
          return fail(`Profile saved, but the password was NOT changed: ${err?.message || "request failed"}`);
        }
      }

      await refreshUser();
      setOk(true);
      setMessage("Profile updated successfully");
      setForm({ ...form, currentPassword: "", password: "", confirmPassword: "" });
    } catch (err: any) {
      fail(err?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ fontFamily: "var(--font-serif)" }}>
          Profile Settings
        </h1>
        <p className="text-text-secondary mt-1">Manage your account details</p>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-6">
          <div className="flex items-center gap-4">
            {mediaUrl(avatar || u?.avatar_url) ? (
              <img src={mediaUrl(avatar || u?.avatar_url)!} alt={user?.name ?? "Profile photo"} className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold">
                {user?.name?.[0]?.toUpperCase() ?? "U"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold">{user?.name}</h2>
              <p className="text-sm text-text-secondary">{user?.email}</p>
              {jobTitle && <p className="text-sm text-text-secondary">{jobTitle}</p>}
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1.5 text-sm border border-border rounded-lg px-3 py-1.5 bg-surface hover:border-primary"
              >
                <Camera size={14} /> {avatar ? "Change photo" : "Upload photo"}
              </button>
              {avatar && (
                <button type="button" onClick={removePhoto} className="text-sm text-text-secondary hover:text-red-500">
                  Remove
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadPhoto(f);
                  e.target.value = "";
                }}
              />
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {message && (
            <div
              className={`text-sm px-4 py-3 rounded-lg ${
                ok
                  ? "bg-green-500/10 text-green-500 border border-green-500/20"
                  : "bg-red-500/10 text-red-500 border border-red-500/20"
              }`}
            >
              {message}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">First Name</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Last Name</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email Address</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border space-y-4">
            <h3 className="text-sm font-semibold">About you</h3>

            <div>
              <label className="block text-sm font-medium mb-2">
                Job title <span className="text-text-secondary font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Briefcase size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  maxLength={80}
                  placeholder="e.g. Backend engineer"
                  className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Skills <span className="text-text-secondary font-normal">(optional, add as many as you have)</span>
              </label>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {skills.map((s) => (
                    <span
                      key={s}
                      className="flex items-center gap-1 text-xs bg-primary/15 text-primary px-2.5 py-1 rounded-full"
                    >
                      {s}
                      <button type="button" aria-label={`Remove ${s}`} onClick={() => setSkills(skills.filter((x) => x !== s))}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <input
                type="text"
                value={skillDraft}
                onChange={(e) => setSkillDraft(e.target.value)}
                maxLength={40}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                onBlur={addSkill}
                placeholder="Type a skill and press Enter (e.g. FastAPI, SQL, Figma)"
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <h3 className="text-sm font-semibold mb-3">Change Password</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Current Password</label>
                <PasswordField
                  value={form.currentPassword}
                  onChange={(v) => setForm({ ...form, currentPassword: v })}
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">New Password</label>
                <PasswordField
                  value={form.password}
                  onChange={(v) => setForm({ ...form, password: v })}
                  placeholder="New password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                <PasswordField
                  value={form.confirmPassword}
                  onChange={(v) => setForm({ ...form, confirmPassword: v })}
                  placeholder="Confirm new password"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
          >
            <Save size={18} />
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
