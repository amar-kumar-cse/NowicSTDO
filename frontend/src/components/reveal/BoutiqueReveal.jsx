import React from 'react';
import { motion } from 'framer-motion';

/**
 * BoutiqueReveal — The gold-standard entrance reveal.
 * Combines scale, blur-to-sharp, and opacity to simulate a camera lens focusing.
 * Best used as a wrapper for the entire Hero or main page containers.
 */
export default function BoutiqueReveal({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        scale: 1.05, 
        filter: 'blur(10px) brightness(1.5)' 
      }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        filter: 'blur(0px) brightness(1)' 
      }}
      transition={{ 
        duration: 1.8, 
        delay: delay + 0.2, 
        ease: [0.16, 1, 0.3, 1] 
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
