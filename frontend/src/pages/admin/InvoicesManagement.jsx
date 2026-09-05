import { useState, useEffect } from 'react';
import { FileText, DollarSign, Clock, CheckCircle, AlertCircle, Search, MoreVertical, Plus } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';

export default function InvoicesManagement() {
    const { getApiToken } = useAuth();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchInvoices();
    }, [statusFilter]);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const token = await getApiToken();
            const response = await api.admin_getInvoices(token, { status: statusFilter || undefined });
            if (response.success) {
                setInvoices(response.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch invoices:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'paid': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'overdue': return 'bg-red-500/10 text-red-400 border-red-500/20';
            default: return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#f0f0f3]">Invoices</h1>
                    <p className="mt-1 text-sm text-[#6b6f80]">Revenue and billing management</p>
                </div>
                <button className="admin-add-btn">
                    <Plus size={14} /> New Invoice
                </button>
            </div>

            <div className="flex gap-2">
                {['', 'pending', 'paid', 'overdue'].map((s) => (
                    <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`rounded-xl border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                            statusFilter === s 
                            ? 'border-[#34d99a] bg-[#34d99a]/10 text-[#34d99a]' 
                            : 'border-[#1e2028] bg-[#0e0f14] text-[#6b6f80] hover:border-[#4a4e5e]'
                        }`}
                    >
                        {s || 'All'}
                    </button>
                ))}
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#1e2028] bg-[#0e0f14]">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-[#1e2028] bg-[#16171e] text-xs font-bold uppercase tracking-wider text-[#4a4e5e]">
                        <tr>
                            <th className="px-6 py-4">Invoice #</th>
                            <th className="px-6 py-4">Client & Project</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Due Date</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e2028]">
                        {loading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan={6} className="px-6 py-6"><div className="h-4 w-1/2 rounded bg-[#1e2028]" /></td>
                                </tr>
                            ))
                        ) : invoices.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-[#6b6f80]">No invoices found.</td>
                            </tr>
                        ) : (
                            invoices.map((inv) => (
                                <tr key={inv.id} className="hover:bg-[#16171e]/50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 font-mono font-bold text-[#f0f0f3]">
                                            <FileText size={14} className="text-[#6b6f80]" />
                                            {inv.invoice_number}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-[#f0f0f3]">{inv.project?.name}</div>
                                        <div className="text-xs text-[#6b6f80]">{inv.client?.email}</div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-[#f0f0f3]">
                                        ₹{parseFloat(inv.amount || 0).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-xs text-[#6b6f80]">
                                        {new Date(inv.due_date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(inv.status)}`}>
                                            {inv.status === 'paid' ? <CheckCircle size={10} /> : inv.status === 'overdue' ? <AlertCircle size={10} /> : <Clock size={10} />}
                                            {inv.status}
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
    );
}
