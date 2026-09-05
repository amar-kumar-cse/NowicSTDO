import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useAuth } from '../../hooks/useAuth';
import { fetchSection, saveSection } from '../../lib/cms';
import { Save, Plus, Trash2, Download, ChevronDown, ChevronUp, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

// Default data used for seeding if the DB is empty
import { servicePricing, generalTiers, deliveryLifecycle } from '../../data/pricingData';

// Reusable String List Editor Component
const StringListEditor = ({ list, onChange, label, placeholder }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      <div className="space-y-2">
        {list.map((item, idx) => (
          <div key={idx} className="flex gap-2">
            <input 
              type="text" 
              value={item} 
              onChange={e => {
                const newList = [...list];
                newList[idx] = e.target.value;
                onChange(newList);
              }}
              className="flex-1 bg-[#0A0F0C] text-sm text-white px-3 py-2 rounded-lg border border-white/10 outline-none focus:border-[#34d99a]"
            />
            <button 
              onClick={() => {
                const newList = list.filter((_, i) => i !== idx);
                onChange(newList);
              }}
              className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              title="Remove Item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button 
          onClick={() => onChange([...list, placeholder || 'New Item'])}
          className="text-sm flex items-center gap-1 text-[#34d99a] hover:text-[#2cb27e] transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>
    </div>
  );
};

export default function PricingEditor() {
  const { admin } = useAdminAuth();
  const { getApiToken } = useAuth();
  const [data, setData] = useState(null);
  const [jsonText, setJsonText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [jsonError, setJsonError] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    loadData();
  }, []);

  const syncDataToText = (newData) => {
    setData(newData);
    setJsonText(JSON.stringify(newData, null, 2));
    setJsonError(false);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const dbData = await fetchSection('pricingData');
      if (dbData) {
        syncDataToText(dbData);
      } else {
        // Fallback to empty state
        syncDataToText({
          generalTiers: [],
          deliveryLifecycle: [],
          servicePricing: {}
        });
      }
    } catch (err) {
      toast.error('Failed to load pricing data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const seedDefaultData = async () => {
    const confirm = window.confirm("This will overwrite current pricing data with the default template. Are you sure?");
    if (!confirm) return;

    setSaving(true);
    try {
      const template = {
        generalTiers,
        deliveryLifecycle,
        servicePricing
      };
      const apiToken = await getApiToken();
      await saveSection('pricingData', template, apiToken);
      syncDataToText(template);
      toast.success('Successfully seeded default pricing data');
    } catch (err) {
      toast.error('Failed to seed data');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (jsonError) {
      toast.error('Cannot save: Invalid JSON format');
      return;
    }
    setSaving(true);
    try {
      const apiToken = await getApiToken();
      await saveSection('pricingData', data, apiToken);
      toast.success('Pricing data saved successfully');
    } catch (err) {
      toast.error('Failed to save pricing data');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const updateGeneralTier = (idx, field, value) => {
    const newTiers = [...data.generalTiers];
    newTiers[idx] = { ...newTiers[idx], [field]: value };
    syncDataToText({ ...data, generalTiers: newTiers });
  };

  const addGeneralTier = () => {
    const newTiers = [...(data.generalTiers || []), {
      name: 'New Tier', badge: '', price: '', retainer: '', scope: '', timeline: '', support: '', description: '', deliverables: [], ctaText: 'Get Started', popular: false
    }];
    syncDataToText({ ...data, generalTiers: newTiers });
  };

  const removeGeneralTier = (idx) => {
    const newTiers = data.generalTiers.filter((_, i) => i !== idx);
    syncDataToText({ ...data, generalTiers: newTiers });
  };

  const updateLifecycle = (idx, field, value) => {
    const newLifecycle = [...data.deliveryLifecycle];
    newLifecycle[idx] = { ...newLifecycle[idx], [field]: value };
    syncDataToText({ ...data, deliveryLifecycle: newLifecycle });
  };

  const addLifecycle = () => {
    const newLifecycle = [...(data.deliveryLifecycle || []), {
      step: '00', phase: 'New Phase', duration: '', title: '', description: '', deliverables: []
    }];
    syncDataToText({ ...data, deliveryLifecycle: newLifecycle });
  };

  const removeLifecycle = (idx) => {
    const newLifecycle = data.deliveryLifecycle.filter((_, i) => i !== idx);
    syncDataToText({ ...data, deliveryLifecycle: newLifecycle });
  };

  const updateServicePackage = (slug, idx, field, value) => {
    const newServicePricing = { ...data.servicePricing };
    if (!newServicePricing[slug]) newServicePricing[slug] = [];
    newServicePricing[slug][idx] = { ...newServicePricing[slug][idx], [field]: value };
    syncDataToText({ ...data, servicePricing: newServicePricing });
  };

  const addServicePackage = (slug) => {
    const newServicePricing = { ...data.servicePricing };
    if (!newServicePricing[slug]) newServicePricing[slug] = [];
    newServicePricing[slug].push({
      name: 'New Package', price: '', retainer: '', deliveryTime: '', warranty: '', description: '', idealFor: '', features: [], notIncluded: [], ctaText: 'Start', popular: false, delay: 0.1
    });
    syncDataToText({ ...data, servicePricing: newServicePricing });
  };

  const removeServicePackage = (slug, idx) => {
    const newServicePricing = { ...data.servicePricing };
    newServicePricing[slug] = newServicePricing[slug].filter((_, i) => i !== idx);
    syncDataToText({ ...data, servicePricing: newServicePricing });
  };

  const addNewServiceSlug = () => {
    const slug = prompt('Enter a new service slug (e.g., ai-solutions):');
    if (slug && !data.servicePricing[slug]) {
      const newServicePricing = { ...data.servicePricing, [slug]: [] };
      syncDataToText({ ...data, servicePricing: newServicePricing });
    }
  };

  const removeServiceSlug = (slug) => {
    if (window.confirm(`Are you sure you want to delete all pricing packages for ${slug}?`)) {
      const newServicePricing = { ...data.servicePricing };
      delete newServicePricing[slug];
      syncDataToText({ ...data, servicePricing: newServicePricing });
    }
  };


  if (loading) return <div className="p-8 text-white">Loading pricing configuration...</div>;
  if (!data) return <div className="p-8 text-white">No data available.</div>;

  return (
    <div className="p-8 bg-[#050806] min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Pricing Models</h1>
          <p className="text-[#8b8fa3]">Manage global pricing tiers, delivery lifecycles, and service-specific packages.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={seedDefaultData}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 text-yellow-500 rounded-lg font-medium hover:bg-yellow-500/20 transition-colors"
          >
            <Download className="w-4 h-4" />
            Seed Default Data
          </button>
          <button 
            onClick={handleSave}
            disabled={saving || jsonError}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${jsonError ? 'bg-red-500/50 text-white cursor-not-allowed' : 'bg-[#34d99a] text-[#050806] hover:bg-[#2cb27e]'}`}
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 mb-8">
        {[
          { id: 'general', label: 'General Tiers' },
          { id: 'lifecycle', label: 'Delivery Lifecycle' },
          { id: 'services', label: 'Service Pricing' },
          { id: 'json', label: 'Raw JSON (Advanced)' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
              activeTab === tab.id 
                ? 'border-[#34d99a] text-[#34d99a]' 
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-12">
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Global Pricing Tiers</h2>
              <button onClick={addGeneralTier} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors text-sm">
                <Plus className="w-4 h-4" /> Add Tier
              </button>
            </div>
            {(data.generalTiers || []).map((tier, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-lg font-bold text-white">Tier: {tier.name}</h3>
                  <button onClick={() => removeGeneralTier(idx)} className="text-red-400 hover:text-red-300 p-2"><Trash2 className="w-5 h-5" /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div><label className="block text-sm text-gray-400 mb-1">Name</label><input type="text" value={tier.name} onChange={e => updateGeneralTier(idx, 'name', e.target.value)} className="w-full bg-[#0A0F0C] text-white px-3 py-2 rounded-lg border border-white/10 outline-none focus:border-[#34d99a]" /></div>
                  <div><label className="block text-sm text-gray-400 mb-1">Badge (e.g., Scaling Businesses)</label><input type="text" value={tier.badge} onChange={e => updateGeneralTier(idx, 'badge', e.target.value)} className="w-full bg-[#0A0F0C] text-white px-3 py-2 rounded-lg border border-white/10 outline-none focus:border-[#34d99a]" /></div>
                  <div><label className="block text-sm text-gray-400 mb-1">Price</label><input type="text" value={tier.price} onChange={e => updateGeneralTier(idx, 'price', e.target.value)} className="w-full bg-[#0A0F0C] text-white px-3 py-2 rounded-lg border border-white/10 outline-none focus:border-[#34d99a]" /></div>
                  <div><label className="block text-sm text-gray-400 mb-1">Retainer (Optional)</label><input type="text" value={tier.retainer} onChange={e => updateGeneralTier(idx, 'retainer', e.target.value)} className="w-full bg-[#0A0F0C] text-white px-3 py-2 rounded-lg border border-white/10 outline-none focus:border-[#34d99a]" /></div>
                  <div><label className="block text-sm text-gray-400 mb-1">Scope</label><input type="text" value={tier.scope} onChange={e => updateGeneralTier(idx, 'scope', e.target.value)} className="w-full bg-[#0A0F0C] text-white px-3 py-2 rounded-lg border border-white/10 outline-none focus:border-[#34d99a]" /></div>
                  <div><label className="block text-sm text-gray-400 mb-1">Timeline</label><input type="text" value={tier.timeline} onChange={e => updateGeneralTier(idx, 'timeline', e.target.value)} className="w-full bg-[#0A0F0C] text-white px-3 py-2 rounded-lg border border-white/10 outline-none focus:border-[#34d99a]" /></div>
                  <div><label className="block text-sm text-gray-400 mb-1">Support</label><input type="text" value={tier.support} onChange={e => updateGeneralTier(idx, 'support', e.target.value)} className="w-full bg-[#0A0F0C] text-white px-3 py-2 rounded-lg border border-white/10 outline-none focus:border-[#34d99a]" /></div>
                  <div><label className="block text-sm text-gray-400 mb-1">CTA Text</label><input type="text" value={tier.ctaText} onChange={e => updateGeneralTier(idx, 'ctaText', e.target.value)} className="w-full bg-[#0A0F0C] text-white px-3 py-2 rounded-lg border border-white/10 outline-none focus:border-[#34d99a]" /></div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-1">Description</label>
                  <textarea value={tier.description} onChange={e => updateGeneralTier(idx, 'description', e.target.value)} className="w-full bg-[#0A0F0C] text-white px-3 py-2 rounded-lg border border-white/10 outline-none focus:border-[#34d99a] h-20" />
                </div>
                <div className="mb-4 flex items-center gap-2">
                  <input type="checkbox" checked={tier.popular || false} onChange={e => updateGeneralTier(idx, 'popular', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-[#34d99a] focus:ring-[#34d99a]" />
                  <label className="text-sm text-gray-300">Mark as Popular</label>
                </div>
                <StringListEditor list={tier.deliverables || []} onChange={val => updateGeneralTier(idx, 'deliverables', val)} label="Deliverables" placeholder="Add deliverable..." />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'lifecycle' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Delivery Lifecycle Steps</h2>
              <button onClick={addLifecycle} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors text-sm">
                <Plus className="w-4 h-4" /> Add Step
              </button>
            </div>
            {(data.deliveryLifecycle || []).map((cycle, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-lg font-bold text-white">Step: {cycle.step} - {cycle.phase}</h3>
                  <button onClick={() => removeLifecycle(idx)} className="text-red-400 hover:text-red-300 p-2"><Trash2 className="w-5 h-5" /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div><label className="block text-sm text-gray-400 mb-1">Step Number</label><input type="text" value={cycle.step} onChange={e => updateLifecycle(idx, 'step', e.target.value)} className="w-full bg-[#0A0F0C] text-white px-3 py-2 rounded-lg border border-white/10 outline-none focus:border-[#34d99a]" /></div>
                  <div><label className="block text-sm text-gray-400 mb-1">Phase Name</label><input type="text" value={cycle.phase} onChange={e => updateLifecycle(idx, 'phase', e.target.value)} className="w-full bg-[#0A0F0C] text-white px-3 py-2 rounded-lg border border-white/10 outline-none focus:border-[#34d99a]" /></div>
                  <div><label className="block text-sm text-gray-400 mb-1">Duration</label><input type="text" value={cycle.duration} onChange={e => updateLifecycle(idx, 'duration', e.target.value)} className="w-full bg-[#0A0F0C] text-white px-3 py-2 rounded-lg border border-white/10 outline-none focus:border-[#34d99a]" /></div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-1">Title</label>
                  <input type="text" value={cycle.title} onChange={e => updateLifecycle(idx, 'title', e.target.value)} className="w-full bg-[#0A0F0C] text-white px-3 py-2 rounded-lg border border-white/10 outline-none focus:border-[#34d99a]" />
                </div>
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-1">Description</label>
                  <textarea value={cycle.description} onChange={e => updateLifecycle(idx, 'description', e.target.value)} className="w-full bg-[#0A0F0C] text-white px-3 py-2 rounded-lg border border-white/10 outline-none focus:border-[#34d99a] h-20" />
                </div>
                <StringListEditor list={cycle.deliverables || []} onChange={val => updateLifecycle(idx, 'deliverables', val)} label="Key Deliverables" placeholder="Add deliverable..." />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'services' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Service Packages</h2>
                <p className="text-sm text-gray-400">Manage individual pricing tiers for specific service pages.</p>
              </div>
              <button onClick={addNewServiceSlug} className="flex items-center gap-2 px-4 py-2 bg-[#34d99a]/10 hover:bg-[#34d99a]/20 text-[#34d99a] rounded-lg transition-colors text-sm font-medium">
                <Plus className="w-4 h-4" /> Add New Service Group
              </button>
            </div>
            
            {Object.keys(data.servicePricing || {}).map((slug) => (
              <div key={slug} className="border border-white/10 rounded-2xl overflow-hidden">
                <div className="bg-white/5 p-4 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-[#34d99a]">Service ID:</span> {slug}
                  </h3>
                  <div className="flex items-center gap-4">
                    <button onClick={() => addServicePackage(slug)} className="text-sm flex items-center gap-1 text-white hover:text-[#34d99a] transition-colors">
                      <Plus className="w-4 h-4" /> Add Package
                    </button>
                    <button onClick={() => removeServiceSlug(slug)} className="text-red-400 hover:text-red-300 p-2" title="Delete entire service group">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="p-6 bg-[#050806] space-y-6">
                  {data.servicePricing[slug].map((pkg, idx) => (
                    <div key={idx} className="border border-white/5 bg-white/[0.02] rounded-xl p-6 relative">
                      <button onClick={() => removeServicePackage(slug, idx)} className="absolute top-4 right-4 text-gray-500 hover:text-red-400 transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <h4 className="text-white font-semibold mb-4 text-lg border-b border-white/5 pb-2">Package {idx + 1}: {pkg.name || 'Unnamed'}</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <div><label className="block text-sm text-gray-400 mb-1">Package Name</label><input type="text" value={pkg.name} onChange={e => updateServicePackage(slug, idx, 'name', e.target.value)} className="w-full bg-[#0A0F0C] text-white px-3 py-2 rounded-lg border border-white/10 outline-none focus:border-[#34d99a]" /></div>
                        <div><label className="block text-sm text-gray-400 mb-1">Price</label><input type="text" value={pkg.price} onChange={e => updateServicePackage(slug, idx, 'price', e.target.value)} className="w-full bg-[#0A0F0C] text-white px-3 py-2 rounded-lg border border-white/10 outline-none focus:border-[#34d99a]" /></div>
                        <div><label className="block text-sm text-gray-400 mb-1">Retainer (e.g. ₹2,499 / mo)</label><input type="text" value={pkg.retainer} onChange={e => updateServicePackage(slug, idx, 'retainer', e.target.value)} className="w-full bg-[#0A0F0C] text-white px-3 py-2 rounded-lg border border-white/10 outline-none focus:border-[#34d99a]" /></div>
                        <div><label className="block text-sm text-gray-400 mb-1">Delivery Time</label><input type="text" value={pkg.deliveryTime} onChange={e => updateServicePackage(slug, idx, 'deliveryTime', e.target.value)} className="w-full bg-[#0A0F0C] text-white px-3 py-2 rounded-lg border border-white/10 outline-none focus:border-[#34d99a]" /></div>
                        <div><label className="block text-sm text-gray-400 mb-1">Warranty / Support</label><input type="text" value={pkg.warranty} onChange={e => updateServicePackage(slug, idx, 'warranty', e.target.value)} className="w-full bg-[#0A0F0C] text-white px-3 py-2 rounded-lg border border-white/10 outline-none focus:border-[#34d99a]" /></div>
                        <div><label className="block text-sm text-gray-400 mb-1">CTA Text</label><input type="text" value={pkg.ctaText} onChange={e => updateServicePackage(slug, idx, 'ctaText', e.target.value)} className="w-full bg-[#0A0F0C] text-white px-3 py-2 rounded-lg border border-white/10 outline-none focus:border-[#34d99a]" /></div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Description</label>
                          <textarea value={pkg.description} onChange={e => updateServicePackage(slug, idx, 'description', e.target.value)} className="w-full bg-[#0A0F0C] text-white px-3 py-2 rounded-lg border border-white/10 outline-none focus:border-[#34d99a] h-20" />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Ideal For</label>
                          <textarea value={pkg.idealFor} onChange={e => updateServicePackage(slug, idx, 'idealFor', e.target.value)} className="w-full bg-[#0A0F0C] text-white px-3 py-2 rounded-lg border border-white/10 outline-none focus:border-[#34d99a] h-20" />
                        </div>
                      </div>
                      
                      <div className="mb-6 flex items-center gap-2">
                        <input type="checkbox" checked={pkg.popular || false} onChange={e => updateServicePackage(slug, idx, 'popular', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-[#34d99a] focus:ring-[#34d99a]" />
                        <label className="text-sm text-gray-300 font-medium">Highlight as Popular Choice</label>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <StringListEditor list={pkg.features || []} onChange={val => updateServicePackage(slug, idx, 'features', val)} label="Included Features" placeholder="Add feature..." />
                         <StringListEditor list={pkg.notIncluded || []} onChange={val => updateServicePackage(slug, idx, 'notIncluded', val)} label="Not Included (Crossed out)" placeholder="Add excluded feature..." />
                      </div>
                    </div>
                  ))}
                  {data.servicePricing[slug].length === 0 && (
                    <div className="text-gray-500 text-sm py-4">No packages added for this service yet.</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'json' && (
          <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                  <h2 className="text-xl font-bold text-white mb-1">Raw Configuration (JSON)</h2>
                  <p className="text-sm text-[#8b8fa3]">Edit the JSON directly. Ensure quotes and brackets are correct.</p>
              </div>
              {jsonError && <span className="text-red-400 text-sm font-medium">Invalid JSON! Please fix syntax errors before saving.</span>}
            </div>
            
            <textarea
              value={jsonText}
              onChange={(e) => {
                const val = e.target.value;
                setJsonText(val);
                try {
                  setData(JSON.parse(val));
                  setJsonError(false);
                } catch (err) {
                  setJsonError(true);
                }
              }}
              className={`w-full h-[600px] bg-[#0A0F0C] font-mono text-sm p-4 rounded-xl border outline-none ${jsonError ? 'text-red-400 border-red-500/50 focus:border-red-500' : 'text-[#34d99a] border-white/10 focus:border-[#34d99a] focus:ring-1 focus:ring-[#34d99a]'}`}
            />
          </section>
        )}
      </div>
    </div>
  );
}
