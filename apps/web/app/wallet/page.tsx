'use client';

import { useState, useEffect } from 'react';
import { Wallet, TrendingUp, Target, Plus, ArrowUpRight, ArrowDownRight, DollarSign } from 'lucide-react';
import Navigation from '@/components/Navigation';

/**
 * Holiday AI - Wallet Dashboard Page
 * Path: /wallet
 * Description: User's digital wallet with balance, transactions, and savings goals
 */

interface WalletData {
  id: string;
  balance: number;
  currency: string;
  status: string;
  totalTransactions: number;
  totalCredits: number;
  totalDebits: number;
}

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  category: string;
  amount: number;
  description: string;
  createdAt: string;
}

interface SavingsGoal {
  id: string;
  goalName: string;
  targetAmount: number;
  currentAmount: number;
  progressPercentage: number;
  targetDate: string;
  daysRemaining: number;
}

export default function WalletPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'savings'>('overview');

  useEffect(() => {
    fetchWalletData();
    fetchSavingsGoals();
  }, []);

  const fetchWalletData = async () => {
    try {
      const response = await fetch('/api/wallet', {
        headers: {
          'x-user-id': 'user123' // TODO: Get from auth context
        }
      });

      if (response.ok) {
        const result = await response.json();
        setWallet(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavingsGoals = async () => {
    try {
      const response = await fetch('/api/wallet/savings', {
        headers: {
          'x-user-id': 'user123'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setSavingsGoals(result.data.goals);
      }
    } catch (error) {
      console.error('Failed to fetch savings goals:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Wallet</h1>
          <p className="text-gray-600">Manage your travel funds and savings goals</p>
        </div>

        {/* Wallet Balance Card */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white mb-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <p className="text-white/80 text-sm">Total Balance</p>
                <h2 className="text-4xl font-bold">
                  {wallet?.currency} {wallet?.balance.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                </h2>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-sm">Status</p>
              <span className="inline-block bg-green-400 text-green-900 px-3 py-1 rounded-full text-sm font-semibold">
                {wallet?.status}
              </span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/20">
            <div>
              <p className="text-white/80 text-sm mb-1">Total Credits</p>
              <p className="text-xl font-semibold flex items-center gap-1">
                <ArrowUpRight className="w-4 h-4 text-green-300" />
                {wallet?.currency} {wallet?.totalCredits.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-white/80 text-sm mb-1">Total Debits</p>
              <p className="text-xl font-semibold flex items-center gap-1">
                <ArrowDownRight className="w-4 h-4 text-red-300" />
                {wallet?.currency} {wallet?.totalDebits.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-white/80 text-sm mb-1">Transactions</p>
              <p className="text-xl font-semibold">{wallet?.totalTransactions}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6">
            <button className="flex-1 bg-white text-indigo-600 py-3 px-6 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
              <Plus className="w-5 h-5" />
              Top Up
            </button>
            <button className="flex-1 bg-white/20 backdrop-blur-sm text-white py-3 px-6 rounded-xl font-semibold hover:bg-white/30 transition-colors">
              Withdraw
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['overview', 'transactions', 'savings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-3 rounded-xl font-semibold capitalize transition-colors ${
                activeTab === tab
                  ? 'bg-white text-indigo-600 shadow-md'
                  : 'bg-white/50 text-gray-600 hover:bg-white/80'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'overview' && <OverviewTab savingsGoals={savingsGoals} />}
        {activeTab === 'transactions' && <TransactionsTab />}
        {activeTab === 'savings' && <SavingsTab goals={savingsGoals} />}
        </div>
      </div>
    </>
  );
}

// =====================================================
// Tab Components
// =====================================================

function OverviewTab({ savingsGoals }: { savingsGoals: SavingsGoal[] }) {
  const totalSaved = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalTarget = savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Savings Overview */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-green-100 p-3 rounded-xl">
            <Target className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Savings Goals</h3>
            <p className="text-gray-600 text-sm">{savingsGoals.length} active goals</p>
          </div>
        </div>

        <div className="space-y-4">
          {savingsGoals.slice(0, 3).map((goal) => (
            <div key={goal.id} className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{goal.goalName}</h4>
                <span className="text-sm text-gray-600">{goal.daysRemaining} days left</span>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">
                    MYR {goal.currentAmount.toLocaleString()} / {goal.targetAmount.toLocaleString()}
                  </span>
                  <span className="font-semibold text-indigo-600">
                    {goal.progressPercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(goal.progressPercentage, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                <button className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold">
                  Contribute →
                </button>
              </div>
            </div>
          ))}
        </div>

        {savingsGoals.length > 3 && (
          <button className="w-full mt-4 text-center text-indigo-600 hover:text-indigo-700 font-semibold py-2">
            View all goals →
          </button>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow text-left">
          <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
            <Plus className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Create Savings Goal</h3>
          <p className="text-sm text-gray-600">Start saving for your next trip</p>
        </button>

        <button className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow text-left">
          <div className="bg-purple-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
            <DollarSign className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Apply for Travel Loan</h3>
          <p className="text-sm text-gray-600">Get financing for your dream trip</p>
        </button>
      </div>
    </div>
  );
}

function TransactionsTab() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Transactions</h3>
      <div className="space-y-4">
        {/* Empty state */}
        <div className="text-center py-12">
          <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 mb-2">No transactions yet</p>
          <p className="text-sm text-gray-500">Your transaction history will appear here</p>
        </div>
      </div>
    </div>
  );
}

function SavingsTab({ goals }: { goals: SavingsGoal[] }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">All Savings Goals</h3>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Goal
          </button>
        </div>

        {goals.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 mb-2">No savings goals yet</p>
            <p className="text-sm text-gray-500 mb-6">Create your first savings goal to start planning your dream trip</p>
            <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
              Create First Goal
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => (
              <div key={goal.id} className="border border-gray-200 rounded-xl p-6 hover:border-indigo-300 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-1">{goal.goalName}</h4>
                    <p className="text-sm text-gray-600">Target: {new Date(goal.targetDate).toLocaleDateString()}</p>
                  </div>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                    {goal.daysRemaining} days
                  </span>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">
                      MYR {goal.currentAmount.toLocaleString()} / {goal.targetAmount.toLocaleString()}
                    </span>
                    <span className="font-semibold text-indigo-600">
                      {goal.progressPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 h-3 rounded-full transition-all"
                      style={{ width: `${Math.min(goal.progressPercentage, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
                    Contribute
                  </button>
                  <button className="bg-gray-100 text-gray-700 py-2 px-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
