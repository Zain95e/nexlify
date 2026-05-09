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

  // Check Redis (with timeout)
  try {
    const redis = getRedis();
    // Race the ping against a 2s timeout
    await Promise.race([
      redis.ping(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
    ]);
    health.services.redis = 'ok';
  } catch (error) {
    console.error('[Health] Redis check failed:', error.message);
    health.services.redis = 'error';
    health.status = 'degraded';
  }

  const httpStatus = health.status === 'ok' ? 200 : 503;
  res.status(httpStatus).json(health);
});

module.exports = router;
