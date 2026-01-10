import { check } from 'k6';
import http from 'k6/http';
import encoding from 'k6/encoding';
import { computeHmacSignature } from '../../common/hmacCalculator.js';

export function postAdyenCallback(hmacSecret) {
    const randomPaymentId = Math.floor(Math.random() * 999999999) + 100000000;
    const randomAccountId = Math.floor(Math.random() * 9999999999) + 1000000000;
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 30, 0, 0);
    const tomorrowISO = tomorrow.toISOString().replace('Z', '+02:00');
    
    const payload = {
        "data": {
            "amount": { "currency": "EUR", "value": 200 },
            "balanceAccount": {
                "description": `Segregated Bank Account ${randomAccountId}`,
                "id": ``,
                "reference": `Segregated Bank Account ${randomAccountId}`
            },
            "balancePlatform": "VintedPay_UAB",
            "category": "internal",
            "description": `payment-${randomPaymentId}`,
            "direction": "incoming",
            "reference": `payment-${randomPaymentId}`,
            "status": "captured",
            "type": "capture",
            "events": [
                {
                    "status": "captured",
                    "valueDate": tomorrowISO
                }
            ]
        },
        "type": "balancePlatform.transfer.updated"
    };

    const payloadString = JSON.stringify(payload);
    const hmacSignature = computeHmacSignature(payloadString, hmacSecret);
    
    const response = http.post(__ENV.WEBHOOK_URL, payloadString, {
        headers: {
            'Content-Type': 'application/json',
            'HmacSignature': hmacSignature,
            'Authorization': 'Basic ' + encoding.b64encode(`${__ENV.ADYEN_AUTHENTICATION_USERNAME}:${__ENV.ADYEN_AUTHENTICATION_PASSWORD}`)
        }
    });

    check(response, {
        'Webhook status is 2xx': (r) => r.status >= 200 && r.status < 300,
    });

    if (response.status !== 200) {
        console.log(`Body: ${response.body}`);
    }

    return response;
}