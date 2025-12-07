#!/bin/bash
# Run k6 Test in Docker Container
# Usage: ./run-test.sh <test_name>
# Example: ./run-test.sh teamA_load_weather_api

set -euo pipefail

TEST_NAME="${1:-teamA_load_weather_api}"

echo "🚀 Running k6 test: $TEST_NAME"
echo ""

# Find the config file
echo "📁 Finding test configuration..."
CONFIG_PATH=$(docker exec k6 sh -c "grep -Rsl 'test_name: \"$TEST_NAME\"' /workspace/teams/ 2>/dev/null || true")

if [ -z "$CONFIG_PATH" ]; then
  echo "❌ No test found with test_name='$TEST_NAME'"
  echo ""
  echo "Available tests:"
  docker exec k6 sh -c "find /workspace/teams -name 'config.yaml' -exec grep -H 'test_name:' {} \;"
  exit 1
fi

echo "✓ Found config: $CONFIG_PATH"

# Find the test.js file
TEST_DIR=$(docker exec k6 sh -c "dirname $CONFIG_PATH")
TEST_JS="$TEST_DIR/test.js"

echo "✓ Using test script: $TEST_JS"
echo ""

# Run the test
echo "▶️  Starting k6 test..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

docker exec k6 k6 run \
    --out experimental-prometheus-rw \
    -e SCENARIO_FILE="$CONFIG_PATH" \
    "$TEST_JS"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Test completed!"
echo ""
echo "📊 View results in Grafana: http://localhost:3000"

