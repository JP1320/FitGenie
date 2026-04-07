# Data Model: Measurements

## Purpose

Stores body measurement data for a user, either entered manually or extracted from an AI Fit Scanner session. Multiple measurement records can exist per user (e.g., updated scans over time).

---

## Schema

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "source": "manual | ai_scan",
  "scan_session_id": "uuid | null",
  "measurements": {
    "height_cm": "float",
    "weight_kg": "float | null",
    "chest_cm": "float",
    "waist_cm": "float",
    "hips_cm": "float",
    "shoulder_width_cm": "float | null",
    "inseam_cm": "float | null",
    "sleeve_length_cm": "float | null",
    "neck_cm": "float | null",
    "thigh_cm": "float | null"
  },
  "body_proportions": {
    "bust_to_waist_ratio": "float | null",
    "waist_to_hip_ratio": "float | null",
    "shoulder_to_hip_ratio": "float | null"
  },
  "inferred_body_type": "rectangle | triangle | inverted_triangle | oval | hourglass | null",
  "recommended_size": {
    "top": "XS | S | M | L | XL | XXL | custom",
    "bottom": "XS | S | M | L | XL | XXL | custom",
    "dress": "XS | S | M | L | XL | XXL | custom"
  },
  "fit_type": "slim | regular | relaxed",
  "confidence_score": "float (0.0–1.0)",
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
| `user_id` | UUID | Yes | Foreign key → `user_profile.id` |
| `source` | Enum | Yes | Distinguishes AI scan vs manual entry |
| `scan_session_id` | UUID | Conditional | Links to scan session; null for manual entries |
| `height_cm` | Float | Yes | Core measurement; range 50–250 cm |
| `weight_kg` | Float | No | Used for BMI-based hints only; never surfaced publicly |
| `chest_cm` | Float | Yes | Primary garment sizing input |
| `waist_cm` | Float | Yes | Primary garment sizing input |
| `hips_cm` | Float | Yes | Primary garment sizing input |
| `shoulder_width_cm` | Float | No | Required for shirts, jackets, suits |
| `inseam_cm` | Float | No | Required for trousers and bottoms |
| `sleeve_length_cm` | Float | No | Required for full-sleeve garments |
| `neck_cm` | Float | No | Required for formal shirts |
| `thigh_cm` | Float | No | Required for fitted trousers |
| `bust_to_waist_ratio` | Float | No | Computed; supports body type inference |
| `waist_to_hip_ratio` | Float | No | Computed; supports body type inference |
| `shoulder_to_hip_ratio` | Float | No | Computed; supports body type inference |
| `inferred_body_type` | Enum | No | AI-inferred; overridable by user selection |
| `recommended_size` | Object | Yes | Size labels mapped from measurements |
| `fit_type` | Enum | Yes | User's preferred fit style |
| `confidence_score` | Float | Yes | Scan accuracy or manual confidence (1.0 for confirmed manual) |
| `is_active` | Boolean | Yes | Only the most recent active record is used by default |

---

## Measurement Source Rules

### Manual Entry
- All required fields must be provided.
- `confidence_score` defaults to `1.0` (user confirms their own data).
- `scan_session_id` is `null`.

### AI Scan
- `scan_session_id` links to the scan processing session.
- `confidence_score` is computed by the computer vision model.
- Fields with `confidence_score < 0.6` are flagged for user review.
- Raw scan video/images are NOT persisted; only extracted measurements are stored.

---

## Size Mapping Logic

Size labels are derived from a standardised measurement-to-size lookup table:

```
chest_cm → top/dress size
waist_cm → bottom size (with hips_cm cross-check)
```

Custom size label is used when measurements fall outside standard ranges (e.g., chest > 120 cm or < 72 cm).

---

## Relationships

- `measurements.user_id` → `user_profile.id`
- `measurements.id` → `fit_card.measurement_id`
- `measurements.id` → `recommendation.measurement_id`

---

## Retention Policy

- Measurement records are soft-deleted when the user account is deleted.
- Hard deletion occurs 30 days after account deletion.
- Scan session data (raw frames) is never stored; only processed output is persisted.
