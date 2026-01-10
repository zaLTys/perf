import { authenticate, getCacheStatus, makeApiCallWithRetry } from '../common/getAuthToken.js';

import { getTransfers as getTransfersApi } from '../api/transfers/getTransfers.js';
import { postTransfersRandomSourceRandomDestination as postTransfersApi } from '../api/transfers/postTransfersRandomSourceRandomDestination.js';
import { postTransfersMarketplaceEscrowFromRandom as postTransfersMarketplaceEscrowFromRandomApi } from '../api/transfers/postTransfersMarketplaceEscrowFromRandom.js';
import { postTransfersMarketplaceEscrowToMain as postTransfersMarketplaceEscrowToMainApi } from '../api/transfers/postTransfersMarketplaceEscrowToMain.js';
import { postTransfersMarketplaceEscrowFromIncomingPayments as postTransfersMarketplaceEscrowFromIncomingPaymentsApi } from '../api/transfers/postTransfersMarketplaceEscrowFromIncomingPayments.js'; 
import { postTransfersRandomDestination as postTransfersRandomDestinationApi } from '../api/transfers/postTransfersRandomDestination.js';
import { getBalanceAccounts as getBalanceAccountsApi } from '../api/balance_accounts/getBalanceAccount.js';
import { postBalanceAccounts as postBalanceAccountsApi } from '../api/balance_accounts/postBalanceAccount.js';

import { getPayout as getPayoutApi } from '../api/payouts/getPayout.js';
import { postPayout as postPayoutApi, getRandomIdPair } from '../api/payouts/postPayout.js';

import { getBankAccount as getBankAccountApi } from '../api/payouts/getBankAccount.js';
import { postBankAccount as postBankAccountApi } from '../api/payouts/postBankAccount.js';

import { getAccountHolder as getAccountHolderApi } from '../api/account_holders/getAccountHolder.js';
import { postAccountHolder as postAccountHolderApi } from '../api/account_holders/postAccountHolder.js';
import { putAccountHolder as putAccountHolderApi } from '../api/account_holders/putAccountHolder.js';

import { getAccountHolderIdentity as getAccountHolderIdentityApi } from '../api/account_holders/getAccountHolderIdentity.js';

// Configurable test duration - can be set via environment variable
// Usage: LOAD_TEST_DURATION=1h k6 run loadTests/baseLoad.js
// Default: 2h
const LOAD_TEST_DURATION = __ENV.LOAD_TEST_DURATION || '6h';

export const options = {
  scenarios: {
    // From baseLoadLedger
    get_transfers: {
      executor: 'ramping-arrival-rate',
      startRate: 0,
      timeUnit: '1s',
      preAllocatedVUs: 4,
      stages: [
        { duration: '10m', target: 4 },  // Ramp up to 4 requests per second over 10 minutes
        { duration: LOAD_TEST_DURATION, target: 4 },   // Stay at 4 requests per second for the configured duration
      ],
      exec: 'getTransfers',
    },
    getBalanceAccounts: {
      executor: 'ramping-arrival-rate',
      startRate: 0,
      timeUnit: '1s',
      preAllocatedVUs: 100,
      stages: [
        { duration: '10m', target: 100 },  // Ramp up to 100 requests per second over 10 minutes
        { duration: LOAD_TEST_DURATION, target: 100 },   // Stay at 100 requests per second for the configured duration
      ],
      exec: 'getBalanceAccounts',
    },
    post_transfers: {
      executor: 'ramping-arrival-rate',
      startRate: 0,
      timeUnit: '1s',
      preAllocatedVUs: 30,
      stages: [
        { duration: '10m', target: 30 },  // Ramp up to 30 requests per second over 10 minutes
        { duration: LOAD_TEST_DURATION, target: 30 },   // Stay at 30 requests per second for the configured duration
      ],
      exec: 'postTransfers',
    },
    postBalanceAccounts: {
      executor: 'ramping-arrival-rate',
      startRate: 0,
      timeUnit: '1s',
      preAllocatedVUs: 10,
      stages: [
        { duration: '10m', target: 10 },  // Ramp up to 10 requests per second over 10 minutes
        { duration: LOAD_TEST_DURATION, target: 10 },   // Stay at 10 requests per second for the configured duration
      ],
      exec: 'postBalanceAccounts',
    },
    post_transfers_random_destination: {
      executor: 'ramping-arrival-rate',
      startRate: 0,
      timeUnit: '1s',
      preAllocatedVUs: 30,
      stages: [
        { duration: '10m', target: 30 },  // Ramp up to 30 requests per second over 10 minutes
        { duration: LOAD_TEST_DURATION, target: 30 },   // Stay at 30 requests per second for the configured duration
      ],
      exec: 'postTransfersRandomDestination',
    },
    post_transfers_marketplace_escrow_from_random: {
      executor: 'ramping-arrival-rate',
      startRate: 0,
      timeUnit: '1s',
      preAllocatedVUs: 30,
      stages: [
        { duration: '10m', target: 30 },  // Ramp up to 30 requests per second over 10 minutes
        { duration: LOAD_TEST_DURATION, target: 30 },   // Stay at 30 requests per second for the configured duration
      ],
      exec: 'postTransfersMarketplaceEscrowFromRandom',
    },
    post_transfers_marketplace_escrow_to_main: {
      executor: 'ramping-arrival-rate',
      startRate: 0,
      timeUnit: '1s',
      preAllocatedVUs: 30,
      stages: [
        { duration: '10m', target: 30 },  // Ramp up to 30 requests per second over 10 minutes
        { duration: LOAD_TEST_DURATION, target: 30 },   // Stay at 30 requests per second for the configured duration
      ],
      exec: 'postTransfersMarketplaceEscrowToMain',
    },
    post_transfers_marketplace_escrow_from_incoming_payments: {
      executor: 'ramping-arrival-rate',
      startRate: 0,
      timeUnit: '1s',
      preAllocatedVUs: 30,
      stages: [
        { duration: '10m', target: 30 },  // Ramp up to 30 requests per second over 10 minutes
        { duration: LOAD_TEST_DURATION, target: 30 },   // Stay at 30 requests per second for the configured duration
      ],
      exec: 'postTransfersMarketplaceEscrowFromIncomingPayments',
    },
    // From baseLoadPayouts
    get_payouts: {
      executor: 'ramping-arrival-rate',
      startRate: 0,
      timeUnit: '1s',
      preAllocatedVUs: 8,
      stages: [
        { duration: '10m', target: 8 },  // Ramp up to 8 requests per second over 10 minutes
        { duration: LOAD_TEST_DURATION, target: 8 },   // Stay at 8 requests per second for the configured duration
      ],
      exec: 'getPayouts',
    },
    post_payouts: {
      executor: 'ramping-arrival-rate',
      startRate: 0,
      timeUnit: '1s',
      preAllocatedVUs: 20,
      stages: [
        { duration: '10m', target: 20 },  // Ramp up to 20 requests per second over 10 minutes
        { duration: LOAD_TEST_DURATION, target: 20 },   // Stay at 20 requests per second for the configured duration
      ],
      exec: 'postPayouts',
    },
    get_bank_accounts: {
      executor: 'ramping-arrival-rate',
      startRate: 0,
      timeUnit: '1s',
      preAllocatedVUs: 150,
      stages: [
        { duration: '10m', target: 150 },  // Ramp up to 150 requests per second over 10 minutes
        { duration: LOAD_TEST_DURATION, target: 150 },   // Stay at 150 requests per second for the configured duration
      ],
      exec: 'getBankAccounts',
    },
    post_bank_accounts: {
      executor: 'ramping-arrival-rate',
      startRate: 0,
      timeUnit: '1s',
      preAllocatedVUs: 2,
      stages: [
        { duration: '10m', target: 2 },  // Ramp up to 2 requests per second over 10 minutes
        { duration: LOAD_TEST_DURATION, target: 2 },   // Stay at 2 requests per second for the configured duration
      ],
      exec: 'postBankAccounts',
    },
    // From baseLoadAccounts
    get_account_holders: {
      executor: 'ramping-arrival-rate',
      startRate: 0,
      timeUnit: '1s',
      preAllocatedVUs: 300,
      maxVUs: 300,
      stages: [
        { duration: '10m', target: 100 },  // Ramp up to 100 requests per second over 10 minutes
        { duration: LOAD_TEST_DURATION, target: 100 },   // Stay at 100 requests per second for the configured duration
      ],
      exec: 'getAccountHolders',
    },
    post_account_holders: {
      executor: 'ramping-arrival-rate',
      startRate: 0,
      timeUnit: '1s',
      preAllocatedVUs: 23,
      maxVUs: 23,
      stages: [
        { duration: '10m', target: 8 },  // Ramp up to 8 requests per second over 10 minutes
        { duration: LOAD_TEST_DURATION, target: 8 },   // Stay at 8 requests per second for the configured duration
      ],
      exec: 'postAccountHolders',
    },
    patch_account_holders: {
      executor: 'ramping-arrival-rate',
      startRate: 0,
      timeUnit: '1s',
      preAllocatedVUs: 45,
      maxVUs: 45,
      stages: [
        { duration: '10m', target: 15 },  // Ramp up to 15 requests per second over 10 minutes
        { duration: LOAD_TEST_DURATION, target: 15 },   // Stay at 15 requests per second for the configured duration
      ],
      exec: 'patchAccountHolders',
    },
    get_account_holders_identity: {
      executor: 'ramping-arrival-rate',
      startRate: 0,
      timeUnit: '1s',
      preAllocatedVUs: 15,
      maxVUs: 15,
      stages: [
        { duration: '10m', target: 5 },  // Ramp up to 5 requests per second over 10 minutes
        { duration: LOAD_TEST_DURATION, target: 5 },   // Stay at 5 requests per second for the configured duration
      ],
      exec: 'getAccountHoldersIdentity',
    },
  },
};

const apiFunctions = {
  getTransfers: getTransfersApi,
  getBalanceAccounts: getBalanceAccountsApi,
  postBalanceAccounts: postBalanceAccountsApi,
  postTransfers: postTransfersApi,  
  postTransfersMarketplaceEscrowFromRandom: postTransfersMarketplaceEscrowFromRandomApi,
  postTransfersMarketplaceEscrowToMain: postTransfersMarketplaceEscrowToMainApi,
  postTransfersMarketplaceEscrowFromIncomingPayments: postTransfersMarketplaceEscrowFromIncomingPaymentsApi,
  postTransfersRandomDestination: postTransfersRandomDestinationApi,
  getPayouts: getPayoutApi,
  postPayouts: postPayoutApi,
  getBankAccounts: getBankAccountApi,
  postBankAccounts: postBankAccountApi,
  getAccountHolders: getAccountHolderApi,
  postAccountHolders: postAccountHolderApi,
  patchAccountHolders: putAccountHolderApi,
  getAccountHoldersIdentity: getAccountHolderIdentityApi,
};

// Initialize authentication before the test starts
export function setup() {
    console.log('Initializing authentication...');
    
    // Get initial token to ensure authentication is working
    const token = authenticate();
    if (!token) {
        throw new Error('Failed to acquire initial authentication token');
    }
    
    const cacheStatus = getCacheStatus();
    console.log('Authentication initialized successfully');
    console.log('Cache status:', JSON.stringify(cacheStatus, null, 2));
    
    return { 
        authInitialized: true,
        initialTokenLength: token.length 
    };
}

// From baseLoadLedger
export function getTransfers() {
  return makeApiCallWithRetry(apiFunctions.getTransfers, 'GET /transfers');
}

export function getBalanceAccounts() {
  return makeApiCallWithRetry(apiFunctions.getBalanceAccounts, 'GET /balance_accounts');
}

export function postTransfers() {
  return makeApiCallWithRetry(apiFunctions.postTransfers, 'POST /transfers');
}

export function postBalanceAccounts() {
  return makeApiCallWithRetry(apiFunctions.postBalanceAccounts, 'POST /balance-accounts');
}

export function postTransfersRandomDestination() {
  return makeApiCallWithRetry(apiFunctions.postTransfersRandomDestination, 'POST /transfers/random-destination');
}

export function postTransfersMarketplaceEscrowFromRandom() {
  return makeApiCallWithRetry(apiFunctions.postTransfersMarketplaceEscrowFromRandom, 'POST /transfers/marketplace-escrow-from-random');
}

export function postTransfersMarketplaceEscrowToMain() {
  return makeApiCallWithRetry(apiFunctions.postTransfersMarketplaceEscrowToMain, 'POST /transfers/marketplace-escrow-to-main');
}

export function postTransfersMarketplaceEscrowFromIncomingPayments() {
  return makeApiCallWithRetry(apiFunctions.postTransfersMarketplaceEscrowFromIncomingPayments, 'POST /transfers/marketplace-escrow-from-incoming-payments');
}

// From baseLoadPayouts
export function getPayouts() {
  return makeApiCallWithRetry(apiFunctions.getPayouts, 'GET /payouts');
}

export function postPayouts() {
  // Create a wrapper function that provides the required parameters
  const postPayoutWrapper = (token) => {
    const idPair = getRandomIdPair();
    return postPayoutApi(token, idPair.balance_account_id, idPair.bank_account_id);
  };
  
  return makeApiCallWithRetry(postPayoutWrapper, 'POST /payouts');
}

export function getBankAccounts() {
  return makeApiCallWithRetry(apiFunctions.getBankAccounts, 'GET /bank_accounts');
}

export function postBankAccounts() {
  return makeApiCallWithRetry(apiFunctions.postBankAccounts, 'POST /bank_accounts');
}

// From baseLoadAccounts
export function getAccountHolders() {
  const accessToken = authenticate();
  return apiFunctions.getAccountHolders(accessToken);
}

export function postAccountHolders() {
  const accessToken = authenticate();
  return apiFunctions.postAccountHolders(accessToken);
}

export function patchAccountHolders() {
  const accessToken = authenticate();
  return apiFunctions.patchAccountHolders(accessToken);
}

export function getAccountHoldersIdentity() {
  const accessToken = authenticate();
  return apiFunctions.getAccountHoldersIdentity(accessToken);
}
