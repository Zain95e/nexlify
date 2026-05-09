# Nexlify (Focus Flow) — Complete Development Phases

> **Team**: Zain Ali & Zain Ul Abideen | **Stack**: React Native (Android) · Node.js/Express · PostgreSQL · Redis · Python FastAPI (AI)

---

## Database Schema

> Define this once in Phase 0 — all migrations in Phase 1 follow this spec.

### `users`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| name | VARCHAR(100) | |
| email | VARCHAR(255) UNIQUE | |
| password_hash | TEXT | bcrypt |
| fcm_token | TEXT | nullable, updated on login |
| total_points | INT DEFAULT 0 | |
| level | INT DEFAULT 1 | |
| created_at | TIMESTAMPTZ | |

### `user_settings`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK → users | |
| notify_task_reminder | BOOL DEFAULT true | |
| notify_goal_daily | BOOL DEFAULT true | |
| notify_streak_break | BOOL DEFAULT true | |
| notify_burnout_alert | BOOL DEFAULT true | |
| notify_achievement | BOOL DEFAULT true | |

### `tasks`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK → users | |
| title | VARCHAR(255) | |
| description | TEXT | nullable |
| deadline | TIMESTAMPTZ | nullable |
| priority | ENUM('low','medium','high') | |
| category | VARCHAR(50) | nullable |
| is_completed | BOOL DEFAULT false | |
| created_at | TIMESTAMPTZ | |
| completed_at | TIMESTAMPTZ | nullable |

### `diary_entries`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK → users | |
| content | TEXT | |
| mood | ENUM('happy','neutral','stressed','tired','excited') | |
| tags | TEXT[] | PostgreSQL array |
| sentiment_score | FLOAT | nullable, filled by AI nightly |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### `goals`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK → users | |
| description | TEXT | |
| target_count | INT | |
| current_count | INT DEFAULT 0 | |
| deadline | DATE | |
| daily_target | FLOAT | recalculated by cron |
| category | VARCHAR(50) | nullable |
| is_completed | BOOL DEFAULT false | |
| created_at | TIMESTAMPTZ | |

### `daily_tasks` *(goal micro-tasks)*
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| goal_id | UUID FK → goals | |
| date | DATE | |
| target_count | FLOAT | |
| completed_count | INT DEFAULT 0 | |
| is_auto_adjusted | BOOL DEFAULT false | |

### `screen_time`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK → users | |
| app_name | VARCHAR(100) | |
| app_package | VARCHAR(200) | |
| category | ENUM('social','productivity','entertainment','other') | |
| duration_minutes | INT | |
| session_date | DATE | |

### `app_limits`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK → users | |
| app_package | VARCHAR(200) | |
| daily_limit_minutes | INT | |

### `blocking_overrides`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK → users | |
| app_package | VARCHAR(200) | |
| overridden_at | TIMESTAMPTZ | |

### `detox_sessions`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK → users | |
| started_at | TIMESTAMPTZ | |
| ended_at | TIMESTAMPTZ | nullable |
| planned_duration_minutes | INT | |
| break_count | INT DEFAULT 0 | |

### `pomodoro_sessions`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK → users | |
| start_time | TIMESTAMPTZ | |
| end_time | TIMESTAMPTZ | nullable |
| duration_minutes | INT | |
| was_completed | BOOL DEFAULT false | |

### `health_data`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK → users | |
| date | DATE | |
| sleep_hours | FLOAT | nullable |
| sleep_quality | INT | 1–5, nullable |
| steps | INT | nullable |
| active_minutes | INT | nullable |

### `connections`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| requester_id | UUID FK → users | |
| addressee_id | UUID FK → users | |
| status | ENUM('pending','accepted') | |
| created_at | TIMESTAMPTZ | |

### `shared_streaks`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user1_id | UUID FK → users | |
| user2_id | UUID FK → users | |
| habit_name | VARCHAR(100) | |
| current_streak | INT DEFAULT 0 | |
| user1_done_today | BOOL DEFAULT false | |
| user2_done_today | BOOL DEFAULT false | |
| last_updated | DATE | |
| start_date | DATE | |

### `insights`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK → users | |
| type | ENUM('pattern','burnout','health','sentiment') | |
| content | TEXT | |
| generated_at | TIMESTAMPTZ | |
| is_read | BOOL DEFAULT false | |

### `achievements`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| name | VARCHAR(100) | |
| description | TEXT | |
| criteria_key | VARCHAR(50) | used by achievement-check job |
| criteria_value | INT | threshold value |
| points_reward | INT | |

### `user_achievements`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK → users | |
| achievement_id | UUID FK → achievements | |
| unlocked_at | TIMESTAMPTZ | |

---

## Phase 0 — Project Setup & Planning

**0.1.0 — Environment Setup**
- 0.1.1 Install Node.js, React Native CLI, Android Studio, and set up an Android emulator
- 0.1.2 Install Python , FastAPI, and AI microservice dependencies (VADER, scikit-learn, pandas, NLTK)
- 0.1.3 Set up PostgreSQL locally; install pgAdmin or DBeaver for DB management
- 0.1.4 Install Redis locally and test connection
- 0.1.5 Set up Docker and Docker Compose for containerising backend + AI services
- 0.1.6 Set up VS Code with ESLint, Prettier, and relevant extensions

**0.2.0 — Repository & Project Structure**
- 0.2.1 Create GitHub repo with folder structure: `/mobile`, `/backend`, `/ai-service`
- 0.2.2 Set up `.gitignore` files for each service (Node, Python, React Native)
- 0.2.3 Define branching strategy: `main`, `dev`, feature branches per module
- 0.2.4 Create a shared `README.md` with setup instructions for both team members
- 0.2.5 Set up GitHub Actions for basic CI (lint check on push)

**0.3.0 — Design & Documentation**
- 0.3.1 Create all app screens in Figma: onboarding, dashboard, tasks, diary, goals, Pomodoro, social, gamification, chatbot
- 0.3.2 Finalise the database schema above — agree on all table/column names before writing any migrations
- 0.3.3 Define all REST API endpoints in Postman (method, URL, request body, response) before coding begins
- 0.3.4 Write AI microservice contract: endpoints, expected inputs, expected outputs

**0.4.0 — Third-Party Accounts & API Keys**
- 0.4.1 Create Google Cloud project, enable Speech-to-Text API, obtain credentials
- 0.4.2 Create Google Fit API credentials, set up OAuth 2.0
- 0.4.3 Create Firebase project, enable FCM, download `google-services.json`
- 0.4.4 Get Groq API key for the LLM chatbot (free at console.groq.com)
- 0.4.5 Store all keys in `.env` files — never commit to GitHub

---

## Phase 1 — Backend Foundation

**1.1.0 — Project Initialisation**
- 1.1.1 Initialise Node.js/Express; configure folder structure (`/routes`, `/controllers`, `/models`, `/middleware`)
- 1.1.2 Connect Express to PostgreSQL using `pg` or Sequelize ORM
- 1.1.3 Set up Redis connection with `ioredis`
- 1.1.4 Create central error handler middleware and request logger (morgan)
- 1.1.5 Write health-check endpoint: `GET /api/health` → `{ status: "ok" }`

**1.2.0 — Database Migrations**

Run these in order. Column names match the schema above exactly.

- 1.2.1 `users` — id, name, email, password_hash, fcm_token, total_points, level, created_at
- 1.2.2 `user_settings` — id, user_id FK, all notify_* booleans
- 1.2.3 `tasks` — id, user_id FK, title, description, deadline, priority, category, is_completed, created_at, completed_at
- 1.2.4 `diary_entries` — id, user_id FK, content, mood, tags (TEXT[]), sentiment_score, created_at, updated_at
- 1.2.5 `goals` — id, user_id FK, description, target_count, current_count, deadline, daily_target, category, is_completed, created_at
- 1.2.6 `daily_tasks` — id, goal_id FK, date, target_count, completed_count, is_auto_adjusted
- 1.2.7 `screen_time` — id, user_id FK, app_name, app_package, category, duration_minutes, session_date
- 1.2.8 `app_limits` — id, user_id FK, app_package, daily_limit_minutes
- 1.2.9 `blocking_overrides` — id, user_id FK, app_package, overridden_at
- 1.2.10 `detox_sessions` — id, user_id FK, started_at, ended_at, planned_duration_minutes, break_count
- 1.2.11 `pomodoro_sessions` — id, user_id FK, start_time, end_time, duration_minutes, was_completed
- 1.2.12 `health_data` — id, user_id FK, date, sleep_hours, sleep_quality, steps, active_minutes
- 1.2.13 `connections` — id, requester_id FK, addressee_id FK, status, created_at
- 1.2.14 `shared_streaks` — id, user1_id FK, user2_id FK, habit_name, current_streak, user1_done_today, user2_done_today, last_updated, start_date
- 1.2.15 `insights` — id, user_id FK, type, content, generated_at, is_read
- 1.2.16 `achievements` — id, name, description, criteria_key, criteria_value, points_reward
- 1.2.17 `user_achievements` — id, user_id FK, achievement_id FK, unlocked_at

**1.3.0 — Authentication System**
- 1.3.1 `POST /api/auth/register` — validate input, hash password (bcrypt), insert user + default user_settings row, return JWT
- 1.3.2 `POST /api/auth/login` — validate credentials, return JWT + refresh token
- 1.3.3 `POST /api/auth/refresh` — validate refresh token (Redis), issue new JWT
- 1.3.4 `POST /api/auth/logout` — blacklist refresh token in Redis
- 1.3.5 `authenticateJWT` middleware — validates token, attaches `req.user` to all protected routes
- 1.3.6 Test all auth endpoints in Postman

---

## Phase 2 — Core Mobile App Shell

**2.1.0 — React Native Initialisation**
- 2.1.1 Initialise React Native project targeting Android (API level 26+)
- 2.1.2 Install and configure React Navigation v6: bottom tab navigator (Home, Tasks, Diary, Goals, More)
- 2.1.3 Install and configure Redux Toolkit: `authSlice`, `taskSlice`, `diarySlice`, `goalSlice`
- 2.1.4 Install Axios; create `api.js` with base URL and JWT header injection
- 2.1.5 Create global theme file (colors, fonts, spacing) matching Figma design system

**2.2.0 — Authentication Screens**
- 2.2.1 Register screen: email, name, password fields with validation
- 2.2.2 Login screen: stores token in AsyncStorage on success
- 2.2.3 Onboarding flow (3 screens): welcome → features overview → permission requests
- 2.2.4 Auto-login: on app start, check AsyncStorage for valid token, skip to home if present
- 2.2.5 Logout: clears AsyncStorage, resets Redux state, navigates to Login

**2.3.0 — Android Permissions**
- 2.3.1 `PACKAGE_USAGE_STATS` — show explanation dialog first
- 2.3.2 `SYSTEM_ALERT_WINDOW` — for app blocking overlay
- 2.3.3 `BIND_ACCESSIBILITY_SERVICE` — for foreground app detection
- 2.3.4 `POST_NOTIFICATIONS` — Android 13+
- 2.3.5 Handle permission denials gracefully with in-app degraded-feature messages

---

## Phase 3 — Screen Time Tracking

**3.1.0 — Native Android Module**
- 3.1.1 Write React Native Native Module (Java/Kotlin) querying `UsageStatsManager` for past 24 hours
- 3.1.2 Returns list of: app_name, app_package, duration_minutes
- 3.1.3 Maintain a hardcoded package→category map (Social, Productivity, Entertainment, Other)
- 3.1.4 Background service via `WorkManager` runs every 60 minutes and calls this module

**3.2.0 — Backend API**
- 3.2.1 `POST /api/screentime` — accepts array of usage records, upserts into `screen_time` for today's date
- 3.2.2 `GET /api/screentime/daily` — today's usage grouped by app
- 3.2.3 `GET /api/screentime/weekly` — past 7 days aggregated by day
- 3.2.4 `GET /api/screentime/monthly` — past 30 days totals per day
- 3.2.5 `GET /api/screentime/limits` — return user's `app_limits`
- 3.2.6 `PUT /api/screentime/limits` — set/update limits per app

**3.3.0 — Dashboard UI**
- 3.3.1 Home screen: today's total screen time in large text at top
- 3.3.2 Top 5 apps bar chart
- 3.3.3 Category pie chart (Social / Productivity / Entertainment)
- 3.3.4 30-day line graph of daily total screen time
- 3.3.5 Day/week/month toggle that re-fetches and re-renders
- 3.3.6 Color-code apps: red if over limit, green if within

---

## Phase 4 — Task Management

**4.1.0 — Backend API**
- 4.1.1 `POST /api/tasks` — create task; on completion, call PointsService (+10 or +50 for high priority)
- 4.1.2 `GET /api/tasks` — all tasks with optional `?status=pending|completed` filter
- 4.1.3 `PATCH /api/tasks/:id/complete` — mark complete, set `completed_at`, award points
- 4.1.4 `DELETE /api/tasks/:id` — delete task
- 4.1.5 `GET /api/tasks/stats` — completion rate this week vs last week
- 4.1.6 `node-cron` hourly: send FCM reminder for tasks due within 1 hour (respects `user_settings.notify_task_reminder`)

**4.2.0 — Mobile UI**
- 4.2.1 Task List screen with Pending / Done tabs
- 4.2.2 Add Task modal: title, description, deadline picker, priority dropdown, category tags
- 4.2.3 Swipe-right to complete (green animation), swipe-left to delete (red confirmation)
- 4.2.4 Task cards: priority dot, title, deadline, category tag
- 4.2.5 Overdue tasks float to top with red warning icon
- 4.2.6 Weekly summary card on Home: circular progress showing completion % this week

---

## Phase 5 — App Blocking & Detox Mode

**5.1.0 — App Blocking Core Logic (Native Android)**
- 5.1.1 Native Module to get list of all installed apps
- 5.1.2 `AccessibilityService` detects when a blocked app comes to foreground
- 5.1.3 If daily limit reached: launch full-screen overlay Activity covering the app
- 5.1.4 Overlay shows: app name, "Time limit reached", motivational quote, override button with confirmation
- 5.1.5 Override events synced to backend via `POST /api/blocking/overrides` (inserts into `blocking_overrides`)

**5.2.0 — Detox Mode**
- 5.2.1 Blocks all apps except a user-defined whitelist (Phone, Messages + user-selected essentials)
- 5.2.2 Persistent foreground service notification: "Detox Active — X minutes remaining"
- 5.2.3 15-minute cooldown before a new detox session can start after breaking one
- 5.2.4 Log session start/end/breaks to `detox_sessions` table via backend

**5.3.0 — Blocking UI**
- 5.3.1 App Blocking screen: installed apps list with toggle + time picker per app
- 5.3.2 "Quick Detox" button on home: starts 30-minute session immediately
- 5.3.3 Detox config screen: custom duration, manage whitelist
- 5.3.4 Blocking Stats: chart showing limits respected vs. overridden per app

---

## Phase 6 — Digital Diary

**6.1.0 — Backend API**
- 6.1.1 `POST /api/diary` — create entry (content, mood, tags), return entry
- 6.1.2 `GET /api/diary` — all entries sorted by date descending, paginated
- 6.1.3 `GET /api/diary/search?q=keyword` — full-text search on content
- 6.1.4 `PATCH /api/diary/:id` — update content, mood, or tags
- 6.1.5 `DELETE /api/diary/:id` — delete entry

**6.2.0 — Voice Input**
- 6.2.1 Integrate `react-native-voice` or send audio to Google Speech-to-Text API
- 6.2.2 Press-and-hold mic starts recording; releasing sends audio for transcription
- 6.2.3 Transcribed text populates editor — user reviews before saving
- 6.2.4 Show loading spinner during transcription; handle errors gracefully

**6.3.0 — Diary UI**
- 6.3.1 Diary home: reverse-chronological list showing date, mood emoji, first 2 lines, tags
- 6.3.2 New Entry screen: full-screen editor, mood picker, tag selector, mic button
- 6.3.3 Entry Detail screen: full content with edit and delete options
- 6.3.4 Monthly calendar view: days with entries marked with colored mood dots
- 6.3.5 Search bar filtering entry list by keyword in real-time

---

## Phase 7 — Goal Management with AI Decomposition

**7.1.0 — Backend API**
- 7.1.1 `POST /api/goals` — create goal, auto-generate `daily_tasks` for every day from today to deadline
- 7.1.2 Initial daily_target = target_count / days_remaining (adjusted by user's historical task completion rate)
- 7.1.3 `GET /api/goals` — all active and completed goals
- 7.1.4 `GET /api/goals/:id` — goal with all its daily_tasks
- 7.1.5 `PATCH /api/goals/:id/tasks/:taskId/complete` — mark daily task complete, update goal `current_count`
- 7.1.6 Nightly `node-cron`: recalculate remaining `daily_target` for all active goals based on actual progress; set `is_auto_adjusted = true`
- 7.1.7 `DELETE /api/goals/:id` — delete goal and all its daily_tasks (cascade)

**7.2.0 — Goal UI**
- 7.2.1 Goals screen: active goals list with name, deadline, progress bar
- 7.2.2 Create Goal screen: description, target count, deadline picker, category
- 7.2.3 Goal Detail: calendar grid — green (done), red (missed), grey (upcoming)
- 7.2.4 Checkboxes for each day's micro-tasks
- 7.2.5 "Auto-adjusted" badge on days where target was recalculated

---

## Phase 8 — Pomodoro Timer

**8.1.0 — Timer Logic**
- 8.1.1 Countdown timer with pause/resume/reset (`setInterval`)
- 8.1.2 When timer starts, trigger app blocking for user's selected distracting apps
- 8.1.3 Local notification on completion: "Session complete! Time for a break."
- 8.1.4 4-session cycle: after 4 Pomodoros, suggest 15–30 min long break
- 8.1.5 Log completed session to `pomodoro_sessions` via `POST /api/pomodoro`; award +15 pts

**8.2.0 — Smart Break Suggestions**
- 8.2.1 Before each break, fetch user's most recent diary entry mood
- 8.2.2 Rule-based: stressed/tired → physical break (walk, stretch); neutral/happy → mental break (water, meditation)
- 8.2.3 Show break suggestion as full-screen card with break countdown timer
- 8.2.4 "Start Break", "Skip Break", or alternative suggestions

**8.3.0 — Pomodoro UI**
- 8.3.1 Pomodoro screen: large circular countdown ring, session number, start/pause/reset
- 8.3.2 Break card: suggestion text, break timer, "Done with Break" button
- 8.3.3 Daily stats on home: sessions completed today + total focus minutes

---

## Phase 9 — Health Tracker Integration

**9.1.0 — Google Fit Connection**
- 9.1.1 Google Sign-In + Fit API OAuth 2.0 flow
- 9.1.2 Request permissions: `READ_SLEEP`, `READ_STEPS`, `READ_ACTIVITY`
- 9.1.3 Fetch yesterday's sleep hours, steps, active minutes from Fit API
- 9.1.4 Send to backend via `POST /api/health`
- 9.1.5 Run fetch every morning at app startup (if Fit is connected)

**9.2.0 — Backend & Correlation**
- 9.2.1 `POST /api/health` — store daily health data into `health_data`
- 9.2.2 `GET /api/health/insights` — return insight cards from `insights` table (type='health')

**9.3.0 — Health UI**
- 9.3.1 Health tab: calendar heatmap of sleep hours
- 9.3.2 Dual-axis line graph: sleep hours vs. productivity score per day
- 9.3.3 Insight cards: "On days with 8+ hours sleep, you complete 25% more tasks"
- 9.3.4 Banner if Google Fit not connected, with "Connect" button; marked as optional

---

## Phase 10 — Social Features

> Scope: connections + shared streaks only. No matching algorithm.

**10.1.0 — Connections Backend**
- 10.1.1 `GET /api/users/search?q=name` — search users by name or email
- 10.1.2 `POST /api/connections/request/:userId` — send connection request (inserts into `connections` with status='pending')
- 10.1.3 `POST /api/connections/accept/:connectionId` — accept request (status → 'accepted')
- 10.1.4 `GET /api/connections` — list all accepted connections
- 10.1.5 `DELETE /api/connections/:id` — remove connection

**10.2.0 — Shared Streaks Backend**
- 10.2.1 `POST /api/streaks` — create shared streak with a connected friend
- 10.2.2 `POST /api/streaks/:id/complete` — set `user1_done_today` or `user2_done_today` = true for logged-in user
- 10.2.3 Nightly cron at 23:59: if both done → increment `current_streak`; if either missed → reset to 0, FCM to both; reset both done flags
- 10.2.4 `GET /api/streaks` — return all streaks with current count, partner name, today's status

**10.3.0 — Social UI**
- 10.3.1 Social tab: friend list (top) + active streaks (bottom)
- 10.3.2 Add Friend flow: search → view profile → send request
- 10.3.3 Pending Requests screen: incoming requests with accept/decline
- 10.3.4 New Streak flow: select friend → enter habit name → confirm
- 10.3.5 Streak cards: habit name, partner name, 🔥 emoji, streak count, "Mark Done Today" button
- 10.3.6 On streak reset: show "Revive" prompt — both must mark done next day to restart

---

## Phase 11 — AI Microservice (Python FastAPI)

**11.1.0 — FastAPI Service Setup**
- 11.1.1 Initialise FastAPI project with folder structure: `/routes`, `/services`
- 11.1.2 `requirements.txt`: fastapi, uvicorn, pandas, scikit-learn, vaderSentiment, nltk, numpy, groq SDK
- 11.1.3 Containerise with Docker (run with `uvicorn main:app --host 0.0.0.0 --port 8000`)
- 11.1.4 Secure all endpoints with a shared internal secret key (not exposed to mobile)

**11.2.0 — Sentiment Analysis**
- 11.2.1 `POST /ai/analyze-diary` — accepts list of diary entry texts, returns VADER score per entry (compound + label)
- 11.2.2 Detect downward sentiment trend over past 7 days
- 11.2.3 Node backend writes returned scores back into `diary_entries.sentiment_score`

**11.3.0 — Productivity Pattern Detection**
- 11.3.1 `POST /ai/analyze-patterns` — accepts 30 days of screen time, task completion, Pomodoro data
- 11.3.2 Productivity score per day: task completion 50% + Pomodoro 30% + low distracting screen time 20%
- 11.3.3 Detect peak productive hours from `tasks.completed_at` timestamps
- 11.3.4 Compare current week to 4-week average
- 11.3.5 Return suggestion strings: e.g. "You work best 9 AM–12 PM", "YouTube usage up 50% this week"

**11.4.0 — Burnout Detection**
- 11.4.1 `POST /ai/burnout-check` — checks 5 indicators: task completion drop, unproductive screen time spike, diary sentiment < -0.3 for 3+ days, Pomodoro drop, sleep hours drop
- 11.4.2 Z-score anomaly detection: flag indicator if current value is 2+ SDs below 7-day mean
- 11.4.3 Return `burnoutRisk: true` + suggested recovery plan if 3+ indicators flagged

**11.5.0 — Health Correlation**
- 11.5.1 `POST /ai/health-correlation` — 30 days of health + productivity data
- 11.5.2 Pearson correlation: sleep hours vs. task completion rate
- 11.5.3 If r > 0.5, generate insight card text
- 11.5.4 Return array of insight strings

**11.6.0 — Nightly Cron (Node.js)**
- 11.6.1 `node-cron` runs nightly at midnight
- 11.6.2 For each user: call FastAPI `/ai/analyze-diary` → `/ai/analyze-patterns` → `/ai/burnout-check`
- 11.6.3 Store returned insights in `insights` table
- 11.6.4 If `burnoutRisk: true`, send FCM notification (respects `notify_burnout_alert`)

---

## Phase 12 — AI Chatbot Coach

**12.1.0 — Backend Endpoint**
- 12.1.1 `POST /api/chat` — before LLM call, fetch user context: last 7 days task completion %, top screen time apps, last 3 diary entries (mood + keywords), current goal progress
- 12.1.2 Construct system prompt: "You are a personal productivity coach for [name]. Here is their data: [context]. Be concise and actionable."
- 12.1.3 Call Groq API (`llama-3.3-70b-versatile`) — free tier, OpenAI-compatible base URL, swap to OpenAI/Anthropic in production with no other code changes
- 12.1.4 Return full response (streaming optional)
- 12.1.5 Store last 10 messages per user in Redis for multi-turn context

**12.2.0 — Chatbot UI**
- 12.2.1 Chat screen: user messages right-aligned (blue), bot left-aligned (grey)
- 12.2.2 Suggested starter questions when chat is empty
- 12.2.3 Typing indicator while waiting for response
- 12.2.4 Error state: "Couldn't reach coach, try again"

---

## Phase 13 — Gamification

**13.1.0 — Points & Levels Backend**
- 13.1.1 `PointsService` — awards points on action events:
  - Complete task: +10 pts (high priority: +50 pts)
  - Daily task streak: +20 pts
  - Complete goal: +100 pts
  - Write diary entry: +5 pts
  - Complete Pomodoro: +15 pts
- 13.1.2 Each relevant endpoint calls `PointsService` after its main action; updates `users.total_points`
- 13.1.3 Level formula: `level = Math.floor(Math.sqrt(totalPoints / 50))`; update `users.level`
- 13.1.4 `GET /api/gamification/profile` — total_points, level, progress to next level, unlocked achievements

**13.2.0 — Achievements Backend**
- 13.2.1 Seed `achievements` table with at least 10 badges (Early Bird, Consistency King, Goal Crusher, Zen Master, Diary Keeper, Focus Champion, Detox Hero, Social Butterfly, Streak Master, Night Owl) — each with `criteria_key` and `criteria_value`
- 13.2.2 Hourly `node-cron` achievement-check: evaluates criteria, inserts into `user_achievements` if newly unlocked, fires FCM
- 13.2.3 `GET /api/gamification/achievements` — all achievements with locked/unlocked status

**13.3.0 — Gamification UI**
- 13.3.1 Profile screen: level badge, XP progress bar, total points
- 13.3.2 Badge grid: unlocked in color, locked greyed out with description
- 13.3.3 Lottie celebration animation on badge unlock
- 13.3.4 Daily challenge card on home: "Complete 5 tasks today for +50 bonus points"

---

## Phase 14 — Notifications

**14.1.0 — FCM Setup**
- 14.1.1 `POST /api/users/fcm-token` — store device token in `users.fcm_token` on login
- 14.1.2 `NotificationService` in Node.js using Firebase Admin SDK
- 14.1.3 Notification types: task reminder, goal daily target, streak break, burnout alert, friend request, achievement unlock

**14.2.0 — Notification Triggers**
- 14.2.1 Task deadline: hourly cron, FCM 1 hour before deadline
- 14.2.2 Goal daily target: FCM at 8 AM with today's target; again at 6 PM if still incomplete
- 14.2.3 Streak break: sent by streak cron at 23:59 if either user hasn't completed
- 14.2.4 Burnout alert: sent by nightly AI cron
- 14.2.5 Achievement unlock: sent immediately by achievement-check job

**14.3.0 — Notification Settings UI**
- 14.3.1 Notification Settings screen: toggle per notification type
- 14.3.2 Preferences stored in `user_settings`; all notification triggers check this before sending

---

## Phase 15 — Testing & QA

**15.1.0 — Backend Testing**
- 15.1.1 Jest unit tests: PointsService, goal auto-adjustment, burnout threshold logic
- 15.1.2 Supertest integration tests: happy path + edge cases for all endpoints
- 15.1.3 Manually trigger cron jobs and verify DB state
- 15.1.4 Run full Postman collection — all endpoints must pass

**15.2.0 — Mobile Testing**
- 15.2.1 React Native Testing Library tests: task creation, diary saving, Pomodoro timer
- 15.2.2 Test Android permission flows on emulator (deny → graceful degradation)
- 15.2.3 Test app blocking overlay on emulator with a real app (e.g. YouTube)
- 15.2.4 Test voice transcription
- 15.2.5 Test offline behavior: cached data visible with no internet

**15.3.0 — AI Service Testing**
- 15.3.1 Test VADER with sample diary entries — verify scores are sensible
- 15.3.2 Test burnout detection with edge-case data (exactly 2 flags vs. 3 flags)
- 15.3.3 Test LLM chatbot with 20+ varied questions — verify coherent, data-grounded responses

**15.4.0 — Beta Testing**
- 15.4.1 Deploy APK to 10–20 beta testers via internal Google Play track
- 15.4.2 Collect structured feedback via Google Form
- 15.4.3 Fix top 5 reported issues before final submission

---

## Phase 16 — Deployment & Documentation

**16.1.0 — Backend Deployment**
- 16.1.1 Docker Compose: Node.js backend, Python FastAPI AI service, PostgreSQL, Redis
- 16.1.2 Deploy to AWS EC2 or Google Cloud Run
- 16.1.3 Managed PostgreSQL (RDS or Cloud SQL) and Redis (ElastiCache or Upstash)
- 16.1.4 Secure environment variables on cloud server
- 16.1.5 HTTPS via Let's Encrypt

**16.2.0 — APK Build**
- 16.2.1 Update production API base URL in app config
- 16.2.2 Generate signed APK/AAB for Android
- 16.2.3 Test production APK on a real Android device end-to-end
- 16.2.4 Fix production-only bugs (CORS, certificate issues)

**16.3.0 — Documentation**
- 16.3.1 Technical docs: system architecture, DB schema, API endpoint reference
- 16.3.2 AI model docs: algorithms used, input/output format, test accuracy
- 16.3.3 Developer setup guide: clone → configure `.env` → run locally in 10 minutes
- 16.3.4 Final FYP report per Abbottabad UST format
- 16.3.5 Demo video (5–10 minutes) walking through every major feature

---

*16 phases · ~110 sub-tasks · Schema defined upfront*