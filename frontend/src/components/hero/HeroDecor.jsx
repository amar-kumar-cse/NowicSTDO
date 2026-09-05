
import React from 'react';

/**
 * HeroDecor — just the decorative spotlights and grid lines for the Hero section.
 * Extracted from the original ParticleHero to allow particles to be global 
 * while keeping these complex "middle" elements local to the Hero.
 */
export default function HeroDecor({ className = '' }) {
  return (
    <div className={`hero-decor-wrap pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {/* Spotlight beams — centered and animated */}
      <div className="particle-spotlights">
        <div className="particle-beam particle-beam--left" />
        <div className="particle-beam particle-beam--right" />
        <div className="particle-beam particle-beam--center" />
      </div>

      {/* Accent grid lines — purely decorative */}
      <div className="particle-grid-lines">
        {[14, 22, 30, 40, 52].map((t) => (
          <div
            key={t}
            className="particle-hline"
            style={{ top: `${t}%` }}
          />
        ))}
        {[-18, -8, 8, 18].map((l, i) => (
          <div
            key={i}
            className="particle-vline"
            style={{ left: `calc(50% + ${l}%)` }}
          />
        ))}
      </div>
    </div>
  );
}
