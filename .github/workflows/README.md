# GitHub Actions Workflows

## Run Performance Test

Manually trigger performance tests from GitHub UI.

### Usage

1. Go to **Actions** → **Run Performance Test** → **Run workflow**
2. Select test from dropdown
3. (Optional) Enter Grafana URL
4. Click **Run workflow**

### Updating Test List

When adding new tests, update the `test_name` dropdown options in `.github/workflows/run-test.yml`:

```yaml
options:
  - teamA_load_weather_api
  - teamA_smoke_health_check
  # Add new tests here
```

Or use this command to generate the list:
```bash
find teams -name "test.js" -type f | sed 's|teams/||' | sed 's|/test.js||' | sed 's|/|_|g' | sort
```

### Grafana Links

For Grafana dashboard links to work in GitHub Actions:

1. **Use a tunnel** (recommended for local Grafana):
   ```bash
   # Using ngrok
   ngrok http 3000
   # Use the ngrok URL in workflow input
   ```

2. **Use hosted Grafana** (Cloud Grafana, Grafana Cloud, etc.)

3. **Access locally** - Links won't work, but you can manually open Grafana and filter by test ID

