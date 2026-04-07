# Data Model: Preferences

## Purpose

Stores a user's style, fabric, budget, and fit preferences. A new preference set is created each time the user completes the Smart Filters step. Multiple sets may exist (e.g., preferences vary by occasion).

---

## Schema

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "session_id": "uuid",
  "label": "string | null",
  "style": ["ethnic", "western", "indo_western", "casual", "formal", "sportswear"],
  "budget": {
    "currency": "INR",
    "min": "integer",
    "max": "integer",
    "tier": "under_500 | 500_1000 | 1000_2000 | 2000_5000 | 5000_plus"
  },
  "fabric": ["cotton", "linen", "silk", "wool", "denim", "blend", "other"],
  "fit_details": {
    "sleeve_type": "sleeveless | short | three_quarter | full | not_specified",
    "length": "crop | regular | midi | maxi | not_specified",
    "fit": "slim | regular | oversized"
  },
  "occasion": "birthday | wedding | festival | daily | formal | casual | other | null",
  "is_active": "boolean",
  "created_at": "ISO 8601 timestamp"
}
```

---

## Field Definitions

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | UUID | Yes | Primary key |
| `user_id` | UUID | Yes | Foreign key → `user_profile.id` |
| `session_id` | UUID | Yes | Links to the recommendation session |
| `label` | String | No | User-defined label (e.g., "Wedding 2025"); max 60 chars |
| `style` | Array[Enum] | Yes | At least one style required |
| `budget.currency` | String | Yes | ISO 4217 code; defaults to `INR` in Phase 1 |
| `budget.min` | Integer | Yes | Minimum in smallest currency unit |
| `budget.max` | Integer | Yes | Maximum; must be ≥ min |
| `budget.tier` | Enum | Yes | Quick-select tier mapped from min/max for UI display |
| `fabric` | Array[Enum] | No | Empty array = no preference (all fabrics included) |
| `fit_details.sleeve_type` | Enum | No | Used to filter garment types |
| `fit_details.length` | Enum | No | Used to filter garment length |
| `fit_details.fit` | Enum | Yes | Maps to size recommendation adjustment |
| `occasion` | Enum | No | Derived from intent or manually selected |
| `is_active` | Boolean | Yes | Active preference set used by current recommendation |

---

## Budget Tier Mapping

| Tier | Min (INR) | Max (INR) |
|---|---|---|
| `under_500` | 0 | 499 |
| `500_1000` | 500 | 1,000 |
| `1000_2000` | 1,001 | 2,000 |
| `2000_5000` | 2,001 | 5,000 |
| `5000_plus` | 5,001 | — |

---

## Fit Adjustment Rules

| Preference Fit | Size Adjustment |
|---|---|
| `slim` | Recommend standard size or one size down if borderline |
| `regular` | Recommend standard size |
| `oversized` | Recommend one size up |

---

## Relationships

- `preferences.user_id` → `user_profile.id`
- `preferences.id` → `recommendation.preference_id`
- `preferences.session_id` → recommendation session

---

## Non-Goals

- This model does not store colour preferences (Phase 2).
- Brand preferences are not modelled in Phase 1.
