#!/usr/bin/env bash
set -euo pipefail

echo "Running staging checks..."
curl -f https://staging.fitgenie.ai/health >/dev/null && echo "health ✅"
curl -f https://staging.fitgenie.ai/ready >/dev/null && echo "ready ✅"
echo "Now run manual MVP flow checklist."
echo "Staging checks complete ✅"
