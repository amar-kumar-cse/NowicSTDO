/**
 * Extended case study details for individual case study pages.
 * Keyed by slug — the same slug used in routes and sitemap.
 *
 * Each entry extends the portfolio data already in the CMS with richer,
 * long-form content suitable for a standalone landing page that targets
 * "[project type] case study" search queries.
 */

export const caseStudyDetails = {
  'thenahj-islamic-wisdom-platform': {
    title: 'TheNahj — Islamic Wisdom Platform',
    category: 'SaaS Platform',
    client: 'TheNahj Project',
    timeline: '5 Weeks',
    year: '2024',
    techStack: ['React', 'Vite', 'Tailwind CSS', 'TypeScript', 'Node.js', 'Express'],
    liveUrl: 'https://thenahj.live',
    heroSummary: 'A modern, premium platform for presenting classical Islamic wisdom to a global digital audience with an immersive reading experience and a full content management system.',
    problem: 'The client had a vision to make the teachings of Imam Ali (AS) accessible to a modern, tech-savvy audience. Existing Islamic content platforms were outdated, poorly designed, and lacked any content management capabilities. They needed a platform that felt premium, loaded instantly, and could be updated without developer involvement.',
    solution: 'We built a full-stack platform from scratch using React and Vite for a blazing-fast frontend, paired with a Node.js/Express backend and a custom CMS. The platform features a sophisticated quote discovery engine, a daily reflection feed, integrated focus tools, and a beautifully designed reading experience optimized for mobile devices.',
    approach: [
      'Conducted a design sprint to establish the visual language — dark, immersive, and reverent.',
      'Built a custom headless CMS so the client could manage quotes, reflections, and articles without touching code.',
      'Implemented a progressive loading strategy for quotes with infinite scroll and semantic categorization.',
      'Designed a mobile-first, accessibility-focused reading experience with adjustable font sizes and a distraction-free mode.',
      'Deployed on Vercel with edge caching for sub-200ms global page loads.'
    ],
    results: [
      { metric: '5 Weeks', label: 'Concept to Launch' },
      { metric: '99.9%', label: 'Uptime Since Launch' },
      { metric: '<200ms', label: 'Global Page Loads' },
      { metric: '100%', label: 'CMS-Driven Content' }
    ],
    testimonial: null
  },

  'event-ticket-booking-system': {
    title: 'Event Ticket Booking System',
    category: 'Full-Stack Platform',
    client: 'Confidential',
    timeline: '6 Weeks',
    year: '2024',
    techStack: ['React', 'Node.js', 'PostgreSQL', 'Stripe', 'Redis', 'Tailwind CSS'],
    liveUrl: '',
    heroSummary: 'A complete event booking platform with dynamic seat management, real-time availability tracking, and secure Stripe payment workflows.',
    problem: 'The client needed a scalable event ticketing system capable of handling concurrent bookings for high-demand events without overselling seats. Existing off-the-shelf solutions were too expensive and lacked the customization needed for their specific event categories.',
    solution: 'We engineered a custom full-stack booking platform with a React frontend, Node.js API, and PostgreSQL database. The system uses Redis for real-time seat locking during checkout, Stripe for secure payment processing, and an admin dashboard for event organizers to manage listings, pricing tiers, and attendee data.',
    approach: [
      'Architected a seat-locking mechanism using Redis with TTL-based expiry to prevent double-bookings during concurrent checkouts.',
      'Built a dynamic seating chart component in React with drag-to-select and real-time availability indicators.',
      'Integrated Stripe Checkout with webhook-driven order confirmation for bulletproof payment flows.',
      'Created an admin dashboard with real-time sales analytics, attendee export, and event management tools.',
      'Implemented rate limiting and queue-based processing for high-traffic sale launches.'
    ],
    results: [
      { metric: '0', label: 'Double-Bookings' },
      { metric: '6 Weeks', label: 'Full Delivery' },
      { metric: '<2s', label: 'Checkout Time' },
      { metric: '100%', label: 'Payment Success Rate' }
    ],
    testimonial: null
  },

  'siya-ai-assistant-platform': {
    title: 'Siya AI — Assistant Platform',
    category: 'AI Web Application',
    client: 'Enterprise Client',
    timeline: '8 Weeks',
    year: '2025',
    techStack: ['React', 'OpenAI API', 'Python', 'FastAPI', 'PostgreSQL', 'Vector DB'],
    liveUrl: '',
    heroSummary: 'An enterprise-grade AI assistant platform with custom LLM workflows, internal knowledge search, role-based access, and comprehensive usage analytics.',
    problem: 'The client\'s team was spending hours daily searching through internal documentation, SOPs, and knowledge bases spread across multiple tools. They needed a unified AI-powered assistant that could understand their internal context and provide instant, accurate answers while maintaining strict data security.',
    solution: 'We built Siya AI — a custom RAG (Retrieval-Augmented Generation) platform that ingests the client\'s internal documents, indexes them in a vector database, and provides a ChatGPT-like interface fine-tuned to their specific domain. The system includes role-based access, usage quotas, conversation history, and detailed analytics for management.',
    approach: [
      'Designed a document ingestion pipeline that processes PDFs, Word docs, and web pages into chunked, vectorized embeddings.',
      'Built a RAG architecture using OpenAI\'s API with custom prompt engineering to ensure accurate, context-aware responses.',
      'Implemented role-based access control (RBAC) with team workspaces and individual usage tracking.',
      'Created an analytics dashboard showing query patterns, response quality metrics, and cost tracking per department.',
      'Deployed with enterprise-grade security: SSO integration, data encryption at rest, and audit logging.'
    ],
    results: [
      { metric: '70%', label: 'Reduction in Search Time' },
      { metric: '8 Weeks', label: 'Full Platform Delivery' },
      { metric: '95%+', label: 'Response Accuracy' },
      { metric: '500+', label: 'Daily Queries Handled' }
    ],
    testimonial: null
  },

  'bloodconnect-healthcare-platform': {
    title: 'BloodConnect — Healthcare Platform',
    category: 'Healthcare Platform',
    client: 'BloodConnect Initiative',
    timeline: '4 Weeks',
    year: '2024',
    techStack: ['React', 'MongoDB', 'Node.js', 'Maps API', 'Twilio'],
    liveUrl: '',
    heroSummary: 'A life-saving donor-receiver matching system with real-time blood availability tracking, geolocation-based search, and admin management tools.',
    problem: 'In emergency blood shortage situations, finding compatible donors quickly is literally a matter of life and death. The existing process relied on phone calls and social media posts, leading to dangerous delays. The initiative needed a digital platform that could match donors with receivers in real-time based on blood type and proximity.',
    solution: 'We built BloodConnect — a real-time donor-receiver matching platform with geolocation-powered search, SMS/push notifications for urgent requests, and a comprehensive admin panel for managing donor databases and blood bank inventories across multiple locations.',
    approach: [
      'Integrated Google Maps API for proximity-based donor search with configurable radius filtering.',
      'Built a real-time notification system using Twilio SMS and browser push notifications for urgent blood requests.',
      'Designed an intuitive donor registration flow with blood type verification and availability scheduling.',
      'Created an admin dashboard with blood bank inventory tracking, donor activity logs, and request analytics.',
      'Optimized for mobile-first usage since most emergency requests come from smartphones.'
    ],
    results: [
      { metric: '4 Weeks', label: 'MVP to Launch' },
      { metric: '<5 min', label: 'Avg. Match Time' },
      { metric: '100+', label: 'Registered Donors' },
      { metric: '24/7', label: 'Availability' }
    ],
    testimonial: null
  },

  'catering-services-website': {
    title: 'Catering Services Website',
    category: 'Business Website',
    client: 'Local Catering Business',
    timeline: '2 Weeks',
    year: '2024',
    techStack: ['React', 'Framer Motion', 'Tailwind CSS', 'SEO', 'CMS'],
    liveUrl: '',
    heroSummary: 'A high-conversion business website with visual menu showcases, quote request flows, testimonials, and admin-controlled content management.',
    problem: 'The catering business relied entirely on word-of-mouth and had zero online presence. They were losing customers to competitors with modern websites and online ordering capabilities. They needed a website that would showcase their menus beautifully, capture leads, and allow them to update content without a developer.',
    solution: 'We designed and built a premium, conversion-optimized business website with a visual menu gallery, integrated quote request forms, a testimonials section, and a lightweight CMS so the owner could update menus, pricing, and photos independently.',
    approach: [
      'Created a visually stunning food photography layout with lazy-loaded image galleries and smooth animations.',
      'Built a multi-step quote request form that captures event details, guest count, and menu preferences.',
      'Implemented full technical SEO: schema markup for local business, meta tags, and optimized page speed.',
      'Designed a simple admin interface for the owner to update menu items, prices, and seasonal specials.',
      'Achieved 95+ Lighthouse performance scores across all metrics.'
    ],
    results: [
      { metric: '2 Weeks', label: 'Design to Launch' },
      { metric: '95+', label: 'Lighthouse Score' },
      { metric: '3×', label: 'Lead Inquiries vs. Before' },
      { metric: '100%', label: 'Owner-Managed Content' }
    ],
    testimonial: null
  }
};

/**
 * Helper to convert a project title from the CMS into a slug
 * that matches the keys in caseStudyDetails above.
 */
export function toProjectSlug(title) {
  if (!title) return '';
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
