import React from 'react';

/**
 * Magnetic — Lightweight wrapper kept for layout compatibility.
 */
export default function Magnetic({ children, className = '' }) {
  return (
    <div className={`inline-block ${className}`.trim()}>
      {children}
    </div>
  );
}
