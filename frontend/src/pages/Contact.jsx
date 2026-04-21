import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle2, Clock, Zap, MessageCircle } from 'lucide-react';
import SectionHeading from '../components/common/SectionHeading';
import ScrollReveal from '../components/reveal/ScrollReveal';
import { api } from '../lib/api';
import { useApi } from '../hooks/useApi';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const promise = [
  { icon: Clock, text: 'Response within 24 hours' },
  { icon: CheckCircle2, text: 'Free project roadmap included' },
  { icon: Zap, text: 'No-commitment discovery call' },
  { icon: MessageCircle, text: 'Direct access to founders' },
];

const projectTypes = ['MVP Development', 'Business Website', 'AI Web App', 'Admin Dashboard', 'SaaS Platform', 'API / Backend', 'Other'];
const budgetOptions = ['Under ₹50K', '₹50K–2L', '₹2L–5L', 'Above ₹5L'];

export default function Contact() {
  const { data: services, loading: servicesLoading, error: servicesError } = useApi(() => api.getServices());

  const contactInfo = [
    { icon: Mail, label: 'Email', value: brand.email || 'hello@nowicstudio.com', href: `mailto:${brand.email || 'hello@nowicstudio.com'}` },
    { icon: Phone, label: 'Phone', value: brand.phone || '+91 98765 43210', href: `tel:${(brand.phone || '+91 98765 43210').replace(/\D/g, '')}` },
    { icon: MapPin, label: 'Location', value: brand.location || 'India 🇮🇳', href: '#' },
  ];

  const [form, setForm] = useState({ name: '', email: '', project_type: '', message: '', phone: '', budget: '', service_slug: '' });
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      await api.submitContact({
        name: form.name,
        email: form.email,
        project_type: form.project_type,
        message: form.message,
        phone: form.phone || undefined,
        budget: form.budget || undefined,
        service_slug: form.service_slug || undefined,
      });
      setStatus('success');
      setForm({ name: '', email: '', project_type: '', message: '', phone: '', budget: '', service_slug: '' });
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'Something went wrong');
    }
  }

  const orderedServices = Array.isArray(services) ? [...services].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) : [];

  return (
    <>
      {/* Hero */}
      <section className="relative py-20">
        <div
          className="pointer-events-none absolute inset-x-0 -top-20 h-60"
          style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(52,217,154,0.06) 0%, transparent 70%)' }}
        />
        <div className="container-shell relative">
          <SectionHeading
            eyebrow="Contact"
            title="Let's build something |great together"
            description="Share your idea and we'll get back with a clear plan — no fluff, no spam."
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
                          <input id="contact-name" name="name" required value={form.name} onChange={handleChange} placeholder="Name" className="field !py-2 !h-[36px] !px-3 !text-[12px] bg-[#16171e] focus:bg-[#1e2028]" />
                          <input id="contact-email" name="email" type="email" required value={form.email} onChange={handleChange} placeholder="Email" className="field !py-2 !h-[36px] !px-3 !text-[12px] bg-[#16171e] focus:bg-[#1e2028]" />
                          <input id="contact-phone" name="phone" value={form.phone} onChange={handleChange} placeholder="Phone (optional)" className="field !py-2 !h-[36px] !px-3 !text-[12px] bg-[#16171e] focus:bg-[#1e2028]" />
                        </div>
                      </div>

                      <hr className="h-px bg-[#34d99a]/30 border-none my-1" />

                      <div>
                        <span className="block text-[13px] font-semibold text-[#f0f0f3] mb-2 uppercase">Project Type</span>
                        <select id="contact-type" name="project_type" required value={form.project_type} onChange={handleChange} className="field !py-0 !h-[36px] !px-3 !text-[12px] !cursor-pointer bg-[#16171e] focus:bg-[#1e2028]">
                          <option value="" disabled>Select type...</option>
                          {projectTypes.map((pt) => (
                            <option key={pt} value={pt} style={{ background: '#0e0f14', color: '#f0f0f3' }}>{pt}</option>
                          ))}
                        </select>
                      </div>

                      <hr className="h-px bg-[#34d99a]/30 border-none my-1" />

                      <div>
                        <span className="block text-[13px] font-semibold text-[#f0f0f3] mb-2 uppercase">Service</span>
                        {servicesError ? (
                          <ErrorMessage message={servicesError} />
                        ) : servicesLoading ? (
                          <div className="flex items-center justify-center rounded-lg bg-[#16171e] py-2">
                            <LoadingSpinner size="sm" />
                          </div>
                        ) : (
                          <select id="contact-service" name="service_slug" value={form.service_slug} onChange={handleChange} className="field !py-0 !h-[36px] !px-3 !text-[12px] !cursor-pointer bg-[#16171e] focus:bg-[#1e2028]">
                            <option value="">Select a service (optional)</option>
                            {orderedServices.map((service) => (
                              <option key={service.slug} value={service.slug} style={{ background: '#0e0f14', color: '#f0f0f3' }}>{service.name}</option>
                            ))}
                          </select>
                        )}
                      </div>

                      <hr className="h-px bg-[#34d99a]/30 border-none my-1" />

                      <div>
                        <span className="block text-[13px] font-semibold text-[#f0f0f3] mb-2 uppercase">Budget</span>
                        <select id="contact-budget" name="budget" value={form.budget} onChange={handleChange} className="field !py-0 !h-[36px] !px-3 !text-[12px] !cursor-pointer bg-[#16171e] focus:bg-[#1e2028]">
                          <option value="">Select budget (optional)</option>
                          {budgetOptions.map((budget) => (
                            <option key={budget} value={budget} style={{ background: '#0e0f14', color: '#f0f0f3' }}>{budget}</option>
                          ))}
                        </select>
                      </div>

                      <hr className="h-px bg-[#34d99a]/30 border-none my-1" />

                      <div>
                        <span className="block text-[13px] font-semibold text-[#f0f0f3] mb-2 uppercase">Details</span>
                        <textarea id="contact-message" name="message" required rows={3} value={form.message} onChange={handleChange} placeholder="Describe your idea..." className="field resize-none !py-2 !px-3 !text-[12px] bg-[#16171e] focus:bg-[#1e2028]" />
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
              <div className="card p-7 w-full lg:max-w-[400px] mx-auto lg:ml-auto">
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center py-8 text-center"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#34d99a]/10">
                    <CheckCircle2 size={32} className="text-[#34d99a]" />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-bold text-[#f0f0f3]">Sent! 🎉</h3>
                  <p className="mt-2 text-sm text-[#b0b3c0]">
                    Thanks! We'll get back within 24 hours.
                  </p>
                  <button
                    onClick={() => { setStatus('idle'); setErrorMsg(''); }}
                    className="outline-btn mt-6"
                  >
                    Send Another
                  </button>
                </motion.div>
              </div>
            )}
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
