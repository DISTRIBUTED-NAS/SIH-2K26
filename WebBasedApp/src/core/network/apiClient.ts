import axios from 'axios';
import { API_BASE_URL } from '../config';

// Placeholder axios instance for future backend communication
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptors for Auth are configured dynamically in AuthProvider

