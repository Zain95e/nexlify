require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const { connectDB } = require('./config/db');
const { connectRedis } = require('./config/redis');
const { errorHandler } = require('./middleware/errorHandler');

// Routes
const healthRouter = require('./routes/health');
const authRouter = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);

// 404 fallthrough handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: { message: `Route ${req.method} ${req.originalUrl} not found` } });
});

// Central error handler (must be last)
app.use(errorHandler);

// ── Boot ───────────────────────────────────────────────────────────────────
const start = async () => {
  await connectDB();
  connectRedis();

  app.listen(PORT, () => {
    console.log(`[Server] Nexlify backend running on http://localhost:${PORT}`);
    console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

start().catch((err) => {
  console.error('[Server] Failed to start:', err);
  process.exit(1);
});
