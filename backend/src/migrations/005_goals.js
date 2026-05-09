const { pool } = require('../config/db');

const sql = `
  CREATE TABLE IF NOT EXISTS goals (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    description   TEXT NOT NULL,
    target_count  INT  NOT NULL,
    current_count INT  DEFAULT 0 NOT NULL,
    deadline      DATE NOT NULL,
    daily_target  FLOAT,
    category      VARCHAR(50),
    is_completed  BOOL DEFAULT false NOT NULL,
    created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
  );
`;

const run = async () => {
  await pool.query(sql);
  console.log('[Migration 005] goals — OK');
};

module.exports = run;
