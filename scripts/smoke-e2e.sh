#!/usr/bin/env sh
set -e

API_URL="${API_URL:-http://localhost:4000}"
FIXTURE_URL="${FIXTURE_URL:-http://host.docker.internal:8088/crud-form.html}"

echo "TeachMeAny E2E smoke (API: $API_URL)"

session_id=$(curl -sf -X POST "$API_URL/sessions" \
  -H "Content-Type: application/json" \
  -d "{\"startUrl\":\"$FIXTURE_URL\"}" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p' | head -1)

if [ -z "$session_id" ]; then
  echo "FAIL: could not create session"
  exit 1
fi

echo "Created session $session_id"

for _ in $(seq 1 30); do
  status=$(curl -sf "$API_URL/sessions/$session_id" | sed -n 's/.*"status":"\([^"]*\)".*/\1/p' | head -1)
  vnc=$(curl -sf "$API_URL/sessions/$session_id" | sed -n 's/.*"vncUrl":"\([^"]*\)".*/\1/p' | head -1)
  if [ "$status" = "active" ]; then
    echo "Session active (vncUrl=${vnc:-none})"
    break
  fi
  sleep 2
done

if [ "$status" != "active" ]; then
  echo "FAIL: session did not become active"
  exit 1
fi

curl -sf -X POST "$API_URL/sessions/$session_id/recording/start" \
  -H "Content-Type: application/json" -d '{}' >/dev/null
sleep 2
curl -sf -X POST "$API_URL/sessions/$session_id/recording/stop" \
  -H "Content-Type: application/json" -d '{}' >/dev/null

workflows=$(curl -sf "$API_URL/sessions/$session_id/workflows")
total=$(echo "$workflows" | sed -n 's/.*"total":\([0-9]*\).*/\1/p' | head -1)

if [ "${total:-0}" -lt 1 ]; then
  echo "WARN: no workflows extracted (record interactions in noVNC for full path)"
else
  echo "Workflows extracted: total=$total"
fi

echo "Smoke checks passed (session lifecycle + optional workflow extract)"
