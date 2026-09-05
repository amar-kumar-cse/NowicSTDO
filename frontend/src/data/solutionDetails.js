/**
 * Solutions data based on specific client problems Nowic Studio solves.
 */

export const solutionDetails = {
  'mvp-for-startups': {
    title: 'MVP for Startups',
    tagline: 'Validate your idea fast with a production-ready MVP.',
    description: 'Startups fail when they spend months building features nobody wants. We help you define your core value proposition and build a launch-ready Minimum Viable Product in 4-6 weeks. Unlike typical MVP agencies, we build on scalable architectures (React, Django, PostgreSQL) so you don\'t have to throw the code away when you find product-market fit.',
    problem: 'Founders have a great idea but lack the technical expertise to build it, or have wasted time and money on freelancers who delivered unscalable, buggy code.',
    howWeSolveIt: [
      'Scope reduction workshops to identify the true "must-have" features',
      'Rapid prototyping and UI/UX design to visualize the product before coding',
      'Sprint-based development shipping working software every week',
      'Scalable technical foundation that can handle your first 10,000 users'
    ],
    relatedServices: ['mvp-development', 'saas-platforms'],
    relatedCaseStudies: ['bloodconnect-healthcare-platform', 'siya-ai-assistant-platform'],
  },
  'ai-integration': {
    title: 'AI Integration',
    tagline: 'Supercharge your existing product with AI capabilities.',
    description: 'Generative AI is no longer optional—it\'s a baseline expectation. We help businesses integrate Large Language Models (LLMs), custom AI agents, and semantic search into their existing workflows and products. From intelligent customer support chatbots to automated content generation, we build practical AI solutions that drive real business value.',
    problem: 'Companies know they need to leverage AI to stay competitive, but lack the specialized knowledge of prompt engineering, vector databases, and LLM orchestration frameworks like LangChain.',
    howWeSolveIt: [
      'Strategic consulting to identify high-ROI AI use cases for your specific business',
      'Integration of state-of-the-art models (OpenAI GPT-4o, Claude)',
      'Implementation of RAG (Retrieval-Augmented Generation) pipelines with Pinecone/pgvector',
      'Development of custom internal tools for managing AI prompts and usage'
    ],
    relatedServices: ['ai-web-apps', 'api-backend'],
    relatedCaseStudies: ['siya-ai-assistant-platform'],
  },
  'saas-platform': {
    title: 'SaaS Platform Development',
    tagline: 'Build scalable software products with built-in monetization.',
    description: 'Building a SaaS business requires more than just core features. You need user authentication, role-based access control, subscription billing, multi-tenancy, and onboarding flows. We handle the complex infrastructure so you can focus on your unique business logic and go-to-market strategy.',
    problem: 'Founders underestimate the complexity of SaaS architecture, specifically around secure multi-tenant data, edge-case billing logic, and maintaining high availability.',
    howWeSolveIt: [
      'Implementation of secure, isolated multi-tenant architectures',
      'Deep integration with Stripe for flexible subscription and usage-based billing',
      'Pre-built, customizable auth flows using Clerk or custom JWT solutions',
      'Comprehensive admin panels for managing users, subscriptions, and platform health'
    ],
    relatedServices: ['saas-platforms', 'admin-dashboards'],
    relatedCaseStudies: ['event-ticket-booking-system', 'thenahj-islamic-wisdom-platform'],
  },
  'business-website': {
    title: 'Business Websites that Convert',
    tagline: 'Premium marketing websites designed to drive growth.',
    description: 'Your website is your best salesperson. We design and develop premium, high-performance marketing websites that establish brand authority and convert visitors into leads. We move beyond generic templates to deliver custom, animated, and SEO-optimized digital experiences.',
    problem: 'Businesses suffer from high bounce rates and low conversions because their websites are slow, generic, outdated, or fail to clearly communicate their value proposition.',
    howWeSolveIt: [
      'Bespoke UI/UX design with premium typography, layouts, and micro-interactions (Framer Motion)',
      'Development using Next.js or Vite for blazing-fast page load speeds',
      'Implementation of on-page technical SEO best practices (Core Web Vitals, Schema.org)',
      'Integration of headless CMS platforms for easy content updates'
    ],
    relatedServices: ['business-websites'],
    relatedCaseStudies: ['catering-services-website'],
  },
  'admin-dashboard': {
    title: 'Internal Admin Dashboards',
    tagline: 'Streamline operations with custom internal tooling.',
    description: 'Off-the-shelf software often forces you to change your business processes to fit their tool. We build custom admin dashboards and internal portals tailored exactly to your operations, bringing scattered data into one centralized, actionable interface.',
    problem: 'Teams waste hours manually transferring data between different software platforms, dealing with messy spreadsheets, and lacking real-time visibility into business metrics.',
    howWeSolveIt: [
      'Development of unified dashboards that aggregate data from multiple APIs',
      'Creation of complex data visualizations and reporting tools',
      'Implementation of granular role-based access control (RBAC) for different team members',
      'Automation of routine manual workflows directly from the dashboard'
    ],
    relatedServices: ['admin-dashboards', 'api-backend'],
    relatedCaseStudies: ['event-ticket-booking-system', 'siya-ai-assistant-platform'],
  },
  'api-development': {
    title: 'Custom API Development',
    tagline: 'Scalable backends to power your digital ecosystem.',
    description: 'A robust product requires a powerful backend. We design and develop secure, high-performance REST and GraphQL APIs that serve as the backbone for web apps, mobile apps, and third-party integrations.',
    problem: 'Slow, poorly documented, or insecure backend infrastructure causes frontend performance issues, security vulnerabilities, and makes it difficult for mobile teams or partners to integrate.',
    howWeSolveIt: [
      'Architecture design focused on scalability and low latency',
      'Development using high-performance frameworks (Django Ninja, Node/Express, FastAPI)',
      'Implementation of robust security (rate limiting, input validation, JWT authentication)',
      'Automatic generation of comprehensive API documentation (OpenAPI/Swagger)'
    ],
    relatedServices: ['api-backend'],
    relatedCaseStudies: ['event-ticket-booking-system'],
  }
};
