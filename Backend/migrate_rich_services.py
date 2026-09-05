import os
import django
import sys
import uuid
import json

# Setup Django Environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings.base")
django.setup()

from apps.public.models import SiteContent

rich_services = [
    {
        "id": f"service-{uuid.uuid4().hex[:8]}",
        "slug": "website-development",
        "icon": "Globe",
        "title": "Website Development",
        "headline": "Beautiful, Functional, and High-Performing Websites.",
        "description": "Showcase your business online with a professional, user-friendly, and search engine-optimized website that captivates visitors and drives results.",
        "price_starting": 1499,
        "delivery_days": 14,
        "features": ["Fully unique designs", "Scalable architecture", "Responsive layouts"],
        "image_url": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxjb2RlfGVufDB8fHx8MTc0ODQwMzYwMHww&ixlib=rb-4.1.0&q=80&w=1080",
        "heroContent": {
            "title": "Website Development",
            "subtitle": "Your Online Identity Starts Here: Beautiful, Functional, and High-Performing Websites.",
            "description": "Showcase your business online with a professional, user-friendly, and search engine-optimized website that captivates visitors and drives results.",
            "image": {
                "src": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxjb2RlfGVufDB8fHx8MTc0ODQwMzYwMHww&ixlib=rb-4.1.0&q=80&w=1080",
                "alt": "Code on a screen",
                "hint": "development"
            }
        },
        "introduction": "In today's digital marketplace, a robust online presence is a necessity. A well-crafted website serves as your brand's digital storefront, enhancing credibility and generating leads. We specialize in building websites that are not just visually stunning but also technically robust, secure, and scalable. Our custom solutions are powered by the latest technologies and user-centric design principles to transform your vision into a high-performing digital asset.",
        "subServices": [
            { "title": "Custom Website Development", "description": "Bespoke websites tailored to your unique business requirements, branding, and user expectations for a standout online experience.", "icon": "Code2", "features": ["Fully unique designs", "Scalable architecture", "Secure coding practices", "Responsive layouts"] },
            { "title": "E-commerce Website Development", "description": "Build powerful online stores that streamline transactions, manage inventory, and foster customer loyalty.", "icon": "Globe", "features": ["Payment gateway integrations", "Product catalog management", "Secure checkout", "Inventory tracking"] },
            { "title": "CMS Development", "description": "Empower your team to manage content effortlessly with robust Content Management Systems.", "icon": "LayoutDashboard", "features": ["Drag-and-drop interfaces", "Plugin integrations", "User roles", "Headless CMS options"] },
            { "title": "Responsive Web Design", "description": "Create adaptive websites that deliver flawless experiences across all devices.", "icon": "Sparkles", "features": ["Mobile-first design", "Fluid layouts", "Optimized media", "Cross-browser testing"] }
        ],
        "process": [
            { "step": "01", "title": "Requirement Gathering", "description": "We conduct in-depth discovery sessions to map your business goals and technical specs." },
            { "step": "02", "title": "Information Architecture", "description": "Architect the site's structure and create low-fidelity wireframes based on feedback." },
            { "step": "03", "title": "UI/UX Design", "description": "Translate concepts into high-fidelity mockups focusing on branding and accessibility." },
            { "step": "04", "title": "Development", "description": "Parallel front-end and back-end coding in sprints with daily stand-ups." },
            { "step": "05", "title": "Testing", "description": "Rigorous QA across functionalities, compatibility, performance, and security." },
            { "step": "06", "title": "Deployment", "description": "Secure go-live on preferred hosting with staging for final approvals." }
        ],
        "whyChooseUs": [
            { "icon": "Cpu", "title": "Expert Developers", "description": "Dedicated team of full-stack developers specializing in innovative builds." },
            { "icon": "Zap", "title": "Modern Technologies", "description": "Leveraging cutting-edge stacks like JAMstack and PWAs." },
            { "icon": "TrendingUp", "title": "SEO-Friendly", "description": "On-page optimization from day one for fast indexing." },
            { "icon": "ShieldCheck", "title": "Security Focus", "description": "Fortress-level protection reducing breach risks." }
        ],
        "faqs": [
            { "q": "What is the typical process for a website development project?", "a": "Our process starts with a discovery phase to understand your goals, followed by UI/UX design, development, testing, and launch." },
            { "q": "How long does it take to build a website?", "a": "A standard marketing website takes 4-8 weeks, while complex web applications take 3-6 months." },
            { "q": "Will my website be mobile-friendly?", "a": "Absolutely. We follow a mobile-first design approach ensuring perfect function on all devices." },
            { "q": "Do you provide ongoing maintenance and support?", "a": "Yes, we offer maintenance packages to keep your site secure and optimized." }
        ]
    },
    {
        "id": f"service-{uuid.uuid4().hex[:8]}",
        "slug": "mobile-app-development",
        "icon": "Rocket",
        "title": "Mobile App Development",
        "headline": "Transforming Ideas into Intuitive Mobile Experiences",
        "description": "Deliver seamless user experiences with our expert mobile app development services for iOS, Android, and cross-platform solutions.",
        "price_starting": 3999,
        "delivery_days": 45,
        "features": ["iOS & Android Apps", "React Native & Flutter", "UI/UX Prototyping"],
        "image_url": "https://images.unsplash.com/photo-1551739440-5dd934d3a94a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBkZXZlbG9wbWVudHxlbnwwfHx8fDE3NDg0MDM2MDB8MA&ixlib=rb-4.1.0&q=80&w=1080",
        "heroContent": {
            "title": "Mobile App Development",
            "subtitle": "Your Vision, Our Code: Crafting Cutting-Edge Mobile Applications.",
            "description": "Deliver seamless user experiences and drive business growth with our expert mobile app development services.",
            "image": {
                "src": "https://images.unsplash.com/photo-1551739440-5dd934d3a94a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBkZXZlbG9wbWVudHxlbnwwfHx8fDE3NDg0MDM2MDB8MA&ixlib=rb-4.1.0&q=80&w=1080",
                "alt": "Mobile app interface",
                "hint": "mobile development"
            }
        },
        "introduction": "In the digital age of 2025, a powerful mobile app can propel your business to new heights. We specialize in crafting innovative, performance-optimized mobile applications.",
        "subServices": [
            { "title": "iOS App Development", "description": "High-performance iOS apps.", "icon": "Rocket", "features": ["Human Interface Guidelines", "Performance optimization"] },
            { "title": "Android App Development", "description": "Versatile Android apps.", "icon": "Bot", "features": ["Material Design 3", "Device compatibility testing"] },
            { "title": "Cross-Platform Development", "description": "Accelerate go-to-market.", "icon": "Layers", "features": ["React Native", "Flutter"] },
            { "title": "PWAs", "description": "Progressive Web Apps.", "icon": "Globe", "features": ["Offline capabilities", "Push notifications"] }
        ],
        "process": [
            { "step": "01", "title": "Discovery", "description": "Define MVPs and monetization models." },
            { "step": "02", "title": "UI/UX", "description": "Wireframes and high-fidelity mockups." },
            { "step": "03", "title": "Development", "description": "Sprints focusing on front-end and back-end." },
            { "step": "04", "title": "Testing", "description": "QA including end-to-end automation." }
        ],
        "whyChooseUs": [
            { "icon": "Cpu", "title": "Experienced Team", "description": "Certified developers and designers." },
            { "icon": "Zap", "title": "Cutting-Edge", "description": "Latest frameworks and tools." }
        ],
        "faqs": [
            { "q": "How long does it take?", "a": "2-3 months for simple, 6+ for complex." },
            { "q": "Will it be published?", "a": "Yes, we handle App Store submissions." }
        ]
    },
    {
        "id": f"service-{uuid.uuid4().hex[:8]}",
        "slug": "custom-software-development",
        "icon": "Code2",
        "title": "Custom Software Development",
        "headline": "Engineered for Excellence.",
        "description": "Scalable, secure software solutions designed exclusively for your business.",
        "price_starting": 5999,
        "delivery_days": 60,
        "features": ["Enterprise Software", "API Development", "Legacy Modernization"],
        "image_url": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxzb2Z0d2FyZSUyMGRldmVsb3BtZW50fGVufDB8fHx8MTc0ODQwMzYwMHww&ixlib=rb-4.1.0&q=80&w=1080",
        "heroContent": {
            "title": "Custom Software",
            "subtitle": "Tailored Innovation for Unique Needs",
            "description": "Transform challenges into scalable solutions.",
            "image": {
                "src": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxzb2Z0d2FyZSUyMGRldmVsb3BtZW50fGVufDB8fHx8MTc0ODQwMzYwMHww&ixlib=rb-4.1.0&q=80&w=1080",
                "alt": "Code",
                "hint": "software"
            }
        },
        "introduction": "We translate your vision into robust, scalable code that complies with industry standards.",
        "subServices": [
            { "title": "Enterprise Software", "description": "Build comprehensive, modular enterprise apps.", "icon": "Building2", "features": ["Full-stack development", "Workflow automation"] },
            { "title": "Web Apps", "description": "Dynamic, responsive web apps.", "icon": "Globe", "features": ["SPA frameworks", "API-first design"] },
            { "title": "API & Backend", "description": "Scalable backends.", "icon": "LayoutDashboard", "features": ["Serverless", "Event-driven architecture"] }
        ],
        "process": [
            { "step": "01", "title": "Planning", "description": "Requirements and scope." },
            { "step": "02", "title": "Prototyping", "description": "Wireframing and blueprints." },
            { "step": "03", "title": "Sprints", "description": "Bi-weekly cycles." },
            { "step": "04", "title": "Deployment", "description": "Automated deployments." }
        ],
        "whyChooseUs": [
            { "icon": "ShieldCheck", "title": "Security-First", "description": "Zero-trust models." },
            { "icon": "Cpu", "title": "Expertise", "description": "15+ years experience." }
        ],
        "faqs": [
            { "q": "Do I own the code?", "a": "Yes, 100% ownership upon final payment." }
        ]
    },
    {
        "id": f"service-{uuid.uuid4().hex[:8]}",
        "slug": "seo-and-digital-marketing",
        "icon": "Gauge",
        "title": "SEO & Digital Marketing",
        "headline": "Maximize Your Online Reach.",
        "description": "Get discovered online: Drive traffic, generate leads, and boost sales.",
        "price_starting": 999,
        "delivery_days": 30,
        "features": ["Keyword Research", "On-page SEO", "Pay-Per-Click Ads"],
        "image_url": "https://images.unsplash.com/photo-1563986768609-322da13575f3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxtYXJrZXRpbmclMjBhbmFseXRpY3N8ZW58MHx8fHwxNzQ4NDAzNjAwfDA&ixlib=rb-4.1.0&q=80&w=1080",
        "heroContent": {
            "title": "Digital Marketing",
            "subtitle": "Get Discovered Online.",
            "description": "Drive traffic and accelerate growth.",
            "image": {
                "src": "https://images.unsplash.com/photo-1563986768609-322da13575f3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxtYXJrZXRpbmclMjBhbmFseXRpY3N8ZW58MHx8fHwxNzQ4NDAzNjAwfDA&ixlib=rb-4.1.0&q=80&w=1080",
                "alt": "Marketing",
                "hint": "marketing"
            }
        },
        "introduction": "Empower your business to climb search results and generate ROI.",
        "subServices": [
            { "title": "SEO", "description": "Elevate organic traffic.", "icon": "Globe", "features": ["Keyword research", "Link-building"] },
            { "title": "SMM", "description": "Amplify brand awareness.", "icon": "Users", "features": ["Content creation", "Targeted ads"] },
            { "title": "PPC", "description": "Instant visibility.", "icon": "Gauge", "features": ["Google Ads", "Landing page optimization"] }
        ],
        "process": [
            { "step": "01", "title": "Strategy", "description": "Audit and personalized roadmap." },
            { "step": "02", "title": "Optimization", "description": "Real-time monitoring." }
        ],
        "whyChooseUs": [
            { "icon": "Sparkles", "title": "Data-Driven", "description": "A/B testing and analytics." }
        ],
        "faqs": [
            { "q": "How long until results?", "a": "Typically 4-6 months for SEO." }
        ]
    },
    {
        "id": f"service-{uuid.uuid4().hex[:8]}",
        "slug": "graphics-design",
        "icon": "Sparkles",
        "title": "Graphics Design",
        "headline": "Make a Lasting Impression.",
        "description": "Stunning visuals for your brand identity.",
        "price_starting": 499,
        "delivery_days": 7,
        "features": ["Logo Design", "UI/UX", "Social Media Graphics"],
        "image_url": "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxncmFwaGljJTIwZGVzaWdufGVufDB8fHx8MTc0ODQwMzYwMHww&ixlib=rb-4.1.0&q=80&w=1080",
        "heroContent": {
            "title": "Graphic Design",
            "subtitle": "Visualizing Your Brand",
            "description": "Strengthen your brand identity.",
            "image": {
                "src": "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxncmFwaGljJTIwZGVzaWdufGVufDB8fHx8MTc0ODQwMzYwMHww&ixlib=rb-4.1.0&q=80&w=1080",
                "alt": "Design",
                "hint": "design"
            }
        },
        "introduction": "Professional graphics that captivate and convert.",
        "subServices": [
            { "title": "Logo & Brand", "description": "Memorable logos.", "icon": "Star", "features": ["Vector files", "Brand guide"] },
            { "title": "UI/UX", "description": "Intuitive interfaces.", "icon": "Layers", "features": ["Wireframing", "Prototypes"] }
        ],
        "process": [
            { "step": "01", "title": "Research", "description": "Analyze audience." },
            { "step": "02", "title": "Feedback", "description": "Iterative revisions." }
        ],
        "whyChooseUs": [
            { "icon": "Users", "title": "Collaborative", "description": "You co-create with us." }
        ],
        "faqs": [
            { "q": "What files do I get?", "a": "Source files, vectors, and PNGs." }
        ]
    },
    {
        "id": f"service-{uuid.uuid4().hex[:8]}",
        "slug": "ai-services",
        "icon": "Bot",
        "title": "AI Services",
        "headline": "Pioneering Intelligent Futures.",
        "description": "Innovate, Automate, and Scale with Intelligent Solutions.",
        "price_starting": 6999,
        "delivery_days": 30,
        "features": ["LLM Integration", "Predictive Analytics", "Custom Chatbots"],
        "image_url": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlfGVufDB8fHx8MTc0ODQwMzYwMHww&ixlib=rb-4.1.0&q=80&w=1080",
        "heroContent": {
            "title": "AI Services",
            "subtitle": "Unlock AI's Potential",
            "description": "Empower your organization with cutting-edge AI services.",
            "image": {
                "src": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlfGVufDB8fHx8MTc0ODQwMzYwMHww&ixlib=rb-4.1.0&q=80&w=1080",
                "alt": "AI",
                "hint": "artificial intelligence"
            }
        },
        "introduction": "AI is the bedrock of modern services, catalyzing innovation.",
        "subServices": [
            { "title": "AI Consulting", "description": "Bespoke roadmaps.", "icon": "Gauge", "features": ["Strategy Advisory", "Governance"] },
            { "title": "Development", "description": "Generative AI implementations.", "icon": "Code2", "features": ["Fine-tuning", "Neural Networks"] },
            { "title": "Data Analytics", "description": "AI-ready pipelines.", "icon": "Cpu", "features": ["Predictive analysis", "Big Data"] }
        ],
        "process": [
            { "step": "01", "title": "Discovery", "description": "Map pain points." },
            { "step": "02", "title": "Prototyping", "description": "Low-code PoCs." }
        ],
        "whyChooseUs": [
            { "icon": "ShieldCheck", "title": "Ethical AI", "description": "Zero tolerance for bias." }
        ],
        "faqs": [
            { "q": "Can you integrate with existing systems?", "a": "Absolutely, seamless integration with APIs." }
        ]
    }
]

def migrate():
    try:
        sc, created = SiteContent.objects.get_or_create(section='services', defaults={'data': []})
        sc.data = rich_services
        sc.save()
        print("Successfully migrated rich services data to SiteContent!")
    except Exception as e:
        print(f"Error migrating: {e}")

if __name__ == "__main__":
    migrate()
