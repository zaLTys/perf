#!/bin/bash
set -euo pipefail

TEST_NAME="${1:-}"

if [ -z "$TEST_NAME" ]; then
  echo "Usage: $0 <test_name>" >&2
  exit 1
fi

CONFIG_PATH=$(grep -Rsl "test_name: \"$TEST_NAME\"" teams/ || true)

if [ -z "$CONFIG_PATH" ]; then
  echo "No scenario found for test_name='$TEST_NAME'" >&2
  exit 1
fi

echo "$CONFIG_PATH"
