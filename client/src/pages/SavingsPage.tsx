import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';
import { PiggyBank, TrendingUp, Sparkles, Percent } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export const SavingsPage: React.FC = () => {
  const { user } = useAuth();
  const { totalIncome, totalExpense, totalSavings, savingsRate } = useFinance();
  const currency = user?.preferredCurrency || '₹';

  const monthlySavingsData = [
    { month: 'Jan', savings: 55000, rate: 45 },
    { month: 'Feb', savings: 60000, rate: 48 },
    { month: 'Mar', savings: 62000, rate: 47 },
    { month: 'Apr', savings: 68000, rate: 48 },
    { month: 'May', savings: 70000, rate: 51 },
    { month: 'Jun', savings: 74000, rate: 47 },
    { month: 'Jul', savings: 77000, rate: 52 },
    { month: 'Aug', savings: totalSavings, rate: savingsRate }
  ];

  const yearlySavingsData = [
    { year: '2023', totalSavings: 540000 },
    { year: '2024', totalSavings: 720000 },
    { year: '2025', totalSavings: 890000 },
    { year: '2026 (YTD)', totalSavings: totalSavings * 8 + 480000 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <PiggyBank className="w-5 h-5 text-indigo-600" /> Savings Tracker & Analytics
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Calculated using formula: <span className="text-indigo-600 font-semibold">Savings = Income − Expenses</span></p>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-6 rounded-3xl">
          <span className="text-xs text-slate-500 font-medium">Monthly Net Savings</span>
          <div className="text-3xl font-extrabold text-indigo-600 mt-1">
            {formatCurrency(totalSavings, currency)}
          </div>
          <span className="text-[10px] text-slate-400">
            Income ({formatCurrency(totalIncome, currency)}) − Expenses ({formatCurrency(totalExpense, currency)})
          </span>
        </div>

        <div className="glass-card p-6 rounded-3xl">
          <span className="text-xs text-slate-500 font-medium">Savings Rate</span>
          <div className="text-3xl font-extrabold text-emerald-600 mt-1 flex items-center gap-1">
            {savingsRate}% <Percent className="w-5 h-5" />
          </div>
          <span className="text-[10px] text-slate-400">Benchmark target: 30%+ savings</span>
        </div>

        <div className="glass-card p-6 rounded-3xl">
          <span className="text-xs text-slate-500 font-medium">Projected Annual Savings</span>
          <div className="text-3xl font-extrabold text-purple-600 mt-1">
            {formatCurrency(totalSavings * 12, currency)}
          </div>
          <span className="text-[10px] text-slate-400">At current monthly pace</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Savings Trend */}
        <div className="glass-panel p-6 rounded-3xl">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" /> Monthly Savings Trend
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlySavingsData}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={val => `${val/1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  formatter={(val: any) => [`${currency}${val.toLocaleString()}`, 'Savings']}
                />
                <Line type="monotone" dataKey="savings" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Yearly Savings Growth */}
        <div className="glass-panel p-6 rounded-3xl">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" /> Multi-Year Savings Accumulation
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearlySavingsData}>
                <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={val => `${val/100000}L`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  formatter={(val: any) => [`${currency}${val.toLocaleString()}`, 'Total Savings']}
                />
                <Bar dataKey="totalSavings" fill="#7c3aed" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
