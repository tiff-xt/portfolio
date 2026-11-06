/**
 * Deterministic topic policy, checked before any model call. The model is told
 * the same rules, but correctness doesn't depend on it following them.
 */
const RULES: { topic: string; pattern: RegExp }[] = [
  {
    topic: "compensation",
    pattern:
      /\b(salary|salaries|compensation|pay (range|expectations?|band)|hourly rate|day rate|stock options|how much (do|would|does) (you|she|he|they) (make|earn|charge|cost))\b/i,
  },
  {
    topic: "job search",
    pattern:
      /\b(interview(s|ing)?|recruit(er|ers|ing)?|job (search|hunt|offer|application)s?|appl(y|ying|ied|ication)s? (to|for|at)|offer letter|hiring process|notice period|why (are|is) (you|she|he|they) leaving|looking for (a )?(new )?(job|role))\b/i,
  },
  {
    topic: "employers",
    pattern:
      /\b((which|what|where) (compan(y|ies)|employers?|firms?)|who (do|did) (you|she|he|they) work (for|at)|where (do|did) (you|she|he|they) work|current employer|previous employer|past employers?|former employer)\b/i,
  },
  {
    topic: "personal details",
    pattern:
      /\b(home address|phone number|where (do|does) (you|she|he|they) live|how old (are|is)|date of birth|married|religion)\b/i,
  },
];

export type GuardResult = { allowed: true } | { allowed: false; topic: string; reply: string };

export function checkTopic(question: string): GuardResult {
  const hit = RULES.find((r) => r.pattern.test(question));
  if (!hit) return { allowed: true };
  return {
    allowed: false,
    topic: hit.topic,
    reply:
      hit.topic === "employers"
        ? "I keep this assistant focused on the work itself rather than on specific employers. Happy to go deep on the kinds of problems, systems and interfaces involved, though. Try asking how I approach large-dataset visualization or real-time shared state."
        : `That's outside what this assistant covers (${hit.topic}). It's here for technical skills, ways of working and interests. Want to ask about frontend architecture, design systems or AI features instead?`,
  };
}
