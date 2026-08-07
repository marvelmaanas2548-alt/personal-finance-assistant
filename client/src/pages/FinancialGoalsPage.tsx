import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { GoalCategory } from '../types';
import { Target, Plus, Trash2, Home, Bike, ShieldAlert, GraduationCap, Palmtree, Clock, PiggyBank } from 'lucide-react';

export const FinancialGoalsPage: React.FC = () => {
  const { user } = useAuth();
  const { goals, addGoal, depositGoal, deleteGoal } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [depositGoalId, setDepositGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState('');

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<GoalCategory>('Buy House');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('2027-12-31');

  const currency = user?.preferredCurrency || '₹';

  const getGoalIcon = (cat: GoalCategory) => {
    switch (cat) {
      case 'Buy House': return <Home className="w-5 h-5 text-indigo-600" />;
      case 'Buy Bike': return <Bike className="w-5 h-5 text-emerald-600" />;
      case 'Emergency Fund': return <ShieldAlert className="w-5 h-5 text-amber-600" />;
      case 'Education': return <GraduationCap className="w-5 h-5 text-cyan-600" />;
      case 'Vacation': return <Palmtree className="w-5 h-5 text-pink-600" />;
      default: return <Target className="w-5 h-5 text-purple-600" />;
    }
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !targetAmount) return;
    addGoal({ title, category, targetAmount: Number(targetAmount), deadline });
    setIsModalOpen(false);
    setTitle('');
    setTargetAmount('');
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (depositGoalId && depositAmount) {
      depositGoal(depositGoalId, Number(depositAmount));
      setDepositGoalId(null);
      setDepositAmount('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" /> Financial Goals & Milestone Tracker
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Track target, current saved, remaining balance, deadlines, and % completion</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/20 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create New Goal
        </button>
      </div>

      {/* Goal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map(goal => {
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
          const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));

          return (
            <div key={goal.id} className="glass-card p-6 rounded-3xl space-y-4 relative">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    {getGoalIcon(goal.category)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">{goal.title}</h3>
                    <span className="text-xs text-slate-500">{goal.category}</span>
                  </div>
                </div>
                <button
                  onClick={() => deleteGoal(goal.id)}
                  className="text-slate-400 hover:text-rose-500 p-1 transition"
                  title="Delete Goal"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Progress</span>
                  <span className="font-bold text-purple-600">{progress}%</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Goal Metrics */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs text-center">
                <div>
                  <span className="text-[10px] text-slate-400">Target</span>
                  <div className="font-bold text-slate-800">{formatCurrency(goal.targetAmount, currency)}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Current Saved</span>
                  <div className="font-bold text-emerald-600">{formatCurrency(goal.currentAmount, currency)}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Remaining</span>
                  <div className="font-bold text-rose-500">{formatCurrency(remaining, currency)}</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Deadline: {formatDate(goal.deadline)}
                </div>

                <button
                  onClick={() => setDepositGoalId(goal.id)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 transition flex items-center gap-1"
                >
                  <PiggyBank className="w-3.5 h-3.5" /> Add Savings Deposit
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-slate-200 shadow-xl">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Create Financial Goal</h3>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Goal Title</label>
                <input
                  type="text"
                  placeholder="e.g. Dream Electric SUV"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as GoalCategory)}
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-sm"
                >
                  {['Buy Bike', 'Buy House', 'Emergency Fund', 'Education', 'Retirement', 'Vacation', 'Custom'].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Target Amount</label>
                  <input
                    type="number"
                    placeholder="e.g. 500000"
                    value={targetAmount}
                    onChange={e => setTargetAmount(e.target.value)}
                    className="w-full glass-input px-3.5 py-2 rounded-xl text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Deadline Date</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
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
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-semibold shadow-md shadow-purple-600/20"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit Savings Modal */}
      {depositGoalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 border border-slate-200 shadow-xl">
            <h3 className="text-base font-bold text-slate-800 mb-4">Add Savings Deposit to Goal</h3>
            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Deposit Amount</label>
                <input
                  type="number"
                  placeholder="e.g. 15000"
                  value={depositAmount}
                  onChange={e => setDepositAmount(e.target.value)}
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-sm"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDepositGoalId(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-md shadow-indigo-600/20"
                >
                  Add Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
