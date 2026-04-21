const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');

function buildUrl(endpoint) {
  if (/^https?:\/\//i.test(endpoint)) {
    return endpoint;
  }

  return `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
}

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

export async function apiCall(endpoint, options = {}) {
  const response = await fetch(buildUrl(endpoint), {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(data?.error || data?.message || 'API call failed');
  }

  return data;
}

export async function authApiCall(endpoint, token, options = {}) {
  if (!token) {
    throw new Error('Missing authentication token');
  }

  return apiCall(endpoint, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
}

export const api = {
  getStats: () => apiCall('/api/v1/public/stats/'),
  getServices: () => apiCall('/api/v1/public/services/'),
  getServiceBySlug: (slug) => apiCall(`/api/v1/public/services/${slug}/`),
  getSiteContent: () => apiCall('/api/v1/public/site-content/'),
  getSiteContentSection: (section) => apiCall(`/api/v1/public/site-content/${section}/`),
  getPortfolio: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/api/v1/public/portfolio/${query ? `?${query}` : ''}`);
  },
  getPortfolioBySlug: (slug) => apiCall(`/api/v1/public/portfolio/${slug}/`),
  submitContact: (data) => apiCall('/api/v1/public/contact/', { method: 'POST', body: JSON.stringify(data) }),
  getBookingServices: () => apiCall('/api/v1/booking/services/'),
  getAvailableSlots: (date, serviceId) => apiCall(`/api/v1/booking/slots/?date=${date}&service_id=${serviceId}`),
  bookAppointment: (token, data) => authApiCall('/api/v1/booking/book/', token, { method: 'POST', body: JSON.stringify(data) }),
  getMyBookings: (token, status = '') => authApiCall(`/api/v1/booking/mine/${status ? `?status=${status}` : ''}`, token),
  cancelBooking: (token, id, reason = '') => authApiCall(`/api/v1/booking/cancel/${id}/`, token, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  }),
  getClientDashboard: (token) => authApiCall('/api/v1/client/dashboard/', token),
  getClientProjects: (token) => authApiCall('/api/v1/client/projects/', token),
  getProjectUpdates: (token, projectId) => authApiCall(`/api/v1/client/projects/${projectId}/updates/`, token),
  getClientInvoices: (token) => authApiCall('/api/v1/client/invoices/', token),
  getNotifications: (token) => authApiCall('/api/v1/notifications/', token),
  markAllRead: (token) => authApiCall('/api/v1/notifications/mark-all-read/', token, { method: 'POST' }),
  getUnreadCount: (token) => authApiCall('/api/v1/notifications/unread-count/', token),
  getAdminSiteContent: (token) => authApiCall('/api/v1/admin/site-content/', token),
  getAdminSiteContentSection: (token, section) => authApiCall(`/api/v1/admin/site-content/${section}/`, token),
  saveAdminSiteContent: (token, section, data) => authApiCall(`/api/v1/admin/site-content/${section}/`, token, {
    method: 'PUT',
    body: JSON.stringify({ data }),
  }),
};

export { BASE_URL };