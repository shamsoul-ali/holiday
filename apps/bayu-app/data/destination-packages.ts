import { TripPackage } from '@/types';
import { islandPackages, mountainPackages, wildlifePackages, culturalPackages } from './packages';
import { sabahDestinations } from './destinations';

export type DestinationCategory = 'island' | 'mountain' | 'wildlife' | 'cultural';

export const destinationToPackageCategory: Record<string, DestinationCategory> = {
  // Islands — dive/snorkel/beach
  sipadan: 'island',
  mabul: 'island',
  kapalai: 'island',
  'tar-park': 'island',
  'tip-of-borneo': 'island',

  // Mountain — Kinabalu family
  kinabalu: 'mountain',
  kundasang: 'mountain',
  poring: 'mountain',

  // Wildlife — rainforest + river
  kinabatangan: 'wildlife',
  sepilok: 'wildlife',
  'danum-valley': 'wildlife',

  // Cultural — KK-centric
  'mari-mari': 'cultural',
};

const categoryToPackages: Record<DestinationCategory, TripPackage[]> = {
  island: islandPackages,
  mountain: mountainPackages,
  wildlife: wildlifePackages,
  cultural: culturalPackages,
};

// Destination-specific title/image overrides so the package feels tailored
interface PackageOverride {
  budgetTitle?: string;
  comfortTitle?: string;
  luxuryTitle?: string;
  location: string;
  image?: string;
}

const overrides: Record<string, PackageOverride> = {
  sipadan: {
    budgetTitle: 'Sipadan Dive Sampler',
    comfortTitle: 'Sipadan 3-Dive Classic',
    luxuryTitle: 'Sipadan Private Dive Retreat',
    location: 'Sipadan Island, Semporna',
    image: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800',
  },
  mabul: {
    budgetTitle: 'Mabul Macro Diver',
    comfortTitle: 'Mabul Water Village Stay',
    luxuryTitle: 'Mabul Resort Premium',
    location: 'Mabul Island, Semporna',
    image: 'https://images.unsplash.com/photo-1540202404-a2f29016b523?w=800',
  },
  kapalai: {
    budgetTitle: 'Kapalai Reef Explorer',
    comfortTitle: 'Kapalai Overwater Stay',
    luxuryTitle: 'Kapalai Sandbar Luxe',
    location: 'Kapalai, Semporna',
    image: 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=800',
  },
  'tar-park': {
    budgetTitle: 'TARP Island Day Trip',
    comfortTitle: 'TARP 5-Island Hop + Stay',
    luxuryTitle: 'TARP Private Yacht Charter',
    location: 'Tunku Abdul Rahman Park, KK',
    image: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800',
  },
  'tip-of-borneo': {
    budgetTitle: 'Tip of Borneo Day Escape',
    comfortTitle: 'Tip of Borneo Coastal Stay',
    luxuryTitle: 'Kudat Private Coastal Villa',
    location: 'Tanjung Simpang Mengayau, Kudat',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
  },

  kinabalu: {
    budgetTitle: 'Kinabalu Park Day',
    comfortTitle: 'Kinabalu Summit Classic',
    luxuryTitle: 'Kinabalu Via Ferrata Premium',
    location: 'Kinabalu Park, Ranau',
    image: 'https://images.unsplash.com/photo-1600586103402-4d1e0e05e1c5?w=800',
  },
  kundasang: {
    budgetTitle: 'Kundasang Highland Day',
    comfortTitle: 'Kundasang Farm & Viewpoints',
    luxuryTitle: 'Kundasang Kinabalu-View Resort',
    location: 'Kundasang, Ranau',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  },
  poring: {
    budgetTitle: 'Poring Hot Springs Day',
    comfortTitle: 'Poring + Canopy Walk',
    luxuryTitle: 'Poring Wellness Retreat',
    location: 'Poring, Ranau',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
  },

  kinabatangan: {
    budgetTitle: 'Kinabatangan Wildlife Intro',
    comfortTitle: 'Kinabatangan 3-Cruise Safari',
    luxuryTitle: 'Kinabatangan Eco-Lodge Private',
    location: 'Sukau, Kinabatangan',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
  },
  sepilok: {
    budgetTitle: 'Sepilok Orangutan Day',
    comfortTitle: 'Sepilok + Sun Bear Centre',
    luxuryTitle: 'Sepilok Wildlife Lodge',
    location: 'Sepilok, Sandakan',
    image: 'https://images.unsplash.com/photo-1605552955090-56ca0a56e2ee?w=800',
  },
  'danum-valley': {
    budgetTitle: 'Danum Valley Trekker',
    comfortTitle: 'Danum Valley Rainforest Lodge',
    luxuryTitle: 'Borneo Rainforest Lodge Premium',
    location: 'Danum Valley, Lahad Datu',
    image: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800',
  },

  'mari-mari': {
    budgetTitle: 'KK Cultural Half-Day',
    comfortTitle: 'Mari-Mari Village + KK',
    luxuryTitle: 'Sabah Heritage Premium',
    location: 'Mari-Mari Village, Kota Kinabalu',
    image: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7c?w=800',
  },
};

export function getPackagesForDestination(destinationInput: string): TripPackage[] {
  if (!destinationInput) return islandPackages;

  // Accept either id or display name; normalise to id
  const dest = sabahDestinations.find(
    (d) => d.id === destinationInput || d.name === destinationInput,
  );
  const destId = dest?.id;
  const category = destId ? destinationToPackageCategory[destId] : undefined;

  if (!category) return islandPackages;

  const source = categoryToPackages[category];
  const ov = destId ? overrides[destId] : undefined;
  if (!ov) return source;

  return source.map((pkg) => {
    const titleOverride =
      pkg.tier === 'budget' ? ov.budgetTitle
        : pkg.tier === 'comfort' ? ov.comfortTitle
          : pkg.tier === 'luxury' ? ov.luxuryTitle
            : undefined;
    return {
      ...pkg,
      title: titleOverride || pkg.title,
      destination: ov.location,
      image: ov.image || pkg.image,
    };
  });
}

export function getDestinationById(id: string) {
  return sabahDestinations.find((d) => d.id === id || d.name === id);
}
