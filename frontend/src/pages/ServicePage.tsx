// src/pages/ServicePage.tsx
import { useMemo, useState } from "react";
import MainLayout from "@/layouts/MainLayout";

type ServiceTab = "pre" | "dinner";

type StepKey =
  | "seated"
  | "bread_water"
  | "wine"
  | "starter"
  | "entree"
  | "dessert"
  | "canoe"
  | "cheese";

type StepStatus = "todo" | "active" | "done";

type CourseKey = "starter" | "entree" | "dessert";

type ProteinDoneness =
  | "rare"
  | "medium-rare"
  | "medium"
  | "medium-well"
  | "well"
  | "n/a";

interface Step {
  key: StepKey;
  label: string;
  status: StepStatus;
  // When this step was marked done (optional)
  doneAt?: number;
}

interface ExpoTiming {
  calledAt?: number;
  readyAt?: number;
  outAt?: number;
}

interface ServiceTable {
  id: number;
  tableNumber: string;
  roomNumber?: string;
  guestName: string;
  guestsCount: number;
  seatTime?: string; // e.g. "6:30"
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

  // New service UX state
  steps: Step[];
  expo: Record<CourseKey, ExpoTiming>;
  // for quick “undo”
  history: StepKey[]; // sequence of completed steps
}

interface Guest {
  id: number;
  lastName: string;
  firstName?: string;
  roomNumber?: string;
  notes?: string;
  allergies?: string;
}

interface PreDinnerItem {
  id: number;
  lastName: string;
  roomNumber?: string;
  partySize: number;
  seatTime: string;
  notes?: string;
  allergies?: string;
  // seating state
  seated: boolean;
  assignedTableId?: number;
}

const BRAND = {
  maroon: "#6B1F2F",
  maroonDark: "#4A1520",
  tan: "#D4AF88",
  tanLight: "#E8D4B8",
  cream: "#FDF8F2",
  ink: "#3B2620",
  muted: "#7B5A45",
};

const baseStepTemplate: Array<{ key: StepKey; label: string }> = [
  { key: "seated", label: "Seated" },
  { key: "bread_water", label: "Bread + Water" },
  { key: "wine", label: "Wine" },
  { key: "starter", label: "Starter" },
  { key: "entree", label: "Entrée" },
  { key: "dessert", label: "Dessert" },
  { key: "canoe", label: "Canoe" },
];

// --- helpers ---
function nowMs() {
  return Date.now();
}
function fmtTime(ms?: number) {
  if (!ms) return "—";
  const d = new Date(ms);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
function dur(msStart?: number, msEnd?: number) {
  if (!msStart || !msEnd) return "—";
  const diff = Math.max(0, msEnd - msStart);
  const mins = Math.floor(diff / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

function buildSteps(cheeseEnabled: boolean, insertAfter?: StepKey): Step[] {
  const base: Step[] = baseStepTemplate.map((s, idx) => ({
    key: s.key,
    label: s.label,
    status: idx === 0 ? "active" : "todo",
  }));

  if (!cheeseEnabled) return base;

  // insert default after wine unless specified
  const afterKey = insertAfter ?? "wine";
  const insertIdx = Math.min(
    base.length,
    Math.max(0, base.findIndex((x) => x.key === afterKey) + 1)
  );

  const cheeseStep: Step = {
    key: "cheese",
    label: "Cheese",
    status: "todo",
  };

  const next = [...base.slice(0, insertIdx), cheeseStep, ...base.slice(insertIdx)];
  return next;
}

function getActiveIndex(steps: Step[]) {
  const idx = steps.findIndex((s) => s.status === "active");
  // If none active (edge case), pick first todo
  if (idx === -1) return steps.findIndex((s) => s.status === "todo");
  return idx;
}

function stepColorClass(step: Step) {
  // Color-coded by step type + state
  // We keep it simple with Tailwind utility classes
  const base = "px-2 py-1 rounded-full text-[11px] font-medium border";
  if (step.status === "done") return `${base} bg-emerald-50 border-emerald-200 text-emerald-800`;
  if (step.status === "active") {
    if (step.key === "entree") return `${base} bg-amber-50 border-amber-200 text-amber-900`;
    if (step.key === "starter") return `${base} bg-sky-50 border-sky-200 text-sky-900`;
    if (step.key === "dessert") return `${base} bg-violet-50 border-violet-200 text-violet-900`;
    if (step.key === "wine") return `${base} bg-rose-50 border-rose-200 text-rose-900`;
    if (step.key === "cheese") return `${base} bg-yellow-50 border-yellow-200 text-yellow-900`;
    return `${base} bg-slate-50 border-slate-200 text-slate-900`;
  }
  return `${base} bg-white border-slate-200 text-slate-500`;
}

// --- initial data ---
const initialTables: ServiceTable[] = [
  {
    id: 1,
    tableNumber: "T1",
    roomNumber: "Cabin 3",
    guestName: "Smith",
    guestsCount: 2,
    seatTime: "6:30",
    notes: "",
    drinks: "",
    addOns: { cheeseBoard: false, sparklingWater: false, dessertWine: false },
    allergies: "",
    substitutions: "",
    protein: "medium-rare",
    steps: buildSteps(false),
    expo: { starter: {}, entree: {}, dessert: {} },
    history: [],
  },
  {
    id: 2,
    tableNumber: "T2",
    roomNumber: "Cabin 7",
    guestName: "Johnson",
    guestsCount: 4,
    seatTime: "6:45",
    notes: "Anniversary",
    drinks: "",
    addOns: { cheeseBoard: true, sparklingWater: false, dessertWine: false },
    allergies: "No nuts",
    substitutions: "",
    protein: "medium",
    steps: buildSteps(true),
    expo: { starter: {}, entree: {}, dessert: {} },
    history: [],
  },
  {
    id: 3,
    tableNumber: "T3",
    roomNumber: "Suite 1",
    guestName: "Taylor",
    guestsCount: 2,
    seatTime: "7:00",
    notes: "",
    drinks: "",
    addOns: { cheeseBoard: false, sparklingWater: true, dessertWine: false },
    allergies: "",
    substitutions: "No onion in sauce",
    protein: "medium-rare",
    steps: buildSteps(false),
    expo: { starter: {}, entree: {}, dessert: {} },
    history: [],
  },
];

const initialPreDinner: PreDinnerItem[] = [
  { id: 101, lastName: "Barnes", roomNumber: "Cabin 3", partySize: 2, seatTime: "6:30", notes: "Anniversary; enjoys Burgundy", seated: false },
  { id: 102, lastName: "Fynn", roomNumber: "Cabin 7", partySize: 4, seatTime: "6:30", notes: "One guest gluten-free", seated: false },
  { id: 103, lastName: "Paris", roomNumber: "V8", partySize: 2, seatTime: "6:45", notes: "No mushrooms", seated: false },
  { id: 104, lastName: "Reynolds", roomNumber: "V3", partySize: 2, seatTime: "7:00", notes: "", seated: false },
];

const initialGuests: Guest[] = [
  { id: 1, lastName: "Barnes", firstName: "Gary", roomNumber: "Cabin 3", notes: "Anniversary; Burgundy", allergies: "" },
  { id: 2, lastName: "Fynn", firstName: "Conway", roomNumber: "Cabin 7", notes: "GF", allergies: "gluten" },
  { id: 3, lastName: "Paris", firstName: "", roomNumber: "V8", notes: "No mush", allergies: "" },
];

export default function ServicePage() {
  const [tab, setTab] = useState<ServiceTab>("dinner");

  const [tables, setTables] = useState<ServiceTable[]>(() => {
    // Ensure tables with cheese add-on get steps built with cheese
    return initialTables.map((t) => ({
      ...t,
      steps: buildSteps(t.addOns.cheeseBoard),
    }));
  });

  const [selectedId, setSelectedId] = useState<number | null>(initialTables[0]?.id ?? null);
  const selectedTable = tables.find((t) => t.id === selectedId) ?? null;

  const [preDinner, setPreDinner] = useState<PreDinnerItem[]>(initialPreDinner);
  const [guests, setGuests] = useState<Guest[]>(initialGuests);

  // Guest DB UI state
  const [guestSearch, setGuestSearch] = useState("");
  const [newGuestLast, setNewGuestLast] = useState("");
  const [newGuestFirst, setNewGuestFirst] = useState("");
  const [newGuestRoom, setNewGuestRoom] = useState("");
  const [newGuestNotes, setNewGuestNotes] = useState("");
  const [newGuestAllergies, setNewGuestAllergies] = useState("");

  const filteredGuests = useMemo(() => {
    const q = guestSearch.trim().toLowerCase();
    if (!q) return guests;
    return guests.filter((g) =>
      [g.lastName, g.firstName ?? "", g.roomNumber ?? ""].join(" ").toLowerCase().includes(q)
    );
  }, [guests, guestSearch]);

  // --- table update helpers ---
  const updateTable = (id: number, patch: Partial<ServiceTable>) => {
    setTables((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...patch } : t))
    );
  };

  const updateSelected = (patch: Partial<ServiceTable>) => {
    if (!selectedTable) return;
    updateTable(selectedTable.id, {
      ...patch,
      addOns: patch.addOns ?? selectedTable.addOns,
    });
  };

  const toggleAddOn = (field: keyof ServiceTable["addOns"]) => {
    if (!selectedTable) return;
    const nextAddOns = {
      ...selectedTable.addOns,
      [field]: !selectedTable.addOns[field],
    };

    // If cheese toggled ON/OFF, rebuild steps while preserving progress where possible
    if (field === "cheeseBoard") {
      const cheeseOn = nextAddOns.cheeseBoard;

      const prevSteps = selectedTable.steps;
      const prevDoneKeys = prevSteps.filter((s) => s.status === "done").map((s) => s.key);
      const prevActiveKey = prevSteps.find((s) => s.status === "active")?.key;

      let nextSteps = buildSteps(cheeseOn);
      // Re-apply done statuses
      nextSteps = nextSteps.map((s) => ({
        ...s,
        status: prevDoneKeys.includes(s.key) ? "done" : "todo",
      }));

      // Re-apply active key if it still exists, else set first todo active
      if (prevActiveKey && nextSteps.some((s) => s.key === prevActiveKey)) {
        nextSteps = nextSteps.map((s) => ({
          ...s,
          status: s.key === prevActiveKey ? "active" : s.status === "done" ? "done" : "todo",
        }));
      } else {
        const firstTodo = nextSteps.findIndex((s) => s.status === "todo");
        nextSteps = nextSteps.map((s, i) => ({
          ...s,
          status: s.status === "done" ? "done" : i === (firstTodo === -1 ? 0 : firstTodo) ? "active" : "todo",
        }));
      }

      updateSelected({ addOns: nextAddOns, steps: nextSteps });
      return;
    }

    updateSelected({ addOns: nextAddOns });
  };

  // --- service step actions ---
  const advanceStep = (tableId: number) => {
    setTables((prev) =>
      prev.map((t) => {
        if (t.id !== tableId) return t;

        const steps = [...t.steps];
        const activeIdx = getActiveIndex(steps);
        if (activeIdx === -1) return t;

        const active = steps[activeIdx];
        // mark active done
        steps[activeIdx] = { ...active, status: "done", doneAt: nowMs() };
        const history = [...t.history, active.key];

        // next active
        const nextIdx = steps.findIndex((s) => s.status === "todo");
        if (nextIdx !== -1) {
          steps[nextIdx] = { ...steps[nextIdx], status: "active" };
        }

        return { ...t, steps, history };
      })
    );
  };

  const backStep = (tableId: number) => {
    // Undo last completed step, and make it active again
    setTables((prev) =>
      prev.map((t) => {
        if (t.id !== tableId) return t;
        if (t.history.length === 0) return t;

        const lastDoneKey = t.history[t.history.length - 1];
        const history = t.history.slice(0, -1);

        const steps = t.steps.map((s) => {
          // clear any current active (we'll set new active below)
          if (s.status === "active") return { ...s, status: "todo" };
          return s;
        });

        const idx = steps.findIndex((s) => s.key === lastDoneKey);
        if (idx === -1) return { ...t, history };

        // turn that done step back into active
        steps[idx] = { ...steps[idx], status: "active", doneAt: undefined };

        // Any steps after it that were todo remain todo; steps before stay done as is.
        // Ensure no duplicate actives:
        return { ...t, steps, history };
      })
    );
  };

  const insertCheeseAfter = (tableId: number, after: StepKey) => {
    setTables((prev) =>
      prev.map((t) => {
        if (t.id !== tableId) return t;
        if (!t.addOns.cheeseBoard) return t;

        const prevSteps = t.steps;
        const prevDone = prevSteps.filter((s) => s.status === "done").map((s) => s.key);
        const prevActiveKey = prevSteps.find((s) => s.status === "active")?.key;

        let nextSteps = buildSteps(true, after);

        // restore done statuses (only for keys that still exist)
        nextSteps = nextSteps.map((s) => ({
          ...s,
          status: prevDone.includes(s.key) ? "done" : "todo",
        }));

        // restore active
        if (prevActiveKey && nextSteps.some((s) => s.key === prevActiveKey)) {
          nextSteps = nextSteps.map((s) => ({
            ...s,
            status: s.key === prevActiveKey ? "active" : s.status === "done" ? "done" : "todo",
          }));
        } else {
          const firstTodo = nextSteps.findIndex((s) => s.status === "todo");
          nextSteps = nextSteps.map((s, i) => ({
            ...s,
            status: s.status === "done" ? "done" : i === (firstTodo === -1 ? 0 : firstTodo) ? "active" : "todo",
          }));
        }

        return { ...t, steps: nextSteps };
      })
    );
  };

  // --- Expo timing actions ---
  const setExpoTime = (tableId: number, course: CourseKey, field: keyof ExpoTiming) => {
    const ts = nowMs();
    setTables((prev) =>
      prev.map((t) => {
        if (t.id !== tableId) return t;
        return {
          ...t,
          expo: {
            ...t.expo,
            [course]: {
              ...t.expo[course],
              [field]: ts,
            },
          },
        };
      })
    );
  };

  // --- Pre-dinner actions ---
  const seatPreDinnerItem = (itemId: number, tableId: number) => {
    const table = tables.find((t) => t.id === tableId);
    const item = preDinner.find((p) => p.id === itemId);
    if (!table || !item) return;

    // mark preDinner item seated + assigned
    setPreDinner((prev) =>
      prev.map((p) =>
        p.id === itemId ? { ...p, seated: true, assignedTableId: tableId } : p
      )
    );

    // update table data quickly
    setTables((prev) =>
      prev.map((t) => {
        if (t.id !== tableId) return t;
        return {
          ...t,
          guestName: item.lastName,
          roomNumber: item.roomNumber ?? t.roomNumber,
          guestsCount: item.partySize,
          seatTime: item.seatTime,
          notes: item.notes ?? t.notes,
          allergies: item.allergies ?? t.allergies,
          // also set step active to Seated (fresh start)
          steps: buildSteps(t.addOns.cheeseBoard).map((s, idx) => ({
            ...s,
            status: idx === 0 ? "active" : "todo",
          })),
          history: [],
          expo: { starter: {}, entree: {}, dessert: {} },
        };
      })
    );
  };

  const addGuest = () => {
    const last = newGuestLast.trim();
    if (!last) return;

    setGuests((prev) => [
      {
        id: Math.max(0, ...prev.map((g) => g.id)) + 1,
        lastName: last,
        firstName: newGuestFirst.trim() || undefined,
        roomNumber: newGuestRoom.trim() || undefined,
        notes: newGuestNotes.trim() || undefined,
        allergies: newGuestAllergies.trim() || undefined,
      },
      ...prev,
    ]);

    setNewGuestLast("");
    setNewGuestFirst("");
    setNewGuestRoom("");
    setNewGuestNotes("");
    setNewGuestAllergies("");
  };

  // --- Derived lists for dinner view ---
  const dinnerChecklist = useMemo(() => {
    // show preDinner items for tonight as a compact checklist
    return [...preDinner].sort((a, b) => a.seatTime.localeCompare(b.seatTime));
  }, [preDinner]);

  return (
    <MainLayout title="Dinner Service" subtitle="Pre-dinner planning + live service controls">
      {/* Tabs */}
      <div className="flex items-center gap-2 mb-5">
        <button
          onClick={() => setTab("pre")}
          className={[
            "px-3 py-2 rounded-xl border text-sm font-semibold transition",
            tab === "pre"
              ? "bg-white border-[#E8D4B8] text-[#4A1520]"
              : "bg-transparent border-transparent text-slate-500 hover:bg-white/60",
          ].join(" ")}
        >
          Pre-Dinner
        </button>
        <button
          onClick={() => setTab("dinner")}
          className={[
            "px-3 py-2 rounded-xl border text-sm font-semibold transition",
            tab === "dinner"
              ? "bg-white border-[#E8D4B8] text-[#4A1520]"
              : "bg-transparent border-transparent text-slate-500 hover:bg-white/60",
          ].join(" ")}
        >
          Dinner Service
        </button>
      </div>

      {tab === "pre" ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Pre-dinner list */}
          <section className="rounded-2xl bg-white/90 border border-[#E8D4B8] shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E8D4B8] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#4A1520]" style={{ fontFamily: "Playfair Display, Georgia, serif" }}>
                  Pre-Dinner List
                </h2>
                <p className="text-[11px] text-[#7B5A45] mt-0.5">
                  Quick seat assignments — pick a table and click Seat
                </p>
              </div>
              <span className="text-[11px] text-[#7B5A45]">
                {preDinner.filter((p) => !p.seated).length} pending
              </span>
            </div>

            <div className="divide-y divide-[#F0E0CF]">
              {preDinner
                .slice()
                .sort((a, b) => a.seatTime.localeCompare(b.seatTime))
                .map((p) => (
                  <div key={p.id} className="px-4 py-3 flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-[#3B2620]">
                          {p.lastName}{" "}
                          <span className="text-xs font-medium text-[#7B5A45]">
                            • {p.partySize} {p.partySize === 1 ? "guest" : "guests"}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#7B5A45] mt-0.5">
                          {p.roomNumber ?? "No room #"} • Seat {p.seatTime}
                        </div>
                        {(p.notes || p.allergies) && (
                          <div className="text-[11px] text-[#7B5A45] mt-1">
                            {p.allergies ? `Allergy: ${p.allergies}. ` : ""}
                            {p.notes ?? ""}
                          </div>
                        )}
                      </div>

                      <span
                        className={[
                          "text-[10px] px-2 py-1 rounded-full border",
                          p.seated
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                            : "bg-white border-slate-200 text-slate-600",
                        ].join(" ")}
                      >
                        {p.seated ? "Seated" : "Pending"}
                      </span>
                    </div>

                    {!p.seated && (
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          className="rounded-lg border border-[#E0C6AF] bg-[#FDF8F2] px-3 py-2 text-sm text-[#3B2620] focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                          defaultValue={tables[0]?.id ?? ""}
                          onChange={(e) => seatPreDinnerItem(p.id, Number(e.target.value))}
                        >
                          {tables.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.tableNumber} ({t.roomNumber ?? "—"})
                            </option>
                          ))}
                        </select>

                        <span className="text-[11px] text-[#7B5A45]">
                          Tip: selecting a table auto-seats and fills it.
                        </span>
                      </div>
                    )}

                    {p.seated && p.assignedTableId && (
                      <div className="text-[11px] text-[#7B5A45]">
                        Assigned to{" "}
                        <button
                          className="font-semibold underline"
                          onClick={() => {
                            setSelectedId(p.assignedTableId!);
                            setTab("dinner");
                          }}
                        >
                          {tables.find((t) => t.id === p.assignedTableId)?.tableNumber ?? "Table"}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </section>

          {/* Guest database */}
          <section className="rounded-2xl bg-white/90 border border-[#E8D4B8] shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E8D4B8]">
              <h2 className="text-sm font-semibold text-[#4A1520]" style={{ fontFamily: "Playfair Display, Georgia, serif" }}>
                Guest Database
              </h2>
              <p className="text-[11px] text-[#7B5A45] mt-0.5">
                Search guests + add new guests before service
              </p>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-[#7B5A45]">Search</label>
                <input
                  value={guestSearch}
                  onChange={(e) => setGuestSearch(e.target.value)}
                  placeholder="Search last name, first name, room…"
                  className="w-full rounded-lg border border-[#E0C6AF] bg-[#FDF8F2] px-3 py-2 text-sm text-[#3B2620] focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-[#7B5A45]">Last name *</label>
                  <input
                    value={newGuestLast}
                    onChange={(e) => setNewGuestLast(e.target.value)}
                    className="w-full rounded-lg border border-[#E0C6AF] bg-[#FDF8F2] px-3 py-2 text-sm text-[#3B2620] focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-[#7B5A45]">First name</label>
                  <input
                    value={newGuestFirst}
                    onChange={(e) => setNewGuestFirst(e.target.value)}
                    className="w-full rounded-lg border border-[#E0C6AF] bg-[#FDF8F2] px-3 py-2 text-sm text-[#3B2620] focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-[#7B5A45]">Room / Cabin</label>
                  <input
                    value={newGuestRoom}
                    onChange={(e) => setNewGuestRoom(e.target.value)}
                    className="w-full rounded-lg border border-[#E0C6AF] bg-[#FDF8F2] px-3 py-2 text-sm text-[#3B2620] focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-[#7B5A45]">Allergies</label>
                  <input
                    value={newGuestAllergies}
                    onChange={(e) => setNewGuestAllergies(e.target.value)}
                    placeholder="e.g., nuts, gluten…"
                    className="w-full rounded-lg border border-[#E0C6AF] bg-[#FDF8F2] px-3 py-2 text-sm text-[#3B2620] focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold mb-1 text-[#7B5A45]">Notes</label>
                  <input
                    value={newGuestNotes}
                    onChange={(e) => setNewGuestNotes(e.target.value)}
                    placeholder="Anniversary, preferences, pairing notes…"
                    className="w-full rounded-lg border border-[#E0C6AF] bg-[#FDF8F2] px-3 py-2 text-sm text-[#3B2620] focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                  />
                </div>
              </div>

              <button
                onClick={addGuest}
                className="w-full rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm"
                style={{ backgroundColor: BRAND.maroon }}
              >
                Add Guest
              </button>

              <div className="border-t border-[#F0E0CF] pt-3">
                <div className="text-xs font-semibold text-[#7B5A45] mb-2">
                  Results ({filteredGuests.length})
                </div>
                <div className="space-y-2 max-h-[320px] overflow-auto pr-1">
                  {filteredGuests.map((g) => (
                    <div
                      key={g.id}
                      className="rounded-xl border border-[#F0E0CF] bg-white px-3 py-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-semibold text-[#3B2620]">
                          {g.lastName}
                          {g.firstName ? `, ${g.firstName}` : ""}
                        </div>
                        <div className="text-[11px] text-[#7B5A45]">
                          {g.roomNumber ?? "—"}
                        </div>
                      </div>
                      {(g.allergies || g.notes) && (
                        <div className="text-[11px] text-[#7B5A45] mt-1">
                          {g.allergies ? `Allergy: ${g.allergies}. ` : ""}
                          {g.notes ?? ""}
                        </div>
                      )}
                    </div>
                  ))}
                  {filteredGuests.length === 0 && (
                    <div className="text-[11px] text-[#7B5A45]">No matches.</div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : (
        // --- DINNER SERVICE TAB ---
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1.85fr)]">
          {/* Left: big table cards */}
          <aside className="rounded-2xl bg-white/90 border border-[#E8D4B8] shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E8D4B8] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#4A1520]" style={{ fontFamily: "Playfair Display, Georgia, serif" }}>
                  Live Tables
                </h2>
                <p className="text-[11px] text-[#7B5A45] mt-0.5">
                  Tap a table • Advance / Back controls
                </p>
              </div>
              <span className="text-[11px] text-[#7B5A45]">{tables.length} tables</span>
            </div>

            <div className="p-4 grid gap-3">
              {tables.map((t) => {
                const isActive = t.id === selectedId;
                const activeIdx = getActiveIndex(t.steps);
                const activeLabel =
                  activeIdx !== -1 ? t.steps[activeIdx]?.label : "—";

                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedId(t.id)}
                    className={[
                      "rounded-2xl border p-4 text-left transition shadow-sm",
                      isActive
                        ? "border-[#6B1F2F] bg-[#6B1F2F] text-[#FDF7EE]"
                        : "border-[#F0E0CF] bg-white hover:bg-[#FDF8F2] text-[#3B2620]",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-lg font-bold">{t.tableNumber}</div>
                        <div className={isActive ? "text-xs opacity-90" : "text-xs text-[#7B5A45]"}>
                          {t.roomNumber ?? "No room #"} • {t.guestName || "Guest"} • {t.guestsCount}
                          {"  "}
                          {t.seatTime ? `• ${t.seatTime}` : ""}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={isActive ? "text-xs opacity-90" : "text-xs text-[#7B5A45]"}>
                          Now
                        </div>
                        <div className="text-sm font-semibold">{activeLabel}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {t.steps.slice(0, 7).map((s) => (
                        <span key={s.key} className={stepColorClass(s)}>
                          {s.label}
                        </span>
                      ))}
                      {t.steps.some((s) => s.key === "cheese") && (
                        <span className={stepColorClass(t.steps.find((s) => s.key === "cheese")!)}>
                          Cheese
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Right: detail + controls */}
          <section className="space-y-6">
            {/* Mini pre-dinner checklist for expo */}
            <div className="rounded-2xl bg-white/90 border border-[#E8D4B8] shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-[#E8D4B8] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#4A1520]" style={{ fontFamily: "Playfair Display, Georgia, serif" }}>
                    Seating Checklist
                  </h3>
                  <p className="text-[11px] text-[#7B5A45] mt-0.5">
                    Room • Last name • Seat time (check off as they sit)
                  </p>
                </div>
                <button
                  onClick={() => setTab("pre")}
                  className="text-[11px] font-semibold underline text-[#6B1F2F]"
                >
                  Edit pre-dinner
                </button>
              </div>
              <div className="p-4">
                <div className="grid gap-2">
                  {dinnerChecklist.map((p) => (
                    <label
                      key={p.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-[#F0E0CF] bg-white px-3 py-2"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={p.seated}
                          onChange={() =>
                            setPreDinner((prev) =>
                              prev.map((x) =>
                                x.id === p.id ? { ...x, seated: !x.seated } : x
                              )
                            )
                          }
                        />
                        <div>
                          <div className="text-sm font-semibold text-[#3B2620]">
                            {p.roomNumber ?? "—"} • {p.lastName}
                          </div>
                          <div className="text-[11px] text-[#7B5A45]">
                            Seat {p.seatTime} • {p.partySize} guests
                          </div>
                        </div>
                      </div>
                      <div className="text-[11px] text-[#7B5A45]">
                        {p.assignedTableId
                          ? `→ ${tables.find((t) => t.id === p.assignedTableId)?.tableNumber ?? "Table"}`
                          : ""}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Selected table control panel */}
            <div className="rounded-2xl bg-white/90 border border-[#E8D4B8] shadow-sm p-5">
              {selectedTable ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F0E0CF] pb-3 mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-[#4A1520]" style={{ fontFamily: "Playfair Display, Georgia, serif" }}>
                        {selectedTable.tableNumber}{" "}
                        <span className="text-sm font-medium text-[#7B5A45]">
                          • {selectedTable.roomNumber ?? "No room #"}
                        </span>
                      </h2>
                      <p className="text-xs text-[#7B5A45] mt-0.5">
                        {selectedTable.guestName || "Guest"} • {selectedTable.guestsCount} guests
                        {selectedTable.seatTime ? ` • Seat ${selectedTable.seatTime}` : ""}
                      </p>
                    </div>

                    {/* Advance / Back */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => backStep(selectedTable.id)}
                        className="rounded-xl border px-4 py-2 text-sm font-semibold"
                        style={{ borderColor: BRAND.tanLight, color: BRAND.maroonDark, backgroundColor: "white" }}
                        title="Undo (back one step)"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => advanceStep(selectedTable.id)}
                        className="rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm"
                        style={{ backgroundColor: BRAND.maroon }}
                        title="Advance to next step"
                      >
                        Advance
                      </button>
                    </div>
                  </div>

                  {/* Step row */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedTable.steps.map((s) => (
                      <span key={s.key} className={stepColorClass(s)}>
                        {s.label}
                      </span>
                    ))}
                  </div>

                  {/* Cheese insert controls */}
                  <div className="rounded-xl border border-[#F0E0CF] bg-white p-4 mb-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-[#3B2620]">Add-ons</div>
                        <div className="text-[11px] text-[#7B5A45] mt-0.5">
                          Cheese course can be inserted anywhere guests want it.
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                      <label className="flex items-center gap-2 text-sm text-[#3B2620]">
                        <input
                          type="checkbox"
                          checked={selectedTable.addOns.cheeseBoard}
                          onChange={() => toggleAddOn("cheeseBoard")}
                        />
                        Cheese course
                      </label>
                      <label className="flex items-center gap-2 text-sm text-[#3B2620]">
                        <input
                          type="checkbox"
                          checked={selectedTable.addOns.sparklingWater}
                          onChange={() => toggleAddOn("sparklingWater")}
                        />
                        Sparkling water
                      </label>
                      <label className="flex items-center gap-2 text-sm text-[#3B2620]">
                        <input
                          type="checkbox"
                          checked={selectedTable.addOns.dessertWine}
                          onChange={() => toggleAddOn("dessertWine")}
                        />
                        Dessert wine
                      </label>
                    </div>

                    {selectedTable.addOns.cheeseBoard && (
                      <div className="mt-4">
                        <div className="text-xs font-semibold text-[#7B5A45] mb-2">
                          Insert Cheese after:
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(["wine", "starter", "entree", "dessert"] as StepKey[]).map((k) => (
                            <button
                              key={k}
                              onClick={() => insertCheeseAfter(selectedTable.id, k)}
                              className="rounded-xl border px-3 py-2 text-xs font-semibold bg-white hover:bg-[#FDF8F2]"
                              style={{ borderColor: BRAND.tanLight, color: BRAND.maroonDark }}
                            >
                              {k === "wine" ? "Wine" : k === "starter" ? "Starter" : k === "entree" ? "Entrée" : "Dessert"}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Notes / allergies quick fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-[#7B5A45]">Allergies / restrictions</label>
                      <textarea
                        value={selectedTable.allergies}
                        onChange={(e) => updateSelected({ allergies: e.target.value })}
                        rows={2}
                        className="w-full rounded-lg border border-[#E0C6AF] bg-[#FDF8F2] px-3 py-2 text-sm text-[#3B2620] focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-[#7B5A45]">Service notes</label>
                      <textarea
                        value={selectedTable.notes}
                        onChange={(e) => updateSelected({ notes: e.target.value })}
                        rows={2}
                        className="w-full rounded-lg border border-[#E0C6AF] bg-[#FDF8F2] px-3 py-2 text-sm text-[#3B2620] focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                        placeholder="Anniversary, pacing, pairing notes…"
                      />
                    </div>
                  </div>

                  {/* Expo timing */}
                  <div className="rounded-2xl border border-[#E8D4B8] bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-[#4A1520]" style={{ fontFamily: "Playfair Display, Georgia, serif" }}>
                          Expo Timing
                        </h3>
                        <p className="text-[11px] text-[#7B5A45] mt-0.5">
                          Tap Called → Ready → Out to measure time per course.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 mt-3">
                      {(["starter", "entree", "dessert"] as CourseKey[]).map((course) => {
                        const ex = selectedTable.expo[course];
                        return (
                          <div key={course} className="rounded-xl border border-[#F0E0CF] p-3">
                            <div className="flex items-center justify-between gap-3">
                              <div className="text-sm font-semibold text-[#3B2620]">
                                {course === "starter" ? "Starter" : course === "entree" ? "Entrée" : "Dessert"}
                              </div>
                              <div className="text-[11px] text-[#7B5A45]">
                                Total: {dur(ex.calledAt, ex.outAt)}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                              <button
                                onClick={() => setExpoTime(selectedTable.id, course, "calledAt")}
                                className="rounded-xl border px-3 py-2 text-xs font-semibold bg-white hover:bg-[#FDF8F2]"
                                style={{ borderColor: BRAND.tanLight, color: BRAND.maroonDark }}
                              >
                                Called: {fmtTime(ex.calledAt)}
                              </button>
                              <button
                                onClick={() => setExpoTime(selectedTable.id, course, "readyAt")}
                                className="rounded-xl border px-3 py-2 text-xs font-semibold bg-white hover:bg-[#FDF8F2]"
                                style={{ borderColor: BRAND.tanLight, color: BRAND.maroonDark }}
                              >
                                Ready: {fmtTime(ex.readyAt)}{" "}
                                <span className="font-normal text-[#7B5A45]">
                                  ({dur(ex.calledAt, ex.readyAt)})
                                </span>
                              </button>
                              <button
                                onClick={() => setExpoTime(selectedTable.id, course, "outAt")}
                                className="rounded-xl border px-3 py-2 text-xs font-semibold bg-white hover:bg-[#FDF8F2]"
                                style={{ borderColor: BRAND.tanLight, color: BRAND.maroonDark }}
                              >
                                Out: {fmtTime(ex.outAt)}{" "}
                                <span className="font-normal text-[#7B5A45]">
                                  ({dur(ex.readyAt, ex.outAt)})
                                </span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <p className="text-[11px] text-[#7B5A45] mt-4">
                    Next step: we’ll persist tables, guests, and timing to your backend so it survives refresh and can generate reports.
                  </p>
                </>
              ) : (
                <p className="text-sm text-[#7B5A45]">
                  Select a table on the left to view controls.
                </p>
              )}
            </div>
          </section>
        </div>
      )}
    </MainLayout>
  );
}
