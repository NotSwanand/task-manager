import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

// ─── Add Member Modal ─────────────────────────────────────────────────────────
const AddMemberModal = ({ projectId, existingMembers, onClose, onAdded }) => {
  const [users, setUsers]     = useState([]);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    api.get('/auth/users').then(({ data }) => {
      // Filter out users already in project
      const memberIds = existingMembers.map((m) => m._id);
      setUsers(data.filter((u) => !memberIds.includes(u._id)));
    });
  }, []);

  const handleAdd = async () => {
    if (!selected) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post(`/projects/${projectId}/members`, { userId: selected });
      onAdded(data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>👤 Add Member</h2>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        {error && <div className="alert alert-error" style={{ marginBottom: 12 }}>⚠️ {error}</div>}
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Select User</label>
            <select className="form-control" value={selected} onChange={(e) => setSelected(e.target.value)}>
              <option value="">-- Select a user --</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>{u.name} ({u.email}) — {u.role}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleAdd} disabled={!selected || loading}>
            {loading ? 'Adding…' : 'Add Member'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject]         = useState(null);
  const [tasks, setTasks]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [showAddMember, setShowAddMember] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [projRes, taskRes] = await Promise.all([
          api.get(`/projects/${id}`),
          api.get(`/tasks?project=${id}`),
        ]);
        setProject(projRes.data);
        setTasks(taskRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member from the project?')) return;
    try {
      const { data } = await api.delete(`/projects/${id}/members/${userId}`);
      setProject(data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const isAdmin = user.role === 'admin';
  const canManage = isAdmin;

  const tasksByStatus = {
    todo:         tasks.filter((t) => t.status === 'todo'),
    'in-progress':tasks.filter((t) => t.status === 'in-progress'),
    done:         tasks.filter((t) => t.status === 'done'),
  };

  if (loading) return (
    <div className="loading-center">
      <div className="spinner" />
      <p>Loading project…</p>
    </div>
  );

  if (error) return (
    <div>
      <div className="alert alert-error" style={{ marginBottom: 16 }}>⚠️ {error}</div>
      <button className="btn btn-secondary" onClick={() => navigate(-1)}>← Back</button>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 8 }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/projects')} style={{ marginBottom: 16 }}>
          ← Back to Projects
        </button>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">📁 {project.name}</h1>
          {project.description && (
            <p className="page-subtitle">{project.description}</p>
          )}
        </div>
      </div>

      {/* Members */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3>👥 Team Members ({project.members?.length})</h3>
          {canManage && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddMember(true)}>
              + Add Member
            </button>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {project.members?.map((m) => (
            <div key={m._id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 14px',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36,
                  borderRadius: '50%',
                  background: 'var(--accent-dim)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent-light)',
                }}>
                  {m.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>
                    {m.name}
                    {project.owner?._id === m._id && (
                      <span style={{ marginLeft: 6, fontSize: '0.72rem', color: 'var(--accent-light)' }}>Owner</span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{m.email}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className={`badge badge-${m.role}`}>{m.role}</span>
                {canManage && project.owner?._id !== m._id && m._id !== user._id && (
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleRemoveMember(m._id)}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task Summary */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3>📋 Tasks ({tasks.length})</h3>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate('/tasks', { state: { projectId: id, projectName: project.name } })}
          >
            Manage Tasks →
          </button>
        </div>

        {tasks.length === 0 ? (
          <div className="empty-state" style={{ padding: '30px 0' }}>
            <div className="icon">📭</div>
            <h3>No tasks yet</h3>
            <p>Go to the Tasks page to create tasks for this project.</p>
          </div>
        ) : (
          <div className="grid-3">
            {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
              <div key={status} style={{
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius)',
                padding: 16,
                border: '1px solid var(--border)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span className={`badge badge-${status}`}>{status}</span>
                  <span style={{ fontWeight: 700, fontSize: '1.2rem' }}>{statusTasks.length}</span>
                </div>
                {statusTasks.slice(0, 3).map((t) => (
                  <div key={t._id} style={{
                    fontSize: '0.82rem',
                    color: 'var(--text-secondary)',
                    padding: '4px 0',
                    borderTop: '1px solid var(--border)',
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {t.title}
                  </div>
                ))}
                {statusTasks.length > 3 && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    +{statusTasks.length - 3} more
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddMember && (
        <AddMemberModal
          projectId={id}
          existingMembers={project.members || []}
          onClose={() => setShowAddMember(false)}
          onAdded={(updated) => setProject(updated)}
        />
      )}
    </div>
  );
};

export default ProjectDetail;
