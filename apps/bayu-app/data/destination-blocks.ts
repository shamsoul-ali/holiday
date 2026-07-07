/**
 * Per-destination activity blocks — building blocks composed into day-by-day
 * itineraries by the trip generator. Each block is a coherent ~half-day
 * experience rooted in real Sabah geography, tied where possible to food
 * spots and marketplace agents.
 */
import { ScheduleActivity } from '@/types';

export interface ActivityBlock {
  slot: 'arrival' | 'morning' | 'midday' | 'afternoon' | 'sunset' | 'evening' | 'dawn' | 'departure';
  dayTitle?: string; // hint for composing a day title
  activities: Omit<ScheduleActivity, 'id'>[];
}

export interface DestinationBlockSet {
  destinationId: string;
  weather: string;
  // hotel context
  hotelName: string;
  hotelLocation: string;
  hotelAmenities: string[];
  hotelImage: string;
  hotelPricePerNight: number;
  hotelStars: number;
  // flight routing (airport codes)
  arrivalAirportCode: string;
  arrivalAirportName: string;
  // curated blocks
  blocks: ActivityBlock[];
}

// ============================================================================
// FLAGSHIP — SIPADAN / MABUL (island)
// ============================================================================
const sipadanBlocks: DestinationBlockSet = {
  destinationId: 'sipadan',
  weather: '30°C · Sunny · Visibility 25m',
  hotelName: 'Mabul Water Village Resort',
  hotelLocation: 'Mabul Island, Semporna',
  hotelAmenities: ['PADI 5-Star Dive Centre', 'Overwater chalets', 'Full board', 'Jetty access', 'Nitrox fills'],
  hotelImage: 'https://images.unsplash.com/photo-1540202404-a2f29016b523?w=800',
  hotelPricePerNight: 850,
  hotelStars: 4,
  arrivalAirportCode: 'TWU',
  arrivalAirportName: 'Tawau Airport',
  blocks: [
    {
      slot: 'arrival',
      dayTitle: 'Arrival & Mabul Check-In',
      activities: [
        { time: '10:00', title: 'Tawau Airport Arrival', type: 'transport', duration: '30m', cost: 0, location: 'Tawau', description: 'Pickup by resort shuttle at arrival hall.' },
        { time: '11:30', title: 'Drive to Semporna Jetty', type: 'transport', duration: '1h 30m', cost: 0, location: 'Tawau → Semporna', description: 'Scenic coastal road through palm plantations.' },
        { time: '13:00', title: 'Lunch @ Ocean King', type: 'meal', duration: '1h', cost: 55, location: 'Semporna Waterfront', description: 'Fresh steamed grouper, mantis shrimp — best seafood in town.', tips: 'Try sea urchin when in season.' },
        { time: '14:30', title: 'Speedboat to Mabul', type: 'transport', duration: '45m', cost: 80, location: 'Semporna → Mabul', description: 'Resort transfer with life jackets provided.' },
        { time: '15:30', title: 'Resort Check-In & Orientation', type: 'hotel', duration: '1h', cost: 0, location: 'Mabul Water Village', description: 'Chalet assignment, dive briefing for tomorrow.' },
        { time: '17:00', title: 'Sunset Stroll on Jetty', type: 'activity', duration: '1h', cost: 0, location: 'Mabul Jetty', description: 'Watch local Bajau kids fish off the boardwalk.' },
        { time: '19:00', title: 'Welcome Dinner', type: 'meal', duration: '1h 30m', cost: 0, location: 'Resort Dining Hall', description: 'Buffet dinner with Sabahan dishes.' },
      ],
    },
    {
      slot: 'dawn',
      dayTitle: 'Sipadan Triple-Dive Day',
      activities: [
        { time: '06:00', title: 'Early Breakfast', type: 'meal', duration: '45m', cost: 0, location: 'Resort', description: 'Fuel up before the 30-min boat ride.' },
        { time: '07:00', title: 'Speedboat to Sipadan', type: 'transport', duration: '30m', cost: 0, location: 'Mabul → Sipadan', description: 'Permit check at ranger station.' },
      ],
    },
    {
      slot: 'morning',
      activities: [
        { time: '08:30', title: 'Dive 1 — Barracuda Point', type: 'activity', duration: '1h', cost: 0, location: 'Sipadan North', description: 'World-famous barracuda tornado. Operator: Scuba Junkie Semporna.', tips: 'Strong current — stay close to guide.' },
        { time: '10:00', title: 'Surface Interval', type: 'free_time', duration: '45m', cost: 0, location: 'Sipadan Jetty', description: 'Snacks, fresh coconuts, reef briefing for next dive.' },
      ],
    },
    {
      slot: 'midday',
      activities: [
        { time: '10:45', title: 'Dive 2 — Hanging Gardens', type: 'activity', duration: '55m', cost: 0, location: 'Sipadan West', description: 'Vertical wall with soft corals and turtles resting on ledges.' },
        { time: '12:00', title: 'Lunch on Sipadan', type: 'meal', duration: '1h', cost: 0, location: 'Sipadan Rest Area', description: 'Packed lunch — nasi lemak + fruit.' },
      ],
    },
    {
      slot: 'afternoon',
      activities: [
        { time: '13:30', title: 'Dive 3 — Turtle Tomb', type: 'activity', duration: '55m', cost: 0, location: 'Sipadan', description: 'Optional cavern dive where sea turtles have rested for centuries.', tips: 'Requires advanced cert for deeper penetration.' },
        { time: '15:00', title: 'Return to Mabul', type: 'transport', duration: '30m', cost: 0, location: 'Sipadan → Mabul' },
        { time: '16:00', title: 'Rest & Log Dives', type: 'free_time', duration: '2h', cost: 0, location: 'Resort', description: 'Upload GoPro footage, log entries, chill on chalet deck.' },
      ],
    },
    {
      slot: 'evening',
      activities: [
        { time: '18:30', title: 'Sunset Happy Hour', type: 'free_time', duration: '1h', cost: 45, location: 'Resort Deck Bar', description: 'Cocktails as the sun sinks behind Bohey Dulang.' },
        { time: '19:30', title: 'Dinner — Bajau Seafood Night', type: 'meal', duration: '1h 30m', cost: 0, location: 'Resort Dining', description: 'Grilled reef fish with sambal belacan.' },
        { time: '21:00', title: 'Night Dive — Mandarin Fish', type: 'activity', duration: '45m', cost: 180, location: 'Mabul House Reef', description: 'Optional add-on — mandarin fish mate at dusk under the jetty.' },
      ],
    },
    {
      slot: 'departure',
      dayTitle: 'Last Dip & Departure',
      activities: [
        { time: '07:00', title: 'Final House Reef Dive', type: 'activity', duration: '1h', cost: 0, location: 'Mabul House Reef', description: 'Macro hunt — blue-ringed octopus, frogfish, nudibranchs.' },
        { time: '09:00', title: 'Check-Out & Breakfast', type: 'meal', duration: '1h', cost: 0, location: 'Resort' },
        { time: '10:30', title: 'Speedboat to Semporna', type: 'transport', duration: '45m', cost: 0, location: 'Mabul → Semporna' },
        { time: '12:00', title: 'Lunch in Semporna', type: 'meal', duration: '1h', cost: 40, location: 'Semporna Town' },
        { time: '13:30', title: 'Drive to Tawau Airport', type: 'transport', duration: '1h 30m', cost: 0, location: 'Semporna → Tawau' },
        { time: '16:00', title: 'Departure', type: 'transport', duration: '2h 35m', cost: 0, location: 'Tawau Airport' },
      ],
    },
  ],
};

// ============================================================================
// FLAGSHIP — MOUNT KINABALU (mountain)
// ============================================================================
const kinabaluBlocks: DestinationBlockSet = {
  destinationId: 'kinabalu',
  weather: 'Base 22°C · Summit 4°C · Clear window forecast',
  hotelName: 'Laban Rata Resthouse + Kundasang Hillside',
  hotelLocation: 'Kinabalu Park, Ranau',
  hotelAmenities: ['Laban Rata dorm bed', 'Carb-heavy meals', 'Climbing permit included', 'Mountain Torq guide'],
  hotelImage: 'https://images.unsplash.com/photo-1600586103402-4d1e0e05e1c5?w=800',
  hotelPricePerNight: 900,
  hotelStars: 3,
  arrivalAirportCode: 'BKI',
  arrivalAirportName: 'Kota Kinabalu International',
  blocks: [
    {
      slot: 'arrival',
      dayTitle: 'KK → Kinabalu Park',
      activities: [
        { time: '08:00', title: 'Kota Kinabalu Arrival', type: 'transport', duration: '30m', cost: 0, location: 'BKI Airport', description: 'Meet with Mountain Torq guide at arrival.' },
        { time: '09:00', title: 'Drive to Kinabalu Park HQ', type: 'transport', duration: '2h', cost: 0, location: 'KK → Kinabalu Park', description: 'Scenic 2h drive through Crocker Range.' },
        { time: '11:00', title: 'Permit Registration', type: 'activity', duration: '30m', cost: 0, location: 'Park HQ', description: 'Collect climb permit, ID tag, packed lunch.' },
        { time: '11:30', title: 'Briefing & Gear Check', type: 'activity', duration: '45m', cost: 0, location: 'Park HQ', description: 'Mandatory safety briefing, gear inspection.' },
        { time: '12:30', title: 'Lunch at Liwagu Restaurant', type: 'meal', duration: '1h', cost: 45, location: 'Kinabalu Park HQ', description: 'Last hot meal before Laban Rata.' },
      ],
    },
    {
      slot: 'afternoon',
      dayTitle: 'Timpohon → Laban Rata Ascent',
      activities: [
        { time: '14:00', title: 'Timpohon Gate Start', type: 'activity', duration: '15m', cost: 0, location: 'Timpohon Gate (1,866m)', description: 'Trailhead briefing, final water check.' },
        { time: '14:30', title: 'Climb to Pondok Kandis', type: 'activity', duration: '1h', cost: 0, location: 'Trail km 1-2', description: 'First shelter stop — catch breath at 2,000m.' },
        { time: '16:00', title: 'Waras Hut Rest', type: 'free_time', duration: '20m', cost: 0, location: 'Trail km 4', description: 'Halfway point — hot drinks available.' },
        { time: '17:30', title: 'Arrive Laban Rata (3,272m)', type: 'hotel', duration: '30m', cost: 0, location: 'Laban Rata Resthouse', description: 'Check into dorm, rest your knees.' },
      ],
    },
    {
      slot: 'evening',
      activities: [
        { time: '18:00', title: 'Early Dinner', type: 'meal', duration: '1h', cost: 0, location: 'Laban Rata Dining', description: 'Buffet carbs — pasta, rice, chicken curry.' },
        { time: '19:30', title: 'Sunset Over Clouds', type: 'activity', duration: '30m', cost: 0, location: 'Laban Rata Deck', description: 'Inversion sunset — one of Sabah\'s most photographed views.' },
        { time: '20:00', title: 'Rest & Gear Prep', type: 'free_time', duration: '2h', cost: 0, location: 'Dorm', description: 'Prep head-torch, layers, gloves for 2am summit call.' },
      ],
    },
    {
      slot: 'dawn',
      dayTitle: 'Summit Push — Low\'s Peak',
      activities: [
        { time: '02:00', title: 'Summit Call & Coffee', type: 'meal', duration: '45m', cost: 0, location: 'Laban Rata', description: 'Light breakfast, energy bars, hot drink.' },
        { time: '02:45', title: 'Via Ferrata Start', type: 'activity', duration: '3h 15m', cost: 0, location: 'Sayat-Sayat Hut', description: 'Granite slab climb by rope handhold. Guide leads.', tips: 'Head torch mandatory.' },
        { time: '06:00', title: 'Low\'s Peak Summit (4,095m)', type: 'activity', duration: '45m', cost: 0, location: 'Low\'s Peak', description: 'Southeast Asia\'s highest accessible peak. Sunrise over Borneo.', tips: 'Freezing at summit — pack thermal layers.' },
      ],
    },
    {
      slot: 'morning',
      dayTitle: 'Descent & Poring',
      activities: [
        { time: '07:00', title: 'Descend to Laban Rata', type: 'activity', duration: '2h', cost: 0, location: 'Laban Rata', description: 'Same trail — knees will feel it.' },
        { time: '09:30', title: 'Hot Shower + Breakfast', type: 'meal', duration: '1h 30m', cost: 0, location: 'Laban Rata' },
        { time: '11:00', title: 'Descend to Timpohon Gate', type: 'activity', duration: '3h', cost: 0, location: 'Trail km 6-0', description: 'Legs-of-jelly descent. Take it slow.' },
        { time: '14:00', title: 'Summit Certificate Ceremony', type: 'activity', duration: '30m', cost: 0, location: 'Park HQ', description: 'Official certificate presented — bring tissues, some cry.' },
      ],
    },
    {
      slot: 'sunset',
      dayTitle: 'Poring Hot Springs Recovery',
      activities: [
        { time: '15:00', title: 'Drive to Poring', type: 'transport', duration: '45m', cost: 0, location: 'Kinabalu Park → Poring' },
        { time: '16:00', title: 'Hot Springs Soak', type: 'activity', duration: '1h 30m', cost: 25, location: 'Poring Hot Springs', description: 'Sulphur springs — legs thank you.' },
        { time: '17:30', title: 'Canopy Walkway', type: 'activity', duration: '45m', cost: 30, location: 'Poring Canopy', description: 'Suspended walkway 40m up in the rainforest.' },
        { time: '19:00', title: 'Dinner in Kundasang', type: 'meal', duration: '1h 30m', cost: 60, location: 'Kundasang', description: 'Desa Dairy Farm restaurant — fresh milk and farm-to-table.' },
      ],
    },
    {
      slot: 'departure',
      dayTitle: 'Kundasang → KK → Home',
      activities: [
        { time: '08:00', title: 'Breakfast @ Farm Café', type: 'meal', duration: '1h', cost: 35, location: 'Desa Dairy Farm', description: 'Fresh yogurt, cheese platter, highland coffee.' },
        { time: '09:30', title: 'Nabalu Viewpoint', type: 'activity', duration: '30m', cost: 0, location: 'Nabalu', description: 'Postcard Kinabalu view from the roadside.' },
        { time: '10:30', title: 'Drive to KK', type: 'transport', duration: '2h', cost: 0, location: 'Kundasang → KK' },
        { time: '13:00', title: 'KK Airport Departure', type: 'transport', duration: '3h', cost: 0, location: 'BKI Airport' },
      ],
    },
  ],
};

// ============================================================================
// FLAGSHIP — KINABATANGAN (wildlife)
// ============================================================================
const kinabatanganBlocks: DestinationBlockSet = {
  destinationId: 'kinabatangan',
  weather: '28°C · Humid · Occasional afternoon showers',
  hotelName: 'Sukau Rainforest Lodge',
  hotelLocation: 'Sukau, Kinabatangan',
  hotelAmenities: ['Riverside chalets', 'Guided cruise boats', 'Full board', 'Night jungle walks', 'Bird hide'],
  hotelImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
  hotelPricePerNight: 720,
  hotelStars: 4,
  arrivalAirportCode: 'SDK',
  arrivalAirportName: 'Sandakan Airport',
  blocks: [
    {
      slot: 'arrival',
      dayTitle: 'Sandakan → Sukau',
      activities: [
        { time: '09:30', title: 'Sandakan Arrival', type: 'transport', duration: '30m', cost: 0, location: 'SDK Airport', description: 'Lodge transfer meets at arrival hall.' },
        { time: '10:30', title: 'Drive to Sukau Jetty', type: 'transport', duration: '2h 30m', cost: 0, location: 'Sandakan → Sukau', description: 'Scenic road through palm plantations.' },
        { time: '13:00', title: 'Riverside Welcome Lunch', type: 'meal', duration: '1h', cost: 0, location: 'Sukau Lodge', description: 'Local Sabahan spread — hinava, ambuyat, sayur kampung.' },
        { time: '14:30', title: 'Lodge Check-In & Orientation', type: 'hotel', duration: '1h', cost: 0, location: 'Sukau Rainforest Lodge', description: 'Chalet, safety brief, cruise schedule.' },
      ],
    },
    {
      slot: 'afternoon',
      dayTitle: 'First Cruise — Proboscis Trail',
      activities: [
        { time: '16:00', title: 'Dusk River Cruise', type: 'activity', duration: '2h 30m', cost: 0, location: 'Kinabatangan River', description: 'Proboscis monkeys heading to riverside trees to roost. Hornbills, macaques, crocodiles.', tips: 'Bring binoculars; operator Sabah Wetlands Cruises.' },
        { time: '18:45', title: 'Return to Lodge', type: 'transport', duration: '15m', cost: 0, location: 'Lodge Jetty' },
      ],
    },
    {
      slot: 'evening',
      activities: [
        { time: '19:00', title: 'Wildlife Briefing Dinner', type: 'meal', duration: '1h 30m', cost: 0, location: 'Lodge Dining', description: 'Species list shared — chance of pygmy elephants tomorrow.' },
        { time: '20:30', title: 'Guided Night Walk', type: 'activity', duration: '1h 30m', cost: 0, location: 'Lodge Boardwalk', description: 'Frogs, sleeping birds, flying squirrels, maybe civets.', tips: 'Keep torches on red light mode.' },
      ],
    },
    {
      slot: 'dawn',
      dayTitle: 'Dawn Cruise & Oxbow Lake',
      activities: [
        { time: '05:30', title: 'Dawn River Cruise', type: 'activity', duration: '2h', cost: 0, location: 'Kinabatangan Upstream', description: 'Hornbill roosts wake-up call. Mist on water. Orangutan sightings most common now.' },
        { time: '07:30', title: 'Breakfast at Lodge', type: 'meal', duration: '1h', cost: 0, location: 'Lodge Dining', description: 'Hot breakfast — telur masak, roti canai, fresh fruit.' },
      ],
    },
    {
      slot: 'morning',
      activities: [
        { time: '09:30', title: 'Oxbow Lake Jungle Trek', type: 'activity', duration: '2h 30m', cost: 0, location: 'Oxbow Trail', description: 'Guided walk — medicinal plants, termite highways, leeches! Worth it.', tips: 'Wear leech socks (provided).' },
        { time: '12:00', title: 'Return & Shower', type: 'free_time', duration: '1h', cost: 0, location: 'Lodge' },
      ],
    },
    {
      slot: 'midday',
      activities: [
        { time: '13:00', title: 'Sabahan Lunch', type: 'meal', duration: '1h', cost: 0, location: 'Lodge Dining', description: 'Grilled river fish, sambal, local vegetables.' },
        { time: '14:30', title: 'Rest & Bird Hide', type: 'free_time', duration: '1h 30m', cost: 0, location: 'Lodge Bird Hide', description: 'Optional — kingfishers, hornbills, broadbills visit.' },
      ],
    },
    {
      slot: 'sunset',
      dayTitle: 'Pygmy Elephant Cruise',
      activities: [
        { time: '16:00', title: 'Dusk Elephant Cruise', type: 'activity', duration: '2h 30m', cost: 0, location: 'Lower Kinabatangan', description: 'Main herd-spotting window. Crocodiles haul out. Kingfishers strike.', tips: 'This is the money shot day.' },
        { time: '18:45', title: 'Sunset Over River', type: 'activity', duration: '15m', cost: 0, location: 'Mid-stream' },
        { time: '19:00', title: 'Farewell Dinner', type: 'meal', duration: '1h 30m', cost: 0, location: 'Lodge Dining', description: 'Buffet with traditional music.' },
      ],
    },
    {
      slot: 'departure',
      dayTitle: 'Sepilok + Departure',
      activities: [
        { time: '06:00', title: 'Final Dawn Cruise', type: 'activity', duration: '1h 30m', cost: 0, location: 'Kinabatangan', description: 'Last chance for orangutan sightings.' },
        { time: '08:00', title: 'Breakfast + Check-Out', type: 'meal', duration: '1h', cost: 0, location: 'Lodge' },
        { time: '09:30', title: 'Drive to Sepilok', type: 'transport', duration: '1h 30m', cost: 0, location: 'Sukau → Sepilok' },
        { time: '11:00', title: 'Sepilok Orangutan Feeding', type: 'activity', duration: '1h 30m', cost: 65, location: 'Sepilok Rehabilitation Centre', description: 'Semi-wild orangutans come for morning feeding platform.', tips: 'Viewing deck gets crowded by 10:45 — arrive early.' },
        { time: '12:45', title: 'Sun Bear Conservation Centre', type: 'activity', duration: '45m', cost: 35, location: 'BSBCC Sepilok', description: 'World\'s only sun bear sanctuary.' },
        { time: '13:45', title: 'Lunch in Sepilok', type: 'meal', duration: '1h', cost: 40, location: 'Sepilok' },
        { time: '15:00', title: 'Drive to Sandakan Airport', type: 'transport', duration: '45m', cost: 0, location: 'Sepilok → SDK' },
        { time: '17:00', title: 'Departure', type: 'transport', duration: '2h 50m', cost: 0, location: 'SDK Airport' },
      ],
    },
  ],
};

// ============================================================================
// FLAGSHIP — KUNDASANG (highland)
// ============================================================================
const kundasangBlocks: DestinationBlockSet = {
  destinationId: 'kundasang',
  weather: '18-24°C · Cool highland · Morning mist',
  hotelName: 'Mesilou Kinabalu View Resort',
  hotelLocation: 'Mesilou, Kundasang',
  hotelAmenities: ['Kinabalu-view chalets', 'Fireplace common room', 'Farm breakfast', 'Walking trails'],
  hotelImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  hotelPricePerNight: 480,
  hotelStars: 4,
  arrivalAirportCode: 'BKI',
  arrivalAirportName: 'Kota Kinabalu International',
  blocks: [
    {
      slot: 'arrival',
      dayTitle: 'KK → Kundasang Scenic Drive',
      activities: [
        { time: '09:00', title: 'KK Airport Pickup', type: 'transport', duration: '30m', cost: 0, location: 'BKI Airport' },
        { time: '10:00', title: 'Nabalu Roadside Market', type: 'activity', duration: '30m', cost: 0, location: 'Nabalu Viewpoint', description: 'Tamu market selling bamboo rice, wild honey, local fruits.', tips: 'Try pinasakan (Sabahan fish dish).' },
        { time: '11:30', title: 'Desa Dairy Farm', type: 'activity', duration: '1h 30m', cost: 35, location: 'Kundasang', description: 'Walk among Friesian cows against Kinabalu backdrop — nicknamed "Little New Zealand".', tips: 'Feed calves at 11am + 3pm.' },
        { time: '13:00', title: 'Farm Lunch + Fresh Milk', type: 'meal', duration: '1h', cost: 45, location: 'Desa Dairy Café', description: 'Yogurt, cheese platter, chocolate milk — all made on-site.' },
      ],
    },
    {
      slot: 'afternoon',
      dayTitle: 'Kundasang Exploration',
      activities: [
        { time: '14:30', title: 'Kundasang War Memorial', type: 'activity', duration: '1h', cost: 12, location: 'Kundasang', description: 'Powerful tribute to Sandakan Death March — four gardens, quiet reflection.' },
        { time: '16:00', title: 'Mesilou Strawberry Farm', type: 'activity', duration: '1h', cost: 20, location: 'Mesilou', description: 'Pick-your-own strawberries, rhubarb jams, highland coffee.' },
        { time: '17:30', title: 'Resort Check-In', type: 'hotel', duration: '30m', cost: 0, location: 'Mesilou Kinabalu View Resort' },
      ],
    },
    {
      slot: 'sunset',
      activities: [
        { time: '18:00', title: 'Kinabalu Sunset Viewpoint', type: 'activity', duration: '45m', cost: 0, location: 'Resort Deck', description: 'Alpenglow on the granite face — stunning when clear.' },
        { time: '19:00', title: 'Highland Dinner', type: 'meal', duration: '1h 30m', cost: 70, location: 'Resort Restaurant', description: 'Mountain lamb stew, bamboo chicken, fresh highland vegetables.' },
      ],
    },
    {
      slot: 'dawn',
      dayTitle: 'Sabah Tea & Ranau Day',
      activities: [
        { time: '06:30', title: 'Sunrise Over Kinabalu', type: 'activity', duration: '45m', cost: 0, location: 'Mesilou Deck', description: 'Sharp air, pink-gold peak. Worth the early call.' },
        { time: '07:30', title: 'Farm Breakfast', type: 'meal', duration: '1h', cost: 0, location: 'Resort' },
      ],
    },
    {
      slot: 'morning',
      activities: [
        { time: '09:00', title: 'Sabah Tea Garden', type: 'activity', duration: '2h', cost: 25, location: 'Ranau', description: 'Tour the tea plantation, hike through rows, learn picking technique.', tips: 'Try lemongrass green tea.' },
        { time: '11:30', title: 'Ranau Tamu (Market)', type: 'activity', duration: '1h', cost: 0, location: 'Ranau Town', description: 'Authentic weekly farmers market — wild honey, bamboo salt, mountain herbs.' },
      ],
    },
    {
      slot: 'midday',
      activities: [
        { time: '13:00', title: 'Poring Canopy Walkway', type: 'activity', duration: '1h 30m', cost: 30, location: 'Poring', description: '41m-high suspended walkway through rainforest canopy.' },
        { time: '14:30', title: 'Poring Hot Springs Soak', type: 'activity', duration: '1h 30m', cost: 25, location: 'Poring', description: 'Natural sulphur pools — open-air and private cabanas.' },
        { time: '16:30', title: 'Late Lunch', type: 'meal', duration: '1h', cost: 40, location: 'Poring Café' },
      ],
    },
    {
      slot: 'evening',
      activities: [
        { time: '18:00', title: 'Return to Resort', type: 'transport', duration: '30m', cost: 0, location: 'Poring → Mesilou' },
        { time: '19:00', title: 'Farewell Dinner', type: 'meal', duration: '1h 30m', cost: 75, location: 'Resort Restaurant', description: 'Highland beef bourguignon + wine.' },
      ],
    },
    {
      slot: 'departure',
      dayTitle: 'Return to KK',
      activities: [
        { time: '08:00', title: 'Breakfast', type: 'meal', duration: '1h', cost: 0, location: 'Resort' },
        { time: '09:30', title: 'Drive to KK', type: 'transport', duration: '2h', cost: 0, location: 'Kundasang → KK' },
        { time: '12:00', title: 'Lunch in KK Waterfront', type: 'meal', duration: '1h', cost: 60, location: 'Kota Kinabalu', description: 'Alu-Alu Kitchen seafood before flight.' },
        { time: '14:00', title: 'KK Airport', type: 'transport', duration: '2h', cost: 0, location: 'BKI Airport' },
      ],
    },
  ],
};

// ============================================================================
// FLAGSHIP — MARI-MARI / KK (cultural)
// ============================================================================
const mariMariBlocks: DestinationBlockSet = {
  destinationId: 'mari-mari',
  weather: '30°C · Sunny · Coastal breeze',
  hotelName: 'Le Meridien Kota Kinabalu',
  hotelLocation: 'Waterfront, Kota Kinabalu',
  hotelAmenities: ['Sea-view rooms', 'Rooftop pool', 'Waterfront dining', 'Spa', 'Walking distance to Gaya Street'],
  hotelImage: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800',
  hotelPricePerNight: 520,
  hotelStars: 5,
  arrivalAirportCode: 'BKI',
  arrivalAirportName: 'Kota Kinabalu International',
  blocks: [
    {
      slot: 'arrival',
      dayTitle: 'KK Arrival & Heritage Walk',
      activities: [
        { time: '10:00', title: 'KK Airport Arrival', type: 'transport', duration: '30m', cost: 0, location: 'BKI Airport' },
        { time: '11:00', title: 'Hotel Check-In', type: 'hotel', duration: '30m', cost: 0, location: 'Le Meridien KK' },
        { time: '12:00', title: 'Lunch @ Gaya Street', type: 'meal', duration: '1h 30m', cost: 50, location: 'Gaya Street, KK', description: 'Kedai Kopi Fatt Kee — Tuaran mee, roti kahwin, kopi-O.' },
      ],
    },
    {
      slot: 'afternoon',
      activities: [
        { time: '14:00', title: 'Signal Hill Observatory', type: 'activity', duration: '1h', cost: 0, location: 'Signal Hill, KK', description: 'Panoramic view of KK city and islands — Instagram gold.' },
        { time: '15:30', title: 'Atkinson Clock Tower', type: 'activity', duration: '30m', cost: 0, location: 'KK Old Town', description: 'One of only 3 structures to survive WWII bombing — all-wood colonial.' },
        { time: '16:30', title: 'Sabah State Museum', type: 'activity', duration: '1h 30m', cost: 15, location: 'KK Museum', description: 'Ethnographic exhibits on Sabah\'s 42 ethnic groups.' },
      ],
    },
    {
      slot: 'sunset',
      activities: [
        { time: '18:00', title: 'Tanjung Aru Sunset', type: 'activity', duration: '1h', cost: 0, location: 'Tanjung Aru Beach', description: 'KK\'s iconic sunset spot — locals and tourists gather.', tips: 'Arrive by 18:00 for peak window.' },
        { time: '19:00', title: 'Tanjung Aru BBQ Dinner', type: 'meal', duration: '1h 30m', cost: 65, location: 'Tanjung Aru Beachfront', description: 'Ikan bakar, sotong goreng, jagung bakar — halal BBQ.' },
      ],
    },
    {
      slot: 'dawn',
      dayTitle: 'Mari-Mari Cultural Village',
      activities: [
        { time: '08:00', title: 'Hotel Breakfast', type: 'meal', duration: '1h', cost: 0, location: 'Le Meridien' },
      ],
    },
    {
      slot: 'morning',
      activities: [
        { time: '09:30', title: 'Drive to Mari-Mari Village', type: 'transport', duration: '30m', cost: 0, location: 'KK → Kionsom' },
        { time: '10:00', title: 'Mari-Mari Cultural Village', type: 'activity', duration: '3h', cost: 180, location: 'Mari-Mari Village, Kionsom', description: 'Live demos of 5 tribes — Kadazan-Dusun, Rungus, Bajau, Lundayeh, Murut. Fire-making, tattoo, blowpipe.', tips: 'Includes lunch and cultural show.' },
      ],
    },
    {
      slot: 'midday',
      activities: [
        { time: '13:00', title: 'Traditional Lunch at Village', type: 'meal', duration: '1h', cost: 0, location: 'Mari-Mari Village', description: 'Lihing rice wine, hinava, bamboo chicken.' },
        { time: '14:00', title: 'Cultural Performance', type: 'activity', duration: '45m', cost: 0, location: 'Mari-Mari Stage', description: 'Sumazau dance, bamboo pole dance audience participation.' },
      ],
    },
    {
      slot: 'afternoon',
      dayTitle: 'Filipino Market & Handicrafts',
      activities: [
        { time: '15:30', title: 'Return to KK', type: 'transport', duration: '30m', cost: 0, location: 'Mari-Mari → KK' },
        { time: '16:30', title: 'Filipino Market Shopping', type: 'activity', duration: '1h 30m', cost: 0, location: 'Filipino Market, KK', description: 'Pearls, handicrafts, sarongs, mother-of-pearl inlay.', tips: 'Bargain 40-50% off asking.' },
        { time: '18:00', title: 'Waterfront Walk', type: 'activity', duration: '45m', cost: 0, location: 'KK Waterfront' },
      ],
    },
    {
      slot: 'evening',
      activities: [
        { time: '19:00', title: 'Dinner @ Alu-Alu Kitchen', type: 'meal', duration: '1h 30m', cost: 80, location: 'Waterfront, KK', description: 'Best Sabahan seafood — butter prawns, hinava, bambangan ice cream.' },
        { time: '20:30', title: 'Night Market Browse', type: 'activity', duration: '1h', cost: 20, location: 'Filipino Night Market', description: 'BBQ stingray, satay, coconut shake, fresh fruit.' },
      ],
    },
    {
      slot: 'departure',
      dayTitle: 'Farewell KK',
      activities: [
        { time: '08:00', title: 'Sunday Gaya Street Market', type: 'activity', duration: '1h 30m', cost: 0, location: 'Gaya Street, KK', description: 'Weekly Sunday fair — 400+ stalls. Best souvenirs.', tips: 'Only runs Sundays.' },
        { time: '09:30', title: 'Brunch', type: 'meal', duration: '1h', cost: 40, location: 'Gaya Street', description: 'Pisang goreng, kuih-muih, fresh tropical fruits.' },
        { time: '11:00', title: 'Hotel Check-Out', type: 'hotel', duration: '30m', cost: 0, location: 'Le Meridien' },
        { time: '12:00', title: 'Transfer to Airport', type: 'transport', duration: '30m', cost: 0, location: 'BKI Airport' },
      ],
    },
  ],
};

// ============================================================================
// FALLBACK destinations — generic blocks using destination metadata
// ============================================================================

// These are lighter but still destination-specific thanks to metadata pull.
// The generator fills in titles/descriptions from SabahDestination.activities, wildlifeTypes, etc.

const mabulBlocks: DestinationBlockSet = {
  ...sipadanBlocks,
  destinationId: 'mabul',
  hotelName: 'Mabul Beach Resort',
  hotelLocation: 'Mabul Island, Semporna',
  hotelImage: 'https://images.unsplash.com/photo-1540202404-a2f29016b523?w=800',
  hotelPricePerNight: 650,
  weather: '30°C · Sunny · Macro diver\'s paradise',
};

const kapalaiBlocks: DestinationBlockSet = {
  ...sipadanBlocks,
  destinationId: 'kapalai',
  hotelName: 'Sipadan Kapalai Dive Resort',
  hotelLocation: 'Kapalai, Semporna',
  hotelImage: 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=800',
  hotelPricePerNight: 1200,
  hotelStars: 5,
  weather: '30°C · Sunny · Overwater villas',
};

const poringBlocks: DestinationBlockSet = {
  ...kundasangBlocks,
  destinationId: 'poring',
  hotelName: 'Poring Hot Springs Lodge',
  hotelLocation: 'Poring, Ranau',
  hotelImage: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
  hotelPricePerNight: 360,
  hotelStars: 3,
  weather: '26°C · Rainforest · Springs 40°C',
};

const sepilokBlocks: DestinationBlockSet = {
  ...kinabatanganBlocks,
  destinationId: 'sepilok',
  hotelName: 'Sepilok Nature Resort',
  hotelLocation: 'Sepilok, Sandakan',
  hotelImage: 'https://images.unsplash.com/photo-1605552955090-56ca0a56e2ee?w=800',
  hotelPricePerNight: 540,
  weather: '29°C · Rainforest · High humidity',
};

const danumValleyBlocks: DestinationBlockSet = {
  ...kinabatanganBlocks,
  destinationId: 'danum-valley',
  hotelName: 'Borneo Rainforest Lodge',
  hotelLocation: 'Danum Valley, Lahad Datu',
  hotelImage: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800',
  hotelPricePerNight: 1800,
  hotelStars: 5,
  weather: '28°C · Primary rainforest · 130 million years old',
  arrivalAirportCode: 'LDU',
  arrivalAirportName: 'Lahad Datu Airport',
};

const tipOfBorneoBlocks: DestinationBlockSet = {
  ...mariMariBlocks,
  destinationId: 'tip-of-borneo',
  hotelName: 'Tampat Do Aman Kudat',
  hotelLocation: 'Kudat',
  hotelImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
  hotelPricePerNight: 280,
  hotelStars: 3,
  weather: '31°C · Coastal · Strong currents at the tip',
};

const tarParkBlocks: DestinationBlockSet = {
  ...mariMariBlocks,
  destinationId: 'tar-park',
  hotelName: 'Manukan Island Resort',
  hotelLocation: 'Manukan Island, TARP',
  hotelImage: 'https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?w=800',
  hotelPricePerNight: 420,
  weather: '30°C · Island · 15min from KK',
};

// ============================================================================
// REGISTRY
// ============================================================================
export const destinationBlocks: Record<string, DestinationBlockSet> = {
  sipadan: sipadanBlocks,
  mabul: mabulBlocks,
  kapalai: kapalaiBlocks,
  kinabalu: kinabaluBlocks,
  kundasang: kundasangBlocks,
  poring: poringBlocks,
  kinabatangan: kinabatanganBlocks,
  sepilok: sepilokBlocks,
  'danum-valley': danumValleyBlocks,
  'mari-mari': mariMariBlocks,
  'tip-of-borneo': tipOfBorneoBlocks,
  'tar-park': tarParkBlocks,
};

export function getBlocksForDestination(destinationId: string): DestinationBlockSet | undefined {
  return destinationBlocks[destinationId];
}
