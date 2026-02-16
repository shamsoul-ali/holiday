'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Users,
  Briefcase,
  Shield
} from 'lucide-react'
import {
  calculateDTI,
  calculateDisposableIncome,
  assessRisk,
  type FinancialProfile
} from '../../lib/bnpl/risk-calculator'

interface AffordabilityCalculatorProps {
  tripAmount?: number
  onAffordabilityChange?: (canAfford: boolean, maxPayment: number) => void
}

export default function AffordabilityCalculator({
  tripAmount = 0,
  onAffordabilityChange
}: AffordabilityCalculatorProps) {
  // Form state
  const [monthlyIncome, setMonthlyIncome] = useState<number>(5000)
  const [existingDebts, setExistingDebts] = useState<number>(1000)
  const [dependents, setDependents] = useState<number>(0)
  const [employmentType, setEmploymentType] = useState<FinancialProfile['employmentType']>('permanent')
  const [employmentDuration, setEmploymentDuration] = useState<number>(24)
  const [hasEmergencyFund, setHasEmergencyFund] = useState<boolean>(false)

  // Calculated values
  const [dti, setDTI] = useState<number>(0)
  const [disposableIncome, setDisposableIncome] = useState<number>(0)
  const [affordablePayment, setAffordablePayment] = useState<number>(0)
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high' | 'very-high'>('low')

  useEffect(() => {
    const profile: FinancialProfile = {
      monthlyIncome,
      existingMonthlyDebts: existingDebts,
      employmentType,
      employmentDuration,
      age: 30, // Default
      dependents,
      hasEmergencyFund
    }

    const calculatedDTI = calculateDTI(monthlyIncome, existingDebts)
    const disposable = calculateDisposableIncome(profile)
    const affordable = Math.min(disposable * 0.3, monthlyIncome * 0.3)

    // Assess risk if trip amount is provided
    let risk: 'low' | 'medium' | 'high' | 'very-high' = 'low'
    if (tripAmount > 0) {
      const monthlyPayment = tripAmount / 12 // Assume 12 months
      const assessment = assessRisk(profile, monthlyPayment)
      risk = assessment.riskLevel
    }

    setDTI(calculatedDTI)
    setDisposableIncome(disposable)
    setAffordablePayment(affordable)
    setRiskLevel(risk)

    onAffordabilityChange?.(affordable > 0, affordable)
  }, [monthlyIncome, existingDebts, dependents, employmentType, employmentDuration, hasEmergencyFund, tripAmount, onAffordabilityChange])

  const getDTIColor = () => {
    if (dti <= 30) return 'text-green-400'
    if (dti <= 40) return 'text-yellow-400'
    if (dti <= 50) return 'text-orange-400'
    return 'text-red-400'
  }

  const getDTILabel = () => {
    if (dti <= 30) return 'Excellent'
    if (dti <= 40) return 'Good'
    if (dti <= 50) return 'Caution'
    return 'High Risk'
  }

  const getRiskColor = () => {
    switch (riskLevel) {
      case 'low': return 'bg-green-500'
      case 'medium': return 'bg-yellow-500'
      case 'high': return 'bg-orange-500'
      case 'very-high': return 'bg-red-500'
    }
  }

  const getDTIWidth = () => {
    return Math.min(100, dti)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-white/10 rounded-3xl p-8"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Affordability Calculator</h3>
            <p className="text-white/60 text-sm">Calculate your maximum affordable monthly payment</p>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Monthly Income */}
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Monthly Income (RM)
          </label>
          <div className="relative">
            <input
              type="number"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(parseFloat(e.target.value) || 0)}
              className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="5000"
              min="0"
              step="100"
            />
          </div>
        </div>

        {/* Existing Debts */}
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Existing Monthly Debts (RM)
          </label>
          <input
            type="number"
            value={existingDebts}
            onChange={(e) => setExistingDebts(parseFloat(e.target.value) || 0)}
            className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="1000"
            min="0"
            step="100"
          />
        </div>

        {/* Dependents */}
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            <Users className="w-4 h-4 inline mr-2" />
            Number of Dependents
          </label>
          <input
            type="number"
            value={dependents}
            onChange={(e) => setDependents(parseInt(e.target.value) || 0)}
            className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0"
            min="0"
            max="10"
          />
        </div>

        {/* Employment Type */}
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            <Briefcase className="w-4 h-4 inline mr-2" />
            Employment Type
          </label>
          <select
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value as FinancialProfile['employmentType'])}
            className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="permanent">Permanent</option>
            <option value="contract">Contract</option>
            <option value="self-employed">Self-Employed</option>
            <option value="part-time">Part-Time</option>
          </select>
        </div>

        {/* Emergency Fund */}
        <div className="md:col-span-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hasEmergencyFund}
              onChange={(e) => setHasEmergencyFund(e.target.checked)}
              className="w-5 h-5 rounded bg-black/30 border border-white/20 text-blue-500 focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-white/80">
              <Shield className="w-4 h-4 inline mr-2" />
              I have an emergency fund (3-6 months expenses)
            </span>
          </label>
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-6">
        {/* DTI Ratio */}
        <div className="bg-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-white font-semibold mb-1">Debt-to-Income Ratio</h4>
              <p className="text-white/60 text-sm">Current: <span className={`font-bold ${getDTIColor()}`}>{dti.toFixed(1)}%</span></p>
            </div>
            <div className={`px-4 py-2 rounded-xl ${getDTIColor()} bg-white/10`}>
              {getDTILabel()}
            </div>
          </div>

          {/* DTI Progress Bar */}
          <div className="relative h-4 bg-black/30 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${getDTIWidth()}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full ${
                dti <= 30 ? 'bg-green-500' :
                dti <= 40 ? 'bg-yellow-500' :
                dti <= 50 ? 'bg-orange-500' :
                'bg-red-500'
              }`}
            />
          </div>

          {/* DTI Markers */}
          <div className="flex justify-between mt-2 text-xs text-white/40">
            <span>0%</span>
            <span>30% (Good)</span>
            <span>50% (Limit)</span>
            <span>100%</span>
          </div>
        </div>

        {/* Disposable Income */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <h4 className="text-white/80 text-sm">Disposable Income</h4>
            </div>
            <p className="text-3xl font-bold text-white">
              RM {disposableIncome.toLocaleString()}
            </p>
            <p className="text-white/40 text-xs mt-1">After debts & expenses</p>
          </div>

          <div className="bg-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-blue-400" />
              <h4 className="text-white/80 text-sm">Max Monthly Payment</h4>
            </div>
            <p className="text-3xl font-bold text-white">
              RM {affordablePayment.toLocaleString()}
            </p>
            <p className="text-white/40 text-xs mt-1">Safe borrowing limit</p>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            {dti <= 40 ? (
              <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
            )}
            <div>
              <h4 className="text-white font-semibold mb-2">
                {dti <= 30 ? 'Excellent Financial Position!' :
                 dti <= 40 ? 'Good to Proceed' :
                 dti <= 50 ? 'Proceed with Caution' :
                 'Consider Reducing Debt'}
              </h4>
              <ul className="text-white/80 text-sm space-y-1">
                {dti <= 30 && (
                  <>
                    <li>• You have healthy financial capacity for BNPL</li>
                    <li>• Consider shorter tenure to save on interest</li>
                  </>
                )}
                {dti > 30 && dti <= 40 && (
                  <>
                    <li>• You can proceed, but monitor your budget carefully</li>
                    <li>• Maintain emergency fund for unexpected expenses</li>
                  </>
                )}
                {dti > 40 && dti <= 50 && (
                  <>
                    <li>• Your DTI is near the limit - consider longer tenure</li>
                    <li>• Try to reduce existing debts before taking new commitment</li>
                  </>
                )}
                {dti > 50 && (
                  <>
                    <li>• Your DTI exceeds safe limits - approval unlikely</li>
                    <li>• Focus on reducing existing debts first</li>
                    <li>• Consider increasing down payment to reduce monthly burden</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
