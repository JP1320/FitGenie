# Recommendation Logic

## Overview

The FitGenie recommendation engine takes a user's body measurements, style preferences, and context (occasion, intent, budget) and returns a ranked list of outfit recommendations. Each recommendation includes a size label, confidence score, and a human-readable explanation.

---

## Inputs

| Input | Source | Required |
|---|---|---|
| `measurements` | Measurement record (AI scan or manual) | Yes |
| `preferences` | Preference record from Smart Filters step | Yes |
| `body_type` | Inferred from measurements or user-selected | No (used if available) |
| `intent` | User intent from onboarding | Yes |
| `occasion` | From intent or preference | No |
| `recommendation_id` | Session identifier for traceability | Yes |

---

## Processing Pipeline

```
[User Profile + Measurements + Preferences]
        ↓
[Measurement Normalisation]
        ↓
[Catalogue Filtering: budget → fabric → style → occasion]
        ↓
[Size Mapping: measurements → size label per garment type]
        ↓
[Confidence Scoring: per item]
        ↓
[AI Ranking & Explanation Generation]
        ↓
[Fallback if < 3 results]
        ↓
[Ranked Recommendation Response]
```

---

## Step 1: Measurement Normalisation

- All measurements converted to cm.
- BMI and body proportion ratios computed (not surfaced to user).
- Body type confirmed or inferred from ratios (see measurements model).
- Size lookup table maps `chest_cm`, `waist_cm`, `hips_cm` to standard size labels.

---

## Step 2: Catalogue Filtering

Filters applied in order (most restrictive first):

1. **Budget:** `catalogue_item.price BETWEEN user_budget.min AND user_budget.max`
2. **Style:** `catalogue_item.style_tags` intersects with `user.preferences.style`
3. **Fabric:** `catalogue_item.fabric_tags` intersects with `user.preferences.fabric` (if any)
4. **Occasion:** matched if `catalogue_item.occasion_tags` includes user occasion (optional)

If fewer than 3 results after strict filtering, fallback logic engages (see `recommendations.md`).

---

## Step 3: Size Mapping

For each catalogue item:

- Look up `garment_type` → determine which measurement is primary (chest for tops, hips+waist for bottoms).
- Map primary measurement to size label using the brand-neutral size chart.
- Apply fit type adjustment (slim = -0.5 size, regular = standard, oversized = +1 size).

---

## Step 4: Confidence Scoring

See `confidence-scoring.md` for the full algorithm. In summary:

- High confidence (≥ 0.8): user's measurements map cleanly to a single size; no borderline cases.
- Medium confidence (0.6–0.79): measurements are near a size boundary or one dimension spans two sizes.
- Low confidence (< 0.6): significant measurement gaps, unusual proportions, or scan quality issues.

---

## Step 5: AI Ranking and Explanation

After filtering and scoring, the AI layer:

1. **Ranks** items by `(confidence_score × 0.6) + (style_match_score × 0.3) + (budget_proximity_score × 0.1)`.
2. **Generates explanations** for the top N items (default N = 10) using the recommendation engine prompt.

Explanation fields:
- `summary`: one concise sentence (≤ 150 chars).
- `body_type_match`: why this garment suits the user's body type.
- `style_match`: alignment with user's style preferences.
- `fabric_match`: fabric suitability (only if fabric preference set).
- `occasion_match`: suitability for the stated occasion (only if occasion set).

---

## Step 6: Fallback

If fewer than 3 items reach `confidence_band = high` or `medium`:

1. Relax budget by ±20%.
2. If still < 3, remove fabric filter.
3. Set `fallback_used = true` and record `fallback_reason`.

---

## Output Format

```json
{
  "recommendation_id": "uuid",
  "items": [
    {
      "rank": 1,
      "outfit_id": "CAT-12345",
      "size_recommendation": {
        "label": "M",
        "confidence_score": 0.91,
        "confidence_band": "high"
      },
      "explanation": {
        "summary": "This kurta's straight cut and cotton fabric balance your proportions beautifully.",
        "body_type_match": "The straight silhouette works well for your body type.",
        "style_match": "Matches your Ethnic style preference.",
        "fabric_match": "Cotton — your preferred fabric.",
        "occasion_match": "Suitable for festive occasions."
      }
    }
  ],
  "session_metadata": {
    "total_items_evaluated": 240,
    "fallback_used": false,
    "fallback_reason": null
  }
}
```

---

## Non-Goals

- The recommendation engine does not compare users to each other or infer demographic trends.
- It does not surface trending items unless they also match the user's fit profile.
- It never uses weight as a visible ranking signal.
