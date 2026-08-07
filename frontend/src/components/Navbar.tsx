import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { useTheme } from '../context/ThemeContext';
import { NotificationCenter } from './NotificationCenter';
import { Bell, Search, Sparkles, LogOut, Wallet, Sun, Moon, Menu } from 'lucide-react';

interface NavbarProps {
  onOpenProfile: () => void;
  onOpenAi: () => void;
  onToggleMobileSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenProfile, onOpenAi, onToggleMobileSidebar }) => {
  const { user, logout } = useAuth();
  const { notifications } = useFinance();
  const { theme, toggleTheme } = useTheme();
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between shadow-sm transition-colors">
      {/* Mobile Hamburger Toggle + Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 transition"
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search incomes, expenses..."
            className="w-full glass-input pl-9 pr-3 py-1.5 md:py-2 rounded-xl text-xs md:text-sm placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Light / Dark Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          className="p-2 md:p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-amber-400 transition"
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4 text-indigo-600" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400" />
          )}
        </button>

        {/* Preferred Currency Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <Wallet className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Currency: {user?.preferredCurrency || '₹'}</span>
        </div>

        {/* AI Financial Copilot Button */}
        <button
          onClick={onOpenAi}
          className="flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition transform hover:-translate-y-0.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          <span className="hidden sm:inline">AI Advisor</span>
          <span className="sm:hidden">AI</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 transition relative"
          >
            <Bell className="w-4 h-4 md:w-5 md:h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-rose-500 text-white text-[9px] md:text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-slate-950 animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>
          <NotificationCenter isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
        </div>

        {/* User Profile Menu */}
        <div className="flex items-center gap-2 md:gap-3 pl-2 border-l border-slate-200 dark:border-slate-800">
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 hover:opacity-85 transition group"
          >
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
              alt={user?.name}
              className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover border-2 border-indigo-500/40"
            />
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 transition">
                {user?.name || 'User'}
              </div>
              <div className="text-[10px] text-slate-400">{user?.occupation || 'Member'}</div>
            </div>
          </button>

          <button
            onClick={logout}
            title="Logout"
            className="p-1.5 md:p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
