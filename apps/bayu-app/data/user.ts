import { User, Notification } from '@/types';

export const mockUser: User = {
  id: 'usr_001',
  name: 'Ahmad Hazman',
  email: 'ahmad@example.com',
  phone: '+60123456789',
  nationality: 'Malaysian',
  tripsCount: 8,
  countriesVisited: 5,
  loyaltyPoints: 8500,
  preferredCurrency: 'MYR',
};

export const mockNotifications: Notification[] = [
  { id: 'n1', type: 'booking_confirmation', title: 'Booking Confirmed!', message: 'Your Sipadan diving trip (BY7X9K2M) has been confirmed. Sipadan permit secured!', time: '2h ago', read: false },
  { id: 'n2', type: 'tide_alert', title: 'Tide Advisory - Semporna', message: 'High tide expected Apr 16, 2-4pm. Snorkeling conditions may be affected at shallow reefs.', time: '5h ago', read: false },
  { id: 'n3', type: 'payment_reminder', title: 'Payment Due', message: 'Remaining balance of RM 1,400 for Kinabalu expedition is due by Mar 20.', time: '1d ago', read: true },
  { id: 'n4', type: 'permit_confirmation', title: 'Permit Approved', message: 'Your Mount Kinabalu climbing permit for May 10 has been approved. Mountain guide assigned.', time: '2d ago', read: true },
];
