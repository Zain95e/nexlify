# Nexlify — Focus Flow: Complete Development Blueprint

> **Team:** Zain Ali & Zain Ul Abideen
> **Stack:** React Native (Android) · Node.js/Express · PostgreSQL · Redis · Python FastAPI
> **Cost Policy:** 100% Free & Open-Source Stack

---

> 💸 **FULLY FREE STACK POLICY**
> All paid services have been replaced with free/open-source alternatives. Groq API (free tier) replaces paid LLMs. Whisper (local) replaces paid Speech-to-Text. PostgreSQL & Redis run in Docker — no paid hosted services. No credit card required for any dependency.

---

## Table of Contents

- [Database Schema](#database-schema)
- [Phase 0 — Project Setup & Planning](#phase-0--project-setup--planning)
- [Phase 1 — Backend Foundation](#phase-1--backend-foundation)
- [Phase 2 — Core Mobile App Shell](#phase-2--core-mobile-app-shell)
- [Phase 3 — Screen Time Tracking](#phase-3--screen-time-tracking)
- [Phase 4 — Task Management](#phase-4--task-management)
- [Phase 5 — App Blocking & Detox Mode](#phase-5--app-blocking--detox-mode)
- [Phase 6 — Digital Diary](#phase-6--digital-diary)
- [Phase 7 — Goal Management with AI Decomposition](#phase-7--goal-management-with-ai-decomposition)
- [Phase 8 — Pomodoro Timer](#phase-8--pomodoro-timer)
- [Phase 9 — Health Tracker Integration](#phase-9--health-tracker-integration)
- [Phase 10 — Social Features](#phase-10--social-features)
- [Phase 11 — AI Microservice (Python FastAPI)](#phase-11--ai-microservice-python-fastapi)
- [Phase 12 — AI Chatbot Coach](#phase-12--ai-chatbot-coach)
- [Phase 13 — Gamification](#phase-13--gamification)
- [Phase 14 — Notifications](#phase-14--notifications)
- [Phase 15 — Testing & QA](#phase-15--testing--qa)
- [Phase 16 — Deployment & Documentation](#phase-16--deployment--documentation)
- [Free Stack Summary](#free-stack-summary)

---

## Database Schema

> Define this once in Phase 0 — all migrations in Phase 1 follow this spec exactly.

### `users`

| Column        | Type                | Notes                      |
| ------------- | ------------------- | -------------------------- |
| id            | UUID PK             |                            |
| name          | VARCHAR(100)        |                            |
| email         | VARCHAR(255) UNIQUE |                            |
| password_hash | TEXT                | bcrypt                     |
| fcm_token     | TEXT                | nullable, updated on login |
| total_points  | INT DEFAULT 0       |                            |
| level         | INT DEFAULT 1       |                            |
| created_at    | TIMESTAMPTZ         |                            |

### `user_settings`

| Column               | Type              | Notes |
| -------------------- | ----------------- | ----- |
| id                   | UUID PK           |       |
| user_id              | UUID FK → users   |       |
| notify_task_reminder | BOOL DEFAULT true |       |
| notify_goal_daily    | BOOL DEFAULT true |       |
| notify_streak_break  | BOOL DEFAULT true |       |
| notify_burnout_alert | BOOL DEFAULT true |       |
| notify_achievement   | BOOL DEFAULT true |       |

### `tasks`

| Column       | Type                        | Notes    |
| ------------ | --------------------------- | -------- |
| id           | UUID PK                     |          |
| user_id      | UUID FK → users             |          |
| title        | VARCHAR(255)                |          |
| description  | TEXT                        | nullable |
| deadline     | TIMESTAMPTZ                 | nullable |
| priority     | ENUM('low','medium','high') |          |
| category     | VARCHAR(50)                 | nullable |
| is_completed | BOOL DEFAULT false          |          |
| created_at   | TIMESTAMPTZ                 |          |
| completed_at | TIMESTAMPTZ                 | nullable |

### `diary_entries`

| Column          | Type                                                 | Notes                          |
| --------------- | ---------------------------------------------------- | ------------------------------ |
| id              | UUID PK                                              |                                |
| user_id         | UUID FK → users                                      |                                |
| content         | TEXT                                                 |                                |
| mood            | ENUM('happy','neutral','stressed','tired','excited') |                                |
| tags            | TEXT[]                                               | PostgreSQL array               |
| sentiment_score | FLOAT                                                | nullable, filled by AI nightly |
| created_at      | TIMESTAMPTZ                                          |                                |
| updated_at      | TIMESTAMPTZ                                          |                                |

### `goals`

| Column        | Type               | Notes                |
| ------------- | ------------------ | -------------------- |
| id            | UUID PK            |                      |
| user_id       | UUID FK → users    |                      |
| description   | TEXT               |                      |
| target_count  | INT                |                      |
| current_count | INT DEFAULT 0      |                      |
| deadline      | DATE               |                      |
| daily_target  | FLOAT              | recalculated by cron |
| category      | VARCHAR(50)        | nullable             |
| is_completed  | BOOL DEFAULT false |                      |
| created_at    | TIMESTAMPTZ        |                      |

### `daily_tasks` (goal micro-tasks)

| Column           | Type               | Notes |
| ---------------- | ------------------ | ----- |
| id               | UUID PK            |       |
| goal_id          | UUID FK → goals    |       |
| date             | DATE               |       |
| target_count     | FLOAT              |       |
| completed_count  | INT DEFAULT 0      |       |
| is_auto_adjusted | BOOL DEFAULT false |       |

### `screen_time`

| Column           | Type                                                  | Notes |
| ---------------- | ----------------------------------------------------- | ----- |
| id               | UUID PK                                               |       |
| user_id          | UUID FK → users                                       |       |
| app_name         | VARCHAR(100)                                          |       |
| app_package      | VARCHAR(200)                                          |       |
| category         | ENUM('social','productivity','entertainment','other') |       |
| duration_minutes | INT                                                   |       |
| session_date     | DATE                                                  |       |

### `app_limits`

| Column              | Type            | Notes |
| ------------------- | --------------- | ----- |
| id                  | UUID PK         |       |
| user_id             | UUID FK → users |       |
| app_package         | VARCHAR(200)    |       |
| daily_limit_minutes | INT             |       |

### `blocking_overrides`

| Column        | Type            | Notes |
| ------------- | --------------- | ----- |
| id            | UUID PK         |       |
| user_id       | UUID FK → users |       |
| app_package   | VARCHAR(200)    |       |
| overridden_at | TIMESTAMPTZ     |       |

### `detox_sessions`

| Column                   | Type            | Notes    |
| ------------------------ | --------------- | -------- |
| id                       | UUID PK         |          |
| user_id                  | UUID FK → users |          |
| started_at               | TIMESTAMPTZ     |          |
| ended_at                 | TIMESTAMPTZ     | nullable |
| planned_duration_minutes | INT             |          |
| break_count              | INT DEFAULT 0   |          |

### `pomodoro_sessions`

| Column           | Type               | Notes    |
| ---------------- | ------------------ | -------- |
| id               | UUID PK            |          |
| user_id          | UUID FK → users    |          |
| start_time       | TIMESTAMPTZ        |          |
| end_time         | TIMESTAMPTZ        | nullable |
| duration_minutes | INT                |          |
| was_completed    | BOOL DEFAULT false |          |

### `health_data`

| Column         | Type            | Notes         |
| -------------- | --------------- | ------------- |
| id             | UUID PK         |               |
| user_id        | UUID FK → users |               |
| date           | DATE            |               |
| sleep_hours    | FLOAT           | nullable      |
| sleep_quality  | INT             | 1–5, nullable |
| steps          | INT             | nullable      |
| active_minutes | INT             | nullable      |

### `connections`

| Column       | Type                       | Notes |
| ------------ | -------------------------- | ----- |
| id           | UUID PK                    |       |
| requester_id | UUID FK → users            |       |
| addressee_id | UUID FK → users            |       |
| status       | ENUM('pending','accepted') |       |
| created_at   | TIMESTAMPTZ                |       |

### `shared_streaks`

| Column           | Type               | Notes |
| ---------------- | ------------------ | ----- |
| id               | UUID PK            |       |
| user1_id         | UUID FK → users    |       |
| user2_id         | UUID FK → users    |       |
| habit_name       | VARCHAR(100)       |       |
| current_streak   | INT DEFAULT 0      |       |
| user1_done_today | BOOL DEFAULT false |       |
| user2_done_today | BOOL DEFAULT false |       |
| last_updated     | DATE               |       |
| start_date       | DATE               |       |

### `insights`

| Column       | Type                                           | Notes |
| ------------ | ---------------------------------------------- | ----- |
| id           | UUID PK                                        |       |
| user_id      | UUID FK → users                                |       |
| type         | ENUM('pattern','burnout','health','sentiment') |       |
| content      | TEXT                                           |       |
| generated_at | TIMESTAMPTZ                                    |       |
| is_read      | BOOL DEFAULT false                             |       |

### `achievements`

| Column         | Type         | Notes                         |
| -------------- | ------------ | ----------------------------- |
| id             | UUID PK      |                               |
| name           | VARCHAR(100) |                               |
| description    | TEXT         |                               |
| criteria_key   | VARCHAR(50)  | used by achievement-check job |
| criteria_value | INT          | threshold value               |
| points_reward  | INT          |                               |

### `user_achievements`

| Column         | Type                   | Notes |
| -------------- | ---------------------- | ----- |
| id             | UUID PK                |       |
| user_id        | UUID FK → users        |       |
| achievement_id | UUID FK → achievements |       |
| unlocked_at    | TIMESTAMPTZ            |       |

---

## Phase 0 — Project Setup & Planning

> Everything you install, configure, and design **before** writing a single line of production code.

### 0.1 — Environment Setup

> This section sets up every tool you need on your development machine. Do this once, together, so both team members have identical environments.

---

#### 0.1.1 — Install Node.js & React Native CLI

- Go to https://nodejs.org and download **Node.js v20 LTS**. Install it. After installation open a terminal and run `node -v` — you should see `v20.x.x`
- Install React Native CLI globally:
  ```bash
  npm install -g react-native-cli
  ```
- ✅ **FREE:** Node.js is 100% free and open source. React Native is free (Meta open source).

---

#### 0.1.2 — Install Android Studio & Set Up Emulator

- Download Android Studio from https://developer.android.com/studio (free). During installation, make sure to check: **Android SDK**, **Android SDK Platform**, **Android Virtual Device**.
- After install: **Tools → AVD Manager → Create Virtual Device**. Pick "Pixel 6" → Select API 33 (Android 13) system image → Finish.
- Add to your system PATH:
  - Windows: `ANDROID_HOME = C:\Users\YourName\AppData\Local\Android\Sdk`
  - Mac: `~/Library/Android/sdk`
- Test: open terminal, type `emulator -list-avds` — your device should appear.
- ✅ **FREE:** Android Studio is free. Android SDK is free. No Google Play license needed for development.

---

#### 0.1.3 — Install Python & AI Dependencies

- Download Python 3.11 from https://python.org. During install on Windows, **CHECK "Add Python to PATH"**.
- Install FastAPI and all AI libraries:
  ```bash
  pip install fastapi uvicorn pandas scikit-learn vaderSentiment nltk numpy groq openai-whisper
  ```
- Test:
  ```bash
  python -c "import fastapi; import sklearn; print('OK')"
  ```
- 💡 **Note:** VADER (sentiment analysis) and scikit-learn (machine learning) are completely free academic libraries. No API keys needed.

---

#### 0.1.4 — Run PostgreSQL via Docker (no local install needed)

> ⚠️ Do step 0.1.6 (Docker Desktop) first, then come back here.

- You do **NOT** need to install PostgreSQL separately. It runs inside a Docker container.
- Create `docker-compose.dev.yml` in the root folder of your project:

```yaml
version: "3.9"
services:
  postgres:
    image: postgres:16-alpine
    container_name: nexlify_postgres
    restart: always
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: yourpassword
      POSTGRES_DB: nexlify_db
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: nexlify_redis
    restart: always
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

- Start both services:
  ```bash
  docker-compose -f docker-compose.dev.yml up -d
  ```
- Test PostgreSQL:
  ```bash
  docker exec -it nexlify_postgres psql -U postgres -d nexlify_db
  ```
  You should see the psql prompt (`nexlify_db=#`).
- Test Redis:
  ```bash
  docker exec -it nexlify_redis redis-cli ping
  # Should respond: PONG
  ```
- Set in your `/backend/.env`:
  ```
  DATABASE_URL=postgres://postgres:yourpassword@localhost:5432/nexlify_db
  REDIS_URL=redis://localhost:6379
  ```
- To stop: `docker-compose -f docker-compose.dev.yml stop`
- To wipe data and start fresh: `docker-compose -f docker-compose.dev.yml down -v`
- For a visual GUI, install **pgAdmin 4** from https://www.pgadmin.org (free) and connect to `localhost:5432`.
- 💡 **Note:** The volumes (`postgres_data`, `redis_data`) persist your data even when containers are stopped. Your database survives restarts.
- ✅ **FREE:** Both `postgres:16-alpine` and `redis:7-alpine` Docker images are free. No installers, no system dependencies.

---

#### 0.1.5 — Install Docker Desktop

- Download from https://www.docker.com/products/docker-desktop (free for personal/educational use). Install and start it.
- Verify:
  ```bash
  docker --version
  docker-compose --version
  ```
- 💡 **Note:** Docker packages your backend, AI service, PostgreSQL, and Redis together. It ensures code runs the same everywhere — dev and production.
- ✅ **FREE:** Docker Desktop is free for students and non-commercial use.

---

#### 0.1.6 — Install VS Code & Extensions

- Download VS Code from https://code.visualstudio.com (free). Install these extensions:
  - **ESLint** — real-time JavaScript error detection
  - **Prettier** — auto-formats code on save
  - **React Native Tools** — debugging support
  - **Python** — language support for FastAPI service
  - **Thunder Client** — free API testing (replaces Postman)
  - **GitLens** — enhanced Git history view
  - **Docker** — manage containers from VS Code sidebar
- ✅ **FREE:** VS Code and all listed extensions are free.

---

### 0.2 — Repository & Project Structure

#### 0.2.1 — Create GitHub Repository

- Go to github.com → New Repository → name it `nexlify` → set **Private** → do NOT initialize with README.
- Clone it and create top-level folders:
  ```bash
  git clone https://github.com/YourUsername/nexlify.git
  cd nexlify
  mkdir mobile backend ai-service
  ```
- ✅ **FREE:** GitHub is free for unlimited private repos with up to 3 collaborators.

---

#### 0.2.2 — Create .gitignore Files

- `/backend/.gitignore`:
  ```
  node_modules/
  .env
  dist/
  *.log
  ```
- `/ai-service/.gitignore`:
  ```
  __pycache__/
  .env
  venv/
  *.pyc
  ```
- `/mobile/.gitignore`:
  ```
  node_modules/
  .env
  android/app/build/
  *.keystore
  ```
- 💡 **Note:** NEVER commit `.env` files to GitHub. They contain passwords and API keys.

---

#### 0.2.3 — Branching Strategy

- `main` — only working, tested code. Never code directly on main.
- `dev` — integration branch. Merge feature branches here first:
  ```bash
  git checkout -b dev
  ```
- Feature branches — one per task:
  ```bash
  git checkout -b feature/task-api
  git checkout -b feature/diary-screen
  ```
- To merge: finish feature → push to GitHub → create Pull Request to `dev` → other team member reviews → merge.

---

#### 0.2.4 — Create Shared README.md

- In root folder, create `README.md` covering: project overview, how to clone, how to set up `.env` files, how to start Docker services, how to run backend (`node index.js`), how to run AI service (`uvicorn main:app`), how to run mobile (`npx react-native run-android`).
- Goal: a new developer gets running in under 10 minutes.

---

#### 0.2.5 — Set Up GitHub Actions CI

- Create `.github/workflows/lint.yml`:
  ```yaml
  name: Lint Check
  on: [push, pull_request]
  jobs:
    lint:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - run: cd backend && npm install && npm run lint
  ```
- ✅ **FREE:** GitHub Actions gives 2,000 free minutes/month for private repos.

---

### 0.3 — Design & Documentation

#### 0.3.1 — Create All Screens in Figma

- Go to https://figma.com and create a free account. Create a new project called **Nexlify**.
- Design these screens: Splash, Onboarding 1/2/3, Register, Login, Home Dashboard, Task List, Add Task Modal, Diary Home, New Diary Entry, Goal List, Goal Detail, Pomodoro Timer, Break Card, Screen Time Dashboard, App Blocking Settings, Detox Mode, Social Tab, Add Friend, Shared Streaks, Chatbot, Gamification Profile, Notification Settings.
- Suggested color palette: primary `#1A56DB`, success `#0E9F6E`, warning `#E3A008`, danger `#E02424`.
- ✅ **FREE:** Figma free plan supports up to 3 projects and unlimited view-mode collaborators.

---

#### 0.3.2 — Lock Down the Database Schema

- Review the complete schema at the top of this document. Both team members must agree on every table name, column name, and data type **before** writing any migrations.
- 💡 **Note:** Schema changes after migrations are written require new migration files — costly. Treat this schema as a contract.

---

#### 0.3.3 — Define All REST API Endpoints

- Use **Thunder Client** (VS Code extension) or **Hoppscotch** (https://hoppscotch.io, free) to document all endpoints before coding.
- For each endpoint document: HTTP method, URL, request headers, request body (JSON), success response, error responses.
- Example: `POST /api/auth/register` → body: `{name, email, password}` → success: `{token, user}` → error 400: `{message: "Email already exists"}`
- ✅ **FREE:** Hoppscotch is a free open-source alternative to Postman. No account required.

---

#### 0.3.4 — Write AI Microservice Contract

Create a `CONTRACT.md` inside `/ai-service`:

| Endpoint                      | Input                            | Output                                    |
| ----------------------------- | -------------------------------- | ----------------------------------------- |
| `POST /ai/analyze-diary`      | `[{id, text}]`                   | `[{id, score, label}]`                    |
| `POST /ai/analyze-patterns`   | `{screenTime, tasks, pomodoro}`  | `{productivityScore, suggestions}`        |
| `POST /ai/burnout-check`      | `{userId, lookbackDays}`         | `{burnoutRisk, indicators, recoveryPlan}` |
| `POST /ai/health-correlation` | `{healthData, productivityData}` | `{insights: [string]}`                    |
| `POST /ai/transcribe`         | audio file (multipart)           | `{text: string}`                          |

---

### 0.4 — Free API Keys & Services Setup

#### 0.4.1 — Set Up Whisper for Speech-to-Text (FREE — replaces Google STT)

- Instead of Google Speech-to-Text ($0.006/minute), use **OpenAI Whisper** running locally for FREE.
- Already installed in step 0.1.3. The `base` model is ~74MB and processes 30s of audio in ~2-3 seconds on CPU.
- ✅ **FREE:** Whisper is open-source (MIT license). Zero cost, zero rate limits.

---

#### 0.4.2 — Set Up Firebase for FCM (Free Tier)

- Go to https://console.firebase.google.com → Create Project → name it `nexlify` → disable Google Analytics → Create.
- **Project Settings → Add App → Android** → Package name: `com.nexlify` → Register → Download `google-services.json` → place in `/mobile/android/app/`
- **Cloud Messaging tab** → copy FCM server key → add to backend `.env` as `FCM_SERVER_KEY=...`
- ✅ **FREE:** Firebase Spark Plan: 500K notifications/month free.

---

#### 0.4.3 — Get Groq API Key for LLM Chatbot (FREE)

- Go to https://console.groq.com → Sign up with GitHub or Google → API Keys → Create API Key → Copy.
- Free tier: `llama-3.3-70b-versatile` at 30 requests/minute, 14,400 requests/day. No credit card required.
- Add to `/backend/.env`:
  ```
  GROQ_API_KEY=gsk_...
  ```
- ✅ **FREE:** Groq free tier is more than sufficient for FYP use.

---

#### 0.4.4 — Set Up Google Fit OAuth (Free)

- Go to https://console.cloud.google.com → Create Project → Enable **Fitness API**.
- **Credentials → Create OAuth 2.0 Client ID** → Application type: Android → Package: `com.nexlify`
- Get your SHA-1 fingerprint:
  ```bash
  keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
  ```
- Add client ID/secret to `.env`. Google Fit API has no usage cost.

---

#### 0.4.5 — Store All Keys in .env Files

`/backend/.env`:

```
DATABASE_URL=postgres://postgres:yourpassword@localhost:5432/nexlify_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=some_long_random_string
REFRESH_SECRET=another_long_random_string
GROQ_API_KEY=gsk_...
FCM_SERVER_KEY=...
INTERNAL_AI_SECRET=shared_secret_between_node_and_python
GOOGLE_FIT_CLIENT_ID=...
GOOGLE_FIT_CLIENT_SECRET=...
```

`/ai-service/.env`:

```
INTERNAL_SECRET=shared_secret_between_node_and_python
```

- Share `.env` values with teammate via WhatsApp or shared Google Keep — **not** through GitHub.

---

## Phase 1 — Backend Foundation

> Build the Node.js/Express server, run all database migrations, and implement JWT authentication.

### 1.1 — Project Initialisation

#### 1.1.1 — Initialise Node.js/Express Project

- In `/backend`:
  ```bash
  npm init -y
  npm install express pg sequelize bcryptjs jsonwebtoken ioredis morgan cors helmet dotenv node-cron axios
  npm install --save-dev nodemon eslint prettier jest supertest
  ```
- Create folder structure:
  ```
  /backend
  ├── /routes        # one file per feature (auth.js, tasks.js, diary.js …)
  ├── /controllers   # business logic called by routes
  ├── /models        # Sequelize model definitions (one per table)
  ├── /middleware    # authenticateJWT.js, errorHandler.js
  ├── /services      # PointsService.js, NotificationService.js …
  ├── /cron          # scheduled jobs
  └── index.js       # entry point
  ```

---

#### 1.1.2 — Connect Express to PostgreSQL via Sequelize

Create `config/database.js`:

```js
const { Sequelize } = require("sequelize");
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
});
module.exports = sequelize;
```

In `index.js` on startup:

```js
await sequelize.authenticate();
console.log("PostgreSQL connected");
```

---

#### 1.1.3 — Set Up Redis with ioredis

Create `config/redis.js`:

```js
const Redis = require("ioredis");
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
module.exports = redis;
```

Redis is used for: storing refresh token blacklist (on logout) and caching the last 10 chatbot messages per user.

---

#### 1.1.4 — Create Error Handler & Request Logger

`middleware/errorHandler.js`:

```js
module.exports = (err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ message: err.message || "Server error" });
};
```

In `index.js`:

```js
app.use(require("morgan")("dev"));
// ... all routes ...
app.use(errorHandler); // must be last
```

---

#### 1.1.5 — Health Check Endpoint

```js
app.get("/api/health", (req, res) =>
  res.json({ status: "ok", timestamp: new Date() }),
);
```

Start server: `node index.js`, then visit `http://localhost:3000/api/health`.

---

### 1.2 — Database Migrations

> Run each migration in order using `npx sequelize-cli migration:generate --name create-<table>`. Column names must match the schema exactly.

#### 1.2.1 — `users` table

Columns: `id` (UUID PK, default UUIDV4), `name` (STRING 100, NOT NULL), `email` (STRING 255, UNIQUE, NOT NULL), `password_hash` (TEXT, NOT NULL), `fcm_token` (TEXT, nullable), `total_points` (INTEGER, default 0), `level` (INTEGER, default 1), `created_at` (DATE, default NOW).

> 💡 UUID as PK is more secure than auto-increment — prevents users from guessing other users' IDs.

#### 1.2.2 — `user_settings` table

Columns: `id` (UUID PK), `user_id` (UUID FK → users, onDelete: CASCADE), and 5 booleans all defaulting to `true`: `notify_task_reminder`, `notify_goal_daily`, `notify_streak_break`, `notify_burnout_alert`, `notify_achievement`.

> CASCADE = if user is deleted, settings are automatically deleted too.

#### 1.2.3 — `tasks` table

Columns: `id`, `user_id` (FK CASCADE), `title` (STRING 255, NOT NULL), `description` (TEXT nullable), `deadline` (DATE nullable), `priority` (ENUM: low/medium/high, NOT NULL), `category` (STRING 50 nullable), `is_completed` (BOOLEAN, default false), `created_at`, `completed_at` (nullable).

#### 1.2.4 — `diary_entries` table

Columns: `id`, `user_id` (FK CASCADE), `content` (TEXT NOT NULL), `mood` (ENUM: happy/neutral/stressed/tired/excited), `tags` (ARRAY of TEXT — `DataTypes.ARRAY(DataTypes.TEXT)`), `sentiment_score` (FLOAT nullable), `created_at`, `updated_at`.

#### 1.2.5 — `goals` table

Columns: `id`, `user_id` (FK CASCADE), `description` (TEXT), `target_count` (INT), `current_count` (INT default 0), `deadline` (DATE), `daily_target` (FLOAT), `category` (STRING 50 nullable), `is_completed` (BOOLEAN default false), `created_at`.

#### 1.2.6 — `daily_tasks` table

Columns: `id`, `goal_id` (UUID FK → goals, CASCADE), `date` (DATE), `target_count` (FLOAT), `completed_count` (INT default 0), `is_auto_adjusted` (BOOLEAN default false).

#### 1.2.7–1.2.17 — All Remaining Tables

Run migrations for: `screen_time`, `app_limits`, `blocking_overrides`, `detox_sessions`, `pomodoro_sessions`, `health_data`, `connections`, `shared_streaks`, `insights`, `achievements`, `user_achievements`.

After all migrations:

```bash
npx sequelize-cli db:migrate
# Verify:
docker exec -it nexlify_postgres psql -U postgres -d nexlify_db -c "\dt"
# All 17 tables should appear
```

---

### 1.3 — Authentication System

#### 1.3.1 — POST /api/auth/register

1. Validate input: `name` min 2 chars, `email` valid format, `password` min 8 chars → return 400 if invalid.
2. Check if email exists → return 409 Conflict if it does.
3. Hash password: `const hash = await bcrypt.hash(password, 12)` — never store plain passwords.
4. Insert user + user_settings row in a **single transaction**.
5. Generate JWT (15 min) and refresh token (30 days). Store refresh in Redis: `redis.setex('refresh:' + userId, 2592000, refreshToken)`.
6. Return: `{ token, refreshToken, user: { id, name, email, level, totalPoints } }`

---

#### 1.3.2 — POST /api/auth/login

1. Find user by email. If not found → 401 `"Invalid credentials"` (do NOT say "email not found" — security risk).
2. `await bcrypt.compare(password, user.password_hash)` → if false → 401.
3. Generate new JWT + refresh token. Update `users.fcm_token` if provided in body.
4. Return same structure as register.

---

#### 1.3.3 — POST /api/auth/refresh

1. Accept `{ refreshToken }` in body. Verify with `REFRESH_SECRET`.
2. Check Redis: `redis.get('refresh:' + userId)`. If null → 401 (revoked on logout).
3. Issue new 15-minute JWT. Return `{ token }`.

---

#### 1.3.4 — POST /api/auth/logout

1. Accept `{ refreshToken }`. Decode to get `userId`.
2. Delete from Redis: `redis.del('refresh:' + userId)`.
3. Return `200 { message: 'Logged out' }`.

---

#### 1.3.5 — authenticateJWT Middleware

`middleware/authenticateJWT.js`:

```js
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer "))
    return res.status(401).json({ message: "No token" });
  try {
    const decoded = jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET);
    req.user = { userId: decoded.userId };
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
```

Usage:

```js
router.get("/protected", authenticateJWT, controller.handler);
```

---

## Phase 2 — Core Mobile App Shell

> Initialize React Native, set up navigation and state management, build auth screens.

### 2.1 — React Native Initialization

#### 2.1.1 — Initialize Project

```bash
npx react-native init Nexlify --template react-native-template-typescript
```

In `android/build.gradle`, verify `minSdkVersion 26` (required for `UsageStatsManager`).

Test:

```bash
npx react-native run-android
```

---

#### 2.1.2 — Install & Configure React Navigation

```bash
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack
npm install react-native-screens react-native-safe-area-context react-native-gesture-handler
```

Create `navigation/AppNavigator.js` with a bottom tab navigator: **Home**, **Tasks**, **Diary**, **Goals**, **More**. Wrap `App.js` in `<NavigationContainer>`.

---

#### 2.1.3 — Install & Configure Redux Toolkit

```bash
npm install @reduxjs/toolkit react-redux
```

Create `store/index.js` with slices: `authSlice`, `taskSlice`, `diarySlice`, `goalSlice`, `screenTimeSlice`, `gamificationSlice`.

- `authSlice` stores: `{ token, user, isAuthenticated }`
- `taskSlice` stores: `{ tasks: [], loading, error }`

Wrap `App.js` with `<Provider store={store}>`.

---

#### 2.1.4 — Create API Utility with Axios

`services/api.js`:

```js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const api = axios.create({ baseURL: "http://10.0.2.2:3000/api" });
// 10.0.2.2 is localhost from the Android emulator

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: if 401, refresh token and retry
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      const refreshToken = await AsyncStorage.getItem("refreshToken");
      const { data } = await axios.post(
        "http://10.0.2.2:3000/api/auth/refresh",
        { refreshToken },
      );
      await AsyncStorage.setItem("token", data.token);
      err.config.headers.Authorization = `Bearer ${data.token}`;
      return axios(err.config);
    }
    return Promise.reject(err);
  },
);

export default api;
```

---

#### 2.1.5 — Create Global Theme File

`styles/theme.js`:

```js
export const colors = {
  primary: "#1A56DB",
  background: "#F9FAFB",
  card: "#FFFFFF",
  text: "#111928",
  border: "#E5E7EB",
  success: "#0E9F6E",
  danger: "#E02424",
  warning: "#E3A008",
};
export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
export const borderRadius = { sm: 8, md: 12, lg: 20 };
```

---

### 2.2 — Authentication Screens

#### 2.2.1 — Register Screen

- Fields: Name, Email (`keyboardType="email-address"`), Password (`secureTextEntry`), Confirm Password.
- Validate: all fields filled, email format valid, passwords match, password ≥ 8 chars. Show red error text below each invalid field.
- On submit: `POST /api/auth/register` → save token to AsyncStorage → dispatch `authSlice.login(user)` → navigate to Home.

#### 2.2.2 — Login Screen

- Email and Password fields. "Don't have an account? Register" link.
- On submit: `POST /api/auth/login` → save `token` and `refreshToken` to AsyncStorage → update Redux.
- Show loading spinner on button during API call.

#### 2.2.3 — Onboarding Flow (3 Screens)

- Screen 1: App logo, tagline "Take control of your focus", "Next" button.
- Screen 2: Feature highlights — screen time tracking, AI coach, goal management.
- Screen 3: Permission explanation — explain WHY you need Usage Stats and Accessibility Service. "Grant Permissions" button.
- Store completion: `AsyncStorage.setItem('onboarding_done', 'true')`. Skip on future launches.

#### 2.2.4 — Auto-Login on App Start

In `App.js` `useEffect` on mount:

1. Read `token` from AsyncStorage. Decode with `jwt-decode` and check expiry.
2. If valid → dispatch login, navigate to Home.
3. If expired → read `refreshToken`, call `POST /auth/refresh`, update token, navigate to Home.
4. If refresh fails → clear AsyncStorage, navigate to Login.

#### 2.2.5 — Logout

```js
const logout = async () => {
  const refreshToken = await AsyncStorage.getItem("refreshToken");
  await api.post("/auth/logout", { refreshToken });
  await AsyncStorage.multiRemove(["token", "refreshToken"]);
  dispatch(authSlice.actions.logout());
  navigation.reset({ index: 0, routes: [{ name: "Login" }] });
};
```

---

### 2.3 — Android Permissions

#### 2.3.1 — PACKAGE_USAGE_STATS

- Cannot be granted at runtime — user must manually enable in Settings.
- Show explanation modal with "Open Settings" button → `Linking.openSettings()` → **Settings > Apps > Special App Access > Usage Access > Nexlify > Enable**.

#### 2.3.2 — SYSTEM_ALERT_WINDOW

- Required for the app blocking overlay.
- Check `Settings.canDrawOverlays(this)` in Java/Kotlin. Request via `Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION)`.

#### 2.3.3 — POST_NOTIFICATIONS (Android 13+)

```bash
npm install react-native-permissions
```

```js
await PermissionsAndroid.request(
  PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
);
```

If denied: app still works but cannot send push notifications. Show a banner on Home.

---

## Phase 3 — Screen Time Tracking

> Native Android module to read app usage, backend to store it, charts on dashboard.

### 3.1 — Native Android Module

#### 3.1.1 — Write UsageStats Native Module (Java/Kotlin)

Create `android/app/src/main/java/com/nexlify/UsageStatsModule.java`:

- Extends `ReactContextBaseJavaModule`. Expose method `getUsageStats()`.
- Get `UsageStatsManager` via `context.getSystemService(Context.USAGE_STATS_SERVICE)`.
- Query past 24 hours: `usageStatsManager.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, startTime, endTime)`
- Returns `WritableArray` of `WritableMap` objects, each with: `package_name`, `app_name` (from PackageManager), `duration_minutes` (totalTimeInForeground / 60000).

#### 3.1.2 — App Package → Category Map

`constants/appCategories.js`:

```js
export const APP_CATEGORIES = {
  "com.instagram.android": "social",
  "com.facebook.katana": "social",
  "com.whatsapp": "social",
  "com.google.android.youtube": "entertainment",
  "com.netflix.mediaclient": "entertainment",
  "com.google.android.apps.docs": "productivity",
  "com.microsoft.teams": "productivity",
  "com.google.android.apps.spreadsheets": "productivity",
};
// Default for unlisted apps: 'other'
```

#### 3.1.3 — Background Sync with WorkManager

- Create a `PeriodicWorkRequest` that runs every 60 minutes.
- Work: call `NativeModules.UsageStatsModule.getUsageStats()` → POST results to `/api/screentime`.
- Register in `MainActivity.onCreate()`:
  ```java
  WorkManager.getInstance(context).enqueueUniquePeriodicWork(
    "screentime_sync",
    ExistingPeriodicWorkPolicy.KEEP,
    workRequest
  );
  ```
- ✅ **FREE:** WorkManager is part of Android Jetpack — free.

---

### 3.2 — Backend API

#### 3.2.1 — POST /api/screentime

- Accepts: `[{ app_name, app_package, duration_minutes, category }]`
- UPSERT for each record:
  ```sql
  INSERT INTO screen_time (user_id, app_name, app_package, category, duration_minutes, session_date)
  VALUES (...)
  ON CONFLICT (user_id, app_package, session_date)
  DO UPDATE SET duration_minutes = EXCLUDED.duration_minutes
  ```

#### 3.2.2-3.2.4 — GET Daily / Weekly / Monthly

- `GET /api/screentime/daily` → `WHERE session_date = TODAY ORDER BY duration_minutes DESC`
- `GET /api/screentime/weekly` → `GROUP BY app_name, SUM(duration_minutes) WHERE session_date >= 7 days ago`
- `GET /api/screentime/monthly` → `SELECT session_date, SUM(duration_minutes) as total GROUP BY session_date` (last 30 days)

#### 3.2.5-3.2.6 — App Limits CRUD

- `GET /api/screentime/limits` → `SELECT * FROM app_limits WHERE user_id = ?`
- `PUT /api/screentime/limits` → body: `{ app_package, daily_limit_minutes }` → UPSERT into `app_limits`

---

### 3.3 — Dashboard UI

#### 3.3.1-3.3.3 — Home Screen Charts

```bash
npm install react-native-chart-kit react-native-svg
```

- **Total screen time:** large text at top — e.g. "4h 32m today"
- **Top 5 Apps:** `BarChart` from `react-native-chart-kit`. X-axis = app names, Y-axis = minutes.
- **Category Pie Chart:** `PieChart` showing % split between Social / Productivity / Entertainment / Other.
- ✅ **FREE:** `react-native-chart-kit` is MIT licensed.

#### 3.3.4-3.3.6 — 30-Day Trend & Limit Colors

- 30-day `LineChart`: fetch `/api/screentime/monthly`, dates on X-axis, total minutes on Y-axis.
- Day/Week/Month toggle: 3 buttons, each calls corresponding API and re-renders charts.
- Color coding: compare `duration_minutes` to `daily_limit_minutes` from limits. Over limit → red. Under → green.

---

## Phase 4 — Task Management

### 4.1 — Backend API

#### 4.1.1 — POST /api/tasks

- Body: `{ title, description?, deadline?, priority, category? }`
- Validate: `title` required, `priority` must be `low`/`medium`/`high`.
- Insert into `tasks` table with `user_id` from JWT.
- Points are awarded on **completion**, not creation.

#### 4.1.2 — GET /api/tasks

- Query param: `?status=pending` or `?status=completed` (optional).
- Sort: overdue tasks first (deadline < NOW, not completed), then by deadline ASC, then by priority DESC.

#### 4.1.3 — PATCH /api/tasks/:id/complete

1. Find task by `id AND user_id` (prevents completing another user's task).
2. Update: `is_completed = true`, `completed_at = NOW()`.
3. Call `PointsService.awardPoints(userId, task)`: +50 for high priority, +10 for medium/low.
4. Return updated task with new `total_points`.

#### 4.1.4 — DELETE /api/tasks/:id

```sql
DELETE FROM tasks WHERE id = ? AND user_id = ?
```

The `AND user_id` check is crucial — prevents users deleting others' tasks.

#### 4.1.5 — GET /api/tasks/stats

Returns: `{ thisWeek: { total, completed, rate }, lastWeek: { total, completed, rate } }` where `rate = (completed / total) * 100`.

#### 4.1.6 — Task Reminder Cron Job

`cron/taskReminder.js`:

```js
cron.schedule("0 * * * *", async () => {
  const tasks = await db.query(`
    SELECT tasks.*, users.fcm_token FROM tasks
    JOIN users ON tasks.user_id = users.id
    JOIN user_settings ON user_settings.user_id = users.id
    WHERE deadline BETWEEN NOW() AND NOW() + INTERVAL '1 hour'
    AND is_completed = false
    AND notify_task_reminder = true
    AND fcm_token IS NOT NULL
  `);
  for (const task of tasks) {
    await NotificationService.send(task.fcm_token, "Task Due Soon", task.title);
  }
});
```

---

### 4.2 — Mobile UI

#### 4.2.1 — Task List Screen

- "Pending" and "Done" tabs. Fetch on screen focus (`navigation.addListener('focus')`).
- Empty state illustration when no tasks.

#### 4.2.2 — Add Task Modal

```bash
npm install @gorhom/bottom-sheet
npm install @react-native-community/datetimepicker
```

Fields: Title, Description (multiline), Deadline (date picker), Priority (3 toggle buttons), Category (text chip input).

#### 4.2.3 — Swipe Gestures

Using `react-native-gesture-handler` `Swipeable`:

- **Swipe right:** green background + checkmark → `PATCH /api/tasks/:id/complete` → animate card out → show points toast.
- **Swipe left:** red background + trash icon → confirmation alert → `DELETE /api/tasks/:id`.

#### 4.2.4-4.2.6 — Task Cards, Overdue & Weekly Summary

- Task card: colored priority dot (red/yellow/green), title (bold), deadline, category chip.
- Overdue tasks: if `deadline < NOW` and not completed → red warning icon, float to top, red card border.
- Weekly summary on Home: circular progress ring (react-native-svg) showing completion % this week vs last week.

---

## Phase 5 — App Blocking & Detox Mode

### 5.1 — App Blocking Core Logic

#### 5.1.1 — List Installed Apps Native Module

`InstalledAppsModule.java`:

- Use `PackageManager.getInstalledApplications(PackageManager.GET_META_DATA)`.
- Filter system apps: skip if `(appInfo.flags & ApplicationInfo.FLAG_SYSTEM) != 0`.
- Return: `[{ package_name, app_name, icon (base64 bitmap) }]`

#### 5.1.2 — AccessibilityService: Detect Foreground App

`BlockingAccessibilityService.java` extending `AccessibilityService`:

- Register in `AndroidManifest.xml` with `android.permission.BIND_ACCESSIBILITY_SERVICE`.
- Override `onAccessibilityEvent`: detect `TYPE_WINDOW_STATE_CHANGED`.
- Extract package name from `event.getPackageName()`.
- If package is in blocked list AND limit reached → launch overlay.

#### 5.1.3-5.1.4 — Full-Screen Blocking Overlay

`BlockingOverlayActivity.java`:

```java
Intent intent = new Intent(context, BlockingOverlayActivity.class);
intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
context.startActivity(intent);
```

UI shows: app icon, app name, "Daily limit reached", random motivational quote (hardcode 10-20), "Override (I understand the risk)" button.

Override: confirmation dialog → on confirm: `POST /api/blocking/overrides` → `finish()` overlay.

#### 5.1.5 — POST /api/blocking/overrides

Body: `{ app_package, overridden_at }` → insert into `blocking_overrides` table.

---

### 5.2 — Detox Mode

#### 5.2.1 — Whitelist-Based Blocking

- User defines whitelist: Phone, SMS + user-selected essentials.
- Store in AsyncStorage + sync to backend.
- During detox: if foreground app is NOT in whitelist → launch overlay immediately (no time limit check).

#### 5.2.2-5.2.4 — Session Tracking

- Start: `POST /api/detox` with `{ planned_duration_minutes }` → insert into `detox_sessions`.
- Show persistent foreground notification: "🧘 Detox Active — 28 minutes remaining". Update every minute.
- On break/cancel: `PATCH /api/detox/:id` with `{ ended_at, break_count }`.
- **15-minute cooldown:** store last session end time in SharedPreferences. Block new session if `< 15 minutes` ago.

---

### 5.3 — Blocking UI

- **App Blocking screen:** FlatList of installed apps, each row: app icon, name, toggle switch, time picker (shows when toggle ON).
- **"Quick Detox" button** on Home: starts 30-minute session immediately.
- **Detox Config screen:** custom duration slider, whitelist manager.
- **Blocking Stats:** BarChart showing per-app "Respected" (blue) vs "Overridden" (red) this week.

---

## Phase 6 — Digital Diary

### 6.1 — Backend API

#### 6.1.1 — POST /api/diary

- Body: `{ content, mood, tags: [] }`
- Validate: content non-empty, mood is a valid enum value.
- Insert into `diary_entries`. `sentiment_score` left null — filled by nightly AI.
- Award +5 pts via `PointsService`.

#### 6.1.2 — GET /api/diary (Paginated)

- Query params: `?page=1&limit=20`

```sql
SELECT id, mood, tags, LEFT(content, 200) as preview, created_at
FROM diary_entries
WHERE user_id = ?
ORDER BY created_at DESC
LIMIT 20 OFFSET (page-1)*20
```

#### 6.1.3 — GET /api/diary/search?q=keyword

```sql
WHERE content ILIKE '%' || ? || '%'
```

Returns matching entries with preview.

#### 6.1.4-6.1.5 — Update & Delete

- `PATCH /api/diary/:id` — update `content`, `mood`, or `tags` where `id AND user_id = req.user.userId`.
- `DELETE /api/diary/:id` — hard delete where `id AND user_id`.

---

### 6.2 — Voice Input (Free with Whisper)

#### 6.2.1 — Whisper Transcription Endpoint in AI Service

`ai-service/routes/transcribe.py`:

```python
import whisper
import tempfile, os

model = whisper.load_model("base")  # ~74MB, free, runs on CPU

@router.post("/ai/transcribe")
async def transcribe(file: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name
    result = model.transcribe(tmp_path)
    os.unlink(tmp_path)
    return {"text": result["text"]}
```

Node backend exposes `POST /api/diary/transcribe` which forwards the audio file to FastAPI.

- ✅ **FREE:** Whisper base model — open-source (MIT), zero API cost, zero rate limits.

#### 6.2.2-6.2.4 — Mobile Recording Flow

```bash
npm install react-native-audio-recorder-player
```

- **Press and hold mic:** `AudioRecorderPlayer.startRecorder()` — show animated waveform.
- **Release:** `stopRecorder()` → get file path → convert to base64 → `POST /api/diary/transcribe`.
- Show loading spinner. On success: populate diary text editor. User can edit before saving.
- Error: "Couldn't transcribe audio. Please type instead."

---

### 6.3 — Diary UI

```bash
npm install react-native-calendars
```

- **Diary Home:** FlatList. Each card: date, mood emoji (😊😐😰😴🤩), first 2 lines, tag chips.
- **New Entry screen:** full-screen `TextInput` (multiline), mood picker row (5 emoji buttons), tag chip input, mic button.
- **Entry Detail:** full content, edit button (pre-filled edit screen), delete button (confirmation alert).
- **Monthly Calendar:** mark days with entries using colored dots matching mood color.
- **Search:** TextInput debounced 300ms → `GET /api/diary/search?q=input` → render results in same FlatList.

---

## Phase 7 — Goal Management with AI Decomposition

### 7.1 — Backend API

#### 7.1.1-7.1.2 — POST /api/goals — Create Goal with Auto Daily Tasks

```js
// In a single transaction:
const daysRemaining = dateDiff(today, deadline);
const dailyTarget = target_count / daysRemaining;

// Adjust for user's historical completion rate
const completionRate = await getUserCompletionRate(userId); // past 30 days
const adjustedTarget =
  completionRate < 0.7
    ? dailyTarget * 1.1 // add 10% buffer if user historically underperforms
    : dailyTarget;

// Insert goal
const goal = await Goal.create({
  userId,
  description,
  target_count,
  deadline,
  daily_target: adjustedTarget,
});

// Insert one daily_task per day from tomorrow to deadline
for (let d = tomorrow; d <= deadline; d = addDay(d)) {
  await DailyTask.create({
    goal_id: goal.id,
    date: d,
    target_count: adjustedTarget,
  });
}
```

#### 7.1.3-7.1.5 — Goal CRUD & Task Completion

- `GET /api/goals` → all goals with progress %. JOIN daily_tasks to get today's task.
- `GET /api/goals/:id` → goal + all daily_tasks (for calendar grid).
- `PATCH /api/goals/:id/tasks/:taskId/complete` → increment `daily_task.completed_count += 1`, `goal.current_count += 1`. If `current_count >= target_count` → `is_completed = true`, award +100 pts.

#### 7.1.6 — Nightly Auto-Adjustment Cron

```js
cron.schedule("0 0 * * *", async () => {
  const activeGoals = await Goal.findAll({ where: { is_completed: false } });
  for (const goal of activeGoals) {
    const remaining = goal.target_count - goal.current_count;
    const daysLeft = dateDiff(today, goal.deadline);
    const newDailyTarget = remaining / daysLeft;
    await DailyTask.update(
      { target_count: newDailyTarget, is_auto_adjusted: true },
      { where: { goal_id: goal.id, date: { [Op.gt]: today } } },
    );
  }
});
```

---

### 7.2 — Goal UI

- **Goals screen:** list with description, deadline countdown, horizontal progress bar, today's micro-task target.
- **Create Goal:** description TextInput, target count (numeric), deadline picker, category tags.
- **Goal Detail:** calendar grid — tap a date to see that day's task. Color: green (met), red (missed), grey (future).
- **"Auto-Adjusted" badge:** small orange label on days where target was recalculated.

---

## Phase 8 — Pomodoro Timer

### 8.1 — Timer Logic

#### 8.1.1 — Countdown Timer

```bash
npm install react-native-keep-awake
```

- Store in `pomodoroSlice`: `{ timeRemaining, isRunning, sessionNumber, phase: 'focus'|'break' }`
- `useRef` to store interval ID. Start: `setInterval(() => dispatch(tick()), 1000)`. Pause: `clearInterval`.
- Activate `KeepAwake` during focus. Deactivate during breaks.

#### 8.1.2 — App Blocking During Focus

- On Pomodoro start: read user's "distracting apps" list → write to `SharedPreferences`.
- `AccessibilityService` reads this list and blocks those apps for the focus duration.
- On pause or end: clear the blocking list.

#### 8.1.3-8.1.5 — Notifications, Cycles & Logging

```bash
npm install @notifee/react-native
```

- On session complete: fire local notification: "🎉 Pomodoro complete! Time for a break."
- After 4 sessions: suggest long break (15-30 min).
- Log: `POST /api/pomodoro` with `{ start_time, end_time, duration_minutes, was_completed }` → award +15 pts.

---

### 8.2 — Smart Break Suggestions

Before each break:

1. Fetch `GET /api/diary?limit=1` → get most recent mood.
2. Rule engine:
   - `stressed` or `tired` → "Go for a 5-min walk", "Do 10 deep breaths", "Stretch your neck and shoulders"
   - `neutral` or `happy` → "Drink water", "Do a quick meditation", "Look out the window for 2 minutes"
   - `excited` → "Channel that energy — plan your next task!"
3. Show as full-screen card with break countdown, "Start Break", "Skip Break", "More Suggestions" buttons.

---

### 8.3 — Pomodoro UI

- **Pomodoro screen:** large circular timer ring (react-native-svg arc that depletes), MM:SS in center, session counter below (e.g. "Session 2 of 4").
- **Controls:** Start/Pause (▶️/⏸️), Reset, Settings (configure 25/5 min durations).
- **Home stats card:** "Today's Focus" — Pomodoros completed today + total minutes focused.

---

## Phase 9 — Health Tracker Integration

### 9.1 — Google Fit Connection

#### 9.1.1-9.1.2 — OAuth 2.0 Setup

```bash
npm install @react-native-google-signin/google-signin
```

- Configure with OAuth client ID from Phase 0.4.4.
- Request scopes: `FITNESS_SLEEP_READ`, `FITNESS_ACTIVITY_READ`.
- On "Connect Google Fit": `GoogleSignin.signIn()` → user grants permissions → receive access token → store in AsyncStorage → `POST /api/health/connect`.

#### 9.1.3-9.1.5 — Fetch & Sync Health Data

On app startup (if Fit connected): call `/api/health/sync`. Backend calls Google Fit API:

- **Sleep:** `GET fitness/v1/users/me/sessions?activityType=72` → parse sleep duration.
- **Steps:** `GET fitness/v1/users/me/dataset:aggregate` with `dataTypeName=com.google.step_count.delta`.
- Store one row per day in `health_data` table.

---

### 9.2-9.3 — Backend & UI

- `POST /api/health` → store daily health data.
- `GET /api/health/insights` → return insight cards from `insights` table where `type = 'health'`.
- **Health Tab UI:**
  - Calendar heatmap of sleep hours (green = 8+, yellow = 6-8, red = <6).
  - Dual-axis line graph: sleep hours (blue) vs task completion rate (orange).
  - Insight cards: "On days with 8+ hours sleep, you complete 25% more tasks."
- If Fit not connected: show "Connect Google Fit for health insights" banner. Feature is optional.

---

## Phase 10 — Social Features

> Scope: connections + shared streaks only. No matching algorithm. No paid social SDK.

### 10.1 — Connections Backend

#### 10.1.1 — GET /api/users/search?q=name

```sql
SELECT id, name, email FROM users
WHERE (name ILIKE '%' || ? || '%' OR email ILIKE '%' || ? || '%')
AND id != req.user.userId
LIMIT 20
```

#### 10.1.2-10.1.5 — Connection Request Flow

- `POST /api/connections/request/:userId` → check if connection already exists (either direction) → INSERT `{ requester_id, addressee_id, status: 'pending' }` → send FCM to addressee.
- `POST /api/connections/accept/:connectionId` → verify `req.user.userId = connections.addressee_id` → UPDATE `status = 'accepted'` → send FCM to requester.
- `GET /api/connections` → JOIN users WHERE `status = 'accepted'` AND current user is requester OR addressee.
- `DELETE /api/connections/:id` → also delete any `shared_streaks` between these two users.

---

### 10.2 — Shared Streaks Backend

#### 10.2.1-10.2.2 — Create & Complete

- `POST /api/streaks` → body: `{ friendId, habit_name }` → verify friendship exists → INSERT into `shared_streaks`.
- `POST /api/streaks/:id/complete` → determine if `req.user` is `user1` or `user2` → set `user1_done_today` or `user2_done_today = true`.

#### 10.2.3 — Nightly Streak Evaluation

```js
cron.schedule("59 23 * * *", async () => {
  const streaks = await SharedStreak.findAll({
    where: { last_updated: { [Op.lt]: today } },
  });
  for (const streak of streaks) {
    if (streak.user1_done_today && streak.user2_done_today) {
      streak.current_streak += 1;
    } else {
      // Send FCM to both users
      await NotificationService.send(
        user1Token,
        "Streak Broken!",
        `Your ${streak.habit_name} streak has ended.`,
      );
      await NotificationService.send(
        user2Token,
        "Streak Broken!",
        `Your ${streak.habit_name} streak has ended.`,
      );
      streak.current_streak = 0;
    }
    streak.user1_done_today = false;
    streak.user2_done_today = false;
    streak.last_updated = today;
    await streak.save();
  }
});
```

---

### 10.3 — Social UI

- **Social Tab:** top half = friend list (name, disconnect button). Bottom half = active streaks.
- **Add Friend:** search bar → results → "Add Friend" button → sends request.
- **Pending Requests screen:** incoming requests with Accept/Decline.
- **New Streak:** tap "+" → select friend → enter habit name → confirm.
- **Streak card:** habit name, partner name, 🔥 emoji, streak count (large), "Mark Done Today" button (greyed out once tapped).
- **Streak reset:** "Streak Broken" modal with "Revive Streak" button — both must mark done next day to restart.

---

## Phase 11 — AI Microservice (Python FastAPI)

> All free Python libraries — no paid APIs.

### 11.1 — FastAPI Service Setup

```
/ai-service
├── main.py
├── requirements.txt
├── Dockerfile
├── /routes
│   ├── diary.py
│   ├── patterns.py
│   ├── burnout.py
│   ├── health.py
│   └── transcribe.py
└── /services
    ├── sentiment.py
    ├── patterns.py
    └── burnout.py
```

`requirements.txt`:

```
fastapi
uvicorn
pandas
scikit-learn
vaderSentiment
nltk
numpy
groq
openai-whisper
scipy
python-multipart
```

**Security middleware** — all endpoints require internal secret header:

```python
from fastapi import Header, HTTPException
import os

def verify_secret(x_internal_secret: str = Header(...)):
    if x_internal_secret != os.getenv("INTERNAL_SECRET"):
        raise HTTPException(status_code=403, detail="Forbidden")
```

---

### 11.2 — Sentiment Analysis

`POST /ai/analyze-diary` — body: `[{ id, text }]`

```python
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

analyzer = SentimentIntensityAnalyzer()

def analyze(entries):
    results = []
    for entry in entries:
        scores = analyzer.polarity_scores(entry['text'])
        compound = scores['compound']
        label = 'positive' if compound >= 0.05 else ('negative' if compound <= -0.05 else 'neutral')
        results.append({ 'id': entry['id'], 'compound_score': compound, 'label': label })

    # Trend detection
    avg_last_7 = sum(r['compound_score'] for r in results[-7:]) / min(7, len(results))
    downward_trend = avg_last_7 < -0.3

    return { 'results': results, 'downward_trend': downward_trend }
```

Node backend writes scores back: `UPDATE diary_entries SET sentiment_score = ? WHERE id = ?`

---

### 11.3 — Productivity Pattern Detection

`POST /ai/analyze-patterns` — body: `{ screenTime: [], tasks: [], pomodoro: [] }` (30 days)

```python
def calculate_productivity_score(tasks, pomodoro, screen_time):
    task_rate = completed_tasks / total_tasks  # 0-1
    pomo_rate = completed_pomodoros / total_pomodoros  # 0-1
    distracting_ratio = distracting_minutes / total_minutes  # 0-1

    score = (task_rate * 0.5) + (pomo_rate * 0.3) + ((1 - distracting_ratio) * 0.2)
    return round(score * 100, 1)

def detect_peak_hours(completed_at_timestamps):
    hours = [ts.hour for ts in completed_at_timestamps]
    # Find 3-hour window with most completions
    ...
```

Returns: `{ productivityScores: [], peakHours: "9AM-12PM", weeklyChange: -15, suggestions: [...] }`

---

### 11.4 — Burnout Detection

`POST /ai/burnout-check`

```python
import numpy as np

def check_burnout(indicators: dict):
    """
    indicators: {
      task_rate: [float x 14],      # daily task completion rate
      screen_time: [float x 14],    # daily unproductive minutes %
      sentiment: [float x 14],      # daily avg sentiment score
      pomodoro: [float x 14],       # daily pomodoro sessions
      sleep: [float x 14]           # daily sleep hours
    }
    """
    flagged = []
    for key, values in indicators.items():
        mean = np.mean(values[:-1])   # historical average (first 13 days)
        std = np.std(values[:-1])
        current = values[-1]          # today
        z_score = (current - mean) / std if std > 0 else 0
        if z_score < -2:              # 2 standard deviations below normal
            flagged.append(key)

    burnout_risk = len(flagged) >= 3
    recovery_plan = generate_recovery_plan(flagged) if burnout_risk else None

    return { 'burnoutRisk': burnout_risk, 'flaggedIndicators': flagged, 'recoveryPlan': recovery_plan }
```

---

### 11.5 — Health Correlation

`POST /ai/health-correlation`

```python
from scipy.stats import pearsonr

def correlate(health_data, productivity_data):
    sleep = [d['sleep_hours'] for d in health_data]
    task_rate = [d['task_completion_rate'] for d in productivity_data]

    r, p_value = pearsonr(sleep, task_rate)
    insights = []

    if r > 0.5:
        avg_high_sleep_rate = # avg task rate on days with >= 8hr sleep
        insights.append(f"On days with 8+ hours sleep, you complete ~{round(avg_high_sleep_rate*100)}% more tasks.")
    elif r < -0.5:
        insights.append("Poor sleep is negatively impacting your daily productivity.")

    return { 'insights': insights, 'correlation': round(r, 3) }
```

---

### 11.6 — Nightly Node.js Orchestration

```js
cron.schedule("0 0 * * *", async () => {
  const activeUsers = await getActiveUsers(); // active in last 7 days

  await Promise.allSettled(
    activeUsers.map(async (user) => {
      const headers = { "X-Internal-Secret": process.env.INTERNAL_AI_SECRET };

      // 1. Sentiment
      const entries = await getDiaryEntries(user.id, 7);
      const sentiment = await axios.post(
        `${AI_URL}/ai/analyze-diary`,
        entries,
        { headers },
      );
      await writeSentimentScores(sentiment.data.results);
      if (sentiment.data.downward_trend)
        await createInsight(user.id, "sentiment", "...");

      // 2. Patterns
      const patternData = await getPatternData(user.id, 30);
      const patterns = await axios.post(
        `${AI_URL}/ai/analyze-patterns`,
        patternData,
        { headers },
      );
      await createInsight(
        user.id,
        "pattern",
        patterns.data.suggestions.join("\n"),
      );

      // 3. Burnout
      const burnoutData = await getBurnoutData(user.id, 14);
      const burnout = await axios.post(
        `${AI_URL}/ai/burnout-check`,
        burnoutData,
        { headers },
      );
      if (burnout.data.burnoutRisk) {
        await createInsight(user.id, "burnout", burnout.data.recoveryPlan);
        if (user.notify_burnout_alert && user.fcm_token) {
          await NotificationService.send(
            user.fcm_token,
            "⚠️ Take care of yourself",
            burnout.data.recoveryPlan,
          );
        }
      }

      // 4. Health correlation
      const healthData = await getHealthData(user.id, 30);
      const health = await axios.post(
        `${AI_URL}/ai/health-correlation`,
        healthData,
        { headers },
      );
      for (const insight of health.data.insights) {
        await createInsight(user.id, "health", insight);
      }
    }),
  );
});
```

---

## Phase 12 — AI Chatbot Coach

### 12.1 — Backend Endpoint

#### 12.1.1 — Build User Context

Before calling LLM, fetch from DB:

- Last 7 days task completion % (from `tasks` table)
- Top 3 screen time apps today (from `screen_time`)
- Last 3 diary entries (mood + first 100 chars)
- Progress on each active goal

Keep context under ~500 tokens to leave room for conversation history.

#### 12.1.2 — System Prompt

```js
const systemPrompt = `You are a personal productivity coach for ${user.name}.
Their data this week:
- Task completion: ${rate}%
- Most-used app today: ${topApp} (${topAppMins} min)
- Recent mood: ${recentMoods}
- Goals: ${goalsSummary}
Be concise (under 100 words), specific to their data, and encouraging.`;
```

#### 12.1.3 — Call Groq API (Free)

```js
const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const completion = await groq.chat.completions.create({
  model: "llama-3.3-70b-versatile",
  messages: [
    { role: "system", content: systemPrompt },
    ...conversationHistory,
    { role: "user", content: userMessage },
  ],
  max_tokens: 256,
});

return completion.choices[0].message.content;
```

- ✅ **FREE:** Groq free tier — 30 req/min, 14,400 req/day. No credit card.

#### 12.1.4-12.1.5 — Multi-Turn Redis Context

```js
// Before LLM call
const raw = await redis.get(`chat:${userId}`);
const history = raw ? JSON.parse(raw) : [];

// After LLM call
history.push({ role: "user", content: userMessage });
history.push({ role: "assistant", content: botReply });
const trimmed = history.slice(-10); // keep last 10 messages
await redis.setex(`chat:${userId}`, 86400, JSON.stringify(trimmed)); // 24hr TTL
```

---

### 12.2 — Chatbot UI

- **Chat screen:** `FlatList` with `inverted={true}` (newest at bottom).
- **User messages:** right-aligned, blue background.
- **Bot messages:** left-aligned, grey background, small avatar icon.
- **Empty state:** 4 tappable starter chips: "How can I be more productive?", "Analyze my screen time", "Help me with my goals", "I'm feeling burnt out."
- **Typing indicator:** 3 animated dots while waiting.
- **Error state:** "Couldn't reach coach. Check your connection."

---

## Phase 13 — Gamification

### 13.1 — Points & Levels Backend

`services/PointsService.js`:

```js
const POINTS = {
  complete_task: 10,
  complete_task_high: 50,
  daily_streak: 20,
  complete_goal: 100,
  write_diary: 5,
  complete_pomodoro: 15,
};

async function awardPoints(userId, action) {
  const pts = POINTS[action] || 0;
  await db.query(
    `
    UPDATE users
    SET
      total_points = total_points + ?,
      level = FLOOR(SQRT((total_points + ?) / 50))
    WHERE id = ?
  `,
    [pts, pts, userId],
  );
}
```

Level formula: `level = Math.floor(Math.sqrt(totalPoints / 50))`

- 0 pts → level 0, 200 pts → level 2, 450 pts → level 3, 800 pts → level 4

`GET /api/gamification/profile` returns: `total_points`, `level`, `points_to_next_level` (`(level+1)² × 50 - total_points`), `percentage_to_next_level`.

---

### 13.2 — Achievements Backend

#### 13.2.1 — Seed 10 Achievements

| Name             | Criteria Key          | Value | Points |
| ---------------- | --------------------- | ----- | ------ |
| Early Bird       | `task_before_8am`     | 1     | 50     |
| Consistency King | `task_streak_days`    | 7     | 100    |
| Goal Crusher     | `goals_completed`     | 1     | 150    |
| Zen Master       | `pomodoros_completed` | 10    | 75     |
| Diary Keeper     | `diary_entries`       | 7     | 50     |
| Focus Champion   | `pomodoros_in_day`    | 5     | 100    |
| Detox Hero       | `detox_minutes`       | 60    | 75     |
| Social Butterfly | `friends_count`       | 1     | 30     |
| Streak Master    | `shared_streak_days`  | 14    | 200    |
| Night Owl        | `task_after_10pm`     | 1     | 30     |

Run: `npm run seed`

#### 13.2.2 — Hourly Achievement Check

- Hourly cron evaluates each achievement's `criteria_key` against real user data.
- If met AND not already in `user_achievements` → INSERT → send FCM → award `points_reward`.

---

### 13.3 — Gamification UI

```bash
npm install lottie-react-native
```

- **Profile screen:** circular level badge (large number), XP progress bar, total points, username.
- **Badge grid:** 2-column. Unlocked: full color + name + description + points. Locked: greyed out, name hidden.
- **Celebration animation:** play a Lottie JSON on badge unlock. Download free animations from https://lottiefiles.com (search: "achievement", "confetti", "stars").
- **Daily challenge card** on Home: randomly selected uncompleted achievement. "Complete 5 tasks today for +50 bonus pts." Tapping navigates to relevant screen.
- ✅ **FREE:** Lottie is Apache 2.0. LottieFiles has thousands of free animations.

---

## Phase 14 — Notifications

### 14.1 — FCM Setup

```bash
npm install firebase-admin
```

Initialize in `index.js`:

```js
const admin = require("firebase-admin");
const serviceAccount = require("./config/firebase-service-account.json");
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
```

`services/NotificationService.js`:

```js
async function send(fcmToken, title, body, data = {}) {
  return admin
    .messaging()
    .send({ token: fcmToken, notification: { title, body }, data });
}
module.exports = { send };
```

Store device token on login: `POST /api/users/fcm-token` → `UPDATE users SET fcm_token = ? WHERE id = ?`

- ✅ **FREE:** Firebase FCM free tier: 500K messages/month.

---

### 14.2 — Notification Triggers

| Trigger                                     | Cron / Event             | Respects Setting       |
| ------------------------------------------- | ------------------------ | ---------------------- |
| Task deadline (1hr before)                  | Hourly cron              | `notify_task_reminder` |
| Goal daily target (8AM + 6PM if incomplete) | Cron at 8:00 and 18:00   | `notify_goal_daily`    |
| Streak break                                | Cron at 23:59            | `notify_streak_break`  |
| Burnout alert                               | Nightly AI cron          | `notify_burnout_alert` |
| Achievement unlock                          | Immediately on detection | `notify_achievement`   |
| Friend request                              | Immediately on request   | always                 |

All triggers check the corresponding `user_settings` boolean before sending.

---

### 14.3 — Notification Settings UI

- `GET /api/users/settings` → load current toggle states.
- 5 toggle switches on screen (one per type).
- On toggle: `PATCH /api/users/settings` with `{ notify_task_reminder: false }` → updates `user_settings` table.

---

## Phase 15 — Testing & QA

### 15.1 — Backend Testing

#### 15.1.1 — Jest Unit Tests

```bash
# In /backend
npm test
```

Key tests:

- `PointsService`: given action `complete_task_high` → expect `total_points += 50`, level recalculated.
- Goal auto-adjustment: 50% completion after half duration → new `daily_target` calculated correctly.
- Burnout threshold: exactly 2 flagged → `burnoutRisk = false`. 3 flagged → `true`.

Aim for >80% coverage on `/services` files.

#### 15.1.2 — Supertest Integration Tests

```js
const request = require("supertest");
const app = require("../index");

describe("Auth", () => {
  it("should return 401 for protected route without token", async () => {
    const res = await request(app).get("/api/tasks");
    expect(res.status).toBe(401);
  });

  it("should return 400 for missing title on task create", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${validToken}`)
      .send({ priority: "high" }); // missing title
    expect(res.status).toBe(400);
  });
});
```

Use a separate test database (`nexlify_test`). Run migrations in `beforeAll`, rollback in `afterAll`.

#### 15.1.3 — Manual Cron Testing

Add dev-only endpoint:

```js
if (process.env.NODE_ENV === "development") {
  app.post("/api/dev/run-cron", async (req, res) => {
    const { job } = req.query;
    await cronJobs[job]();
    res.json({ message: `Ran ${job}` });
  });
}
```

#### 15.1.4 — Thunder Client / Hoppscotch Full Suite

Run every single endpoint from your Phase 0.3.3 documentation. All must return expected responses.

---

### 15.2 — Mobile Testing

#### 15.2.1 — Component Tests

```bash
npm install --save-dev @testing-library/react-native
```

Write tests for: task creation flow, diary saving, Pomodoro timer countdown.

#### 15.2.2-15.2.5 — Device & Feature Testing

- **Permission denial:** revoke Usage Access in emulator Settings → reopen app → should show explanation dialog, not crash.
- **App blocking:** set YouTube blocked with 1-minute limit → use it → overlay should appear.
- **Voice transcription:** test on real device or emulator with audio input.
- **Offline:** turn off WiFi → open app → cached data should be visible, offline banner shown.

---

### 15.3 — AI Service Testing

- **VADER:** "I am so happy and productive today!" → expect `compound > 0.5`. "I feel exhausted, anxious, overwhelmed" → expect `compound < -0.5`.
- **Burnout:** all 5 indicators below 2 SDs → `burnoutRisk = true`. Remove 2 → `false`.
- **Chatbot:** 20+ questions including edge cases (empty message, long message). Verify responses reference user context.

---

### 15.4 — Beta Testing

- Build debug APK:
  ```bash
  cd android && ./gradlew assembleDebug
  # Output: android/app/build/outputs/apk/debug/app-debug.apk
  ```
- Share APK via WhatsApp or Google Drive to 10-20 testers (no Play Console needed for debug APK).
- Create feedback form in **Google Forms** (free): feature ratings 1-5, open bug report field.
- Create GitHub Issues for each bug. Label as `bug` / `enhancement`. Fix top 5 before final submission.

---

## Phase 16 — Deployment & Documentation

### 16.1 — Backend Deployment (Free Hosting)

#### 16.1.1 — Docker Compose for Production

Create `docker-compose.yml` in root (extends the dev setup to include your app services):

```yaml
version: "3.9"
services:
  postgres:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASS}
      POSTGRES_DB: nexlify_db
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    restart: always
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

  backend:
    build: ./backend
    restart: always
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis
    env_file: ./backend/.env

  ai-service:
    build: ./ai-service
    restart: always
    ports:
      - "8000:8000"
    env_file: ./ai-service/.env

volumes:
  postgres_data:
  redis_data:
```

> ⚠️ **Important:** In production `.env`, use Docker service names as hostnames:
>
> ```
> DATABASE_URL=postgres://postgres:password@postgres:5432/nexlify_db
> REDIS_URL=redis://redis:6379
> ```
>
> (Not `localhost` — that only works in dev when containers expose ports to your machine.)

Test locally:

```bash
docker-compose up --build
```

---

#### 16.1.2 — Deploy to Railway (FREE — replaces AWS EC2)

- Go to https://railway.app → Sign up with GitHub → **New Project → Deploy from GitHub repo**.
- Railway auto-detects Node.js and Python. Add **PostgreSQL** and **Redis** as plugins (both free).
- Railway free tier: $5 credit/month — more than enough for FYP traffic.
- **Alternatives:** https://render.com (free tier) or https://fly.io (free tier).
- ✅ **FREE:** No credit card required. No billing surprises.

---

#### 16.1.3 — Set Environment Variables on Host

In Railway/Render dashboard → your service → **Variables** tab → add all `.env` values. `DATABASE_URL` and `REDIS_URL` are auto-set when you add the plugins.

#### 16.1.4 — HTTPS

Railway and Render **automatically provision SSL** via Let's Encrypt. Your API will be available at `https://nexlify-backend.railway.app/api`. Update `baseURL` in mobile app config.

---

### 16.2 — APK Build

#### 16.2.1-16.2.4 — Generate Signed Release APK

1. Update `baseURL` in `mobile/services/api.js` to your production URL.
2. Generate keystore:
   ```bash
   keytool -genkey -v -keystore nexlify-release.keystore -alias nexlify -keyalg RSA -keysize 2048 -validity 10000
   ```
3. Add to `android/gradle.properties`:
   ```
   NEXLIFY_STORE_FILE=nexlify-release.keystore
   NEXLIFY_KEY_ALIAS=nexlify
   NEXLIFY_STORE_PASSWORD=yourpassword
   NEXLIFY_KEY_PASSWORD=yourpassword
   ```
4. Build:
   ```bash
   cd android && ./gradlew assembleRelease
   # Output: android/app/build/outputs/apk/release/app-release.apk
   ```
5. Test release APK on a **real physical Android device** — some bugs only appear on real hardware.

---

### 16.3 — Documentation

#### 16.3.1 — Technical Docs

- `docs/ARCHITECTURE.md` — system diagram (mobile → Node.js → PostgreSQL/Redis → FastAPI AI), service explanations.
- `docs/API_REFERENCE.md` — every endpoint with request/response examples. Export from Thunder Client.
- `docs/DATABASE_SCHEMA.md` — copy schema from this document, note any changes made during development.

#### 16.3.2 — AI Model Docs

Document each technique:

- **VADER** — rule-based lexicon, no training required. MIT license.
- **scikit-learn** — Z-score anomaly detection, Pearson correlation. BSD license.
- **Whisper** — pre-trained transformer model. MIT license.
- **Groq / LLaMA 3.3** — pre-trained LLM, no fine-tuning. Free API tier.

#### 16.3.3 — Developer Setup Guide

Target: **clone → running in under 10 minutes**.

```
1. git clone https://github.com/YourUsername/nexlify.git
2. Copy .env.example to .env and fill in values
3. docker-compose -f docker-compose.dev.yml up -d   # start postgres + redis
4. cd backend && npm install && npx sequelize-cli db:migrate && node index.js
5. cd ai-service && pip install -r requirements.txt && uvicorn main:app --reload
6. cd mobile && npm install && npx react-native run-android
```

#### 16.3.4 — FYP Report

Per Abbottabad UST format. Typical sections: Abstract, Introduction, Literature Review, System Design (include architecture diagram from https://app.diagrams.net — free), Implementation, Testing, Results, Conclusion, References. Include screenshots of every major screen and the database ERD.

#### 16.3.5 — Demo Video (5-10 Minutes)

- **Screen recorder:** AZ Screen Recorder (Android app, free).
- **Video editor:** DaVinci Resolve (free) or CapCut (free).
- Walk through: onboarding → add + complete tasks → voice diary entry → set a goal → run a Pomodoro → screen time dashboard → chatbot conversation → achievement badge unlock.
- Upload to YouTube as **Unlisted**. Include link in FYP report.

---

## Free Stack Summary

> Total monthly cost: **$0.00** — no credit card required for any dependency.

| Category           | Free Tool                   | Replaces (Paid)                | Why Free Works                                |
| ------------------ | --------------------------- | ------------------------------ | --------------------------------------------- |
| Speech-to-Text     | Whisper (local)             | Google STT ($0.006/min)        | Same quality, runs offline, free forever      |
| LLM / AI Chat      | Groq Free Tier (LLaMA 3.3)  | OpenAI GPT-4 ($0.03/1k tokens) | 14,400 free req/day — enough for FYP          |
| Database           | PostgreSQL in Docker        | AWS RDS ($15+/month)           | Full-featured, free, open source              |
| Cache / Sessions   | Redis in Docker             | Redis Cloud paid tier          | Free to run in Docker, persisted with volumes |
| Push Notifications | Firebase FCM (free tier)    | AWS SNS                        | 500K messages/month free                      |
| Hosting            | Railway.app / Render.com    | AWS EC2 ($10-50/month)         | FYP traffic is minimal, free tier sufficient  |
| Sentiment Analysis | VADER (Python lib)          | AWS Comprehend                 | Open source, no API calls needed              |
| ML / Stats         | scikit-learn + scipy        | Google AutoML                  | Industry standard, MIT license                |
| API Testing        | Thunder Client / Hoppscotch | Postman paid teams             | Same functionality, free forever              |
| Design             | Figma (free plan)           | Figma Pro ($12/month)          | 3 projects free — enough for FYP              |
| CI/CD              | GitHub Actions (free tier)  | CircleCI paid                  | 2,000 min/month free                          |
| Animations         | Lottie (lottiefiles.com)    | Rive paid plan                 | Thousands of free JSON animations             |
| Charts             | react-native-chart-kit      | Highcharts (commercial)        | MIT licensed, feature-complete                |
| Video Editing      | DaVinci Resolve             | Adobe Premiere                 | Professional-grade, 100% free                 |
| Diagrams           | draw.io (app.diagrams.net)  | Lucidchart paid                | Free browser-based diagramming                |

---

_16 phases · ~110 sub-tasks · 100% free stack · Schema defined upfront_
