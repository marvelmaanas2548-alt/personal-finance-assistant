const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
require('dotenv').config();

const { initDatabase } = require('./db');
const passport = require('./config/passport');

const authRoutes = require('./routes/auth');
const financeRoutes = require('./routes/finance');
const aiAdvisorRoutes = require('./routes/aiAdvisor');
const bankRoutes = require('./routes/bank');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Session (required for Passport)
app.use(session({
  secret: process.env.SESSION_SECRET || 'finance_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 7 * 24 * 60 * 60 * 1000 } // 7 days
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString().slice(11, 19);
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// ==================== API Routes ====================
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);  // Also mount at /auth for Google OAuth redirect flow
app.use('/api/finance', financeRoutes);
app.use('/api/ai', aiAdvisorRoutes);
app.use('/api/bank', bankRoutes);
app.use('/api/admin/db', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Personalized Finance Backend API is running with SQLite + Google OAuth',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    database: 'SQLite',
    endpoints: {
      auth: '/api/auth (register, login, google, forgot-password, reset-password)',
      finance: '/api/finance (incomes, expenses, budgets, goals, investments, loans, bills, notifications)',
      ai: '/api/ai (insights, chat)',
      bank: '/api/bank (connect-account, cibil-score, loan-eligibility, best-emi-options)'
    }
  });
});

// Serve frontend static build in production
const frontendDistPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/auth')) return next();
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({
      status: 'OK',
      message: 'Personalized Finance Assistant Backend API is online!',
      frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
      version: '2.0.0',
      database: 'SQLite',
      endpoints: {
        health: '/api/health',
        auth: '/api/auth (register, login, google, forgot-password)',
        finance: '/api/finance (all-data, incomes, expenses, budgets, goals, investments, loans, bills)',
        ai: '/api/ai (insights, chat)',
        bank: '/api/bank (connect-account, cibil-score, loan-eligibility, best-emi-options)'
      }
    });
  });
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found.` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// ==================== Initialize DB & Start Server ====================
async function startServer() {
  try {
    await initDatabase();

    app.listen(PORT, () => {
      console.log('');
      console.log('╔════════════════════════════════════════════════════════════╗');
      console.log('║   Personalized Finance Backend API Server v2.0            ║');
      console.log(`║   Running on: http://localhost:${PORT}                       ║`);
      console.log('║   Database:   SQLite (data/database.sqlite)               ║');
      console.log('║   Auth:       JWT + Google OAuth + bcrypt + Passport      ║');
      console.log('║   Bank Sync:  Open Banking + CIBIL Score & EMI Engine     ║');
      console.log('╚════════════════════════════════════════════════════════════╝');
      console.log('');
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
