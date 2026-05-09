const { pool } = require('../config/db');

const sql = `
  CREATE TABLE IF NOT EXISTS user_settings (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notify_task_reminder BOOL DEFAULT true  NOT NULL,
    notify_goal_daily    BOOL DEFAULT true  NOT NULL,
    notify_streak_break  BOOL DEFAULT true  NOT NULL,
    notify_burnout_alert BOOL DEFAULT true  NOT NULL,
    notify_achievement   BOOL DEFAULT true  NOT NULL
  );
`;

const run = async () => {
  await pool.query(sql);
  console.log('[Migration 002] user_settings — OK');
};

module.exports = run;
