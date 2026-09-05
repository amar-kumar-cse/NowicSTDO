import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import ParticleHero from '../components/hero/ParticleHero';
import Preloader from '../components/reveal/Preloader';

export default function MainLayout() {
  const location = useLocation();

  return (
    <div className="relative overflow-x-clip min-h-screen bg-bg">
      <Preloader />
      
      {/* Global Particle Background */}
      <ParticleHero />
      
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main 
          key={location.pathname}
          initial={{ opacity: 0, y: 20, filter: 'blur(5px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -20, filter: 'blur(5px)', transition: { duration: 0.3 } }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-0"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <Footer />
    </div>
  );
}
