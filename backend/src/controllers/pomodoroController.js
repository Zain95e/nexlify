const { pool } = require('../config/db');
const { createError } = require('../middleware/errorHandler');
const PointsService = require('../services/pointsService');

const pomodoroController = {
  // 8.1.3-8.1.5 POST /api/pomodoro
  async logSession(req, res, next) {
    try {
      const userId = req.user.id;
      const { start_time, end_time, duration_minutes, was_completed } = req.body;

      if (!start_time || duration_minutes === undefined || was_completed === undefined) {
        return next(createError(400, 'start_time, duration_minutes, and was_completed are required'));
      }

      const query = `
        INSERT INTO pomodoro_sessions (user_id, start_time, end_time, duration_minutes, was_completed)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      const result = await pool.query(query, [
        userId,
        start_time,
        end_time || null,
        duration_minutes,
        was_completed
      ]);

      const session = result.rows[0];

      // Award +15 pts
      let pointsData = null;
      if (was_completed) {
        pointsData = await PointsService.addPoints(userId, 15);
      }

      res.status(201).json({
        status: 'success',
        data: {
          session,
          points: pointsData
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/pomodoro/today → today's completed sessions + total minutes
  async getTodayStats(req, res, next) {
    try {
      const userId = req.user.id;
      const query = `
        SELECT
          COUNT(*) FILTER (WHERE was_completed = true)::int  AS count,
          COALESCE(SUM(duration_minutes) FILTER (WHERE was_completed = true), 0)::int AS total_minutes
        FROM pomodoro_sessions
        WHERE user_id = $1
          AND start_time::date = CURRENT_DATE
      `;
      const result = await pool.query(query, [userId]);
      res.status(200).json({ status: 'success', data: result.rows[0] });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = pomodoroController;
