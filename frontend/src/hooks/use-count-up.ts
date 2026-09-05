
"use client";

import { useState, useEffect, useCallback } from 'react';

export function useCountUp(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);

  const easeOutExpo = (t: number) => {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  };

  const startAnimation = useCallback(() => {
    let startTime: number | null = null;
    const animate = (currentTime: number) => {
      if (startTime === null) {
        startTime = currentTime;
      }
      const progress = currentTime - startTime;
      const easedProgress = easeOutExpo(Math.min(progress / duration, 1));
      const newCount = Math.floor(easedProgress * end);
      
      setCount(newCount);

      if (progress < duration) {
        requestAnimationFrame(animate);
      } else {
        setCount(end); // Ensure it ends on the exact number
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration]);
  
  return { count, startAnimation };
}
