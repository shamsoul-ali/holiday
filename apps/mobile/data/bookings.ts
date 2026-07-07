import { Booking, WalletTransaction } from '@/types';

export const mockBookings: Booking[] = [
  {
    id: 'BK001',
    itineraryId: 'itin-tokyo-comfort',
    destination: 'Tokyo, Japan',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400',
    startDate: '2026-04-15',
    endDate: '2026-04-19',
    status: 'confirmed',
    totalCost: 8500,
    currency: 'MYR',
    travelers: 2,
    paymentMethod: 'fpx',
    reference: 'HA7X9K2M',
    createdAt: '2026-03-01T10:30:00Z',
  },
  {
    id: 'BK002',
    itineraryId: 'itin-bali',
    destination: 'Bali, Indonesia',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400',
    startDate: '2026-06-20',
    endDate: '2026-06-25',
    status: 'pending',
    totalCost: 4400,
    currency: 'MYR',
    travelers: 2,
    paymentMethod: 'card',
    reference: 'HA3M8P1Q',
    createdAt: '2026-02-28T15:00:00Z',
  },
  {
    id: 'BK003',
    itineraryId: 'itin-istanbul',
    destination: 'Istanbul, Turkey',
    image: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=400',
    startDate: '2025-12-10',
    endDate: '2025-12-16',
    status: 'completed',
    totalCost: 7600,
    currency: 'MYR',
    travelers: 2,
    paymentMethod: 'ewallet',
    reference: 'HA9B4K7R',
    createdAt: '2025-11-20T09:00:00Z',
  },
];

export const mockWallet = {
  balance: 2450.00,
  currency: 'MYR',
  loyaltyPoints: 12500,
  pointsValue: 125.00,
};

export const mockTransactions: WalletTransaction[] = [
  { id: 'TX001', type: 'credit' as const, amount: 500, description: 'Booking refund - Langkawi trip', date: '2026-02-25T10:00:00Z', reference: 'REF-001' },
  { id: 'TX002', type: 'debit' as const, amount: 200, description: 'Partial payment - Bali trip', date: '2026-02-28T15:00:00Z', reference: 'HA3M8P1Q' },
  { id: 'TX003', type: 'credit' as const, amount: 1500, description: 'Wallet top-up', date: '2026-02-20T08:00:00Z' },
  { id: 'TX004', type: 'credit' as const, amount: 650, description: 'Cashback reward - Tokyo booking', date: '2026-03-01T12:00:00Z', reference: 'HA7X9K2M' },
];
