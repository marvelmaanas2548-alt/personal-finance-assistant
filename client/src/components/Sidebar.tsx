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
  ShieldCheck,
  X
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
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isOpen = false, onClose }) => {
  const menuItems: { id: PageView; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'ai', label: 'AI Advisor', icon: <Bot className="w-4 h-4 text-indigo-500" />, badge: 'AI Buddy' },
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

  const handleSelect = (id: PageView) => {
    setActiveView(id);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`w-64 border-r border-gray-200 bg-white flex flex-col justify-between p-4 fixed md:sticky top-0 h-screen z-50 shrink-0 transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="flex items-center justify-between px-2 py-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-extrabold text-sm text-gray-800 tracking-tight flex items-center gap-1.5">
                  <span>Personalized Finance</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-600 font-bold">AI</span>
                </div>
                <div className="text-[10px] text-gray-500 font-medium flex items-center gap-1 mt-0.5">
                  <Bot className="w-3 h-3 text-indigo-500" />
                  <span>Your AI Finance Buddy</span>
                </div>
              </div>
            </div>

            {/* Mobile Close Button */}
            {onClose && (
              <button
                onClick={onClose}
                className="md:hidden p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1 max-h-[calc(100vh-180px)] overflow-y-auto pr-1">
            {menuItems.map(item => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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
                          : 'bg-indigo-50 text-indigo-600 border border-indigo-200'
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
        <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100">
          <div className="flex items-center justify-between text-xs font-bold text-gray-800">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Business Model
            </span>
            <span className="text-[10px] text-indigo-600">Verified</span>
          </div>
          <p className="text-[10px] text-gray-500 mt-1 leading-tight">
            AI Budgeting, Forecasting & Personal Advice
          </p>
        </div>
      </aside>
    </>
  );
};
