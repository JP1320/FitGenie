# Data Model: User Profile

## Purpose

The User Profile model stores core identity, authentication, and demographic data for each FitGenie user. It is the root entity that links to measurements, preferences, fit cards, bookings, and feedback.

---

## Schema

```json
{
  "id": "uuid",
  "auth_provider": "google | apple | phone | guest",
  "email": "string | null",
  "phone": "string | null",
  "display_name": "string",
  "avatar_url": "string | null",
  "age": "integer",
  "gender": "male | female | non-binary | prefer_not_to_say",
  "body_type": "rectangle | triangle | inverted_triangle | oval | hourglass | not_specified",
  "intent": {
    "type": "for_myself | for_someone_else | gift_occasion",
    "occasion": "birthday | wedding | festival | other | null",
    "recipient": "partner | family | friend | child | null"
  },
  "location": {
    "city": "string | null",
    "country": "string | null",
    "coordinates": {
      "lat": "float | null",
      "lng": "float | null"
    }
  },
  "language": "string (BCP-47 tag, e.g. en-IN)",
  "is_guest": "boolean",
  "onboarding_complete": "boolean",
  "consent": {
    "body_data_storage": "boolean",
    "marketing_emails": "boolean",
    "accepted_at": "ISO 8601 timestamp"
  },
  "created_at": "ISO 8601 timestamp",
  "updated_at": "ISO 8601 timestamp",
  "deleted_at": "ISO 8601 timestamp | null"
}
```

---

## Field Definitions

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | UUID v4 | Yes | Primary key; never exposed in public URLs |
| `auth_provider` | Enum | Yes | Source of authentication |
| `email` | String | Conditional | Required unless phone-only auth |
| `phone` | String | Conditional | E.164 format (e.g. +919876543210) |
| `display_name` | String | Yes | 1–60 characters; sanitised on write |
| `avatar_url` | String | No | CDN URL; validated to allow only approved domains |
| `age` | Integer | Yes | Range 13–120; validated server-side |
| `gender` | Enum | Yes | Impacts recommendation logic and prompt language |
| `body_type` | Enum | No | User-selected or AI-inferred from scan |
| `intent` | Object | Yes | Set during onboarding; updatable per session |
| `location` | Object | No | Used for tailor proximity; coarse granularity only |
| `language` | String | Yes | Defaults to `en-IN` |
| `is_guest` | Boolean | Yes | Guests cannot book; limited profile persistence |
| `onboarding_complete` | Boolean | Yes | Gates access to recommendation and booking flows |
| `consent` | Object | Yes | Explicit per GDPR/PDPA compliance |
| `deleted_at` | Timestamp | No | Soft-delete field; null if account active |

---

## Relationships

- `user.id` → `measurements.user_id` (one-to-many scan results)
- `user.id` → `preferences.user_id` (one-to-many preference sets)
- `user.id` → `fit_card.user_id` (one-to-many fit cards)
- `user.id` → `booking.user_id` (one-to-many bookings)
- `user.id` → `feedback.user_id` (one-to-many feedback records)

---

## Access Rules

- Users can read and update their own profile.
- Tailors/designers see only `display_name`, `avatar_url`, and the shared Fit Card — never raw auth or location data.
- Backend services access full profile for recommendation and fit card generation.
- `deleted_at` is set on account deletion; data is purged after a 30-day retention window.

---

## Validation Rules

- `age` must be ≥ 13. Accounts for users < 13 are rejected at registration.
- `phone` must match E.164 format if provided.
- `email` must pass RFC 5322 format validation.
- `display_name` must not contain HTML or script tags (sanitised on write).
- `consent.body_data_storage` must be `true` before any measurement data is persisted.

---

## Non-Goals

- This model does not store payment information.
- Biometric data (raw scan images/video) is never persisted in this model or any database table.
