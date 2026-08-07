import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { BillCategory } from '../types';
import { CalendarCheck, Plus, CheckCircle2, AlertCircle, Clock, Zap, CreditCard, Home, Wifi, Shield } from 'lucide-react';

export const BillReminderPage: React.FC = () => {
  const { user } = useAuth();
  const { bills, addBill, payBill } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<BillCategory>('Electricity');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));

  const currency = user?.preferredCurrency || '₹';

  const getBillIcon = (cat: BillCategory) => {
    switch (cat) {
      case 'Electricity': return <Zap className="w-5 h-5 text-amber-600" />;
      case 'Rent': return <Home className="w-5 h-5 text-emerald-600" />;
      case 'Credit Card': return <CreditCard className="w-5 h-5 text-purple-600" />;
      case 'Internet': return <Wifi className="w-5 h-5 text-cyan-600" />;
      case 'Insurance': return <Shield className="w-5 h-5 text-rose-600" />;
      default: return <CalendarCheck className="w-5 h-5 text-indigo-600" />;
    }
  };

  const handleCreateBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;
    addBill({
      title,
      category,
      amount: Number(amount),
      dueDate
    });
    setIsModalOpen(false);
    setTitle('');
    setAmount('');
  };

  const pendingBills = bills.filter(b => !b.isPaid);
  const paidBills = bills.filter(b => b.isPaid);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-cyan-600" /> Bill Reminders & Scheduled Payments
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Notifications and tracking for Electricity, Rent, Credit Cards, EMIs, Internet, Insurance</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Schedule New Bill
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl">
          <span className="text-xs text-slate-500 font-medium">Pending Unpaid Bills</span>
          <div className="text-2xl font-extrabold text-rose-600 mt-1">
            {formatCurrency(pendingBills.reduce((sum, b) => sum + Number(b.amount), 0), currency)}
          </div>
          <span className="text-[10px] text-slate-400">{pendingBills.length} upcoming bills</span>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <span className="text-xs text-slate-500 font-medium">Completed / Paid Bills</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">
            {formatCurrency(paidBills.reduce((sum, b) => sum + Number(b.amount), 0), currency)}
          </div>
          <span className="text-[10px] text-slate-400">{paidBills.length} settled payments</span>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <span className="text-xs text-slate-500 font-medium">Active Reminders</span>
          <div className="text-2xl font-extrabold text-indigo-600 mt-1">
            {bills.length} Schedule Items
          </div>
          <span className="text-[10px] text-slate-400">Auto-notification enabled</span>
        </div>
      </div>

      {/* Bill List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bills.map(b => (
          <div key={b.id} className="glass-card p-5 rounded-3xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 shrink-0">
                {getBillIcon(b.category)}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">{b.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {b.category}
                  </span>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" /> Due {formatDate(b.dueDate)}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-base font-extrabold text-slate-800">{formatCurrency(b.amount, currency)}</div>
              <div className="mt-2">
                {b.isPaid ? (
                  <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                  </span>
                ) : (
                  <button
                    onClick={() => payBill(b.id)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition"
                  >
                    Mark as Paid
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Bill Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-slate-200 shadow-xl">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Schedule Bill Reminder</h3>
            <form onSubmit={handleCreateBill} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Bill Title</label>
                <input
                  type="text"
                  placeholder="e.g. Torrent Power Utility"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Bill Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as BillCategory)}
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-sm"
                >
                  {['Electricity', 'Rent', 'Credit Card', 'Loan EMI', 'Internet', 'Insurance'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Bill Amount</label>
                  <input
                    type="number"
                    placeholder="e.g. 3500"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full glass-input px-3.5 py-2 rounded-xl text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full glass-input px-3.5 py-2 rounded-xl text-sm"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-cyan-600 text-white text-xs font-semibold shadow-md shadow-cyan-600/20"
                >
                  Save Bill Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
