const { pool } = require('../config/db');

const sql = `
  CREATE TABLE IF NOT EXISTS user_achievements (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE (user_id, achievement_id)
  );
`;

const run = async () => {
  await pool.query(sql);
  console.log('[Migration 017] user_achievements — OK');
};

module.exports = run;
