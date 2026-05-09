const { pool } = require('../config/db');

/**
 * Migration 001: Create all custom ENUM types + users table
 * Uses DO $$ blocks to safely skip already-existing types (pg doesn't support CREATE TYPE IF NOT EXISTS)
 */
const run = async () => {
  // Create ENUMs safely — skip if already exist
  await pool.query(`
    DO $$ BEGIN
      CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  `);

  await pool.query(`
    DO $$ BEGIN
      CREATE TYPE mood_type AS ENUM ('happy', 'neutral', 'stressed', 'tired', 'excited');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  `);

  await pool.query(`
    DO $$ BEGIN
      CREATE TYPE screen_cat AS ENUM ('social', 'productivity', 'entertainment', 'other');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  `);

  await pool.query(`
    DO $$ BEGIN
      CREATE TYPE conn_status AS ENUM ('pending', 'accepted');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  `);

  await pool.query(`
    DO $$ BEGIN
      CREATE TYPE insight_type AS ENUM ('pattern', 'burnout', 'health', 'sentiment');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  `);

  // Create users table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name          VARCHAR(100)        NOT NULL,
      email         VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT                NOT NULL,
      fcm_token     TEXT,
      total_points  INT  DEFAULT 0      NOT NULL,
      level         INT  DEFAULT 1      NOT NULL,
      created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );
  `);

  console.log('[Migration 001] users + ENUMs — OK');
};

module.exports = run;
