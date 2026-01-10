#!/bin/bash
set -euo pipefail

TEST_NAME="${1:-}"

if [ -z "$TEST_NAME" ]; then
  echo "Usage: $0 <test_name>" >&2
  exit 1
fi

TEST_JS=$(.ci/jenkins/scripts/find_scenario_by_test_name.sh "$TEST_NAME")

if [ ! -f "$TEST_JS" ]; then
  echo "Test JS not found: $TEST_JS" >&2
  exit 1
fi

echo "Running TEST_NAME=$TEST_NAME"
echo "  Script: $TEST_JS"

k6 run \
  --out experimental-prometheus-rw \
  "$TEST_JS"
