const { pool } = require('../config/db');

const sql = `
  CREATE TABLE IF NOT EXISTS diary_entries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content         TEXT NOT NULL,
    mood            mood_type NOT NULL,
    tags            TEXT[] DEFAULT '{}',
    sentiment_score FLOAT,
    created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
  );
`;

const run = async () => {
  await pool.query(sql);
  console.log('[Migration 004] diary_entries — OK');
};

module.exports = run;
