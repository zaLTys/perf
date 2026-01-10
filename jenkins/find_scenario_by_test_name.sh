#!/bin/bash
set -euo pipefail

# Accept either test_name pattern (teamA_load_ramp_up) or path (teams/teamA/load/ramp_up/test.js)
TEST_INPUT="${1:-}"

if [ -z "$TEST_INPUT" ]; then
  echo "Usage: $0 <test_name_or_path>" >&2
  echo "  Examples:" >&2
  echo "    $0 teamA_load_ramp_up" >&2
  echo "    $0 teams/teamA/load/ramp_up/test.js" >&2
  exit 1
fi

# If it's already a path, use it directly
if [[ "$TEST_INPUT" == teams/*/test.js ]] || [[ "$TEST_INPUT" == */test.js ]]; then
  if [ -f "$TEST_INPUT" ]; then
    echo "$TEST_INPUT"
    exit 0
  fi
fi

# Otherwise, try to find by pattern: teamA_load_ramp_up -> teams/teamA/load/ramp_up/test.js
# Pattern: teamA_load_ramp_up -> teamA/load/ramp_up
TEST_FILE=$(echo "$TEST_INPUT" | sed 's/_/\//g' | sed 's/^/teams\//' | sed 's/$/\/test.js/')

if [ -f "$TEST_FILE" ]; then
  echo "$TEST_FILE"
  exit 0
fi

echo "No test file found for '$TEST_INPUT'" >&2
echo "Available tests:" >&2
find teams -name "test.js" -type f | head -10
exit 1
