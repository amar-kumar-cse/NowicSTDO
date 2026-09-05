import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { TrendingUp, Clock, CheckCircle2, ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";
import { MagneticButton } from "./MagneticButton";

function useCountUp(target, active) {
  const [display, setDisplay] = useState("0");
  const rafRef = useRef(0);

  useEffect(() => {
    if (!active) return;
    if (!target) return;
    const raw = String(target).replace(/[^0-9.]/g, "");
    const numEnd = parseFloat(raw);
    if (isNaN(numEnd)) { setDisplay(target); return; }
    const suffix = String(target).replace(/^[\d,]+/, "");
    const duration = 1800;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(ease * numEnd);
      setDisplay(current.toLocaleString() + suffix);
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, target]);

  return display;
}

export function CaseStudyCard({ project, index, isVisible }) {
  const [expanded, setExpanded] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [impactVisible, setImpactVisible] = useState(false);
  const impactRef = useRef(null);
  const isEven = index % 2 === 0;

  const projectId = project.id || project.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  
  // Adapt to NowicME's schema or fallbacks
  const impactMetric = project.impact?.metric || project.results || "100%";
  const impactLabel = project.impact?.label || "Key Impact Delivered";
  const impactSubtext = project.impact?.subtext || "";
  const yearText = project.year || new Date().getFullYear();
  const techList = project.tech_stack || project.technologies || [];
  const descriptionText = project.detailedDescription || project.description || "";
  const imageUrl = project.image_url || project.imageUrl || "https://www.nowicstdio.tech/image.png";

  useEffect(() => {
    if (isVisible && !hasAnimated) {
      const t = setTimeout(() => setHasAnimated(true), index * 150);
      return () => clearTimeout(t);
    }
  }, [isVisible, index, hasAnimated]);

  // Impact counter trigger
  useEffect(() => {
    const el = impactRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setImpactVisible(true); },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const metricDisplay = useCountUp(impactMetric, impactVisible);

  // 3D Tilt Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["3deg", "-3deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-3deg", "3deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.article
      id={`case-study-${projectId}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        transitionDelay: `${index * 100}ms`
      }}
      className={cn(
        "group relative transition-all duration-700 w-full mb-8",
        hasAnimated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      )}
    >
      <div className={cn(
        "grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden",
        "border border-white/10 bg-white/[0.02] backdrop-blur-md",
        "hover:shadow-2xl hover:border-mint/20 transition-all duration-500",
      )}>
        {/* Image — alternates left/right */}
        <div className={cn(
          "relative min-h-[260px] lg:min-h-[420px] overflow-hidden bg-surface",
          !isEven && "lg:order-2"
        )}>
          <img
            src={imageUrl}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Category + Year badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-mint text-black text-[10px] font-bold uppercase tracking-wider shadow-lg">
              {project.category || "Project"}
            </span>
            {(project.duration || project.timeline) && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-[10px] font-semibold text-white border border-white/20">
                <Clock className="w-3 h-3 text-mint" />
                {project.duration || project.timeline}
              </span>
            )}
          </div>

          {/* Year watermark */}
          <span className="absolute bottom-4 right-4 text-[11px] font-black text-white/40 tracking-widest">
            {yearText}
          </span>
        </div>

        {/* Content */}
        <div className={cn(
          "relative flex flex-col p-7 lg:p-8",
          !isEven && "lg:order-1"
        )}>
          {/* Title */}
          <h3 className="text-xl lg:text-2xl font-black text-white leading-tight mb-2 group-hover:text-mint transition-colors duration-400">
            {project.title}
          </h3>
          <p className="text-sm text-[#8b8fa3] leading-relaxed mb-5">
            {descriptionText}
          </p>

          {/* Expand/Collapse: Challenge + Solution */}
          {(project.challenge || project.solution) && (
            <div className="mb-4">
              <button
                onClick={() => setExpanded((e) => !e)}
                className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-mint transition-colors duration-300 mb-3 focus:outline-none"
                aria-expanded={expanded}
              >
                <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", expanded && "rotate-180")} />
                {expanded ? "Hide Details" : "Read Full Case Study"}
              </button>

              <div
                className={cn(
                  "overflow-hidden transition-all duration-500",
                  expanded ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
                )}
              >
                <div className="space-y-4 pb-4">
                  {project.challenge && (
                    <div className="pl-3 border-l-2 border-gray-700">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">The Challenge</p>
                      <p className="text-xs text-gray-300 leading-relaxed">{project.challenge}</p>
                    </div>
                  )}
                  {project.solution && (
                    <div className="pl-3 border-l-2 border-mint/50">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-mint mb-1">Our Solution</p>
                      <p className="text-xs text-gray-300 leading-relaxed">{project.solution}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Impact Box */}
          <div
            ref={impactRef}
            className="flex items-center gap-4 p-4 rounded-xl bg-mint/[0.05] border border-mint/10 mb-4 group-hover:border-mint/25 transition-colors duration-400"
          >
            <div className="flex-shrink-0 p-2.5 rounded-xl bg-mint/10">
              <TrendingUp className="w-5 h-5 text-mint" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-black text-mint leading-none">{metricDisplay}</p>
              <p className="text-xs font-bold text-gray-300 leading-tight">{impactLabel}</p>
              {impactSubtext && (
                <p className="text-[10px] text-gray-500 mt-0.5">{impactSubtext}</p>
              )}
            </div>
          </div>

          {/* Tech Stack */}
          {techList.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-5">
              {techList.map((tech) => (
                <span
                  key={tech}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/10 text-[10px] font-semibold text-gray-300 group-hover:border-mint/30 transition-colors duration-400"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}

          {/* Testimonial */}
          {project.testimonial && (
            <blockquote className="mt-auto pl-3 border-l-2 border-mint/40 mb-4">
              <p className="text-xs italic text-gray-400 leading-relaxed mb-1">
                &ldquo;{project.testimonial.quote}&rdquo;
              </p>
              <footer className="text-[10px] font-bold text-gray-500">
                — {project.testimonial.name}, {project.testimonial.role}
              </footer>
            </blockquote>
          )}

          {/* CTA */}
          <div className="mt-auto pt-4 border-t border-white/10 group-hover:border-mint/20 transition-colors duration-400">
            <MagneticButton>
              <a
                href={`/portfolio/${projectId}`}
                className="inline-flex items-center gap-2 text-xs font-bold text-mint hover:gap-3 transition-all duration-300"
              >
                <CheckCircle2 className="w-4 h-4" />
                View Full Case Study
              </a>
            </MagneticButton>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
