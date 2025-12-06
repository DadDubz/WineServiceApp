// src/layout/MainLayout.tsx
import { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export default function MainLayout({
  children,
  title = "Wine Service",
  subtitle = "Premium Wine Management System",
}: MainLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) =>
    location.pathname === path
      ? { backgroundColor: "#6B1F2F", color: "#FEFEFE" }
      : { backgroundColor: "transparent", color: "#FCE8C8" };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8F5F0" }}>
      {/* Header */}
      <header className="shadow-md" style={{ backgroundColor: "#4A0E1E" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🍷</span>
            <div>
              <h1
                className="text-2xl font-bold"
                style={{
                  color: "#FEFEFE",
                  fontFamily: "Playfair Display, Georgia, serif",
                }}
              >
                {title}
              </h1>
              <p className="text-xs" style={{ color: "#E8D4B8" }}>
                {subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            {user && (
              <div className="text-right">
                <p
                  className="font-semibold"
                  style={{ color: "#FCE8C8" }}
                >{`${user.username} (${user.role})`}</p>
              </div>
            )}
            <button
              onClick={logout}
              className="px-3 py-1 rounded-md text-xs font-semibold transition"
              style={{
                backgroundColor: "#D4AF88",
                color: "#4A0E1E",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#E8D4B8")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#D4AF88")
              }
            >
              Logout
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="border-t border-[#7B3042]/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex gap-2 text-xs sm:text-sm">
            <button
              onClick={() => navigate("/")}
              className="px-3 py-1 rounded-full border border-[#FCE8C8]/40"
              style={isActive("/")}
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate("/inventory")}
              className="px-3 py-1 rounded-full border border[#FCE8C8]/40"
              style={isActive("/inventory")}
            >
              Wine Inventory
            </button>
            <button
              onClick={() => navigate("/service")}
              className="px-3 py-1 rounded-full border border-[#FCE8C8]/40"
              style={isActive("/service")}
            >
              Dinner Service
            </button>
          </div>
        </nav>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
