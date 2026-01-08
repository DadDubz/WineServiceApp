// src/pages/GuestManagementPage.tsx
import { useEffect, useMemo, useState } from "react";
import MainLayout from '@/layouts/MainLayout';


type Guest = {
  id: number;
  name: string;
  room_number?: string | null;
  table_id?: number | null;
  phone?: string | null;
  email?: string | null;
  allergies?: string | null;
  dietary_restrictions?: string | null;
  protein_preference?: string | null;
  notes?: string | null;
};

type Table = {
  id: number;
  number: number;
  capacity: number;
};

type Wine = {
  id: number;
  name: string;
};

type SortKey = "name" | "room" | "recent";

const BRAND = {
  maroon: "#6B1F2F",
  maroonDark: "#4A1520",
  tan: "#D4AF88",
  tanLight: "#E8D4B8",
  cream: "#F8F5F0",
};

export default function GuestManagementPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [wines, setWines] = useState<Wine[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [showAddGuest, setShowAddGuest] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

  // order modal hook stays, but not used in UI yet (you can add it later)
  const [showOrderModal, setShowOrderModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    room_number: "",
    table_id: "",
    phone: "",
    email: "",
    allergies: "",
    dietary_restrictions: "",
    protein_preference: "",
    notes: "",
  });

  // NEW: database controls
  const [query, setQuery] = useState("");
  const [filterAllergies, setFilterAllergies] = useState<"all" | "has" | "none">("all");
  const [filterNotes, setFilterNotes] = useState<"all" | "has" | "none">("all");
  const [filterRoom, setFilterRoom] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

  const fetchData = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [guestsRes, tablesRes, winesRes] = await Promise.all([
        fetch(`${API_BASE}/guests/`),
        fetch(`${API_BASE}/tables/`),
        fetch(`${API_BASE}/wines/`),
      ]);

      if (!guestsRes.ok) throw new Error("Failed to load guests");
      if (!tablesRes.ok) throw new Error("Failed to load tables");
      if (!winesRes.ok) throw new Error("Failed to load wines");

      setGuests(await guestsRes.json());
      setTables(await tablesRes.json());
      setWines(await winesRes.json());
    } catch (error: any) {
      setLoadError(error?.message || "Failed to fetch data");
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_BASE}/guests/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          table_id: formData.table_id ? parseInt(formData.table_id) : null,
        }),
      });

      if (!response.ok) throw new Error("Failed to add guest");

      await fetchData();
      setShowAddGuest(false);
      setFormData({
        name: "",
        room_number: "",
        table_id: "",
        phone: "",
        email: "",
        allergies: "",
        dietary_restrictions: "",
        protein_preference: "",
        notes: "",
      });
    } catch (error) {
      console.error("Failed to add guest:", error);
      alert("Failed to add guest. Check backend is running.");
    }
  };

  const addOrder = async (guestId: number, orderData: any) => {
    try {
      await fetch(`${API_BASE}/orders/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...orderData, guest_id: guestId }),
      });
      alert("Order added successfully!");
      setShowOrderModal(false);
    } catch (error) {
      console.error("Failed to add order:", error);
    }
  };

  const roomOptions = useMemo(() => {
    const rooms = new Set<string>();
    guests.forEach((g) => {
      const r = (g.room_number || "").trim();
      if (r) rooms.add(r);
    });
    return Array.from(rooms).sort((a, b) => a.localeCompare(b));
  }, [guests]);

  const filteredGuests = useMemo(() => {
    const q = query.trim().toLowerCase();
    const roomFilter = filterRoom.trim().toLowerCase();

    let list = guests.filter((g) => {
      const name = (g.name || "").toLowerCase();
      const room = (g.room_number || "").toLowerCase();
      const phone = (g.phone || "").toLowerCase();
      const email = (g.email || "").toLowerCase();
      const allergies = (g.allergies || "").toLowerCase();
      const notes = (g.notes || "").toLowerCase();

      const matchesQuery =
        !q ||
        name.includes(q) ||
        room.includes(q) ||
        phone.includes(q) ||
        email.includes(q) ||
        allergies.includes(q) ||
        notes.includes(q);

      const hasAllergies = !!(g.allergies && g.allergies.trim());
      const allergiesOk =
        filterAllergies === "all" ||
        (filterAllergies === "has" && hasAllergies) ||
        (filterAllergies === "none" && !hasAllergies);

      const hasNotes = !!(g.notes && g.notes.trim());
      const notesOk =
        filterNotes === "all" ||
        (filterNotes === "has" && hasNotes) ||
        (filterNotes === "none" && !hasNotes);

      const roomOk = !roomFilter || room.includes(roomFilter);

      return matchesQuery && allergiesOk && notesOk && roomOk;
    });

    list = list.slice();

    if (sortKey === "name") {
      list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (sortKey === "room") {
      list.sort((a, b) => (a.room_number || "").localeCompare(b.room_number || ""));
    } else {
      // "recent" – if API returns in created order, keep as-is (newest last),
      // so we reverse to show newest first
      list.reverse();
    }

    return list;
  }, [guests, query, filterAllergies, filterNotes, filterRoom, sortKey]);

  const stats = useMemo(() => {
    const total = guests.length;
    const allergy = guests.filter((g) => (g.allergies || "").trim()).length;
    const notes = guests.filter((g) => (g.notes || "").trim()).length;
    return { total, allergy, notes };
  }, [guests]);

  return (
  <MainLayout
    title="Guest Management"
    subtitle="Full guest database — preferences, allergies, and notes"
  >

      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1
              className="text-2xl md:text-3xl font-semibold"
              style={{ color: BRAND.maroon, fontFamily: "Playfair Display, Georgia, serif" }}
            >
              Guest Management
            </h1>
            <p className="text-sm mt-1" style={{ color: "#7B5A45" }}>
              Full guest database — preferences, allergies, and notes
            </p>

            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <Pill label={`${stats.total} guests`} />
              <Pill label={`${stats.allergy} w/ allergies`} tone="warn" />
              <Pill label={`${stats.notes} w/ notes`} tone="muted" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              className="rounded-lg px-3 py-2 text-sm border border-[#E8D4B8] bg-white hover:bg-[#FDF8F2] transition"
              style={{ color: BRAND.maroon }}
            >
              Refresh
            </button>
            <button
              onClick={() => setShowAddGuest((v) => !v)}
              className="rounded-lg px-4 py-2 text-sm font-semibold transition"
              style={{
                backgroundColor: showAddGuest ? "#FDF8F2" : BRAND.maroon,
                color: showAddGuest ? BRAND.maroon : "white",
                border: `1px solid ${showAddGuest ? BRAND.tanLight : BRAND.maroon}`,
              }}
            >
              {showAddGuest ? "Close" : "+ Add Guest"}
            </button>
          </div>
        </div>

        {/* Error / Loading */}
        {loadError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {loadError}. Make sure backend is running at{" "}
            <span className="font-mono">{API_BASE}</span>.
          </div>
        ) : null}

        {/* Controls */}
        <div className="rounded-2xl border border-[#E8D4B8] bg-white/90 p-4">
          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.3fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,0.6fr)] gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, room, allergies, notes, phone, email…"
              className="w-full rounded-lg border border-[#E0C6AF] bg-[#FDF8F2] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
            />

            <select
              value={filterRoom}
              onChange={(e) => setFilterRoom(e.target.value)}
              className="w-full rounded-lg border border-[#E0C6AF] bg-[#FDF8F2] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
            >
              <option value="">All rooms</option>
              {roomOptions.map((r) => (
                <option key={r} value={r}>
                  Room {r}
                </option>
              ))}
            </select>

            <select
              value={filterAllergies}
              onChange={(e) => setFilterAllergies(e.target.value as any)}
              className="w-full rounded-lg border border-[#E0C6AF] bg-[#FDF8F2] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
            >
              <option value="all">All allergies</option>
              <option value="has">Has allergies</option>
              <option value="none">No allergies</option>
            </select>

            <select
              value={filterNotes}
              onChange={(e) => setFilterNotes(e.target.value as any)}
              className="w-full rounded-lg border border-[#E0C6AF] bg-[#FDF8F2] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
            >
              <option value="all">All notes</option>
              <option value="has">Has notes</option>
              <option value="none">No notes</option>
            </select>

            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="w-full rounded-lg border border-[#E0C6AF] bg-[#FDF8F2] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
            >
              <option value="name">Sort: Name</option>
              <option value="room">Sort: Room</option>
              <option value="recent">Sort: Recent</option>
            </select>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs" style={{ color: "#7B5A45" }}>
            <span>
              Showing <b>{filteredGuests.length}</b> of {guests.length}
            </span>
            <button
              onClick={() => {
                setQuery("");
                setFilterAllergies("all");
                setFilterNotes("all");
                setFilterRoom("");
                setSortKey("name");
              }}
              className="hover:underline"
              style={{ color: BRAND.maroon }}
            >
              Clear filters
            </button>
          </div>
        </div>

        {/* Add Guest Form */}
        {showAddGuest ? (
          <div className="rounded-2xl border border-[#D4AF88] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <h2
                className="text-lg font-semibold"
                style={{ color: BRAND.maroon, fontFamily: "Playfair Display, Georgia, serif" }}
              >
                Add Guest
              </h2>
              <span className="text-xs" style={{ color: "#7B5A45" }}>
                Saved to database
              </span>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Guest name *">
                  <input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-[#E0C6AF] bg-[#FDF8F2] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                  />
                </Field>

                <Field label="Room number">
                  <input
                    value={formData.room_number}
                    onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                    className="w-full rounded-lg border border-[#E0C6AF] bg-[#FDF8F2] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                  />
                </Field>

                <Field label="Assign to table (optional)">
                  <select
                    value={formData.table_id}
                    onChange={(e) => setFormData({ ...formData, table_id: e.target.value })}
                    className="w-full rounded-lg border border-[#E0C6AF] bg-[#FDF8F2] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                  >
                    <option value="">No table</option>
                    {tables.map((t) => (
                      <option key={t.id} value={t.id}>
                        Table {t.number} ({t.capacity} seats)
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Protein preference">
                  <select
                    value={formData.protein_preference}
                    onChange={(e) => setFormData({ ...formData, protein_preference: e.target.value })}
                    className="w-full rounded-lg border border-[#E0C6AF] bg-[#FDF8F2] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                  >
                    <option value="">Select preference</option>
                    <option value="Rare">Rare</option>
                    <option value="Medium Rare">Medium Rare</option>
                    <option value="Medium">Medium</option>
                    <option value="Medium Well">Medium Well</option>
                    <option value="Well Done">Well Done</option>
                  </select>
                </Field>

                <Field label="Phone">
                  <input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-lg border border-[#E0C6AF] bg-[#FDF8F2] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                  />
                </Field>

                <Field label="Email">
                  <input
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-lg border border-[#E0C6AF] bg-[#FDF8F2] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Allergies">
                  <textarea
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    rows={3}
                    placeholder="e.g., Peanuts, Shellfish, Dairy…"
                    className="w-full rounded-lg border border-[#E0C6AF] bg-[#FDF8F2] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                  />
                </Field>

                <Field label="Dietary restrictions">
                  <textarea
                    value={formData.dietary_restrictions}
                    onChange={(e) => setFormData({ ...formData, dietary_restrictions: e.target.value })}
                    rows={3}
                    placeholder="Vegetarian, gluten-free, no garlic…"
                    className="w-full rounded-lg border border-[#E0C6AF] bg-[#FDF8F2] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                  />
                </Field>
              </div>

              <Field label="Notes">
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  placeholder="Preferences, favorite wines, VIP, pacing notes…"
                  className="w-full rounded-lg border border-[#E0C6AF] bg-[#FDF8F2] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                />
              </Field>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddGuest(false)}
                  className="rounded-lg px-3 py-2 text-sm border border-[#E8D4B8] bg-white hover:bg-[#FDF8F2] transition"
                  style={{ color: BRAND.maroon }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition"
                  style={{ backgroundColor: BRAND.maroon }}
                >
                  Add guest
                </button>
              </div>
            </form>
          </div>
        ) : null}

        {/* Guest grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {loading ? (
            Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)
          ) : filteredGuests.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-[#E8D4B8] bg-[#FDF8F2] p-10 text-center">
              <div className="text-4xl mb-3">👥</div>
              <div className="text-sm" style={{ color: "#7B5A45" }}>
                No guests match your filters.
              </div>
            </div>
          ) : (
            filteredGuests.map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedGuest(g)}
                className="text-left rounded-2xl border border-[#E8D4B8] bg-white hover:bg-[#FDF8F2] transition p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-base font-semibold truncate" style={{ color: BRAND.maroon }}>
                      {g.name}
                    </div>
                    <div className="text-xs mt-1" style={{ color: "#7B5A45" }}>
                      {g.room_number ? `Room ${g.room_number}` : "No room"}{" "}
                      {g.table_id ? `• Table ${g.table_id}` : ""}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {(g.allergies || "").trim() ? <Badge tone="warn">Allergy</Badge> : null}
                    {(g.notes || "").trim() ? <Badge tone="muted">Notes</Badge> : null}
                  </div>
                </div>

                <div className="mt-3 space-y-2 text-sm">
                  {g.protein_preference ? (
                    <div className="text-sm" style={{ color: "#3B2620" }}>
                      <span className="font-semibold">Protein:</span> {g.protein_preference}
                    </div>
                  ) : (
                    <div className="text-sm text-slate-500">Protein: —</div>
                  )}

                  {(g.allergies || "").trim() ? (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-2 text-[12px] text-amber-900">
                      <span className="font-semibold">⚠ Allergies:</span> {g.allergies}
                    </div>
                  ) : null}

                  {(g.notes || "").trim() ? (
                    <div className="text-[12px] italic" style={{ color: "#7B5A45" }}>
                      “{g.notes}”
                    </div>
                  ) : null}
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500">
                    {g.phone ? g.phone : g.email ? g.email : ""}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedGuest(g);
                      setShowOrderModal(true);
                      alert("Order modal wiring next (we can add it).");
                    }}
                    className="rounded-lg px-2.5 py-1.5 text-xs font-semibold border border-[#D4AF88] bg-[#FFF7ED] hover:bg-[#FFEFD9] transition"
                    style={{ color: BRAND.maroon }}
                  >
                    + Order
                  </button>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Guest detail drawer */}
        {selectedGuest ? (
          <Drawer onClose={() => setSelectedGuest(null)} title="Guest details">
            <div className="space-y-3">
              <div>
                <div className="text-lg font-semibold" style={{ color: BRAND.maroon }}>
                  {selectedGuest.name}
                </div>
                <div className="text-xs mt-1" style={{ color: "#7B5A45" }}>
                  {selectedGuest.room_number ? `Room ${selectedGuest.room_number}` : "No room"}{" "}
                  {selectedGuest.table_id ? `• Table ${selectedGuest.table_id}` : ""}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 text-sm">
                <InfoRow label="Phone" value={selectedGuest.phone || "—"} />
                <InfoRow label="Email" value={selectedGuest.email || "—"} />
                <InfoRow label="Protein" value={selectedGuest.protein_preference || "—"} />
                <InfoRow label="Dietary" value={selectedGuest.dietary_restrictions || "—"} />
              </div>

              {(selectedGuest.allergies || "").trim() ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  <div className="font-semibold mb-1">⚠ Allergies</div>
                  <div>{selectedGuest.allergies}</div>
                </div>
              ) : null}

              {(selectedGuest.notes || "").trim() ? (
                <div className="rounded-2xl border border-[#E8D4B8] bg-[#FDF8F2] p-3 text-sm" style={{ color: "#3B2620" }}>
                  <div className="font-semibold mb-1" style={{ color: BRAND.maroon }}>
                    Notes
                  </div>
                  <div>{selectedGuest.notes}</div>
                </div>
              ) : null}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => setSelectedGuest(null)}
                  className="rounded-lg px-3 py-2 text-sm border border-[#E8D4B8] bg-white hover:bg-[#FDF8F2] transition"
                  style={{ color: BRAND.maroon }}
                >
                  Close
                </button>
                <button
                  onClick={() => alert("Next: edit guest + save endpoint")}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-white transition"
                  style={{ backgroundColor: BRAND.maroon }}
                >
                  Edit (next)
                </button>
              </div>
            </div>
          </Drawer>
        ) : null}
      </div>
        </MainLayout>
  );
}

/* ---------- small components ---------- */

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

function Badge({ children, tone = "muted" }: { children: React.ReactNode; tone?: "warn" | "muted" }) {
  const cls =
    tone === "warn"
      ? "bg-amber-50 text-amber-900 border-amber-200"
      : "bg-slate-100 text-slate-700 border-slate-200";
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${cls}`}>{children}</span>;
}

function Pill({ label, tone = "base" }: { label: string; tone?: "base" | "warn" | "muted" }) {
  const cls =
    tone === "warn"
      ? "bg-amber-50 text-amber-900 border-amber-200"
      : tone === "muted"
      ? "bg-slate-100 text-slate-700 border-slate-200"
      : "bg-[#FDF8F2] text-[#4A1520] border-[#E8D4B8]";
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 ${cls}`}>{label}</span>;
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-[#E8D4B8] bg-white p-4 shadow-sm">
      <div className="h-4 w-2/3 bg-slate-100 rounded mb-2" />
      <div className="h-3 w-1/2 bg-slate-100 rounded mb-4" />
      <div className="h-3 w-full bg-slate-100 rounded mb-2" />
      <div className="h-3 w-5/6 bg-slate-100 rounded mb-2" />
      <div className="h-3 w-3/4 bg-slate-100 rounded" />
    </div>
  );
}

function Drawer({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white border-l border-[#E8D4B8] shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E8D4B8]">
          <div className="text-sm font-semibold" style={{ color: "#4A1520", fontFamily: "Playfair Display, Georgia, serif" }}>
            {title}
          </div>
          <button onClick={onClose} className="text-sm px-2 py-1 rounded hover:bg-slate-50">
            ✕
          </button>
        </div>
        <div className="p-4 overflow-y-auto h-[calc(100%-48px)]">{children}</div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[#E8D4B8] bg-[#FDF8F2] px-3 py-2">
      <span className="text-xs font-semibold" style={{ color: "#7B5A45" }}>
        {label}
      </span>
      <span className="text-sm" style={{ color: "#3B2620" }}>
        {value}
      </span>
    </div>
  );
}
