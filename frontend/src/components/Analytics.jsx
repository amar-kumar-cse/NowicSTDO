import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';

const GA_TRACKING_ID = 'G-SP3K10LD72';

// Initialize GA4 once
ReactGA.initialize(GA_TRACKING_ID);

/* ─────────────────────────────────────────────────────────────
   Analytics Component — tracks page views on every route change
───────────────────────────────────────────────────────────── */
const Analytics = () => {
  const location = useLocation();

  useEffect(() => {
    ReactGA.send({
      hitType: 'pageview',
      page: location.pathname + location.search,
      title: document.title,
    });
  }, [location]);

  return null;
};

export default Analytics;

/* ─────────────────────────────────────────────────────────────
   trackEvent — General purpose GA4 event tracker
   Usage: trackEvent('Form', 'contact_submit', 'MVP Development')
───────────────────────────────────────────────────────────── */
export const trackEvent = (category, action, label = null) => {
  ReactGA.event({ category, action, label });
};

/* ─────────────────────────────────────────────────────────────
   Conversion Events — High-value business actions
   Call these at exact moments of user intent
───────────────────────────────────────────────────────────── */

/** Contact form successfully submitted */
export const trackContactSubmit = (projectType = '') => {
  ReactGA.event({
    category: 'Conversion',
    action: 'contact_form_submit',
    label: projectType,
  });
};

/** Booking/appointment successfully submitted */
export const trackBookingSubmit = (serviceName = '') => {
  ReactGA.event({
    category: 'Conversion',
    action: 'booking_submit',
    label: serviceName,
  });
};

/** User clicks "Launch Your Project" or any primary CTA */
export const trackCTAClick = (ctaLabel = '', location = '') => {
  ReactGA.event({
    category: 'Engagement',
    action: 'cta_click',
    label: `${ctaLabel} — ${location}`,
  });
};

/** User clicks a portfolio item "Live Demo" or "GitHub" link */
export const trackPortfolioClick = (projectTitle = '', linkType = 'live') => {
  ReactGA.event({
    category: 'Engagement',
    action: 'portfolio_link_click',
    label: `${projectTitle} (${linkType})`,
  });
};

/** User clicks pricing plan / "Get Started" on pricing page */
export const trackPricingClick = (planName = '') => {
  ReactGA.event({
    category: 'Engagement',
    action: 'pricing_plan_click',
    label: planName,
  });
};

/** User starts typing in the contact form (intent signal) */
export const trackFormStart = () => {
  ReactGA.event({
    category: 'Engagement',
    action: 'contact_form_start',
  });
};
