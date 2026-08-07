const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const financeRoutes = require('./routes/finance');
const aiAdvisorRoutes = require('./routes/aiAdvisor');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/ai', aiAdvisorRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Personal Finance Assistant API running cleanly!' });
});

app.listen(PORT, () => {
  console.log(`Finance Backend Server running on http://localhost:${PORT}`);
});
