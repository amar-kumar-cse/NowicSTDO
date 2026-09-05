import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, ChevronRight, ArrowRight, Code, Smartphone, Megaphone, CheckCircle2, Cpu, Globe, Rocket, Building2, LayoutDashboard, Layers, Sparkles, Code2, Zap, Trophy, Users, Star, Clock, Check, ShieldCheck, Gauge, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BrandLogo from './BrandLogo';
import AuthButtons from '../AuthButtons';
import { useContent } from '../../context/ContentContext';

const ICONS = {
  Code, Smartphone, Megaphone, Cpu, Globe, Rocket, Building2,
  LayoutDashboard, Layers, Sparkles, Code2, Zap, Trophy, Users,
  Star, Clock, Check, ShieldCheck, Gauge, Bot
};

function getIcon(name, size = 20) {
  const Icon = ICONS[name];
  return Icon ? <Icon size={size} /> : <CheckCircle2 size={size} />;
}

// ContentContext may attach a resolved icon *component* (not a string name) —
// handle both shapes so the mega menu always shows the right icon.
function renderIcon(nameOrComponent, size = 20) {
  if (nameOrComponent && typeof nameOrComponent !== 'string') {
    const Comp = nameOrComponent;
    return <Comp size={size} />;
  }
  return getIcon(nameOrComponent, size);
}

// Derive a valid route segment from existing service data — never "undefined".
function servicePath(service) {
  if (!service) return '/services';
  const slug = service.slug || String(service.name || service.title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `/services/${slug}`;
}

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Services', path: '/services', hasMegaMenu: true },
  { label: 'Pricing', path: '/pricing' },
  { label: 'Portfolio', path: '/portfolio' },
  { label: 'Technologies', path: '/technologies' },
  { label: 'Blog', path: '/blog' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [hoveredService, setHoveredService] = useState(null);
  
  const location = useLocation();
  const { content = {} } = useContent();
  const brand = content.brand || {};
  const services = content.services || [];
  
  const brandName = brand.name || 'Nowic Studio';
  const tagline = brand.tagline || 'Vision to Version';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); setActiveMenu(null); }, [location]);

  // Handle setting initial hovered service when mega menu opens
  useEffect(() => {
    if (activeMenu === 'Services' && services.length > 0 && !hoveredService) {
      setHoveredService(services[0]);
    }
  }, [activeMenu, services, hoveredService]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${scrolled
          ? 'nav-glass border-b border-white/[0.04]'
          : 'border-b border-transparent bg-[#050806]/80 backdrop-blur-md'
        }`}
    >
      <div className="container-shell flex h-16 items-center justify-between relative">

        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 relative z-10">
          <BrandLogo
            variant="icon"
            className="h-9 w-9 rounded-lg overflow-hidden"
          />
          <div className="leading-none">
            <p className="font-display text-sm font-bold tracking-tight text-white">
              {brandName}
            </p>
            <p className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.2em] text-[#a0a3b1]">
              {tagline}
            </p>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            
            return (
              <div 
                key={item.path}
                className="relative"
                onMouseEnter={() => item.hasMegaMenu && setActiveMenu(item.label)}
                onMouseLeave={() => item.hasMegaMenu && setActiveMenu(null)}
              >
                <Link
                  to={item.path}
                  className={`relative flex items-center gap-1 text-sm font-medium transition-colors duration-200 py-6 ${isActive ? 'text-white' : 'text-[#8b8fa3] hover:text-white'
                    }`}
                >
                  {item.label}
                  {item.hasMegaMenu && <ChevronDown size={14} className={`transition-transform duration-300 ${activeMenu === item.label ? 'rotate-180' : ''}`} />}
                  
                  {isActive && (
                    <motion.div
                      layoutId="desktop-nav-glider"
                      className="absolute bottom-0 left-0 right-0 h-[2px]"
                      style={{ background: '#34d99a' }}
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    >
                      <div className="absolute top-1/2 left-1/2 w-[60%] h-[300%] -translate-x-1/2 -translate-y-1/2 bg-[#34d99a] blur-[8px]" />
                      <div className="absolute bottom-full left-0 right-0 h-4 bg-gradient-to-t from-[#34d99a]/20 to-transparent" />
                    </motion.div>
                  )}
                </Link>

                {/* Mega Menu Dropdown */}
                {item.hasMegaMenu && (
                  <AnimatePresence>
                    {activeMenu === item.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-1/2 -translate-x-1/2 w-[850px] bg-[#0a0c10] border border-white/10 rounded-2xl shadow-2xl shadow-black overflow-hidden flex z-50 mt-0"
                      >
                        {/* Left Column: Main Services */}
                        <div className="w-1/3 bg-[#050608] border-r border-white/5 p-4 space-y-1">
                          <h3 className="text-[10px] uppercase tracking-widest text-[#6b6f80] font-bold mb-3 pl-3">Our Services</h3>
                          {services.map(srv => (
                            <Link 
                              key={srv.id || srv.slug} 
                              to={servicePath(srv)}
                              onMouseEnter={() => setHoveredService(srv)}
                              className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                                hoveredService?.id === srv.id 
                                  ? 'bg-[#34d99a]/10 text-[#34d99a]' 
                                  : 'text-[#8b8fa3] hover:text-white hover:bg-white/5'
                              }`}
                            >
                              <span className="text-sm font-medium">{srv.name || srv.title}</span>
                              <ChevronRight size={14} className={hoveredService?.id === srv.id ? 'opacity-100' : 'opacity-0'} />
                            </Link>
                          ))}
                        </div>

                        {/* Right Column: Sub Services & Details */}
                        <div className="w-2/3 p-6 bg-[#0a0c10] relative overflow-hidden flex flex-col">
                           <div className="absolute top-0 right-0 w-64 h-64 bg-[#34d99a]/5 rounded-full blur-3xl pointer-events-none" />
                           
                           {hoveredService ? (
                             <div className="relative z-10 flex-1 flex flex-col">
                               <div className="flex items-start gap-4 mb-6 pb-6 border-b border-white/5">
                                 <div className="w-12 h-12 rounded-xl bg-[#34d99a]/10 text-[#34d99a] flex items-center justify-center shrink-0">
                                   {renderIcon(hoveredService.icon || hoveredService.icon_name)}
                                 </div>
                                 <div>
                                   <h3 className="text-xl font-bold text-white mb-1">{hoveredService.name || hoveredService.title}</h3>
                                   <p className="text-sm text-[#8b8fa3] line-clamp-2">{hoveredService.headline || hoveredService.description}</p>
                                 </div>
                               </div>

                               <div className="flex-1">
                                 <h4 className="text-[10px] uppercase tracking-widest text-[#6b6f80] font-bold mb-4">Included Capabilities</h4>
                                 <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                                   {hoveredService.subServices && hoveredService.subServices.length > 0 ? (
                                     hoveredService.subServices.slice(0, 6).map((sub, idx) => (
                                       <div key={idx} className="flex gap-3 group">
                                         <div className="mt-0.5 text-[#34d99a]/70 group-hover:text-[#34d99a] transition-colors shrink-0">
                                            {renderIcon(sub.icon)}
                                         </div>
                                         <div>
                                           <h5 className="text-sm font-bold text-white mb-0.5 group-hover:text-[#34d99a] transition-colors">{sub.title}</h5>
                                           <p className="text-xs text-[#6b6f80] line-clamp-1">{sub.description}</p>
                                         </div>
                                       </div>
                                     ))
                                   ) : (
                                     (hoveredService.features || []).slice(0, 6).map((feature, idx) => (
                                       <div key={idx} className="flex gap-3 group items-start">
                                         <div className="mt-0.5 text-[#34d99a]/70 group-hover:text-[#34d99a] transition-colors shrink-0">
                                           <CheckCircle2 size={16} />
                                         </div>
                                         <h5 className="text-sm font-medium text-white group-hover:text-[#34d99a] transition-colors">{feature}</h5>
                                       </div>
                                     ))
                                   )}
                                 </div>
                               </div>

                               <div className="mt-6 pt-4 text-right">
                                 <Link 
                                   to={servicePath(hoveredService)}
                                   className="inline-flex items-center gap-1.5 text-sm font-bold text-[#34d99a] hover:text-white transition-colors"
                                 >
                                   Explore {hoveredService.name || hoveredService.title} <ArrowRight size={14} />
                                 </Link>
                               </div>
                             </div>
                           ) : (
                             <div className="h-full flex items-center justify-center text-sm text-[#6b6f80]">
                               Hover over a service to see its capabilities.
                             </div>
                           )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            );
          })}
        </nav>

        {/* CTA + Menu */}
        <div className="flex items-center gap-3 relative z-10">
          <AuthButtons />

          <Link to="/contact" className="cta-btn hidden md:inline-flex">
            Start a Project
          </Link>

          <button
            type="button"
            id="mobile-menu-toggle"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-[#a0a3b1] md:hidden hover:bg-white/5 transition-colors"
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-white/5 bg-[#080a0e] md:hidden"
          >
            <div className="container-shell flex flex-col gap-1 py-4">
              {navLinks.map((item) => {
                if (item.hasMegaMenu) {
                  return (
                    <div key={item.path} className="mb-2">
                      <div className="block rounded-lg px-3 py-2.5 text-sm font-medium text-white bg-white/5 border border-white/5">
                        {item.label}
                      </div>
                      <div className="pl-4 pr-2 py-2 space-y-1 border-l border-white/10 ml-4 mt-1">
                        {services.map(srv => (
                          <Link 
                            key={srv.id || srv.slug} 
                            to={servicePath(srv)}
                            className="block rounded-lg px-3 py-2 text-sm font-medium text-[#8b8fa3] hover:text-[#34d99a] hover:bg-[#34d99a]/5 transition-colors"
                          >
                            {srv.name || srv.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                }

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'text-[#34d99a] bg-[#34d99a]/10' : 'text-[#a0a3b1] hover:text-white'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                );
              })}
              <Link to="/contact" className="cta-btn mt-4 text-center justify-center">
                Start a Project
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
