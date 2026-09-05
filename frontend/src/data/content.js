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
  Smartphone,
  TrendingUp,
  Palette
} from 'lucide-react';

export { ArrowRight, CheckCircle2, Star, Trophy, Users, Zap, Code2 };

export const brand = {
  name: 'Nowic Studio',
  tagline: 'Vision to Version',
  logoPrimary: '/image.png',
  logoFallback: '/nowic-logo.svg',
  email: 'hello@nowicstudio.com',
  phone: '+91 98765 43210',
  location: 'India',
};

export const navLinks = [
  { label: 'Home',      path: '/' },
  { label: 'Services',  path: '/services' },
  { label: 'Pricing',   path: '/pricing' },
  { label: 'Portfolio', path: '/portfolio' },
  { label: 'About',     path: '/about' },
  { label: 'Contact',   path: '/contact' },
];

// SERVICES - Single source of truth
// Used by Navbar, Services page, Home page, and all service components.
export const services = [
  {
    id: 'website-development',
    slug: 'website-development',
    icon: Building2,
    icon_name: 'Building2',
    title: 'Website Development',
    name: 'Website Development',
    headline: 'High-Performance Web Solutions',
    tagline: 'High-Performance Web Solutions',
    description: 'Modern, responsive, and conversion-optimized websites built with Next.js, headless CMS, and technical SEO architecture.',
    features: ['5-7 Custom Pages', 'Lighthouse 95+ Score', 'SSL & Schema SEO'],
    subServices: [
      { icon: 'Globe', title: 'Custom Corporate Websites', description: 'Bespoke UI/UX design tailored to your enterprise branding.' },
      { icon: 'LayoutDashboard', title: 'Dynamic CMS & E-Commerce', description: 'Scalable e-commerce and CMS platforms with payment gateways.' },
      { icon: 'ShieldCheck', title: 'Technical SEO & Security', description: 'Schema markup, metadata, SSL and CDN deployment.' },
    ],
    image_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    price_starting: 1499,
    delivery_days: 14,
    color: 'rgba(31,200,125,0.12)',
    order: 0,
  },
  {
    id: 'mobile-app-development',
    slug: 'mobile-app-development',
    icon: Smartphone,
    icon_name: 'Smartphone',
    title: 'Mobile App Development',
    name: 'Mobile App Development',
    headline: 'iOS & Android Applications',
    tagline: 'iOS & Android Applications',
    description: 'Cross-platform and native mobile apps (Flutter, React Native, Swift, Kotlin) with smooth 60fps animations and offline sync.',
    features: ['Single Codebase MVP', 'Biometric Security', 'App Store Publishing'],
    subServices: [
      { icon: 'Smartphone', title: 'Cross-Platform Apps (Flutter)', description: 'Single codebase, native performance on iOS and Android.' },
      { icon: 'ShieldCheck', title: 'App Security & Auth', description: 'Biometric login, JWT tokens, and encryption.' },
      { icon: 'Rocket', title: 'App Store Publishing', description: 'Complete App Store and Play Store submission.' },
    ],
    image_url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    price_starting: null,
    delivery_days: 21,
    color: 'rgba(52,232,161,0.15)',
    order: 1,
  },
  {
    id: 'custom-software',
    slug: 'custom-software',
    icon: Globe,
    icon_name: 'Globe',
    title: 'Custom Software Development',
    name: 'Custom Software Development',
    headline: 'Multi-Tenant Cloud ERP & SaaS',
    tagline: 'Multi-Tenant Cloud ERP & SaaS',
    description: 'Enterprise ERPs, CRMs, multi-tenant databases, and automated billing engines built on resilient cloud infrastructure.',
    features: ['Multi-Tenant Database', 'Stripe Automated Billing', 'Role-Based Permissions'],
    subServices: [
      { icon: 'LayoutDashboard', title: 'SaaS Platform Development', description: 'Full-stack multi-tenant SaaS with auth, billing, and admin.' },
      { icon: 'Building2', title: 'Enterprise ERP & CRM', description: 'Custom enterprise resource planning and CRM systems.' },
      { icon: 'Code2', title: 'API-First Architecture', description: 'Headless backends for scale and integrations.' },
    ],
    image_url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    price_starting: null,
    delivery_days: 30,
    color: 'rgba(95,255,192,0.1)',
    order: 2,
  },
  {
    id: 'digital-marketing',
    slug: 'digital-marketing',
    icon: TrendingUp,
    icon_name: 'TrendingUp',
    title: 'SEO & Digital Marketing',
    name: 'SEO & Digital Marketing',
    headline: 'Full-Funnel Organic & Paid Growth',
    tagline: 'Full-Funnel Organic & Paid Growth',
    description: 'Technical SEO audits, high-intent keyword dominance, Google & Meta Ads management, and conversion rate optimization.',
    features: ['Local & Global SEO', 'Google & Meta Ads', 'Monthly Rank Tracking'],
    subServices: [
      { icon: 'Globe', title: 'Technical SEO', description: 'Site audits, Core Web Vitals, and structured data.' },
      { icon: 'Rocket', title: 'Google & Meta Ads', description: 'Data-driven paid campaigns for maximum ROAS.' },
      { icon: 'Trophy', title: 'Content & Link Building', description: 'High-quality content and authoritative backlinks.' },
    ],
    image_url: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    price_starting: 15000,
    delivery_days: 7,
    color: 'rgba(14,165,96,0.12)',
    order: 3,
  },
  {
    id: 'graphics-designing',
    slug: 'graphics-designing',
    icon: Palette,
    icon_name: 'Palette',
    title: 'Graphic Design',
    name: 'Graphic Design',
    headline: 'Memorable Brand Identities',
    tagline: 'Memorable Brand Identities',
    description: 'Primary/secondary logo suites, brand books, typography systems, marketing collaterals, and editable Figma kits.',
    features: ['Complete Logo Suite', 'Brand Style Guide', 'Social Media Design Kit'],
    subServices: [
      { icon: 'Sparkles', title: 'Brand Identity Design', description: 'Logo suite, color palette, and brand guidelines.' },
      { icon: 'Layers', title: 'Marketing Collateral', description: 'Business cards, brochures, and social templates.' },
      { icon: 'Trophy', title: 'UI/UX Design', description: 'High-fidelity Figma designs for web and mobile.' },
    ],
    image_url: 'https://images.unsplash.com/photo-1558655146-d09347e92766?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    price_starting: 5000,
    delivery_days: 7,
    color: 'rgba(31,200,125,0.08)',
    order: 4,
  },
  {
    id: 'ai-services',
    slug: 'ai-services',
    icon: Bot,
    icon_name: 'Bot',
    title: 'AI Services',
    name: 'AI Services',
    headline: 'Custom AI Agents & Intelligent Automation',
    tagline: 'Custom AI Agents & Intelligent Automation',
    description: 'Embed custom AI models, RAG document pipelines, and WhatsApp bots trained on your private knowledge base.',
    features: ['Private Data RAG Pipeline', 'WhatsApp & Web Bots', 'Workflow Automation'],
    subServices: [
      { icon: 'Bot', title: 'AI Chatbots & Assistants', description: 'Intelligent chatbots powered by GPT-4 and Claude.' },
      { icon: 'Cpu', title: 'RAG Document Pipelines', description: 'Retrieval-augmented generation for private documents.' },
      { icon: 'Zap', title: 'Workflow Automation', description: 'AI-powered automation for business processes.' },
    ],
    image_url: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    price_starting: 20000,
    delivery_days: 21,
    color: 'rgba(52,232,161,0.12)',
    order: 5,
  },
];

export const stats = [
  { icon: Gauge,       label: 'Fast Delivery',          value: '7-21 Days',          suffix: '' },
  { icon: Sparkles,    label: 'UI Quality',              value: 'Startup-Grade',       suffix: '' },
  { icon: Cpu,         label: 'AI-Powered Dev',          value: 'Automation-First',    suffix: '' },
  { icon: Layers,      label: 'Architecture',            value: 'Future-Ready',        suffix: '' },
  { icon: ShieldCheck, label: 'Execution Quality',       value: 'Zero Fluff',          suffix: '' },
  { icon: Users,       label: 'Satisfied Clients',       value: '30+',                 suffix: '' },
];

export const highlights = [
  { icon: Zap,         value: '3x',   label: 'Faster Development' },
  { icon: Trophy,      value: '98%',  label: 'Client Satisfaction' },
  { icon: Star,        value: '50+',  label: 'Projects Delivered' },
  { icon: Code2,       value: '21d',  label: 'Avg. Time to Launch' },
];

export const whyUs = [
  { title: 'Execution-First Process',        desc: 'We ship in tight sprints with clear milestones - no delays, no excuses.', icon: Rocket },
  { title: 'Senior-Level Code Quality',      desc: 'Every project uses clean architecture, proper patterns, and scalable structure.', icon: Code2 },
  { title: 'AI-Augmented Speed',             desc: 'We leverage AI workflows to deliver 3x faster without compromising quality.', icon: Bot },
  { title: 'Premium UI from Day 1',          desc: 'Your product will look and feel premium - because first impressions win customers.', icon: Sparkles },
  { title: 'Transparent Collaboration',      desc: 'Weekly demos, direct founder access, clear progress - you are never in the dark.', icon: Users },
  { title: 'Architecture That Scales',       desc: 'We build for today and tomorrow - clean code that grows with your business.', icon: Layers },
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
    title: 'Siya AI - Assistant Platform',
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
    a: 'Most MVPs and websites are delivered in 7-21 days. Complex SaaS platforms take 4-8 weeks depending on scope.',
  },
  {
    q: 'Do you provide post-launch support?',
    a: 'Yes - we offer ongoing maintenance, feature iterations, and dedicated support packages for all projects.',
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
