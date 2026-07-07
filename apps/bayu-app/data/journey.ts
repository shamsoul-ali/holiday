import { Booking, Itinerary, JourneyStep, JourneyStepStatus, JourneyStepType, JourneySummary } from '@/types';

const getIconForType = (type: string): string => {
  switch (type) {
    case 'transport': return 'car';
    case 'meal': return 'restaurant';
    case 'activity': return 'compass';
    case 'hotel': return 'bed';
    case 'shopping': return 'bag';
    default: return 'ellipse';
  }
};

const getIconForActivity = (title: string, type: string): string => {
  const lower = title.toLowerCase();
  if (lower.includes('dive') || lower.includes('snorkel') || lower.includes('reef')) return 'water';
  if (lower.includes('boat') || lower.includes('ferry')) return 'boat';
  if (lower.includes('flight') || lower.includes('depart') || lower.includes('arrive')) return 'airplane';
  if (lower.includes('jungle') || lower.includes('river') || lower.includes('wildlife') || lower.includes('orangutan')) return 'leaf';
  if (lower.includes('hike') || lower.includes('walk') || lower.includes('trail')) return 'footsteps';
  if (lower.includes('check-in') || lower.includes('check-out') || lower.includes('resort') || lower.includes('lodge')) return 'bed';
  if (lower.includes('transfer') || lower.includes('drive')) return 'car';
  if (lower.includes('breakfast') || lower.includes('lunch') || lower.includes('dinner') || lower.includes('bbq') || lower.includes('seafood') || lower.includes('meal')) return 'restaurant';
  if (lower.includes('sunset') || lower.includes('sunrise')) return 'sunny';
  return getIconForType(type);
};

const getJourneyStepType = (activityType: string, title: string): JourneyStepType => {
  const lower = title.toLowerCase();
  if (lower.includes('flight') || lower.includes('depart')) return 'flight';
  if (lower.includes('arrive')) return 'arrival';
  if (lower.includes('transfer') || lower.includes('drive') || lower.includes('boat') || lower.includes('ferry')) return 'transfer';
  if (lower.includes('check-in') || lower.includes('briefing')) return 'hotel-checkin';
  if (lower.includes('check-out')) return 'hotel-checkout';
  if (activityType === 'meal') return 'meal';
  if (activityType === 'activity') return 'activity';
  if (activityType === 'transport') return 'transfer';
  return 'activity';
};

const getStatus = (stepIndex: number, currentIndex: number): JourneyStepStatus => {
  if (stepIndex < currentIndex) return 'completed';
  if (stepIndex === currentIndex) return 'current';
  return 'upcoming';
};

export const buildJourneyTimeline = (
  booking: Booking,
  itinerary: Itinerary,
  currentIndex: number,
): JourneyStep[] => {
  const steps: JourneyStep[] = [];
  let idx = 0;

  // Pre-trip steps (day 0)
  const preDate = itinerary.startDate;
  steps.push({
    id: `j-pre-1`,
    type: 'pre-trip',
    icon: 'briefcase',
    time: '20:00',
    date: preDate,
    day: 0,
    title: 'Packing Complete',
    description: 'All essentials packed — dive gear, sunscreen, waterproof bag, camera.',
    status: getStatus(idx++, currentIndex),
    tips: 'Don\'t forget your underwater camera!',
  });

  steps.push({
    id: `j-pre-2`,
    type: 'pre-trip',
    icon: 'document-text',
    time: '21:00',
    date: preDate,
    day: 0,
    title: 'Boarding Pass Ready',
    description: `${itinerary.flight.airline} ${itinerary.flight.flightNumber} — checked in online.`,
    status: getStatus(idx++, currentIndex),
  });

  // Map itinerary days to journey steps
  for (const day of itinerary.days) {
    for (const activity of day.activities) {
      steps.push({
        id: `j-${activity.id}`,
        type: getJourneyStepType(activity.type, activity.title),
        icon: getIconForActivity(activity.title, activity.type),
        time: activity.time,
        date: day.date,
        day: day.day,
        title: activity.title,
        description: activity.description || activity.location,
        status: getStatus(idx++, currentIndex),
        location: activity.location,
        tips: activity.tips,
        cost: activity.cost > 0 ? activity.cost : undefined,
        duration: activity.duration,
      });
    }
  }

  // Trip complete
  steps.push({
    id: `j-complete`,
    type: 'trip-complete',
    icon: 'trophy',
    time: '20:05',
    date: itinerary.endDate,
    day: itinerary.days.length,
    title: 'Trip Complete!',
    description: `Amazing ${itinerary.days.length}-day Sabah adventure completed. Welcome home!`,
    status: getStatus(idx++, currentIndex),
  });

  return steps;
};

export const buildJourneySummary = (itinerary: Itinerary): JourneySummary => {
  let totalSpent = 0;
  let activitiesCompleted = 0;
  let divesLogged = 0;
  const places = new Set<string>();

  for (const day of itinerary.days) {
    for (const activity of day.activities) {
      totalSpent += activity.cost;
      if (activity.location) places.add(activity.location);
      if (activity.type === 'activity') {
        activitiesCompleted++;
        if (activity.title.toLowerCase().includes('dive') || activity.title.toLowerCase().includes('snorkel')) {
          divesLogged++;
        }
      }
    }
  }

  // Add flight + hotel costs
  totalSpent += itinerary.flight.price + itinerary.hotel.totalPrice;

  return {
    totalDays: itinerary.days.length,
    totalSpent,
    placesVisited: places.size,
    activitiesCompleted,
    divesLogged,
    memoriesMade: activitiesCompleted + divesLogged + itinerary.days.length,
  };
};
