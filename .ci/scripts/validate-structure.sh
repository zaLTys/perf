#!/bin/bash
# Validation script to ensure all scenarios follow the required structure:
# teams/<team-name>/<test-type>/<scenario>/ with test.js containing inline config

set -euo pipefail

ERRORS=0
WARNINGS=0

echo "Validating team test structure..."
echo "Expected pattern: teams/<team-name>/<test-type>/<scenario>/"
echo ""

# Find all scenario directories (3 levels deep: team/test-type/scenario)
SCENARIOS=$(find teams -type d -mindepth 3 -maxdepth 3 | sort)

if [ -z "$SCENARIOS" ]; then
  echo "ERROR: No scenarios found in teams/ directory"
  exit 1
fi

# Valid test types
VALID_TEST_TYPES="smoke baseline load stress soak spike"

for SCENARIO_DIR in $SCENARIOS; do
  # Extract components from path: teams/teamA/load/ramp_up -> teamA, load, ramp_up
  IFS='/' read -ra PARTS <<< "$SCENARIO_DIR"
  TEAM_NAME="${PARTS[1]}"
  TEST_TYPE="${PARTS[2]}"
  SCENARIO_NAME="${PARTS[3]}"
  
  # Validate test type
  if ! echo "$VALID_TEST_TYPES" | grep -qw "$TEST_TYPE"; then
    echo "ERROR: Invalid test type '$TEST_TYPE' in $SCENARIO_DIR"
    echo "  Valid types: $VALID_TEST_TYPES"
    ERRORS=$((ERRORS + 1))
  fi
  
  # Check for required test.js file
  TEST_FILE="$SCENARIO_DIR/test.js"
  
  if [ ! -f "$TEST_FILE" ]; then
    echo "ERROR: Missing test.js in $SCENARIO_DIR"
    ERRORS=$((ERRORS + 1))
    continue
  fi
  
  # Validate test.js exports options
  if ! grep -q "export const options" "$TEST_FILE" 2>/dev/null; then
    echo "ERROR: test.js in $SCENARIO_DIR missing 'export const options'"
    ERRORS=$((ERRORS + 1))
  fi
  
  # Validate test.js has scenarios
  if ! grep -q "scenarios:" "$TEST_FILE" 2>/dev/null; then
    echo "ERROR: test.js in $SCENARIO_DIR missing 'scenarios' in options"
    ERRORS=$((ERRORS + 1))
  fi
  
  # Check for unexpected files at scenario level (warn only)
  # Note: config.yaml files are no longer used - config is inline in test.js
  UNEXPECTED_FILES=$(find "$SCENARIO_DIR" -maxdepth 1 -type f ! -name "test.js" ! -name "README.md" ! -name "*.md" ! -name "config.yaml")
  if [ -n "$UNEXPECTED_FILES" ]; then
    echo "WARNING: Unexpected files in $SCENARIO_DIR:"
    echo "$UNEXPECTED_FILES" | sed 's/^/  /'
    WARNINGS=$((WARNINGS + 1))
  fi
done

echo ""
echo "Validation complete!"
echo "  Scenarios checked: $(echo "$SCENARIOS" | wc -l | tr -d ' ')"
echo "  Errors: $ERRORS"
echo "  Warnings: $WARNINGS"

if [ $ERRORS -gt 0 ]; then
  echo ""
  echo "FAILED: Structure validation found $ERRORS error(s)"
  exit 1
fi

echo ""
echo "SUCCESS: All scenarios follow the required structure"
exit 0

