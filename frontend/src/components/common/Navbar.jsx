import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BrandLogo from './BrandLogo';
import AuthButtons from '../AuthButtons';
import { useContent } from '../../context/ContentContext';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Services', path: '/services' },
  { label: 'Portfolio', path: '/portfolio' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { content = {} } = useContent();
  const brand = content.brand || {};
  const brandName = brand.name || 'Nowic Studio';
  const tagline = brand.tagline || 'Vision to Version';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [location]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
          ? 'border-b border-subtle bg-bg/80 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent'
        }`}
    >
      <div className="container-shell flex h-16 items-center justify-between">

        {/* Brand */}
        <Link to="/" className="flex items-center gap-3">
          <BrandLogo
            variant="icon"
            className="h-9 w-9 rounded-lg overflow-hidden"
          />
          <div className="leading-none">
            <p className="font-display text-sm font-bold tracking-tight text-text">
              {brandName}
            </p>
            <p className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.2em] text-muted">
              {tagline}
            </p>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative text-sm font-medium transition-colors duration-200 py-2 ${isActive ? 'text-text' : 'text-sub hover:text-text'
                  }`}
              >
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="desktop-nav-glider"
                    className="absolute -bottom-1 left-0 right-0 h-[2px]"
                    style={{ background: '#34d99a' }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  >
                    {/* Glow blur effect - based on Uiverse glider ::before */}
                    <div className="absolute top-1/2 left-1/2 w-[60%] h-[300%] -translate-x-1/2 -translate-y-1/2 bg-mint blur-[8px]" />
                    {/* Gradient tail above the line - based on Uiverse glider ::after */}
                    <div className="absolute bottom-full left-0 right-0 h-4 bg-gradient-to-t from-mint/20 to-transparent" />
                  </motion.div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* CTA + Menu */}
        <div className="flex items-center gap-3">
          <Link to="/booking" className="outline-btn hidden md:inline-flex">
            Book a Call
          </Link>
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
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-subtle text-sub md:hidden"
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-subtle bg-panel md:hidden"
          >
            <div className="container-shell flex flex-col gap-1 py-4">
              {navLinks.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'text-mint bg-white/5' : 'text-sub hover:text-text'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <Link to="/booking" className="outline-btn mt-2 text-center">
                Book a Call
              </Link>
              <Link to="/contact" className="cta-btn mt-2 text-center">
                Start a Project
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
