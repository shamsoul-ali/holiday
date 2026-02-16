'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  DollarSign,
  TrendingDown,
  Calendar,
  Percent,
  ArrowRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { calculateInstallmentPlan, type InstallmentPlan } from '../../lib/bnpl/installment-calculator'
import { DEFAULT_BNPL_CONFIG } from '../../lib/bnpl/payment-plan-service'

interface CostComparisonProps {
  tripAmount: number
  currency?: string
  defaultTenure?: number
}

export default function CostComparison({
  tripAmount,
  currency = 'MYR',
  defaultTenure = 12
}: CostComparisonProps) {
  const [selectedTenure, setSelectedTenure] = useState(defaultTenure)
  const [downPaymentPercent, setDownPaymentPercent] = useState(0)

  const tenureOptions = DEFAULT_BNPL_CONFIG.availableTenures
  const interestRates = DEFAULT_BNPL_CONFIG.interestRates

  // Calculate plans for all tenure options
  const plans = useMemo(() => {
    return tenureOptions.map(tenure => ({
      tenure,
      plan: calculateInstallmentPlan({
        principal: tripAmount,
        downPaymentPercent,
        tenure,
        interestRate: interestRates[tenure] || 0
      }),
      interestRate: interestRates[tenure] || 0
    }))
  }, [tripAmount, downPaymentPercent, tenureOptions, interestRates])

  // Get selected plan
  const selectedPlan = plans.find(p => p.tenure === selectedTenure)

  // Calculate savings vs pay now
  const payNowAmount = tripAmount
  const totalWithBNPL = selectedPlan?.plan.totalAmount || 0
  const extraCost = totalWithBNPL - payNowAmount

  // Calculate cost per day
  const costPerDay = selectedPlan ? selectedPlan.plan.totalInterest / (selectedPlan.tenure * 30) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center">
            <TrendingDown className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Cost Comparison</h3>
            <p className="text-white/60 text-sm">Compare payment options and total costs</p>
          </div>
        </div>

        {/* Down Payment Slider */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-white/80 text-sm font-medium">
              Down Payment: {downPaymentPercent}%
            </label>
            <span className="text-white font-semibold">
              RM {((tripAmount * downPaymentPercent) / 100).toLocaleString()}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            step="5"
            value={downPaymentPercent}
            onChange={(e) => setDownPaymentPercent(parseInt(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${downPaymentPercent * 2}%, rgba(255,255,255,0.1) ${downPaymentPercent * 2}%, rgba(255,255,255,0.1) 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-white/40 mt-1">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
          </div>
        </div>

        {/* Pay Now vs BNPL Comparison */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Pay Now Option */}
          <div className="bg-white/5 rounded-2xl p-6 border-2 border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-green-400" />
              <h4 className="text-white font-semibold">Pay Now</h4>
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              RM {payNowAmount.toLocaleString()}
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span>No interest charges</span>
              </li>
              <li className="flex items-center gap-2 text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span>No monthly commitments</span>
              </li>
              <li className="flex items-center gap-2 text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span>Immediate ownership</span>
              </li>
            </ul>
          </div>

          {/* BNPL Option */}
          <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl p-6 border-2 border-purple-500/30">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-purple-400" />
              <h4 className="text-white font-semibold">Holiday Now Pay Later</h4>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              RM {selectedPlan?.plan.monthlyPayment.toLocaleString()}
              <span className="text-lg text-white/60">/month</span>
            </div>
            <p className="text-white/60 text-sm mb-4">for {selectedTenure} months</p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-blue-400">
                <CheckCircle className="w-4 h-4" />
                <span>Preserve cash flow</span>
              </li>
              <li className="flex items-center gap-2 text-blue-400">
                <CheckCircle className="w-4 h-4" />
                <span>Travel now, pay gradually</span>
              </li>
              <li className="flex items-center gap-2 text-yellow-400">
                <AlertCircle className="w-4 h-4" />
                <span>Total: RM {totalWithBNPL.toLocaleString()}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Extra Cost Breakdown */}
        {extraCost > 0 && (
          <div className="mt-6 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Percent className="w-5 h-5 text-yellow-400" />
                <span className="text-white/80 text-sm">
                  Additional cost for installment plan:
                </span>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-yellow-400">
                  +RM {extraCost.toLocaleString()}
                </div>
                <div className="text-xs text-white/60">
                  ~RM {costPerDay.toFixed(2)}/day
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tenure Options Grid */}
      <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
        <h4 className="text-xl font-bold text-white mb-6">Compare All Tenure Options</h4>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map(({ tenure, plan, interestRate }) => {
            const isSelected = tenure === selectedTenure
            const isPromo = interestRate === 0

            return (
              <motion.button
                key={tenure}
                onClick={() => setSelectedTenure(tenure)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative p-6 rounded-2xl border-2 transition-all text-left ${
                  isSelected
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                {isPromo && (
                  <div className="absolute -top-3 left-4 px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full text-xs font-bold text-white">
                    0% APR
                  </div>
                )}

                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">
                    {tenure}
                  </div>
                  <div className="text-white/60 text-sm mb-4">months</div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <div className="text-white/60 text-xs">Monthly</div>
                      <div className="text-white font-bold">
                        RM {plan.monthlyPayment.toLocaleString()}
                      </div>
                    </div>

                    <div>
                      <div className="text-white/60 text-xs">Total Interest</div>
                      <div className={plan.totalInterest === 0 ? 'text-green-400 font-bold' : 'text-orange-400 font-semibold'}>
                        {plan.totalInterest === 0 ? 'FREE' : `RM ${plan.totalInterest.toLocaleString()}`}
                      </div>
                    </div>

                    <div>
                      <div className="text-white/60 text-xs">Total Amount</div>
                      <div className="text-white/80">
                        RM {plan.totalAmount.toLocaleString()}
                      </div>
                    </div>

                    {interestRate > 0 && (
                      <div className="text-xs text-white/40">
                        {interestRate}% APR
                      </div>
                    )}
                  </div>
                </div>

                {isSelected && (
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-purple-500 rounded-full" />
                )}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Savings Comparison */}
      {selectedPlan && (
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
          <h4 className="text-xl font-bold text-white mb-6">Break Down the Numbers</h4>

          <div className="space-y-4">
            {/* Trip Amount */}
            <div className="flex items-center justify-between py-3 border-b border-white/10">
              <span className="text-white/80">Original Trip Cost</span>
              <span className="text-white font-semibold">RM {tripAmount.toLocaleString()}</span>
            </div>

            {/* Down Payment */}
            {downPaymentPercent > 0 && (
              <div className="flex items-center justify-between py-3 border-b border-white/10">
                <span className="text-white/80">Down Payment ({downPaymentPercent}%)</span>
                <span className="text-green-400 font-semibold">
                  -RM {selectedPlan.plan.downPayment.toLocaleString()}
                </span>
              </div>
            )}

            {/* Financed Amount */}
            <div className="flex items-center justify-between py-3 border-b border-white/10">
              <span className="text-white/80">Financed Amount</span>
              <span className="text-white font-semibold">
                RM {(tripAmount - selectedPlan.plan.downPayment).toLocaleString()}
              </span>
            </div>

            {/* Interest */}
            <div className="flex items-center justify-between py-3 border-b border-white/10">
              <span className="text-white/80">Total Interest ({selectedPlan.interestRate}% APR)</span>
              <span className={selectedPlan.plan.totalInterest === 0 ? 'text-green-400' : 'text-orange-400'}>
                {selectedPlan.plan.totalInterest === 0 ? 'FREE' : `+RM ${selectedPlan.plan.totalInterest.toLocaleString()}`}
              </span>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between py-4 bg-white/5 rounded-xl px-4">
              <span className="text-white font-semibold text-lg">Total Amount Payable</span>
              <span className="text-2xl font-bold text-white">
                RM {selectedPlan.plan.totalAmount.toLocaleString()}
              </span>
            </div>

            {/* Monthly Breakdown */}
            <div className="flex items-center justify-between py-3 bg-purple-500/10 rounded-xl px-4">
              <span className="text-white/80">
                {selectedPlan.tenure} monthly payments of
              </span>
              <span className="text-xl font-bold text-purple-400">
                RM {selectedPlan.plan.monthlyPayment.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
