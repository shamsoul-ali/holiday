// Sample detailed itinerary for testing the enhanced Daily Itinerary display
export const sampleDetailedItinerary = {
  id: `sample-${Date.now()}`,
  title: "Tokyo Cultural Discovery",
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
        "Arrival at Narita International Airport",
        "Check-in at Hotel Gracery Shinjuku",
        "Welcome dinner at traditional Japanese restaurant",
        "Evening exploration of Shinjuku district"
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
          activity: "Flight departure from Kuala Lumpur International Airport (KLIA) Terminal 1, Gate G7 - Malaysia Airlines MH70. Arrive 3 hours early for international check-in. Weather: 32°C sunny",
          type: "transport",
          cost: 0,
          duration: "7.5 hours",
          details: {
            location: "KLIA Terminal 1, Gate G7",
            contact: "Malaysia Airlines Check-in Counter L",
            tips: "Download entertainment, bring power bank, halal meals pre-ordered",
            weatherCondition: "Sunny, 32°C"
          }
        },
        {
          time: "17:45",
          activity: "Arrival at Narita International Airport Terminal 1. Immigration, baggage claim at Carousel 5. Weather in Tokyo: 18°C partly cloudy, perfect spring weather",
          type: "transport", 
          cost: 0,
          duration: "45 minutes processing",
          details: {
            location: "Narita International Airport Terminal 1",
            contact: "Immigration Counter Zone A",
            tips: "Have passport ready, fill arrival card on plane, exchange money at terminal",
            weatherCondition: "Partly cloudy, 18°C"
          }
        },
        {
          time: "19:00",
          activity: "Narita Express (NEX) to Shinjuku Station - Platform 1, Car 4-6 (reserved seats). Scenic 1-hour journey through Tokyo suburbs. Free WiFi onboard",
          type: "transport",
          cost: 45,
          duration: "55 minutes",
          details: {
            location: "Narita Airport Station Platform 1",
            contact: "JR East Information Center",
            tips: "Buy JR Pass if staying longer, reserved seats recommended, announcements in English",
            route: "Narita Airport → Tokyo → Shinjuku (express service)"
          }
        },
        {
          time: "20:30", 
          activity: "Check-in at Hotel Gracery Shinjuku (1-19-1 Kabukicho, Shinjuku). 4-star hotel with Godzilla head on 8th floor. Room 1205 - Superior Twin with city view",
          type: "accommodation",
          cost: 0,
          duration: "15 minutes",
          details: {
            location: "1-19-1 Kabukicho, Shinjuku City, Tokyo 160-0021",
            contact: "+81-3-6833-2111",
            tips: "Ask for high floor room, free WiFi, luggage storage available, English-speaking staff",
            amenities: ["City view", "Free WiFi", "Air conditioning", "Mini fridge", "Hair dryer", "Slippers"]
          }
        },
        {
          time: "21:30",
          activity: "Welcome Traditional Japanese Dinner at Kozasa Restaurant (2-14-5 Kabukicho). Authentic kaiseki experience with seasonal ingredients. 7-course tasting menu featuring sashimi, tempura, miso soup, wagyu beef",
          type: "meal",
          cost: 85,
          duration: "90 minutes",
          details: {
            location: "2-14-5 Kabukicho, Shinjuku (5-minute walk from hotel)",
            contact: "+81-3-3209-5553",
            tips: "Reservation confirmed, remove shoes, try sake pairing (+RM 25), halal options available",
            menu: ["Seasonal sashimi", "Tempura vegetables", "Wagyu beef", "Miso soup", "Rice", "Green tea ice cream"],
            dressCode: "Smart casual"
          }
        },
        {
          time: "23:00",
          activity: "Evening exploration of Shinjuku Golden Gai - Historic bar district with 200+ tiny bars. Experience Tokyo's nightlife culture, street photography. Safe area with friendly locals",
          type: "activity",
          cost: 0,
          duration: "60 minutes",
          details: {
            location: "Golden Gai, Kabukicho, Shinjuku (2 minutes from hotel)",
            contact: "Tourist Information: +81-3-3344-3077",
            tips: "Just window shopping and photos, most bars charge cover fees, very photogenic neon lights",
            highlights: ["Neon signs photography", "Traditional bar culture", "Local atmosphere", "Safe walking area"]
          }
        },
        {
          time: "00:30",
          activity: "Return to hotel, rest and prepare for tomorrow's temple visits. Set alarm for 7:30 AM. Hotel provides morning wake-up call service if requested",
          type: "free time",
          cost: 0,
          duration: "8 hours rest",
          details: {
            location: "Hotel Gracery Shinjuku Room 1205",
            tips: "Adjust to local time, drink water, charge devices, review tomorrow's itinerary",
            weatherTomorrow: "Sunny, 20°C - perfect for temple visits"
          }
        }
      ],
      dayTotal: 130,
      highlights: [
        "First taste of authentic Japanese cuisine",
        "Explore the neon-lit Shinjuku district",
        "Experience Tokyo's nighttime energy"
      ]
    },
    {
      day: 2,
      title: "Traditional Culture & Historic Asakusa",
      activities: [
        "Traditional Japanese breakfast at hotel",
        "Visit ancient Senso-ji Temple",
        "Explore Nakamise Shopping Street",
        "Traditional lunch in historic district",
        "Asakusa Cultural Center visit",
        "Traditional tea ceremony experience"
      ],
      meals: [
        {
          name: "Traditional Japanese Breakfast",
          time: "08:00",
          cost: 35,
          type: "breakfast"
        },
        {
          name: "Historic District Traditional Lunch",
          time: "12:30",
          cost: 55,
          type: "lunch"
        },
        {
          name: "Kaiseki Dinner Experience",
          time: "19:00",
          cost: 120,
          type: "dinner"
        }
      ],
      accommodation: "Hotel Gracery Shinjuku",
      schedule: [
        {
          time: "08:00",
          activity: "Traditional Japanese Breakfast at hotel",
          type: "meal",
          cost: 35
        },
        {
          time: "09:30",
          activity: "Subway to Asakusa Station",
          type: "transport",
          cost: 15
        },
        {
          time: "10:15",
          activity: "Visit ancient Senso-ji Temple & Nakamise Street",
          type: "activity",
          cost: 25
        },
        {
          time: "12:30",
          activity: "Historic District Traditional Lunch at Daikokuya",
          type: "meal",
          cost: 55
        },
        {
          time: "14:00",
          activity: "Asakusa Cultural Center & Tokyo views",
          type: "activity",
          cost: 20
        },
        {
          time: "15:30",
          activity: "Traditional Tea Ceremony Experience",
          type: "activity",
          cost: 65
        },
        {
          time: "17:00",
          activity: "Explore traditional craft shops",
          type: "shopping",
          cost: 80
        },
        {
          time: "19:00",
          activity: "Kaiseki Dinner Experience at Kikunoi",
          type: "meal",
          cost: 120
        },
        {
          time: "21:30",
          activity: "Evening return to hotel",
          type: "transport",
          cost: 15
        }
      ],
      dayTotal: 430,
      highlights: [
        "Ancient Senso-ji Temple spiritual experience",
        "Authentic tea ceremony participation",
        "Traditional crafts and cultural immersion"
      ]
    },
    {
      day: 3,
      title: "Modern Tokyo & Iconic Landmarks",
      activities: [
        "Hotel breakfast buffet",
        "Tokyo Skytree observation decks",
        "Sumida River cruise experience",
        "Ginza district luxury shopping",
        "Imperial Palace East Gardens",
        "Modern Japanese fusion dinner"
      ],
      meals: [
        {
          name: "Hotel Breakfast Buffet",
          time: "08:00",
          cost: 40,
          type: "breakfast"
        },
        {
          name: "Ginza Sushi Lunch at Jiro's",
          time: "13:00",
          cost: 95,
          type: "lunch"
        },
        {
          name: "Modern Japanese Fusion Dinner",
          time: "19:30",
          cost: 110,
          type: "dinner"
        }
      ],
      accommodation: "Hotel Gracery Shinjuku",
      schedule: [
        {
          time: "08:00",
          activity: "Hotel Breakfast Buffet",
          type: "meal",
          cost: 40
        },
        {
          time: "09:45",
          activity: "Subway to Tokyo Skytree",
          type: "transport",
          cost: 18
        },
        {
          time: "10:30",
          activity: "Tokyo Skytree Observation Decks (350m & 450m)",
          type: "activity",
          cost: 85
        },
        {
          time: "12:00",
          activity: "Sumida River Cruise to Ginza",
          type: "activity",
          cost: 45
        },
        {
          time: "13:00",
          activity: "Ginza Sushi Lunch at Jiro's (world-famous)",
          type: "meal",
          cost: 95
        },
        {
          time: "15:00",
          activity: "Ginza District Luxury Shopping & Window Shopping",
          type: "shopping",
          cost: 120
        },
        {
          time: "16:30",
          activity: "Imperial Palace East Gardens Stroll",
          type: "activity",
          cost: 0
        },
        {
          time: "18:00",
          activity: "Traditional Japanese Garden Photography",
          type: "activity",
          cost: 0
        },
        {
          time: "19:30",
          activity: "Modern Japanese Fusion Dinner at Narisawa",
          type: "meal",
          cost: 110
        },
        {
          time: "21:30",
          activity: "Return to hotel via taxi",
          type: "transport",
          cost: 35
        }
      ],
      dayTotal: 548,
      highlights: [
        "Breathtaking Tokyo views from Skytree",
        "World-famous sushi experience",
        "Imperial Palace gardens serenity"
      ]
    },
    {
      day: 4,
      title: "Pop Culture & Entertainment District",
      activities: [
        "Japanese breakfast at local cafe",
        "Harajuku fashion district exploration",
        "Shibuya Crossing famous experience",
        "Meiji Shrine spiritual visit",
        "Ameya-Yokocho market adventure",
        "Robot Restaurant entertainment show"
      ],
      meals: [
        {
          name: "Local Cafe Japanese Breakfast",
          time: "08:30",
          cost: 30,
          type: "breakfast"
        },
        {
          name: "Harajuku Street Food Experience",
          time: "12:30",
          cost: 45,
          type: "lunch"
        },
        {
          name: "Yakiniku BBQ Dinner Experience",
          time: "19:00",
          cost: 90,
          type: "dinner"
        }
      ],
      accommodation: "Hotel Gracery Shinjuku",
      schedule: [
        {
          time: "08:30",
          activity: "Local Cafe Japanese Breakfast near hotel",
          type: "meal",
          cost: 30
        },
        {
          time: "10:00",
          activity: "Subway to Harajuku Station",
          type: "transport",
          cost: 15
        },
        {
          time: "10:30",
          activity: "Harajuku Fashion District & Takeshita Street",
          type: "activity",
          cost: 60
        },
        {
          time: "12:30",
          activity: "Harajuku Street Food Experience (Crepes, Takoyaki)",
          type: "meal",
          cost: 45
        },
        {
          time: "14:00",
          activity: "Walk to famous Shibuya Crossing",
          type: "activity",
          cost: 0
        },
        {
          time: "14:30",
          activity: "Shibuya Sky Observatory for crossing views",
          type: "activity",
          cost: 40
        },
        {
          time: "15:45",
          activity: "Meiji Shrine peaceful spiritual visit",
          type: "activity",
          cost: 0
        },
        {
          time: "17:00",
          activity: "Ameya-Yokocho Market bargain hunting",
          type: "shopping",
          cost: 75
        },
        {
          time: "19:00",
          activity: "Yakiniku BBQ Dinner Experience",
          type: "meal",
          cost: 90
        },
        {
          time: "21:00",
          activity: "Robot Restaurant Entertainment Show",
          type: "activity",
          cost: 85
        },
        {
          time: "23:00",
          activity: "Return to hotel",
          type: "transport",
          cost: 20
        }
      ],
      dayTotal: 460,
      highlights: [
        "Iconic Shibuya Crossing experience",
        "Colorful Harajuku fashion culture",
        "Spectacular Robot Restaurant show"
      ]
    },
    {
      day: 5,
      title: "Farewell Tokyo & Departure",
      activities: [
        "Final Japanese breakfast",
        "Last-minute souvenir shopping",
        "Tokyo Station exploration",
        "Airport departure preparations",
        "Flight back to Malaysia"
      ],
      meals: [
        {
          name: "Final Japanese Breakfast",
          time: "08:00",
          cost: 35,
          type: "breakfast"
        },
        {
          name: "Airport Bento Box",
          time: "13:30",
          cost: 25,
          type: "lunch"
        }
      ],
      accommodation: "Departure Day",
      schedule: [
        {
          time: "08:00",
          activity: "Final Japanese Breakfast at hotel",
          type: "meal",
          cost: 35
        },
        {
          time: "09:30",
          activity: "Check-out from hotel",
          type: "accommodation",
          cost: 0
        },
        {
          time: "10:00",
          activity: "Last-minute souvenir shopping in Shinjuku",
          type: "shopping",
          cost: 100
        },
        {
          time: "11:30",
          activity: "Tokyo Station exploration & train museum",
          type: "activity",
          cost: 20
        },
        {
          time: "13:00",
          activity: "Narita Express to airport",
          type: "transport",
          cost: 50
        },
        {
          time: "13:30",
          activity: "Airport Bento Box lunch",
          type: "meal",
          cost: 25
        },
        {
          time: "15:00",
          activity: "Airport check-in and duty-free shopping",
          type: "activity",
          cost: 80
        },
        {
          time: "17:30",
          activity: "Flight departure to Kuala Lumpur",
          type: "transport",
          cost: 0
        },
        {
          time: "23:45",
          activity: "Arrival in Malaysia",
          type: "transport",
          cost: 0
        }
      ],
      dayTotal: 310,
      highlights: [
        "Final Tokyo memories shopping",
        "Efficient Japanese transportation experience",
        "Departure with unforgettable memories"
      ]
    }
  ],
  accommodation: "Hotel Gracery Shinjuku",
  transport: ["Malaysia Airlines Flight", "Tokyo Metro", "JR Lines", "Airport Express"],
  meals: ["Traditional Japanese cuisine", "Sushi experiences", "Street food adventures"],
  activities: ["Temple visits", "Cultural experiences", "Modern Tokyo exploration", "Shopping districts"],
  flightClass: "economy",
  flightDetails: {
    outbound: {
      airline: "Malaysia Airlines",
      flightNumber: "MH70",
      departure: {
        airport: "KUL",
        time: "09:30"
      },
      arrival: {
        airport: "NRT",
        time: "17:45"
      },
      duration: "7.5 hours",
      class: "Economy",
      price: 1700
    },
    return: {
      airline: "Malaysia Airlines",
      flightNumber: "MH71",
      departure: {
        airport: "NRT",
        time: "17:30"
      },
      arrival: {
        airport: "KUL",
        time: "23:45"
      },
      duration: "7.25 hours",
      class: "Economy",
      price: 1700
    }
  },
  accommodationDetails: {
    hotels: [{
      name: "Hotel Gracery Shinjuku",
      rating: 4,
      location: "Shinjuku, Central Tokyo",
      amenities: ["Free WiFi", "Restaurant", "24h Front Desk", "Luggage Storage", "City Views", "Air Conditioning"],
      checkIn: "2024-03-15",
      checkOut: "2024-03-19",
      roomType: "Superior Twin Room",
      pricePerNight: 420,
      totalNights: 4,
      totalPrice: 1680
    }]
  },
  insuranceDetails: {
    provider: "Allianz Travel Insurance",
    coverage: [
      "Medical emergencies up to RM 500,000",
      "Trip cancellation coverage",
      "Lost luggage compensation",
      "Flight delay compensation",
      "Personal accident coverage",
      "24/7 emergency assistance"
    ],
    price: 150
  }
}

export default sampleDetailedItinerary