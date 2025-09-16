# 🧪 Insights Testing Suite

This directory contains comprehensive tests for the Tapid Insights system, ensuring production-ready quality and reliability.

## 📁 Test Structure

```
src/testing/
├── README.md                     # This file
├── runTests.js                   # Custom test runner with reporting
├── testUtils.js                  # Common testing utilities and mocks
├── InsightsPage.test.js          # UI component tests
├── DataContext.test.js           # Data transformation tests
└── BusinessDataContext.test.js   # Business logic tests
```

## 🎯 Test Coverage

### **InsightsPage.test.js** - UI Component Tests
- ✅ Component rendering and lifecycle
- ✅ KPI display and formatting
- ✅ Smart insights visualization
- ✅ Customer segments pagination
- ✅ Export functionality
- ✅ Error handling and loading states
- ✅ Responsive design testing
- ✅ Accessibility compliance
- ✅ Performance optimization validation

### **DataContext.test.js** - Data Layer Tests
- ✅ Data formatting functions (currency, numbers, percentages)
- ✅ Icon and color mapping
- ✅ Data transformation and memoization
- ✅ Queue insights calculations
- ✅ Customer statistics generation
- ✅ Export data structure validation
- ✅ Error boundary testing
- ✅ Performance benchmarking

### **BusinessDataContext.test.js** - Business Logic Tests
- ✅ Context provider setup and state management
- ✅ Insights data loading and caching
- ✅ Customer data management
- ✅ Notification system integration
- ✅ State persistence and updates
- ✅ Hook functionality and stability
- ✅ Integration between contexts
- ✅ Memory leak prevention

### **testUtils.js** - Testing Infrastructure
- 🛠️ Mock factories for Firebase, React Router
- 🛠️ Test data generators and fixtures
- 🛠️ DOM API mocking (file exports, performance)
- 🛠️ Custom assertion helpers
- 🛠️ Performance testing utilities
- 🛠️ Provider wrappers for isolated testing

## 🚀 Running Tests

### Quick Start
```bash
# Run all insights tests
npm run test:insights

# Run tests with coverage
npm run test:insights:coverage

# Run specific test file
npm test -- --testPathPattern=InsightsPage.test.js
```

### Advanced Testing

#### Using the Custom Test Runner
```bash
# Full test suite with detailed reporting
node src/testing/runTests.js

# Coverage report only
node src/testing/runTests.js --coverage

# Get help
node src/testing/runTests.js --help
```

#### Individual Test Files
```bash
# Test specific components
npx react-scripts test --testPathPattern=InsightsPage.test.js --watchAll=false

# Test data layer
npx react-scripts test --testPathPattern=DataContext.test.js --watchAll=false

# Test business logic
npx react-scripts test --testPathPattern=BusinessDataContext.test.js --watchAll=false
```

#### Watch Mode for Development
```bash
# Watch all insights tests
npm test -- --testPathPattern=src/testing

# Watch specific test file
npm test -- --testPathPattern=InsightsPage.test.js
```

## 📊 Coverage Reports

### Coverage Thresholds
- **Branches**: 70%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

### Viewing Coverage
```bash
# Generate coverage report
npm run test:insights:coverage

# View HTML report (opens in browser)
open coverage/insights/lcov-report/index.html
```

### CI/CD Integration
The test runner generates `test-report.json` for CI/CD pipeline integration:

```json
{
  "timestamp": "2025-01-08T17:00:00.000Z",
  "summary": {
    "total": 3,
    "passed": 3,
    "failed": 0,
    "duration": 15420,
    "success": true
  },
  "coverage": {
    "reportPath": "coverage/insights",
    "thresholds": { "branches": 70, "functions": 80 }
  }
}
```

## 🧪 Test Categories

### Unit Tests
- Individual function testing
- Component isolation testing
- Data transformation validation
- Pure function verification

### Integration Tests
- Context provider interactions
- Data flow between components
- Hook integration testing
- State management validation

### UI Tests
- Component rendering verification
- User interaction simulation
- Accessibility compliance
- Responsive design validation

### Performance Tests
- Render time benchmarking
- Memory usage monitoring
- Memoization effectiveness
- Bundle size impact

## 🛠️ Writing New Tests

### Test File Structure
```javascript
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { createTestWrapper } from './testUtils';

describe('YourComponent', () => {
  describe('Rendering', () => {
    test('renders without crashing', () => {
      // Your test here
    });
  });

  describe('Functionality', () => {
    test('handles user interactions', () => {
      // Your test here
    });
  });

  describe('Performance', () => {
    test('renders efficiently', () => {
      // Your test here
    });
  });
});
```

### Best Practices

#### ✅ Do
- Use descriptive test names
- Group related tests with `describe` blocks
- Mock external dependencies
- Test both success and error scenarios
- Verify accessibility attributes
- Check performance characteristics
- Use data-testid for stable element selection

#### ❌ Don't
- Test implementation details
- Create brittle selectors
- Ignore async operations
- Skip error cases
- Forget to clean up mocks
- Write tests that depend on other tests

### Mock Guidelines

#### Context Mocking
```javascript
import { createTestWrapper } from './testUtils';

const TestWrapper = createTestWrapper({
  notificationHooks: {
    showSuccess: jest.fn(),
    showError: jest.fn()
  }
});
```

#### Data Mocking
```javascript
import { mockBusinessData, generateTestData } from './testUtils';

const customKPI = generateTestData.kpi({
  title: 'Custom KPI',
  value: 150
});
```

## 🔧 Development Commands

### Add New Test Package
```bash
# Add testing library (if needed)
npm install --save-dev @testing-library/react-hooks

# Add performance testing
npm install --save-dev lighthouse
```

### Debug Tests
```bash
# Run with debug output
npm test -- --testPathPattern=InsightsPage.test.js --verbose

# Debug specific test
node --inspect-brk node_modules/.bin/react-scripts test --testNamePattern="specific test"
```

### Profile Test Performance
```bash
# Run with performance profiling
npm test -- --testPathPattern=src/testing --maxWorkers=1 --detectOpenHandles
```

## 📈 Quality Metrics

### Current Test Metrics
- **Total Test Suites**: 3
- **Total Tests**: ~80+ individual tests
- **Coverage Target**: 80%+ across all metrics
- **Performance Target**: <100ms render time
- **Accessibility**: WCAG 2.1 AA compliance

### Quality Gates
Before merging code, ensure:
- [ ] All tests pass
- [ ] Coverage thresholds met
- [ ] No console errors in tests
- [ ] Performance tests pass
- [ ] Accessibility tests pass

## 🚨 Troubleshooting

### Common Issues

#### Test Timeouts
```bash
# Increase timeout for slow tests
npm test -- --testTimeout=30000
```

#### Memory Issues
```bash
# Run with limited workers
npm test -- --maxWorkers=2
```

#### Mock Issues
```bash
# Clear all mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});
```

#### Coverage Issues
```bash
# Exclude files from coverage
"collectCoverageFrom": [
  "src/**/*.{js,jsx}",
  "!src/testing/**",
  "!src/**/*.test.js"
]
```

## 📚 Resources

### Testing Documentation
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

### Insights System Documentation
- [Data Architecture](../data/README.md)
- [Context API Guide](../context/README.md)
- [Component Guidelines](../screens/README.md)

## 🎯 Future Improvements

### Planned Enhancements
- [ ] Visual regression testing with Percy/Chromatic
- [ ] End-to-end testing with Playwright
- [ ] Performance monitoring with Lighthouse CI
- [ ] Automated accessibility testing with axe
- [ ] Cross-browser testing matrix
- [ ] Mobile device testing automation

### Performance Targets
- [ ] Sub-2-second full test suite execution
- [ ] 90%+ code coverage across all files
- [ ] Zero memory leaks in test runs
- [ ] Automated performance regression detection

---

## 🏆 Production Readiness

✅ **Ready for Production**: This testing suite ensures the Insights system meets enterprise-grade quality standards with comprehensive coverage, automated reporting, and CI/CD integration.

**Next Steps**: Run `npm run test:insights` to verify everything works, then integrate into your deployment pipeline! 🚀 