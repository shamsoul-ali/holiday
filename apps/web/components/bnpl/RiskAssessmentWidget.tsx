'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Shield,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  Zap
} from 'lucide-react'
import { assessRisk, type FinancialProfile, type RiskAssessment } from '../../lib/bnpl/risk-calculator'

interface RiskAssessmentWidgetProps {
  financialProfile: FinancialProfile
  requestedMonthlyPayment: number
  showDetails?: boolean
}

export default function RiskAssessmentWidget({
  financialProfile,
  requestedMonthlyPayment,
  showDetails = true
}: RiskAssessmentWidgetProps) {
  const assessment: RiskAssessment = useMemo(
    () => assessRisk(financialProfile, requestedMonthlyPayment),
    [financialProfile, requestedMonthlyPayment]
  )

  const getRiskColor = () => {
    switch (assessment.riskLevel) {
      case 'low': return { bg: 'from-green-500/20 to-emerald-500/20', border: 'border-green-500/30', text: 'text-green-400', icon: 'text-green-400' }
      case 'medium': return { bg: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/30', text: 'text-blue-400', icon: 'text-blue-400' }
      case 'high': return { bg: 'from-yellow-500/20 to-orange-500/20', border: 'border-yellow-500/30', text: 'text-yellow-400', icon: 'text-yellow-400' }
      case 'very-high': return { bg: 'from-red-500/20 to-pink-500/20', border: 'border-red-500/30', text: 'text-red-400', icon: 'text-red-400' }
    }
  }

  const colors = getRiskColor()

  const getScoreGrade = () => {
    if (assessment.riskScore >= 80) return 'A+'
    if (assessment.riskScore >= 70) return 'A'
    if (assessment.riskScore >= 60) return 'B'
    if (assessment.riskScore >= 50) return 'C'
    if (assessment.riskScore >= 40) return 'D'
    return 'F'
  }

  return (
    <div className="space-y-6">
      {/* Main Risk Score Card */}
      <div className={`bg-gradient-to-br ${colors.bg} backdrop-blur-sm border ${colors.border} rounded-3xl p-8`}>
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl ${colors.bg} flex items-center justify-center`}>
              <Shield className={`w-6 h-6 ${colors.icon}`} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Risk Assessment</h3>
              <p className="text-white/60 text-sm">Financial health evaluation</p>
            </div>
          </div>

          {/* Approval Status Badge */}
          <div className={`px-4 py-2 rounded-full border-2 flex items-center gap-2 ${
            assessment.approved
              ? 'border-green-500 bg-green-500/20'
              : 'border-red-500 bg-red-500/20'
          }`}>
            {assessment.approved ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-semibold">Approved</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-400 font-semibold">Not Approved</span>
              </>
            )}
          </div>
        </div>

        {/* Risk Score Display */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Score Gauge */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-48 h-48">
              {/* Background Circle */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="16"
                />
                {/* Progress Circle */}
                <motion.circle
                  cx="96"
                  cy="96"
                  r="88"
                  fill="none"
                  stroke={assessment.riskScore >= 70 ? '#10b981' :
                         assessment.riskScore >= 50 ? '#3b82f6' :
                         assessment.riskScore >= 40 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="16"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "0 552" }}
                  animate={{
                    strokeDasharray: `${(assessment.riskScore / 100) * 552} 552`
                  }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>

              {/* Score Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-6xl font-bold text-white">
                  {assessment.riskScore}
                </div>
                <div className={`text-2xl font-bold ${colors.text} mt-1`}>
                  {getScoreGrade()}
                </div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <div className={`text-xl font-bold ${colors.text} mb-1`}>
                {assessment.riskLevel.replace('-', ' ').toUpperCase()} RISK
              </div>
              <div className="text-white/60 text-sm">Credit Risk Score</div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="space-y-4">
            {/* DTI Ratio */}
            <div className="bg-white/5 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-sm">Debt-to-Income Ratio</span>
                <span className={`font-bold ${
                  assessment.debtToIncomeRatio <= 30 ? 'text-green-400' :
                  assessment.debtToIncomeRatio <= 40 ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {assessment.debtToIncomeRatio.toFixed(1)}%
                </span>
              </div>
              <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    assessment.debtToIncomeRatio <= 30 ? 'bg-green-500' :
                    assessment.debtToIncomeRatio <= 40 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(100, assessment.debtToIncomeRatio)}%` }}
                />
              </div>
            </div>

            {/* Max Loan Amount */}
            <div className="bg-white/5 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white/60 text-sm mb-1">Maximum Loan Amount</div>
                  <div className="text-2xl font-bold text-white">
                    RM {assessment.maxLoanAmount.toLocaleString()}
                  </div>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-400" />
              </div>
            </div>

            {/* Affordable Monthly */}
            <div className="bg-white/5 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white/60 text-sm mb-1">Affordable Monthly Payment</div>
                  <div className="text-2xl font-bold text-white">
                    RM {assessment.affordableMonthlyPayment.toLocaleString()}
                  </div>
                </div>
                <Zap className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      {showDetails && (
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
          <h4 className="text-xl font-bold text-white mb-6">Assessment Details</h4>

          {/* Reasons */}
          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
              <div>
                <h5 className="text-white font-semibold mb-2">Key Factors</h5>
                <ul className="space-y-2">
                  {assessment.reasons.map((reason, index) => (
                    <li key={index} className="text-white/80 text-sm flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {assessment.recommendations.length > 0 && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <h5 className="text-blue-400 font-semibold mb-3">Recommendations</h5>
                  <ul className="space-y-2">
                    {assessment.recommendations.map((rec, index) => (
                      <li key={index} className="text-white/80 text-sm flex items-start gap-2">
                        <span className="text-blue-400 mt-1">→</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Score Breakdown */}
          <div className="mt-6">
            <h5 className="text-white font-semibold mb-4">What Affects Your Score?</h5>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-white/80 text-sm font-medium">Positive Factors</span>
                </div>
                <ul className="space-y-1 text-white/60 text-sm">
                  <li>• Low debt-to-income ratio (&lt;30%)</li>
                  <li>• Stable employment history</li>
                  <li>• Good credit score (if available)</li>
                  <li>• Emergency fund maintained</li>
                </ul>
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-white/80 text-sm font-medium">Negative Factors</span>
                </div>
                <ul className="space-y-1 text-white/60 text-sm">
                  <li>• High debt-to-income ratio (&gt;40%)</li>
                  <li>• Short employment duration</li>
                  <li>• Non-permanent employment</li>
                  <li>• No emergency savings</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {assessment.approved ? (
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <div>
                <h4 className="text-green-400 font-bold text-lg">You're Approved!</h4>
                <p className="text-white/80 text-sm">
                  You can proceed with a monthly payment up to RM {assessment.affordableMonthlyPayment.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <XCircle className="w-8 h-8 text-red-400" />
            <div>
              <h4 className="text-red-400 font-bold text-lg">Application Not Approved</h4>
              <p className="text-white/80 text-sm mt-1">
                Please review the recommendations above to improve your financial profile.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
