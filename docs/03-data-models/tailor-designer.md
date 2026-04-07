# Data Model: Tailor / Designer

## Purpose

Stores the profile, capabilities, and availability information for service providers (tailors and designers) listed on the FitGenie marketplace.

---

## Schema

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "provider_type": "tailor | designer | alteration_specialist | personal_stylist",
  "display_name": "string",
  "bio": "string | null",
  "avatar_url": "string | null",
  "portfolio_images": ["url1", "url2"],
  "specialisations": ["ethnic", "western", "bridal", "formal", "alteration"],
  "service_modes": ["online", "offline", "hybrid"],
  "location": {
    "address_line": "string | null",
    "city": "string",
    "state": "string",
    "country": "string",
    "coordinates": {
      "lat": "float | null",
      "lng": "float | null"
    }
  },
  "price_range": {
    "currency": "INR",
    "min": "integer",
    "max": "integer"
  },
  "turnaround_days": {
    "min": "integer",
    "max": "integer"
  },
  "rating": {
    "average": "float (1.0–5.0)",
    "count": "integer"
  },
  "availability": {
    "is_accepting_orders": "boolean",
    "blocked_dates": ["YYYY-MM-DD"],
    "weekly_schedule": {
      "monday": {"open": "09:00", "close": "18:00"},
      "tuesday": {"open": "09:00", "close": "18:00"},
      "wednesday": null,
      "thursday": {"open": "09:00", "close": "18:00"},
      "friday": {"open": "09:00", "close": "18:00"},
      "saturday": {"open": "10:00", "close": "16:00"},
      "sunday": null
    }
  },
  "verified": "boolean",
  "verification_date": "ISO 8601 timestamp | null",
  "is_active": "boolean",
  "created_at": "ISO 8601 timestamp",
  "updated_at": "ISO 8601 timestamp"
}
```

---

## Field Definitions

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | UUID | Yes | Primary key |
| `user_id` | UUID | Yes | Links to the provider's FitGenie account |
| `provider_type` | Enum | Yes | Determines marketplace category and UI display |
| `display_name` | String | Yes | Max 80 chars; publicly visible |
| `bio` | String | No | Max 500 chars; plain text only |
| `portfolio_images` | Array[URL] | No | Max 12 images; CDN URLs |
| `specialisations` | Array[Enum] | Yes | At least one required |
| `service_modes` | Array[Enum] | Yes | At least one required |
| `location.coordinates` | Object | No | Used for proximity search; null for online-only providers |
| `price_range` | Object | Yes | Used for budget filtering in discovery |
| `turnaround_days` | Object | Yes | Displayed on listing card |
| `rating.average` | Float | Yes | Recomputed after each feedback submission |
| `rating.count` | Integer | Yes | Total feedback records |
| `availability.is_accepting_orders` | Boolean | Yes | Quick kill-switch for provider |
| `availability.blocked_dates` | Array[Date] | No | Holidays, leaves, unavailable dates |
| `availability.weekly_schedule` | Object | Yes | Null value for a day = closed that day |
| `verified` | Boolean | Yes | Admin-verified providers get a badge |

---

## Availability Slot Resolution

When a user selects a booking date, available time slots are computed as:

1. Check `weekly_schedule` for the day → get open/close window.
2. Subtract existing confirmed bookings (30 min/60 min slots depending on service type).
3. Exclude `blocked_dates`.
4. Return available slots as array of `{ slot_start: "ISO 8601", slot_end: "ISO 8601" }`.

---

## Marketplace Discovery Filters

| Filter | Field Used |
|---|---|
| Rating | `rating.average ≥ threshold` |
| Location (Near Me) | `location.coordinates` (haversine distance ≤ radius) |
| Location (Within City) | `location.city` match |
| Location (Online) | `service_modes` includes `online` |
| Specialisation | `specialisations` array intersection |
| Budget | `price_range.min ≤ user_budget.max` |

---

## Relationships

- `tailor.user_id` → `user_profile.id` (provider's own account)
- `tailor.id` → `booking.tailor_id`
- `tailor.id` → `fit_card.tailor_id`
- `tailor.id` → `feedback.tailor_id`

---

## Non-Goals

- This model does not store chat messages (Phase 2).
- Payment account / payout details are managed by the payment gateway, not this model.
