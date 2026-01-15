import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create axios instance with default config
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // You can add auth tokens here in the future
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Handle errors globally
    const message = error.response?.data?.message || error.message || 'An error occurred';
    console.error('API Error:', message);
    return Promise.reject(error);
  }
);

// Type definitions
export interface Medication {
  id: number;
  name: string;
  dosage?: string;
  frequency: string;
  times: string[];
  start_date: string;
  end_date?: string;
  active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MedicationLog {
  id: number;
  medication_id: number;
  medication_name: string;
  dosage?: string;
  scheduled_time: string;
  taken_time?: string;
  status: 'pending' | 'taken' | 'missed' | 'skipped';
  notes?: string;
  created_at: string;
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface Settings {
  [key: string]: string;
}

// API Methods

// Medications
export const medicationsApi = {
  getAll: (): Promise<{ success: boolean; medications: Medication[] }> =>
    api.get('/medications'),

  getById: (id: number): Promise<{ success: boolean; medication: Medication }> =>
    api.get(`/medications/${id}`),

  create: (data: Partial<Medication>): Promise<{ success: boolean; medication: Medication }> =>
    api.post('/medications', data),

  update: (id: number, data: Partial<Medication>): Promise<{ success: boolean; medication: Medication }> =>
    api.put(`/medications/${id}`, data),

  delete: (id: number): Promise<{ success: boolean; message: string }> =>
    api.delete(`/medications/${id}`),
};

// Logs
export const logsApi = {
  getAll: (params?: {
    start_date?: string;
    end_date?: string;
    medication_id?: number;
  }): Promise<{ success: boolean; logs: MedicationLog[] }> =>
    api.get('/logs', { params }),

  getToday: (): Promise<{
    success: boolean;
    logs: MedicationLog[];
    stats: {
      total: number;
      taken: number;
      missed: number;
      pending: number;
      skipped: number;
    };
  }> => api.get('/logs/today'),

  getHistory: (days?: number): Promise<{
    success: boolean;
    logs: MedicationLog[];
    stats: {
      totalDays: number;
      totalLogs: number;
      taken: number;
      compliance_rate: number;
      streak: number;
      byMedication: Record<string, any>;
    };
  }> => api.get('/logs/history', { params: { days } }),

  create: (data: {
    medication_id: number;
    scheduled_time?: string;
    taken_time?: string;
    status: string;
    notes?: string;
  }): Promise<{ success: boolean; log: MedicationLog }> =>
    api.post('/logs', data),

  update: (id: number, data: {
    status?: string;
    taken_time?: string;
    notes?: string;
  }): Promise<{ success: boolean; log: MedicationLog }> =>
    api.put(`/logs/${id}`, data),

  delete: (id: number): Promise<{ success: boolean; message: string }> =>
    api.delete(`/logs/${id}`),
};

// Push Notifications
export const pushApi = {
  getVapidKey: (): Promise<{ success: boolean; publicKey: string }> =>
    api.get('/push/vapid-key'),

  subscribe: (subscription: PushSubscription): Promise<{ success: boolean; message: string }> =>
    api.post('/push/subscribe', subscription),

  unsubscribe: (endpoint: string): Promise<{ success: boolean; message: string }> =>
    api.post('/push/unsubscribe', { endpoint }),

  test: (): Promise<{ success: boolean; message: string; results: any[] }> =>
    api.post('/push/test'),
};

// Settings
export const settingsApi = {
  getAll: (): Promise<{ success: boolean; settings: Settings }> =>
    api.get('/settings'),

  update: (key: string, value: string): Promise<{ success: boolean; settings: Settings }> =>
    api.put('/settings', { key, value }),
};

export default api;
