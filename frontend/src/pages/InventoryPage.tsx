// src/pages/InventoryPage.tsx
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getWines, addWine, updateWine, Wine } from "@/api/wines";

export default function InventoryPage() {
  const { user } = useAuth();
  const [wines, setWines] = useState<Wine[]>([]);
  const [newWine, setNewWine] = useState<Partial<Wine>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFields, setEditFields] = useState<Partial<Wine>>({});

  useEffect(() => {
    fetchWines();
  }, []);

  const fetchWines = async () => {
    const res = await getWines();
    setWines(res.data);
  };

  const handleAddWine = async () => {
    const { name, vintage, region, quantity, is_btg } = newWine;
    if (!name || !vintage || !region) return;
    try {
      await addWine({
        name,
        vintage,
        region,
        quantity: quantity ?? 0,
        is_btg: is_btg ?? false,
      });
      setNewWine({});
      fetchWines();
    } catch (err) {
      console.error("Error adding wine:", err);
    }
  };

  const startEdit = (wine: Wine) => {
    setEditingId(wine.id);
    setEditFields({ ...wine });
  };

  const handleUpdateWine = async (id: number) => {
    try {
      await updateWine(id, editFields);
      setEditingId(null);
      fetchWines();
    } catch (err) {
      console.error("Error updating wine:", err);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Wine Inventory</h1>

      {/* Wine list table */}
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Vintage</th>
            <th className="p-2 border">Region</th>
            <th className="p-2 border">Qty</th>
            <th className="p-2 border">BTG?</th>
            {user?.role !== "server" && <th className="p-2 border">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {wines.map((wine) => (
            <tr key={wine.id} className="odd:bg-white even:bg-gray-50">
              <td className="p-2 border">
                {editingId === wine.id ? (
                  <input
                    type="text"
                    value={editFields.name ?? ""}
                    onChange={(e) =>
                      setEditFields({ ...editFields, name: e.target.value })
                    }
                    className="border p-1 w-full"
                  />
                ) : (
                  wine.name
                )}
              </td>
              <td className="p-2 border">
                {editingId === wine.id ? (
                  <input
                    type="number"
                    value={editFields.vintage ?? 0}
                    onChange={(e) =>
                      setEditFields({
                        ...editFields,
                        vintage: Number(e.target.value),
                      })
                    }
                    className="border p-1 w-full"
                  />
                ) : (
                  wine.vintage
                )}
              </td>
              <td className="p-2 border">
                {editingId === wine.id ? (
                  <input
                    type="text"
                    value={editFields.region ?? ""}
                    onChange={(e) =>
                      setEditFields({ ...editFields, region: e.target.value })
                    }
                    className="border p-1 w-full"
                  />
                ) : (
                  wine.region
                )}
              </td>
              <td className="p-2 border">
                {editingId === wine.id ? (
                  <input
                    type="number"
                    value={editFields.quantity ?? 0}
                    onChange={(e) =>
                      setEditFields({
                        ...editFields,
                        quantity: Number(e.target.value),
                      })
                    }
                    className="border p-1 w-full"
                  />
                ) : (
                  wine.quantity
                )}
              </td>
              <td className="p-2 border text-center">
                {editingId === wine.id ? (
                  <input
                    type="checkbox"
                    checked={editFields.is_btg ?? false}
                    onChange={(e) =>
                      setEditFields({
                        ...editFields,
                        is_btg: e.target.checked,
                      })
                    }
                  />
                ) : wine.is_btg ? (
                  "Yes"
                ) : (
                  "No"
                )}
              </td>
              {user?.role !== "server" && (
                <td className="p-2 border text-center">
                  {editingId === wine.id ? (
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleUpdateWine(wine.id)}
                        className="bg-green-500 text-white px-2 py-1 rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-gray-400 text-white px-2 py-1 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEdit(wine)}
                      className="text-blue-600"
                    >
                      Edit
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add new wine form for manager/sommelier (not server) */}
      {user?.role !== "server" && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Add New Wine</h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            <input
              type="text"
              placeholder="Name"
              value={newWine.name ?? ""}
              onChange={(e) => setNewWine({ ...newWine, name: e.target.value })}
              className="border p-2 rounded"
            />
            <input
              type="number"
              placeholder="Vintage"
              value={newWine.vintage ?? ""}
              onChange={(e) =>
                setNewWine({ ...newWine, vintage: Number(e.target.value) })
              }
              className="border p-2 rounded"
            />
            <input
              type="text"
              placeholder="Region"
              value={newWine.region ?? ""}
              onChange={(e) =>
                setNewWine({ ...newWine, region: e.target.value })
              }
              className="border p-2 rounded"
            />
            <input
              type="number"
              placeholder="Quantity"
              value={newWine.quantity ?? ""}
              onChange={(e) =>
                setNewWine({
                  ...newWine,
                  quantity: Number(e.target.value),
                })
              }
              className="border p-2 rounded"
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newWine.is_btg ?? false}
                onChange={(e) =>
                  setNewWine({ ...newWine, is_btg: e.target.checked })
                }
              />
              <span>By The Glass</span>
            </label>
          </div>
          <button
            onClick={handleAddWine}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
          >
            Add Wine
          </button>
        </div>
      )}
    </div>
  );
}
