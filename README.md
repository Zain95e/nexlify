# Nexlify (Focus Flow)

> A smart productivity and digital wellbeing app — built as a Final Year Project.

**Team**: Zain Ali & Zain Ul Abideen  
**Stack**: Expo (React Native) · Node.js/Express · PostgreSQL · Redis · Python FastAPI (AI)

---

## Features

- 📋 **Task Management** — create, prioritise, and track tasks with streaks & points
- 📓 **Digital Diary** — voice-to-text entries with AI sentiment analysis
- 🎯 **Goal Management** — auto-decomposed daily micro-tasks with smart re-adjustment
- 🍅 **Pomodoro Timer** — focus sessions with AI-suggested breaks
- 🤝 **Social Streaks** — shared habit streaks with friends
- 🏃 **Health Tracker** — Google Fit integration with sleep/productivity correlation
- 🤖 **AI Chatbot Coach** — Groq LLM grounded in your personal data
- 🏆 **Gamification** — points, levels, and achievement badges

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile | Expo SDK 54 (React Native), Expo Router, Redux Toolkit |
| Backend | Node.js 20, Express 5, PostgreSQL 15, Redis 7 |
| AI Service | Python 3.11, FastAPI, VADER, scikit-learn, Groq LLM |
| Infra | Docker, Docker Compose, GitHub Actions CI/CD |

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (with WSL integration enabled on Windows)
- [Node.js 20 LTS](https://nodejs.org/)
- [Expo Go](https://expo.dev/go) app on your Android device **or** an Android emulator

---

## Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/Zynalex9/nexlify.git
cd nexlify
```

### 3. Install Dependencies

You need to install dependencies for each service individually:

**Backend:**
```bash
cd backend
npm install
```

**Mobile:**
```bash
cd mobile
npm install
```

**AI Service:**
```bash
cd ai-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Running the Application

### 1. Start the Infrastructure (Docker)
Ensure Docker is running, then start Postgres and Redis:
```bash
docker-compose up -d
```

### 2. Start the Backend
```bash
cd backend
npm run dev
```

### 3. Start the AI Service
```bash
cd ai-service
python main.py
```

### 4. Start the Mobile App
```bash
cd mobile
npx expo start
```
- `GROQ_API_KEY` — free at [console.groq.com](https://console.groq.com)
- `GOOGLE_*` — from Google Cloud Console (optional — needed for Fit & Speech)

### 3. Start all services with Docker

```bash
docker compose up --build
```

This starts:
| Service | URL |
|---|---|
| Backend API | http://localhost:5000 |
| AI Microservice | http://localhost:8000 |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

Health check:
```bash
curl http://localhost:5000/api/health
curl http://localhost:8000/health
```

### 4. Run the mobile app

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with Expo Go on your phone, or press `a` to open the Android emulator.

---

## Project Structure

```
nexlify/
├── backend/          # Node.js/Express REST API
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── models/
│   │   └── services/
│   ├── Dockerfile
│   └── .env.example
├── ai-service/       # Python FastAPI AI microservice
│   ├── routes/
│   ├── services/
│   ├── main.py
│   ├── Dockerfile
│   └── requirements.txt
├── mobile/           # Expo React Native app
│   └── app/
├── docker-compose.yml
└── .github/workflows/ci.yml
```

---

## CI / CD

| Trigger | Action |
|---|---|
| Push to any branch | ESLint (backend) + flake8 (ai-service) |
| Push to `main` (after lint passes) | Build & push Docker images to Docker Hub (`zynalex9/nexlify-backend`, `zynalex9/nexlify-ai-service`) |

**Required GitHub Secrets** (Settings → Secrets → Actions):
- `DOCKERHUB_USERNAME` = `Zynalex9`
- `DOCKERHUB_TOKEN` = Docker Hub access token

---

## Development (without Docker)

**Backend:**
```bash
cd backend
npm install
npm run dev        # nodemon on port 5000
```

**AI Service:**
```bash
cd ai-service
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

---

## Database Schema

See [Phases.md](./Phases.md) — the full schema (17 tables) is defined in the Database Schema section at the top.

---

_Nexlify FYP — Abbottabad University of Science & Technology_
