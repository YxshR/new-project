import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
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

// Auth API
export const authAPI = {
  register: (email: string, password: string, fullName?: string) =>
    api.post('/auth/register', { email, password, fullName }),

  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  getProfile: () => api.get('/auth/profile'),
};

// Wallet API
export const walletAPI = {
  getWallet: () => api.get('/wallet'),
  getBalance: () => api.get('/wallet/balance'),
  deposit: (amount: number, paymentId: string, paymentMethod: string) =>
    api.post('/wallet/deposit', { amount, paymentId, paymentMethod }),
};

// Trade API
export const tradeAPI = {
  createTrade: (data: {
    cryptocurrency: string;
    amount: number;
    direction: 'UP' | 'DOWN';
    duration: number;
  }) => api.post('/trades', data),

  getActiveTrades: () => api.get('/trades/active'),
  getTradeHistory: (limit = 50) => api.get(`/trades/history?limit=${limit}`),
  getTradeById: (id: string) => api.get(`/trades/${id}`),
};

// Price API
export const priceAPI = {
  getCurrentPrice: (symbol: string) => api.get(`/prices/${symbol}`),
  getHistoricalData: (symbol: string, days = 1) =>
    api.get(`/prices/${symbol}/history?days=${days}`),
};

export default api;
