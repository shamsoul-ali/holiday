import { addDays, format, parseISO } from 'date-fns';
import { DurationPreset, Itinerary, ScheduleActivity, DaySchedule, SabahDestination } from '@/types';
import { getBlocksForDestination, DestinationBlockSet, ActivityBlock } from './destination-blocks';
import { sabahDestinations } from './destinations';
import { getPackagesForDestination } from './destination-packages';

const durationToDays: Record<DurationPreset, number> = {
  '2D1N': 2,
  '3D2N': 3,
  '4D3N': 4,
  '5D4N': 5,
  '7D6N': 7,
};

/**
 * Compose days from available activity blocks. Strategy:
 *  - day 1 = arrival + afternoon + evening
 *  - middle days = dawn/morning + midday + afternoon + sunset + evening
 *  - last day = morning + departure
 * If a slot is missing for a destination we fall back to a generic filler.
 */
function composeDays(
  blocks: ActivityBlock[],
  dayCount: number,
  dest: SabahDestination | undefined,
): { title: string; activities: Omit<ScheduleActivity, 'id'>[] }[] {
  const bySlot = (slot: ActivityBlock['slot']) => blocks.find((b) => b.slot === slot);

  const arrival = bySlot('arrival');
  const morning = bySlot('morning');
  const midday = bySlot('midday');
  const afternoon = bySlot('afternoon');
  const sunset = bySlot('sunset');
  const evening = bySlot('evening');
  const dawn = bySlot('dawn');
  const departure = bySlot('departure');

  const pickTitle = (b: ActivityBlock | undefined, fallback: string) => b?.dayTitle || fallback;
  const pickActivities = (b: ActivityBlock | undefined) => b?.activities || [];

  const daysOut: { title: string; activities: Omit<ScheduleActivity, 'id'>[] }[] = [];

  if (dayCount === 2) {
    // 2D1N — compact: arrival+evening | morning+departure
    daysOut.push({
      title: pickTitle(arrival, `Arrival in ${dest?.name || 'Sabah'}`),
      activities: [...pickActivities(arrival), ...pickActivities(afternoon), ...pickActivities(evening)],
    });
    daysOut.push({
      title: pickTitle(departure, 'Highlights & Departure'),
      activities: [...pickActivities(dawn), ...pickActivities(morning), ...pickActivities(departure)],
    });
    return daysOut;
  }

  if (dayCount === 3) {
    // 3D2N — arrival | main day | departure
    daysOut.push({
      title: pickTitle(arrival, `Arrival in ${dest?.name || 'Sabah'}`),
      activities: [...pickActivities(arrival), ...pickActivities(afternoon), ...pickActivities(evening)],
    });
    daysOut.push({
      title: pickTitle(dawn, `${dest?.name || 'Sabah'} Full Day`),
      activities: [...pickActivities(dawn), ...pickActivities(morning), ...pickActivities(midday), ...pickActivities(sunset), ...pickActivities(evening)],
    });
    daysOut.push({
      title: pickTitle(departure, 'Farewell & Departure'),
      activities: [...pickActivities(dawn), ...pickActivities(departure)],
    });
    return daysOut;
  }

  if (dayCount === 4) {
    // 4D3N — arrival | experience | exploration | departure
    daysOut.push({
      title: pickTitle(arrival, `Arrival in ${dest?.name || 'Sabah'}`),
      activities: [...pickActivities(arrival), ...pickActivities(afternoon), ...pickActivities(evening)],
    });
    daysOut.push({
      title: pickTitle(dawn, 'Main Adventure'),
      activities: [...pickActivities(dawn), ...pickActivities(morning), ...pickActivities(midday), ...pickActivities(sunset), ...pickActivities(evening)],
    });
    daysOut.push({
      title: pickTitle(morning, 'Exploration Day'),
      activities: [...pickActivities(morning), ...pickActivities(midday), ...pickActivities(afternoon), ...pickActivities(evening)],
    });
    daysOut.push({
      title: pickTitle(departure, 'Farewell & Departure'),
      activities: [...pickActivities(departure)],
    });
    return daysOut;
  }

  if (dayCount === 5) {
    daysOut.push({
      title: pickTitle(arrival, `Arrival in ${dest?.name || 'Sabah'}`),
      activities: [...pickActivities(arrival), ...pickActivities(afternoon), ...pickActivities(evening)],
    });
    daysOut.push({
      title: pickTitle(dawn, 'Main Adventure'),
      activities: [...pickActivities(dawn), ...pickActivities(morning), ...pickActivities(midday), ...pickActivities(evening)],
    });
    daysOut.push({
      title: pickTitle(morning, 'Deep Exploration'),
      activities: [...pickActivities(morning), ...pickActivities(midday), ...pickActivities(sunset), ...pickActivities(evening)],
    });
    daysOut.push({
      title: pickTitle(afternoon, 'Extended Stay'),
      activities: [...pickActivities(morning), ...pickActivities(afternoon), ...pickActivities(evening)],
    });
    daysOut.push({
      title: pickTitle(departure, 'Farewell & Departure'),
      activities: [...pickActivities(departure)],
    });
    return daysOut;
  }

  // 7D6N — slower paced, more rest + exploration
  daysOut.push({
    title: pickTitle(arrival, `Arrival in ${dest?.name || 'Sabah'}`),
    activities: [...pickActivities(arrival), ...pickActivities(afternoon), ...pickActivities(evening)],
  });
  for (let i = 1; i < dayCount - 1; i++) {
    const isMainDay = i === 1 || i === 3;
    daysOut.push({
      title: isMainDay ? `Adventure Day ${i}` : `Exploration Day ${i}`,
      activities: isMainDay
        ? [...pickActivities(dawn), ...pickActivities(morning), ...pickActivities(midday), ...pickActivities(sunset), ...pickActivities(evening)]
        : [...pickActivities(morning), ...pickActivities(afternoon), ...pickActivities(evening)],
    });
  }
  daysOut.push({
    title: pickTitle(departure, 'Farewell & Departure'),
    activities: [...pickActivities(departure)],
  });
  return daysOut;
}

// Attach unique activity ids (needed for React keys)
function withIds(
  activities: Omit<ScheduleActivity, 'id'>[],
  prefix: string,
): ScheduleActivity[] {
  return activities.map((a, i) => ({ ...a, id: `${prefix}-${i}` }));
}

// Derive total cost from all activities × party + hotel nights + flight
function estimateTotalCost(days: DaySchedule[], hotelPerNight: number, nights: number, flightPerPerson: number, party: number): number {
  const activityTotal = days.reduce((sum, day) => sum + day.activities.reduce((s, a) => s + (a.cost || 0), 0), 0);
  return Math.round(activityTotal * party + hotelPerNight * nights + flightPerPerson * party);
}

export function generateDestinationItinerary(
  destinationInput: string,
  duration: DurationPreset,
  startDate: string,
  departureCity: string,
  travelers: { adults: number; children: number; infants: number } = { adults: 2, children: 0, infants: 0 },
  packageId = 'auto',
): Itinerary | null {
  // Normalise to destination id
  const dest = sabahDestinations.find(
    (d) => d.id === destinationInput || d.name === destinationInput,
  );
  if (!dest) return null;

  const blockSet = getBlocksForDestination(dest.id);
  if (!blockSet) return null;

  const daysCount = durationToDays[duration] || 3;
  const nightsCount = daysCount - 1;
  const start = parseISO(startDate || '2026-04-15');

  // Compose
  const composed = composeDays(blockSet.blocks, daysCount, dest);

  const daysOut: DaySchedule[] = composed.map((d, i) => ({
    day: i + 1,
    date: format(addDays(start, i), 'yyyy-MM-dd'),
    title: d.title,
    activities: withIds(d.activities, `${dest.id}-d${i + 1}`),
  }));

  const party = (travelers.adults || 0) + (travelers.children || 0);
  const flightPerPerson = 400;
  const totalCost = estimateTotalCost(daysOut, blockSet.hotelPricePerNight, nightsCount, flightPerPerson, Math.max(1, party));

  // Airport codes — default to KUL for outbound
  const outboundCode = departureCity?.toLowerCase().includes('kuala') || !departureCity ? 'KUL' : departureCity.substring(0, 3).toUpperCase();
  const outboundAirport = outboundCode === 'KUL' ? 'KLIA2' : `${departureCity} Airport`;

  return {
    id: `itin-${dest.id}-${duration.toLowerCase()}-${Date.now()}`,
    packageId,
    destination: `${dest.name}, Sabah`,
    destinationId: dest.id,
    departureCity: departureCity || 'Kuala Lumpur',
    startDate: format(start, 'yyyy-MM-dd'),
    endDate: format(addDays(start, daysCount - 1), 'yyyy-MM-dd'),
    travelers,
    totalCost,
    currency: 'MYR',
    weather: blockSet.weather,
    days: daysOut,
    flight: {
      airline: 'AirAsia',
      flightNumber: 'AK5106',
      departure: { airport: outboundAirport, time: '07:00', code: outboundCode },
      arrival: { airport: blockSet.arrivalAirportName, time: '09:35', code: blockSet.arrivalAirportCode },
      duration: '2h 35m',
      class: 'Economy',
      price: flightPerPerson,
      returnFlight: {
        flightNumber: 'AK5107',
        departure: { airport: blockSet.arrivalAirportName, time: '17:30', code: blockSet.arrivalAirportCode },
        arrival: { airport: outboundAirport, time: '20:05', code: outboundCode },
        duration: '2h 35m',
      },
    },
    hotel: {
      name: blockSet.hotelName,
      stars: blockSet.hotelStars,
      location: blockSet.hotelLocation,
      roomType: 'Standard Room',
      pricePerNight: blockSet.hotelPricePerNight,
      nights: nightsCount,
      totalPrice: blockSet.hotelPricePerNight * nightsCount,
      amenities: blockSet.hotelAmenities,
      image: blockSet.hotelImage,
    },
  };
}

// Convenience: pick the recommended (comfort) package for a destination
export function getRecommendedPackageIdForDestination(destinationId: string): string {
  const pkgs = getPackagesForDestination(destinationId);
  const recommended = pkgs.find((p) => p.isRecommended) || pkgs.find((p) => p.tier === 'comfort') || pkgs[0];
  return recommended?.id || 'island-comfort';
}
