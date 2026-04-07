# System Overview

## Architecture Summary

FitGenie is a three-tier application with a dedicated AI layer. The high-level flow is:

```
[Client (Browser / Mobile Web)]
        ↕ HTTPS REST API
[Backend (API Server)]
        ↕
[Database Layer]
        ↕
[AI Layer (LLM + Computer Vision)]
```

---

## Tier Descriptions

### Tier 1: Frontend (Client)

- **Technology (Phase 1):** Responsive web app — React or Vue.js with Tailwind CSS.
- **Responsibilities:**
  - Render all UI screens (see `screen-flow.md`).
  - Capture user input (forms, camera feed for scan).
  - Call backend REST API for all data operations.
  - Maintain session state (JWT token in memory; refresh token in HttpOnly cookie).
  - Display recommendation cards, confidence badges, fit cards, and order tracking.
- **Does NOT:**
  - Store sensitive data locally beyond the session.
  - Call the AI layer directly.
  - Access the database.

---

### Tier 2: Backend (API Server)

- **Technology (Phase 1):** Node.js (Express) or Laravel (PHP) — TBD by development team.
- **Responsibilities:**
  - Authenticate and authorise requests (JWT + refresh token).
  - Expose REST API endpoints (see `endpoint-catalog.md`).
  - Orchestrate business logic: onboarding, preference storage, recommendation dispatch, booking management, fit card generation.
  - Call the AI layer for: recommendation ranking, fit analysis, fit card AI notes, and explanation generation.
  - Enforce data validation, input sanitisation, and rate limiting.
  - Write/read from the database.
- **Does NOT:**
  - Run ML/AI models directly (delegated to AI layer).
  - Store raw scan video or images.

---

### Tier 3: Database

- **Technology (Phase 1):** PostgreSQL (primary), Redis (session cache + rate limiting).
- **Responsibilities:**
  - Persist all entities: users, measurements, preferences, recommendations, tailors, bookings, fit cards, feedback.
  - Enforce referential integrity and constraints.
  - Store indexes to support: proximity search (PostGIS extension), full-text tailor search, recommendation history queries.
- **Does NOT:**
  - Execute business logic.
  - Store raw scan frames, session video, or biometric images.

---

### AI Layer

- **Technology (Phase 1):**
  - **LLM:** OpenAI GPT-4o (via API) for recommendation explanations, fit card AI notes, and "Why this suits you" copy.
  - **Computer Vision:** TensorFlow or MediaPipe-based pose estimation model for body scan measurement extraction.
- **Responsibilities:**
  - Process body scan frames → extract measurements → return structured JSON.
  - Accept recommendation input → return ranked items with explanations.
  - Generate Fit Card AI notes.
  - Generate "Why this suits you" explanations.
- **Does NOT:**
  - Persist user data independently.
  - Make booking or ordering decisions.
  - Call the frontend or database directly.

---

## Infrastructure

```
[CDN / Static Assets]  ←→  [Frontend (Vercel / Netlify)]
                                    ↓ HTTPS
                            [API Gateway + Load Balancer]
                                    ↓
                    [Backend API Servers (Auto-scaled)]
                            ↙            ↘
            [PostgreSQL + Redis]    [AI Service (API calls)]
                                    ↘
                              [LLM Provider API]
                              [CV Model Host]
```

---

## Key Design Decisions

| Decision | Rationale |
|---|---|
| Frontend calls only backend API | Keeps secrets (DB credentials, AI API keys) server-side |
| AI layer is a separate service | Decouples LLM/CV upgrades from backend releases |
| PostgreSQL chosen over NoSQL | Recommendation and booking logic benefits from relational integrity |
| Redis for session cache | Avoids database hits for JWT validation; supports rate limiting |
| CV model processes locally / in short-lived session | Raw scan data never leaves the scan processing context |
| JWT + HttpOnly refresh tokens | Balances security and UX for web sessions |

---

## Scalability Considerations (Phase 2)

- AI recommendation caching: popular combination of measurements + preferences can be cached by Redis to reduce LLM calls.
- Horizontal scaling of backend API servers behind a load balancer.
- Read replica for PostgreSQL to offload recommendation history queries.
- Async job queue (e.g., Bull / SQS) for non-real-time tasks: fit card generation, notification dispatch.

---

## Non-Goals (Phase 1)

- Native mobile app (Phase 2).
- Real-time WebSocket communication (Phase 2 for chat).
- Multi-region deployment (Phase 2).
- Payment processing integration (Phase 2).
