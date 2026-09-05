"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface NavItem {
  id: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "portfolio-gallery", label: "Portfolio" },
  { id: "case-studies", label: "Case Studies" },
  { id: "pricing", label: "Pricing" },
  { id: "our-clients", label: "Clients" },
];

export function PageNav() {
  const [visible, setVisible] = useState(false);
  const [activeId, setActiveId] = useState<string>("");
  const [scrollProgress, setScrollProgress] = useState(0);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // Show nav after hero scrolls away
  useEffect(() => {
    const onScroll = () => {
      const heroHeight = window.innerHeight * 0.6;
      setVisible(window.scrollY > heroHeight);

      // Scroll progress
      const doc = document.documentElement;
      const scrolled = doc.scrollTop;
      const total = doc.scrollHeight - doc.clientHeight;
      setScrollProgress(total > 0 ? (scrolled / total) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Active section detection
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    NAV_ITEMS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveId(id);
        },
        { threshold: 0.3, rootMargin: "-80px 0px -40% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      ref={navRef}
      className={cn(
        "fixed top-0 inset-x-0 z-40 transition-all duration-500",
        visible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      )}
    >
      {/* Progress bar */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-silver-100">
        <div
          className="h-full bg-gradient-to-r from-primary/80 to-primary transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Nav bar */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-silver-200/80 shadow-sm">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="flex items-center justify-center gap-1 h-12">
            {NAV_ITEMS.map(({ id, label }) => {
              const isActive = activeId === id;
              return (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className={cn(
                    "relative px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300",
                    isActive
                      ? "text-primary"
                      : "text-silver-500 hover:text-silver-800"
                  )}
                >
                  {isActive && (
                    <span className="absolute inset-0 rounded-full bg-primary/8 border border-primary/20" />
                  )}
                  <span className="relative">{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
