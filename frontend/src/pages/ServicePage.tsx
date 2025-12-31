// src/pages/ServicePage.tsx
import { useMemo, useState } from "react";
import MainLayout from "@/layouts/MainLayout";

type ProteinDoneness =
  | "rare"
  | "medium-rare"
  | "medium"
  | "medium-well"
  | "well"
  | "n/a";

type DiningArea = "Dining Room" | "In-Room";

type CourseKey = "welcome" | "first" | "main" | "dessert" | "coffee" | "digestif";

type CourseStatus = {
  servedAt?: string; // e.g. "6:18 PM"
  clearedAt?: string;
};

type AddOns = {
  sparklingWater: boolean;
  cheeseCourse: boolean;
  dessertWine: boolean;
  btgNotes: string; // wine by the glass notes
  bottleNotes: string; // bottle notes
};

interface ServiceTable {
  id: number;
  tableNumber: string;

  // Seating info
  diningArea: DiningArea;
  time: string; // scheduled seating time (or actual)
  roomNumber?: string;

  guestName: string;
  guestsCount: number;

  // Notes
  occasion: string;
  allergies: string;
  substitutions: string;
  notes: string;

  // Service-specific
  protein: ProteinDoneness;
  drinks: string; // general drink notes
  addOns: AddOns;

  courses: Record<CourseKey, CourseStatus>;
}

type Reservation = {
  id: string;
  diningArea: DiningArea;
  time: string;
  roomNumber?: string;
  guestName: string;
  guestsCount: number;
  occasion: string;
  allergies: string;
  notes: string;

  // seating
  seatedTableId?: number;
};

type GuestProfile = {
  id: string;
  name: string;
  defaultAllergies?: string;
  notes?: string;
};

const BRAND_PRIMARY = "#6B1F2F";
const BRAND_TEXT = "#3B2620";
const BRAND_MUTED = "#7B5A45";
const BRAND_BORDER = "#E8D4B8";
const BRAND_SOFT = "#FDF8F2";
const BRAND_DIVIDER = "#F0E0CF";

function nowTimeLabel(): string {
  // Simple readable time label for local actions
  const d = new Date();
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function emptyCourses(): Record<CourseKey, CourseStatus> {
  return {
    welcome: {},
    first: {},
    main: {},
    dessert: {},
    coffee: {},
    digestif: {},
  };
}

const initialTables: ServiceTable[] = [
  {
    id: 1,
    tableNumber: "T1",
    diningArea: "Dining Room",
    time: "6:30 PM",
    roomNumber: "Cabin 3",
    guestName: "Smith",
    guestsCount: 2,
    occasion: "Anniversary",
    notes: "",
    drinks: "",
    addOns: {
      cheeseCourse: false,
      sparklingWater: false,
      dessertWine: false,
      btgNotes: "",
      bottleNotes: "",
    },
    allergies: "",
    substitutions: "",
    protein: "medium-rare",
    courses: emptyCourses(),
  },
  {
    id: 2,
    tableNumber: "T2",
    diningArea: "Dining Room",
    time: "6:45 PM",
    roomNumber: "Cabin 7",
    guestName: "Johnson",
    guestsCount: 4,
    occasion: "",
    notes: "",
    drinks: "",
    addOns: {
      cheeseCourse: true,
      sparklingWater: false,
      dessertWine: false,
      btgNotes: "2x Pinot Noir BTG",
      bottleNotes: "",
    },
    allergies: "No nuts",
    substitutions: "",
    protein: "medium",
    courses: emptyCourses(),
  },
  {
    id: 3,
    tableNumber: "T3",
    diningArea: "In-Room",
    time: "7:00 PM",
    roomNumber: "Suite 1",
    guestName: "Taylor",
    guestsCount: 2,
    occasion: "",
    notes: "",
    drinks: "",
    addOns: {
      cheeseCourse: false,
      sparklingWater: true,
      dessertWine: false,
      btgNotes: "",
      bottleNotes: "Sonoma-Cutrer",
    },
    allergies: "",
    substitutions: "No onion in sauce",
    protein: "medium-rare",
    courses: emptyCourses(),
  },
];

const initialGuests: GuestProfile[] = [
  { id: "g1", name: "Smith", defaultAllergies: "", notes: "Enjoys Burgundy" },
  { id: "g2", name: "Johnson", defaultAllergies: "No nuts", notes: "" },
  { id: "g3", name: "Taylor", defaultAllergies: "", notes: "Prefers dry whites" },
  { id: "g4", name: "Conway", defaultAllergies: "", notes: "" },
];

const initialReservations: Reservation[] = [
  {
    id: "r1",
    diningArea: "Dining Room",
    time: "6:30 PM",
    roomNumber: "Cabin 3",
    guestName: "Smith",
    guestsCount: 2,
    occasion: "Anniversary",
    allergies: "",
    notes: "Enjoys Burgundy.",
  },
  {
    id: "r2",
    diningArea: "Dining Room",
    time: "6:45 PM",
    roomNumber: "Cabin 7",
    guestName: "Johnson",
    guestsCount: 4,
    occasion: "",
    allergies: "No nuts",
    notes: "",
  },
  {
    id: "r3",
    diningArea: "In-Room",
    time: "7:00 PM",
    roomNumber: "Suite 1",
    guestName: "Taylor",
    guestsCount: 2,
    occasion: "",
    allergies: "",
    notes: "No onion in sauce.",
  },
];

const COURSE_LABELS: Array<{ key: CourseKey; label: string }> = [
  { key: "welcome", label: "Welcome" },
  { key: "first", label: "1st" },
  { key: "main", label: "Main" },
  { key: "dessert", label: "Dessert" },
  { key: "coffee", label: "Coffee" },
  { key: "digestif", label: "Digestif" },
];

export default function ServicePage() {
  const [tables, setTables] = useState<ServiceTable[]>(initialTables);
  const [selectedId, setSelectedId] = useState<number | null>(
    initialTables[0]?.id ?? null
  );

  const [guests, setGuests] = useState<GuestProfile[]>(initialGuests);
  const [guestSearch, setGuestSearch] = useState("");
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);

  // Add table form
  const [newTableNumber, setNewTableNumber] = useState("");
  const [newTableArea, setNewTableArea] = useState<DiningArea>("Dining Room");

  // Add reservation form (pre-dinner list)
  const [resForm, setResForm] = useState<Omit<Reservation, "id">>({
    diningArea: "Dining Room",
    time: "6:30 PM",
    roomNumber: "",
    guestName: "",
    guestsCount: 2,
    occasion: "",
    allergies: "",
    notes: "",
    seatedTableId: undefined,
  });

  const selectedTable = tables.find((t) => t.id === selectedId) ?? null;

  const unseatedReservations = useMemo(
    () => reservations.filter((r) => !r.seatedTableId),
    [reservations]
  );

  const availableTables = useMemo(
    () =>
      tables
        .slice()
        .sort((a, b) => a.tableNumber.localeCompare(b.tableNumber)),
    [tables]
  );

  const filteredGuests = useMemo(() => {
    const q = guestSearch.trim().toLowerCase();
    if (!q) return guests;
    return guests.filter((g) => g.name.toLowerCase().includes(q));
  }, [guests, guestSearch]);

  const updateSelected = (patch: Partial<ServiceTable>) => {
    if (!selectedTable) return;
    setTables((prev) =>
      prev.map((t) =>
        t.id === selectedTable.id
          ? {
              ...t,
              ...patch,
              addOns: patch.addOns ?? t.addOns,
              courses: patch.courses ?? t.courses,
            }
          : t
      )
    );
  };

  const toggleAddOn = (field: keyof AddOns) => {
    if (!selectedTable) return;
    setTables((prev) =>
      prev.map((t) =>
        t.id === selectedTable.id
          ? {
              ...t,
              addOns: {
                ...t.addOns,
                [field]: typeof t.addOns[field] === "boolean" ? !t.addOns[field] : t.addOns[field],
              } as AddOns,
            }
          : t
      )
    );
  };

  const setAddOnText = (field: "btgNotes" | "bottleNotes", value: string) => {
    if (!selectedTable) return;
    updateSelected({
      addOns: { ...selectedTable.addOns, [field]: value },
    });
  };

  const addTable = () => {
    const num = newTableNumber.trim();
    if (!num) return;

    const nextId = Math.max(0, ...tables.map((t) => t.id)) + 1;

    const newT: ServiceTable = {
      id: nextId,
      tableNumber: num,
      diningArea: newTableArea,
      time: "",
      roomNumber: "",
      guestName: "",
      guestsCount: 2,
      occasion: "",
      allergies: "",
      substitutions: "",
      notes: "",
      protein: "n/a",
      drinks: "",
      addOns: {
        sparklingWater: false,
        cheeseCourse: false,
        dessertWine: false,
        btgNotes: "",
        bottleNotes: "",
      },
      courses: emptyCourses(),
    };

    setTables((prev) => [...prev, newT]);
    setNewTableNumber("");
    setSelectedId(newT.id);
  };

  const addGuestToDatabase = (name: string) => {
    const n = name.trim();
    if (!n) return;
    const exists = guests.some((g) => g.name.toLowerCase() === n.toLowerCase());
    if (exists) return;

    setGuests((prev) => [
      { id: `g_${Date.now()}`, name: n, defaultAllergies: "", notes: "" },
      ...prev,
    ]);
  };

  const addReservation = () => {
    const name = resForm.guestName.trim();
    if (!name) return;

    // Add to guest database automatically if new
    addGuestToDatabase(name);

    const newRes: Reservation = {
      ...resForm,
      id: `r_${Date.now()}`,
      guestName: name,
      roomNumber: resForm.roomNumber?.trim() || "",
      occasion: resForm.occasion?.trim() || "",
      allergies: resForm.allergies?.trim() || "",
      notes: resForm.notes?.trim() || "",
    };

    setReservations((prev) => [newRes, ...prev]);

    // keep name for rapid entry, clear the rest lightly
    setResForm((p) => ({
      ...p,
      guestsCount: 2,
      roomNumber: "",
      occasion: "",
      allergies: "",
      notes: "",
      seatedTableId: undefined,
    }));
  };

  const seatReservationToTable = (reservationId: string, tableId: number) => {
    const res = reservations.find((r) => r.id === reservationId);
    const table = tables.find((t) => t.id === tableId);
    if (!res || !table) return;

    // Update table with reservation info
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? {
              ...t,
              diningArea: res.diningArea,
              time: res.time,
              roomNumber: res.roomNumber || t.roomNumber,
              guestName: res.guestName,
              guestsCount: res.guestsCount,
              occasion: res.occasion,
              allergies: res.allergies,
              notes: res.notes,
            }
          : t
      )
    );

    // Mark reservation seated
    setReservations((prev) =>
      prev.map((r) => (r.id === reservationId ? { ...r, seatedTableId: tableId } : r))
    );

    setSelectedId(tableId);
  };

  const unseatTable = (tableId: number) => {
    // Find reservation seated here, if any
    const res = reservations.find((r) => r.seatedTableId === tableId);
    if (res) {
      setReservations((prev) =>
        prev.map((r) => (r.id === res.id ? { ...r, seatedTableId: undefined } : r))
      );
    }

    // Clear table details (keep table number/area)
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? {
              ...t,
              time: "",
              roomNumber: "",
              guestName: "",
              guestsCount: 2,
              occasion: "",
              allergies: "",
              substitutions: "",
              notes: "",
              drinks: "",
              protein: "n/a",
              addOns: {
                sparklingWater: false,
                cheeseCourse: false,
                dessertWine: false,
                btgNotes: "",
                bottleNotes: "",
              },
              courses: emptyCourses(),
            }
          : t
      )
    );
  };

  const cycleCourse = (course: CourseKey) => {
    if (!selectedTable) return;

    const current = selectedTable.courses[course] ?? {};
    const now = nowTimeLabel();

    let next: CourseStatus;
    if (!current.servedAt) {
      next = { servedAt: now };
    } else if (!current.clearedAt) {
      next = { ...current, clearedAt: now };
    } else {
      next = {};
    }

    updateSelected({
      courses: {
        ...selectedTable.courses,
        [course]: next,
      },
    });
  };

  const resetAllCourses = () => {
    if (!selectedTable) return;
    updateSelected({ courses: emptyCourses() });
  };

  const courseChip = (course: CourseKey) => {
    if (!selectedTable) return null;
    const st = selectedTable.courses[course];
    if (!st?.servedAt) return { label: "—", cls: "bg-white text-[#7B5A45] border border-[#E8D4B8]" };
    if (st.servedAt && !st.clearedAt)
      return { label: `Served ${st.servedAt}`, cls: "bg-[#FFF8E3] text-[#8B5A12] border border-[#F0E0CF]" };
    return { label: `Cleared ${st.clearedAt}`, cls: "bg-[#EAF7ED] text-[#1F6B3A] border border-[#CFE7D6]" };
  };

  return (
    <MainLayout title="Dinner Service" subtitle="Pre-dinner list, tables, add-ons, and service tracking">
      <div className="grid gap-6 lg:grid-cols-12">
        {/* LEFT: Pre-dinner list + guest database */}
        <section className="lg:col-span-4 space-y-6">
          {/* Pre-Dinner List */}
          <div className="rounded-2xl bg-white/90 border shadow-sm overflow-hidden" style={{ borderColor: BRAND_BORDER }}>
            <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: BRAND_BORDER }}>
              <div>
                <h2
                  className="text-sm font-semibold"
                  style={{ color: BRAND_PRIMARY, fontFamily: "Playfair Display, Georgia, serif" }}
                >
                  Pre-Dinner List
                </h2>
                <p className="text-[11px] mt-0.5" style={{ color: BRAND_MUTED }}>
                  Unseated guests for tonight • assign to a table fast
                </p>
              </div>
              <span className="text-[11px]" style={{ color: BRAND_MUTED }}>
                {unseatedReservations.length} unseated
              </span>
            </div>

            {/* Add reservation */}
            <div className="p-4 border-b" style={{ borderColor: BRAND_DIVIDER }}>
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-12">
                  <label className="block text-[11px] font-semibold mb-1" style={{ color: BRAND_MUTED }}>
                    Guest name
                  </label>
                  <input
                    value={resForm.guestName}
                    onChange={(e) => setResForm((p) => ({ ...p, guestName: e.target.value }))}
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                    style={{ borderColor: "#E0C6AF", background: BRAND_SOFT, color: BRAND_TEXT }}
                    placeholder="Last name or party name"
                  />
                </div>

                <div className="col-span-6">
                  <label className="block text-[11px] font-semibold mb-1" style={{ color: BRAND_MUTED }}>
                    Time
                  </label>
                  <input
                    value={resForm.time}
                    onChange={(e) => setResForm((p) => ({ ...p, time: e.target.value }))}
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                    style={{ borderColor: "#E0C6AF", background: BRAND_SOFT, color: BRAND_TEXT }}
                    placeholder="6:30 PM"
                  />
                </div>

                <div className="col-span-6">
                  <label className="block text-[11px] font-semibold mb-1" style={{ color: BRAND_MUTED }}>
                    Area
                  </label>
                  <select
                    value={resForm.diningArea}
                    onChange={(e) => setResForm((p) => ({ ...p, diningArea: e.target.value as DiningArea }))}
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                    style={{ borderColor: "#E0C6AF", background: BRAND_SOFT, color: BRAND_TEXT }}
                  >
                    <option value="Dining Room">Dining Room</option>
                    <option value="In-Room">In-Room</option>
                  </select>
                </div>

                <div className="col-span-6">
                  <label className="block text-[11px] font-semibold mb-1" style={{ color: BRAND_MUTED }}>
                    Party size
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={resForm.guestsCount}
                    onChange={(e) => setResForm((p) => ({ ...p, guestsCount: Number(e.target.value || 1) }))}
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                    style={{ borderColor: "#E0C6AF", background: BRAND_SOFT, color: BRAND_TEXT }}
                  />
                </div>

                <div className="col-span-6">
                  <label className="block text-[11px] font-semibold mb-1" style={{ color: BRAND_MUTED }}>
                    Room / cabin
                  </label>
                  <input
                    value={resForm.roomNumber ?? ""}
                    onChange={(e) => setResForm((p) => ({ ...p, roomNumber: e.target.value }))}
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                    style={{ borderColor: "#E0C6AF", background: BRAND_SOFT, color: BRAND_TEXT }}
                    placeholder="Cabin 3 / Suite 1"
                  />
                </div>

                <div className="col-span-12">
                  <label className="block text-[11px] font-semibold mb-1" style={{ color: BRAND_MUTED }}>
                    Allergies / occasion / notes (quick)
                  </label>
                  <div className="grid grid-cols-12 gap-2">
                    <input
                      value={resForm.allergies}
                      onChange={(e) => setResForm((p) => ({ ...p, allergies: e.target.value }))}
                      className="col-span-6 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                      style={{ borderColor: "#E0C6AF", background: BRAND_SOFT, color: BRAND_TEXT }}
                      placeholder="Allergies"
                    />
                    <input
                      value={resForm.occasion}
                      onChange={(e) => setResForm((p) => ({ ...p, occasion: e.target.value }))}
                      className="col-span-6 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                      style={{ borderColor: "#E0C6AF", background: BRAND_SOFT, color: BRAND_TEXT }}
                      placeholder="Occasion"
                    />
                    <input
                      value={resForm.notes}
                      onChange={(e) => setResForm((p) => ({ ...p, notes: e.target.value }))}
                      className="col-span-12 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                      style={{ borderColor: "#E0C6AF", background: BRAND_SOFT, color: BRAND_TEXT }}
                      placeholder="Notes (pairing prefs, pacing, etc.)"
                    />
                  </div>
                </div>

                <div className="col-span-12 flex items-center justify-end gap-2 mt-1">
                  <button
                    onClick={addReservation}
                    className="px-3 py-2 rounded-lg text-sm font-semibold border"
                    style={{
                      background: BRAND_PRIMARY,
                      color: "#FDF7EE",
                      borderColor: BRAND_PRIMARY,
                    }}
                  >
                    Add to tonight
                  </button>
                </div>
              </div>
            </div>

            {/* Reservation list */}
            <div className="p-3">
              <div className="space-y-2">
                {unseatedReservations.length === 0 ? (
                  <div className="text-sm p-3 rounded-lg border" style={{ borderColor: BRAND_DIVIDER, color: BRAND_MUTED }}>
                    Everyone is seated (or no guests added yet).
                  </div>
                ) : (
                  unseatedReservations.map((r) => (
                    <ReservationRow
                      key={r.id}
                      r={r}
                      tables={availableTables}
                      onSeat={(tableId) => seatReservationToTable(r.id, tableId)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Guest database */}
          <div className="rounded-2xl bg-white/90 border shadow-sm overflow-hidden" style={{ borderColor: BRAND_BORDER }}>
            <div className="px-4 py-3 border-b" style={{ borderColor: BRAND_BORDER }}>
              <h3
                className="text-sm font-semibold"
                style={{ color: BRAND_PRIMARY, fontFamily: "Playfair Display, Georgia, serif" }}
              >
                Guest Database
              </h3>
              <p className="text-[11px] mt-0.5" style={{ color: BRAND_MUTED }}>
                Search and click to prefill “Add to tonight”
              </p>
            </div>

            <div className="p-4 border-b" style={{ borderColor: BRAND_DIVIDER }}>
              <input
                value={guestSearch}
                onChange={(e) => setGuestSearch(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: "#E0C6AF", background: BRAND_SOFT, color: BRAND_TEXT }}
                placeholder="Search guests…"
              />
            </div>

            <div className="max-h-[320px] overflow-auto divide-y" style={{ borderColor: BRAND_DIVIDER }}>
              {filteredGuests.map((g) => (
                <button
                  key={g.id}
                  onClick={() =>
                    setResForm((p) => ({
                      ...p,
                      guestName: g.name,
                      allergies: g.defaultAllergies ?? p.allergies,
                      notes: g.notes ?? p.notes,
                    }))
                  }
                  className="w-full text-left px-4 py-3 hover:bg-[#FDF8F2] transition"
                >
                  <div className="text-sm font-semibold" style={{ color: BRAND_TEXT }}>
                    {g.name}
                  </div>
                  <div className="text-[11px]" style={{ color: BRAND_MUTED }}>
                    {g.defaultAllergies ? `Allergies: ${g.defaultAllergies}` : "No allergies on file"}
                    {g.notes ? ` • ${g.notes}` : ""}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* MIDDLE: Tables list + Add Table */}
        <aside className="lg:col-span-4 rounded-2xl bg-white/90 border shadow-sm overflow-hidden" style={{ borderColor: BRAND_BORDER }}>
          <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: BRAND_BORDER }}>
            <div>
              <h2
                className="text-sm font-semibold"
                style={{ color: BRAND_PRIMARY, fontFamily: "Playfair Display, Georgia, serif" }}
              >
                Tables
              </h2>
              <p className="text-[11px] mt-0.5" style={{ color: BRAND_MUTED }}>
                Tap a table to open service panel
              </p>
            </div>
            <span className="text-[11px]" style={{ color: BRAND_MUTED }}>
              {tables.length} total
            </span>
          </div>

          {/* Add table */}
          <div className="p-4 border-b" style={{ borderColor: BRAND_DIVIDER }}>
            <div className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-5">
                <label className="block text-[11px] font-semibold mb-1" style={{ color: BRAND_MUTED }}>
                  Table #
                </label>
                <input
                  value={newTableNumber}
                  onChange={(e) => setNewTableNumber(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  style={{ borderColor: "#E0C6AF", background: BRAND_SOFT, color: BRAND_TEXT }}
                  placeholder="T4 / V3"
                />
              </div>
              <div className="col-span-5">
                <label className="block text-[11px] font-semibold mb-1" style={{ color: BRAND_MUTED }}>
                  Area
                </label>
                <select
                  value={newTableArea}
                  onChange={(e) => setNewTableArea(e.target.value as DiningArea)}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  style={{ borderColor: "#E0C6AF", background: BRAND_SOFT, color: BRAND_TEXT }}
                >
                  <option value="Dining Room">Dining Room</option>
                  <option value="In-Room">In-Room</option>
                </select>
              </div>
              <div className="col-span-2">
                <button
                  onClick={addTable}
                  className="w-full px-3 py-2 rounded-lg text-sm font-semibold border"
                  style={{ background: BRAND_PRIMARY, color: "#FDF7EE", borderColor: BRAND_PRIMARY }}
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Tables list */}
          <div className="divide-y" style={{ borderColor: BRAND_DIVIDER }}>
            {tables.map((table) => {
              const isActive = table.id === selectedId;
              const hasAllergy = !!table.allergies.trim();
              const hasAddOn =
                table.addOns.cheeseCourse ||
                table.addOns.sparklingWater ||
                table.addOns.dessertWine ||
                !!table.addOns.btgNotes.trim() ||
                !!table.addOns.bottleNotes.trim();

              const seated = !!table.guestName.trim();

              return (
                <button
                  key={table.id}
                  onClick={() => setSelectedId(table.id)}
                  className={[
                    "w-full text-left px-4 py-3 transition flex flex-col gap-1",
                    isActive ? "bg-[#6B1F2F] text-[#FDF7EE]" : "hover:bg-[#FDF8F2] text-[#3B2620]",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold">{table.tableNumber}</div>
                      <div className={isActive ? "text-[11px] opacity-90" : "text-[11px] text-[#7B5A45]"}>
                        {table.diningArea}
                        {table.time ? ` • ${table.time}` : ""}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[11px] font-medium truncate max-w-[140px]">
                        {seated ? table.guestName : "—"}
                      </div>
                      <div className="flex flex-wrap gap-1 justify-end mt-1">
                        {hasAllergy && (
                          <span
                            className={[
                              "text-[10px] px-2 py-0.5 rounded-full",
                              isActive ? "bg-[#FDE4E2] text-[#8E2525]" : "bg-[#FDEBE8] text-[#8E2525]",
                            ].join(" ")}
                          >
                            Allergy
                          </span>
                        )}
                        {hasAddOn && (
                          <span
                            className={[
                              "text-[10px] px-2 py-0.5 rounded-full",
                              isActive ? "bg-[#FFF4D6] text-[#8B5A12]" : "bg-[#FFF8E3] text-[#8B5A12]",
                            ].join(" ")}
                          >
                            Add-ons
                          </span>
                        )}
                        {!seated && (
                          <span
                            className={[
                              "text-[10px] px-2 py-0.5 rounded-full",
                              isActive ? "bg-white/20 text-white" : "bg-[#EEF2FF] text-[#3B4BA3]",
                            ].join(" ")}
                          >
                            Open
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={isActive ? "text-[11px] opacity-90" : "text-[11px] text-[#7B5A45]"}>
                    {table.roomNumber ? `${table.roomNumber} • ` : ""}
                    {table.guestsCount} {table.guestsCount === 1 ? "guest" : "guests"}
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* RIGHT: Selected table detail + add-ons + tracker */}
        <section className="lg:col-span-4 rounded-2xl bg-white/90 border shadow-sm p-5" style={{ borderColor: BRAND_BORDER }}>
          {selectedTable ? (
            <>
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3 mb-4" style={{ borderColor: BRAND_DIVIDER }}>
                <div>
                  <h2
                    className="text-lg font-semibold"
                    style={{ color: BRAND_PRIMARY, fontFamily: "Playfair Display, Georgia, serif" }}
                  >
                    {selectedTable.tableNumber}
                  </h2>
                  <p className="text-xs mt-0.5" style={{ color: BRAND_MUTED }}>
                    {selectedTable.diningArea}
                    {selectedTable.time ? ` • ${selectedTable.time}` : ""}
                    {selectedTable.roomNumber ? ` • ${selectedTable.roomNumber}` : ""}
                  </p>
                </div>

                <button
                  onClick={() => unseatTable(selectedTable.id)}
                  className="px-3 py-2 rounded-lg text-xs font-semibold border"
                  style={{
                    background: "#FFF",
                    color: BRAND_PRIMARY,
                    borderColor: BRAND_BORDER,
                  }}
                  title="Clear this table (unseat/reset)"
                >
                  Clear table
                </button>
              </div>

              {/* Seating basics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: BRAND_MUTED }}>
                    Guest / party name
                  </label>
                  <input
                    type="text"
                    value={selectedTable.guestName}
                    onChange={(e) => updateSelected({ guestName: e.target.value })}
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                    style={{ borderColor: "#E0C6AF", background: BRAND_SOFT, color: BRAND_TEXT }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: BRAND_MUTED }}>
                    Party size
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={selectedTable.guestsCount}
                    onChange={(e) => updateSelected({ guestsCount: Number(e.target.value || 1) })}
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                    style={{ borderColor: "#E0C6AF", background: BRAND_SOFT, color: BRAND_TEXT }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: BRAND_MUTED }}>
                    Time
                  </label>
                  <input
                    type="text"
                    value={selectedTable.time}
                    onChange={(e) => updateSelected({ time: e.target.value })}
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                    style={{ borderColor: "#E0C6AF", background: BRAND_SOFT, color: BRAND_TEXT }}
                    placeholder="6:30 PM"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: BRAND_MUTED }}>
                    Room / cabin
                  </label>
                  <input
                    type="text"
                    value={selectedTable.roomNumber ?? ""}
                    onChange={(e) => updateSelected({ roomNumber: e.target.value })}
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                    style={{ borderColor: "#E0C6AF", background: BRAND_SOFT, color: BRAND_TEXT }}
                    placeholder="Cabin 3 / Suite 1"
                  />
                </div>
              </div>

              {/* Allergies / occasion / notes */}
              <div className="grid grid-cols-1 gap-4 mb-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: BRAND_MUTED }}>
                      Allergies / restrictions
                    </label>
                    <textarea
                      value={selectedTable.allergies}
                      onChange={(e) => updateSelected({ allergies: e.target.value })}
                      rows={2}
                      className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                      style={{ borderColor: "#E0C6AF", background: BRAND_SOFT, color: BRAND_TEXT }}
                      placeholder="No nuts, gluten-free, no garlic…"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: BRAND_MUTED }}>
                      Occasion
                    </label>
                    <textarea
                      value={selectedTable.occasion}
                      onChange={(e) => updateSelected({ occasion: e.target.value })}
                      rows={2}
                      className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                      style={{ borderColor: "#E0C6AF", background: BRAND_SOFT, color: BRAND_TEXT }}
                      placeholder="Anniversary / Birthday / VIP…"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: BRAND_MUTED }}>
                    Notes
                  </label>
                  <textarea
                    value={selectedTable.notes}
                    onChange={(e) => updateSelected({ notes: e.target.value })}
                    rows={2}
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                    style={{ borderColor: "#E0C6AF", background: BRAND_SOFT, color: BRAND_TEXT }}
                    placeholder="Pacing, pairing prefs, guest requests…"
                  />
                </div>
              </div>

              {/* Add-ons / wine */}
              <div className="rounded-xl border p-4 mb-5" style={{ borderColor: BRAND_DIVIDER, background: "#FFF" }}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-semibold" style={{ color: BRAND_PRIMARY }}>
                      Add-ons / Wine
                    </h3>
                    <p className="text-[11px]" style={{ color: BRAND_MUTED }}>
                      Mirrors your “cheat sheet” for water, cheese, wine, etc.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm" style={{ color: BRAND_TEXT }}>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedTable.addOns.sparklingWater}
                      onChange={() => toggleAddOn("sparklingWater")}
                    />
                    Sparkling water
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedTable.addOns.cheeseCourse}
                      onChange={() => toggleAddOn("cheeseCourse")}
                    />
                    Cheese course
                  </label>

                  <label className="flex items-center gap-2 md:col-span-2">
                    <input
                      type="checkbox"
                      checked={selectedTable.addOns.dessertWine}
                      onChange={() => toggleAddOn("dessertWine")}
                    />
                    Dessert wine
                  </label>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold mb-1" style={{ color: BRAND_MUTED }}>
                      Wine by the glass (notes)
                    </label>
                    <input
                      value={selectedTable.addOns.btgNotes}
                      onChange={(e) => setAddOnText("btgNotes", e.target.value)}
                      className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                      style={{ borderColor: "#E0C6AF", background: BRAND_SOFT, color: BRAND_TEXT }}
                      placeholder="2x Pinot Noir BTG, 1x Champagne…"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold mb-1" style={{ color: BRAND_MUTED }}>
                      Bottles (notes)
                    </label>
                    <input
                      value={selectedTable.addOns.bottleNotes}
                      onChange={(e) => setAddOnText("bottleNotes", e.target.value)}
                      className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                      style={{ borderColor: "#E0C6AF", background: BRAND_SOFT, color: BRAND_TEXT }}
                      placeholder="Substance 111, Sonoma-Cutrer…"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold mb-1" style={{ color: BRAND_MUTED }}>
                      General drinks notes
                    </label>
                    <textarea
                      value={selectedTable.drinks}
                      onChange={(e) => updateSelected({ drinks: e.target.value })}
                      rows={2}
                      className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                      style={{ borderColor: "#E0C6AF", background: BRAND_SOFT, color: BRAND_TEXT }}
                      placeholder="Cocktails, aperitif, amaro, etc."
                    />
                  </div>
                </div>
              </div>

              {/* Service tracker */}
              <div className="rounded-xl border p-4" style={{ borderColor: BRAND_DIVIDER, background: "#FFF" }}>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-sm font-semibold" style={{ color: BRAND_PRIMARY }}>
                      Service Tracker
                    </h3>
                    <p className="text-[11px]" style={{ color: BRAND_MUTED }}>
                      Tap a course: blank → Served → Cleared (mirrors your “X then cross out”)
                    </p>
                  </div>

                  <button
                    onClick={resetAllCourses}
                    className="px-3 py-2 rounded-lg text-xs font-semibold border"
                    style={{ background: "#FFF", color: BRAND_PRIMARY, borderColor: BRAND_BORDER }}
                  >
                    Reset
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {COURSE_LABELS.map(({ key, label }) => {
                    const chip = courseChip(key)!;
                    return (
                      <button
                        key={key}
                        onClick={() => cycleCourse(key)}
                        className="rounded-xl p-3 text-left transition hover:shadow-sm"
                        style={{ background: "#fff" }}
                      >
                        <div className="text-xs font-semibold" style={{ color: BRAND_TEXT }}>
                          {label}
                        </div>
                        <div className={`mt-2 inline-flex items-center px-2 py-1 rounded-full text-[11px] ${chip.cls}`}>
                          {chip.label}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Optional: kitchen notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: BRAND_MUTED }}>
                      Protein doneness
                    </label>
                    <select
                      value={selectedTable.protein}
                      onChange={(e) => updateSelected({ protein: e.target.value as ProteinDoneness })}
                      className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                      style={{ borderColor: "#E0C6AF", background: BRAND_SOFT, color: BRAND_TEXT }}
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
                    <label className="block text-xs font-semibold mb-1" style={{ color: BRAND_MUTED }}>
                      Substitutions
                    </label>
                    <textarea
                      value={selectedTable.substitutions}
                      onChange={(e) => updateSelected({ substitutions: e.target.value })}
                      rows={2}
                      className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                      style={{ borderColor: "#E0C6AF", background: BRAND_SOFT, color: BRAND_TEXT }}
                      placeholder="No onion, swap sauce, etc."
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm" style={{ color: BRAND_MUTED }}>
              Select a table to view/edit details.
            </p>
          )}
        </section>
      </div>
    </MainLayout>
  );
}

function ReservationRow({
  r,
  tables,
  onSeat,
}: {
  r: Reservation;
  tables: ServiceTable[];
  onSeat: (tableId: number) => void;
}) {
  const [selectedTableId, setSelectedTableId] = useState<number>(
    tables[0]?.id ?? 0
  );

  const allergyTag = r.allergies?.trim();
  const occasionTag = r.occasion?.trim();

  return (
    <div className="rounded-xl border p-3" style={{ borderColor: "#F0E0CF", background: "#fff" }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-[#3B2620]">{r.time}</span>
            <span className="text-xs text-[#7B5A45]">•</span>
            <span className="text-xs font-semibold text-[#3B2620]">{r.guestName}</span>
            <span className="text-xs text-[#7B5A45]">
              • {r.guestsCount} {r.guestsCount === 1 ? "guest" : "guests"}
            </span>
          </div>

          <div className="text-[11px] text-[#7B5A45] mt-0.5">
            {r.diningArea}
            {r.roomNumber ? ` • ${r.roomNumber}` : ""}
          </div>

          <div className="flex flex-wrap gap-1 mt-2">
            {allergyTag ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FDEBE8] text-[#8E2525]">
                Allergy
              </span>
            ) : null}
            {occasionTag ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EEF2FF] text-[#3B4BA3]">
                {r.occasion}
              </span>
            ) : null}
            {r.notes?.trim() ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFF8E3] text-[#8B5A12]">
                Notes
              </span>
            ) : null}
          </div>

          {(r.allergies?.trim() || r.notes?.trim()) && (
            <div className="text-[11px] text-[#3B2620] mt-2">
              {r.allergies?.trim() ? `Allergies: ${r.allergies.trim()}` : ""}
              {r.allergies?.trim() && r.notes?.trim() ? " • " : ""}
              {r.notes?.trim() ? r.notes.trim() : ""}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 w-[140px] shrink-0">
          <select
            value={selectedTableId}
            onChange={(e) => setSelectedTableId(Number(e.target.value))}
            className="w-full rounded-lg border px-2 py-2 text-xs focus:outline-none focus:ring-2"
            style={{ borderColor: "#E0C6AF", background: "#FDF8F2", color: "#3B2620" }}
          >
            {tables.map((t) => (
              <option key={t.id} value={t.id}>
                {t.tableNumber}
              </option>
            ))}
          </select>

          <button
            onClick={() => onSeat(selectedTableId)}
            className="w-full px-3 py-2 rounded-lg text-xs font-semibold border"
            style={{ background: "#6B1F2F", color: "#FDF7EE", borderColor: "#6B1F2F" }}
          >
            Seat
          </button>
        </div>
      </div>
    </div>
  );
}
