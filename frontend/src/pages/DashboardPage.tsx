// src/pages/DashboardPage.tsx
import MainLayout from "@/layouts/MainLayout";

export default function DashboardPage() {
  return (
    <MainLayout
      title="Dashboard"
      subtitle="Tonight’s overview of guests, wine, and service"
    >
      {/* Top row - key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <CardStat label="Covers" value="32" sub="Booked for tonight" />
        <CardStat label="Open Tables" value="5" sub="Not yet seated" />
        <CardStat label="Bottles On Hand" value="184" sub="All SKUs" />
      </div>

      {/* Second row - split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: upcoming tables */}
        <div className="lg:col-span-2 space-y-4">
          <SectionTitle title="Upcoming Seatings" />
          <div className="divide-y rounded-xl border" style={{ borderColor: "#E8D4B8" }}>
            {[
              {
                table: "T1",
                room: "Cabin 3",
                time: "6:00 pm",
                guests: 2,
                notes: "Anniversary, enjoys Burgundy.",
              },
              {
                table: "T2",
                room: "Cabin 7",
                time: "6:30 pm",
                guests: 4,
                notes: "One guest gluten-free.",
              },
              {
                table: "T3",
                room: "Suite 1",
                time: "7:00 pm",
                guests: 2,
                notes: "Prefers dry white wines.",
              },
            ].map((t) => (
              <div
                key={t.table}
                className="flex items-start justify-between gap-3 px-4 py-3"
              >
                <div>
                  <div className="text-sm font-semibold text-slate-800">
                    {t.table} • {t.room}
                  </div>
                  <div className="text-xs text-slate-500">
                    {t.guests} guests • {t.time}
                  </div>
                  <div className="mt-1 text-xs text-slate-600">{t.notes}</div>
                </div>
                <button className="self-center text-xs px-3 py-1 rounded-full border border-slate-300 hover:bg-slate-50">
                  Open in Service
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: wine notes */}
        <div className="space-y-4">
          <SectionTitle title="Featured Wines" />
          <div className="space-y-3 text-sm">
            <WineCard
              name="2018 Pinot Noir"
              region="Willamette Valley"
              notes="Silky red fruit, subtle oak – ideal for lighter mains and poultry."
            />
            <WineCard
              name="2020 Chablis"
              region="Burgundy"
              notes="Bright acidity, saline edge – pour with halibut, scallops, or crudités."
            />
            <WineCard
              name="NV Grower Champagne"
              region="Montagne de Reims"
              notes="Use as aperitif; offer bottle upgrade for celebrations."
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function CardStat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border shadow-sm px-4 py-3" style={{ borderColor: "#E8D4B8" }}>
      <div className="text-[11px] uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div
        className="mt-1 text-2xl font-semibold"
        style={{ color: "#6B1F2F", fontFamily: "Playfair Display, Georgia, serif" }}
      >
        {value}
      </div>
      {sub && <div className="mt-1 text-xs text-slate-500">{sub}</div>}
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2
        className="text-sm font-semibold"
        style={{ color: "#4A0E1E", fontFamily: "Playfair Display, Georgia, serif" }}
      >
        {title}
      </h2>
    </div>
  );
}

function WineCard({
  name,
  region,
  notes,
}: {
  name: string;
  region: string;
  notes: string;
}) {
  return (
    <div className="rounded-lg border px-3 py-2" style={{ borderColor: "#E8D4B8" }}>
      <div className="flex justify-between items-baseline gap-2">
        <div className="text-sm font-medium text-slate-800">{name}</div>
        <div className="text-[11px] uppercase tracking-wide text-slate-500">
          {region}
        </div>
      </div>
      <p className="mt-1 text-xs text-slate-600">{notes}</p>
    </div>
  );
}
