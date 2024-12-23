import axios, { AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { VirtualCard } from '../types';

const baseURL = import.meta.env.VITE_API_URL || window.location.origin;
console.log('[API] Using base URL:', baseURL);

const apiService = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: false
});

// Add request interceptor for logging
apiService.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Ensure we're using the correct base URL in production
    if (import.meta.env.PROD) {
      config.baseURL = window.location.origin;
    }
    
    console.log('[API Request]', {
      method: config.method,
      url: config.url,
      data: config.data,
      headers: config.headers,
      baseURL: config.baseURL,
      fullURL: config.baseURL + (config.url || '')
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

interface ManualPaymentPayload {
  reservation_id: string;
  amount_usd: number;
  payment_channel: string;
  payment_method: string;
  reference_number: string;
  notes: string;
  hotel_id: string | null;
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

export const manualPayment = async (payload: ManualPaymentPayload): Promise<any> => {
  try {
    console.log('[API] Sending Manual Payment request:', payload);
    const response = await apiService.post('/api/cards/manual-payment', payload);
    console.log('[API] Manual Payment response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('[API] Manual Payment request failed:', {
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

export const updateCardStatus = async (id: string, status: string): Promise<VirtualCard> => {
  console.log('[API] Updating card status:', { id, status });
  const response = await apiService.post('/api/cards/update-status', { id, status });
  console.log('[API] Status update response:', response.data);
  
  // Fetch the updated card data
  const updatedCard = await getReservations();
  const card = updatedCard.find((c: VirtualCard) => c.id === id);
  
  if (!card) {
    throw new Error('Card not found after update');
  }
  
  return card;
};

export default apiService; 