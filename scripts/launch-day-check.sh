#!/usr/bin/env bash
set -euo pipefail

echo "== FitGenie Launch Day Checks =="

curl -f https://app.fitgenie.ai/health >/dev/null && echo "health ✅"
curl -f https://app.fitgenie.ai/ready >/dev/null && echo "ready ✅"

echo "Run dashboards manually:"
echo "- API success / latency"
echo "- Booking success"
echo "- AI parse failures"
echo "All checks initiated ✅"
