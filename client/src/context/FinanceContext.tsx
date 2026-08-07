import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  IncomeItem,
  ExpenseItem,
  BudgetItem,
  FinancialGoal,
  InvestmentItem,
  LoanItem,
  BillItem,
  NotificationItem
} from '../types';
import { useAuth } from './AuthContext';

interface FinanceContextType {
  incomes: IncomeItem[];
  expenses: ExpenseItem[];
  budgets: BudgetItem[];
  goals: FinancialGoal[];
  investments: InvestmentItem[];
  loans: LoanItem[];
  bills: BillItem[];
  notifications: NotificationItem[];
  loading: boolean;
  
  // Income actions
  addIncome: (item: Omit<IncomeItem, 'id'>) => void;
  editIncome: (id: string, item: Partial<IncomeItem>) => void;
  deleteIncome: (id: string) => void;

  // Expense actions
  addExpense: (item: Omit<ExpenseItem, 'id'>) => void;
  editExpense: (id: string, item: Partial<ExpenseItem>) => void;
  deleteExpense: (id: string) => void;

  // Budget actions
  setBudget: (category: string, limitAmount: number) => void;

  // Goal actions
  addGoal: (goal: Omit<FinancialGoal, 'id' | 'currentAmount'>) => void;
  depositGoal: (id: string, amount: number) => void;
  deleteGoal: (id: string) => void;

  // Investment actions
  addInvestment: (inv: Omit<InvestmentItem, 'id'>) => void;
  deleteInvestment: (id: string) => void;

  // Loan actions
  addLoan: (loan: Omit<LoanItem, 'id'>) => void;
  payLoanEmi: (id: string) => void;

  // Bill actions
  addBill: (bill: Omit<BillItem, 'id' | 'isPaid'>) => void;
  payBill: (id: string) => void;

  // Notification actions
  markAllNotificationsRead: () => void;
  addNotification: (notif: Omit<NotificationItem, 'id' | 'date' | 'read'>) => void;

  // Computed metrics
  totalIncome: number;
  totalExpense: number;
  totalSavings: number;
  savingsRate: number;
  totalInvested: number;
  totalInvestmentValue: number;
  totalLoanOutstanding: number;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

// Sample Initial Data
const DEFAULT_INCOMES: IncomeItem[] = [
  { id: 'inc_1', category: 'Salary', amount: 145000, source: 'Tech Base Salary', date: '2026-08-01', notes: 'Monthly Salary Credit' },
  { id: 'inc_2', category: 'Freelance', amount: 35000, source: 'UI Design Contract', date: '2026-08-03', notes: 'Client Project Phase 1' },
  { id: 'inc_3', category: 'Investments', amount: 12500, source: 'Mutual Fund Dividend', date: '2026-08-05', notes: 'Quarterly payout' }
];

const DEFAULT_EXPENSES: ExpenseItem[] = [
  { id: 'exp_1', category: 'Food', amount: 7500, title: 'Organic Supermarket & Dining', date: '2026-08-02', notes: 'Weekly grocery cart' },
  { id: 'exp_2', category: 'EMI', amount: 18500, title: 'EV Car Loan EMI', date: '2026-08-04', notes: 'Monthly EMI payment' },
  { id: 'exp_3', category: 'Fuel', amount: 4200, title: 'Petrol & Highway Tolls', date: '2026-08-05', notes: 'Fuel refill' },
  { id: 'exp_4', category: 'Electricity', amount: 3100, title: 'Power Utility Bill', date: '2026-08-01', notes: 'AC summer bill' },
  { id: 'exp_5', category: 'Shopping', amount: 9200, title: 'Noise Cancelling Headphones', date: '2026-08-06', notes: 'Gadget upgrade' },
  { id: 'exp_6', category: 'Internet', amount: 1499, title: 'Fiber Broadband 1Gbps', date: '2026-08-02', notes: 'Monthly wifi' },
  { id: 'exp_7', category: 'Mobile Recharge', amount: 899, title: '5G Postpaid', date: '2026-08-03', notes: 'Unlimited plan' },
  { id: 'exp_8', category: 'Insurance', amount: 5500, title: 'Term Life & Health Cover', date: '2026-08-01', notes: 'Health insurance' },
  { id: 'exp_9', category: 'Entertainment', amount: 2400, title: 'Movies & Streaming', date: '2026-08-05', notes: 'Subscriptions' },
  { id: 'exp_10', category: 'Travel', amount: 3800, title: 'Weekend Gateway Trip', date: '2026-08-06', notes: 'Cab booking' }
];

const DEFAULT_BUDGETS: BudgetItem[] = [
  { id: 'bgt_1', category: 'Food', limitAmount: 10000 },
  { id: 'bgt_2', category: 'Shopping', limitAmount: 10000 },
  { id: 'bgt_3', category: 'Fuel', limitAmount: 5000 },
  { id: 'bgt_4', category: 'Entertainment', limitAmount: 3000 },
  { id: 'bgt_5', category: 'EMI', limitAmount: 20000 },
  { id: 'bgt_6', category: 'Travel', limitAmount: 6000 }
];

const DEFAULT_GOALS: FinancialGoal[] = [
  { id: 'goal_1', title: 'Emergency Fund (6 Months)', category: 'Emergency Fund', targetAmount: 500000, currentAmount: 380000, deadline: '2026-12-31' },
  { id: 'goal_2', title: 'Apartment Down Payment', category: 'Buy House', targetAmount: 1500000, currentAmount: 620000, deadline: '2028-06-30' },
  { id: 'goal_3', title: 'Adventure Electric Bike', category: 'Buy Bike', targetAmount: 180000, currentAmount: 145000, deadline: '2026-10-15' },
  { id: 'goal_4', title: 'Europe Summer Vacation', category: 'Vacation', targetAmount: 250000, currentAmount: 95000, deadline: '2027-05-20' }
];

const DEFAULT_INVESTMENTS: InvestmentItem[] = [
  { id: 'inv_1', name: 'Nifty 50 Index Fund', type: 'Mutual Funds', amountInvested: 250000, currentValue: 310000, purchaseDate: '2024-01-15' },
  { id: 'inv_2', name: 'Bluechip Tech Stocks', type: 'Stocks', amountInvested: 180000, currentValue: 225000, purchaseDate: '2024-05-10' },
  { id: 'inv_3', name: 'Monthly Equity SIP', type: 'SIPs', amountInvested: 120000, currentValue: 142000, purchaseDate: '2025-02-01' },
  { id: 'inv_4', name: 'High Yield Bank FD', type: 'Fixed Deposits', amountInvested: 100000, currentValue: 107500, purchaseDate: '2025-08-01' },
  { id: 'inv_5', name: 'Sovereign Gold Bonds (SGB)', type: 'Gold', amountInvested: 90000, currentValue: 118000, purchaseDate: '2023-11-20' },
  { id: 'inv_6', name: 'Bitcoin & Ethereum', type: 'Cryptocurrency', amountInvested: 50000, currentValue: 68000, purchaseDate: '2024-09-12' }
];

const DEFAULT_LOANS: LoanItem[] = [
  { id: 'loan_1', name: 'EV Car Loan', type: 'Car Loan', totalAmount: 800000, outstandingAmount: 420000, interestRate: 8.5, emiAmount: 18500, dueDate: '4th of month', remainingMonths: 24 },
  { id: 'loan_2', name: 'Higher Education Loan', type: 'Education Loan', totalAmount: 500000, outstandingAmount: 110000, interestRate: 6.8, emiAmount: 12000, dueDate: '15th of month', remainingMonths: 10 }
];

const DEFAULT_BILLS: BillItem[] = [
  { id: 'bill_1', title: 'Electricity Bill', category: 'Electricity', amount: 3100, dueDate: '2026-08-10', isPaid: true, isAutoPay: true },
  { id: 'bill_2', title: 'Apartment Rent', category: 'Rent', amount: 25000, dueDate: '2026-08-15', isPaid: false, isAutoPay: false },
  { id: 'bill_3', title: 'HDFC Credit Card Bill', category: 'Credit Card', amount: 14200, dueDate: '2026-08-12', isPaid: false, isAutoPay: false },
  { id: 'bill_4', title: 'Car EMI Payment', category: 'Loan EMI', amount: 18500, dueDate: '2026-08-18', isPaid: false, isAutoPay: true },
  { id: 'bill_5', title: 'Broadband Wifi Bill', category: 'Internet', amount: 1499, dueDate: '2026-08-22', isPaid: false, isAutoPay: true }
];

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  { id: 'notif_1', type: 'budget_alert', title: 'Shopping Budget Alert (92% Used)', message: 'You spent ₹9,200 of your ₹10,000 budget for Shopping.', date: '2026-08-06 14:20', read: false, severity: 'warning' },
  { id: 'notif_2', type: 'bill_due', title: 'Credit Card Bill Due Soon', message: '₹14,200 due on Aug 12th for HDFC Credit Card.', date: '2026-08-07 09:00', read: false, severity: 'danger' },
  { id: 'notif_3', type: 'savings_milestone', title: 'Savings Milestone Achieved!', message: 'Awesome! You hit a 60%+ savings rate for August.', date: '2026-08-05 18:30', read: true, severity: 'success' },
  { id: 'notif_4', type: 'investment_update', title: 'Portfolio Gains +18.4%', message: 'Your Mutual Funds & Gold investments gained ₹85,000 this quarter.', date: '2026-08-04 11:15', read: true, severity: 'info' }
];

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/finance';

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  const [incomes, setIncomes] = useState<IncomeItem[]>(() => {
    const saved = localStorage.getItem('fin_incomes');
    return saved ? JSON.parse(saved) : [];
  });

  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    const saved = localStorage.getItem('fin_expenses');
    return saved ? JSON.parse(saved) : [];
  });

  const [budgets, setBudgets] = useState<BudgetItem[]>(() => {
    const saved = localStorage.getItem('fin_budgets');
    return saved ? JSON.parse(saved) : [];
  });

  const [goals, setGoals] = useState<FinancialGoal[]>(() => {
    const saved = localStorage.getItem('fin_goals');
    return saved ? JSON.parse(saved) : [];
  });

  const [investments, setInvestments] = useState<InvestmentItem[]>(() => {
    const saved = localStorage.getItem('fin_investments');
    return saved ? JSON.parse(saved) : [];
  });

  const [loans, setLoans] = useState<LoanItem[]>(() => {
    const saved = localStorage.getItem('fin_loans');
    return saved ? JSON.parse(saved) : [];
  });

  const [bills, setBills] = useState<BillItem[]>(() => {
    const saved = localStorage.getItem('fin_bills');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('fin_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  // Sync to localStorage
  useEffect(() => { localStorage.setItem('fin_incomes', JSON.stringify(incomes)); }, [incomes]);
  useEffect(() => { localStorage.setItem('fin_expenses', JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem('fin_budgets', JSON.stringify(budgets)); }, [budgets]);
  useEffect(() => { localStorage.setItem('fin_goals', JSON.stringify(goals)); }, [goals]);
  useEffect(() => { localStorage.setItem('fin_investments', JSON.stringify(investments)); }, [investments]);
  useEffect(() => { localStorage.setItem('fin_loans', JSON.stringify(loans)); }, [loans]);
  useEffect(() => { localStorage.setItem('fin_bills', JSON.stringify(bills)); }, [bills]);
  useEffect(() => { localStorage.setItem('fin_notifications', JSON.stringify(notifications)); }, [notifications]);

  // Check backend server on load if reachable
  useEffect(() => {
    fetch(`${API_BASE_URL}/all-data`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          if (data.incomes?.length) setIncomes(data.incomes);
          if (data.expenses?.length) setExpenses(data.expenses);
          if (data.budgets?.length) setBudgets(data.budgets);
          if (data.goals?.length) setGoals(data.goals);
          if (data.investments?.length) setInvestments(data.investments);
          if (data.loans?.length) setLoans(data.loans);
          if (data.bills?.length) setBills(data.bills);
          if (data.notifications?.length) setNotifications(data.notifications);
        }
      })
      .catch(() => {
        // Fallback gracefully to client state
      });
  }, [token]);

  // Helper notification builder
  const addNotification = (notif: Omit<NotificationItem, 'id' | 'date' | 'read'>) => {
    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      read: false,
      ...notif
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Income Actions
  const addIncome = (item: Omit<IncomeItem, 'id'>) => {
    const newItem: IncomeItem = { id: `inc_${Date.now()}`, ...item };
    setIncomes(prev => [newItem, ...prev]);
    fetch(`${API_BASE_URL}/incomes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(item)
    }).catch(() => {});
  };

  const editIncome = (id: string, updated: Partial<IncomeItem>) => {
    setIncomes(prev => prev.map(item => item.id === id ? { ...item, ...updated } : item));
    fetch(`${API_BASE_URL}/incomes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(updated)
    }).catch(() => {});
  };

  const deleteIncome = (id: string) => {
    setIncomes(prev => prev.filter(item => item.id !== id));
    fetch(`${API_BASE_URL}/incomes/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    }).catch(() => {});
  };

  // Expense Actions + Budget Alerts (50%, 80%, Exceeded)
  const addExpense = (item: Omit<ExpenseItem, 'id'>) => {
    const newItem: ExpenseItem = { id: `exp_${Date.now()}`, ...item };
    setExpenses(prev => [newItem, ...prev]);

    fetch(`${API_BASE_URL}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(item)
    }).catch(() => {});

    // Check budget triggers
    const targetBudget = budgets.find(b => b.category === newItem.category);
    if (targetBudget) {
      const currentSpent = expenses
        .filter(e => e.category === newItem.category)
        .reduce((sum, e) => sum + Number(e.amount), 0) + Number(newItem.amount);
      
      const pct = (currentSpent / targetBudget.limitAmount) * 100;
      if (pct >= 100) {
        addNotification({
          type: 'budget_alert',
          title: `CRITICAL: ${newItem.category} Budget Exceeded!`,
          message: `Spent ₹${currentSpent.toLocaleString()} exceeding your limit of ₹${targetBudget.limitAmount.toLocaleString()}.`,
          severity: 'danger'
        });
      } else if (pct >= 80) {
        addNotification({
          type: 'budget_alert',
          title: `WARNING: ${newItem.category} Budget 80% Reached`,
          message: `You've used ${pct.toFixed(0)}% of your ${newItem.category} budget limit.`,
          severity: 'warning'
        });
      } else if (pct >= 50) {
        addNotification({
          type: 'budget_alert',
          title: `NOTICE: ${newItem.category} Budget 50% Used`,
          message: `You crossed half of your budget for ${newItem.category}.`,
          severity: 'info'
        });
      }
    }
  };

  const editExpense = (id: string, updated: Partial<ExpenseItem>) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updated } : e));
    fetch(`${API_BASE_URL}/expenses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(updated)
    }).catch(() => {});
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    fetch(`${API_BASE_URL}/expenses/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    }).catch(() => {});
  };

  // Budget Actions
  const setBudget = (category: string, limitAmount: number) => {
    setBudgets(prev => {
      const exists = prev.find(b => b.category === category);
      if (exists) {
        return prev.map(b => b.category === category ? { ...b, limitAmount } : b);
      }
      return [...prev, { id: `bgt_${Date.now()}`, category: category as any, limitAmount }];
    });
    fetch(`${API_BASE_URL}/budgets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ category, limitAmount })
    }).catch(() => {});
  };

  // Goal Actions
  const addGoal = (goal: Omit<FinancialGoal, 'id' | 'currentAmount'>) => {
    const newGoal: FinancialGoal = { id: `goal_${Date.now()}`, currentAmount: 0, ...goal };
    setGoals(prev => [...prev, newGoal]);
    fetch(`${API_BASE_URL}/goals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(goal)
    }).catch(() => {});
  };

  const depositGoal = (id: string, amount: number) => {
    setGoals(prev => prev.map(g => {
      if (g.id === id) {
        const updatedAmount = g.currentAmount + amount;
        if (updatedAmount >= g.targetAmount && g.currentAmount < g.targetAmount) {
          addNotification({
            type: 'goal_achieved',
            title: `🎉 Goal Achieved: ${g.title}!`,
            message: `Congratulations! You hit your target of ₹${g.targetAmount.toLocaleString()}.`,
            severity: 'success'
          });
        }
        return { ...g, currentAmount: updatedAmount };
      }
      return g;
    }));
    fetch(`${API_BASE_URL}/goals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ currentAmount: (goals.find(g => g.id === id)?.currentAmount || 0) + amount })
    }).catch(() => {});
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    fetch(`${API_BASE_URL}/goals/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    }).catch(() => {});
  };

  // Investment Actions
  const addInvestment = (inv: Omit<InvestmentItem, 'id'>) => {
    const newItem: InvestmentItem = { id: `inv_${Date.now()}`, ...inv };
    setInvestments(prev => [...prev, newItem]);
    fetch(`${API_BASE_URL}/investments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(inv)
    }).catch(() => {});
  };

  const deleteInvestment = (id: string) => {
    setInvestments(prev => prev.filter(inv => inv.id !== id));
    fetch(`${API_BASE_URL}/investments/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    }).catch(() => {});
  };

  // Loan Actions
  const addLoan = (loan: Omit<LoanItem, 'id'>) => {
    const newItem: LoanItem = { id: `loan_${Date.now()}`, ...loan };
    setLoans(prev => [...prev, newItem]);
    fetch(`${API_BASE_URL}/loans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(loan)
    }).catch(() => {});
  };

  const payLoanEmi = (id: string) => {
    setLoans(prev => prev.map(l => {
      if (l.id === id) {
        const newOutstanding = Math.max(0, l.outstandingAmount - l.emiAmount);
        const newMonths = Math.max(0, l.remainingMonths - 1);
        
        // Record payment as expense
        addExpense({
          category: 'EMI',
          amount: l.emiAmount,
          title: `${l.name} EMI Payment`,
          date: new Date().toISOString().slice(0, 10),
          notes: 'Auto-recorded EMI action'
        });

        return { ...l, outstandingAmount: newOutstanding, remainingMonths: newMonths };
      }
      return l;
    }));
    fetch(`${API_BASE_URL}/loans/${id}/pay-emi`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    }).catch(() => {});
  };

  // Bill Actions
  const addBill = (bill: Omit<BillItem, 'id' | 'isPaid'>) => {
    const newItem: BillItem = { id: `bill_${Date.now()}`, isPaid: false, ...bill };
    setBills(prev => [...prev, newItem]);
    fetch(`${API_BASE_URL}/bills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(bill)
    }).catch(() => {});
  };

  const payBill = (id: string) => {
    setBills(prev => prev.map(b => {
      if (b.id === id) {
        addExpense({
          category: b.category === 'Rent' ? 'Miscellaneous' : (b.category === 'Loan EMI' ? 'EMI' : (b.category === 'Credit Card' ? 'Shopping' : b.category)),
          amount: b.amount,
          title: `${b.title} Paid`,
          date: new Date().toISOString().slice(0, 10),
          notes: 'Paid from Bill Reminders'
        });
        return { ...b, isPaid: true };
      }
      return b;
    }));
    fetch(`${API_BASE_URL}/bills/${id}/pay`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    }).catch(() => {});
  };

  // Notification Actions
  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    }).catch(() => {});
  };

  // Computed Totals
  const totalIncome = incomes.reduce((sum, i) => sum + Number(i.amount), 0);
  const totalExpense = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((totalSavings / totalIncome) * 100) : 0;

  const totalInvested = investments.reduce((sum, inv) => sum + Number(inv.amountInvested), 0);
  const totalInvestmentValue = investments.reduce((sum, inv) => sum + Number(inv.currentValue), 0);
  const totalLoanOutstanding = loans.reduce((sum, l) => sum + Number(l.outstandingAmount), 0);

  return (
    <FinanceContext.Provider
      value={{
        incomes,
        expenses,
        budgets,
        goals,
        investments,
        loans,
        bills,
        notifications,
        loading,
        addIncome,
        editIncome,
        deleteIncome,
        addExpense,
        editExpense,
        deleteExpense,
        setBudget,
        addGoal,
        depositGoal,
        deleteGoal,
        addInvestment,
        deleteInvestment,
        addLoan,
        payLoanEmi,
        addBill,
        payBill,
        markAllNotificationsRead,
        addNotification,
        totalIncome,
        totalExpense,
        totalSavings,
        savingsRate,
        totalInvested,
        totalInvestmentValue,
        totalLoanOutstanding
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
