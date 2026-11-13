export type Depth = "expert" | "proficient" | "familiar";
export type SkillArea = {
  id: string;
  title: string;
  blurb: string;
  skills: { name: string; depth: Depth }[];
  ask: string;
};

const s = (depth: Depth, list: string) => list.split(", ").map((name) => ({ name, depth }));

export const areas: SkillArea[] = [
  {
    id: "frontend",
    title: "Frontend",
    blurb: "Architecture for complex, interactive products, plus the production debugging that comes with them.",
    skills: [
      ...s(
        "expert",
        "TypeScript, React, Next.js, Component architecture, State management, Accessibility, Frontend architecture",
      ),
      ...s(
        "proficient",
        "GraphQL, Apollo Client, Redux, SWR, React Native, Nx monorepos, Cross-tab sync, OAuth flows, Offline-capable apps",
      ),
      ...s("familiar", "Mobile release workflows, Background sync"),
    ],
    ask: "How do you approach frontend architecture for a complex product?",
  },
  {
    id: "backend",
    title: "Backend & full stack",
    blurb: "APIs, data models and background systems, and the concurrency, reliability and performance work that keeps them correct under load.",
    skills: [
      ...s(
        "proficient",
        "Python, FastAPI, Django, Node.js, Express, PostgreSQL, Relational design, Redis, REST APIs, GraphQL APIs, Migrations, Auth, Event-driven workflows, Message queues, Load testing",
      ),
      ...s("familiar", "Service-oriented architecture, Observability, WebSockets at scale"),
    ],
    ask: "Tell me about a backend system you designed and built.",
  },
  {
    id: "ai",
    title: "AI & LLM",
    blurb: "AI features and agents built so that application rules stay deterministic: the model proposes, code and people decide, and evals measure it.",
    skills: [
      ...s(
        "proficient",
        "AI product integration, Agents with tool calling, Human-in-the-loop approval, Evals, Structured outputs, Prompt engineering, AI interaction design, Gemini APIs, Claude Code, Reviewing AI code",
      ),
      ...s("familiar", "MCP, LLM orchestration"),
    ],
    ask: "How do you design AI features users can trust?",
  },
  {
    id: "design",
    title: "Design systems & UX",
    blurb: "Systems that make the next feature easier: tokens, predictable interactions, and every state designed.",
    skills: [
      ...s(
        "expert",
        "Tailwind CSS, Design tokens, Reusable component systems, Interaction states, Visual hierarchy, Responsive design",
      ),
      ...s("proficient", "Storybook, Sass, Dark mode systems, Design-system architecture, Figma handoff"),
    ],
    ask: "What makes a component library actually good?",
  },
  {
    id: "dataviz",
    title: "Data visualization",
    blurb: "Interactive scientific charts with 250,000+ points, with performance treated as a whole-pipeline problem.",
    skills: [
      ...s(
        "expert",
        "D3, Plotly, Scientific visualization, Large datasets, Rendering strategy, Visualization performance",
      ),
      ...s("proficient", "Volcano, violin & dot plots, Exploration interfaces"),
    ],
    ask: "How do you keep a chart with 250k points responsive?",
  },
  {
    id: "quality",
    title: "Quality & delivery",
    blurb: "Pragmatic tests around the flows that matter, and real ownership after code ships.",
    skills: [
      ...s(
        "proficient",
        "Playwright, Jest, React Testing Library, CI/CD, Vercel, Sentry, Docker, Production debugging",
      ),
      ...s("familiar", "AWS S3, CloudFront, Amplify, Cognito"),
    ],
    ask: "What's your testing philosophy?",
  },
];
