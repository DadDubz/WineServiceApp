// src/pages/ServicePage.tsx
import { useState } from "react";
import MainLayout from "@/layouts/MainLayout";

type ProteinDoneness =
  | "rare"
  | "medium-rare"
  | "medium"
  | "medium-well"
  | "well"
  | "n/a";

interface ServiceTable {
  id: number;
  tableNumber: string;
  roomNumber?: string;
  guestName: string;
  guestsCount: number;
  notes: string;
  drinks: string;
  addOns: {
    cheeseBoard: boolean;
    sparklingWater: boolean;
    dessertWine: boolean;
  };
  allergies: string;
  substitutions: string;
  protein: ProteinDoneness;
}

const initialTables: ServiceTable[] = [
  {
    id: 1,
    tableNumber: "T1",
    roomNumber: "Cabin 3",
    guestName: "Smith",
    guestsCount: 2,
    notes: "",
    drinks: "",
    addOns: {
      cheeseBoard: false,
      sparklingWater: false,
      dessertWine: false,
    },
    allergies: "",
    substitutions: "",
    protein: "medium-rare",
  },
  {
    id: 2,
    tableNumber: "T2",
    roomNumber: "Cabin 7",
    guestName: "Johnson",
    guestsCount: 4,
    notes: "",
    drinks: "",
    addOns: {
      cheeseBoard: true,
      sparklingWater: false,
      dessertWine: false,
    },
    allergies: "No nuts",
    substitutions: "",
    protein: "medium",
  },
  {
    id: 3,
    tableNumber: "T3",
    roomNumber: "Suite 1",
    guestName: "Taylor",
    guestsCount: 2,
    notes: "",
    drinks: "",
    addOns: {
      cheeseBoard: false,
      sparklingWater: true,
      dessertWine: false,
    },
    allergies: "",
    substitutions: "No onion in sauce",
    protein: "medium-rare",
  },
];

export default function ServicePage() {
  const [tables, setTables] = useState<ServiceTable[]>(initialTables);
  const [selectedId, setSelectedId] = useState<number | null>(
    initialTables[0]?.id ?? null
  );

  const selectedTable = tables.find((t) => t.id === selectedId) ?? null;

  const updateSelected = (patch: Partial<ServiceTable>) => {
    if (!selectedTable) return;
    setTables((prev) =>
      prev.map((t) =>
        t.id === selectedTable.id
          ? {
              ...t,
              ...patch,
              addOns: patch.addOns ?? t.addOns,
            }
          : t
      )
    );
  };

  const handleAddOnToggle = (field: keyof ServiceTable["addOns"]) => {
    if (!selectedTable) return;
    setTables((prev) =>
      prev.map((t) =>
        t.id === selectedTable.id
          ? {
              ...t,
              addOns: {
                ...t.addOns,
                [field]: !t.addOns[field],
              },
            }
          : t
      )
    );
  };

  return (
    <MainLayout
      title="Dinner Service"
      subtitle="Tables, guests, wines, and special notes"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.6fr)]">
        {/* Tables list */}
        <aside className="rounded-2xl bg-white/90 border border-[#E8D4B8] shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-[#E8D4B8] flex items-center justify-between">
            <div>
              <h2
                className="text-sm font-semibold text-[#4A1520]"
                style={{ fontFamily: "Playfair Display, Georgia, serif" }}
              >
                Tonight&apos;s Tables
              </h2>
              <p className="text-[11px] text-[#7B5A45] mt-0.5">
                Tap a table to view and update details
              </p>
            </div>
            <span className="text-[11px] text-[#7B5A45]">
              {tables.length} seated
            </span>
          </div>

          <div className="divide-y divide-[#F0E0CF]">
            {tables.map((table) => {
              const isActive = table.id === selectedId;
              const hasAllergy = !!table.allergies.trim();
              const hasAddOn =
                table.addOns.cheeseBoard ||
                table.addOns.sparklingWater ||
                table.addOns.dessertWine;

              return (
                <button
                  key={table.id}
                  onClick={() => setSelectedId(table.id)}
                  className={[
                    "w-full text-left px-4 py-3 transition flex flex-col gap-1",
                    isActive
                      ? "bg-[#6B1F2F] text-[#FDF7EE]"
                      : "hover:bg-[#FDF8F2] text-[#3B2620]",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold">
                        {table.tableNumber}
                      </div>
                      <div
                        className={
                          isActive
                            ? "text-[11px] opacity-90"
                            : "text-[11px] text-[#7B5A45]"
                        }
                      >
                        {table.roomNumber || "No room #"} • {table.guestsCount}{" "}
                        {table.guestsCount === 1 ? "guest" : "guests"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] font-medium truncate max-w-[100px]">
                        {table.guestName || "Guest"}
                      </div>
                      <div className="flex flex-wrap gap-1 justify-end mt-1">
                        {hasAllergy && (
                          <span
                            className={[
                              "text-[10px] px-2 py-0.5 rounded-full",
                              isActive
                                ? "bg-[#FDE4E2] text-[#8E2525]"
                                : "bg-[#FDEBE8] text-[#8E2525]",
                            ].join(" ")}
                          >
                            Allergy
                          </span>
                        )}
                        {hasAddOn && (
                          <span
                            className={[
                              "text-[10px] px-2 py-0.5 rounded-full",
                              isActive
                                ? "bg-[#FFF4D6] text-[#8B5A12]"
                                : "bg-[#FFF8E3] text-[#8B5A12]",
                            ].join(" ")}
                          >
                            Add-ons
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Detail / form */}
        <section className="rounded-2xl bg-white/90 border border-[#E8D4B8] shadow-sm p-5">
          {selectedTable ? (
            <>
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F0E0CF] pb-3 mb-4">
                <div>
                  <h2
                    className="text-lg font-semibold text-[#4A1520]"
                    style={{ fontFamily: "Playfair Display, Georgia, serif" }}
                  >
                    {selectedTable.tableNumber}
                  </h2>
                  <p className="text-xs text-[#7B5A45] mt-0.5">
                    {selectedTable.roomNumber || "No room #"} •{" "}
                    {selectedTable.guestsCount}{" "}
                    {selectedTable.guestsCount === 1 ? "guest" : "guests"}
                  </p>
                </div>
              </div>

              {/* Guest & room info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-[#7B5A45]">
                    Guest / party name
                  </label>
                  <input
                    type="text"
                    value={selectedTable.guestName}
                    onChange={(e) =>
                      updateSelected({ guestName: e.target.value })
                    }
                    className="w-full rounded-lg border border-[#E0C6AF] bg-[#FDF8F2] px-3 py-2 text-sm text-[#3B2620] focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-[#7B5A45]">
                    Room / cabin
                  </label>
                  <input
                    type="text"
                    value={selectedTable.roomNumber ?? ""}
                    onChange={(e) =>
                      updateSelected({ roomNumber: e.target.value })
                    }
                    className="w-full rounded-lg border border-[#E0C6AF] bg-[#FDF8F2] px-3 py-2 text-sm text-[#3B2620] focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                  />
                </div>
              </div>

              {/* Drinks & add-ons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-[#7B5A45]">
                    What they had to drink
                  </label>
                  <textarea
                    value={selectedTable.drinks}
                    onChange={(e) =>
                      updateSelected({ drinks: e.target.value })
                    }
                    rows={3}
                    className="w-full rounded-lg border border-[#E0C6AF] bg-[#FDF8F2] px-3 py-2 text-sm text-[#3B2620] focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                    placeholder="E.g., 2x Pinot Noir BTG, 1x Champagne, 1x amaro…"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-2 text-[#7B5A45]">
                    Add-ons
                  </label>
                  <div className="space-y-2 text-sm text-[#3B2620]">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedTable.addOns.cheeseBoard}
                        onChange={() => handleAddOnToggle("cheeseBoard")}
                      />
                      Cheese board
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedTable.addOns.sparklingWater}
                        onChange={() => handleAddOnToggle("sparklingWater")}
                      />
                      Sparkling water
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedTable.addOns.dessertWine}
                        onChange={() => handleAddOnToggle("dessertWine")}
                      />
                      Dessert wine
                    </label>
                  </div>
                </div>
              </div>

              {/* Allergies & substitutions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-[#7B5A45]">
                    Allergies / restrictions
                  </label>
                  <textarea
                    value={selectedTable.allergies}
                    onChange={(e) =>
                      updateSelected({ allergies: e.target.value })
                    }
                    rows={2}
                    className="w-full rounded-lg border border-[#E0C6AF] bg-[#FDF8F2] px-3 py-2 text-sm text-[#3B2620] focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                    placeholder="E.g., no nuts, lactose intolerant, no garlic…"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-[#7B5A45]">
                    Substitutions
                  </label>
                  <textarea
                    value={selectedTable.substitutions}
                    onChange={(e) =>
                      updateSelected({ substitutions: e.target.value })
                    }
                    rows={2}
                    className="w-full rounded-lg border border-[#E0C6AF] bg-[#FDF8F2] px-3 py-2 text-sm text-[#3B2620] focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                    placeholder="E.g., no onion, side salad instead of potato…"
                  />
                </div>
              </div>

              {/* Protein + service notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-[#7B5A45]">
                    Protein doneness
                  </label>
                  <select
                    value={selectedTable.protein}
                    onChange={(e) =>
                      updateSelected({
                        protein: e.target.value as ProteinDoneness,
                      })
                    }
                    className="w-full rounded-lg border border-[#E0C6AF] bg-[#FDF8F2] px-3 py-2 text-sm text-[#3B2620] focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                  >
                    <option value="n/a">N/A</option>
                    <option value="rare">Rare</option>
                    <option value="medium-rare">Medium-rare</option>
                    <option value="medium">Medium</option>
                    <option value="medium-well">Medium-well</option>
                    <option value="well">Well</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-[#7B5A45]">
                    Service notes
                  </label>
                  <textarea
                    value={selectedTable.notes}
                    onChange={(e) =>
                      updateSelected({ notes: e.target.value })
                    }
                    rows={2}
                    className="w-full rounded-lg border border-[#E0C6AF] bg-[#FDF8F2] px-3 py-2 text-sm text-[#3B2620] focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                    placeholder="Pacing, special occasions, pairing notes, etc."
                  />
                </div>
              </div>

              <p className="text-[11px] text-[#7B5A45] mt-1">
                Later we can sync this view with a backend service log so every
                change is saved for the night.
              </p>
            </>
          ) : (
            <p className="text-sm text-[#7B5A45]">
              Select a table on the left to view or edit its details.
            </p>
          )}
        </section>
      </div>
    </MainLayout>
  );
}
