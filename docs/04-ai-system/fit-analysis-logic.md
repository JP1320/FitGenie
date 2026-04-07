# Fit Analysis Logic

## Overview

Fit Analysis is the process by which FitGenie determines how a specific garment will fit a user, based on their body measurements and the garment's technical specifications. It is distinct from the recommendation engine (which selects items) — fit analysis evaluates the quality of the fit for a specific item.

---

## When Fit Analysis Runs

1. **During recommendation generation:** Fit analysis scores all filtered catalogue items before ranking.
2. **On explicit user request:** If a user taps "Analyse Fit" on a specific item, a detailed per-garment report is generated.
3. **Fit Card generation:** The AI notes field in the Fit Card is based on fit analysis output.

---

## Inputs

| Input | Required | Source |
|---|---|---|
| User `chest_cm`, `waist_cm`, `hips_cm` | Yes | Measurement record |
| User `shoulder_width_cm` | Conditional | Measurement record (tops/jackets) |
| User `inseam_cm` | Conditional | Measurement record (bottoms) |
| User `sleeve_length_cm` | Conditional | Measurement record (sleeved tops) |
| User `fit_type` | Yes | Preference record |
| Garment spec: `chest_finished`, `waist_finished`, `hip_finished` | Yes | Catalogue record |
| Garment spec: `shoulder_finished` | Conditional | Catalogue record |
| Garment spec: `inseam_finished` | Conditional | Catalogue record |

---

## Fit Analysis Algorithm

### 1. Compute Ease (Fit Gap)

Ease is the difference between the finished garment measurement and the user's body measurement:

```
ease_chest = garment.chest_finished - user.chest_cm
ease_waist = garment.waist_finished - user.waist_cm
ease_hip   = garment.hip_finished   - user.hips_cm
```

Ease determines whether a garment is too tight, ideal, or too loose for the user's preference.

### 2. Apply Fit Type Tolerance

| Fit Type | Minimum Ease | Maximum Ease |
|---|---|---|
| `slim` | 2 cm | 8 cm |
| `regular` | 6 cm | 14 cm |
| `relaxed` | 12 cm | 22 cm |

If ease is below minimum → garment is **too tight** for this user/fit preference.  
If ease is above maximum → garment is **too loose**.  
If ease is within range → **good fit**.

### 3. Score Per Measurement

Each measurement dimension is scored:

```
score_dim = 1.0 if ease_dim within tolerance
score_dim = max(0, 1 - abs(deviation) / max_tolerance) if outside tolerance
```

### 4. Aggregate Fit Score

```
fit_score = weighted_average(score_chest × 0.35, score_waist × 0.35, score_hip × 0.20, score_shoulder × 0.10)
```

Weights are adjusted for garment type (e.g., shoulder weight is higher for jackets and formal shirts).

### 5. Map Score to Fit Quality Label

| Score Range | Label | Meaning |
|---|---|---|
| 0.85 – 1.0 | `excellent_fit` | Garment matches user's measurements and preference closely |
| 0.70 – 0.84 | `good_fit` | Minor ease deviation; likely comfortable |
| 0.55 – 0.69 | `acceptable_fit` | Noticeable deviation; may need minor alteration |
| 0.00 – 0.54 | `poor_fit` | Significant mismatch; alteration or size change recommended |

---

## Output Schema

```json
{
  "outfit_id": "CAT-12345",
  "user_id": "uuid",
  "measurement_id": "uuid",
  "fit_quality": "excellent_fit | good_fit | acceptable_fit | poor_fit",
  "fit_score": 0.88,
  "dimension_scores": {
    "chest": { "ease_cm": 8.0, "score": 0.95, "verdict": "good_fit" },
    "waist": { "ease_cm": 7.5, "score": 0.90, "verdict": "good_fit" },
    "hip":   { "ease_cm": 9.0, "score": 0.85, "verdict": "good_fit" },
    "shoulder": { "ease_cm": 1.0, "score": 0.60, "verdict": "acceptable_fit" }
  },
  "alteration_suggestions": [
    "Consider letting out the shoulder seam by ~1 cm for a more comfortable fit."
  ],
  "tailor_note": "Shoulder width slightly narrow; adjust armhole 1 cm each side."
}
```

---

## Alteration Suggestion Rules

Alteration suggestions are generated when any dimension score is < 0.7:

- Clearly state which dimension is affected.
- Suggest a specific adjustment in centimetres.
- Never use language referencing weight, body size in a negative way, or implying a body flaw.
- Suggestions are framed as garment adjustments, not body critiques.

---

## Non-Goals

- Fit analysis does not account for stretch/elasticity of fabric (Phase 2 enhancement).
- It does not generate try-on simulations (Phase 2).
- It does not analyse historical fit patterns across multiple orders (deferred to feedback loop integration in Phase 2).
