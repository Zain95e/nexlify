const { pool } = require('../config/db');

const sql = `
  CREATE TABLE IF NOT EXISTS screen_time (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    app_name         VARCHAR(100) NOT NULL,
    app_package      VARCHAR(200) NOT NULL,
    category         screen_cat  NOT NULL DEFAULT 'other',
    duration_minutes INT         NOT NULL,
    session_date     DATE        NOT NULL
  );
`;

const run = async () => {
  await pool.query(sql);
  console.log('[Migration 007] screen_time — OK');
};

module.exports = run;
