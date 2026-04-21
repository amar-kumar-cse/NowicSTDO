import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, ArrowRight } from 'lucide-react';
import { SignInButton } from '@clerk/clerk-react';
import SectionHeading from '../components/common/SectionHeading';
import ScrollReveal from '../components/reveal/ScrollReveal';
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

export default function Booking() {
  const today = new Date().toISOString().split('T')[0];
  const { isSignedIn, getApiToken } = useAuth();
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  const normalizedClerkKey = typeof publishableKey === 'string' ? publishableKey.trim() : '';
  const isClerkConfigured = normalizedClerkKey.startsWith('pk_') && !/your|placeholder/i.test(normalizedClerkKey);
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [booking, setBooking] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { data: services, loading: servicesLoading, error: servicesError } = useApi(() => api.getBookingServices());
  const { data: slotsData, loading: slotsLoading, error: slotsError } = useApi(
    () => (selectedDate && selectedService ? api.getAvailableSlots(selectedDate, selectedService.id) : Promise.resolve({ data: { available: [] } })),
    [selectedDate, selectedService?.id]
  );

  const serviceList = Array.isArray(services) ? services : [];
  const availableSlots = slotsData?.available || [];

  async function handleBook() {
    if (!isSignedIn || !selectedService || !selectedDate || !selectedSlot) return;

    setSubmitting(true);
    setError('');

    try {
      const token = await getApiToken();
      const result = await api.bookAppointment(token, {
        service_id: selectedService.id,
        date: selectedDate,
        time_slot: selectedSlot,
      });

      setBooking(result.data);
      setStep(3);
    } catch (err) {
      setError(err.message || 'Failed to book appointment');
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
    setError('');
  }

  return (
    <>
      <section className="relative py-20">
        <div
          className="pointer-events-none absolute inset-x-0 -top-20 h-60"
          style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(52,217,154,0.06) 0%, transparent 70%)' }}
        />
        <div className="container-shell relative">
          <SectionHeading
            eyebrow="Booking"
            title="Book a call in |three simple steps"
            description="Choose a service, pick a time, and confirm your session securely with Clerk authentication."
          />
        </div>
      </section>

      <section className="container-shell pb-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 grid gap-3 rounded-2xl border border-subtle bg-panel p-3 md:grid-cols-3">
            {[
              { step: 1, label: 'Choose Service' },
              { step: 2, label: 'Pick Time' },
              { step: 3, label: 'Confirmed' },
            ].map((item) => (
              <div
                key={item.step}
                className={`rounded-xl px-4 py-3 text-sm font-medium transition-colors ${step >= item.step ? 'bg-mint text-bg' : 'bg-white/5 text-sub'}`}
              >
                <span className="mr-2 font-semibold">{item.step}.</span>
                {item.label}
              </div>
            ))}
          </div>

          {servicesError ? <ErrorMessage message={servicesError} /> : null}

          {step === 1 && !servicesLoading && (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {serviceList.map((service) => (
                <ScrollReveal key={service.id}>
                  <motion.button
                    type="button"
                    whileHover={{ y: -4 }}
                    onClick={() => {
                      setSelectedService(service);
                      setSelectedSlot('');
                      setStep(2);
                    }}
                    className={`card h-full w-full rounded-2xl p-6 text-left transition-all ${selectedService?.id === service.id ? 'border border-mint/40 bg-white/5' : ''}`}
                  >
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-mint/10 text-mint">
                        <Calendar size={18} />
                      </div>
                      <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-muted">
                        {service.duration_minutes} min
                      </span>
                    </div>
                    <h3 className="font-display text-xl font-bold text-text">{service.name}</h3>
                    <p className="mt-2 text-sm text-sub">{service.description}</p>
                    <div className="mt-5 flex items-center justify-between text-sm text-muted">
                      <span>From ₹{formatCurrency(service.price)}</span>
                      <span>Select service</span>
                    </div>
                  </motion.button>
                </ScrollReveal>
              ))}
            </div>
          )}

          {servicesLoading && (
            <div className="flex justify-center py-20">
              <LoadingSpinner text="Loading booking services..." />
            </div>
          )}

          {step >= 2 && selectedService && (
            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
              <div className="card p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="eyebrow">Step 2</p>
                    <h3 className="mt-2 font-display text-2xl font-bold text-text">Pick your date and slot</h3>
                  </div>
                  <button type="button" onClick={() => setStep(1)} className="outline-btn">
                    Change Service
                  </button>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-[220px_1fr]">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-muted">Preferred Date</label>
                    <input
                      type="date"
                      min={today}
                      value={selectedDate}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setSelectedSlot('');
                      }}
                      className="field w-full"
                    />
                  </div>

                  <div>
                    {!isSignedIn ? (
                      <div className="rounded-2xl border border-subtle bg-white/5 p-6 text-center">
                        <p className="text-sm text-sub">Sign in to see and book available time slots.</p>
                        {isClerkConfigured ? (
                          <SignInButton mode="modal">
                            <button type="button" className="cta-btn mt-4 inline-flex">
                              Sign In to Book
                            </button>
                          </SignInButton>
                        ) : (
                          <p className="mt-4 text-xs text-muted">Authentication is not configured in this local setup.</p>
                        )}
                      </div>
                    ) : !selectedDate ? (
                      <div className="rounded-2xl border border-subtle bg-white/5 p-6 text-center text-sm text-sub">
                        Choose a date to load available slots.
                      </div>
                    ) : slotsLoading ? (
                      <div className="flex justify-center py-10">
                        <LoadingSpinner size="sm" text="Loading slots..." />
                      </div>
                    ) : slotsError ? (
                      <ErrorMessage message={slotsError} />
                    ) : availableSlots.length === 0 ? (
                      <div className="rounded-2xl border border-subtle bg-white/5 p-6 text-center text-sm text-sub">
                        No available slots for this date.
                      </div>
                    ) : (
                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-muted">Available Slots</label>
                        <div className="flex flex-wrap gap-2">
                          {availableSlots.map((slot) => (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setSelectedSlot(slot)}
                              className={`rounded-full border px-4 py-2 text-sm transition-colors ${selectedSlot === slot ? 'border-mint bg-mint text-bg' : 'border-subtle bg-white/5 text-sub hover:text-text'}`}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleBook}
                    disabled={!isSignedIn || !selectedDate || !selectedSlot || submitting}
                    className="cta-btn disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? <LoadingSpinner size="sm" /> : 'Book Appointment'}
                  </button>
                  <button type="button" onClick={resetBooking} className="outline-btn">
                    Reset
                  </button>
                </div>
              </div>

              <div className="card p-6">
                <p className="eyebrow">Summary</p>
                <h3 className="mt-2 font-display text-xl font-bold text-text">{selectedService.name}</h3>
                <div className="mt-4 space-y-3 text-sm text-sub">
                  <p className="flex items-center justify-between gap-3"><span>Date</span><span className="text-text">{selectedDate || 'Not selected'}</span></p>
                  <p className="flex items-center justify-between gap-3"><span>Time</span><span className="text-text">{selectedSlot || 'Not selected'}</span></p>
                  <p className="flex items-center justify-between gap-3"><span>Duration</span><span className="text-text">{selectedService.duration_minutes} min</span></p>
                </div>
                <div className="mt-5 rounded-2xl bg-white/5 p-4 text-sm text-sub">
                  You’ll receive a confirmation after booking and an email follow-up from the team.
                </div>
              </div>
            </div>
          )}

          {step === 3 && booking && (
            <ScrollReveal>
              <div className="mx-auto max-w-2xl rounded-3xl border border-subtle bg-panel p-10 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-mint/10 text-mint">
                  <CheckCircle size={40} />
                </div>
                <h3 className="mt-6 font-display text-3xl font-bold text-text">Booking Confirmed!</h3>
                <p className="mt-3 text-sub">{booking.service?.name || selectedService.name}</p>
                <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm text-sub">
                  <span className="rounded-full bg-white/5 px-4 py-2">{booking.date || selectedDate}</span>
                  <span className="rounded-full bg-white/5 px-4 py-2">{formatSlot(booking.time_slot || selectedSlot)}</span>
                </div>
                <p className="mt-5 text-sm text-sub">Check your email for confirmation.</p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <button type="button" onClick={resetBooking} className="cta-btn">
                    Book Another <ArrowRight size={15} className="ml-2" />
                  </button>
                  <Link to="/dashboard" className="outline-btn">
                    View My Bookings
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          )}
        </div>
      </section>
    </>
  );
}