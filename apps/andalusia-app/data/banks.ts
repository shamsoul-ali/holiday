import { Bank, EWallet } from '@/types';

export const banks: Bank[] = [
  { id: 'maybank', name: 'Maybank', shortName: 'MBB', icon: 'M', color: '#FDB813' },
  { id: 'cimb', name: 'CIMB Bank', shortName: 'CIMB', icon: 'C', color: '#EC1C24' },
  { id: 'public', name: 'Public Bank', shortName: 'PBB', icon: 'P', color: '#ED1C24' },
  { id: 'rhb', name: 'RHB Bank', shortName: 'RHB', icon: 'R', color: '#0051A5' },
  { id: 'hongleong', name: 'Hong Leong Bank', shortName: 'HLB', icon: 'H', color: '#005BAA' },
  { id: 'ambank', name: 'AmBank', shortName: 'AMB', icon: 'A', color: '#ED1C24' },
  { id: 'bankislam', name: 'Bank Islam', shortName: 'BIMB', icon: 'B', color: '#00A551' },
  { id: 'bsn', name: 'BSN', shortName: 'BSN', icon: 'B', color: '#003D79' },
];

export const eWallets: EWallet[] = [
  { id: 'tng', name: "Touch 'n Go", icon: 'T', color: '#005ABF' },
  { id: 'boost', name: 'Boost', icon: 'B', color: '#EE2737' },
  { id: 'grabpay', name: 'GrabPay', icon: 'G', color: '#00B14F' },
  { id: 'shopeepay', name: 'ShopeePay', icon: 'S', color: '#EE4D2D' },
];
