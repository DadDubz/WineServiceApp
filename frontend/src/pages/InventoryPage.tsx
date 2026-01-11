// src/pages/InventoryPage.tsx
import { useEffect, useMemo, useState } from "react";
import MainLayout from "@/layouts/MainLayout";

type InventoryItem = {
  id: number;
  name: string;
  quantity: number;
  par_level: number;
  is_btg: boolean;
};

const API_BASE = "http://localhost:8000/api";

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`${API_BASE}/inventory/`, {
        headers: {
          // Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      setItems(await res.json());
    } catch (e: any) {
      setErr(e?.message || "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const btgCount = useMemo(() => items.filter((x) => x.is_btg).length, [items]);

  const toggleBTG = async (item: InventoryItem) => {
    // enforce "max 5" BTG
    if (!item.is_btg && btgCount >= 5) {
      alert("BTG list is full (max 5). Uncheck one first.");
      return;
    }

    const next = !item.is_btg;

    // optimistic UI
    setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, is_btg: next } : x)));

    try {
      const res = await fetch(`${API_BASE}/inventory/${item.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ is_btg: next }),
      });

      if (!res.ok) throw new Error(`Update failed (${res.status})`);
    } catch (e: any) {
      alert(e?.message || "Failed to update BTG");
      // revert
      setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, is_btg: item.is_btg } : x)));
    }
  };

  const lowStock = useMemo(() => {
    return items
      .filter((x) => x.quantity <= Math.max(0, x.par_level))
      .sort((a, b) => (a.quantity - a.par_level) - (b.quantity - b.par_level))
      .slice(0, 10);
  }, [items]);

  return (
    <MainLayout title="Wine Inventory" subtitle="Manage counts, par levels, and BTG lineup">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] gap-6">
        <div className="rounded-2xl border border-[#E8D4B8] bg-white/90 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-[#E8D4B8] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#4A1520]" style={{ fontFamily: "Playfair Display, Georgia, serif" }}>
                Inventory
              </h2>
              <p className="text-[11px] text-[#7B5A45] mt-0.5">Mark exactly 5 wines as By-the-Glass</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#7B5A45]">BTG: {btgCount}/5</span>
              <button
                onClick={fetchItems}
                className="rounded-lg px-3 py-2 text-sm border border-[#E8D4B8] bg-white hover:bg-[#FDF8F2] transition"
                style={{ color: "#6B1F2F" }}
              >
                Refresh
              </button>
            </div>
          </div>

          {err ? (
            <div className="p-4 text-sm text-red-700 bg-red-50 border-b border-red-200">
              {err}
            </div>
          ) : null}

          <div className="divide-y divide-[#F0E0CF]">
            {loading ? (
              <div className="p-4 text-sm text-[#7B5A45]">Loading…</div>
            ) : items.length === 0 ? (
              <div className="p-4 text-sm text-[#7B5A45]">No inventory items yet.</div>
            ) : (
              items.map((it) => (
                <div key={it.id} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-800 truncate">{it.name}</div>
                    <div className="text-xs text-[#7B5A45] mt-0.5">
                      Qty: {it.quantity} • Par: {it.par_level}
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={it.is_btg} onChange={() => toggleBTG(it)} />
                    BTG
                  </label>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-[#E8D4B8] bg-white/90 shadow-sm p-4">
          <h2 className="text-sm font-semibold text-[#4A1520]" style={{ fontFamily: "Playfair Display, Georgia, serif" }}>
            Low Stock (par or below)
          </h2>
          <p className="text-[11px] text-[#7B5A45] mt-0.5">Quick view (used on Dashboard next)</p>

          <div className="mt-3 space-y-2">
            {loading ? (
              <div className="text-sm text-[#7B5A45]">Loading…</div>
            ) : lowStock.length === 0 ? (
              <div className="text-sm text-[#7B5A45]">No low stock items 🎉</div>
            ) : (
              lowStock.map((x) => (
                <div key={x.id} className="rounded-lg border px-3 py-2" style={{ borderColor: "#E8D4B8" }}>
                  <div className="text-sm font-medium text-slate-800">{x.name}</div>
                  <div className="text-xs text-[#7B5A45]">Qty {x.quantity} • Par {x.par_level}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
