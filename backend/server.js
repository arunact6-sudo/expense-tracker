require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./config/db');

const app = express();

// CORS
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:4200',
  'http://localhost:4000'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true
}));
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan('combined'));
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/wallets', require('./routes/walletRoutes'));
app.use('/api/budgets', require('./routes/budgetRoutes'));
app.use('/api/bills', require('./routes/billRoutes'));
app.use('/api/savings-goals', require('./routes/savingsGoalRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/backup', require('./routes/backupRoutes'));

// Settings routes — persisted in MongoDB
const { protect } = require('./middleware/auth');
const Settings = require('./models/Settings');

app.get('/api/settings', protect, async (req, res) => {
  try {
    let settings = await Settings.findOne({ user: req.user._id });
    if (!settings) {
      settings = await Settings.create({ user: req.user._id });
    }
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/settings', protect, async (req, res) => {
  try {
    let settings = await Settings.findOne({ user: req.user._id });
    if (!settings) {
      settings = await Settings.create({ user: req.user._id, ...req.body });
    } else {
      Object.assign(settings, req.body);
      await settings.save();
    }
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Expense Tracker API is running', timestamp: new Date() });
});

// Serve Angular frontend in production
const frontendPath = path.join(__dirname, '..', 'web', 'dist', 'expense-tracker-web', 'browser');
app.use(express.static(frontendPath));

// SPA fallback — serve index.html for all non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(frontendPath, 'index.html'));
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, error: 'File size exceeds the 5MB limit' });
    }
    return res.status(400).json({ success: false, error: err.message });
  }

  if (err.message === 'Only image files are allowed (jpg, jpeg, png, gif, webp)') {
    return res.status(400).json({ success: false, error: err.message });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });

  process.on('unhandledRejection', (err) => {
    console.log(`Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      mongoose.connection.close(false, () => {
        console.log('MongoDB connection closed.');
        process.exit(0);
      });
    });
  });
});

module.exports = app;
