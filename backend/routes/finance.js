const express = require('express');
const router = express.Router();
const { getDb } = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Helper to parse JSON fields on user objects
function parseUser(user) {
  if (!user) return user;
  user.financialGoals = JSON.parse(user.financialGoals || '[]');
  user.isMfaEnabled = !!user.isMfaEnabled;
  return user;
}

// Helper to convert SQLite boolean integers to real booleans
function parseBill(bill) {
  if (!bill) return bill;
  bill.isPaid = !!bill.isPaid;
  bill.isAutoPay = !!bill.isAutoPay;
  return bill;
}

function parseNotification(n) {
  if (!n) return n;
  n.read = !!n.read;
  return n;
}

// ---------------- PROFILE ----------------
router.get('/profile', authenticateToken, async (req, res) => {
  const db = getDb();
  const user = await db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { passwordHash: _, ...safeUser } = user;
  res.json(parseUser(safeUser));
});

router.put('/profile', authenticateToken, async (req, res) => {
  const db = getDb();
  const updates = req.body;

  // Build dynamic SET clause
  const fields = [];
  const values = [];
  for (const [key, value] of Object.entries(updates)) {
    if (key === 'id' || key === 'passwordHash') continue; // Never allow updating these
    if (key === 'financialGoals' && Array.isArray(value)) {
      fields.push(`${key} = ?`);
      values.push(JSON.stringify(value));
    } else if (key === 'isMfaEnabled') {
      fields.push(`${key} = ?`);
      values.push(value ? 1 : 0);
    } else {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (fields.length > 0) {
    values.push(req.user.id);
    await db.run(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
  }

  const user = await db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);
  const { passwordHash: _, ...safeUser } = user;
  res.json(parseUser(safeUser));
});

// ---------------- FULL DASHBOARD / DATA SYNC ----------------
router.get('/all-data', authenticateToken, async (req, res) => {
  const db = getDb();
  const userId = req.user.id;

  const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
  const incomes = await db.all('SELECT * FROM incomes WHERE userId = ? ORDER BY date DESC', [userId]);
  const expenses = await db.all('SELECT * FROM expenses WHERE userId = ? ORDER BY date DESC', [userId]);
  const budgets = await db.all('SELECT * FROM budgets WHERE userId = ?', [userId]);
  const goals = await db.all('SELECT * FROM goals WHERE userId = ?', [userId]);
  const investments = await db.all('SELECT * FROM investments WHERE userId = ?', [userId]);
  const loans = await db.all('SELECT * FROM loans WHERE userId = ?', [userId]);
  const bills = (await db.all('SELECT * FROM bills WHERE userId = ?', [userId])).map(parseBill);
  const notifications = (await db.all('SELECT * FROM notifications WHERE userId = ? ORDER BY date DESC', [userId])).map(parseNotification);

  // Compute live budget spentAmounts
  const updatedBudgets = budgets.map(bgt => {
    const categorySpent = expenses
      .filter(e => e.category === bgt.category)
      .reduce((sum, e) => sum + Number(e.amount), 0);
    return { ...bgt, spentAmount: categorySpent };
  });

  const safeUser = user ? parseUser({ ...user }) : null;
  if (safeUser) delete safeUser.passwordHash;

  res.json({
    user: safeUser,
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
router.post('/incomes', authenticateToken, async (req, res) => {
  const db = getDb();
  const id = `inc_${Date.now()}`;
  const { category, amount, source, date, notes } = req.body;
  await db.run(
    'INSERT INTO incomes (id, userId, category, amount, source, date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, req.user.id, category, amount, source || '', date, notes || '']
  );
  const newItem = await db.get('SELECT * FROM incomes WHERE id = ?', [id]);
  res.json(newItem);
});

router.put('/incomes/:id', authenticateToken, async (req, res) => {
  const db = getDb();
  const item = await db.get('SELECT * FROM incomes WHERE id = ? AND userId = ?', [req.params.id, req.user.id]);
  if (!item) return res.status(404).json({ error: 'Income not found' });

  const { category, amount, source, date, notes } = req.body;
  await db.run(
    'UPDATE incomes SET category = COALESCE(?, category), amount = COALESCE(?, amount), source = COALESCE(?, source), date = COALESCE(?, date), notes = COALESCE(?, notes) WHERE id = ?',
    [category, amount, source, date, notes, req.params.id]
  );
  const updated = await db.get('SELECT * FROM incomes WHERE id = ?', [req.params.id]);
  res.json(updated);
});

router.delete('/incomes/:id', authenticateToken, async (req, res) => {
  const db = getDb();
  await db.run('DELETE FROM incomes WHERE id = ? AND userId = ?', [req.params.id, req.user.id]);
  res.json({ success: true });
});

// ---------------- EXPENSES ----------------
router.post('/expenses', authenticateToken, async (req, res) => {
  const db = getDb();
  const id = `exp_${Date.now()}`;
  const { category, amount, title, date, notes } = req.body;
  await db.run(
    'INSERT INTO expenses (id, userId, category, amount, title, date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, req.user.id, category, amount, title || '', date, notes || '']
  );

  // Check budget limits for this category
  const bgt = await db.get('SELECT * FROM budgets WHERE userId = ? AND category = ?', [req.user.id, category]);
  if (bgt) {
    const totalRow = await db.get(
      'SELECT SUM(amount) as total FROM expenses WHERE userId = ? AND category = ?',
      [req.user.id, category]
    );
    const totalSpent = totalRow?.total || 0;
    const percentage = (totalSpent / bgt.limitAmount) * 100;

    let notif = null;
    if (percentage >= 100) {
      notif = {
        type: 'budget_alert',
        title: `CRITICAL: ${category} Budget Exceeded!`,
        message: `You spent ₹${totalSpent} exceeding your ₹${bgt.limitAmount} budget for ${category}.`,
        severity: 'danger'
      };
    } else if (percentage >= 80) {
      notif = {
        type: 'budget_alert',
        title: `WARNING: ${category} Budget 80% Reached`,
        message: `You spent ${percentage.toFixed(0)}% (₹${totalSpent}) of your ${category} budget.`,
        severity: 'warning'
      };
    } else if (percentage >= 50) {
      notif = {
        type: 'budget_alert',
        title: `NOTICE: ${category} Budget 50% Used`,
        message: `You have crossed half of your budget for ${category}.`,
        severity: 'info'
      };
    }

    if (notif) {
      await db.run(
        'INSERT INTO notifications (id, userId, type, title, message, date, read, severity) VALUES (?, ?, ?, ?, ?, ?, 0, ?)',
        [`notif_${Date.now()}`, req.user.id, notif.type, notif.title, notif.message,
          new Date().toISOString().replace('T', ' ').slice(0, 16), notif.severity]
      );
    }
  }

  const newItem = await db.get('SELECT * FROM expenses WHERE id = ?', [id]);
  res.json(newItem);
});

router.put('/expenses/:id', authenticateToken, async (req, res) => {
  const db = getDb();
  const item = await db.get('SELECT * FROM expenses WHERE id = ? AND userId = ?', [req.params.id, req.user.id]);
  if (!item) return res.status(404).json({ error: 'Expense not found' });

  const { category, amount, title, date, notes } = req.body;
  await db.run(
    'UPDATE expenses SET category = COALESCE(?, category), amount = COALESCE(?, amount), title = COALESCE(?, title), date = COALESCE(?, date), notes = COALESCE(?, notes) WHERE id = ?',
    [category, amount, title, date, notes, req.params.id]
  );
  const updated = await db.get('SELECT * FROM expenses WHERE id = ?', [req.params.id]);
  res.json(updated);
});

router.delete('/expenses/:id', authenticateToken, async (req, res) => {
  const db = getDb();
  await db.run('DELETE FROM expenses WHERE id = ? AND userId = ?', [req.params.id, req.user.id]);
  res.json({ success: true });
});

// ---------------- BUDGETS ----------------
router.post('/budgets', authenticateToken, async (req, res) => {
  const db = getDb();
  const { category, limitAmount } = req.body;

  // Upsert: update if exists, insert otherwise
  const existing = await db.get('SELECT * FROM budgets WHERE userId = ? AND category = ?', [req.user.id, category]);
  if (existing) {
    await db.run('UPDATE budgets SET limitAmount = ? WHERE id = ?', [Number(limitAmount), existing.id]);
    const updated = await db.get('SELECT * FROM budgets WHERE id = ?', [existing.id]);
    return res.json(updated);
  }

  const id = `bgt_${Date.now()}`;
  await db.run(
    'INSERT INTO budgets (id, userId, category, limitAmount) VALUES (?, ?, ?, ?)',
    [id, req.user.id, category, Number(limitAmount)]
  );
  const newItem = await db.get('SELECT * FROM budgets WHERE id = ?', [id]);
  res.json(newItem);
});

// ---------------- GOALS ----------------
router.post('/goals', authenticateToken, async (req, res) => {
  const db = getDb();
  const id = `goal_${Date.now()}`;
  const { title, category, targetAmount, currentAmount, deadline } = req.body;
  await db.run(
    'INSERT INTO goals (id, userId, title, category, targetAmount, currentAmount, deadline) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, req.user.id, title, category, targetAmount, currentAmount || 0, deadline || '']
  );
  const newItem = await db.get('SELECT * FROM goals WHERE id = ?', [id]);
  res.json(newItem);
});

router.put('/goals/:id', authenticateToken, async (req, res) => {
  const db = getDb();
  const item = await db.get('SELECT * FROM goals WHERE id = ? AND userId = ?', [req.params.id, req.user.id]);
  if (!item) return res.status(404).json({ error: 'Goal not found' });

  const { title, category, targetAmount, currentAmount, deadline } = req.body;
  await db.run(
    'UPDATE goals SET title = COALESCE(?, title), category = COALESCE(?, category), targetAmount = COALESCE(?, targetAmount), currentAmount = COALESCE(?, currentAmount), deadline = COALESCE(?, deadline) WHERE id = ?',
    [title, category, targetAmount, currentAmount, deadline, req.params.id]
  );

  const updated = await db.get('SELECT * FROM goals WHERE id = ?', [req.params.id]);

  // Check if goal achieved
  if (updated.currentAmount >= updated.targetAmount) {
    await db.run(
      'INSERT INTO notifications (id, userId, type, title, message, date, read, severity) VALUES (?, ?, ?, ?, ?, ?, 0, ?)',
      [
        `notif_${Date.now()}`, req.user.id, 'goal_achieved',
        `🎉 Goal Achieved: ${updated.title}!`,
        `Congratulations! You reached your target amount of ₹${updated.targetAmount}.`,
        new Date().toISOString().replace('T', ' ').slice(0, 16),
        'success'
      ]
    );
  }

  res.json(updated);
});

router.delete('/goals/:id', authenticateToken, async (req, res) => {
  const db = getDb();
  await db.run('DELETE FROM goals WHERE id = ? AND userId = ?', [req.params.id, req.user.id]);
  res.json({ success: true });
});

// ---------------- INVESTMENTS ----------------
router.post('/investments', authenticateToken, async (req, res) => {
  const db = getDb();
  const id = `inv_${Date.now()}`;
  const { name, type, amountInvested, currentValue, purchaseDate } = req.body;
  await db.run(
    'INSERT INTO investments (id, userId, name, type, amountInvested, currentValue, purchaseDate) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, req.user.id, name, type, amountInvested, currentValue, purchaseDate || '']
  );
  const newItem = await db.get('SELECT * FROM investments WHERE id = ?', [id]);
  res.json(newItem);
});

router.delete('/investments/:id', authenticateToken, async (req, res) => {
  const db = getDb();
  await db.run('DELETE FROM investments WHERE id = ? AND userId = ?', [req.params.id, req.user.id]);
  res.json({ success: true });
});

// ---------------- LOANS ----------------
router.post('/loans', authenticateToken, async (req, res) => {
  const db = getDb();
  const id = `loan_${Date.now()}`;
  const { name, type, totalAmount, outstandingAmount, interestRate, emiAmount, dueDate, remainingMonths } = req.body;
  await db.run(
    'INSERT INTO loans (id, userId, name, type, totalAmount, outstandingAmount, interestRate, emiAmount, dueDate, remainingMonths) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, req.user.id, name, type, totalAmount, outstandingAmount, interestRate, emiAmount, dueDate || '', remainingMonths || 0]
  );
  const newItem = await db.get('SELECT * FROM loans WHERE id = ?', [id]);
  res.json(newItem);
});

router.post('/loans/:id/pay-emi', authenticateToken, async (req, res) => {
  const db = getDb();
  const loan = await db.get('SELECT * FROM loans WHERE id = ? AND userId = ?', [req.params.id, req.user.id]);
  if (!loan) return res.status(404).json({ error: 'Loan not found' });

  const newOutstanding = Math.max(0, loan.outstandingAmount - loan.emiAmount);
  const newMonths = Math.max(0, loan.remainingMonths - 1);

  await db.run('UPDATE loans SET outstandingAmount = ?, remainingMonths = ? WHERE id = ?', [newOutstanding, newMonths, req.params.id]);

  // Add loan payment expense
  const expId = `exp_${Date.now()}`;
  await db.run(
    'INSERT INTO expenses (id, userId, category, amount, title, date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [expId, req.user.id, 'EMI', loan.emiAmount, `${loan.name} Payment`, new Date().toISOString().slice(0, 10), 'Paid via EMI action']
  );

  const updated = await db.get('SELECT * FROM loans WHERE id = ?', [req.params.id]);
  res.json(updated);
});

// ---------------- BILLS ----------------
router.post('/bills', authenticateToken, async (req, res) => {
  const db = getDb();
  const id = `bill_${Date.now()}`;
  const { title, category, amount, dueDate, isAutoPay } = req.body;
  await db.run(
    'INSERT INTO bills (id, userId, title, category, amount, dueDate, isPaid, isAutoPay) VALUES (?, ?, ?, ?, ?, ?, 0, ?)',
    [id, req.user.id, title, category, amount, dueDate || '', isAutoPay ? 1 : 0]
  );
  const newItem = await db.get('SELECT * FROM bills WHERE id = ?', [id]);
  res.json(parseBill(newItem));
});

router.put('/bills/:id/pay', authenticateToken, async (req, res) => {
  const db = getDb();
  const bill = await db.get('SELECT * FROM bills WHERE id = ? AND userId = ?', [req.params.id, req.user.id]);
  if (!bill) return res.status(404).json({ error: 'Bill not found' });

  await db.run('UPDATE bills SET isPaid = 1 WHERE id = ?', [req.params.id]);

  // Add expense record
  const expCategory = bill.category === 'Rent' ? 'Miscellaneous' : (bill.category === 'Loan EMI' ? 'EMI' : (bill.category === 'Credit Card' ? 'Shopping' : bill.category));
  const expId = `exp_${Date.now()}`;
  await db.run(
    'INSERT INTO expenses (id, userId, category, amount, title, date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [expId, req.user.id, expCategory, bill.amount, `${bill.title} Payment`, new Date().toISOString().slice(0, 10), 'Paid from Bill Reminder']
  );

  const updated = await db.get('SELECT * FROM bills WHERE id = ?', [req.params.id]);
  res.json(parseBill(updated));
});

// ---------------- NOTIFICATIONS ----------------
router.put('/notifications/mark-all-read', authenticateToken, async (req, res) => {
  const db = getDb();
  await db.run('UPDATE notifications SET read = 1 WHERE userId = ?', [req.user.id]);
  res.json({ success: true });
});

module.exports = router;
