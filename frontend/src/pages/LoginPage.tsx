// src/pages/LoginPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, me } from "../lib/api";

export default function LoginPage() {
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { access_token } = await login(username, password);
      // Persist token
      localStorage.setItem("token", access_token);

      // (Optional) verify & fetch profile
      try {
        const profile = await me(access_token);
        localStorage.setItem("user", JSON.stringify(profile));
      } catch {
        /* ignore */
      }

      nav("/"); // go to dashboard (or wherever you like)
    } catch (err: any) {
      setError(err?.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Login</h1>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              autoComplete="username"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. expo1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              autoComplete="current-password"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-indigo-600 text-white font-medium px-4 py-2 hover:bg-indigo-700 disabled:opacity-50"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-xs text-gray-500 mt-4">
          Demo users (from seed): <code>expo1</code>, <code>sommelier1</code>, <code>manager1</code> — password <code>pass</code>
        </p>
      </div>
    </div>
  );
}

