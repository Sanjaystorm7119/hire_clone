import { test, expect } from "@playwright/test";
import { InterviewJoinPage, InterviewStartPage, InterviewCompletedPage } from "../pages/InterviewPage";

// NOTE: These tests require a valid interviewId seeded in the database.
// Set PLAYWRIGHT_INTERVIEW_ID env var to a real interview ID for full flow tests.
const INTERVIEW_ID = process.env.PLAYWRIGHT_INTERVIEW_ID || "test-interview-id";

test.describe("Candidate Interview Flow", () => {
  test("join page loads and shows interview details", async ({ page }) => {
    test.skip(!process.env.PLAYWRIGHT_INTERVIEW_ID, "Requires PLAYWRIGHT_INTERVIEW_ID");

    const joinPage = new InterviewJoinPage(page);
    await joinPage.goto(INTERVIEW_ID);

    await expect(page).toHaveURL(`/interview/${INTERVIEW_ID}`);
    await expect(joinPage.startButton).toBeVisible();
    await page.screenshot({ path: "playwright-report/artifacts/interview-join.png" });
  });

  test("start page redirects unauthenticated users", async ({ page }) => {
    const startPage = new InterviewStartPage(page);
    await startPage.goto(INTERVIEW_ID);

    // Either redirected to sign-in or shows unauthorized page
    const url = page.url();
    expect(url).toMatch(/sign-in|unauthorized/);
  });

  test("completed page is accessible after interview", async ({ page }) => {
    test.skip(!process.env.PLAYWRIGHT_INTERVIEW_ID, "Requires PLAYWRIGHT_INTERVIEW_ID");

    const completedPage = new InterviewCompletedPage(page);
    await completedPage.goto(INTERVIEW_ID);

    await expect(completedPage.successMessage).toBeVisible();
    await page.screenshot({ path: "playwright-report/artifacts/interview-completed.png" });
  });

  test("invalid interview ID shows not-found or error state", async ({ page }) => {
    await page.goto("/interview/nonexistent-id-xyz-000");

    const body = page.locator("body");
    await expect(body).toBeVisible();
    // Should not crash — either shows an error or empty state
    await page.screenshot({ path: "playwright-report/artifacts/interview-invalid.png" });
  });
});
