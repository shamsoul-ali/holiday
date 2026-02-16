'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle,
  X,
  Plane,
  Hotel,
  Utensils,
  Car,
  Camera,
  Shield,
  Wifi,
  MapPin,
  Clock,
  CreditCard,
  AlertTriangle,
  FileText,
  Info,
  ChevronDown,
  ChevronUp,
  Globe,
  BadgeCheck,
  Phone
} from 'lucide-react'

interface InclusionItem {
  icon: JSX.Element;
  title: string;
  description: string;
  included: boolean;
  details?: string[];
  importance?: 'high' | 'medium' | 'low';
}

interface TravelTerms {
  category: string;
  terms: {
    title: string;
    content: string;
    important?: boolean;
  }[];
}

interface PackageInclusionsSectionProps {
  destination: string;
  duration: string;
  travelers: {
    adults: number;
    children: number;
    infants: number;
  };
  packageType?: string;
}

export default function PackageInclusionsSection({ 
  destination, 
  duration, 
  travelers,
  packageType = 'Ultimate' 
}: PackageInclusionsSectionProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('inclusions')
  const [showAllInclusions, setShowAllInclusions] = useState(false)
  const [showAllExclusions, setShowAllExclusions] = useState(false)

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const inclusions: InclusionItem[] = [
    {
      icon: <Plane className="w-5 h-5" />,
      title: "Round-trip Flights",
      description: "Economy class flights with reputable airlines",
      included: true,
      details: [
        "Direct or connecting flights as per availability",
        "Standard baggage allowance (23kg checked, 7kg carry-on)",
        "Seat selection (standard seats included)",
        "In-flight meals and entertainment"
      ],
      importance: 'high'
    },
    {
      icon: <Hotel className="w-5 h-5" />,
      title: "Accommodation",
      description: `${packageType} hotels for ${duration}`,
      included: true,
      details: [
        `${packageType === 'Luxury' ? '4-5 star' : packageType === 'Ultimate' ? '3-4 star' : '2-3 star'} rated hotels`,
        "Daily housekeeping service",
        "Standard room amenities (AC, TV, WiFi)",
        "Hotel taxes and service charges"
      ],
      importance: 'high'
    },
    {
      icon: <Utensils className="w-5 h-5" />,
      title: "Meals",
      description: "Daily breakfast included",
      included: true,
      details: [
        "Continental or buffet breakfast at hotels",
        "Welcome dinner on arrival day",
        "Vegetarian and dietary options available",
        "Local cuisine experiences"
      ],
      importance: 'medium'
    },
    {
      icon: <Car className="w-5 h-5" />,
      title: "Transportation",
      description: "Airport transfers and local transport",
      included: true,
      details: [
        "Airport pickup and drop-off",
        "Air-conditioned vehicles for sightseeing",
        "Professional English-speaking drivers",
        "Fuel and driver allowances"
      ],
      importance: 'high'
    },
    {
      icon: <Camera className="w-5 h-5" />,
      title: "Guided Tours",
      description: "Professional local guides and city tours",
      included: true,
      details: [
        "English-speaking professional guides",
        "Entry tickets to major attractions",
        "Cultural and historical insights",
        "Small group experiences"
      ],
      importance: 'medium'
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Travel Insurance",
      description: "Basic travel insurance coverage",
      included: packageType !== 'Budget-Friendly',
      details: [
        "Medical emergency coverage up to $50,000",
        "Trip cancellation protection",
        "Baggage loss/delay coverage",
        "24/7 emergency assistance"
      ],
      importance: 'high'
    },
    {
      icon: <Wifi className="w-5 h-5" />,
      title: "Personal Expenses",
      description: "Shopping, souvenirs, and personal items",
      included: false,
      details: [
        "Personal shopping and souvenirs",
        "Extra meals and beverages",
        "Spa treatments and wellness services",
        "Personal phone calls and internet"
      ],
      importance: 'low'
    },
    {
      icon: <Utensils className="w-5 h-5" />,
      title: "Additional Meals",
      description: "Lunch and dinner (unless specified)",
      included: false,
      details: [
        "Lunch and dinner meals",
        "Alcoholic beverages",
        "Room service charges",
        "Special dietary requests"
      ],
      importance: 'medium'
    },
    {
      icon: <Camera className="w-5 h-5" />,
      title: "Optional Activities",
      description: "Additional tours and experiences",
      included: false,
      details: [
        "Optional excursions and activities",
        "Adventure sports and experiences",
        "Cultural shows and performances",
        "Photography services"
      ],
      importance: 'low'
    },
    {
      icon: <BadgeCheck className="w-5 h-5" />,
      title: "Visa & Documentation",
      description: "Visa fees and document processing",
      included: false,
      details: [
        "Visa application fees",
        "Document processing charges",
        "Travel document courier fees",
        "Passport renewal costs"
      ],
      importance: 'high'
    }
  ]

  const travelTerms: TravelTerms[] = [
    {
      category: "Booking & Payment",
      terms: [
        {
          title: "Booking Confirmation",
          content: "Your booking is confirmed upon receipt of full payment and all required documentation.",
          important: true
        },
        {
          title: "Payment Terms",
          content: "Full payment is required at the time of booking. We accept all major credit cards and bank transfers."
        },
        {
          title: "Price Guarantee",
          content: "Prices are guaranteed once full payment is received and booking is confirmed."
        }
      ]
    },
    {
      category: "Cancellation & Changes",
      terms: [
        {
          title: "Free Cancellation",
          content: "Cancel up to 24 hours before departure for a full refund (minus processing fees).",
          important: true
        },
        {
          title: "Date Changes",
          content: "Date changes are subject to availability and may incur additional charges based on price differences."
        },
        {
          title: "Name Changes",
          content: "Name changes must match passport exactly. Changes may incur airline and administrative fees."
        }
      ]
    },
    {
      category: "Travel Requirements",
      terms: [
        {
          title: "Valid Passport",
          content: "Passport must be valid for at least 6 months from travel date with blank pages for stamps.",
          important: true
        },
        {
          title: "Visa Requirements",
          content: `Check visa requirements for ${destination.split(',')[1] || destination}. We can assist with visa applications.`
        },
        {
          title: "Health Requirements",
          content: "Check with your doctor for any required vaccinations or health precautions for your destination."
        }
      ]
    },
    {
      category: "During Your Trip",
      terms: [
        {
          title: "Local Guides",
          content: "Professional English-speaking guides will accompany you throughout your journey."
        },
        {
          title: "Emergency Support",
          content: "24/7 emergency support is available during your trip for any assistance needed."
        },
        {
          title: "Itinerary Changes",
          content: "Minor itinerary changes may occur due to local conditions, weather, or unforeseen circumstances."
        }
      ]
    }
  ]

  const importantInfo = [
    {
      icon: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
      title: "Travel Advisory",
      content: `Check current travel advisories for ${destination} before departure.`,
      type: 'warning'
    },
    {
      icon: <Clock className="w-5 h-5 text-blue-400" />,
      title: "Check-in Times",
      content: "International flights require check-in 3 hours before departure.",
      type: 'info'
    },
    {
      icon: <Phone className="w-5 h-5 text-green-400" />,
      title: "Emergency Contact",
      content: "24/7 emergency hotline: +60-3-2161-2233",
      type: 'success'
    }
  ]

  const includedItems = inclusions.filter(item => item.included)
  const excludedItems = inclusions.filter(item => !item.included)

  return (
    <div className="space-y-6">
      {/* Package Inclusions */}
      <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
        <button
          onClick={() => toggleSection('inclusions')}
          className="w-full p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 hover:from-green-500/20 hover:to-emerald-500/20 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <div className="text-left">
                <h3 className="text-xl font-bold text-white">What's Included</h3>
                <p className="text-green-300 text-sm">{includedItems.length} items included in your package</p>
              </div>
            </div>
            {expandedSection === 'inclusions' ? 
              <ChevronUp className="w-6 h-6 text-gray-400" /> : 
              <ChevronDown className="w-6 h-6 text-gray-400" />
            }
          </div>
        </button>

        <AnimatePresence>
          {expandedSection === 'inclusions' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="p-6 bg-black/20 space-y-4">
                {includedItems.slice(0, showAllInclusions ? includedItems.length : 6).map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start space-x-4 p-4 bg-green-500/5 border border-green-500/20 rounded-lg"
                  >
                    <div className="text-green-400 mt-1">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-white font-medium">{item.title}</h4>
                        {item.importance === 'high' && (
                          <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded-full">
                            Essential
                          </span>
                        )}
                      </div>
                      <p className="text-gray-300 text-sm mb-2">{item.description}</p>
                      {item.details && (
                        <div className="space-y-1">
                          {item.details.map((detail, idx) => (
                            <div key={idx} className="flex items-center space-x-2 text-xs text-gray-400">
                              <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                              <span>{detail}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                
                {includedItems.length > 6 && (
                  <button
                    onClick={() => setShowAllInclusions(!showAllInclusions)}
                    className="w-full text-center text-green-400 hover:text-green-300 py-2 text-sm transition-colors"
                  >
                    {showAllInclusions ? 'Show Less' : `Show All ${includedItems.length} Inclusions`}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Package Exclusions */}
      <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
        <button
          onClick={() => toggleSection('exclusions')}
          className="w-full p-6 bg-gradient-to-r from-red-500/10 to-pink-500/10 hover:from-red-500/20 hover:to-pink-500/20 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <X className="w-6 h-6 text-red-400" />
              <div className="text-left">
                <h3 className="text-xl font-bold text-white">What's Not Included</h3>
                <p className="text-red-300 text-sm">{excludedItems.length} additional items you may need</p>
              </div>
            </div>
            {expandedSection === 'exclusions' ? 
              <ChevronUp className="w-6 h-6 text-gray-400" /> : 
              <ChevronDown className="w-6 h-6 text-gray-400" />
            }
          </div>
        </button>

        <AnimatePresence>
          {expandedSection === 'exclusions' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="p-6 bg-black/20 space-y-4">
                {excludedItems.slice(0, showAllExclusions ? excludedItems.length : 4).map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start space-x-4 p-4 bg-red-500/5 border border-red-500/20 rounded-lg"
                  >
                    <div className="text-red-400 mt-1">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-white font-medium">{item.title}</h4>
                        {item.importance === 'high' && (
                          <span className="px-2 py-1 bg-orange-500/20 text-orange-300 text-xs rounded-full">
                            Important
                          </span>
                        )}
                      </div>
                      <p className="text-gray-300 text-sm mb-2">{item.description}</p>
                      {item.details && (
                        <div className="space-y-1">
                          {item.details.map((detail, idx) => (
                            <div key={idx} className="flex items-center space-x-2 text-xs text-gray-400">
                              <div className="w-1 h-1 bg-red-400 rounded-full"></div>
                              <span>{detail}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                
                {excludedItems.length > 4 && (
                  <button
                    onClick={() => setShowAllExclusions(!showAllExclusions)}
                    className="w-full text-center text-red-400 hover:text-red-300 py-2 text-sm transition-colors"
                  >
                    {showAllExclusions ? 'Show Less' : `Show All ${excludedItems.length} Exclusions`}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Important Information */}
      <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Info className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-bold text-white">Important Information</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {importantInfo.map((info, index) => (
            <div key={index} className={`p-4 rounded-lg border ${
              info.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30' :
              info.type === 'success' ? 'bg-green-500/10 border-green-500/30' :
              'bg-blue-500/10 border-blue-500/30'
            }`}>
              <div className="flex items-start space-x-3">
                {info.icon}
                <div>
                  <h4 className="text-white font-medium text-sm">{info.title}</h4>
                  <p className="text-gray-300 text-xs mt-1">{info.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Terms & Conditions */}
      <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
        <button
          onClick={() => toggleSection('terms')}
          className="w-full p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-6 h-6 text-blue-400" />
              <div className="text-left">
                <h3 className="text-xl font-bold text-white">Terms & Conditions</h3>
                <p className="text-blue-300 text-sm">Important booking and travel policies</p>
              </div>
            </div>
            {expandedSection === 'terms' ? 
              <ChevronUp className="w-6 h-6 text-gray-400" /> : 
              <ChevronDown className="w-6 h-6 text-gray-400" />
            }
          </div>
        </button>

        <AnimatePresence>
          {expandedSection === 'terms' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="p-6 bg-black/20 space-y-6">
                {travelTerms.map((category, categoryIndex) => (
                  <div key={categoryIndex} className="space-y-3">
                    <h4 className="text-lg font-semibold text-white border-b border-white/20 pb-2">
                      {category.category}
                    </h4>
                    <div className="space-y-3">
                      {category.terms.map((term, termIndex) => (
                        <div key={termIndex} className={`p-3 rounded-lg ${
                          term.important ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-white/5'
                        }`}>
                          <div className="flex items-start space-x-2">
                            {term.important && <AlertTriangle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />}
                            <div>
                              <h5 className="text-white font-medium text-sm mb-1">{term.title}</h5>
                              <p className="text-gray-300 text-sm">{term.content}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Globe className="w-5 h-5 text-purple-400 mt-0.5" />
                    <div>
                      <h5 className="text-purple-300 font-medium mb-1">Need Help?</h5>
                      <p className="text-purple-200 text-sm">
                        Our travel experts are available 24/7 to assist with your booking and travel plans.
                        Contact us at support@holidayai.com or +60-3-2161-2233
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}