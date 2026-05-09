const { pool } = require('../config/db');

const sql = `
  CREATE TABLE IF NOT EXISTS daily_tasks (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id          UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    date             DATE NOT NULL,
    target_count     FLOAT NOT NULL,
    completed_count  INT DEFAULT 0 NOT NULL,
    is_auto_adjusted BOOL DEFAULT false NOT NULL
  );
`;

const run = async () => {
  await pool.query(sql);
  console.log('[Migration 006] daily_tasks — OK');
};

module.exports = run;
