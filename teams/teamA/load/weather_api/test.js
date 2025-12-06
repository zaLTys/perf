import { sleep, check } from 'k6';
import { get, validators } from '../../../../scenarios/shared/http_client.js';
import { loadConfig } from '../../../../scenarios/shared/config_loader.js';
import { getCurrentEnvironment } from '../../../../scenarios/shared/environment.js';

const scenarioFile = __ENV.SCENARIO_FILE || 'teams/teamA/load/weather_api/config.yaml';
const config = loadConfig(scenarioFile);

export const options = {
    scenarios: config.scenarios,
    thresholds: config.thresholds || {},
    gracefulStop: '30s',
};

// Test data - various cities around the world
const cities = [
    { name: 'London', lat: 51.5074, lon: -0.1278 },
    { name: 'New York', lat: 40.7128, lon: -74.0060 },
    { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
    { name: 'Paris', lat: 48.8566, lon: 2.3522 },
    { name: 'Sydney', lat: -33.8688, lon: 151.2093 },
    { name: 'Berlin', lat: 52.5200, lon: 13.4050 },
    { name: 'Moscow', lat: 55.7558, lon: 37.6173 },
    { name: 'Dubai', lat: 25.2048, lon: 55.2708 },
    { name: 'Singapore', lat: 1.3521, lon: 103.8198 },
    { name: 'Los Angeles', lat: 34.0522, lon: -118.2437 },
];

export function setup() {
    console.log(`\n🌤️  Starting Weather API Load Test`);
    console.log(`Environment: ${getCurrentEnvironment()}`);
    console.log(`Base URL: ${config.base_url}`);
    console.log(`Testing ${cities.length} cities`);
    console.log(`Starting test at: ${new Date().toISOString()}\n`);

    return {
        startTime: new Date().toISOString(),
        citiesCount: cities.length,
    };
}

export default function (data) {
    // Select a random city for this iteration
    const city = cities[Math.floor(Math.random() * cities.length)];

    // Build query string manually (URLSearchParams not available in k6)
    const queryString =
        `latitude=${city.lat}` +
        `&longitude=${city.lon}` +
        `&current_weather=true` +
        `&hourly=temperature_2m,precipitation,windspeed_10m` +
        `&timezone=auto` +
        `&forecast_days=3`;

    const endpoint = `${config.endpoints.forecast}?${queryString}`;

    // Make the request with custom headers
    const response = get(
        config.base_url,
        endpoint,
        {
            'Accept': 'application/json',
            'X-Test-City': city.name,
        }
    );

    // Validate response
    const checksPass = check(response, {
        'status is 200': (r) => r.status === 200,
        'response has current_weather': (r) => {
            try {
                const body = validators.parseJson(r);
                return body.current_weather !== undefined;
            } catch (e) {
                return false;
            }
        },
        'response has hourly data': (r) => {
            try {
                const body = validators.parseJson(r);
                return body.hourly !== undefined && body.hourly.temperature_2m !== undefined;
            } catch (e) {
                return false;
            }
        },
        'response time < 2000ms': (r) => r.timings.duration < 2000,
    });

    // Log weather data if successful (only occasionally to avoid spam)
    if (checksPass && __ITER % 10 === 0) {
        try {
            const weatherData = validators.parseJson(response);
            const current = weatherData.current_weather;
            console.log(
                `📍 ${city.name}: ${current.temperature}°C, ` +
                `Wind: ${current.windspeed} km/h, ` +
                `Response time: ${response.timings.duration.toFixed(0)}ms`
            );
        } catch (e) {
            // Ignore parsing errors in logs
        }
    }

    // Think time between requests (randomized for more realistic load)
    sleep(Math.random() * 2 + 1); // 1-3 seconds
}

export function teardown(data) {
    console.log(`\n✅ Weather API Load Test Complete`);
    console.log(`Started: ${data.startTime}`);
    console.log(`Ended: ${new Date().toISOString()}`);
    console.log(`Tested ${data.citiesCount} different cities\n`);
}
