/**
 * Simple verification script for the grading service
 */

// Mock console.log to capture output
const originalLog = console.log;
const logs = [];
console.log = (...args) => {
  logs.push(args.join(' '));
  originalLog.apply(console, args);
};

// Import the functions we want to test
const { isRetryableStatus, parseLLMResponse, recordMetric, saveEvaluationToSession } = require('../services/gradingService');

async function runTests() {
  console.log('Running grading service verification tests...\n');

  // Test isRetryableStatus
  console.log('1. Testing isRetryableStatus function:');
  const retryableStatuses = [429, 500, 502, 503, 504];
  const nonRetryableStatuses = [200, 400, 401, 404];
  
  let passCount = 0;
  let totalCount = 0;
  
  for (const status of retryableStatuses) {
    totalCount++;
    const result = isRetryableStatus(status);
    if (result === true) {
      console.log(`  ✓ Status ${status} correctly identified as retryable`);
      passCount++;
    } else {
      console.log(`  ✗ Status ${status} should be retryable but was not`);
    }
  }
  
  for (const status of nonRetryableStatuses) {
    totalCount++;
    const result = isRetryableStatus(status);
    if (result === false) {
      console.log(`  ✓ Status ${status} correctly identified as non-retryable`);
      passCount++;
    } else {
      console.log(`  ✗ Status ${status} should not be retryable but was`);
    }
  }
  
  console.log(`  Passed: ${passCount}/${totalCount}\n`);
  
  // Test parseLLMResponse
  console.log('2. Testing parseLLMResponse function:');
  totalCount++;
  try {
    const json = '{"score": 85, "feedback": "Good answer"}';
    const result = parseLLMResponse(json);
    if (result.score === 85 && result.feedback === 'Good answer') {
      console.log('  ✓ Valid JSON parsed correctly');
      passCount++;
    } else {
      console.log('  ✗ Valid JSON not parsed correctly');
    }
  } catch (error) {
    console.log('  ✗ Error parsing valid JSON:', error.message);
  }
  
  totalCount++;
  try {
    const text = 'Here is the evaluation: {"score": 90, "feedback": "Excellent"} Please review.';
    const result = parseLLMResponse(text);
    if (result.score === 90 && result.feedback === 'Excellent') {
      console.log('  ✓ JSON extracted from text correctly');
      passCount++;
    } else {
      console.log('  ✗ JSON not extracted from text correctly');
    }
  } catch (error) {
    console.log('  ✗ Error extracting JSON from text:', error.message);
  }
  
  console.log(`  Passed: ${passCount}/${totalCount}\n`);
  
  // Test saveEvaluationToSession
  console.log('3. Testing saveEvaluationToSession function:');
  totalCount++;
  try {
    // Capture logs before calling the function
    const logCountBefore = logs.length;
    await saveEvaluationToSession('session123', 'question456', { score: 80 });
    
    // Check if a new log was added
    const logCountAfter = logs.length;
    if (logCountAfter > logCountBefore) {
      // Check if the new log contains the expected content
      const newLog = logs[logs.length - 1];
      if (newLog.includes('Saving evaluation for session session123, question question456')) {
        console.log('  ✓ Evaluation saved (logged correctly)');
        passCount++;
      } else {
        console.log('  ✗ Evaluation not logged correctly');
      }
    } else {
      console.log('  ✗ No log entry created');
    }
  } catch (error) {
    console.log('  ✗ Error saving evaluation:', error.message);
  }
  
  console.log(`  Passed: ${passCount}/${totalCount}\n`);
  
  // Test recordMetric
  console.log('4. Testing recordMetric function:');
  totalCount++;
  try {
    // Capture logs before calling the function
    const logCountBefore = logs.length;
    recordMetric('test_metric', { value: 42 });
    
    // Check if a new log was added
    const logCountAfter = logs.length;
    if (logCountAfter > logCountBefore) {
      // Check if the new log contains the expected content
      const newLog = logs[logs.length - 1];
      if (newLog.includes('Metric recorded: test_metric')) {
        console.log('  ✓ Metric recorded (logged correctly)');
        passCount++;
      } else {
        console.log('  ✗ Metric not logged correctly');
      }
    } else {
      console.log('  ✗ No log entry created');
    }
  } catch (error) {
    console.log('  ✗ Error recording metric:', error.message);
  }
  
  console.log(`  Passed: ${passCount}/${totalCount}\n`);
  
  console.log(`Overall Results: ${passCount}/${totalCount} tests passed`);
  
  if (passCount === totalCount) {
    console.log('🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed');
    process.exit(1);
  }
}

runTests().catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});