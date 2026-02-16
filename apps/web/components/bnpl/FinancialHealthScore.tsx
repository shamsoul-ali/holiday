'use client'

import { motion } from 'framer-motion'
import {
  Award,
  TrendingUp,
  TrendingDown,
  Calendar,
  CreditCard,
  Target,
  Lightbulb,
  Star
} from 'lucide-react'
import { calculateFinancialHealthScore, type FinancialProfile } from '../../lib/bnpl/risk-calculator'

interface FinancialHealthScoreProps {
  financialProfile: FinancialProfile
  paymentHistory: {
    totalPayments: number
    onTimePayments: number
    latePayments: number
    missedPayments: number
  }
  accountAgeMonths: number
}

export default function FinancialHealthScore({
  financialProfile,
  paymentHistory,
  accountAgeMonths
}: FinancialHealthScoreProps) {
  const healthScore = calculateFinancialHealthScore(
    financialProfile,
    paymentHistory,
    accountAgeMonths
  )

  const getScoreColor = () => {
    if (healthScore.score >= 80) return { bg: 'from-green-500/20 to-emerald-500/20', text: 'text-green-400', gradient: 'from-green-500 to-emerald-500' }
    if (healthScore.score >= 60) return { bg: 'from-blue-500/20 to-cyan-500/20', text: 'text-blue-400', gradient: 'from-blue-500 to-cyan-500' }
    if (healthScore.score >= 40) return { bg: 'from-yellow-500/20 to-orange-500/20', text: 'text-yellow-400', gradient: 'from-yellow-500 to-orange-500' }
    return { bg: 'from-red-500/20 to-pink-500/20', text: 'text-red-400', gradient: 'from-red-500 to-pink-500' }
  }

  const colors = getScoreColor()

  const getScoreRating = () => {
    if (healthScore.score >= 80) return 'Excellent'
    if (healthScore.score >= 60) return 'Good'
    if (healthScore.score >= 40) return 'Fair'
    return 'Needs Improvement'
  }

  const onTimePaymentRate = paymentHistory.totalPayments > 0
    ? (paymentHistory.onTimePayments / paymentHistory.totalPayments) * 100
    : 100

  return (
    <div className="space-y-6">
      {/* Main Score Card */}
      <div className={`bg-gradient-to-br ${colors.bg} backdrop-blur-sm border border-white/10 rounded-3xl p-8`}>
        <div className="flex items-center gap-3 mb-8">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colors.bg} flex items-center justify-center`}>
            <Award className={`w-6 h-6 ${colors.text}`} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Financial Health Score</h3>
            <p className="text-white/60 text-sm">Your creditworthiness at a glance</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Score Circle */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-56 h-56">
              {/* Background Circle */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="112"
                  cy="112"
                  r="100"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="20"
                />
                {/* Progress Circle */}
                <motion.circle
                  cx="112"
                  cy="112"
                  r="100"
                  fill="none"
                  stroke="url(#scoreGradient)"
                  strokeWidth="20"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "0 628" }}
                  animate={{
                    strokeDasharray: `${(healthScore.score / 100) * 628} 628`
                  }}
                  transition={{ duration: 2, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={healthScore.score >= 80 ? '#10b981' :
                                                 healthScore.score >= 60 ? '#3b82f6' :
                                                 healthScore.score >= 40 ? '#f59e0b' : '#ef4444'} />
                    <stop offset="100%" stopColor={healthScore.score >= 80 ? '#059669' :
                                                   healthScore.score >= 60 ? '#2563eb' :
                                                   healthScore.score >= 40 ? '#ea580c' : '#dc2626'} />
                  </linearGradient>
                </defs>
              </svg>

              {/* Score Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.5, type: 'spring' }}
                  className="text-7xl font-bold text-white"
                >
                  {healthScore.score}
                </motion.div>
                <div className="text-white/60 text-sm mt-2">out of 100</div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <div className={`text-2xl font-bold ${colors.text} mb-2`}>
                {getScoreRating()}
              </div>
              <div className="flex items-center gap-1 justify-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(healthScore.score / 20)
                        ? `${colors.text} fill-current`
                        : 'text-white/20'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="space-y-4">
            {/* Payment History */}
            <div className="bg-white/5 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  <span className="text-white/80 text-sm font-medium">Payment History</span>
                </div>
                <span className="text-white font-bold">{healthScore.breakdown.paymentHistory}/40</span>
              </div>
              <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                  style={{ width: `${(healthScore.breakdown.paymentHistory / 40) * 100}%` }}
                />
              </div>
              <div className="text-white/60 text-xs mt-2">
                {onTimePaymentRate.toFixed(0)}% on-time payments
              </div>
            </div>

            {/* Debt-to-Income */}
            <div className="bg-white/5 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-green-400" />
                  <span className="text-white/80 text-sm font-medium">Debt-to-Income</span>
                </div>
                <span className="text-white font-bold">{healthScore.breakdown.debtToIncome}/30</span>
              </div>
              <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                  style={{ width: `${(healthScore.breakdown.debtToIncome / 30) * 100}%` }}
                />
              </div>
            </div>

            {/* Credit Utilization */}
            <div className="bg-white/5 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-purple-400" />
                  <span className="text-white/80 text-sm font-medium">Credit Utilization</span>
                </div>
                <span className="text-white font-bold">{healthScore.breakdown.creditUtilization}/20</span>
              </div>
              <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  style={{ width: `${(healthScore.breakdown.creditUtilization / 20) * 100}%` }}
                />
              </div>
            </div>

            {/* Account Age */}
            <div className="bg-white/5 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-orange-400" />
                  <span className="text-white/80 text-sm font-medium">Account Age</span>
                </div>
                <span className="text-white font-bold">{healthScore.breakdown.accountAge}/10</span>
              </div>
              <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-500"
                  style={{ width: `${(healthScore.breakdown.accountAge / 10) * 100}%` }}
                />
              </div>
              <div className="text-white/60 text-xs mt-2">
                {accountAgeMonths} months with us
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
        <h4 className="text-xl font-bold text-white mb-6">Your Benefits</h4>

        <div className="grid md:grid-cols-2 gap-4">
          {healthScore.score >= 80 && (
            <>
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <h5 className="text-green-400 font-semibold mb-1">Premium Rates</h5>
                    <p className="text-white/80 text-sm">
                      Unlock the best interest rates and exclusive 0% promo offers
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h5 className="text-blue-400 font-semibold mb-1">Higher Limits</h5>
                    <p className="text-white/80 text-sm">
                      Access up to RM 50,000 for your dream vacation
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {healthScore.score >= 60 && healthScore.score < 80 && (
            <>
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h5 className="text-blue-400 font-semibold mb-1">Good Rates</h5>
                    <p className="text-white/80 text-sm">
                      Competitive interest rates on flexible payment plans
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <Star className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h5 className="text-purple-400 font-semibold mb-1">Standard Access</h5>
                    <p className="text-white/80 text-sm">
                      BNPL up to RM 30,000 with standard terms
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tips for Improvement */}
      <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 flex items-center justify-center">
            <Lightbulb className="w-6 h-6 text-yellow-400" />
          </div>
          <h4 className="text-xl font-bold text-white">Tips to Improve Your Score</h4>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {healthScore.tips.map((tip, index) => (
            <div key={index} className="bg-white/5 rounded-xl p-4 flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-yellow-400 text-sm font-bold">{index + 1}</span>
              </div>
              <p className="text-white/80 text-sm">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Payment History Details */}
      {paymentHistory.totalPayments > 0 && (
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
          <h4 className="text-xl font-bold text-white mb-6">Payment Track Record</h4>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-white mb-1">
                {paymentHistory.totalPayments}
              </div>
              <div className="text-white/60 text-sm">Total Payments</div>
            </div>

            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-green-400 mb-1">
                {paymentHistory.onTimePayments}
              </div>
              <div className="text-white/60 text-sm">On Time</div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-1">
                {paymentHistory.latePayments}
              </div>
              <div className="text-white/60 text-sm">Late</div>
            </div>

            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-red-400 mb-1">
                {paymentHistory.missedPayments}
              </div>
              <div className="text-white/60 text-sm">Missed</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
