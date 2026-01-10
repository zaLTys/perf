import { authenticate } from '../common/getAuthToken.js';
import { postBalanceAccount } from '../api/balance_accounts/postBalanceAccount.js';
import { postTransfersRandomDestination } from '../api/transfers/postTransfersRandomDestination.js';

export const options = {
    stages: [
        { duration: '1m', target: 1 },
        { duration: '1m', target: 2 },
        { duration: '1m', target: 3 },
        { duration: '1m', target: 4 },
        { duration: '1m', target: 5 },
        { duration: '1m', target: 6 },
        { duration: '1m', target: 7 },
        { duration: '1m', target: 8 },
        { duration: '1m', target: 9 },
        { duration: '1m', target: 10 },
        { duration: '1m', target: 12 },
        { duration: '1m', target: 14 },
        { duration: '1m', target: 16 },
        { duration: '1m', target: 18 },
        { duration: '1m', target: 20 },
        { duration: '1m', target: 22 },
        { duration: '1m', target: 24 },
        { duration: '1m', target: 26 },
        { duration: '1m', target: 28 },
        { duration: '1m', target: 30 },
    ],
};

export default function () {
    const accessToken = authenticate();
    postTransfersRandomDestination(accessToken);
}
