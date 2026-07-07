import { User, Notification } from '@/types';

export const mockUser: User = {
  id: 'usr_001',
  name: 'Ahmad Hazman',
  email: 'ahmad@example.com',
  phone: '+60123456789',
  nationality: 'Malaysian',
  tripsCount: 12,
  countriesVisited: 8,
  loyaltyPoints: 12500,
  preferredCurrency: 'MYR',
};

export const mockNotifications: Notification[] = [
  { id: 'n1', type: 'booking_confirmation', title: 'Booking Confirmed!', message: 'Your Tokyo trip (HA7X9K2M) has been confirmed. Check your itinerary for details.', time: '2h ago', read: false },
  { id: 'n2', type: 'weather_alert', title: 'Weather Update - Tokyo', message: 'Light rain expected on Apr 16. Pack an umbrella!', time: '5h ago', read: false },
  { id: 'n3', type: 'payment_reminder', title: 'Payment Due', message: 'Remaining balance of RM 2,200 for Bali trip is due by Mar 20.', time: '1d ago', read: true },
  { id: 'n4', type: 'check_in_reminder', title: 'Check-in Opens Soon', message: 'Online check-in for MH70 opens in 48 hours.', time: '2d ago', read: true },
];
