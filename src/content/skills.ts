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
    id: "backend",
    title: "Backend & full stack",
    blurb: "Comfortable owning the other side of the boundary: routes, migrations, auth and integrations.",
    skills: [
      ...s(
        "proficient",
        "Node.js, Express, Python, Django, REST APIs, GraphQL APIs, SQL, Migrations, Auth, Event-driven workflows, Message queues",
      ),
      ...s("familiar", "PostgreSQL, Relational design, Service-oriented architecture"),
    ],
    ask: "What kind of backend work are you comfortable owning?",
  },
  {
    id: "ai",
    title: "AI & LLM",
    blurb: "Customer-facing AI features with structured outputs, where application rules stay deterministic.",
    skills: [
      ...s(
        "proficient",
        "AI product integration, Structured outputs, Prompt engineering, AI interaction design, Gemini APIs, Claude Code, Reviewing AI code",
      ),
      ...s("familiar", "MCP, Agent patterns, Tool-based workflows, LLM orchestration"),
    ],
    ask: "How do you design AI features users can trust?",
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
