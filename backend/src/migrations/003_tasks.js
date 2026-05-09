const { pool } = require('../config/db');

const sql = `
  CREATE TABLE IF NOT EXISTS tasks (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title        VARCHAR(255) NOT NULL,
    description  TEXT,
    deadline     TIMESTAMPTZ,
    priority     task_priority NOT NULL DEFAULT 'medium',
    category     VARCHAR(50),
    is_completed BOOL DEFAULT false NOT NULL,
    created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMPTZ
  );
`;

const run = async () => {
  await pool.query(sql);
  console.log('[Migration 003] tasks — OK');
};

module.exports = run;
