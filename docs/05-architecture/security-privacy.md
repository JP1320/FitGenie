# Security & Privacy

## Overview

FitGenie handles sensitive personal data — including body measurements, identity information, and location — which requires robust security practices and clear privacy commitments from day one.

---

## Data Classification

| Data Category | Examples | Sensitivity |
|---|---|---|
| Identity | Name, email, phone, OAuth ID | High |
| Body measurements | Chest, waist, hips, height | High (biometric-adjacent) |
| Location | City, coordinates | Medium |
| Preferences | Style, budget, fabric | Low |
| Order data | Booking details, status | Medium |
| Public profile | Display name, avatar (tailor) | Low |

---

## Authentication & Authorisation

### Authentication
- OAuth 2.0 / OIDC for Google and Apple login.
- Phone number + OTP (TOTP via SMS gateway) for phone auth.
- JWT (RS256) for API authentication. Access token TTL: 15 minutes.
- Refresh token stored in **HttpOnly, Secure, SameSite=Strict cookie**. Refresh TTL: 7 days.
- Refresh tokens are rotated on each use (rotation + revocation list in Redis).

### Authorisation
- All API endpoints require a valid JWT unless explicitly marked as public.
- Role-based access control (RBAC):
  - `customer`: can access own profile, measurements, bookings, recommendations, fit cards.
  - `provider`: can access own provider profile, bookings assigned to them, and shared fit cards for those bookings.
  - `admin`: full access (internal use only; no admin endpoints exposed via public API).
- Ownership enforcement: backend verifies `user_id` in JWT matches the resource owner before any read/write.

---

## Data Encryption

| Data At Rest | Method |
|---|---|
| Database (PostgreSQL) | Encrypted at rest (AES-256, cloud provider managed) |
| Sensitive columns (phone, email) | Application-level encryption before DB write (Phase 2 enhancement) |
| Redis cache | Encrypted at rest; no PII stored beyond session claims |

| Data In Transit | Method |
|---|---|
| All HTTP traffic | TLS 1.2 minimum; TLS 1.3 preferred |
| API calls to AI layer | TLS + API key authentication |
| OAuth redirects | HTTPS enforced; PKCE required for mobile (Phase 2) |

---

## Body Scan Privacy

This is the highest-risk data category.

- **No raw video or images are stored.** Camera frames are processed in memory and discarded after measurement extraction.
- Only the derived measurements (numbers) are persisted.
- Users are informed of this explicitly on the scan permission screen.
- Consent for body data storage is captured separately from general terms (`consent.body_data_storage` field).
- Scan confidence scores are stored for model auditing, but no biometric identifiers are retained.

---

## Input Validation & Injection Prevention

- All user inputs validated server-side (type, range, format).
- `display_name`, `bio`, `notes_to_tailor`, and all free-text fields sanitised to strip HTML and script content before persistence.
- Parameterised queries used for all database operations (no string concatenation in SQL).
- File uploads (portfolio images, feedback photos) restricted to image MIME types; stored in CDN with no execution permissions; scanned for malware (Phase 2).

---

## Rate Limiting

| Endpoint | Limit |
|---|---|
| `/auth/*` | 10 requests / minute per IP |
| `/scan/body` | 5 requests / 10 minutes per user |
| `/recommendations` | 20 requests / minute per user |
| All other authenticated endpoints | 60 requests / minute per user |

Rate limit responses return `HTTP 429` with `Retry-After` header.

---

## Consent & Privacy Compliance

- Explicit consent collected at onboarding for:
  - Terms of service and privacy policy.
  - Body measurement data storage (`consent.body_data_storage`).
  - Marketing communications (opt-in, separate from service consent).
- Consent timestamps stored with IP address for audit.
- Users can withdraw consent and request account deletion at any time from their profile settings.
- Account deletion:
  - Soft-delete immediately (`deleted_at` set).
  - Hard-delete of all PII within 30 days.
  - Anonymised aggregate data (no PII) may be retained for model improvement.

### Applicable Regulations (Phase 1)
- **India:** IT Act 2000, PDPB (Personal Data Protection Bill) preparedness.
- **General:** GDPR-aligned practices for international users (Phase 2+).

---

## Security Headers

All API responses include:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'self'
Referrer-Policy: strict-origin-when-cross-origin
```

---

## Vulnerability Management

- Dependencies scanned for known CVEs before each release.
- No secrets committed to version control; environment variables only.
- API keys for LLM and other services rotated quarterly.
- Security review required before any new endpoint that handles measurement or identity data is deployed.

---

## Non-Goals (Phase 1)

- End-to-end encryption for in-app chat (Phase 2).
- Multi-factor authentication beyond OTP (Phase 2).
- Formal penetration testing (planned for Phase 2 pre-launch).
- GDPR DPA agreements with EU data processors (Phase 2 when EU users onboarded).
