import { NextRequest, NextResponse } from 'next/server'
import { enhanceItineraryWithBranding } from '../../../lib/provider-branding'

export async function GET(request: NextRequest) {
  try {
    // Create a sample enhanced itinerary with real API data structure
    const enhancedItinerary = {
      id: `enhanced-test-${Date.now()}`,
      title: "Tokyo Ultimate Experience",
      destination: "Tokyo, Japan",
      duration: "5 days",
      dates: { 
        start: "2024-03-15", 
        end: "2024-03-19" 
      },
      price: {
        total: 8500,
        perPerson: 4250,
        currency: "MYR",
        breakdown: {
          flights: 3400,
          accommodation: 2100,
          meals: 1200,
          activities: 900,
          transport: 400,
          insurance: 300,
          taxes: 200
        }
      },
      travelers: {
        adults: 2,
        children: 0,
        infants: 0,
        total: 2
      },
      countries: 1,
      weather: {
        temperature: 18,
        condition: "Partly Cloudy",
        description: "Spring weather, perfect for cherry blossoms"
      },
      highlights: [
        "Visit iconic Senso-ji Temple in Asakusa",
        "Experience traditional tea ceremony in Ueno",
        "Explore vibrant Shibuya Crossing and shopping districts",
        "Authentic sushi experience at Tsukiji Market",
        "Panoramic city views from Tokyo Skytree"
      ],
      days: [
        {
          day: 1,
          title: "Arrival & Traditional Tokyo Introduction",
          activities: [
            "Malaysia Airlines MH70 departure from KLIA",
            "Narita Airport arrival and immigration",
            "Narita Express to Shinjuku Station",
            "Hotel Gracery Shinjuku check-in",
            "Welcome dinner at traditional Japanese restaurant"
          ],
          meals: [
            {
              name: "Welcome Traditional Japanese Dinner",
              time: "19:30",
              cost: 85,
              type: "dinner"
            }
          ],
          accommodation: "Hotel Gracery Shinjuku",
          schedule: [
            {
              time: "09:30",
              activity: "Malaysia Airlines MH70 departure from KLIA Terminal 1, Gate G7. Premium economy service with inflight entertainment and halal meal options.",
              type: "transport",
              cost: 0,
              duration: "7.5 hours",
              details: {
                location: "KLIA Terminal 1, Gate G7",
                contact: "Malaysia Airlines Check-in Counter L",
                tips: "Arrive 3 hours early, download entertainment, bring power bank",
                weatherCondition: "Sunny, 32°C in KL"
              }
            },
            {
              time: "17:45",
              activity: "Arrival at Narita International Airport Terminal 1. Fast-track immigration for Malaysian passport holders, baggage claim at Carousel 5.",
              type: "transport", 
              cost: 0,
              duration: "45 minutes processing",
              details: {
                location: "Narita International Airport Terminal 1",
                contact: "Immigration Counter Zone A",
                tips: "Have passport ready, fill arrival card, exchange money at airport",
                weatherCondition: "Partly cloudy, 18°C in Tokyo"
              }
            },
            {
              time: "19:00",
              activity: "Narita Express (NEX) to Shinjuku - Premium reserved seats with free WiFi and scenic views through Tokyo suburbs.",
              type: "transport",
              cost: 45,
              duration: "55 minutes",
              details: {
                location: "Narita Airport Station Platform 1",
                contact: "JR East Travel Service Center",
                tips: "Reserved seats recommended, English announcements available",
                route: "Narita Airport → Tokyo → Shinjuku (express service)"
              }
            },
            {
              time: "20:30", 
              activity: "Check-in at Hotel Gracery Shinjuku - 4-star hotel featuring the famous Godzilla head. Superior Twin room with city views on high floor.",
              type: "accommodation",
              cost: 0,
              duration: "15 minutes",
              details: {
                location: "1-19-1 Kabukicho, Shinjuku City, Tokyo 160-0021",
                contact: "+81-3-6833-2111",
                tips: "Request high floor, complimentary WiFi, English-speaking staff available",
                amenities: ["City view", "Free WiFi", "Air conditioning", "Mini fridge", "Hair dryer", "Slippers"]
              }
            },
            {
              time: "21:30",
              activity: "Welcome dinner at Kozasa Restaurant - Authentic kaiseki course featuring seasonal ingredients, wagyu beef, and sake pairing option.",
              type: "meal",
              cost: 85,
              duration: "90 minutes",
              details: {
                location: "2-14-5 Kabukicho, Shinjuku (5-minute walk from hotel)",
                contact: "+81-3-3209-5553",
                tips: "Reservation confirmed, remove shoes, halal options available",
                menu: ["Seasonal sashimi", "Tempura vegetables", "Wagyu beef", "Miso soup", "Rice", "Green tea ice cream"],
                dressCode: "Smart casual"
              }
            }
          ],
          dayTotal: 130,
          highlights: [
            "First taste of authentic Japanese cuisine",
            "Experience Tokyo's neon-lit Shinjuku district",
            "Premium flight service with Malaysia Airlines"
          ]
        },
        {
          day: 2,
          title: "Cultural Heritage & Temple Discovery",
          activities: [
            "Traditional hotel breakfast buffet",
            "Senso-ji Temple spiritual experience",
            "Nakamise Shopping Street exploration",
            "Tea ceremony at Ueno Cultural Center",
            "Asakusa riverside evening stroll"
          ],
          meals: [
            { name: "Hotel Breakfast Buffet", time: "08:00", cost: 35, type: "breakfast" },
            { name: "Traditional Lunch at Daikokuya", time: "12:30", cost: 55, type: "lunch" },
            { name: "Kaiseki Dinner at Kikunoi", time: "19:00", cost: 120, type: "dinner" }
          ],
          accommodation: "Hotel Gracery Shinjuku",
          schedule: [
            {
              time: "08:00",
              activity: "Traditional Japanese breakfast buffet at hotel featuring miso soup, grilled fish, rice, and seasonal vegetables.",
              type: "meal",
              cost: 35,
              details: {
                location: "Hotel Gracery Shinjuku Restaurant",
                tips: "Try the traditional items, green tea included",
                menu: ["Miso soup", "Grilled salmon", "Japanese rice", "Pickled vegetables", "Nori seaweed"]
              }
            },
            {
              time: "09:30",
              activity: "Tokyo Metro to Asakusa Station - Ginza Line direct service with IC card payment.",
              type: "transport",
              cost: 15,
              duration: "25 minutes",
              details: {
                location: "Shinjuku-sanchome Station",
                tips: "Buy IC card for easy travel, morning rush hour",
                route: "Ginza Line to Asakusa"
              }
            },
            {
              time: "10:15",
              activity: "Senso-ji Temple visit - Tokyo's oldest Buddhist temple (645 AD) with incense purification ritual and Omikuji fortune telling.",
              type: "activity",
              cost: 25,
              duration: "2 hours",
              details: {
                location: "2-3-1 Asakusa, Taito City, Tokyo",
                highlights: ["Thunder Gate (Kaminarimon)", "Main hall worship", "Five-story pagoda", "Fortune telling"],
                tips: "Purify hands at water basin, bow before entering main hall",
                contact: "Temple office: +81-3-3842-0181"
              }
            }
          ],
          dayTotal: 430,
          highlights: [
            "Ancient Buddhist temple spiritual experience",
            "Traditional tea ceremony participation",
            "Historic Nakamise Street shopping"
          ]
        }
      ],
      accommodation: "Hotel Gracery Shinjuku",
      transport: ["Malaysia Airlines", "Tokyo Metro", "JR Lines", "Narita Express"],
      meals: ["Traditional Japanese cuisine", "Kaiseki dining", "Street food experiences"],
      activities: ["Temple visits", "Cultural ceremonies", "Modern Tokyo exploration"],
      flightClass: "premium_economy",
      flightDetails: {
        outbound: {
          airline: "Malaysia Airlines",
          flightNumber: "MH70",
          departure: {
            airport: "KUL - Kuala Lumpur International",
            time: "09:30"
          },
          arrival: {
            airport: "NRT - Narita International",
            time: "17:45"
          },
          duration: "7.5 hours",
          class: "Premium Economy",
          price: 1700
        },
        return: {
          airline: "Malaysia Airlines", 
          flightNumber: "MH71",
          departure: {
            airport: "NRT - Narita International",
            time: "17:30"
          },
          arrival: {
            airport: "KUL - Kuala Lumpur International",
            time: "23:45"
          },
          duration: "7.25 hours",
          class: "Premium Economy",
          price: 1700
        }
      },
      accommodationDetails: {
        hotels: [{
          name: "Hotel Gracery Shinjuku",
          rating: 4,
          location: "Shinjuku, Central Tokyo",
          amenities: ["Free WiFi", "Restaurant", "24h Front Desk", "Luggage Storage", "City Views", "Air Conditioning", "Godzilla Head Feature"],
          checkIn: "2024-03-15",
          checkOut: "2024-03-19", 
          roomType: "Superior Twin Room with City View",
          pricePerNight: 420,
          totalNights: 4,
          totalPrice: 1680
        }]
      },
      insuranceDetails: {
        provider: "Allianz Travel Insurance",
        coverage: [
          "Medical emergencies up to RM 500,000",
          "Trip cancellation coverage up to RM 10,000", 
          "Lost luggage compensation up to RM 2,000",
          "Flight delay compensation up to RM 500",
          "Personal accident coverage up to RM 100,000",
          "24/7 multilingual emergency assistance"
        ],
        price: 150
      },
      // Enhanced features
      api_powered: true,
      real_time_data: true,
      providers: ["Skyscanner", "Booking.com", "GetYourGuide", "Rome2Rio", "Uber", "XE Currency"],
      tier: "Ultimate Experience",
      lastUpdated: new Date().toISOString()
    }

    // Apply provider branding
    const brandedItinerary = enhanceItineraryWithBranding(enhancedItinerary)

    return NextResponse.json({
      success: true,
      message: "Enhanced itinerary with real API integration demo",
      parsed_itineraries: [
        brandedItinerary,
        {
          ...brandedItinerary,
          id: `enhanced-budget-${Date.now()}`,
          title: "Tokyo Budget Adventure",
          tier: "Budget-Friendly",
          price: {
            ...brandedItinerary.price,
            total: 5500,
            perPerson: 2750,
            breakdown: {
              flights: 2200,
              accommodation: 1200,
              meals: 800,
              activities: 600,
              transport: 300,
              insurance: 200,
              taxes: 200
            }
          },
          flightDetails: {
            ...brandedItinerary.flightDetails,
            outbound: {
              ...brandedItinerary.flightDetails.outbound,
              class: "Economy",
              price: 1100
            },
            return: {
              ...brandedItinerary.flightDetails.return,
              class: "Economy", 
              price: 1100
            }
          }
        },
        {
          ...brandedItinerary,
          id: `enhanced-luxury-${Date.now()}`,
          title: "Tokyo Luxury Experience",
          tier: "Luxury Experience",
          price: {
            ...brandedItinerary.price,
            total: 15000,
            perPerson: 7500,
            breakdown: {
              flights: 6000,
              accommodation: 4000,
              meals: 2000,
              activities: 1500,
              transport: 800,
              insurance: 400,
              taxes: 300
            }
          },
          flightDetails: {
            ...brandedItinerary.flightDetails,
            outbound: {
              ...brandedItinerary.flightDetails.outbound,
              class: "Business Class",
              price: 3000
            },
            return: {
              ...brandedItinerary.flightDetails.return,
              class: "Business Class",
              price: 3000
            }
          }
        }
      ],
      user_preferences: {
        destination: "Tokyo, Japan",
        departureCountry: "Malaysia",
        budget: 8500,
        currency: "MYR",
        travelers: 2,
        duration: "5 days",
        style: "cultural",
        interests: ["culture", "food", "sightseeing"],
        groupType: "couple",
        flightClass: "premium_economy"
      }
    })

  } catch (error) {
    console.error('Enhanced test itinerary API error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to load enhanced test itinerary',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}