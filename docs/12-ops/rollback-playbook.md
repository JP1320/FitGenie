# Rollback Playbook

## Trigger Conditions
- Elevated 5xx errors for 10+ minutes
- Booking failures > 5%
- Recommendation endpoint failure > 3%
- Data integrity issue detected

## Steps
1. Disable risky feature flags (AI recommendations, booking write-path if needed).
2. Re-route traffic to previous stable release.
3. Run DB integrity checks.
4. Announce incident status to internal team.
5. Open incident report with timeline and root cause.

## Verification
- /health and /ready green
- Error rates normalized
- Booking and profile APIs stable
