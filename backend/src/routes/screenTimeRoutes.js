const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middleware/authenticateJWT');
const {
  upsertScreenTime,
  getDaily,
  getWeekly,
  getMonthly,
  getLimits,
  setLimits,
} = require('../controllers/screenTimeController');

// All routes require a valid JWT
router.use(authenticateJWT);

// 3.2.1  POST   /api/screentime          — sync usage records from device
router.post('/', upsertScreenTime);

// 3.2.2  GET    /api/screentime/daily    — today's usage grouped by app
router.get('/daily', getDaily);

// 3.2.3  GET    /api/screentime/weekly   — past 7 days aggregated by day
router.get('/weekly', getWeekly);

// 3.2.4  GET    /api/screentime/monthly  — past 30 days totals per day
router.get('/monthly', getMonthly);

// 3.2.5  GET    /api/screentime/limits   — user's app limits
router.get('/limits', getLimits);

// 3.2.6  PUT    /api/screentime/limits   — set/update limits per app
router.put('/limits', setLimits);

module.exports = router;
