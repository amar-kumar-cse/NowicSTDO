import { Settings, Briefcase, FolderOpen, BarChart3, HelpCircle, Info, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useContent } from '../../context/ContentContext';

const sections = [
    { to: '/admin/brand', icon: Settings, label: 'Brand Settings', desc: 'Name, tagline, contact info' },
    { to: '/admin/services', icon: Briefcase, label: 'Services', desc: 'Manage your service offerings' },
    { to: '/admin/portfolio', icon: FolderOpen, label: 'Portfolio', desc: 'Add, edit & remove projects' },
    { to: '/admin/stats', icon: BarChart3, label: 'Stats & Highlights', desc: 'Key numbers & metrics' },
    { to: '/admin/about', icon: Info, label: 'About Page', desc: 'WhyUs, values & milestones' },
    { to: '/admin/faqs', icon: HelpCircle, label: 'FAQs', desc: 'Frequently asked questions' },
];

export default function Dashboard() {
    const { content = {} } = useContent();

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#f0f0f3]">Dashboard</h1>
                <p className="mt-1 text-sm text-[#6b6f80]">Manage your entire website content from here.</p>
            </div>

            {/* Quick stats */}
            <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                    { label: 'Services', value: content?.services?.length || 0 },
                    { label: 'Portfolio', value: content?.portfolioItems?.length || 0 },
                    { label: 'FAQs', value: content?.faqs?.length || 0 },
                    { label: 'Values', value: content?.teamValues?.length || 0 },
                ].map((s) => (
                    <div key={s.label} className="rounded-xl border border-[#1e2028] bg-[#0e0f14] p-4 text-center">
                        <p className="text-2xl font-bold text-[#34d99a]">{s.value}</p>
                        <p className="mt-1 text-xs text-[#6b6f80]">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Section links */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {sections.map(({ to, icon: Icon, label, desc }) => (
                    <Link
                        key={to}
                        to={to}
                        className="group flex items-start gap-4 rounded-xl border border-[#1e2028] bg-[#0e0f14] p-5 transition-all hover:border-[#34d99a]/30 hover:bg-[#12131a]"
                    >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#34d99a]/10 text-[#34d99a]">
                            <Icon size={18} />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-[#f0f0f3] group-hover:text-[#34d99a] transition-colors">{label}</p>
                            <p className="mt-0.5 text-xs text-[#6b6f80]">{desc}</p>
                        </div>
                        <ArrowRight size={14} className="mt-1 text-[#4a4e5e] group-hover:text-[#34d99a] transition-colors" />
                    </Link>
                ))}
            </div>
        </div>
    );
}
