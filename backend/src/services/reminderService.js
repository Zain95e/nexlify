const cron = require('node-cron');
const { pool } = require('../config/db');
const admin = require('../config/firebase');

/**
 * ReminderService handles automated notifications for tasks
 */
const ReminderService = {
  /**
   * Initializes the hourly cron job for task reminders
   */
  init() {
    // Run every hour at minute 0
    cron.schedule('0 * * * *', async () => {
      console.log('[ReminderService] Running hourly task reminder check...');
      await this.sendTaskReminders();
    });
  },

  /**
   * Finds tasks due within the next hour and sends FCM notifications
   */
  async sendTaskReminders() {
    try {
      // 1. Fetch tasks due in the next hour where user has reminders enabled
      const query = `
        SELECT 
          t.id as task_id, t.title, t.user_id,
          u.fcm_token
        FROM tasks t
        JOIN users u ON t.user_id = u.id
        JOIN user_settings us ON u.id = us.user_id
        WHERE 
          t.is_completed = false
          AND t.deadline BETWEEN NOW() AND NOW() + INTERVAL '1 hour'
          AND us.notify_task_reminder = true
          AND u.fcm_token IS NOT NULL;
      `;

      const result = await pool.query(query);
      const tasksToRemind = result.rows;

      if (tasksToRemind.length === 0) {
        console.log('[ReminderService] No reminders to send this hour.');
        return;
      }

      console.log(`[ReminderService] Sending ${tasksToRemind.length} reminders...`);

      // 2. Send FCM notifications
      for (const task of tasksToRemind) {
        const message = {
          notification: {
            title: 'Task Reminder ⏰',
            body: `Your task "${task.title}" is due within an hour!`,
          },
          token: task.fcm_token,
        };

        try {
          await admin.messaging().send(message);
          console.log(`[ReminderService] Sent reminder for task: ${task.task_id}`);
        } catch (error) {
          console.error(`[ReminderService] FCM error for task ${task.task_id}:`, error.message);
        }
      }
    } catch (error) {
      console.error('[ReminderService] Critical error in cron job:', error);
    }
  }
};

module.exports = ReminderService;
