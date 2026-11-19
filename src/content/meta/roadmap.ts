import type { RoadmapPhase } from '@/types/content'

/** Learning progression. Owned by the curriculum architect (may refine wording, keep ids). */
export const roadmap: RoadmapPhase[] = [
  {
    phase: 1,
    title: 'Foundations',
    summary: 'Interview mechanics, problem-solving patterns and the languages you code in every day.',
    weeks: 'Weeks 1–4',
    trackIds: ['interview-process', 'cs-fundamentals', 'javascript', 'typescript'],
    goals: [],
  },
  {
    phase: 2,
    title: 'Product Engineering Core',
    summary: 'The frontend and backend stack behind a full-stack product role.',
    weeks: 'Weeks 5–9',
    trackIds: ['frontend', 'react', 'vue', 'nextjs', 'backend', 'databases'],
    goals: [],
  },
  {
    phase: 3,
    title: 'Systems & Delivery',
    summary: 'Computing fundamentals, delivery, security and quality — the gaps practical experience often leaves.',
    weeks: 'Weeks 10–13',
    trackIds: ['operating-systems', 'networking', 'computer-architecture', 'languages-compilers', 'devops', 'security', 'testing'],
    goals: [],
  },
  {
    phase: 4,
    title: 'Design & Interview Readiness',
    summary: 'System design, your stories, and the Tokyo market — turning knowledge into offers.',
    weeks: 'Weeks 14–16',
    trackIds: ['system-design', 'behavioral', 'japan-career'],
    goals: [],
  },
]
