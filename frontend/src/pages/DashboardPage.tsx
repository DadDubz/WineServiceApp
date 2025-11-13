// src/pages/DashboardPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [wines, setWines] = useState<any[]>([]);

  useEffect(() => {
    // Get user from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }

    // Fetch wines
    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    fetch(`${API_BASE}/wines/`)
      .then(res => res.json())
      .then(data => setWines(data))
      .catch(err => console.error('Failed to fetch wines:', err));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F5F0' }}>
      {/* Header */}
      <header 
        className="shadow-md"
        style={{ backgroundColor: '#6B1F2F' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">🍷</span>
              <div>
                <h1 
                  className="text-2xl font-bold"
                  style={{ 
                    color: '#FEFEFE',
                    fontFamily: 'Playfair Display, Georgia, serif'
                  }}
                >
                  Wine Service Dashboard
                </h1>
                <p className="text-sm" style={{ color: '#E8D4B8' }}>
                  Welcome back, {user?.username || 'Guest'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg font-semibold transition-all"
              style={{ 
                backgroundColor: '#D4AF88',
                color: '#6B1F2F'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E8D4B8'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#D4AF88'}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
