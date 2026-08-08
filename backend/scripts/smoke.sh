#!/usr/bin/env bash
set -euo pipefail

BASE="${API_BASE:-http://localhost:4000}"

echo "Health..."
curl -sf "$BASE/api/health" >/dev/null

echo "Student login..."
LOGIN=$(curl -sf -X POST "$BASE/api/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"student@demo.com","password":"Demo@12345"}')
TOKEN=$(python3 -c "import json,sys; print(json.load(sys.stdin)['data']['token'])" <<<"$LOGIN")

echo "Dashboard summary..."
curl -sf "$BASE/api/dashboard/summary" -H "Authorization: Bearer $TOKEN" >/dev/null

echo "Recommendations..."
curl -sf "$BASE/api/recommendations" -H "Authorization: Bearer $TOKEN" >/dev/null

echo "CSV export..."
curl -sf "$BASE/api/export/progress.csv" -H "Authorization: Bearer $TOKEN" | head -1 | grep -q course_title

echo "Mentor login..."
MLOGIN=$(curl -sf -X POST "$BASE/api/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"mentor@demo.com","password":"Demo@12345"}')
MTOKEN=$(python3 -c "import json,sys; print(json.load(sys.stdin)['data']['token'])" <<<"$MLOGIN")

echo "Mentor students..."
curl -sf "$BASE/api/mentor/students" -H "Authorization: Bearer $MTOKEN" >/dev/null

echo "Smoke checks passed."
