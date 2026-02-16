'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Bot, X, Sparkles } from 'lucide-react'
import TravelAssistantChat from './TravelAssistantChat'

interface TravelAssistantButtonProps {
  className?: string
  initialContext?: {
    current_trip?: {
      destination?: string
      departure_date?: string
      return_date?: string
      travelers?: number
      budget?: number
      interests?: string[]
    }
  }
}

export default function TravelAssistantButton({ 
  className = "",
  initialContext
}: TravelAssistantButtonProps) {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <>
      {/* Floating Chat Button */}
      <motion.div
        className={`fixed bottom-6 left-6 z-40 ${className}`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, duration: 0.5, type: "spring" }}
      >
        <motion.button
          onClick={() => setIsChatOpen(true)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 flex items-center justify-center group"
        >
          {/* Animated gradient ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse opacity-75"></div>
          
          {/* Button content */}
          <div className="relative z-10 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {isHovered ? (
                <motion.div
                  key="bot"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ duration: 0.2 }}
                >
                  <Bot className="w-7 h-7 text-white" />
                </motion.div>
              ) : (
                <motion.div
                  key="message"
                  initial={{ scale: 0, rotate: 180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: -180 }}
                  transition={{ duration: 0.2 }}
                >
                  <MessageCircle className="w-7 h-7 text-white" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Notification dot for new features */}
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-yellow-800" />
          </div>
        </motion.button>

        {/* Tooltip */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, x: -10, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -10, scale: 0.8 }}
              className="absolute right-20 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-4 py-2 rounded-xl shadow-lg text-sm font-medium whitespace-nowrap border border-white/10"
            >
              <div className="relative">
                Ask AI Travel Assistant
                {/* Arrow pointing to button */}
                <div className="absolute right-0 top-1/2 transform translate-x-2 -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-900 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ripple effect */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-blue-400/30"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      {/* Travel Assistant Chat */}
      <TravelAssistantChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        initialContext={initialContext}
      />
    </>
  )
}