#!/usr/bin/env bash
set -euo pipefail

echo "Production canary validation..."
curl -f https://app.fitgenie.ai/health >/dev/null && echo "health ✅"
curl -f https://app.fitgenie.ai/ready >/dev/null && echo "ready ✅"
echo "Verify dashboards: error rate, p95 latency, booking success."
echo "Canary checks complete ✅"
