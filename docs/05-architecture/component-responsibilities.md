# Component Responsibilities

## Overview

This document defines the precise responsibilities and boundaries for each component in the FitGenie system. It serves as the contract between teams to avoid overlap, duplication, or ambiguity.

---

## Frontend Responsibilities

### What the Frontend OWNS

| Area | Responsibility |
|---|---|
| UI rendering | All screens defined in `screen-flow.md` |
| User input capture | Forms, selections, camera activation for scan |
| State management | Session state: auth token, current profile, scan results, active preferences |
| API communication | All calls to backend REST API; handles loading, error, and success states |
| Client-side validation | Field format checks (e.g., number ranges, required fields) before submission |
| User feedback display | Confidence badges, explanation panels, order tracking timeline |
| Camera management | Activating device camera, rendering pose overlay, sending frames to scan API |
| Fit Card rendering | Displaying and sharing the Fit Card view |

### What the Frontend does NOT OWN

- Business logic (delegated to backend).
- AI calls (delegated to backend → AI layer).
- Database reads (delegated to backend).
- Session token generation (backend issues tokens).
- Garment catalogue management.

---

## Backend Responsibilities

### What the Backend OWNS

| Area | Responsibility |
|---|---|
| Authentication | JWT issuance, validation, refresh; OAuth callback handling |
| Authorisation | Enforce ownership rules (user can only read/write own data) |
| Data validation | Server-side validation for all inputs (not just format, but also business rules) |
| Input sanitisation | Prevent XSS, SQL injection, and malformed data from reaching database |
| Business logic | Onboarding flow, recommendation orchestration, booking lifecycle, fit card assembly |
| AI orchestration | Construct prompts, call AI layer, validate and parse AI responses |
| Notifications | Trigger push/email notifications on booking events |
| Rate limiting | Per-IP and per-user rate limits on all endpoints |
| Audit logging | Log all state-changing operations with actor, timestamp, and entity ID |
| Error handling | Map internal errors to standardised API error codes (see `error-codes.md`) |

### What the Backend does NOT OWN

- AI model execution (delegated to AI layer).
- Frontend rendering.
- Database schema migration execution in production (DevOps responsibility).
- Raw scan frame storage.

---

## Database Responsibilities

### What the Database OWNS

| Area | Responsibility |
|---|---|
| Data persistence | Store all entities as defined in `03-data-models/` |
| Integrity enforcement | Foreign key constraints, not-null rules, unique constraints |
| Indexing | Optimise queries for user ID lookups, proximity search, text search |
| Soft delete | `deleted_at` column pattern on all user-owned entities |
| Audit columns | `created_at`, `updated_at` on all tables |

### What the Database does NOT OWN

- Business logic (no stored procedures for business rules in Phase 1).
- Raw scan images or video.
- Session tokens (Redis handles these).

---

## AI Layer Responsibilities

### What the AI Layer OWNS

| Area | Responsibility |
|---|---|
| Body scan processing | Accept camera frames; return extracted measurements and confidence score |
| Recommendation ranking | Accept user profile + catalogue items; return ranked list with scores |
| Explanation generation | Generate natural language explanations for recommendations and fit analysis |
| Fit Card AI notes | Generate tailor-facing stitching notes from fit analysis output |
| Guardrail enforcement | Validate AI output against body-positive language rules before returning |

### What the AI Layer does NOT OWN

- Catalogue management.
- Booking or ordering decisions.
- User authentication.
- Data persistence.
- Frontend rendering.

---

## Redis Responsibilities

| Area | Responsibility |
|---|---|
| Session cache | Store validated JWT claims to avoid DB lookup per request |
| Rate limiting | Sliding window counters per IP and per user |
| Short-lived tokens | OTP codes for phone authentication (TTL: 10 minutes) |
| Future: recommendation cache | Cache recent recommendation results for repeated identical inputs (Phase 2) |

---

## External Services

| Service | Responsibility | Owner |
|---|---|---|
| LLM Provider (e.g. OpenAI) | Language model inference for explanations | AI Layer (via API) |
| CV Model Host | Computer vision inference for body scan | AI Layer (self-hosted or API) |
| OAuth Providers (Google, Apple) | Third-party authentication | Frontend initiates; Backend handles callback |
| CDN (e.g. Cloudflare / AWS CloudFront) | Static asset delivery, avatar/portfolio image caching | DevOps |
| Push Notification Service | Deliver booking/order status push notifications | Backend (via SDK) |

---

## Cross-Cutting Concerns

| Concern | Owned By |
|---|---|
| Logging | Backend (application logs); DevOps (infrastructure logs) |
| Monitoring / alerting | DevOps |
| Security (WAF, DDoS) | DevOps / CDN layer |
| API contract versioning | Backend (version prefix: `/api/v1/`) |
| CI/CD pipeline | DevOps |
| Data backup | DevOps (database snapshots) |
