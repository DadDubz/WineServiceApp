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

type ServiceTab = "pre" | "dinner";

type StepKey =
  | "seating"
  | "bread_water"
  | "wine_service"
  | "starter"
  | "cheese"
  | "entree"
  | "dessert"
  | "goodbye";

type StepStatus = "todo" | "done";
type CheesePosition = "after_wine" | "after_starter" | "after_entree";
type CourseKey = "starter" | "entree" | "dessert";

interface ServiceStep {
  key: StepKey;
  label: string;
  status: StepStatus;
  color: string;
}

interface ExpoTimes {
  calledAt?: string;
  readyAt?: string;
  servedAt?: string;
  clearedAt?: string;
}

interface ExpoByCourse {
  starter: ExpoTimes;
  entree: ExpoTimes;
  dessert: ExpoTimes;
}

interface ServiceTable {
  id: number; // 1..20
  tableNumber: string; // "T1"
  roomNumber: string;
  guestLastName: string;
  guestsCount: number;
  seatTime: string;

  allergies: string;
  occasion: string;
  notes: string;
  drinks: string;

  addOns: {
    sparklingWater: boolean;
    wineBTG: boolean;
    wineBottle: boolean;
    cheeseCourse: boolean;
  };

  cheesePosition: CheesePosition;

  substitutions: string;
  protein: ProteinDoneness;

  steps: ServiceStep[];
  history: { steps: ServiceStep[]; at: string; note: string }[];

  expo: ExpoByCourse;

  occupiedByReservationId?: string;

  satAtIso?: string;
  closedOut: boolean;
  closedAtIso?: string;
}

interface GuestProfile {
  id: string;
  lastName: string;
  firstName?: string;
  phone?: string;
  email?: string;
  defaultAllergies?: string;
  notes?: string;
}

interface Reservation {
  id: string;
  lastName: string;
  roomNumber: string;
  partySize: number;
  seatTime: string;
  allergies: string;
  occasion: string;
  notes: string;

  arrived: boolean;
  assignedTableNum?: number; // 1..20
}

// ---------- helpers ----------
const pad2 = (n: number) => String(n).padStart(2, "0");

function nowLocalHM(): string {
  const d = new Date();
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function cloneSteps(steps: ServiceStep[]) {
  return steps.map((s) => ({ ...s }));
}

function baseStepPalette(key: StepKey): { label: string; color: string } {
  switch (key) {
    case "seating":
      return {
        label: "Seating guest",
        color: "bg-sky-50 text-sky-900 border-sky-200",
      };
    case "bread_water":
      return {
        label: "Bread & water",
        color: "bg-blue-50 text-blue-900 border-blue-200",
      };
    case "wine_service":
      return {
        label: "Wine service",
        color: "bg-violet-50 text-violet-900 border-violet-200",
      };
    case "starter":
      return {
        label: "Starter course",
        color: "bg-amber-50 text-amber-900 border-amber-200",
      };
    case "cheese":
      return {
        label: "Cheese course",
        color: "bg-yellow-50 text-yellow-900 border-yellow-200",
      };
    case "entree":
      return {
        label: "Entrée",
        color: "bg-rose-50 text-rose-900 border-rose-200",
      };
    case "dessert":
      return {
        label: "Dessert",
        color: "bg-emerald-50 text-emerald-900 border-emerald-200",
      };
    case "goodbye":
      return {
        label: "Goodbye treat (canoe)",
        color: "bg-stone-50 text-stone-900 border-stone-200",
      };
    default:
      return { label: "Step", color: "bg-slate-50 text-slate-900 border-slate-200" };
  }
}

function buildSteps(hasCheese: boolean, cheesePosition: CheesePosition): ServiceStep[] {
  const make = (key: StepKey): ServiceStep => {
    const meta = baseStepPalette(key);
    return { key, label: meta.label, status: "todo", color: meta.color };
  };

  const order: StepKey[] = [
    "seating",
    "bread_water",
    "wine_service",
    "starter",
    "entree",
    "dessert",
    "goodbye",
  ];

  if (hasCheese) {
    if (cheesePosition === "after_wine") {
      const idx = order.indexOf("wine_service");
      order.splice(idx + 1, 0, "cheese");
    } else if (cheesePosition === "after_starter") {
      const idx = order.indexOf("starter");
      order.splice(idx + 1, 0, "cheese");
    } else {
      const idx = order.indexOf("entree");
      order.splice(idx + 1, 0, "cheese");
    }
  }

  return order.map(make);
}

function rebuildStepsPreserveStatus(
  prevSteps: ServiceStep[],
  nextHasCheese: boolean,
  nextPos: CheesePosition
): ServiceStep[] {
  const next = buildSteps(nextHasCheese, nextPos);

  const statusByKey = new Map<StepKey, StepStatus>();
  for (const s of prevSteps) statusByKey.set(s.key, s.status);

  return next.map((s) => ({
    ...s,
    status: statusByKey.get(s.key) ?? "todo",
  }));
}

function makeEmptyTable(n: number): ServiceTable {
  return {
    id: n,
    tableNumber: `T${n}`,
    roomNumber: "",
    guestLastName: "",
    guestsCount: 0,
    seatTime: "",

    allergies: "",
    occasion: "",
    notes: "",
    drinks: "",

    addOns: {
      sparklingWater: false,
      wineBTG: false,
      wineBottle: false,
      cheeseCourse: false,
    },

    cheesePosition: "after_wine",

    substitutions: "",
    protein: "n/a",

    steps: buildSteps(false, "after_wine"),
    history: [],

    expo: { starter: {}, entree: {}, dessert: {} },

    occupiedByReservationId: undefined,

    satAtIso: undefined,
    closedOut: false,
    closedAtIso: undefined,
  };
}

const initialTables: ServiceTable[] = Array.from({ length: 20 }, (_, i) =>
  makeEmptyTable(i + 1)
);

// demo seed
const seedGuests: GuestProfile[] = [
  { id: "g1", lastName: "Smith", firstName: "A.", defaultAllergies: "", notes: "" },
  { id: "g2", lastName: "Johnson", firstName: "K.", defaultAllergies: "No nuts", notes: "" },
  { id: "g3", lastName: "Taylor", firstName: "M.", defaultAllergies: "", notes: "Prefers Burgundy" },
];

const seedReservations: Reservation[] = [
  {
    id: "r1",
    lastName: "Smith",
    roomNumber: "Cabin 3",
    partySize: 2,
    seatTime: "17:30",
    allergies: "",
    occasion: "",
    notes: "",
    arrived: false,
    assignedTableNum: undefined,
  },
  {
    id: "r2",
    lastName: "Johnson",
    roomNumber: "Cabin 7",
    partySize: 4,
    seatTime: "18:00",
    allergies: "No nuts",
    occasion: "Anniversary",
    notes: "Cheese course requested",
    arrived: false,
    assignedTableNum: undefined,
  },
  {
    id: "r3",
    lastName: "Taylor",
    roomNumber: "Suite 1",
    partySize: 2,
    seatTime: "18:15",
    allergies: "",
    occasion: "Birthday",
    notes: "",
    arrived: false,
    assignedTableNum: undefined,
  },
];

// ----------------- Left list “status” helpers -----------------
function getFirstTodoStep(table: ServiceTable): ServiceStep | null {
  return table.steps.find((s) => s.status === "todo") ?? null;
}

function isCourseKey(k: StepKey): k is CourseKey {
  return k === "starter" || k === "entree" || k === "dessert";
}

function expoStage(times: ExpoTimes): {
  label: string;
  key: "called" | "ready" | "served" | "cleared" | "not";
} {
  if (!times.calledAt) return { label: "Not called", key: "not" };
  if (!times.readyAt) return { label: "Called → kitchen", key: "called" };
  if (!times.servedAt) return { label: "Ready", key: "ready" };
  if (!times.clearedAt) return { label: "Served", key: "served" };
  return { label: "Cleared", key: "cleared" };
}

function stagePillClass(stageKey: ReturnType<typeof expoStage>["key"]) {
  switch (stageKey) {
    case "called":
      return "bg-indigo-50 text-indigo-900 border-indigo-200";
    case "ready":
      return "bg-amber-50 text-amber-900 border-amber-200";
    case "served":
      return "bg-emerald-50 text-emerald-900 border-emerald-200";
    case "cleared":
      return "bg-slate-100 text-slate-700 border-slate-200";
    default:
      return "bg-stone-50 text-stone-900 border-stone-200";
  }
}

export default function ServicePage() {
  const [tab, setTab] = useState<ServiceTab>("pre");

  const [tables, setTables] = useState<ServiceTable[]>(() =>
    initialTables.map((t) => ({ ...t }))
  );

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selectedTable = tables.find((t) => t.id === selectedId) ?? null;

  const [guestDb, setGuestDb] = useState<GuestProfile[]>(seedGuests);
  const [preDinner, setPreDinner] = useState<Reservation[]>(seedReservations);

  const [confirmClear, setConfirmClear] = useState<{
    open: boolean;
    reservationId?: string;
    tableNum?: number;
  }>({ open: false });

  const [confirmCloseOut, setConfirmCloseOut] = useState<{
    open: boolean;
    tableNum?: number;
  }>({ open: false });

  // NEW: Dinner-tab "Seat guests" bar state
  const [seatBar, setSeatBar] = useState<{ reservationId: string; tableNum: string }>({
    reservationId: "",
    tableNum: "",
  });

  // ---------- core updaters ----------
  const updateTable = (tableId: number, patch: Partial<ServiceTable>) => {
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, ...patch } : t))
    );
  };

  const undoLast = (tableId: number) => {
    setTables((prev) =>
      prev.map((t) => {
        if (t.id !== tableId) return t;
        const [head, ...rest] = t.history;
        if (!head) return t;
        return { ...t, steps: cloneSteps(head.steps), history: rest };
      })
    );
  };

  const maybeAutoCloseOut = (t: ServiceTable): ServiceTable => {
    const goodbye = t.steps.find((s) => s.key === "goodbye");
    if (goodbye?.status === "done" && !t.closedOut) {
      return { ...t, closedOut: true, closedAtIso: new Date().toISOString() };
    }
    return t;
  };

  const toggleStepDone = (tableId: number, stepKey: StepKey) => {
    setTables((prev) =>
      prev.map((t) => {
        if (t.id !== tableId) return t;

        const snapshot = cloneSteps(t.steps);

        const nextSteps = t.steps.map((s) =>
          s.key === stepKey
            ? { ...s, status: s.status === "done" ? "todo" : "done" }
            : s
        );

        const next: ServiceTable = {
          ...t,
          steps: nextSteps,
          history: [
            { steps: snapshot, at: new Date().toISOString(), note: `Toggle ${stepKey}` },
            ...t.history,
          ].slice(0, 25),
        };

        return maybeAutoCloseOut(next);
      })
    );
  };

  const setCheeseCourse = (tableId: number, enabled: boolean) => {
    setTables((prev) =>
      prev.map((t) => {
        if (t.id !== tableId) return t;

        const snapshot = cloneSteps(t.steps);
        const nextAddOns = { ...t.addOns, cheeseCourse: enabled };
        const nextSteps = rebuildStepsPreserveStatus(
          t.steps,
          enabled,
          t.cheesePosition
        );

        return {
          ...t,
          addOns: nextAddOns,
          steps: nextSteps,
          history: [
            { steps: snapshot, at: new Date().toISOString(), note: `Cheese ${enabled ? "on" : "off"}` },
            ...t.history,
          ].slice(0, 25),
        };
      })
    );
  };

  const setCheesePosition = (tableId: number, pos: CheesePosition) => {
    setTables((prev) =>
      prev.map((t) => {
        if (t.id !== tableId) return t;

        const snapshot = cloneSteps(t.steps);
        const nextSteps = rebuildStepsPreserveStatus(t.steps, t.addOns.cheeseCourse, pos);

        return {
          ...t,
          cheesePosition: pos,
          steps: nextSteps,
          history: [
            { steps: snapshot, at: new Date().toISOString(), note: `Cheese position ${pos}` },
            ...t.history,
          ].slice(0, 25),
        };
      })
    );
  };

  // ---------- expo timing ----------
  const stampExpo = (tableId: number, course: CourseKey, field: keyof ExpoTimes) => {
    const iso = new Date().toISOString();
    setTables((prev) =>
      prev.map((t) => {
        if (t.id !== tableId) return t;
        return {
          ...t,
          expo: {
            ...t.expo,
            [course]: { ...t.expo[course], [field]: iso },
          },
        };
      })
    );
  };

  const clearExpoCourse = (tableId: number, course: CourseKey) => {
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, expo: { ...t.expo, [course]: {} } } : t))
    );
  };

  // ---------- pre-dinner logic ----------
  const toggleArrived = (reservationId: string, arrived: boolean) => {
    setPreDinner((prev) =>
      prev.map((r) => (r.id === reservationId ? { ...r, arrived } : r))
    );

    const r = preDinner.find((x) => x.id === reservationId);
    if (!r) return;

    if (!arrived && r.assignedTableNum) {
      setConfirmClear({ open: true, reservationId, tableNum: r.assignedTableNum });
    }
  };

  // IMPORTANT: this function can be called from Pre tab OR Dinner seat-bar
  const assignReservationToTable = (reservationId: string, tableNum?: number) => {
    setPreDinner((prev) =>
      prev.map((r) =>
        r.id === reservationId ? { ...r, assignedTableNum: tableNum } : r
      )
    );

    if (!tableNum) return;

    const r = preDinner.find((x) => x.id === reservationId);
    if (!r) return;

    setTables((prev) =>
      prev.map((t) => {
        if (t.id !== tableNum) return t;

        const hasCheese = r.notes.toLowerCase().includes("cheese");

        return {
          ...t,
          occupiedByReservationId: reservationId,
          roomNumber: r.roomNumber ?? "",
          guestLastName: r.lastName ?? "",
          guestsCount: r.partySize ?? 0,
          seatTime: r.seatTime ?? "",

          allergies: r.allergies ?? "",
          occasion: r.occasion ?? "",
          notes: r.notes ?? "",

          addOns: {
            ...t.addOns,
            cheeseCourse: hasCheese ? true : t.addOns.cheeseCourse,
          },
          steps: buildSteps(hasCheese ? true : t.addOns.cheeseCourse, t.cheesePosition),
          history: [],
          expo: { starter: {}, entree: {}, dessert: {} },

          satAtIso: t.satAtIso ?? new Date().toISOString(),
          closedOut: false,
          closedAtIso: undefined,
        };
      })
    );

    setSelectedId(tableNum);
  };

  const confirmFreeTable = () => {
    const reservationId = confirmClear.reservationId;
    const tableNum = confirmClear.tableNum;
    if (!reservationId || !tableNum) {
      setConfirmClear({ open: false });
      return;
    }

    setPreDinner((prev) =>
      prev.map((r) =>
        r.id === reservationId ? { ...r, assignedTableNum: undefined, arrived: false } : r
      )
    );

    setTables((prev) =>
      prev.map((t) => {
        if (t.id !== tableNum) return t;
        if (t.occupiedByReservationId !== reservationId) return t;
        return makeEmptyTable(tableNum);
      })
    );

    setSelectedId((prevSel) => (prevSel === tableNum ? null : prevSel));
    setConfirmClear({ open: false });
  };

  const cancelFreeTable = () => {
    if (confirmClear.reservationId) {
      setPreDinner((prev) =>
        prev.map((r) =>
          r.id === confirmClear.reservationId ? { ...r, arrived: true } : r
        )
      );
    }
    setConfirmClear({ open: false });
  };

  // ---------- closeout ----------
  const requestCloseOut = (tableNum: number) => setConfirmCloseOut({ open: true, tableNum });

  const confirmCloseOutYes = () => {
    const tableNum = confirmCloseOut.tableNum;
    if (!tableNum) {
      setConfirmCloseOut({ open: false });
      return;
    }

    setTables((prev) =>
      prev.map((t) =>
        t.id === tableNum
          ? { ...t, closedOut: true, closedAtIso: new Date().toISOString() }
          : t
      )
    );

    setConfirmCloseOut({ open: false });
  };

  const cancelCloseOut = () => setConfirmCloseOut({ open: false });

  // ---------- Guest DB quick add ----------
  const [newGuest, setNewGuest] = useState({
    lastName: "",
    firstName: "",
    phone: "",
    email: "",
    allergies: "",
    notes: "",
  });

  const addGuestToDb = () => {
    const lastName = newGuest.lastName.trim();
    if (!lastName) return;
    const id = `g_${Date.now()}`;
    setGuestDb((prev) => [
      {
        id,
        lastName,
        firstName: newGuest.firstName.trim() || undefined,
        phone: newGuest.phone.trim() || undefined,
        email: newGuest.email.trim() || undefined,
        defaultAllergies: newGuest.allergies.trim() || undefined,
        notes: newGuest.notes.trim() || undefined,
      },
      ...prev,
    ]);
    setNewGuest({
      lastName: "",
      firstName: "",
      phone: "",
      email: "",
      allergies: "",
      notes: "",
    });
  };

  const [resForm, setResForm] = useState({
    guestId: "",
    roomNumber: "",
    partySize: 2,
    seatTime: "",
    occasion: "",
    notes: "",
  });

  const addReservationFromGuest = () => {
    const g = guestDb.find((x) => x.id === resForm.guestId);
    if (!g) return;

    const id = `r_${Date.now()}`;
    setPreDinner((prev) => [
      ...prev,
      {
        id,
        lastName: g.lastName,
        roomNumber: resForm.roomNumber.trim(),
        partySize: Number(resForm.partySize || 1),
        seatTime: resForm.seatTime.trim() || nowLocalHM(),
        allergies: (g.defaultAllergies ?? "").trim(),
        occasion: resForm.occasion.trim(),
        notes: `${(g.notes ?? "").trim()}${g.notes && resForm.notes ? " • " : ""}${resForm.notes.trim()}`.trim(),
        arrived: false,
        assignedTableNum: undefined,
      },
    ]);

    setResForm({
      guestId: "",
      roomNumber: "",
      partySize: 2,
      seatTime: "",
      occasion: "",
      notes: "",
    });
  };

  // ---------- derived ----------
  const satTables = useMemo(() => {
    const relevant = tables.filter((t) => !!t.satAtIso && (t.guestLastName.trim() || t.closedOut));

    const active = relevant
      .filter((t) => !t.closedOut)
      .slice()
      .sort((a, b) => (a.satAtIso ?? "").localeCompare(b.satAtIso ?? ""));

    const completed = relevant
      .filter((t) => t.closedOut)
      .slice()
      .sort((a, b) => (a.satAtIso ?? "").localeCompare(b.satAtIso ?? ""));

    return { active, completed };
  }, [tables]);

  const occupiedTableIds = useMemo(() => {
    const set = new Set<number>();
    for (const t of tables) {
      if (t.guestLastName.trim() && !t.closedOut) set.add(t.id);
    }
    return set;
  }, [tables]);

  // NEW: Dinner seat bar options
  const arrivedUnseatedReservations = useMemo(() => {
    return preDinner
      .filter((r) => r.arrived && !r.assignedTableNum)
      .slice()
      .sort((a, b) => a.seatTime.localeCompare(b.seatTime));
  }, [preDinner]);

  const seatGuestFromDinnerBar = () => {
    if (!seatBar.reservationId || !seatBar.tableNum) return;
    const tableNum = Number(seatBar.tableNum);
    if (!tableNum) return;
    if (occupiedTableIds.has(tableNum)) return;

    assignReservationToTable(seatBar.reservationId, tableNum);
    setSelectedId(tableNum);
    setSeatBar({ reservationId: "", tableNum: "" });
  };

  return (
    <MainLayout title="Dinner Service" subtitle="Pre-dinner setup + live course tracking">
      {/* Tabs */}
      <div className="flex items-center gap-2 mb-4">
        <TabButton active={tab === "pre"} onClick={() => setTab("pre")}>
          Pre-dinner
        </TabButton>
        <TabButton active={tab === "dinner"} onClick={() => setTab("dinner")}>
          Dinner service
        </TabButton>
      </div>

      {tab === "pre" ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          {/* Pre-dinner list */}
          <section className="rounded-2xl bg-white/90 border border-[#E8D4B8] shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E8D4B8] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#4A1520]" style={{ fontFamily: "Playfair Display, Georgia, serif" }}>
                  Pre-dinner list
                </h2>
                <p className="text-[11px] text-[#7B5A45] mt-0.5">
                  Mark arrived now. (Seating + table selection happens on Dinner tab.)
                </p>
              </div>
              <span className="text-[11px] text-[#7B5A45]">
                {preDinner.filter((r) => r.arrived).length}/{preDinner.length} arrived
              </span>
            </div>

            <div className="divide-y divide-[#F0E0CF]">
              {preDinner
                .slice()
                .sort((a, b) => a.seatTime.localeCompare(b.seatTime))
                .map((r) => (
                  <div key={r.id} className="px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-[#3B2620]">
                          {r.lastName}{" "}
                          <span className="text-xs font-normal text-[#7B5A45]">
                            • {r.partySize} {r.partySize === 1 ? "guest" : "guests"}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#7B5A45] mt-0.5">
                          {r.roomNumber ? `Room: ${r.roomNumber}` : "Room: —"} • Seat: {r.seatTime || "—"}
                          {r.occasion ? ` • ${r.occasion}` : ""}
                          {r.allergies ? ` • Allergy: ${r.allergies}` : ""}
                        </div>
                        {r.notes ? (
                          <div className="text-[11px] text-[#7B5A45] mt-1">
                            Notes: {r.notes}
                          </div>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 text-sm text-[#3B2620]">
                          <input
                            type="checkbox"
                            checked={r.arrived}
                            onChange={(e) => toggleArrived(r.id, e.target.checked)}
                          />
                          Arrived
                        </label>

                        {r.assignedTableNum ? (
                          <span className="text-[11px] text-[#7B5A45]">
                            Assigned: Table {r.assignedTableNum}
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#7B5A45]">
                            (Seat on Dinner tab)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </section>

          {/* Guest database */}
          <section className="rounded-2xl bg-white/90 border border-[#E8D4B8] shadow-sm p-4">
            <h2 className="text-sm font-semibold text-[#4A1520]" style={{ fontFamily: "Playfair Display, Georgia, serif" }}>
              Guest database
            </h2>
            <p className="text-[11px] text-[#7B5A45] mt-0.5 mb-3">
              Add guests ahead of service, then create tonight’s reservation quickly
            </p>

            <div className="rounded-xl border border-[#F0E0CF] bg-[#FDF8F2] p-3 mb-4">
              <div className="text-xs font-semibold text-[#7B5A45] mb-2">Add guest</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <input
                  placeholder="Last name *"
                  value={newGuest.lastName}
                  onChange={(e) => setNewGuest((p) => ({ ...p, lastName: e.target.value }))}
                  className="w-full rounded-lg border border-[#E0C6AF] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                />
                <input
                  placeholder="First name"
                  value={newGuest.firstName}
                  onChange={(e) => setNewGuest((p) => ({ ...p, firstName: e.target.value }))}
                  className="w-full rounded-lg border border-[#E0C6AF] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                />
                <input
                  placeholder="Phone"
                  value={newGuest.phone}
                  onChange={(e) => setNewGuest((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full rounded-lg border border-[#E0C6AF] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                />
                <input
                  placeholder="Email"
                  value={newGuest.email}
                  onChange={(e) => setNewGuest((p) => ({ ...p, email: e.target.value }))}
                  className="w-full rounded-lg border border-[#E0C6AF] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                />
              </div>
              <textarea
                placeholder="Allergies / restrictions"
                value={newGuest.allergies}
                onChange={(e) => setNewGuest((p) => ({ ...p, allergies: e.target.value }))}
                className="mt-2 w-full rounded-lg border border-[#E0C6AF] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                rows={2}
              />
              <textarea
                placeholder="Notes (preferences, usual wine, etc.)"
                value={newGuest.notes}
                onChange={(e) => setNewGuest((p) => ({ ...p, notes: e.target.value }))}
                className="mt-2 w-full rounded-lg border border-[#E0C6AF] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                rows={2}
              />
              <div className="mt-2 flex justify-end">
                <button
                  onClick={addGuestToDb}
                  className="rounded-lg bg-[#6B1F2F] text-white px-3 py-2 text-sm hover:bg-[#4A1520] transition"
                >
                  Add guest
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-[#F0E0CF] bg-white p-3">
              <div className="text-xs font-semibold text-[#7B5A45] mb-2">Create tonight’s reservation</div>

              <div className="grid grid-cols-1 gap-2">
                <select
                  value={resForm.guestId}
                  onChange={(e) => setResForm((p) => ({ ...p, guestId: e.target.value }))}
                  className="w-full rounded-lg border border-[#E0C6AF] bg-[#FDF8F2] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                >
                  <option value="">Select guest…</option>
                  {guestDb
                    .slice()
                    .sort((a, b) => a.lastName.localeCompare(b.lastName))
                    .map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.lastName}{g.firstName ? `, ${g.firstName}` : ""}
                        {g.defaultAllergies ? " (allergy)" : ""}
                      </option>
                    ))}
                </select>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    placeholder="Room / cabin"
                    value={resForm.roomNumber}
                    onChange={(e) => setResForm((p) => ({ ...p, roomNumber: e.target.value }))}
                    className="w-full rounded-lg border border-[#E0C6AF] bg-[#FDF8F2] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                  />
                  <input
                    placeholder="Seat time (HH:MM)"
                    value={resForm.seatTime}
                    onChange={(e) => setResForm((p) => ({ ...p, seatTime: e.target.value }))}
                    className="w-full rounded-lg border border-[#E0C6AF] bg-[#FDF8F2] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    type="number"
                    min={1}
                    placeholder="Party size"
                    value={resForm.partySize}
                    onChange={(e) => setResForm((p) => ({ ...p, partySize: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-[#E0C6AF] bg-[#FDF8F2] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                  />
                  <input
                    placeholder="Occasion (anniversary, birthday…) "
                    value={resForm.occasion}
                    onChange={(e) => setResForm((p) => ({ ...p, occasion: e.target.value }))}
                    className="w-full rounded-lg border border-[#E0C6AF] bg-[#FDF8F2] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                  />
                </div>

                <textarea
                  placeholder="Notes for tonight"
                  value={resForm.notes}
                  onChange={(e) => setResForm((p) => ({ ...p, notes: e.target.value }))}
                  rows={2}
                  className="w-full rounded-lg border border-[#E0C6AF] bg-[#FDF8F2] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                />

                <div className="flex justify-end">
                  <button
                    onClick={addReservationFromGuest}
                    className="rounded-lg border border-[#6B1F2F] text-[#6B1F2F] px-3 py-2 text-sm hover:bg-[#6B1F2F] hover:text-white transition"
                  >
                    Add to pre-dinner list
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : (
        // ---------------- Dinner tab ----------------
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.7fr)]">
          {/* LEFT list */}
          <aside className="rounded-2xl bg-white/90 border border-[#E8D4B8] shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E8D4B8] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#4A1520]" style={{ fontFamily: "Playfair Display, Georgia, serif" }}>
                  Seated tables
                </h2>
                <p className="text-[11px] text-[#7B5A45] mt-0.5">
                  First sat at the top • Completed tables drop to bottom
                </p>
              </div>
              <span className="text-[11px] text-[#7B5A45]">
                {satTables.active.length} active • {satTables.completed.length} completed
              </span>
            </div>

            <div className="p-3 space-y-3">
              {satTables.active.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#E8D4B8] bg-[#FDF8F2] p-4 text-sm text-[#7B5A45]">
                  No tables seated yet. Use the “Seat guests” bar on the right.
                </div>
              ) : null}

              {satTables.active.map((t) => {
                const isActive = t.id === selectedId;
                const current = getFirstTodoStep(t);
                const currentLabel = current ? current.label : "All steps done";

                let stage = { label: "—", key: "not" as const };
                if (current && isCourseKey(current.key)) stage = expoStage(t.expo[current.key]);

                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedId(t.id)}
                    className={[
                      "w-full rounded-2xl border px-4 py-3 text-left transition",
                      isActive
                        ? "border-[#6B1F2F] bg-[#6B1F2F] text-[#FDF7EE]"
                        : "border-[#E8D4B8] bg-white hover:bg-[#FDF8F2] text-[#3B2620]",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="text-base font-semibold">Table {t.id}</div>
                          <span className={isActive ? "text-[11px] opacity-90" : "text-[11px] text-[#7B5A45]"}>
                            {t.seatTime ? `Seat ${t.seatTime}` : "Seat —"}
                          </span>
                        </div>

                        <div className={isActive ? "text-[12px] opacity-90 mt-0.5" : "text-[12px] text-[#7B5A45] mt-0.5"}>
                          <span className="font-medium text-inherit">{t.guestLastName || "—"}</span>
                          <span className="mx-1">•</span>
                          <span>{t.roomNumber || "—"}</span>
                          <span className="mx-1">•</span>
                          <span>{t.guestsCount ? `${t.guestsCount}p` : "—"}</span>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span
                            className={[
                              "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                              isActive
                                ? "bg-white/10 border-white/20 text-white"
                                : "bg-[#FDF8F2] border-[#E8D4B8] text-[#4A1520]",
                            ].join(" ")}
                          >
                            Current: {currentLabel}
                          </span>

                          {current && isCourseKey(current.key) ? (
                            <span
                              className={[
                                "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                                isActive
                                  ? "bg-white/10 border-white/20 text-white"
                                  : stagePillClass(stage.key),
                              ].join(" ")}
                            >
                              {stage.label}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="shrink-0">
                        <div className={isActive ? "text-[11px] opacity-90" : "text-[11px] text-[#7B5A45]"}>
                          {t.allergies?.trim() ? "Allergy" : ""}
                          {t.allergies?.trim() &&
                          (t.addOns.cheeseCourse || t.addOns.wineBottle || t.addOns.wineBTG || t.addOns.sparklingWater)
                            ? " • "
                            : ""}
                          {t.addOns.cheeseCourse || t.addOns.wineBottle || t.addOns.wineBTG || t.addOns.sparklingWater
                            ? "Add-ons"
                            : ""}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}

              {satTables.completed.length > 0 ? (
                <div className="pt-2">
                  <div className="text-[11px] font-semibold text-[#7B5A45] px-1 mb-2">
                    Completed
                  </div>
                  <div className="space-y-2">
                    {satTables.completed.map((t) => {
                      const isActive = t.id === selectedId;
                      return (
                        <button
                          key={t.id}
                          onClick={() => setSelectedId(t.id)}
                          className={[
                            "w-full rounded-2xl border px-4 py-3 text-left transition",
                            isActive
                              ? "border-[#6B1F2F] bg-[#6B1F2F] text-[#FDF7EE]"
                              : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100",
                          ].join(" ")}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <div className="text-base font-semibold">Table {t.id}</div>
                                <span className={isActive ? "text-[11px] opacity-90" : "text-[11px] text-slate-500"}>
                                  {t.seatTime ? `Seat ${t.seatTime}` : "Seat —"}
                                </span>
                              </div>

                              <div className={isActive ? "text-[12px] opacity-90 mt-0.5" : "text-[12px] text-slate-500 mt-0.5"}>
                                <span className="font-medium text-inherit">{t.guestLastName || "—"}</span>
                                <span className="mx-1">•</span>
                                <span>{t.roomNumber || "—"}</span>
                                <span className="mx-1">•</span>
                                <span>{t.guestsCount ? `${t.guestsCount}p` : "—"}</span>
                              </div>

                              <div className="mt-2">
                                <span className={isActive ? "text-[11px] opacity-90" : "text-[11px] text-slate-500"}>
                                  Closed out
                                </span>
                              </div>
                            </div>

                            <div className="shrink-0">
                              <span
                                className={[
                                  "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                                  isActive
                                    ? "bg-white/10 border-white/20 text-white"
                                    : "bg-slate-100 border-slate-200 text-slate-700",
                                ].join(" ")}
                              >
                                Completed
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          </aside>

          {/* RIGHT: Seat bar + detail panel */}
          <section className="rounded-2xl bg-white/90 border border-[#E8D4B8] shadow-sm p-5">
            {/* NEW: seat guests bar */}
            <div className="rounded-2xl border border-[#E8D4B8] bg-[#FDF8F2] p-4 mb-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-[#4A1520]" style={{ fontFamily: "Playfair Display, Georgia, serif" }}>
                    Seat guests
                  </div>
                  <div className="text-[11px] text-[#7B5A45] mt-0.5">
                    Pick an arrived reservation, choose a table, then seat them (table appears on left)
                  </div>
                </div>
                <div className="text-[11px] text-[#7B5A45]">
                  Arrived unseated: {arrivedUnseatedReservations.length}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)_auto] gap-2">
                <select
                  value={seatBar.reservationId}
                  onChange={(e) => setSeatBar((p) => ({ ...p, reservationId: e.target.value }))}
                  className="w-full rounded-lg border border-[#E0C6AF] bg-white px-3 py-2 text-sm text-[#3B2620] focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                >
                  <option value="">Select arrived guest…</option>
                  {arrivedUnseatedReservations.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.lastName} • {r.roomNumber || "—"} • {r.partySize}p • {r.seatTime || "—"}
                      {r.allergies ? " • Allergy" : ""}
                    </option>
                  ))}
                </select>

                <select
                  value={seatBar.tableNum}
                  onChange={(e) => setSeatBar((p) => ({ ...p, tableNum: e.target.value }))}
                  className="w-full rounded-lg border border-[#E0C6AF] bg-white px-3 py-2 text-sm text-[#3B2620] focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                >
                  <option value="">Select table…</option>
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n} disabled={occupiedTableIds.has(n)}>
                      Table {n}{occupiedTableIds.has(n) ? " (occupied)" : ""}
                    </option>
                  ))}
                </select>

                <button
                  onClick={seatGuestFromDinnerBar}
                  disabled={!seatBar.reservationId || !seatBar.tableNum || occupiedTableIds.has(Number(seatBar.tableNum))}
                  className={[
                    "rounded-lg px-4 py-2 text-sm font-semibold transition",
                    !seatBar.reservationId || !seatBar.tableNum || occupiedTableIds.has(Number(seatBar.tableNum))
                      ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                      : "bg-[#6B1F2F] text-white hover:bg-[#4A1520]",
                  ].join(" ")}
                >
                  Seat
                </button>
              </div>
            </div>

            {/* existing detail panel */}
            {!selectedTable ? (
              <p className="text-sm text-[#7B5A45]">
                Seat a reservation above or select a table on the left.
              </p>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F0E0CF] pb-3 mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-[#4A1520]" style={{ fontFamily: "Playfair Display, Georgia, serif" }}>
                      Table {selectedTable.id} • {selectedTable.guestLastName || "—"}
                    </h2>
                    <p className="text-xs text-[#7B5A45] mt-0.5">
                      {selectedTable.roomNumber ? `Room ${selectedTable.roomNumber}` : "Room —"} •{" "}
                      {selectedTable.seatTime ? `Seat ${selectedTable.seatTime}` : "Seat —"} •{" "}
                      {selectedTable.guestsCount ? `${selectedTable.guestsCount} guests` : "—"}
                      {selectedTable.occasion ? ` • ${selectedTable.occasion}` : ""}
                      {selectedTable.allergies ? ` • Allergy: ${selectedTable.allergies}` : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => undoLast(selectedTable.id)}
                      disabled={selectedTable.history.length === 0}
                      className={[
                        "rounded-lg px-3 py-2 text-sm border transition",
                        selectedTable.history.length === 0
                          ? "border-slate-200 text-slate-400 cursor-not-allowed"
                          : "border-[#6B1F2F] text-[#6B1F2F] hover:bg-[#6B1F2F] hover:text-white",
                      ].join(" ")}
                      title={selectedTable.history[0]?.note ? `Undo: ${selectedTable.history[0].note}` : "Undo"}
                    >
                      Undo
                    </button>

                    <button
                      onClick={() => requestCloseOut(selectedTable.id)}
                      disabled={selectedTable.closedOut}
                      className={[
                        "rounded-lg px-3 py-2 text-sm border transition",
                        selectedTable.closedOut
                          ? "border-slate-200 text-slate-400 cursor-not-allowed"
                          : "border-slate-300 text-slate-700 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      Close out
                    </button>
                  </div>
                </div>

                {/* Steps */}
                <div className="mb-5">
                  <div className="text-xs font-semibold text-[#7B5A45] mb-2">
                    Service steps (click to toggle done)
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedTable.steps.map((s) => {
                      const isDone = s.status === "done";
                      return (
                        <button
                          key={s.key}
                          onClick={() => toggleStepDone(selectedTable.id, s.key)}
                          className={[
                            "rounded-xl border px-3 py-3 text-left transition flex items-center justify-between gap-3",
                            s.color,
                            isDone ? "opacity-70" : "opacity-100",
                          ].join(" ")}
                        >
                          <div className="font-semibold text-sm">{s.label}</div>
                          <div className="text-xs font-semibold">
                            {isDone ? "DONE" : "TODO"}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <p className="text-[11px] text-[#7B5A45] mt-2">
                    Click again to reverse a step. Use <b>Undo</b> for last action. Goodbye done will auto-close out.
                  </p>
                </div>

                {/* Add-ons + cheese placement */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="rounded-xl border border-[#F0E0CF] bg-[#FDF8F2] p-3">
                    <div className="text-xs font-semibold text-[#7B5A45] mb-2">Add-ons</div>
                    <div className="space-y-2 text-sm text-[#3B2620]">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedTable.addOns.sparklingWater}
                          onChange={(e) =>
                            updateTable(selectedTable.id, {
                              addOns: { ...selectedTable.addOns, sparklingWater: e.target.checked },
                            })
                          }
                        />
                        Sparkling water
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedTable.addOns.wineBTG}
                          onChange={(e) =>
                            updateTable(selectedTable.id, {
                              addOns: { ...selectedTable.addOns, wineBTG: e.target.checked },
                            })
                          }
                        />
                        Wine BTG
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedTable.addOns.wineBottle}
                          onChange={(e) =>
                            updateTable(selectedTable.id, {
                              addOns: { ...selectedTable.addOns, wineBottle: e.target.checked },
                            })
                          }
                        />
                        Bottle
                      </label>

                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedTable.addOns.cheeseCourse}
                          onChange={(e) => setCheeseCourse(selectedTable.id, e.target.checked)}
                        />
                        Cheese course
                      </label>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#F0E0CF] bg-white p-3">
                    <div className="text-xs font-semibold text-[#7B5A45] mb-2">Cheese placement</div>
                    <p className="text-[11px] text-[#7B5A45] mb-2">
                      If cheese is enabled, choose where it appears in the flow.
                    </p>
                    <select
                      value={selectedTable.cheesePosition}
                      onChange={(e) => setCheesePosition(selectedTable.id, e.target.value as CheesePosition)}
                      className="w-full rounded-lg border border-[#E0C6AF] bg-[#FDF8F2] px-3 py-2 text-sm text-[#3B2620] focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                    >
                      <option value="after_wine">After wine service</option>
                      <option value="after_starter">After starter</option>
                      <option value="after_entree">After entrée</option>
                    </select>
                  </div>
                </div>

                {/* Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[#7B5A45]">
                      Drinks / wine notes
                    </label>
                    <textarea
                      value={selectedTable.drinks}
                      onChange={(e) => updateTable(selectedTable.id, { drinks: e.target.value })}
                      rows={3}
                      className="w-full rounded-lg border border-[#E0C6AF] bg-[#FDF8F2] px-3 py-2 text-sm text-[#3B2620] focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                      placeholder="BTG / bottle / pairing notes…"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[#7B5A45]">
                      Service notes
                    </label>
                    <textarea
                      value={selectedTable.notes}
                      onChange={(e) => updateTable(selectedTable.id, { notes: e.target.value })}
                      rows={3}
                      className="w-full rounded-lg border border-[#E0C6AF] bg-[#FDF8F2] px-3 py-2 text-sm text-[#3B2620] focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                      placeholder="Pacing, VIP, special occasions, etc."
                    />
                  </div>
                </div>

                {/* Expo timing panel */}
                <div className="rounded-2xl border border-[#E8D4B8] bg-white p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-[#4A1520]" style={{ fontFamily: "Playfair Display, Georgia, serif" }}>
                      Expo timing
                    </h3>
                    <span className="text-[11px] text-[#7B5A45]">
                      Track called → ready → served → cleared
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                    {(["starter", "entree", "dessert"] as CourseKey[]).map((course) => {
                      const times = selectedTable.expo[course];
                      const stage = expoStage(times);

                      return (
                        <div key={course} className="rounded-xl border border-[#F0E0CF] bg-[#FDF8F2] p-3">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-semibold text-[#3B2620] capitalize">
                              {course}
                            </div>
                            <button
                              onClick={() => clearExpoCourse(selectedTable.id, course)}
                              className="text-[11px] text-[#6B1F2F] hover:underline"
                            >
                              Clear
                            </button>
                          </div>

                          <div className="mt-2">
                            <span className={["inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold", stagePillClass(stage.key)].join(" ")}>
                              {stage.label}
                            </span>
                          </div>

                          <div className="mt-3 grid grid-cols-2 gap-2">
                            <button
                              onClick={() => stampExpo(selectedTable.id, course, "calledAt")}
                              className="rounded-lg border border-[#E0C6AF] bg-white px-2 py-2 text-xs hover:bg-[#fff7ee] transition"
                            >
                              Called
                            </button>
                            <button
                              onClick={() => stampExpo(selectedTable.id, course, "readyAt")}
                              className="rounded-lg border border-[#E0C6AF] bg-white px-2 py-2 text-xs hover:bg-[#fff7ee] transition"
                            >
                              Ready
                            </button>
                            <button
                              onClick={() => stampExpo(selectedTable.id, course, "servedAt")}
                              className="rounded-lg border border-[#E0C6AF] bg-white px-2 py-2 text-xs hover:bg-[#fff7ee] transition"
                            >
                              Served
                            </button>
                            <button
                              onClick={() => stampExpo(selectedTable.id, course, "clearedAt")}
                              className="rounded-lg border border-[#E0C6AF] bg-white px-2 py-2 text-xs hover:bg-[#fff7ee] transition"
                            >
                              Cleared
                            </button>
                          </div>

                          <div className="mt-3 text-[11px] text-[#7B5A45] space-y-1">
                            <div className="flex items-center justify-between">
                              <span>Called</span>
                              <span className="font-mono">{times.calledAt ? new Date(times.calledAt).toLocaleTimeString() : "—"}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Ready</span>
                              <span className="font-mono">{times.readyAt ? new Date(times.readyAt).toLocaleTimeString() : "—"}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Served</span>
                              <span className="font-mono">{times.servedAt ? new Date(times.servedAt).toLocaleTimeString() : "—"}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Cleared</span>
                              <span className="font-mono">{times.clearedAt ? new Date(times.clearedAt).toLocaleTimeString() : "—"}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      )}

      {/* Confirm clear modal */}
      {confirmClear.open ? (
        <Modal
          title="Clear table & remove reservation?"
          onCancel={cancelFreeTable}
          onConfirm={confirmFreeTable}
          confirmLabel="Yes, clear it"
        >
          <p className="text-sm text-slate-700">
            This will <b>free Table {confirmClear.tableNum}</b> and reset its service steps/timers.
          </p>
          <p className="text-sm text-slate-700 mt-2">
            Use this if the guest did <b>not</b> arrive or you assigned them by mistake.
          </p>
        </Modal>
      ) : null}

      {/* Confirm closeout modal */}
      {confirmCloseOut.open ? (
        <Modal
          title="Close out this table?"
          onCancel={cancelCloseOut}
          onConfirm={confirmCloseOutYes}
          confirmLabel="Yes, close out"
        >
          <p className="text-sm text-slate-700">
            This will mark <b>Table {confirmCloseOut.tableNum}</b> as completed and move it to the bottom list in muted gray.
          </p>
        </Modal>
      ) : null}
    </MainLayout>
  );
}

// ---------- small UI components ----------
function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "rounded-full px-4 py-2 text-sm border transition",
        active
          ? "bg-[#6B1F2F] text-white border-[#6B1F2F]"
          : "bg-white text-[#6B1F2F] border-[#E8D4B8] hover:bg-[#FDF8F2]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Modal({
  title,
  children,
  onCancel,
  onConfirm,
  confirmLabel,
}: {
  title: string;
  children: React.ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative w-full max-w-lg rounded-2xl bg-white border border-[#E8D4B8] shadow-xl p-5">
        <div
          className="text-lg font-semibold text-[#4A1520]"
          style={{ fontFamily: "Playfair Display, Georgia, serif" }}
        >
          {title}
        </div>
        <div className="mt-3">{children}</div>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg px-3 py-2 text-sm border border-slate-200 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg px-3 py-2 text-sm bg-[#6B1F2F] text-white hover:bg-[#4A1520] transition"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
