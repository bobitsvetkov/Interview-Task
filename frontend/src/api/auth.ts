const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

async function request(path: string, options: RequestInit = {}): Promise<Response> {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    ...options,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.detail || `Request failed (${res.status})`);
  }

  return res;
}

export function register(email: string, password: string) {
  return request("/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

export function login(email: string, password: string) {
  return request("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

export function logout() {
  return request("/logout", { method: "POST" });
}

export async function getMe() {
  const res = await request("/me");
  return res.json() as Promise<{ email: string }>;
}
