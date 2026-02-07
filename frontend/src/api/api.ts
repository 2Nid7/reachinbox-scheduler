import axios from 'axios';
import type {
  ScheduleEmailRequest,
  ScheduleEmailResponse,
  Email,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const googleLogin = async (token: string) => {
  const res = await api.post('/auth/google', { token });
  return res.data;
};

// Emails
export const scheduleEmails = async (
  data: ScheduleEmailRequest
): Promise<ScheduleEmailResponse> => {
  const res = await api.post('/emails/schedule', data);
  return res.data;
};

export const getScheduledEmails = async (): Promise<{ emails: Email[] }> => {
  const res = await api.get('/emails/scheduled');
  return res.data;
};

export const getSentEmails = async (): Promise<{ emails: Email[] }> => {
  const res = await api.get('/emails/sent');
  return res.data;
};

export default api;
