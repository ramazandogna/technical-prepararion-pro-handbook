import type { StudySession } from './session'

/**
 * PERSISTENCE CONTRACT — owned by the Team Lead; implemented by the Data/Persistence engineer.
 * All user data is local (IndexedDB). Records reference content by Question.id only.
 */

export type ProgressStatus = 'new' | 'learning' | 'reviewing' | 'mastered'

/** Self-grade after attempting a question. Drives the spaced-review schedule. */
export type ReviewGrade = 'again' | 'hard' | 'good' | 'easy'

export interface ProgressRecord {
  questionId: string
  status: ProgressStatus
  /** highest hint index revealed (-1 = none) */
  hintsRevealed: number
  answerRevealed: boolean
  bookmarked: boolean
  /** 0..5 self-reported confidence, null when never graded */
  confidence: number | null
  attempts: number
  lastGrade: ReviewGrade | null
  /** spaced repetition state */
  intervalDays: number
  ease: number
  /** ISO timestamps */
  nextReviewAt: string | null
  lastSeenAt: string | null
  completedAt: string | null
  updatedAt: string
  /** "learned" stamps the learner pressed on this question: 'step-<i>' (walkthrough) and 'kp-<i>' (key points). */
  stamps?: string[]
}

export interface Note {
  questionId: string
  body: string
  createdAt: string
  updatedAt: string
}

export interface ActivityDay {
  /** YYYY-MM-DD in local time */
  date: string
  reviewed: number
  mastered: number
  notesEdited: number
}

export type ThemeChoice = 'system' | 'light' | 'dark'

export interface AppSettings {
  dailyGoal: number
  showPersonalAngle: boolean
  /** hide answers until explicitly revealed (always true in Alpha but kept configurable) */
  hideAnswersByDefault: boolean
  onboardingDismissed: boolean
  lastBackupAt: string | null
}

export const DEFAULT_SETTINGS: AppSettings = {
  dailyGoal: 5,
  showPersonalAngle: true,
  hideAnswersByDefault: true,
  onboardingDismissed: false,
  lastBackupAt: null,
}

export interface BackupFile {
  app: 'interview-os'
  /** backup format version — bump with a migration in services/backup */
  schemaVersion: number
  exportedAt: string
  progress: ProgressRecord[]
  notes: Note[]
  activity: ActivityDay[]
  settings: AppSettings
  /** the study session in progress (optional; absent in older backups) */
  session?: StudySession | null
}

export type RestoreMode = 'merge' | 'replace'
