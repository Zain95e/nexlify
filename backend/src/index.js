require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const { connectDB } = require('./config/db');
const { connectRedis } = require('./config/redis');
const { errorHandler } = require('./middleware/errorHandler');
const ReminderService = require('./services/reminderService');

// Routes
const healthRouter = require('./routes/health');
const authRouter = require('./routes/auth');
const taskRouter = require('./routes/taskRoutes');
const screenTimeRouter = require('./routes/screenTimeRoutes');
const blockingRouter = require('./routes/blockingRoutes');
const detoxRouter = require('./routes/detoxRoutes');
const diaryRouter = require('./routes/diaryRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/tasks', taskRouter);
app.use('/api/screentime', screenTimeRouter);
app.use('/api/blocking', blockingRouter);
app.use('/api/detox', detoxRouter);
app.use('/api/diary', diaryRouter);

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

  // Initialize automated services
  ReminderService.init();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Nexlify backend running on http://0.0.0.0:${PORT}`);
    console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

start().catch((err) => {
  console.error('[Server] Failed to start:', err);
  process.exit(1);
});
