import { test, expect } from "@playwright/test";
import { AuthPage } from "../pages/AuthPage";

test.describe("Landing / Auth Page", () => {
  test("renders hero section with sign-in and sign-up links", async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.goto();

    await expect(authPage.heroHeading).toBeVisible();
    await expect(authPage.signInButton).toBeVisible();
    await page.screenshot({ path: "playwright-report/artifacts/auth-landing.png" });
  });

  test("root path redirects to /auth", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/auth/);
  });

  test("clicking sign-in navigates to sign-in page", async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.goto();
    await authPage.signInButton.click();
    await expect(page).toHaveURL(/sign-in/);
  });

  test("unauthenticated access to dashboard redirects to sign-in", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/sign-in/);
  });

  test("unauthenticated access to scheduled-interview redirects to sign-in", async ({ page }) => {
    await page.goto("/scheduled-interview");
    await expect(page).toHaveURL(/sign-in/);
  });
});
