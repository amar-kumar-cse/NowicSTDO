import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, Calendar, FileText, Briefcase, ArrowRight } from 'lucide-react';
import { api } from '../lib/api';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

function formatMoney(value) {
  const numeric = Number(value || 0);
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Number.isNaN(numeric) ? 0 : numeric);
}

function formatDate(value) {
  if (!value) return 'TBD';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatSlot(slot) {
  return slot ? String(slot).slice(0, 5) : 'TBD';
}

function timeAgo(value) {
  if (!value) return '';
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return '';
  const diff = Date.now() - time;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function statusClass(status) {
  switch (status) {
    case 'confirmed':
    case 'paid':
      return 'bg-emerald-500/15 text-emerald-300';
    case 'cancelled':
    case 'overdue':
      return 'bg-red-500/15 text-red-300';
    case 'partial':
      return 'bg-sky-500/15 text-sky-300';
    default:
      return 'bg-yellow-500/15 text-yellow-300';
  }
}

function normalizeBooking(item) {
  return {
    id: item.id,
    service_name: item.service__name || item.service_name || item.service?.name || 'Booking',
    date: item.date,
    time_slot: item.time_slot,
    status: item.status,
  };
}

function normalizeProject(item) {
  return {
    id: item.project__id || item.id,
    name: item.project__name || item.name || 'Project',
    progress: item.project__progress ?? item.progress ?? 0,
    status: item.project__status || item.status || 'active',
    deadline: item.project__deadline || item.deadline,
  };
}

function normalizeInvoice(item) {
  return {
    id: item.id,
    invoice_number: item.invoice_number,
    amount: item.amount,
    status: item.status,
    due_date: item.due_date,
  };
}

function normalizeNotification(item) {
  return {
    id: item.id,
    title: item.title,
    message: item.message,
    created_at: item.created_at,
  };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { isSignedIn, isLoaded, getApiToken, userName } = useAuth();
  const [token, setToken] = useState(null);
  const [refreshTick, setRefreshTick] = useState(0);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/');
      return;
    }

    if (isSignedIn) {
      getApiToken().then((t) => setToken(t));
    }
  }, [isLoaded, isSignedIn, navigate]);

  const { data: dashboard, loading, error } = useApi(
    () => (token ? api.getClientDashboard(token) : Promise.resolve({ data: null })),
    [token, refreshTick]
  );

  const { data: notifData } = useApi(
    () => (token ? api.getUnreadCount(token) : Promise.resolve({ data: { count: 0 } })),
    [token, refreshTick]
  );

  if (!isLoaded || (isSignedIn && !token)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner text="Loading your dashboard..." />
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner text="Loading your dashboard..." />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={() => setRefreshTick((v) => v + 1)} />;
  }

  const bookings = (dashboard?.my_bookings || []).map(normalizeBooking);
  const projects = (dashboard?.my_projects || []).map(normalizeProject);
  const invoices = (dashboard?.my_invoices?.recent || []).map(normalizeInvoice);
  const notifications = (dashboard?.notifications || []).map(normalizeNotification);
  const unreadCount = notifData?.count ?? 0;

  async function handleMarkAllRead() {
    if (!token) return;
    setMarking(true);
    try {
      await api.markAllRead(token);
      setRefreshTick((v) => v + 1);
    } finally {
      setMarking(false);
    }
  }

  return (
    <div className="container-shell py-20">
      <div className="mx-auto max-w-7xl space-y-8">
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-subtle bg-panel p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Client Dashboard</p>
              <h1 className="mt-3 font-display text-4xl font-bold text-text">Welcome back, {userName || 'there'}</h1>
              <p className="mt-3 text-sub">Track bookings, projects, invoices, and notifications in one place.</p>
            </div>
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-text">
                <Bell size={18} />
              </div>
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { icon: Calendar, label: 'My Bookings', value: bookings.length },
            { icon: Briefcase, label: 'Active Projects', value: projects.length },
            { icon: FileText, label: 'Unpaid Invoices', value: dashboard?.my_invoices?.unpaid_count ?? 0 },
            { icon: ArrowRight, label: 'Amount Due', value: `₹${formatMoney(dashboard?.my_invoices?.total_due)}` },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-mint">
                    <Icon size={16} />
                  </div>
                  <span className="text-right text-2xl font-bold text-text">{item.value}</span>
                </div>
                <p className="mt-4 text-sm text-sub">{item.label}</p>
              </div>
            );
          })}
        </motion.section>

        <div className="grid gap-6 xl:grid-cols-2">
          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="font-display text-2xl font-bold text-text">Upcoming Bookings</h2>
              <Link to="/booking" className="outline-btn text-sm">
                Book Another
              </Link>
            </div>
            <div className="space-y-3">
              {bookings.slice(0, 5).length === 0 ? (
                <p className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-5 text-sm text-sub">No upcoming bookings. Book a call!</p>
              ) : bookings.slice(0, 5).map((booking) => (
                <div key={booking.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-text">{booking.service_name}</p>
                      <p className="mt-1 text-sm text-sub">{formatDate(booking.date)} at {formatSlot(booking.time_slot)}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusClass(booking.status)}`}>{booking.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-sm">
            <h2 className="font-display text-2xl font-bold text-text">My Projects</h2>
            <div className="mt-5 space-y-4">
              {projects.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-5 text-sm text-sub">No active projects yet.</p>
              ) : projects.map((project) => (
                <div key={project.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-text">{project.name}</p>
                      <p className="mt-1 text-sm text-sub">Deadline: {formatDate(project.deadline)}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusClass(project.status)}`}>{project.status}</span>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-white/10">
                    <div className="h-2 rounded-full bg-white transition-all" style={{ width: `${Math.min(Math.max(Number(project.progress) || 0, 0), 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-sm">
            <h2 className="font-display text-2xl font-bold text-text">Recent Invoices</h2>
            <div className="mt-5 space-y-3">
              {invoices.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-5 text-sm text-sub">No invoices yet.</p>
              ) : invoices.slice(0, 3).map((invoice) => (
                <div key={invoice.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-text">{invoice.invoice_number}</p>
                      <p className="mt-1 text-sm text-sub">Due: {formatDate(invoice.due_date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-text">₹{formatMoney(invoice.amount)}</p>
                      <span className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusClass(invoice.status)}`}>{invoice.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-2xl font-bold text-text">Notifications</h2>
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={marking}
                className="outline-btn text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                {marking ? 'Updating...' : 'Mark all as read'}
              </button>
            </div>
            <div className="mt-5 space-y-3">
              {notifications.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-5 text-sm text-sub">No unread notifications.</p>
              ) : notifications.slice(0, 5).map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-text">{item.title}</p>
                      <p className="mt-1 text-sm text-sub">{item.message}</p>
                    </div>
                    <span className="text-xs text-muted">{timeAgo(item.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}