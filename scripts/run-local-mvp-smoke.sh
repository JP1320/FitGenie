#!/usr/bin/env bash
set -euo pipefail

echo "1) Checking backend health..."
curl -f http://localhost:4000/health >/dev/null && echo "backend health ✅"

echo "2) Checking backend ready..."
curl -f http://localhost:4000/ready >/dev/null && echo "backend ready ✅"

echo "3) Smoke: profile endpoint..."
curl -f -X POST http://localhost:4000/user/profile \
  -H "Content-Type: application/json" \
  -d '{"userId":"u1","name":"Test","age":25,"gender":"prefer_not_to_say","location":"NY","stylePreferences":["casual"],"budgetRange":{"min":20,"max":100,"currency":"USD"}}' >/dev/null && echo "profile ✅"

echo "4) Smoke: recommendations endpoint..."
curl -f -X POST http://localhost:4000/recommendations \
  -H "Content-Type: application/json" \
  -d '{"userId":"u1","intent":"daily"}' >/dev/null && echo "recommendations ✅"

echo "MVP backend smoke passed ✅"
