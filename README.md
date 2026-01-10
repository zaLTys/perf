# Performance Testing Framework

Multi-team monorepo for k6 performance testing with shared utilities, CI/CD integration, and observability.

## Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- [k6](https://k6.io/docs/get-started/installation/) v0.45.0+ (optional, Docker recommended)

### Setup

```bash
# Clone repository
git clone <repository-url>
cd perf

# Start observability stack
npm run docker:up
# Or: cd docker && docker-compose up -d

# Wait ~15 seconds for Grafana to initialize
```

### Run Your First Test

```bash
# Using Docker (recommended)
./scripts/run-test.sh teamA_load_weather_api

# Or locally
k6 run --tag testid=teamA_load_weather_api teams/teamA/load/weather_api/test.js
```

**Expected Output:**
```
🚀 Running k6 test: teamA_load_ramp_up
📁 Finding test script...
✓ Found test script: teams/teamA/load/ramp_up/test.js

▶️  Starting k6 test...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

          /\      |‾‾| /‾‾/   /‾‾/
     /\  /  \     |  |/  /   /  /
    /  \/    \    |     (   /   ‾‾\
   /          \   |  |\  \ |  (‾)  |
  / __________ \  |__| \__\ \_____/ .io

     execution: local
     script: teams/teamA/load/weather_api/test.js
     output: prometheus (http://prometheus:9090/api/v1/write)

  scenarios: (100.00%) 1 scenario, 20 max VUs, 4m30s max duration
           ✓ weather_load: 0 looping VUs for 4m30s

     ✓ http_req_duration...........: avg=245ms min=120ms med=230ms max=890ms p(95)=450ms
     ✓ http_req_failed.............: 0.00% ✓ 0%
     ✓ http_reqs..................: 420 7.0/s

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Test completed!
📊 View results in Grafana: http://localhost:3000
```

### View Results

- **Grafana**: http://localhost:3000 (admin/changeme)
- **Prometheus**: http://localhost:9090

The k6 dashboard is automatically provisioned in Grafana. Use the **testid** filter at the top to select your test by name (e.g., `teamA_load_weather_api`).

## Project Structure

```
perf/
├── teams/                    # Team-specific tests
│   └── [team-name]/
│       └── [test-type]/      # load, smoke, spike, stress, soak
│           └── [test-name]/
│               └── test.js
├── shared/                   # Shared utilities
│   ├── http_client.js        # HTTP client with retry
│   ├── config_loader.js      # Config loader & validator
│   ├── validators.js         # Validation helpers
│   └── auth/                 # Authentication helpers
├── scripts/                  # Local development scripts
│   └── run-test.sh
├── .ci/                      # CI/CD configuration
│   └── jenkins/              # Jenkins pipelines
├── docker/                   # Observability stack
│   └── docker-compose.yml
└── README.md
```

## Running Tests

### Using Docker (Recommended)

```bash
# Run specific test
./scripts/run-test.sh teamA_load_ramp_up

# List available tests
find teams -name test.js
```

### Using k6 Directly

```bash
# Basic run
k6 run --tag testid=teamA_load_weather_api teams/teamA/load/weather_api/test.js

# With environment override
k6 run --tag testid=teamA_load_weather_api -e K6_ENV=staging teams/teamA/load/weather_api/test.js

# With custom retry settings
k6 run \
  --tag testid=teamA_load_weather_api \
  -e HTTP_RETRY_MAX_ATTEMPTS=5 \
  -e HTTP_RETRY_INITIAL_DELAY=200 \
  teams/teamA/load/weather_api/test.js
```

### Expected Test Output

```
✓ Loaded config: teamA_load_ramp_up (environment: dev)
  Base URL: https://test-api.example.com

     ✓ http_req_duration...........: avg=245ms min=120ms med=230ms max=890ms p(95)=450ms
     ✓ http_req_failed.............: 0.00% ✓ 0%
     ✓ http_reqs..................: 420 7.0/s
     ✓ vus.........................: 20   min=0 max=20
     ✓ vus_max.....................: 20   min=20 max=20

     checks.........................: 100.00% ✓ 420 ✗ 0
```

## Creating a Test

### 1. Create Directory

```bash
mkdir -p teams/yourTeam/load/my_test
cd teams/yourTeam/load/my_test
```

### 2. Create test.js

```javascript
import { sleep } from 'k6';
import { get } from '../../../../shared/http_client.js';
import { loadConfig } from '../../../../shared/config_loader.js';

const config = loadConfig({
  test_name: "yourTeam_load_my_test",
  base_url: "https://api.example.com",
  endpoints: {
    health: "/health"
  },
  scenarios: {
    ramp: {
      executor: "ramping-vus",
      stages: [
        { duration: "30s", target: 10 },
        { duration: "1m", target: 10 },
        { duration: "30s", target: 0 }
      ]
    }
  },
  thresholds: {
    http_req_duration: ["p(95)<1000"]
  }
});

export const options = {
  scenarios: config.scenarios,
  thresholds: config.thresholds
};

export default function () {
  get(config.base_url, config.endpoints.health);
  sleep(1);
}
```

### 3. Validate & Run

```bash
# Validate (runs for 1 second with 0 VUs to check syntax)
k6 run --duration 1s --vus 0 teams/yourTeam/load/my_test/test.js

# Run (test name will appear in Grafana filter)
./scripts/run-test.sh yourTeam_load_my_test
```

## Using Shared Utilities

### HTTP Client

```javascript
import { get, post, put, del, validators } from '../../../../shared/http_client.js';

export default function () {
  // GET request
  const res = get(config.base_url, '/api/users');
  
  // POST with body
  const createRes = post(config.base_url, '/api/users', { name: 'John' });
  
  // Response validation
  if (validators.isSuccess(res)) {
    const data = validators.parseJson(res);
    console.log('Users:', data);
  }
}
```

### Environment Configuration

```javascript
const config = loadConfig({
  base_url: "https://default-api.example.com",
  environments: {
    dev: { base_url: "https://dev-api.example.com" },
    staging: { base_url: "https://staging-api.example.com" },
    prod: { base_url: "https://api.example.com" }
  }
});
```

Run with: `k6 run -e K6_ENV=staging teams/.../test.js`

## CI/CD

### Jenkins Pipelines

**Location:** `.ci/jenkins/`

- **Validation Pipeline**: Runs on PRs, validates all tests
- **Execution Pipeline**: Run tests via Jenkins UI with `TEST_NAME` parameter

```bash
# Trigger via Jenkins API
TEST_NAME=teamA_load_ramp_up
```

## Troubleshooting

### Docker container not running
```bash
cd docker && docker-compose up -d
```

### No metrics in Grafana
1. Verify Prometheus: http://localhost:9090
2. Check test uses `--out experimental-prometheus-rw`
3. Wait 10-20 seconds after test starts
4. Refresh Grafana dashboard

### Config validation failed
- Ensure required fields: `test_name`, `base_url`, `scenarios`
- `test_name` must be alphanumeric with underscores/hyphens only
- `base_url` must start with `http://` or `https://`

### Test not found
```bash
# List available tests
find teams -name test.js

# Check test name format: teamName_testType_testName
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `K6_ENV` | Target environment (dev/staging/prod) | `dev` |
| `HTTP_RETRY_MAX_ATTEMPTS` | Max retry attempts | `3` |
| `HTTP_RETRY_INITIAL_DELAY` | Initial delay in ms | `100` |
| `AUTH_TOKEN` | Bearer token for API auth | - |

## Contributing

1. Create feature branch
2. Add/modify tests in appropriate team folder
3. Validate: `k6 run --duration 1s --vus 0 teams/.../test.js`
4. Submit PR (validation runs automatically)

## License

MIT
