import { NextRequest, NextResponse } from 'next/server'
import { API_CONFIG } from '../../../lib/api-config'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  type?: 'text' | 'suggestion' | 'itinerary' | 'booking_help'
}

interface TravelContext {
  user_id?: string
  current_trip?: {
    destination?: string
    departure_date?: string
    return_date?: string
    travelers?: number
    budget?: number
    interests?: string[]
  }
  travel_history?: Array<{
    destination: string
    date: string
    rating: number
  }>
  preferences?: {
    accommodation_type?: string
    travel_style?: string
    dietary_requirements?: string[]
    budget_range?: string
  }
}

interface ChatRequest {
  message: string
  context?: TravelContext
  conversation_id?: string
}

// Mock conversation storage - In production, this would be stored in a database
const conversations = new Map<string, ChatMessage[]>()

const generateConversationId = (): string => {
  return 'conv-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
}

const getCurrentUserId = (request: NextRequest): string => {
  return request.headers.get('x-user-id') || 'anonymous-user'
}

// Travel assistant system prompt
const SYSTEM_PROMPT = `You are Holiday AI's personal travel assistant, an expert travel advisor with deep knowledge of destinations worldwide. Your role is to provide helpful, accurate, and personalized travel advice to users planning their trips.

**Your personality:**
- Friendly, enthusiastic, and knowledgeable about travel
- Proactive in offering suggestions and alternatives
- Culturally sensitive and respectful
- Always prioritize user safety and practical advice

**Your expertise includes:**
- Destination recommendations based on preferences and budget
- Flight booking strategies and timing
- Accommodation suggestions for different budgets
- Local culture, customs, and etiquette
- Visa requirements and travel documentation
- Packing advice and travel gear recommendations
- Food and dining recommendations (including dietary restrictions)
- Transportation options and local navigation
- Weather patterns and best travel times
- Budget planning and cost-saving tips
- Safety advice and travel insurance
- Local attractions and hidden gems
- Emergency protocols and assistance

**Guidelines:**
1. Always ask clarifying questions to better understand user needs
2. Provide specific, actionable advice rather than generic responses
3. Include relevant details like costs, timeframes, and practical steps
4. Suggest alternatives when applicable
5. Mention potential challenges and how to overcome them
6. Keep responses concise but comprehensive
7. Use travel industry knowledge and current best practices
8. Reference real places, airlines, hotels when relevant
9. Be mindful of cultural differences and local customs
10. Always prioritize user safety and legal compliance

**Response format:**
- Use clear, conversational language
- Include bullet points for multiple suggestions
- Mention specific costs in relevant currency when possible
- Provide actionable next steps
- Offer to help with follow-up questions`

const generateTravelResponse = async (message: string, context: TravelContext, conversationHistory: ChatMessage[]): Promise<string> => {
  // Build context for the AI
  let contextPrompt = SYSTEM_PROMPT + "\n\n**Current conversation context:**\n"
  
  if (context.current_trip) {
    contextPrompt += `Current trip planning: ${JSON.stringify(context.current_trip)}\n`
  }
  
  if (context.preferences) {
    contextPrompt += `User preferences: ${JSON.stringify(context.preferences)}\n`
  }
  
  if (conversationHistory.length > 0) {
    contextPrompt += "\n**Recent conversation:**\n"
    conversationHistory.slice(-6).forEach(msg => {
      contextPrompt += `${msg.role}: ${msg.content}\n`
    })
  }
  
  contextPrompt += `\n**Current user message:** ${message}\n\nProvide a helpful response:`
  
  try {
    // In production, this would call OpenAI or another LLM API
    // For now, we'll provide intelligent mock responses based on patterns
    
    const lowerMessage = message.toLowerCase()
    
    // Flight-related queries
    if (lowerMessage.includes('flight') || lowerMessage.includes('airline') || lowerMessage.includes('book') && lowerMessage.includes('ticket')) {
      return generateFlightAdvice(message, context)
    }
    
    // Accommodation queries
    if (lowerMessage.includes('hotel') || lowerMessage.includes('accommodation') || lowerMessage.includes('stay') || lowerMessage.includes('resort')) {
      return generateAccommodationAdvice(message, context)
    }
    
    // Destination queries
    if (lowerMessage.includes('destination') || lowerMessage.includes('where should') || lowerMessage.includes('recommend') && (lowerMessage.includes('place') || lowerMessage.includes('country'))) {
      return generateDestinationAdvice(message, context)
    }
    
    // Budget queries
    if (lowerMessage.includes('budget') || lowerMessage.includes('cost') || lowerMessage.includes('expensive') || lowerMessage.includes('cheap')) {
      return generateBudgetAdvice(message, context)
    }
    
    // Visa/documentation queries
    if (lowerMessage.includes('visa') || lowerMessage.includes('passport') || lowerMessage.includes('document') || lowerMessage.includes('requirement')) {
      return generateDocumentationAdvice(message, context)
    }
    
    // Packing queries
    if (lowerMessage.includes('pack') || lowerMessage.includes('bring') || lowerMessage.includes('luggage') || lowerMessage.includes('suitcase')) {
      return generatePackingAdvice(message, context)
    }
    
    // Weather queries
    if (lowerMessage.includes('weather') || lowerMessage.includes('climate') || lowerMessage.includes('rain') || lowerMessage.includes('temperature')) {
      return generateWeatherAdvice(message, context)
    }
    
    // Food/dining queries
    if (lowerMessage.includes('food') || lowerMessage.includes('eat') || lowerMessage.includes('restaurant') || lowerMessage.includes('cuisine')) {
      return generateDiningAdvice(message, context)
    }
    
    // Emergency/safety queries
    if (lowerMessage.includes('emergency') || lowerMessage.includes('safety') || lowerMessage.includes('dangerous') || lowerMessage.includes('insurance')) {
      return generateSafetyAdvice(message, context)
    }
    
    // Transportation queries
    if (lowerMessage.includes('transport') || lowerMessage.includes('taxi') || lowerMessage.includes('bus') || lowerMessage.includes('train') || lowerMessage.includes('metro')) {
      return generateTransportationAdvice(message, context)
    }
    
    // General greeting or help
    if (lowerMessage.includes('hello') || lowerMessage.includes('help') || lowerMessage.includes('assistance') || message.length < 10) {
      return generateWelcomeMessage(context)
    }
    
    // Default comprehensive response
    return generateGeneralAdvice(message, context)
    
  } catch (error) {
    console.error('AI response generation error:', error)
    return "I apologize, but I'm having trouble generating a response right now. Please try rephrasing your question, and I'll do my best to help you with your travel planning!"
  }
}

const generateFlightAdvice = (message: string, context: TravelContext): string => {
  const destination = context.current_trip?.destination || "your destination"
  const budget = context.current_trip?.budget || 5000
  
  return `Great question about flights! Here's my advice:

**✈️ Best Booking Strategy:**
• Book 1-3 months in advance for best prices
• Tuesday-Thursday departures are typically cheaper
• Use our AI Price Predictor for optimal timing
• Consider nearby airports for potential savings

**💰 Budget Tips for RM ${budget} budget:**
• Economy class: RM 1,500-2,500 for regional flights
• Set price alerts for your route
• Be flexible with dates (+/- 3 days can save 15-20%)
• Consider layovers vs direct flights

**📱 Next Steps:**
1. Use our destination autocomplete to find exact routes
2. Set up price alerts for your preferred dates
3. Compare multiple airlines through our search
4. Check baggage policies before booking

Would you like me to help you search for flights to ${destination} or set up price monitoring?`
}

const generateAccommodationAdvice = (message: string, context: TravelContext): string => {
  const destination = context.current_trip?.destination || "your destination"
  const travelers = context.current_trip?.travelers || 2
  
  return `Perfect! Let me help you find the right accommodation:

**🏨 Accommodation Types:**
• **Budget (RM 100-300/night):** Hostels, guesthouses, budget hotels
• **Mid-range (RM 300-800/night):** 3-4 star hotels, boutique properties  
• **Luxury (RM 800+/night):** 5-star resorts, premium locations

**📍 Location Tips for ${destination}:**
• Stay near public transport for easy exploration
• City center for nightlife and dining
• Beach/resort areas for relaxation
• Consider walkability to main attractions

**💡 Booking Strategy:**
• Book 2-4 weeks in advance for best rates
• Check cancellation policies
• Read recent reviews (past 6 months)
• Compare prices across multiple platforms

**🔍 For ${travelers} travelers, I recommend:**
• Private room with ensuite bathroom
• Free WiFi and breakfast included
• 24-hour reception for assistance
• Good security and safe location

Want me to search for specific accommodations in ${destination} within your budget?`
}

const generateDestinationAdvice = (message: string, context: TravelContext): string => {
  const budget = context.current_trip?.budget || 5000
  const interests = context.current_trip?.interests || ['culture', 'food']
  
  return `Exciting! Let me suggest some amazing destinations based on your preferences:

**🌍 Perfect Matches for RM ${budget}:**

**Southeast Asia (Budget-friendly):**
• **Thailand** - Bangkok, Phuket (RM 2,500-4,000)
• **Vietnam** - Ho Chi Minh, Hanoi (RM 2,000-3,500)  
• **Indonesia** - Bali, Jakarta (RM 3,000-4,500)

**East Asia (Mid-range):**
• **Japan** - Tokyo, Osaka (RM 5,000-8,000)
• **South Korea** - Seoul, Busan (RM 4,000-6,000)
• **Taiwan** - Taipei (RM 3,500-5,000)

**Based on your interests in ${interests.join(', ')}:**
• Thailand: Amazing street food and temples
• Japan: Perfect blend of traditional and modern culture
• Vietnam: Rich history and incredible cuisine

**🎯 Factors I considered:**
• Flight costs from Malaysia
• Accommodation value for money
• Local experiences matching your interests
• Visa requirements (many are visa-free!)

Which of these destinations appeals to you most? I can provide detailed itineraries and budget breakdowns!`
}

const generateBudgetAdvice = (message: string, context: TravelContext): string => {
  const budget = context.current_trip?.budget || 5000
  const travelers = context.current_trip?.travelers || 2
  const duration = "1 week" // Default
  
  return `Let me help you optimize your RM ${budget} budget for ${travelers} travelers:

**💰 Smart Budget Allocation:**
• **Flights:** 35-40% (RM ${Math.round(budget * 0.375)})
• **Accommodation:** 25-30% (RM ${Math.round(budget * 0.275)})
• **Food:** 20-25% (RM ${Math.round(budget * 0.225)})
• **Activities:** 15-20% (RM ${Math.round(budget * 0.175)})
• **Transport:** 5-10% (RM ${Math.round(budget * 0.075)})

**🎯 Money-Saving Strategies:**
• **Flights:** Use price alerts, flexible dates, budget airlines
• **Hotels:** Book early, consider location vs price, read reviews
• **Food:** Mix of local eateries and special dining experiences
• **Activities:** Free walking tours, city passes for multiple attractions

**📊 Budget Tracking Tips:**
• Use our expense tracker during your trip
• Keep 10-15% buffer for unexpected costs
• Consider travel insurance (RM 100-200)
• Download offline maps to avoid roaming charges

**💡 Pro Tips:**
• Tuesday-Thursday travel is cheaper
• Shoulder season offers better value
• Local SIM cards vs international roaming
• Book accommodation with breakfast included

Would you like me to create a detailed daily budget breakdown for your specific destination?`
}

const generateDocumentationAdvice = (message: string, context: TravelContext): string => {
  const destination = context.current_trip?.destination || "your destination"
  
  return `Important question! Here's your documentation checklist:

**📋 Essential Documents:**
• **Passport:** Must be valid for 6+ months
• **Visa:** Required for some destinations (I can check specific requirements)
• **Travel Insurance:** Highly recommended (covers medical emergencies)
• **Flight Tickets:** Print backup copies
• **Hotel Confirmations:** Digital and physical copies

**🌏 Visa Requirements (from Malaysia):**
• **Visa-free:** Thailand, Indonesia, Singapore (30 days)
• **Visa-free:** Japan, South Korea (90 days)  
• **eVisa:** India, Sri Lanka, Myanmar
• **Visa required:** China, Russia, most African countries

**💉 Health Requirements:**
• **Yellow Fever:** Required for certain African countries
• **COVID-19:** Check current requirements (varies by destination)
• **Routine vaccinations:** Ensure up-to-date
• **Malaria prevention:** For tropical regions

**📱 Digital Preparations:**
• Download offline maps (Google Maps)
• Travel insurance app
• Embassy contact information
• Emergency contacts list
• Copies stored in cloud storage

**⏰ Timeline:**
• Apply for visas 2-4 weeks before travel
• Check passport expiry 6 months before booking
• Get vaccinations 4-6 weeks prior

Need specific visa information for ${destination}? I can provide detailed requirements and application processes!`
}

const generatePackingAdvice = (message: string, context: TravelContext): string => {
  const destination = context.current_trip?.destination || "your destination"
  const season = "depending on season" // Would be calculated based on travel dates
  
  return `Smart packing makes all the difference! Here's your customized packing guide:

**🎒 Essential Packing List:**

**👕 Clothing (${season}):**
• 3-4 comfortable t-shirts/tops
• 1-2 pairs of pants/jeans
• 1 light jacket or cardigan
• Comfortable walking shoes
• Flip-flops/sandals
• Sleepwear and underwear (7-day supply)

**📱 Tech & Documents:**
• Phone charger + portable battery
• Universal power adapter
• Passport & copies
• Travel insurance documents
• Offline maps downloaded

**🧴 Toiletries & Health:**
• Basic medications (pain relievers, stomach medicine)
• Sunscreen SPF 30+
• Personal hygiene items
• Hand sanitizer
• Face masks (if required)

**💼 Pro Packing Tips:**
• Roll clothes instead of folding (saves 30% space)
• Wear heaviest items on the plane
• Pack one complete outfit in carry-on
• Leave space for souvenirs

**🌡️ Destination-Specific for ${destination}:**
• Check local weather patterns
• Research cultural dress codes
• Consider laundry facilities
• Pack appropriate footwear for activities

**📏 Airline Restrictions:**
• Check baggage weight limits
• Liquids in 100ml containers for carry-on
• No prohibited items (check airline website)

Want me to create a detailed packing checklist based on your specific destination and activities?`
}

const generateWeatherAdvice = (message: string, context: TravelContext): string => {
  const destination = context.current_trip?.destination || "your destination"
  
  return `Weather can make or break your trip! Here's what you need to know:

**🌤️ Weather Planning for ${destination}:**

**📅 Best Times to Visit:**
• **Peak Season:** December-February (cool, dry)
• **Shoulder Season:** March-May, September-November (good weather, fewer crowds)
• **Low Season:** June-August (rainy season, but lower prices)

**🌡️ What to Expect:**
• **Temperature:** 25-35°C year-round (tropical)
• **Humidity:** High (60-80%)
• **Rainfall:** Monsoon season varies by region
• **UV Index:** Very high (9-11) - sunscreen essential!

**☔ Rainy Season Tips:**
• Pack lightweight waterproof jacket
• Quick-dry clothing materials
• Waterproof bag for electronics
• Indoor activity backups
• Umbrella (or buy locally)

**🌞 Hot Weather Strategies:**
• Start activities early morning (6-9 AM)
• Take midday breaks (12-3 PM)
• Hydrate frequently (2-3L water daily)
• Wear breathable, light-colored clothing
• Seek air-conditioned spaces during peak heat

**📱 Weather Apps:**
• AccuWeather for detailed forecasts
• Weather.com for rain radar
• Local weather apps for accurate predictions

**🎒 Weather-Appropriate Packing:**
• Lightweight, breathable fabrics
• Sun hat and sunglasses
• Reef-safe sunscreen (some destinations require this)
• Light rain jacket or poncho

Would you like specific weather insights for your travel dates to ${destination}?`
}

const generateDiningAdvice = (message: string, context: TravelContext): string => {
  const destination = context.current_trip?.destination || "your destination"
  const dietary = context.preferences?.dietary_requirements || []
  
  return `Food is one of the best parts of travel! Here's your dining guide:

**🍜 Food Scene in ${destination}:**

**🥇 Must-Try Local Dishes:**
• Street food markets (budget-friendly, authentic)
• Traditional restaurants (cultural experience)
• Local breakfast spots (start your day right)
• Night markets (vibrant atmosphere)

**💰 Dining Budget Breakdown:**
• **Street food:** RM 5-15 per meal
• **Local restaurants:** RM 15-40 per meal  
• **Mid-range dining:** RM 40-80 per meal
• **Fine dining:** RM 100+ per meal

**🌱 Dietary Considerations:**
${dietary.length > 0 ? `I see you have ${dietary.join(', ')} dietary requirements:` : ''}
• Research local ingredients and preparation methods
• Learn key phrases in local language
• Use translation apps for menu items
• Find restaurants with English menus or pictures

**🍽️ Dining Etiquette Tips:**
• Observe local customs (chopsticks vs hands vs utensils)
• Tipping practices vary by country
• Some cultures share dishes family-style
• Street food is generally safe if busy (high turnover)

**📱 Useful Food Apps:**
• Google Translate for menus
• HappyCow for vegetarian/vegan options
• TripAdvisor for restaurant reviews
• Local food delivery apps

**🏪 Food Safety Guidelines:**
• Choose busy stalls (fresh ingredients)
• Avoid raw vegetables in some regions
• Bottled or boiled water
• Peel fruits yourself

Want specific restaurant recommendations and food experiences for ${destination}? I can suggest must-try dishes and trusted dining spots!`
}

const generateSafetyAdvice = (message: string, context: TravelContext): string => {
  const destination = context.current_trip?.destination || "your destination"
  
  return `Safety first! Here's your comprehensive safety guide:

**🛡️ General Safety Principles:**
• Trust your instincts - if something feels wrong, leave
• Keep copies of important documents separate from originals
• Share your itinerary with someone back home
• Register with your embassy if traveling to higher-risk areas

**📱 Emergency Preparedness:**
• Save local emergency numbers (police, medical, embassy)
• Download offline maps and translation apps
• Keep emergency contacts readily available
• Travel insurance with 24/7 assistance hotline

**💰 Money & Valuables:**
• Use hotel safes for passports and extra cash
• Carry only what you need for the day
• Multiple payment methods (cards + cash)
• Notify banks of travel plans

**🌍 Destination-Specific Safety for ${destination}:**
• Check current government travel advisories
• Research common tourist scams
• Understand local laws and customs
• Know cultural do's and don'ts

**🚑 Health & Medical:**
• Travel insurance is ESSENTIAL (RM 100-200)
• Pack basic first aid supplies
• Research local healthcare quality
• Bring sufficient prescription medications

**🌙 Safety While Exploring:**
• Stay in well-lit, populated areas at night
• Use official taxis or reputable ride-sharing apps
• Don't accept drinks from strangers
• Keep accommodation address written in local language

**📞 Emergency Contacts:**
• Your embassy/consulate
• Travel insurance 24/7 hotline
• Local police/medical services
• Hotel/accommodation contact

**🔒 Accommodation Security:**
• Check reviews for safety mentions
• Verify location is safe for walking
• Ensure 24-hour reception or security
• Use door locks and hotel safes

Need specific safety information for ${destination} or advice on travel insurance options?`
}

const generateTransportationAdvice = (message: string, context: TravelContext): string => {
  const destination = context.current_trip?.destination || "your destination"
  
  return `Getting around efficiently saves time and money! Here's your transport guide:

**🚗 Transportation Options in ${destination}:**

**✈️ Airport Transfers:**
• **Official taxi:** Usually most reliable, fixed rates
• **Ride-sharing:** Grab, Uber (where available)
• **Airport bus:** Budget-friendly, may take longer
• **Hotel shuttle:** Check if your accommodation offers this

**🚌 Public Transportation:**
• **Metro/MRT:** Fast, efficient, tourist-friendly
• **Local buses:** Cheapest option, requires local knowledge
• **Tuk-tuks/Motorbikes:** Fun but negotiate prices first
• **Walking:** Many attractions are walkable in city centers

**💰 Cost Comparison (daily):**
• **Walking + occasional taxi:** RM 20-50
• **Public transport pass:** RM 10-30  
• **Ride-sharing:** RM 50-100
• **Private driver (full day):** RM 200-400

**📱 Essential Transport Apps:**
• Google Maps (works offline)
• Local transport apps (varies by city)
• Ride-sharing apps (Grab, Uber)
• Currency converter for fare negotiations

**🎫 Money-Saving Tips:**
• Buy daily/weekly transport passes
• Walk during cooler parts of the day
• Combine attractions by location
• Use hotel concierge for directions/advice

**🗺️ Navigation Strategies:**
• Download offline maps before arrival
• Screenshot important addresses in local language
• Keep business card of your hotel
• Learn basic direction phrases

**⚠️ Transport Safety:**
• Use official/licensed transportation
• Agree on fare before starting journey
• Keep small bills for exact change
• Avoid unlicensed taxis at airports

**🚕 Pro Tips:**
• Rush hours: 7-9 AM, 5-7 PM (plan accordingly)
• Some cities have women-only transport sections
• Motorbike taxis: exciting but wear provided helmet
• Night transport may be limited or more expensive

Want specific route recommendations or transport apps for ${destination}?`
}

const generateWelcomeMessage = (context: TravelContext): string => {
  const destination = context.current_trip?.destination
  
  return `Hello! 👋 I'm your personal Holiday AI travel assistant, here to help make your trip planning effortless and amazing!

**🌟 How I Can Help You:**
• **Flight strategies** - Best booking times and price predictions
• **Accommodation advice** - Perfect stays within your budget
• **Destination insights** - Hidden gems and must-see attractions  
• **Cultural guidance** - Local customs and etiquette
• **Budget optimization** - Stretch your ringgit further
• **Safety tips** - Stay secure and confident while traveling
• **Packing assistance** - Never forget the essentials
• **Food recommendations** - Delicious local and international cuisine

${destination ? `I see you're interested in ${destination}! That's an excellent choice. ` : ''}

**💬 Just ask me anything about:**
• "What's the best time to book flights?"
• "Help me plan a budget for Thailand"  
• "What should I pack for Japan in winter?"
• "Is it safe to travel to Indonesia?"
• "Where should I eat in Singapore?"

**🚀 Ready to start?** Tell me:
1. Where would you like to go?
2. What's your approximate budget?
3. When are you planning to travel?
4. What interests you most? (food, culture, adventure, relaxation)

I'm here 24/7 to make your travel dreams come true! What would you like to know first? ✈️`
}

const generateGeneralAdvice = (message: string, context: TravelContext): string => {
  return `Great question! I'm here to help with all aspects of your travel planning.

Based on your message, here are some suggestions:

**🎯 Travel Planning Essentials:**
• **Research your destination** thoroughly before booking
• **Set a realistic budget** including a 10-15% buffer
• **Check visa requirements** and passport validity (6+ months)
• **Compare prices** across different platforms and dates
• **Read recent reviews** for accommodations and activities

**💡 Pro Tips:**
• Book flights 1-3 months in advance for best prices
• Consider shoulder season for better value and fewer crowds
• Mix of planned activities and spontaneous exploration
• Learn a few local phrases - locals appreciate the effort!

**🔍 Need More Specific Help?**
I can provide detailed advice on:
• Flight booking strategies and price predictions
• Budget breakdowns and cost-saving tips
• Accommodation recommendations by area and budget
• Cultural insights and local customs
• Safety guidelines and health considerations
• Packing lists tailored to your destination and season

**📱 Next Steps:**
Feel free to ask more specific questions like:
• "Help me plan a 7-day budget for Tokyo"
• "What's the best area to stay in Bangkok?"
• "When should I book flights to get the best prices?"

What aspect of your travel planning would you like me to focus on first?`
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()
    const userId = getCurrentUserId(request)
    
    if (!body.message?.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Message is required'
      }, { status: 400 })
    }
    
    // Get or create conversation
    const conversationId = body.conversation_id || generateConversationId()
    const conversation = conversations.get(conversationId) || []
    
    // Add user message
    const userMessage: ChatMessage = {
      id: 'msg-' + Date.now() + '-user',
      role: 'user',
      content: body.message.trim(),
      timestamp: new Date().toISOString(),
      type: 'text'
    }
    
    conversation.push(userMessage)
    
    // Generate AI response
    const aiResponse = await generateTravelResponse(
      body.message,
      body.context || {},
      conversation
    )
    
    // Add assistant message  
    const assistantMessage: ChatMessage = {
      id: 'msg-' + Date.now() + '-assistant',
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString(),
      type: 'text'
    }
    
    conversation.push(assistantMessage)
    
    // Store conversation (limit to last 50 messages)
    if (conversation.length > 50) {
      conversation.splice(0, conversation.length - 50)
    }
    conversations.set(conversationId, conversation)
    
    return NextResponse.json({
      success: true,
      data: {
        message: assistantMessage,
        conversation_id: conversationId,
        context_updated: body.context ? true : false
      }
    })
    
  } catch (error: any) {
    console.error('Travel assistant error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to process your message. Please try again.'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const conversationId = request.nextUrl.searchParams.get('conversation_id')
    
    if (!conversationId) {
      return NextResponse.json({
        success: false,
        error: 'Conversation ID is required'
      }, { status: 400 })
    }
    
    const conversation = conversations.get(conversationId) || []
    
    return NextResponse.json({
      success: true,
      data: {
        conversation_id: conversationId,
        messages: conversation,
        message_count: conversation.length
      }
    })
    
  } catch (error: any) {
    console.error('Get conversation error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch conversation'
    }, { status: 500 })
  }
}