# Weather API Spike Test

## Overview

This spike test validates the Weather API's resilience under sudden, dramatic increases in traffic. It simulates a scenario where load rapidly spikes from baseline to peak levels, then quickly drops back down.

**Based on:** [weather_api load test](../../load/weather_api/)

## Test Type: Spike Test

A spike test evaluates system behavior under sudden, extreme load changes. Unlike gradual load tests, spike tests:
- **Rapidly increase load** from low to very high levels
- **Sustain peak load** for a short period
- **Quickly drop back** to baseline
- **Identify breaking points** and recovery capabilities

## Test Pattern

```
Requests/sec
    100 ┤     ┌───────┐
        │    ╱         ╲
     50 ┤   ╱           ╲
        │  ╱             ╲___
      5 ┤_╱                  ╲___
      0 └─────────────────────────
        0s  10s  40s  50s    70s
```

### Stages
1. **Spike Phase (0-10s)**: Rapid increase from 1 to 100 requests/second
2. **Peak Phase (10-40s)**: Sustain 100 requests/second
3. **Drop Phase (40-50s)**: Sudden drop to 5 requests/second
4. **Recovery Phase (50-70s)**: Monitor recovery at baseline load

## What This Test Validates

✅ **System resilience** under sudden traffic spikes  
✅ **Auto-scaling** response time (if applicable)  
✅ **Error handling** during extreme load  
✅ **Recovery time** after spike subsides  
✅ **Resource management** under stress  

## API Details

- **API Provider**: [Open-Meteo](https://open-meteo.com/) - Free weather API
- **No authentication required**
- **Endpoints tested**:
  - `/v1/forecast` - Weather forecast data

## Test Data

The test randomly queries weather data for 10 major cities worldwide:
- London, UK
- New York, USA
- Tokyo, Japan
- Paris, France
- Sydney, Australia
- Berlin, Germany
- Moscow, Russia
- Dubai, UAE
- Singapore
- Los Angeles, USA

## Thresholds

More lenient than load tests (expecting some degradation under spike):

| Metric | Threshold | Description |
|--------|-----------|-------------|
| p90 response time | < 2000ms | 90th percentile |
| p95 response time | < 3000ms | 95th percentile |
| p99 response time | < 5000ms | 99th percentile |
| Success rate | > 95% | Allow some failures during spike |
| HTTP failures | < 10% | Error rate threshold |

## Running the Test

### Default (using config)
```bash
k6 run teams/teamA/spike/weather_api/test.js
```

### With environment override
```bash
k6 run --env ENVIRONMENT=prod teams/teamA/spike/weather_api/test.js
```


### With Prometheus metrics
```bash
k6 run --out experimental-prometheus-rw teams/teamA/spike/weather_api/test.js
```

## Expected Results

### Healthy System Behavior
- ✅ Most requests succeed even during peak
- ✅ Response times increase but stay within thresholds
- ✅ System recovers quickly after spike ends
- ✅ No cascading failures

### Warning Signs
- ⚠️ Response times spike above 5 seconds
- ⚠️ Error rate exceeds 10%
- ⚠️ Slow recovery after load drops
- ⚠️ Timeouts or connection errors

## Differences from Load Test

| Aspect | Load Test | Spike Test |
|--------|-----------|------------|
| **Load Pattern** | Gradual ramp-up | Sudden spike |
| **Executor** | ramping-vus | ramping-arrival-rate |
| **Duration** | 5 minutes | 70 seconds |
| **Peak Load** | 20 VUs | 100 req/s |
| **Think Time** | 1-3 seconds | 0.1 seconds |
| **Thresholds** | Stricter | More lenient |
| **Purpose** | Normal operations | Breaking point detection |

## Metrics to Monitor

During the spike test, watch for:

1. **Response Time** - Should increase during spike but recover
2. **Error Rate** - Should remain below 10% even at peak
3. **Request Rate** - Should reach ~100 req/s during peak
4. **VU Scaling** - k6 should allocate VUs as needed (up to 200)

## Integration with Monitoring

This test works with:
- **Prometheus** - For metrics collection
- **Grafana** - For visualization (use k6 dashboard)
- **Test ID** - Set via `K6_PROMETHEUS_RW_TREND_AS_NATIVE_HISTOGRAM=true`

## Notes

- Uses the same cities and validation logic as the load test
- Reduced logging frequency (every 20 iterations vs 10) to handle high throughput
- Minimal sleep time (0.1s) to maximize request rate
- Pre-allocates 50 VUs for faster ramp-up
- Max 200 VUs available to handle peak load

## Related Tests

- **Load Test**: [weather_api load](../../load/weather_api/)
- **Other Spike Tests**: [instant_traffic](../instant_traffic/)
