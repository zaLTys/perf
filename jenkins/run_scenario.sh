#!/bin/bash
set -euo pipefail

TEST_NAME="${1:-}"

if [ -z "$TEST_NAME" ]; then
  echo "Usage: $0 <test_name>" >&2
  exit 1
fi

SCENARIO_FILE=$(jenkins/find_scenario_by_test_name.sh "$TEST_NAME")
TEST_DIR=$(dirname "$SCENARIO_FILE")
TEST_JS="${TEST_DIR}/test.js"

if [ ! -f "$TEST_JS" ]; then
  echo "Test JS not found: $TEST_JS" >&2
  exit 1
fi

echo "Running TEST_NAME=$TEST_NAME"
echo "  Config: $SCENARIO_FILE"
echo "  Script: $TEST_JS"

k6 run \
  --out experimental-prometheus-rw \
  -e SCENARIO_FILE="$SCENARIO_FILE" \
  "$TEST_JS"
