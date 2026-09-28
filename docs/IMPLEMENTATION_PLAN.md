# Backend Implementation Plan (FastAPI + React Integration)

This document outlines the autonomous step-by-step execution plan for building the FitSync AI backend and wiring it to the frontend.

## Phase 1: Foundation
- [x] **Frontend Audit**: Generate `FRONTEND_AUDIT.md` mapping out the existing React/Vite structure and MediaPipe exercise requirements.
- [ ] **Contract Definition**: Create `docs/openapi.yaml` (or equivalent schema design) and generate shared TypeScript types for the frontend.
- [ ] **Project Scaffold & Docker**: Set up the Python/FastAPI environment, `backend/` directory structure, and `docker-compose.yml` (Postgres, Redis). Ensure `/api/v1/health` returns 200 OK.

## Phase 2: Core Domain & Auth
- [ ] **Database Setup**: Configure SQLAlchemy (async), Alembic, and Pydantic models for User, DailyCheckin, Plan, Exercise, WorkoutSession, Meal, WellnessBreak, ChatMessage.
- [ ] **Authentication API**: Implement JWT Auth (`/register`, `/login`, `/refresh`, `/me`).
- [ ] **Frontend Auth Wiring**: Update `AuthContext.tsx` to use the real API instead of `DEFAULT_USER` mock data.

## Phase 3: Exercises & Sessions
- [ ] **Catalog & Seeding**: Implement `/exercises` endpoint and write `app/seed.py` to populate the 24+ MediaPipe exercises + general routines.
- [ ] **Workout Sessions**: Implement `POST /sessions` and `GET /sessions`.
- [ ] **Frontend Wiring**: Wire up the "AI Posture Coach" and "ExerciseDetailModal" to submit session metrics upon completion.

## Phase 4: AI Coaching Engine (Gemini)
- [ ] **Gemini Service Wrapper**: Create `services/gemini.py` with structured output, safe parsing, and retries.
- [ ] **Daily Check-in & Plans**: Implement `/checkins` and `/plans/generate` utilizing the logic detailed in `plan_engine.py` (combining readiness score with AI generation).
- [ ] **FitBot Chat**: Implement `POST /coach/chat` using Server-Sent Events (SSE) for streaming text and context injection.

## Phase 5: Nutrition & Wellness
- [ ] **Nutrition API**: Implement `/nutrition/scan` (image upload to Gemini Vision) and `/nutrition/estimate` (text to JSON schema). Implement `/meals` CRUD.
- [ ] **Wellness API**: Implement `/wellness/suggestion` and completion endpoints.
- [ ] **Frontend Wiring**: Connect the Calorie Calculator page and the Dashboard stats.

## Phase 6: Analytics, Community & Offline Sync
- [ ] **Stats & Leaderboard**: Implement `/stats/summary` and the Redis-backed `/leaderboard` API.
- [ ] **Offline Sync API**: Implement `POST /sync/batch` for idempotent updates.
- [ ] **Frontend Offline Queue**: Build an IndexedDB or local storage queue in the frontend that attempts to flush to `/sync/batch` upon reconnection.

## Phase 7: Polish & Demo Ready
- [ ] **Security & Limits**: Implement Redis rate-limiting (strict limits on AI endpoints), CORS policies, and prompt sanitization.
- [ ] **Testing**: Write pytest coverage for Auth, Plan Generation, Session Idempotency, and Sync flows.
- [ ] **End-to-End Test**: Implement `scripts/smoke.sh` to simulate a complete user journey.
- [ ] **Documentation**: Finalize `README.md`, `API.md`, `ARCHITECTURE.md`, and `DECISIONS.md`.
