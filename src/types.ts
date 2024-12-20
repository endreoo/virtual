export interface VirtualCard {
  id: string;
  cardNumber?: string;
  expirationDate?: string;
  cvv?: string;
  currency: string;
  guestName?: string;
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
  bookingSource?: string;
  hotelId?: number;
  expedia_reservation_id?: number;
}

export interface Transaction {
  id: number;
  amountCharged: number;
  dateOfPayment: string;
  paymentChannel: string;
  referenceNumber?: string;
  notes?: string;
}

export type PaymentMethod = 'flutterwave' | 'stripe' | 'manual' | 'link' | 'doNotCharge' | 'im_bank' | null;

export type ActiveTab = 'info' | 'payment' | 'notes' | 'transactions';

export type PaymentMethodOption = {
  id: string;
  name: string;
  icon: any;
  description: string;
  color: string;
  bgHover: string;
  bgSelected: string;
};

export type SortConfig = {
  key: keyof VirtualCard | null;
  direction: 'asc' | 'desc';
}; 