import { Booking, WalletTransaction } from '@/types';

export const mockBookings: Booking[] = [
  {
    id: 'BK001',
    itineraryId: 'itin-sabah-comfort',
    destination: 'Sipadan Island, Sabah',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400',
    startDate: '2026-04-15',
    endDate: '2026-04-18',
    status: 'confirmed',
    totalCost: 3500,
    currency: 'MYR',
    travelers: 2,
    paymentMethod: 'fpx',
    reference: 'BY7X9K2M',
    createdAt: '2026-03-01T10:30:00Z',
  },
  {
    id: 'BK002',
    itineraryId: 'itin-kinabalu',
    destination: 'Mount Kinabalu, Sabah',
    image: 'https://images.unsplash.com/photo-1600586103402-4d1e0e05e1c5?w=400',
    startDate: '2026-05-10',
    endDate: '2026-05-12',
    status: 'pending',
    totalCost: 2800,
    currency: 'MYR',
    travelers: 2,
    paymentMethod: 'card',
    reference: 'BY3M8P1Q',
    createdAt: '2026-02-28T15:00:00Z',
  },
  {
    id: 'BK003',
    itineraryId: 'itin-kinabatangan',
    destination: 'Kinabatangan Safari, Sabah',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=400',
    startDate: '2025-12-10',
    endDate: '2025-12-12',
    status: 'completed',
    totalCost: 2200,
    currency: 'MYR',
    travelers: 2,
    paymentMethod: 'ewallet',
    reference: 'BY9B4K7R',
    createdAt: '2025-11-20T09:00:00Z',
  },
];

export const mockWallet = {
  balance: 1850.00,
  currency: 'MYR',
  loyaltyPoints: 8500,
  pointsValue: 85.00,
};

export const mockTransactions: WalletTransaction[] = [
  { id: 'TX001', type: 'credit' as const, amount: 350, description: 'Booking refund - TAR Park trip', date: '2026-02-25T10:00:00Z', reference: 'REF-001' },
  { id: 'TX002', type: 'debit' as const, amount: 200, description: 'Partial payment - Kinabalu trip', date: '2026-02-28T15:00:00Z', reference: 'BY3M8P1Q' },
  { id: 'TX003', type: 'credit' as const, amount: 1200, description: 'Wallet top-up', date: '2026-02-20T08:00:00Z' },
  { id: 'TX004', type: 'credit' as const, amount: 500, description: 'Eco-reward - Kinabatangan safari', date: '2026-03-01T12:00:00Z', reference: 'BY9B4K7R' },
];
