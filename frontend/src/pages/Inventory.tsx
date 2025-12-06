// src/pages/InventoryPage.tsx
import MainLayout from "@/layouts/MainLayout";

export default function InventoryPage() {
  return (
    <MainLayout
      title="Wine Inventory"
      subtitle="Cellar overview and bottle tracking"
    >
      <div
        className="rounded-xl shadow-lg p-6"
        style={{ backgroundColor: "#FEFEFE" }}
      >
        <h2
          className="text-2xl font-bold mb-4"
          style={{
            color: "#6B1F2F",
            fontFamily: "Playfair Display, Georgia, serif",
          }}
        >
          Inventory (coming next)
        </h2>
        <p className="text-sm text-gray-700 mb-4">
          This screen will show all wines with counts, par levels, and cost/sell
          pricing. For now, it’s just a placeholder while we get the Dinner
          Service screen dialed in.
        </p>

        <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
          <li>Wine list by category (sparkling, white, red, dessert).</li>
          <li>Search and filters by region / varietal / vintage.</li>
          <li>Ability to adjust counts after service.</li>
        </ul>
      </div>
    </MainLayout>
  );
}
