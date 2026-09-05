export const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');

function buildUrl(endpoint) {
  if (/^https?:\/\//i.test(endpoint)) {
    return endpoint;
  }

  return `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
}

export function resolveImageUrl(imageUrl) {
  if (!imageUrl) return '';
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  if (imageUrl.startsWith('/media/')) return imageUrl;
  return `${BASE_URL}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
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

export class ApiError extends Error {
  constructor(message, data, status) {
    super(message);
    this.name = 'ApiError';
    this.data = data;
    this.status = status;
  }
}

export async function apiCall(endpoint, options = {}) {
  // Pull `headers` out so the spread below can't clobber the merged headers
  // (previously `...options` ran last and replaced the merged object, which
  // silently dropped the default 'Content-Type: application/json' whenever
  // the caller passed custom headers such as Authorization).
  const { headers: extraHeaders, ...rest } = options;

  const response = await fetch(buildUrl(endpoint), {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(extraHeaders || {}),
    },
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new ApiError(data?.error || data?.message || 'API call failed', data, response.status);
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
  getContactChoices: () => apiCall('/api/v1/public/contact/choices/'),
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
  // Admin Management
  admin_me: (token) => authApiCall('/api/v1/admin/me/', token),
  admin_dashboard: (token) => authApiCall('/api/v1/admin/dashboard/', token),
  admin_getUsers: (token, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return authApiCall(`/api/v1/admin/users/${query ? `?${query}` : ''}`, token);
  },
  admin_updateUser: (token, id, data) => authApiCall(`/api/v1/admin/users/${id}/`, token, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  // CRM
  crm_getLeads: (token, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return authApiCall(`/api/v1/crm/leads/${query ? `?${query}` : ''}`, token);
  },
  crm_updateLead: (token, id, data) => authApiCall(`/api/v1/crm/leads/${id}/`, token, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  crm_createLead: (token, data) => authApiCall('/api/v1/crm/leads/', token, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  crm_getProjects: (token) => authApiCall('/api/v1/crm/projects/', token),
  crm_createProject: (token, data) => authApiCall('/api/v1/crm/projects/', token, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  crm_updateProject: (token, id, data) => authApiCall(`/api/v1/crm/projects/${id}/`, token, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  crm_updateSubmission: (token, id, data) => authApiCall(`/api/v1/crm/submissions/${id}/`, token, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  // Invoices
  admin_getInvoices: (token, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return authApiCall(`/api/v1/admin/invoices/${query ? `?${query}` : ''}`, token);
  },
  admin_updateInvoice: (token, id, data) => authApiCall(`/api/v1/admin/invoices/${id}/`, token, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  // Media Upload
  admin_uploadMedia: async (token, file, folder = 'services') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    const response = await fetch(buildUrl('/api/v1/admin/upload/media/'), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await parseResponse(response);
    if (!response.ok) {
      throw new ApiError(data?.error || data?.message || 'Upload failed', data, response.status);
    }
    return data;
  },
  
  // Reviews (Public)
  public_getReviews: () => apiCall('/api/v1/public/reviews/'),
  public_submitReview: (data) => apiCall('/api/v1/public/reviews/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Reviews (Admin)
  admin_getReviews: (token) => authApiCall('/api/v1/admin/reviews/', token),
  admin_updateReview: (token, id, isApproved) => authApiCall(`/api/v1/admin/reviews/${id}/?is_approved=${isApproved}`, token, {
    method: 'PATCH',
  }),
  admin_deleteReview: (token, id) => authApiCall(`/api/v1/admin/reviews/${id}/`, token, {
    method: 'DELETE',
  }),

  // Leads Export
  crm_exportLeads: async (token) => {
    const response = await fetch(buildUrl('/api/v1/admin/leads/export/'), {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Export failed');
    return response.blob();
  },

  // Blog (Public)
  public_getBlogs: () => apiCall('/api/v1/public/blog/'),
  public_getBlogDetail: (slug) => apiCall(`/api/v1/public/blog/${slug}/`),

  // Blog (Admin)
  admin_getBlogs: (token, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return authApiCall(`/api/v1/admin/blog/${query ? `?${query}` : ''}`, token);
  },
  admin_getBlogById: (token, id) => authApiCall(`/api/v1/admin/blog/${id}/`, token),
  admin_getBlogStats: (token) => authApiCall('/api/v1/admin/blog/stats/', token),
  admin_createBlog: (token, data) => authApiCall('/api/v1/admin/blog/', token, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  admin_updateBlog: (token, id, data) => authApiCall(`/api/v1/admin/blog/${id}/`, token, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  admin_deleteBlog: (token, id) => authApiCall(`/api/v1/admin/blog/${id}/`, token, {
    method: 'DELETE',
  }),
};

