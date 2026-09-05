/**
 * Industry data based on actual projects in the Nowic Studio portfolio.
 */

export const industryDetails = {
  startups: {
    name: 'Startups',
    tagline: 'Rapid MVP development and scalable architecture for early-stage ventures.',
    description: 'We help founders turn ideas into launch-ready products in 4-6 weeks. For startups, speed to market and a premium user experience are critical for securing funding and early adopters. We build MVPs that don\'t feel like MVPs — they look premium and scale effortlessly.',
    challenges: [
      'Need to validate ideas quickly without spending months in development',
      'Limited budgets requiring cost-effective but high-quality solutions',
      'Technical debt accumulated by hiring inexperienced freelancers',
      'Need for a flexible architecture that can pivot as the business model evolves'
    ],
    solutions: [
      'Sprint-based development shipping core features in 4-6 weeks',
      'Use of battle-tested frameworks (React, Django) to avoid reinventing the wheel',
      'Clean architecture that ensures the MVP code can be built upon, not thrown away',
      'Integration of AI workflows to provide immediate competitive advantages'
    ],
    relatedServices: ['mvp-development', 'ai-web-apps', 'saas-platforms'],
    relatedCaseStudies: ['siya-ai-assistant-platform', 'bloodconnect-healthcare-platform'],
  },
  healthcare: {
    name: 'Healthcare',
    tagline: 'Secure, compliant, and user-friendly digital health platforms.',
    description: 'The healthcare industry requires software that prioritizes data security, privacy, and accessibility. We build platforms that connect patients with providers, manage medical data, and streamline healthcare operations with intuitive interfaces.',
    challenges: [
      'Strict data privacy and security requirements',
      'Complex workflows involving multiple stakeholders (patients, doctors, admins)',
      'Outdated legacy systems that are difficult to integrate with',
      'Need for real-time data access and high reliability'
    ],
    solutions: [
      'Implementation of industry-standard security practices and data encryption',
      'Role-based access control and comprehensive admin dashboards',
      'Development of secure APIs for third-party integrations',
      'User-centric design focusing on accessibility for all patient demographics'
    ],
    relatedServices: ['mvp-development', 'admin-dashboards', 'api-backend'],
    relatedCaseStudies: ['bloodconnect-healthcare-platform'],
  },
  'ecommerce-food': {
    name: 'E-commerce & Food',
    tagline: 'High-conversion digital storefronts and booking systems.',
    description: 'For retail and food service businesses, your digital presence is your storefront. We build lightning-fast e-commerce platforms, booking systems, and business websites that drive conversions and streamline operations.',
    challenges: [
      'High bounce rates due to slow loading speeds',
      'Complex inventory and booking management',
      'Friction in the checkout or booking process',
      'Difficulty standing out in a crowded digital marketplace'
    ],
    solutions: [
      'Next.js and edge caching for sub-second page loads',
      'Custom admin dashboards for managing orders, bookings, and inventory',
      'Seamless payment gateway integration (Stripe, Razorpay)',
      'Premium, brand-aligned UI/UX design that builds trust'
    ],
    relatedServices: ['business-websites', 'api-backend', 'admin-dashboards'],
    relatedCaseStudies: ['catering-services-website', 'event-ticket-booking-system'],
  },
  saas: {
    name: 'SaaS & B2B',
    tagline: 'Scalable software-as-a-service platforms with robust multi-tenant architectures.',
    description: 'Building a SaaS requires more than just features — it needs subscription billing, multi-tenancy, robust authentication, and self-serve onboarding. We build SaaS products that are ready for thousands of concurrent users from day one.',
    challenges: [
      'Complex multi-tenant data architecture and security',
      'Handling complex subscription billing and usage-based pricing',
      'Building performant dashboards for heavy data visualization',
      'Ensuring high availability and scalable infrastructure'
    ],
    solutions: [
      'Row-level security and tenant isolation using PostgreSQL',
      'Deep integration with Stripe for flexible billing models',
      'High-performance React dashboards for real-time analytics',
      'Dockerized, cloud-native deployments for horizontal scaling'
    ],
    relatedServices: ['saas-platforms', 'api-backend', 'ai-web-apps'],
    relatedCaseStudies: ['event-ticket-booking-system', 'siya-ai-assistant-platform', 'thenahj-islamic-wisdom-platform'],
  }
};
