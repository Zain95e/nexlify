const { pool } = require('../config/db');

/**
 * PointsService handles user points and level progression
 */
const PointsService = {
  /**
   * Adds points to a user and handles potential level-up logic
   * @param {string} userId - UUID of the user
   * @param {number} points - Amount of points to add
   */
  async addPoints(userId, points) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Update total_points and calculate new level
      // Basic logic: every 1000 points = 1 level
      const updateQuery = `
        UPDATE users 
        SET 
          total_points = GREATEST(total_points + $1, 0),
          level = FLOOR(GREATEST(total_points + $1, 0) / 1000) + 1
        WHERE id = $2
        RETURNING total_points, level;
      `;
      
      const result = await client.query(updateQuery, [points, userId]);
      
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('[PointsService] Error adding points:', error);
      throw error;
    } finally {
      client.release();
    }
  }
};

module.exports = PointsService;
