# Task 13: Testing Suite (Playwright)

## 📋 Task Information
- **ID**: 13
- **Title**: Testing Suite (Playwright)
- **Priority**: High
- **Status**: pending
- **Dependencies**: [12]
- **Estimated Time**: 12 hours

## 📝 Description
Implement a comprehensive testing suite using Playwright for end-to-end testing, covering all user journeys, admin workflows, and critical functionality to ensure the birthday surprise application works flawlessly across all devices and browsers.

## 🔍 Details

### Testing Architecture
1. **Test Organization**
   ```typescript
   // Test structure
   tests/
   ├── e2e/
   │   ├── user-journey/
   │   ├── admin-dashboard/
   │   ├── message-submission/
   │   ├── memory-gallery/
   │   └── email-system/
   ├── fixtures/
   ├── utils/
   └── config/
   ```

2. **Test Configuration**
   ```typescript
   // playwright.config.ts
   export default defineConfig({
     testDir: './tests',
     fullyParallel: true,
     forbidOnly: !!process.env.CI,
     retries: process.env.CI ? 2 : 0,
     workers: process.env.CI ? 1 : undefined,
     reporter: 'html',
     use: {
       baseURL: 'http://localhost:3000',
       trace: 'on-first-retry',
       screenshot: 'only-on-failure',
     },
     projects: [
       { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
       { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
       { name: 'webkit', use: { ...devices['Desktop Safari'] } },
       { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
       { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
     ],
   });
   ```

### Core User Journey Tests
1. **Countdown Timer Tests**
   ```typescript
   test.describe('Countdown Timer', () => {
     test('displays correct countdown', async ({ page }) => {
       await page.goto('/');
       await expect(page.locator('[data-testid="countdown-timer"]')).toBeVisible();
       await expect(page.locator('[data-testid="days"]')).toContainText(/\d+/);
       await expect(page.locator('[data-testid="hours"]')).toContainText(/\d+/);
     });

     test('updates in real-time', async ({ page }) => {
       await page.goto('/');
       const initialSeconds = await page.locator('[data-testid="seconds"]').textContent();
       await page.waitForTimeout(2000);
       const updatedSeconds = await page.locator('[data-testid="seconds"]').textContent();
       expect(initialSeconds).not.toBe(updatedSeconds);
     });
   });
   ```

2. **Message Submission Tests**
   ```typescript
   test.describe('Message Submission', () => {
     test('submits message successfully', async ({ page }) => {
       await page.goto('/');
       await page.fill('[data-testid="name-input"]', 'Test User');
       await page.fill('[data-testid="email-input"]', 'test@example.com');
       await page.fill('[data-testid="message-input"]', 'Happy birthday! This is a test message.');
       await page.click('[data-testid="submit-button"]');
       await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
     });

     test('validates required fields', async ({ page }) => {
       await page.goto('/');
       await page.click('[data-testid="submit-button"]');
       await expect(page.locator('[data-testid="name-error"]')).toBeVisible();
       await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
       await expect(page.locator('[data-testid="message-error"]')).toBeVisible();
     });
   });
   ```

3. **File Upload Tests**
   ```typescript
   test.describe('File Upload', () => {
     test('uploads image successfully', async ({ page }) => {
       await page.goto('/');
       const fileInput = page.locator('[data-testid="file-input"]');
       await fileInput.setInputFiles('tests/fixtures/test-image.jpg');
       await expect(page.locator('[data-testid="file-preview"]')).toBeVisible();
     });

     test('validates file size limits', async ({ page }) => {
       await page.goto('/');
       const fileInput = page.locator('[data-testid="file-input"]');
       await fileInput.setInputFiles('tests/fixtures/large-file.jpg');
       await expect(page.locator('[data-testid="file-error"]')).toContainText('File too large');
     });
   });
   ```

### Memory Gallery Tests
1. **Gallery Display Tests**
   ```typescript
   test.describe('Memory Gallery', () => {
     test('displays all approved messages', async ({ page }) => {
       await page.goto('/gallery');
       await expect(page.locator('[data-testid="message-card"]')).toHaveCount(5);
       await expect(page.locator('[data-testid="gallery-grid"]')).toBeVisible();
     });

     test('filters messages correctly', async ({ page }) => {
       await page.goto('/gallery');
       await page.click('[data-testid="filter-photos"]');
       const photoCards = page.locator('[data-testid="message-card"][data-type="photo"]');
       await expect(photoCards).toHaveCount(3);
     });
   });
   ```

2. **Media Interaction Tests**
   ```typescript
   test('opens image lightbox', async ({ page }) => {
     await page.goto('/gallery');
     await page.click('[data-testid="image-thumbnail"]').first();
     await expect(page.locator('[data-testid="lightbox"]')).toBeVisible();
     await expect(page.locator('[data-testid="lightbox-image"]')).toBeVisible();
   });
   ```

### Admin Dashboard Tests
1. **Authentication Tests**
   ```typescript
   test.describe('Admin Authentication', () => {
     test('requires login for admin access', async ({ page }) => {
       await page.goto('/admin');
       await expect(page).toHaveURL('/admin/login');
     });

     test('logs in successfully with valid credentials', async ({ page }) => {
       await page.goto('/admin/login');
       await page.fill('[data-testid="email"]', 'admin@example.com');
       await page.fill('[data-testid="password"]', 'password123');
       await page.click('[data-testid="login-button"]');
       await expect(page).toHaveURL('/admin');
     });
   });
   ```

2. **Message Management Tests**
   ```typescript
   test.describe('Message Management', () => {
     test('approves message successfully', async ({ page }) => {
       await loginAsAdmin(page);
       await page.goto('/admin/messages');
       await page.click('[data-testid="approve-button"]').first();
       await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
     });
   });
   ```

### Performance Tests
1. **Load Time Tests**
   ```typescript
   test.describe('Performance', () => {
     test('homepage loads within 3 seconds', async ({ page }) => {
       const startTime = Date.now();
       await page.goto('/');
       await page.waitForLoadState('networkidle');
       const loadTime = Date.now() - startTime;
       expect(loadTime).toBeLessThan(3000);
     });

     test('gallery loads efficiently with many messages', async ({ page }) => {
       await page.goto('/gallery');
       await page.waitForSelector('[data-testid="message-card"]');
       const performanceMetrics = await page.evaluate(() => {
         return JSON.parse(JSON.stringify(performance.getEntriesByType('navigation')[0]));
       });
       expect(performanceMetrics.loadEventEnd - performanceMetrics.loadEventStart).toBeLessThan(2000);
     });
   });
   ```

### Mobile Responsiveness Tests
1. **Mobile Navigation Tests**
   ```typescript
   test.describe('Mobile Experience', () => {
     test('mobile navigation works correctly', async ({ page }) => {
       await page.setViewportSize({ width: 375, height: 667 });
       await page.goto('/');
       await page.click('[data-testid="mobile-menu-button"]');
       await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
     });

     test('touch gestures work on gallery', async ({ page }) => {
       await page.setViewportSize({ width: 375, height: 667 });
       await page.goto('/gallery');
       await page.touchscreen.tap(100, 200);
       await page.touchscreen.tap(200, 200);
       // Test swipe gestures
     });
   });
   ```

### Email System Tests
1. **Email Scheduling Tests**
   ```typescript
   test.describe('Email System', () => {
     test('schedules birthday emails correctly', async ({ page }) => {
       await loginAsAdmin(page);
       await page.goto('/admin/emails');
       await page.click('[data-testid="schedule-birthday-emails"]');
       await expect(page.locator('[data-testid="scheduled-count"]')).toContainText('5 emails scheduled');
     });
   });
   ```

### Accessibility Tests
1. **A11y Compliance Tests**
   ```typescript
   test.describe('Accessibility', () => {
     test('has no accessibility violations', async ({ page }) => {
       await page.goto('/');
       const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
       expect(accessibilityScanResults.violations).toEqual([]);
     });

     test('keyboard navigation works', async ({ page }) => {
       await page.goto('/');
       await page.keyboard.press('Tab');
       await expect(page.locator(':focus')).toBeVisible();
     });
   });
   ```

## 🧪 Test Strategy

### Test Coverage Goals
- [ ] 90%+ code coverage for critical paths
- [ ] All user journeys tested end-to-end
- [ ] Cross-browser compatibility verified
- [ ] Mobile responsiveness validated
- [ ] Performance benchmarks met

### Test Data Management
- [ ] Test fixtures for consistent data
- [ ] Database seeding for tests
- [ ] Mock external services
- [ ] Test environment isolation
- [ ] Cleanup after test runs

### CI/CD Integration
- [ ] Tests run on every PR
- [ ] Parallel test execution
- [ ] Test result reporting
- [ ] Screenshot/video capture on failures
- [ ] Performance regression detection

## 🔧 MCP Tools Required

### Context7
- Playwright best practices and patterns
- Testing library documentation
- Accessibility testing with axe-core
- Performance testing techniques
- Mock service worker setup

### Playwright MCP
- Test automation and browser control
- Cross-browser testing setup
- Mobile device simulation
- Screenshot and video capture
- Test reporting and analysis

### Supabase MCP
- Test database setup and seeding
- Mock data generation
- Database cleanup strategies
- Real-time testing approaches

### Sequential Thinking
- Test strategy optimization
- Test case prioritization
- Performance bottleneck identification
- Test maintenance strategies

## ✅ Acceptance Criteria

### Test Coverage
- [ ] 90%+ line coverage for critical components
- [ ] All user journeys have end-to-end tests
- [ ] Admin workflows fully tested
- [ ] Error scenarios covered
- [ ] Edge cases identified and tested

### Cross-Platform Testing
- [ ] Tests pass on Chrome, Firefox, Safari
- [ ] Mobile tests pass on iOS and Android
- [ ] Responsive design validated
- [ ] Touch interactions work correctly
- [ ] Performance meets targets on all platforms

### Test Quality
- [ ] Tests are reliable and not flaky
- [ ] Test execution time under 10 minutes
- [ ] Clear test documentation
- [ ] Easy to add new tests
- [ ] Good error messages and debugging

### CI/CD Integration
- [ ] Tests run automatically on PRs
- [ ] Test results reported clearly
- [ ] Failed tests block deployment
- [ ] Performance regressions detected
- [ ] Test artifacts saved for debugging

## 🔗 GitHub Integration
- **Issue**: Create issue for comprehensive testing suite
- **Branch**: `feature/task-13-testing-suite`
- **PR**: Create PR with complete test coverage

## 📁 Files to Create/Modify
- `playwright.config.ts`
- `tests/e2e/user-journey.spec.ts`
- `tests/e2e/admin-dashboard.spec.ts`
- `tests/e2e/message-submission.spec.ts`
- `tests/e2e/memory-gallery.spec.ts`
- `tests/e2e/performance.spec.ts`
- `tests/e2e/accessibility.spec.ts`
- `tests/fixtures/test-data.ts`
- `tests/utils/test-helpers.ts`
- `.github/workflows/test.yml`

## 🎯 Success Metrics
- 90%+ test coverage achieved
- All tests pass consistently
- Test execution under 10 minutes
- Zero flaky tests
- 100% critical user journeys covered

---

**Next Task**: 14-deployment.md  
**Previous Task**: 12-admin-dashboard.md  
**Estimated Total Time**: 12 hours  
**Complexity**: High
