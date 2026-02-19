import { request } from "./client";

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
