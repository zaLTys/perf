import { sleep, check } from 'k6';
import { get, validators } from '../../../../shared/http_client.js';

// Configuration
const BASE_URL = __ENV.BASE_URL || 'https://api.open-meteo.com';
const FORECAST_ENDPOINT = '/v1/forecast';

export const options = {
  scenarios: {
    weather_spike: {
      executor: 'ramping-arrival-rate',
      startRate: 1,
      timeUnit: '1s',
      preAllocatedVUs: 50,
      maxVUs: 200,
      stages: [
        { duration: '10s', target: 100 },
        { duration: '30s', target: 100 },
        { duration: '10s', target: 5 },
        { duration: '20s', target: 5 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(90)<2000', 'p(95)<3000', 'p(99)<5000'],
    http_req_failed: ['rate<0.10'],
  },
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
    const env = __ENV.K6_ENV || 'dev';
    console.log(`\n⚡ Starting Weather API Spike Test`);
    console.log(`Environment: ${env}`);
    console.log(`Base URL: ${BASE_URL}`);
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

    const endpoint = `${FORECAST_ENDPOINT}?${queryString}`;

    // Make the request with custom headers
    const response = get(
        BASE_URL,
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
        'response time < 3000ms': (r) => r.timings.duration < 3000, // More lenient for spike
    });

    // Log weather data if successful (only occasionally to avoid spam)
    if (checksPass && __ITER % 20 === 0) {
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

    // Minimal think time for spike test (to maximize load)
    sleep(0.1); // Very short sleep to create spike
}

export function teardown(data) {
    console.log(`\n✅ Weather API Spike Test Complete`);
    console.log(`Started: ${data.startTime}`);
    console.log(`Ended: ${new Date().toISOString()}`);
    console.log(`Tested ${data.citiesCount} different cities\n`);
}
