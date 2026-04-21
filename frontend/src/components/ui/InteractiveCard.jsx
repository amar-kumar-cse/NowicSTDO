import React from 'react';

/**
 * InteractiveCard — Static wrapper to keep existing layout without mouse tracking.
 */
export default function InteractiveCard({ 
  children, 
  className = '', 
  containerClassName = '' 
}) {
  return (
    <div className={`perspective-[1000px] ${containerClassName}`}>
      <div className={`card group/inter relative overflow-hidden ${className}`}>
        <div className="relative z-20 h-full">
          {children}
        </div>
      </div>
    </div>
  );
}
