# Architectural Patterns

Recurring design patterns across the Evaluet codebase.

---

## 1. FastAPI Dependency Injection

DB sessions and auth are injected via `Depends()`. The DB generator uses try/finally for cleanup.

- `backend/app/db.py:18-23` — `get_db()` generator dependency
- `backend/app/auth/dependencies.py:8-19` — `get_current_user_id()` decodes JWT via HTTPBearer
- `backend/app/routers/auth.py:13,30` — `Depends(get_db)` in route signatures
- `backend/app/routers/interview.py:17,52` — combines `Depends(get_db)` + `Depends(get_current_user_id)`

**Exception:** WebSocket handlers cannot use FastAPI's automatic `Depends()` injection — they instantiate `SessionLocal()` directly (`backend/app/routers/websocket.py:15`).

---

## 2. Async Task Orchestration with `asyncio.Event`

The live interview runs two concurrent async tasks that share a shutdown signal.

- `backend/app/routers/websocket.py:28,36-46` — creates `shutdown_event = asyncio.Event()`, spawns `audio_loop` and `conversation_loop` as concurrent tasks
- `backend/app/services/interview_runtime.py:14-34` — both loops check `shutdown_event.is_set()` and exit cleanly when set
- `shutdown_event.set()` is called on timeout, `[END_INTERVIEW]` signal, or WebSocket disconnect

---

## 3. Append-Only Message History as Conversation State

LLM conversation context is maintained as a flat list of `{role, content}` dicts, initialized with the system prompt and appended after every turn. Never edited in place.

- `backend/app/routers/websocket.py:27` — `history = [{"role": "system", "content": session.system_prompt}]`
- `backend/app/services/interview_runtime.py:61,67,85` — `history.append(...)` after each user/assistant turn
- `backend/app/services/ai_service.py:15` — full history passed to Groq on every call
- `backend/app/repository/interview_repository.py:22-25` — filters to `user`/`assistant` roles before persisting to DB (strips system prompt)

---

## 4. WebSocket Message Protocol (Typed Envelope)

WebSocket messages use a JSON envelope with a `type` field to distinguish transcripts from control messages. Audio is sent as raw binary (no envelope).

- `backend/app/services/interview_runtime.py:74-84` — `{"type": "transcript", "role": "...", "content": "..."}`
- `backend/app/services/interview_runtime.py:115-118` — `{"type": "control", "action": "END_INTERVIEW"}`
- `app-ui/app/(app)/interview/[sessionId].tsx:86-103` — client checks `msg.type` for strings; raw `ArrayBuffer` is audio

---

## 5. LLM Output Sanitization Pipeline

LLM outputs are sanitized before TTS and before storage. Sanitization uses a placeholder swap to preserve semantic tokens (like `[END_INTERVIEW]`) while stripping markdown/formatting.

- `backend/app/core/llm_sanitizer.py:6-37` — strips brackets, braces, asterisks; preserves `[END_INTERVIEW]` via placeholder
- `backend/app/services/interview_runtime.py:99-101` — tokens streamed through sanitizer before accumulating into `full_reply`
- `backend/app/services/voice_service.py:184,191` — `sanitize_llm_output()` called before Deepgram TTS request
- `backend/app/services/report_service.py:154-175` — `parse_llm_json()` uses `dirtyjson` as fallback for malformed JSON from report LLM

---

## 6. Module-Level Service Singletons

External API clients (Groq, Deepgram, mail) are instantiated once at module import time using settings loaded from environment. No re-initialization at request time.

- `backend/app/config.py:6-15` — single `Settings` instance (pydantic BaseSettings); all services import from here
- `backend/app/services/ai_service.py:5` — `client = Groq(api_key=settings.GROQ_API_KEY)` at module level
- `backend/app/services/report_service.py:14-15` — Groq client + MailService both module-level singletons
- `backend/app/auth/security.py:7` — `pwd_context = CryptContext(...)` module-level

**Exception:** `DeepgramService` is stateful (manages connection + queues per session) and instantiated per WebSocket session (`backend/app/services/voice_service.py:14-27`).

---

## 7. Session-Scoped Data Pipeline

Data flows in one direction across the interview lifecycle, with `session_id` as the immutable key linking each stage. No stage writes back to a prior stage's data.

| Stage | File | Action |
|---|---|---|
| Init | `backend/app/routers/interview.py:54-108` | PDF → system prompt → `InterviewSession` created |
| Runtime | `backend/app/routers/websocket.py:27-50` | Load `system_prompt` from session → run loops |
| Finalize | `backend/app/services/interview_finalize.py:4-16` | Persist `history` → `session.transcript` |
| Report | `backend/app/services/report_service.py:17-151` | Fetch transcript → sanitize → LLM → store + email |

---

## 8. JWT Lifecycle (Client + Server)

Client-side expiry check prevents requests with stale tokens. Server-side validates signature.

- `app-ui/lib/auth.ts:14-28` — `getValidToken()` decodes JWT, checks `exp`, deletes from SecureStore if expired
- `app-ui/lib/auth.ts:35-48` — `authFetch()` wraps all authenticated HTTP requests; throws if no valid token
- `backend/app/auth/security.py:27-35` — `create_access_token()` sets 30-minute TTL
- `backend/app/auth/dependencies.py:8-19` — `jose.jwt.decode()` validates signature; JWTError → HTTP 401

---

## 9. Data Transfer Objects (DTOs)

ORM models are not returned directly from routes. Explicit DTO mapping prevents leaking internal fields (e.g., `evaluation_prompt`, password hashes).

- `backend/app/routers/interview.py:16` — `response_model=List[InterviewerPublicDTO]`
- `backend/app/routers/interview.py:30-40` — manual row → DTO mapping in list comprehension
- Frontend `Interviewer` type in `app-ui/lib/store/interviewerStore.ts:3-11` mirrors the DTO shape

---

## 10. Error Handling Conventions

Route handlers raise `HTTPException`; background/async services catch exceptions and persist failure state instead of raising.

- `backend/app/routers/auth.py:14-15,32-33` — `HTTPException(400/401)` for validation/auth failures
- `backend/app/services/report_service.py:96-99,122` — catches Groq errors; sets `SessionStatus.FAILED` without re-raising (safe in background task)
- `backend/app/services/interview_runtime.py:32-34` — catches `WebSocketDisconnect`; logs then exits
- WebSocket context cannot use `HTTPException` — connection closed with code/reason string directly

---

## 11. Zustand for Cross-Screen UI State

Only the selected interviewer (needed across setup → live session screens) lives in Zustand. All other form state is local to components.

- `app-ui/lib/store/interviewerStore.ts:1-23` — store with `setInterviewer` / `clear`
- `app-ui/app/(app)/index.tsx:36,56` — sets interviewer on selection
- `app-ui/app/(app)/interview/[sessionId].tsx:47-48,96,271-272` — reads video URLs during session, calls `clear()` on completion
