import { motion } from 'framer-motion';

/**
 * FloatingChips — renders tech/service labels that float in 3D space
 * in the hero background. Purely decorative.
 */

const CHIPS = [
  { label: 'React', x: '8%',  y: '18%', delay: 0    },
  { label: 'Node.js', x: '82%', y: '12%', delay: 0.6  },
  { label: 'AI / LLM', x: '72%', y: '62%', delay: 1.1  },
  { label: 'MongoDB', x: '5%',  y: '68%', delay: 0.3  },
  { label: 'Next.js', x: '45%', y: '5%',  delay: 0.9  },
  { label: 'Stripe', x: '88%', y: '38%', delay: 1.4  },
  { label: 'OpenAI', x: '15%', y: '86%', delay: 0.5  },
  { label: 'GraphQL', x: '60%', y: '88%', delay: 1.7  },
];

export default function FloatingChips() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {CHIPS.map((chip) => (
        <motion.div
          key={chip.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: [0, 0.45, 0.45, 0],
            y: [20, 0, -12, -28],
          }}
          transition={{
            duration: 7,
            delay: chip.delay,
            repeat: Infinity,
            repeatDelay: 3 + chip.delay * 0.5,
            ease: 'easeInOut',
          }}
          style={{ left: chip.x, top: chip.y }}
          className="absolute"
        >
          <div
            style={{
              background: 'rgba(14,15,20,0.55)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(52,217,154,0.15)',
              borderRadius: '999px',
              padding: '5px 14px',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.06em',
              color: 'rgba(180,220,200,0.7)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)',
              whiteSpace: 'nowrap',
            }}
          >
            {chip.label}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
