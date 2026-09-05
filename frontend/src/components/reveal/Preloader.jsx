import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Preloader() {
  const [loading, setLoading] = useState(true);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState('loading'); // loading -> exit

  useEffect(() => {
    setMounted(true);
    setViewport({ width: window.innerWidth, height: window.innerHeight });

    const updateViewport = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', updateViewport);

    // Fast progress counter logic (takes ~1.5s to reach 100)
    let startTime;
    const duration = 1500;

    const animateProgress = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsedTime = timestamp - startTime;
      const currentProgress = Math.min(Math.floor((elapsedTime / duration) * 100), 100);
      
      setProgress(currentProgress);

      if (currentProgress < 100) {
        requestAnimationFrame(animateProgress);
      } else {
        // Reached 100%, hold for a tiny bit, then exit
        setTimeout(() => setPhase('exit'), 300);

        // Finally unmount preloader
        setTimeout(() => setLoading(false), 1200);
      }
    };
    
    requestAnimationFrame(animateProgress);

    return () => {
      window.removeEventListener('resize', updateViewport);
    };
  }, []);

  if (!mounted) return null;

  // The liquid SVG curve animation
  const initialPath = `M0 0 L${viewport.width} 0 L${viewport.width} ${viewport.height} L0 ${viewport.height} Z`;
  const targetPath = `M0 0 L${viewport.width} 0 Q${viewport.width / 2} 0 0 0 Z`;

  const curveVars = {
    initial: { d: initialPath },
    exit: { 
      d: targetPath, 
      transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } 
    }
  };

  return (
    <AnimatePresence>
      {loading && (
        <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden">
          
          {/* Main Overlay Content */}
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)', transition: { duration: 0.6 } }}
            className="fixed inset-0 z-10 flex flex-col items-center justify-center bg-transparent"
          >
            <div className="relative flex flex-col items-center justify-center w-full max-w-sm px-6">
              
              <AnimatePresence mode="wait">
                {/* PHASE: Loading (Logo + Progress) */}
                {phase === 'loading' && (
                  <motion.div
                    key="loader"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20, filter: 'blur(5px)' }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col items-center w-full gap-8"
                  >
                    {/* LOGO with Shine Effect */}
                    <div className="relative overflow-hidden flex justify-center items-center rounded-xl">
                      {/* 
                         mix-blend-screen helps remove black background from images 
                         if the logo has a black background. It blends perfectly with dark themes.
                      */}
                      <img 
                        src="/image.png" 
                        alt="Logo" 
                        className="w-32 h-auto object-contain mix-blend-screen opacity-90"
                      />
                      
                      {/* SHINE EFFECT OVERLAY */}
                      <motion.div 
                        className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-[-20deg]"
                        initial={{ left: '-100%' }}
                        animate={{ left: '200%' }}
                        transition={{ 
                          repeat: Infinity, 
                          duration: 1.2, 
                          ease: "easeInOut",
                          repeatDelay: 0.2
                        }}
                      />
                    </div>

                    {/* Progress Counter & Bar (Smaller & Minimal) */}
                    <div className="flex flex-col items-center w-full max-w-[200px] gap-2">
                      <div className="text-[#34d99a] font-mono text-sm tracking-widest font-semibold">
                        {progress}%
                      </div>
                      <div className="w-full h-[2px] bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-[#34d99a] shadow-[0_0_10px_rgba(52,217,154,0.5)]"
                          initial={{ width: '0%' }}
                          animate={{ width: `${progress}%` }}
                          transition={{ ease: "linear", duration: 0.1 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </motion.div>

          {/* LIQUID WAVE LAYER (Background) */}
          <svg className="absolute inset-0 h-full w-full fill-[#050806]">
            <motion.path
              variants={curveVars}
              initial="initial"
              exit="exit"
            />
          </svg>
        </div>
      )}
    </AnimatePresence>
  );
}
