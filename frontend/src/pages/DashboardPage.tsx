// src/pages/DashboardPage.tsx
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [wines, setWines] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [guests, setGuests] = useState<any[]>([]);

  useEffect(() => {
    // Get user from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }

    // Fetch data
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    try {
      const [winesRes, tablesRes, guestsRes] = await Promise.all([
        fetch(`${API_BASE}/wines/`),
        fetch(`${API_BASE}/tables/`),
        fetch(`${API_BASE}/guests/`),
      ]);
      setWines(await winesRes.json());
      setTables(await tablesRes.json());
      setGuests(await guestsRes.json());
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    }
  };

  return (
    <Layout>
      <div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div 
            className="rounded-xl p-6 shadow-lg"
            style={{ backgroundColor: '#FEFEFE' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold" style={{ color: '#B89968' }}>
                  Total Wines
                </p>
                <p className="text-3xl font-bold mt-2" style={{ color: '#6B1F2F' }}>
                  {wines.length}
                </p>
              </div>
              <div className="text-4xl">🍾</div>
            </div>
          </div>

          <div 
            className="rounded-xl p-6 shadow-lg"
            style={{ backgroundColor: '#FEFEFE' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold" style={{ color: '#B89968' }}>
                  Active Tables
                </p>
                <p className="text-3xl font-bold mt-2" style={{ color: '#6B1F2F' }}>
                  0
                </p>
              </div>
              <div className="text-4xl">🍽️</div>
            </div>
          </div>

          <div 
            className="rounded-xl p-6 shadow-lg"
            style={{ backgroundColor: '#FEFEFE' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold" style={{ color: '#B89968' }}>
                  User Role
                </p>
                <p className="text-xl font-bold mt-2 capitalize" style={{ color: '#6B1F2F' }}>
                  {user?.role || 'Guest'}
                </p>
              </div>
              <div className="text-4xl">👤</div>
            </div>
          </div>
        </div>

        {/* Wine Inventory */}
        <div 
          className="rounded-xl shadow-lg p-6"
          style={{ backgroundColor: '#FEFEFE' }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 
              className="text-2xl font-bold"
              style={{ 
                color: '#6B1F2F',
                fontFamily: 'Playfair Display, Georgia, serif'
              }}
            >
              Wine Inventory
            </h2>
            <span className="text-3xl">🍇</span>
          </div>

          {wines.length === 0 ? (
            <p className="text-center py-8" style={{ color: '#B89968' }}>
              Loading wines...
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {wines.map((wine) => (
                <div
                  key={wine.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  style={{ borderColor: '#D4AF88' }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 
                      className="font-bold text-lg"
                      style={{ color: '#6B1F2F' }}
                    >
                      {wine.name}
                    </h3>
                    <span className="text-2xl">🍷</span>
                  </div>
                  <p className="text-sm mb-1" style={{ color: '#B89968' }}>
                    <strong>Vintage:</strong> {wine.vintage || 'N/A'}
                  </p>
                  <p className="text-sm mb-1" style={{ color: '#B89968' }}>
                    <strong>Varietal:</strong> {wine.varietal || 'N/A'}
                  </p>
                  <p className="text-sm mb-2" style={{ color: '#B89968' }}>
                    <strong>Region:</strong> {wine.region || 'N/A'}
                  </p>
                  {wine.notes && (
                    <p className="text-xs italic mt-2 pt-2" style={{ 
                      color: '#6B1F2F',
                      borderTop: '1px solid #E8D4B8'
                    }}>
                      {wine.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
