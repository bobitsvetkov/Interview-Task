const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const AUTH_PATHS = new Set(["/login", "/register"]);

export async function request(path: string, options: RequestInit = {}): Promise<Response> {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    ...options,
  });

  if (res.status === 401 && !AUTH_PATHS.has(path)) {
    globalThis.location.href = "/signin";
    throw new Error("Session expired");
  }

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.detail || `Request failed (${res.status})`);
  }

  return res;
}
