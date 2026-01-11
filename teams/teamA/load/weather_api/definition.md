# Weather API Load Test

## Purpose
- Simulates realistic user load against Open-Meteo Weather API
- Tests API performance under sustained moderate load
- Validates response times and success rates

## Test Type
**Load Test** - Gradual ramp-up with sustained load

## Expected Outcome
- **Peak RPS**: ~10 req/s (20 VUs)
- **Response Time**: p95 < 2000ms, p99 < 3000ms
- **Success Rate**: > 99%
- **Duration**: ~4.5 minutes
