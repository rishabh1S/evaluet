# Evaluet — Real-Time AI Interview Platform 🎙️🤖

Evaluet is a real-time, voice-first AI interview platform that simulates realistic technical interviews using live speech recognition, streaming LLM responses, and synchronized interviewer video presence.

Unlike chat-based interview tools, Evaluet focuses on natural turn-taking, spoken responses, and interviewer realism, closely matching real interview conditions.

## ✨ Key Features

### 🎧 Live Voice Interviews
- Real-time **speech-to-text** using Deepgram Flux
- Low-latency **AI voice responses** with natural turn-taking
- WebSocket-based duplex audio streaming
- Designed for uninterrupted spoken conversation

### 🧠 Realistic AI Interviewer
- Structured multi-phase interviews:
  - Introduction
  - Core subject validation
  - Resume verification
  - Behavioral assessment
  - Closing discussion
- Adaptive difficulty (basic → deep → edge cases)
- Strict turn-taking and termination rules
- No coaching, no teaching — **evaluation only**

### 📊 Automated Interview Reports
- AI-generated structured feedback
- Strengths, weaknesses, communication analysis
- Numerical score (1–10)
- Designed for async generation after interview completion

### 🔐 Authentication & Security
- Email + password authentication
- JWT-based access control
- Protected REST and WebSocket endpoints
- Secure token storage on mobile (Expo SecureStore)

### 📱 Mobile-First Experience
- Built with **Expo + React Native**
- Optimized for iOS audio sessions
- Stable recording/playback using `expo-av`
- Clean, distraction-free interview UI

---

## 🏗️ Architecture Overview
```
Mobile App (Expo / React Native)
│
├── Audio Recorder (PCM 16kHz)
├── WebSocket (Live Audio + AI Audio)
├── Interviewer Video Stage
│
Backend (FastAPI)
│
├── WebSocket Runtime
│   ├── STT (Deepgram Flux)
│   ├── LLM Streaming (Groq)
│   ├── TTS (Deepgram Aura-2)
│
├── Interview State Manager
├── Transcript & Session Persistence (Postgres)
├── Report Generation Pipeline
│   └── LLM → JSON → Email
│
Postgres (NeonDB)
S3 (Interviewer Media)
```

## 🧩 Tech Stack

### Backend
- **FastAPI** — REST + WebSocket APIs
- **SQLAlchemy** — ORM
- **PostgreSQL (NeonDB compatible)**
- **Deepgram Flux** — Real-time STT
- **Groq LLM API** — Interview logic & reporting
- **JWT (python-jose)** — Authentication
- **Passlib (bcrypt)** — Password hashing

### Frontend
- **Expo (React Native)**
- **Expo Router**
- **Tamagui** — UI system
- **expo-av** — Audio playback
- **expo-audio-studio** — PCM audio capture
- **WebSockets** — Real-time communication
- **Zustand** - Global State management
- **Tanstack Query** - Data fetching

## 📂 Project Structure

### Backend
```
backend/
├── app/
│ ├── auth/ # Auth, JWT, security
│ ├── models/ # SQLAlchemy models
│ ├── routers/ # API routes
│ ├── services/ # STT, TTS, interview logic
│ ├── prompts/ # System & report prompts
│ ├── repository/ # DB access layer
│ ├── db.py # DB setup
│ └── main.py # App entrypoint
```

### Frontend

```
app-ui/
├── app/
│ ├── (auth)/ # Login / Register
│ ├── (app)/ # Protected screens
│ ├── interview/ # Live interview UI
│ └── _layout.tsx # App layout & routing
├── components/ # UI components
├── lib/ # Auth, env, helpers
└── tamagui.config.ts
```

---

## 🔧 Installation & Local Setup

### Clone the Repository

```bash
git clone https://github.com/rishabh1S/evaluet.git
cd evaluet
```

### 🧠 Backend Setup (FastAPI)
Prerequisites
- Python 3.10+
- PostgreSQL (local or managed, e.g. NeonDB)
- Virtual environment (recommended)


```
cd backend
python -m venv .venv
source .venv/bin/activate   # macOS / Linux
# venv\Scripts\activate    # Windows

pip install -r requirements.txt

python run.py
```

### 📱 Frontend Setup (Expo – React Native)
Prerequisites
- Node.js 18+
- Yarn or PNPM
- Expo CLI
- Android Studio / Xcode (optional, for simulators)

```
cd app-ui
yarn install

npx expo prebuild 
npx expo run
```

## 🧩 Interviewer Character Setup (Required)

The application depends on **predefined interviewer personas** stored in the database.

⚠️ **Important**:  
The `interviewer_characters` table is **not transactional** and is **not auto-populated**.  
At least **one interviewer record must exist** before starting an interview.

If no interviewer characters are present:
- The interviewer selection carousel will be empty
- Interview sessions cannot be started

### 📄 Database Table
This table stores:
- Interviewer identity and personality
- LLM behavior and evaluation prompts
- Voice model selection
- Idle / talking video URLs


---

### 🛠️ Required Fields per Interviewer

Each interviewer **must** include:

- `id` (string, e.g. `sarah`, `marcus`)
- `name`
- `behavior_prompt`
- `evaluation_prompt`
- `voice_model`
- `idle_video_url`
- `talking_video_url`
- `is_active = true`

---

### 🧪 Example: Insert Interviewer Character

```sql
INSERT INTO interviewer_characters (
    id,
    name,
    description,
    voice_model,
    behavior_prompt,
    evaluation_prompt,
    focus_areas,
    profile_image_url,
    idle_video_url,
    talking_video_url,
    is_active
) VALUES (
    'sarah',
    'Sarah',
    'A supportive, collaborative senior interviewer who evaluates problem-solving and team fit.',
    'aura-2-aurora-en',
    $$You are a calm, encouraging interviewer. Ask clear, structured questions and probe using follow-ups.$$,
    $$Evaluate clarity of thought, problem-solving depth, and communication.$$,
    'Problem solving, communication, collaboration',
    'https://<cdn>/interviewers/sarah/profile.png',
    'https://<cdn>/interviewers/sarah/idle.mp4',
    'https://<cdn>/interviewers/sarah/talking.mp4',
    TRUE
);
```

## 🌱 Environment Variables

To run this project, you will need to add the following environment variables to your .env file at base location

```
DATABASE_URL=postgresql://user:password@host:5432/dbname

JWT_SECRET=your_secure_jwt_secret

GROQ_API_KEY=your_groq_api_key
DEEPGRAM_API_KEY=your_deepgram_api_key

MAIL_USERNAME=your_email@example.com
MAIL_PASSWORD=your_email_password_or_app_key

EXPO_PUBLIC_API_BASE=http://localhost:8000
EXPO_PUBLIC_WS_BASE=ws://localhost:8000
```

## 🔐 Authentication Flow

1. User registers or logs in via email/password
2. Backend issues a JWT
3. JWT stored securely on device
4. All protected API calls include:
   Authorization: Bearer <token>
5. WebSocket interview sessions validate the token before initialization

## 🎙️ Interview Lifecycle

### 1. Interview Setup
- User selects:
- Job role
- Job level
- Interviewer persona
- Resume uploaded as PDF
- Backend:
- Extracts resume text
- Builds a **context-aware system prompt**
- Creates a persistent interview session in the database
- Returns a session-bound WebSocket URL

---

### 2. Live Interview (Real-Time)

- Client opens a **WebSocket connection** using the session ID
- Microphone audio streamed as **raw PCM (16kHz, mono)** in near-real time
- Backend pipeline:
- **Deepgram Flux** performs streaming STT with End-Of-Turn detection
- User speech is queued only when AI is not speaking
- AI responses are streamed token-by-token from **Groq LLM**
- Sentences are converted to speech via **Deepgram Aura-2 TTS**
- Strict turn-taking enforced:
- No audio overlap
- Silence keep-alive maintains STT connection
- Interviewer video stage:
- Idle and talking videos are **preloaded**
- Seamless crossfade triggered only when AI speaks
- Randomized seek offsets prevent repetitive visual loops

---

### 3. Deterministic Finalization
- Interview ends when:
- AI emits an explicit end signal
- Or interview state expires
- Backend actions:
- Transcript finalized and stored
- Session marked **COMPLETED** or **FAILED**
- WebSocket gracefully closed
- Client:
- Stops recording
- Clears interviewer state
- Displays interview completion state

---

### 4. Async Report Generation
- Runs **out-of-band** after interview completion
- Backend:
- Cleans and normalizes transcript
- Generates a structured evaluation using LLM
- Enforces strict JSON-only output
- Parses output using fault-tolerant JSON handling
- Results:
- Hiring score (1–10)
- Detailed markdown feedback
- Report is:
- Stored in the database
- Sent to the candidate via email

---

## 🧠 Interviewer Design Philosophy

Evaluet’s interviewer is intentionally designed as an **evaluation system**, not a chatbot.

Core principles:
- **Human-like presence** without pretending to be human
- **Voice-first interaction**, not text-first
- **No coaching, hints, or teaching**
- Focus on:
- Fundamentals
- Problem-solving approach
- Communication clarity
- Decision-making under ambiguity
- Deterministic behavior:
- Clear interview start
- Clear interview end
- No endless conversations

Interviewer personas (e.g., Sarah, Marcus, Victoria) differ in **tone and pressure**, but all follow the same rigorous evaluation standards.

This ensures interviews feel realistic, fair, and consistently measurable.

## ⚠️ Notes & Constraints

- Designed for voice-first usage
- Optimized for iOS audio behavior
- Requires active internet connection
- Report generation is asynchronous by design

## 🛣️ Future Enhancements

- OAuth (Google / LinkedIn)
- Interview replay & analytics

## License
This project is licensed under a custom **Non-Commercial Source-Available License**.  
Commercial use is strictly prohibited.

[Check here](https://github.com/rishabh1S/Evaluet/blob/main/LICENSE.md)

![Logo](https://evaluet-interviewers-media.s3.ap-south-1.amazonaws.com/evaluet.png)
