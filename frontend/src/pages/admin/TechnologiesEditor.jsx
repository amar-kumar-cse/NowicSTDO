import { useState, useEffect, useRef } from 'react';
import { Save, CheckCircle2, Plus, Trash2, ArrowUp, ArrowDown, Cpu, Layers } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { saveSection, fetchSection } from '../../lib/cms';
import { useContent } from '../../context/ContentContext';
import { technologyDetails } from '../../data/technologyDetails';

const techCategories = ['Frontend', 'Backend', 'Database', 'AI/ML', 'DevOps', 'Auth & Payments'];

const emptyTech = {
  slug: '',
  name: '',
  category: 'Frontend',
  tagline: '',
  description: '',
  usedFor: [],
  whyWeUseIt: [],
  relatedTech: [],
  relatedServices: [],
};

const createSlug = (name) => (name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export default function TechnologiesEditor() {
  const { refetch } = useContent();
  const { getApiToken } = useAuth();
  const [items, setItems] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchSection('technologies');
        if (!mounted) return;
        let source = data;
        if (!source || (typeof source === 'object' && Object.keys(source).length === 0)) {
          source = technologyDetails;
        }

        let list = [];
        if (Array.isArray(source)) {
          list = source;
        } else if (typeof source === 'object') {
          list = Object.entries(source).map(([slug, t]) => ({ slug, ...t }));
        }
        setItems(list.map(t => ({ ...emptyTech, ...t, slug: t.slug || createSlug(t.name) })));
      } catch (err) {
        console.error('Failed to load technologies section:', err);
        if (mounted) {
          const list = Object.entries(technologyDetails).map(([slug, t]) => ({ slug, ...t }));
          setItems(list.map(t => ({ ...emptyTech, ...t, slug: t.slug || createSlug(t.name) })));
        }
      }
    })();
    return () => {
      mounted = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const update = (idx, field, value) => {
    setItems((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
    setSaved(false);
  };

  const updateArrayField = (idx, field, itemIdx, value) => {
    setItems((prev) => prev.map((item, i) => {
      if (i !== idx) return item;
      const arr = [...(item[field] || [])];
      arr[itemIdx] = value;
      return { ...item, [field]: arr };
    }));
    setSaved(false);
  };

  const addArrayField = (idx, field, emptyValue = '') => {
    setItems((prev) => prev.map((item, i) => {
      if (i !== idx) return item;
      return { ...item, [field]: [...(item[field] || []), emptyValue] };
    }));
    setSaved(false);
  };

  const removeArrayField = (idx, field, itemIdx) => {
    setItems((prev) => prev.map((item, i) => {
      if (i !== idx) return item;
      return { ...item, [field]: (item[field] || []).filter((_, j) => j !== itemIdx) };
    }));
    setSaved(false);
  };

  const addItem = () => {
    const newItem = { ...emptyTech, name: 'New Tech', slug: `new-tech-${Date.now()}` };
    setItems((prev) => [...prev, newItem]);
    setActiveIdx(items.length);
  };

  const removeItem = (idx) => {
    if (!confirm('Delete this technology entry?')) return;
    setItems((prev) => prev.filter((_, i) => i !== idx));
    if (activeIdx >= items.length - 1 && activeIdx > 0) {
      setActiveIdx(activeIdx - 1);
    }
    setSaved(false);
  };

  const moveItem = (idx, direction) => {
    const list = [...items];
    if (direction === 'up' && idx > 0) {
      const temp = list[idx];
      list[idx] = list[idx - 1];
      list[idx - 1] = temp;
      setActiveIdx(idx - 1);
    } else if (direction === 'down' && idx < list.length - 1) {
      const temp = list[idx];
      list[idx] = list[idx + 1];
      list[idx + 1] = temp;
      setActiveIdx(idx + 1);
    }
    setItems(list);
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = await getApiToken();
      // Store as map keyed by slug for easy lookup
      const dict = {};
      items.forEach(t => {
        const s = t.slug || createSlug(t.name);
        dict[s] = { ...t, slug: s };
      });
      await saveSection('technologies', dict, token);
      await refetch();
      setSaved(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert('Failed to save technologies: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 relative pb-10">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#f0f0f3] tracking-tight">Technologies Stack Editor</h1>
          <p className="mt-1 text-sm text-[#6b6f80]">{items.length} technology stack items configured.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={addItem} className="admin-add-btn text-xs px-3 py-2 flex items-center gap-1">
            <Plus size={14} /> Add Technology
          </button>
          <button onClick={handleSave} disabled={saving} className="admin-save-btn text-xs px-4 py-2 flex items-center gap-1.5">
            {saved ? <><CheckCircle2 size={14} /> Saved!</> : <><Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}</>}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5 items-start">
        {/* Left List */}
        <div className="lg:col-span-2 space-y-2 max-h-[700px] overflow-y-auto pr-2">
          {items.map((item, idx) => (
            <div
              key={item.slug || idx}
              onClick={() => setActiveIdx(idx)}
              className={`p-4 border rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                activeIdx === idx
                  ? 'border-[#34d99a]/40 bg-[#34d99a]/5 shadow-sm'
                  : 'border-white/5 hover:border-white/10 bg-white/[0.01]'
              }`}
            >
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#34d99a] bg-[#34d99a]/10 px-2 py-0.5 rounded">
                    {item.category}
                  </span>
                  <span className="text-xs text-[#6b6f80] font-mono truncate">/{item.slug}</span>
                </div>
                <h4 className="font-bold text-sm text-[#f0f0f3] mt-1 truncate">{item.name || 'Untitled Tech'}</h4>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={(e) => { e.stopPropagation(); moveItem(idx, 'up'); }} disabled={idx === 0} title="Move Up" className="p-1.5 text-[#6b6f80] hover:text-white disabled:opacity-20 bg-white/5 rounded hover:bg-white/10 transition-colors">
                  <ArrowUp size={13} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); moveItem(idx, 'down'); }} disabled={idx === items.length - 1} title="Move Down" className="p-1.5 text-[#6b6f80] hover:text-white disabled:opacity-20 bg-white/5 rounded hover:bg-white/10 transition-colors">
                  <ArrowDown size={13} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); removeItem(idx); }} title="Delete Technology" className="p-1.5 text-red-400 bg-red-400/10 hover:bg-red-400/20 rounded border border-red-400/20 transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Form Editor */}
        <div className="lg:col-span-3 stats-glass p-6 border border-white/5 rounded-2xl space-y-5">
          {items[activeIdx] ? (
            <>
              {/* Form Header with prominent Delete Action */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Editing: <span className="text-[#34d99a] font-mono">{items[activeIdx].name || 'Untitled Tech'}</span>
                  </h3>
                  <p className="text-xs text-[#6b6f80]">Modify fields below or remove this entry from your tech stack.</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(activeIdx)}
                  className="flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg px-3 py-1.5 font-medium transition-all"
                >
                  <Trash2 size={13} /> Delete Entry
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="admin-label">Technology Name</label>
                  <input
                    type="text"
                    value={items[activeIdx].name}
                    onChange={(e) => {
                      update(activeIdx, 'name', e.target.value);
                      if (!items[activeIdx].slug || items[activeIdx].slug.startsWith('new-tech')) {
                        update(activeIdx, 'slug', createSlug(e.target.value));
                      }
                    }}
                    className="admin-input"
                    placeholder="e.g. React"
                  />
                </div>
                <div>
                  <label className="admin-label">URL Slug</label>
                  <input
                    type="text"
                    value={items[activeIdx].slug}
                    onChange={(e) => update(activeIdx, 'slug', createSlug(e.target.value))}
                    className="admin-input font-mono text-xs"
                    placeholder="e.g. react"
                  />
                </div>
              </div>

              <div>
                <label className="admin-label">Category</label>
                <select
                  value={items[activeIdx].category}
                  onChange={(e) => update(activeIdx, 'category', e.target.value)}
                  className="admin-input bg-[#0a0b0f]"
                >
                  {techCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="admin-label">Tagline</label>
                <input
                  type="text"
                  value={items[activeIdx].tagline}
                  onChange={(e) => update(activeIdx, 'tagline', e.target.value)}
                  className="admin-input"
                  placeholder="Short tagline phrase..."
                />
              </div>

              <div>
                <label className="admin-label">Full Description</label>
                <textarea
                  value={items[activeIdx].description}
                  onChange={(e) => update(activeIdx, 'description', e.target.value)}
                  rows={3}
                  className="admin-input resize-none !h-auto py-2"
                  placeholder="Detailed description of why and how you use this technology..."
                />
              </div>

              {/* usedFor */}
              <div>
                <label className="admin-label">What We Use It For (Use Cases)</label>
                <div className="space-y-2">
                  {(items[activeIdx].usedFor || []).map((use, uIdx) => (
                    <div key={uIdx} className="flex gap-2">
                      <input
                        type="text"
                        value={use}
                        onChange={(e) => updateArrayField(activeIdx, 'usedFor', uIdx, e.target.value)}
                        className="admin-input flex-1"
                        placeholder="Use case e.g. MVP Development"
                      />
                      <button onClick={() => removeArrayField(activeIdx, 'usedFor', uIdx)} className="text-red-400 p-2 hover:bg-red-400/10 rounded"><Trash2 size={12} /></button>
                    </div>
                  ))}
                  <button onClick={() => addArrayField(activeIdx, 'usedFor')} className="text-xs text-[#34d99a] hover:underline">+ Add Use Case</button>
                </div>
              </div>

              {/* whyWeUseIt */}
              <div>
                <label className="admin-label">Why We Choose It (Reasons)</label>
                <div className="space-y-2">
                  {(items[activeIdx].whyWeUseIt || []).map((reason, rIdx) => (
                    <div key={rIdx} className="flex gap-2">
                      <input
                        type="text"
                        value={reason}
                        onChange={(e) => updateArrayField(activeIdx, 'whyWeUseIt', rIdx, e.target.value)}
                        className="admin-input flex-1"
                        placeholder="Reason e.g. Component-based architecture"
                      />
                      <button onClick={() => removeArrayField(activeIdx, 'whyWeUseIt', rIdx)} className="text-red-400 p-2 hover:bg-red-400/10 rounded"><Trash2 size={12} /></button>
                    </div>
                  ))}
                  <button onClick={() => addArrayField(activeIdx, 'whyWeUseIt')} className="text-xs text-[#34d99a] hover:underline">+ Add Reason</button>
                </div>
              </div>

              {/* Related Tech */}
              <div>
                <label className="admin-label">Related Technology Slugs</label>
                <div className="flex flex-wrap gap-2">
                  {(items[activeIdx].relatedTech || []).map((tSlug, rIdx) => (
                    <div key={rIdx} className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-3 py-1 text-xs">
                      <input
                        type="text"
                        value={tSlug}
                        onChange={(e) => updateArrayField(activeIdx, 'relatedTech', rIdx, e.target.value)}
                        className="bg-transparent text-white outline-none w-24 font-mono text-xs"
                      />
                      <button onClick={() => removeArrayField(activeIdx, 'relatedTech', rIdx)} className="text-red-400 hover:opacity-80"><Trash2 size={10} /></button>
                    </div>
                  ))}
                  <button onClick={() => addArrayField(activeIdx, 'relatedTech')} className="text-xs bg-[#34d99a]/10 text-[#34d99a] border border-[#34d99a]/20 rounded-full px-3 py-1">+ Add Related Tech</button>
                </div>
              </div>

              {/* Related Services */}
              <div>
                <label className="admin-label">Related Service Slugs</label>
                <div className="flex flex-wrap gap-2">
                  {(items[activeIdx].relatedServices || []).map((sSlug, rIdx) => (
                    <div key={rIdx} className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-3 py-1 text-xs">
                      <input
                        type="text"
                        value={sSlug}
                        onChange={(e) => updateArrayField(activeIdx, 'relatedServices', rIdx, e.target.value)}
                        className="bg-transparent text-white outline-none w-28 font-mono text-xs"
                      />
                      <button onClick={() => removeArrayField(activeIdx, 'relatedServices', rIdx)} className="text-red-400 hover:opacity-80"><Trash2 size={10} /></button>
                    </div>
                  ))}
                  <button onClick={() => addArrayField(activeIdx, 'relatedServices')} className="text-xs bg-[#34d99a]/10 text-[#34d99a] border border-[#34d99a]/20 rounded-full px-3 py-1">+ Add Related Service</button>
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => removeItem(activeIdx)}
                  className="text-xs text-red-400 hover:text-red-300 hover:underline flex items-center gap-1"
                >
                  <Trash2 size={13} /> Delete this technology
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="admin-save-btn text-xs px-5 py-2.5 flex items-center gap-1.5"
                >
                  {saved ? <><CheckCircle2 size={14} /> Saved!</> : <><Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}</>}
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm text-[#6b6f80] italic">Select or add a technology entry on the left to edit.</p>
          )}
        </div>
      </div>
    </div>
  );
}
