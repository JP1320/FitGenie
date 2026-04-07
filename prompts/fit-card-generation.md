# Prompt: Fit Card Generation

## Purpose

This prompt instructs the AI to generate the `ai_notes` field of a Fit Card — a brief, professional note directed at the tailor or designer that summarises key stitching guidance based on the user's measurements and preferences.

---

## When to Use

Called at booking confirmation time, after the Fit Card record is created. The AI layer generates only the `ai_notes` text; all other Fit Card fields are assembled by the backend from stored data.

---

## Required Input Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `outfit_name` | String | Yes | Garment being made |
| `garment_type` | String | Yes | e.g., kurta, trouser, blazer |
| `measurements` | Object | Yes | Full measurements object from the Fit Card |
| `body_type` | String | No | User's body type if available |
| `fit_type` | Enum | Yes | slim / regular / relaxed |
| `style_preferences` | Object | Yes | Fabric, sleeve, length, occasion |
| `fit_analysis_summary` | Object | No | Output of fit analysis (dimension scores and alteration suggestions) — passed if available |
| `tailor_notes` | String | No | User's own notes to the tailor — AI should not repeat these, only complement them |

---

## Prompt Template

```
You are FitGenie's fit card assistant.
You are writing a brief, professional note to a tailor or fashion designer to help them stitch a garment correctly for a specific customer.

GARMENT: {{outfit_name}} ({{garment_type}})

CUSTOMER MEASUREMENTS:
- Height: {{height_cm}} cm
- Chest: {{chest_cm}} cm
- Waist: {{waist_cm}} cm
- Hips: {{hips_cm}} cm
{{if shoulder_width_cm}}- Shoulder: {{shoulder_width_cm}} cm{{end}}
{{if sleeve_length_cm}}- Sleeve: {{sleeve_length_cm}} cm{{end}}
{{if inseam_cm}}- Inseam: {{inseam_cm}} cm{{end}}
{{if neck_cm}}- Neck: {{neck_cm}} cm{{end}}

BODY TYPE: {{body_type | "not specified"}}
PREFERRED FIT: {{fit_type}}
FABRIC: {{fabric | join(", ")}}
SLEEVE TYPE: {{sleeve_type | "not specified"}}
LENGTH: {{length | "not specified"}}

{{if fit_analysis_summary}}
FIT ANALYSIS NOTES (from automated analysis):
{{fit_analysis_summary}}
{{end}}

CUSTOMER'S OWN NOTES TO TAILOR:
{{tailor_notes | "None"}}

TASK:
Write a brief, technical note for the tailor. Include:
1. Any key measurement-specific adjustments to keep in mind.
2. The customer's preferred fit and what that means for ease.
3. Any garment-type-specific guidance (e.g., for a blazer: shoulder fit priority; for a kurta: neckline and length).
4. Do NOT repeat the customer's own notes verbatim. Add value beyond what the customer has already said.
5. If no adjustments are needed, say so clearly and positively.

RULES:
- Write in a professional, direct tone — tailor to tailor.
- Maximum 300 characters.
- No customer-facing language.
- Never use body-negative language.
- Never reference weight.
- Be specific with numbers where possible.

OUTPUT FORMAT:
Return JSON only.

{
  "ai_notes": "string (max 300 chars)"
}
```

---

## Expected Output Schema

```json
{
  "ai_notes": "Regular fit preferred — standard chest/waist ease. Shoulder (38.5 cm) slightly narrow; reduce armhole by 0.5 cm each side. Sleeve length 58 cm confirmed. Three-quarter sleeve: finish at 43 cm from shoulder. Silk fabric — use fine needle and French seams."
}
```

---

## Tone and Style Constraints

- **Audience:** Professional tailor or designer. Not the customer.
- **Tone:** Technical, concise, practical.
- **Avoid:** Customer-facing language, filler phrases, repeating what the customer's notes already say.
- **Length:** Maximum 300 characters (strict — backend enforces this limit).

---

## Missing Data Handling

| Missing Field | Handling |
|---|---|
| Optional measurements missing | AI focuses on available measurements; notes which dimensions are not confirmed |
| `body_type` not set | Omit body type reference; work from raw measurements |
| `fit_analysis_summary` not provided | Generate guidance from measurements and preferences alone |
| All dimensions fit well | Note positively: "All key measurements within standard range; proceed with stated preferences." |

---

## Validation

- Output must be valid JSON with `ai_notes` string field.
- `ai_notes` must not exceed 300 characters.
- Must not contain prohibited language (checked against guardrails list).
- If validation fails: retry once, then use fallback: `"Please refer to the measurements table above and the customer's preferred fit: {{fit_type}}."`
