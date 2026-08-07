import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { BarChart3, PieChart, TrendingUp, Activity } from 'lucide-react';
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LineChart,
  Line,
  Legend
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const { expenses, budgets, totalIncome, totalExpense, totalSavings } = useFinance();
  const currency = user?.preferredCurrency || '₹';

  const expenseCategoryMap: Record<string, number> = {};
  expenses.forEach(e => {
    expenseCategoryMap[e.category] = (expenseCategoryMap[e.category] || 0) + Number(e.amount);
  });

  const pieData = Object.entries(expenseCategoryMap).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ['#e11d48', '#4f46e5', '#10b981', '#d97706', '#7c3aed', '#0891b2', '#db2777', '#64748b'];

  const monthlyData = [
    { month: 'Mar', Income: 130000, Expense: 68000, Savings: 62000 },
    { month: 'Apr', Income: 140000, Expense: 72000, Savings: 68000 },
    { month: 'May', Income: 135000, Expense: 65000, Savings: 70000 },
    { month: 'Jun', Income: 155000, Expense: 81000, Savings: 74000 },
    { month: 'Jul', Income: 148000, Expense: 71000, Savings: 77000 },
    { month: 'Aug', Income: totalIncome, Expense: totalExpense, Savings: totalSavings }
  ];

  const budgetPerfData = budgets.map(b => {
    const spent = expenses
      .filter(e => e.category === b.category)
      .reduce((sum, e) => sum + Number(e.amount), 0);
    return {
      category: b.category,
      Budget: b.limitAmount,
      Actual: spent
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-600" /> Interactive Analytics Dashboard
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Multi-chart insights covering Expense Pie, Monthly Bar, Income vs Expense, Savings Trend, Cash Flow, & Budget Performance</p>
      </div>

      {/* Chart Grid Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Expense Pie Chart */}
        <div className="glass-panel p-6 rounded-3xl">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-rose-500" /> 1. Expense Pie Chart (Category Distribution)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  dataKey="value"
                  label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  formatter={(val: any) => [`${currency}${val.toLocaleString()}`, 'Amount']}
                />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Monthly Bar Chart */}
        <div className="glass-panel p-6 rounded-3xl">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-600" /> 2. Monthly Income vs Expense Bar Chart
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={val => `${val/1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  formatter={(val: any) => [`${currency}${val.toLocaleString()}`, '']}
                />
                <Legend />
                <Bar dataKey="Income" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Expense" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart Grid Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3. Savings Trend Line Chart */}
        <div className="glass-panel p-6 rounded-3xl">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" /> 3. Savings Trend & Net Cash Flow Growth
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={val => `${val/1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  formatter={(val: any) => [`${currency}${val.toLocaleString()}`, 'Savings']}
                />
                <Line type="monotone" dataKey="Savings" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Budget Performance */}
        <div className="glass-panel p-6 rounded-3xl">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-600" /> 4. Budget vs Actual Category Performance
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetPerfData}>
                <XAxis dataKey="category" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={val => `${val/1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  formatter={(val: any) => [`${currency}${val.toLocaleString()}`, '']}
                />
                <Legend />
                <Bar dataKey="Budget" fill="#2563eb" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Actual" fill="#d97706" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
