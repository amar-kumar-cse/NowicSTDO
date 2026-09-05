import { Navigate, Outlet, NavLink } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useAuth } from '@clerk/clerk-react';
import {
    LayoutDashboard, Settings, Briefcase, FolderOpen,
    BarChart3, HelpCircle, Info, LogOut, ChevronLeft,
    Users, MessageSquare, ListTodo, FileText, Star, BookOpen, Cpu
} from 'lucide-react';

const CLERK_KEY = (import.meta.env?.VITE_CLERK_PUBLISHABLE_KEY || '').trim();
const IS_CLERK_CONFIGURED = CLERK_KEY.startsWith('pk_') && !/your|placeholder/i.test(CLERK_KEY);

const sidebarLinks = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { type: 'label', label: 'CRM Management' },
    { to: '/admin/leads', icon: MessageSquare, label: 'Leads' },
    { to: '/admin/projects', icon: ListTodo, label: 'Projects' },
    { to: '/admin/invoices', icon: FileText, label: 'Invoices' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { type: 'label', label: 'Site Content' },
    { to: '/admin/reviews', icon: Star, label: 'Reviews' },
    { to: '/admin/brand', icon: Settings, label: 'Brand' },
    { to: '/admin/services', icon: Briefcase, label: 'Services' },
    { to: '/admin/pricing', icon: Briefcase, label: 'Pricing Models' },
    { to: '/admin/technologies', icon: Cpu, label: 'Technologies' },
    { to: '/admin/portfolio', icon: FolderOpen, label: 'Portfolio' },
    { to: '/admin/blog', icon: BookOpen, label: 'Blog' },
    { to: '/admin/stats', icon: BarChart3, label: 'Stats' },
    { to: '/admin/about', icon: Info, label: 'About' },
    { to: '/admin/faqs', icon: HelpCircle, label: 'FAQs' },
];

/*
 * Clerk-aware AdminLayout: useAuth() is safe here because this component
 * is only used when IS_CLERK_CONFIGURED is true, meaning ClerkProvider
 * is guaranteed to be an ancestor in the component tree (see main.jsx).
 */
function ClerkAdminLayout() {
    const { signOut } = useAuth();
    return <AdminLayoutUI onLogout={() => signOut()} />;
}

/*
 * Fallback when Clerk isn't configured — admin panel can't authenticate,
 * so it will always redirect to login.
 */
function FallbackAdminLayout() {
    return <AdminLayoutUI onLogout={() => { window.location.href = '/admin/login'; }} />;
}

/*
 * Pure presentational layout component, no Clerk dependency.
 */
function AdminLayoutUI({ onLogout }) {
    const { isLoggedIn, loading, admin } = useAdminAuth();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#0a0b0f]" role="status" aria-live="polite">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#34d99a] border-t-transparent" />
                <span className="sr-only">Loading...</span>
            </div>
        );
    }

    if (!isLoggedIn) return <Navigate to="/admin/login" replace />;

    return (
        <div className="flex h-screen bg-[#0a0b0f] text-[#e0e0e8]" style={{ fontFamily: "'Inter', 'Outfit', sans-serif" }}>
            {/* Sidebar */}
            <aside className="flex w-[260px] shrink-0 flex-col border-r border-[#1e2028] bg-[#0e0f14]">
                {/* Header */}
                <div className="flex h-16 items-center gap-3 border-b border-[#1e2028] px-5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#34d99a]/10">
                        <Settings size={16} className="text-[#34d99a]" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-[#f0f0f3]">Admin Panel</p>
                        <p className="text-[10px] text-[#6b6f80]">Nowic Studio CMS</p>
                    </div>
                </div>

                {/* Links */}
                <nav className="flex-1 overflow-y-auto px-3 py-4">
                    <div className="space-y-1">
                        {sidebarLinks.map((link, idx) => {
                            if (link.type === 'label') {
                                return (
                                    <div key={`label-${idx}`} className="px-3 pb-1 pt-4 text-[10px] font-bold uppercase tracking-widest text-[#4a4e5e]">
                                        {link.label}
                                    </div>
                                );
                            }
                            
                            const { to, icon: Icon, label, end } = link;
                            return (
                                <NavLink
                                    key={to}
                                    to={to}
                                    end={end}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${isActive
                                            ? 'bg-[#34d99a]/10 text-[#34d99a]'
                                            : 'text-[#8b8fa3] hover:bg-white/5 hover:text-[#e0e0e8]'
                                        }`
                                    }
                                >
                                    <Icon size={16} />
                                    {label}
                                </NavLink>
                            );
                        })}
                    </div>
                </nav>

                {/* Footer */}
                <div className="border-t border-[#1e2028] px-3 py-3 space-y-2">
                    <a
                        href="/"
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#8b8fa3] hover:bg-white/5 hover:text-[#e0e0e8] transition-colors"
                    >
                        <ChevronLeft size={16} />
                        Back to Site
                    </a>
                    <button
                        onClick={onLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main area */}
            <main className="flex-1 overflow-y-auto relative">
                {/* Subtle premium background elements */}
                <div className="engineering-grid" style={{ opacity: 0.03 }} />
                <div className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-mint/[0.04] blur-[100px] z-0" />
                <div className="pointer-events-none absolute -bottom-20 left-10 h-72 w-72 rounded-full bg-white/[0.015] blur-[80px] z-0" />

                {/* Top bar */}
                <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[#1e2028] bg-[#0a0b0f]/60 backdrop-blur-xl px-6 relative z-10">
                    <p className="text-xs text-[#6b6f80]">
                        Logged in as <span className="font-semibold text-[#34d99a]">{admin?.full_name || admin?.email || 'Admin'}</span>
                    </p>
                </header>

                {/* Page content */}
                <div className="p-6 relative z-10">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default function AdminLayout() {
    return IS_CLERK_CONFIGURED ? <ClerkAdminLayout /> : <FallbackAdminLayout />;
}
