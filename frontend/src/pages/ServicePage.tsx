// src/pages/ServicePage.tsx
import { useEffect, useMemo, useState } from "react";
import MainLayout from "@/layouts/MainLayout";

type ProteinDoneness = "rare" | "medium-rare" | "medium" | "medium-well" | "well" | "n/a";
type ProteinSub = "" | "chicken" | "fish";
type CoffeeTeaChoice = "" | "coffee" | "decaf" | "nespresso" | "tea" | "port";

type StepKey =
  | "seated"
  | "bread_water"
  | "wine_service"
  | "starter"
  | "entree"
  | "coffee_tea"
  | "dessert"
  | "goodbye"
  | "cheese_board";

type StepStatus = "called" | "ready" | "served" | "cleared";

type GuestEntry = {
  id: string;
  name: string;
  allergy: string;
  proteinSub: ProteinSub;
};

type StepTiming = {
  calledAt?: number;
  readyAt?: number;
  servedAt?: number;
  clearedAt?: number;
};

type ServiceFlow = {
  stepIndex: number;
  status: StepStatus; // status of CURRENT step
  // log of actions for undo + review
  history: { stepIndex: number; status: StepStatus; timingsSnapshot: Record<string, StepTiming> }[];
  // timings by stepKey
  timings: Record<string, StepTiming>;
};

interface ServiceTable {
  id: number;
  tableNumber: string; // e.g. T1
  roomNumber?: string;
  reservationTime?: string;

  guestsCount: number;
  guests: GuestEntry[];

  partyLabel: string;

  notes: string;

  // Wine ordering
  bottles: string[];
  btg: string[];

  // Add-ons
  addOns: {
    cheeseBoard: boolean;
    sparklingWater: boolean;
    dessertWine: boolean;
  };

  // Cheese placement (only used when cheeseBoard = true)
  cheesePlacement:
    | "after_seated"
    | "after_bread_water"
    | "after_wine_service"
    | "after_starter"
    | "after_entree"
    | "after_coffee_tea"
    | "after_dessert";

  // Coffee/Tea service
  coffeeTea: {
    enabled: boolean;
    choice: CoffeeTeaChoice;
  };

  substitutions: string;
  protein: ProteinDoneness;

  // New: service flow
  service: ServiceFlow;

  // New: seated order (for list ordering)
  seatedAt?: number;

  // New: table complete
  completedAt?: number;
}

type InventoryItemAny = Record<string, any>;

const API_BASE = "http://localhost:8000/api";
const COMPANY_ID = 1; // TEMP: for preview. Later: derive from auth user/company.

const BTG_OPTIONS = [
  "NV Grower Champagne",
  "2020 Chablis",
  "2021 Sauvignon Blanc",
  "2018 Pinot Noir",
  "2019 Cabernet Sauvignon",
];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function buildGuests(count: number): GuestEntry[] {
  return Array.from({ length: count }).map((_, idx) => ({
    id: `${Date.now()}-${idx}-${uid()}`,
    name: "",
    allergy: "",
    proteinSub: "",
  }));
}

// Best-effort mapping from your InventoryOut -> name field
function getWineName(item: InventoryItemAny) {
  return (
    item.wine_name ||
    item.wineName ||
    item.name ||
    item.label ||
    item.title ||
    item.sku ||
    `Wine #${item.id ?? "—"}`
  );
}

function cloneTimings(t: Record<string, StepTiming>) {
  // deep-ish clone so undo snapshots don’t mutate
  const out: Record<string, StepTiming> = {};
  Object.entries(t).forEach(([k, v]) => {
    out[k] = { ...v };
  });
  return out;
}

function baseSteps(table: ServiceTable): { key: StepKey; label: string }[] {
  const steps: { key: StepKey; label: string }[] = [
    { key: "seated", label: "Seated" },
    { key: "bread_water", label: "Bread & Water" },
    { key: "wine_service", label: "Wine Service" },
    { key: "starter", label: "Starter" },
    { key: "entree", label: "Entree" },
  ];

  // Coffee/Tea step is optional but sits between entree and dessert when enabled
  if (table.coffeeTea.enabled) {
    steps.push({ key: "coffee_tea", label: "Coffee/Tea" });
  }

  steps.push({ key: "dessert", label: "Dessert" });
  steps.push({ key: "goodbye", label: "Goodbye Treat" });

  // Insert cheese board if enabled
  if (table.addOns.cheeseBoard) {
    const cheeseStep = { key: "cheese_board" as StepKey, label: "Cheese Board" };

    const insertAfterKeyMap: Record<ServiceTable["cheesePlacement"], StepKey> = {
      after_seated: "seated",
      after_bread_water: "bread_water",
      after_wine_service: "wine_service",
      after_starter: "starter",
      after_entree: "entree",
      after_coffee_tea: "coffee_tea",
      after_dessert: "dessert",
    };

    const afterKey = insertAfterKeyMap[table.cheesePlacement];

    const idx = steps.findIndex((s) => s.key === afterKey);
    // if not found (coffee_tea disabled but placement is after_coffee_tea), fallback to after_entree
    const safeIdx = idx >= 0 ? idx : steps.findIndex((s) => s.key === "entree");
    steps.splice(safeIdx + 1, 0, cheeseStep);
  }

  return steps;
}

function statusLabel(s: StepStatus) {
  if (s === "called") return "Called";
  if (s === "ready") return "Ready";
  if (s === "served") return "Served";
  return "Cleared";
}

function statusColor(s: StepStatus) {
  // classes chosen to pop but stay brand-friendly
  if (s === "called") return "bg-[#FFF8E3] text-[#8B5A12] border-[#F0E0CF]";
  if (s === "ready") return "bg-[#EEF2FF] text-[#1E3A8A] border-[#E8D4B8]";
  if (s === "served") return "bg-[#ECFDF5] text-[#166534] border-[#D4AF88]";
  return "bg-slate-100 text-slate-600 border-slate-200";
}

function now() {
  return Date.now();
}

function fmtTime(ts?: number) {
  if (!ts) return "—";
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function minsBetween(a?: number, b?: number) {
  if (!a || !b) return null;
  const ms = Math.max(0, b - a);
  return Math.round((ms / 60000) * 10) / 10;
}

function makeServiceFlow(): ServiceFlow {
  return {
    stepIndex: 0,
    status: "called",
    history: [],
    timings: {},
  };
}

const initialTables: ServiceTable[] = [
  {
    id: 1,
    tableNumber: "T1",
    roomNumber: "Cabin 3",
    reservationTime: "6:00 pm",
    guestsCount: 2,
    guests: buildGuests(2),
    partyLabel: "Smith",
    notes: "",
    bottles: [],
    btg: [],
    addOns: { cheeseBoard: false, sparklingWater: false, dessertWine: false },
    cheesePlacement: "after_wine_service",
    coffeeTea: { enabled: false, choice: "" },
    substitutions: "",
    protein: "medium-rare",
    service: makeServiceFlow(),
    seatedAt: now(),
  },
  {
    id: 2,
    tableNumber: "T2",
    roomNumber: "Cabin 7",
    reservationTime: "6:30 pm",
    guestsCount: 4,
    guests: buildGuests(4),
    partyLabel: "Johnson",
    notes: "",
    bottles: [],
    btg: [],
    addOns: { cheeseBoard: true, sparklingWater: false, dessertWine: false },
    cheesePlacement: "after_starter",
    coffeeTea: { enabled: false, choice: "" },
    substitutions: "",
    protein: "medium",
    service: makeServiceFlow(),
    seatedAt: now() + 1000,
  },
];

export default function ServicePage() {
  const [tables, setTables] = useState<ServiceTable[]>(initialTables);
  const [selectedId, setSelectedId] = useState<number | null>(initialTables[0]?.id ?? null);

  const [inventoryWines, setInventoryWines] = useState<string[]>([]);
  const [invLoading, setInvLoading] = useState(false);
  const [invError, setInvError] = useState<string | null>(null);

  const [selectedBottleToAdd, setSelectedBottleToAdd] = useState("");
  const [selectedBtgToAdd, setSelectedBtgToAdd] = useState("");

  const selectedTable = tables.find((t) => t.id === selectedId) ?? null;

  useEffect(() => {
    const fetchInventory = async () => {
      setInvLoading(true);
      setInvError(null);
      try {
        const res = await fetch(`${API_BASE}/inventory/?company_id=${COMPANY_ID}`);
        if (!res.ok) throw new Error(`Inventory failed (${res.status})`);
        const data = (await res.json()) as InventoryItemAny[];

        const names = data
          .map((x) => String(getWineName(x)).trim())
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b));

        setInventoryWines(names);
      } catch (e: any) {
        setInvError(e?.message || "Failed to load inventory wines");
        setInventoryWines([]);
      } finally {
        setInvLoading(false);
      }
    };

    fetchInventory();
  }, []);

  const updateTable = (tableId: number, updater: (t: ServiceTable) => ServiceTable) => {
    setTables((prev) => prev.map((t) => (t.id === tableId ? updater(t) : t)));
  };

  const updateSelected = (patch: Partial<ServiceTable>) => {
    if (!selectedTable) return;
    updateTable(selectedTable.id, (t) => ({
      ...t,
      ...patch,
      addOns: patch.addOns ?? t.addOns,
      coffeeTea: patch.coffeeTea ?? t.coffeeTea,
      guests: patch.guests ?? t.guests,
      service: patch.service ?? t.service,
    }));
  };

  const handleAddOnToggle = (field: keyof ServiceTable["addOns"]) => {
    if (!selectedTable) return;
    updateTable(selectedTable.id, (t) => ({
      ...t,
      addOns: { ...t.addOns, [field]: !t.addOns[field] },
    }));
  };

  const stepsForSelected = useMemo(() => {
    if (!selectedTable) return [];
    return baseSteps(selectedTable);
  }, [selectedTable?.addOns.cheeseBoard, selectedTable?.cheesePlacement, selectedTable?.coffeeTea.enabled]);

  // SERVICE: one click advance (called -> ready -> served -> cleared -> next step)
  const advanceService = () => {
    if (!selectedTable) return;

    updateTable(selectedTable.id, (t) => {
      const steps = baseSteps(t);
      const maxIndex = steps.length - 1;

      const currentStep = steps[t.service.stepIndex];
      if (!currentStep) return t;

      // snapshot for undo
      const snapshot = {
        stepIndex: t.service.stepIndex,
        status: t.service.status,
        timingsSnapshot: cloneTimings(t.service.timings),
      };

      const nextService: ServiceFlow = {
        ...t.service,
        history: [...t.service.history, snapshot],
        timings: { ...t.service.timings },
      };

      const key = currentStep.key;
      const timingKey = String(key);
      const currentTiming = nextService.timings[timingKey] || {};

      // mark timestamp for the NEW status we are moving INTO
      const setTimingFor = (status: StepStatus) => {
        const ts = now();
        if (status === "called") currentTiming.calledAt = currentTiming.calledAt ?? ts;
        if (status === "ready") currentTiming.readyAt = currentTiming.readyAt ?? ts;
        if (status === "served") currentTiming.servedAt = currentTiming.servedAt ?? ts;
        if (status === "cleared") currentTiming.clearedAt = currentTiming.clearedAt ?? ts;
        nextService.timings[timingKey] = { ...currentTiming };
      };

      if (nextService.status === "called") {
        nextService.status = "ready";
        setTimingFor("ready");
      } else if (nextService.status === "ready") {
        nextService.status = "served";
        setTimingFor("served");
      } else if (nextService.status === "served") {
        nextService.status = "cleared";
        setTimingFor("cleared");
      } else {
        // cleared -> move to next step
        if (nextService.stepIndex < maxIndex) {
          nextService.stepIndex = nextService.stepIndex + 1;
          nextService.status = "called";
          const nextKey = String(steps[nextService.stepIndex].key);
          const nextTiming = nextService.timings[nextKey] || {};
          nextTiming.calledAt = nextTiming.calledAt ?? now();
          nextService.timings[nextKey] = { ...nextTiming };
        } else {
          // last step cleared -> mark completed
          return {
            ...t,
            completedAt: t.completedAt ?? now(),
            service: nextService,
          };
        }
      }

      // Ensure calledAt exists for current step when it first becomes active
      const ensureCalledAt = () => {
        const activeKey = String(steps[nextService.stepIndex].key);
        const activeTiming = nextService.timings[activeKey] || {};
        activeTiming.calledAt = activeTiming.calledAt ?? now();
        nextService.timings[activeKey] = { ...activeTiming };
      };
      ensureCalledAt();

      return { ...t, service: nextService };
    });
  };

  const undoService = () => {
    if (!selectedTable) return;

    updateTable(selectedTable.id, (t) => {
      const history = t.service.history;
      if (!history.length) return t;

      const last = history[history.length - 1];
      return {
        ...t,
        completedAt: undefined, // if you undo completion, remove completed state
        service: {
          ...t.service,
          stepIndex: last.stepIndex,
          status: last.status,
          timings: cloneTimings(last.timingsSnapshot),
          history: history.slice(0, history.length - 1),
        },
      };
    });
  };

  const setGuestsCount = (count: number) => {
    if (!selectedTable) return;
    const nextCount = Math.max(1, Math.min(20, count));
    const current = selectedTable.guests ?? [];
    let nextGuests = current.slice(0, nextCount);

    if (nextGuests.length < nextCount) {
      nextGuests = nextGuests.concat(buildGuests(nextCount - nextGuests.length));
    }

    updateSelected({ guestsCount: nextCount, guests: nextGuests });
  };

  const updateGuest = (guestId: string, patch: Partial<GuestEntry>) => {
    if (!selectedTable) return;
    const nextGuests = selectedTable.guests.map((g) => (g.id === guestId ? { ...g, ...patch } : g));
    updateSelected({ guests: nextGuests });
  };

  const addBottle = () => {
    if (!selectedTable) return;
    const wine = selectedBottleToAdd.trim();
    if (!wine) return;
    updateSelected({ bottles: [...selectedTable.bottles, wine] });
    setSelectedBottleToAdd("");
  };

  const removeBottle = (idx: number) => {
    if (!selectedTable) return;
    const next = selectedTable.bottles.slice();
    next.splice(idx, 1);
    updateSelected({ bottles: next });
  };

  const addBtg = () => {
    if (!selectedTable) return;
    const wine = selectedBtgToAdd.trim();
    if (!wine) return;
    updateSelected({ btg: [...selectedTable.btg, wine] });
    setSelectedBtgToAdd("");
  };

  const removeBtg = (idx: number) => {
    if (!selectedTable) return;
    const next = selectedTable.btg.slice();
    next.splice(idx, 1);
    updateSelected({ btg: next });
  };

  const tableBadges = useMemo(() => {
    const map = new Map<number, { hasAllergy: boolean; allergyPreview: string; hasSub: boolean }>();

    tables.forEach((t) => {
      const allergyLines = (t.guests || [])
        .map((g) => g.allergy.trim())
        .filter(Boolean);

      const hasAllergy = allergyLines.length > 0;
      const allergyPreview = hasAllergy ? allergyLines[0].slice(0, 18) : "";

      const hasSub = (t.guests || []).some((g) => g.proteinSub === "chicken" || g.proteinSub === "fish");

      map.set(t.id, { hasAllergy, allergyPreview, hasSub });
    });

    return map;
  }, [tables]);

  // Ordering: active (not completed) first by seatedAt asc; completed muted at bottom
  const orderedTables = useMemo(() => {
    const active = tables
      .filter((t) => !t.completedAt)
      .slice()
      .sort((a, b) => (a.seatedAt ?? 0) - (b.seatedAt ?? 0));
    const done = tables
      .filter((t) => !!t.completedAt)
      .slice()
      .sort((a, b) => (a.seatedAt ?? 0) - (b.seatedAt ?? 0));
    return [...active, ...done];
  }, [tables]);

  const selectedStep = useMemo(() => {
    if (!selectedTable) return null;
    const steps = baseSteps(selectedTable);
    return steps[selectedTable.service.stepIndex] || null;
  }, [selectedTable]);

  const selectedTiming = useMemo(() => {
    if (!selectedTable || !selectedStep) return null;
    return selectedTable.service.timings[String(selectedStep.key)] || {};
  }, [selectedTable, selectedStep]);

  const entreeTiming = useMemo(() => {
    if (!selectedTable) return null;
    const t = selectedTable.service.timings["entree"] || {};
    return {
      called: t.calledAt,
      ready: t.readyAt,
      served: t.servedAt,
      cleared: t.clearedAt,
    };
  }, [selectedTable]);

  return (
    <MainLayout title="Dinner Service" subtitle="One-click service flow + wines + guest notes">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.6fr)]">
        {/* Tables list */}
        <aside className="rounded-2xl bg-white/90 border border-[#E8D4B8] shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-[#E8D4B8] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#4A1520]" style={{ fontFamily: "Playfair Display, Georgia, serif" }}>
                Tonight&apos;s Tables
              </h2>
              <p className="text-[11px] text-[#7B5A45] mt-0.5">
                Shows current step + status. Completed tables move to bottom.
              </p>
            </div>
            <span className="text-[11px] text-[#7B5A45]">{tables.length} total</span>
          </div>

          <div className="divide-y divide-[#F0E0CF]">
            {orderedTables.map((table) => {
              const isActive = table.id === selectedId;
              const badges = tableBadges.get(table.id);

              const steps = baseSteps(table);
              const step = steps[table.service.stepIndex];
              const stepLabel = step?.label ?? "—";
              const stLabel = statusLabel(table.service.status);

              const isDone = !!table.completedAt;

              return (
                <button
                  key={table.id}
                  onClick={() => setSelectedId(table.id)}
                  className={[
                    "w-full text-left px-4 py-3 transition flex flex-col gap-2",
                    isDone
                      ? "bg-slate-50 text-slate-500"
                      : isActive
                      ? "bg-[#6B1F2F] text-[#FDF7EE]"
                      : "hover:bg-[#FDF8F2] text-[#3B2620]",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold">
                        {table.tableNumber}{" "}
                        <span className={isActive ? "opacity-90" : "text-[#7B5A45]"}>
                          • {table.roomNumber || "No room"} {table.reservationTime ? `• ${table.reservationTime}` : ""}
                        </span>
                      </div>

                      <div className={isActive ? "text-[11px] opacity-90" : "text-[11px] text-[#7B5A45]"}>
                        Party: <span className="font-semibold">{table.partyLabel || "—"}</span> • {table.guestsCount}{" "}
                        {table.guestsCount === 1 ? "guest" : "guests"}
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span
                          className={[
                            "text-[11px] px-2 py-0.5 rounded-full border font-semibold",
                            isDone ? "bg-slate-100 text-slate-600 border-slate-200" : statusColor(table.service.status),
                          ].join(" ")}
                        >
                          {stepLabel}: {stLabel}
                        </span>

                        {badges?.hasAllergy && (
                          <span
                            className={[
                              "text-[10px] px-2 py-0.5 rounded-full font-semibold border",
                              isActive ? "bg-[#FDE4E2] text-[#8E2525] border-[#F0E0CF]" : "bg-[#FDEBE8] text-[#8E2525] border-[#F0E0CF]",
                            ].join(" ")}
                            title={badges.allergyPreview}
                          >
                            ⚠ Allergy{badges.allergyPreview ? `: ${badges.allergyPreview}…` : ""}
                          </span>
                        )}

                        {badges?.hasSub && (
                          <span
                            className={[
                              "text-[10px] px-2 py-0.5 rounded-full font-semibold border",
                              isActive ? "bg-[#EEF2FF] text-[#1E3A8A] border-[#E8D4B8]" : "bg-[#EEF2FF] text-[#1E3A8A] border-[#E8D4B8]",
                            ].join(" ")}
                          >
                            Protein Sub
                          </span>
                        )}
                      </div>
                    </div>

                    {isDone ? (
                      <span className="text-[11px] text-slate-500">Completed</span>
                    ) : (
                      <span className="text-[11px] text-[#7B5A45]">{table.service.history.length ? "Live" : "New"}</span>
                    )}
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
              {/* Top controls: one-click + undo */}
              <div className="rounded-2xl border border-[#E8D4B8] bg-white p-4 mb-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-[#4A1520]" style={{ fontFamily: "Playfair Display, Georgia, serif" }}>
                      One-click service control
                    </div>
                    <div className="text-[11px] text-[#7B5A45] mt-0.5">
                      Advances status + step automatically. Undo reverses the last click.
                    </div>
                    {selectedStep ? (
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className={`text-[12px] px-2.5 py-1 rounded-full border font-semibold ${statusColor(selectedTable.service.status)}`}>
                          {selectedStep.label}: {statusLabel(selectedTable.service.status)}
                        </span>
                        <span className="text-[11px] text-[#7B5A45]">
                          Called: {fmtTime(selectedTiming?.calledAt)} • Ready: {fmtTime(selectedTiming?.readyAt)} • Served:{" "}
                          {fmtTime(selectedTiming?.servedAt)} • Cleared: {fmtTime(selectedTiming?.clearedAt)}
                        </span>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={undoService}
                      disabled={!selectedTable.service.history.length}
                      className="rounded-lg px-3 py-2 text-sm border border-[#E8D4B8] bg-white hover:bg-[#FDF8F2] disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ color: "#6B1F2F" }}
                    >
                      Undo
                    </button>

                    <button
                      type="button"
                      onClick={advanceService}
                      className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
                      style={{ backgroundColor: "#6B1F2F" }}
                    >
                      Next
                    </button>
                  </div>
                </div>

                {/* Entree timing quick view */}
                <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
                  <TimeChip label="Entree Called" value={fmtTime(entreeTiming?.called)} />
                  <TimeChip label="Entree Ready" value={fmtTime(entreeTiming?.ready)} />
                  <TimeChip label="Entree Served" value={fmtTime(entreeTiming?.served)} />
                  <TimeChip label="Entree Minutes (Called→Served)" value={`${minsBetween(entreeTiming?.called, entreeTiming?.served) ?? "—"}`} />
                </div>
              </div>

              {/* Party / guest controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-[#7B5A45]">Party label (last name)</label>
                  <input
                    type="text"
                    value={selectedTable.partyLabel}
                    onChange={(e) => updateSelected({ partyLabel: e.target.value })}
                    className="w-full rounded-lg border border-[#E0C6AF] bg-[#FDF8F2] px-3 py-2 text-sm text-[#3B2620] focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-[#7B5A45]">Room / cabin</label>
                  <input
                    type="text"
                    value={selectedTable.roomNumber ?? ""}
                    onChange={(e) => updateSelected({ roomNumber: e.target.value })}
                    className="w-full rounded-lg border border-[#E0C6AF] bg-[#FDF8F2] px-3 py-2 text-sm text-[#3B2620] focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-[#7B5A45]">Guests</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setGuestsCount(selectedTable.guestsCount - 1)}
                      className="rounded-lg border border-[#E0C6AF] bg-white px-3 py-2 text-sm hover:bg-[#FDF8F2]"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={selectedTable.guestsCount}
                      onChange={(e) => setGuestsCount(Number(e.target.value || 1))}
                      className="w-full rounded-lg border border-[#E0C6AF] bg-[#FDF8F2] px-3 py-2 text-sm text-[#3B2620] focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                    />
                    <button
                      type="button"
                      onClick={() => setGuestsCount(selectedTable.guestsCount + 1)}
                      className="rounded-lg border border-[#E0C6AF] bg-white px-3 py-2 text-sm hover:bg-[#FDF8F2]"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Guests at table: allergies + protein subs */}
              <div className="rounded-2xl border border-[#E8D4B8] bg-white p-4 mb-5">
                <div>
                  <div className="text-sm font-semibold text-[#4A1520]" style={{ fontFamily: "Playfair Display, Georgia, serif" }}>
                    Guests at table
                  </div>
                  <div className="text-[11px] text-[#7B5A45] mt-0.5">
                    Allergies + protein subs show as badges on the left list (no click needed).
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  {selectedTable.guests.map((g, idx) => (
                    <div
                      key={g.id}
                      className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,0.7fr)] gap-2 rounded-xl border px-3 py-2"
                      style={{ borderColor: "#F0E0CF" }}
                    >
                      <div>
                        <label className="block text-[11px] font-semibold mb-1 text-[#7B5A45]">Guest {idx + 1} name</label>
                        <input
                          value={g.name}
                          onChange={(e) => updateGuest(g.id, { name: e.target.value })}
                          className="w-full rounded-lg border border-[#E0C6AF] bg-[#FDF8F2] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                          placeholder="(optional)"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold mb-1 text-[#7B5A45]">Allergies</label>
                        <input
                          value={g.allergy}
                          onChange={(e) => updateGuest(g.id, { allergy: e.target.value })}
                          className="w-full rounded-lg border border-[#E0C6AF] bg-[#FDF8F2] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                          placeholder="No nuts, dairy, no garlic…"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold mb-1 text-[#7B5A45]">Protein sub</label>
                        <select
                          value={g.proteinSub}
                          onChange={(e) => updateGuest(g.id, { proteinSub: e.target.value as ProteinSub })}
                          className="w-full rounded-lg border border-[#E0C6AF] bg-[#FDF8F2] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                        >
                          <option value="">None</option>
                          <option value="chicken">Chicken</option>
                          <option value="fish">Fish</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add-ons + placements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <div className="rounded-2xl border border-[#E8D4B8] bg-white p-4">
                  <div className="text-sm font-semibold text-[#4A1520]" style={{ fontFamily: "Playfair Display, Georgia, serif" }}>
                    Add-ons
                  </div>

                  <div className="mt-3 space-y-2 text-sm text-[#3B2620]">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={selectedTable.addOns.cheeseBoard} onChange={() => handleAddOnToggle("cheeseBoard")} />
                      Cheese board
                    </label>

                    {selectedTable.addOns.cheeseBoard ? (
                      <div className="pl-6">
                        <label className="block text-[11px] font-semibold mb-1 text-[#7B5A45]">Insert cheese board</label>
                        <select
                          value={selectedTable.cheesePlacement}
                          onChange={(e) => updateSelected({ cheesePlacement: e.target.value as any })}
                          className="w-full rounded-lg border border-[#E0C6AF] bg-[#FDF8F2] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                        >
                          <option value="after_seated">After Seated</option>
                          <option value="after_bread_water">After Bread & Water</option>
                          <option value="after_wine_service">After Wine Service</option>
                          <option value="after_starter">After Starter</option>
                          <option value="after_entree">After Entree</option>
                          <option value="after_coffee_tea">After Coffee/Tea</option>
                          <option value="after_dessert">After Dessert</option>
                        </select>
                        <div className="text-[11px] text-[#7B5A45] mt-1">
                          This creates a “Cheese Board” step in the one-click flow.
                        </div>
                      </div>
                    ) : null}

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedTable.addOns.sparklingWater}
                        onChange={() => handleAddOnToggle("sparklingWater")}
                      />
                      Sparkling water
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={selectedTable.addOns.dessertWine} onChange={() => handleAddOnToggle("dessertWine")} />
                      Dessert wine
                    </label>
                  </div>
                </div>

                {/* Coffee/Tea service */}
                <div className="rounded-2xl border border-[#E8D4B8] bg-white p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold text-[#4A1520]" style={{ fontFamily: "Playfair Display, Georgia, serif" }}>
                        Coffee / Tea service
                      </div>
                      <div className="text-[11px] text-[#7B5A45] mt-0.5">Optional step between entree and dessert</div>
                    </div>

                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedTable.coffeeTea.enabled}
                        onChange={() =>
                          updateSelected({
                            coffeeTea: {
                              ...selectedTable.coffeeTea,
                              enabled: !selectedTable.coffeeTea.enabled,
                              ...(selectedTable.coffeeTea.enabled ? { choice: "" } : {}),
                            },
                          })
                        }
                      />
                      Enable
                    </label>
                  </div>

                  {selectedTable.coffeeTea.enabled ? (
                    <div className="mt-3 space-y-2">
                      <label className="block text-[11px] font-semibold mb-1 text-[#7B5A45]">Coffee / Tea choice</label>
                      <select
                        value={selectedTable.coffeeTea.choice}
                        onChange={(e) => updateSelected({ coffeeTea: { ...selectedTable.coffeeTea, choice: e.target.value as CoffeeTeaChoice } })}
                        className="w-full rounded-lg border border-[#E0C6AF] bg-[#FDF8F2] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                      >
                        <option value="">Select…</option>
                        <option value="coffee">Coffee</option>
                        <option value="decaf">Decaf</option>
                        <option value="nespresso">Nespresso</option>
                        <option value="tea">Tea</option>
                        <option value="port">Port wine</option>
                      </select>

                      <div className="text-[11px] text-[#7B5A45]">
                        Turning this on adds “Coffee/Tea” to the one-click flow.
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 text-xs text-slate-500">Off</div>
                  )}
                </div>
              </div>

              {/* Wines */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                {/* Bottles */}
                <div className="rounded-2xl border border-[#E8D4B8] bg-white p-4">
                  <div>
                    <div className="text-sm font-semibold text-[#4A1520]" style={{ fontFamily: "Playfair Display, Georgia, serif" }}>
                      Bottles
                    </div>
                    <div className="text-[11px] text-[#7B5A45] mt-0.5">
                      Choose from inventory{invLoading ? " (loading…)" : ""}{invError ? ` (error: ${invError})` : ""}
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <select
                      value={selectedBottleToAdd}
                      onChange={(e) => setSelectedBottleToAdd(e.target.value)}
                      className="w-full rounded-lg border border-[#E0C6AF] bg-[#FDF8F2] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                    >
                      <option value="">Select bottle…</option>
                      {inventoryWines.map((w) => (
                        <option key={w} value={w}>
                          {w}
                        </option>
                      ))}
                    </select>
                    <button type="button" onClick={addBottle} className="rounded-lg px-3 py-2 text-sm font-semibold text-white" style={{ backgroundColor: "#6B1F2F" }}>
                      Add
                    </button>
                  </div>

                  {selectedTable.bottles.length ? (
                    <div className="mt-3 space-y-2">
                      {selectedTable.bottles.map((b, idx) => (
                        <div key={`${b}-${idx}`} className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2" style={{ borderColor: "#F0E0CF" }}>
                          <div className="text-sm text-slate-800">{b}</div>
                          <button
                            type="button"
                            onClick={() => removeBottle(idx)}
                            className="text-xs px-2 py-1 rounded border hover:bg-slate-50"
                            style={{ borderColor: "#E8D4B8", color: "#6B1F2F" }}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-3 text-xs text-slate-500">No bottle orders yet.</div>
                  )}
                </div>

                {/* BTG */}
                <div className="rounded-2xl border border-[#E8D4B8] bg-white p-4">
                  <div>
                    <div className="text-sm font-semibold text-[#4A1520]" style={{ fontFamily: "Playfair Display, Georgia, serif" }}>
                      By the glass
                    </div>
                    <div className="text-[11px] text-[#7B5A45] mt-0.5">
                      Temporary list (next: make this configurable per company)
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <select
                      value={selectedBtgToAdd}
                      onChange={(e) => setSelectedBtgToAdd(e.target.value)}
                      className="w-full rounded-lg border border-[#E0C6AF] bg-[#FDF8F2] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                    >
                      <option value="">Select BTG…</option>
                      {BTG_OPTIONS.map((w) => (
                        <option key={w} value={w}>
                          {w}
                        </option>
                      ))}
                    </select>
                    <button type="button" onClick={addBtg} className="rounded-lg px-3 py-2 text-sm font-semibold text-white" style={{ backgroundColor: "#6B1F2F" }}>
                      Add
                    </button>
                  </div>

                  {selectedTable.btg.length ? (
                    <div className="mt-3 space-y-2">
                      {selectedTable.btg.map((b, idx) => (
                        <div key={`${b}-${idx}`} className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2" style={{ borderColor: "#F0E0CF" }}>
                          <div className="text-sm text-slate-800">{b}</div>
                          <button
                            type="button"
                            onClick={() => removeBtg(idx)}
                            className="text-xs px-2 py-1 rounded border hover:bg-slate-50"
                            style={{ borderColor: "#E8D4B8", color: "#6B1F2F" }}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-3 text-xs text-slate-500">No BTG orders yet.</div>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-[#7B5A45]">Substitutions (table-wide)</label>
                  <textarea
                    value={selectedTable.substitutions}
                    onChange={(e) => updateSelected({ substitutions: e.target.value })}
                    rows={3}
                    className="w-full rounded-lg border border-[#E0C6AF] bg-[#FDF8F2] px-3 py-2 text-sm text-[#3B2620] focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-[#7B5A45]">Service notes</label>
                  <textarea
                    value={selectedTable.notes}
                    onChange={(e) => updateSelected({ notes: e.target.value })}
                    rows={3}
                    className="w-full rounded-lg border border-[#E0C6AF] bg-[#FDF8F2] px-3 py-2 text-sm text-[#3B2620] focus:outline-none focus:ring-2 focus:ring-[#6B1F2F]/40"
                  />
                </div>
              </div>

              {/* Doneness */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-[#7B5A45]">Protein doneness</label>
                  <select
                    value={selectedTable.protein}
                    onChange={(e) => updateSelected({ protein: e.target.value as ProteinDoneness })}
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

                <div className="rounded-2xl border border-[#E8D4B8] bg-white p-4">
                  <div className="text-sm font-semibold text-[#4A1520]" style={{ fontFamily: "Playfair Display, Georgia, serif" }}>
                    Steps included for this table
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {stepsForSelected.map((s) => (
                      <span key={s.key} className="text-[11px] px-2 py-1 rounded-full border bg-[#FDF8F2] border-[#E8D4B8] text-[#4A1520]">
                        {s.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-[#7B5A45]">Select a table on the left to view or edit its details.</p>
          )}
        </section>
      </div>
    </MainLayout>
  );
}

function TimeChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#E8D4B8] bg-[#FDF8F2] px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-[#7B5A45]">{label}</div>
      <div className="text-sm font-semibold text-[#4A1520]">{value}</div>
    </div>
  );
}
