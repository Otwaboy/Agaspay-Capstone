// Admin API service - centralized API calls for admin dashboard
import axios from 'axios';

const API_BASE = '/api/v1';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('agaspay_token');
};

// Axios instance with auth
const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to all requests
apiClient.interceptors.request.use(config => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Dashboard APIs
export const dashboardApi = {
  getStats: async () => {
    const response = await apiClient.get('/dashboard/stats');
    return response.data;
  }
};

// Users/Residents APIs
export const usersApi = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/user/all', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await apiClient.get(`/user/${id}`);
    return response.data;
  },
  update: async (id, data) => {
    const response = await apiClient.patch(`/user/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await apiClient.delete(`/user/${id}`);
    return response.data;
  }
};

// Personnel APIs
export const personnelApi = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/personnel', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await apiClient.get(`/personnel/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await apiClient.post('/personnel', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await apiClient.patch(`/personnel/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await apiClient.delete(`/personnel/${id}`);
    return response.data;
  }
};

// Water Connections APIs
export const connectionsApi = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/water-connection', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await apiClient.get(`/water-connection/${id}`);
    return response.data;
  },
  updateStatus: async (id, status) => {
    const response = await apiClient.patch(`/connection-management/${id}/status`, { status });
    return response.data;
  },
  getDelinquentAccounts: async () => {
    const response = await apiClient.get('/connection-management/delinquent');
    return response.data;
  },
  markForDisconnection: async (id) => {
    const response = await apiClient.post(`/connection-management/${id}/mark-disconnection`);
    return response.data;
  }
};

// Billing APIs
export const billingApi = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/billing', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await apiClient.get(`/billing/${id}`);
    return response.data;
  }
};

// Payment APIs
export const paymentApi = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/payment', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await apiClient.get(`/payment/${id}`);
    return response.data;
  }
};

// Schedule Task APIs
export const scheduleTaskApi = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/schedule-task', { params });
    return response.data;
  },
  create: async (data) => {
    const response = await apiClient.post('/schedule-task', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await apiClient.patch(`/schedule-task/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await apiClient.delete(`/schedule-task/${id}`);
    return response.data;
  }
};

// Incidents APIs
export const incidentsApi = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/incident-report/all', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await apiClient.get(`/incident-report/${id}`);
    return response.data;
  },
  updateStatus: async (id, status, resolution_notes = '') => {
    const response = await apiClient.patch(`/incident-report/${id}/status`, {
      reported_issue_status: status,
      resolution_notes
    });
    return response.data;
  }
};

// Announcements APIs
export const announcementsApi = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/announcements', { params });
    return response.data;
  },
  getPending: async () => {
    const response = await apiClient.get('/announcements/pending');
    return response.data;
  },
  create: async (data) => {
    const response = await apiClient.post('/announcements', data);
    return response.data;
  },
  approve: async (id) => {
    const response = await apiClient.patch(`/announcements/${id}/approve`);
    return response.data;
  },
  reject: async (id) => {
    const response = await apiClient.patch(`/announcements/${id}/reject`);
    return response.data;
  },
  archive: async (id) => {
    const response = await apiClient.patch(`/announcements/${id}/archive`);
    return response.data;
  },
  incrementViews: async (id) => {
    const response = await apiClient.patch(`/announcements/${id}/view`);
    return response.data;
  }
};

// Water Schedules APIs
export const waterSchedulesApi = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/water-schedules', { params });
    return response.data;
  },
  getPending: async () => {
    const response = await apiClient.get('/water-schedules/pending');
    return response.data;
  },
  create: async (data) => {
    const response = await apiClient.post('/water-schedules', data);
    return response.data;
  },
  approve: async (id) => {
    const response = await apiClient.patch(`/water-schedules/${id}/approve`);
    return response.data;
  },
  reject: async (id) => {
    const response = await apiClient.patch(`/water-schedules/${id}/reject`);
    return response.data;
  }
};

// Reports APIs
export const reportsApi = {
  generateRevenue: async (params = {}) => {
    const response = await apiClient.get('/reports/revenue', { params });
    return response.data;
  },
  generateConsumption: async (params = {}) => {
    const response = await apiClient.get('/reports/consumption', { params });
    return response.data;
  },
  generateBilling: async (params = {}) => {
    const response = await apiClient.get('/reports/billing', { params });
    return response.data;
  },
  generateUsers: async (params = {}) => {
    const response = await apiClient.get('/reports/users', { params });
    return response.data;
  },
  generateIncidents: async (params = {}) => {
    const response = await apiClient.get('/reports/incidents', { params });
    return response.data;
  }
};

export default {
  dashboard: dashboardApi,
  users: usersApi,
  personnel: personnelApi,
  connections: connectionsApi,
  billing: billingApi,
  payment: paymentApi,
  scheduleTasks: scheduleTaskApi,
  incidents: incidentsApi,
  announcements: announcementsApi,
  waterSchedules: waterSchedulesApi,
  reports: reportsApi
};
