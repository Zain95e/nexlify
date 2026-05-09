const { pool } = require('../config/db');

const sql = `
  CREATE TABLE IF NOT EXISTS insights (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type         insight_type NOT NULL,
    content      TEXT         NOT NULL,
    generated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    is_read      BOOL DEFAULT false NOT NULL
  );
`;

const run = async () => {
  await pool.query(sql);
  console.log('[Migration 015] insights — OK');
};

module.exports = run;
