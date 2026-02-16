import { NextRequest, NextResponse } from 'next/server';

/**
 * Holiday AI - Halal Restaurants API
 * Endpoint: GET /api/halal/restaurants
 * Description: Search for halal restaurants near a location
 */

interface HalalRestaurant {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  country: string;
  cuisineTypes: string[];
  priceRange: string;
  isCertified: boolean;
  certificationBody?: string;
  rating: number;
  reviewsCount: number;
  distanceKm?: number;
  features: {
    prayerRoom: boolean;
    familyFriendly: boolean;
    parking: boolean;
    wifi: boolean;
    wheelchairAccessible: boolean;
  };
  operatingHours: any;
  phone?: string;
  website?: string;
  photos?: string[];
}

// Mock database (replace with actual database queries)
const mockRestaurants: HalalRestaurant[] = [
  {
    id: 'rest-001',
    name: 'Al-Noor Restaurant',
    latitude: 3.1390,
    longitude: 101.6869,
    address: '123 Jalan Sultan, Kuala Lumpur',
    city: 'Kuala Lumpur',
    country: 'MYS',
    cuisineTypes: ['Middle Eastern', 'Malaysian'],
    priceRange: '$$',
    isCertified: true,
    certificationBody: 'JAKIM',
    rating: 4.5,
    reviewsCount: 328,
    features: {
      prayerRoom: true,
      familyFriendly: true,
      parking: true,
      wifi: true,
      wheelchairAccessible: true
    },
    operatingHours: {
      monday: { open: '10:00', close: '22:00' },
      tuesday: { open: '10:00', close: '22:00' },
      wednesday: { open: '10:00', close: '22:00' },
      thursday: { open: '10:00', close: '22:00' },
      friday: { open: '14:00', close: '23:00' },
      saturday: { open: '10:00', close: '23:00' },
      sunday: { open: '10:00', close: '22:00' }
    },
    phone: '+60 3-2161 2345',
    website: 'https://alnoor-restaurant.com',
    photos: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1'
    ]
  },
  {
    id: 'rest-002',
    name: 'Saffron Halal Kitchen',
    latitude: 3.1445,
    longitude: 101.6932,
    address: '456 Jalan Ampang, Kuala Lumpur',
    city: 'Kuala Lumpur',
    country: 'MYS',
    cuisineTypes: ['Indian', 'Pakistani', 'Biryani'],
    priceRange: '$',
    isCertified: true,
    certificationBody: 'JAKIM',
    rating: 4.3,
    reviewsCount: 156,
    features: {
      prayerRoom: false,
      familyFriendly: true,
      parking: false,
      wifi: true,
      wheelchairAccessible: false
    },
    operatingHours: {
      monday: { open: '11:00', close: '21:00' },
      tuesday: { open: '11:00', close: '21:00' },
      wednesday: { open: '11:00', close: '21:00' },
      thursday: { open: '11:00', close: '21:00' },
      friday: { open: '11:00', close: '22:00' },
      saturday: { open: '11:00', close: '22:00' },
      sunday: { open: '11:00', close: '21:00' }
    },
    phone: '+60 3-4143 5678'
  },
  {
    id: 'rest-003',
    name: 'The Halal Guys',
    latitude: 3.1520,
    longitude: 101.7123,
    address: '789 KLCC, Kuala Lumpur',
    city: 'Kuala Lumpur',
    country: 'MYS',
    cuisineTypes: ['American', 'Mediterranean', 'Fast Food'],
    priceRange: '$$',
    isCertified: true,
    certificationBody: 'JAKIM',
    rating: 4.7,
    reviewsCount: 892,
    features: {
      prayerRoom: true,
      familyFriendly: true,
      parking: true,
      wifi: true,
      wheelchairAccessible: true
    },
    operatingHours: {
      monday: { open: '10:00', close: '22:00' },
      tuesday: { open: '10:00', close: '22:00' },
      wednesday: { open: '10:00', close: '22:00' },
      thursday: { open: '10:00', close: '22:00' },
      friday: { open: '10:00', close: '23:00' },
      saturday: { open: '10:00', close: '23:00' },
      sunday: { open: '10:00', close: '22:00' }
    },
    phone: '+60 3-2382 9876',
    website: 'https://thehalalguys.com'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract parameters
    const latitude = parseFloat(searchParams.get('latitude') || '0');
    const longitude = parseFloat(searchParams.get('longitude') || '0');
    const radius = parseFloat(searchParams.get('radius') || '5'); // km
    const cuisine = searchParams.get('cuisine');
    const certifiedOnly = searchParams.get('certifiedOnly') === 'true';
    const priceRange = searchParams.get('priceRange');
    const minRating = parseFloat(searchParams.get('minRating') || '0');
    const limit = parseInt(searchParams.get('limit') || '20');
    const city = searchParams.get('city');

    // Validation
    if (!latitude && !city) {
      return NextResponse.json(
        { error: 'Either latitude/longitude or city is required' },
        { status: 400 }
      );
    }

    // Filter restaurants
    let filteredRestaurants = mockRestaurants;

    // Filter by city if provided
    if (city) {
      filteredRestaurants = filteredRestaurants.filter(
        r => r.city.toLowerCase().includes(city.toLowerCase())
      );
    }

    // Calculate distances if coordinates provided
    if (latitude && longitude) {
      filteredRestaurants = filteredRestaurants.map(restaurant => ({
        ...restaurant,
        distanceKm: calculateDistance(
          latitude,
          longitude,
          restaurant.latitude,
          restaurant.longitude
        )
      }));

      // Filter by radius
      filteredRestaurants = filteredRestaurants.filter(
        r => (r.distanceKm || 0) <= radius
      );

      // Sort by distance
      filteredRestaurants.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
    }

    // Filter by certification
    if (certifiedOnly) {
      filteredRestaurants = filteredRestaurants.filter(r => r.isCertified);
    }

    // Filter by cuisine
    if (cuisine) {
      filteredRestaurants = filteredRestaurants.filter(r =>
        r.cuisineTypes.some(c => c.toLowerCase().includes(cuisine.toLowerCase()))
      );
    }

    // Filter by price range
    if (priceRange) {
      filteredRestaurants = filteredRestaurants.filter(r => r.priceRange === priceRange);
    }

    // Filter by rating
    if (minRating > 0) {
      filteredRestaurants = filteredRestaurants.filter(r => r.rating >= minRating);
    }

    // Limit results
    const results = filteredRestaurants.slice(0, limit);

    return NextResponse.json({
      success: true,
      data: {
        restaurants: results,
        total: results.length,
        filters: {
          location: city || `${latitude},${longitude}`,
          radius: `${radius}km`,
          certifiedOnly,
          cuisine,
          priceRange,
          minRating
        }
      }
    });

  } catch (error) {
    console.error('Halal restaurants API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/halal/restaurants/[id]
 * Get detailed information about a specific restaurant
 */
export async function GET_BY_ID(restaurantId: string) {
  try {
    const restaurant = mockRestaurants.find(r => r.id === restaurantId);

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    // Get nearby mosques (within 1km)
    const nearbyMosques = await findNearbyMosques(
      restaurant.latitude,
      restaurant.longitude,
      1
    );

    return NextResponse.json({
      success: true,
      data: {
        restaurant,
        nearbyMosques,
        similarRestaurants: findSimilarRestaurants(restaurant)
      }
    });

  } catch (error) {
    console.error('Restaurant details error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =====================================================
// Helper Functions
// =====================================================

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

async function findNearbyMosques(
  latitude: number,
  longitude: number,
  radiusKm: number
): Promise<any[]> {
  // TODO: Fetch from mosques table in database
  return [
    {
      id: 'mosque-001',
      name: 'Masjid Jamek',
      distance: 0.8,
      address: 'Jalan Tun Perak, KL'
    }
  ];
}

function findSimilarRestaurants(restaurant: HalalRestaurant): HalalRestaurant[] {
  // Find restaurants with similar cuisine types
  return mockRestaurants
    .filter(r =>
      r.id !== restaurant.id &&
      r.cuisineTypes.some(c => restaurant.cuisineTypes.includes(c))
    )
    .slice(0, 3);
}
