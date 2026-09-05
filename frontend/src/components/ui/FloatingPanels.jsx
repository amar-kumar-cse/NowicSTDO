import { useEffect, useRef } from 'react';

/**
 * FloatingPanels — Glassmorphic software-inspired windows that float behind content.
 * Each panel is a CSS-only glass card with mock UI chrome (title bar, dots, code lines).
 * They are rendered at very low opacity (8-12%) and use slow CSS float animation + mouse parallax.
 *
 * Performance: RAF loop is paused via IntersectionObserver when off-screen.
 * Variants: 'code', 'analytics', 'github', 'ai', 'mobile', 'planning'
 */

const PANEL_CONTENT = {
  code: {
    title: 'Hero.jsx — NOWIC Studio',
    dots: true,
    lines: [
      { indent: 0, width: '65%', color: 'rgba(189,223,188,0.7)', text: 'import React from "react"' },
      { indent: 0, width: '50%', color: 'rgba(255,255,255,0.4)', text: 'import { motion } from "framer"' },
      { indent: 0, width: '10%', color: 'rgba(255,255,255,0.15)' },
      { indent: 0, width: '40%', color: 'rgba(189,223,188,0.6)', text: 'export default function Hero()' },
      { indent: 1, width: '55%', color: 'rgba(255,255,255,0.3)', text: '  return (' },
      { indent: 2, width: '70%', color: 'rgba(167,207,170,0.5)', text: '    <section className="hero">' },
      { indent: 2, width: '45%', color: 'rgba(255,255,255,0.25)', text: '      <BrandTitle />' },
      { indent: 2, width: '60%', color: 'rgba(189,223,188,0.4)', text: '      <FloatingChips />' },
      { indent: 1, width: '35%', color: 'rgba(255,255,255,0.2)', text: '    </section>' },
      { indent: 0, width: '15%', color: 'rgba(255,255,255,0.15)', text: '  )' },
    ],
  },
  analytics: {
    title: 'Analytics Dashboard',
    dots: true,
    bars: [
      { h: '60%', color: 'rgba(189,223,188,0.4)' },
      { h: '80%', color: 'rgba(189,223,188,0.5)' },
      { h: '45%', color: 'rgba(189,223,188,0.3)' },
      { h: '90%', color: 'rgba(189,223,188,0.6)' },
      { h: '55%', color: 'rgba(189,223,188,0.35)' },
      { h: '70%', color: 'rgba(189,223,188,0.45)' },
      { h: '40%', color: 'rgba(189,223,188,0.25)' },
    ],
    metrics: [
      { label: 'Revenue', value: '₹12.4L' },
      { label: 'Users', value: '2,847' },
      { label: 'Growth', value: '+34%' },
    ],
  },
  github: {
    title: 'NowicSTDO — GitHub',
    dots: true,
    lines: [
      { indent: 0, width: '100%', color: 'rgba(189,223,188,0.3)', text: '● CI Passed  ✓  Deploy Success' },
      { indent: 0, width: '10%', color: 'rgba(255,255,255,0.1)' },
      { indent: 0, width: '75%', color: 'rgba(255,255,255,0.25)', text: '#142  feat: premium glassmorphism' },
      { indent: 0, width: '60%', color: 'rgba(189,223,188,0.2)', text: '#141  fix: booking service sync' },
      { indent: 0, width: '70%', color: 'rgba(255,255,255,0.2)', text: '#140  chore: admin CRM updates' },
      { indent: 0, width: '55%', color: 'rgba(189,223,188,0.25)', text: '#139  feat: contact form API' },
    ],
  },
  ai: {
    title: 'AI Assistant — Workflow',
    dots: true,
    lines: [
      { indent: 0, width: '45%', color: 'rgba(189,223,188,0.4)', text: '→ Analyzing codebase...' },
      { indent: 0, width: '70%', color: 'rgba(255,255,255,0.25)', text: '✓ 40 tests passed' },
      { indent: 0, width: '55%', color: 'rgba(189,223,188,0.3)', text: '→ Generating migration...' },
      { indent: 0, width: '80%', color: 'rgba(255,255,255,0.2)', text: '✓ BookingService synced' },
      { indent: 0, width: '60%', color: 'rgba(189,223,188,0.35)', text: '→ Deploying to staging...' },
      { indent: 0, width: '40%', color: 'rgba(189,223,188,0.5)', text: '✓ Build successful' },
    ],
  },
  mobile: {
    title: 'App Preview — iOS',
    dots: true,
    isMobile: true,
  },
  planning: {
    title: 'Sprint Board — Q3 2026',
    dots: true,
    lines: [
      { indent: 0, width: '100%', color: 'rgba(189,223,188,0.25)', text: '☐ Premium UI Upgrade' },
      { indent: 0, width: '100%', color: 'rgba(189,223,188,0.35)', text: '✓ Glassmorphism System' },
      { indent: 0, width: '100%', color: 'rgba(189,223,188,0.3)', text: '✓ Booking API' },
      { indent: 0, width: '100%', color: 'rgba(255,255,255,0.2)', text: '☐ Client Dashboard' },
      { indent: 0, width: '100%', color: 'rgba(255,255,255,0.15)', text: '☐ Deploy to Production' },
    ],
  },
};

function PanelChrome({ title }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.04]">
      <div className="flex gap-1.5">
        <span className="h-2 w-2 rounded-full bg-white/10" />
        <span className="h-2 w-2 rounded-full bg-white/10" />
        <span className="h-2 w-2 rounded-full bg-white/10" />
      </div>
      <span className="ml-2 text-[9px] font-medium tracking-wider text-white/20 uppercase truncate">
        {title}
      </span>
    </div>
  );
}

function CodePanel({ data }) {
  return (
    <div className="p-3 space-y-1.5 font-mono">
      {data.lines.map((line, i) => (
        <div key={i} className="flex items-center" style={{ paddingLeft: `${(line.indent || 0) * 12}px` }}>
          <div
            className="h-[6px] rounded-full"
            style={{ width: line.width, background: line.color }}
          />
        </div>
      ))}
    </div>
  );
}

function AnalyticsPanel({ data }) {
  return (
    <div className="p-3">
      {/* Metrics row */}
      <div className="flex gap-3 mb-3">
        {data.metrics.map((m, i) => (
          <div key={i} className="flex-1 rounded-lg bg-white/[0.03] p-2 text-center">
            <div className="text-[8px] text-white/15 uppercase tracking-widest">{m.label}</div>
            <div className="text-[11px] font-bold text-white/20 mt-0.5">{m.value}</div>
          </div>
        ))}
      </div>
      {/* Bar chart */}
      <div className="flex items-end gap-1.5 h-16">
        {data.bars.map((bar, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-sm"
            style={{ height: bar.h, background: bar.color }}
          />
        ))}
      </div>
    </div>
  );
}

function MobilePanel() {
  return (
    <div className="p-3 flex flex-col items-center">
      {/* Status bar */}
      <div className="w-16 h-1 rounded-full bg-white/10 mb-3" />
      {/* Content blocks */}
      <div className="w-full space-y-2">
        <div className="h-8 rounded-lg bg-white/[0.04]" />
        <div className="h-20 rounded-lg bg-white/[0.03]" />
        <div className="grid grid-cols-2 gap-2">
          <div className="h-12 rounded-lg bg-white/[0.04]" />
          <div className="h-12 rounded-lg bg-white/[0.03]" />
        </div>
        <div className="h-6 rounded-lg bg-mint/[0.06] w-3/4 mx-auto" />
      </div>
    </div>
  );
}

function SinglePanel({ variant, style, className = '' }) {
  const data = PANEL_CONTENT[variant] || PANEL_CONTENT.code;
  return (
    <div
      className={`floating-panel absolute ${className}`}
      style={style}
    >
      <PanelChrome title={data.title} />
      {variant === 'analytics' ? (
        <AnalyticsPanel data={data} />
      ) : variant === 'mobile' ? (
        <MobilePanel />
      ) : (
        <CodePanel data={data} />
      )}
    </div>
  );
}

/**
 * FloatingPanels renders a set of glassmorphic software windows behind a section.
 * Uses mouse parallax for subtle depth.
 * RAF loop is automatically paused when the container is scrolled out of view
 * (via IntersectionObserver) to eliminate off-screen CPU waste.
 *
 * @param {Object[]} panels - Array of { variant, position, size, delay }
 * @param {number} parallaxStrength - Mouse parallax factor (default 0.015)
 */
export default function FloatingPanels({ panels = [], parallaxStrength = 0.015 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof window === 'undefined') return;

    let rafId = null;
    let isVisible = false;
    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;

    const onMouseMove = (e) => {
      if (!isVisible) return;
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    const animate = () => {
      currentX += (mouseX - currentX) * 0.05;
      currentY += (mouseY - currentY) * 0.05;

      const els = container.querySelectorAll('.floating-panel');
      els.forEach((el, i) => {
        const depth = (i + 1) * parallaxStrength * 20;
        el.style.transform = `translate(${currentX * depth}px, ${currentY * depth}px)`;
      });

      rafId = requestAnimationFrame(animate);
    };

    /* ── IntersectionObserver: pause RAF when off-screen ── */
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          if (!rafId) rafId = requestAnimationFrame(animate);
        } else {
          if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
          }
        }
      },
      { rootMargin: '100px' } // start slightly before entering viewport
    );

    observer.observe(container);
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('mousemove', onMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [parallaxStrength]);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 overflow-hidden z-0"
      aria-hidden="true"
    >
      {panels.map((p, i) => (
        <SinglePanel
          key={i}
          variant={p.variant}
          className={p.className || ''}
          style={{
            top: p.top,
            left: p.left,
            right: p.right,
            bottom: p.bottom,
            width: p.width || '220px',
            opacity: p.opacity || 0.08,
            animationDelay: `${(p.delay || 0)}s`,
          }}
        />
      ))}
    </div>
  );
}
