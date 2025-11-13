// src/pages/LoginPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      // Use AuthContext login method
      await login(username, password);
      
      // Navigate to dashboard
      nav("/");
    } catch (err: any) {
      setError(err?.message || "Invalid credentials. Please try again.");
      console.error("Login error:", err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-6" 
      style={{ backgroundColor: '#F8F5F0' }}
    >
      {/* Wine bottle decoration */}
      <div className="absolute top-8 left-8 text-6xl opacity-10">🍷</div>
      <div className="absolute bottom-8 right-8 text-6xl opacity-10">🍇</div>
      
      <div 
        className="w-full max-w-md rounded-xl shadow-2xl p-8 relative overflow-hidden"
        style={{ backgroundColor: '#FEFEFE' }}
      >
        {/* Maroon accent bar */}
        <div 
          className="absolute top-0 left-0 right-0 h-2"
          style={{ backgroundColor: '#6B1F2F' }}
        />
        
        {/* Wine glass icon */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🍷</div>
          <h1 
            className="text-3xl font-bold tracking-tight"
            style={{ color: '#6B1F2F', fontFamily: 'Playfair Display, Georgia, serif' }}
          >
            Wine Service
          </h1>
          <p 
            className="text-sm mt-2"
            style={{ color: '#B89968' }}
          >
            Premium Wine Management System
          </p>
        </div>

        {error && (
          <div 
            className="mb-4 rounded-lg p-3 text-sm border"
            style={{ 
              backgroundColor: '#FEE2E2', 
              color: '#991B1B',
              borderColor: '#FCA5A5' 
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label 
              className="block text-sm font-semibold mb-2"
              style={{ color: '#6B1F2F' }}
            >
              Username
            </label>
            <input
              type="text"
              autoComplete="username"
              className="w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2 transition-all"
              style={{ 
                border: '1.5px solid #D4AF88',
                backgroundColor: '#FEFEFE',
                color: '#1A1A1A'
              }}
              onFocus={(e) => e.target.style.borderColor = '#6B1F2F'}
              onBlur={(e) => e.target.style.borderColor = '#D4AF88'}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="manager1"
              required
            />
          </div>

          <div>
            <label 
              className="block text-sm font-semibold mb-2"
              style={{ color: '#6B1F2F' }}
            >
              Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              className="w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2 transition-all"
              style={{ 
                border: '1.5px solid #D4AF88',
                backgroundColor: '#FEFEFE',
                color: '#1A1A1A'
              }}
              onFocus={(e) => e.target.style.borderColor = '#6B1F2F'}
              onBlur={(e) => e.target.style.borderColor = '#D4AF88'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg font-semibold px-4 py-3 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              backgroundColor: '#6B1F2F',
              color: '#FEFEFE'
            }}
            onMouseEnter={(e) => !busy && (e.currentTarget.style.backgroundColor = '#8B2A3F')}
            onMouseLeave={(e) => !busy && (e.currentTarget.style.backgroundColor = '#6B1F2F')}
          >
            {busy ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <div 
          className="mt-6 pt-6 text-center text-xs"
          style={{ 
            borderTop: '1px solid #E8D4B8',
            color: '#6B1F2F'
          }}
        >
          <p className="font-medium mb-2">Demo Accounts</p>
          <div className="space-y-1 text-xs" style={{ color: '#B89968' }}>
            <p><strong>manager1</strong>, <strong>sommelier1</strong>, <strong>expo1</strong></p>
            <p>Password: <code className="px-2 py-1 rounded" style={{ backgroundColor: '#F8F5F0' }}>pass</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}

