import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { IncomeCategory } from '../types';
import { TrendingUp, Plus, Trash2, Calendar, DollarSign, PieChart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface IncomePageProps { onOpenIncomeModal: () => void; }

export const IncomePage: React.FC<IncomePageProps> = ({ onOpenIncomeModal }) => {
  const { user } = useAuth();
  const { incomes, deleteIncome, totalIncome } = useFinance();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const currency = user?.preferredCurrency || '₹';
  const categories: (IncomeCategory | 'All')[] = ['All', 'Salary', 'Freelance', 'Rental', 'Business', 'Interest', 'Investments', 'Others'];
  const filteredIncomes = selectedCategory === 'All' ? incomes : incomes.filter(i => i.category === selectedCategory);
  const categoryTotals: Record<string, number> = {};
  incomes.forEach(i => { categoryTotals[i.category] = (categoryTotals[i.category] || 0) + Number(i.amount); });
  const chartData = Object.entries(categoryTotals).map(([name, amount]) => ({ name, amount }));
  const COLORS = ['#10b981', '#4f46e5', '#7c3aed', '#d97706', '#0891b2', '#db2777', '#64748b'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-emerald-600" /> Income Management</h2><p className="text-xs text-slate-500 mt-0.5">Track, categorize, and analyze your revenue streams</p></div>
        <button onClick={onOpenIncomeModal} className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition flex items-center gap-2"><Plus className="w-4 h-4" /> Add Income Entry</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl"><span className="text-xs text-slate-500">Monthly Total Income</span><div className="text-2xl font-extrabold text-emerald-600 mt-1">{formatCurrency(totalIncome, currency)}</div></div>
        <div className="glass-card p-5 rounded-2xl"><span className="text-xs text-slate-500">Annualized Projected</span><div className="text-2xl font-extrabold text-slate-800 mt-1">{formatCurrency(totalIncome * 12, currency)}</div></div>
        <div className="glass-card p-5 rounded-2xl"><span className="text-xs text-slate-500">Active Revenue Streams</span><div className="text-2xl font-extrabold text-indigo-600 mt-1">{Object.keys(categoryTotals).length} Sources</div></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><PieChart className="w-4 h-4 text-emerald-600" /> Income Breakdown by Category</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}><XAxis dataKey="name" stroke="#94a3b8" fontSize={11} /><YAxis stroke="#94a3b8" fontSize={11} tickFormatter={val => `${val/1000}k`} /><Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '12px' }} formatter={(val: any) => [`${currency}${val.toLocaleString()}`, 'Amount']} /><Bar dataKey="amount" radius={[8, 8, 0, 0]}>{chartData.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Bar></BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass-panel p-5 rounded-3xl space-y-3">
          <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Filter Category</h3>
          <div className="flex flex-wrap gap-2">{categories.map(cat => (<button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${selectedCategory === cat ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-700'}`}>{cat}</button>))}</div>
        </div>
      </div>
      <div className="glass-panel rounded-3xl overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between"><h3 className="text-sm font-bold text-slate-800">Income Records ({filteredIncomes.length})</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200"><tr><th className="p-4">Category</th><th className="p-4">Source</th><th className="p-4">Date</th><th className="p-4">Amount</th><th className="p-4 text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-slate-100">{filteredIncomes.map(item => (
              <tr key={item.id} className="hover:bg-slate-50 transition"><td className="p-4 font-semibold text-emerald-600 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500" />{item.category}</td><td className="p-4 text-slate-700">{item.source}</td><td className="p-4 text-slate-500">{formatDate(item.date)}</td><td className="p-4 font-bold text-slate-800">{formatCurrency(item.amount, currency)}</td><td className="p-4 text-right"><button onClick={() => deleteIncome(item.id)} className="p-1.5 hover:bg-rose-50 hover:text-rose-500 rounded-lg text-slate-400 transition"><Trash2 className="w-4 h-4" /></button></td></tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
