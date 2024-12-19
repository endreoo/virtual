import { VirtualCard } from './types';

export const mockReservations: VirtualCard[] = [
  {
    id: '1',
    guestName: 'John Doe',
    checkInDate: '2024-03-15',
    checkOutDate: '2024-03-20',
    Hotel: 'Grand Hotel',
    remainingBalance: 500.00,
    status: 'pending',
    bookingSource: 'Expedia',
    currency: 'USD'
  },
  {
    id: '2',
    guestName: 'Jane Smith',
    checkInDate: '2024-03-18',
    checkOutDate: '2024-03-25',
    Hotel: 'Luxury Resort',
    remainingBalance: 750.00,
    status: 'active',
    bookingSource: 'Booking.com',
    currency: 'USD'
  },
  {
    id: '3',
    guestName: 'Mike Johnson',
    checkInDate: '2024-03-10',
    checkOutDate: '2024-03-12',
    Hotel: 'City Hotel',
    remainingBalance: 200.00,
    status: 'completed',
    bookingSource: 'Direct',
    currency: 'USD'
  }
]; 