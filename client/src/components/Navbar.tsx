import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { NotificationCenter } from './NotificationCenter';
import { Bell, Search, Sparkles, LogOut, Wallet, Menu } from 'lucide-react';

interface NavbarProps {
  onOpenProfile: () => void;
  onOpenAi: () => void;
  onToggleMobileSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenProfile, onOpenAi, onToggleMobileSidebar }) => {
  const { user, logout } = useAuth();
  const { notifications } = useFinance();
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-16 border-b border-gray-200 bg-white/95 backdrop-blur-md sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between shadow-sm">
      {/* Mobile Hamburger Toggle + Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 hover:text-gray-900 transition"
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search incomes, expenses..."
            className="w-full glass-input pl-9 pr-3 py-1.5 md:py-2 rounded-xl text-xs md:text-sm placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Preferred Currency Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-600">
          <Wallet className="w-3.5 h-3.5 text-indigo-600" />
          <span>Currency: {user?.preferredCurrency || '₹'}</span>
        </div>

        {/* AI Financial Copilot Button */}
        <button
          onClick={onOpenAi}
          className="flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-200 transition transform hover:-translate-y-0.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
          <span className="hidden sm:inline">AI Advisor</span>
          <span className="sm:hidden">AI</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 hover:text-gray-900 transition relative"
          >
            <Bell className="w-4 h-4 md:w-5 md:h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-rose-500 text-white text-[9px] md:text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>
          <NotificationCenter isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
        </div>

        {/* User Profile Menu */}
        <div className="flex items-center gap-2 md:gap-3 pl-2 border-l border-gray-200">
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 hover:opacity-85 transition group"
          >
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
              alt={user?.name}
              className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover border-2 border-indigo-200"
            />
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold text-gray-800 group-hover:text-indigo-600 transition">
                {user?.name || 'User'}
              </div>
              <div className="text-[10px] text-gray-400">{user?.occupation || 'Member'}</div>
            </div>
          </button>

          <button
            onClick={logout}
            title="Logout"
            className="p-1.5 md:p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
