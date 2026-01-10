#!/bin/bash
# Run k6 Test in Docker Container
# Usage: ./run-test.sh <test_name>
# Example: ./run-test.sh teamA_load_weather_api

set -euo pipefail

TEST_NAME="${1:-teamA_load_weather_api}"

echo "🚀 Running k6 test: $TEST_NAME"
echo ""

# Find the test.js file
echo "📁 Finding test script..."
# Try direct path first
if [[ "$TEST_NAME" == teams/*/test.js ]] || [[ "$TEST_NAME" == */test.js ]]; then
  TEST_JS="$TEST_NAME"
else
  # Convert pattern: teamA_load_ramp_up -> teams/teamA/load/ramp_up/test.js
  TEST_JS=$(echo "$TEST_NAME" | sed 's/_/\//g' | sed 's/^/teams\//' | sed 's/$/\/test.js/')
fi

# Verify file exists in container
if ! docker exec k6 test -f "/workspace/$TEST_JS" 2>/dev/null; then
  echo "❌ Test file not found: $TEST_JS"
  echo ""
  echo "Available tests:"
  docker exec k6 sh -c "find /workspace/teams -name 'test.js' -type f | sed 's|/workspace/||' | head -20"
  exit 1
fi

echo "✓ Found test script: $TEST_JS"
echo ""

# Run the test
echo "▶️  Starting k6 test..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

docker exec k6 k6 run \
    --out experimental-prometheus-rw \
    "$TEST_JS"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Test completed!"
echo ""
echo "📊 View results in Grafana: http://localhost:3000"

