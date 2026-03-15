import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import InterviewCard from "./InterviewCard";

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props) => <img {...props} />,
}));

jest.mock("@clerk/nextjs", () => ({
  useUser: () => ({
    isLoaded: true,
    user: {
      firstName: "John",
      lastName: "Doe",
      emailAddresses: [{ emailAddress: "john@example.com" }],
    },
  }),
}));

jest.mock("sonner", () => ({ toast: jest.fn() }));

const { toast } = require("sonner");

describe("InterviewCard Component", () => {
  const mockInterview = {
    id: "1",
    interviewId: "abc123",
    created_at: new Date("2025-10-31").toISOString(),
    duration: 30,
    jobPosition: "Frontend Engineer",
    companyName: "Acme Corp",
    candidates: [],
    interview_feedback: [{ id: 1 }, { id: 2 }],
  };

  beforeEach(() => {
    toast.mockClear();
  });

  it("renders interview details", () => {
    render(<InterviewCard interview={mockInterview} />);
    const dateElement = screen.getByText((content, element) => {
      return element.tagName.toLowerCase() === "h2" && content.includes("25");
    });
    expect(dateElement).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes("Mins"))
    ).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes("candidates"))
    ).toBeInTheDocument();
  });

  it("renders action buttons", () => {
    render(<InterviewCard interview={mockInterview} />);
    expect(
      screen.getByRole("button", { name: /Copy Link/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Send/i })).toBeInTheDocument();
  });

  it("displays company name badge when provided", () => {
    render(<InterviewCard interview={mockInterview} />);
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
  });

  it("does not display company name badge when not provided", () => {
    const interviewNoCompany = { ...mockInterview, companyName: undefined };
    render(<InterviewCard interview={interviewNoCompany} />);
    expect(screen.queryByText("Acme Corp")).not.toBeInTheDocument();
  });

  it("shows feedback count from interview_feedback array", () => {
    render(<InterviewCard interview={mockInterview} />);
    expect(screen.getByText((c) => c.includes("2") && c.includes("candidates"))).toBeInTheDocument();
  });

  it("copies link to clipboard on Copy Link click", async () => {
    Object.assign(navigator, {
      clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
    });
    render(<InterviewCard interview={mockInterview} />);
    fireEvent.click(screen.getByRole("button", { name: /Copy Link/i }));
    await waitFor(() => expect(toast).toHaveBeenCalledWith("Copied"));
  });

  it("shows error toast when clipboard write fails", async () => {
    Object.assign(navigator, {
      clipboard: { writeText: jest.fn().mockRejectedValue(new Error("denied")) },
    });
    render(<InterviewCard interview={mockInterview} />);
    fireEvent.click(screen.getByRole("button", { name: /Copy Link/i }));
    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        "Unable to copy — please copy the link manually."
      )
    );
  });

  it("renders View button and link when viewDetail=true", () => {
    render(<InterviewCard interview={mockInterview} viewDetail={true} />);
    expect(screen.getByRole("button", { name: /View/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Copy Link/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Send/i })).not.toBeInTheDocument();
  });

  it("navigates to correct details URL when viewDetail=true", () => {
    render(<InterviewCard interview={mockInterview} viewDetail={true} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/scheduled-interview/abc123/details");
  });
});
