// src/layouts/MainLayout.tsx
import { ReactNode } from "react";
import { NavLink } from "react-router-dom";

interface MainLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

const BRAND_BG = "#1B0C10";      // deep wine background
const BRAND_PRIMARY = "#6B1F2F"; // wine red
const BRAND_ACCENT = "#D4AF88";  // champagne gold
const SURFACE = "#FEFEFE";

export default function MainLayout({
  title,
  subtitle,
  children,
}: MainLayoutProps) {
  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* SIDEBAR */}
      <aside
        className="hidden md:flex md:flex-col w-64 border-r shadow-lg"
        style={{ backgroundColor: BRAND_BG, borderColor: "#2E151F" }}
      >
        {/* Brand */}
        <div className="px-5 py-4 border-b" style={{ borderColor: "#3A1C28" }}>
          <div
            className="text-xs tracking-[0.25em] uppercase text-slate-300"
            style={{ letterSpacing: "0.25em" }}
          >
            Wellington
          </div>
          <div
            className="mt-1 text-lg font-semibold text-slate-50"
            style={{ fontFamily: "Playfair Display, Georgia, serif" }}
          >
            Wine Service
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 text-sm text-slate-200">
          <NavItem to="/" label="Dashboard" />
          <NavItem to="/service" label="Dinner Service" />
          <NavItem to="/inventory" label="Wine Inventory" />
          <NavItem to="/guests-ui" label="Guests" />
          <NavItem to="/reports-ui" label="Reports" />
        </nav>

        {/* Footer / user */}
        <div className="px-4 py-3 border-t text-xs text-slate-400" style={{ borderColor: "#3A1C28" }}>
          Signed in as
          <div className="font-medium text-slate-200">Sommelier / Expo</div>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header
          className="h-14 flex items-center justify-between px-4 md:px-8 border-b bg-white/80 backdrop-blur"
          style={{ borderColor: "#E8D4B8" }}
        >
          {/* On mobile, simple brand / small menu label */}
          <div className="md:hidden">
            <span
              className="text-sm font-semibold"
              style={{ color: BRAND_PRIMARY }}
            >
              Wine Service
            </span>
          </div>

          {/* Page title */}
          <div className="flex flex-col">
            <span
              className="text-sm font-semibold"
              style={{
                color: BRAND_PRIMARY,
                fontFamily: "Playfair Display, Georgia, serif",
              }}
            >
              {title}
            </span>
            {subtitle && (
              <span className="text-xs text-slate-500">{subtitle}</span>
            )}
          </div>

          {/* Right side - placeholder for date / shift */}
          <div className="hidden md:flex items-center gap-3 text-xs text-slate-500">
            <span className="px-2 py-1 rounded-full border" style={{ borderColor: BRAND_ACCENT }}>
              Tonight&apos;s Service
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-8">
          <div
            className="mx-auto max-w-6xl rounded-2xl shadow-md p-4 md:p-6"
            style={{ backgroundColor: SURFACE }}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

interface NavItemProps {
  to: string;
  label: string;
}

function NavItem({ to, label }: NavItemProps) {
  const baseClasses =
    "w-full flex items-center justify-between px-3 py-2 rounded-lg transition text-left";
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        [
          baseClasses,
          isActive
            ? "bg-slate-50 text-slate-900"
            : "text-slate-200 hover:bg-white/5",
        ].join(" ")
      }
    >
      <span className="text-sm">{label}</span>
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: BRAND_ACCENT }}
      />
    </NavLink>
  );
}
