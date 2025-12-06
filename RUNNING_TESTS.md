# Running k6 Tests

## Three Ways to Run Tests

### 1. 🐳 Using Docker Container (Recommended - No k6 Install Needed!)

This is the easiest way and works exactly like Jenkins will run it in production.

**Run a specific test:**
```powershell
# From project root
.\run-test.ps1 teamA_load_weather_api
```

**Or manually with docker exec:**
```powershell
docker exec k6 k6 run --out experimental-prometheus-rw -e SCENARIO_FILE=/workspace/teams/teamA/load/weather_api/config.yaml /workspace/teams/teamA/load/weather_api/test.js
```

### 2. 🔧 Install k6 Locally (Optional)

If you want to run k6 directly on your machine:

**Windows (using Chocolatey):**
```powershell
choco install k6
```

**Windows (using winget):**
```powershell
winget install k6 --source winget
```

**Or download installer:** https://k6.io/docs/get-started/installation/

Then run:
```powershell
k6 run --out experimental-prometheus-rw -e SCENARIO_FILE=teams/teamA/load/weather_api/config.yaml teams/teamA/load/weather_api/test.js
```

### 3. 🏭 Via Jenkins Pipeline (Production)

In your Jenkins instance, the `Jenkinsfile.run` pipeline will:
1. Accept a `TEST_NAME` parameter (e.g., `teamA_load_weather_api`)
2. Find the corresponding config and test files
3. Run k6 with Prometheus output
4. Send metrics to your Prometheus instance

**To trigger:**
- Go to Jenkins
- Select the "k6-performance-run" job
- Click "Build with Parameters"
- Enter `TEST_NAME`: `teamA_load_weather_api`
- Click "Build"

---

## Quick Start Guide

### Step 1: Start Docker Stack
```powershell
cd c:\Projects\Learning\k6-performance-poc\docker
docker-compose up -d
```

Wait 10-15 seconds for Grafana to initialize.

### Step 2: Open Grafana
Go to: http://localhost:3000
- Username: `admin`
- Password: `changeme`

The k6 dashboard should already be loaded!

### Step 3: Run Test
```powershell
cd c:\Projects\Learning\k6-performance-poc
.\run-test.ps1 teamA_load_weather_api
```

### Step 4: Watch Metrics in Grafana
Refresh the dashboard and watch the real-time metrics! 📊

---

## Available Tests

List all available tests:
```powershell
docker exec k6 sh -c "find /workspace/teams -name 'config.yaml' -exec grep -H 'test_name:' {} \;"
```

Current tests:
- `teamA_load_ramp_up` - Basic ramp-up load test
- `teamA_smoke_health_check` - Smoke test
- `teamA_spike_instant_traffic` - Spike test
- `teamA_stress_peak_load` - Stress test
- `teamA_load_weather_api` - **Weather API load test (ready to run!)**
- `teamB_load_search_load` - Search load test
- `teamB_soak_endurance` - Soak/endurance test

---

## Troubleshooting

### "k6: command not found" or "k6 is not recognized"
✅ **Use the Docker method!** No k6 installation needed:
```powershell
.\run-test.ps1 teamA_load_weather_api
```

### "Container k6 is not running"
Start the Docker stack:
```powershell
cd docker
docker-compose up -d
```

### No metrics in Grafana
1. Verify Prometheus is running: http://localhost:9090
2. In Prometheus, search for `http_reqs` - should show data
3. Wait 10-20 seconds after test starts
4. Refresh Grafana dashboard

### Test fails with "config file not found"
The paths in the container use `/workspace/` prefix:
```powershell
# Correct
docker exec k6 k6 run -e SCENARIO_FILE=/workspace/teams/teamA/load/weather_api/config.yaml /workspace/teams/teamA/load/weather_api/test.js

# Incorrect (missing /workspace)
docker exec k6 k6 run -e SCENARIO_FILE=teams/teamA/load/weather_api/config.yaml teams/teamA/load/weather_api/test.js
```

But the `run-test.ps1` script handles this automatically!

---

## Advanced Usage

### Run with custom environment
```powershell
docker exec k6 k6 run `
  -e K6_ENV=staging `
  -e HTTP_RETRY_MAX_ATTEMPTS=5 `
  -e SCENARIO_FILE=/workspace/teams/teamA/load/weather_api/config.yaml `
  /workspace/teams/teamA/load/weather_api/test.js
```

### Run with more virtual users (override config)
```powershell
docker exec k6 k6 run `
  --vus 50 `
  --duration 5m `
  -e SCENARIO_FILE=/workspace/teams/teamA/load/weather_api/config.yaml `
  /workspace/teams/teamA/load/weather_api/test.js
```

### Save results to file
```powershell
docker exec k6 k6 run `
  --out json=/workspace/results.json `
  --out experimental-prometheus-rw `
  -e SCENARIO_FILE=/workspace/teams/teamA/load/weather_api/config.yaml `
  /workspace/teams/teamA/load/weather_api/test.js
```

---

## Production Deployment

In production, you would:

1. **Use Jenkins Pipeline** - The `Jenkinsfile.run` already configured
2. **Dedicated k6 runners** - Separate machines/containers for load generation
3. **Central Prometheus** - Shared Prometheus for all tests
4. **Persistent Grafana** - With saved dashboards and alerts
5. **Results archival** - Store test results in S3/blob storage
6. **Notifications** - Slack/email alerts on failures

The local Docker setup mimics this production architecture!
