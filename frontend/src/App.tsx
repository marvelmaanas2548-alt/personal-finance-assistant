import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider } from './context/FinanceContext';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar, PageView } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { IncomeModal, ExpenseModal, BudgetModal } from './components/Modals';

// Pages
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { IncomePage } from './pages/IncomePage';
import { ExpensesPage } from './pages/ExpensesPage';
import { BudgetPage } from './pages/BudgetPage';
import { SavingsPage } from './pages/SavingsPage';
import { FinancialGoalsPage } from './pages/FinancialGoalsPage';
import { InvestmentTrackerPage } from './pages/InvestmentTrackerPage';
import { LoanManagerPage } from './pages/LoanManagerPage';
import { BillReminderPage } from './pages/BillReminderPage';
import { ReportsPage } from './pages/ReportsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AiAdvisorPage } from './pages/AiAdvisorPage';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [activeView, setActiveView] = useState<PageView>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modal States
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <DashboardPage
            setActiveView={setActiveView}
            onOpenIncomeModal={() => setIsIncomeModalOpen(true)}
            onOpenExpenseModal={() => setIsExpenseModalOpen(true)}
          />
        );
      case 'income':
        return <IncomePage onOpenIncomeModal={() => setIsIncomeModalOpen(true)} />;
      case 'expenses':
        return <ExpensesPage onOpenExpenseModal={() => setIsExpenseModalOpen(true)} />;
      case 'budget':
        return <BudgetPage onOpenBudgetModal={() => setIsBudgetModalOpen(true)} />;
      case 'savings':
        return <SavingsPage />;
      case 'goals':
        return <FinancialGoalsPage />;
      case 'investments':
        return <InvestmentTrackerPage />;
      case 'loans':
        return <LoanManagerPage />;
      case 'bills':
        return <BillReminderPage />;
      case 'reports':
        return <ReportsPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'ai':
        return <AiAdvisorPage />;
      case 'profile':
        return <UserProfilePage />;
      default:
        return (
          <DashboardPage
            setActiveView={setActiveView}
            onOpenIncomeModal={() => setIsIncomeModalOpen(true)}
            onOpenExpenseModal={() => setIsExpenseModalOpen(true)}
          />
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 antialiased selection:bg-indigo-500 selection:text-white transition-colors duration-300">
      {/* Sidebar with Mobile Drawer */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Layout Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          onOpenProfile={() => setActiveView('profile')}
          onOpenAi={() => setActiveView('ai')}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Modals */}
      <IncomeModal isOpen={isIncomeModalOpen} onClose={() => setIsIncomeModalOpen(false)} />
      <ExpenseModal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} />
      <BudgetModal isOpen={isBudgetModalOpen} onClose={() => setIsBudgetModalOpen(false)} />
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FinanceProvider>
          <AppContent />
        </FinanceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
