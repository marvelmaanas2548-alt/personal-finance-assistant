export type Currency = '₹' | '$' | '€' | '£' | '¥';

export type IncomeCategory = 
  | 'Salary' 
  | 'Freelance' 
  | 'Rental' 
  | 'Business' 
  | 'Interest' 
  | 'Investments' 
  | 'Others';

export type ExpenseCategory = 
  | 'Food' 
  | 'Shopping' 
  | 'Fuel' 
  | 'Electricity' 
  | 'Water' 
  | 'Mobile Recharge' 
  | 'Internet' 
  | 'Insurance' 
  | 'EMI' 
  | 'Entertainment' 
  | 'Medical' 
  | 'Travel' 
  | 'Education' 
  | 'Miscellaneous';

export type GoalCategory = 
  | 'Buy Bike' 
  | 'Buy House' 
  | 'Emergency Fund' 
  | 'Education' 
  | 'Retirement' 
  | 'Vacation' 
  | 'Custom';

export type InvestmentType = 
  | 'Stocks' 
  | 'Mutual Funds' 
  | 'SIPs' 
  | 'Fixed Deposits' 
  | 'Gold' 
  | 'Cryptocurrency' 
  | 'Bonds';

export type LoanType = 
  | 'Home Loan' 
  | 'Car Loan' 
  | 'Personal Loan' 
  | 'Education Loan';

export type BillCategory = 
  | 'Electricity' 
  | 'Rent' 
  | 'Credit Card' 
  | 'Loan EMI' 
  | 'Internet' 
  | 'Insurance';

export type RiskAppetite = 'Low' | 'Moderate' | 'High';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  age: number;
  occupation: string;
  salary: number;
  financialGoals: string[];
  riskAppetite: RiskAppetite;
  preferredCurrency: Currency;
  country: string;
  taxInfo?: string;
  isMfaEnabled?: boolean;
  avatarUrl?: string;
}

export interface IncomeItem {
  id: string;
  category: IncomeCategory;
  amount: number;
  source: string;
  date: string;
  notes?: string;
}

export interface ExpenseItem {
  id: string;
  category: ExpenseCategory;
  amount: number;
  title: string;
  date: string;
  notes?: string;
}

export interface BudgetItem {
  id: string;
  category: ExpenseCategory;
  limitAmount: number;
  spentAmount?: number;
}

export interface FinancialGoal {
  id: string;
  title: string;
  category: GoalCategory;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
}

export interface InvestmentItem {
  id: string;
  name: string;
  type: InvestmentType;
  amountInvested: number;
  currentValue: number;
  purchaseDate: string;
}

export interface LoanItem {
  id: string;
  name: string;
  type: LoanType;
  totalAmount: number;
  outstandingAmount: number;
  interestRate: number; // percentage
  emiAmount: number;
  dueDate: string; // Day of month e.g. "10th"
  remainingMonths: number;
}

export interface BillItem {
  id: string;
  title: string;
  category: BillCategory;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  isPaid: boolean;
  isAutoPay?: boolean;
}

export interface NotificationItem {
  id: string;
  type: 'budget_alert' | 'bill_due' | 'savings_milestone' | 'investment_update' | 'goal_achieved';
  title: string;
  message: string;
  date: string;
  read: boolean;
  severity: 'info' | 'warning' | 'success' | 'danger';
}

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  suggestions?: string[];
}
