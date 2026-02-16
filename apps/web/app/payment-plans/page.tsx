'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  CreditCard,
  Calendar,
  TrendingUp,
  Download,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Clock,
  FileText,
  Settings
} from 'lucide-react'
import Link from 'next/link'
import FinancialHealthScore from '../../components/bnpl/FinancialHealthScore'
import FinancialCommitment from '../../components/bnpl/FinancialCommitment'
import { type FinancialProfile } from '../../lib/bnpl/risk-calculator'

export default function PaymentPlansPage() {
  // Mock data - replace with actual data from API/database
  const [activePlans] = useState([
    {
      id: '1',
      tripName: 'Dubai Family Adventure',
      monthlyPayment: 1200,
      remainingPayments: 8,
      nextDueDate: new Date('2025-12-15'),
      totalRemaining: 9600,
      status: 'active' as const,
      tenure: 12,
      paidInstallments: 4,
      totalPaid: 4800,
      bookingRef: 'HAI-20241115ABC'
    },
    {
      id: '2',
      tripName: 'Tokyo Cherry Blossom Tour',
      monthlyPayment: 800,
      remainingPayments: 3,
      nextDueDate: new Date('2025-12-01'),
      totalRemaining: 2400,
      status: 'active' as const,
      tenure: 6,
      paidInstallments: 3,
      totalPaid: 2400,
      bookingRef: 'HAI-20241020XYZ'
    }
  ])

  const financialProfile: FinancialProfile = {
    monthlyIncome: 7000,
    existingMonthlyDebts: 1500,
    employmentType: 'permanent',
    employmentDuration: 36,
    age: 32,
    dependents: 1,
    hasEmergencyFund: true,
    creditScore: 720
  }

  const paymentHistory = {
    totalPayments: 7,
    onTimePayments: 7,
    latePayments: 0,
    missedPayments: 0
  }

  const accountAgeMonths = 18

  const totalMonthlyCommitment = activePlans.reduce((sum, plan) => sum + plan.monthlyPayment, 0)
  const totalRemaining = activePlans.reduce((sum, plan) => sum + plan.totalRemaining, 0)
  const totalPaid = activePlans.reduce((sum, plan) => sum + plan.totalPaid, 0)

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/30 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold mb-4">Payment Plans</h1>
            <p className="text-gray-400 text-lg">
              Manage your Holiday Now Pay Later commitments
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-white/80 text-sm font-medium">Active Plans</h3>
            </div>
            <div className="text-3xl font-bold text-white">{activePlans.length}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-white/80 text-sm font-medium">Monthly Commitment</h3>
            </div>
            <div className="text-3xl font-bold text-white">RM {totalMonthlyCommitment.toLocaleString()}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-white/80 text-sm font-medium">Total Paid</h3>
            </div>
            <div className="text-3xl font-bold text-white">RM {totalPaid.toLocaleString()}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-orange-500/20 to-yellow-500/20 border border-orange-500/30 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-white/80 text-sm font-medium">Total Remaining</h3>
            </div>
            <div className="text-3xl font-bold text-white">RM {totalRemaining.toLocaleString()}</div>
          </motion.div>
        </div>

        {/* Financial Health Score */}
        <div className="mb-12">
          <FinancialHealthScore
            financialProfile={financialProfile}
            paymentHistory={paymentHistory}
            accountAgeMonths={accountAgeMonths}
          />
        </div>

        {/* Financial Commitment Dashboard */}
        <div className="mb-12">
          <FinancialCommitment
            monthlyIncome={financialProfile.monthlyIncome}
            activePlans={activePlans}
          />
        </div>

        {/* Active Plans List */}
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-white/10 rounded-3xl p-8 mb-12">
          <h3 className="text-2xl font-bold text-white mb-6">Active Payment Plans</h3>

          <div className="space-y-6">
            {activePlans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-white mb-2">{plan.tripName}</h4>
                    <div className="flex items-center gap-4 text-sm text-white/60">
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {plan.bookingRef}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {plan.tenure} months plan
                      </span>
                    </div>
                  </div>

                  <div className="px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30">
                    <span className="text-green-400 font-semibold text-sm flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Active
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-6 mb-6">
                  <div>
                    <div className="text-white/60 text-sm mb-1">Monthly Payment</div>
                    <div className="text-2xl font-bold text-white">RM {plan.monthlyPayment.toLocaleString()}</div>
                  </div>

                  <div>
                    <div className="text-white/60 text-sm mb-1">Remaining Payments</div>
                    <div className="text-2xl font-bold text-white">{plan.remainingPayments}</div>
                  </div>

                  <div>
                    <div className="text-white/60 text-sm mb-1">Next Due</div>
                    <div className="text-lg font-bold text-white">
                      {plan.nextDueDate.toLocaleDateString('en-MY', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>

                  <div>
                    <div className="text-white/60 text-sm mb-1">Total Remaining</div>
                    <div className="text-2xl font-bold text-blue-400">RM {plan.totalRemaining.toLocaleString()}</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between text-sm text-white/60 mb-2">
                    <span>Progress: {plan.paidInstallments} / {plan.tenure} payments</span>
                    <span>{Math.round((plan.paidInstallments / plan.tenure) * 100)}%</span>
                  </div>
                  <div className="h-3 bg-black/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                      style={{ width: `${(plan.paidInstallments / plan.tenure) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/30 transition-colors">
                    <Calendar className="w-4 h-4" />
                    View Schedule
                  </button>

                  <button className="flex items-center gap-2 px-4 py-2 bg-white/5 text-white/60 rounded-xl hover:bg-white/10 transition-colors">
                    <Download className="w-4 h-4" />
                    Download Statement
                  </button>

                  <button className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-xl hover:bg-green-500/30 transition-colors">
                    <DollarSign className="w-4 h-4" />
                    Early Settlement
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-3xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Ready for Your Next Adventure?</h3>
          <p className="text-white/80 mb-6">
            Explore new destinations with flexible payment plans
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl font-semibold text-white hover:scale-105 transition-all"
          >
            Plan New Trip
          </Link>
        </div>
      </div>
    </div>
  )
}
