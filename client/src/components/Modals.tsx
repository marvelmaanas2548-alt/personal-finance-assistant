import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  IncomeCategory,
  ExpenseCategory,
  GoalCategory,
  InvestmentType,
  LoanType,
  BillCategory
} from '../types';
import { X, Plus, Save } from 'lucide-react';

// Income Modal
export const IncomeModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { addIncome } = useFinance();
  const [category, setCategory] = useState<IncomeCategory>('Salary');
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !source) return;
    addIncome({ category, amount: Number(amount), source, date, notes });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 border border-slate-200 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-600" /> Add Income Entry
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Income Category</label>
            <select value={category} onChange={e => setCategory(e.target.value as IncomeCategory)} className="w-full glass-input px-3 py-2 rounded-xl text-sm">
              {['Salary', 'Freelance', 'Rental', 'Business', 'Interest', 'Investments', 'Others'].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Source / Description</label>
            <input type="text" placeholder="e.g. Monthly Tech Base Salary" value={source} onChange={e => setSource(e.target.value)} className="w-full glass-input px-3 py-2 rounded-xl text-sm" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Amount</label>
              <input type="number" placeholder="e.g. 50000" value={amount} onChange={e => setAmount(e.target.value)} className="w-full glass-input px-3 py-2 rounded-xl text-sm" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Date Received</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full glass-input px-3 py-2 rounded-xl text-sm" required />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Notes (Optional)</label>
            <textarea placeholder="Additional details..." value={notes} onChange={e => setNotes(e.target.value)} className="w-full glass-input px-3 py-2 rounded-xl text-sm h-20" />
          </div>
          <button type="submit" className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> Save Income
          </button>
        </form>
      </div>
    </div>
  );
};

// Expense Modal
export const ExpenseModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { addExpense } = useFinance();
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const categories: ExpenseCategory[] = ['Food', 'Shopping', 'Fuel', 'Electricity', 'Water', 'Mobile Recharge', 'Internet', 'Insurance', 'EMI', 'Entertainment', 'Medical', 'Travel', 'Education', 'Miscellaneous'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !title) return;
    addExpense({ category, title, amount: Number(amount), date, notes });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 border border-slate-200 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Plus className="w-5 h-5 text-rose-500" /> Record New Expense
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Expense Category (14 Options)</label>
            <select value={category} onChange={e => setCategory(e.target.value as ExpenseCategory)} className="w-full glass-input px-3 py-2 rounded-xl text-sm">
              {categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Expense Title / Merchant</label>
            <input type="text" placeholder="e.g. Supermarket Grocery Cart" value={title} onChange={e => setTitle(e.target.value)} className="w-full glass-input px-3 py-2 rounded-xl text-sm" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Amount</label>
              <input type="number" placeholder="e.g. 2500" value={amount} onChange={e => setAmount(e.target.value)} className="w-full glass-input px-3 py-2 rounded-xl text-sm" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Expense Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full glass-input px-3 py-2 rounded-xl text-sm" required />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Notes</label>
            <textarea placeholder="Optional notes..." value={notes} onChange={e => setNotes(e.target.value)} className="w-full glass-input px-3 py-2 rounded-xl text-sm h-20" />
          </div>
          <button type="submit" className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold shadow-md shadow-rose-600/20 transition flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> Save Expense
          </button>
        </form>
      </div>
    </div>
  );
};

// Budget Modal
export const BudgetModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { setBudget } = useFinance();
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [limitAmount, setLimitAmount] = useState('');

  if (!isOpen) return null;

  const categories: ExpenseCategory[] = ['Food', 'Shopping', 'Fuel', 'Electricity', 'Water', 'Mobile Recharge', 'Internet', 'Insurance', 'EMI', 'Entertainment', 'Medical', 'Travel', 'Education', 'Miscellaneous'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!limitAmount) return;
    setBudget(category, Number(limitAmount));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 border border-slate-200 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-slate-800">Set Monthly Category Budget</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Select Category</label>
            <select value={category} onChange={e => setCategory(e.target.value as ExpenseCategory)} className="w-full glass-input px-3 py-2 rounded-xl text-sm">
              {categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Monthly Budget Limit (e.g. ₹8,000)</label>
            <input type="number" placeholder="e.g. 8000" value={limitAmount} onChange={e => setLimitAmount(e.target.value)} className="w-full glass-input px-3 py-2 rounded-xl text-sm" required />
          </div>
          <button type="submit" className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> Save Budget Limit
          </button>
        </form>
      </div>
    </div>
  );
};
