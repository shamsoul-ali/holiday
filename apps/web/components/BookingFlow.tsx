'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Check,
  AlertCircle,
  Plane,
  MapPin,
  Users,
  Clock,
  Sparkles,
  Zap
} from 'lucide-react'
import { useAuth } from './providers/AuthProvider'
import { bookingService, type BookingRequest, type PassengerDetails, type ContactDetails } from '../lib/booking-service'
import BNPLCheckout from './bnpl/BNPLCheckout'
import toast from 'react-hot-toast'

interface BookingFlowProps {
  itinerary: any
  isOpen: boolean
  onClose: () => void
  onSuccess?: (bookingId: string) => void
}

type BookingStep = 'passenger-details' | 'contact-info' | 'payment-method' | 'payment' | 'bnpl-checkout' | 'confirmation'

export default function BookingFlow({ itinerary, isOpen, onClose, onSuccess }: BookingFlowProps) {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState<BookingStep>('passenger-details')
  const [loading, setLoading] = useState(false)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'full' | 'bnpl' | null>(null)

  // Form states
  const [passengers, setPassengers] = useState<PassengerDetails[]>([])
  const [contactDetails, setContactDetails] = useState<ContactDetails>({
    email: user?.email || '',
    phone: ''
  })
  const [paymentIntent, setPaymentIntent] = useState<any>(null)

  // Initialize passenger forms based on traveler count
  useEffect(() => {
    if (itinerary && isOpen) {
      const travelerCount = typeof itinerary.travelers === 'number' 
        ? itinerary.travelers 
        : itinerary.travelers?.total || 1

      const initialPassengers: PassengerDetails[] = Array.from({ length: travelerCount }, (_, index) => ({
        title: 'Mr',
        first_name: '',
        last_name: '',
        date_of_birth: '',
        nationality: 'Malaysia',
        email: index === 0 ? user?.email || '' : '',
        phone: index === 0 ? contactDetails.phone : ''
      }))

      setPassengers(initialPassengers)
    }
  }, [itinerary, isOpen, user])

  const steps = [
    { id: 'passenger-details', title: 'Passenger Details', icon: User },
    { id: 'contact-info', title: 'Contact Information', icon: Mail },
    { id: 'payment', title: 'Payment', icon: CreditCard },
    { id: 'confirmation', title: 'Confirmation', icon: Check }
  ]

  const currentStepIndex = steps.findIndex(step => step.id === currentStep)

  const handleNextStep = async () => {
    if (currentStep === 'passenger-details') {
      if (!validatePassengerDetails()) return
      setCurrentStep('contact-info')
    } else if (currentStep === 'contact-info') {
      if (!validateContactDetails()) return
      setCurrentStep('payment-method')
    } else if (currentStep === 'payment-method') {
      if (!paymentMethod) {
        toast.error('Please select a payment method')
        return
      }
      if (paymentMethod === 'bnpl') {
        setCurrentStep('bnpl-checkout')
      } else {
        await createBooking()
      }
    } else if (currentStep === 'payment') {
      await processPayment()
    }
  }

  const validatePassengerDetails = (): boolean => {
    for (const passenger of passengers) {
      if (!passenger.first_name || !passenger.last_name || !passenger.date_of_birth) {
        toast.error('Please fill in all required passenger details')
        return false
      }
    }
    return true
  }

  const validateContactDetails = (): boolean => {
    if (!contactDetails.email || !contactDetails.phone) {
      toast.error('Please provide contact email and phone number')
      return false
    }
    return true
  }

  const createBooking = async () => {
    if (!user || !itinerary) return

    setLoading(true)
    try {
      const bookingData = bookingService.formatBookingData(itinerary)
      
      const bookingRequest: BookingRequest = {
        itinerary_id: itinerary.id,
        booking_data: bookingData,
        passenger_details: passengers,
        contact_details: contactDetails,
        total_amount: itinerary.price.total,
        currency: itinerary.price.currency || 'MYR'
      }

      const result = await bookingService.createBooking(bookingRequest)

      if (result.success && result.data) {
        setBookingId(result.data.id)
        
        // Create payment intent
        const paymentResult = await bookingService.createPaymentIntent(
          result.data.id,
          itinerary.price.total
        )

        if (paymentResult.success) {
          setPaymentIntent(paymentResult.data)
          setCurrentStep('payment')
        } else {
          toast.error('Failed to initialize payment')
        }
      } else {
        toast.error(result.error || 'Failed to create booking')
      }
    } catch (error) {
      console.error('Booking creation error:', error)
      toast.error('An error occurred while creating your booking')
    } finally {
      setLoading(false)
    }
  }

  const processPayment = async () => {
    if (!bookingId || !paymentIntent) return

    setLoading(true)
    try {
      // In a real implementation, you would integrate with Stripe here
      // For now, we'll simulate a successful payment
      await new Promise(resolve => setTimeout(resolve, 2000))

      const result = await bookingService.confirmPayment(bookingId, paymentIntent.payment_intent_id)

      if (result.success) {
        setCurrentStep('confirmation')
        toast.success('Payment successful! Your trip is booked!')
        onSuccess?.(bookingId)
      } else {
        toast.error(result.error || 'Payment failed')
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast.error('Payment processing failed')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-[#0f0f0f] border border-white/10 rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Book Your Trip</h2>
            <p className="text-white/60">{itinerary.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => {
              const StepIcon = step.icon
              const isActive = index === currentStepIndex
              const isCompleted = index < currentStepIndex

              return (
                <div key={step.id} className="flex items-center">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors
                    ${isActive ? 'border-blue-500 bg-blue-500 text-white' : 
                      isCompleted ? 'border-green-500 bg-green-500 text-white' : 
                      'border-white/20 text-white/40'}
                  `}>
                    <StepIcon size={20} />
                  </div>
                  <span className={`ml-3 text-sm ${isActive ? 'text-white' : isCompleted ? 'text-green-400' : 'text-white/40'}`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`ml-6 w-16 h-px ${isCompleted ? 'bg-green-500' : 'bg-white/20'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Trip Summary */}
        <div className="bg-white/5 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Trip Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-blue-400" />
              <div>
                <div className="text-white font-medium">{itinerary.destination}</div>
                <div className="text-white/60 text-sm">{itinerary.duration}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-purple-400" />
              <div>
                <div className="text-white font-medium">
                  {typeof itinerary.travelers === 'number' ? itinerary.travelers : itinerary.travelers?.total || 1} Travelers
                </div>
                <div className="text-white/60 text-sm">
                  {itinerary.dates?.start && `${itinerary.dates.start} - ${itinerary.dates.end}`}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-green-400" />
              <div>
                <div className="text-white font-medium">RM {itinerary.price.total.toLocaleString()}</div>
                <div className="text-white/60 text-sm">Total Amount</div>
              </div>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {currentStep === 'passenger-details' && (
            <PassengerDetailsStep 
              passengers={passengers}
              setPassengers={setPassengers}
              onNext={handleNextStep}
              loading={loading}
            />
          )}
          
          {currentStep === 'contact-info' && (
            <ContactInfoStep
              contactDetails={contactDetails}
              setContactDetails={setContactDetails}
              onNext={handleNextStep}
              onBack={() => setCurrentStep('passenger-details')}
              loading={loading}
            />
          )}

          {currentStep === 'payment-method' && (
            <PaymentMethodStep
              tripAmount={itinerary.price.total}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              onNext={handleNextStep}
              onBack={() => setCurrentStep('contact-info')}
            />
          )}

          {currentStep === 'payment' && (
            <PaymentStep
              paymentIntent={paymentIntent}
              totalAmount={itinerary.price.total}
              currency={itinerary.price.currency || 'MYR'}
              onNext={handleNextStep}
              onBack={() => setCurrentStep('payment-method')}
              loading={loading}
            />
          )}

          {currentStep === 'bnpl-checkout' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <BNPLCheckout
                tripAmount={itinerary.price.total}
                tripName={itinerary.title || itinerary.destination}
                onSuccess={(planId) => {
                  setBookingId(planId)
                  setCurrentStep('confirmation')
                }}
                onCancel={() => setCurrentStep('payment-method')}
              />
            </motion.div>
          )}

          {currentStep === 'confirmation' && (
            <ConfirmationStep
              bookingId={bookingId}
              itinerary={itinerary}
              onClose={onClose}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

// Passenger Details Step Component
function PassengerDetailsStep({ 
  passengers, 
  setPassengers, 
  onNext, 
  loading 
}: {
  passengers: PassengerDetails[]
  setPassengers: (passengers: PassengerDetails[]) => void
  onNext: () => void
  loading: boolean
}) {
  const updatePassenger = (index: number, field: keyof PassengerDetails, value: string) => {
    const updated = [...passengers]
    updated[index] = { ...updated[index], [field]: value }
    setPassengers(updated)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <h3 className="text-xl font-semibold text-white mb-6">Passenger Details</h3>
      
      {passengers.map((passenger, index) => (
        <div key={index} className="bg-white/5 rounded-2xl p-6">
          <h4 className="text-lg font-medium text-white mb-4">
            Passenger {index + 1} {index === 0 && '(Lead Passenger)'}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 text-sm mb-2">Title *</label>
              <select
                value={passenger.title}
                onChange={(e) => updatePassenger(index, 'title', e.target.value)}
                className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Mr">Mr</option>
                <option value="Ms">Ms</option>
                <option value="Mrs">Mrs</option>
                <option value="Dr">Dr</option>
              </select>
            </div>
            
            <div>
              <label className="block text-white/60 text-sm mb-2">Nationality *</label>
              <select
                value={passenger.nationality}
                onChange={(e) => updatePassenger(index, 'nationality', e.target.value)}
                className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Malaysia">Malaysia</option>
                <option value="Singapore">Singapore</option>
                <option value="Indonesia">Indonesia</option>
                <option value="Thailand">Thailand</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-white/60 text-sm mb-2">First Name *</label>
              <input
                type="text"
                value={passenger.first_name}
                onChange={(e) => updatePassenger(index, 'first_name', e.target.value)}
                className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter first name"
              />
            </div>
            
            <div>
              <label className="block text-white/60 text-sm mb-2">Last Name *</label>
              <input
                type="text"
                value={passenger.last_name}
                onChange={(e) => updatePassenger(index, 'last_name', e.target.value)}
                className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter last name"
              />
            </div>
            
            <div>
              <label className="block text-white/60 text-sm mb-2">Date of Birth *</label>
              <input
                type="date"
                value={passenger.date_of_birth}
                onChange={(e) => updatePassenger(index, 'date_of_birth', e.target.value)}
                className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {index === 0 && (
              <div>
                <label className="block text-white/60 text-sm mb-2">Email</label>
                <input
                  type="email"
                  value={passenger.email || ''}
                  onChange={(e) => updatePassenger(index, 'email', e.target.value)}
                  className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address"
                />
              </div>
            )}
          </div>
        </div>
      ))}

      <div className="flex justify-end pt-6">
        <button
          onClick={onNext}
          disabled={loading}
          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl font-semibold text-white hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none"
        >
          {loading ? 'Processing...' : 'Continue'}
        </button>
      </div>
    </motion.div>
  )
}

// Contact Info Step Component
function ContactInfoStep({
  contactDetails,
  setContactDetails,
  onNext,
  onBack,
  loading
}: {
  contactDetails: ContactDetails
  setContactDetails: (details: ContactDetails) => void
  onNext: () => void
  onBack: () => void
  loading: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <h3 className="text-xl font-semibold text-white mb-6">Contact Information</h3>
      
      <div className="bg-white/5 rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/60 text-sm mb-2">Email Address *</label>
            <input
              type="email"
              value={contactDetails.email}
              onChange={(e) => setContactDetails({ ...contactDetails, email: e.target.value })}
              className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter email address"
            />
          </div>
          
          <div>
            <label className="block text-white/60 text-sm mb-2">Phone Number *</label>
            <input
              type="tel"
              value={contactDetails.phone}
              onChange={(e) => setContactDetails({ ...contactDetails, phone: e.target.value })}
              className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter phone number"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <button
          onClick={onBack}
          className="px-8 py-3 border border-white/20 rounded-2xl font-semibold text-white hover:bg-white/10 transition-all duration-300"
        >
          Back
        </button>
        
        <button
          onClick={onNext}
          disabled={loading}
          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl font-semibold text-white hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none"
        >
          {loading ? 'Creating Booking...' : 'Proceed to Payment'}
        </button>
      </div>
    </motion.div>
  )
}

// Payment Step Component
function PaymentStep({
  paymentIntent,
  totalAmount,
  currency,
  onNext,
  onBack,
  loading
}: {
  paymentIntent: any
  totalAmount: number
  currency: string
  onNext: () => void
  onBack: () => void
  loading: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <h3 className="text-xl font-semibold text-white mb-6">Payment</h3>
      
      <div className="bg-white/5 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <span className="text-white text-lg">Total Amount:</span>
          <span className="text-2xl font-bold text-green-400">
            {currency.toUpperCase()} {totalAmount.toLocaleString()}
          </span>
        </div>
        
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 mt-1" />
            <div>
              <h4 className="text-blue-400 font-medium mb-1">Demo Payment</h4>
              <p className="text-white/60 text-sm">
                This is a demo booking system. In production, this would integrate with Stripe for secure payment processing.
              </p>
            </div>
          </div>
        </div>

        {paymentIntent && (
          <div className="space-y-4">
            <div className="text-white/60 text-sm">
              Payment Intent ID: {paymentIntent.payment_intent_id}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-6">
        <button
          onClick={onBack}
          className="px-8 py-3 border border-white/20 rounded-2xl font-semibold text-white hover:bg-white/10 transition-all duration-300"
        >
          Back
        </button>
        
        <button
          onClick={onNext}
          disabled={loading}
          className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl font-semibold text-white hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none"
        >
          {loading ? 'Processing Payment...' : 'Complete Payment'}
        </button>
      </div>
    </motion.div>
  )
}

// Confirmation Step Component
function ConfirmationStep({
  bookingId,
  itinerary,
  onClose
}: {
  bookingId: string | null
  itinerary: any
  onClose: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
    >
      <div className="w-20 h-20 mx-auto bg-green-500 rounded-full flex items-center justify-center">
        <Check size={40} className="text-white" />
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-white mb-2">Booking Confirmed!</h3>
        <p className="text-white/60 mb-4">
          Your trip to {itinerary.destination} has been successfully booked.
        </p>
        {bookingId && (
          <p className="text-sm text-white/40">
            Booking Reference: {bookingId}
          </p>
        )}
      </div>

      <div className="bg-white/5 rounded-2xl p-6">
        <h4 className="text-lg font-semibold text-white mb-4">What's Next?</h4>
        <div className="space-y-3 text-left">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-blue-400" />
            <span className="text-white/80">Confirmation email sent to your inbox</span>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-purple-400" />
            <span className="text-white/80">Add trip dates to your calendar</span>
          </div>
          <div className="flex items-center gap-3">
            <Plane className="w-5 h-5 text-green-400" />
            <span className="text-white/80">Check-in opens 24 hours before departure</span>
          </div>
        </div>
      </div>

      <button
        onClick={onClose}
        className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl font-semibold text-white hover:scale-105 transition-all duration-300"
      >
        Close
      </button>
    </motion.div>
  )
}

// Payment Method Selection Step
function PaymentMethodStep({
  tripAmount,
  paymentMethod,
  setPaymentMethod,
  onNext,
  onBack
}: {
  tripAmount: number
  paymentMethod: 'full' | 'bnpl' | null
  setPaymentMethod: (method: 'full' | 'bnpl') => void
  onNext: () => void
  onBack: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <h3 className="text-xl font-semibold text-white mb-6">Choose Payment Method</h3>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Pay Now */}
        <button
          onClick={() => setPaymentMethod('full')}
          className={`group relative p-8 rounded-3xl border-2 transition-all text-left ${
            paymentMethod === 'full'
              ? 'border-blue-500 bg-blue-500/20'
              : 'border-white/10 bg-white/5 hover:border-white/20'
          }`}
        >
          <div className="flex items-start justify-between mb-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center">
              <CreditCard className="w-7 h-7 text-blue-400" />
            </div>
            {paymentMethod === 'full' && (
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
            )}
          </div>

          <h4 className="text-2xl font-bold text-white mb-2">Pay Now</h4>
          <p className="text-white/60 text-sm mb-6">
            Pay the full amount upfront and get instant confirmation
          </p>

          <div className="text-3xl font-bold text-white mb-4">
            RM {tripAmount.toLocaleString()}
          </div>

          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2 text-green-400">
              <Check className="w-4 h-4" />
              <span>No interest charges</span>
            </li>
            <li className="flex items-center gap-2 text-green-400">
              <Check className="w-4 h-4" />
              <span>Immediate booking confirmation</span>
            </li>
            <li className="flex items-center gap-2 text-green-400">
              <Check className="w-4 h-4" />
              <span>No monthly commitments</span>
            </li>
          </ul>
        </button>

        {/* BNPL */}
        <button
          onClick={() => setPaymentMethod('bnpl')}
          className={`group relative p-8 rounded-3xl border-2 transition-all text-left overflow-hidden ${
            paymentMethod === 'bnpl'
              ? 'border-purple-500 bg-gradient-to-br from-purple-500/20 to-blue-500/20'
              : 'border-white/10 bg-white/5 hover:border-white/20'
          }`}
        >
          {/* Popular Badge */}
          <div className="absolute -top-1 -right-1 px-4 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-bl-2xl rounded-tr-2xl">
            <span className="text-white text-xs font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              POPULAR
            </span>
          </div>

          <div className="flex items-start justify-between mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
              <Zap className="w-7 h-7 text-purple-400" />
            </div>
            {paymentMethod === 'bnpl' && (
              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
            )}
          </div>

          <h4 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            Holiday Now Pay Later
          </h4>
          <p className="text-white/60 text-sm mb-6">
            Split your payment into easy monthly installments with RHB Bank
          </p>

          <div className="text-3xl font-bold text-purple-400 mb-1">
            from RM {(tripAmount / 12).toLocaleString()}
            <span className="text-lg text-white/60">/month</span>
          </div>
          <div className="text-white/40 text-xs mb-4">for 12 months</div>

          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2 text-purple-400">
              <Check className="w-4 h-4" />
              <span>0% interest on 3-month plan</span>
            </li>
            <li className="flex items-center gap-2 text-purple-400">
              <Check className="w-4 h-4" />
              <span>Flexible payment terms (3/6/12/24 months)</span>
            </li>
            <li className="flex items-center gap-2 text-purple-400">
              <Check className="w-4 h-4" />
              <span>Instant approval with RHB</span>
            </li>
            <li className="flex items-center gap-2 text-purple-400">
              <Check className="w-4 h-4" />
              <span>Travel now, pay gradually</span>
            </li>
          </ul>
        </button>
      </div>

      <div className="flex justify-between pt-6">
        <button
          onClick={onBack}
          className="px-8 py-3 border border-white/20 rounded-2xl font-semibold text-white hover:bg-white/10 transition-all duration-300"
        >
          Back
        </button>

        <button
          onClick={onNext}
          disabled={!paymentMethod}
          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl font-semibold text-white hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </motion.div>
  )
}