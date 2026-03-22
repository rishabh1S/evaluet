# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What & Why

Evaluet is a voice-first AI mock interview platform. Users conduct spoken technical interviews with AI personas; the backend handles real-time WebSocket audio streaming (Deepgram STT → Groq LLM → Deepgram TTS) and generates scored reports asynchronously after each session.

## Tech Stack

**Backend:** FastAPI · SQLAlchemy · PostgreSQL (NeonDB) · Deepgram SDK · Groq SDK · uvicorn
**Frontend:** Expo (React Native) · Expo Router · Tamagui · Zustand · TanStack Query · expo-av

## Key Directories

| Path | Purpose |
|---|---|
| `backend/app/routers/` | HTTP + WebSocket route handlers |
| `backend/app/services/` | Business logic: interview runtime, voice, AI, report, mail |
| `backend/app/models/` | SQLAlchemy ORM models + DTOs |
| `backend/app/prompts/` | System prompt builders for LLM |
| `backend/app/core/` | Cross-cutting utilities (timeout manager, LLM sanitizer) |
| `backend/app/auth/` | JWT creation, validation, FastAPI dependencies |
| `app-ui/app/` | Expo Router screens — `(auth)/` and `(app)/` stacks |
| `app-ui/lib/` | Auth utilities, Zustand store, TanStack Query hooks |
| `db/` | Manual SQL seed scripts for `interviewer_characters` table |

## Commands

```bash
# Backend
cd backend && python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python run.py                  # http://localhost:8000, hot reload enabled

# Frontend
cd app-ui && yarn install
npx expo start -c              # clear cache + start dev server
npx expo run:ios / run:android

# Type check (frontend only)
cd app-ui && npx tsc --noEmit
```

No test suite is configured.

## Environment Variables

`DATABASE_URL`, `JWT_SECRET`, `GROQ_API_KEY`, `DEEPGRAM_API_KEY`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM` `EXPO_PUBLIC_API_BASE`, `EXPO_PUBLIC_WS_BASE`

## Additional Documentation

Check these files when working in the relevant area:

- [`.claude/docs/architectural_patterns.md`](.claude/docs/architectural_patterns.md) — Dependency injection, async task orchestration, WebSocket message protocol, LLM sanitization pipeline, JWT lifecycle, and other recurring design patterns with file:line references.
