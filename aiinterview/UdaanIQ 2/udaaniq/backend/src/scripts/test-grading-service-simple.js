/**
 * Simple test script for the grading service functions
 */

console.log('Testing grading service functions...');

// Test isRetryableStatus function
const { isRetryableStatus } = require('../services/gradingService');

console.log('1. Testing isRetryableStatus function:');
const retryableStatuses = [429, 500, 502, 503, 504];
const nonRetryableStatuses = [200, 400, 401, 404];

for (const status of retryableStatuses) {
  const result = isRetryableStatus(status);
  console.log(`  Status ${status}: ${result ? 'retryable' : 'not retryable'}`);
}

for (const status of nonRetryableStatuses) {
  const result = isRetryableStatus(status);
  console.log(`  Status ${status}: ${result ? 'retryable' : 'not retryable'}`);
}

console.log('Test completed.');