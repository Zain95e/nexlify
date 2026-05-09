const { pool } = require('../config/db');

const sql = `
  CREATE TABLE IF NOT EXISTS achievements (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    description     TEXT         NOT NULL,
    criteria_key    VARCHAR(50)  NOT NULL,
    criteria_value  INT          NOT NULL,
    points_reward   INT          NOT NULL
  );
`;

const run = async () => {
  await pool.query(sql);
  console.log('[Migration 016] achievements — OK');
};

module.exports = run;
