import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/inventory', label: 'Wine Inventory', icon: '🍷' },
    { path: '/service', label: 'Dinner Service', icon: '🍽️' },
    { path: '/guests', label: 'Guest Management', icon: '👥' },
  ];

  return (
    <nav style={{ backgroundColor: '#6B1F2F', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '70px' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '32px' }}>🍷</span>
            <div>
              <h1 style={{ color: '#FEFEFE', fontSize: '24px', fontWeight: '700', margin: 0, fontFamily: 'Playfair Display, Georgia, serif' }}>
                Wine Service
              </h1>
              <p style={{ color: '#E8D4B8', fontSize: '12px', margin: 0 }}>Premium Management System</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  backgroundColor: location.pathname === item.path ? '#8B2A3F' : 'transparent',
                  color: '#FEFEFE',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (location.pathname !== item.path) {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (location.pathname !== item.path) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* User Info & Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: '#FEFEFE', fontSize: '14px', fontWeight: '600', margin: 0 }}>
                {user?.username || 'Guest'}
              </p>
              <p style={{ color: '#E8D4B8', fontSize: '12px', margin: 0, textTransform: 'capitalize' }}>
                {user?.role || 'User'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                backgroundColor: '#D4AF88',
                color: '#6B1F2F',
                border: 'none',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E8D4B8')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#D4AF88')}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;