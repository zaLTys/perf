# Weather API Spike Test

## Purpose
- Tests API resilience under sudden traffic spikes
- Validates system behavior during rapid load changes
- Identifies breaking points and recovery capabilities

## Test Type
**Spike Test** - Rapid increase to peak load, then sudden drop

## Expected Outcome
- **Peak RPS**: ~100 req/s
- **Response Time**: p95 < 3000ms, p99 < 5000ms (more lenient)
- **Success Rate**: > 95% (allows some degradation during spike)
- **Duration**: ~70 seconds
