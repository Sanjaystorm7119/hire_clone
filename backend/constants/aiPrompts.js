// Question Generation Prompt
export const QUESTIONS_PROMPT = `You are an expert AI interviewer. Generate **{{duration}}** diverse questions in JSON format based on the following inputs:

- Job Title: {{jobTitle}}
- Description: {{jobDescription}}
- Interview Type: {{type}}
- Company: {{companyDetails}}

**Output Format (JSON only):**
interviewQuestions = [
  { question: "", type: "Technical | Behavioral | Experience | Problem Solving | Leadership" }
]

**Important:**
- Return exactly {{duration}} questions (1 per minute)
- No answers or explanations
- Ensure variety: conceptual, practical, debugging, best practices, etc.
- Return only valid JSON
`;

// Feedback Generator Prompt
export const FEEDBACK = `{{conversation}}

If the interview is < 60 seconds, return this:
{
  "feedback": {
    "rating": {
      "technicalSkills": 1,
      "communicationSkills": 1,
      "problemSolving": 1,
      "experience": 1,
      "OverallRating": 1
    },
    "summary": [
      "Insufficient technical information.",
      "Communication could not be assessed.",
      "Problem-solving was not discussed.",
      "Experience was not discussed.",
      "overall rating: 1"
    ],
    "Recommendation": "not recommended",
    "RecommendationMessage": "too little information to progress"
  }
}

Otherwise, analyze the conversation and return:

{
  "feedback": {
    "rating": {
      "technicalSkills": <1-10>,
      "communicationSkills": <1-10>,
      "problemSolving": <1-10>,
      "experience": <1-10>,
      "OverallRating": <1-10>
    },
    "summary": [
      "<Technical summary>",
      "<Behavioral summary>",
      "<Problem-solving summary>",
      "<Experience summary>",
      "overall rating: <rounded value>"
    ],
    "Recommendation": "<recommended | not recommended>",
    "RecommendationMessage": "<short lowercase reason>"
  }
}
`;
