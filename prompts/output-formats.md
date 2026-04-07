# Output Formats

## Purpose

This document defines the canonical output format schemas for all AI-generated responses in FitGenie. These schemas are the single source of truth for backend parsing logic.

---

## General Rules

1. All AI responses must be **pure JSON** — no markdown fences, no preamble, no trailing text.
2. All required fields must be present; nullable fields use `null` (never omitted).
3. String lengths must comply with defined maximum character limits.
4. Arrays must always be arrays, even when empty.
5. Numeric values must be valid numbers (not strings).
6. Boolean values must be `true` or `false` (not `"true"` or `1`).

---

## Format 1: Recommendation Explanation

Used by: `recommendation-engine.md`, `explain-why-this-suits-you.md`

**Schema:**

```json
[
  {
    "rank": 1,
    "outfit_id": "string",
    "explanation": {
      "summary": "string (max 150 chars)",
      "body_type_match": "string (max 180 chars)",
      "style_match": "string (max 180 chars)",
      "fabric_match": "string (max 180 chars) | null",
      "occasion_match": "string (max 180 chars) | null"
    }
  }
]
```

**Full example:**

```json
[
  {
    "rank": 1,
    "outfit_id": "CAT-78901",
    "explanation": {
      "summary": "This Anarkali's flared silhouette and silk fabric make it a strong choice for your wedding.",
      "body_type_match": "The fitted bodice and gently flared skirt create a balanced, graceful line.",
      "style_match": "Matches your Ethnic and Indo-Western style preferences.",
      "fabric_match": "Silk adds a luxurious drape suitable for festive occasions.",
      "occasion_match": "Well-suited for wedding celebrations."
    }
  },
  {
    "rank": 2,
    "outfit_id": "CAT-78902",
    "explanation": {
      "summary": "A comfortable cotton set that works well for both casual and semi-formal wear.",
      "body_type_match": "The straight kurta with wide-leg palazzo elongates the silhouette.",
      "style_match": "Matches your Ethnic preference.",
      "fabric_match": "Cotton — your preferred fabric — keeps it comfortable.",
      "occasion_match": null
    }
  }
]
```

---

## Format 2: "Why This Suits You" (Single Item)

Used by: `explain-why-this-suits-you.md` (on-demand, single outfit)

**Schema:**

```json
{
  "outfit_id": "string",
  "summary": "string (max 150 chars)",
  "body_type_match": "string (max 180 chars)",
  "style_match": "string (max 180 chars)",
  "fabric_match": "string (max 180 chars) | null",
  "occasion_match": "string (max 180 chars) | null",
  "size_note": "string (max 180 chars)"
}
```

**Full example:**

```json
{
  "outfit_id": "CAT-78901",
  "summary": "This Anarkali's flared silhouette and silk fabric make it a strong choice for your wedding.",
  "body_type_match": "The fitted bodice and flared skirt create a balanced, graceful look for your measurements.",
  "style_match": "Matches your Ethnic and Indo-Western style preferences.",
  "fabric_match": "Silk adds a luxurious drape and subtle sheen for festive occasions.",
  "occasion_match": "The embroidery and rich fabric are well-suited for wedding celebrations.",
  "size_note": "Size S is a confident match — chest and waist both fit cleanly within the S range for this design."
}
```

---

## Format 3: Fit Analysis Report

Used by: `fit-analysis.md` (user-facing report)

**Schema:**

```json
{
  "outfit_id": "string",
  "overall_summary": "string (max 200 chars)",
  "dimension_notes": {
    "chest": "string (max 120 chars) | null",
    "waist": "string (max 120 chars) | null",
    "hip": "string (max 120 chars) | null",
    "shoulder": "string (max 120 chars) | null",
    "inseam": "string (max 120 chars) | null"
  },
  "alteration_suggestions": [
    "string (max 150 chars)"
  ]
}
```

**Full example:**

```json
{
  "outfit_id": "CAT-78901",
  "overall_summary": "This Anarkali suits your measurements well. Chest and waist fit excellently; a minor shoulder adjustment is recommended.",
  "dimension_notes": {
    "chest": null,
    "waist": null,
    "hip": null,
    "shoulder": "The shoulder seam is slightly wider than your measurement — a small adjustment sharpens the fit.",
    "inseam": null
  },
  "alteration_suggestions": [
    "Narrow the shoulder seam by approximately 0.5 cm on each side for a precise fit."
  ]
}
```

---

## Format 4: Fit Card AI Notes

Used by: `fit-card-generation.md`

**Schema:**

```json
{
  "ai_notes": "string (max 300 chars)"
}
```

**Full example:**

```json
{
  "ai_notes": "Regular fit preferred — standard chest/waist ease. Shoulder (38.5 cm) narrow; reduce armhole 0.5 cm each side. Sleeve length 58 cm; three-quarter finish at 43 cm. Silk — use fine needle, French seams."
}
```

---

## Validation Checklist

Backend must verify for every AI response before use:

| Check | Action on Failure |
|---|---|
| Valid JSON | Retry once, then use fallback |
| All required fields present | Retry once, then use fallback |
| String fields within character limits | Truncate at limit; log warning |
| `outfit_id` values match input candidates | Reject and log; use fallback |
| No prohibited language (guardrail check) | Retry once with reinforced prompt, then use fallback |
| Array fields are arrays (not null) | Replace `null` with `[]`; log warning |

---

## Versioning

Output format versions are tracked by `model_version` in the recommendation and fit card records. When the format schema changes, `model_version` is incremented and the parser is updated accordingly before deployment.
