# Nexlify — Developer Setup & Startup Guide

> **Stack**: Node.js/Express (Backend) · FastAPI/Python (AI Service) · React Native (Mobile) · PostgreSQL + Redis (Docker)

---

## Prerequisites

Before anything, make sure these are installed in your WSL Ubuntu environment.

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 20 LTS | `nvm install 20` |
| npm | 10.x | comes with Node |
| Python | 3.11 | `sudo apt install python3.11 python3.11-venv` |
| Docker | 24+ | see Step 1 below |
| Docker Compose | v2 | comes with Docker |

---

## Step 1 — Start the Database & Redis (Docker)

PostgreSQL and Redis run via Docker. This is the **only** thing you need Docker for.

```bash
# From the project root
docker compose up -d
```

Verify both containers are healthy:

```bash
docker compose ps
```

You should see `nexlify_postgres` and `nexlify_redis` with status **healthy**.

To stop them:

```bash
docker compose down
```

> **Data persistence**: PostgreSQL data is stored in the `pgdata` Docker volume — it survives container restarts.

---

## Step 2 — Run the Backend (Node.js / nodemon)

```bash
cd backend
npm install          # first time only
npm run dev
```

The backend starts on **http://localhost:5000**

Health check:
```bash
curl http://localhost:5000/api/health
```

> Make sure `backend/.env` exists. Copy from the example if needed:
> ```bash
> cp backend/.env.example backend/.env
> ```
> Key env vars that must point to localhost (not Docker service names):
> ```env
> DB_HOST=localhost
> DB_PORT=5432
> DB_NAME=nexlify
> DB_USER=postgres
> DB_PASS=postgres
> REDIS_URL=redis://localhost:6379
> AI_SERVICE_URL=http://localhost:8000
> ```

---

## Step 3 — Run the AI Service (Python / uvicorn)

```bash
cd ai-service

# First time: create and activate virtual environment
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Every time after:
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The AI service starts on **http://localhost:8000**

Swagger UI (interactive API docs): http://localhost:8000/docs

Health check:
```bash
curl http://localhost:8000/health
```

To deactivate the venv when done:
```bash
deactivate
```

---

## Step 4 — Run the Mobile App (React Native)

> The emulator must be running on **Windows** via Android Studio. The Metro bundler runs inside WSL.

**Terminal A — Metro bundler:**
```bash
cd mobile
npm install          # first time only
npx react-native start
```

**Terminal B — Build & deploy to emulator:**
```bash
cd mobile
npx react-native run-android
```

> If `adb devices` shows nothing from WSL, run this in WSL:
> ```bash
> export ADB_SERVER_SOCKET=tcp:localhost:5037
> ```
> Add it to `~/.bashrc` to make it permanent.

---

## Full Stack Startup (Quick Reference)

Open **4 terminal tabs** and run each command:

| Tab | Directory | Command |
|-----|-----------|---------|
| 1 — Infra | `my-fyp/` | `docker compose up -d` |
| 2 — Backend | `my-fyp/backend/` | `npm run dev` |
| 3 — AI Service | `my-fyp/ai-service/` | `source venv/bin/activate && uvicorn main:app --reload --port 8000` |
| 4 — Mobile | `my-fyp/mobile/` | `npx react-native start` |

Then in a **5th tab** (one-time after emulator boots):
```bash
cd mobile && npx react-native run-android
```

---

## Environment Files

Each service has its own `.env` file. **Never commit these to git.**

| File | Purpose |
|------|---------|
| `backend/.env` | DB credentials, JWT secret, Redis URL, API keys |
| `ai-service/.env` | Internal service secret |

Copy from `.env.example` files to get started:
```bash
cp backend/.env.example backend/.env
cp ai-service/.env.example ai-service/.env
```

---

## Common Errors & Fixes

**`docker compose up` fails — port already in use**
```bash
# Check what's using port 5432 or 6379
sudo lsof -i :5432
sudo lsof -i :6379
# Kill the process or stop the conflicting service
sudo service postgresql stop   # if local postgres is running
```

**Backend can't connect to PostgreSQL**
```bash
# Confirm docker containers are up and healthy
docker compose ps
# Confirm DB_HOST=localhost in backend/.env (not 'postgres')
```

**`uvicorn: command not found`**
```bash
# You forgot to activate the venv
cd ai-service && source venv/bin/activate
```

**`ModuleNotFoundError` in FastAPI**
```bash
cd ai-service
source venv/bin/activate
pip install -r requirements.txt
```

**`adb devices` shows nothing from WSL**
```bash
# On Windows PowerShell:
adb kill-server
adb start-server
# Back in WSL:
export ADB_SERVER_SOCKET=tcp:localhost:5037
adb devices
```

**WSL runs out of memory during npm install**

Create `C:\Users\<you>\.wslconfig` on Windows:
```ini
[wsl2]
memory=8GB
processors=4
```
Then: `wsl --shutdown` in PowerShell and relaunch.

---

## First-Time WSL Setup (New Machine)

If setting up from scratch on a new machine:

### 1. WSL + Ubuntu
```powershell
# Windows PowerShell (Admin)
wsl --install -d Ubuntu-22.04
wsl --set-default-version 2
```

### 2. System packages
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git build-essential ca-certificates gnupg lsb-release software-properties-common
```

### 3. Node.js 20 via nvm
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
# Restart terminal, then:
nvm install 20 && nvm use 20 && nvm alias default 20
```

### 4. Python 3.11
```bash
sudo add-apt-repository ppa:deadsnakes/ppa -y
sudo apt update
sudo apt install -y python3.11 python3.11-venv python3.11-dev python3-pip
```

### 5. Docker
```bash
sudo apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

sudo usermod -aG docker $USER
newgrp docker

# Start Docker daemon
sudo service docker start
```

Auto-start Docker on WSL launch:
```bash
echo "sudo service docker start" >> ~/.bashrc
```

### 6. Clone the repo
```bash
cd ~
git clone https://github.com/<your-username>/nexlify.git my-fyp
cd my-fyp
```

Then follow **Steps 1–4** at the top of this guide to start all services.

---

_Nexlify (Focus Flow) — Developer Guide_
