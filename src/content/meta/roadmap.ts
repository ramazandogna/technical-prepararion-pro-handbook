import type { RoadmapPhase } from '@/types/content'

/** Learning progression. Owned by the curriculum architect (may refine wording, keep ids). */
export const roadmap: RoadmapPhase[] = [
  {
    phase: 1,
    title: 'Foundations',
    summary: 'How interviews work, the problem-solving patterns behind coding rounds, and real depth in the two languages you use every day.',
    weeks: 'Weeks 1–4',
    trackIds: ['interview-process', 'cs-fundamentals', 'javascript', 'typescript'],
    goals: [
      'Run every coding problem through the same loop out loud: clarify, examples, approach, complexity, code, test',
      'Recognise the 12–15 core algorithmic patterns and solve a medium problem in TypeScript in about 30 minutes',
      'Explain the event loop, closures, this and prototypes with a code example, without notes',
      'Use generics, narrowing and discriminated unions to model real API data safely',
    ],
  },
  {
    phase: 2,
    title: 'Product Engineering Core',
    summary: 'The frontend and backend stack behind a full-stack product role.',
    weeks: 'Weeks 5–9',
    trackIds: ['frontend', 'react', 'vue', 'nextjs', 'backend', 'databases'],
    goals: [
      'Explain the critical rendering path and fix a Core Web Vitals regression with DevTools',
      'Compare the React and Vue rendering and reactivity models and defend a choice for a given product',
      'Choose between SSR, SSG, CSR and streaming in Next.js and Nuxt, and explain hydration costs',
      'Design a REST API and a normalised PostgreSQL schema with indexes, transactions and caching',
    ],
  },
  {
    phase: 3,
    title: 'Systems & Delivery',
    summary: 'Computing fundamentals, delivery, security and quality — the gaps practical experience often leaves.',
    weeks: 'Weeks 10–13',
    trackIds: ['operating-systems', 'networking', 'computer-architecture', 'languages-compilers', 'devops', 'security', 'testing'],
    goals: [
      'Explain processes, threads, memory and I/O well enough to reason about Node.js performance',
      'Trace one HTTP request end to end: DNS, TCP/TLS, HTTP/2–3, CDN, server, and back',
      'Describe your Docker and CI/CD setup as a deliberate design, including observability and rollback',
      'Identify and mitigate OWASP Top 10 risks, and outline a test strategy for a full-stack feature',
    ],
  },
  {
    phase: 4,
    title: 'Design & Interview Readiness',
    summary: 'System design, your stories, and the Tokyo market — turning knowledge into offers.',
    weeks: 'Weeks 14–16',
    trackIds: ['system-design', 'behavioral', 'japan-career'],
    goals: [
      'Deliver a 45-minute system design with clear requirements, trade-offs and one deep dive',
      'Tell 8–10 STAR stories and 3 project deep dives from your Efilli work and your own projects',
      'Prepare a self-introduction and motivation answers in English and in simple Japanese',
      'Run at least three full mock loops and tailor your preparation to each company type you target',
    ],
  },
]
