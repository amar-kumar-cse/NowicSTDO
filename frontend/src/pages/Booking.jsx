import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, CheckCircle, ArrowRight, User, Phone, Mail, 
  Clock, ChevronRight, Sparkles, ShieldCheck 
} from 'lucide-react';
import { SignInButton } from '@clerk/clerk-react';
import SEO from '../components/SEO';
import SectionHeading from '../components/common/SectionHeading';
import ScrollReveal from '../components/reveal/ScrollReveal';
import Breadcrumbs from '../components/common/Breadcrumbs';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';

function formatCurrency(value) {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return String(value || '');
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(numeric);
}

function formatSlot(slot) {
  return slot ? String(slot).slice(0, 5) : '';
}

import { trackBookingSubmit, trackPricingClick } from '../components/Analytics';
import { toast } from 'sonner';

export default function Booking() {
  // Business-timezone (IST) calendar date. toISOString() is UTC, which lags
  // IST by 5.5h — before 5:30 AM local it would offer yesterday as min date.
  // 'en-CA' locale yields the YYYY-MM-DD format the date input expects.
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  const { isSignedIn, getApiToken } = useAuth();
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  const normalizedClerkKey = typeof publishableKey === 'string' ? publishableKey.trim() : '';
  const isClerkConfigured = normalizedClerkKey.startsWith('pk_') && !/your|placeholder/i.test(normalizedClerkKey);
  
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [booking, setBooking] = useState(null);
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { data: services, loading: servicesLoading, error: servicesError } = useApi(() => api.getBookingServices());
  const { data: slotsData, loading: slotsLoading, error: slotsError } = useApi(
    () => (selectedDate && selectedService ? api.getAvailableSlots(selectedDate, selectedService.id) : Promise.resolve({ data: { available: [] } })),
    [selectedDate, selectedService?.id]
  );

  const serviceList = Array.isArray(services) ? services : [];
  const availableSlots = slotsData?.available || [];

  // When Clerk is not configured, we treat user as "effectively signed in" for dev/local
  const canBook = isSignedIn || !isClerkConfigured;

  async function handleBook() {
    if (!canBook || !selectedService || !selectedDate || !selectedSlot) return;

    setSubmitting(true);
    setError('');

    try {
      const cleanedPhone = contactPhone.replace(/\D/g, '');

      if (!contactEmail.trim()) throw new Error('Email is required');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())) throw new Error('Please enter a valid email address');
      if (!cleanedPhone || cleanedPhone.length < 10) throw new Error('Please enter a valid mobile number');

      // Only get token if Clerk is properly configured, otherwise use dev bypass
      const token = isClerkConfigured ? await getApiToken() : 'dev_token';

      const result = await api.bookAppointment(token, {
        service_id: selectedService.id,
        date: selectedDate,
        time_slot: selectedSlot,
        email: contactEmail.trim(),
        phone: cleanedPhone,
      });

      setBooking(result.data);
      setStep(3);
      toast.success('Booking Confirmed! 🎉', { description: 'Check your email for details.' });

      // GA4 — Conversion event (shows in Goals)
      trackBookingSubmit(selectedService.name);
    } catch (err) {
      const msg = err.message || 'Failed to book appointment';
      setError(msg);
      toast.error('Booking Failed', { description: msg });
    } finally {
      setSubmitting(false);
    }
  }

  function resetBooking() {
    setStep(1);
    setSelectedService(null);
    setSelectedDate('');
    setSelectedSlot('');
    setBooking(null);
    setContactEmail('');
    setContactPhone('');
    setError('');
  }

  const bookingSchema = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Book a Strategy Call — Nowic Studio",
      "url": "https://www.nowicstdio.tech/booking",
      "description": "Schedule a 1-on-1 strategy call with Nowic Studio founders. Discuss your project, get a roadmap, and start building.",
      "mainEntity": {
        "@type": "Service",
        "name": "Strategy Consultation Call",
        "provider": {
          "@type": "Organization",
          "name": "Nowic Studio",
          "url": "https://www.nowicstdio.tech"
        },
        "description": "Free 15-30 minute strategy call to discuss your software project requirements, timeline, and budget.",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock"
        }
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.nowicstdio.tech/" },
        { "@type": "ListItem", "position": 2, "name": "Booking", "item": "https://www.nowicstdio.tech/booking" }
      ]
    }
  ];

  return (
    <div className="relative min-h-screen bg-bg selection:bg-mint/30">
      <SEO 
        title="Book a Strategy Call — Free Consultation | Nowic Studio"
        description="Schedule a free 1-on-1 strategy call with Nowic Studio founders. Discuss your software project, get a clear roadmap, timeline, and budget — no commitment required."
        canonicalUrl="https://www.nowicstdio.tech/booking"
        keywords="book a call software developer, free consultation software development, schedule strategy call, software project consultation, book developer call"
        schema={bookingSchema}
      />
      {/* ── Background Elements ─────────────────────────────────────────── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-mint/5 blur-[120px]"
          style={{ animation: 'float 20s ease-in-out infinite' }}
        />
        <div 
          className="absolute bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[100px]"
          style={{ animation: 'float-slow 25s ease-in-out infinite' }}
        />
        <div className="absolute inset-0 opacity-[0.03] dot-grid" />
      </div>

      {/* ── Header Section ──────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-12 overflow-hidden">
        <div className="container-shell relative">
          <Breadcrumbs items={[{ label: 'Booking', path: '/booking' }]} />
          <SectionHeading
            as="h1"
            eyebrow="Experience Excellence"
            title="Secure Your |Next Breakthrough"
            description="Our refined consulting process ensures every project starts with absolute clarity. Choose your path and let's begin the transformation."
          />
        </div>
      </section>

      {/* ── Main Booking Flow ───────────────────────────────────────────── */}
      <section className="container-shell pb-32">
        <div className="mx-auto max-w-6xl">
          
          {/* ── Progress Indicator ── */}
          <div className="relative mb-16 flex items-center justify-between px-4 sm:px-10">
            <div className="absolute top-1/2 left-0 h-[2px] w-full -translate-y-1/2 bg-white/5" />
            <div 
              className="absolute top-1/2 left-0 h-[2px] -translate-y-1/2 bg-gradient-to-r from-mint/50 to-mint transition-all duration-700 ease-out" 
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            />
            
            {[
              { s: 1, icon: Sparkles, label: 'Service' },
              { s: 2, icon: Clock, label: 'Scheduling' },
              { s: 3, icon: ShieldCheck, label: 'Confirmation' }
            ].map((item) => (
              <div key={item.s} className="relative z-10 flex flex-col items-center">
                <motion.div 
                  initial={false}
                  animate={{ 
                    scale: step === item.s ? 1.1 : 1,
                    backgroundColor: step >= item.s ? '#34d99a' : '#1a1a1a',
                    boxShadow: step === item.s ? '0 0 20px rgba(52, 217, 154, 0.4)' : 'none'
                  }}
                  className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors duration-500 ${step >= item.s ? 'border-mint' : 'border-white/10'}`}
                >
                  <item.icon size={20} className={step >= item.s ? 'text-bg' : 'text-sub'} />
                </motion.div>
                <span className={`absolute -bottom-8 whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.2em] transition-colors duration-500 ${step >= item.s ? 'text-mint' : 'text-muted'}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          {/* ── Content Area ── */}
          <AnimatePresence mode="wait">
            {/* ── STEP 1: SERVICE SELECTION ── */}
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              >
                {servicesLoading ? (
                  <div className="col-span-full py-20 flex flex-col items-center">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-sub animate-pulse">Curating available services...</p>
                  </div>
                ) : servicesError ? (
                  <div className="col-span-full"><ErrorMessage message={servicesError} /></div>
                ) : (
                  serviceList.map((service, idx) => (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ y: -8, scale: 1.02 }}
                      className="group relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-mint/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 rounded-3xl blur-xl" />
                      <button
                        onClick={() => {
                          setSelectedService(service);
                          setStep(2);
                          // GA4 — Track service interest intent
                          trackPricingClick(service.name);
                        }}
                        className="relative flex h-full w-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl p-8 text-left transition-all hover:border-mint/30"
                      >
                        <div className="mb-8 flex items-center justify-between">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-mint group-hover:bg-mint/10 transition-colors">
                            <Sparkles size={24} />
                          </div>
                          <div className="text-right">
                            <span className="block text-[10px] font-bold uppercase tracking-widest text-muted">Duration</span>
                            <span className="text-sm font-medium text-text">{service.duration_minutes} Minutes</span>
                          </div>
                        </div>

                        <h3 className="font-display text-2xl font-bold text-text group-hover:text-mint transition-colors">{service.name}</h3>
                        <p className="mt-4 flex-1 text-sm leading-relaxed text-sub line-clamp-3">{service.description}</p>
                        
                        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-end">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-mint group-hover:bg-mint group-hover:text-bg transition-all">
                            <ChevronRight size={20} />
                          </div>
                        </div>
                      </button>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}

            {/* ── STEP 2: SCHEDULING ── */}
            {step === 2 && selectedService && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="grid gap-8 lg:grid-cols-[1fr_380px]"
              >
                {/* ── Left Column: Calendar & Slots ── */}
                <div className="space-y-6">
                  <div className="rounded-3xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl p-8">
                    <div className="mb-8 flex items-center justify-between border-b border-white/5 pb-6">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mint/10 text-mint">
                          <Calendar size={20} />
                        </div>
                        <div>
                          <h3 className="font-display text-xl font-bold text-text">Select your timing</h3>
                          <p className="text-xs text-sub uppercase tracking-widest mt-1">Availability for {selectedService.name}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setStep(1)}
                        className="text-xs font-bold text-mint hover:underline uppercase tracking-widest"
                      >
                        Change Service
                      </button>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2">
                      {/* Date Picker */}
                      <div>
                        <label className="mb-3 block text-[10px] font-bold uppercase tracking-widest text-muted">1. Choose a Date</label>
                        <div className="relative group">
                          <input
                            type="date"
                            min={today}
                            value={selectedDate}
                            onChange={(e) => {
                              setSelectedDate(e.target.value);
                              setSelectedSlot('');
                            }}
                            className="w-full h-14 rounded-2xl border border-white/10 bg-white/5 px-6 text-sm text-text outline-none focus:border-mint/50 focus:bg-mint/5 transition-all appearance-none"
                          />
                          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-sub group-focus-within:text-mint transition-colors">
                            <Calendar size={18} />
                          </div>
                        </div>
                      </div>

                      {/* Time Slots */}
                      <div>
                        <label className="mb-3 block text-[10px] font-bold uppercase tracking-widest text-muted">2. Available Slots</label>
                        {!selectedDate ? (
                          <div className="flex h-14 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 text-[11px] text-muted uppercase tracking-widest">
                            Select date first
                          </div>
                        ) : slotsLoading ? (
                          <div className="flex h-14 items-center justify-center"><LoadingSpinner size="sm" /></div>
                        ) : availableSlots.length === 0 ? (
                          <div className="flex h-14 items-center justify-center rounded-2xl bg-red-500/5 text-xs text-red-400">
                            No slots available today
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {availableSlots.map((slot) => (
                              <button
                                key={slot}
                                onClick={() => setSelectedSlot(slot)}
                                className={`rounded-xl px-5 py-3 text-xs font-bold uppercase tracking-widest transition-all ${
                                  selectedSlot === slot 
                                    ? 'bg-mint text-bg shadow-[0_0_20px_rgba(52,217,154,0.3)]' 
                                    : 'bg-white/5 text-sub hover:bg-white/10 hover:text-text'
                                }`}
                              >
                                {slot}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── User Details ── */}
                  <div className="rounded-3xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl p-8">
                    <h3 className="mb-6 font-display text-xl font-bold text-text flex items-center gap-3">
                      <User size={20} className="text-mint" /> Contact Information
                    </h3>
                    
                    {!canBook ? (
                      <div className="flex flex-col items-center justify-center rounded-2xl bg-white/5 py-10 px-6 text-center">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-mint/10 text-mint">
                          <ShieldCheck size={24} />
                        </div>
                        <p className="text-sm text-sub max-w-xs">Sign in to confirm your booking and receive a confirmation email.</p>
                        <SignInButton mode="modal">
                          <button className="mt-6 rounded-2xl bg-mint px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] text-bg transition-all hover:scale-105 active:scale-95 shadow-[0_10px_30px_rgba(52,217,154,0.2)]">
                            Sign In to Book
                          </button>
                        </SignInButton>
                      </div>
                    ) : (
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted ml-2">Email Address</label>
                          <div className="relative group">
                            <input
                              type="email"
                              value={contactEmail}
                              onChange={(e) => setContactEmail(e.target.value)}
                              placeholder="you@agency.com"
                              aria-label="Email Address"
                              className="w-full h-14 rounded-2xl border border-white/10 bg-white/5 px-12 text-sm text-text outline-none focus:border-mint/50 focus:bg-mint/5 transition-all"
                            />
                            <Mail size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-sub group-focus-within:text-mint" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted ml-2">Mobile Number</label>
                          <div className="relative group">
                            <input
                              type="tel"
                              value={contactPhone}
                              onChange={(e) => setContactPhone(e.target.value)}
                              placeholder="+91 00000 00000"
                              aria-label="Mobile Number"
                              className="w-full h-14 rounded-2xl border border-white/10 bg-white/5 px-12 text-sm text-text outline-none focus:border-mint/50 focus:bg-mint/5 transition-all"
                            />
                            <Phone size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-sub group-focus-within:text-mint" />
                          </div>
                        </div>
                      </div>
                    )}

                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 flex items-center gap-3 rounded-xl bg-red-500/10 px-4 py-3 text-xs text-red-400"
                      >
                        <ShieldCheck size={14} /> {error}
                      </motion.div>
                    )}

                    <div className="mt-10 flex gap-4">
                      <button
                        onClick={handleBook}
                        disabled={!canBook || !selectedDate || !selectedSlot || !contactEmail.trim() || !contactPhone.trim() || submitting}
                        className="flex-1 rounded-2xl bg-mint py-5 text-xs font-bold uppercase tracking-[0.2em] text-bg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:grayscale shadow-[0_15px_40px_rgba(52,217,154,0.2)]"
                      >
                        {submitting ? <LoadingSpinner size="sm" /> : 'Confirm Reservation'}
                      </button>
                      <button 
                        onClick={resetBooking}
                        className="rounded-2xl border border-white/10 bg-white/5 px-8 py-5 text-xs font-bold uppercase tracking-widest text-text hover:bg-white/10 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── Right Column: Summary Sticky ── */}
                <div className="hidden lg:block">
                  <div className="sticky top-32 rounded-3xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl p-8">
                    <div className="mb-6 flex items-center justify-between">
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-mint">Reservation Summary</h4>
                      <div className="h-2 w-2 rounded-full bg-mint animate-pulse" />
                    </div>
                    
                    <h3 className="font-display text-2xl font-bold text-text mb-2">{selectedService.name}</h3>
                    <p className="text-xs text-sub mb-8 line-clamp-2">{selectedService.description}</p>
                    
                    <div className="space-y-4">
                      {[
                        { icon: Calendar, label: 'Date', val: selectedDate || 'Pending Selection' },
                        { icon: Clock, label: 'Slot', val: selectedSlot || 'Pending Selection' },
                        { icon: User, label: 'Duration', val: `${selectedService.duration_minutes} Minutes` },
                      ].map((detail, idx) => (
                        <div key={idx} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                          <div className="flex items-center gap-3">
                            <detail.icon size={14} className="text-muted" />
                            <span className="text-[11px] font-medium text-muted uppercase tracking-widest">{detail.label}</span>
                          </div>
                          <span className={`text-[11px] font-bold tracking-wider ${detail.val.includes('Pending') ? 'text-sub italic' : 'text-text'}`}>
                            {detail.val}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 rounded-2xl bg-mint/5 p-5 border border-mint/10">
                      <p className="text-[10px] leading-relaxed text-sub">
                        <span className="text-mint font-bold uppercase tracking-widest block mb-1">Expert Note</span>
                        A confirmation link will be sent to your email immediately after booking. Please ensure your contact details are correct.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: SUCCESS ── */}
            {step === 3 && booking && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mx-auto max-w-2xl overflow-hidden rounded-[40px] border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-3xl p-1 text-center"
              >
                <div className="bg-gradient-to-b from-mint/10 to-transparent p-12">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
                    className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-mint text-bg shadow-[0_0_40px_rgba(52,217,154,0.4)]"
                  >
                    <CheckCircle size={48} strokeWidth={2.5} />
                  </motion.div>
                  
                  <h3 className="mt-10 font-display text-4xl font-bold text-text tracking-tight">Booking Confirmed!</h3>
                  <p className="mt-4 text-lg text-sub font-medium">We're excited to work with you.</p>
                  
                  <div className="mt-10 grid grid-cols-2 gap-px bg-white/5 rounded-3xl overflow-hidden border border-white/10">
                    <div className="bg-[#0a0a0a] p-6">
                      <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-2">Service</span>
                      <span className="text-sm font-bold text-text">{selectedService.name}</span>
                    </div>
                    <div className="bg-[#0a0a0a] p-6">
                      <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-2">Reference ID</span>
                      <span className="text-sm font-bold text-mint uppercase">
                        {booking.id ? `NWCS-${String(booking.id).padStart(4, '0')}` : 'NWCS-2024'}
                      </span>
                    </div>
                    <div className="bg-[#0a0a0a] p-6">
                      <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-2">Date</span>
                      <span className="text-sm font-bold text-text">{booking.date || selectedDate}</span>
                    </div>
                    <div className="bg-[#0a0a0a] p-6">
                      <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-2">Time</span>
                      <span className="text-sm font-bold text-text">{formatSlot(booking.time_slot || selectedSlot)}</span>
                    </div>
                  </div>

                  <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
                    <button 
                      onClick={resetBooking} 
                      className="group flex items-center justify-center gap-3 rounded-2xl bg-white px-8 py-5 text-xs font-bold uppercase tracking-[0.2em] text-bg transition-all hover:bg-mint hover:scale-[1.03]"
                    >
                      Book Another <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </button>
                    <Link 
                      to="/dashboard" 
                      className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-8 py-5 text-xs font-bold uppercase tracking-[0.2em] text-text transition-all hover:bg-white/10"
                    >
                      Go to Dashboard
                    </Link>
                  </div>
                  
                  <p className="mt-8 text-[11px] text-muted uppercase tracking-widest">
                    A confirmation packet has been sent to <span className="text-sub font-bold">{booking.email || contactEmail}</span>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── Bottom Section ── */}
      <footer className="container-shell pb-20 pt-10 text-center">
        <div className="inline-flex items-center gap-3 rounded-full border border-white/5 bg-white/5 px-6 py-3">
          <div className="h-2 w-2 rounded-full bg-mint animate-pulse" />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
            End-to-End Encryption Enabled • Professional Consultation Services
          </p>
        </div>
      </footer>
    </div>
  );
}