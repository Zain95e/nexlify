const Redis = require('ioredis');

let redisClient;

const connectRedis = () => {
  redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    lazyConnect: false,
  });

  redisClient.on('connect', () => {
    console.log('[Redis] Connected successfully');
  });

  redisClient.on('error', (err) => {
    console.error('[Redis] Connection error:', err.message);
  });

  redisClient.on('reconnecting', () => {
    console.warn('[Redis] Reconnecting...');
  });

  return redisClient;
};

const getRedis = () => {
  if (!redisClient) throw new Error('Redis not initialised — call connectRedis() first');
  return redisClient;
};

module.exports = { connectRedis, getRedis };
