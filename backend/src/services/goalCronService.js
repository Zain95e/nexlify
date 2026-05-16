const cron = require('node-cron');
const { pool } = require('../config/db');

const getDaysDiff = (start, end) => {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.max(1, Math.ceil(Math.abs((new Date(end) - new Date(start)) / oneDay)));
};

const init = () => {
  // Run every night at midnight
  cron.schedule("0 0 * * *", async () => {
    console.log('[GoalCron] Running nightly auto-adjustment...');
    const client = await pool.connect();
    try {
      // Find active goals
      const res = await client.query(`SELECT * FROM goals WHERE is_completed = false`);
      const activeGoals = res.rows;
      
      const todayStr = new Date().toISOString().split('T')[0];

      await client.query('BEGIN');

      for (const goal of activeGoals) {
        const remaining = goal.target_count - goal.current_count;
        if (remaining <= 0) continue;
        
        const deadlineStr = new Date(goal.deadline).toISOString().split('T')[0];
        
        if (new Date(todayStr) > new Date(deadlineStr)) {
            continue; // Past deadline, cannot adjust
        }

        const daysLeft = getDaysDiff(todayStr, deadlineStr);
        const newDailyTarget = remaining / daysLeft;
        
        // Update all daily_tasks for this goal that are in the future
        await client.query(`
          UPDATE daily_tasks
          SET target_count = $1, is_auto_adjusted = true
          WHERE goal_id = $2 AND date > $3
        `, [newDailyTarget, goal.id, todayStr]);
      }

      await client.query('COMMIT');
      console.log('[GoalCron] Nightly auto-adjustment complete.');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('[GoalCron] Error running auto-adjustment:', error);
    } finally {
      client.release();
    }
  });
  console.log('[GoalCron] Service initialized');
};

module.exports = { init };
