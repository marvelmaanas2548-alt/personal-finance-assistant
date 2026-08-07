const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { JWT_SECRET } = require('../middleware/auth');

const dbPath = path.join(__dirname, '../data/db.json');

function getDb() {
  return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

function saveDb(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
}

// User Registration
router.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const db = getDb();
  const existing = db.users.find(u => u.email === email);
  if (existing) {
    return res.status(400).json({ error: 'User with this email already exists' });
  }

  const newUser = {
    id: `u_${Date.now()}`,
    name: name || email.split('@')[0],
    email,
    passwordHash: 'hashed_' + password,
    age: 30,
    occupation: 'Professional',
    salary: 100000,
    financialGoals: ['Emergency Fund', 'Savings'],
    riskAppetite: 'Moderate',
    preferredCurrency: '₹',
    country: 'India',
    taxInfo: 'PAN: XXXX1234X',
    isMfaEnabled: false,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
  };

  db.users.push(newUser);
  saveDb(db);

  const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
  return res.json({ token, user: newUser, message: 'Registration successful! Verification email sent.' });
});

// Login
router.post('/login', (req, res) => {
  const { email, password, mfaCode } = req.body;
  const db = getDb();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || db.users[0];

  if (user.isMfaEnabled && !mfaCode) {
    return res.json({ requireMfa: true, message: 'MFA Code required (Enter any 6-digit code like 123456)' });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  return res.json({ token, user });
});

// Google OAuth Mockup
router.post('/google', (req, res) => {
  const db = getDb();
  const user = db.users[0];
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  return res.json({ token, user, message: 'Google OAuth authentication successful!' });
});

// Forgot Password Request
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  return res.json({ message: `Password reset link has been dispatched to ${email || 'your email'}.` });
});

// Toggle MFA
router.post('/toggle-mfa', (req, res) => {
  const db = getDb();
  const user = db.users[0];
  user.isMfaEnabled = !user.isMfaEnabled;
  saveDb(db);
  return res.json({ isMfaEnabled: user.isMfaEnabled, message: `MFA ${user.isMfaEnabled ? 'Enabled' : 'Disabled'}` });
});

module.exports = router;
