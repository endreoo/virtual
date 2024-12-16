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

export const mockVirtualCards: VirtualCard[] = [
  {
    id: "VC001",
    guestName: "John Doe",
    hotelName: "Grand Hotel",
    checkInDate: "2024-03-15",
    checkOutDate: "2024-03-20",
    remainingBalance: 1500,
    currency: "USD",
    status: "active",
    source: "Booking.com"
  }
]; 