'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calculator,
  Sliders,
  Calendar,
  TrendingUp,
  DollarSign,
  Zap
} from 'lucide-react'
import { calculateInstallmentPlan } from '../../lib/bnpl/installment-calculator'
import { DEFAULT_BNPL_CONFIG } from '../../lib/bnpl/payment-plan-service'

export default function PaymentSimulator() {
  const [tripCost, setTripCost] = useState(10000)
  const [downPayment, setDownPayment] = useState(0)
  const [tenure, setTenure] = useState(12)
  const [extraPayment, setExtraPayment] = useState(0)

  const interestRate = DEFAULT_BNPL_CONFIG.interestRates[tenure] || 0

  // Calculate base plan
  const basePlan = calculateInstallmentPlan({
    principal: tripCost,
    downPaymentPercent: downPayment,
    tenure,
    interestRate
  })

  // Calculate with extra monthly payment (accelerated payoff)
  const calculateAcceleratedPayoff = () => {
    if (extraPayment === 0) return null

    const monthlyWithExtra = basePlan.monthlyPayment + extraPayment
    let remainingBalance = tripCost - basePlan.downPayment
    let monthsPaid = 0
    let totalInterestPaid = 0
    const monthlyRate = interestRate / 12 / 100

    while (remainingBalance > 0 && monthsPaid < tenure) {
      const interestCharge = remainingBalance * monthlyRate
      const principalPayment = Math.min(monthlyWithExtra - interestCharge, remainingBalance)

      totalInterestPaid += interestCharge
      remainingBalance -= principalPayment
      monthsPaid++

      if (remainingBalance < 0.01) break // Account for floating point
    }

    const interestSaved = basePlan.totalInterest - totalInterestPaid
    const monthsSaved = tenure - monthsPaid

    return {
      monthsPaid,
      monthsSaved,
      interestSaved,
      totalInterestPaid
    }
  }

  const accelerated = calculateAcceleratedPayoff()

  return (
    <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
          <Calculator className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white">Payment Simulator</h3>
          <p className="text-white/60 text-sm">Adjust parameters to see real-time calculations</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-6">
          {/* Trip Cost Slider */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-white/80 text-sm font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Trip Cost
              </label>
              <span className="text-white font-bold text-lg">
                RM {tripCost.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="1000"
              max="50000"
              step="1000"
              value={tripCost}
              onChange={(e) => setTripCost(parseInt(e.target.value))}
              className="w-full h-3 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-white/40 mt-1">
              <span>RM 1K</span>
              <span>RM 25K</span>
              <span>RM 50K</span>
            </div>
          </div>

          {/* Down Payment Slider */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-white/80 text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Down Payment
              </label>
              <div className="text-right">
                <div className="text-white font-bold">{downPayment}%</div>
                <div className="text-white/60 text-xs">
                  RM {((tripCost * downPayment) / 100).toLocaleString()}
                </div>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={downPayment}
              onChange={(e) => setDownPayment(parseInt(e.target.value))}
              className="w-full h-3 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-white/40 mt-1">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
            </div>
          </div>

          {/* Tenure Selector */}
          <div>
            <label className="text-white/80 text-sm font-medium mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Loan Tenure
            </label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {DEFAULT_BNPL_CONFIG.availableTenures.map((months) => (
                <button
                  key={months}
                  onClick={() => setTenure(months)}
                  className={`py-3 px-4 rounded-xl font-semibold transition-all ${
                    tenure === months
                      ? 'bg-indigo-500 text-white'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {months}m
                </button>
              ))}
            </div>
          </div>

          {/* Extra Monthly Payment */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-white/80 text-sm font-medium flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Extra Monthly Payment
              </label>
              <span className="text-white font-bold">
                RM {extraPayment.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="2000"
              step="100"
              value={extraPayment}
              onChange={(e) => setExtraPayment(parseInt(e.target.value))}
              className="w-full h-3 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-white/40 mt-1">
              <span>RM 0</span>
              <span>RM 1K</span>
              <span>RM 2K</span>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {/* Base Plan */}
          <motion.div
            layout
            className="bg-white/5 rounded-2xl p-6 border border-white/10"
          >
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-400" />
              Standard Plan
            </h4>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">Monthly Payment</span>
                <span className="text-2xl font-bold text-white">
                  RM {basePlan.monthlyPayment.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 border-t border-white/10">
                <span className="text-white/60 text-sm">Interest Rate</span>
                <span className="text-white font-semibold">
                  {interestRate}% APR {interestRate === 0 && <span className="text-green-400 text-xs ml-2">PROMO</span>}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 border-t border-white/10">
                <span className="text-white/60 text-sm">Total Interest</span>
                <span className={basePlan.totalInterest === 0 ? 'text-green-400 font-bold' : 'text-orange-400 font-semibold'}>
                  {basePlan.totalInterest === 0 ? 'FREE' : `RM ${basePlan.totalInterest.toLocaleString()}`}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 border-t border-white/10">
                <span className="text-white/60 text-sm">Total Payable</span>
                <span className="text-white font-bold">
                  RM {basePlan.totalAmount.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 bg-indigo-500/10 rounded-xl px-4">
                <span className="text-white/80 text-sm">First Payment</span>
                <span className="text-white font-semibold">
                  {basePlan.installments[0].dueDate.toLocaleDateString('en-MY', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Accelerated Payoff (if extra payment) */}
          <AnimatePresence>
            {accelerated && extraPayment > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl p-6 border border-green-500/30"
              >
                <h4 className="text-green-400 font-semibold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  With Extra Payment
                </h4>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white/80 text-sm">New Monthly</span>
                    <span className="text-xl font-bold text-white">
                      RM {(basePlan.monthlyPayment + extraPayment).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-t border-white/10">
                    <span className="text-white/60 text-sm">Paid Off In</span>
                    <span className="text-green-400 font-bold">
                      {accelerated.monthsPaid} months
                      <span className="text-xs ml-2">(-{accelerated.monthsSaved} months)</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-t border-white/10">
                    <span className="text-white/60 text-sm">Interest Saved</span>
                    <span className="text-green-400 font-bold">
                      RM {accelerated.interestSaved.toLocaleString()}
                    </span>
                  </div>

                  <div className="mt-4 p-3 bg-green-500/20 rounded-xl">
                    <p className="text-green-400 text-xs text-center">
                      You'll save <strong>RM {accelerated.interestSaved.toLocaleString()}</strong> and
                      finish <strong>{accelerated.monthsSaved} months earlier</strong>!
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-white/60 text-xs mb-1">Cost Per Day</div>
              <div className="text-white font-bold">
                RM {(basePlan.totalInterest / (tenure * 30)).toFixed(2)}
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-white/60 text-xs mb-1">Financed Amount</div>
              <div className="text-white font-bold">
                RM {(tripCost - basePlan.downPayment).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
