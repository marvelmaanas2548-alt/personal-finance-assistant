import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { Bell, CheckCircle2, AlertTriangle, AlertCircle, Sparkles, X } from 'lucide-react';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const { notifications, markAllNotificationsRead } = useFinance();

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'danger':
        return <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
      default:
        return <Sparkles className="w-5 h-5 text-indigo-500 shrink-0" />;
    }
  };

  return (
    <div className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-slate-800">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-bold bg-rose-100 text-rose-600 border border-rose-200 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllNotificationsRead}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition"
            >
              Mark all read
            </button>
          )}
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            No notifications yet
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              className={`p-4 flex items-start gap-3 transition hover:bg-slate-50 ${
                !n.read ? 'bg-indigo-50/50' : ''
              }`}
            >
              {getSeverityIcon(n.severity)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium text-slate-700 truncate">{n.title}</h4>
                  <span className="text-[10px] text-slate-400 shrink-0">{n.date}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{n.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
