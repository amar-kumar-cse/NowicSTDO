import { useEffect, useRef } from 'react';

/**
 * ParticleHero — canvas-based particle rain + spotlight beams.
 * Adapted for Nowic Studio mint-green dark theme.
 * Renders as an absolute-positioned background layer.
 */
export default function ParticleHero({ className = '' }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationRef = useRef(null);

  const createParticle = (canvas) => {
    const particle = {
      x: 0,
      y: 0,
      speed: 0,
      opacity: 1,
      fadeDelay: 0,
      fadeStart: 0,
      fadingOut: false,
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.speed = Math.random() / 5 + 0.1;
        this.opacity = 1;
        this.fadeDelay = Math.random() * 600 + 100;
        this.fadeStart = Date.now() + this.fadeDelay;
        this.fadingOut = false;
      },
      update() {
        this.y -= this.speed;
        if (this.y < 0) this.reset();
        if (!this.fadingOut && Date.now() > this.fadeStart) this.fadingOut = true;
        if (this.fadingOut) {
          this.opacity -= 0.008;
          if (this.opacity <= 0) this.reset();
        }
      },
      draw(ctx, customX, customY) {
        // Muted Light Green / Off-road Green particles matching #bddfbc palette
        const r = 160 + Math.floor(Math.random() * 40);
        const g = 190 + Math.floor(Math.random() * 40);
        const b = 160 + Math.floor(Math.random() * 40);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${this.opacity * 0.7})`;
        ctx.fillRect(customX ?? this.x, customY ?? this.y, 0.5, Math.random() * 2 + 1);
      },
    };
    particle.reset();
    particle.y = Math.random() * canvas.height;
    return particle;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setSize = () => {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
      const count = Math.floor((canvas.width * canvas.height) / 7000);
      particlesRef.current = [];
      for (let i = 0; i < count; i++) {
        particlesRef.current.push(createParticle(canvas));
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const scrollY = typeof window !== 'undefined' ? window.scrollY : 0;
      
      particlesRef.current.forEach((p) => { 
        p.update(); 
        // Parallax: shift draw position based on scroll
        const parallaxY = (p.y + scrollY * 0.15) % canvas.height;
        p.draw(ctx, p.x, parallaxY); 
      });
      animationRef.current = requestAnimationFrame(animate);
    };

    setSize();
    animate();
    window.addEventListener('resize', setSize);
    return () => {
      window.removeEventListener('resize', setSize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div
      className={`particle-hero-wrap pointer-events-none fixed inset-0 w-full h-full overflow-hidden ${className}`}
      aria-hidden
      style={{ zIndex: -10 }}
    >
      {/* Star Field Canvas Only */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1 }}
      />
    </div>
  );
}
