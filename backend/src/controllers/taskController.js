const { pool } = require('../config/db');
const PointsService = require('../services/pointsService');

const taskController = {
  // 4.1.1 POST /api/tasks - Create task
  async createTask(req, res, next) {
    try {
      const { title, description, category, priority, deadline } = req.body;
      const userId = req.user.id;

      const query = `
        INSERT INTO tasks (user_id, title, description, category, priority, deadline)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
      `;
      
      const result = await pool.query(query, [
        userId,
        title,
        description,
        category || 'other',
        priority || 'medium',
        deadline
      ]);

      res.status(201).json({
        status: 'success',
        data: result.rows[0]
      });
    } catch (error) {
      next(error);
    }
  },

  // 4.1.2 GET /api/tasks - Get all tasks with filter
  async getTasks(req, res, next) {
    try {
      const userId = req.user.id;
      const { status } = req.query;

      let query = 'SELECT * FROM tasks WHERE user_id = $1';
      const params = [userId];

      if (status === 'pending') {
        query += ' AND is_completed = false';
      } else if (status === 'completed') {
        query += ' AND is_completed = true';
      }

      query += ' ORDER BY created_at DESC';

      const result = await pool.query(query, params);

      res.status(200).json({
        status: 'success',
        results: result.rows.length,
        data: result.rows
      });
    } catch (error) {
      next(error);
    }
  },

  // 4.1.3 PATCH /api/tasks/:id/complete - Mark complete and award points
  async completeTask(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // 1. Mark task as complete
      const updateTaskQuery = `
        UPDATE tasks 
        SET is_completed = true, completed_at = NOW() 
        WHERE id = $1 AND user_id = $2 AND is_completed = false
        RETURNING *;
      `;
      
      const result = await pool.query(updateTaskQuery, [id, userId]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          status: 'fail',
          message: 'Task not found or already completed'
        });
      }

      const task = result.rows[0];

      // 2. Award points based on priority
      // Phase 4.1.1 spec: +10 or +50 for high priority
      const points = task.priority === 'high' ? 50 : 10;
      const updatedUser = await PointsService.addPoints(userId, points);

      res.status(200).json({
        status: 'success',
        data: {
          task,
          pointsEarned: points,
          userStats: updatedUser
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/tasks/:id/incomplete - Mark incomplete and deduct points
  async incompleteTask(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // 1. Mark task as incomplete
      const updateTaskQuery = `
        UPDATE tasks 
        SET is_completed = false, completed_at = NULL 
        WHERE id = $1 AND user_id = $2 AND is_completed = true
        RETURNING *;
      `;
      
      const result = await pool.query(updateTaskQuery, [id, userId]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          status: 'fail',
          message: 'Task not found or not completed yet'
        });
      }

      const task = result.rows[0];

      // 2. Deduct points based on priority
      const points = task.priority === 'high' ? -50 : -10;
      const updatedUser = await PointsService.addPoints(userId, points);

      res.status(200).json({
        status: 'success',
        data: {
          task,
          pointsDeducted: points,
          userStats: updatedUser
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // 4.1.4 DELETE /api/tasks/:id - Delete task
  async deleteTask(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const result = await pool.query(
        'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          status: 'fail',
          message: 'Task not found'
        });
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  // 4.1.5 GET /api/tasks/stats - Weekly stats
  async getTaskStats(req, res, next) {
    try {
      const userId = req.user.id;

      // Completion rate this week vs last week
      const statsQuery = `
        WITH current_week AS (
          SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE is_completed = true) as completed
          FROM tasks 
          WHERE user_id = $1 
          AND created_at >= NOW() - INTERVAL '7 days'
        ),
        last_week AS (
          SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE is_completed = true) as completed
          FROM tasks 
          WHERE user_id = $1 
          AND created_at >= NOW() - INTERVAL '14 days' 
          AND created_at < NOW() - INTERVAL '7 days'
        )
        SELECT 
          cw.total as cw_total, cw.completed as cw_completed,
          lw.total as lw_total, lw.completed as lw_completed
        FROM current_week cw, last_week lw;
      `;

      const result = await pool.query(statsQuery, [userId]);
      const stats = result.rows[0];

      const cw_rate = stats.cw_total > 0 ? (stats.cw_completed / stats.cw_total) * 100 : 0;
      const lw_rate = stats.lw_total > 0 ? (stats.lw_completed / stats.lw_total) * 100 : 0;

      res.status(200).json({
        status: 'success',
        data: {
          currentWeek: {
            total: parseInt(stats.cw_total),
            completed: parseInt(stats.cw_completed),
            rate: Math.round(cw_rate)
          },
          lastWeek: {
            total: parseInt(stats.lw_total),
            completed: parseInt(stats.lw_completed),
            rate: Math.round(lw_rate)
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = taskController;
