import axios, { AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { VirtualCard } from '../types';

// Determine if we're in development or production
const isDevelopment = window.location.hostname === 'localhost';

const baseURL = isDevelopment
  ? 'http://localhost:5000'
  : 'https://finance.hotelonline.co';

console.log('[API] Using base URL:', baseURL);

const apiService = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor for logging
apiService.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log('[API Request]', {
      method: config.method,
      url: config.url,
      data: config.data,
      headers: config.headers,
      baseURL: config.baseURL || baseURL,
      fullURL: (config.baseURL || baseURL) + (config.url || '')
    });
    return config;
  },
  (error: AxiosError) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
apiService.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('[API Response]', {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error: AxiosError) => {
    console.error('[API Response Error]', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config
    });
    return Promise.reject(error);
  }
);

export const getReservations = async (): Promise<VirtualCard[]> => {
  try {
    console.log('[API] Fetching reservations...');
    const response = await apiService.get<VirtualCard[]>('/api/reservations');
    return response.data;
  } catch (error) {
    console.error('[API] Failed to fetch reservations:', error);
    throw error;
  }
};

export default apiService; 