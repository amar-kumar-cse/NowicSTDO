import { useState, useEffect } from 'react';
import { User, Shield, Mail, Calendar, Search, Edit2, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';

export default function UsersManagement() {
    const { getApiToken } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [updating, setUpdating] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = await getApiToken();
            const response = await api.admin_getUsers(token, { search: search || undefined });
            if (response.success) {
                setUsers(response.data.results || response.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleRole = async (userId, currentRole) => {
        setUpdating(userId);
        const newRole = currentRole === 'admin' ? 'client' : 'admin';
        if (!confirm(`Change user role to ${newRole}?`)) {
            setUpdating(null);
            return;
        }

        try {
            const token = await getApiToken();
            await api.admin_updateUser(token, userId, { role: newRole });
            await fetchUsers();
        } catch (error) {
            alert('Failed to update role: ' + error.message);
        } finally {
            setUpdating(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#f0f0f3]">User Management</h1>
                    <p className="mt-1 text-sm text-[#6b6f80]">Manage user roles and access levels</p>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a4e5e]" size={16} />
                <input 
                    type="text" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                    placeholder="Search by name or email..." 
                    className="w-full rounded-xl border border-[#1e2028] bg-[#0e0f14] py-2.5 pl-10 pr-4 text-sm text-[#f0f0f3] outline-none focus:border-[#34d99a]/40"
                />
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#1e2028] bg-[#0e0f14]">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-[#1e2028] bg-[#16171e] text-xs font-bold uppercase tracking-wider text-[#4a4e5e]">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Joined</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e2028]">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan={5} className="px-6 py-6"><div className="h-4 w-2/3 rounded bg-[#1e2028]" /></td>
                                </tr>
                            ))
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-[#6b6f80]">No users found.</td>
                            </tr>
                        ) : (
                            users.map((u) => (
                                <tr key={u.clerk_user_id} className="hover:bg-[#16171e]/50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#34d99a]/10 text-[#34d99a]">
                                                <User size={16} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-[#f0f0f3]">{u.full_name || 'Anonymous'}</div>
                                                <div className="flex items-center gap-1.5 text-xs text-[#6b6f80]">
                                                    <Mail size={12} /> {u.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                            u.role === 'admin' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                        }`}>
                                            <Shield size={10} /> {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-[#6b6f80]">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar size={12} />
                                            {new Date(u.created_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {u.is_active ? (
                                            <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-emerald-500">
                                                <CheckCircle2 size={12} /> Active
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-red-500">
                                                <ShieldAlert size={12} /> Suspended
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => toggleRole(u.clerk_user_id, u.role)}
                                            disabled={updating === u.clerk_user_id}
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#1e2028] bg-[#16171e] px-3 py-1.5 text-xs font-bold text-[#f0f0f3] hover:bg-[#1e2028] disabled:opacity-50"
                                        >
                                            <Edit2 size={12} /> {updating === u.clerk_user_id ? 'Updating...' : 'Change Role'}
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
