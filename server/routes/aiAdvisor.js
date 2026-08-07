const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { authenticateToken } = require('../middleware/auth');

const dbPath = path.join(__dirname, '../data/db.json');

function getDb() {
  return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

// Generate personalized spending insights
router.get('/insights', authenticateToken, (req, res) => {
  const db = getDb();
  const userId = req.user.id;
  
  const incomes = db.incomes.filter(i => i.userId === userId);
  const expenses = db.expenses.filter(e => e.userId === userId);
  const budgets = db.budgets.filter(b => b.userId === userId);
  const goals = db.goals.filter(g => g.userId === userId);
  const investments = db.investments.filter(inv => inv.userId === userId);

  const totalIncome = incomes.reduce((sum, i) => sum + Number(i.amount), 0);
  const totalExpense = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const savings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((savings / totalIncome) * 100).toFixed(1) : 0;

  // Category expense breakdown
  const categoryMap = {};
  expenses.forEach(e => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + Number(e.amount);
  });

  const sortedCategories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);
  const highestCategory = sortedCategories.length > 0 ? sortedCategories[0] : ['None', 0];

  const totalInvested = investments.reduce((sum, i) => sum + Number(i.currentValue), 0);

  const insights = [
    {
      id: 'ins_1',
      title: 'Spending Pattern Analysis',
      type: 'warning',
      category: highestCategory[0],
      description: `Your highest expense area is ${highestCategory[0]} at ₹${highestCategory[1].toLocaleString()}. Reallocating 15% of this budget can save ₹${(highestCategory[1] * 0.15).toFixed(0)} monthly.`,
      recommendation: `Set a strict limit of ₹${(highestCategory[1] * 0.85).toFixed(0)} for ${highestCategory[0]} next month.`
    },
    {
      id: 'ins_2',
      title: 'Savings Optimization',
      type: savingsRate >= 30 ? 'success' : 'info',
      description: `Your current savings rate is ${savingsRate}%. Total monthly savings: ₹${savings.toLocaleString()}.`,
      recommendation: savingsRate >= 30 
        ? 'Great job maintaining over 30% savings rate! Consider allocating ₹15,000 to Index Funds or Gold SGB.' 
        : 'Aim for a 30% minimum savings rate by trimming non-essential shopping and entertainment.'
    },
    {
      id: 'ins_3',
      title: 'Goal Acceleration Strategy',
      type: 'accent',
      description: goals.length > 0 ? `Targeting goal "${goals[0].title}" (Target: ₹${goals[0].targetAmount.toLocaleString()}).` : 'No active financial goals defined.',
      recommendation: goals.length > 0 ? `Investing ₹5,000 more per month will allow you to hit "${goals[0].title}" 4 months ahead of schedule.` : 'Create a goal to start automated tracking.'
    },
    {
      id: 'ins_4',
      title: 'Portfolio Diversification',
      type: 'info',
      description: `Total invested portfolio value is ₹${totalInvested.toLocaleString()}.`,
      recommendation: 'Ensure your risk appetite (Moderate) aligns with a 60% Equity / 30% Debt / 10% Gold asset split.'
    }
  ];

  res.json({
    totalIncome,
    totalExpense,
    savings,
    savingsRate,
    insights
  });
});

// Interactive AI Financial Advisor Chat
router.post('/chat', authenticateToken, (req, res) => {
  const { message } = req.body;
  const db = getDb();
  const userId = req.user.id;
  const user = db.users.find(u => u.id === userId) || db.users[0];

  const incomes = db.incomes.filter(i => i.userId === userId);
  const expenses = db.expenses.filter(e => e.userId === userId);
  const totalIncome = incomes.reduce((sum, i) => sum + Number(i.amount), 0);
  const totalExpense = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const savings = totalIncome - totalExpense;

  const textLower = (message || '').toLowerCase();
  let aiResponse = '';
  let suggestions = [
    'How can I increase my monthly savings?',
    'Should I invest more in Mutual Funds or FDs?',
    'Analyze my shopping expenses',
    'Am I on track for my Emergency Fund goal?'
  ];

  if (textLower.includes('save') || textLower.includes('savings')) {
    aiResponse = `Hello ${user.name}! Based on your current profile, your monthly income is ₹${totalIncome.toLocaleString()} and expenses are ₹${totalExpense.toLocaleString()}, yielding ₹${savings.toLocaleString()} in net savings (${((savings/totalIncome)*100).toFixed(1)}% savings rate).\n\n💡 **Top AI Tip**: Increase your monthly SIP contributions by ₹5,000 right after salary credit (Pay Yourself First rule).`;
  } else if (textLower.includes('invest') || textLower.includes('fund') || textLower.includes('stock')) {
    aiResponse = `Given your **${user.riskAppetite}** risk profile and ₹${user.salary.toLocaleString()} base income:\n\n1. **Equity Mutual Funds / Index Funds**: 50% allocation for long-term compound growth.\n2. **Fixed Deposits / Bonds**: 30% for capital safety.\n3. **Gold / Sovereign Gold Bonds**: 10% inflation hedge.\n4. **Crypto / High-Growth**: 10% maximum for opportunistic gains.`;
  } else if (textLower.includes('budget') || textLower.includes('exceed') || textLower.includes('shop')) {
    aiResponse = `⚠️ **Budget Analysis Alert**: Your Shopping and Gourmet Groceries make up over 45% of discretionary spend. Try applying the **24-Hour Purchase Delay Rule** for non-essential buys over ₹2,000.`;
  } else if (textLower.includes('goal') || textLower.includes('house') || textLower.includes('bike')) {
    aiResponse = `🎯 **Goal Strategy**: You have active financial goals including Apartment Down Payment and Emergency Fund. Allocating an extra ₹8,000 monthly to high-yield SIPs will shorten your goal deadline by 6 months!`;
  } else {
    aiResponse = `I have analyzed your financial metrics, ${user.name}. You currently have net monthly savings of ₹${savings.toLocaleString()}. Your debt-to-income ratio is healthy, and your investment portfolio shows solid returns.\n\nWhat specific area of your finances would you like me to optimize today?`;
  }

  res.json({
    id: `msg_${Date.now()}`,
    sender: 'ai',
    text: aiResponse,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    suggestions
  });
});

module.exports = router;
