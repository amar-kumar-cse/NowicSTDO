import { useState, useEffect, useRef } from 'react';
import { Settings, Briefcase, FolderOpen, BarChart3, HelpCircle, Info, ArrowRight, DollarSign, Calendar, MessageSquare, Inbox, ExternalLink, ArrowUpRight, TrendingUp, UserCheck, ShieldAlert, Plus, Check, X, RefreshCw, Trash2, FileText, Square, CheckSquare, Edit3, Save, CheckCircle, Sliders, ChevronDown, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const sections = [
    { to: '/admin/brand', icon: Settings, label: 'Brand Settings', desc: 'Name, tagline, contact info' },
    { to: '/admin/services', icon: Briefcase, label: 'Services', desc: 'Manage your service offerings' },
    { to: '/admin/technologies', icon: Cpu, label: 'Technologies', desc: 'Manage technology stack' },
    { to: '/admin/portfolio', icon: FolderOpen, label: 'Portfolio', desc: 'Add, edit & remove projects' },
    { to: '/admin/stats', icon: BarChart3, label: 'Stats & Highlights', desc: 'Key numbers & metrics' },
    { to: '/admin/about', icon: Info, label: 'About Page', desc: 'WhyUs, values & milestones' },
    { to: '/admin/faqs', icon: HelpCircle, label: 'FAQs', desc: 'Frequently asked questions' },
];

const defaultMetricPlots = {
    revenue: [
        { label: 'Mon', val: 240000, display: '₹2.4L', x: 40, y: 130 },
        { label: 'Tue', val: 380000, display: '₹3.8L', x: 110, y: 95 },
        { label: 'Wed', val: 310000, display: '₹3.1L', x: 180, y: 110 },
        { label: 'Thu', val: 560000, display: '₹5.6L', x: 250, y: 55 },
        { label: 'Fri', val: 480000, display: '₹4.8L', x: 320, y: 70 },
        { label: 'Sat', val: 720000, display: '₹7.2L', x: 390, y: 35 },
        { label: 'Sun', val: 840000, display: '₹8.4L', x: 460, y: 15 }
    ],
    leads: [
        { label: 'Mon', val: 3, display: '3 Leads', x: 40, y: 140 },
        { label: 'Tue', val: 6, display: '6 Leads', x: 110, y: 110 },
        { label: 'Wed', val: 4, display: '4 Leads', x: 180, y: 130 },
        { label: 'Thu', val: 11, display: '11 Leads', x: 250, y: 70 },
        { label: 'Fri', val: 8, display: '8 Leads', x: 320, y: 95 },
        { label: 'Sat', val: 15, display: '15 Leads', x: 390, y: 50 },
        { label: 'Sun', val: 18, display: '18 Leads', x: 460, y: 20 }
    ],
    visitors: [
        { label: 'Mon', val: 112, display: '112 Visitors', x: 40, y: 150 },
        { label: 'Tue', val: 185, display: '185 Visitors', x: 110, y: 120 },
        { label: 'Wed', val: 140, display: '140 Visitors', x: 180, y: 135 },
        { label: 'Thu', val: 290, display: '290 Visitors', x: 250, y: 80 },
        { label: 'Fri', val: 220, display: '220 Visitors', x: 320, y: 105 },
        { label: 'Sat', val: 340, display: '340 Visitors', x: 390, y: 60 },
        { label: 'Sun', val: 420, display: '420 Visitors', x: 460, y: 30 }
    ]
};

export default function Dashboard() {
    const { getApiToken } = useAuth();
    const [data, setData] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [newTaskText, setNewTaskText] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('revenue');
    const [activePoint, setActivePoint] = useState(null);
    const [toast, setToast] = useState(null);
    const [modal, setModal] = useState(null); // 'lead' | 'project' | null
    
    // Notion-Style Editable Grid states
    const [editingCell, setEditingCell] = useState(null); // { id: 1, field: 'company_name' }
    const [editValue, setEditValue] = useState('');

    // Dynamic Chart Metrics Customizer state
    const [chartMetrics, setChartMetrics] = useState(defaultMetricPlots);
    const [showChartCustomizer, setShowChartCustomizer] = useState(false);

    // Admin Scratchpad state
    const [scratchpad, setScratchpad] = useState('Type your executive memos or project checklists here. Auto-saves to database.');
    const [savingScratchpad, setSavingScratchpad] = useState(false);
    const scratchpadTimeoutRef = useRef(null);

    // Modal Form States
    const [leadForm, setLeadForm] = useState({ founder_name: '', company_name: '', email: '', phone: '', source: 'direct', status: 'sent', notes: '' });
    const [projectForm, setProjectForm] = useState({ name: '', deadline: '', cost: '', status: 'planning', progress: 0 });
    const [actionSaving, setActionSaving] = useState(false);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    const withEmptyOn404 = (promise) => 
        promise.catch(err => {
            if (err.status === 404 || err.response?.status === 404) return { success: true, data: { data: null } };
            throw err;
        });

    const fetchDashboardData = async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        else setRefreshing(true);
        try {
            const token = await getApiToken();
            const [dashboardRes, invoicesRes, tasksRes, chartMetricsRes, scratchpadRes] = await Promise.allSettled([
                api.admin_dashboard(token),
                api.admin_getInvoices(token),
                withEmptyOn404(api.getSiteContentSection('quickTasks')),
                withEmptyOn404(api.getSiteContentSection('customAnalytics')),
                withEmptyOn404(api.getSiteContentSection('adminMemo'))
            ]);

            if (dashboardRes.status === 'fulfilled' && dashboardRes.value?.success) {
                setData(dashboardRes.value.data);
            }
            if (invoicesRes.status === 'fulfilled' && invoicesRes.value?.success) {
                setInvoices(invoicesRes.value.data || []);
            }
            if (tasksRes.status === 'fulfilled' && tasksRes.value?.success && tasksRes.value.data?.data) {
                setTasks(tasksRes.value.data.data);
            } else {
                setTasks([
                    { id: 1, text: 'Confirm booking times for new clients', completed: false },
                    { id: 2, text: 'Review catering services page copy', completed: true },
                    { id: 3, text: 'Ship premium glassmorphism updates to production', completed: false }
                ]);
            }
            if (chartMetricsRes.status === 'fulfilled' && chartMetricsRes.value?.success && chartMetricsRes.value.data?.data) {
                setChartMetrics(chartMetricsRes.value.data.data);
            }
            if (scratchpadRes.status === 'fulfilled' && scratchpadRes.value?.success && scratchpadRes.value.data?.data) {
                setScratchpad(scratchpadRes.value.data.data);
            }
        } catch (err) {
            console.error(err);
            showToast('Failed to load dashboard metrics', 'error');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        return () => {
            if (scratchpadTimeoutRef.current) {
                clearTimeout(scratchpadTimeoutRef.current);
            }
        };
    }, []);

    // Handle autosaving scratchpad text (debounce)
    const handleScratchpadChange = (e) => {
        const val = e.target.value;
        setScratchpad(val);
        setSavingScratchpad(true);

        if (scratchpadTimeoutRef.current) clearTimeout(scratchpadTimeoutRef.current);

        scratchpadTimeoutRef.current = setTimeout(async () => {
            try {
                const token = await getApiToken();
                await api.saveAdminSiteContent(token, 'adminMemo', val);
                setSavingScratchpad(false);
            } catch (err) {
                console.error(err);
                setSavingScratchpad(false);
                showToast('Failed to auto-save scratchpad', 'error');
            }
        }, 1500);
    };

    const handleSaveChartMetrics = async (newMetrics) => {
        setChartMetrics(newMetrics);
        try {
            const token = await getApiToken();
            await api.saveAdminSiteContent(token, 'customAnalytics', newMetrics);
            showToast('Analytics trends updated dynamically!');
        } catch (err) {
            console.error(err);
            showToast('Failed to save chart metrics', 'error');
        }
    };

    const handleMetricValChange = (idx, field, value) => {
        const numericVal = parseFloat(value) || 0;
        const newMetrics = { ...chartMetrics };
        
        // Update values and display strings
        newMetrics[activeTab][idx].val = numericVal;
        if (activeTab === 'revenue') {
            newMetrics[activeTab][idx].display = `₹${(numericVal / 100000).toFixed(1)}L`;
        } else {
            newMetrics[activeTab][idx].display = `${numericVal} ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`;
        }

        // Auto-scale coordinate Y mapping dynamically based on values (max height 180, padding 20)
        const vals = newMetrics[activeTab].map(pt => pt.val);
        const maxVal = Math.max(...vals, 1);
        newMetrics[activeTab].forEach(pt => {
            pt.y = 180 - ((pt.val / maxVal) * 140 + 15);
        });

        handleSaveChartMetrics(newMetrics);
    };

    const handleSaveTasks = async (newTasks) => {
        setTasks(newTasks);
        try {
            const token = await getApiToken();
            await api.saveAdminSiteContent(token, 'quickTasks', newTasks);
        } catch (err) {
            console.error('Failed to save tasks:', err);
        }
    };

    const handleToggleTask = (taskId) => {
        const updated = tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
        handleSaveTasks(updated);
        showToast('Task status updated');
    };

    const handleAddTask = (e) => {
        e.preventDefault();
        if (!newTaskText.trim()) return;
        const newTask = {
            id: Date.now(),
            text: newTaskText.trim(),
            completed: false
        };
        const updated = [...tasks, newTask];
        handleSaveTasks(updated);
        setNewTaskText('');
        showToast('Task added');
    };

    const handleDeleteTask = (taskId) => {
        const updated = tasks.filter(t => t.id !== taskId);
        handleSaveTasks(updated);
        showToast('Task deleted');
    };

    // Notion-Style cell key trigger
    const startEditingCell = (id, field, curVal) => {
        setEditingCell({ id, field });
        setEditValue(curVal || '');
    };

    const handleCellBlur = async () => {
        if (!editingCell) return;
        const { id, field } = editingCell;
        setEditingCell(null);
        try {
            const token = await getApiToken();
            await api.crm_updateLead(token, id, { [field]: editValue });
            showToast('Lead field updated in database!');
            fetchDashboardData(true);
        } catch (err) {
            console.error(err);
            showToast('Failed to save inline edit', 'error');
        }
    };

    const handleCellKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleCellBlur();
        } else if (e.key === 'Escape') {
            setEditingCell(null);
        }
    };

    const handleUpdateLeadStatus = async (leadId, newStatus) => {
        try {
            const token = await getApiToken();
            const res = await api.crm_updateLead(token, leadId, { status: newStatus });
            if (res.success || res.id) {
                showToast('Lead status updated!');
                fetchDashboardData(true);
            }
        } catch (err) {
            console.error(err);
            showToast('Failed to update status', 'error');
        }
    };

    const handleUpdateSubmissionStatus = async (subId, newStatus) => {
        try {
            const token = await getApiToken();
            const res = await api.crm_updateSubmission(token, subId, { status: newStatus });
            if (res.success || res.id) {
                showToast(`Inquiry marked as ${newStatus}!`);
                fetchDashboardData(true);
            }
        } catch (err) {
            console.error(err);
            showToast('Failed to update status', 'error');
        }
    };

    const handleUpdateInvoiceStatus = async (invId, newStatus) => {
        try {
            const token = await getApiToken();
            const res = await api.admin_updateInvoice(token, invId, { status: newStatus });
            if (res) {
                showToast(`Invoice marked as ${newStatus}!`);
                fetchDashboardData(true);
            }
        } catch (err) {
            console.error(err);
            showToast('Failed to update status', 'error');
        }
    };

    const handleCreateLead = async (e) => {
        e.preventDefault();
        setActionSaving(true);
        try {
            const token = await getApiToken();
            const res = await api.crm_createLead(token, leadForm);
            if (res) {
                showToast('Lead created successfully!');
                setModal(null);
                setLeadForm({ founder_name: '', company_name: '', email: '', phone: '', source: 'direct', status: 'sent', notes: '' });
                fetchDashboardData(true);
            }
        } catch (err) {
            console.error(err);
            showToast(err.message || 'Failed to create lead', 'error');
        } finally {
            setActionSaving(false);
        }
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        setActionSaving(true);
        try {
            const token = await getApiToken();
            const res = await api.crm_createProject(token, projectForm);
            if (res) {
                showToast('Project created successfully!');
                setModal(null);
                setProjectForm({ name: '', deadline: '', cost: '', status: 'planning', progress: 0 });
                fetchDashboardData(true);
            }
        } catch (err) {
            console.error(err);
            showToast(err.message || 'Failed to create project', 'error');
        } finally {
            setActionSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    const summary = data?.summary || {};
    const recentLeads = data?.recent_leads || [];
    const recentContacts = data?.recent_contacts || [];
    const quickStats = data?.quick_stats || {};

    const formattedRevenue = parseFloat(summary.total_revenue || 0).toLocaleString('en-IN', {
        maximumFractionDigits: 0,
        style: 'currency',
        currency: 'INR'
    });

    const statCards = [
        { key: 'revenue', label: 'Total Revenue', value: formattedRevenue, desc: 'Delivered project sales', icon: DollarSign, color: 'emerald', spark: [12, 18, 14, 25, 20, 28, 35] },
        { key: 'leads', label: 'Active Leads', value: summary.total_leads || 0, desc: `${summary.new_leads_today || 0} incoming today`, icon: TrendingUp, color: 'mint', spark: [5, 12, 8, 22, 15, 26, 32] },
        { key: 'bookings', label: 'Pending Bookings', value: summary.pending_bookings || 0, desc: `${summary.total_bookings || 0} overall appointments`, icon: Calendar, color: 'amber', spark: [15, 22, 18, 30, 22, 28, 34] },
        { key: 'visitors', label: 'Unread Inquiries', value: summary.unread_contacts || 0, desc: `${quickStats.contacts_this_week || 0} this week`, icon: Inbox, color: 'indigo', spark: [8, 15, 10, 26, 18, 30, 38] },
    ];

    const activeChartPoints = (chartMetrics && chartMetrics[activeTab] && Array.isArray(chartMetrics[activeTab]) && chartMetrics[activeTab].length === 7)
        ? chartMetrics[activeTab]
        : defaultMetricPlots[activeTab];

    // Generate area path dynamically
    const areaPath = `
        M ${activeChartPoints[0].x} ${activeChartPoints[0].y}
        C ${activeChartPoints[0].x + 35} ${activeChartPoints[0].y - 15}, ${activeChartPoints[1].x - 35} ${activeChartPoints[1].y + 10}, ${activeChartPoints[1].x} ${activeChartPoints[1].y}
        C ${activeChartPoints[1].x + 35} ${activeChartPoints[1].y - 10}, ${activeChartPoints[2].x - 35} ${activeChartPoints[2].y + 10}, ${activeChartPoints[2].x} ${activeChartPoints[2].y}
        C ${activeChartPoints[2].x + 35} ${activeChartPoints[2].y - 25}, ${activeChartPoints[3].x - 35} ${activeChartPoints[3].y + 15}, ${activeChartPoints[3].x} ${activeChartPoints[3].y}
        C ${activeChartPoints[3].x + 35} ${activeChartPoints[3].y - 10}, ${activeChartPoints[4].x - 35} ${activeChartPoints[4].y + 10}, ${activeChartPoints[4].x} ${activeChartPoints[4].y}
        C ${activeChartPoints[4].x + 35} ${activeChartPoints[4].y - 20}, ${activeChartPoints[5].x - 35} ${activeChartPoints[5].y + 10}, ${activeChartPoints[5].x} ${activeChartPoints[5].y}
        C ${activeChartPoints[5].x + 35} ${activeChartPoints[5].y - 10}, ${activeChartPoints[6].x - 35} ${activeChartPoints[6].y + 10}, ${activeChartPoints[6].x} ${activeChartPoints[6].y}
        L ${activeChartPoints[6].x} 180 L ${activeChartPoints[0].x} 180 Z
    `;

    const linePath = `
        M ${activeChartPoints[0].x} ${activeChartPoints[0].y}
        C ${activeChartPoints[0].x + 35} ${activeChartPoints[0].y - 15}, ${activeChartPoints[1].x - 35} ${activeChartPoints[1].y + 10}, ${activeChartPoints[1].x} ${activeChartPoints[1].y}
        C ${activeChartPoints[1].x + 35} ${activeChartPoints[1].y - 10}, ${activeChartPoints[2].x - 35} ${activeChartPoints[2].y + 10}, ${activeChartPoints[2].x} ${activeChartPoints[2].y}
        C ${activeChartPoints[2].x + 35} ${activeChartPoints[2].y - 25}, ${activeChartPoints[3].x - 35} ${activeChartPoints[3].y + 15}, ${activeChartPoints[3].x} ${activeChartPoints[3].y}
        C ${activeChartPoints[3].x + 35} ${activeChartPoints[3].y - 10}, ${activeChartPoints[4].x - 35} ${activeChartPoints[4].y + 10}, ${activeChartPoints[4].x} ${activeChartPoints[4].y}
        C ${activeChartPoints[4].x + 35} ${activeChartPoints[4].y - 20}, ${activeChartPoints[5].x - 35} ${activeChartPoints[5].y + 10}, ${activeChartPoints[5].x} ${activeChartPoints[5].y}
        C ${activeChartPoints[5].x + 35} ${activeChartPoints[5].y - 10}, ${activeChartPoints[6].x - 35} ${activeChartPoints[6].y + 10}, ${activeChartPoints[6].x} ${activeChartPoints[6].y}
    `;

    const themeColors = {
        revenue: { stroke: '#34d99a', fillGrad: 'revenue-grad', colorClass: 'text-emerald-400', bgBox: 'rgba(52,217,154,0.1)' },
        leads: { stroke: '#8adeb7', fillGrad: 'leads-grad', colorClass: 'text-mint', bgBox: 'rgba(189,223,188,0.1)' },
        visitors: { stroke: '#6366f1', fillGrad: 'visitors-grad', colorClass: 'text-indigo-400', bgBox: 'rgba(99,102,241,0.1)' }
    };

    const currentTheme = themeColors[activeTab];

    const unpaidInvoices = invoices.filter(inv => inv.status !== 'paid').slice(0, 4);

    return (
        <div className="space-y-8 relative pb-10">
            
            {/* Custom Toast Alert */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 rounded-xl px-4 py-3 text-xs font-semibold shadow-2xl border flex items-center gap-2 backdrop-blur-xl transition-all duration-300 ${
                    toast.type === 'error' 
                        ? 'border-red-500/20 bg-red-950/70 text-red-300' 
                        : 'border-mint/20 bg-emerald-950/70 text-mint'
                }`}>
                    <Check size={14} className={toast.type === 'error' ? 'hidden' : 'block'} />
                    <span>{toast.message}</span>
                </div>
            )}

            {/* Top Command Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#f0f0f3] tracking-tight">CRM Control Tower</h1>
                    <p className="mt-1 text-sm text-[#6b6f80]">Draggable components, spreadsheet-style editable grids, custom analytics trend overwrites.</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => fetchDashboardData(true)} 
                        disabled={refreshing}
                        className="p-2.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] text-[#8b8fa3] transition-colors"
                    >
                        <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                    </button>
                    <button 
                        onClick={() => setModal('lead')}
                        className="admin-save-btn text-xs px-4 py-2 flex items-center gap-1.5"
                    >
                        <Plus size={14} /> Add Lead
                    </button>
                    <button 
                        onClick={() => setModal('project')}
                        className="admin-save-btn text-xs px-4 py-2 flex items-center gap-1.5 !bg-white/[0.04] !border-white/10 hover:!bg-white/[0.08] !text-white"
                    >
                        <Plus size={14} /> Add Project
                    </button>
                </div>
            </div>

            {/* Metrics cards grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((c) => {
                    const Icon = c.icon;
                    const isActive = activeTab === c.key;
                    const sparkXInterval = 80 / (c.spark.length - 1);
                    const sparkPath = c.spark.map((val, idx) => `${idx === 0 ? 'M' : 'L'} ${10 + (idx * sparkXInterval)} ${40 - val}`).join(' ');

                    return (
                        <div 
                            key={c.label} 
                            onClick={() => setActiveTab(c.key)}
                            className={`stats-glass p-5 border relative group cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                                isActive 
                                    ? 'border-[#34d99a]/30 bg-white/[0.04] shadow-[0_4px_25px_rgba(52,217,154,0.04)]' 
                                    : 'border-white/5 hover:border-white/10'
                            }`}
                            style={{ minHeight: '135px' }}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#6b6f80]">{c.label}</p>
                                    <p className="mt-2 text-2xl font-extrabold text-[#f0f0f3] tracking-tight">{c.value}</p>
                                </div>
                                <div className={`p-2 rounded-xl transition-all duration-300 ${
                                    isActive ? 'bg-[#34d99a]/20 text-[#34d99a]' : 'bg-white/[0.02] text-[#8b8fa3]'
                                }`}>
                                    <Icon size={16} />
                                </div>
                            </div>

                            <div className="flex items-end justify-between mt-4">
                                <p className="text-[10px] text-[#8b8fa3] truncate max-w-[120px]">{c.desc}</p>
                                <svg className="w-20 h-8 overflow-visible opacity-50 group-hover:opacity-100 transition-opacity">
                                    <path d={sparkPath} fill="none" stroke={isActive ? '#34d99a' : 'rgba(255,255,255,0.2)'} strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Analytics Graph & Content Editors Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Visual SVG chart */}
                <div className="lg:col-span-2 stats-glass p-5 border border-white/5 relative overflow-hidden flex flex-col justify-between" style={{ minHeight: '330px' }}>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-sm font-bold text-[#f0f0f3] flex items-center gap-1.5">
                                Analytics Pipeline
                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${currentTheme.colorClass} ${activeTab === 'revenue' ? 'bg-emerald-500/10' : activeTab === 'leads' ? 'bg-mint/10' : 'bg-indigo-500/10'}`}>
                                    {activeTab}
                                </span>
                            </h3>
                            <p className="text-xs text-[#6b6f80]">Click metrics cards above to switch visualized data</p>
                        </div>
                        <div className="flex gap-2 items-center">
                            <button 
                                onClick={() => setShowChartCustomizer(!showChartCustomizer)}
                                className={`p-1.5 rounded-lg border transition-colors ${showChartCustomizer ? 'bg-white/[0.08] text-white border-white/10' : 'text-[#6b6f80] border-transparent hover:text-white'}`}
                                title="Override Chart Data Manually"
                            >
                                <Sliders size={14} />
                            </button>
                            <div className="flex gap-1 bg-[#0e0f14]/50 border border-white/5 rounded-lg p-0.5">
                                {['revenue', 'leads', 'visitors'].map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setActiveTab(t)}
                                        className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded-md transition-colors ${
                                            activeTab === t 
                                                ? 'bg-white/[0.06] text-white' 
                                                : 'text-[#6b6f80] hover:text-white'
                                        }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Manual Trend Override panel */}
                    {showChartCustomizer && (
                        <div className="mb-4 p-3 bg-white/[0.02] border border-white/5 rounded-xl grid grid-cols-7 gap-2 animate-slide-in">
                            {activeChartPoints.map((pt, idx) => (
                                <div key={`edit-${pt.label}-${idx}`}>
                                    <label className="block text-[8px] uppercase tracking-wider font-bold text-[#6b6f80] text-center mb-1">{pt.label}</label>
                                    <input 
                                        type="number" 
                                        value={pt.val} 
                                        onChange={(e) => handleMetricValChange(idx, 'val', e.target.value)}
                                        className="w-full text-center bg-black/40 border border-white/5 focus:border-[#34d99a]/35 text-xs text-white p-1 rounded outline-none" 
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Chart Container */}
                    <div className="relative flex-1 w-full flex items-center justify-center select-none mt-2">
                        <svg className="w-full h-48 overflow-visible" viewBox="0 0 500 180">
                            <defs>
                                <linearGradient id="revenue-grad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#34d99a" stopOpacity="0.18" />
                                    <stop offset="100%" stopColor="#34d99a" stopOpacity="0.0" />
                                </linearGradient>
                                <linearGradient id="leads-grad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#8adeb7" stopOpacity="0.18" />
                                    <stop offset="100%" stopColor="#8adeb7" stopOpacity="0.0" />
                                </linearGradient>
                                <linearGradient id="visitors-grad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.18" />
                                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                                </linearGradient>
                            </defs>
                            
                            {/* Grid lines */}
                            <line x1="40" y1="20" x2="460" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                            <line x1="40" y1="65" x2="460" y2="65" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                            <line x1="40" y1="110" x2="460" y2="110" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                            <line x1="40" y1="155" x2="460" y2="155" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                            <line x1="40" y1="180" x2="460" y2="180" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" />

                            {/* Area Fill */}
                            <path d={areaPath} fill={`url(#${currentTheme.fillGrad})`} className="transition-all duration-500 ease-in-out" />

                            {/* Main Stroke */}
                            <path d={linePath} fill="none" stroke={currentTheme.stroke} strokeWidth="2.5" strokeLinecap="round" className="transition-all duration-500 ease-in-out" />

                            {/* Data points */}
                            {activeChartPoints.map((pt, idx) => (
                                <g key={pt.label} className="cursor-pointer">
                                    <circle 
                                        cx={pt.x} 
                                        cy={pt.y} 
                                        r="18" 
                                        fill="transparent" 
                                        onMouseEnter={() => setActivePoint(idx)}
                                        onMouseLeave={() => setActivePoint(null)}
                                    />
                                    <circle 
                                        cx={pt.x} 
                                        cy={pt.y} 
                                        r={activePoint === idx ? "5.5" : "3.5"} 
                                        fill="#0a0b0f" 
                                        stroke={currentTheme.stroke} 
                                        strokeWidth={activePoint === idx ? "3" : "2"}
                                        className="transition-all duration-200"
                                    />
                                </g>
                            ))}
                        </svg>

                        {/* Interactive Tooltip Overlay */}
                        {activePoint !== null && (
                            <div 
                                className="absolute bg-[#12131a]/95 border backdrop-blur-md rounded-xl p-3 shadow-xl z-20 text-xs w-36 pointer-events-none transition-all duration-200"
                                style={{ 
                                    borderColor: currentTheme.stroke,
                                    left: `${(activeChartPoints[activePoint].x / 500) * 100}%`,
                                    top: `${(activeChartPoints[activePoint].y / 180) * 100 - 30}%`,
                                    transform: 'translate(-50%, -100%)'
                                }}
                            >
                                <p className="font-bold text-[#f0f0f3] mb-1">{activeChartPoints[activePoint].label} Performance</p>
                                <div className="space-y-0.5">
                                    <p className="flex justify-between text-[#8b8fa3]">
                                        <span>Value:</span> 
                                        <span className={`${currentTheme.colorClass} font-bold`}>{activeChartPoints[activePoint].display}</span>
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Chart X Labels */}
                    <div className="flex justify-between px-3 text-[10px] text-[#6b6f80] font-semibold uppercase mt-2">
                        {activeChartPoints.map((pt) => <span key={pt.label}>{pt.label}</span>)}
                    </div>
                </div>

                {/* Quick Link Editor Options */}
                <div className="grid gap-3 content-start">
                    <h3 className="text-xs font-bold text-[#6b6f80] uppercase tracking-widest pl-1 mb-1">Site Content Tools</h3>
                    {sections.map(({ to, icon: Icon, label, desc }) => (
                        <Link
                            key={to}
                            to={to}
                            className="group flex items-center gap-3 rounded-xl border border-white/5 bg-[#0e0f14]/30 px-4 py-3 backdrop-blur-md transition-all duration-300 hover:border-[#34d99a]/30 hover:bg-[#12131a]/60 hover:translate-x-1"
                        >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#34d99a]/10 text-[#34d99a] group-hover:bg-[#34d99a]/20 transition-colors">
                                <Icon size={14} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-[#f0f0f3] truncate group-hover:text-[#34d99a] transition-colors">{label}</p>
                                <p className="text-[10px] text-[#6b6f80] truncate">{desc}</p>
                            </div>
                            <ArrowRight size={12} className="text-[#4a4e5e] group-hover:text-[#34d99a] transition-colors" />
                        </Link>
                    ))}
                </div>
            </div>

            {/* Airtable/Spreadsheet Style Editable Leads Grid */}
            <div className="stats-glass p-5 border border-white/5">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className="text-sm font-bold text-[#f0f0f3]">Spreadsheet-Style Leads Manager</h3>
                        <p className="text-xs text-[#6b6f80]">Double-click any cell to edit founder details, company, email, or phone directly. Press Enter to save.</p>
                    </div>
                    <Link to="/admin/leads" className="text-xs text-mint hover:text-[#34d99a] flex items-center gap-0.5">
                        Expand Grid <ArrowUpRight size={12} />
                    </Link>
                </div>

                <div className="overflow-x-auto border border-white/5 rounded-xl">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5 text-[#8b8fa3] font-bold uppercase tracking-wider">
                                <th className="p-3">Founder Name</th>
                                <th className="p-3">Company</th>
                                <th className="p-3">Email Address</th>
                                <th className="p-3">Phone</th>
                                <th className="p-3 text-right">Pipeline Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentLeads.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center p-8 text-[#6b6f80] italic">No active leads in database</td>
                                </tr>
                            ) : (
                                recentLeads.map((l) => (
                                    <tr key={l.id} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-colors group">
                                        
                                        {/* Founder Name Inline cell */}
                                        <td 
                                            className="p-3 cursor-pointer text-[#f0f0f3] hover:bg-white/[0.04] transition-colors max-w-[150px] truncate"
                                            onDoubleClick={() => startEditingCell(l.id, 'founder_name', l.founder_name)}
                                        >
                                            {editingCell?.id === l.id && editingCell?.field === 'founder_name' ? (
                                                <input 
                                                    autoFocus
                                                    type="text" 
                                                    value={editValue} 
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    onBlur={handleCellBlur}
                                                    onKeyDown={handleCellKeyDown}
                                                    className="w-full bg-[#0a0b0f] border border-mint/40 text-xs px-2 py-0.5 rounded text-white outline-none"
                                                />
                                            ) : (
                                                <span className="flex items-center gap-1.5">
                                                    {l.founder_name || 'Empty'}
                                                    <Edit3 size={10} className="opacity-0 group-hover:opacity-40 text-[#8b8fa3]" />
                                                </span>
                                            )}
                                        </td>

                                        {/* Company Name Inline cell */}
                                        <td 
                                            className="p-3 cursor-pointer hover:bg-white/[0.04] transition-colors max-w-[150px] truncate"
                                            onDoubleClick={() => startEditingCell(l.id, 'company_name', l.company_name)}
                                        >
                                            {editingCell?.id === l.id && editingCell?.field === 'company_name' ? (
                                                <input 
                                                    autoFocus
                                                    type="text" 
                                                    value={editValue} 
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    onBlur={handleCellBlur}
                                                    onKeyDown={handleCellKeyDown}
                                                    className="w-full bg-[#0a0b0f] border border-mint/40 text-xs px-2 py-0.5 rounded text-white outline-none"
                                                />
                                            ) : (
                                                <span className="flex items-center gap-1.5">
                                                    {l.company_name || 'Empty'}
                                                    <Edit3 size={10} className="opacity-0 group-hover:opacity-40 text-[#8b8fa3]" />
                                                </span>
                                            )}
                                        </td>

                                        {/* Email Address Inline cell */}
                                        <td 
                                            className="p-3 cursor-pointer hover:bg-white/[0.04] transition-colors max-w-[200px] truncate"
                                            onDoubleClick={() => startEditingCell(l.id, 'email', l.email)}
                                        >
                                            {editingCell?.id === l.id && editingCell?.field === 'email' ? (
                                                <input 
                                                    autoFocus
                                                    type="text" 
                                                    value={editValue} 
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    onBlur={handleCellBlur}
                                                    onKeyDown={handleCellKeyDown}
                                                    className="w-full bg-[#0a0b0f] border border-mint/40 text-xs px-2 py-0.5 rounded text-white outline-none"
                                                />
                                            ) : (
                                                <span className="flex items-center gap-1.5">
                                                    {l.email || 'Empty'}
                                                    <Edit3 size={10} className="opacity-0 group-hover:opacity-40 text-[#8b8fa3]" />
                                                </span>
                                            )}
                                        </td>

                                        {/* Phone Inline cell */}
                                        <td 
                                            className="p-3 cursor-pointer hover:bg-white/[0.04] transition-colors"
                                            onDoubleClick={() => startEditingCell(l.id, 'phone', l.phone)}
                                        >
                                            {editingCell?.id === l.id && editingCell?.field === 'phone' ? (
                                                <input 
                                                    autoFocus
                                                    type="text" 
                                                    value={editValue} 
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    onBlur={handleCellBlur}
                                                    onKeyDown={handleCellKeyDown}
                                                    className="w-full bg-[#0a0b0f] border border-mint/40 text-xs px-2 py-0.5 rounded text-white outline-none"
                                                />
                                            ) : (
                                                <span className="flex items-center gap-1.5">
                                                    {l.phone || 'Empty'}
                                                    <Edit3 size={10} className="opacity-0 group-hover:opacity-40 text-[#8b8fa3]" />
                                                </span>
                                            )}
                                        </td>

                                        {/* Status selector */}
                                        <td className="p-3 text-right">
                                            <select
                                                value={l.status || 'sent'}
                                                onChange={(e) => handleUpdateLeadStatus(l.id, e.target.value)}
                                                className="bg-[#0a0b0f]/50 border border-white/5 rounded-lg px-2 py-1 text-[10px] font-bold text-mint uppercase outline-none cursor-pointer hover:border-white/10"
                                            >
                                                <option value="sent">Sent</option>
                                                <option value="reply">Replied</option>
                                                <option value="follow_up">Follow Up</option>
                                                <option value="won">Won (Active)</option>
                                                <option value="lost">Lost</option>
                                            </select>
                                        </td>

                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Advanced To-Do checklist & invoice manager */}
            <div className="grid gap-6 md:grid-cols-2">
                
                {/* Dynamic To-Do Checklist (Linear Style) */}
                <div className="stats-glass p-5 border border-white/5 flex flex-col justify-between" style={{ minHeight: '300px' }}>
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <div>
                                <h3 className="text-sm font-bold text-[#f0f0f3]">Sprint Task Planner</h3>
                                <p className="text-xs text-[#6b6f80]">Admins to-do checklists, synced with backend.</p>
                            </div>
                            <span className="text-[10px] bg-white/[0.04] border border-white/5 text-[#8b8fa3] px-2 py-0.5 rounded-full font-bold">
                                {tasks.filter(t => !t.completed).length} Pending
                            </span>
                        </div>

                        {/* List Area */}
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {tasks.map(t => (
                                <div key={t.id} className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.01] transition-all group">
                                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                        <button 
                                            onClick={() => handleToggleTask(t.id)} 
                                            className="text-[#8b8fa3] hover:text-[#34d99a] transition-colors"
                                        >
                                            {t.completed ? <CheckSquare size={16} className="text-[#34d99a]" /> : <Square size={16} />}
                                        </button>
                                        <span className={`text-xs truncate ${t.completed ? 'line-through text-[#6b6f80] decoration-white/20' : 'text-[#f0f0f3]'}`}>
                                            {t.text}
                                        </span>
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteTask(t.id)}
                                        className="opacity-0 group-hover:opacity-100 text-[#6b6f80] hover:text-red-400 p-1 transition-all"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Add Task Input Form */}
                    <form onSubmit={handleAddTask} className="flex gap-2 border-t border-white/5 pt-4 mt-4">
                        <input 
                            type="text" 
                            value={newTaskText}
                            onChange={(e) => setNewTaskText(e.target.value)}
                            placeholder="Add sprint tasks..." 
                            className="flex-1 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:border-[#34d99a]/30 outline-none"
                        />
                        <button type="submit" className="p-2 rounded-lg bg-[#34d99a] text-black hover:bg-mint transition-colors">
                            <Plus size={14} />
                        </button>
                    </form>
                </div>

                {/* Persistent Admin Scratchpad / Rich Memo */}
                <div className="stats-glass p-5 border border-white/5 flex flex-col justify-between" style={{ minHeight: '300px' }}>
                    <div className="flex-1 flex flex-col">
                        <div className="flex justify-between items-center mb-3">
                            <div>
                                <h3 className="text-sm font-bold text-[#f0f0f3]">Executive Scratchpad</h3>
                                <p className="text-xs text-[#6b6f80]">Admins persistent note pad. Auto-saves to Django DB.</p>
                            </div>
                            {savingScratchpad ? (
                                <span className="text-[10px] text-mint flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-mint animate-pulse" /> Auto-saving</span>
                            ) : (
                                <span className="text-[10px] text-[#6b6f80] flex items-center gap-1">Synced <Check size={10} /></span>
                            )}
                        </div>

                        <textarea
                            value={scratchpad}
                            onChange={handleScratchpadChange}
                            placeholder="Write draft proposal copy, launch timelines or database notes here..."
                            className="flex-1 w-full bg-white/[0.01] border border-white/5 focus:border-[#34d99a]/30 rounded-xl p-3 text-xs text-[#e0e0e8] placeholder-[#4a4e5e] outline-none resize-none !h-auto"
                            style={{ minHeight: '180px' }}
                        />
                    </div>
                </div>

            </div>

            {/* Pending Invoices Inquiry Panel */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Pending Unpaid Invoices Board */}
                <div className="stats-glass p-5 border border-white/5 flex flex-col justify-between" style={{ minHeight: '300px' }}>
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-sm font-bold text-[#f0f0f3]">Pipeline Invoices</h3>
                                <p className="text-xs text-[#6b6f80]">Latest unpaid client invoices. Clear them inline.</p>
                            </div>
                            <Link to="/admin/invoices" className="text-xs text-mint hover:text-[#34d99a] flex items-center gap-0.5">
                                View all <ArrowUpRight size={12} />
                            </Link>
                        </div>

                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {unpaidInvoices.length === 0 ? (
                                <div className="text-center py-10 text-xs text-[#6b6f80] italic">No pending unpaid invoices! Excellent job.</div>
                            ) : (
                                unpaidInvoices.map((inv) => (
                                    <div key={inv.id} className="flex justify-between items-center p-3 rounded-lg bg-white/[0.02] border border-white/[0.01] hover:border-white/5 hover:bg-white/[0.04] transition-all group/inv">
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-[#f0f0f3] truncate">Invoice #{inv.invoice_number}</p>
                                            <p className="text-[10px] text-[#6b6f80] truncate">Amount: ₹{parseFloat(inv.amount || 0).toLocaleString('en-IN')} • Due: {inv.due_date}</p>
                                        </div>
                                        <button
                                            onClick={() => handleUpdateInvoiceStatus(inv.id, 'paid')}
                                            className="opacity-0 group-hover/inv:opacity-100 bg-[#34d99a]/10 hover:bg-[#34d99a] text-[#34d99a] hover:text-black text-[9px] font-bold px-2 py-1.5 rounded-lg uppercase tracking-wider transition-all flex items-center gap-1"
                                            title="Mark as paid"
                                        >
                                            <Check size={11} /> Paid
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    
                    <div className="border-t border-white/5 pt-4 mt-4 flex items-center justify-between text-[10px] text-[#6b6f80] font-semibold uppercase">
                        <span>Total Unpaid: {unpaidInvoices.length} Invoices</span>
                        <Link to="/admin/invoices" className="flex items-center gap-1 text-[#34d99a] hover:text-mint transition-colors">
                            Create Invoice <Plus size={11} />
                        </Link>
                    </div>
                </div>

                {/* Recent Contact Submissions (Mark-read quick triggers) */}
                <div className="stats-glass p-5 border border-white/5 flex flex-col justify-between" style={{ minHeight: '300px' }}>
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-sm font-bold text-[#f0f0f3]">Recent Site Inquiries</h3>
                                <p className="text-xs text-[#6b6f80]">Latest submissions. Dismiss or reply inline.</p>
                            </div>
                            <Link to="/admin/leads" className="text-xs text-mint hover:text-[#34d99a] flex items-center gap-0.5">
                                Manage Leads <ArrowUpRight size={12} />
                            </Link>
                        </div>

                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {recentContacts.length === 0 ? (
                                <div className="text-center py-8 text-xs text-[#6b6f80]">All inquiries have been marked as read!</div>
                            ) : (
                                recentContacts.map((c) => (
                                    <div key={c.id} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.01] hover:border-white/5 hover:bg-white/[0.04] transition-all relative group/item">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="text-xs font-bold text-[#f0f0f3]">{c.name}</p>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                                    c.priority === 'high' ? 'bg-red-500/10 text-red-400' :
                                                    c.priority === 'medium' ? 'bg-amber-500/10 text-amber-400' :
                                                    'bg-[#8b8fa3]/10 text-[#8b8fa3]'
                                                }`}>
                                                    {c.priority}
                                                </span>
                                                <button 
                                                    onClick={() => handleUpdateSubmissionStatus(c.id, 'read')}
                                                    className="opacity-0 group-hover/item:opacity-100 hover:text-[#34d99a] text-[#6b6f80] transition-all p-0.5"
                                                    title="Mark read"
                                                >
                                                    <Check size={13} />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-[#8b8fa3] line-clamp-1 mb-1 italic">"{c.message}"</p>
                                        <p className="text-[9px] text-[#6b6f80]">{c.email} {c.service_name && `• Service: ${c.service_name}`}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    <div className="border-t border-white/5 pt-4 mt-4 flex items-center justify-between text-[10px] text-[#6b6f80] font-semibold uppercase">
                        <span>New Messages: {recentContacts.length}</span>
                    </div>
                </div>
            </div>

            {/* Dynamic Command Modals */}
            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
                    <div className="stats-glass max-w-md w-full border border-white/10 bg-[#0a0b0f] p-6 shadow-2xl rounded-2xl relative animate-scale-up">
                        <button 
                            onClick={() => setModal(null)} 
                            className="absolute top-4 right-4 text-[#8b8fa3] hover:text-white transition-colors"
                        >
                            <X size={16} />
                        </button>

                        {modal === 'lead' ? (
                            <form onSubmit={handleCreateLead} className="space-y-4">
                                <h3 className="text-base font-bold text-[#f0f0f3] border-b border-white/5 pb-2">Add New CRM Lead</h3>
                                <div>
                                    <label className="admin-label">Founder Name</label>
                                    <input required type="text" value={leadForm.founder_name} onChange={(e) => setLeadForm({...leadForm, founder_name: e.target.value})} className="admin-input" placeholder="e.g. Aman Sharma" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="admin-label">Company Name</label>
                                        <input required type="text" value={leadForm.company_name} onChange={(e) => setLeadForm({...leadForm, company_name: e.target.value})} className="admin-input" placeholder="e.g. Acme Inc" />
                                    </div>
                                    <div>
                                        <label className="admin-label">Source</label>
                                        <select value={leadForm.source} onChange={(e) => setLeadForm({...leadForm, source: e.target.value})} className="admin-input">
                                            <option value="direct">Direct</option>
                                            <option value="inbound">Inbound Contact</option>
                                            <option value="outbound">Outbound Referral</option>
                                            <option value="upwork">Upwork / Freelance</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="admin-label">Email</label>
                                        <input required type="email" value={leadForm.email} onChange={(e) => setLeadForm({...leadForm, email: e.target.value})} className="admin-input" placeholder="aman@acme.com" />
                                    </div>
                                    <div>
                                        <label className="admin-label">Phone</label>
                                        <input type="text" value={leadForm.phone} onChange={(e) => setLeadForm({...leadForm, phone: e.target.value})} className="admin-input" placeholder="Optional" />
                                    </div>
                                </div>
                                <div>
                                    <label className="admin-label">Requirement Details / Notes</label>
                                    <textarea rows={3} value={leadForm.notes} onChange={(e) => setLeadForm({...leadForm, notes: e.target.value})} className="admin-input !h-auto py-2" placeholder="Describe the scope, tech-stack, etc." />
                                </div>
                                <button type="submit" disabled={actionSaving} className="admin-save-btn w-full py-2.5 mt-2">
                                    {actionSaving ? 'Saving...' : 'Add Lead to Database'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleCreateProject} className="space-y-4">
                                <h3 className="text-base font-bold text-[#f0f0f3] border-b border-white/5 pb-2">Add New Active Project</h3>
                                <div>
                                    <label className="admin-label">Project Name</label>
                                    <input required type="text" value={projectForm.name} onChange={(e) => setProjectForm({...projectForm, name: e.target.value})} className="admin-input" placeholder="e.g. Food Delivery MVP" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="admin-label">Cost (Budget)</label>
                                        <input required type="number" value={projectForm.cost} onChange={(e) => setProjectForm({...projectForm, cost: e.target.value})} className="admin-input" placeholder="Budget in INR" />
                                    </div>
                                    <div>
                                        <label className="admin-label">Deadline</label>
                                        <input required type="date" value={projectForm.deadline} onChange={(e) => setProjectForm({...projectForm, deadline: e.target.value})} className="admin-input" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="admin-label">Status</label>
                                        <select value={projectForm.status} onChange={(e) => setProjectForm({...projectForm, status: e.target.value})} className="admin-input">
                                            <option value="planning">Planning</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="review">Under Review</option>
                                            <option value="delivered">Delivered</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="admin-label">Progress ({projectForm.progress}%)</label>
                                        <input type="range" min="0" max="100" value={projectForm.progress} onChange={(e) => setProjectForm({...projectForm, progress: parseInt(e.target.value)})} className="w-full h-8 outline-none accent-mint" />
                                    </div>
                                </div>
                                <button type="submit" disabled={actionSaving} className="admin-save-btn w-full py-2.5 mt-2">
                                    {actionSaving ? 'Saving...' : 'Add Project to Database'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
