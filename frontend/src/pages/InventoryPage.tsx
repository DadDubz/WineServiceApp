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
=======
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';

const InventoryPage = () => {
  const [wines, setWines] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWines();
  }, []);

  const fetchWines = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(`${API_BASE}/wines/`);
      const data = await response.json();
      setWines(data);
    } catch (error) {
      console.error('Failed to fetch wines:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredWines = wines.filter(wine =>
    wine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wine.varietal?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wine.region?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#6B1F2F', fontFamily: 'Playfair Display, Georgia, serif', marginBottom: '8px' }}>
            🍷 Wine Inventory
          </h1>
          <p style={{ color: '#B89968', fontSize: '16px' }}>
            Browse and manage your wine collection
          </p>
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: '24px' }}>
          <input
            type="text"
            placeholder="Search wines by name, varietal, or region..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '500px',
              padding: '14px 20px',
              borderRadius: '10px',
              border: '2px solid #D4AF88',
              fontSize: '16px',
              backgroundColor: '#FEFEFE',
              outline: 'none',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#6B1F2F')}
            onBlur={(e) => (e.target.style.borderColor = '#D4AF88')}
          />
        </div>

        {/* Wine Grid */}
        {loading ? (
          <p style={{ color: '#B89968', fontSize: '18px', textAlign: 'center', padding: '60px' }}>
            Loading wines...
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {filteredWines.map((wine) => (
              <div
                key={wine.id}
                style={{
                  backgroundColor: '#FEFEFE',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  border: '1px solid #E8D4B8',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(107,31,47,0.15)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#6B1F2F', marginBottom: '4px', fontFamily: 'Playfair Display, Georgia, serif' }}>
                      {wine.name}
                    </h3>
                    <p style={{ color: '#B89968', fontSize: '14px', fontWeight: '600' }}>
                      {wine.vintage}
                    </p>
                  </div>
                  <span style={{ fontSize: '32px' }}>🍷</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  {wine.varietal && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>🍇</span>
                      <span style={{ color: '#6B1F2F', fontSize: '14px' }}>
                        <strong>Varietal:</strong> {wine.varietal}
                      </span>
                    </div>
                  )}
                  {wine.region && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>📍</span>
                      <span style={{ color: '#6B1F2F', fontSize: '14px' }}>
                        <strong>Region:</strong> {wine.region}
                      </span>
                    </div>
                  )}
                </div>

                {wine.notes && (
                  <div
                    style={{
                      borderTop: '1px solid #E8D4B8',
                      paddingTop: '12px',
                      marginTop: '12px',
                    }}
                  >
                    <p style={{ color: '#B89968', fontSize: '13px', lineHeight: '1.6', fontStyle: 'italic' }}>
                      {wine.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!loading && filteredWines.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <p style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</p>
            <p style={{ color: '#B89968', fontSize: '18px' }}>
              No wines found matching "{searchTerm}"
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default InventoryPage;