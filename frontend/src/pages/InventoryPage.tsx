// src/pages/InventoryPage.tsx
import MainLayout from "@/layouts/MainLayout";

export default function InventoryPage() {
  return (
    <MainLayout
      title="Wine Inventory"
      subtitle="Cellar overview, counts and costing (coming soon)"
    >
      <div className="rounded-2xl border border-[#E8D4B8] bg-white/90 shadow-sm p-6">
        <h2
          className="text-lg font-semibold mb-3 text-[#4A1520]"
          style={{ fontFamily: "Playfair Display, Georgia, serif" }}
        >
          Inventory module coming next
        </h2>
        <p className="text-sm text-[#7B5A45] mb-4">
          This screen will show all wines with current stock, par levels,
          cost-per-bottle and sell price. After service you can adjust counts
          and automatically calculate usage and cost of goods.
        </p>

        <ul className="text-sm text-[#7B5A45] list-disc pl-5 space-y-1">
          <li>Filter by category (sparkling, white, red, dessert).</li>
          <li>Track by-the-glass vs bottle-only SKUs.</li>
          <li>Flag low or out-of-stock wines automatically.</li>
          <li>Export nightly usage reports for management.</li>
        </ul>
      </div>
    </MainLayout>
  );
}
