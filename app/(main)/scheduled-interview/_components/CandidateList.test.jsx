import { render, screen, fireEvent } from "@testing-library/react";
import CandidateList from "./CandidateList";
import moment from "moment";

jest.mock("./CandidateFeedbackDialogBox", () => {
  return function MockFeedbackDialog({ candidate }) {
    return <div data-testid={`feedback-dialog-${candidate.userName}`} />;
  };
});

describe("CandidateList Component", () => {
  const mockCandidates = [
    {
      userName: "John Doe",
      userEmail: "john@example.com",
      created_at: "2025-10-31T10:00:00Z",
      feedback: {
        feedback: {
          rating: {
            OverallRating: "8",
          },
        },
      },
    },
    {
      userName: "Jane Smith",
      userEmail: "jane@example.com",
      created_at: "2025-10-31T11:00:00Z",
      feedback: {
        feedback: {
          rating: {
            OverallRating: "4",
          },
        },
      },
    },
  ];

  it("renders the list of candidates with count", () => {
    render(<CandidateList CandidateDetails={mockCandidates} />);
    expect(screen.getByText("Candidate List (2)")).toBeInTheDocument();
  });

  it("displays candidate information and completion dates", () => {
    render(<CandidateList CandidateDetails={mockCandidates} />);

    mockCandidates.forEach((candidate) => {
      expect(screen.getByText(candidate.userName)).toBeInTheDocument();
      // Use a custom text matcher for the completion date since it's split across elements
      // Verify completion date display
      const candidateContainer = screen
        .getByText(candidate.userName)
        .closest("div");
      const completionText = candidateContainer.querySelector(
        ".text-sm.text-muted-foreground"
      );
      expect(completionText).toHaveTextContent("Completed on:");
      expect(completionText).toHaveTextContent(
        moment(candidate.created_at).format("MMM DD, YYYY")
      );
    });
  });

  it("shows candidate ratings with correct colors", () => {
    render(<CandidateList CandidateDetails={mockCandidates} />);

    // Check high rating (green)
    const highRating = screen.getByText("8/10");
    expect(highRating.className).toContain("text-green-600");

    // Check low rating (red)
    const lowRating = screen.getByText("4/10");
    expect(lowRating.className).toContain("text-red-600");
  });

  it("renders no candidates message when list is empty", () => {
    render(<CandidateList CandidateDetails={[]} />);
    expect(screen.getByText("No candidates found")).toBeInTheDocument();
  });

  it("renders feedback dialog for each candidate", () => {
    render(<CandidateList CandidateDetails={mockCandidates} />);

    mockCandidates.forEach((candidate) => {
      expect(
        screen.getByTestId(`feedback-dialog-${candidate.userName}`)
      ).toBeInTheDocument();
    });
  });

  it("shows dash for candidate with null rating", () => {
    const candidatesWithNull = [
      {
        userName: "No Rating",
        userEmail: "norating@example.com",
        created_at: "2025-10-31T10:00:00Z",
        feedback: { feedback: { rating: { OverallRating: null } } },
      },
    ];
    render(<CandidateList CandidateDetails={candidatesWithNull} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("shows gray color for rating equal to 5", () => {
    const candidatesWithFive = [
      {
        userName: "Mid Rating",
        userEmail: "mid@example.com",
        created_at: "2025-10-31T10:00:00Z",
        feedback: { feedback: { rating: { OverallRating: "5" } } },
      },
    ];
    render(<CandidateList CandidateDetails={candidatesWithFive} />);
    const rating = screen.getByText("5/10");
    expect(rating.className).toContain("text-gray-600");
  });

  it("filters candidates by min rating", () => {
    render(<CandidateList CandidateDetails={mockCandidates} />);
    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "6" } });
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument();
  });

  it("filters candidates by max rating", () => {
    render(<CandidateList CandidateDetails={mockCandidates} />);
    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[1], { target: { value: "5" } });
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
  });

  it("shows reset button when filter is active and resets on click", () => {
    render(<CandidateList CandidateDetails={mockCandidates} />);
    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "6" } });
    const resetBtn = screen.getByRole("button", { name: /Reset/i });
    expect(resetBtn).toBeInTheDocument();
    fireEvent.click(resetBtn);
    expect(screen.getByText("Candidate List (2)")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Reset/i })).not.toBeInTheDocument();
  });

  it("shows 'no candidates match rating' message when filter excludes all", () => {
    render(<CandidateList CandidateDetails={mockCandidates} />);
    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "9" } });
    expect(screen.getByText(/No candidates match rating/i)).toBeInTheDocument();
  });

  it("shows filtered count with total when filter is active", () => {
    render(<CandidateList CandidateDetails={mockCandidates} />);
    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "6" } });
    expect(screen.getByText(/of 2/i)).toBeInTheDocument();
  });

  it("clamps minRating up when min exceeds max", () => {
    render(<CandidateList CandidateDetails={mockCandidates} />);
    const selects = screen.getAllByRole("combobox");
    // Set max to 3 first
    fireEvent.change(selects[1], { target: { value: "3" } });
    // Now set min to 5 — should clamp max up to 5
    fireEvent.change(selects[0], { target: { value: "5" } });
    // Both selects should show 5
    expect(selects[0].value).toBe("5");
    expect(selects[1].value).toBe("5");
  });
});
