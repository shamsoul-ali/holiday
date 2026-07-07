import { create } from 'zustand';
import { TierType, UmrahPackage, UmrahItinerary, WizardState } from '@/types';
import { umrahPackages, umrahItinerary } from '@/data';

interface UmrahState {
  wizard: WizardState;
  setWizardStep: (step: number) => void;
  updateWizard: (data: Partial<WizardState>) => void;
  resetWizard: () => void;

  isGenerating: boolean;
  generationMessage: string;
  generatePackages: () => Promise<void>;

  packages: UmrahPackage[];
  selectedPackage: UmrahPackage | null;
  selectPackage: (pkg: UmrahPackage) => void;

  currentItinerary: UmrahItinerary | null;
  selectedDay: number;
  setSelectedDay: (day: number) => void;

  addOns: string[];
  toggleAddOn: (addOn: string) => void;
}

const defaultWizard: WizardState = {
  step: 1,
  tier: 'standard',
  departureCity: 'Kuala Lumpur (KUL)',
  startDate: '',
  endDate: '',
  adults: 2,
  children: 0,
  infants: 0,
  roomType: 'twin',
  addOns: [],
};

const generationMessages = [
  'Menyemak ketersediaan hotel berhampiran Haram...',
  'Mengesahkan slot penerbangan Malaysia Airlines...',
  'Menyediakan jadual ziarah anda...',
  'Menugaskan mutawif berpengalaman...',
  'Menyusun pakej mengikut bajet anda...',
  'Mengesahkan visa dan insurans...',
  'Andalusia AI hampir siap...',
];

export const useUmrahStore = create<UmrahState>((set, get) => ({
  wizard: { ...defaultWizard },
  setWizardStep: (step) => set((s) => ({ wizard: { ...s.wizard, step } })),
  updateWizard: (data) => set((s) => ({ wizard: { ...s.wizard, ...data } })),
  resetWizard: () => set({ wizard: { ...defaultWizard }, packages: [], selectedPackage: null, currentItinerary: null, addOns: [] }),

  isGenerating: false,
  generationMessage: '',
  generatePackages: async () => {
    set({ isGenerating: true });
    for (const msg of generationMessages) {
      set({ generationMessage: msg });
      await new Promise((r) => setTimeout(r, 700));
    }
    set({ isGenerating: false, packages: umrahPackages });
  },

  packages: [],
  selectedPackage: null,
  selectPackage: (pkg) => set({ selectedPackage: pkg, currentItinerary: umrahItinerary }),

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
