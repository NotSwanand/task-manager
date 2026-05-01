import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ icon, label, value, color }) => (
  <div className="card" style={{ borderLeft: `4px solid ${color}` }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <span style={{ fontSize: '1.4rem' }}>{icon}</span>
      <span style={{ fontSize: '2rem', fontWeight: 700, color }}>{value}</span>
    </div>
    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>{label}</div>
  </div>
);

const statusBadge = (status) => {
  const map = {
    todo: '🔵',
    'in-progress': '🟡',
    done: '🟢',
  };
  return map[status] || '⚪';
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/tasks/dashboard/stats');
        setStats(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="loading-center">
      <div className="spinner" />
      <p>Loading dashboard…</p>
    </div>
  );

  if (error) return <div className="alert alert-error">{error}</div>;

  const statCards = [
    { icon: '📋', label: 'Total Tasks',      value: stats.total,     color: 'var(--accent)' },
    { icon: '✅', label: 'Completed',        value: stats.completed, color: 'var(--success)' },
    { icon: '🔄', label: 'In Progress',      value: stats.inProgress,color: 'var(--warning)' },
    { icon: '🔴', label: 'Overdue',          value: stats.overdue,   color: 'var(--danger)' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            👋 Hello, {user?.name.split(' ')[0]}
          </h1>
          <p className="page-subtitle">Here's what's happening with your tasks today.</p>
        </div>
        {user.role === 'admin' && (
          <Link to="/tasks">
            <button className="btn btn-primary">+ New Task</button>
          </Link>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid-4" style={{ marginBottom: 32 }}>
        {statCards.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Progress Bar */}
      {stats.total > 0 && (
        <div className="card" style={{ marginBottom: 32 }}>
          <h3 style={{ marginBottom: 16 }}>📈 Overall Progress</h3>
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: 100,
            height: 12,
            overflow: 'hidden',
            marginBottom: 8,
          }}>
            <div style={{
              height: '100%',
              width: `${Math.round((stats.completed / stats.total) * 100)}%`,
              background: 'linear-gradient(90deg, var(--accent), var(--success))',
              borderRadius: 100,
              transition: 'width 0.5s ease',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <span>{stats.completed} of {stats.total} tasks completed</span>
            <span>{Math.round((stats.completed / stats.total) * 100)}%</span>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3>🕐 Recent Tasks</h3>
          <Link to="/tasks" style={{ fontSize: '0.85rem' }}>View all →</Link>
        </div>

        {stats.recentTasks.length === 0 ? (
          <div className="empty-state" style={{ padding: '40px 0' }}>
            <div className="icon">📭</div>
            <h3>No tasks yet</h3>
            <p>Create your first task to get started.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {stats.recentTasks.map((task) => (
              <div key={task._id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
              }}>
                <span style={{ fontSize: '1.1rem' }}>{statusBadge(task.status)}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: '0.9rem' }} className="truncate">{task.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {task.project?.name}
                    {task.assignedTo ? ` · ${task.assignedTo.name}` : ''}
                  </div>
                </div>
                <span className={`badge badge-${task.status}`}>{task.status}</span>
                {task.isOverdue && <span className="badge badge-overdue">Overdue</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
