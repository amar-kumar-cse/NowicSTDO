import { useEffect as usePrerenderEffect } from 'react';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, ChevronRight, Mail, Lock, Eye, Database, Users, RefreshCw, Cookie, Bell, Clock, Phone } from 'lucide-react';
import SEO from '../components/SEO';
import ScrollReveal from '../components/reveal/ScrollReveal';

const SECTIONS = [
  { id: 'introduction',    label: 'Introduction',             icon: Shield },
  { id: 'data-collected',  label: 'Information We Collect',   icon: Database },
  { id: 'how-we-use',      label: 'How We Use Data',          icon: Eye },
  { id: 'legal-basis',     label: 'Legal Basis',              icon: Lock },
  { id: 'data-sharing',    label: 'Third-Party Sharing',      icon: Users },
  { id: 'data-retention',  label: 'Data Retention',           icon: Clock },
  { id: 'your-rights',     label: 'Your Rights',              icon: Bell },
  { id: 'cookies',         label: 'Cookies & Analytics',      icon: Cookie },
  { id: 'security',        label: 'Data Security',            icon: Shield },
  { id: 'children',        label: "Children's Privacy",       icon: Users },
  { id: 'changes',         label: 'Policy Changes',           icon: RefreshCw },
  { id: 'contact',         label: 'Contact Us',               icon: Mail },
];

const privacySchema = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Privacy Policy — Nowic Studio',
    url: 'https://www.nowicstdio.tech/privacy-policy',
    description:
      "Privacy Policy for Nowic Studio — how we collect, use, and protect your personal data in compliance with GDPR and India's Digital Personal Data Protection Act 2023.",
    datePublished: '2026-06-01',
    dateModified: '2026-08-01',
    publisher: {
      '@type': 'Organization',
      name: 'Nowic Studio',
      url: 'https://www.nowicstdio.tech',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.nowicstdio.tech/' },
      { '@type': 'ListItem', position: 2, name: 'Privacy Policy', item: 'https://www.nowicstdio.tech/privacy-policy' },
    ],
  },
];

/* ── Small prose section wrapper ── */
function Section({ id, icon: Icon, title, children }) {
  return (
    <ScrollReveal>
      <section id={id} className="scroll-mt-24 py-10 first:pt-0">
        <div className="flex items-center gap-3 mb-5">
          <div className="icon-box shrink-0">
            <Icon size={15} />
          </div>
          <h2 className="font-display text-xl font-bold text-text">{title}</h2>
        </div>
        <div className="space-y-4 text-sm leading-relaxed text-sub pl-0">{children}</div>
        <div className="divider mt-10" />
      </section>
    </ScrollReveal>
  );
}

function Li({ children }) {
  return (
    <li className="flex items-start gap-2">
      <ChevronRight size={13} className="mt-0.5 shrink-0 text-mint" />
      <span>{children}</span>
    </li>
  );
}

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState('introduction');
  const contentRef = useRef(null);

  /* ── Intersection Observer for active TOC highlight ── */
  useEffect(() => {
    const observers = [];
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <SEO
        title="Privacy Policy — Nowic Studio"
        description="Nowic Studio's Privacy Policy explains how we collect, use, store, and protect your personal data. Compliant with GDPR and India's DPDP Act 2023."
        canonicalUrl="https://www.nowicstdio.tech/privacy-policy"
        keywords="Nowic Studio privacy policy, data protection, GDPR, DPDP Act, personal data, software agency India"
        noIndex={false}
        schema={privacySchema}
      />

      {/* ── Hero ── */}
      <section className="relative pt-20 pb-12">
        <div
          className="pointer-events-none absolute inset-x-0 -top-20 h-72"
          style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(52,217,154,0.06) 0%, transparent 70%)' }}
        />
        <div className="container-shell relative">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs text-muted">
            <Link to="/" className="hover:text-text transition-colors">Home</Link>
            <ChevronRight size={12} />
            <span className="text-sub">Privacy Policy</span>
          </nav>

          <ScrollReveal>
            <div className="flex items-center gap-4 mb-5">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
                style={{ background: 'linear-gradient(135deg, rgba(52,217,154,0.15) 0%, rgba(52,217,154,0.05) 100%)', border: '1px solid rgba(52,217,154,0.2)' }}
              >
                <Shield size={24} className="text-mint" />
              </div>
              <div>
                <p className="eyebrow">Legal</p>
                <h1 className="font-display text-3xl font-extrabold leading-tight text-text sm:text-4xl">
                  Privacy <span className="text-gradient">Policy</span>
                </h1>
              </div>
            </div>
            <p className="max-w-2xl text-base leading-relaxed text-sub">
              At <strong className="text-text">Nowic Studio</strong>, we respect your privacy and are committed to protecting
              your personal data. This policy explains what data we collect, why we collect it, and how we keep it safe.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-muted">
              <span className="flex items-center gap-1.5">
                <Clock size={12} className="text-mint" />
                Effective Date: <strong className="text-sub ml-1">June 1, 2026</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <RefreshCw size={12} className="text-mint" />
                Last Updated: <strong className="text-sub ml-1">August 1, 2026</strong>
              </span>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Main Layout: TOC + Content ── */}
      <div className="container-shell pb-24">
        <div className="grid gap-10 lg:grid-cols-[240px_1fr]">

          {/* ── Sticky TOC Sidebar (desktop) ── */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
                On This Page
              </p>
              <nav className="space-y-1">
                {SECTIONS.map(({ id, label, icon: Icon }) => {
                  const isActive = activeSection === id;
                  return (
                    <motion.button
                      key={id}
                      onClick={() => scrollTo(id)}
                      whileHover={{ x: 4 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      className={`group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                        isActive
                          ? 'bg-mint/10 text-mint font-semibold'
                          : 'text-muted hover:text-sub hover:bg-white/[0.03]'
                      }`}
                    >
                      <Icon size={12} className={`shrink-0 transition-colors ${isActive ? 'text-mint' : 'text-muted group-hover:text-sub'}`} />
                      {label}
                    </motion.button>
                  );
                })}
              </nav>

              {/* Quick Contact Card */}
              <div
                className="mt-8 rounded-xl p-4 text-xs"
                style={{ background: 'rgba(52,217,154,0.04)', border: '1px solid rgba(52,217,154,0.12)' }}
              >
                <p className="font-semibold text-text mb-1">Questions?</p>
                <p className="text-muted leading-relaxed mb-3">Contact our privacy team directly.</p>
                <a
                  href="mailto:haiderssaqulain@gmail.com"
                  className="flex items-center gap-1.5 text-mint hover:underline font-medium"
                >
                  <Mail size={11} />
                  Email Us
                </a>
              </div>
            </div>
          </aside>

          {/* ── Policy Content ── */}
          <div ref={contentRef} className="min-w-0">

            <Section id="introduction" icon={Shield} title="1. Introduction & Who We Are">
              <p>
                <strong className="text-text">Nowic Studio</strong> ("we," "us," or "our") is a premium software agency
                headquartered in India. We build MVPs, SaaS platforms, AI-powered web applications, and digital products
                for founders and businesses globally. Our website is available at{' '}
                <a href="https://www.nowicstdio.tech" className="text-mint hover:underline">nowicstdio.tech</a>.
              </p>
              <p>
                This Privacy Policy describes how we collect, use, disclose, and safeguard your personal information when
                you visit our website, use our services, or interact with us in any way. It applies to all users of our
                platform — visitors, clients, and partners.
              </p>
              <p>
                By accessing or using our services, you acknowledge that you have read and understood this Privacy Policy.
                If you disagree with any part of this policy, please discontinue use of our services.
              </p>
            </Section>

            <Section id="data-collected" icon={Database} title="2. Information We Collect">
              <p>We collect data in two ways — data you provide directly, and data collected automatically.</p>

              <div>
                <p className="font-semibold text-text mb-2">2.1 — Data You Provide</p>
                <ul className="space-y-2">
                  <Li><strong>Account & Authentication:</strong> When you sign in via Clerk (email/password or Google OAuth), we receive your full name, email address, and profile picture URL.</Li>
                  <Li><strong>Contact Forms:</strong> Name, email address, phone number (optional), company name, project description, and budget range.</Li>
                  <Li><strong>Booking / Consultation:</strong> Name, email, preferred date/time, and any notes you include with your appointment.</Li>
                  <Li><strong>Project Files & Media:</strong> Any images, documents, or assets you upload for your project (stored via Cloudinary).</Li>
                  <Li><strong>Reviews:</strong> Testimonials, star ratings, and your name/designation if you submit a review.</Li>
                  <Li><strong>Communications:</strong> Emails, messages, or feedback you send us directly.</Li>
                </ul>
              </div>

              <div>
                <p className="font-semibold text-text mb-2">2.2 — Data Collected Automatically</p>
                <ul className="space-y-2">
                  <Li><strong>Usage Data:</strong> Pages visited, time spent, referrer URLs, and click interactions.</Li>
                  <Li><strong>Device Data:</strong> Browser type, operating system, screen resolution, and IP address.</Li>
                  <Li><strong>Cookies & Local Storage:</strong> Session tokens, preference flags, and analytics identifiers.</Li>
                  <Li><strong>Log Data:</strong> Server-side request logs including timestamps, API endpoints accessed, and error codes.</Li>
                </ul>
              </div>
            </Section>

            <Section id="how-we-use" icon={Eye} title="3. How We Use Your Information">
              <p>We use the data we collect for the following purposes:</p>
              <ul className="space-y-2">
                <Li><strong>Service Delivery:</strong> To process bookings, manage projects, send invoices, and provide client dashboards.</Li>
                <Li><strong>Authentication:</strong> To verify your identity when you log into our platform via Clerk.</Li>
                <Li><strong>Communication:</strong> To respond to inquiries, send project updates, invoice notifications, and appointment reminders.</Li>
                <Li><strong>Improvement:</strong> To understand how visitors use our website and improve our content, UI, and services.</Li>
                <Li><strong>Legal Compliance:</strong> To meet our obligations under applicable Indian and international laws.</Li>
                <Li><strong>Security:</strong> To detect, prevent, and address fraud, abuse, or unauthorized access.</Li>
                <Li><strong>Marketing (with consent):</strong> To share updates about new services or case studies, only if you have opted in.</Li>
              </ul>
              <p>
                We never sell your personal data to third parties. We do not use your data for automated decision-making
                or profiling that produces significant legal or similarly significant effects.
              </p>
            </Section>

            <Section id="legal-basis" icon={Lock} title="4. Legal Basis for Processing">
              <p>
                For users in the European Economic Area (EEA) and in India, our legal bases for processing personal data are:
              </p>
              <ul className="space-y-2">
                <Li><strong>Contractual Necessity:</strong> Processing required to fulfil a service agreement (e.g., project work, invoicing, client dashboards).</Li>
                <Li><strong>Legitimate Interests:</strong> Analytics to improve our platform, security monitoring, and fraud prevention — where your interests don't override ours.</Li>
                <Li><strong>Consent:</strong> For marketing communications and non-essential cookies. You can withdraw consent at any time.</Li>
                <Li><strong>Legal Obligation:</strong> Where required by Indian law, GDPR, or other applicable regulations.</Li>
              </ul>
              <p>
                This policy is designed to comply with both the <strong className="text-text">EU General Data Protection Regulation
                (GDPR)</strong> and India's <strong className="text-text">Digital Personal Data Protection Act, 2023 (DPDP Act)</strong>.
              </p>
            </Section>

            <Section id="data-sharing" icon={Users} title="5. Data Sharing & Third Parties">
              <p>
                We work with a limited set of trusted third-party service providers. We only share the minimum data
                necessary for them to perform their function.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-subtle">
                      <th className="py-2 pr-4 text-left font-semibold text-text">Provider</th>
                      <th className="py-2 pr-4 text-left font-semibold text-text">Purpose</th>
                      <th className="py-2 text-left font-semibold text-text">Data Shared</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-subtle text-muted">
                    <tr>
                      <td className="py-2.5 pr-4 font-medium text-sub">Clerk</td>
                      <td className="py-2.5 pr-4">User Authentication</td>
                      <td className="py-2.5">Name, email, profile picture</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-4 font-medium text-sub">Cloudinary</td>
                      <td className="py-2.5 pr-4">Media Storage</td>
                      <td className="py-2.5">Uploaded images & files</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-4 font-medium text-sub">PostgreSQL (Railway/Supabase)</td>
                      <td className="py-2.5 pr-4">Database Hosting</td>
                      <td className="py-2.5">All application data</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-4 font-medium text-sub">Google SMTP / Email Provider</td>
                      <td className="py-2.5 pr-4">Transactional Email</td>
                      <td className="py-2.5">Name, email, message content</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-4 font-medium text-sub">Sentry (if enabled)</td>
                      <td className="py-2.5 pr-4">Error Monitoring</td>
                      <td className="py-2.5">Anonymised error traces</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p>
                We may disclose your information if required by law, court order, or governmental authority, or if we
                believe in good faith that such disclosure is necessary to protect our legal rights, prevent fraud, or
                ensure user safety.
              </p>
              <p>
                In the event of a merger, acquisition, or sale of company assets, your data may be transferred as part
                of that transaction. We will notify you before your data becomes subject to a different privacy policy.
              </p>
            </Section>

            <Section id="data-retention" icon={Clock} title="6. Data Retention">
              <p>We retain your personal data only for as long as necessary to fulfil the purposes outlined in this policy.</p>
              <ul className="space-y-2">
                <Li><strong>Account Data:</strong> Retained while your account is active. Upon deletion request, removed within 30 days.</Li>
                <Li><strong>Project & Invoice Data:</strong> Retained for 7 years for accounting and legal compliance purposes.</Li>
                <Li><strong>Contact Form Submissions:</strong> Retained for up to 2 years for CRM and follow-up purposes.</Li>
                <Li><strong>Analytics Data:</strong> Aggregated anonymised data may be retained indefinitely; identifiable data deleted after 13 months.</Li>
                <Li><strong>Server Logs:</strong> Retained for up to 90 days for security and debugging purposes.</Li>
              </ul>
              <p>
                After the applicable retention period, data is securely deleted or anonymised so that it can no longer
                be associated with any individual.
              </p>
            </Section>

            <Section id="your-rights" icon={Bell} title="7. Your Rights">
              <p>
                Depending on your location, you have various rights over your personal data. We respect and honour these
                rights without unnecessary delay (typically within 30 days).
              </p>
              <ul className="space-y-2">
                <Li><strong>Right to Access:</strong> Request a copy of the personal data we hold about you.</Li>
                <Li><strong>Right to Rectification:</strong> Request correction of inaccurate or incomplete data.</Li>
                <Li><strong>Right to Erasure ("Right to be Forgotten"):</strong> Request deletion of your personal data, subject to legal retention requirements.</Li>
                <Li><strong>Right to Restrict Processing:</strong> Request that we limit how we use your data in certain circumstances.</Li>
                <Li><strong>Right to Data Portability:</strong> Receive your data in a structured, machine-readable format.</Li>
                <Li><strong>Right to Object:</strong> Object to processing based on legitimate interests or direct marketing.</Li>
                <Li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time for consent-based processing, without affecting prior processing.</Li>
                <Li><strong>Right to Grievance Redressal (India DPDP):</strong> Lodge a complaint with our Data Protection Officer or the Data Protection Board of India.</Li>
              </ul>
              <p>
                To exercise any of these rights, please contact us at{' '}
                <a href="mailto:haiderssaqulain@gmail.com" className="text-mint hover:underline">
                  haiderssaqulain@gmail.com
                </a>. We may need to verify your identity before processing your request.
              </p>
            </Section>

            <Section id="cookies" icon={Cookie} title="8. Cookies & Analytics">
              <p>
                We use cookies and similar tracking technologies to enhance your experience and understand how our
                website is used.
              </p>

              <div>
                <p className="font-semibold text-text mb-2">Types of Cookies We Use</p>
                <ul className="space-y-2">
                  <Li><strong>Essential Cookies:</strong> Required for authentication (Clerk session tokens) and basic site functionality. Cannot be disabled.</Li>
                  <Li><strong>Preference Cookies:</strong> Store your settings and preferences (e.g., theme, language).</Li>
                  <Li><strong>Analytics Cookies:</strong> Help us understand page visits, traffic sources, and user behaviour using anonymised data.</Li>
                  <Li><strong>Session Storage:</strong> Temporary data (e.g., admin session flags) stored only for the duration of your browser session.</Li>
                </ul>
              </div>

              <p>
                You can control cookies through your browser settings. Disabling cookies may impact certain
                features of our website, including login functionality. We do not currently use advertising or
                retargeting cookies.
              </p>
            </Section>

            <Section id="security" icon={Shield} title="9. Data Security">
              <p>
                We take the security of your personal data seriously and implement industry-standard technical and
                organisational measures to protect it.
              </p>
              <ul className="space-y-2">
                <Li><strong>Encryption in Transit:</strong> All data transmitted between your browser and our servers is protected with HTTPS / TLS encryption.</Li>
                <Li><strong>Authentication Security:</strong> User authentication is handled by Clerk, which implements industry-best security practices including MFA support, secure token issuance (RS256 JWT), and JWKS rotation.</Li>
                <Li><strong>Access Controls:</strong> Admin functionality is protected by role-based access control (RBAC). Only authorised personnel can access sensitive data.</Li>
                <Li><strong>Secure File Storage:</strong> Files uploaded by clients are stored on Cloudinary, which provides encrypted cloud storage.</Li>
                <Li><strong>Regular Monitoring:</strong> We use server-side logging and Sentry error tracking (where enabled) to detect anomalies and security incidents.</Li>
                <Li><strong>Minimal Data Principle:</strong> We only collect data that is necessary for our operations.</Li>
              </ul>
              <p>
                While we use commercially reasonable measures to protect your data, no method of transmission over the
                internet is 100% secure. In the event of a data breach, we will notify affected users as required by
                applicable law.
              </p>
            </Section>

            <Section id="children" icon={Users} title="10. Children's Privacy">
              <p>
                Our services are not directed at individuals under the age of <strong className="text-text">18 years</strong>.
                We do not knowingly collect personal data from minors.
              </p>
              <p>
                If we become aware that we have inadvertently collected personal data from a minor, we will promptly
                delete such information from our systems. If you believe we have collected data from a minor, please
                contact us immediately at{' '}
                <a href="mailto:haiderssaqulain@gmail.com" className="text-mint hover:underline">
                  haiderssaqulain@gmail.com
                </a>.
              </p>
            </Section>

            <Section id="changes" icon={RefreshCw} title="11. Changes to This Policy">
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices, technology,
                legal requirements, or for other operational reasons. We will notify you of material changes by:
              </p>
              <ul className="space-y-2">
                <Li>Updating the <strong className="text-text">"Last Updated"</strong> date at the top of this page.</Li>
                <Li>Displaying a notice on our website for significant changes.</Li>
                <Li>Sending an email notification to registered users for major policy updates.</Li>
              </ul>
              <p>
                We encourage you to review this policy periodically. Your continued use of our services after any
                changes constitutes acceptance of the revised policy.
              </p>
              <p>
                The previous version of this policy and a changelog are available upon request by contacting us directly.
              </p>
            </Section>

            <Section id="contact" icon={Mail} title="12. Contact Us">
              <p>
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices,
                please reach out to us through any of the following channels:
              </p>

              <div className="grid gap-4 sm:grid-cols-2 mt-2">
                <div
                  className="rounded-xl p-5"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <p className="font-semibold text-text mb-3 flex items-center gap-2">
                    <Mail size={14} className="text-mint" /> Email
                  </p>
                  <a
                    href="mailto:haiderssaqulain@gmail.com"
                    className="text-mint hover:underline break-all"
                  >
                    haiderssaqulain@gmail.com
                  </a>
                  <p className="mt-1 text-muted">We respond within 2 business days.</p>
                </div>
                <div
                  className="rounded-xl p-5"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <p className="font-semibold text-text mb-3 flex items-center gap-2">
                    <Phone size={14} className="text-mint" /> Business Address
                  </p>
                  <p className="text-sub">Nowic Studio</p>
                  <p className="text-muted">India 🇮🇳</p>
                </div>
              </div>

              <p className="mt-4">
                You also have the right to lodge a complaint with the{' '}
                <strong className="text-text">Data Protection Board of India</strong> (under the DPDP Act 2023) or a
                relevant supervisory authority in your country if you believe we have not handled your data in
                accordance with applicable law.
              </p>
            </Section>

            {/* ── Bottom CTA ── */}
            <ScrollReveal>
              <div
                className="mt-4 rounded-2xl p-8 text-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(52,217,154,0.06) 0%, rgba(52,217,154,0.02) 100%)',
                  border: '1px solid rgba(52,217,154,0.15)',
                }}
              >
                <Shield size={28} className="mx-auto mb-3 text-mint" />
                <h3 className="font-display text-lg font-bold text-text mb-2">
                  Your privacy is our priority
                </h3>
                <p className="text-sm text-sub max-w-md mx-auto mb-5">
                  Have questions about how we handle your data? We're happy to provide transparency and clarity.
                </p>
                <Link to="/contact" className="cta-btn inline-flex">
                  Get in Touch
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </>
  );
}
