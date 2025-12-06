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
        {/* Welcome Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#6B1F2F', fontFamily: 'Playfair Display, Georgia, serif', marginBottom: '8px' }}>
            Welcome, {user?.username || 'Guest'}!
          </h1>
          <p style={{ color: '#B89968', fontSize: '16px' }}>
            Here's your service overview for today
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div style={{ backgroundColor: '#FEFEFE', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #E8D4B8' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#B89968', marginBottom: '8px' }}>
                  Total Wines
                </p>
                <p style={{ fontSize: '36px', fontWeight: '700', color: '#6B1F2F' }}>
                  {wines.length}
                </p>
              </div>
              <div style={{ fontSize: '48px' }}>🍾</div>
            </div>
          </div>

          <div style={{ backgroundColor: '#FEFEFE', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #E8D4B8' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#B89968', marginBottom: '8px' }}>
                  Tables
                </p>
                <p style={{ fontSize: '36px', fontWeight: '700', color: '#6B1F2F' }}>
                  {tables.length}
                </p>
              </div>
              <div style={{ fontSize: '48px' }}>🍽️</div>
            </div>
          </div>

          <div style={{ backgroundColor: '#FEFEFE', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #E8D4B8' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#B89968', marginBottom: '8px' }}>
                  Guests
                </p>
                <p style={{ fontSize: '36px', fontWeight: '700', color: '#6B1F2F' }}>
                  {guests.length}
                </p>
              </div>
              <div style={{ fontSize: '48px' }}>👥</div>
            </div>
          </div>

          <div style={{ backgroundColor: '#FEFEFE', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #E8D4B8' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#B89968', marginBottom: '8px' }}>
                  Your Role
                </p>
                <p style={{ fontSize: '24px', fontWeight: '700', color: '#6B1F2F', textTransform: 'capitalize' }}>
                  {user?.role || 'Guest'}
                </p>
              </div>
              <div style={{ fontSize: '48px' }}>👤</div>
            </div>
          </div>
        </div>

        {/* Quick Overview */}
        <div style={{ backgroundColor: '#FEFEFE', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #E8D4B8' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#6B1F2F', fontFamily: 'Playfair Display, Georgia, serif', marginBottom: '16px' }}>
            Recent Wines
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {wines.slice(0, 3).map((wine) => (
              <div
                key={wine.id}
                style={{
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #E8D4B8',
                  backgroundColor: '#F8F5F0',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#6B1F2F' }}>
                    {wine.name}
                  </h3>
                  <span style={{ fontSize: '24px' }}>🍷</span>
                </div>
                <p style={{ color: '#B89968', fontSize: '13px' }}>
                  {wine.vintage} • {wine.varietal}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
