// src/pages/DashboardPage.tsx
import { useEffect, useState } from "react";
import MainLayout from "@/layouts/MainLayout";

interface WineSummary {
  id: number;
  name: string;
  category: "Sparkling" | "White" | "Red" | "Dessert";
  byTheGlass: boolean;
  stock: number;
  par: number;
  lastUsed: string;
  notes?: string;
}

export default function DashboardPage() {
  const [wines, setWines] = useState<WineSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE =
    import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

  useEffect(() => {
    const fetchWines = async () => {
      try {
        const res = await fetch(`${API_BASE}/wines/`);
        if (!res.ok) throw new Error("Failed to load wines");
        const data = await res.json();

        const mapped: WineSummary[] = data.map((w: any) => ({
          id: w.id,
          name: w.name,
          category: w.category,
          byTheGlass: w.by_the_glass,
          stock: w.current_stock ?? 0,
          par: w.par_level ?? 0,
          lastUsed: w.last_used_service ?? "—",
          notes: w.notes ?? "",
        }));

        setWines(mapped);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWines();
  }, [API_BASE]);

  const totalByGlass = wines.filter((w) => w.byTheGlass).length;
  const lowStock = wines.filter((w) => w.stock > 0 && w.stock <= (w.par || 0));
  const outOfStock = wines.filter((w) => w.stock === 0);

  return (
    <MainLayout
      title="Tonight’s Overview"
      subtitle="Quick snapshot of service and cellar at a glance"
    >
      {/* Top cards */}
      <section className="grid gap-4 md:grid-cols-3 mb-6">
        <div className="rounded-xl border border-[#E8D4B8] bg-[#FDF8F2] p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.16em] text-[#B08968] mb-1">
            By-the-Glass List
          </p>
          <p
            className="text-2xl font-semibold text-[#4A1520]"
            style={{ fontFamily: "Playfair Display, Georgia, serif" }}
          >
            {totalByGlass}
          </p>
          <p className="text-xs text-[#7B5A45] mt-1">
            Wines currently marked as BTG
          </p>
        </div>

        <div className="rounded-xl border border-[#E8D4B8] bg-[#FDF8F2] p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.16em] text-[#B08968] mb-1">
            Low Stock Alerts
          </p>
          <p
            className="text-2xl font-semibold text-[#4A1520]"
            style={{ fontFamily: "Playfair Display, Georgia, serif" }}
          >
            {lowStock.length}
          </p>
          <p className="text-xs text-[#7B5A45] mt-1">
            At or below par level – check before service
          </p>
        </div>

        <div className="rounded-xl border border-[#E8D4B8] bg-[#FDF8F2] p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.16em] text-[#B08968] mb-1">
            86’d Wines
          </p>
          <p
            className="text-2xl font-semibold text-[#4A1520]"
            style={{ fontFamily: "Playfair Display, Georgia, serif" }}
          >
            {outOfStock.length}
          </p>
          <p className="text-xs text-[#7B5A45] mt-1">
            Update menus / FOH talking points
          </p>
        </div>
      </section>

      {/* Two-column layout */}
      <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
        {/* Recent / key wines table */}
        <div className="rounded-2xl bg-white/90 border border-[#E8D4B8] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E8D4B8] flex items-center justify-between">
            <div>
              <h2
                className="text-lg font-semibold text-[#4A1520]"
                style={{ fontFamily: "Playfair Display, Georgia, serif" }}
              >
                Cellar Focus
              </h2>
              <p className="text-xs text-[#7B5A45]">
                Wines that matter most for tonight’s service
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-[#F8EFE4]">
                <tr className="text-left text-xs uppercase tracking-wide text-[#7B5A45]">
                  <th className="px-4 py-2 font-semibold">Wine</th>
                  <th className="px-4 py-2 font-semibold">Category</th>
                  <th className="px-4 py-2 font-semibold">Stock</th>
                  <th className="px-4 py-2 font-semibold">Par</th>
                  <th className="px-4 py-2 font-semibold">BTG</th>
                  <th className="px-4 py-2 font-semibold">Last Used</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-6 text-center text-xs text-[#7B5A45]"
                    >
                      Loading wines…
                    </td>
                  </tr>
                )}

                {!isLoading && wines.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-6 text-center text-xs text-[#7B5A45]"
                    >
                      No wines found yet. Add wines in the inventory section.
                    </td>
                  </tr>
                )}

                {!isLoading &&
                  wines.map((wine) => {
                    const isLow = wine.stock > 0 && wine.stock <= wine.par;
                    const isOut = wine.stock === 0;

                    return (
                      <tr
                        key={wine.id}
                        className="border-t border-[#F0E0CF] hover:bg-[#FDF7F2]"
                      >
                        <td className="px-4 py-3 text-[#3B2620]">
                          <div className="font-medium">{wine.name}</div>
                          {wine.notes && (
                            <div className="text-[11px] text-[#8A6852]">
                              {wine.notes}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[#7B5A45] whitespace-nowrap">
                          {wine.category}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={[
                              "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium",
                              isOut
                                ? "bg-[#FDE4E2] text-[#8E2525]"
                                : isLow
                                ? "bg-[#FFF4D6] text-[#8B5A12]"
                                : "bg-[#E4F5E7] text-[#276749]",
                            ].join(" ")}
                          >
                            {wine.stock}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-[#7B5A45]">
                          {wine.par}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {wine.byTheGlass ? (
                            <span className="inline-flex px-2 py-0.5 rounded-full bg-[#6B1F2F] text-[#FDF7EE] text-[11px]">
                              Yes
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-0.5 rounded-full bg-[#E7D6CF] text-[#7B5A45] text-[11px]">
                              Bottle
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-[#7B5A45] whitespace-nowrap">
                          {wine.lastUsed || "—"}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column: Tonight notes */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-white/90 border border-[#E8D4B8] shadow-sm p-4">
            <h3
              className="text-sm font-semibold text-[#4A1520] mb-2"
              style={{ fontFamily: "Playfair Display, Georgia, serif" }}
            >
              Service Notes
            </h3>
            <ul className="text-xs text-[#7B5A45] space-y-1 list-disc pl-4">
              <li>Confirm 86’d items with FOH before guests are seated.</li>
              <li>
                Walk the cellar once before service to double-check low stock.
              </li>
              <li>Align pairing suggestions for tonight’s tasting menu.</li>
            </ul>
          </div>

          <div className="rounded-2xl bg-[#FDF8F2] border border-[#E8D4B8] shadow-sm p-4">
            <h3
              className="text-sm font-semibold text-[#4A1520] mb-2"
              style={{ fontFamily: "Playfair Display, Georgia, serif" }}
            >
              Quick Links
            </h3>
            <div className="flex flex-col gap-2 text-xs">
              <a
                href="/service"
                className="inline-flex items-center justify-between px-3 py-2 rounded-lg bg-[#6B1F2F] text-[#FDF7EE] hover:brightness-110 transition"
              >
                <span>Dinner Service View</span>
                <span className="text-[10px] opacity-80">Tables & notes</span>
              </a>
              <a
                href="/inventory"
                className="inline-flex items-center justify-between px-3 py-2 rounded-lg bg-white text-[#4A1520] border border-[#E8D4B8] hover:bg-[#F8EFE4] transition"
              >
                <span>Manage Inventory</span>
                <span className="text-[10px] text-[#7B5A45]">
                  Counts, par levels, costs
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
