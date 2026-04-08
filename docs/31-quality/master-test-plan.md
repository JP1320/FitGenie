# Master Test Plan

## Test Layers
- Unit tests (validation, scoring, status transitions)
- Integration tests (API + DB + AI adapter)
- Contract tests (OpenAPI + JSON schema conformance)
- E2E tests (onboarding → booking → fit card → tracking)
- Regression tests (prompt output structure and safety)

## Exit Criteria
- 95% critical path E2E pass rate
- 0 blocker defects
- 0 critical security findings
