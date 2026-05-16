const { pool } = require('../config/db');

const detoxController = {
  // 5.2.4 Log session start
  async startSession(req, res, next) {
    try {
      const { planned_duration_minutes, started_at } = req.body;
      const userId = req.user.id;

      const query = `
        INSERT INTO detox_sessions (user_id, started_at, planned_duration_minutes, break_count)
        VALUES ($1, $2, $3, 0)
        RETURNING *;
      `;
      
      const result = await pool.query(query, [userId, started_at || new Date(), planned_duration_minutes]);

      res.status(201).json({
        status: 'success',
        data: result.rows[0]
      });
    } catch (error) {
      next(error);
    }
  },

  // 5.2.4 Log session end / breaks
  async endSession(req, res, next) {
    try {
      const { id } = req.params;
      const { ended_at, break_count } = req.body;
      const userId = req.user.id;

      const query = `
        UPDATE detox_sessions
        SET ended_at = $1, break_count = $2
        WHERE id = $3 AND user_id = $4
        RETURNING *;
      `;
      
      const result = await pool.query(query, [ended_at || new Date(), break_count || 0, id, userId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ status: 'fail', message: 'Session not found' });
      }

      res.status(200).json({
        status: 'success',
        data: result.rows[0]
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = detoxController;
