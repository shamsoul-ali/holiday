import { create } from 'zustand';
import { TierType, TripPackage, Itinerary, WizardState } from '@/types';
import { islandPackages, sabahDestinations, sabahEvents, getUpcomingEvents } from '@/data';
import { getItineraryForDuration } from '@/data/itineraries';

interface TripState {
  // Wizard
  wizard: WizardState;
  setWizardStep: (step: number) => void;
  updateWizard: (data: Partial<WizardState>) => void;
  resetWizard: () => void;
  suggestDestination: () => void;

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

export const getBayuSuggestion = (budget: number, startDate: string): { destination: string; reasons: string[] } => {
  const month = startDate ? parseInt(startDate.substring(5, 7), 10) : new Date().getMonth() + 1;
  const matchingEvents = sabahEvents.filter((e) => e.month === month);
  const reasons: string[] = [];

  // Add matching event reasons
  matchingEvents.slice(0, 2).forEach((evt) => {
    reasons.push(`${evt.name} ${evt.dateRange}`);
  });

  let destination: string;
  if (budget <= 1500) {
    // Budget-friendly destinations
    const budgetDests = sabahDestinations.filter((d) => d.price <= 350);
    const pick = budgetDests.length > 0 ? budgetDests[0] : sabahDestinations.find((d) => d.id === 'poring')!;
    destination = pick.name;
    if (pick.bestTimeToVisit !== 'Year-round') {
      const months = pick.bestTimeToVisit.split('-');
      reasons.push(`Best time to visit: ${pick.bestTimeToVisit}`);
    }
  } else if (budget <= 3500) {
    // Mid-range: Sipadan/Mabul or Kinabatangan
    const midDests = sabahDestinations.filter((d) => d.price >= 600 && d.price <= 1800);
    const pick = midDests.length > 0 ? midDests[0] : sabahDestinations[0];
    destination = pick.name;
    if (pick.bestTimeToVisit !== 'Year-round') {
      reasons.push(`Peak season: ${pick.bestTimeToVisit}`);
    }
  } else {
    // Premium: Sipadan + Danum Valley combo
    destination = 'Sipadan Island';
    reasons.push('Peak diving season (Apr-Oct)');
    reasons.push('Danum Valley combo available');
  }

  // Add tourism promotion for featured events
  if (matchingEvents.some((e) => e.isFeatured)) {
    reasons.push('Tourism Sabah 2026 campaign');
  }

  // Fallback reasons
  if (reasons.length === 0) {
    reasons.push('Year-round destination', 'Bayu AI top pick');
  }

  return { destination, reasons: reasons.slice(0, 3) };
};

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
  useBayuSuggestion: true,
  exactDate: '',
  suggestedReasons: [],
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

  suggestDestination: () => {
    const { wizard } = get();
    const { destination, reasons } = getBayuSuggestion(wizard.budget, wizard.startDate);
    set((s) => ({
      wizard: { ...s.wizard, destination, useBayuSuggestion: true, suggestedReasons: reasons },
    }));
  },

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
