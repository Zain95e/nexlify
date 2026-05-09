const { pool } = require('../config/db');

const sql = `
  CREATE TABLE IF NOT EXISTS health_data (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date           DATE NOT NULL,
    sleep_hours    FLOAT,
    sleep_quality  INT CHECK (sleep_quality BETWEEN 1 AND 5),
    steps          INT,
    active_minutes INT
  );
`;

const run = async () => {
  await pool.query(sql);
  console.log('[Migration 012] health_data — OK');
};

module.exports = run;
