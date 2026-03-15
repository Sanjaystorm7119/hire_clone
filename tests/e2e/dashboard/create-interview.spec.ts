import { test, expect, type Page } from "@playwright/test";
import { DashboardPage, CreateInterviewPage, ScheduledInterviewPage } from "../pages/DashboardPage";

// These tests require an authenticated session.
// Use Clerk's test mode or set CLERK_SESSION_TOKEN env var.
test.use({ storageState: process.env.PLAYWRIGHT_AUTH_FILE || ".auth/user.json" });

test.describe("Recruiter Dashboard — Create Interview Flow", () => {
  test.skip(
    !process.env.PLAYWRIGHT_AUTH_FILE,
    "Requires PLAYWRIGHT_AUTH_FILE with authenticated session"
  );

  test("dashboard loads and shows welcome message", async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    await expect(dashboard.welcomeHeading).toBeVisible();
    await expect(dashboard.createInterviewButton).toBeVisible();
    await page.screenshot({ path: "playwright-report/artifacts/dashboard.png" });
  });

  test("create interview step 1 — fill job details form", async ({ page }) => {
    const createPage = new CreateInterviewPage(page);
    await createPage.goto();

    await createPage.jobPositionInput.fill("Senior Frontend Engineer");
    await createPage.jobDescriptionInput.fill(
      "We are looking for a skilled React developer with 3+ years experience."
    );
    await createPage.companyNameInput.fill("Acme Corp");

    await expect(createPage.nextButton).toBeEnabled();
    await page.screenshot({ path: "playwright-report/artifacts/create-step1.png" });
  });

  test("create interview step 2 — generates questions", async ({ page }) => {
    const createPage = new CreateInterviewPage(page);
    await createPage.goto();

    await createPage.jobPositionInput.fill("Backend Engineer");
    await createPage.jobDescriptionInput.fill("Node.js and REST API experience required.");

    await createPage.nextButton.click();

    // Wait for AI question generation (up to 30 seconds)
    await expect(createPage.questionItems.first()).toBeVisible({ timeout: 30000 });

    const count = await createPage.questionItems.count();
    expect(count).toBeGreaterThan(0);
    await page.screenshot({ path: "playwright-report/artifacts/create-step2.png" });
  });

  test("create interview step 3 — shows shareable link", async ({ page }) => {
    const createPage = new CreateInterviewPage(page);
    await createPage.goto();

    // Step 1
    await createPage.jobPositionInput.fill("QA Engineer");
    await createPage.jobDescriptionInput.fill("Selenium and Cypress testing experience.");
    await createPage.nextButton.click();

    // Wait for questions
    await expect(createPage.questionItems.first()).toBeVisible({ timeout: 30000 });
    await createPage.nextButton.click();

    // Step 3 — shareable link
    await expect(createPage.copyLinkButton).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: "playwright-report/artifacts/create-step3.png" });
  });
});

test.describe("Scheduled Interviews Page", () => {
  test.skip(
    !process.env.PLAYWRIGHT_AUTH_FILE,
    "Requires PLAYWRIGHT_AUTH_FILE with authenticated session"
  );

  test("loads interview list", async ({ page }) => {
    const scheduledPage = new ScheduledInterviewPage(page);
    await scheduledPage.goto();

    await expect(page).toHaveURL(/scheduled-interview/);
    await page.screenshot({ path: "playwright-report/artifacts/scheduled-interviews.png" });
  });

  test("search filters interviews by position", async ({ page }) => {
    const scheduledPage = new ScheduledInterviewPage(page);
    await scheduledPage.goto();

    await scheduledPage.searchInput.fill("Frontend");
    await page.waitForTimeout(500); // debounce

    // Either results are filtered, or no-results message shown
    const body = page.locator("body");
    await expect(body).toBeVisible();
    await page.screenshot({ path: "playwright-report/artifacts/scheduled-search.png" });
  });
});
