import { LucideIcon } from 'lucide-react';

export interface VirtualCard {
  id: string;
  cardNumber?: string;
  expirationDate?: string;
  cvv?: string;
  currency: string;
  guestName: string;
  Hotel: string;
  checkInDate: string;
  checkOutDate: string;
  remainingBalance: number;
  initialBalance?: number;
  status: string;
  notes?: string;
  card_status?: string;
  fullSidePanelText?: string;
  lastScrapedAt?: string;
  bookingSource: string;
  hotelId?: number;
  expedia_reservation_id?: number;
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

export type PaymentMethod = 'flutterwave' | 'stripe' | 'im_bank' | 'manual' | 'link' | 'doNotCharge' | null;

export type ActiveTab = 'info' | 'payment' | 'notes' | 'transactions';

export interface PaymentMethodOption {
  id: PaymentMethod;
  name: string;
  icon: LucideIcon;
  description: string;
  color: string;
  bgHover: string;
  bgSelected: string;
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