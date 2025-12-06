// src/pages/ServicePage.tsx
import { useState } from "react";
import MainLayout from "@/layout/MainLayout";

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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tables list */}
        <div
          className="rounded-xl shadow-lg p-4 lg:col-span-1"
          style={{ backgroundColor: "#FEFEFE" }}
        >
          <h2
            className="text-lg font-semibold mb-3"
            style={{
              color: "#6B1F2F",
              fontFamily: "Playfair Display, Georgia, serif",
            }}
          >
            Tonight&apos;s Tables
          </h2>
          <div className="space-y-2">
            {tables.map((table) => {
              const isActive = table.id === selectedId;
              return (
                <button
                  key={table.id}
                  onClick={() => setSelectedId(table.id)}
                  className="w-full text-left rounded-lg px-3 py-2 border transition flex justify-between items-center"
                  style={{
                    borderColor: isActive ? "#6B1F2F" : "#E8D4B8",
                    backgroundColor: isActive ? "#6B1F2F" : "#FEFEFE",
                    color: isActive ? "#FEFEFE" : "#4A0E1E",
                  }}
                >
                  <div>
                    <div className="text-sm font-semibold">
                      Table {table.tableNumber}
                    </div>
                    <div className="text-xs opacity-80">
                      {table.roomNumber || "No room #"} • {table.guestsCount}{" "}
                      guests
                    </div>
                  </div>
                  <div className="text-xs opacity-80">
                    {table.guestName || "Guest"}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detail / form */}
        <div
          className="rounded-xl shadow-lg p-6 lg:col-span-2"
          style={{ backgroundColor: "#FEFEFE" }}
        >
          {selectedTable ? (
            <>
              <h2
                className="text-xl font-bold mb-4"
                style={{
                  color: "#6B1F2F",
                  fontFamily: "Playfair Display, Georgia, serif",
                }}
              >
                Table {selectedTable.tableNumber} •{" "}
                {selectedTable.roomNumber || "No room #"}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-700">
                    Guest / Party Name
                  </label>
                  <input
                    type="text"
                    value={selectedTable.guestName}
                    onChange={(e) =>
                      updateSelected({ guestName: e.target.value })
                    }
                    className="w-full rounded-md px-3 py-2 text-sm border focus:outline-none focus:ring-2"
                    style={{
                      borderColor: "#D4AF88",
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-700">
                    Room Number
                  </label>
                  <input
                    type="text"
                    value={selectedTable.roomNumber ?? ""}
                    onChange={(e) =>
                      updateSelected({ roomNumber: e.target.value })
                    }
                    className="w-full rounded-md px-3 py-2 text-sm border focus:outline-none focus:ring-2"
                    style={{
                      borderColor: "#D4AF88",
                    }}
                  />
                </div>
              </div>

              {/* Drinks & add-ons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-700">
                    What they had to drink
                  </label>
                  <textarea
                    value={selectedTable.drinks}
                    onChange={(e) =>
                      updateSelected({ drinks: e.target.value })
                    }
                    className="w-full rounded-md px-3 py-2 text-sm border focus:outline-none focus:ring-2"
                    rows={3}
                    placeholder="E.g., 2x Pinot Noir by the glass, 1x Champagne aperitif…"
                    style={{
                      borderColor: "#D4AF88",
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-2 text-gray-700">
                    Add-ons
                  </label>
                  <div className="space-y-2 text-sm text-gray-800">
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

              {/* Allergies, substitutions, protein */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-700">
                    Allergies
                  </label>
                  <textarea
                    value={selectedTable.allergies}
                    onChange={(e) =>
                      updateSelected({ allergies: e.target.value })
                    }
                    className="w-full rounded-md px-3 py-2 text-sm border focus:outline-none focus:ring-2"
                    rows={2}
                    placeholder="E.g., no nuts, lactose-intolerant…"
                    style={{
                      borderColor: "#D4AF88",
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-700">
                    Substitutions
                  </label>
                  <textarea
                    value={selectedTable.substitutions}
                    onChange={(e) =>
                      updateSelected({ substitutions: e.target.value })
                    }
                    className="w-full rounded-md px-3 py-2 text-sm border focus:outline-none focus:ring-2"
                    rows={2}
                    placeholder="E.g., no onion, side salad instead of potatoes…"
                    style={{
                      borderColor: "#D4AF88",
                    }}
                  />
                </div>
              </div>

              {/* Protein doneness + notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-700">
                    Protein doneness
                  </label>
                  <select
                    value={selectedTable.protein}
                    onChange={(e) =>
                      updateSelected({
                        protein: e.target.value as ProteinDoneness,
                      })
                    }
                    className="w-full rounded-md px-3 py-2 text-sm border focus:outline-none focus:ring-2"
                    style={{
                      borderColor: "#D4AF88",
                    }}
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
                  <label className="block text-xs font-semibold mb-1 text-gray-700">
                    Service notes
                  </label>
                  <textarea
                    value={selectedTable.notes}
                    onChange={(e) =>
                      updateSelected({ notes: e.target.value })
                    }
                    className="w-full rounded-md px-3 py-2 text-sm border focus:outline-none focus:ring-2"
                    rows={2}
                    placeholder="Anything you want FOH/BOH to remember about this table."
                    style={{
                      borderColor: "#D4AF88",
                    }}
                  />
                </div>
              </div>

              <p className="text-xs text-gray-500">
                (Later we can wire this to the backend so every change saves
                automatically for the night&apos;s service log.)
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-700">
              Select a table on the left to view or edit details.
            </p>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
