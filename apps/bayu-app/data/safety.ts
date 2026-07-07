import { SafetyAlert, EmergencyContact } from '@/types';

export const safetyAlerts: SafetyAlert[] = [
  {
    id: 'sa1',
    type: 'tide',
    severity: 'warning',
    title: 'High Tide Advisory - Semporna',
    message: 'High tide expected 2-4pm today. Shallow reef snorkeling may be affected. Boat transfers operating normally.',
    location: 'Semporna Islands',
    active: true,
  },
  {
    id: 'sa2',
    type: 'weather',
    severity: 'info',
    title: 'Afternoon Showers Expected',
    message: 'Brief thunderstorms expected 3-5pm in KK and west coast areas. Carry an umbrella.',
    location: 'Kota Kinabalu',
    active: true,
  },
  {
    id: 'sa3',
    type: 'trail',
    severity: 'danger',
    title: 'Trail Closure - Kinabalu Summit',
    message: 'Mesilau Trail temporarily closed due to landslide. Timpohon Trail remains open. All summit climbs proceed via Timpohon.',
    location: 'Mount Kinabalu',
    active: true,
  },
  {
    id: 'sa4',
    type: 'wildlife',
    severity: 'info',
    title: 'Elephant Sighting - Kinabatangan',
    message: 'Pygmy elephant herd spotted near Sukau village. Keep safe distance (50m minimum). Great photo opportunity!',
    location: 'Kinabatangan River',
    active: true,
  },
];

export const emergencyContacts: EmergencyContact[] = [
  { id: 'ec1', name: 'Police (General)', number: '999', type: 'police' },
  { id: 'ec2', name: 'Ambulance', number: '999', type: 'ambulance' },
  { id: 'ec3', name: 'Fire & Rescue', number: '994', type: 'fire' },
  { id: 'ec4', name: 'Coast Guard (MMEA)', number: '999', type: 'coast-guard' },
  { id: 'ec5', name: 'Queen Elizabeth Hospital KK', number: '+6088-517555', type: 'hospital' },
  { id: 'ec6', name: 'Sabah Parks HQ', number: '+6088-523500', type: 'tourism-hotline' },
  { id: 'ec7', name: 'Tourism Malaysia Hotline', number: '1300-88-5050', type: 'tourism-hotline' },
  { id: 'ec8', name: 'Semporna Police', number: '+6089-781222', type: 'police' },
];
