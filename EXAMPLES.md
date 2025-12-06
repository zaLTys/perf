# Creating a Sample Test with Environment Support

This example shows how to use the new environment configuration and enhanced HTTP client.

## Example: config.yaml with Environment Overrides

```yaml
test_name: "teamA_load_ramp_up_example"

# Default base URL
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
  posts: "/api/v1/posts"

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

## Example: test.js Using All HTTP Methods

```javascript
import { sleep } from 'k6';
import { get, post, put, del, validators } from '../../../../scenarios/shared/http_client.js';
import { loadConfig } from '../../../../scenarios/shared/config_loader.js';
import { getCurrentEnvironment } from '../../../../scenarios/shared/environment.js';

const scenarioFile = __ENV.SCENARIO_FILE || 'teams/teamA/load/ramp_up/config.yaml';
const config = loadConfig(scenarioFile);

export const options = {
  scenarios: config.scenarios,
  thresholds: config.thresholds || {},
  gracefulStop: '30s',
};

export function setup() {
  console.log(`Running in ${getCurrentEnvironment()} environment`);
  console.log(`Base URL: ${config.base_url}`);
  return { startTime: new Date().toISOString() };
}

export default function (data) {
  // Health check
  const healthRes = get(config.base_url, config.endpoints.health);
  
  if (!validators.isSuccess(healthRes)) {
    console.error('Health check failed!');
    return;
  }
  
  // Get users list
  const usersRes = get(config.base_url, config.endpoints.users);
  
  if (validators.isSuccess(usersRes)) {
    const users = validators.parseJson(usersRes);
    console.log(`Retrieved ${users.length} users`);
  }
  
  // Create a new post
  const newPost = {
    title: 'Test Post',
    body: 'This is a test post from k6',
    userId: 1,
  };
  
  const createRes = post(
    config.base_url,
    config.endpoints.posts,
    newPost,
    { 'X-Request-Id': `k6-${__VU}-${__ITER}` }
  );
  
  if (validators.isSuccess(createRes)) {
    const created = validators.parseJson(createRes);
    const postId = created.id;
    
    // Update the post
    const updateRes = put(
      config.base_url,
      `${config.endpoints.posts}/${postId}`,
      { title: 'Updated Title' }
    );
    
    // Delete the post
    if (validators.isSuccess(updateRes)) {
      del(config.base_url, `${config.endpoints.posts}/${postId}`);
    }
  }
  
  sleep(1);
}

export function teardown(data) {
  console.log(`Test started at: ${data.startTime}`);
  console.log(`Test completed at: ${new Date().toISOString()}`);
}
```

## Running the Example

```bash
# Run against dev (default)
k6 run \
  -e SCENARIO_FILE=teams/teamA/load/ramp_up/config.yaml \
  teams/teamA/load/ramp_up/test.js

# Run against staging
k6 run \
  -e K6_ENV=staging \
  -e SCENARIO_FILE=teams/teamA/load/ramp_up/config.yaml \
  teams/teamA/load/ramp_up/test.js

# Run against prod with custom retry settings
k6 run \
  -e K6_ENV=prod \
  -e HTTP_RETRY_MAX_ATTEMPTS=5 \
  -e HTTP_RETRY_INITIAL_DELAY=200 \
  -e SCENARIO_FILE=teams/teamA/load/ramp_up/config.yaml \
  teams/teamA/load/ramp_up/test.js

# With authentication
k6 run \
  -e K6_ENV=staging \
  -e AUTH_TOKEN=your-bearer-token-here \
  -e SCENARIO_FILE=teams/teamA/load/ramp_up/config.yaml \
  teams/teamA/load/ramp_up/test.js
```
