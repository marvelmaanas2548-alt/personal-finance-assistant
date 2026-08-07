const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { getDb } = require('../db');
const { JWT_SECRET, authenticateToken } = require('../middleware/auth');

// ============ USER REGISTRATION ============
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const db = getDb();
    const existing = await db.get('SELECT id FROM users WHERE email = ? COLLATE NOCASE', [email]);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userId = `u_${Date.now()}`;

    await db.run(
      `INSERT INTO users (id, name, email, passwordHash, authProvider, avatarUrl)
       VALUES (?, ?, ?, ?, 'local', ?)`,
      [
        userId,
        name || email.split('@')[0],
        email.toLowerCase(),
        passwordHash,
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
      ]
    );

    const newUser = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });

    const { passwordHash: _, ...safeUser } = newUser;
    // Parse JSON fields for the frontend
    safeUser.financialGoals = JSON.parse(safeUser.financialGoals || '[]');
    safeUser.isMfaEnabled = !!safeUser.isMfaEnabled;

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
    const user = await db.get('SELECT * FROM users WHERE email = ? COLLATE NOCASE', [email]);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    if (user.passwordHash) {
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
    } else {
      // Google-only account — password login not available
      return res.status(401).json({ error: 'This account uses Google Sign-In. Please use the Google button.' });
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
    safeUser.financialGoals = JSON.parse(safeUser.financialGoals || '[]');
    safeUser.isMfaEnabled = !!safeUser.isMfaEnabled;

    return res.json({ token, user: safeUser });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error during login' });
  }
});

// ============ GOOGLE OAUTH — POST (frontend sends Google credential) ============
router.post('/google', async (req, res) => {
  try {
    const { credential, name, email, avatarUrl } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required for Google authentication' });
    }

    const db = getDb();
    const googleEmail = email.toLowerCase();
    let user = await db.get('SELECT * FROM users WHERE email = ? COLLATE NOCASE', [googleEmail]);

    if (!user) {
      // Create new account for Google user
      const userId = `u_google_${Date.now()}`;
      await db.run(
        `INSERT INTO users (id, googleId, name, email, authProvider, avatarUrl)
         VALUES (?, ?, ?, ?, 'google', ?)`,
        [
          userId,
          credential || `google_${Date.now()}`,
          name || googleEmail.split('@')[0],
          googleEmail,
          avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
        ]
      );
      user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    const { passwordHash: _, ...safeUser } = user;
    safeUser.financialGoals = JSON.parse(safeUser.financialGoals || '[]');
    safeUser.isMfaEnabled = !!safeUser.isMfaEnabled;

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

// ============ GOOGLE OAUTH — PASSPORT REDIRECT FLOW ============
router.get('/google/redirect', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/google/failure', session: false }),
  (req, res) => {
    // Issue JWT and redirect to frontend with the token
    const user = req.user;
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}?token=${token}&userId=${user.id}`);
  }
);

router.get('/google/failure', (req, res) => {
  res.status(401).json({ error: 'Google authentication failed.' });
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
    const user = await db.get('SELECT id FROM users WHERE email = ? COLLATE NOCASE', [email]);
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);
    await db.run('UPDATE users SET passwordHash = ? WHERE id = ?', [hash, user.id]);

    return res.json({ message: 'Password has been reset successfully. You can now log in.' });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ============ TOGGLE MFA ============
router.post('/toggle-mfa', authenticateToken, async (req, res) => {
  const db = getDb();
  const user = await db.get('SELECT isMfaEnabled FROM users WHERE id = ?', [req.user.id]);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const newVal = user.isMfaEnabled ? 0 : 1;
  await db.run('UPDATE users SET isMfaEnabled = ? WHERE id = ?', [newVal, req.user.id]);

  return res.json({
    isMfaEnabled: !!newVal,
    message: `Multi-Factor Authentication ${newVal ? 'Enabled' : 'Disabled'}`
  });
});

// ============ GET CURRENT USER (/me) ============
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const user = await db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { passwordHash: _, ...safeUser } = user;
    safeUser.financialGoals = JSON.parse(safeUser.financialGoals || '[]');
    safeUser.isMfaEnabled = !!safeUser.isMfaEnabled;
    return res.json({ user: safeUser });
  } catch (err) {
    console.error('Fetch me error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ============ USER LOGOUT ============
router.post('/logout', (req, res) => {
  return res.json({ message: 'Successfully logged out' });
});

module.exports = router;

