import React from 'react';
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  PieChart,
  PiggyBank,
  Target,
  TrendingUp,
  Landmark,
  Bell,
  FileText,
  BarChart3,
  Bot,
  User,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export type PageView =
  | 'dashboard'
  | 'income'
  | 'expenses'
  | 'budget'
  | 'savings'
  | 'goals'
  | 'investments'
  | 'loans'
  | 'bills'
  | 'reports'
  | 'analytics'
  | 'ai'
  | 'profile';

interface SidebarProps {
  activeView: PageView;
  setActiveView: (view: PageView) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const menuItems: { id: PageView; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'ai', label: 'AI Advisor', icon: <Bot className="w-4 h-4 text-purple-500" />, badge: 'AI Buddy' },
    { id: 'income', label: 'Income Management', icon: <Wallet className="w-4 h-4" /> },
    { id: 'expenses', label: 'Expense Tracking', icon: <Receipt className="w-4 h-4" /> },
    { id: 'budget', label: 'Budget Guardrails', icon: <PieChart className="w-4 h-4" /> },
    { id: 'savings', label: 'Savings Tracker', icon: <PiggyBank className="w-4 h-4" /> },
    { id: 'goals', label: 'Financial Goals', icon: <Target className="w-4 h-4" /> },
    { id: 'investments', label: 'Investment Portfolio', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'loans', label: 'Loan Manager', icon: <Landmark className="w-4 h-4" /> },
    { id: 'bills', label: 'Bill Reminders', icon: <Bell className="w-4 h-4" /> },
    { id: 'reports', label: 'Reports & Export', icon: <FileText className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics Engine', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'profile', label: 'Profile & Settings', icon: <User className="w-4 h-4" /> }
  ];

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl flex flex-col justify-between p-4 sticky top-0 h-screen z-50 shrink-0 transition-colors">
      {/* Brand Header */}
      <div>
        <div className="flex items-center gap-3 px-2 py-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="font-extrabold text-sm text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-1.5">
              <span>Personalized Finance</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-300 font-bold">AI</span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 mt-0.5">
              <Bot className="w-3 h-3 text-purple-500" />
              <span>Your AI Finance Buddy</span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {menuItems.map(item => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 translate-x-1'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-white' : ''}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Pro Tag */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-100 dark:border-indigo-900/50">
        <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> Business Model
          </span>
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400">Verified</span>
        </div>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">
          AI Budgeting, Forecasting & Personal Advice
        </p>
      </div>
    </aside>
  );
};
