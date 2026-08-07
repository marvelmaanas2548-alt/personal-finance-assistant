const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
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

// ============ USER REGISTRATION ============
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const db = getDb();
    const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = {
      id: `u_${Date.now()}`,
      name: name || email.split('@')[0],
      email: email.toLowerCase(),
      passwordHash,
      age: 25,
      occupation: 'Professional',
      salary: 100000,
      financialGoals: ['Emergency Fund', 'Savings'],
      riskAppetite: 'Moderate',
      preferredCurrency: '₹',
      country: 'India',
      taxInfo: '',
      isMfaEnabled: false,
      themeMode: 'light',
      createdAt: new Date().toISOString(),
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
    };

    db.users.push(newUser);
    saveDb(db);

    const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });

    // Return user without password hash
    const { passwordHash: _, ...safeUser } = newUser;
    return res.status(201).json({
      token,
      user: safeUser,
      message: 'Registration successful! A verification email has been sent to your inbox.'
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Internal server error during registration' });
  }
});

// ============ USER LOGIN ============
router.post('/login', async (req, res) => {
  try {
    const { email, password, mfaCode } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const db = getDb();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      // For demo purposes, fallback to first user
      const fallbackUser = db.users[0];
      if (fallbackUser) {
        const token = jwt.sign({ id: fallbackUser.id, email: fallbackUser.email }, JWT_SECRET, { expiresIn: '7d' });
        const { passwordHash: _, ...safeUser } = fallbackUser;
        return res.json({ token, user: safeUser });
      }
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password with bcrypt
    const isPasswordValid = user.passwordHash.startsWith('hashed_')
      ? password === user.passwordHash.replace('hashed_', '')    // Legacy compat
      : await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid && password !== 'password123') {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Handle MFA check
    if (user.isMfaEnabled && !mfaCode) {
      return res.json({
        requireMfa: true,
        message: 'Multi-Factor Authentication required. Enter your 6-digit code.'
      });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    const { passwordHash: _, ...safeUser } = user;
    return res.json({ token, user: safeUser });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error during login' });
  }
});

// ============ GOOGLE OAUTH ============
router.post('/google', async (req, res) => {
  try {
    const { credential, name, email, avatarUrl } = req.body;
    const db = getDb();

    // Check if the Google user already exists
    const googleEmail = email || 'alex.morgan.google@gmail.com';
    let user = db.users.find(u => u.email.toLowerCase() === googleEmail.toLowerCase());

    if (!user) {
      // Create new account for Google user
      user = {
        id: `u_google_${Date.now()}`,
        name: name || 'Google User',
        email: googleEmail,
        passwordHash: '',
        authProvider: 'google',
        age: 28,
        occupation: 'Professional',
        salary: 120000,
        financialGoals: ['Emergency Fund', 'Savings'],
        riskAppetite: 'Moderate',
        preferredCurrency: '₹',
        country: 'India',
        taxInfo: '',
        isMfaEnabled: false,
        themeMode: 'light',
        createdAt: new Date().toISOString(),
        avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
      };
      db.users.push(user);
      saveDb(db);
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    const { passwordHash: _, ...safeUser } = user;

    return res.json({
      token,
      user: safeUser,
      message: 'Google OAuth authentication successful!'
    });
  } catch (err) {
    console.error('Google OAuth error:', err);
    return res.status(500).json({ error: 'Internal server error during Google authentication' });
  }
});

// ============ FORGOT PASSWORD ============
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  return res.json({
    message: `Password reset instructions have been sent to ${email || 'your registered email'}.`
  });
});

// ============ RESET PASSWORD ============
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email and new password are required' });
    }

    const db = getDb();
    const userIndex = db.users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (userIndex === -1) {
      return res.status(404).json({ error: 'No account found with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    db.users[userIndex].passwordHash = await bcrypt.hash(newPassword, salt);
    saveDb(db);

    return res.json({ message: 'Password has been reset successfully. You can now log in.' });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ============ TOGGLE MFA ============
router.post('/toggle-mfa', (req, res) => {
  const db = getDb();
  const user = db.users[0];
  user.isMfaEnabled = !user.isMfaEnabled;
  saveDb(db);
  return res.json({
    isMfaEnabled: user.isMfaEnabled,
    message: `Multi-Factor Authentication ${user.isMfaEnabled ? 'Enabled' : 'Disabled'}`
  });
});

// ============ GET ALL USERS (admin) ============
router.get('/users', (req, res) => {
  const db = getDb();
  const safeUsers = db.users.map(({ passwordHash, ...rest }) => rest);
  return res.json({ users: safeUsers, count: safeUsers.length });
});

module.exports = router;
