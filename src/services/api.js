import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  register: (userData) => api.post('/api/auth/register', userData),
  getMe: () => api.get('/api/auth/me'),
};

// Applications API
export const applicationsAPI = {
  getAll: (params) => api.get('/api/applications/my-applications', { params }),
  getById: (id) => api.get(`/api/applications/${id}`),
  create: (data) => api.post('/api/applications', data),
  updateStatus: (id, status) => api.patch(`/api/applications/${id}/status`, { status }),
  delete: (id) => api.delete(`/api/applications/${id}`),
};

// Resumes API
export const resumesAPI = {
  getAll: () => api.get('/api/resumes/my-resumes'),
  getById: (id) => api.get(`/api/resumes/${id}`),
  upload: (formData) => api.post('/api/resumes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/api/resumes/${id}`),
};

// Agents API
export const agentsAPI = {
  scoreResume: (resumeText, jobDescription) =>
    api.post('/api/agents/resume-scorer', { resumeText, jobDescription }),
  generateAnswers: (resumeText, jobDescription, questions) =>
    api.post('/api/agents/generate-answers', { resumeText, jobDescription, questions }),
  extractProfile: (resumeText) =>
    api.post('/api/agents/extract-profile', { resumeText }),
  fullAnalysis: (resumeText, jobDescription) =>
    api.post('/api/agents/full-analysis', { resumeText, jobDescription }),
  getStats: () => api.get('/api/agents/stats'),
};

// Dashboard API
export const dashboardAPI = {
  getOverview: () => api.get('/api/dashboard/overview'),
  getStatusAnalytics: () => api.get('/api/dashboard/analytics/status'),
  getAgentAnalytics: () => api.get('/api/dashboard/analytics/agents'),
  getPipeline: () => api.get('/api/dashboard/pipeline'),
};

export default api;
