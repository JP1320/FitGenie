# Phase 2 Implementation Plan

## Overview

Phase 2 is the execution phase. It begins only after Phase 1 is complete and signed off (see `phase-1-checklist.md`). This plan breaks down Phase 2 into sequential workstreams with clear dependencies and priorities.

> **Prerequisite:** All Phase 1 checklist items must be checked before any task in this plan begins.

---

## Workstreams

Phase 2 has 7 parallel-capable workstreams, with dependencies noted.

---

### Workstream 1: Infrastructure & DevOps Setup
**Priority:** Must complete before all other workstreams.

| Task | Description | Dependency |
|---|---|---|
| 1.1 | Provision PostgreSQL + Redis (cloud-managed) | None |
| 1.2 | Set up backend API server (Node.js/Laravel) | 1.1 |
| 1.3 | Set up CI/CD pipeline (GitHub Actions) | 1.2 |
| 1.4 | Configure environment variable management (secrets) | 1.2 |
| 1.5 | Set up CDN for static assets and images | 1.2 |
| 1.6 | Configure TLS, security headers, WAF | 1.5 |
| 1.7 | Set up monitoring and alerting (uptime, error rate) | 1.2 |

---

### Workstream 2: Database Migrations
**Priority:** Must complete before backend API development.

| Task | Description | Dependency |
|---|---|---|
| 2.1 | Create migration: `users` table (from user-profile model) | 1.1 |
| 2.2 | Create migration: `measurements` table | 2.1 |
| 2.3 | Create migration: `preferences` table | 2.1 |
| 2.4 | Create migration: `recommendations` table | 2.2, 2.3 |
| 2.5 | Create migration: `tailor_profiles` table | 2.1 |
| 2.6 | Create migration: `bookings` table | 2.4, 2.5 |
| 2.7 | Create migration: `fit_cards` table | 2.6 |
| 2.8 | Create migration: `feedback` table | 2.6 |
| 2.9 | Seed: size chart lookup table | 2.1 |
| 2.10 | Add PostGIS extension and proximity indexes | 2.5 |

---

### Workstream 3: Backend API Development
**Priority:** Depends on Workstream 2.

Implement endpoints in order of user journey dependency:

| Task | Endpoint(s) | Dependency |
|---|---|---|
| 3.1 | Auth: register, login, OAuth, refresh, logout | 2.1 |
| 3.2 | User profile: GET, PUT, DELETE | 3.1 |
| 3.3 | Body scan: POST `/scan/body`, GET history | 3.2 |
| 3.4 | Measurements: GET, POST, PUT | 3.2 |
| 3.5 | Preferences: GET, POST | 3.2 |
| 3.6 | Recommendations: POST, GET | 3.4, 3.5 |
| 3.7 | Fit card: generate, GET, share | 3.6 |
| 3.8 | Tailors: GET list, GET profile, GET slots | 2.5 |
| 3.9 | Booking: POST, GET, cancel | 3.7, 3.8 |
| 3.10 | Feedback: POST | 3.9 |

---

### Workstream 4: AI Layer Integration
**Priority:** Can begin in parallel with Workstream 3 step 3.6+.

| Task | Description | Dependency |
|---|---|---|
| 4.1 | Set up LLM API client (OpenAI GPT-4o) with prompt templates | 1.4 |
| 4.2 | Implement recommendation ranking + explanation generation | 4.1, 3.6 |
| 4.3 | Implement fit analysis endpoint | 4.1, 3.6 |
| 4.4 | Implement fit card AI notes generation | 4.1, 3.7 |
| 4.5 | Implement "Why this suits you" explanation endpoint | 4.1, 3.6 |
| 4.6 | Set up body scan CV model (MediaPipe or TensorFlow) | 1.2 |
| 4.7 | Integrate CV model with `/scan/body` endpoint | 4.6, 3.3 |
| 4.8 | Add guardrail validation for all AI outputs | 4.2–4.5 |

---

### Workstream 5: Frontend Development
**Priority:** Can begin in parallel with Workstream 3 (mock API first, then connect).

Build screens in user journey order:

| Task | Screen(s) | Dependency |
|---|---|---|
| 5.1 | Set up frontend project (React/Vue + Tailwind, routing) | 1.3 |
| 5.2 | S01 Splash, S02 Auth | 3.1 |
| 5.3 | S03 Intent, S04 Profile Input | 3.2 |
| 5.4 | S05 AI Fit Scanner | 4.7 |
| 5.5 | S06 Smart Filters | 3.5 |
| 5.6 | S07 Recommendations, S08 Outfit Detail | 3.6, 4.2 |
| 5.7 | S09 Service Selection, S10 Discovery, S11 Provider Profile | 3.8 |
| 5.8 | S12 Booking, S13 Confirmation | 3.9 |
| 5.9 | S14 Fit Card | 3.7 |
| 5.10 | S15 Order Tracking | 3.9 |
| 5.11 | S16 Feedback, S17 Dashboard | 3.10 |

---

### Workstream 6: Tailor/Designer Onboarding
**Priority:** Can begin in parallel with Workstream 5.

| Task | Description | Dependency |
|---|---|---|
| 6.1 | Provider registration and profile creation API | 3.1 |
| 6.2 | Provider dashboard: view and manage bookings | 3.9 |
| 6.3 | Provider: view incoming Fit Cards | 3.7 |
| 6.4 | Provider: update booking status (accept, in-progress, ready) | 3.9 |
| 6.5 | Provider: set availability / calendar | 3.8 |

---

### Workstream 7: Testing & QA
**Priority:** Runs continuously alongside all workstreams.

| Task | Description | Dependency |
|---|---|---|
| 7.1 | Unit tests for all backend business logic | Each WS3 task |
| 7.2 | Integration tests for all API endpoints | WS3 complete |
| 7.3 | AI output validation tests (guardrails) | WS4 complete |
| 7.4 | Frontend component tests | WS5 complete |
| 7.5 | End-to-end user journey tests | WS5 + WS3 complete |
| 7.6 | Security review (input validation, auth, data access) | WS3 + WS5 complete |
| 7.7 | Performance testing (recommendation latency, scan latency) | All complete |

---

## Phase 2 Milestones

| Milestone | Description | Prerequisites |
|---|---|---|
| M1: Foundation Ready | Infra, DB migrations, auth API complete | WS1, WS2, 3.1–3.2 |
| M2: Core Journey Working | Scan → Preferences → Recommendations → Fit Card | WS3, WS4 (4.1–4.5) |
| M3: Marketplace Live | Tailor discovery, booking, order tracking | WS3, WS6 |
| M4: Frontend Connected | All screens connected to live API | WS5 |
| M5: AI Fully Integrated | Scan, recommendations, and fit card AI all live | WS4 complete |
| M6: QA Complete | All tests passing; no critical bugs | WS7 complete |
| M7: Beta Launch | Deployed to staging for user testing | M1–M6 |

---

## Phase 2 Non-Goals (Deferred to Phase 3)

- In-app real-time chat between user and tailor.
- Payment gateway integration.
- Native mobile apps (iOS/Android).
- Multi-language UI.
- Garment catalogue CMS for brand/retailer partners.
- AI model fine-tuning on FitGenie-specific feedback data.
