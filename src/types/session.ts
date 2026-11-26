/**
 * STUDY-SESSION CONTRACT. A role plan is an ordered list of slots; the session engine
 * (src/services/session) fills each slot with the next unfinished questions that match it.
 */
import type { Difficulty, Priority, QuestionType, TrackId } from './content'

export type RoleId = 'fullstack' | 'frontend' | 'backend' | 'software-engineer' | 'pm'

export interface SessionSlot {
  /** stable kebab id, unique within the plan */
  id: string
  /** what the learner sees, e.g. "Algorithm warm-up" */
  label: string
  /** one sentence: why the panel put this slot here */
  why: string
  /** questions to draw for this slot */
  count: number
  /** candidate pool: questions from these tracks… */
  trackIds: TrackId[]
  /** …optionally narrowed to these types / difficulties / priorities / tags (any-of within each list) */
  types?: QuestionType[]
  difficulty?: Difficulty[]
  priority?: Priority[]
  tags?: string[]
}

export interface RolePlan {
  role: RoleId
  title: string
  /** one line under the title on the home screen */
  tagline: string
  status: 'active' | 'coming-soon'
  /** rough session length the slots add up to */
  minutes: number
  slots: SessionSlot[]
  /** the panel's reasoning, shown on the plan page: 3–6 short bullets */
  panelNotes: string[]
}

/** A started session, persisted so the app resumes exactly where the learner left it. */
export interface StudySession {
  role: RoleId
  /** YYYY-MM-DD the session was built */
  date: string
  /** ordered question ids with the slot each came from */
  items: { questionId: string; slotId: string }[]
  /** question ids the learner finished (closed or skipped) in this session */
  done: string[]
  startedAt: string
  updatedAt: string
}
