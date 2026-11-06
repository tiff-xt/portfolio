import { describe, expect, it } from "vitest";
import { checkTopic } from "@/lib/ai/guard";

describe("checkTopic", () => {
  it.each([
    "What salary are you looking for?",
    "Are you interviewing anywhere right now?",
    "Which companies have you worked for?",
    "Where did you work before?",
    "What's your hourly rate?",
  ])("declines: %s", (q) => {
    expect(checkTopic(q).allowed).toBe(false);
  });

  it.each([
    "How do you handle rate limiting in APIs?",
    "What frame rate do your visualizations hit?",
    "How do you design a page layout?",
    "How do you handle authentication state across tabs?",
    "What's your approach to design systems?",
  ])("allows technical question: %s", (q) => {
    expect(checkTopic(q).allowed).toBe(true);
  });
});
