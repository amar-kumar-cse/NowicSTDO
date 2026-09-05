import { useEffect as usePrerenderEffect } from 'react';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, CheckCircle2, Clock, Zap, MessageCircle, Calendar, ArrowRight, Rocket } from 'lucide-react';
import SEO from '../components/SEO';
import SectionHeading from '../components/common/SectionHeading';
import ScrollReveal from '../components/reveal/ScrollReveal';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { useContent } from '../context/ContentContext';
import { api } from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { brand, services as fallbackServices } from '../data/content';
import { toast } from 'sonner';

const promise = [
  { icon: Clock, text: 'Response within 24 hours' },
  { icon: CheckCircle2, text: 'Free project roadmap included' },
  { icon: Zap, text: 'No-commitment discovery call' },
  { icon: MessageCircle, text: 'Direct access to founders' },
];

// Choices are now fetched from the API to ensure consistency with backend taxonomy.
const DEFAULT_PROJECT_TYPES = [
  { label: 'MVP Development', value: 'mvp_development' },
  { label: 'Business Website', value: 'business_website' },
  { label: 'AI Web App', value: 'ai_web_app' },
  { label: 'Admin Dashboard', value: 'admin_dashboard' },
  { label: 'SaaS Platform', value: 'saas_platform' },
  { label: 'API / Backend', value: 'api_backend' },
  { label: 'Other', value: 'other' }
];

const DEFAULT_BUDGET_OPTIONS = [
  { label: 'Under ₹50K', value: 'under_50k' },
  { label: '₹50K–2L', value: '50k_2lac' },
  { label: '₹2L–5L', value: '2lac_5lac' },
  { label: 'Above ₹5L', value: 'above_5lac' }
];

import { trackContactSubmit, trackFormStart } from '../components/Analytics';

export default function Contact() {
  const { content, loading } = useContent();

  usePrerenderEffect(() => {
    if (!loading) {
      setTimeout(() => document.dispatchEvent(new Event('prerender-trigger')), 150);
    }
  }, [loading]);

  const services = content?.services || [];
  const servicesLoading = loading;
  const servicesError = null;

  const [choices, setChoices] = useState({ project_types: DEFAULT_PROJECT_TYPES, budget_options: DEFAULT_BUDGET_OPTIONS });
  const [choicesLoading, setChoicesLoading] = useState(true);

  useEffect(() => {
    api.getContactChoices()
      .then(res => {
        if (res.success) setChoices(res.data);
        else {
          setChoices({ project_types: DEFAULT_PROJECT_TYPES, budget_options: DEFAULT_BUDGET_OPTIONS });
        }
      })
      .catch(err => {
        console.error('Failed to load contact choices:', err);
        setChoices({ project_types: DEFAULT_PROJECT_TYPES, budget_options: DEFAULT_BUDGET_OPTIONS });
      })
      .finally(() => setChoicesLoading(false));
  }, []);

  const liveBrand = content?.brand || brand;

  const contactInfo = [
    { icon: Mail, label: 'Email', value: liveBrand.email || 'hello@nowicstudio.com', href: `mailto:${liveBrand.email || 'hello@nowicstudio.com'}` },
    { icon: Phone, label: 'Phone', value: liveBrand.phone || '+91 98765 43210', href: `tel:${(liveBrand.phone || '+91 98765 43210').replace(/\D/g, '')}` },
    { icon: MapPin, label: 'Location', value: liveBrand.location || 'India 🇮🇳', href: '#' },
  ];

  const [form, setForm] = useState({ name: '', email: '', project_type: '', message: '', phone: '', budget: '', service_slug: '', website: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (form.phone && form.phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'Enter a valid 10-digit number';
    }
    if (!form.project_type) newErrors.project_type = 'Please select a project type';
    if (!form.message.trim()) {
      newErrors.message = 'Please describe your project';
    } else if (form.message.length < 20) {
      newErrors.message = 'Minimum 20 characters required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const hasStartedForm = useRef(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    // Clear error when user types
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    // Track form start intent (only once per session)
    if (!hasStartedForm.current) {
      hasStartedForm.current = true;
      trackFormStart();
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;

    setStatus('loading');
    setErrorMsg('');

    try {
      await api.submitContact({
        name: form.name.trim(),
        email: form.email.trim(),
        project_type: form.project_type || 'other',
        message: form.message.trim(),
        phone: form.phone ? form.phone.replace(/\D/g, '') : undefined,
        budget: form.budget || undefined,
        service_slug: form.service_slug || undefined,
        website: form.website,
      });
      setStatus('success');
      toast.success('Inquiry received! 🎉', { description: 'We will respond within 24 hours.' });
      setForm({ name: '', email: '', project_type: '', message: '', phone: '', budget: '', service_slug: '' });

      // GA4 — Conversion event (shows in Goals)
      trackContactSubmit(form.project_type);
    } catch (err) {
      setStatus('error');
      if (err.name === 'ApiError' && err.data?.errors) {
        // Map Django field errors to frontend error state
        const fieldErrors = {};
        Object.entries(err.data.errors).forEach(([field, msgs]) => {
          fieldErrors[field] = Array.isArray(msgs) ? msgs[0] : msgs;
        });
        setErrors(fieldErrors);
        setErrorMsg('Please check the highlighted fields.');
        toast.error('Validation Error', { description: 'Please check the highlighted fields.' });
      } else {
        const msg = err.message || 'Something went wrong';
        setErrorMsg(msg);
        toast.error('Submission Failed', { description: msg });
      }
    }
  }

  const apiServices = Array.isArray(services) ? [...services].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) : [];
  const orderedServices = apiServices.length
    ? apiServices
    : fallbackServices.map((service, index) => ({
      slug: (service.title || `service-${index + 1}`).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      name: service.title,
    }));

  const contactSchema = [
    {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "name": "Contact Nowic Studio",
      "url": "https://www.nowicstdio.tech/contact",
      "description": "Get in touch with Nowic Studio to discuss your software project. We respond within 24 hours.",
      "mainEntity": {
        "@type": "Organization",
        "name": "Nowic Studio",
        "url": "https://www.nowicstdio.tech",
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "sales",
          "email": liveBrand.email || "nowicstdo@gmail.com",
          "telephone": liveBrand.phone || "+91 98765 43210",
          "areaServed": ["IN", "US", "AE", "GB"],
          "availableLanguage": ["English", "Hindi"],
          "hoursAvailable": {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            "opens": "09:00",
            "closes": "18:00"
          }
        }
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.nowicstdio.tech/" },
        { "@type": "ListItem", "position": 2, "name": "Contact", "item": "https://www.nowicstdio.tech/contact" }
      ]
    }
  ];

  return (
    <>
      <SEO 
        title="Contact Us — Start Your Software Project | Nowic Studio"
        description="Get in touch with Nowic Studio to discuss your next project. We respond within 24 hours with a clear roadmap, timeline, and budget. Free discovery call included."
        canonicalUrl="https://www.nowicstdio.tech/contact"
        keywords="contact Nowic Studio, hire software developer, get a quote software development, start a project, software development inquiry, book a call developer"
        schema={contactSchema}
      />
      {/* Hero */}
      <section className="relative py-20">
        <div
          className="pointer-events-none absolute inset-x-0 -top-20 h-60"
          style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(52,217,154,0.06) 0%, transparent 70%)' }}
        />
        <div className="container-shell relative">
          <Breadcrumbs items={[{ label: 'Contact', path: '/contact' }]} />
          <SectionHeading
            as="h1"
            eyebrow="Start a Project"
            title="Let's build something |extraordinary|"
            description="Got an idea? We'll provide a clear roadmap, technical strategy, and budget within 24 hours."
          />
        </div>
      </section>

      {/* Main */}
      <section className="container-shell pb-20">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">

          {/* Left */}
          <div className="space-y-4">
            <ScrollReveal>
              <div className="card p-6">
                <h3 className="font-display text-lg font-bold text-text">Get In Touch</h3>
                <p className="mt-1.5 text-sm text-sub">Reach out — we're happy to help.</p>
                <div className="mt-5 space-y-3">
                  {contactInfo.map(({ icon: Icon, label, value, href }) => (
                    <a
                      key={label}
                      href={href}
                      className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-surface"
                    >
                      <div className="icon-box shrink-0 h-9 w-9">
                        <Icon size={15} />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-muted">{label}</p>
                        <p className="text-sm font-medium text-text">{value}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.06}>
              <div className="card p-6">
                <h3 className="font-display text-sm font-bold text-text">Our Promise</h3>
                <ul className="mt-4 space-y-2.5">
                  {promise.map(({ icon: Icon, text }) => (
                    <li key={text} className="flex items-center gap-2.5 text-sm text-sub">
                      <Icon size={14} className="shrink-0 text-mint" />
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="rounded-xl bg-surface p-4 text-center" style={{ border: '1px solid #1e2028' }}>
                <p className="flex items-center justify-center gap-2 text-sm font-medium text-text">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-50" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-mint" />
                  </span>
                  Accepting new projects
                </p>
                <p className="mt-1 text-xs text-muted">Limited slots for Q2 2026</p>
              </div>
            </ScrollReveal>

            {/* ── Book a Call Card ── */}
            <ScrollReveal delay={0.14}>
              <div className="relative overflow-hidden rounded-2xl border border-mint/20 bg-[#0b100d] p-5">
                {/* glow */}
                <div className="pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full bg-mint/10 blur-2xl" />
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mint/10 text-mint">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-mint">Prefer to Talk Directly?</p>
                    <h4 className="mt-1 font-display text-base font-bold text-text leading-snug">Book a 1-on-1 Strategy Call</h4>
                    <p className="mt-1.5 text-xs leading-relaxed text-sub">
                      Skip the wait — choose a slot and speak directly with our founder to map out your project roadmap.
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                  <div className="text-xs text-sub">
                    <span className="block font-semibold text-text">Discovery Session</span>
                    <span>15–30 min • No commitment</span>
                  </div>
                  <Link
                    to="/booking"
                    className="group flex items-center gap-1.5 rounded-lg bg-mint px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-bg transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(52,217,154,0.3)]"
                  >
                    Secure Slot <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Right — Form */}
          <ScrollReveal delay={0.05}>
            {status !== 'success' ? (
              <div className="grid gap-0 w-full lg:max-w-[400px] mx-auto lg:ml-auto mb-4">
                {/* Cart Form */}
                <div className="card bg-[#0e0f14] !rounded-b-none border-b-0 shadow-2xl relative z-10">
                  <label className="relative flex items-center px-5 h-[40px] border-b border-[#34d99a]/40 font-bold text-[11px] text-[#f0f0f3] uppercase w-full">
                    START A PROJECT
                  </label>
                  <div className="flex flex-col p-5">
                    <form onSubmit={handleSubmit} id="contact-form" className="grid gap-3 p-1">
                      <div>
                        <span className="block text-[13px] font-semibold text-[#f0f0f3] mb-2 uppercase">Contact Info</span>
                        <div className="grid gap-2">
                          <div className="space-y-1">
                            <input id="contact-name" name="name" value={form.name} onChange={handleChange} placeholder="Name" aria-label="Full Name" className={`field !py-2 !h-[36px] !px-3 !text-[12px] bg-[#16171e] focus:bg-[#1e2028] ${errors.name ? 'border-red-500/50' : ''}`} />
                            {errors.name && <p className="text-[10px] text-red-400 pl-1">{errors.name}</p>}
                          </div>
                          <div className="space-y-1">
                            <input id="contact-email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" aria-label="Email Address" className={`field !py-2 !h-[36px] !px-3 !text-[12px] bg-[#16171e] focus:bg-[#1e2028] ${errors.email ? 'border-red-500/50' : ''}`} />
                            {errors.email && <p className="text-[10px] text-red-400 pl-1">{errors.email}</p>}
                          </div>
                          <div className="space-y-1">
                            <input id="contact-phone" name="phone" value={form.phone} onChange={handleChange} placeholder="Phone (optional)" aria-label="Phone Number" className={`field !py-2 !h-[36px] !px-3 !text-[12px] bg-[#16171e] focus:bg-[#1e2028] ${errors.phone ? 'border-red-500/50' : ''}`} />
                            {errors.phone && <p className="text-[10px] text-red-400 pl-1">{errors.phone}</p>}
                          </div>
                          {/* Honeypot field - hidden from users */}
                          <div className="hidden" aria-hidden="true">
                            <input type="text" name="website" value={form.website || ''} onChange={handleChange} tabIndex="-1" autoComplete="off" />
                          </div>
                        </div>
                      </div>

                      <hr className="h-px bg-[#34d99a]/30 border-none my-1" />

                      <div>
                        <span className="block text-[13px] font-semibold text-[#f0f0f3] mb-2 uppercase">Project Type</span>
                        {choicesLoading ? (
                          <div className="flex items-center justify-center rounded-lg bg-[#16171e] py-2">
                            <LoadingSpinner size="sm" />
                          </div>
                        ) : (
                          <>
                            <select id="contact-type" name="project_type" value={form.project_type} onChange={handleChange} aria-label="Project Type" className={`field !py-0 !h-[36px] !px-3 !text-[12px] !cursor-pointer bg-[#16171e] focus:bg-[#1e2028] ${errors.project_type ? 'border-red-500/50' : ''}`}>
                              <option value="">Select type...</option>
                              {choices.project_types.map((p) => (
                                <option key={p.value} value={p.value} className="bg-[#0e0f14] text-[#f0f0f3]">{p.label}</option>
                              ))}
                            </select>
                          </>
                        )}
                        {errors.project_type && <p className="text-[10px] text-red-400 mt-1 pl-1">{errors.project_type}</p>}
                      </div>

                      <hr className="h-px bg-[#34d99a]/30 border-none my-1" />

                      <div>
                        <span className="block text-[13px] font-semibold text-[#f0f0f3] mb-2 uppercase">Budget</span>
                        <select id="contact-budget" name="budget" value={form.budget} onChange={handleChange} aria-label="Budget" className="field !py-0 !h-[36px] !px-3 !text-[12px] !cursor-pointer bg-[#16171e] focus:bg-[#1e2028]" disabled={choicesLoading}>
                          <option value="">Select budget (optional)</option>
                          {choices.budget_options.map((b) => (
                            <option key={b.value} value={b.value} className="bg-[#0e0f14] text-[#f0f0f3]">{b.label}</option>
                          ))}
                        </select>
                      </div>

                      <hr className="h-px bg-[#34d99a]/30 border-none my-1" />

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="block text-[13px] font-semibold text-[#f0f0f3] uppercase">Details</span>
                          <span className={`text-[10px] font-bold ${form.message.length > 450 ? 'text-amber-400' : 'text-muted'}`}>
                            {form.message.length}/500
                          </span>
                        </div>
                        <textarea id="contact-message" name="message" maxLength={500} rows={3} value={form.message} onChange={handleChange} placeholder="Describe your idea..." aria-label="Project Details" className={`field resize-none !py-2 !px-3 !text-[12px] bg-[#16171e] focus:bg-[#1e2028] ${errors.message ? 'border-red-500/50' : ''}`} />
                        {errors.message && <p className="text-[10px] text-red-400 mt-1 pl-1">{errors.message}</p>}
                      </div>

                      {status === 'error' && <p className="text-xs text-red-400">{errorMsg}</p>}
                    </form>
                  </div>
                </div>

                {/* Checkout Footer */}
                <div className="card bg-[#0e0f14] !rounded-t-none border-t border-[#34d99a]/40 shadow-2xl overflow-hidden relative z-0">
                  <div className="flex items-center justify-between py-2.5 px-2.5 pl-5 bg-[#34d99a]/10">
                    <label className="relative text-[22px] text-[#f0f0f3] font-black tracking-tight">Ready?</label>
                    <motion.button
                      form="contact-form"
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex flex-row justify-center items-center w-[140px] h-[36px] bg-[#34d99a]/20 shadow-[0_0.5px_0.5px_rgba(52,217,154,0.3),0_1px_0.5px_rgba(52,217,154,0.3)] rounded-[7px] border border-[#34d99a] text-[#34d99a] text-[13px] font-semibold transition-all hover:bg-[#34d99a]/30"
                      disabled={status === 'loading'}
                    >
                      {status === 'loading' ? <LoadingSpinner size="sm" /> : 'Send Message'}
                    </motion.button>
                  </div>
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="w-full lg:max-w-[400px] mx-auto lg:ml-auto space-y-3"
              >
                {/* ── Confirmation Card ── */}
                <div className="card bg-[#0e0f14] p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-mint/10">
                      <CheckCircle2 size={24} className="text-mint" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-bold text-text">Inquiry received! 🎉</h3>
                      <p className="text-xs text-sub mt-0.5">We'll respond with a detailed plan within 24 hours.</p>
                    </div>
                  </div>
                  <div className="mt-4 rounded-xl bg-white/5 px-4 py-3 text-xs text-sub space-y-1">
                    <p><span className="text-muted">Name:</span> <span className="font-medium text-text">{form.name || '—'}</span></p>
                    <p><span className="text-muted">Email:</span> <span className="font-medium text-text">{form.email || '—'}</span></p>
                  </div>
                </div>

                {/* ── Upsell: Book a Call ── */}
                <div className="relative overflow-hidden rounded-2xl border border-mint/30 bg-gradient-to-br from-mint/10 via-[#0e0f14] to-[#0e0f14] p-6">
                  <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-mint/15 blur-3xl" />
                  <div className="flex items-center gap-2 mb-3">
                    <Rocket size={14} className="text-mint" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-mint">Want to move faster?</span>
                  </div>
                  <h4 className="font-display text-base font-bold text-text leading-snug">
                    Skip the wait — book a direct founder call
                  </h4>
                  <p className="mt-2 text-xs leading-relaxed text-sub">
                    Your project brief is saved. Now lock in a 1-on-1 strategy session so we can start scoping immediately — no back-and-forth emails.
                  </p>
                  <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                    <Link
                      to={`/booking?name=${encodeURIComponent(form.name)}&email=${encodeURIComponent(form.email)}`}
                      className="group flex flex-1 items-center justify-center gap-2 rounded-xl bg-mint py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-bg transition-all hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(52,217,154,0.25)]"
                    >
                      <Calendar size={14} /> Book Strategy Session
                      <ArrowRight size={13} className="ml-1 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                    <button
                      onClick={() => { setStatus('idle'); setErrorMsg(''); }}
                      className="flex-shrink-0 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-sub hover:bg-white/10 transition-all"
                    >
                      New Inquiry
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
