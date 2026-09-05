import { useState, useEffect } from 'react';
import { Search, Filter, Mail, Phone, ExternalLink, MoreVertical, CheckCircle2, XCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';

export default function LeadsManagement() {
    const { getApiToken } = useAuth();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        fetchLeads();
    }, [statusFilter]);

    const handleExportCSV = async () => {
        setExporting(true);
        try {
            const token = await getApiToken();
            const blob = await api.crm_exportLeads(token);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `leads_export_${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            console.error('Failed to export leads:', error);
            alert('Export failed');
        } finally {
            setExporting(false);
        }
    };

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const token = await getApiToken();
            const response = await api.crm_getLeads(token, { 
                search: search || undefined,
                status: statusFilter || undefined
            });
            if (response.success) {
                setLeads(response.data.results || response.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch leads:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchLeads();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'won': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'closed': return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 'follow_up': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case 'reply': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#f0f0f3]">Leads Management</h1>
                    <p className="mt-1 text-sm text-[#6b6f80]">Track and manage inbound enquiries</p>
                </div>
                <button
                    onClick={handleExportCSV}
                    disabled={exporting}
                    className="inline-flex items-center justify-center rounded-xl bg-[#34d99a] px-4 py-2 text-xs font-bold uppercase tracking-wider text-black transition-all hover:bg-mint disabled:opacity-50"
                >
                    {exporting ? 'Exporting...' : 'Export CSV'}
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4 sm:flex-row">
                <form onSubmit={handleSearch} className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a4e5e]" size={16} />
                    <input 
                        type="text" 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by company, name, or email..." 
                        className="w-full rounded-xl border border-[#1e2028] bg-[#0e0f14] py-2.5 pl-10 pr-4 text-sm text-[#f0f0f3] outline-none focus:border-[#34d99a]/40"
                    />
                </form>
                <div className="flex gap-2">
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="rounded-xl border border-[#1e2028] bg-[#0e0f14] px-4 py-2.5 text-sm text-[#f0f0f3] outline-none focus:border-[#34d99a]/40"
                    >
                        <option value="">All Statuses</option>
                        <option value="sent">Sent</option>
                        <option value="reply">Reply</option>
                        <option value="follow_up">Follow Up</option>
                        <option value="won">Won</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-[#1e2028] bg-[#0e0f14]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-[#1e2028] bg-[#16171e] text-xs font-bold uppercase tracking-wider text-[#4a4e5e]">
                            <tr>
                                <th className="px-6 py-4">Company & Founder</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Source</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1e2028]">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-8">
                                            <div className="h-4 w-2/3 rounded bg-[#1e2028]" />
                                        </td>
                                    </tr>
                                ))
                            ) : leads.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-[#6b6f80]">
                                        No leads found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                leads.map((lead) => (
                                    <tr key={lead.id} className="hover:bg-[#16171e]/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-[#f0f0f3]">{lead.company_name}</div>
                                            <div className="text-xs text-[#6b6f80]">{lead.founder_name}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 text-xs text-[#34d99a] hover:underline">
                                                    <Mail size={12} /> {lead.email}
                                                </a>
                                                {lead.phone && (
                                                    <div className="flex items-center gap-1.5 text-xs text-[#6b6f80]">
                                                        <Phone size={12} /> {lead.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs capitalize text-[#b0b3c0]">{lead.source}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getStatusColor(lead.status)}`}>
                                                {lead.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="rounded-lg p-1 text-[#4a4e5e] hover:bg-[#1e2028] hover:text-[#f0f0f3]">
                                                <MoreVertical size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
