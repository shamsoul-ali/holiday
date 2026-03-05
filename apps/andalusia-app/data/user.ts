import { JemaahProfile, Notification } from '@/types';

export const mockUser: JemaahProfile = {
  id: 'usr_001',
  name: 'Siti Aminah binti Abdullah',
  email: 'siti.aminah@example.com',
  phone: '+60123456789',
  icNumber: '790415-10-XXXX',
  passportNumber: 'A12345678',
  nationality: 'Malaysian',
  state: 'Selangor',
  umrahCount: 2,
  hajjCount: 0,
  loyaltyPoints: 8500,
  preferredCurrency: 'MYR',
  membershipTier: 'gold',
};

export const mockNotifications: Notification[] = [
  { id: 'n1', type: 'visa_update', title: 'Visa Diluluskan!', message: 'Visa umrah anda untuk perjalanan 10 Mei telah diluluskan. Sila semak dokumen.', time: '2h lalu', read: false },
  { id: 'n2', type: 'kursus_reminder', title: 'Kursus Umrah: Modul Tawaf', message: 'Anda belum selesaikan Modul 3 - Tawaf. Teruskan pembelajaran anda.', time: '5h lalu', read: false },
  { id: 'n3', type: 'departure_reminder', title: 'Peringatan Berlepas', message: 'Perjalanan umrah anda tinggal 66 hari lagi. Pastikan dokumen lengkap!', time: '1h lalu', read: true },
  { id: 'n4', type: 'cabutan_result', title: 'Cabutan Umrah Percuma', message: 'Cabutan minggu ini: Puan Halimah dari Johor memenangi pakej Umrah Ekonomi!', time: '2h lalu', read: true },
];
