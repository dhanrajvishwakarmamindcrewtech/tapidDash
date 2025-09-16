#!/usr/bin/env node

/**
 * Test Runner for Insights System
 * 
 * This script runs all insights-related tests and provides detailed reporting.
 * It can be used in CI/CD pipelines or for local development testing.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Test configuration
const testConfig = {
  testDir: path.join(__dirname),
  testPattern: '*.test.js',
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};

// Test suites to run
const testSuites = [
  {
    name: 'Basic Insights Tests',
    file: 'BasicInsights.test.js',
    description: 'Core functionality tests for insights system utilities'
  },
  {
    name: 'HomePage Tests',
    file: 'HomePage.test.js',
    description: 'Production readiness tests for HomePage component with data integration, charts, and interactions'
  },
  {
    name: 'Connect Page Tests',
    file: 'ConnectPage.test.js',
    description: 'UI component tests for Connect page functionality'
  },
  {
    name: 'Connect Context Tests',
    file: 'ConnectContext.test.js',
    description: 'Business logic and data transformation tests for Connect system'
  },
  {
    name: 'Launch Pad (Control Center) Tests',
    file: 'ControlCenterPage.test.js',
    description: 'Production readiness tests for Launch Pad including campaign creation, error handling, loading states, and data persistence'
  },
  {
    name: 'Referral Page Tests',
    file: 'ReferralPage.test.js',
    description: 'Production readiness tests for Referral Page including program management, clipboard operations, and Launch Pad integration'
  },
  {
    name: 'Launch Pad ↔ Referral Integration Tests',
    file: 'LaunchPadReferralIntegration.test.js',
    description: 'Integration tests verifying data sharing, campaign flow, and seamless communication between Launch Pad and Referral Page'
  },
  {
    name: '🚀 Production Readiness Certification',
    file: 'ProductionReadiness.test.js',
    description: 'Comprehensive production readiness tests for Launch Pad and Referral Page including error handling, performance, and security'
  }
];

// Utility functions
const log = (message, color = 'white') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const logBold = (message, color = 'white') => {
  console.log(`${colors.bold}${colors[color]}${message}${colors.reset}`);
};

const logHeader = (message) => {
  console.log('\n' + '='.repeat(60));
  logBold(message, 'cyan');
  console.log('='.repeat(60));
};

const logSubHeader = (message) => {
  console.log('\n' + '-'.repeat(40));
  logBold(message, 'blue');
  console.log('-'.repeat(40));
};

const getCurrentTimestamp = () => {
  return new Date().toISOString();
};

const checkTestFileExists = (fileName) => {
  const filePath = path.join(testConfig.testDir, fileName);
  return fs.existsSync(filePath);
};

// Main test runner function
const runInsightsTests = async () => {
  logHeader('🧪 TAPID INSIGHTS TEST SUITE');
  log(`Started at: ${getCurrentTimestamp()}`, 'white');
  log(`Test directory: ${testConfig.testDir}`, 'white');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    startTime: Date.now(),
    suiteResults: []
  };

  // Check if all test files exist
  logSubHeader('📋 Pre-flight Checks');
  
  let allFilesExist = true;
  for (const suite of testSuites) {
    const exists = checkTestFileExists(suite.file);
    if (exists) {
      log(`✅ ${suite.file} - Found`, 'green');
    } else {
      log(`❌ ${suite.file} - Missing`, 'red');
      allFilesExist = false;
    }
  }

  if (!allFilesExist) {
    log('\n❌ Some test files are missing. Please ensure all test files exist.', 'red');
    process.exit(1);
  }

  // Run individual test suites
  logSubHeader('🏃‍♂️ Running Test Suites');

  for (const suite of testSuites) {
    try {
      log(`\n📝 Running: ${suite.name}`, 'yellow');
      log(`   ${suite.description}`, 'white');
      
      const startTime = Date.now();
      
      // Run the specific test file
      const testCommand = `npx react-scripts test --testPathPattern=${suite.file} --watchAll=false --verbose --coverage=false`;
      
      try {
        execSync(testCommand, { 
          stdio: 'pipe',
          cwd: path.join(__dirname, '..', '..')
        });
        
        const duration = Date.now() - startTime;
        log(`   ✅ PASSED (${duration}ms)`, 'green');
        
        results.passed++;
        results.suiteResults.push({
          name: suite.name,
          file: suite.file,
          status: 'passed',
          duration
        });
        
      } catch (error) {
        const duration = Date.now() - startTime;
        log(`   ❌ FAILED (${duration}ms)`, 'red');
        
        results.failed++;
        results.suiteResults.push({
          name: suite.name,
          file: suite.file,
          status: 'failed',
          duration,
          error: error.message
        });
      }
      
      results.total++;
      
    } catch (error) {
      log(`   ⚠️  SKIPPED - ${error.message}`, 'yellow');
      results.skipped++;
      results.total++;
    }
  }

  // Run coverage report
  logSubHeader('📊 Coverage Report');
  
  try {
    log('Generating coverage report...', 'white');
    
    const coverageCommand = `npx react-scripts test --testPathPattern=src/testing --watchAll=false --coverage --coverageDirectory=coverage/insights`;
    
    execSync(coverageCommand, { 
      stdio: 'pipe',
      cwd: path.join(__dirname, '..', '..')
    });
    
    log('✅ Coverage report generated in coverage/insights/', 'green');
    
  } catch (error) {
    log('⚠️  Coverage report generation failed', 'yellow');
    log(`   ${error.message}`, 'red');
  }

  // Generate final report
  const totalTime = Date.now() - results.startTime;
  
  logHeader('📋 TEST SUMMARY REPORT');
  
  log(`Total Test Suites: ${results.total}`, 'white');
  log(`✅ Passed: ${results.passed}`, 'green');
  log(`❌ Failed: ${results.failed}`, 'red');
  log(`⚠️  Skipped: ${results.skipped}`, 'yellow');
  log(`⏱️  Total Time: ${totalTime}ms`, 'white');
  log(`📅 Completed: ${getCurrentTimestamp()}`, 'white');
  
  // Detailed results
  if (results.suiteResults.length > 0) {
    logSubHeader('📝 Detailed Results');
    
    results.suiteResults.forEach((result) => {
      const statusIcon = result.status === 'passed' ? '✅' : '❌';
      const statusColor = result.status === 'passed' ? 'green' : 'red';
      
      log(`${statusIcon} ${result.name} (${result.duration}ms)`, statusColor);
      if (result.error) {
        log(`   Error: ${result.error}`, 'red');
      }
    });
  }

  // Success/failure determination
  const success = results.failed === 0;
  
  if (success) {
    logBold('\n🎉 ALL TESTS PASSED! Insights system is ready for production! 🚀', 'green');
  } else {
    logBold('\n❌ SOME TESTS FAILED! Please review and fix failing tests.', 'red');
  }

  // Generate JSON report for CI/CD
  const jsonReport = {
    timestamp: getCurrentTimestamp(),
    summary: {
      total: results.total,
      passed: results.passed,
      failed: results.failed,
      skipped: results.skipped,
      duration: totalTime,
      success: success
    },
    suites: results.suiteResults,
    coverage: {
      reportPath: 'coverage/insights',
      thresholds: testConfig.coverageThreshold
    }
  };

  const reportPath = path.join(__dirname, '..', '..', 'test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(jsonReport, null, 2));
  log(`\n📄 JSON report saved to: ${reportPath}`, 'blue');

  // Exit with appropriate code
  process.exit(success ? 0 : 1);
};

// Error handling
process.on('uncaughtException', (error) => {
  log(`\n💥 Uncaught Exception: ${error.message}`, 'red');
  console.error(error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log(`\n💥 Unhandled Rejection at: ${promise}`, 'red');
  log(`   Reason: ${reason}`, 'red');
  process.exit(1);
});

// CLI argument handling
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  logHeader('🧪 Tapid Insights Test Runner - Help');
  
  log('Usage: node src/testing/runTests.js [options]', 'white');
  log('\nOptions:', 'white');
  log('  --help, -h     Show this help message', 'white');
  log('  --watch, -w    Run tests in watch mode', 'white');
  log('  --coverage, -c Run with coverage only', 'white');
  log('  --verbose, -v  Verbose output', 'white');
  
  log('\nExamples:', 'white');
  log('  node src/testing/runTests.js                 # Run all tests', 'white');
  log('  node src/testing/runTests.js --coverage      # Run coverage only', 'white');
  log('  npm run test:insights                        # Via npm script', 'white');
  
  process.exit(0);
}

if (args.includes('--coverage') || args.includes('-c')) {
  // Run coverage only
  logHeader('📊 Coverage Report Only');
  
  try {
    const coverageCommand = `npx react-scripts test --testPathPattern=src/testing --watchAll=false --coverage --coverageDirectory=coverage/insights`;
    execSync(coverageCommand, { stdio: 'inherit' });
    log('✅ Coverage report completed', 'green');
  } catch (error) {
    log('❌ Coverage report failed', 'red');
    process.exit(1);
  }
  
  process.exit(0);
}

// Run the main test suite
runInsightsTests().catch((error) => {
  log(`\n💥 Test runner failed: ${error.message}`, 'red');
  console.error(error.stack);
  process.exit(1);
}); 