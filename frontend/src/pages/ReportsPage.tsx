// src/pages/ReportsPage.tsx
import MainLayout from "@/layouts/MainLayout";

export default function ReportsPage() {
  return (
    <MainLayout
      title="Reports"
      subtitle="Service timing, wine sales, and performance"
    >
      <div className="rounded-2xl border border-[#E8D4B8] bg-white/90 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[#6B1F2F] mb-2">
          Reports (Coming Soon)
        </h2>

        <p className="text-sm text-[#7B5A45]">
          This section will include:
        </p>

        <ul className="mt-3 list-disc pl-5 text-sm text-[#7B5A45] space-y-1">
          <li>Course timing (call → ready → served → cleared)</li>
          <li>Average entrée and table turn times</li>
          <li>Wine sales by table, bottle, and glass</li>
          <li>Expo pacing and service efficiency</li>
        </ul>

        <p className="mt-4 text-xs text-[#B89968] italic">
          Preview placeholder — data will be generated automatically from
          Dinner Service.
        </p>
      </div>
    </MainLayout>
  );
}
