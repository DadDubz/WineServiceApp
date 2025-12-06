// src/layouts/MainLayout.tsx
import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface MainLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

const navItems = [
  { label: "Dashboard", to: "/" },
  { label: "Dinner Service", to: "/service" },
  { label: "Inventory", to: "/inventory" },
];

export default function MainLayout({ title, subtitle, children }: MainLayoutProps) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#F8F5F0] flex">
      {/* Sidebar */}
      <aside
        className="hidden md:flex flex-col w-60 border-r border-[#E8D4B8] bg-[#FDF7EE]"
        style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
      >
        <div className="px-6 py-5 border-b border-[#E8D4B8]">
          <div className="text-xs uppercase tracking-[0.2em] text-[#A2775B] mb-1">
            Wellington &amp; Wild
          </div>
          <div className="text-lg font-semibold text-[#4A1520]">
            Wine Service App
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                [
                  "flex items-center px-3 py-2 rounded-lg text-sm transition",
                  isActive
                    ? "bg-[#6B1F2F] text-[#FDF7EE] shadow-sm"
                    : "text-[#5A4337] hover:bg-[#F0E0CF]",
                ].join(" ")
              }
            >
              <span className="w-1.5 h-1.5 rounded-full mr-2 bg-current" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-[#E8D4B8] text-xs text-[#7B5A45]">
          <div className="font-semibold text-[#4A1520] mb-1">Signed in</div>
          <div className="truncate">{user?.email ?? "Sommelier"}</div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Top bar on mobile + subtle header bar on desktop */}
        <header className="h-14 px-4 md:px-8 flex items-center justify-between border-b border-[#E8D4B8] bg-[#FDF7EE]/80 backdrop-blur">
          <div className="md:hidden">
            <div className="text-xs uppercase tracking-[0.2em] text-[#A2775B]">
              Wellington &amp; Wild
            </div>
            <div className="text-sm font-semibold text-[#4A1520]">
              Wine Service App
            </div>
          </div>
          <div className="hidden md:flex items-baseline gap-3">
            <h1
              className="text-xl font-semibold text-[#4A1520]"
              style={{ fontFamily: "Playfair Display, Georgia, serif" }}
            >
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-[#82614B] mt-0.5">{subtitle}</p>
            )}
          </div>

          <div className="text-xs text-[#7B5A45]">
            {user?.email && <span>{user.email}</span>}
          </div>
        </header>

        {/* Page header (mobile) + content */}
        <main className="flex-1 px-4 md:px-8 py-5 md:py-6">
          <div className="md:hidden mb-4">
            <h1
              className="text-xl font-semibold text-[#4A1520]"
              style={{ fontFamily: "Playfair Display, Georgia, serif" }}
            >
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-[#82614B] mt-1">{subtitle}</p>
            )}
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}
