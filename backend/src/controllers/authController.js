const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { getRedis } = require('../config/redis');
const { createError } = require('../middleware/errorHandler');

const SALT_ROUNDS = 12;
const REFRESH_PREFIX = 'refresh:';

/** Generate a signed access JWT */
const signAccessToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
  );

/** Generate a signed refresh token (longer-lived) */
const signRefreshToken = (user) =>
  jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d' }
  );

/**
 * POST /api/auth/register
 * Body: { name, email, password }
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return next(createError(400, 'name, email, and password are required'));

    if (password.length < 8)
      return next(createError(400, 'Password must be at least 8 characters'));

    // Check for existing user
    const { rows: existing } = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    if (existing.length > 0)
      return next(createError(409, 'Email already registered'));

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert user + default settings in a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { rows } = await client.query(
        `INSERT INTO users (name, email, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id, name, email, total_points, level, created_at`,
        [name.trim(), email.toLowerCase(), password_hash]
      );
      const user = rows[0];

      await client.query(
        'INSERT INTO user_settings (user_id) VALUES ($1)',
        [user.id]
      );

      await client.query('COMMIT');

      const accessToken = signAccessToken(user);
      const refreshToken = signRefreshToken(user);

      // Store refresh token in Redis (TTL = 30 days)
      const redis = getRedis();
      await redis.set(`${REFRESH_PREFIX}${refreshToken}`, user.id, 'EX', 30 * 24 * 60 * 60);

      return res.status(201).json({
        success: true,
        data: { user, accessToken, refreshToken },
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return next(createError(400, 'email and password are required'));

    const { rows } = await pool.query(
      'SELECT id, name, email, password_hash, total_points, level FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (rows.length === 0)
      return next(createError(401, 'Invalid email or password'));

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid)
      return next(createError(401, 'Invalid email or password'));

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    const redis = getRedis();
    await redis.set(`${REFRESH_PREFIX}${refreshToken}`, user.id, 'EX', 30 * 24 * 60 * 60);

    // Remove password_hash from response
    const { password_hash, ...safeUser } = user;

    return res.json({
      success: true,
      data: { user: safeUser, accessToken, refreshToken },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/refresh
 * Body: { refreshToken }
 */
const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return next(createError(400, 'refreshToken is required'));

    // Verify signature first
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    } catch {
      return next(createError(401, 'Invalid or expired refresh token'));
    }

    // Check Redis (token not blacklisted / revoked)
    const redis = getRedis();
    const stored = await redis.get(`${REFRESH_PREFIX}${refreshToken}`);
    if (!stored)
      return next(createError(401, 'Refresh token has been revoked'));

    const { rows } = await pool.query(
      'SELECT id, name, email, total_points, level FROM users WHERE id = $1',
      [decoded.id]
    );
    if (rows.length === 0)
      return next(createError(401, 'User not found'));

    const user = rows[0];
    const newAccessToken = signAccessToken(user);

    return res.json({ success: true, data: { accessToken: newAccessToken } });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/logout
 * Body: { refreshToken }
 */
const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return next(createError(400, 'refreshToken is required'));

    const redis = getRedis();
    await redis.del(`${REFRESH_PREFIX}${refreshToken}`);

    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, refresh, logout };
