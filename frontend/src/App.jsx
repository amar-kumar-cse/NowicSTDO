import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import SmoothScroll from './components/common/SmoothScroll';
import Analytics from './components/Analytics';
import LiveChat from './components/LiveChat';
import MainLayout from './layouts/MainLayout';
import NotFound, { AdminNotFound } from './pages/NotFound';

/* Admin */
import AdminLayout from './layouts/AdminLayout';

const Home = lazy(() => import('./pages/Home'));
const Services = lazy(() => import('./pages/Services'));
const ServiceDetail = lazy(() => import('./pages/ServiceDetail'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const PortfolioDetail = lazy(() => import('./pages/PortfolioDetail'));
const CaseStudies = lazy(() => import('./pages/CaseStudies'));
const CaseStudyDetail = lazy(() => import('./pages/CaseStudyDetail'));
const Pricing = lazy(() => import('./pages/Pricing'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Booking = lazy(() => import('./pages/Booking'));
const ClientDashboard = lazy(() => import('./pages/Dashboard'));
const SubmitReview = lazy(() => import('./pages/SubmitReview'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPostDetail = lazy(() => import('./pages/BlogPostDetail'));
const Technologies = lazy(() => import('./pages/Technologies'));
const TechnologyDetail = lazy(() => import('./pages/TechnologyDetail'));
const IndustryDetail = lazy(() => import('./pages/IndustryDetail'));
const SolutionDetail = lazy(() => import('./pages/SolutionDetail'));
const FAQs = lazy(() => import('./pages/FAQs'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));

const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const LeadsManagement = lazy(() => import('./pages/admin/LeadsManagement'));
const ProjectsManagement = lazy(() => import('./pages/admin/ProjectsManagement'));
const UsersManagement = lazy(() => import('./pages/admin/UsersManagement'));
const InvoicesManagement = lazy(() => import('./pages/admin/InvoicesManagement'));
const BrandEditor = lazy(() => import('./pages/admin/BrandEditor'));
const ServicesEditor = lazy(() => import('./pages/admin/ServicesEditor'));
const PortfolioEditor = lazy(() => import('./pages/admin/PortfolioEditor'));
const StatsEditor = lazy(() => import('./pages/admin/StatsEditor'));
const AboutEditor = lazy(() => import('./pages/admin/AboutEditor'));
const FAQEditor = lazy(() => import('./pages/admin/FAQEditor'));
const TechnologiesEditor = lazy(() => import('./pages/admin/TechnologiesEditor'));
const ReviewsManagement = lazy(() => import('./pages/admin/ReviewsManagement'));
const BlogManagement = lazy(() => import('./pages/admin/BlogManagement'));
const BlogEditor = lazy(() => import('./pages/admin/BlogEditor'));
const PricingEditor = lazy(() => import('./pages/admin/PricingEditor'));

import { Toaster } from 'sonner';

export default function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  useEffect(() => {
    // Fallback: Dispatch event after 10s to prevent Puppeteer 30s timeout on static routes
    const timer = setTimeout(() => {
      document.dispatchEvent(new Event('prerender-trigger'));
    }, 10000);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      <Analytics />
      <LiveChat />
      <Toaster theme="dark" position="bottom-right" richColors />
      {!isAdmin && <SmoothScroll />}
      <Suspense fallback={<div className="min-h-screen bg-[#050806]" />}>
        <Routes>
          {/* Public site */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:slug" element={<ServiceDetail />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/portfolio/:slug" element={<PortfolioDetail />} />
            <Route path="/case-studies" element={<Navigate to="/portfolio" replace />} />
            <Route path="/case-studies/:slug" element={<PortfolioDetail />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/dashboard" element={<ClientDashboard />} />
            <Route path="/review" element={<SubmitReview />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPostDetail />} />
            <Route path="/technologies" element={<Technologies />} />
            <Route path="/technologies/:slug" element={<TechnologyDetail />} />
            <Route path="/industries/:slug" element={<IndustryDetail />} />
            <Route path="/solutions/:slug" element={<SolutionDetail />} />
            <Route path="/faqs" element={<FAQs />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Admin CMS */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="leads" element={<LeadsManagement />} />
            <Route path="projects" element={<ProjectsManagement />} />
            <Route path="users" element={<UsersManagement />} />
            <Route path="invoices" element={<InvoicesManagement />} />
            <Route path="reviews" element={<ReviewsManagement />} />
            <Route path="brand" element={<BrandEditor />} />
            <Route path="services" element={<ServicesEditor />} />
            <Route path="pricing" element={<PricingEditor />} />
            <Route path="technologies" element={<TechnologiesEditor />} />
            <Route path="portfolio" element={<PortfolioEditor />} />
            <Route path="blog" element={<BlogManagement />} />
            <Route path="blog/new" element={<BlogEditor />} />
            <Route path="blog/edit/:id" element={<BlogEditor />} />
            <Route path="stats" element={<StatsEditor />} />
            <Route path="about" element={<AboutEditor />} />
            <Route path="faqs" element={<FAQEditor />} />
            <Route path="*" element={<AdminNotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}
