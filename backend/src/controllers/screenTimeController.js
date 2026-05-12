const { pool } = require('../config/db');
const { createError } = require('../middleware/errorHandler');

/**
 * POST /api/screentime
 * Body: { records: [{ app_name, app_package, category, duration_minutes }] }
 * Upserts today's screen time. If a row for (user_id, app_package, session_date) already
 * exists, its duration_minutes is replaced with the new value (WorkManager sends
 * cumulative 24-hour totals, not deltas).
 */
const upsertScreenTime = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { records } = req.body;

    if (!Array.isArray(records) || records.length === 0)
      return next(createError(400, 'records must be a non-empty array'));

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const rec of records) {
        const { app_name, app_package, category, duration_minutes } = rec;

        if (!app_name || !app_package || duration_minutes == null)
          continue; // skip malformed entries silently

        const cat = ['social', 'productivity', 'entertainment', 'other'].includes(
          String(category).toLowerCase()
        )
          ? String(category).toLowerCase()
          : 'other';

        await client.query(
          `INSERT INTO screen_time (user_id, app_name, app_package, category, duration_minutes, session_date)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (user_id, app_package, session_date)
           DO UPDATE SET
             duration_minutes = EXCLUDED.duration_minutes,
             app_name         = EXCLUDED.app_name,
             category         = EXCLUDED.category`,
          [userId, app_name, app_package, cat, duration_minutes, today]
        );
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    return res.status(200).json({ success: true, message: 'Screen time synced' });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/screentime/daily
 * Returns today's screen time grouped by app, sorted by duration desc.
 */
const getDaily = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().slice(0, 10);

    const { rows } = await pool.query(
      `SELECT
         app_name,
         app_package,
         category,
         duration_minutes,
         session_date
       FROM screen_time
       WHERE user_id = $1 AND session_date = $2
       ORDER BY duration_minutes DESC`,
      [userId, today]
    );

    const totalMinutes = rows.reduce((sum, r) => sum + r.duration_minutes, 0);

    return res.json({
      success: true,
      data: {
        date: today,
        total_minutes: totalMinutes,
        apps: rows,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/screentime/weekly
 * Returns the past 7 days, each day showing: date, total_minutes,
 * and a breakdown by category.
 */
const getWeekly = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { rows } = await pool.query(
      `SELECT
         session_date,
         category,
         SUM(duration_minutes) AS total_minutes
       FROM screen_time
       WHERE user_id = $1
         AND session_date >= CURRENT_DATE - INTERVAL '6 days'
       GROUP BY session_date, category
       ORDER BY session_date ASC, category ASC`,
      [userId]
    );

    // Reshape: { "2026-05-06": { total: 120, social: 60, productivity: 30, ... }, ... }
    const byDay = {};
    for (const row of rows) {
      const d = row.session_date.toISOString().slice(0, 10);
      if (!byDay[d]) byDay[d] = { date: d, total_minutes: 0 };
      byDay[d][row.category] = Number(row.total_minutes);
      byDay[d].total_minutes += Number(row.total_minutes);
    }

    return res.json({
      success: true,
      data: Object.values(byDay),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/screentime/monthly
 * Returns past 30 days — one row per day with total_minutes.
 */
const getMonthly = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { rows } = await pool.query(
      `SELECT
         session_date,
         SUM(duration_minutes) AS total_minutes
       FROM screen_time
       WHERE user_id = $1
         AND session_date >= CURRENT_DATE - INTERVAL '29 days'
       GROUP BY session_date
       ORDER BY session_date ASC`,
      [userId]
    );

    const data = rows.map((r) => ({
      date: r.session_date.toISOString().slice(0, 10),
      total_minutes: Number(r.total_minutes),
    }));

    return res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/screentime/limits
 * Returns user's app limits.
 */
const getLimits = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { rows } = await pool.query(
      `SELECT id, app_package, daily_limit_minutes
       FROM app_limits
       WHERE user_id = $1
       ORDER BY app_package ASC`,
      [userId]
    );

    return res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/screentime/limits
 * Body: { limits: [{ app_package, daily_limit_minutes }] }
 * Upserts limits for the given apps (one at a time, keyed by app_package per user).
 */
const setLimits = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { limits } = req.body;

    if (!Array.isArray(limits) || limits.length === 0)
      return next(createError(400, 'limits must be a non-empty array'));

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const lim of limits) {
        const { app_package, daily_limit_minutes } = lim;
        if (!app_package || daily_limit_minutes == null) continue;

        if (daily_limit_minutes < 0)
          return next(createError(400, 'daily_limit_minutes must be >= 0'));

        await client.query(
          `INSERT INTO app_limits (user_id, app_package, daily_limit_minutes)
           VALUES ($1, $2, $3)
           ON CONFLICT (user_id, app_package)
           DO UPDATE SET daily_limit_minutes = EXCLUDED.daily_limit_minutes`,
          [userId, app_package, daily_limit_minutes]
        );
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    return res.json({ success: true, message: 'Limits updated' });
  } catch (err) {
    next(err);
  }
};

module.exports = { upsertScreenTime, getDaily, getWeekly, getMonthly, getLimits, setLimits };
