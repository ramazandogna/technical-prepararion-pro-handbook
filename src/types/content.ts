/**
 * CONTENT CONTRACT — owned by the Team Lead. Do not change shapes without Team Lead approval.
 * Content is static, typed TypeScript data in src/content/. UI renders it; persistence never stores it.
 */

/** Ordered A..T. Each track lives in src/content/tracks/<id>.ts and default-exports a Track. */
export type TrackId =
  | 'interview-process' // A
  | 'cs-fundamentals' // B  (DSA + algorithmic patterns)
  | 'javascript' // C
  | 'typescript' // D
  | 'frontend' // E
  | 'react' // F
  | 'vue' // G
  | 'nextjs' // H
  | 'backend' // I  (Node.js, HTTP/REST, NestJS)
  | 'databases' // J
  | 'operating-systems' // K
  | 'networking' // L
  | 'computer-architecture' // M
  | 'languages-compilers' // N
  | 'system-design' // O
  | 'devops' // P  (Docker, CI/CD, Linux, deployment, observability)
  | 'security' // Q  (web + API security)
  | 'testing' // R  (testing concepts & quality)
  | 'behavioral' // S  (behavioral + project deep dives, personalized)
  | 'japan-career' // T  (Tokyo market, English/Japanese processes, recruiter screens)

export type QuestionType =
  | 'concept' // explain / compare / define
  | 'coding' // write code (live-coding style)
  | 'output' // "what does this print?"
  | 'debugging' // find and fix the bug
  | 'system-design' // open design prompt
  | 'tradeoff' // A vs B, when and why
  | 'multiple-choice' // has `choices`
  | 'behavioral' // STAR story prompts
  | 'project-deep-dive' // explain your own project/experience

export type Difficulty = 'foundation' | 'core' | 'advanced'

/** How likely this comes up / how much it matters for the learner's target roles. */
export type Priority = 'must' | 'should' | 'nice'

export type CompanyType = 'startup' | 'mid-size' | 'big-tech' | 'japan-international' | 'japan-traditional'

export type RoleFocus = 'frontend' | 'backend' | 'full-stack' | 'general'

export interface CodeSnippet {
  /** highlight.js language id: 'javascript' | 'typescript' | 'sql' | 'bash' | 'json' | 'yaml' | 'html' | 'css' | 'xml' | 'plaintext' | 'python' */
  language: string
  source: string
}

export interface Choice {
  id: string
  /** Markdown allowed (inline). */
  text: string
  correct: boolean
  explanation?: string
}

export interface Reference {
  label: string
  url: string
}

export interface Question {
  /** Globally unique, stable, kebab-case, prefixed by track short code, e.g. 'js-closure-counter'. NEVER rename once shipped (progress is keyed by it). */
  id: string
  title: string
  type: QuestionType
  difficulty: Difficulty
  priority: Priority
  /** lowercase kebab tags, used by search + filters */
  tags: string[]
  /** realistic time to answer in an interview */
  estMinutes: number
  roles?: RoleFocus[]
  companyTypes?: CompanyType[]
  /** Markdown. The question as an interviewer would ask it. */
  prompt: string
  /** Optional snippet shown with the prompt (output/debugging/coding questions). */
  code?: CodeSnippet
  /** Required when type === 'multiple-choice'. */
  choices?: Choice[]
  /** Progressive hints, gentle → strong. 1–3 items. */
  hints: string[]
  /** Markdown model answer. Fenced code blocks allowed (```ts). */
  answer: string
  /** What the interviewer is listening for. 3–6 bullets. */
  keyPoints: string[]
  /** Common wrong answers / traps. */
  pitfalls?: string[]
  /** Likely follow-up questions. */
  followUps?: string[]
  /** How to connect this to the learner's own experience (Efilli, scraping, REI-KIT, ...). */
  personalAngle?: string
  references?: Reference[]
}

export interface Module {
  /** unique within the app, kebab-case, e.g. 'js-async' */
  id: string
  title: string
  summary: string
  questions: Question[]
}

export interface Track {
  id: TrackId
  /** 'A'..'T' */
  code: string
  title: string
  /** one sentence */
  summary: string
  /** why this matters for THIS learner, 1–3 sentences */
  rationale: string
  /** lucide-vue-next icon name in PascalCase, e.g. 'Braces' */
  icon: string
  /** roadmap phase this track belongs to (see meta/roadmap.ts) */
  phase: 1 | 2 | 3 | 4
  modules: Module[]
}

export interface RoadmapPhase {
  phase: 1 | 2 | 3 | 4
  title: string
  summary: string
  weeks: string
  trackIds: TrackId[]
  goals: string[]
}

export interface InterviewStage {
  id: string
  name: string
  description: string
  whatTheyEvaluate: string[]
  howToPrepare: string[]
  /** which company types commonly use it */
  commonAt: CompanyType[]
}

export interface CompanyProfile {
  type: CompanyType
  label: string
  summary: string
  typicalLoop: string[]
  emphasis: string[]
  notes?: string
}

export interface ResearchSource {
  label: string
  url: string
  kind: 'official-guide' | 'engineering-blog' | 'book' | 'documentation' | 'community'
  note?: string
}

export interface ResearchMeta {
  methodology: string // markdown
  stages: InterviewStage[]
  companies: CompanyProfile[]
  sources: ResearchSource[]
  lastReviewed: string // ISO date
}
