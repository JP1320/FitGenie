# 14-Day Production Countdown Plan

## Day 1: Freeze + Branch Strategy
- [ ] Create `release/v1.0.0` branch
- [ ] Enforce change freeze (only release fixes)
- [ ] Confirm release owner + incident commander

## Day 2: Contract + Schema Lock
- [ ] Lock OpenAPI + JSON schemas
- [ ] Run contract regression tests
- [ ] Reject incompatible API changes

## Day 3: Full Regression (Core Journey)
- [ ] E2E: onboarding → recommendations → booking → fit card → tracking
- [ ] Verify all critical paths pass
- [ ] Triage and assign defects

## Day 4: Security Hardening
- [ ] Dependency audit + patch
- [ ] Secrets rotation rehearsal
- [ ] Tenant isolation verification

## Day 5: Performance Certification
- [ ] Load test recommendations + booking
- [ ] Record P50/P95 latency
- [ ] Apply caching/index optimizations if needed

## Day 6: Accessibility + UX Polish
- [ ] WCAG 2.1 AA validation
- [ ] Keyboard and screen reader checks
- [ ] Final copy review for clarity/safety tone

## Day 7: DR + Rollback Drill
- [ ] Simulate partial outage
- [ ] Execute rollback playbook
- [ ] Capture RTO/RPO evidence

## Day 8: Beta Cohort Validation
- [ ] Run UAT with selected real users
- [ ] Capture friction points
- [ ] Ship high-severity fixes

## Day 9: Observability Lock
- [ ] Dashboard: error rate, latency, booking success, AI parse failures
- [ ] Alert thresholds tuned
- [ ] On-call escalation matrix confirmed

## Day 10: Compliance + Audit Artifacts
- [ ] SOC2 control evidence snapshot
- [ ] Privacy/retention checks
- [ ] Admin audit logs verified

## Day 11: Canary Readiness
- [ ] Canary routing config ready (5% traffic)
- [ ] Feature flags validated
- [ ] Release candidate build signed

## Day 12: Go/No-Go Review
- [ ] Product sign-off
- [ ] Engineering sign-off
- [ ] Security sign-off
- [ ] Support sign-off

## Day 13: Launch Day
- [ ] Deploy canary 5%
- [ ] Observe 30–60 mins
- [ ] Ramp to 25% → 50% → 100%
- [ ] Publish launch announcement

## Day 14: Post-Launch Stabilization
- [ ] Incident and bug triage war-room
- [ ] Hotfixes only
- [ ] Publish first 24h metrics report
