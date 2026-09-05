
import { useState, useEffect } from 'react';
import { Search, CheckCircle2, XCircle, Trash2, Star, Eye, ExternalLink } from 'lucide-react';
import { api, resolveImageUrl } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function ReviewsManagement() {
    const { getApiToken } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const token = await getApiToken();
            const response = await api.admin_getReviews(token);
            if (response.success) {
                setReviews(response.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleApproval = async (id, currentStatus) => {
        try {
            const token = await getApiToken();
            const res = await api.admin_updateReview(token, id, !currentStatus);
            if (res.success) {
                setReviews(prev => prev.map(r => r.id === id ? { ...r, is_approved: !currentStatus } : r));
            }
        } catch (error) {
            console.error('Failed to update review:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this review?")) return;
        try {
            const token = await getApiToken();
            const res = await api.admin_deleteReview(token, id);
            if (res.success) {
                setReviews(prev => prev.filter(r => r.id !== id));
            }
        } catch (error) {
            console.error('Failed to delete review:', error);
        }
    };

    const filteredReviews = reviews.filter(r => {
        if (statusFilter === 'approved') return r.is_approved;
        if (statusFilter === 'pending') return !r.is_approved;
        return true;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#f0f0f3]">Reviews Management</h1>
                    <p className="mt-1 text-sm text-[#6b6f80]">Moderate customer testimonials</p>
                </div>
                <a href="/review" target="_blank" className="inline-flex items-center gap-2 rounded-xl border border-[#1e2028] bg-[#0e0f14] px-4 py-2 text-sm text-[#f0f0f3] hover:bg-[#16171e] transition-colors">
                    <ExternalLink size={14} /> Submit Link
                </a>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex gap-2 w-full sm:w-auto">
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full sm:w-48 rounded-xl border border-[#1e2028] bg-[#0e0f14] px-4 py-2.5 text-sm text-[#f0f0f3] outline-none focus:border-[#34d99a]/40"
                    >
                        <option value="">All Reviews</option>
                        <option value="pending">Pending Approval</option>
                        <option value="approved">Approved / Live</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-[#1e2028] bg-[#0e0f14]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-[#1e2028] bg-[#16171e] text-xs font-bold uppercase tracking-wider text-[#4a4e5e]">
                            <tr>
                                <th className="px-6 py-4">Reviewer</th>
                                <th className="px-6 py-4">Rating</th>
                                <th className="px-6 py-4">Review Text</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1e2028]">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12">
                                        <LoadingSpinner text="Loading reviews..." />
                                    </td>
                                </tr>
                            ) : filteredReviews.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-[#6b6f80]">
                                        No reviews found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredReviews.map((review) => (
                                    <tr key={review.id} className="hover:bg-[#16171e]/50 transition-colors group">
                                        <td className="px-6 py-4 w-1/4">
                                            <div className="flex items-center gap-3">
                                                {review.avatar_url ? (
                                                    <img src={resolveImageUrl(review.avatar_url)} alt={review.client_name} className="w-8 h-8 rounded-full object-cover bg-[#1e2028]" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-[#1e2028] flex items-center justify-center text-[#6b6f80] text-xs font-bold uppercase">
                                                        {review.client_name.substring(0, 2)}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-bold text-[#f0f0f3]">{review.client_name}</div>
                                                    {(review.company || review.role) && (
                                                        <div className="text-xs text-[#6b6f80]">
                                                            {review.role}{review.role && review.company && ' at '}{review.company}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-0.5">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <Star 
                                                        key={star} 
                                                        size={14} 
                                                        className={star <= review.rating ? "fill-[#34d99a] text-[#34d99a]" : "fill-transparent text-[#2a2c36]"} 
                                                    />
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 w-1/3">
                                            <p className="text-[#b0b3c0] text-sm line-clamp-3">"{review.review_text}"</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                                review.is_approved ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                            }`}>
                                                {review.is_approved ? <CheckCircle2 size={12} /> : <Eye size={12} />}
                                                {review.is_approved ? 'Live' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => handleToggleApproval(review.id, review.is_approved)}
                                                    title={review.is_approved ? "Unpublish" : "Approve & Publish"}
                                                    className="rounded-lg p-2 text-[#4a4e5e] hover:bg-[#34d99a]/10 hover:text-[#34d99a] transition-colors"
                                                >
                                                    {review.is_approved ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(review.id)}
                                                    title="Delete Review"
                                                    className="rounded-lg p-2 text-[#4a4e5e] hover:bg-red-500/10 hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
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
