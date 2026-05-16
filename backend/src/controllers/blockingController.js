const { pool } = require('../config/db');

const blockingController = {
  // 5.1.5 POST /api/blocking/overrides - Sync override events to backend
  async recordOverride(req, res, next) {
    try {
      const { app_package } = req.body;
      const userId = req.user.id;

      if (!app_package) {
        return res.status(400).json({ status: 'fail', message: 'app_package is required' });
      }

      const query = `
        INSERT INTO blocking_overrides (user_id, app_package, overridden_at)
        VALUES ($1, $2, NOW())
        RETURNING *;
      `;
      
      const result = await pool.query(query, [userId, app_package]);

      res.status(201).json({
        status: 'success',
        data: result.rows[0]
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = blockingController;
