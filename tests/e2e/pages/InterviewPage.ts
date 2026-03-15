import { type Page, type Locator } from "@playwright/test";

export class InterviewJoinPage {
  readonly page: Page;
  readonly startButton: Locator;
  readonly jobPosition: Locator;
  readonly duration: Locator;
  readonly alreadyAttemptedMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.startButton = page.getByRole("button", { name: /start interview/i });
    this.jobPosition = page.getByTestId("job-position");
    this.duration = page.getByTestId("duration");
    this.alreadyAttemptedMessage = page.getByText(/already attempted/i);
  }

  async goto(interviewId: string) {
    await this.page.goto(`/interview/${interviewId}`);
  }
}

export class InterviewStartPage {
  readonly page: Page;
  readonly timer: Locator;
  readonly endButton: Locator;
  readonly micToggle: Locator;
  readonly evaAvatar: Locator;

  constructor(page: Page) {
    this.page = page;
    this.timer = page.getByTestId("timer");
    this.endButton = page.getByRole("button", { name: /end interview/i });
    this.micToggle = page.getByRole("button", { name: /mic|mute/i });
    this.evaAvatar = page.getByAltText(/eva/i);
  }

  async goto(interviewId: string) {
    await this.page.goto(`/interview/${interviewId}/start`);
  }
}

export class InterviewCompletedPage {
  readonly page: Page;
  readonly successMessage: Locator;
  readonly feedbackSection: Locator;

  constructor(page: Page) {
    this.page = page;
    this.successMessage = page.getByText(/interview complete|thank you/i);
    this.feedbackSection = page.getByTestId("feedback-section");
  }

  async goto(interviewId: string) {
    await this.page.goto(`/interview/${interviewId}/completed`);
  }
}
