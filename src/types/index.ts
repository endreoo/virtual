export interface VirtualCard {
  id: string;
  guestName: string;
  hotelName: string;
  checkInDate: string;
  checkOutDate: string;
  remainingBalance: number;
  currency: string;
  status: 'active' | 'pending' | 'completed' | 'cancelled';
  source: string;
}

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