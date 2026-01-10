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

# Otherwise, try to find by pattern: teamA_load_weather_api -> teams/teamA/load/weather_api/test.js
# Split by first two underscores only: teamA_load_weather_api -> teamA/load/weather_api
IFS='_' read -ra PARTS <<< "$TEST_INPUT"
if [ ${#PARTS[@]} -ge 3 ]; then
  TEAM="${PARTS[0]}"
  TEST_TYPE="${PARTS[1]}"
  # Join remaining parts (from index 2 onwards) with underscore for test name
  shift=2
  TEST_NAME_JOINED=$(IFS='_'; echo "${PARTS[*]:$shift}")
  TEST_FILE="teams/${TEAM}/${TEST_TYPE}/${TEST_NAME_JOINED}/test.js"
else
  echo "Invalid test name format. Expected: teamName_testType_testName" >&2
  exit 1
fi

if [ -f "$TEST_FILE" ]; then
  echo "$TEST_FILE"
  exit 0
fi

echo "No test file found for '$TEST_INPUT'" >&2
echo "Available tests:" >&2
find teams -name "test.js" -type f | head -10
exit 1
