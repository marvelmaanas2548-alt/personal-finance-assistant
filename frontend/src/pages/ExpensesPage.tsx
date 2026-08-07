import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { ExpenseCategory } from '../types';
import { CreditCard, Plus, Search, Trash2, Filter, PieChart } from 'lucide-react';

interface ExpensesPageProps { onOpenExpenseModal: () => void; }

export const ExpensesPage: React.FC<ExpensesPageProps> = ({ onOpenExpenseModal }) => {
  const { user } = useAuth();
  const { expenses, deleteExpense, totalExpense } = useFinance();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const currency = user?.preferredCurrency || '₹';
  const categories: (ExpenseCategory | 'All')[] = ['All', 'Food', 'Shopping', 'Fuel', 'Electricity', 'Water', 'Mobile Recharge', 'Internet', 'Insurance', 'EMI', 'Entertainment', 'Medical', 'Travel', 'Education', 'Miscellaneous'];
  const filteredExpenses = expenses.filter(e => { const mc = selectedCategory === 'All' || e.category === selectedCategory; const ms = e.title.toLowerCase().includes(searchTerm.toLowerCase()) || e.category.toLowerCase().includes(searchTerm.toLowerCase()) || (e.notes && e.notes.toLowerCase().includes(searchTerm.toLowerCase())); return mc && ms; });
  const categoryTotals: Record<string, number> = {};
  expenses.forEach(e => { categoryTotals[e.category] = (categoryTotals[e.category] || 0) + Number(e.amount); });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><CreditCard className="w-5 h-5 text-rose-500" /> Expense Tracking (14 Categories)</h2><p className="text-xs text-slate-500 mt-0.5">Filter, search, and manage all spending categories</p></div>
        <button onClick={onOpenExpenseModal} className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-600/20 transition flex items-center gap-2"><Plus className="w-4 h-4" /> Record New Expense</button>
      </div>
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="relative w-full md:w-80"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" placeholder="Search by title, category or notes..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full glass-input pl-9 pr-4 py-2 rounded-xl text-xs" /></div>
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">{categories.map(cat => (<button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold whitespace-nowrap transition ${selectedCategory === cat ? 'bg-rose-600 text-white shadow-md' : 'bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-700'}`}>{cat}</button>))}</div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {Object.entries(categoryTotals).slice(0, 7).map(([cat, total]) => (<div key={cat} className="glass-card p-3 rounded-2xl"><div className="text-[10px] text-slate-500 font-medium truncate">{cat}</div><div className="text-sm font-bold text-slate-800 mt-1">{formatCurrency(total, currency)}</div></div>))}
      </div>
      <div className="glass-panel rounded-3xl overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between"><h3 className="text-sm font-bold text-slate-800">Recorded Expenses ({filteredExpenses.length})</h3><span className="text-xs text-rose-600 font-bold">Total: {formatCurrency(filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0), currency)}</span></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200"><tr><th className="p-4">Category</th><th className="p-4">Title / Merchant</th><th className="p-4">Date</th><th className="p-4">Amount</th><th className="p-4 text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-slate-100">{filteredExpenses.length === 0 ? (<tr><td colSpan={5} className="p-8 text-center text-slate-400">No expense records found.</td></tr>) : filteredExpenses.map(e => (
              <tr key={e.id} className="hover:bg-slate-50 transition"><td className="p-4"><span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 font-semibold text-[11px]">{e.category}</span></td><td className="p-4 font-semibold text-slate-700">{e.title}{e.notes && <div className="text-[10px] text-slate-400 font-normal">{e.notes}</div>}</td><td className="p-4 text-slate-500">{formatDate(e.date)}</td><td className="p-4 font-extrabold text-rose-600">{formatCurrency(e.amount, currency)}</td><td className="p-4 text-right"><button onClick={() => deleteExpense(e.id)} className="p-1.5 hover:bg-rose-50 hover:text-rose-500 rounded-lg text-slate-400 transition"><Trash2 className="w-4 h-4" /></button></td></tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
