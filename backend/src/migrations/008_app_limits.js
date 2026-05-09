const { pool } = require('../config/db');

const sql = `
  CREATE TABLE IF NOT EXISTS app_limits (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    app_package         VARCHAR(200) NOT NULL,
    daily_limit_minutes INT          NOT NULL
  );
`;

const run = async () => {
  await pool.query(sql);
  console.log('[Migration 008] app_limits — OK');
};

module.exports = run;
