import React from 'react';
import { motion } from 'framer-motion';

/**
 * MaskText — A high-end editorial reveal utility.
 * Content slides up from an invisible boundary.
 * Set priority=true to prevent initial hiding (optimizes LCP).
 */
export default function MaskText({ children, delay = 0, className = '', priority = false }) {
  return (
    <div className={`overflow-hidden py-1 ${className}`}>
      <motion.div
        initial={priority ? false : { y: "110%" }}
        animate={{ y: 0 }}
        transition={{ 
          duration: 1.2, 
          delay: priority ? 0 : delay, 
          ease: [0.16, 1, 0.3, 1] 
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
