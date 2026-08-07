const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const financeRoutes = require('./routes/finance');
const aiAdvisorRoutes = require('./routes/aiAdvisor');
const bankRoutes = require('./routes/bank');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString().slice(11, 19);
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// ==================== API Routes ====================
app.use('/api/auth', authRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/ai', aiAdvisorRoutes);
app.use('/api/bank', bankRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Personalized Finance Backend API is running cleanly',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
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
    if (req.originalUrl.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({
      status: 'OK',
      message: 'Personalized Finance Personal Assistant Backend API is online!',
      frontendUrl: 'http://localhost:5173',
      version: '1.0.0',
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

// ==================== Start Server ====================
app.listen(PORT, () => {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║   Personalized Finance Backend API Server             ║');
  console.log(`║   Running on: http://localhost:${PORT}                   ║`);
  console.log('║   Database:   data/db.json                            ║');
  console.log('║   Auth:       JWT + Google OAuth + bcrypt              ║');
  console.log('║   Bank Sync:  Open Banking + CIBIL Score & EMI Engine  ║');
  console.log('╚═══════════════════════════════════════════════════════╝');
  console.log('');
});
