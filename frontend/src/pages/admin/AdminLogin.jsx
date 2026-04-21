import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { Lock, Eye, EyeOff } from 'lucide-react';

export default function AdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');
    const { login, isLoggedIn } = useAdminAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isLoggedIn) {
            navigate('/admin', { replace: true });
        }
    }, [isLoggedIn, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(username, password);
        } catch {
            setError('Invalid username or password');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#0a0b0f] px-4" style={{ fontFamily: "'Inter', 'Outfit', sans-serif" }}>
            <div className="w-full max-w-sm">
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#34d99a]/10 border border-[#34d99a]/20">
                        <Lock size={24} className="text-[#34d99a]" />
                    </div>
                    <h1 className="text-2xl font-bold text-[#f0f0f3]">Admin Login</h1>
                    <p className="mt-1 text-sm text-[#6b6f80]">Nowic Studio CMS</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="rounded-2xl border border-[#1e2028] bg-[#0e0f14] p-6 space-y-4">
                    {error && (
                        <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-sm text-red-400">
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="admin-username" className="block text-xs font-semibold uppercase tracking-wider text-[#6b6f80] mb-2">Username</label>
                        <input
                            id="admin-username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            autoFocus
                            className="w-full rounded-xl border border-[#1e2028] bg-[#16171e] px-4 py-3 text-sm text-[#f0f0f3] placeholder-[#4a4e5e] outline-none transition-colors focus:border-[#34d99a]/40 focus:bg-[#1a1b24]"
                            placeholder="Enter username"
                        />
                    </div>

                    <div>
                        <label htmlFor="admin-password" className="block text-xs font-semibold uppercase tracking-wider text-[#6b6f80] mb-2">Password</label>
                        <div className="relative">
                            <input
                                id="admin-password"
                                type={showPw ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full rounded-xl border border-[#1e2028] bg-[#16171e] px-4 py-3 pr-11 text-sm text-[#f0f0f3] placeholder-[#4a4e5e] outline-none transition-colors focus:border-[#34d99a]/40 focus:bg-[#1a1b24]"
                                placeholder="Enter password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPw(!showPw)}
                                aria-label={showPw ? 'Hide password' : 'Show password'}
                                aria-pressed={showPw}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6f80] hover:text-[#e0e0e8] transition-colors"
                            >
                                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-xl bg-[#34d99a] px-4 py-3 text-sm font-bold text-[#0a0b0f] transition-all hover:bg-[#2bc48a] active:scale-[0.98]"
                    >
                        Sign In
                    </button>
                </form>

                <p className="mt-6 text-center text-xs text-[#4a4e5e]">
                    <a href="/" className="text-[#34d99a] hover:underline">← Back to website</a>
                </p>
            </div>
        </div>
    );
}
