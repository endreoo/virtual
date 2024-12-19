export interface VirtualCard {
  id: string;
  guestName: string;
  checkInDate: string;
  checkOutDate: string;
  Hotel: string;
  remainingBalance: number;
  status: string;
  bookingSource: string;
  currency: string;
}

export interface Transaction {
  id: number | string;
  cardId: number;
  amount: number;
  type: 'payment' | 'refund' | 'adjustment' | 'external';
  source: 'flutterwave' | 'stripe' | 'manual' | 'system' | 'external';
  description: string;
  referenceNumber?: string;
  createdAt: string;
  balanceAfter: number;
  status: 'success' | 'pending' | 'failed';
  metadata?: Record<string, any>;
}

export type PaymentMethod = 'flutterwave' | 'stripe' | 'manual' | 'link' | 'doNotCharge' | null;

export type ActiveTab = 'info' | 'payment' | 'notes' | 'transactions';

export interface PaymentMethodOption {
  id: PaymentMethod;
  name: string;
  icon?: string;
  description: string;
}

export type SortDirection = 'asc' | 'desc';

export type SortConfig = {
  key: keyof VirtualCard | null;
  direction: SortDirection;
};

export interface Payment {
  id: string;
  cardId: string;
  amount: number;
  currency: string;
  date: string;
  type: 'charge' | 'payment' | 'adjustment';
  description: string;
}

export interface Note {
  id: string;
  cardId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}