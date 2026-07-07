import { create } from 'zustand';
import { Booking, BookingStatus, PaymentMethod, WalletTransaction } from '@/types';
import { mockBookings, mockWallet, mockTransactions } from '@/data';

interface BookingState {
  bookings: Booking[];
  wallet: typeof mockWallet;
  transactions: WalletTransaction[];

  // Payment
  selectedPaymentMethod: PaymentMethod;
  isProcessing: boolean;
  setPaymentMethod: (method: PaymentMethod) => void;

  // Actions
  createBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'reference'>) => string;
  processPayment: (bookingId: string) => Promise<boolean>;
  getBookingsByStatus: (status: BookingStatus) => Booking[];
  topUpWallet: (amount: number) => Promise<void>;
}

const generateReference = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'HA';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const useBookingStore = create<BookingState>((set, get) => ({
  bookings: mockBookings,
  wallet: { ...mockWallet },
  transactions: mockTransactions,

  selectedPaymentMethod: 'bayu-credit',
  isProcessing: false,
  setPaymentMethod: (method) => set({ selectedPaymentMethod: method }),

  createBooking: (data) => {
    const id = `BK${String(get().bookings.length + 1).padStart(3, '0')}`;
    const booking: Booking = {
      ...data,
      id,
      reference: generateReference(),
      createdAt: new Date().toISOString(),
    };
    set((s) => ({ bookings: [booking, ...s.bookings] }));
    return id;
  },

  processPayment: async (bookingId) => {
    set({ isProcessing: true });
    await new Promise((r) => setTimeout(r, 2000));
    set((s) => ({
      isProcessing: false,
      bookings: s.bookings.map((b) =>
        b.id === bookingId ? { ...b, status: 'confirmed' as BookingStatus } : b
      ),
    }));
    return true;
  },

  getBookingsByStatus: (status) => {
    return get().bookings.filter((b) => b.status === status);
  },

  topUpWallet: async (amount: number) => {
    set({ isProcessing: true });
    await new Promise((r) => setTimeout(r, 2000));
    set((s) => ({
      isProcessing: false,
      wallet: { ...s.wallet, balance: s.wallet.balance + amount },
      transactions: [
        { id: `TX${Date.now()}`, type: 'credit', amount, description: 'Wallet top-up', date: new Date().toISOString() },
        ...s.transactions,
      ],
    }));
  },
}));
