'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  Sparkles, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Users, 
  Clock, 
  TrendingUp, 
  Lightbulb,
  ChevronRight,
  Star,
  Wand2,
  Target,
  BarChart3,
  Route,
  Shuffle,
  CheckCircle,
  X,
  RefreshCw,
  Send,
  Bot,
  User
} from 'lucide-react'

interface TripPreferences {
  destination: string
  budget: number
  duration: number
  travelers: number
  travelStyle: 'budget' | 'mid-range' | 'luxury' | 'adventure' | 'cultural' | 'relaxation'
  interests: string[]
  mobility: 'high' | 'moderate' | 'low'
  season: string
  previousTrips: string[]
}

interface AIRecommendation {
  id: string
  type: 'destination' | 'activity' | 'optimization' | 'alternative' | 'seasonal'
  title: string
  description: string
  confidence: number
  reasoning: string[]
  impact: 'budget' | 'experience' | 'time' | 'convenience'
  savings?: number
  alternatives?: string[]
}

interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  recommendations?: AIRecommendation[]
}

export default function SmartTripPlanningAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'chat' | 'preferences' | 'recommendations'>('chat')
  const [preferences, setPreferences] = useState<TripPreferences>({
    destination: '',
    budget: 5000,
    duration: 7,
    travelers: 2,
    travelStyle: 'mid-range',
    interests: [],
    mobility: 'moderate',
    season: 'flexible',
    previousTrips: []
  })
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])

  const interests = [
    'Adventure Sports', 'Cultural Heritage', 'Food & Dining', 'Museums & Art',
    'Nightlife', 'Nature & Wildlife', 'Photography', 'Shopping',
    'Wellness & Spa', 'Historical Sites', 'Local Experiences', 'Festivals'
  ]

  const travelStyles = [
    { id: 'budget', name: 'Budget Explorer', desc: 'Maximum experiences, minimum cost' },
    { id: 'mid-range', name: 'Smart Traveler', desc: 'Balance of comfort and value' },
    { id: 'luxury', name: 'Premium Experience', desc: 'Top-tier comfort and service' },
    { id: 'adventure', name: 'Thrill Seeker', desc: 'Active and adventurous activities' },
    { id: 'cultural', name: 'Cultural Immersion', desc: 'Deep local cultural experiences' },
    { id: 'relaxation', name: 'Peaceful Retreat', desc: 'Rest, rejuvenation, and tranquility' }
  ]

  // Simulate AI responses
  const generateAIResponse = async (userMessage: string): Promise<ChatMessage> => {
    setIsTyping(true)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const aiRecommendations: AIRecommendation[] = [
      {
        id: '1',
        type: 'optimization',
        title: 'Budget Optimization Opportunity',
        description: 'Flying mid-week instead of weekends could save you 25% on flights',
        confidence: 92,
        reasoning: [
          'Historical data shows 25% lower prices on Tuesday/Wednesday flights',
          'Your flexible travel dates allow for this optimization',
          'Hotel rates are also 15% lower on weekdays'
        ],
        impact: 'budget',
        savings: 750
      },
      {
        id: '2',
        type: 'seasonal',
        title: 'Perfect Season Match',
        description: 'October is ideal for your destination - perfect weather and fewer crowds',
        confidence: 88,
        reasoning: [
          'Average temperature of 24°C with minimal rainfall',
          '40% fewer tourists compared to peak season',
          'Local festivals and cultural events are active'
        ],
        impact: 'experience'
      },
      {
        id: '3',
        type: 'alternative',
        title: 'Hidden Gem Alternative',
        description: 'Consider Penang instead of Kuala Lumpur for better cultural immersion',
        confidence: 76,
        reasoning: [
          'Better cultural heritage sites aligned with your interests',
          '30% lower overall costs while maintaining quality',
          'Less crowded with more authentic local experiences'
        ],
        impact: 'experience',
        alternatives: ['George Town Heritage Sites', 'Street Food Paradise', 'Arts District']
      }
    ]

    const response: ChatMessage = {
      id: Date.now().toString(),
      type: 'assistant',
      content: `Based on your preferences for ${preferences.destination} with a ${preferences.travelStyle} style, I've analyzed thousands of data points to provide personalized recommendations. Here are my top suggestions to optimize your trip experience and budget.`,
      timestamp: new Date(),
      recommendations: aiRecommendations
    }

    setIsTyping(false)
    return response
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')

    const aiResponse = await generateAIResponse(inputMessage)
    setMessages(prev => [...prev, aiResponse])
    
    if (aiResponse.recommendations) {
      setRecommendations(prev => [...prev, ...aiResponse.recommendations!])
    }
  }

  const handleInterestToggle = (interest: string) => {
    setPreferences(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  return (
    <>
      {/* Floating Assistant Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Brain className="w-8 h-8 text-white" />
        <motion.div
          className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Sparkles className="w-3 h-3 text-white" />
        </motion.div>
      </motion.button>

      {/* Main Assistant Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Trip Planner</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Your intelligent travel companion</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                {[
                  { id: 'chat', name: 'AI Chat', icon: Bot },
                  { id: 'preferences', name: 'Preferences', icon: Target },
                  { id: 'recommendations', name: 'Insights', icon: Lightbulb }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 px-6 py-4 transition-colors ${
                      activeTab === tab.id
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.name}</span>
                  </button>
                ))}
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-hidden">
                {activeTab === 'chat' && (
                  <div className="h-full flex flex-col">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      {messages.length === 0 && (
                        <div className="text-center py-8">
                          <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            Welcome to AI Trip Planner
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300">
                            Ask me anything about your trip - destinations, budget optimization, activities, or alternatives!
                          </p>
                        </div>
                      )}

                      {messages.map((message) => (
                        <div key={message.id} className="flex space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            message.type === 'assistant' 
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
                              : 'bg-gray-600'
                          }`}>
                            {message.type === 'assistant' ? (
                              <Bot className="w-5 h-5 text-white" />
                            ) : (
                              <User className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className={`p-4 rounded-2xl ${
                              message.type === 'assistant'
                                ? 'bg-gray-100 dark:bg-gray-800'
                                : 'bg-blue-600 text-white ml-auto max-w-xs'
                            }`}>
                              <p className="text-sm">{message.content}</p>
                            </div>
                            
                            {/* Recommendations */}
                            {message.recommendations && (
                              <div className="mt-4 space-y-3">
                                {message.recommendations.map((rec) => (
                                  <motion.div
                                    key={rec.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800"
                                  >
                                    <div className="flex items-start justify-between mb-2">
                                      <h4 className="font-medium text-gray-900 dark:text-white">{rec.title}</h4>
                                      <div className="flex items-center space-x-1">
                                        <Star className="w-4 h-4 text-yellow-500" />
                                        <span className="text-sm text-gray-600">{rec.confidence}%</span>
                                      </div>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{rec.description}</p>
                                    
                                    {rec.savings && (
                                      <div className="inline-flex items-center space-x-1 px-3 py-1 bg-green-100 dark:bg-green-900/20 rounded-full text-sm text-green-700 dark:text-green-400 mb-3">
                                        <DollarSign className="w-4 h-4" />
                                        <span>Save MYR {rec.savings}</span>
                                      </div>
                                    )}
                                    
                                    <details className="text-sm">
                                      <summary className="cursor-pointer text-blue-600 hover:text-blue-700">
                                        View reasoning
                                      </summary>
                                      <ul className="mt-2 space-y-1 text-gray-600 dark:text-gray-300">
                                        {rec.reasoning.map((reason, idx) => (
                                          <li key={idx} className="flex items-start space-x-2">
                                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                            <span>{reason}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </details>
                                  </motion.div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Typing indicator */}
                      {isTyping && (
                        <div className="flex space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                            <Bot className="w-5 h-5 text-white" />
                          </div>
                          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl">
                            <div className="flex space-x-1">
                              <motion.div
                                className="w-2 h-2 bg-gray-400 rounded-full"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                              />
                              <motion.div
                                className="w-2 h-2 bg-gray-400 rounded-full"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                              />
                              <motion.div
                                className="w-2 h-2 bg-gray-400 rounded-full"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Input */}
                    <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                      <div className="flex space-x-3">
                        <input
                          type="text"
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder="Ask me about your trip plans..."
                          className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                        <button
                          onClick={handleSendMessage}
                          disabled={!inputMessage.trim()}
                          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                        >
                          <Send className="w-4 h-4" />
                          <span>Send</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'preferences' && (
                  <div className="p-6 overflow-y-auto">
                    <div className="space-y-8">
                      {/* Basic Preferences */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Destination
                          </label>
                          <input
                            type="text"
                            value={preferences.destination}
                            onChange={(e) => setPreferences(prev => ({ ...prev, destination: e.target.value }))}
                            placeholder="e.g., Tokyo, Japan"
                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Budget (MYR)
                          </label>
                          <input
                            type="number"
                            value={preferences.budget}
                            onChange={(e) => setPreferences(prev => ({ ...prev, budget: Number(e.target.value) }))}
                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Duration (days)
                          </label>
                          <input
                            type="number"
                            value={preferences.duration}
                            onChange={(e) => setPreferences(prev => ({ ...prev, duration: Number(e.target.value) }))}
                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Travelers
                          </label>
                          <input
                            type="number"
                            value={preferences.travelers}
                            onChange={(e) => setPreferences(prev => ({ ...prev, travelers: Number(e.target.value) }))}
                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800"
                          />
                        </div>
                      </div>

                      {/* Travel Style */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                          Travel Style
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {travelStyles.map((style) => (
                            <button
                              key={style.id}
                              onClick={() => setPreferences(prev => ({ ...prev, travelStyle: style.id as any }))}
                              className={`p-4 border rounded-xl text-left transition-all ${
                                preferences.travelStyle === style.id
                                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                              }`}
                            >
                              <h4 className="font-medium text-gray-900 dark:text-white mb-1">{style.name}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300">{style.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Interests */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                          Interests & Preferences
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {interests.map((interest) => (
                            <button
                              key={interest}
                              onClick={() => handleInterestToggle(interest)}
                              className={`p-3 border rounded-xl text-sm transition-all ${
                                preferences.interests.includes(interest)
                                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {interest}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'recommendations' && (
                  <div className="p-6 overflow-y-auto">
                    {recommendations.length === 0 ? (
                      <div className="text-center py-8">
                        <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          No Insights Yet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          Chat with the AI to get personalized recommendations and insights!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {recommendations.map((rec) => (
                          <motion.div
                            key={rec.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-white dark:bg-gray-800"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                                  <Lightbulb className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <h3 className="font-medium text-gray-900 dark:text-white">{rec.title}</h3>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                      rec.type === 'optimization' ? 'bg-green-100 text-green-700' :
                                      rec.type === 'seasonal' ? 'bg-blue-100 text-blue-700' :
                                      rec.type === 'alternative' ? 'bg-purple-100 text-purple-700' :
                                      'bg-gray-100 text-gray-700'
                                    }`}>
                                      {rec.type}
                                    </span>
                                    <div className="flex items-center space-x-1">
                                      <Star className="w-3 h-3 text-yellow-500" />
                                      <span className="text-xs text-gray-600">{rec.confidence}%</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {rec.savings && (
                                <div className="text-right">
                                  <div className="text-lg font-bold text-green-600">MYR {rec.savings}</div>
                                  <div className="text-xs text-gray-600">potential savings</div>
                                </div>
                              )}
                            </div>
                            
                            <p className="text-gray-600 dark:text-gray-300 mb-4">{rec.description}</p>
                            
                            <div className="space-y-2">
                              {rec.reasoning.map((reason, idx) => (
                                <div key={idx} className="flex items-start space-x-2 text-sm">
                                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span className="text-gray-600 dark:text-gray-300">{reason}</span>
                                </div>
                              ))}
                            </div>

                            {rec.alternatives && (
                              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Alternatives:</h4>
                                <div className="flex flex-wrap gap-2">
                                  {rec.alternatives.map((alt, idx) => (
                                    <span
                                      key={idx}
                                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 rounded-full"
                                    >
                                      {alt}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}