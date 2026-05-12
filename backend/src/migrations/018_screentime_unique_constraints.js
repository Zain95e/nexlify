const { pool } = require('../config/db');

/**
 * Adds unique constraints required for ON CONFLICT upserts:
 *   screen_time(user_id, app_package, session_date)
 *   app_limits(user_id, app_package)
 *
 * Uses CREATE UNIQUE INDEX IF NOT EXISTS so this migration is idempotent.
 */
const sql = `
  CREATE UNIQUE INDEX IF NOT EXISTS uq_screen_time_user_app_date
    ON screen_time (user_id, app_package, session_date);

  CREATE UNIQUE INDEX IF NOT EXISTS uq_app_limits_user_app
    ON app_limits (user_id, app_package);
`;

const run = async () => {
  await pool.query(sql);
  console.log('[Migration 018] screentime + app_limits unique constraints — OK');
};

module.exports = run;
