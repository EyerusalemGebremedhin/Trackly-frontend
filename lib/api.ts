const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("ember_token");
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const isForm =
    typeof FormData !== "undefined" && options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isForm || options.body instanceof URLSearchParams
      ? {}
      : options.body
        ? { "Content-Type": "application/json" }
        : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      if (Array.isArray(body.detail)) {
        detail = body.detail.map((d: any) => {
          const msg = d.msg || d.message || "Invalid input";
          if (msg.toLowerCase().includes("email")) return "Please enter a valid email address.";
          return msg;
        }).join(", ");
      } else {
        detail = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail);
      }
    } catch {
    }
    throw new ApiError(res.status, detail);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body:
        typeof FormData !== "undefined" && body instanceof FormData
          ? body
          : body
            ? JSON.stringify(body)
            : undefined,
    }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PATCH",
      body:
        typeof FormData !== "undefined" && body instanceof FormData
          ? body
          : body
            ? JSON.stringify(body)
            : undefined,
    }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PUT",
      body:
        typeof FormData !== "undefined" && body instanceof FormData
          ? body
          : body
            ? JSON.stringify(body)
            : undefined,
    }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  postForm: <T>(path: string, form: URLSearchParams) =>
    request<T>(path, { method: "POST", body: form }),
};

export function setTokens(access: string, refresh?: string) {
  localStorage.setItem("ember_token", access);
  if (refresh) localStorage.setItem("ember_refresh", refresh);
}
export function setToken(token: string) { localStorage.setItem("ember_token", token); }
export function getRefreshToken() { return typeof window === "undefined" ? null : localStorage.getItem("ember_refresh"); }
export function setRefreshToken(token: string) { localStorage.setItem("ember_refresh", token); }
export function clearToken() {
  localStorage.removeItem("ember_token");
  localStorage.removeItem("ember_refresh");
}
