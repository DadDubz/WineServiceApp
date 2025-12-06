// src/pages/DashboardPage.tsx
import { useEffect, useState } from "react";
import MainLayout from "@/layout/MainLayout";
import { useAuth } from "@/context/AuthContext";

interface Wine {
  id: number;
  name: string;
  vintage?: string;
  varietal?: string;
  region?: string;
  notes?: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [wines, setWines] = useState<Wine[]>([]);
  const [loadingWines, setLoadingWines] = useState(true);

  useEffect(() => {
    const API_BASE =
      import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

    const fetchWines = async () => {
      try {
        const res = await fetch(`${API_BASE}/wines/`, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) return;
        const data = await res.json();
        setWines(data);
      } catch (err) {
        console.error("Failed to fetch wines:", err);
      } finally {
        setLoadingWines(false);
      }
    };

    fetchWines();
  }, []);

  return (
    <MainLayout
      title="Wine Service Dashboard"
      subtitle="Tonight's overview at a glance"
    >
      {/* Top stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div
          className="rounded-xl p-6 shadow-lg"
          style={{ backgroundColor: "#FEFEFE" }}
        >
          <p className="text-sm font-semibold" style={{ color: "#B89968" }}>
            Total Wines
          </p>
          <p
            className="text-3xl font-bold mt-2"
            style={{ color: "#6B1F2F" }}
          >
            {loadingWines ? "…" : wines.length}
          </p>
        </div>

        <div
          className="rounded-xl p-6 shadow-lg"
          style={{ backgroundColor: "#FEFEFE" }}
        >
          <p className="text-sm font-semibold" style={{ color: "#B89968" }}>
            Active Tables
          </p>
          <p
            className="text-3xl font-bold mt-2"
            style={{ color: "#6B1F2F" }}
          >
            0
          </p>
        </div>

        <div
          className="rounded-xl p-6 shadow-lg"
          style={{ backgroundColor: "#FEFEFE" }}
        >
          <p className="text-sm font-semibold" style={{ color: "#B89968" }}>
            User Role
          </p>
          <p
            className="text-xl font-bold mt-2 capitalize"
            style={{ color: "#6B1F2F" }}
          >
            {user?.role || "Guest"}
          </p>
        </div>
      </div>

      {/* Quick cards / shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          className="rounded-xl p-6 shadow-lg"
          style={{ backgroundColor: "#FEFEFE" }}
        >
          <h2
            className="text-lg font-semibold mb-2"
            style={{
              color: "#6B1F2F",
              fontFamily: "Playfair Display, Georgia, serif",
            }}
          >
            Tonight’s Focus
          </h2>
          <p className="text-sm text-gray-700">
            Use the top navigation to jump into Wine Inventory or Dinner
            Service. This dashboard will grow into your nightly summary: bottle
            counts, most-poured wines, and guest experience notes.
          </p>
        </div>

        <div
          className="rounded-xl p-6 shadow-lg"
          style={{ backgroundColor: "#FEFEFE" }}
        >
          <h2
            className="text-lg font-semibold mb-2"
            style={{
              color: "#6B1F2F",
              fontFamily: "Playfair Display, Georgia, serif",
            }}
          >
            Service Highlights
          </h2>
          <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
            <li>Track guest wine choices and add-ons in Dinner Service.</li>
            <li>Log allergies and substitutions for future visits.</li>
            <li>Keep wine inventory aligned with what is moving on the floor.</li>
          </ul>
        </div>
      </div>
    </MainLayout>
  );
}
