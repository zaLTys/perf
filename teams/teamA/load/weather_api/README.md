# Weather API Load Test

This test demonstrates a real-world load test against a publicly available API.

## API Used

**Open-Meteo Weather API**
- URL: https://api.open-meteo.com
- Documentation: https://open-meteo.com/en/docs
- Free tier: No authentication required, unlimited non-commercial use
- Rate limit: None for reasonable use

## What This Test Does

The test simulates multiple users requesting weather forecasts for various cities around the world:

1. **Ramp Up**: Gradually increases from 0 to 10 virtual users over 30 seconds
2. **Sustain**: Maintains 10 users for 1 minute
3. **Scale**: Ramps up to 20 users over 30 seconds
4. **Peak Load**: Maintains 20 users for 2 minutes
5. **Ramp Down**: Gradually decreases to 0 users over 30 seconds

### Cities Tested
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

## Performance Thresholds

- 95th percentile response time < 2000ms
- 99th percentile response time < 3000ms
- 90th percentile response time < 1000ms
- Success rate > 99%

## Running the Test

### Basic Run (Local)

```bash
# From project root
k6 run \
  -e SCENARIO_FILE=teams/teamA/load/weather_api/config.yaml \
  teams/teamA/load/weather_api/test.js
```

### With Environment Override

```bash
# Run against specific environment (all use same API in this case)
k6 run \
  -e K6_ENV=dev \
  -e SCENARIO_FILE=teams/teamA/load/weather_api/config.yaml \
  teams/teamA/load/weather_api/test.js
```

### With Prometheus Output

```bash
# Send metrics to Prometheus (requires docker stack running)
k6 run \
  --out experimental-prometheus-rw \
  -e SCENARIO_FILE=teams/teamA/load/weather_api/config.yaml \
  teams/teamA/load/weather_api/test.js
```

### With Custom Retry Settings

```bash
# More aggressive retries for unstable network
k6 run \
  -e HTTP_RETRY_MAX_ATTEMPTS=5 \
  -e HTTP_RETRY_INITIAL_DELAY=200 \
  -e SCENARIO_FILE=teams/teamA/load/weather_api/config.yaml \
  teams/teamA/load/weather_api/test.js
```

## Via Jenkins

Set the parameter:
```
TEST_NAME=teamA_load_weather_api
```

## Expected Output

During the test, you'll see:
- Real-time weather data for cities (logged every 10 iterations)
- Request success/failure checks
- Performance metrics
- Final summary with pass/fail thresholds

Example:
```
📍 London: 12.3°C, Wind: 15.2 km/h, Response time: 245ms
📍 Tokyo: 18.7°C, Wind: 8.5 km/h, Response time: 189ms
```

## Understanding Results

### Key Metrics to Watch

1. **http_req_duration**: How long requests take
   - p(95) should be < 2000ms
   - p(90) should be < 1000ms

2. **success_rate**: Percentage of successful requests
   - Should be > 99%

3. **http_reqs**: Total number of requests made
   - Higher is better (indicates good throughput)

4. **checks**: Validation checks passing rate
   - Should be close to 100%

## Customizing the Test

### Change Load Pattern

Edit `config.yaml` stages:
```yaml
stages:
  - duration: "1m"
    target: 50  # More users
  - duration: "5m"
    target: 50  # Longer sustain period
```

### Add More Cities

Edit `test.js` cities array:
```javascript
const cities = [
  { name: 'Rome', lat: 41.9028, lon: 12.4964 },
  // Add more...
];
```

### Adjust Think Time

In `test.js`, change the sleep duration:
```javascript
sleep(Math.random() * 5 + 2); // 2-7 seconds instead of 1-3
```

## Troubleshooting

### Test fails with network errors
- Check internet connection
- Increase retry attempts: `-e HTTP_RETRY_MAX_ATTEMPTS=5`
- The API might be temporarily down (rare)

### Thresholds fail
- Normal for first run if network is slow
- Adjust thresholds in `config.yaml` to match your network conditions
- The API typically responds in 100-500ms from most locations

### Rate limiting
- Open-Meteo has generous rate limits
- If you hit limits, reduce VUs or increase think time

## Next Steps

After running this test successfully, you can:
1. Create similar tests for your own APIs
2. Adjust the load pattern to match your expected traffic
3. Add more complex scenarios (authentication, POST requests, etc.)
4. Set up continuous monitoring with Grafana
