# Nexlify — Complete WSL Ubuntu Setup Guide

> Run every command in order. Do not skip steps.
> **WSL distro**: Ubuntu 22.04 LTS | **Target**: Android (React Native CLI)

---

## Pre-flight: WSL itself

Open PowerShell as Administrator on Windows and run:

```powershell
wsl --install -d Ubuntu-22.04
wsl --set-default-version 2
wsl --set-default Ubuntu-22.04
```

Restart your machine, then open Ubuntu from Start Menu and set your username/password.
Verify you are on WSL 2:

```powershell
wsl -l -v
```

You should see `VERSION 2` next to Ubuntu-22.04.

---

## Step 1 — System update

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git unzip zip build-essential ca-certificates gnupg lsb-release software-properties-common
```

---

## Step 2 — Node.js 20 LTS (via nvm)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

Close and reopen terminal, then:

```bash
nvm install 20
nvm use 20
nvm alias default 20
node -v    # should print v20.x.x
npm -v     # should print 10.x.x
```

---

## Step 3 — Python 3.11 + pip + venv

```bash
sudo add-apt-repository ppa:deadsnakes/ppa -y
sudo apt update
sudo apt install -y python3.11 python3.11-venv python3.11-dev python3-pip
python3.11 --version    # Python 3.11.x
```

---

## Step 4 — PostgreSQL 15

```bash
sudo apt install -y postgresql postgresql-contrib
sudo service postgresql start
sudo service postgresql status   # should say "active"
```

Set password for postgres superuser:

```bash
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
```

Create the project database:

```bash
sudo -u postgres psql -c "CREATE DATABASE nexlify;"
sudo -u postgres psql -c "\l"   # verify nexlify is listed
```

Make PostgreSQL auto-start on WSL boot:

```bash
echo "sudo service postgresql start" >> ~/.bashrc
```

---

## Step 5 — Redis

```bash
sudo apt install -y redis-server
sudo service redis-server start
redis-cli ping    # should return PONG
```

Auto-start:

```bash
echo "sudo service redis-server start" >> ~/.bashrc
```

---

## Step 6 — Java 17 (required for React Native / Android builds)

```bash
sudo apt install -y openjdk-17-jdk
java -version    # openjdk version "17.x.x"
```

Set JAVA_HOME:

```bash
echo 'export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64' >> ~/.bashrc
echo 'export PATH=$JAVA_HOME/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
echo $JAVA_HOME   # should print the path
```

---

## Step 7 — Android SDK (command-line tools — no Android Studio GUI needed in WSL)

> You will use Android Studio on **Windows** for the emulator. WSL handles all your code and builds.

```bash
mkdir -p ~/android-sdk/cmdline-tools
cd ~/android-sdk/cmdline-tools
wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
unzip commandlinetools-linux-11076708_latest.zip
mv cmdline-tools latest
rm commandlinetools-linux-11076708_latest.zip
```

Set Android environment variables:

```bash
echo 'export ANDROID_HOME=$HOME/android-sdk' >> ~/.bashrc
echo 'export ANDROID_SDK_ROOT=$ANDROID_HOME' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_HOME/emulator' >> ~/.bashrc
source ~/.bashrc
```

Accept licenses and install SDK components:

```bash
sdkmanager --licenses   # type 'y' and press Enter for every prompt
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
sdkmanager --list | grep "build-tools"   # verify installed
```

---

## Step 8 — React Native CLI

```bash
npm install -g react-native-cli
npm install -g @react-native-community/cli
```

Verify:

```bash
npx react-native --version
```

---

## Step 9 — Docker & Docker Compose

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

docker --version            # Docker version 24+
docker compose version      # Docker Compose version 2.x
```

Start Docker daemon:

```bash
sudo service docker start
docker run hello-world    # should print "Hello from Docker!"
```

Auto-start:

```bash
echo "sudo service docker start" >> ~/.bashrc
```

---

## Step 10 — VS Code (connect from Windows)

Install VS Code on **Windows** (not inside WSL).
Install the **WSL extension** in VS Code.
Then from your WSL terminal:

```bash
cd ~
code .    # opens VS Code connected to WSL
```

Install these VS Code extensions (run inside WSL-connected VS Code):

- ESLint
- Prettier
- React Native Tools
- PostgreSQL (by Chris Kolkman)
- Docker
- Python
- GitLens

---

## Step 11 — pgAdmin (optional, Windows-side)

Download and install pgAdmin 4 from https://www.pgadmin.org/download/pgadmin-4-windows/

Connect using:

- Host: `localhost`
- Port: `5432`
- Username: `postgres`
- Password: `postgres`

> WSL PostgreSQL is accessible from Windows on localhost because WSL 2 forwards ports automatically.

---

## Step 12 — Clone the repo and set up project structure

```bash
cd ~
git clone https://github.com/<your-username>/nexlify.git
cd nexlify
```

If the repo doesn't exist yet, create it:

```bash
mkdir nexlify && cd nexlify
git init
mkdir mobile backend ai-service
touch README.md
git add . && git commit -m "chore: initial project structure"
```

---

## Step 13 — Backend setup (Node.js/Express)

```bash
cd ~/nexlify/backend
npm init -y
npm install express pg sequelize bcrypt jsonwebtoken ioredis morgan cors dotenv node-cron uuid
npm install -D nodemon eslint prettier jest supertest
```

Create folder structure:

```bash
mkdir -p controllers models routes middleware services
touch index.js .env .env.example
```

Populate `.env`:

```bash
cat > .env << 'EOF'
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=nexlify
DB_USER=postgres
DB_PASS=postgres

REDIS_URL=redis://localhost:6379

JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRES_IN=2h
REFRESH_TOKEN_EXPIRES_IN=30d

FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email

GROQ_API_KEY=your_groq_api_key

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_SECRET=internal_secret_key_change_this
EOF
```

Add start scripts to `package.json`:

```bash
npm pkg set scripts.dev="nodemon index.js"
npm pkg set scripts.start="node index.js"
npm pkg set scripts.test="jest"
```

Test backend boots:

```bash
npm run dev   # should start without errors
```

---

## Step 14 — AI microservice setup (Python FastAPI)

```bash
cd ~/nexlify/ai-service
python3.11 -m venv venv
source venv/bin/activate
```

Create `requirements.txt`:

```bash
cat > requirements.txt << 'EOF'
fastapi==0.111.0
uvicorn==0.29.0
pandas==2.2.2
scikit-learn==1.4.2
vaderSentiment==3.3.2
nltk==3.8.1
numpy==1.26.4
groq==0.9.0
python-dotenv==1.0.1
httpx==0.27.0
EOF
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Download NLTK data (needed for text processing):

```bash
python3 -c "import nltk; nltk.download('punkt'); nltk.download('stopwords'); nltk.download('vader_lexicon')"
```

Create folder structure:

```bash
mkdir -p routes services
touch main.py .env
```

Populate `.env`:

```bash
cat > .env << 'EOF'
INTERNAL_SECRET=internal_secret_key_change_this
EOF
```

Test FastAPI boots:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
# visit http://localhost:8000/docs in browser to see Swagger UI
```

Deactivate venv when done:

```bash
deactivate
```

---

## Step 15 — React Native mobile app setup

> The mobile folder lives in WSL but the **emulator runs on Windows**. Android Studio must be installed on Windows with an emulator set up there.

```bash
cd ~/nexlify
npx react-native init mobile --template react-native-template-typescript
cd mobile
```

Install all project dependencies:

```bash
npm install @react-navigation/native @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
npm install @react-native-async-storage/async-storage
npm install @reduxjs/toolkit react-redux
npm install axios
npm install react-native-vector-icons
npm install react-native-voice
npm install @react-native-google-signin/google-signin
npm install react-native-chart-kit react-native-svg
npm install lottie-react-native
npm install @notifee/react-native
npm install @react-native-firebase/app @react-native-firebase/messaging
```

Create global theme file:

```bash
mkdir -p src/theme src/api src/store src/screens src/components
touch src/theme/index.js src/api/api.js
```

---

## Step 16 — Docker Compose for backend services

```bash
cd ~/nexlify
cat > docker-compose.yml << 'EOF'
version: '3.9'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: nexlify
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - ./backend/.env
    depends_on:
      - postgres
      - redis

  ai-service:
    build: ./ai-service
    ports:
      - "8000:8000"
    env_file:
      - ./ai-service/.env

volumes:
  pgdata:
EOF
```

> In development, run PostgreSQL and Redis locally (Steps 4–5) and only run the app services with Docker. In production, run everything via Docker Compose.

---

## Step 17 — Git setup and .gitignore files

```bash
cd ~/nexlify
```

Root `.gitignore`:

```bash
cat > .gitignore << 'EOF'
.DS_Store
*.log
EOF
```

Backend `.gitignore`:

```bash
cat > backend/.gitignore << 'EOF'
node_modules/
.env
dist/
coverage/
EOF
```

AI service `.gitignore`:

```bash
cat > ai-service/.gitignore << 'EOF'
venv/
__pycache__/
*.pyc
.env
*.egg-info/
EOF
```

Mobile `.gitignore`:

```bash
cat > mobile/.gitignore << 'EOF'
node_modules/
android/app/build/
android/build/
android/.gradle/
ios/build/
.env
*.keystore
google-services.json
EOF
```

Initial commit:

```bash
cd ~/nexlify
git add .
git commit -m "chore: project scaffolding complete"
git remote add origin https://github.com/<your-username>/nexlify.git
git push -u origin main
```

---

## Step 18 — GitHub Actions CI

```bash
mkdir -p ~/nexlify/.github/workflows
cat > ~/nexlify/.github/workflows/ci.yml << 'EOF'
name: CI

on:
  push:
    branches: ["**"]
  pull_request:
    branches: [main, dev]

jobs:
  backend-lint:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run lint

  ai-lint:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ai-service
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"
      - run: pip install flake8
      - run: flake8 . --max-line-length=120
EOF
```

---

## Step 19 — Android Studio on Windows (for emulator)

> You MUST do this on Windows, not in WSL. The emulator needs hardware GPU access.

1. Download Android Studio from https://developer.android.com/studio
2. Install it — default options are fine
3. Open Android Studio → More Actions → SDK Manager
   - Install: Android 14.0 (API 34), Android SDK Build-Tools 34.0.0
4. Open Android Studio → More Actions → Virtual Device Manager
   - Create Device → Pixel 7 → API 34 → Finish
   - Start the emulator — verify it boots

5. From WSL, verify `adb` can see the Windows emulator:

```bash
export ADB_SERVER_SOCKET=tcp:localhost:5037
adb devices    # should list the emulator
```

If not detected, add to `.bashrc`:

```bash
echo 'export ADB_SERVER_SOCKET=tcp:localhost:5037' >> ~/.bashrc
source ~/.bashrc
```

---

## Step 20 — Run the full stack locally (development)

Open 3 WSL terminal tabs:

**Tab 1 — Backend:**

```bash
cd ~/nexlify/backend
npm run dev
```

**Tab 2 — AI service:**

```bash
cd ~/nexlify/ai-service
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Tab 3 — Mobile:**

```bash
cd ~/nexlify/mobile
npx react-native start
```

Then in a **4th tab**, with the Windows emulator already running:

```bash
cd ~/nexlify/mobile
npx react-native run-android
```

---

## Quick health checks

Run these at any time to confirm services are up:

```bash
# Backend
curl http://localhost:3000/api/health

# AI service
curl http://localhost:8000/docs

# PostgreSQL
psql -h localhost -U postgres -d nexlify -c "\dt"

# Redis
redis-cli ping

# ADB (emulator)
adb devices
```

---

## Versions reference

| Tool           | Version    |
| -------------- | ---------- |
| Ubuntu (WSL)   | 22.04 LTS  |
| Node.js        | 20 LTS     |
| npm            | 10.x       |
| Python         | 3.11       |
| PostgreSQL     | 15         |
| Redis          | 7          |
| Java (JDK)     | 17         |
| Android SDK    | API 34     |
| React Native   | Latest CLI |
| Docker         | 24+        |
| Docker Compose | v2         |

---

## Common errors & fixes

**`adb devices` shows nothing from WSL**

```bash
# On Windows PowerShell (not WSL):
adb kill-server
adb start-server
# Then back in WSL:
adb devices
```

**PostgreSQL: `could not connect to server`**

```bash
sudo service postgresql start
sudo service postgresql status
```

**Redis: `Connection refused`**

```bash
sudo service redis-server start
```

**`npx react-native run-android` fails with SDK not found**

```bash
source ~/.bashrc   # reload env vars
echo $ANDROID_HOME   # should print ~/android-sdk
sdkmanager --list | grep "build-tools"
```

**WSL out of memory during npm install**
Create `C:\Users\<you>\.wslconfig` on Windows:

```ini
[wsl2]
memory=8GB
processors=4
```

Then restart WSL: `wsl --shutdown` in PowerShell.

**Python `ModuleNotFoundError` in FastAPI**

```bash
cd ~/nexlify/ai-service
source venv/bin/activate   # always activate venv first
```

---

_Setup guide for Nexlify (Focus Flow) — WSL Ubuntu 22.04_
