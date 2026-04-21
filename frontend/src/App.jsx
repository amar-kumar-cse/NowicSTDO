import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import SmoothScroll from './components/common/SmoothScroll';
import MainLayout from './layouts/MainLayout';
import NotFound, { AdminNotFound } from './pages/NotFound';

/* Admin */
import AdminLayout from './layouts/AdminLayout';

const Home = lazy(() => import('./pages/Home'));
const Services = lazy(() => import('./pages/Services'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Booking = lazy(() => import('./pages/Booking'));
const ClientDashboard = lazy(() => import('./pages/Dashboard'));

const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const BrandEditor = lazy(() => import('./pages/admin/BrandEditor'));
const ServicesEditor = lazy(() => import('./pages/admin/ServicesEditor'));
const PortfolioEditor = lazy(() => import('./pages/admin/PortfolioEditor'));
const StatsEditor = lazy(() => import('./pages/admin/StatsEditor'));
const AboutEditor = lazy(() => import('./pages/admin/AboutEditor'));
const FAQEditor = lazy(() => import('./pages/admin/FAQEditor'));

export default function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdmin && <SmoothScroll />}
      <Suspense fallback={<div className="min-h-screen bg-[#050806]" />}>
        <Routes>
          {/* Public site */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/dashboard" element={<ClientDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Admin CMS */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="brand" element={<BrandEditor />} />
            <Route path="services" element={<ServicesEditor />} />
            <Route path="portfolio" element={<PortfolioEditor />} />
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
