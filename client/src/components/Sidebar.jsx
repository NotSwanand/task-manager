import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/projects',  icon: '📁', label: 'Projects'  },
  { to: '/tasks',     icon: '✅', label: 'Tasks'     },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside style={{
      position: 'fixed',
      top: 0, left: 0, bottom: 0,
      width: 240,
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.4rem' }}>🗂️</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.3px' }}>TaskFlow</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Team Task Manager</div>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav style={{ padding: '16px 12px', flex: 1 }}>
        {navItems.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 14px',
            borderRadius: 'var(--radius)',
            marginBottom: 4,
            fontSize: '0.9rem',
            fontWeight: 500,
            color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
            background: isActive ? 'var(--accent-dim)' : 'transparent',
            borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
            transition: 'var(--transition)',
            textDecoration: 'none',
          })}>
            <span>{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User info + Logout */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius)',
          padding: '12px',
          marginBottom: 8,
        }}>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 2 }}>{user?.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8 }}>{user?.email}</div>
          <span className={`badge badge-${user?.role}`}>{user?.role}</span>
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '9px',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 'var(--radius)',
            color: 'var(--danger)',
            fontSize: '0.88rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'var(--transition)',
          }}
          onMouseEnter={e => e.target.style.background = 'rgba(239,68,68,0.18)'}
          onMouseLeave={e => e.target.style.background = 'rgba(239,68,68,0.08)'}
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
