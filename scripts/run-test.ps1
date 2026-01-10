# Run k6 Test in Docker Container
# Usage: .\run-test.ps1 <test_name>
# Example: .\run-test.ps1 teamA_load_weather_api

param(
    [Parameter(Mandatory=$false)]
    [string]$TestName = "teamA_load_weather_api"
)

Write-Host "🚀 Running k6 test: $TestName" -ForegroundColor Green
Write-Host ""

# Find the test.js file
Write-Host "📁 Finding test script..." -ForegroundColor Cyan
$testJs = docker exec k6 sh -c "grep -Rsl `"test_name.*\\`"$TestName\\`"`" /workspace/teams/ --include='*.js' | head -1" 2>$null

if ([string]::IsNullOrWhiteSpace($testJs)) {
    Write-Host "❌ No test found with test_name='$TestName'" -ForegroundColor Red
    Write-Host ""
    Write-Host "Available tests:" -ForegroundColor Yellow
    docker exec k6 sh -c "grep -r 'test_name' /workspace/teams/ --include='*.js' | sed 's/:.*test_name.*:/:/' | head -20"
    exit 1
}

Write-Host "✓ Found test script: $testJs" -ForegroundColor Green
Write-Host ""

# Run the test
Write-Host "▶️  Starting k6 test..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

docker exec k6 k6 run `
    --out experimental-prometheus-rw `
    $testJs

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "✅ Test completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 View results in Grafana: http://localhost:3000" -ForegroundColor Cyan
