const express = require('express');
const { pool } = require('../config/db');
const { getRedis } = require('../config/redis');

const router = express.Router();

/**
 * GET /api/health
 * Returns status of the API, database, and Redis.
 */
router.get('/', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: 'unknown',
      redis: 'unknown',
    },
  };

  // Check PostgreSQL
  try {
    await pool.query('SELECT 1');
    health.services.database = 'ok';
  } catch {
    health.services.database = 'error';
    health.status = 'degraded';
  }

  // Check Redis
  try {
    const redis = getRedis();
    await redis.ping();
    health.services.redis = 'ok';
  } catch {
    health.services.redis = 'error';
    health.status = 'degraded';
  }

  const httpStatus = health.status === 'ok' ? 200 : 503;
  res.status(httpStatus).json(health);
});

module.exports = router;
