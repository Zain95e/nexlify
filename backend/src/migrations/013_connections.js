const { pool } = require('../config/db');

const sql = `
  CREATE TABLE IF NOT EXISTS connections (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    addressee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status       conn_status DEFAULT 'pending' NOT NULL,
    created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT no_self_connect CHECK (requester_id <> addressee_id)
  );
`;

const run = async () => {
  await pool.query(sql);
  console.log('[Migration 013] connections — OK');
};

module.exports = run;
