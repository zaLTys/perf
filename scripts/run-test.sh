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
  # Convert pattern: teamA_load_weather_api -> teams/teamA/load/weather_api/test.js
  # Split by first two underscores only: teamA_load_weather_api -> teamA/load/weather_api
  IFS='_' read -ra PARTS <<< "$TEST_NAME"
  if [ ${#PARTS[@]} -ge 3 ]; then
    TEAM="${PARTS[0]}"
    TEST_TYPE="${PARTS[1]}"
    # Join remaining parts (from index 2 onwards) with underscore for test name
    shift=2
    TEST_NAME_JOINED=$(IFS='_'; echo "${PARTS[*]:$shift}")
    TEST_JS="teams/${TEAM}/${TEST_TYPE}/${TEST_NAME_JOINED}/test.js"
  else
    echo "❌ Invalid test name format. Expected: teamName_testType_testName"
    exit 1
  fi
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

