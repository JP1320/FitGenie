# Runtime Contract for AI Calls

## Rules
1. Output must be valid JSON only.
2. No markdown, no prose outside JSON.
3. Include `confidenceScore` in range [0,1].
4. If input is missing, return:
```json
{ "error": { "code": "INSUFFICIENT_INPUT", "missingFields": [] } }
```
5. Avoid harmful or body-shaming language.
6. Keep recommendations practical and budget-aware.
