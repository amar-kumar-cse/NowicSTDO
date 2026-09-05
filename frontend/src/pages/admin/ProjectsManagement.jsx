import { useState, useEffect } from 'react';
import { Calendar, DollarSign, Target, CheckCircle2, Clock, Edit2, Plus, X, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';

const STATUS_OPTIONS = [
  { value: 'planning', label: 'Planning' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'delivered', label: 'Delivered' },
];

const EMPTY_FORM = { name: '', deadline: '', cost: '', progress: 0, status: 'planning' };

export default function ProjectsManagement() {
  const { getApiToken } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Edit mode
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const token = await getApiToken();
      const response = await api.crm_getProjects(token);
      if (response.success) {
        setProjects(response.data?.results || response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim() || !form.deadline || !form.cost) {
      setFormError('Name, deadline and cost are required.');
      return;
    }
    setSaving(true);
    try {
      const token = await getApiToken();
      const response = await api.crm_createProject(token, {
        name: form.name.trim(),
        deadline: form.deadline,
        cost: parseFloat(form.cost),
        progress: parseInt(form.progress) || 0,
        status: form.status,
      });
      if (response.success) {
        setProjects(prev => [response.data, ...prev]);
        setShowForm(false);
        setForm(EMPTY_FORM);
      }
    } catch (err) {
      setFormError(err.message || 'Failed to create project');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (project) => {
    setEditId(project.id);
    setEditForm({
      progress: project.progress,
      status: project.status,
    });
  };

  const handleUpdate = async (projectId) => {
    setEditSaving(true);
    try {
      const token = await getApiToken();
      const response = await api.crm_updateProject(token, projectId, {
        progress: parseInt(editForm.progress),
        status: editForm.status,
      });
      if (response.success) {
        setProjects(prev => prev.map(p => p.id === projectId ? response.data : p));
        setEditId(null);
      }
    } catch (err) {
      console.error('Update failed:', err);
    } finally {
      setEditSaving(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'text-emerald-400 bg-emerald-400/10';
      case 'review': return 'text-blue-400 bg-blue-400/10';
      case 'in_progress': return 'text-amber-400 bg-amber-400/10';
      default: return 'text-[#6b6f80] bg-white/5';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return <CheckCircle2 size={12} />;
      case 'in_progress': return <Clock size={12} />;
      default: return <Target size={12} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#f0f0f3]">Projects</h1>
          <p className="mt-1 text-sm text-[#6b6f80]">Monitor progress and delivery timelines</p>
        </div>
        <button
          onClick={() => { setShowForm(s => !s); setFormError(''); setForm(EMPTY_FORM); }}
          className="flex items-center gap-2 rounded-xl bg-[#34d99a] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#0a0b0f] transition-all hover:bg-[#2bc48a] active:scale-[0.98]"
        >
          {showForm ? <X size={14} /> : <Plus size={14} />}
          {showForm ? 'Cancel' : 'New Project'}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="rounded-2xl border border-[#34d99a]/30 bg-[#0e0f14] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#34d99a]">New Project</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6b6f80] mb-1.5">Project Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Nowic Studio Website"
                className="w-full rounded-xl border border-[#1e2028] bg-[#16171e] px-4 py-2.5 text-sm text-[#f0f0f3] placeholder-[#4a4e5e] outline-none focus:border-[#34d99a]/50"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6b6f80] mb-1.5">Deadline *</label>
              <input
                type="date"
                value={form.deadline}
                onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                className="w-full rounded-xl border border-[#1e2028] bg-[#16171e] px-4 py-2.5 text-sm text-[#f0f0f3] outline-none focus:border-[#34d99a]/50"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6b6f80] mb-1.5">Cost (₹) *</label>
              <input
                type="number"
                min="0"
                value={form.cost}
                onChange={e => setForm(f => ({ ...f, cost: e.target.value }))}
                placeholder="75000"
                className="w-full rounded-xl border border-[#1e2028] bg-[#16171e] px-4 py-2.5 text-sm text-[#f0f0f3] placeholder-[#4a4e5e] outline-none focus:border-[#34d99a]/50"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6b6f80] mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full rounded-xl border border-[#1e2028] bg-[#16171e] px-4 py-2.5 text-sm text-[#f0f0f3] outline-none focus:border-[#34d99a]/50"
              >
                {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value} className="bg-[#0e0f14]">{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6b6f80] mb-1.5">Progress ({form.progress}%)</label>
              <input
                type="range"
                min="0"
                max="100"
                value={form.progress}
                onChange={e => setForm(f => ({ ...f, progress: e.target.value }))}
                className="w-full accent-[#34d99a]"
              />
            </div>
          </div>
          {formError && <p className="text-xs text-red-400">{formError}</p>}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-[#34d99a] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-[#0a0b0f] transition-all hover:bg-[#2bc48a] disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              {saving ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      )}

      {/* Projects Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-2xl border border-[#1e2028] bg-[#0e0f14]" />
          ))
        ) : projects.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <p className="text-[#6b6f80] text-sm">No projects yet.</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#34d99a]/10 border border-[#34d99a]/20 px-4 py-2 text-xs font-bold text-[#34d99a] hover:bg-[#34d99a]/20 transition-all"
            >
              <Plus size={14} /> Create First Project
            </button>
          </div>
        ) : (
          projects.map((project) => (
            <div key={project.id} className="group relative rounded-2xl border border-[#1e2028] bg-[#0e0f14] p-5 transition-all hover:border-[#34d99a]/30">
              <div className="mb-4 flex items-start justify-between gap-2">
                <h3 className="font-bold text-[#f0f0f3] leading-tight">{project.name}</h3>
                <button
                  onClick={() => editId === project.id ? setEditId(null) : startEdit(project)}
                  className="shrink-0 text-[#4a4e5e] hover:text-[#34d99a] transition-colors"
                >
                  {editId === project.id ? <X size={14} /> : <Edit2 size={14} />}
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="mb-1.5 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
                  <span className="text-[#6b6f80]">Progress</span>
                  <span className="text-[#34d99a]">{editId === project.id ? editForm.progress : project.progress}%</span>
                </div>
                {editId === project.id ? (
                  <input
                    type="range" min="0" max="100"
                    value={editForm.progress}
                    onChange={e => setEditForm(f => ({ ...f, progress: e.target.value }))}
                    className="w-full accent-[#34d99a]"
                  />
                ) : (
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1e2028]">
                    <div className="h-full bg-[#34d99a] transition-all duration-500" style={{ width: `${project.progress}%` }} />
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[#4a4e5e]">
                    <Calendar size={10} /> Deadline
                  </div>
                  <div className="text-xs font-medium text-[#f0f0f3]">
                    {new Date(project.deadline).toLocaleDateString()}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[#4a4e5e]">
                    <DollarSign size={10} /> Cost
                  </div>
                  <div className="text-xs font-medium text-[#f0f0f3]">
                    ₹{parseFloat(project.cost || 0).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Status */}
              {editId === project.id ? (
                <div className="space-y-3">
                  <select
                    value={editForm.status}
                    onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full rounded-xl border border-[#1e2028] bg-[#16171e] px-3 py-2 text-xs text-[#f0f0f3] outline-none focus:border-[#34d99a]/50"
                  >
                    {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value} className="bg-[#0e0f14]">{s.label}</option>)}
                  </select>
                  <button
                    onClick={() => handleUpdate(project.id)}
                    disabled={editSaving}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#34d99a] py-2 text-[11px] font-bold uppercase tracking-wider text-[#0a0b0f] disabled:opacity-50"
                  >
                    {editSaving ? <Loader2 size={12} className="animate-spin" /> : null}
                    {editSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              ) : (
                <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${getStatusColor(project.status)}`}>
                  {getStatusIcon(project.status)}
                  {project.status.replace('_', ' ')}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
