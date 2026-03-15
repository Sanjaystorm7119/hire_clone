import { type Page, type Locator } from "@playwright/test";

export class AuthPage {
  readonly page: Page;
  readonly signInButton: Locator;
  readonly signUpButton: Locator;
  readonly heroHeading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.signInButton = page.getByRole("link", { name: /sign in/i });
    this.signUpButton = page.getByRole("link", { name: /sign up|get started/i });
    this.heroHeading = page.getByRole("heading").first();
  }

  async goto() {
    await this.page.goto("/auth");
  }
}
