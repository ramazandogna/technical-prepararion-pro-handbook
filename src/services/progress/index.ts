/**
 * SM-2-lite spaced-review scheduler. Pure functions: no storage, no Date.now().
 */
import type { ProgressRecord, ProgressStatus, ReviewGrade } from '@/types/progress'

export const DEFAULT_EASE = 2.5
export const MIN_EASE = 1.3
export const MASTERED_INTERVAL_DAYS = 21
export const MAX_INTERVAL_DAYS = 365
/** "again" brings the question back after this many minutes. */
export const RELEARN_MINUTES = 10

const DAY_MS = 86_400_000

export const GRADE_CONFIDENCE: Record<ReviewGrade, number> = { again: 1, hard: 2, good: 4, easy: 5 }

export function defaultRecord(questionId: string, now: Date = new Date(0)): ProgressRecord {
  return {
    questionId,
    status: 'new',
    hintsRevealed: -1,
    answerRevealed: false,
    bookmarked: false,
    confidence: null,
    attempts: 0,
    lastGrade: null,
    intervalDays: 0,
    ease: DEFAULT_EASE,
    nextReviewAt: null,
    lastSeenAt: null,
    completedAt: null,
    updatedAt: now.toISOString(),
  }
}

const round1 = (n: number) => Math.round(n * 10) / 10
const clampEase = (e: number) => Math.max(MIN_EASE, Math.round(e * 100) / 100)
const clampInterval = (d: number) => Math.min(MAX_INTERVAL_DAYS, round1(d))

export function statusForInterval(intervalDays: number, passed: boolean): ProgressStatus {
  if (intervalDays >= MASTERED_INTERVAL_DAYS) return 'mastered'
  if (passed && intervalDays >= 1) return 'reviewing'
  return 'learning'
}

/** Apply a self-grade and return the next record (input is not mutated). */
export function schedule(record: ProgressRecord, grade: ReviewGrade, now: Date): ProgressRecord {
  const i = Math.max(0, Number.isFinite(record.intervalDays) ? record.intervalDays : 0)
  const ease = Number.isFinite(record.ease) ? record.ease : DEFAULT_EASE
  let interval: number
  let nextEase: number

  switch (grade) {
    case 'again':
      interval = 0
      nextEase = clampEase(ease - 0.2)
      break
    case 'hard':
      interval = clampInterval(Math.max(1, i * 1.2))
      nextEase = clampEase(ease - 0.15)
      break
    case 'good':
      interval = i < 1 ? 1 : i < 3 ? 3 : clampInterval(i * ease)
      nextEase = clampEase(ease)
      break
    case 'easy':
      interval = clampInterval(Math.max(1, i) * ease * 1.3)
      nextEase = clampEase(ease + 0.15)
      break
  }

  const passed = grade !== 'again'
  const status = passed ? statusForInterval(interval, true) : 'learning'
  const dueMs = interval === 0 ? RELEARN_MINUTES * 60_000 : interval * DAY_MS
  const iso = now.toISOString()

  return {
    ...record,
    status,
    intervalDays: interval,
    ease: nextEase,
    attempts: record.attempts + 1,
    lastGrade: grade,
    confidence: GRADE_CONFIDENCE[grade],
    nextReviewAt: new Date(now.getTime() + dueMs).toISOString(),
    lastSeenAt: iso,
    completedAt: status === 'mastered' ? (record.completedAt ?? iso) : record.completedAt,
    updatedAt: iso,
  }
}

/** Manually set a status (e.g. "I already know this"), keeping the schedule coherent. */
export function applyStatus(record: ProgressRecord, status: ProgressStatus, now: Date): ProgressRecord {
  const iso = now.toISOString()
  if (status === 'new') {
    return { ...record, status, intervalDays: 0, nextReviewAt: null, completedAt: null, updatedAt: iso }
  }
  let intervalDays = record.intervalDays
  if (status === 'learning') intervalDays = 0
  if (status === 'reviewing') intervalDays = Math.min(Math.max(1, intervalDays), MASTERED_INTERVAL_DAYS - 1)
  if (status === 'mastered') intervalDays = Math.max(MASTERED_INTERVAL_DAYS, intervalDays)
  return {
    ...record,
    status,
    intervalDays,
    nextReviewAt: new Date(now.getTime() + intervalDays * DAY_MS).toISOString(),
    completedAt: status === 'mastered' ? (record.completedAt ?? iso) : record.completedAt,
    updatedAt: iso,
  }
}

export function isDue(record: ProgressRecord, now: Date): boolean {
  return record.nextReviewAt !== null && Date.parse(record.nextReviewAt) <= now.getTime()
}
