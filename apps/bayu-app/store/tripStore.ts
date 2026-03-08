import { create } from 'zustand';
import { TierType, TripPackage, Itinerary, WizardState } from '@/types';
import { islandPackages } from '@/data';
import { getItineraryForDuration } from '@/data/itineraries';

interface TripState {
  // Wizard
  wizard: WizardState;
  setWizardStep: (step: number) => void;
  updateWizard: (data: Partial<WizardState>) => void;
  resetWizard: () => void;

  // Generation
  isGenerating: boolean;
  generationMessage: string;
  generateTrip: () => Promise<void>;

  // Results
  packages: TripPackage[];
  selectedPackage: TripPackage | null;
  selectPackage: (pkg: TripPackage) => void;

  // Itinerary
  currentItinerary: Itinerary | null;
  selectedDay: number;
  setSelectedDay: (day: number) => void;

  // Add-ons
  addOns: string[];
  toggleAddOn: (addOn: string) => void;
}

export const DEPARTURE_CITIES = [
  'Kuala Lumpur',
  'Penang',
  'Johor Bahru',
  'Kuching',
  'Singapore',
  'Kota Bharu',
  'Langkawi',
] as const;

const defaultWizard: WizardState = {
  step: 1,
  destination: '',
  departureCity: 'Kuala Lumpur',
  startDate: '',
  endDate: '',
  duration: '3D2N',
  budget: 3000,
  adults: 2,
  children: 0,
  infants: 0,
  interests: [],
  travelStyle: 'comfort',
};

const buildGenerationMessages = (wizard: WizardState): string[] => {
  const dest = wizard.destination || 'Sabah';
  const dur = wizard.duration || '3D2N';
  const city = wizard.departureCity || 'KL';
  return [
    `Searching flights from ${city}...`,
    `Checking ${dest} permits & availability...`,
    `Scanning crowd levels at islands...`,
    `Finding halal restaurants for ${dur}...`,
    `Checking tide & weather conditions...`,
    `Contacting verified local guides...`,
    `Optimizing your ${dest} adventure...`,
    'Bayu AI is almost ready...',
  ];
};

export const useTripStore = create<TripState>((set, get) => ({
  wizard: { ...defaultWizard },
  setWizardStep: (step) => set((s) => ({ wizard: { ...s.wizard, step } })),
  updateWizard: (data) => set((s) => ({ wizard: { ...s.wizard, ...data } })),
  resetWizard: () => set({ wizard: { ...defaultWizard }, packages: [], selectedPackage: null, currentItinerary: null, addOns: [] }),

  isGenerating: false,
  generationMessage: '',
  generateTrip: async () => {
    set({ isGenerating: true });
    const messages = buildGenerationMessages(get().wizard);
    for (const msg of messages) {
      set({ generationMessage: msg });
      await new Promise((r) => setTimeout(r, 700));
    }
    set({ isGenerating: false, packages: islandPackages });
  },

  packages: [],
  selectedPackage: null,
  selectPackage: (pkg) => {
    const { wizard } = get();
    const itinerary = getItineraryForDuration(
      wizard.duration,
      wizard.destination ? `${wizard.destination}, Malaysia` : 'Sabah, Malaysia',
      wizard.startDate || '2026-04-15',
      wizard.departureCity,
    );
    set({ selectedPackage: pkg, currentItinerary: itinerary });
  },

  currentItinerary: null,
  selectedDay: 1,
  setSelectedDay: (day) => set({ selectedDay: day }),

  addOns: [],
  toggleAddOn: (addOn) => {
    const current = get().addOns;
    if (current.includes(addOn)) {
      set({ addOns: current.filter((a) => a !== addOn) });
    } else {
      set({ addOns: [...current, addOn] });
    }
  },
}));
