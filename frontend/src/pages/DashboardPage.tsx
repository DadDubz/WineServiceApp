// src/pages/DashboardPage.tsx
import { useEffect, useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import { useAuth } from "@/context/AuthContext";

interface Wine {
  id: number;
  name: string;
  vintage?: string | null;
  varietal?: string | null;
  region?: string | null;
  notes?: string | null;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [wines, setWines] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const API_BASE =
      import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

    const fetchWines = async () => {
      try {
        setError(null);

        const res = await fetch(`${API_BASE}/wines/`, {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch wines (${res.status})`);
        }

        const data = await res.json();
        setWines(data);
      } catch (err: any) {
        console.error("Failed to fetch wines:", err);
        setError(err?.message ?? "Failed to load wines");
      } finally {
        setLoading(false);
      }
    };

    fetchWines();
  }, []);

  return (
    <MainLayout
      title="Service Dashboard"
      subtitle={`Welcome back, ${user?.username ?? "Guest"}`}
    >
      {/* Top summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div
          className="rounded-xl p-6 shadow-lg"
          style={{ backgroundColor: "#FEFEFE" }}
        >
          <p className="text-sm font-semibold" style={{ color: "#B89968" }}>
            Total Wines
          </p>
          <p className="text-3xl font-bold mt-2" style={{ color: "#6B1F2F" }}>
            {wines.length}
          </p>
        </div>

        <div
          className="rounded-xl p-6 shadow-lg"
          style={{ backgroundColor: "#FEFEFE" }}
        >
          <p className="text-sm font-semibold" style={{ color: "#B89968" }}>
            Active Tables
          </p>
          <p className="text-3xl font-bold mt-2" style={{ color: "#6B1F2F" }}>
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
            {user?.role ?? "Guest"}
          </p>
        </div>
      </div>

      {/* Wine list */}
      <div
        className="rounded-xl shadow-lg p-6"
        style={{ backgroundColor: "#FEFEFE" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-2xl font-bold"
            style={{
              color: "#6B1F2F",
              fontFamily: "Playfair Display, Georgia, serif",
            }}
          >
            Wine Inventory Snapshot
          </h2>
          <span className="text-3xl">🍷</span>
        </div>

        {loading && (
          <p className="text-sm" style={{ color: "#B89968" }}>
            Loading wines…
          </p>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && wines.length === 0 && (
          <p className="text-sm" style={{ color: "#B89968" }}>
            No wines found yet.
          </p>
        )}

        {!loading && !error && wines.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wines.map((wine) => (
              <div
                key={wine.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                style={{ borderColor: "#D4AF88" }}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3
                    className="font-bold text-lg"
                    style={{ color: "#6B1F2F" }}
                  >
                    {wine.name}
                  </h3>
                  <span className="text-2xl">🍾</span>
                </div>
                <p className="text-sm mb-1" style={{ color: "#B89968" }}>
                  <strong>Vintage:</strong> {wine.vintage ?? "N/A"}
                </p>
                <p className="text-sm mb-1" style={{ color: "#B89968" }}>
                  <strong>Varietal:</strong> {wine.varietal ?? "N/A"}
                </p>
                <p className="text-sm mb-2" style={{ color: "#B89968" }}>
                  <strong>Region:</strong> {wine.region ?? "N/A"}
                </p>
                {wine.notes && (
                  <p
                    className="text-xs italic mt-2 pt-2"
                    style={{
                      color: "#6B1F2F",
                      borderTop: "1px solid "#E8D4B8",
                    }}
                  >
                    {wine.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
