// src/api/auth.ts
import { api } from "./client";

export function login(username: string, password: string) {
  const body = new URLSearchParams();
  body.set("grant_type", "password");
  body.set("username", username);
  body.set("password", password);

  // optional fields (safe to include as empty)
  body.set("scope", "");
  body.set("client_id", "");
  body.set("client_secret", "");

  return api.post("/api/auth/login/", body, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
}
