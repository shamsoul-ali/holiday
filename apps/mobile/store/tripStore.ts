import { create } from 'zustand';
import { TierType, TripPackage, Itinerary, WizardState } from '@/types';
import { tokyoPackages, tokyoItinerary } from '@/data';

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

const defaultWizard: WizardState = {
  step: 1,
  destination: '',
  departureCity: 'Kuala Lumpur',
  startDate: '',
  endDate: '',
  budget: 5000,
  adults: 2,
  children: 0,
  infants: 0,
  interests: [],
  travelStyle: 'comfort',
};

const generationMessages = [
  'Searching best flights...',
  'Finding halal restaurants...',
  'Curating local experiences...',
  'Optimizing your budget...',
  'Building your perfect itinerary...',
  'Almost ready...',
];

export const useTripStore = create<TripState>((set, get) => ({
  wizard: { ...defaultWizard },
  setWizardStep: (step) => set((s) => ({ wizard: { ...s.wizard, step } })),
  updateWizard: (data) => set((s) => ({ wizard: { ...s.wizard, ...data } })),
  resetWizard: () => set({ wizard: { ...defaultWizard }, packages: [], selectedPackage: null, currentItinerary: null, addOns: [] }),

  isGenerating: false,
  generationMessage: '',
  generateTrip: async () => {
    set({ isGenerating: true });
    for (const msg of generationMessages) {
      set({ generationMessage: msg });
      await new Promise((r) => setTimeout(r, 700));
    }
    set({ isGenerating: false, packages: tokyoPackages });
  },

  packages: [],
  selectedPackage: null,
  selectPackage: (pkg) => set({ selectedPackage: pkg, currentItinerary: tokyoItinerary }),

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
