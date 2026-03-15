import { type Page, type Locator } from "@playwright/test";

export class DashboardPage {
  readonly page: Page;
  readonly welcomeHeading: Locator;
  readonly createInterviewButton: Locator;
  readonly interviewCards: Locator;
  readonly sidebar: Locator;

  constructor(page: Page) {
    this.page = page;
    this.welcomeHeading = page.getByRole("heading", { name: /welcome|dashboard/i });
    this.createInterviewButton = page.getByRole("link", { name: /create interview/i });
    this.interviewCards = page.getByTestId("interview-card");
    this.sidebar = page.getByRole("navigation");
  }

  async goto() {
    await this.page.goto("/dashboard");
  }
}

export class CreateInterviewPage {
  readonly page: Page;
  readonly jobPositionInput: Locator;
  readonly jobDescriptionInput: Locator;
  readonly durationSelect: Locator;
  readonly companyNameInput: Locator;
  readonly nextButton: Locator;
  readonly generateQuestionsButton: Locator;
  readonly questionItems: Locator;
  readonly copyLinkButton: Locator;
  readonly shareableLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.jobPositionInput = page.getByPlaceholder(/job position/i);
    this.jobDescriptionInput = page.getByPlaceholder(/job description/i);
    this.durationSelect = page.getByRole("combobox", { name: /duration/i });
    this.companyNameInput = page.getByPlaceholder(/company name/i);
    this.nextButton = page.getByRole("button", { name: /next/i });
    this.generateQuestionsButton = page.getByRole("button", { name: /generate questions/i });
    this.questionItems = page.getByTestId("question-item");
    this.copyLinkButton = page.getByRole("button", { name: /copy link/i });
    this.shareableLink = page.getByTestId("shareable-link");
  }

  async goto() {
    await this.page.goto("/dashboard/create-interview");
  }
}

export class ScheduledInterviewPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly interviewCards: Locator;
  readonly viewDetailsLinks: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByPlaceholder(/search/i);
    this.interviewCards = page.locator("[data-testid='interview-card']");
    this.viewDetailsLinks = page.getByRole("link", { name: /view details/i });
  }

  async goto() {
    await this.page.goto("/scheduled-interview");
  }
}
