# Go-Live Runbook

## T-7 Days
- Feature freeze
- Final regression pass
- Incident team on standby

## T-1 Day
- DB backup
- Verify release artifact
- Verify rollout + rollback scripts

## Launch Day
1. Deploy canary (5%)
2. Monitor 30 min (errors, latency, booking success)
3. Ramp to 25% then 100%
4. Post-launch validation + announcement

## T+1 Day
- Incident review
- Metrics review
- Hotfix window if needed
