const { pool } = require('../config/db');
const { createError } = require('../middleware/errorHandler');
const PointsService = require('../services/pointsService');

// Utility functions for dates
const getDaysDiff = (start, end) => {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.max(1, Math.ceil(Math.abs((new Date(end) - new Date(start)) / oneDay)));
};

const addDay = (dateStr) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

const getUserCompletionRate = async (userId) => {
  // past 30 days tasks vs completed
  const query = `
    SELECT 
      SUM(dt.target_count) as total_target,
      SUM(dt.completed_count) as total_completed
    FROM daily_tasks dt
    JOIN goals g ON dt.goal_id = g.id
    WHERE g.user_id = $1 
      AND dt.date >= CURRENT_DATE - INTERVAL '30 days'
      AND dt.date < CURRENT_DATE
  `;
  const res = await pool.query(query, [userId]);
  if (!res.rows[0].total_target) return 1.0; // Assume 100% if no history
  
  const target = parseFloat(res.rows[0].total_target);
  const completed = parseFloat(res.rows[0].total_completed);
  return target > 0 ? (completed / target) : 1.0;
};

const goalController = {
  // 7.1.1-7.1.2 POST /api/goals — Create Goal with Auto Daily Tasks
  async createGoal(req, res, next) {
    const client = await pool.connect();
    try {
      const userId = req.user.id;
      const { description, target_count, deadline, category } = req.body;

      if (!description || !target_count || !deadline) {
        return next(createError(400, 'description, target_count, and deadline are required'));
      }

      const todayStr = new Date().toISOString().split('T')[0];
      const deadlineStr = new Date(deadline).toISOString().split('T')[0];

      const daysRemaining = getDaysDiff(todayStr, deadlineStr);
      const dailyTarget = target_count / daysRemaining;

      // Adjust for user's historical completion rate
      const completionRate = await getUserCompletionRate(userId);
      const adjustedTarget = completionRate < 0.7 
        ? dailyTarget * 1.1 // add 10% buffer if user historically underperforms
        : dailyTarget;

      await client.query('BEGIN');

      // Insert goal
      const insertGoalText = `
        INSERT INTO goals (user_id, description, target_count, deadline, daily_target, category)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      const goalRes = await client.query(insertGoalText, [userId, description, target_count, deadlineStr, adjustedTarget, category]);
      const goal = goalRes.rows[0];

      // Insert one daily_task per day from tomorrow to deadline
      // For simplicity, we can also include today if desired, but spec says "from tomorrow to deadline".
      // Let's just follow spec:
      const tomorrowStr = addDay(todayStr);
      let currentDay = tomorrowStr;
      
      const insertTaskText = `
        INSERT INTO daily_tasks (goal_id, date, target_count)
        VALUES ($1, $2, $3)
      `;
      
      // If deadline is today or yesterday, loop won't execute, which is fine or edge case
      while (new Date(currentDay) <= new Date(deadlineStr)) {
        await client.query(insertTaskText, [goal.id, currentDay, adjustedTarget]);
        currentDay = addDay(currentDay);
      }

      await client.query('COMMIT');
      
      res.status(201).json({
        status: 'success',
        data: { goal }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      next(error);
    } finally {
      client.release();
    }
  },

  // 7.1.3 GET /api/goals → all goals with progress %. JOIN daily_tasks to get today's task.
  async getGoals(req, res, next) {
    try {
      const userId = req.user.id;
      const todayStr = new Date().toISOString().split('T')[0];

      const query = `
        SELECT 
          g.*,
          COALESCE(
            CASE 
              WHEN g.target_count > 0 THEN (g.current_count::float / g.target_count) * 100 
              ELSE 0 
            END, 0
          ) as progress_percentage,
          row_to_json(dt.*) as today_task
        FROM goals g
        LEFT JOIN daily_tasks dt ON dt.goal_id = g.id AND dt.date = $2
        WHERE g.user_id = $1
        ORDER BY g.created_at DESC
      `;
      
      const result = await pool.query(query, [userId, todayStr]);
      
      res.status(200).json({
        status: 'success',
        data: result.rows
      });
    } catch (error) {
      next(error);
    }
  },

  // 7.1.4 GET /api/goals/:id → goal + all daily_tasks (for calendar grid).
  async getGoalById(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const goalRes = await pool.query('SELECT * FROM goals WHERE id = $1 AND user_id = $2', [id, userId]);
      
      if (goalRes.rowCount === 0) {
        return next(createError(404, 'Goal not found'));
      }

      const goal = goalRes.rows[0];

      const tasksRes = await pool.query('SELECT * FROM daily_tasks WHERE goal_id = $1 ORDER BY date ASC', [goal.id]);
      
      res.status(200).json({
        status: 'success',
        data: {
          goal,
          daily_tasks: tasksRes.rows
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // 7.1.5 PATCH /api/goals/:id/tasks/:taskId/complete
  async completeTask(req, res, next) {
    const client = await pool.connect();
    try {
      const userId = req.user.id;
      const { id: goalId, taskId } = req.params;

      await client.query('BEGIN');

      // Verify ownership
      const goalCheck = await client.query('SELECT id, target_count, current_count, is_completed FROM goals WHERE id = $1 AND user_id = $2 FOR UPDATE', [goalId, userId]);
      if (goalCheck.rowCount === 0) {
        throw createError(404, 'Goal not found');
      }
      const goal = goalCheck.rows[0];

      // Update daily_task
      const updateTaskRes = await client.query(`
        UPDATE daily_tasks 
        SET completed_count = completed_count + 1 
        WHERE id = $1 AND goal_id = $2
        RETURNING *
      `, [taskId, goalId]);

      if (updateTaskRes.rowCount === 0) {
        throw createError(404, 'Task not found');
      }

      // Update goal
      const newCurrentCount = goal.current_count + 1;
      const isCompleted = newCurrentCount >= goal.target_count;

      const updateGoalRes = await client.query(`
        UPDATE goals 
        SET current_count = $1, is_completed = $2 
        WHERE id = $3
        RETURNING *
      `, [newCurrentCount, isCompleted, goalId]);

      await client.query('COMMIT');

      // Award +100 pts when goal is completed for the first time
      if (isCompleted && !goal.is_completed) {
        await PointsService.addPoints(userId, 100);
      }

      res.status(200).json({
        status: 'success',
        data: {
          goal: updateGoalRes.rows[0],
          task: updateTaskRes.rows[0]
        }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      next(error);
    } finally {
      client.release();
    }
  }
};

module.exports = goalController;
