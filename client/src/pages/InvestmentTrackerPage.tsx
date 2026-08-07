import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';
import { InvestmentType } from '../types';
import { LineChart, Plus, Trash2, PieChart } from 'lucide-react';
import { PieChart as RePieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const InvestmentTrackerPage: React.FC = () => {
  const { user } = useAuth();
  const { investments, addInvestment, deleteInvestment, totalInvested, totalInvestmentValue } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [type, setType] = useState<InvestmentType>('Mutual Funds');
  const [amountInvested, setAmountInvested] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().slice(0, 10));

  const currency = user?.preferredCurrency || '₹';

  const totalProfitLoss = totalInvestmentValue - totalInvested;
  const returnPercentage = totalInvested > 0 ? ((totalProfitLoss / totalInvested) * 100).toFixed(1) : '0';

  const typeTotals: Record<string, number> = {};
  investments.forEach(inv => {
    typeTotals[inv.type] = (typeTotals[inv.type] || 0) + Number(inv.currentValue);
  });

  const pieData = Object.entries(typeTotals).map(([name, value]) => ({ name, value }));
  const COLORS = ['#4f46e5', '#10b981', '#7c3aed', '#d97706', '#0891b2', '#db2777', '#2563eb'];

  const handleCreateInvestment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amountInvested || !currentValue) return;
    addInvestment({
      name,
      type,
      amountInvested: Number(amountInvested),
      currentValue: Number(currentValue),
      purchaseDate
    });
    setIsModalOpen(false);
    setName('');
    setAmountInvested('');
    setCurrentValue('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <LineChart className="w-5 h-5 text-indigo-600" /> Investment Portfolio Tracker
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Stocks, Mutual Funds, SIPs, FDs, Gold, Cryptocurrency & Bonds</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Asset / Holding
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl">
          <span className="text-xs text-slate-500 font-medium">Total Portfolio Value</span>
          <div className="text-2xl font-extrabold text-slate-800 mt-1">
            {formatCurrency(totalInvestmentValue, currency)}
          </div>
          <span className="text-[10px] text-slate-400">Current total market value</span>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <span className="text-xs text-slate-500 font-medium">Total Capital Invested</span>
          <div className="text-2xl font-extrabold text-slate-600 mt-1">
            {formatCurrency(totalInvested, currency)}
          </div>
          <span className="text-[10px] text-slate-400">Initial principal cost basis</span>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <span className="text-xs text-slate-500 font-medium">Total Profit / Loss</span>
          <div className={`text-2xl font-extrabold mt-1 ${totalProfitLoss >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {totalProfitLoss >= 0 ? '+' : ''}{formatCurrency(totalProfitLoss, currency)}
          </div>
          <span className="text-[10px] text-slate-400">Net unrealized return</span>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <span className="text-xs text-slate-500 font-medium">Portfolio Return Rate</span>
          <div className="text-2xl font-extrabold text-indigo-600 mt-1">
            {returnPercentage}%
          </div>
          <span className="text-[10px] text-slate-400">Overall return percentage</span>
        </div>
      </div>

      {/* Asset Allocation Donut & Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 glass-panel p-6 rounded-3xl">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-purple-600" /> Asset Allocation
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  formatter={(val: any) => [`${currency}${val.toLocaleString()}`, 'Value']}
                />
                <Legend />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Investment List Table */}
        <div className="lg:col-span-2 glass-panel rounded-3xl overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Holdings ({investments.length})</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="p-4">Holding Name</th>
                  <th className="p-4">Asset Type</th>
                  <th className="p-4">Invested</th>
                  <th className="p-4">Current Value</th>
                  <th className="p-4">Gain / Loss</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {investments.map(inv => {
                  const gain = inv.currentValue - inv.amountInvested;
                  const gainPct = inv.amountInvested > 0 ? ((gain / inv.amountInvested) * 100).toFixed(1) : '0';

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50 transition">
                      <td className="p-4 font-semibold text-slate-800">{inv.name}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 font-medium text-[10px]">
                          {inv.type}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600">{formatCurrency(inv.amountInvested, currency)}</td>
                      <td className="p-4 font-bold text-slate-800">{formatCurrency(inv.currentValue, currency)}</td>
                      <td className={`p-4 font-bold ${gain >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {gain >= 0 ? '+' : ''}{formatCurrency(gain, currency)} ({gainPct}%)
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => deleteInvestment(inv.id)}
                          className="p-1.5 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-400 transition"
                          title="Delete Holding"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Holding Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-slate-200 shadow-xl">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Add Investment Holding</h3>
            <form onSubmit={handleCreateInvestment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Asset Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sovereign Gold Bonds SGB"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Asset Type</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as InvestmentType)}
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-sm"
                >
                  {['Stocks', 'Mutual Funds', 'SIPs', 'Fixed Deposits', 'Gold', 'Cryptocurrency', 'Bonds'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Amount Invested</label>
                  <input
                    type="number"
                    placeholder="e.g. 50000"
                    value={amountInvested}
                    onChange={e => setAmountInvested(e.target.value)}
                    className="w-full glass-input px-3.5 py-2 rounded-xl text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Current Valuation</label>
                  <input
                    type="number"
                    placeholder="e.g. 62000"
                    value={currentValue}
                    onChange={e => setCurrentValue(e.target.value)}
                    className="w-full glass-input px-3.5 py-2 rounded-xl text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Purchase Date</label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={e => setPurchaseDate(e.target.value)}
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-sm"
                  required
                />
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
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-md shadow-indigo-600/20"
                >
                  Save Investment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
