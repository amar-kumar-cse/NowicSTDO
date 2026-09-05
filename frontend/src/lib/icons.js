/**
 * resolveIcon — Safely map a lucide-react icon name string to its component.
 * This avoids `import * as Icons from 'lucide-react'` which imports the
 * entire library (~400+ icons, ~70-100KB) into the bundle.
 *
 * Only icons that are actually used in services/portfolio data are listed here.
 * If new icons are added via the admin CMS, add them to ICON_MAP below.
 */
import {
  Bot,
  Building2,
  LayoutDashboard,
  Rocket,
  Gauge,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  Code2,
  Globe,
  Zap,
  Trophy,
  Users,
  Star,
  Laptop,
  Smartphone,
  Database,
  Cloud,
  Lock,
  Palette,
  Terminal,
  Workflow,
  BrainCircuit,
  TrendingUp,
} from 'lucide-react';

const ICON_MAP = {
  Bot,
  Building2,
  LayoutDashboard,
  Rocket,
  Gauge,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  Code2,
  Globe,
  Zap,
  Trophy,
  Users,
  Star,
  Laptop,
  Smartphone,
  Database,
  Cloud,
  Lock,
  Palette,
  Terminal,
  Workflow,
  BrainCircuit,
  TrendingUp,
};

/**
 * Resolve a Lucide icon name string (from backend/CMS) to its React component.
 * Falls back to Code2 if the icon name is not found.
 *
 * @param {string} name - The PascalCase icon name (e.g., "Rocket", "Bot")
 * @returns {import('react').ComponentType} The Lucide React icon component
 */
export function resolveIcon(name) {
  return ICON_MAP[name] || Code2;
}
