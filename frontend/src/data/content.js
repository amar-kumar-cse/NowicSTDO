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
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export { ArrowRight, CheckCircle2, Star, Trophy, Users, Zap, Code2 };

export const brand = {
  name: 'Nowic Studio',
  tagline: 'Vision to Version',
  logoPrimary: '/image.png',
  logoFallback: '/nowic-logo.svg',
  email: 'hello@nowicstudio.com',
  phone: '+91 98765 43210',
  location: 'India 🇮🇳',
};

export const navLinks = [
  { label: 'Home',      path: '/' },
  { label: 'Services',  path: '/services' },
  { label: 'Portfolio', path: '/portfolio' },
  { label: 'About',     path: '/about' },
  { label: 'Contact',   path: '/contact' },
];

export const services = [
  {
    icon: Rocket,
    title: 'MVP Development',
    headline: 'Turn Ideas Into Products',
    description: 'Validate, build, and scale your product idea with a lean, production-ready MVP shipped in days — not months.',
    features: ['Market-fit Strategy', 'Rapid Prototyping', 'Scalable Foundation'],
    color: 'rgba(52,232,161,0.15)',
  },
  {
    icon: Building2,
    title: 'Business Websites',
    headline: 'Your Digital Storefront',
    description: 'Premium websites built to convert — with blazing speed, killer UI, and seamless CMS integrations.',
    features: ['Conversion-Focused Design', 'SEO-Optimised', 'Performance Score 95+'],
    color: 'rgba(31,200,125,0.12)',
  },
  {
    icon: Bot,
    title: 'AI Web Apps',
    headline: 'Intelligence Built-In',
    description: 'Embed cutting-edge AI — chatbots, smart dashboards, AI assistants — directly into your product stack.',
    features: ['LLM Integration', 'Smart Automation', 'Custom AI Pipelines'],
    color: 'rgba(52,232,161,0.12)',
  },
  {
    icon: LayoutDashboard,
    title: 'Admin Dashboards',
    headline: 'Total Control Centre',
    description: 'Build powerful admin panels with real-time analytics, CRM logic, and role-based access from day one.',
    features: ['Real-Time Analytics', 'Role-Based Access', 'CRM & Data Management'],
    color: 'rgba(14,165,96,0.12)',
  },
  {
    icon: Globe,
    title: 'SaaS Platforms',
    headline: 'Build Once. Scale Forever.',
    description: 'End-to-end SaaS architectures with auth, billing, subscription flows, and multi-tenant infrastructure.',
    features: ['Multi-Tenant Setup', 'Stripe Billing', 'Auth & RBAC'],
    color: 'rgba(95,255,192,0.1)',
  },
  {
    icon: Code2,
    title: 'API & Backend',
    headline: 'Solid Foundations',
    description: 'Battle-tested REST & GraphQL APIs with clean architecture, caching layers, and thorough documentation.',
    features: ['REST & GraphQL', 'Caching Strategy', 'Full Documentation'],
    color: 'rgba(31,200,125,0.08)',
  },
];

export const stats = [
  { icon: Gauge,       label: 'Fast Delivery',          value: '7–21 Days',          suffix: '' },
  { icon: Sparkles,    label: 'UI Quality',              value: 'Startup-Grade',       suffix: '' },
  { icon: Cpu,         label: 'AI-Powered Dev',          value: 'Automation-First',    suffix: '' },
  { icon: Layers,      label: 'Architecture',            value: 'Future-Ready',        suffix: '' },
  { icon: ShieldCheck, label: 'Execution Quality',       value: 'Zero Fluff',          suffix: '' },
  { icon: Users,       label: 'Satisfied Clients',       value: '30+',                 suffix: '' },
];

export const highlights = [
  { icon: Zap,         value: '3×',   label: 'Faster Development' },
  { icon: Trophy,      value: '98%',  label: 'Client Satisfaction' },
  { icon: Star,        value: '50+',  label: 'Projects Delivered' },
  { icon: Code2,       value: '21d',  label: 'Avg. Time to Launch' },
];

export const whyUs = [
  { title: 'Execution-First Process',        desc: 'We ship in tight sprints with clear milestones — no delays, no excuses.', icon: Rocket },
  { title: 'Senior-Level Code Quality',      desc: 'Every project uses clean architecture, proper patterns, and scalable structure.', icon: Code2 },
  { title: 'AI-Augmented Speed',             desc: 'We leverage AI workflows to deliver 3× faster without compromising quality.', icon: Bot },
  { title: 'Premium UI from Day 1',          desc: 'Your product will look and feel premium — because first impressions win customers.', icon: Sparkles },
  { title: 'Transparent Collaboration',      desc: 'Weekly demos, direct founder access, clear progress — you\'re never in the dark.', icon: Users },
  { title: 'Architecture That Scales',       desc: 'We build for today and tomorrow — clean code that grows with your business.', icon: Layers },
];

export const portfolioItems = [
  {
    title: 'Event Ticket Booking System',
    category: 'Full-Stack Platform',
    description: 'A complete booking platform with event discovery, dynamic seat management, real-time availability, and Stripe payment workflows.',
    tags: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
    gradient: 'from-mint/25 via-jade/10 to-emerald/20',
    featured: true,
  },
  {
    title: 'Catering Services Website',
    category: 'Business Website',
    description: 'A high-conversion business site with quote request flows, visual menu showcases, testimonials, and admin content control.',
    tags: ['React', 'SEO', 'CMS', 'Framer Motion'],
    gradient: 'from-jade/20 via-transparent to-mint/20',
    featured: false,
  },
  {
    title: 'Siya AI — Assistant Platform',
    category: 'AI Web Application',
    description: 'An enterprise AI assistant with custom LLM workflows, internal knowledge search, role-based access, and usage analytics.',
    tags: ['LLM', 'OpenAI', 'Dashboards', 'RBAC'],
    gradient: 'from-emerald/20 via-mint/10 to-jade/25',
    featured: true,
  },
  {
    title: 'BloodConnect',
    category: 'Healthcare Platform',
    description: 'A life-saving donor-receiver matching system with real-time blood availability tracking, admin management, and geolocation.',
    tags: ['React', 'MongoDB', 'Maps API', 'Healthcare'],
    gradient: 'from-glow/15 via-transparent to-mint/20',
    featured: false,
  },
];

export const teamValues = [
  'Speed without sacrificing quality',
  'Outcome-driven engineering',
  'Client transparency above all',
  'Continuous improvement mindset',
];

export const faqs = [
  {
    q: 'How long does a typical project take?',
    a: 'Most MVPs and websites are delivered in 7–21 days. Complex SaaS platforms take 4–8 weeks depending on scope.',
  },
  {
    q: 'Do you provide post-launch support?',
    a: 'Yes — we offer ongoing maintenance, feature iterations, and dedicated support packages for all projects.',
  },
  {
    q: 'What tech stack do you use?',
    a: 'Primarily React, Next.js, Node.js, MongoDB and PostgreSQL. We adapt to your stack as needed.',
  },
  {
    q: 'Can you work with an existing codebase?',
    a: 'Absolutely. We audit, refactor, and extend existing codebases with clean, maintainable enhancements.',
  },
];
