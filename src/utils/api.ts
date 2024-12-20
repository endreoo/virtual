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
      statusText: response.statusText,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  (error: AxiosError) => {
    console.error('[API Response Error]', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data
      }
    });
    return Promise.reject(error);
  }
);

interface DoNotChargePayload {
  reservation_id: string;
  amount_usd: number;
  payment_channel: string;
  expedia_reservation_id: number;
  created_at: string;
  type_of_transaction: string;
}

export const doNotCharge = async (payload: DoNotChargePayload): Promise<any> => {
  try {
    console.log('[API] Sending Do Not Charge request:', payload);
    const response = await apiService.post('/api/cards/do-not-charge', payload);
    console.log('[API] Do Not Charge response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('[API] Do Not Charge request failed:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

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