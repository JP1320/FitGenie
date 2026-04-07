---
name: "Epic A: Backend Foundation"
about: Setup backend foundation aligned to Phase 1 docs
title: "[Epic A] Backend Foundation"
labels: ["epic","backend"]
assignees: []
---

## Scope
- Auth/session baseline
- User profile + measurements + preferences
- Validation + persistence

## References
- docs/03-data-models/user-profile.md
- docs/03-data-models/measurements.md
- docs/03-data-models/preferences.md
- docs/06-api/endpoint-catalog.md

## Definition of Done
- [ ] `/user/profile` CRUD with schema validation
- [ ] Migration + seed created
- [ ] Error responses follow docs/06-api/error-codes.md
- [ ] Unit/integration tests pass
