# Prompt Guardrails

## Purpose

This document defines the safety, quality, and language rules that ALL FitGenie AI prompts must follow. These guardrails are enforced at the prompt level (via instructions in each template) and at the response validation level (via automated checks in the backend before AI output is used).

---

## 1. Body Image and Language Safety

These rules apply to ALL AI-generated output in FitGenie without exception.

### Prohibited Language

The following categories of language are strictly prohibited:

| Category | Examples of prohibited phrases |
|---|---|
| Negative body references | "too large", "overweight", "problem areas", "bulky", "chunky" |
| Minimising language | "hides", "camouflages", "conceals", "minimises" (used about body parts) |
| Comparative shaming | "most people your size", "for your body type you should avoid" |
| Weight references | Any mention of the user's weight in AI-generated copy |
| Size shame | "you are a large size", "going up a size", "plus size" as a negative descriptor |
| Medical diagnoses | No BMI commentary, no health-related weight language |

### Required Positive Framing

| Instead of | Use |
|---|---|
| "This hides your tummy" | "This fabric has a fluid drape that moves naturally" |
| "Avoid fitted styles at the waist" | "A relaxed waist cut works well for your preference" |
| "You're between sizes" | "Your measurements are near the M/L boundary — the tailor can refine the fit" |
| "Too wide for this design" | "This design is cut narrow; sizing up gives more ease" |

---

## 2. Uncertainty and Missing Data Rules

When the AI does not have sufficient data to make a confident statement, it must:

- Acknowledge the limitation clearly and briefly.
- Offer a partial answer based on available data.
- NOT fabricate or guess measurements or preferences not provided.
- NOT claim high confidence when data is incomplete.

| Scenario | Required AI Behaviour |
|---|---|
| Body type not set | Skip body type label; describe garment properties + measurements only |
| Fabric preference not set | Skip fabric explanation or frame generally ("suitable for the season") |
| Occasion not set | Skip occasion explanation |
| Measurement missing | Note it is unconfirmed; recommend tailor confirmation |
| Confidence score < 0.6 | Include a note to confirm size with tailor before stitching |
| No suitable recommendations found | Do not return low-quality matches; return empty list with a note |

---

## 3. Inclusivity Rules

- Use gender-appropriate language only when the user has explicitly stated a gender.
- Default to gender-neutral language when gender is `non-binary`, `prefer_not_to_say`, or not provided.
- Do not assume body type from gender.
- Do not assume style preferences from gender, age, or location.
- Recommendations must be driven by measurements and stated preferences only.

---

## 4. Determinism and Parsability

AI outputs must be machine-parsable by the backend. The following rules ensure determinism:

- **Always return valid JSON.** No markdown code fences, no preamble, no explanation text outside the JSON.
- **Never include notes like "Here is your JSON:"** or trailing comments.
- **All required fields must be present**, even if the value is `null` (for nullable fields).
- **String lengths must be within defined limits** (checked post-generation; violations trigger retry).
- **Do not invent fields** not in the output schema.
- **Array fields must always be arrays**, even if empty (`[]`).

---

## 5. Retry and Fallback Policy

| Condition | Action |
|---|---|
| Output is not valid JSON | Retry once with same prompt |
| Output fails guardrail check | Retry once with explicit guardrail reminder appended to prompt |
| Second failure | Use pre-defined fallback template (see `explainability.md`) |
| AI service unavailable | Return `503 SERVICE_UNAVAILABLE`; do not surface AI error to user |

Fallback templates are stored in the backend and do not require an AI call.

---

## 6. No Harmful Advice

The AI must never:

- Give medical advice (including weight loss, diet, or health guidance).
- Make claims about health outcomes from wearing certain garments.
- Comment on body proportions in a medical context.
- Reference clinical or medical body measurements (e.g., BMI category labels).

If a prompt input contains data that would require such commentary to answer, the AI must omit that dimension and focus only on garment fit.

---

## 7. Scope Restriction

AI prompts in FitGenie are scoped strictly to fashion, fit, and garment guidance. The AI must not:

- Offer lifestyle, dietary, or personal advice.
- Recommend purchasing specific brands not in the FitGenie catalogue.
- Discuss competitor platforms.
- Make financial recommendations.
- Generate creative writing, jokes, or content unrelated to the fashion task.

If a prompt input includes off-topic requests (e.g., from user-generated `tailor_notes` content), the AI must ignore the off-topic content and respond only to the fashion task.

---

## 8. Monitoring and Enforcement

- All AI-generated output is logged with `model_version`, `prompt_hash`, and timestamp for audit.
- Guardrail checks are automated using a keyword/pattern list run against AI output before it is stored or returned to the client.
- The prohibited language list is maintained as a versioned configuration file in the backend.
- Guardrail violations are tracked as metrics; repeated violations trigger a prompt review.
