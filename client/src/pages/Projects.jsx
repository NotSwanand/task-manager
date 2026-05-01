import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const ProjectCard = ({ project, onDelete }) => {
  const { user } = useAuth();
  const isAdmin = user.role === 'admin';

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ marginBottom: 4 }} className="truncate">{project.name}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
            {project.description || 'No description provided.'}
          </p>
        </div>
      </div>

      {/* Members */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>👥 Members:</span>
        {project.members?.slice(0, 4).map((m) => (
          <span key={m._id} style={{
            fontSize: '0.75rem',
            background: 'var(--bg-hover)',
            border: '1px solid var(--border)',
            borderRadius: 100,
            padding: '2px 8px',
          }}>{m.name}</span>
        ))}
        {project.members?.length > 4 && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>+{project.members.length - 4} more</span>
        )}
      </div>

      {/* Owner */}
      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        👤 Owner: <span style={{ color: 'var(--text-secondary)' }}>{project.owner?.name}</span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <Link to={`/projects/${project._id}`} style={{ flex: 1 }}>
          <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
            View →
          </button>
        </Link>
        {isAdmin && (
          <button
            className="btn btn-danger btn-sm"
            onClick={() => onDelete(project._id)}
          >
            🗑️
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Create Project Modal ─────────────────────────────────────────────────────
const CreateProjectModal = ({ onClose, onCreated }) => {
  const [form, setForm]   = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/projects', form);
      onCreated(data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📁 New Project</h2>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>⚠️ {error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Project Name *</label>
              <input
                className="form-control"
                placeholder="e.g. Website Redesign"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                required autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                placeholder="What is this project about?"
                rows={3}
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating…' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await api.get('/projects');
        setProjects(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project and all its tasks? This cannot be undone.')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleCreated = (project) => setProjects((prev) => [project, ...prev]);

  if (loading) return (
    <div className="loading-center">
      <div className="spinner" />
      <p>Loading projects…</p>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        {user.role === 'admin' && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + New Project
          </button>
        )}
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 24 }}>⚠️ {error}</div>}

      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📁</div>
          <h3>No projects yet</h3>
          <p>{user.role === 'admin' ? 'Create your first project to get started.' : 'You have not been added to any projects yet.'}</p>
          {user.role === 'admin' && (
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowModal(true)}>
              + Create Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid-3">
          {projects.map((p) => (
            <ProjectCard key={p._id} project={p} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {showModal && (
        <CreateProjectModal onClose={() => setShowModal(false)} onCreated={handleCreated} />
      )}
    </div>
  );
};

export default Projects;
