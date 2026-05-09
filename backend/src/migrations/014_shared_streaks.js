const { pool } = require('../config/db');

const sql = `
  CREATE TABLE IF NOT EXISTS shared_streaks (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    habit_name       VARCHAR(100) NOT NULL,
    current_streak   INT  DEFAULT 0     NOT NULL,
    user1_done_today BOOL DEFAULT false NOT NULL,
    user2_done_today BOOL DEFAULT false NOT NULL,
    last_updated     DATE,
    start_date       DATE DEFAULT CURRENT_DATE NOT NULL
  );
`;

const run = async () => {
  await pool.query(sql);
  console.log('[Migration 014] shared_streaks — OK');
};

module.exports = run;
