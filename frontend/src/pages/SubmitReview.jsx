import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Send, Building2, User, UserCircle, Briefcase, MessageSquare, ArrowRight, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api';

export default function SubmitReview() {
    const [form, setForm] = useState({
        client_name: '',
        company: '',
        role: '',
        rating: 5,
        review_text: '',
        avatar_url: ''
    });
    
    const [hoveredStar, setHoveredStar] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        
        try {
            const res = await api.public_submitReview(form);
            if (res.success) {
                setSuccess(true);
            } else {
                setError(res.message || 'Something went wrong. Please try again.');
            }
        } catch (err) {
            setError(err.message || 'Submission failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[#06070a] flex items-center justify-center p-6 relative overflow-hidden pt-32">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(52,217,154,0.05)_0%,transparent_70%)]" />
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 max-w-md w-full bg-[#0a0b0f]/80 backdrop-blur-xl p-8 rounded-3xl border border-white/5 text-center space-y-6 shadow-2xl"
                >
                    <div className="mx-auto w-20 h-20 rounded-full bg-[#34d99a]/10 flex items-center justify-center border border-[#34d99a]/20">
                        <CheckCircle2 size={40} className="text-[#34d99a]" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-white tracking-tight">Review Submitted!</h2>
                        <p className="text-[#8b8fa3] text-sm">Thank you for sharing your experience. We truly appreciate your feedback and support!</p>
                    </div>
                    <a href="/" className="inline-flex items-center gap-2 text-xs font-bold text-[#34d99a] uppercase tracking-widest hover:text-white transition-colors">
                        Return Home <ArrowRight size={14} />
                    </a>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#06070a] relative overflow-hidden pt-28 pb-20">
            {/* Background elements */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
            <div className="absolute top-1/4 -left-64 w-[500px] h-[500px] bg-[#34d99a]/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 -right-64 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
            
            <div className="relative z-10 max-w-3xl mx-auto px-6">
                
                <div className="text-center space-y-4 mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#34d99a]/10 border border-[#34d99a]/20 text-[10px] font-black uppercase tracking-widest text-[#34d99a]">
                        <Star size={12} className="fill-[#34d99a]" /> Client Feedback
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">Share your experience</h1>
                    <p className="text-[#8b8fa3] text-sm md:text-base max-w-lg mx-auto">Your review helps us improve and helps others understand what it's like to work with Nowic Studio.</p>
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#0a0b0f]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-10 shadow-2xl"
                >
                    <form onSubmit={handleSubmit} className="space-y-8">
                        
                        {/* Rating Selection */}
                        <div className="space-y-4 text-center">
                            <label className="block text-xs font-black uppercase tracking-widest text-[#6b6f80]">How would you rate our service?</label>
                            <div className="flex justify-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onMouseEnter={() => setHoveredStar(star)}
                                        onMouseLeave={() => setHoveredStar(0)}
                                        onClick={() => setForm(f => ({ ...f, rating: star }))}
                                        className="relative group p-2 transition-transform hover:scale-110 focus:outline-none"
                                    >
                                        <Star 
                                            size={40} 
                                            strokeWidth={1.5}
                                            className={`transition-all duration-300 ${
                                                star <= (hoveredStar || form.rating)
                                                    ? 'fill-[#34d99a] text-[#34d99a] drop-shadow-[0_0_15px_rgba(52,217,154,0.4)]'
                                                    : 'fill-transparent text-[#2a2c36] hover:text-[#4a4e5e]'
                                            }`} 
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />

                        {error && (
                            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300 text-center">
                                {error}
                            </div>
                        )}

                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Personal Info */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-xs font-bold text-[#8b8fa3]"><User size={14} /> Full Name <span className="text-red-400">*</span></label>
                                <input
                                    type="text"
                                    name="client_name"
                                    required
                                    value={form.client_name}
                                    onChange={handleChange}
                                    className="w-full bg-[#15161b] border border-[#2a2c36] rounded-xl px-4 py-3 text-sm text-white placeholder-[#4a4e5e] focus:outline-none focus:border-[#34d99a]/50 focus:ring-1 focus:ring-[#34d99a]/50 transition-all"
                                    placeholder="Jane Doe"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-xs font-bold text-[#8b8fa3]"><Building2 size={14} /> Company Name</label>
                                <input
                                    type="text"
                                    name="company"
                                    value={form.company}
                                    onChange={handleChange}
                                    className="w-full bg-[#15161b] border border-[#2a2c36] rounded-xl px-4 py-3 text-sm text-white placeholder-[#4a4e5e] focus:outline-none focus:border-[#34d99a]/50 focus:ring-1 focus:ring-[#34d99a]/50 transition-all"
                                    placeholder="TechFlow Inc."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-xs font-bold text-[#8b8fa3]"><Briefcase size={14} /> Role / Job Title</label>
                                <input
                                    type="text"
                                    name="role"
                                    value={form.role}
                                    onChange={handleChange}
                                    className="w-full bg-[#15161b] border border-[#2a2c36] rounded-xl px-4 py-3 text-sm text-white placeholder-[#4a4e5e] focus:outline-none focus:border-[#34d99a]/50 focus:ring-1 focus:ring-[#34d99a]/50 transition-all"
                                    placeholder="Founder & CEO"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-xs font-bold text-[#8b8fa3]"><UserCircle size={14} /> Avatar Image URL</label>
                                <input
                                    type="url"
                                    name="avatar_url"
                                    value={form.avatar_url}
                                    onChange={handleChange}
                                    className="w-full bg-[#15161b] border border-[#2a2c36] rounded-xl px-4 py-3 text-sm text-white placeholder-[#4a4e5e] focus:outline-none focus:border-[#34d99a]/50 focus:ring-1 focus:ring-[#34d99a]/50 transition-all"
                                    placeholder="https://example.com/avatar.jpg (Optional)"
                                />
                            </div>
                        </div>

                        {/* Review Text */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-bold text-[#8b8fa3]"><MessageSquare size={14} /> Your Review <span className="text-red-400">*</span></label>
                            <textarea
                                name="review_text"
                                required
                                rows={4}
                                value={form.review_text}
                                onChange={handleChange}
                                className="w-full bg-[#15161b] border border-[#2a2c36] rounded-xl px-4 py-3 text-sm text-white placeholder-[#4a4e5e] focus:outline-none focus:border-[#34d99a]/50 focus:ring-1 focus:ring-[#34d99a]/50 transition-all resize-none"
                                placeholder="What was it like working with us? What did we build together?"
                            />
                        </div>

                        {/* Submit */}
                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={submitting || !form.client_name || !form.review_text}
                                className="relative group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-black text-black transition-all hover:scale-105 hover:bg-[#34d99a] hover:shadow-[0_0_30px_rgba(52,217,154,0.3)] focus:outline-none disabled:opacity-50 disabled:pointer-events-none"
                            >
                                {submitting ? 'Submitting...' : 'Submit Review'}
                                <Send size={16} className="transition-transform group-hover:translate-x-1" />
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
