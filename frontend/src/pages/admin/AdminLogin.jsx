import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { Lock, ShieldAlert, AlertTriangle, Eye, EyeOff } from 'lucide-react';

/* ── Detect Clerk availability (same check as main.jsx) ─────────── */
const CLERK_KEY = (import.meta.env?.VITE_CLERK_PUBLISHABLE_KEY || '').trim();
const IS_CLERK_CONFIGURED = CLERK_KEY.startsWith('pk_') && !/your|placeholder/i.test(CLERK_KEY);

/*
 * Clerk components are imported statically but only *rendered* when
 * ClerkProvider is mounted (i.e. IS_CLERK_CONFIGURED === true).
 * Importing them is safe — it's rendering them without ClerkProvider that crashes.
 */
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';

const DEV_PASSWORD = 'dev_admin_2026';

export default function AdminLogin() {
    const { admin, isLoggedIn, loading, devLogin, isDevMode } = useAdminAuth();
    const navigate = useNavigate();
    const [devPass, setDevPass] = useState('');
    const [devErr, setDevErr] = useState('');
    const [showPass, setShowPass] = useState(false);

    useEffect(() => {
        if (isLoggedIn) {
            navigate('/admin', { replace: true });
        }
    }, [isLoggedIn, navigate]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#0a0b0f]">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#34d99a] border-t-transparent" />
            </div>
        );
    }

    function handleDevLogin(e) {
        e.preventDefault();
        if (devPass === DEV_PASSWORD) {
            devLogin(true);
        } else {
            setDevErr('Incorrect password. Try: dev_admin_2026');
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#0a0b0f] px-4" style={{ fontFamily: "'Inter', 'Outfit', sans-serif" }}>
            <div className="w-full max-w-sm">
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#34d99a]/10 border border-[#34d99a]/20">
                        <Lock size={24} className="text-[#34d99a]" />
                    </div>
                    <h1 className="text-2xl font-bold text-[#f0f0f3]">Admin Portal</h1>
                    <p className="mt-1 text-sm text-[#6b6f80]">Nowic Studio CMS</p>
                </div>

                <div className="rounded-2xl border border-[#1e2028] bg-[#0e0f14] p-8 text-center space-y-6">
                    {IS_CLERK_CONFIGURED ? (
                        <>
                            <SignedOut>
                                <p className="text-sm text-[#b0b3c0]">
                                    Please sign in with your administrative account to access the control panel.
                                </p>
                                <SignInButton mode="modal">
                                    <button className="w-full rounded-xl bg-[#34d99a] px-4 py-3 text-sm font-bold text-[#0a0b0f] transition-all hover:bg-[#2bc48a] active:scale-[0.98]">
                                        Sign In to Admin
                                    </button>
                                </SignInButton>
                            </SignedOut>

                            <SignedIn>
                                {!admin && (
                                    <div className="space-y-4">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
                                            <ShieldAlert size={24} />
                                        </div>
                                        <h2 className="text-lg font-bold text-[#f0f0f3]">Access Denied</h2>
                                        <p className="text-sm text-[#6b6f80]">
                                            You are signed in as <span className="text-[#f0f0f3] font-medium">{window.Clerk?.user?.primaryEmailAddress?.emailAddress}</span>, but you do not have administrative privileges.
                                        </p>
                                        <div className="flex justify-center pt-2">
                                            <UserButton afterSignOutUrl="/admin/login" />
                                        </div>
                                    </div>
                                )}
                            </SignedIn>
                        </>
                    ) : isDevMode ? (
                        /* ── Dev Mode Password Gate ── */
                        <form onSubmit={handleDevLogin} className="space-y-4 text-left">
                            <div className="flex items-center gap-2 mb-2 justify-center">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-400">
                                    <AlertTriangle size={10} /> Dev Mode
                                </span>
                            </div>
                            <p className="text-xs text-[#6b6f80] text-center">Local development access — not visible in production.</p>
                            <div className="relative">
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    value={devPass}
                                    onChange={(e) => { setDevPass(e.target.value); setDevErr(''); }}
                                    placeholder="Dev admin password"
                                    className="w-full rounded-xl border border-[#1e2028] bg-[#16171e] px-4 py-3 pr-11 text-sm text-[#f0f0f3] placeholder-[#4a4e5e] outline-none focus:border-[#34d99a]/50"
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(s => !s)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a4e5e] hover:text-[#6b6f80]"
                                >
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {devErr && <p className="text-xs text-red-400">{devErr}</p>}
                            <button
                                type="submit"
                                className="w-full rounded-xl bg-[#34d99a] px-4 py-3 text-sm font-bold text-[#0a0b0f] transition-all hover:bg-[#2bc48a] active:scale-[0.98]"
                            >
                                Access Admin Panel
                            </button>
                        </form>
                    ) : (
                        /* ── Production without Clerk — hard block ── */
                        <div className="space-y-4">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
                                <AlertTriangle size={24} />
                            </div>
                            <h2 className="text-lg font-bold text-[#f0f0f3]">Auth Not Configured</h2>
                            <p className="text-sm text-[#6b6f80]">
                                Set <code className="rounded bg-[#1e2028] px-1.5 py-0.5 text-[#34d99a] text-xs">VITE_CLERK_PUBLISHABLE_KEY</code> in your <code className="rounded bg-[#1e2028] px-1.5 py-0.5 text-[#34d99a] text-xs">.env</code> file to enable authentication.
                            </p>
                        </div>
                    )}
                </div>

                <p className="mt-6 text-center text-xs text-[#4a4e5e]">
                    <a href="/" className="text-[#34d99a] hover:underline">← Back to website</a>
                </p>
            </div>
        </div>
    );
}
