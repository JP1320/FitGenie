#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-https://app.fitgenie.ai}"

echo "== Live Server Check for $BASE_URL =="

echo "[1] Health"
curl -sS -f "$BASE_URL/health" && echo -e "\nhealth ✅" || { echo "health ❌"; exit 1; }

echo "[2] Readiness"
curl -sS -f "$BASE_URL/ready" && echo -e "\nready ✅" || { echo "ready ❌"; exit 1; }

echo "[3] Profile API"
curl -sS -f -X POST "$BASE_URL/user/profile" \
  -H "Content-Type: application/json" \
  -d '{
    "userId":"u_live_001",
    "name":"Live Test",
    "age":25,
    "gender":"prefer_not_to_say",
    "location":"NY",
    "stylePreferences":["casual"],
    "budgetRange":{"min":30,"max":120,"currency":"USD"}
  }' && echo -e "\nprofile ✅" || { echo "profile ❌"; exit 1; }

echo "[4] Body Scan API"
curl -sS -f -X POST "$BASE_URL/scan/body" \
  -H "Content-Type: application/json" \
  -d '{
    "userId":"u_live_001",
    "unit":"cm",
    "chest":90,
    "waist":78,
    "hip":95,
    "height":172
  }' && echo -e "\nscan ✅" || { echo "scan ❌"; exit 1; }

echo "[5] Recommendations API"
curl -sS -f -X POST "$BASE_URL/recommendations" \
  -H "Content-Type: application/json" \
  -d '{"userId":"u_live_001","intent":"daily wear"}' && echo -e "\nrecommendations ✅" || { echo "recommendations ❌"; exit 1; }

echo "[6] Tailors API"
curl -sS -f "$BASE_URL/tailors" && echo -e "\ntailors ✅" || { echo "tailors ❌"; exit 1; }

echo "[7] Booking API"
curl -sS -f -X POST "$BASE_URL/booking" \
  -H "Content-Type: application/json" \
  -d '{"userId":"u_live_001","tailorId":"t1","slot":"2026-04-09T10:00:00Z"}' && echo -e "\nbooking ✅" || { echo "booking ❌"; exit 1; }

echo "🎉 Live checks passed."
