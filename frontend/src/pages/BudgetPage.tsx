import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';
import { PieChart, Plus, AlertTriangle, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';

interface BudgetPageProps {
  onOpenBudgetModal: () => void;
}

export const BudgetPage: React.FC<BudgetPageProps> = ({ onOpenBudgetModal }) => {
  const { user } = useAuth();
  const { budgets, expenses } = useFinance();
  const currency = user?.preferredCurrency || '₹';

  const getStatusBadge = (percentage: number) => {
    if (percentage >= 100) {
      return (
        <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" /> Budget Exceeded
        </span>
      );
    }
    if (percentage >= 80) {
      return (
        <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold flex items-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5" /> 80% Used Alert
        </span>
      );
    }
    if (percentage >= 50) {
      return (
        <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" /> 50% Limit Crossed
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-1">
        <CheckCircle2 className="w-3.5 h-3.5" /> On Track
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-600" /> Budget Management & AI Guardrails
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Automated Budget vs Actual spending alerts triggered at 50%, 80%, and &gt;100%</p>
        </div>
        <button
          onClick={onOpenBudgetModal}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Set Category Budget
        </button>
      </div>

      {/* Budget Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {budgets.map(b => {
          const categorySpent = expenses
            .filter(e => e.category === b.category)
            .reduce((sum, e) => sum + Number(e.amount), 0);
          
          const percentage = Math.round((categorySpent / b.limitAmount) * 100);
          const remaining = b.limitAmount - categorySpent;

          return (
            <div key={b.id} className="glass-card p-6 rounded-3xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-800">{b.category}</h3>
                {getStatusBadge(percentage)}
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Spending Progress</span>
                  <span className="font-bold text-slate-700">{percentage}%</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      percentage >= 100
                        ? 'bg-rose-500'
                        : percentage >= 80
                        ? 'bg-amber-500'
                        : percentage >= 50
                        ? 'bg-indigo-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, percentage)}%` }}
                  />
                </div>
              </div>

              {/* Financial Stats */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400">Actual Spent</span>
                  <div className="font-bold text-slate-800">{formatCurrency(categorySpent, currency)}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Budget Limit</span>
                  <div className="font-bold text-slate-600">{formatCurrency(b.limitAmount, currency)}</div>
                </div>
              </div>

              <div className="text-[11px] font-medium text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex justify-between">
                <span>Remaining Balance:</span>
                <span className={remaining < 0 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                  {formatCurrency(remaining, currency)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
