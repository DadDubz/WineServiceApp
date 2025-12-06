import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';

const GuestManagementPage = () => {
  const [guests, setGuests] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [wines, setWines] = useState<any[]>([]);
  const [showAddGuest, setShowAddGuest] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<any>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    room_number: '',
    table_id: '',
    phone: '',
    email: '',
    allergies: '',
    dietary_restrictions: '',
    protein_preference: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    try {
      const [guestsRes, tablesRes, winesRes] = await Promise.all([
        fetch(`${API_BASE}/guests/`),
        fetch(`${API_BASE}/tables/`),
        fetch(`${API_BASE}/wines/`),
      ]);
      setGuests(await guestsRes.json());
      setTables(await tablesRes.json());
      setWines(await winesRes.json());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    
    try {
      const response = await fetch(`${API_BASE}/guests/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          table_id: formData.table_id ? parseInt(formData.table_id) : null,
        }),
      });
      
      if (response.ok) {
        await fetchData();
        setShowAddGuest(false);
        setFormData({
          name: '',
          room_number: '',
          table_id: '',
          phone: '',
          email: '',
          allergies: '',
          dietary_restrictions: '',
          protein_preference: '',
          notes: '',
        });
      }
    } catch (error) {
      console.error('Failed to add guest:', error);
    }
  };

  const addOrder = async (guestId: number, orderData: any) => {
    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    try {
      await fetch(`${API_BASE}/orders/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...orderData, guest_id: guestId }),
      });
      alert('Order added successfully!');
      setShowOrderModal(false);
    } catch (error) {
      console.error('Failed to add order:', error);
    }
  };

  return (
    <Layout>
      <div>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#6B1F2F', fontFamily: 'Playfair Display, Georgia, serif', marginBottom: '8px' }}>
              👥 Guest Management
            </h1>
            <p style={{ color: '#B89968', fontSize: '16px' }}>
              Track guests, preferences, and orders
            </p>
          </div>
          <button
            onClick={() => setShowAddGuest(!showAddGuest)}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              backgroundColor: '#6B1F2F',
              color: '#FEFEFE',
              border: 'none',
              fontWeight: '600',
              fontSize: '15px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#8B2A3F')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#6B1F2F')}
          >
            {showAddGuest ? 'Cancel' : '+ Add Guest'}
          </button>
        </div>

        {/* Add Guest Form */}
        {showAddGuest && (
          <div
            style={{
              backgroundColor: '#FEFEFE',
              borderRadius: '12px',
              padding: '32px',
              marginBottom: '32px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: '2px solid #D4AF88',
            }}
          >
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#6B1F2F', marginBottom: '24px' }}>
              Add New Guest
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', color: '#6B1F2F', fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>
                    Guest Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1.5px solid #D4AF88',
                      fontSize: '15px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#6B1F2F', fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>
                    Room Number
                  </label>
                  <input
                    type="text"
                    value={formData.room_number}
                    onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1.5px solid #D4AF88',
                      fontSize: '15px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#6B1F2F', fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>
                    Assign to Table
                  </label>
                  <select
                    value={formData.table_id}
                    onChange={(e) => setFormData({ ...formData, table_id: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1.5px solid #D4AF88',
                      fontSize: '15px',
                      outline: 'none',
                    }}
                  >
                    <option value="">No table</option>
                    {tables.map((table) => (
                      <option key={table.id} value={table.id}>
                        Table {table.number} ({table.capacity} seats)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#6B1F2F', fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>
                    Protein Preference
                  </label>
                  <select
                    value={formData.protein_preference}
                    onChange={(e) => setFormData({ ...formData, protein_preference: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1.5px solid #D4AF88',
                      fontSize: '15px',
                      outline: 'none',
                    }}
                  >
                    <option value="">Select preference</option>
                    <option value="Rare">Rare</option>
                    <option value="Medium Rare">Medium Rare</option>
                    <option value="Medium">Medium</option>
                    <option value="Medium Well">Medium Well</option>
                    <option value="Well Done">Well Done</option>
                  </select>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', color: '#6B1F2F', fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>
                    Allergies
                  </label>
                  <textarea
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    placeholder="e.g., Peanuts, Shellfish, Dairy..."
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1.5px solid #D4AF88',
                      fontSize: '15px',
                      outline: 'none',
                      minHeight: '80px',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', color: '#6B1F2F', fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>
                    Special Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any special requests or notes..."
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1.5px solid #D4AF88',
                      fontSize: '15px',
                      outline: 'none',
                      minHeight: '80px',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  marginTop: '24px',
                  padding: '12px 32px',
                  borderRadius: '8px',
                  backgroundColor: '#6B1F2F',
                  color: '#FEFEFE',
                  border: 'none',
                  fontWeight: '600',
                  fontSize: '15px',
                  cursor: 'pointer',
                }}
              >
                Add Guest
              </button>
            </form>
          </div>
        )}

        {/* Guests List */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {guests.map((guest) => (
            <div
              key={guest.id}
              style={{
                backgroundColor: '#FEFEFE',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid #E8D4B8',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#6B1F2F', marginBottom: '4px' }}>
                    {guest.name}
                  </h3>
                  {guest.room_number && (
                    <p style={{ color: '#B89968', fontSize: '13px' }}>Room {guest.room_number}</p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSelectedGuest(guest);
                    setShowOrderModal(true);
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    backgroundColor: '#D4AF88',
                    color: '#6B1F2F',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  + Order
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                {guest.protein_preference && (
                  <div style={{ color: '#6B1F2F' }}>
                    <strong>Protein:</strong> {guest.protein_preference}
                  </div>
                )}
                {guest.allergies && (
                  <div
                    style={{
                      padding: '8px',
                      backgroundColor: '#FFF3E0',
                      borderRadius: '6px',
                      color: '#E65100',
                      fontSize: '13px',
                    }}
                  >
                    <strong>⚠️ Allergies:</strong> {guest.allergies}
                  </div>
                )}
                {guest.notes && (
                  <div style={{ color: '#B89968', fontSize: '13px', fontStyle: 'italic', marginTop: '8px' }}>
                    {guest.notes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {guests.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <p style={{ fontSize: '48px', marginBottom: '16px' }}>👥</p>
            <p style={{ color: '#B89968', fontSize: '18px' }}>
              No guests yet. Click "Add Guest" to get started!
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default GuestManagementPage;
