# k6 Performance PoC

This repository is a proof-of-concept performance testing framework built around k6.

## Key Features

- **Multi-team monorepo** - Tests are organized by team under `teams/`
- **Config-driven** - Tests use YAML for configuration
- **Environment support** - Run tests against dev, staging, or prod
- **HTTP client with retry** - Automatic retries with exponential backoff
- **Shared utilities** - Reusable code for HTTP, auth, validation
- **CI/CD ready** - Jenkins pipelines for validation and execution
- **Observability** - Prometheus + Grafana for metrics

## Prerequisites

- [k6](https://k6.io/docs/get-started/installation/) v0.45.0+
- [Docker](https://docs.docker.com/get-docker/) & Docker Compose (for local metrics)
- [yq](https://github.com/mikefarah/yq) (for YAML validation)
- [Node.js](https://nodejs.org/) v16+ (optional, for npm scripts)

## Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd k6-performance-poc

# Create environment file from template
cp .env.example .env

# Edit .env with your configuration
# Set GF_SECURITY_ADMIN_PASSWORD to a secure password
```

### 2. Start Observability Stack

```bash
# Using npm
npm run docker:up

# Or using docker-compose directly
cd docker
docker-compose up -d

# Access Grafana at http://localhost:3000
# Access Prometheus at http://localhost:9090
```

### 3. Run a Test Locally

```bash
# Basic usage
k6 run \
  -e SCENARIO_FILE=teams/teamA/load/ramp_up/config.yaml \
  teams/teamA/load/ramp_up/test.js

# With environment override
k6 run \
  -e K6_ENV=staging \
  -e SCENARIO_FILE=teams/teamA/load/ramp_up/config.yaml \
  teams/teamA/load/ramp_up/test.js

# With retry configuration
k6 run \
  -e HTTP_RETRY_MAX_ATTEMPTS=5 \
  -e HTTP_RETRY_INITIAL_DELAY=200 \
  -e SCENARIO_FILE=teams/teamA/load/ramp_up/config.yaml \
  teams/teamA/load/ramp_up/test.js
```

## Project Structure

```
k6-performance-poc/
├── teams/                      # Team-specific tests
│   └── [team-name]/
│       └── [test-type]/        # load, smoke, spike, stress, soak
│           └── [test-name]/
│               ├── config.yaml # Test configuration
│               └── test.js     # Test script
├── scenarios/
│   └── shared/                 # Shared utilities
│       ├── config_loader.js    # YAML config loader
│       ├── environment.js      # Environment overrides
│       ├── http_client.js      # HTTP wrapper with retry
│       ├── validators.js       # Config validation
│       └── auth/               # Auth helpers
├── metrics/
│   └── prometheus.js           # Custom metrics
├── docker/                     # Observability stack
│   ├── docker-compose.yml
│   └── prometheus/
├── jenkins/                    # CI/CD scripts
│   ├── Jenkinsfile.validation
│   └── Jenkinsfile.run
└── .env.example               # Environment template
```

## Configuration Guide

### Test Configuration (config.yaml)

```yaml
test_name: "teamA_load_ramp_up"

base_url: "https://test-api.example.com"

# Environment-specific overrides
environments:
  dev:
    base_url: "https://dev-api.example.com"
  staging:
    base_url: "https://staging-api.example.com"
  prod:
    base_url: "https://api.example.com"

endpoints:
  health: "/health"
  users: "/api/v1/users"

scenarios:
  ramp:
    executor: "ramping-vus"
    stages:
      - duration: "1m"
        target: 20
      - duration: "5m"
        target: 20
      - duration: "1m"
        target: 0

thresholds:
  http_req_duration:
    - "p(95)<500"
  success_rate:
    - "rate>0.99"
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `K6_ENV` | Target environment (dev/staging/prod) | `dev` |
| `HTTP_RETRY_MAX_ATTEMPTS` | Max retry attempts | `3` |
| `HTTP_RETRY_INITIAL_DELAY` | Initial delay in ms | `100` |
| `HTTP_RETRY_MAX_DELAY` | Max delay in ms | `5000` |
| `HTTP_RETRY_BACKOFF` | Backoff multiplier | `2` |
| `AUTH_TOKEN` | Bearer token for API auth | - |
| `GF_SECURITY_ADMIN_PASSWORD` | Grafana admin password | `changeme` |

## Using the Enhanced HTTP Client

The HTTP client now supports all methods with automatic retry:

```javascript
import { get, post, put, del, validators } from '../../scenarios/shared/http_client.js';

export default function () {
  // GET request
  const getRes = get(config.base_url, '/api/users');
  
  // POST with body
  const postRes = post(
    config.base_url,
    '/api/users',
    { name: 'John', email: 'john@example.com' }
  );
  
  // PUT with custom headers
  const putRes = put(
    config.base_url,
    '/api/users/123',
    { name: 'Jane' },
    { 'X-Custom-Header': 'value' }
  );
  
  // DELETE
  const delRes = del(config.base_url, '/api/users/123');
  
  // Response validation
  if (validators.isSuccess(getRes)) {
    const data = validators.parseJson(getRes);
    console.log('Users:', data);
  }
}
```

## Jenkins Integration

### Validation Pipeline (`Jenkinsfile.validation`)
- Triggered on: Pull requests / branch updates
- Validates: YAML syntax, config schema, k6 dry-run

### Execution Pipeline (`Jenkinsfile.run`)
- Triggered: Manually or via API
- Parameter: `TEST_NAME` (e.g., `teamA_load_ramp_up`)
- Outputs: Prometheus metrics

Example:
```bash
# Trigger via Jenkins API or UI with parameter:
TEST_NAME=teamA_load_ramp_up
```

## Adding New Tests

### 1. Create Directory Structure
```bash
mkdir -p teams/teamC/load/my_test
```

### 2. Create config.yaml
```yaml
test_name: "teamC_load_my_test"
base_url: "https://api.example.com"
endpoints:
  endpoint1: "/path"
scenarios:
  my_scenario:
    executor: "ramping-vus"
    stages:
      - duration: "30s"
        target: 10
thresholds:
  http_req_duration:
    - "p(95)<1000"
```

### 3. Create test.js
```javascript
import { sleep } from 'k6';
import { get } from '../../../../scenarios/shared/http_client.js';
import { loadConfig } from '../../../../scenarios/shared/config_loader.js';

const scenarioFile = __ENV.SCENARIO_FILE;
const config = loadConfig(scenarioFile);

export const options = {
  scenarios: config.scenarios,
  thresholds: config.thresholds || {},
};

export default function () {
  get(config.base_url, config.endpoints.endpoint1);
  sleep(1);
}
```

## Troubleshooting

### Tests fail with "config file not found"
- Ensure `SCENARIO_FILE` environment variable is set correctly
- Use absolute or relative path from project root

### Retry not working
- Check `HTTP_RETRY_MAX_ATTEMPTS` is set > 1
- Verify error status codes are retryable (408, 429, 500, 502, 503, 504)
- Check console output for retry logs

### Environment overrides not applied
- Ensure `K6_ENV` is set (defaults to 'dev')
- Verify `environments` section exists in config.yaml
- Check console output for loaded environment

### Prometheus metrics not appearing
- Ensure docker stack is running: `docker-compose ps`
- Check Prometheus remote write is enabled
- Verify k6 is using `--out experimental-prometheus-rw`

## Contributing

1. Create feature branch
2. Add/modify tests in appropriate team folder
3. Validate locally: `k6 run --dry-run ...`
4. Submit PR (validation pipeline runs automatically)
5. After approval, tests are available for execution

## License

MIT

