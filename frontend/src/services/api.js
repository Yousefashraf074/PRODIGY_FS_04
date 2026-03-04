import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me')
};

// Users API
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  getPrivateChats: (userId) => api.get(`/users/${userId}/private-chats`)
};

// Chat Rooms API
export const chatRoomsAPI = {
  getAll: (params) => api.get('/chatrooms', { params }),
  getById: (id) => api.get(`/chatrooms/${id}`),
  create: (data) => api.post('/chatrooms', data),
  delete: (id) => api.delete(`/chatrooms/${id}`),
  createPrivate: (userId) => api.post('/chatrooms/private', { userId })
};

// Messages API
export const messagesAPI = {
  getByChat: (chatId, params) => api.get(`/messages/${chatId}`, { params }),
  send: (chatId, data) => api.post(`/messages/${chatId}`, data)
};

export default api;
