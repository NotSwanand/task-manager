import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

// ─── Task Form Modal (Create / Edit) ─────────────────────────────────────────
const TaskModal = ({ task, projects, onClose, onSaved }) => {
  const isEdit = !!task;
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({
    title:       task?.title       || '',
    description: task?.description || '',
    status:      task?.status      || 'todo',
    priority:    task?.priority    || 'medium',
    dueDate:     task?.dueDate     ? task.dueDate.split('T')[0] : '',
    project:     task?.project?._id || task?.project || (projects[0]?._id || ''),
    assignedTo:  task?.assignedTo?._id || task?.assignedTo || '',
  });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  // Load project members when project changes
  useEffect(() => {
    if (!form.project) return;
    api.get(`/projects/${form.project}`).then(({ data }) => {
      setMembers(data.members || []);
    }).catch(() => setMembers([]));
  }, [form.project]);

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...form, assignedTo: form.assignedTo || undefined };
      let data;
      if (isEdit) {
        ({ data } = await api.put(`/tasks/${task._id}`, payload));
      } else {
        ({ data } = await api.post('/tasks', payload));
      }
      onSaved(data, isEdit);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? '✏️ Edit Task' : '✅ New Task'}</h2>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        {error && <div className="alert alert-error" style={{ marginBottom: 12 }}>⚠️ {error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input className="form-control" placeholder="Task title" value={form.title} onChange={set('title')} required autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-control" rows={3} placeholder="Describe the task…" value={form.description} onChange={set('description')} style={{ resize: 'vertical' }} />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Project *</label>
                <select className="form-control" value={form.project} onChange={set('project')} required disabled={isEdit}>
                  <option value="">-- Select project --</option>
                  {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Assign To</label>
                <select className="form-control" value={form.assignedTo} onChange={set('assignedTo')}>
                  <option value="">-- Unassigned --</option>
                  {members.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-control" value={form.status} onChange={set('status')}>
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-control" value={form.priority} onChange={set('priority')}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input className="form-control" type="date" value={form.dueDate} onChange={set('dueDate')} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Task Row ─────────────────────────────────────────────────────────────────
const TaskRow = ({ task, canModify, canEdit, onEdit, onDelete, onStatusChange }) => {
  const overdue = task.isOverdue;

  return (
    <tr>
      <td>
        <div style={{ fontWeight: 500 }}>{task.title}</div>
        {task.description && (
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}
            className="truncate" title={task.description}>
            {task.description.slice(0, 60)}{task.description.length > 60 ? '…' : ''}
          </div>
        )}
      </td>
      <td>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          {task.project?.name || '—'}
        </span>
      </td>
      <td>
        {canModify ? (
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task._id, e.target.value)}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              color: 'var(--text-primary)',
              fontSize: '0.82rem',
              padding: '4px 8px',
              cursor: 'pointer',
            }}
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        ) : (
          <span className={`badge badge-${task.status}`}>{task.status}</span>
        )}
      </td>
      <td><span className={`badge badge-${task.priority}`}>{task.priority}</span></td>
      <td>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          {task.assignedTo?.name || <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}
        </span>
      </td>
      <td>
        <span style={{ fontSize: '0.82rem', color: overdue ? 'var(--danger)' : 'var(--text-secondary)' }}>
          {formatDate(task.dueDate)}{overdue ? ' ⚠️' : ''}
        </span>
      </td>
      <td>
        <div style={{ display: 'flex', gap: 6 }}>
          {canEdit && (
            <>
              <button className="btn btn-secondary btn-sm" onClick={() => onEdit(task)}>✏️</button>
              <button className="btn btn-danger btn-sm" onClick={() => onDelete(task._id)}>🗑️</button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

// ─── Main Tasks Page ──────────────────────────────────────────────────────────
const Tasks = () => {
  const { user } = useAuth();
  const location = useLocation();

  const [tasks, setTasks]       = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Filters
  const [filterProject,  setFilterProject]  = useState(location.state?.projectId || '');
  const [filterStatus,   setFilterStatus]   = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const [taskRes, projRes] = await Promise.all([
          api.get('/tasks'),
          api.get('/projects'),
        ]);
        setTasks(taskRes.data);
        setProjects(projRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();
  }, []);

  const handleSaved = (savedTask, isEdit) => {
    if (isEdit) {
      setTasks((prev) => prev.map((t) => (t._id === savedTask._id ? savedTask : t)));
    } else {
      setTasks((prev) => [savedTask, ...prev]);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const { data } = await api.put(`/tasks/${id}`, { status });
      setTasks((prev) => prev.map((t) => (t._id === id ? data : t)));
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  // ─── Client-side Filtering ───────────────────────────────────────────────────
  const filtered = tasks.filter((t) => {
    if (filterProject  && t.project?._id !== filterProject)  return false;
    if (filterStatus   && t.status !== filterStatus)          return false;
    if (filterPriority && t.priority !== filterPriority)      return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const canModifyTask = (task) => {
    return user.role === 'admin' || task.assignedTo?._id === user._id;
  };

  const canEditTask = (task) => user.role === 'admin';

  if (loading) return (
    <div className="loading-center">
      <div className="spinner" />
      <p>Loading tasks…</p>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">{filtered.length} task{filtered.length !== 1 ? 's' : ''} shown</p>
        </div>
        {user.role === 'admin' && (
          <button className="btn btn-primary" onClick={() => { setEditingTask(null); setShowModal(true); }}>
            + New Task
          </button>
        )}
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>⚠️ {error}</div>}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <input
          className="form-control"
          style={{ maxWidth: 220 }}
          placeholder="🔍 Search tasks…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="form-control" style={{ maxWidth: 180 }} value={filterProject} onChange={(e) => setFilterProject(e.target.value)}>
          <option value="">All Projects</option>
          {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
        <select className="form-control" style={{ maxWidth: 150 }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <select className="form-control" style={{ maxWidth: 150 }} value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        {(search || filterProject || filterStatus || filterPriority) && (
          <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setFilterProject(''); setFilterStatus(''); setFilterPriority(''); }}>
            Clear ✕
          </button>
        )}
      </div>

      {/* Tasks Table */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="icon">✅</div>
          <h3>No tasks found</h3>
          <p>{tasks.length === 0 ? 'Create your first task to get started.' : 'Try adjusting your filters.'}</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Task</th>
                <th>Project</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Assigned To</th>
                <th>Due Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((task) => (
                <TaskRow
                  key={task._id}
                  task={task}
                  canModify={canModifyTask(task)}
                  canEdit={canEditTask(task)}
                  onEdit={(t) => { setEditingTask(t); setShowModal(true); }}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <TaskModal
          task={editingTask}
          projects={projects}
          onClose={() => { setShowModal(false); setEditingTask(null); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
};

export default Tasks;
