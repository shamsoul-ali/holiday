'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Wallet,
  TrendingUp,
  Calendar,
  AlertTriangle,
  CheckCircle,
  PieChart,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

interface ActivePlan {
  id: string
  tripName: string
  monthlyPayment: number
  remainingPayments: number
  nextDueDate: Date
  totalRemaining: number
}

interface FinancialCommitmentProps {
  monthlyIncome?: number
  activePlans?: ActivePlan[]
  newPlanPayment?: number
}

export default function FinancialCommitment({
  monthlyIncome = 5000,
  activePlans = [],
  newPlanPayment = 0
}: FinancialCommitmentProps) {
  const [income, setIncome] = useState(monthlyIncome)

  // Calculate totals
  const currentCommitment = activePlans.reduce((sum, plan) => sum + plan.monthlyPayment, 0)
  const totalCommitment = currentCommitment + newPlanPayment
  const remainingIncome = income - totalCommitment
  const commitmentPercentage = (totalCommitment / income) * 100

  // Calculate other estimated expenses
  const estimatedExpenses = income * 0.30 // 30% for living expenses
  const trulyDisposable = remainingIncome - estimatedExpenses

  // Determine status
  const getStatus = () => {
    if (commitmentPercentage <= 30) return { label: 'Excellent', color: 'green', icon: CheckCircle }
    if (commitmentPercentage <= 40) return { label: 'Good', color: 'blue', icon: CheckCircle }
    if (commitmentPercentage <= 50) return { label: 'Caution', color: 'yellow', icon: AlertTriangle }
    return { label: 'High Risk', color: 'red', icon: AlertTriangle }
  }

  const status = getStatus()
  const StatusIcon = status.icon

  // Upcoming payments (next 3 months)
  const upcomingPayments = activePlans.flatMap(plan => {
    const payments = []
    for (let i = 0; i < Math.min(3, plan.remainingPayments); i++) {
      const date = new Date(plan.nextDueDate)
      date.setMonth(date.getMonth() + i)
      payments.push({
        planId: plan.id,
        tripName: plan.tripName,
        amount: plan.monthlyPayment,
        date
      })
    }
    return payments
  }).sort((a, b) => a.date.getTime() - b.date.getTime())

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
            <Wallet className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Financial Commitment</h3>
            <p className="text-white/60 text-sm">Track your monthly budget impact</p>
          </div>
        </div>

        {/* Monthly Income Input */}
        <div className="mb-8">
          <label className="block text-white/80 text-sm font-medium mb-3">
            Monthly Income (RM)
          </label>
          <input
            type="number"
            value={income}
            onChange={(e) => setIncome(parseFloat(e.target.value) || 0)}
            className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="5000"
            min="0"
            step="100"
          />
        </div>

        {/* Budget Breakdown */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {/* Current BNPL Commitments */}
          <div className="bg-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              <h4 className="text-white/80 text-sm">Current BNPL</h4>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              RM {currentCommitment.toLocaleString()}
            </div>
            <div className="text-white/60 text-xs">
              {activePlans.length} active plan{activePlans.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* New Plan */}
          {newPlanPayment > 0 && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpRight className="w-5 h-5 text-purple-400" />
                <h4 className="text-white/80 text-sm">New Plan</h4>
              </div>
              <div className="text-3xl font-bold text-purple-400 mb-1">
                +RM {newPlanPayment.toLocaleString()}
              </div>
              <div className="text-white/60 text-xs">Monthly payment</div>
            </div>
          )}

          {/* Remaining Income */}
          <div className={`rounded-2xl p-6 ${
            remainingIncome >= income * 0.5 ? 'bg-green-500/10 border border-green-500/30' :
            remainingIncome >= income * 0.3 ? 'bg-yellow-500/10 border border-yellow-500/30' :
            'bg-red-500/10 border border-red-500/30'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <ArrowDownRight className="w-5 h-5 text-emerald-400" />
              <h4 className="text-white/80 text-sm">Remaining</h4>
            </div>
            <div className={`text-3xl font-bold mb-1 ${
              remainingIncome >= income * 0.5 ? 'text-green-400' :
              remainingIncome >= income * 0.3 ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              RM {remainingIncome.toLocaleString()}
            </div>
            <div className="text-white/60 text-xs">
              {((remainingIncome / income) * 100).toFixed(1)}% of income
            </div>
          </div>
        </div>

        {/* Budget Visualization */}
        <div className="bg-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-white font-semibold flex items-center gap-2">
              <PieChart className="w-5 h-5 text-emerald-400" />
              Monthly Budget Breakdown
            </h4>
            <div className={`px-4 py-2 rounded-xl flex items-center gap-2 ${
              status.color === 'green' ? 'bg-green-500/20 text-green-400' :
              status.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
              status.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              <StatusIcon className="w-4 h-4" />
              <span className="font-semibold text-sm">{status.label}</span>
            </div>
          </div>

          {/* Stacked Bar Chart */}
          <div className="space-y-3">
            <div className="h-16 bg-black/30 rounded-xl overflow-hidden flex">
              {/* BNPL Commitments */}
              {totalCommitment > 0 && (
                <div
                  style={{ width: `${(totalCommitment / income) * 100}%` }}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-semibold"
                >
                  {commitmentPercentage.toFixed(0)}%
                </div>
              )}

              {/* Estimated Living Expenses */}
              {estimatedExpenses > 0 && (
                <div
                  style={{ width: `${30}%` }}
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 flex items-center justify-center text-white text-sm font-semibold"
                >
                  30%
                </div>
              )}

              {/* Disposable */}
              {trulyDisposable > 0 && (
                <div
                  style={{ width: `${(trulyDisposable / income) * 100}%` }}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white text-sm font-semibold"
                >
                  {((trulyDisposable / income) * 100).toFixed(0)}%
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-r from-purple-500 to-blue-500" />
                <div>
                  <div className="text-white/80">BNPL Payments</div>
                  <div className="text-white font-semibold">RM {totalCommitment.toLocaleString()}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-r from-orange-500 to-yellow-500" />
                <div>
                  <div className="text-white/80">Living Expenses</div>
                  <div className="text-white font-semibold">~RM {estimatedExpenses.toLocaleString()}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-r from-green-500 to-emerald-500" />
                <div>
                  <div className="text-white/80">Disposable</div>
                  <div className="text-white font-semibold">RM {Math.max(0, trulyDisposable).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Warning/Success Messages */}
        {commitmentPercentage > 40 && (
          <div className="mt-6 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 mt-1" />
              <div>
                <h4 className="text-yellow-400 font-semibold mb-1">High Commitment Level</h4>
                <p className="text-white/80 text-sm">
                  Your BNPL commitments are at {commitmentPercentage.toFixed(1)}% of your income.
                  Consider reducing debt or increasing down payment for new plans.
                </p>
              </div>
            </div>
          </div>
        )}

        {commitmentPercentage <= 30 && (
          <div className="mt-6 bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
              <div>
                <h4 className="text-green-400 font-semibold mb-1">Healthy Financial Position</h4>
                <p className="text-white/80 text-sm">
                  Your BNPL commitments are well within safe limits at {commitmentPercentage.toFixed(1)}%.
                  You have good financial flexibility.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active Plans */}
      {activePlans.length > 0 && (
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
          <h4 className="text-xl font-bold text-white mb-6">Active Payment Plans</h4>

          <div className="space-y-4">
            {activePlans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 rounded-2xl p-6 border border-white/10"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h5 className="text-white font-semibold mb-2">{plan.tripName}</h5>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-white/60">Monthly Payment</div>
                        <div className="text-white font-bold">RM {plan.monthlyPayment.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-white/60">Remaining</div>
                        <div className="text-white font-bold">
                          {plan.remainingPayments} payment{plan.remainingPayments !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <div>
                        <div className="text-white/60">Next Due</div>
                        <div className="text-white font-bold">
                          {plan.nextDueDate.toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-white/60 text-sm">Total Remaining</div>
                    <div className="text-2xl font-bold text-blue-400">
                      RM {plan.totalRemaining.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                      style={{
                        width: `${((plan.totalRemaining / (plan.monthlyPayment * (plan.remainingPayments + 5))) * 100)}%`
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Calendar */}
      {upcomingPayments.length > 0 && (
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
          <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-400" />
            Upcoming Payments
          </h4>

          <div className="space-y-3">
            {upcomingPayments.slice(0, 6).map((payment, index) => (
              <motion.div
                key={`${payment.planId}-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex flex-col items-center justify-center">
                    <div className="text-blue-400 font-bold text-lg">
                      {payment.date.getDate()}
                    </div>
                    <div className="text-blue-400/60 text-xs">
                      {payment.date.toLocaleDateString('en-MY', { month: 'short' })}
                    </div>
                  </div>
                  <div>
                    <div className="text-white font-semibold">{payment.tripName}</div>
                    <div className="text-white/60 text-sm">Monthly installment</div>
                  </div>
                </div>
                <div className="text-xl font-bold text-white">
                  RM {payment.amount.toLocaleString()}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
