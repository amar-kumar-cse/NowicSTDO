/**
 * @typedef {Object} SubDetail
 * @property {string} title
 * @property {string} description
 * @property {string[]} [features]
 * @property {string[]} [benefits]
 * @property {string[]} [whyChooseUs]
 */

/**
 * @typedef {Object} ServiceDetail
 * @property {string} slug
 * @property {string} title
 * @property {string} [icon]
 * @property {string} description
 * @property {string} backgroundImage
 * @property {SubDetail[]} [subDetails]
 */

/**
 * @typedef {Object} HeroSlide
 * @property {string} title
 * @property {string} description
 * @property {Object} image
 * @property {string} image.src
 * @property {string} image.alt
 * @property {string} image.hint
 */

/**
 * @typedef {Object} Service
 * @property {string} slug
 * @property {string} title
 * @property {string} description
 * @property {Object} [hero]
 * @property {HeroSlide[]} hero.slides
 * @property {ServiceDetail[]} details
 * @property {string[]} [features]
 * @property {string[]} [benefits]
 * @property {Object[]} [faqs]
 * @property {string} faqs.q
 * @property {string} faqs.a
 */

/** @type {Service[]} */
export const services = [
  {
    slug: 'mvp-development',
    title: 'MVP Development',
    description: 'Launch your product fast with our agile MVP development services. We build scalable foundations for future growth.',
    hero: {
      slides: [
        {
          title: 'Speed to Market',
          description: 'Get your product in front of users faster.',
          image: { src: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c', alt: 'Team working', hint: 'Agile' }
        },
        {
          title: 'Scalable Foundations',
          description: 'Built on modern tech stacks ready for scale.',
          image: { src: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c', alt: 'Code on screen', hint: 'Code' }
        }
      ]
    },
    details: [
      {
        slug: 'prototyping',
        title: 'Rapid Prototyping',
        icon: 'Smartphone',
        description: 'Visualize your idea before writing a single line of code.',
        backgroundImage: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e',
        subDetails: [
          {
            title: 'UI/UX Design',
            description: 'Wireframes and high-fidelity mockups for user testing.',
            features: ['Figma', 'Interactive Prototypes', 'User Journeys'],
            benefits: ['Validate ideas early', 'Save development costs']
          }
        ]
      },
      {
        slug: 'core-development',
        title: 'Core MVP Build',
        icon: 'Code',
        description: 'Develop the essential features needed to launch.',
        backgroundImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97',
        subDetails: [
          {
            title: 'Full-Stack Engineering',
            description: 'Robust backend and responsive frontend.',
            features: ['React / Vite', 'Node.js', 'PostgreSQL'],
            benefits: ['Fast performance', 'Secure data handling']
          }
        ]
      }
    ],
    features: [
      'Agile Methodology',
      'Continuous Integration',
      'Dedicated Product Manager',
      'Scalable Cloud Architecture'
    ],
    benefits: [
      'Reduce Time to Market',
      'Cost-Effective Validation',
      'Attract Early Adopters',
      'Data-Driven Iteration'
    ],
    faqs: [
      {
        q: 'How long does an MVP take to build?',
        a: 'Typically between 4 to 12 weeks, depending on the complexity of the core features.'
      },
      {
        q: 'What happens after the MVP is launched?',
        a: 'We continue to support and iterate on the product based on real user feedback.'
      }
    ]
  },
  {
    slug: 'ai-web-apps',
    title: 'AI Web Applications',
    description: 'Integrate artificial intelligence into your web platforms to automate processes and enhance user experiences.',
    hero: {
      slides: [
        {
          title: 'Intelligent Systems',
          description: 'Automate tasks with machine learning.',
          image: { src: 'https://images.unsplash.com/photo-1677442136019-21780ecad995', alt: 'AI Graphic', hint: 'Brain' }
        }
      ]
    },
    details: [
      {
        slug: 'llm-integration',
        title: 'LLM Integration',
        icon: 'Cpu',
        description: 'Connect your apps to powerful language models like OpenAI or Claude.',
        backgroundImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485',
        subDetails: [
          {
            title: 'Chatbots & Agents',
            description: 'Custom conversational agents for customer support.',
            features: ['RAG', 'Vector Databases', 'Prompt Engineering'],
            benefits: ['24/7 Support', 'Instant Responses']
          }
        ]
      }
    ],
    features: ['Custom AI Models', 'Data Privacy', 'High Availability'],
    benefits: ['Reduce Operational Costs', 'Personalized UX', 'Scale Support'],
    faqs: [
      {
        q: 'Is our data safe when using LLMs?',
        a: 'Yes, we implement enterprise-grade security and can deploy private models to ensure data privacy.'
      }
    ]
  }
];
