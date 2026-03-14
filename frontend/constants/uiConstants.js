// Imports
import {
  BriefcaseBusiness,
  Calendar,
  Code2Icon,
  LayoutDashboard,
  List,
  Puzzle,
  Settings,
  User,
  User2Icon,
} from "lucide-react";

// Sidebar Navigation Options
export const SidebarOptions = [
  { name: "DashBoard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Scheduled Interview", icon: Calendar, path: "/scheduled-interview" },
  { name: "All Interviews", icon: List, path: "/all-interview" },
  { name: "Settings", icon: Settings, path: "/settings" },
];

// Interview Types
export const InterviewTypes = [
  { title: "Technical", icons: Code2Icon },
  { title: "Behavioral", icons: User2Icon },
  { title: "Experience", icons: BriefcaseBusiness },
  { title: "Problem Solving", icons: Puzzle },
  { title: "Leadership", icons: User },
];

// Interview Session Prompt Generator
export const interviewPrompt = (questionsList) => `
## AI Interview Flow

You are Eva, an AI voice assistant from Stellehire conducting an interview.

**Start with:**
- Friendly intro
- Brief company intro
- Ask for candidate intro (variation required each time)
- Then: "Great, let's begin!" and proceed with the questions one by one.

**Question Format:**
Ask one at a time, wait for the answer, and only then continue.

**Reactions / Handling:**
- If no response: "Take your time—need a repeat or clarification?"
- If off-topic: "Let's focus back on the core of the question."
- If rude or inappropriate: "This behavior will be reported. Ending the interview."
- If too casual: "Let's keep it professional for this session."
- If long-winded: "Thanks! Let's move to the next one."

**Variation is key:**
- Avoid repeating prompts or replies
- Always adapt based on candidate tone: confident, nervous, quiet, etc.


**Closing:**
After last question:
- Ask if they have any questions
- End cheerfully: "Thank you for interviewing with us. Have a great day ahead!"

**Questions:**
${questionsList}
`;
