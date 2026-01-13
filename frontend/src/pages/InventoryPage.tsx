// src/pages/InventoryPage.tsx
import { useEffect, useMemo, useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import { useAuth } from "@/context/AuthContext";
import { addWine, getWines, updateWine, Wine, WineCreate, WineUpdate } from "@/api/wines";

type Role = string;

function canManageInventory(role: Role | undefined) {
  // Only expo or manager can add items (per your rule)
  return role === "expo" || role === "manager";
}

function canEditInventory(role: Role | undefined) {
  // Keep this aligned with your add rule
  return role === "expo" || role === "manager";
}

export default function InventoryPage() {
  const { user } = useAuth();
  const role = user?.role;

  const [wines, setWines] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newWine, setNewWine] = useState<WineCreate>({
    name: "",
    vintage: new Date().getFullYear(),
    region: "",
    quantity: 0,
    is_btg: false,
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFields, setEditFields] = useState<WineUpdate>({});

  const canAdd = useMemo(() => canManageInventory(role), [role]);
  const canEdit = useMemo(() => canEditInventory(role), [role]);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getWines();
      setWines(data);
    } catch (e: any) {
      setError(e?.message || "Failed to load wines.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startEdit = (wine: Wine) => {
    setEditingId(wine.id);
    setEditFields({
      name: wine.name,
      vintage: wine.vintage,
      region: wine.region,
      quantity: wine.quantity,
      is_btg: wine.is_btg,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditFields({});
  };

  const saveEdit = async (id: number) => {
    setSaving(true);
    setError(null);
    try {
      await updateWine(id, editFields);
      cancelEdit();
      await fetchAll();
    } catch (e: any) {
      setError(e?.message || "Failed to update wine.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddWine = async () => {
    if (!canAdd) return;

    // basic validation
    if (!newWine.name.trim()) return setError("Wine name is required.");
    if (!newWine.region.trim()) return setError("Region is required.");
    if (!newWine.vintage || Number.isNaN(Number(newWine.vintage))) return setError("Vintage is required.");

    setSaving(true);
    setError(null);
    try {
      await addWine({
        name: newWine.name.trim(),
        region: newWine.region.trim(),
        vintage: Number(newWine.vintage),
        quantity: Number(newWine.quantity ?? 0),
        is_btg: Boolean(newWine.is_btg),
      });

      // reset form
      setNewWine({
        name: "",
        vintage: new Date().getFullYear(),
        region: "",
        quantity: 0,
        is_btg: false,
      });

      await fetchAll();
    } catch (e: any) {
      setError(e?.message || "Failed to add wine.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout title="Wine Inventory" subtitle="Expo/Manager can add + edit • Servers view only">
      <div className="space-y-4">
        {/* header actions */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm text-slate-600">
            Signed in as <span className="font-semibold">{user?.username ?? "—"}</span>{" "}
            <span className="opacity-70">•</span>{" "}
            <span className="uppercase tracking-wide">{String(role ?? "—")}</span>
          </div>

          <button
            type="button"
            onClick={fetchAll}
            className="rounded-lg px-3 py-2 text-sm border hover:bg-slate-50"
            disabled={loading}
          >
            Refresh
          </button>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </div>
        ) : null}

        {/* table */}
        <div className="rounded-2xl border overflow-hidden bg-white">
          <div className="px-4 py-3 border-b">
            <div className="text-sm font-semibold">Current inventory</div>
            <div className="text-xs text-slate-500">{loading ? "Loading…" : `${wines.length} wines`}</div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-2 border-b text-left">Name</th>
                  <th className="p-2 border-b text-left">Vintage</th>
                  <th className="p-2 border-b text-left">Region</th>
                  <th className="p-2 border-b text-right">Qty</th>
                  <th className="p-2 border-b text-center">BTG</th>
                  {canEdit ? <th className="p-2 border-b text-center">Actions</th> : null}
                </tr>
              </thead>

              <tbody>
                {wines.map((wine) => {
                  const isEditing = editingId === wine.id;

                  return (
                    <tr key={wine.id} className="odd:bg-white even:bg-slate-50">
                      <td className="p-2 border-b">
                        {isEditing ? (
                          <input
                            className="w-full rounded border px-2 py-1"
                            value={String(editFields.name ?? "")}
                            onChange={(e) => setEditFields((p) => ({ ...p, name: e.target.value }))}
                          />
                        ) : (
                          wine.name
                        )}
                      </td>

                      <td className="p-2 border-b">
                        {isEditing ? (
                          <input
                            type="number"
                            className="w-full rounded border px-2 py-1"
                            value={Number(editFields.vintage ?? wine.vintage)}
                            onChange={(e) => setEditFields((p) => ({ ...p, vintage: Number(e.target.value) }))}
                          />
                        ) : (
                          wine.vintage
                        )}
                      </td>

                      <td className="p-2 border-b">
                        {isEditing ? (
                          <input
                            className="w-full rounded border px-2 py-1"
                            value={String(editFields.region ?? "")}
                            onChange={(e) => setEditFields((p) => ({ ...p, region: e.target.value }))}
                          />
                        ) : (
                          wine.region
                        )}
                      </td>

                      <td className="p-2 border-b text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            className="w-full rounded border px-2 py-1 text-right"
                            value={Number(editFields.quantity ?? wine.quantity)}
                            onChange={(e) => setEditFields((p) => ({ ...p, quantity: Number(e.target.value) }))}
                          />
                        ) : (
                          wine.quantity
                        )}
                      </td>

                      <td className="p-2 border-b text-center">
                        {isEditing ? (
                          <input
                            type="checkbox"
                            checked={Boolean(editFields.is_btg)}
                            onChange={(e) => setEditFields((p) => ({ ...p, is_btg: e.target.checked }))}
                          />
                        ) : wine.is_btg ? (
                          "Yes"
                        ) : (
                          "No"
                        )}
                      </td>

                      {canEdit ? (
                        <td className="p-2 border-b text-center">
                          {isEditing ? (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => saveEdit(wine.id)}
                                disabled={saving}
                                className="rounded px-3 py-1 text-white bg-green-600 disabled:opacity-60"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={cancelEdit}
                                disabled={saving}
                                className="rounded px-3 py-1 border disabled:opacity-60"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => startEdit(wine)}
                              className="text-blue-700 hover:underline"
                            >
                              Edit
                            </button>
                          )}
                        </td>
                      ) : null}
                    </tr>
                  );
                })}

                {!loading && wines.length === 0 ? (
                  <tr>
                    <td className="p-4 text-slate-500" colSpan={canEdit ? 6 : 5}>
                      No wines yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        {/* add form */}
        {canAdd ? (
          <div className="rounded-2xl border bg-white p-4 space-y-3">
            <div className="flex items-baseline justify-between gap-2">
              <div>
                <div className="text-sm font-semibold">Add new wine</div>
                <div className="text-xs text-slate-500">Only Expo/Manager can add items</div>
              </div>
              <button
                type="button"
                onClick={handleAddWine}
                disabled={saving}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-[#6B1F2F] disabled:opacity-60"
              >
                {saving ? "Saving…" : "Add Wine"}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
              <input
                className="rounded border px-3 py-2"
                placeholder="Name"
                value={newWine.name}
                onChange={(e) => setNewWine((p) => ({ ...p, name: e.target.value }))}
              />
              <input
                type="number"
                className="rounded border px-3 py-2"
                placeholder="Vintage"
                value={newWine.vintage}
                onChange={(e) => setNewWine((p) => ({ ...p, vintage: Number(e.target.value) }))}
              />
              <input
                className="rounded border px-3 py-2"
                placeholder="Region"
                value={newWine.region}
                onChange={(e) => setNewWine((p) => ({ ...p, region: e.target.value }))}
              />
              <input
                type="number"
                className="rounded border px-3 py-2"
                placeholder="Qty"
                value={newWine.quantity}
                onChange={(e) => setNewWine((p) => ({ ...p, quantity: Number(e.target.value) }))}
              />
              <label className="flex items-center gap-2 rounded border px-3 py-2">
                <input
                  type="checkbox"
                  checked={newWine.is_btg}
                  onChange={(e) => setNewWine((p) => ({ ...p, is_btg: e.target.checked }))}
                />
                <span className="text-sm">By the glass</span>
              </label>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border bg-slate-50 px-4 py-3 text-sm text-slate-600">
            You can view inventory, but only <b>Expo</b> or <b>Manager</b> can add/edit wines.
          </div>
        )}
      </div>
    </MainLayout>
  );
}
