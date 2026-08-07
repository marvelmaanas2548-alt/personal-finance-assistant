import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';
import { exportToPDF, exportToExcel, exportToCSV } from '../utils/exportUtils';
import { FileSpreadsheet, FileText, Download, TrendingUp, TrendingDown, PiggyBank, LineChart } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const {
    incomes,
    expenses,
    budgets,
    investments,
    totalIncome,
    totalExpense,
    totalSavings,
    savingsRate
  } = useFinance();

  const [reportType, setReportType] = useState<'weekly' | 'monthly' | 'annual'>('monthly');

  const currency = user?.preferredCurrency || '₹';

  const exportData = {
    reportType,
    userEmail: user?.email || 'alex.morgan@finance.io',
    currency,
    incomes,
    expenses,
    budgets,
    investments,
    totalIncome,
    totalExpense,
    totalSavings,
    savingsRate: savingsRate.toString()
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" /> Financial Reports & Export Center
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Generate comprehensive Weekly, Monthly, and Annual statements with PDF, Excel, and CSV downloads</p>
        </div>

        {/* Report Period Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
          {(['weekly', 'monthly', 'annual'] as const).map(type => (
            <button
              key={type}
              onClick={() => setReportType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                reportType === type
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Export Action Buttons */}
      <div className="glass-panel p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-indigo-50 via-white to-purple-50">
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Export {reportType.toUpperCase()} Financial Statement
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Download your full audit record including Incomes, Expenses, Budgets, and Investment portfolio
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => exportToPDF(exportData)}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-600/20 transition flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" /> Export PDF
          </button>
          <button
            onClick={() => exportToExcel(exportData)}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export Excel (.xlsx)
          </button>
          <button
            onClick={() => exportToCSV(exportData)}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Statement Preview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-medium">Total Income</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">
            {formatCurrency(totalIncome, currency)}
          </div>
          <span className="text-[10px] text-slate-400">{incomes.length} Income items</span>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-medium">Total Expenses</span>
            <TrendingDown className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold text-rose-600">
            {formatCurrency(totalExpense, currency)}
          </div>
          <span className="text-[10px] text-slate-400">{expenses.length} Expense records</span>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-medium">Net Savings</span>
            <PiggyBank className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-600">
            {formatCurrency(totalSavings, currency)}
          </div>
          <span className="text-[10px] text-slate-400">Savings Rate: {savingsRate}%</span>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-medium">Investments Value</span>
            <LineChart className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-purple-700">
            {formatCurrency(investments.reduce((s, i) => s + Number(i.currentValue), 0), currency)}
          </div>
          <span className="text-[10px] text-slate-400">{investments.length} Active holdings</span>
        </div>
      </div>
    </div>
  );
};
