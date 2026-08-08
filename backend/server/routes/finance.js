const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { authenticateToken } = require('../middleware/auth');

const dbPath = path.join(__dirname, '../data/db.json');

function getDb() {
  return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

function saveDb(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
}

// ---------------- PROFILE ----------------
router.get('/profile', authenticateToken, (req, res) => {
  const db = getDb();
  const user = db.users.find(u => u.id === req.user.id) || db.users[0];
  res.json(user);
});

router.put('/profile', authenticateToken, (req, res) => {
  const db = getDb();
  let userIndex = db.users.findIndex(u => u.id === req.user.id);
  if (userIndex === -1) userIndex = 0;

  db.users[userIndex] = { ...db.users[userIndex], ...req.body };
  saveDb(db);
  res.json(db.users[userIndex]);
});

// ---------------- FULL DASHBOARD / DATA SYNC ----------------
router.get('/all-data', authenticateToken, (req, res) => {
  const db = getDb();
  const userId = req.user.id;

  const user = db.users.find(u => u.id === userId) || db.users[0];
  const incomes = db.incomes.filter(i => i.userId === userId || i.userId === 'u_101');
  const expenses = db.expenses.filter(e => e.userId === userId || e.userId === 'u_101');
  const budgets = db.budgets.filter(b => b.userId === userId || b.userId === 'u_101');
  const goals = db.goals.filter(g => g.userId === userId || g.userId === 'u_101');
  const investments = db.investments.filter(inv => inv.userId === userId || inv.userId === 'u_101');
  const loans = db.loans.filter(l => l.userId === userId || l.userId === 'u_101');
  const bills = db.bills.filter(b => b.userId === userId || b.userId === 'u_101');
  const notifications = db.notifications.filter(n => n.userId === userId || n.userId === 'u_101');

  // Compute live budget spentAmounts
  const updatedBudgets = budgets.map(bgt => {
    const categorySpent = expenses
      .filter(e => e.category === bgt.category)
      .reduce((sum, e) => sum + e.amount, 0);
    return { ...bgt, spentAmount: categorySpent };
  });

  res.json({
    user,
    incomes,
    expenses,
    budgets: updatedBudgets,
    goals,
    investments,
    loans,
    bills,
    notifications
  });
});

// ---------------- INCOMES ----------------
router.post('/incomes', authenticateToken, (req, res) => {
  const db = getDb();
  const newItem = { id: `inc_${Date.now()}`, userId: req.user.id, ...req.body };
  db.incomes.unshift(newItem);
  saveDb(db);
  res.json(newItem);
});

router.put('/incomes/:id', authenticateToken, (req, res) => {
  const db = getDb();
  const index = db.incomes.findIndex(i => i.id === req.params.id);
  if (index !== -1) {
    db.incomes[index] = { ...db.incomes[index], ...req.body };
    saveDb(db);
    return res.json(db.incomes[index]);
  }
  res.status(404).json({ error: 'Income not found' });
});

router.delete('/incomes/:id', authenticateToken, (req, res) => {
  const db = getDb();
  db.incomes = db.incomes.filter(i => i.id !== req.params.id);
  saveDb(db);
  res.json({ success: true });
});

// ---------------- EXPENSES ----------------
router.post('/expenses', authenticateToken, (req, res) => {
  const db = getDb();
  const newItem = { id: `exp_${Date.now()}`, userId: req.user.id, ...req.body };
  db.expenses.unshift(newItem);

  // Check budget limits for this category
  const bgt = db.budgets.find(b => b.category === newItem.category);
  if (bgt) {
    const totalSpent = db.expenses
      .filter(e => e.category === newItem.category)
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const percentage = (totalSpent / bgt.limitAmount) * 100;
    if (percentage >= 100) {
      db.notifications.unshift({
        id: `notif_${Date.now()}`,
        userId: req.user.id,
        type: 'budget_alert',
        title: `CRITICAL: ${newItem.category} Budget Exceeded!`,
        message: `You spent ₹${totalSpent} exceeding your ₹${bgt.limitAmount} budget for ${newItem.category}.`,
        date: new Date().toISOString().replace('T', ' ').slice(0, 16),
        read: false,
        severity: 'danger'
      });
    } else if (percentage >= 80) {
      db.notifications.unshift({
        id: `notif_${Date.now()}`,
        userId: req.user.id,
        type: 'budget_alert',
        title: `WARNING: ${newItem.category} Budget 80% Reached`,
        message: `You spent ${percentage.toFixed(0)}% (₹${totalSpent}) of your ${newItem.category} budget.`,
        date: new Date().toISOString().replace('T', ' ').slice(0, 16),
        read: false,
        severity: 'warning'
      });
    } else if (percentage >= 50) {
      db.notifications.unshift({
        id: `notif_${Date.now()}`,
        userId: req.user.id,
        type: 'budget_alert',
        title: `NOTICE: ${newItem.category} Budget 50% Used`,
        message: `You have crossed half of your budget for ${newItem.category}.`,
        date: new Date().toISOString().replace('T', ' ').slice(0, 16),
        read: false,
        severity: 'info'
      });
    }
  }

  saveDb(db);
  res.json(newItem);
});

router.put('/expenses/:id', authenticateToken, (req, res) => {
  const db = getDb();
  const index = db.expenses.findIndex(e => e.id === req.params.id);
  if (index !== -1) {
    db.expenses[index] = { ...db.expenses[index], ...req.body };
    saveDb(db);
    return res.json(db.expenses[index]);
  }
  res.status(404).json({ error: 'Expense not found' });
});

router.delete('/expenses/:id', authenticateToken, (req, res) => {
  const db = getDb();
  db.expenses = db.expenses.filter(e => e.id !== req.params.id);
  saveDb(db);
  res.json({ success: true });
});

// ---------------- BUDGETS ----------------
router.post('/budgets', authenticateToken, (req, res) => {
  const db = getDb();
  const existingIndex = db.budgets.findIndex(b => b.category === req.body.category);
  if (existingIndex !== -1) {
    db.budgets[existingIndex].limitAmount = Number(req.body.limitAmount);
    saveDb(db);
    return res.json(db.budgets[existingIndex]);
  }
  const newItem = { id: `bgt_${Date.now()}`, userId: req.user.id, ...req.body };
  db.budgets.push(newItem);
  saveDb(db);
  res.json(newItem);
});

// ---------------- GOALS ----------------
router.post('/goals', authenticateToken, (req, res) => {
  const db = getDb();
  const newItem = { id: `goal_${Date.now()}`, userId: req.user.id, ...req.body };
  db.goals.push(newItem);
  saveDb(db);
  res.json(newItem);
});

router.put('/goals/:id', authenticateToken, (req, res) => {
  const db = getDb();
  const index = db.goals.findIndex(g => g.id === req.params.id);
  if (index !== -1) {
    db.goals[index] = { ...db.goals[index], ...req.body };
    // Check if goal achieved
    if (db.goals[index].currentAmount >= db.goals[index].targetAmount) {
      db.notifications.unshift({
        id: `notif_${Date.now()}`,
        userId: req.user.id,
        type: 'goal_achieved',
        title: `🎉 Goal Achieved: ${db.goals[index].title}!`,
        message: `Congratulations! You reached your target amount of ₹${db.goals[index].targetAmount}.`,
        date: new Date().toISOString().replace('T', ' ').slice(0, 16),
        read: false,
        severity: 'success'
      });
    }
    saveDb(db);
    return res.json(db.goals[index]);
  }
  res.status(404).json({ error: 'Goal not found' });
});

router.delete('/goals/:id', authenticateToken, (req, res) => {
  const db = getDb();
  db.goals = db.goals.filter(g => g.id !== req.params.id);
  saveDb(db);
  res.json({ success: true });
});

// ---------------- INVESTMENTS ----------------
router.post('/investments', authenticateToken, (req, res) => {
  const db = getDb();
  const newItem = { id: `inv_${Date.now()}`, userId: req.user.id, ...req.body };
  db.investments.push(newItem);
  saveDb(db);
  res.json(newItem);
});

router.delete('/investments/:id', authenticateToken, (req, res) => {
  const db = getDb();
  db.investments = db.investments.filter(inv => inv.id !== req.params.id);
  saveDb(db);
  res.json({ success: true });
});

// ---------------- LOANS ----------------
router.post('/loans', authenticateToken, (req, res) => {
  const db = getDb();
  const newItem = { id: `loan_${Date.now()}`, userId: req.user.id, ...req.body };
  db.loans.push(newItem);
  saveDb(db);
  res.json(newItem);
});

router.post('/loans/:id/pay-emi', authenticateToken, (req, res) => {
  const db = getDb();
  const index = db.loans.findIndex(l => l.id === req.params.id);
  if (index !== -1) {
    const loan = db.loans[index];
    loan.outstandingAmount = Math.max(0, loan.outstandingAmount - loan.emiAmount);
    if (loan.remainingMonths > 0) loan.remainingMonths -= 1;

    // Add loan payment expense
    db.expenses.unshift({
      id: `exp_${Date.now()}`,
      userId: req.user.id,
      category: 'EMI',
      amount: loan.emiAmount,
      title: `${loan.name} Payment`,
      date: new Date().toISOString().slice(0, 10),
      notes: 'Paid via EMI action'
    });

    saveDb(db);
    return res.json(loan);
  }
  res.status(404).json({ error: 'Loan not found' });
});

// ---------------- BILLS ----------------
router.post('/bills', authenticateToken, (req, res) => {
  const db = getDb();
  const newItem = { id: `bill_${Date.now()}`, userId: req.user.id, ...req.body };
  db.bills.push(newItem);
  saveDb(db);
  res.json(newItem);
});

router.put('/bills/:id/pay', authenticateToken, (req, res) => {
  const db = getDb();
  const index = db.bills.findIndex(b => b.id === req.params.id);
  if (index !== -1) {
    const bill = db.bills[index];
    bill.isPaid = true;

    // Add expense record
    db.expenses.unshift({
      id: `exp_${Date.now()}`,
      userId: req.user.id,
      category: bill.category === 'Rent' ? 'Miscellaneous' : (bill.category === 'Loan EMI' ? 'EMI' : (bill.category === 'Credit Card' ? 'Shopping' : bill.category)),
      amount: bill.amount,
      title: `${bill.title} Payment`,
      date: new Date().toISOString().slice(0, 10),
      notes: 'Paid from Bill Reminder'
    });

    saveDb(db);
    return res.json(bill);
  }
  res.status(404).json({ error: 'Bill not found' });
});

// ---------------- NOTIFICATIONS ----------------
router.put('/notifications/mark-all-read', authenticateToken, (req, res) => {
  const db = getDb();
  db.notifications.forEach(n => { n.read = true; });
  saveDb(db);
  res.json({ success: true });
});

module.exports = router;
