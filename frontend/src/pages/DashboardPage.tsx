// src/pages/DashboardPage.tsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";

const BRAND = {
  maroon: "#6B1F2F",
  maroonDark: "#4A1520",
  tan: "#D4AF88",
  tanLight: "#E8D4B8",
};

type DailyMenu = {
  dateISO: string; // YYYY-MM-DD
  winePairing: string;
  starter: string;
  entree: string;
  dessert: string;
  notes?: string;
};

type InventoryItemAny = Record<string, any>;

const LS_KEY = "wsa_daily_menu_v1";
const COMPANY_ID = 1; // <-- change to your real company_id

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getItemName(item: InventoryItemAny) {
  return (
    item.wine_name ||
    item.wineName ||
    item.name ||
    item.label ||
    item.title ||
    item.sku ||
    `Item #${item.id ?? "—"}`
  );
}

function getItemStock(item: InventoryItemAny) {
  const candidates = [
    item.on_hand,
    item.onHand,
    item.quantity_on_hand,
    item.qty_on_hand,
    item.quantity,
    item.count,
    item.stock,
    item.bottles,
  ];
  for (const c of candidates) {
    const n = Number(c);
    if (!Number.isNaN(n)) return n;
  }
  return null;
}

export default function DashboardPage() {
  // ---- Daily Menu (localStorage) ----
  const [menu, setMenu] = useState<DailyMenu>(() => {
    const iso = todayISO();
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as DailyMenu;
        if (parsed?.dateISO === iso) return parsed;
      } catch {}
    }
    return {
      dateISO: iso,
      winePairing: "",
      starter: "",
      entree: "",
      dessert: "",
      notes: "",
    };
  });

  const [editingMenu, setEditingMenu] = useState(false);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(menu));
  }, [menu]);

  // ---- Low inventory (backend) ----
  const API_BASE = "http://localhost:8000/api"; // matches your AuthContext
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const [lowInventory, setLowInventory] = useState<Array<{ name: string; stock: number }>>([]);

  const LOW_STOCK_THRESHOLD = 6;
  const LOW_STOCK_LIMIT = 5;

  const fetchLowInventory = async () => {
    setInventoryLoading(true);
    setInventoryError(null);

    try {
      const res = await fetch(`${API_BASE}/inventory/?company_id=${COMPANY_ID}`, {
        headers: {
          // if your backend needs auth, you can add token here later
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error(`Inventory failed (${res.status})`);

      const data = (await res.json()) as InventoryItemAny[];

      const mapped = data
        .map((item) => {
          const name = String(getItemName(item));
          const stock = getItemStock(item);
          return stock === null ? null : { name, stock };
        })
        .filter(Boolean) as Array<{ name: string; stock: number }>;

      const lows = mapped
        .filter((x) => x.stock <= LOW_STOCK_THRESHOLD)
        .sort((a, b) => a.stock - b.stock)
        .slice(0, LOW_STOCK_LIMIT);

      setLowInventory(lows);
    } catch (err: any) {
      setInventoryError(err?.message || "Failed to load inventory");
      setLowInventory([]);
    } finally {
      setInventoryLoading(false);
    }
  };

  useEffect(() => {
    fetchLowInventory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Stats (placeholder for now) ----
  const stats = useMemo(
    () => [
      { label: "Covers", value: "32", sub: "Booked for tonight" },
      { label: "Open Tables", value: "5", sub: "Not yet seated" },
      { label: "Bottles On Hand", value: "184", sub: "All SKUs" },
    ],
    []
  );

  return (
    <MainLayout title="Dashboard" subtitle="Tonight’s overview of guests, wine, and service">
      {/* Top row - key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {stats.map((s) => (
          <CardStat key={s.label} label={s.label} value={s.value} sub={s.sub} />
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: upcoming tables */}
        <div className="lg:col-span-2 space-y-4">
          <SectionTitle title="Upcoming Seatings" />
          <div className="divide-y rounded-xl border" style={{ borderColor: BRAND.tanLight }}>
            {[
              { table: "T1", room: "Cabin 3", time: "6:00 pm", guests: 2, notes: "Anniversary, enjoys Burgundy." },
              { table: "T2", room: "Cabin 7", time: "6:30 pm", guests: 4, notes: "One guest gluten-free." },
              { table: "T3", room: "Suite 1", time: "7:00 pm", guests: 2, notes: "Prefers dry white wines." },
            ].map((t) => (
              <div key={t.table} className="flex items-start justify-between gap-3 px-4 py-3">
                <div>
                  <div className="text-sm font-semibold text-slate-800">
                    {t.table} • {t.room}
                  </div>
                  <div className="text-xs text-slate-500">
                    {t.guests} guests • {t.time}
                  </div>
                  <div className="mt-1 text-xs text-slate-600">{t.notes}</div>
                </div>
                <Link
                  to="/service"
                  className="self-center text-xs px-3 py-1 rounded-full border border-slate-300 hover:bg-slate-50"
                >
                  Open in Service
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Daily Menu + Low Inventory */}
        <div className="space-y-4">
          <SectionTitle title="Daily Menu (Sommelier Rec)" />
          <div className="rounded-xl border p-4 bg-white" style={{ borderColor: BRAND.tanLight }}>
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Date: <span className="font-mono">{menu.dateISO}</span>
              </div>

              <button
                onClick={() => setEditingMenu((v) => !v)}
                className="text-xs px-3 py-1 rounded-full border hover:bg-slate-50"
                style={{ borderColor: BRAND.tanLight, color: BRAND.maroon }}
              >
                {editingMenu ? "Close" : "Edit"}
              </button>
            </div>

            {editingMenu ? (
              <div className="mt-3 space-y-3">
                <Field label="Wine pairing">
                  <input
                    value={menu.winePairing}
                    onChange={(e) => setMenu((m) => ({ ...m, winePairing: e.target.value }))}
                    className="w-full rounded-lg border border-[#E0C6AF] bg-[#FDF8F2] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                    placeholder="e.g., 2020 Chablis – oyster shell + citrus"
                  />
                </Field>
                <Field label="Starter">
                  <input
                    value={menu.starter}
                    onChange={(e) => setMenu((m) => ({ ...m, starter: e.target.value }))}
                    className="w-full rounded-lg border border-[#E0C6AF] bg-[#FDF8F2] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                    placeholder="e.g., Scallops, miso-butter"
                  />
                </Field>
                <Field label="Entrée">
                  <input
                    value={menu.entree}
                    onChange={(e) => setMenu((m) => ({ ...m, entree: e.target.value }))}
                    className="w-full rounded-lg border border-[#E0C6AF] bg-[#FDF8F2] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                    placeholder="e.g., Beef tenderloin, celery root purée"
                  />
                </Field>
                <Field label="Dessert">
                  <input
                    value={menu.dessert}
                    onChange={(e) => setMenu((m) => ({ ...m, dessert: e.target.value }))}
                    className="w-full rounded-lg border border-[#E0C6AF] bg-[#FDF8F2] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                    placeholder="e.g., Citrus tart + late harvest Riesling"
                  />
                </Field>
                <Field label="Notes (optional)">
                  <textarea
                    value={menu.notes}
                    onChange={(e) => setMenu((m) => ({ ...m, notes: e.target.value }))}
                    rows={2}
                    className="w-full rounded-lg border border-[#E0C6AF] bg-[#FDF8F2] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                    placeholder="Upsell cues, VIP note, pacing reminder…"
                  />
                </Field>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => {
                      localStorage.removeItem(LS_KEY);
                      setMenu({
                        dateISO: todayISO(),
                        winePairing: "",
                        starter: "",
                        entree: "",
                        dessert: "",
                        notes: "",
                      });
                    }}
                    className="text-xs hover:underline"
                    style={{ color: BRAND.maroon }}
                  >
                    Reset
                  </button>

                  <button
                    onClick={() => setEditingMenu(false)}
                    className="text-xs px-3 py-1 rounded-full border hover:bg-slate-50"
                    style={{ borderColor: BRAND.tanLight, color: BRAND.maroon }}
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-3 space-y-2 text-sm">
                <Row label="Wine pairing" value={menu.winePairing || "—"} />
                <Row label="Starter" value={menu.starter || "—"} />
                <Row label="Entrée" value={menu.entree || "—"} />
                <Row label="Dessert" value={menu.dessert || "—"} />
                {menu.notes?.trim() ? (
                  <div className="mt-2 rounded-lg border px-3 py-2 text-xs text-slate-600 bg-slate-50">
                    <span className="font-semibold">Notes:</span> {menu.notes}
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <SectionTitle title="Low Inventory" />
          <div className="rounded-xl border p-4 bg-white" style={{ borderColor: BRAND.tanLight }}>
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-500">Threshold: ≤ {LOW_STOCK_THRESHOLD} bottles</div>
              <button
                onClick={fetchLowInventory}
                className="text-xs px-3 py-1 rounded-full border hover:bg-slate-50"
                style={{ borderColor: BRAND.tanLight, color: BRAND.maroon }}
              >
                Refresh
              </button>
            </div>

            <div className="mt-3">
              {inventoryError ? (
                <div className="text-xs text-red-700 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                  {inventoryError} (check backend + company_id)
                </div>
              ) : inventoryLoading ? (
                <div className="text-xs text-slate-500">Loading…</div>
              ) : lowInventory.length === 0 ? (
                <div className="text-xs text-slate-500">No low-stock items found.</div>
              ) : (
                <div className="space-y-2">
                  {lowInventory.map((w) => (
                    <div
                      key={w.name}
                      className="flex items-center justify-between rounded-lg border px-3 py-2"
                      style={{ borderColor: BRAND.tanLight }}
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-slate-800 truncate">{w.name}</div>
                        <div className="text-[11px] text-slate-500">Low stock</div>
                      </div>
                      <span
                        className="text-xs font-semibold px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: w.stock <= 2 ? "#FDEBE8" : "#FFF8E3",
                          color: w.stock <= 2 ? "#8E2525" : "#8B5A12",
                        }}
                      >
                        {w.stock} left
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-3 text-[11px] text-slate-500">
              (Next: link this to Inventory page and add “par level” warnings.)
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

/* ---------- small components ---------- */

function CardStat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border shadow-sm px-4 py-3" style={{ borderColor: BRAND.tanLight }}>
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
      <div
        className="mt-1 text-2xl font-semibold"
        style={{ color: BRAND.maroon, fontFamily: "Playfair Display, Georgia, serif" }}
      >
        {value}
      </div>
      {sub && <div className="mt-1 text-xs text-slate-500">{sub}</div>}
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-sm font-semibold" style={{ color: BRAND.maroonDark, fontFamily: "Playfair Display, Georgia, serif" }}>
        {title}
      </h2>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1" style={{ color: "#7B5A45" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-sm text-slate-800 text-right">{value}</div>
    </div>
  );
}
