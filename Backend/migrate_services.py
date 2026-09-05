import os
import django
import sys
import json

# Setup Django Environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings.base")
django.setup()

from apps.public.models import SiteContent

def slugify(text):
    return text.lower().replace(' ', '-').replace('&', '').replace('---', '-').strip()

# Hardcoded data from serviceDetails.js
rich_data = {
  'mvp-development': {
    'startingPrice': 2499,
    'timeline': 28,
    'keyTech': ['React', 'Next.js', 'Django', 'PostgreSQL', 'Clerk'],
    'benefits': [
      'Launch in 2-4 weeks instead of months',
      'Focus on core features that drive value',
      'Clean, maintainable codebase ready for future scaling',
      'Investor-ready UI/UX out of the box'
    ],
    'features': [
      'Rapid Prototyping & Wireframing',
      'Core Business Logic Implementation',
      'Secure User Authentication & RBAC',
      'Payment Gateway Integration (Stripe)',
      'Basic Analytics & User Tracking',
      'Cloud Deployment & Hosting Setup'
    ],
    'faqs': [
      { 'q': 'How long does an MVP take to build?', 'a': 'Typically 2-4 weeks depending on the complexity of your core features.' },
      { 'q': 'Will I own the code?', 'a': 'Yes, 100%. Upon final payment, all intellectual property and source code is transferred to you.' },
      { 'q': 'Can we add features later?', 'a': 'Absolutely. Our MVPs are built on scalable architectures like React and Django, making it easy to add features later.' }
    ]
  },
  'business-websites': {
    'startingPrice': 1499,
    'timeline': 14,
    'keyTech': ['React', 'Next.js', 'Tailwind CSS', 'Vercel'],
    'benefits': [
      'Perfect 100/100 Lighthouse Performance Scores',
      'Built-in Technical SEO for higher rankings',
      'Responsive design that looks stunning on any device',
      'Easy-to-use CMS for content updates'
    ],
    'features': [
      'Custom UI/UX Design (No generic templates)',
      'High-Performance React/Next.js/Vite Frontend',
      'Dynamic Content Management (CMS integration)',
      'Lead Generation Forms & CRM Sync',
      'Fast Image Optimization & Global CDN',
      'Web Analytics Setup'
    ],
    'faqs': [
      { 'q': 'Do you use WordPress?', 'a': 'We typically use modern frameworks like React/Next.js paired with headless CMS (like Sanity or Strapi) for vastly superior performance and security.' },
      { 'q': 'Are your websites SEO friendly?', 'a': 'Yes. We implement technical SEO best practices, meta tags, schema markup, and optimal site structures from day one.' }
    ]
  },
  'ai-web-apps': {
    'startingPrice': 3999,
    'timeline': 21,
    'keyTech': ['OpenAI', 'Claude', 'LangChain', 'Pinecone', 'pgvector'],
    'benefits': [
      'Automate tedious tasks and workflows',
      'Provide 24/7 intelligent customer support',
      'Unlock insights from your raw data',
      'Create personalized user experiences at scale'
    ],
    'features': [
      'OpenAI / Anthropic API Integrations',
      'Custom Contextual Chatbots',
      'RAG (Retrieval-Augmented Generation) Systems',
      'AI-Powered Content Generation',
      'Semantic Search & Vector Databases',
      'Automated Data Processing Pipelines'
    ],
    'faqs': [
      { 'q': 'Can you integrate AI into my existing app?', 'a': 'Yes, we can build custom APIs and microservices to add AI capabilities to your current stack.' },
      { 'q': 'Is my data secure when using AI APIs?', 'a': 'We follow strict data privacy guidelines and use enterprise API endpoints that do not train on your private data.' }
    ]
  },
  'admin-dashboards': {
    'startingPrice': 5000,
    'timeline': 21,
    'keyTech': ['React', 'Django', 'PostgreSQL', 'Chart.js'],
    'benefits': [
      'Visualize complex data with beautiful charts',
      'Streamline internal team workflows',
      'Make data-driven decisions faster',
      'Securely manage user access and permissions'
    ],
    'features': [
      'Real-Time Analytics & Data Visualization',
      'Complex Data Grids with Filtering & Export',
      'Granular Role-Based Access Control (RBAC)',
      'Custom CRM & User Management Flows',
      'Audit Logging & Activity Tracking',
      'Dark/Light Mode UI Options'
    ],
    'faqs': [
      { 'q': 'Can the dashboard connect to my existing database?', 'a': 'Yes, we can build the dashboard to interface with your existing PostgreSQL, MySQL, MongoDB, or third-party APIs.' },
      { 'q': 'Is it mobile-friendly?', 'a': 'While dashboards are typically used on desktop, we ensure they are fully responsive and functional on tablets and mobile devices.' }
    ]
  },
  'saas-platforms': {
    'startingPrice': 5999,
    'timeline': 45,
    'keyTech': ['React', 'Next.js', 'Django', 'Stripe', 'PostgreSQL'],
    'benefits': [
      'Enterprise-grade security and architecture',
      'Seamless subscription and billing management',
      'Scalable infrastructure ready for thousands of users',
      'High availability and performance'
    ],
    'features': [
      'Secure Multi-Tenant Architecture',
      'Stripe/Razorpay Subscription & Billing Integration',
      'Advanced User Authentication & Team Workspaces',
      'Automated Email & Notification Systems',
      'Usage Tracking & Quota Management',
      'RESTful/GraphQL API for external integrations'
    ],
    'faqs': [
      { 'q': 'How do you handle subscriptions?', 'a': 'We typically integrate with Stripe for robust, secure handling of recurring billing, upgrades, and invoices.' },
      { 'q': 'What happens if we get a sudden spike in traffic?', 'a': 'Our architectures are designed for horizontal scaling, utilizing cloud services to automatically handle traffic spikes.' }
    ]
  },
  'api-backend': {
    'startingPrice': 4000,
    'timeline': 21,
    'keyTech': ['Django Ninja', 'Node.js', 'Express', 'PostgreSQL', 'Redis'],
    'benefits': [
      'Lightning-fast response times',
      'Secure against common vulnerabilities',
      'Easy for frontend developers to consume',
      'Built to scale with your business'
    ],
    'features': [
      'RESTful & GraphQL API Design',
      'Django (Python) or Node.js Backend Servers',
      'Relational (PostgreSQL) & NoSQL (MongoDB) Database Design',
      'Redis Caching & Background Task Queues (Celery/Bull)',
      'Comprehensive API Documentation (Swagger/OpenAPI)',
      'Third-party API Integrations'
    ],
    'faqs': [
      { 'q': 'Do you provide API documentation?', 'a': 'Yes, we always deliver comprehensive interactive documentation (like Swagger/OpenAPI) for seamless frontend integration.' },
      { 'q': 'Which backend technology is best?', 'a': 'It depends on your requirements. We often recommend Django (Python) for rapid, secure development, and Node.js for high-concurrency real-time apps.' }
    ]
  }
}

def migrate():
    try:
        sc = SiteContent.objects.get(section='services')
        services = sc.data
        
        for s in services:
            slug = slugify(s.get('title', ''))
            if slug in rich_data:
                rich = rich_data[slug]
                s['price_starting'] = s.get('price_starting') or rich.get('startingPrice')
                s['delivery_days'] = s.get('delivery_days') or rich.get('timeline')
                s['keyTech'] = rich.get('keyTech')
                s['benefits'] = rich.get('benefits')
                s['faqs'] = rich.get('faqs')
                # Optional: Overwrite features if they are empty
                if not s.get('features') or all(f.strip() == '' for f in s.get('features')):
                    s['features'] = rich.get('features')
                    
        sc.data = services
        sc.save()
        print("Successfully migrated services data to SiteContent!")
    except Exception as e:
        print(f"Error migrating: {e}")

if __name__ == "__main__":
    migrate()
