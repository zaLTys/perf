# Auto-Provisioned Grafana Setup

## What's Configured

When you start the Docker stack, Grafana will automatically:
1. ✅ Configure Prometheus datasource (no manual setup needed!)
2. ✅ Load the official k6 dashboard (Dashboard ID 19665)
3. ✅ Be ready to view metrics immediately

## Quick Start

### Step 1: Restart Docker Stack

If you already have the stack running, restart it to pick up the changes:

```powershell
cd c:\Projects\Learning\k6-performance-poc\docker
docker-compose down
docker-compose up -d
```

Or if starting fresh:
```powershell
cd c:\Projects\Learning\k6-performance-poc\docker
docker-compose up -d
```

### Step 2: Open Grafana

```
http://localhost:3000
```

**Login:**
- Username: `admin`
- Password: `changeme` (or your custom password from `.env`)

### Step 3: View the Dashboard

1. Click **☰** (menu) → **Dashboards**
2. You should see **"k6 Prometheus (Native Histograms)"** already there!
3. Click on it to open

### Step 4: Run Your Test

```powershell
cd c:\Projects\Learning\k6-performance-poc

k6 run --out experimental-prometheus-rw teams/teamA/load/weather_api/test.js
```

**Watch the dashboard update in real-time!** 🎉

## What's Provisioned

### Files Created:
```
docker/grafana/provisioning/
├── datasources/
│   └── prometheus.yml          # Auto-configures Prometheus
├── dashboards/
│   ├── dashboard-provider.yml  # Dashboard loading config
│   └── k6-dashboard.json       # Official k6 dashboard from grafana.com
```

### Datasource Configuration
- **Name:** Prometheus
- **Type:** prometheus
- **URL:** http://prometheus:9090
- **Default:** Yes
- **Access:** proxy

### Dashboard
- **Source:** grafana.com dashboard #19665
- **Name:** k6 Prometheus (Native Histograms)
- **Features:**
  - HTTP request duration (with percentiles)
  - Request rate
  - Virtual Users (VUs) over time
  - Checks and errors
  - Data sent/received
  - Iteration duration
  - And much more!

## Benefits

✅ **No manual setup** - Everything works out of the box
✅ **Consistent** - Same setup for all team members
✅ **Version controlled** - Dashboard configs in Git
✅ **Quick starts** - New developers can start immediately

## Troubleshooting

### Dashboard not showing?
1. Wait 10-15 seconds after starting Grafana (provisioning takes a moment)
2. Refresh your browser
3. Check Grafana logs: `docker-compose logs grafana`

### No data in dashboard?
1. Ensure Prometheus is running: `docker-compose ps`
2. Verify your k6 test is using `--out experimental-prometheus-rw`
3. Check Prometheus is receiving data: http://localhost:9090 → query `http_reqs`
4. Wait a few seconds, data appears with ~5-10 second delay

### Want to customize the dashboard?
1. The dashboard is editable in Grafana UI
2. Changes are NOT saved to the JSON file automatically
3. To save changes permanently:
   - Export from Grafana UI (Share → Export → Save to file)
   - Replace `docker/grafana/provisioning/dashboards/k6-dashboard.json`
   - Restart Grafana: `docker-compose restart grafana`

## Adding More Dashboards

To add additional dashboards:

1. Download dashboard JSON from grafana.com
2. Save to: `docker/grafana/provisioning/dashboards/`
3. Restart Grafana: `docker-compose restart grafana`

Example:
```powershell
# Download another dashboard (e.g., 18030)
Invoke-WebRequest -Uri "https://grafana.com/api/dashboards/18030/revisions/1/download" -OutFile "docker\grafana\provisioning\dashboards\another-dashboard.json"

# Restart Grafana
docker-compose restart grafana
```

## Next Steps

- Run your tests and explore the visualizations
- Create alerts based on thresholds
- Share dashboard screenshots with your team
- Export results for reports
