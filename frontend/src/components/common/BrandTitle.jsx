import React from 'react';

/**
 * BrandTitle — Modern Figma / 21dev style agency typography
 * Uses strict geometric sans-serif (Outfit) with high contrast weights.
 * Optimized for LCP: removed JS-based animation that hides text initially.
 */
export default function BrandTitle({ className = '' }) {
  const nowic = "NOWIC".split('');
  const studio = "STUDIO".split('');

  return (
    <div 
      className={`flex flex-wrap justify-center items-baseline gap-2 md:gap-4 ${className}`}
      style={{ fontFamily: "'Outfit', sans-serif" }}
      aria-label="Nowic Studio"
    >
      {/* NOWIC: Bold, tight letter spacing */}
      <div className="flex font-black tracking-tighter text-[2.75rem] sm:text-[4rem] md:text-[6.5rem] leading-[0.85] text-white" aria-hidden="true">
        {nowic.map((char, i) => (
          <span key={`n-${i}`} className="inline-block pb-1" aria-hidden="true">
            {char}
          </span>
        ))}
      </div>

      {/* STUDIO: Light/Thin, slightly looser spacing, premium gradient */}
      <div className="flex font-light tracking-wide text-[2.75rem] sm:text-[4rem] md:text-[6.5rem] leading-[0.85] text-transparent bg-clip-text bg-gradient-to-br from-[#bddfbc] via-[#a7cfaa] to-[#8cb88f]" aria-hidden="true">
        {studio.map((char, i) => (
          <span key={`s-${i}`} className="inline-block pb-1" aria-hidden="true">
            {char}
          </span>
        ))}
      </div>

      {/* Premium accent dot with glow */}
      <div className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 rounded-full bg-[#bddfbc] relative self-end mb-[0.2em]">
        <div className="absolute inset-0 rounded-full bg-[#bddfbc] blur-md opacity-60 animate-pulse" />
      </div>
    </div>
  );
}
