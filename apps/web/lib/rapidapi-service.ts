// RapidAPI Service Integration for Holiday AI
// Secure API integration for travel services

interface RapidAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface RapidAPIHotel {
  hotel_id: string;
  hotel_name: string;
  district: string;
  city: string;
  country: string;
  price: {
    current_price: number;
    currency: string;
  };
  rating: number;
  review_score: number;
  review_count: number;
  amenities: string[];
  photos: string[];
  description: string;
}

interface RapidAPIFlight {
  flight_id: string;
  airline: string;
  departure: {
    airport: string;
    time: string;
    date: string;
  };
  arrival: {
    airport: string;
    time: string;
    date: string;
  };
  duration: string;
  price: {
    amount: number;
    currency: string;
  };
  cabin_class: string;
  stops: number;
}

interface RapidAPIActivity {
  location_id: string;
  name: string;
  description: string;
  rating: number;
  review_count: number;
  category: string;
  price_range: string;
  photos: string[];
  address: string;
  phone: string;
  website: string;
}

class RapidAPIService {
  private apiKey: string;
  
  constructor() {
    this.apiKey = process.env.RAPIDAPI_KEY || '';
    if (!this.apiKey) {
      console.warn('RapidAPI key not found in environment variables');
    }
  }

  private async makeRequest<T>(
    url: string, 
    host: string, 
    options: RequestInit = {}
  ): Promise<RapidAPIResponse<T>> {
    try {
      const headers = {
        'X-RapidAPI-Key': this.apiKey,
        'X-RapidAPI-Host': host,
        'Content-Type': 'application/json',
        ...options.headers,
      };

      const response = await fetch(url, {
        ...options,
        headers,
        timeout: 10000, // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`RapidAPI request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: data
      };

    } catch (error) {
      console.error('RapidAPI request error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown API error'
      };
    }
  }

  // Enhanced Hotel Search with RapidAPI Booking.com
  async searchHotels(params: {
    destination: string;
    checkin: string;
    checkout: string;
    adults: number;
    currency?: string;
    limit?: number;
  }): Promise<RapidAPIResponse<RapidAPIHotel[]>> {
    const host = process.env.RAPIDAPI_HOST_HOTELS || 'booking-com.p.rapidapi.com';
    
    const searchParams = new URLSearchParams({
      dest_id: params.destination,
      search_type: 'city',
      arrival_date: params.checkin,
      departure_date: params.checkout,
      adults: params.adults.toString(),
      room_qty: '1',
      page_number: '1',
      languagecode: 'en-us',
      currency_code: params.currency || 'USD',
      order_by: 'price',
      include_adjacency: 'true',
      include_unavailable_hotels: 'false',
      categories_filter_ids: 'class::2,class::4,free_cancellation::1',
      page_size: (params.limit || 20).toString()
    });

    const url = `https://${host}/v1/hotels/search?${searchParams}`;
    
    const response = await this.makeRequest<any>(url, host, {
      method: 'GET'
    });

    if (!response.success || !response.data) {
      return response;
    }

    // Transform the response to match our interface
    const hotels: RapidAPIHotel[] = response.data.result?.map((hotel: any) => ({
      hotel_id: hotel.hotel_id || hotel.id,
      hotel_name: hotel.hotel_name || hotel.name,
      district: hotel.district || hotel.city_trans || '',
      city: hotel.city || params.destination,
      country: hotel.country_trans || 'Unknown',
      price: {
        current_price: hotel.min_total_price || hotel.price_breakdown?.gross_price || 0,
        currency: hotel.currency_code || params.currency || 'USD'
      },
      rating: hotel.class || hotel.hotel_class || 0,
      review_score: hotel.review_score || 0,
      review_count: hotel.review_nr || 0,
      amenities: hotel.hotel_facilities || [],
      photos: hotel.main_photo_url ? [hotel.main_photo_url] : [],
      description: hotel.hotel_name_trans || hotel.hotel_name || ''
    })) || [];

    return {
      success: true,
      data: hotels
    };
  }

  // Enhanced Flight Search with RapidAPI Skyscanner
  async searchFlights(params: {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
    adults?: number;
    currency?: string;
    cabinClass?: string;
  }): Promise<RapidAPIResponse<RapidAPIFlight[]>> {
    const host = process.env.RAPIDAPI_HOST_FLIGHTS || 'skyscanner44.p.rapidapi.com';
    
    const searchParams = new URLSearchParams({
      originSkyId: params.origin,
      destinationSkyId: params.destination,
      originEntityId: params.origin,
      destinationEntityId: params.destination,
      departureDate: params.departureDate,
      returnDate: params.returnDate || '',
      cabinClass: params.cabinClass || 'economy',
      adults: (params.adults || 1).toString(),
      sortBy: 'best',
      limit: '20',
      currency: params.currency || 'USD'
    });

    const url = `https://${host}/search?${searchParams}`;
    
    const response = await this.makeRequest<any>(url, host, {
      method: 'GET'
    });

    if (!response.success || !response.data) {
      return response;
    }

    // Transform the response to match our interface
    const flights: RapidAPIFlight[] = response.data.data?.itineraries?.map((itinerary: any) => {
      const leg = itinerary.legs?.[0];
      return {
        flight_id: itinerary.id || leg?.id,
        airline: leg?.carriers?.marketing?.[0]?.name || 'Unknown Airline',
        departure: {
          airport: leg?.origin?.displayCode || params.origin,
          time: leg?.departure || '',
          date: params.departureDate
        },
        arrival: {
          airport: leg?.destination?.displayCode || params.destination,
          time: leg?.arrival || '',
          date: params.departureDate
        },
        duration: leg?.durationInMinutes ? `${Math.floor(leg.durationInMinutes / 60)}h ${leg.durationInMinutes % 60}m` : 'Unknown',
        price: {
          amount: itinerary.price?.raw || 0,
          currency: itinerary.price?.currency || params.currency || 'USD'
        },
        cabin_class: params.cabinClass || 'economy',
        stops: leg?.stopCount || 0
      };
    }) || [];

    return {
      success: true,
      data: flights
    };
  }

  // Enhanced Activities Search with RapidAPI Travel Advisor
  async searchActivities(params: {
    destination: string;
    limit?: number;
    category?: string;
  }): Promise<RapidAPIResponse<RapidAPIActivity[]>> {
    const host = process.env.RAPIDAPI_HOST_ACTIVITIES || 'travel-advisor.p.rapidapi.com';
    
    const searchParams = new URLSearchParams({
      query: params.destination,
      limit: (params.limit || 20).toString(),
      offset: '0',
      units: 'km',
      lang: 'en_US',
      currency: 'USD'
    });

    const url = `https://${host}/attractions/list?${searchParams}`;
    
    const response = await this.makeRequest<any>(url, host, {
      method: 'GET'
    });

    if (!response.success || !response.data) {
      return response;
    }

    // Transform the response to match our interface
    const activities: RapidAPIActivity[] = response.data.data?.map((activity: any) => ({
      location_id: activity.location_id,
      name: activity.name,
      description: activity.description || activity.snippet || '',
      rating: parseFloat(activity.rating) || 0,
      review_count: parseInt(activity.num_reviews) || 0,
      category: activity.subcategory?.[0]?.name || 'Activity',
      price_range: activity.price_level || 'Unknown',
      photos: activity.photo?.images?.large?.url ? [activity.photo.images.large.url] : [],
      address: activity.address || '',
      phone: activity.phone || '',
      website: activity.website || ''
    })) || [];

    return {
      success: true,
      data: activities
    };
  }

  // Get destination ID for hotel searches
  async getDestinationId(destinationName: string): Promise<RapidAPIResponse<string>> {
    const host = process.env.RAPIDAPI_HOST_HOTELS || 'booking-com.p.rapidapi.com';
    
    const searchParams = new URLSearchParams({
      query: destinationName,
      languagecode: 'en-us'
    });

    const url = `https://${host}/v1/hotels/locations?${searchParams}`;
    
    const response = await this.makeRequest<any>(url, host, {
      method: 'GET'
    });

    if (!response.success || !response.data) {
      return response;
    }

    const destId = response.data?.[0]?.dest_id;
    
    return {
      success: true,
      data: destId?.toString() || destinationName
    };
  }
}

export const rapidAPIService = new RapidAPIService();
export type { RapidAPIHotel, RapidAPIFlight, RapidAPIActivity, RapidAPIResponse };