# Run k6 Test in Docker Container
# Usage: .\run-test.ps1 <test_name>
# Example: .\run-test.ps1 teamA_load_weather_api

param(
    [Parameter(Mandatory=$false)]
    [string]$TestName = "teamA_load_weather_api"
)

Write-Host "🚀 Running k6 test: $TestName" -ForegroundColor Green
Write-Host ""

# Find the config file
Write-Host "📁 Finding test configuration..." -ForegroundColor Cyan
$configPath = docker exec k6 sh -c "grep -Rsl 'test_name: `"$TestName`"' /workspace/teams/ 2>/dev/null || true"

if ([string]::IsNullOrWhiteSpace($configPath)) {
    Write-Host "❌ No test found with test_name='$TestName'" -ForegroundColor Red
    Write-Host ""
    Write-Host "Available tests:" -ForegroundColor Yellow
    docker exec k6 sh -c "find /workspace/teams -name 'config.yaml' -exec grep -H 'test_name:' {} \;"
    exit 1
}

Write-Host "✓ Found config: $configPath" -ForegroundColor Green

# Find the test.js file
$testDir = docker exec k6 sh -c "dirname $configPath"
$testJs = "$testDir/test.js"

Write-Host "✓ Using test script: $testJs" -ForegroundColor Green
Write-Host ""

# Run the test
Write-Host "▶️  Starting k6 test..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

docker exec k6 k6 run `
    --out experimental-prometheus-rw `
    -e SCENARIO_FILE=$configPath `
    $testJs

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "✅ Test completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 View results in Grafana: http://localhost:3000" -ForegroundColor Cyan
