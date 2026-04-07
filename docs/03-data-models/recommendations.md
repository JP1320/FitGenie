# Data Model: Recommendations

## Purpose

Stores the output of each AI recommendation session: the ranked list of outfit suggestions, associated confidence scores, and AI-generated explanations.

---

## Schema

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "measurement_id": "uuid",
  "preference_id": "uuid",
  "generated_at": "ISO 8601 timestamp",
  "model_version": "string",
  "items": [
    {
      "rank": "integer",
      "outfit_id": "string",
      "outfit_name": "string",
      "outfit_image_url": "string",
      "category": "top | bottom | dress | set | ethnic | western | formal | other",
      "style_tags": ["ethnic", "festive", "cotton"],
      "size_recommendation": {
        "label": "S | M | L | XL | XXL | custom",
        "confidence_score": "float (0.0–1.0)",
        "confidence_band": "high | medium | low",
        "size_rationale": "string"
      },
      "fit_type": "slim | regular | relaxed",
      "price": {
        "currency": "INR",
        "amount": "integer"
      },
      "explanation": {
        "summary": "string",
        "body_type_match": "string",
        "style_match": "string",
        "fabric_match": "string | null",
        "occasion_match": "string | null"
      },
      "selected": "boolean",
      "selected_at": "ISO 8601 timestamp | null"
    }
  ],
  "session_metadata": {
    "total_items_evaluated": "integer",
    "filters_applied": ["style", "budget", "fabric"],
    "fallback_used": "boolean",
    "fallback_reason": "string | null"
  }
}
```

---

## Field Definitions

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | UUID | Yes | Primary key |
| `user_id` | UUID | Yes | Foreign key → `user_profile.id` |
| `measurement_id` | UUID | Yes | Snapshot of measurements used for this recommendation |
| `preference_id` | UUID | Yes | Snapshot of preferences used |
| `generated_at` | Timestamp | Yes | When the AI layer produced the response |
| `model_version` | String | Yes | AI model version tag for auditability |
| `items[].rank` | Integer | Yes | 1-based; lower = higher confidence |
| `items[].outfit_id` | String | Yes | Catalogue reference ID |
| `items[].size_recommendation.confidence_score` | Float | Yes | 0.0–1.0; see confidence scoring doc |
| `items[].size_recommendation.confidence_band` | Enum | Yes | Derived from score: high ≥ 0.8, medium 0.6–0.79, low < 0.6 |
| `items[].explanation.summary` | String | Yes | ≤ 150 characters; used in recommendation card |
| `selected` | Boolean | Yes | True when user taps this item to proceed |
| `session_metadata.fallback_used` | Boolean | Yes | True if insufficient matches found with strict filters |
| `session_metadata.fallback_reason` | String | Conditional | Required when `fallback_used = true` |

---

## Confidence Band Logic

| Score Range | Band | UI Treatment |
|---|---|---|
| 0.8 – 1.0 | `high` | Green badge: "Great Match" |
| 0.6 – 0.79 | `medium` | Amber badge: "Good Match" |
| 0.0 – 0.59 | `low` | Grey badge: "Possible Match" (shown only if no high/medium results) |

Low-confidence items are included in the response only as a fallback when the full catalogue has no high or medium matches.

---

## Fallback Behaviour

When strict filter matching (all preferences applied) yields fewer than 3 results:

1. Budget constraint is relaxed by ±20%.
2. If still < 3 results, fabric preference is removed.
3. `fallback_used` is set to `true`; `fallback_reason` describes which filters were relaxed.
4. UI displays a notice: "We expanded your filters slightly to find more options."

---

## Relationships

- `recommendation.user_id` → `user_profile.id`
- `recommendation.measurement_id` → `measurements.id`
- `recommendation.preference_id` → `preferences.id`
- `recommendation.items[].outfit_id` → outfit catalogue (external or internal product table)

---

## Non-Goals

- This model does not store outfit catalogue master data (managed separately).
- Recommendation history for model training is exported to the ML pipeline, not stored in this table.
