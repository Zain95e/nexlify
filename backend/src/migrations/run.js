require('dotenv').config();
const { connectDB } = require('../config/db');

const migrations = [
  require('./001_users'),
  require('./002_user_settings'),
  require('./003_tasks'),
  require('./004_diary_entries'),
  require('./005_goals'),
  require('./006_daily_tasks'),
  require('./007_screen_time'),
  require('./008_app_limits'),
  require('./009_blocking_overrides'),
  require('./010_detox_sessions'),
  require('./011_pomodoro_sessions'),
  require('./012_health_data'),
  require('./013_connections'),
  require('./014_shared_streaks'),
  require('./015_insights'),
  require('./016_achievements'),
  require('./017_user_achievements'),
  require('./018_screentime_unique_constraints'),
];

(async () => {
  console.log('[Migrate] Starting migrations...');
  await connectDB();

  for (const migration of migrations) {
    await migration();
  }

  console.log('[Migrate] All migrations completed successfully.');
  process.exit(0);
})();
