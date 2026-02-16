'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Plane,
  MapPin,
  DollarSign,
  Calendar,
  Minimize2,
  Maximize2,
  Trash2,
  RotateCcw
} from 'lucide-react'
import toast from 'react-hot-toast'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  type?: 'text' | 'suggestion' | 'itinerary' | 'booking_help'
}

interface TravelContext {
  current_trip?: {
    destination?: string
    departure_date?: string
    return_date?: string
    travelers?: number
    budget?: number
    interests?: string[]
  }
  preferences?: {
    accommodation_type?: string
    travel_style?: string
    dietary_requirements?: string[]
    budget_range?: string
  }
}

interface TravelAssistantChatProps {
  isOpen: boolean
  onClose: () => void
  initialContext?: TravelContext
  className?: string
}

export default function TravelAssistantChat({ 
  isOpen, 
  onClose, 
  initialContext,
  className = "" 
}: TravelAssistantChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [isMinimized, setIsMinimized] = useState(false)
  const [context, setContext] = useState<TravelContext>(initialContext || {})
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, isMinimized])

  // Initialize conversation with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      sendWelcomeMessage()
    }
  }, [isOpen])

  const sendWelcomeMessage = () => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome-' + Date.now(),
      role: 'assistant',
      content: `Hello! 👋 I'm your personal Holiday AI travel assistant, here to help make your trip planning effortless and amazing!

**🌟 How I Can Help You:**
• **Flight strategies** - Best booking times and price predictions
• **Accommodation advice** - Perfect stays within your budget  
• **Destination insights** - Hidden gems and must-see attractions
• **Cultural guidance** - Local customs and etiquette
• **Budget optimization** - Stretch your ringgit further
• **Safety tips** - Stay secure and confident while traveling

**💬 Try asking me:**
• "What's the best time to book flights to Tokyo?"
• "Help me plan a budget for a 7-day Thailand trip"  
• "What should I pack for Bali in December?"
• "Where should I stay in Singapore?"

What would you like to know about your upcoming trip? ✈️`,
      timestamp: new Date().toISOString(),
      type: 'text'
    }
    setMessages([welcomeMessage])
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || loading) return

    const userMessage: ChatMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString(),
      type: 'text'
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setLoading(true)

    try {
      const response = await fetch('/api/travel-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'current-user' // Mock user ID
        },
        body: JSON.stringify({
          message: inputMessage.trim(),
          context,
          conversation_id: conversationId
        })
      })

      const result = await response.json()

      if (result.success) {
        setMessages(prev => [...prev, result.data.message])
        if (!conversationId) {
          setConversationId(result.data.conversation_id)
        }
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      console.error('Chat error:', error)
      toast.error('Failed to send message. Please try again.')
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: 'error-' + Date.now(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment, or rephrase your question.",
        timestamp: new Date().toISOString(),
        type: 'text'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearConversation = () => {
    setMessages([])
    setConversationId(null)
    sendWelcomeMessage()
    toast.success('Conversation cleared')
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: true,
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const quickSuggestions = [
    { text: "Help me plan a budget for my trip", icon: DollarSign },
    { text: "When should I book flights for best prices?", icon: Plane },
    { text: "Recommend destinations within my budget", icon: MapPin },
    { text: "What's the best time to visit my destination?", icon: Calendar }
  ]

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        className={`fixed bottom-6 right-6 z-50 ${isMinimized ? 'w-80' : 'w-96'} ${className}`}
        style={{ maxHeight: isMinimized ? 'auto' : 'calc(100vh - 100px)' }}
      >
        <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Holiday AI Assistant</h3>
                <p className="text-xs text-gray-300 flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Online • 24/7 Support</span>
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                title={isMinimized ? 'Maximize' : 'Minimize'}
              >
                {isMinimized ? (
                  <Maximize2 className="w-4 h-4 text-gray-400" />
                ) : (
                  <Minimize2 className="w-4 h-4 text-gray-400" />
                )}
              </button>
              <button
                onClick={clearConversation}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                title="Clear conversation"
              >
                <RotateCcw className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                title="Close chat"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="h-96 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                      <div
                        className={`px-4 py-3 rounded-2xl ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white ml-4'
                            : 'bg-gray-800/50 text-gray-200 mr-4'
                        }`}
                      >
                        <div className="text-sm whitespace-pre-wrap leading-relaxed">
                          {message.content}
                        </div>
                      </div>
                      <div className={`flex items-center mt-1 text-xs text-gray-400 ${
                        message.role === 'user' ? 'justify-end mr-4' : 'justify-start ml-4'
                      }`}>
                        {message.role === 'assistant' ? (
                          <Bot className="w-3 h-3 mr-1" />
                        ) : (
                          <User className="w-3 h-3 mr-1" />
                        )}
                        <span>{formatTimestamp(message.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {loading && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%]">
                      <div className="bg-gray-800/50 text-gray-200 px-4 py-3 rounded-2xl mr-4">
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">Assistant is thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Suggestions */}
              {messages.length <= 1 && !loading && (
                <div className="px-4 pb-4">
                  <div className="grid grid-cols-1 gap-2">
                    {quickSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setInputMessage(suggestion.text)
                          setTimeout(sendMessage, 100)
                        }}
                        className="flex items-center space-x-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-left text-sm text-gray-300 hover:text-white"
                      >
                        <suggestion.icon className="w-4 h-4 text-blue-400 flex-shrink-0" />
                        <span>{suggestion.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-4 border-t border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything about travel planning..."
                      disabled={loading}
                      className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all disabled:opacity-50"
                    />
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || loading}
                    className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    ) : (
                      <Send className="w-5 h-5 text-white" />
                    )}
                  </button>
                </div>
                
                <p className="text-xs text-gray-500 mt-2 text-center">
                  AI assistant available 24/7 • Press Enter to send
                </p>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}