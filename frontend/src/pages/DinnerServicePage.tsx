import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';

const DinnerServicePage = () => {
  const [tables, setTables] = useState<any[]>([]);
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(`${API_BASE}/tables/`);
      const data = await response.json();
      setTables(data);
    } catch (error) {
      console.error('Failed to fetch tables:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return { bg: '#E8F5E9', color: '#2E7D32', border: '#81C784' };
      case 'occupied':
        return { bg: '#FFF3E0', color: '#E65100', border: '#FFB74D' };
      case 'reserved':
        return { bg: '#E3F2FD', color: '#1565C0', border: '#64B5F6' };
      case 'cleaning':
        return { bg: '#F3E5F5', color: '#6A1B9A', border: '#BA68C8' };
      default:
        return { bg: '#F5F5F5', color: '#616161', border: '#BDBDBD' };
    }
  };

  return (
    <Layout>
      <div>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#6B1F2F', fontFamily: 'Playfair Display, Georgia, serif', marginBottom: '8px' }}>
            🍽️ Dinner Service
          </h1>
          <p style={{ color: '#B89968', fontSize: '16px' }}>
            Manage table assignments and guest service
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {['Available', 'Occupied', 'Reserved'].map((status) => {
            const count = tables.filter((t) => t.status === status).length;
            const colors = getStatusColor(status);
            return (
              <div
                key={status}
                style={{
                  backgroundColor: colors.bg,
                  padding: '20px',
                  borderRadius: '12px',
                  border: `2px solid ${colors.border}`,
                }}
              >
                <p style={{ fontSize: '14px', fontWeight: '600', color: colors.color, marginBottom: '8px' }}>
                  {status} Tables
                </p>
                <p style={{ fontSize: '32px', fontWeight: '700', color: colors.color }}>
                  {count}
                </p>
              </div>
            );
          })}
        </div>

        {/* Tables Grid */}
        {loading ? (
          <p style={{ color: '#B89968', fontSize: '18px', textAlign: 'center', padding: '60px' }}>
            Loading tables...
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {tables.map((table) => {
              const statusColors = getStatusColor(table.status);
              return (
                <div
                  key={table.id}
                  style={{
                    backgroundColor: '#FEFEFE',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    border: `2px solid ${statusColors.border}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => setSelectedTable(table)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(107,31,47,0.15)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Table Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#6B1F2F', marginBottom: '4px' }}>
                        Table {table.number}
                      </h3>
                      <p style={{ color: '#B89968', fontSize: '13px' }}>
                        {table.name}
                      </p>
                    </div>
                    <div
                      style={{
                        backgroundColor: statusColors.bg,
                        color: statusColors.color,
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                      }}
                    >
                      {table.status}
                    </div>
                  </div>

                  {/* Table Info */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>👥</span>
                      <span style={{ color: '#6B1F2F', fontSize: '14px' }}>
                        Capacity: {table.capacity} guests
                      </span>
                    </div>
                    {table.server && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px' }}>👤</span>
                        <span style={{ color: '#6B1F2F', fontSize: '14px' }}>
                          Server: {table.server}
                        </span>
                      </div>
                    )}
                    {table.guests && table.guests.length > 0 && (
                      <div
                        style={{
                          marginTop: '12px',
                          paddingTop: '12px',
                          borderTop: '1px solid #E8D4B8',
                        }}
                      >
                        <p style={{ fontSize: '12px', fontWeight: '600', color: '#B89968', marginBottom: '6px' }}>
                          Current Guests:
                        </p>
                        {table.guests.map((guest: any) => (
                          <div key={guest.id} style={{ fontSize: '13px', color: '#6B1F2F', marginLeft: '8px' }}>
                            • {guest.name} {guest.room_number && `(Room ${guest.room_number})`}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DinnerServicePage;
