import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';
import { PageView } from '../components/Sidebar';
import { TrendingUp, TrendingDown, PiggyBank, LineChart, CalendarCheck, AlertTriangle, ArrowUpRight, Sparkles, PlusCircle, Plus, Bot, ShieldCheck, HeartHandshake } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardPageProps {
  setActiveView: (view: PageView) => void;
  onOpenIncomeModal: () => void;
  onOpenExpenseModal: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ setActiveView, onOpenIncomeModal, onOpenExpenseModal }) => {
  const { user } = useAuth();
  const { totalIncome, totalExpense, totalSavings, savingsRate, totalInvestmentValue, expenses, bills, budgets } = useFinance();
  const currency = user?.preferredCurrency || '₹';

  const chartData = [
    { month: 'Mar', Income: 130000, Expenses: 68000, Savings: 62000 },
    { month: 'Apr', Income: 140000, Expenses: 72000, Savings: 68000 },
    { month: 'May', Income: 135000, Expenses: 65000, Savings: 70000 },
    { month: 'Jun', Income: 155000, Expenses: 81000, Savings: 74000 },
    { month: 'Jul', Income: 148000, Expenses: 71000, Savings: 77000 },
    { month: 'Aug', Income: totalIncome, Expenses: totalExpense, Savings: totalSavings }
  ];

  const budgetAlerts = budgets.filter(b => {
    const spent = expenses.filter(e => e.category === b.category).reduce((sum, e) => sum + Number(e.amount), 0);
    return (spent / b.limitAmount) >= 0.8;
  });
  const pendingBills = bills.filter(b => !b.isPaid);

  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner */}
      <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" /> AI Personal Finance Buddy
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Welcome back, {user?.name || 'User'}!</h2>
          <p className="text-xs text-gray-500 mt-1 max-w-xl">
            You're currently saving <span className="text-emerald-600 font-bold">{savingsRate}%</span> of your income. Segment Profile: <span className="text-indigo-600 font-semibold">{user?.occupation || 'Working Professional'}</span>.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onOpenIncomeModal} className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-200 transition flex items-center gap-2"><PlusCircle className="w-4 h-4" /> Add Income</button>
          <button onClick={onOpenExpenseModal} className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-200 transition flex items-center gap-2"><Plus className="w-4 h-4" /> Record Expense</button>
        </div>
      </div>

      {/* Top 4 Hero Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div onClick={() => setActiveView('income')} className="glass-card p-5 rounded-2xl cursor-pointer">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500">Monthly Income</span>
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600"><TrendingUp className="w-4 h-4" /></div>
          </div>
          <div className="text-2xl font-extrabold text-gray-800">{formatCurrency(totalIncome, currency)}</div>
          <div className="flex items-center justify-between text-[11px] text-gray-400 mt-2">
            <span>Annualized: {formatCurrency(totalIncome * 12, currency)}</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-0.5">+12.4% <ArrowUpRight className="w-3 h-3" /></span>
          </div>
        </div>

        <div onClick={() => setActiveView('expenses')} className="glass-card p-5 rounded-2xl cursor-pointer">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500">Monthly Expenses</span>
            <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-500"><TrendingDown className="w-4 h-4" /></div>
          </div>
          <div className="text-2xl font-extrabold text-gray-800">{formatCurrency(totalExpense, currency)}</div>
          <div className="flex items-center justify-between text-[11px] text-gray-400 mt-2">
            <span>14 Categories tracked</span>
            <span className="text-rose-500 font-semibold">{expenses.length} Records</span>
          </div>
        </div>

        <div onClick={() => setActiveView('savings')} className="glass-card p-5 rounded-2xl cursor-pointer">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500">Net Savings</span>
            <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600"><PiggyBank className="w-4 h-4" /></div>
          </div>
          <div className="text-2xl font-extrabold text-indigo-600">{formatCurrency(totalSavings, currency)}</div>
          <div className="flex items-center justify-between text-[11px] text-gray-400 mt-2">
            <span>Savings Rate</span>
            <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">{savingsRate}%</span>
          </div>
        </div>

        <div onClick={() => setActiveView('investments')} className="glass-card p-5 rounded-2xl cursor-pointer">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500">Investments Portfolio</span>
            <div className="p-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-600"><LineChart className="w-4 h-4" /></div>
          </div>
          <div className="text-2xl font-extrabold text-purple-700">{formatCurrency(totalInvestmentValue, currency)}</div>
          <div className="flex items-center justify-between text-[11px] text-gray-400 mt-2">
            <span>7 Asset classes</span>
            <span className="text-emerald-600 font-semibold">+18.5% Returns</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Chart & Quick Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-gray-800">Financial Cash Flow Trend</h3>
              <p className="text-xs text-gray-400">Income vs Expenses over time (Financial Forecasting)</p>
            </div>
            <button onClick={() => setActiveView('analytics')} className="text-xs text-indigo-600 hover:underline font-semibold flex items-center gap-1">Full Analytics →</button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} /><stop offset="95%" stopColor="#f43f5e" stopOpacity={0} /></linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} /><YAxis stroke="#94a3b8" fontSize={11} tickFormatter={val => `${val / 1000}k`} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} formatter={(val: any) => [`${currency}${val.toLocaleString()}`, '']} />
                <Area type="monotone" dataKey="Income" stroke="#10b981" fillOpacity={1} fill="url(#colorInc)" strokeWidth={2} />
                <Area type="monotone" dataKey="Expenses" stroke="#f43f5e" fillOpacity={1} fill="url(#colorExp)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel p-5 rounded-3xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" /> Budget Alerts</h3>
              <button onClick={() => setActiveView('budget')} className="text-[11px] text-indigo-600 hover:underline">Manage</button>
            </div>
            {budgetAlerts.length === 0 ? (
              <p className="text-xs text-gray-400 py-2">All budgets are well within limits!</p>
            ) : (
              <div className="space-y-3">
                {budgetAlerts.slice(0, 3).map(b => {
                  const spent = expenses.filter(e => e.category === b.category).reduce((sum, e) => sum + Number(e.amount), 0);
                  const pct = Math.round((spent / b.limitAmount) * 100);
                  return (
                    <div key={b.id} className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-gray-700">{b.category}</span>
                        <span className={pct >= 100 ? 'text-rose-600 font-bold' : 'text-amber-600 font-bold'}>{pct}% Used</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${pct >= 100 ? 'bg-rose-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(100, pct)}%` }} />
                      </div>
                      <div className="flex justify-between text-[10px] text-gray-400 mt-1.5">
                        <span>Spent: {formatCurrency(spent, currency)}</span>
                        <span>Limit: {formatCurrency(b.limitAmount, currency)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="glass-panel p-5 rounded-3xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2"><CalendarCheck className="w-4 h-4 text-indigo-600" /> Pending Bills</h3>
              <button onClick={() => setActiveView('bills')} className="text-[11px] text-indigo-600 hover:underline">View All ({pendingBills.length})</button>
            </div>
            <div className="space-y-2.5">
              {pendingBills.slice(0, 3).map(b => (
                <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <div><div className="text-xs font-semibold text-gray-700">{b.title}</div><div className="text-[10px] text-gray-400">Due: {b.dueDate}</div></div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-gray-800">{formatCurrency(b.amount, currency)}</div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-200 font-semibold">Unpaid</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
