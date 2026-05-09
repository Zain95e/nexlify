const { pool } = require('../config/db');

const sql = `
  CREATE TABLE IF NOT EXISTS blocking_overrides (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    app_package  VARCHAR(200) NOT NULL,
    overridden_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  );
`;

const run = async () => {
  await pool.query(sql);
  console.log('[Migration 009] blocking_overrides — OK');
};

module.exports = run;
