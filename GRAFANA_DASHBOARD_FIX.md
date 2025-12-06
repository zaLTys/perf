# Quick Fix for Grafana Dashboard

## The Issue
The metrics from k6 have a `k6_` prefix (e.g., `k6_http_reqs_total`) but the imported dashboard expects metrics without the prefix.

## Quick Solution: Create a Simple Custom Dashboard

1. In Grafana, click **☰** → **Dashboards** → **New** → **New Dashboard**
2. Click **Add visualization**
3. Select **Prometheus** datasource
4. Use these queries for each panel:

### Panel 1: HTTP Requests Rate
```
rate(k6_http_reqs_total[1m])
```

### Panel 2: HTTP Request Duration (p95)
```
histogram_quantile(0.95, rate(k6_http_req_duration_seconds_bucket[1m]))
```

### Panel 3: Success Rate
```
rate(k6_checks_total{check="status is 200"}[1m]) / rate(k6_checks_total[1m])
```

### Panel 4: Virtual Users
```
k6_vus
```

## OR: Use Pre-made Dashboard

I'll create a working dashboard JSON for you in the next step. Just import it!

## Available Metrics in Prometheus

Based on your screenshot, you have:
- `k6_http_req_duration_seconds` - Response time histogram
- `k6_http_reqs_total` - Total HTTP requests
- `k6_http_req_failed_total` - Failed requests
- `k6_checks_total` - Check results
- `k6_vus` - Virtual users
- And many more timing metrics
