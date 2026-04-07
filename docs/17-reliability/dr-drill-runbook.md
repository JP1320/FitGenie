# Disaster Recovery Drill Runbook

## Drill Frequency
Quarterly

## Steps
1. Simulate primary DB outage
2. Restore from latest snapshot to standby
3. Repoint API to standby DB
4. Validate core flows: profile, recommendation, booking
5. Record RTO and RPO

## Targets
- RTO <= 30 minutes
- RPO <= 5 minutes
