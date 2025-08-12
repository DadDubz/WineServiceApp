// src/lib/api.ts

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  // add other env variables here if needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

// FastAPI uses OAuth2PasswordRequestForm, so it expects form-encoded fields
export async function login(username: string, password: string) {
  const body = new URLSearchParams({ username, password });

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    // Try to surface a clean error
    let message = "Login failed";
    try {
      const t = await res.json();
      message = t?.detail || message;
    } catch {
      message = await res.text();
    }
    throw new Error(message);
  }

  return res.json(); // { access_token, token_type }
}

export async function me(token: string) {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json(); // { username, role }
}
