export interface VirtualCard {
  id: number;
  guestName: string;
  guestFullName: string;
  confirmationCode: string;
  checkInDate: string;
  checkOutDate: string;
  arrivalTime: string;
  bookingAmount: number;
  remainingBalance: number;
  currency: string;
  status: string;
  card_status: string;
  cardNumber: string;
  cvv: string;
  expirationDate: string;
  expiredCard: boolean;
  admin_check: 'yes' | 'no';
  admin_message: string;
  notes: string;
  roomType: string;
  roomDetails: string;
  specialRequests: string;
  phoneNumber: string;
  bookedOn: string;
  bookingSource: string;
  cancellationPolicy: string;
  chargeBefore: string;
  created_at: string;
  updated_at: string;
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