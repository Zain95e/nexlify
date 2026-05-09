const { pool } = require('../config/db');

const sql = `
  CREATE TABLE IF NOT EXISTS pomodoro_sessions (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_time       TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    end_time         TIMESTAMPTZ,
    duration_minutes INT  NOT NULL,
    was_completed    BOOL DEFAULT false NOT NULL
  );
`;

const run = async () => {
  await pool.query(sql);
  console.log('[Migration 011] pomodoro_sessions — OK');
};

module.exports = run;
