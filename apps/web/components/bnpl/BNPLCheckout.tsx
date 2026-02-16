'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CreditCard,
  Calendar,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Shield,
  Sparkles,
  AlertTriangle,
  Info
} from 'lucide-react'
import { generateSmartRecommendations, type PaymentPlanRecommendation } from '../../lib/bnpl/recommendation-engine'
import { createPaymentPlan } from '../../lib/bnpl/payment-plan-service'
import { performCreditCheck, performEKYC } from '../../lib/bnpl/rhb-integration'
import { type FinancialProfile } from '../../lib/bnpl/risk-calculator'
import toast from 'react-hot-toast'

interface BNPLCheckoutProps {
  tripAmount: number
  tripName: string
  onSuccess: (paymentPlanId: string) => void
  onCancel: () => void
}

type Step = 'recommendations' | 'plan-selection' | 'financial-info' | 'rhb-check' | 'confirmation'

export default function BNPLCheckout({
  tripAmount,
  tripName,
  onSuccess,
  onCancel
}: BNPLCheckoutProps) {
  const [currentStep, setCurrentStep] = useState<Step>('recommendations')
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlanRecommendation | null>(null)
  const [loading, setLoading] = useState(false)

  // Financial profile state
  const [financialProfile, setFinancialProfile] = useState<FinancialProfile>({
    monthlyIncome: 5000,
    existingMonthlyDebts: 1000,
    employmentType: 'permanent',
    employmentDuration: 24,
    age: 30,
    dependents: 0,
    hasEmergencyFund: false
  })

  // User details for RHB
  const [userDetails, setUserDetails] = useState({
    fullName: '',
    icNumber: '',
    email: '',
    phone: '',
    bankAccountNumber: '',
    bankName: 'RHB Bank'
  })

  const [rhbApplicationId, setRhbApplicationId] = useState<string>('')

  // Generate recommendations
  const recommendations = generateSmartRecommendations(tripAmount, financialProfile)

  const handlePlanSelect = (plan: PaymentPlanRecommendation) => {
    setSelectedPlan(plan)
    setCurrentStep('financial-info')
  }

  const handleFinancialInfoSubmit = () => {
    if (!financialProfile.monthlyIncome || financialProfile.monthlyIncome < 2000) {
      toast.error('Minimum monthly income of RM 2,000 is required')
      return
    }
    setCurrentStep('rhb-check')
    performRHBCreditCheck()
  }

  const performRHBCreditCheck = async () => {
    if (!selectedPlan) return

    setLoading(true)
    try {
      // Perform credit check with RHB
      const creditResult = await performCreditCheck({
        fullName: userDetails.fullName || 'Demo User',
        icNumber: userDetails.icNumber || '900101-01-1234',
        dateOfBirth: '1990-01-01',
        nationality: 'Malaysian',
        email: userDetails.email || 'user@example.com',
        phone: userDetails.phone || '+60123456789',
        address: {
          street: 'Demo Street',
          city: 'Kuala Lumpur',
          state: 'Federal Territory',
          postcode: '50000',
          country: 'Malaysia'
        },
        employmentStatus: financialProfile.employmentType === 'permanent' ? 'employed' :
                         financialProfile.employmentType === 'self-employed' ? 'self-employed' : 'employed',
        employerName: 'Demo Company Sdn Bhd',
        monthlyIncome: financialProfile.monthlyIncome,
        employmentDuration: financialProfile.employmentDuration,
        loanAmount: selectedPlan.plan.totalAmount - selectedPlan.plan.downPayment,
        tenure: selectedPlan.tenure,
        purpose: 'travel'
      })

      if (creditResult.success && creditResult.approved) {
        setRhbApplicationId(creditResult.applicationId)
        toast.success('Credit check approved!')

        // Create payment plan
        await createBNPLPlan(creditResult.applicationId)
      } else {
        toast.error(creditResult.reasons?.join('. ') || 'Credit check failed')
        setCurrentStep('financial-info')
      }
    } catch (error) {
      console.error('RHB credit check error:', error)
      toast.error('An error occurred during credit check')
      setCurrentStep('financial-info')
    } finally {
      setLoading(false)
    }
  }

  const createBNPLPlan = async (applicationId: string) => {
    if (!selectedPlan) return

    try {
      const result = await createPaymentPlan({
        userId: 'demo-user-123', // Replace with actual user ID
        bookingId: 'demo-booking-456', // Replace with actual booking ID
        tripAmount,
        currency: 'MYR',
        tenure: selectedPlan.tenure,
        downPaymentPercent: (selectedPlan.plan.downPayment / tripAmount) * 100,
        financialProfile
      })

      if (result.success && result.paymentPlanId) {
        setCurrentStep('confirmation')
        toast.success('Payment plan created successfully!')

        // Call parent success handler after short delay
        setTimeout(() => {
          onSuccess(result.paymentPlanId!)
        }, 3000)
      } else {
        toast.error(result.error || 'Failed to create payment plan')
      }
    } catch (error) {
      console.error('Payment plan creation error:', error)
      toast.error('Failed to create payment plan')
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Holiday Now Pay Later</h2>
          <p className="text-white/60">
            {tripName} - RM {tripAmount.toLocaleString()}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {[
              { id: 'recommendations', label: 'Recommendations' },
              { id: 'plan-selection', label: 'Select Plan' },
              { id: 'financial-info', label: 'Your Details' },
              { id: 'rhb-check', label: 'RHB Verification' },
              { id: 'confirmation', label: 'Confirmation' }
            ].map((step, index) => {
              const isActive = step.id === currentStep
              const stepOrder = ['recommendations', 'plan-selection', 'financial-info', 'rhb-check', 'confirmation']
              const currentIndex = stepOrder.indexOf(currentStep)
              const isCompleted = index < currentIndex

              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center gap-2`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      isCompleted ? 'bg-green-500 border-green-500' :
                      isActive ? 'bg-blue-500 border-blue-500' :
                      'border-white/20'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-white" />
                      ) : (
                        <span className="text-white font-semibold">{index + 1}</span>
                      )}
                    </div>
                    <span className={`text-sm hidden md:block ${
                      isActive ? 'text-white font-semibold' :
                      isCompleted ? 'text-green-400' :
                      'text-white/40'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  {index < 4 && (
                    <div className={`w-12 h-px mx-2 ${
                      isCompleted ? 'bg-green-500' : 'bg-white/20'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {/* Step 1: Smart Recommendations */}
          {currentStep === 'recommendations' && (
            <motion.div
              key="recommendations"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Warnings */}
              {recommendations.warnings.length > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                    <div className="space-y-2">
                      {recommendations.warnings.map((warning, i) => (
                        <p key={i} className="text-white/90">{warning}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Insights */}
              {recommendations.insights.length > 0 && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6 mb-6">
                  <div className="flex items-start gap-3">
                    <Info className="w-6 h-6 text-blue-400 flex-shrink-0" />
                    <div className="space-y-2">
                      {recommendations.insights.map((insight, i) => (
                        <p key={i} className="text-white/90">{insight}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Top Pick */}
              {recommendations.topPick && (
                <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-2 border-purple-500/50 rounded-3xl p-8 mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-6 h-6 text-purple-400" />
                    <h3 className="text-2xl font-bold text-white">Recommended for You</h3>
                  </div>

                  <PlanCard
                    plan={recommendations.topPick}
                    isTopPick
                    onSelect={() => handlePlanSelect(recommendations.topPick)}
                  />
                </div>
              )}

              {/* Alternative Plans */}
              {recommendations.alternatives.length > 0 && (
                <div>
                  <h4 className="text-xl font-bold text-white mb-4">Other Options</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {recommendations.alternatives.map((plan) => (
                      <PlanCard
                        key={plan.tenure}
                        plan={plan}
                        onSelect={() => handlePlanSelect(plan)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 2: Financial Information */}
          {currentStep === 'financial-info' && selectedPlan && (
            <motion.div
              key="financial-info"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-3xl p-8"
            >
              <h3 className="text-2xl font-bold text-white mb-6">Your Financial Information</h3>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Monthly Income (RM) *
                  </label>
                  <input
                    type="number"
                    value={financialProfile.monthlyIncome}
                    onChange={(e) => setFinancialProfile({ ...financialProfile, monthlyIncome: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="5000"
                    min="2000"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Existing Monthly Debts (RM)
                  </label>
                  <input
                    type="number"
                    value={financialProfile.existingMonthlyDebts}
                    onChange={(e) => setFinancialProfile({ ...financialProfile, existingMonthlyDebts: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1000"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={userDetails.fullName}
                    onChange={(e) => setUserDetails({ ...userDetails, fullName: e.target.value })}
                    className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ahmad bin Abdullah"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    IC Number *
                  </label>
                  <input
                    type="text"
                    value={userDetails.icNumber}
                    onChange={(e) => setUserDetails({ ...userDetails, icNumber: e.target.value })}
                    className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="900101-01-1234"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={userDetails.email}
                    onChange={(e) => setUserDetails({ ...userDetails, email: e.target.value })}
                    className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={userDetails.phone}
                    onChange={(e) => setUserDetails({ ...userDetails, phone: e.target.value })}
                    className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+60123456789"
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep('recommendations')}
                  className="px-6 py-3 border border-white/20 rounded-xl text-white hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={handleFinancialInfoSubmit}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-semibold hover:scale-105 transition-transform flex items-center gap-2"
                >
                  Continue to RHB Check
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: RHB Credit Check (Loading) */}
          {currentStep === 'rhb-check' && (
            <motion.div
              key="rhb-check"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-3xl p-12 text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Shield className="w-10 h-10 text-blue-400 animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Verifying with RHB Bank...</h3>
              <p className="text-white/60 mb-6">Please wait while we process your credit check</p>
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-800 border-t-blue-500 mx-auto"></div>
            </motion.div>
          )}

          {/* Step 4: Confirmation */}
          {currentStep === 'confirmation' && selectedPlan && (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-3xl p-12 text-center"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle className="w-14 h-14 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">Application Approved!</h3>
              <p className="text-white/80 text-lg mb-8">
                Your Holiday Now Pay Later plan has been successfully set up
              </p>

              <div className="bg-white/5 rounded-2xl p-6 max-w-md mx-auto mb-8">
                <div className="space-y-4 text-left">
                  <div className="flex justify-between">
                    <span className="text-white/60">Monthly Payment</span>
                    <span className="text-white font-bold">RM {selectedPlan.plan.monthlyPayment.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Tenure</span>
                    <span className="text-white font-bold">{selectedPlan.tenure} months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">First Payment</span>
                    <span className="text-white font-bold">
                      {selectedPlan.plan.installments[0].dueDate.toLocaleDateString('en-MY')}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-white/60 text-sm">
                Redirecting to booking confirmation...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Plan Card Component
function PlanCard({
  plan,
  isTopPick = false,
  onSelect
}: {
  plan: PaymentPlanRecommendation
  isTopPick?: boolean
  onSelect: () => void
}) {
  return (
    <div className={`bg-white/5 rounded-2xl p-6 border ${isTopPick ? 'border-purple-500/50' : 'border-white/10'} hover:scale-[1.02] transition-transform`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="text-2xl font-bold text-white mb-1">
            {plan.tenure} Months
          </h4>
          <p className="text-white/60 text-sm">{plan.bestFor}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {plan.badges.map((badge) => (
            <span
              key={badge}
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                badge === '0% Interest' ? 'bg-green-500/20 text-green-400' :
                badge === 'Recommended' ? 'bg-purple-500/20 text-purple-400' :
                'bg-blue-500/20 text-blue-400'
              }`}
            >
              {badge}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <div className="text-4xl font-bold text-white mb-1">
          RM {plan.plan.monthlyPayment.toLocaleString()}
          <span className="text-lg text-white/60">/month</span>
        </div>
        <div className="text-white/60 text-sm">
          Total: RM {plan.plan.totalAmount.toLocaleString()}
          {plan.plan.totalInterest > 0 && (
            <span className="text-orange-400"> (+ RM {plan.plan.totalInterest.toLocaleString()} interest)</span>
          )}
        </div>
      </div>

      <div className="mb-6 p-4 bg-black/20 rounded-xl">
        <p className="text-white/80 text-sm">{plan.aiInsight}</p>
      </div>

      <button
        onClick={onSelect}
        className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
          isTopPick
            ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:scale-105'
            : 'bg-white/10 text-white hover:bg-white/20'
        }`}
      >
        Select This Plan
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  )
}
