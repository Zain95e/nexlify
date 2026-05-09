const { pool } = require('../config/db');

const sql = `
  CREATE TABLE IF NOT EXISTS detox_sessions (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    started_at              TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    ended_at                TIMESTAMPTZ,
    planned_duration_minutes INT  NOT NULL,
    break_count             INT  DEFAULT 0 NOT NULL
  );
`;

const run = async () => {
  await pool.query(sql);
  console.log('[Migration 010] detox_sessions — OK');
};

module.exports = run;
