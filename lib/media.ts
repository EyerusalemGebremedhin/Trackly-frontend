const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function mediaUrl(path?: string | null) {
  if (!path) return null;
  if (/^(https?:|data:|blob:)/.test(path)) return path;
  return `${API}${path.startsWith("/") ? "" : "/"}${path}`;
}
