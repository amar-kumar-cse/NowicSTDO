import React from 'react';
import { motion } from 'framer-motion';

/**
 * MaskText — A high-end editorial reveal utility.
 * Content slides up from an invisible boundary.
 */
export default function MaskText({ children, delay = 0, className = '' }) {
  return (
    <div className={`overflow-hidden py-1 ${className}`}>
      <motion.div
        initial={{ y: "110%" }}
        animate={{ y: 0 }}
        transition={{ 
          duration: 1.2, 
          delay, 
          ease: [0.16, 1, 0.3, 1] 
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
