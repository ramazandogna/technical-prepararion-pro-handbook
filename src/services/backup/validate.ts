/**
 * Hand-written runtime validators for persisted / imported data.
 * Each `normalize*` returns a clean object (unknown fields stripped) or null if invalid.
 * Used by backup import AND when loading from IndexedDB (defensive).
 */
import {
  DEFAULT_SETTINGS,
  type ActivityDay,
  type AppSettings,
  type Note,
  type ProgressRecord,
  type ProgressStatus,
  type ReviewGrade,
} from '@/types/progress'
import type { RoleId, StudySession } from '@/types/session'

type Obj = Record<string, unknown>

const STATUSES: readonly ProgressStatus[] = ['new', 'learning', 'reviewing', 'mastered']
const GRADES: readonly ReviewGrade[] = ['again', 'hard', 'good', 'easy']
const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/
const MAX_NOTE_LENGTH = 200_000

export const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v)
const isStr = (v: unknown): v is string => typeof v === 'string'
const isNonEmptyStr = (v: unknown): v is string => isStr(v) && v.length > 0 && v.length <= 200
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
const isInt = (v: unknown): v is number => isNum(v) && Number.isInteger(v)
const isBool = (v: unknown): v is boolean => typeof v === 'boolean'
export const isIso = (v: unknown): v is string => isStr(v) && v.length <= 40 && !Number.isNaN(Date.parse(v))
const isIsoOrNull = (v: unknown): v is string | null => v === null || isIso(v)

export function normalizeProgressRecord(raw: unknown): ProgressRecord | null {
  if (!isObj(raw)) return null
  const r = raw
  if (!isNonEmptyStr(r.questionId)) return null
  if (!isStr(r.status) || !STATUSES.includes(r.status as ProgressStatus)) return null
  if (!isInt(r.hintsRevealed) || r.hintsRevealed < -1 || r.hintsRevealed > 100) return null
  if (!isBool(r.answerRevealed) || !isBool(r.bookmarked)) return null
  if (r.confidence !== null && !(isNum(r.confidence) && r.confidence >= 0 && r.confidence <= 5)) return null
  if (!isInt(r.attempts) || r.attempts < 0) return null
  if (r.lastGrade !== null && !(isStr(r.lastGrade) && GRADES.includes(r.lastGrade as ReviewGrade))) return null
  if (!isNum(r.intervalDays) || r.intervalDays < 0 || r.intervalDays > 36500) return null
  if (!isNum(r.ease) || r.ease < 1 || r.ease > 10) return null
  if (!isIsoOrNull(r.nextReviewAt) || !isIsoOrNull(r.lastSeenAt) || !isIsoOrNull(r.completedAt)) return null
  if (!isIso(r.updatedAt)) return null
  return {
    questionId: r.questionId,
    status: r.status as ProgressStatus,
    hintsRevealed: r.hintsRevealed,
    answerRevealed: r.answerRevealed,
    bookmarked: r.bookmarked,
    confidence: r.confidence as number | null,
    attempts: r.attempts,
    lastGrade: r.lastGrade as ReviewGrade | null,
    intervalDays: r.intervalDays,
    ease: r.ease,
    nextReviewAt: r.nextReviewAt,
    lastSeenAt: r.lastSeenAt,
    completedAt: r.completedAt,
    updatedAt: r.updatedAt,
    ...(Array.isArray(r.stamps)
      ? { stamps: [...new Set(r.stamps.filter((x): x is string => isStr(x) && /^[a-z]+-\d{1,3}$/.test(x)))].slice(0, 100) }
      : {}),
  }
}

const ROLES: readonly RoleId[] = ['fullstack', 'frontend', 'backend', 'software-engineer', 'pm']

/** A persisted / imported study session, or null when absent or invalid. */
export function normalizeSession(raw: unknown): StudySession | null {
  if (!isObj(raw)) return null
  if (!isStr(raw.role) || !ROLES.includes(raw.role as RoleId)) return null
  if (!isStr(raw.date) || !DATE_KEY.test(raw.date)) return null
  if (!isIso(raw.startedAt) || !isIso(raw.updatedAt)) return null
  if (!Array.isArray(raw.items) || raw.items.length > 50 || !Array.isArray(raw.done)) return null
  const items: StudySession['items'] = []
  for (const it of raw.items) {
    if (!isObj(it) || !isNonEmptyStr(it.questionId) || !isNonEmptyStr(it.slotId)) return null
    items.push({ questionId: it.questionId, slotId: it.slotId })
  }
  const ids = new Set(items.map((i) => i.questionId))
  const done = [...new Set(raw.done.filter((d): d is string => isStr(d) && ids.has(d)))]
  return { role: raw.role as RoleId, date: raw.date, items, done, startedAt: raw.startedAt, updatedAt: raw.updatedAt }
}

export function normalizeNote(raw: unknown): Note | null {
  if (!isObj(raw)) return null
  if (!isNonEmptyStr(raw.questionId)) return null
  if (!isStr(raw.body) || raw.body.trim() === '' || raw.body.length > MAX_NOTE_LENGTH) return null
  if (!isIso(raw.createdAt) || !isIso(raw.updatedAt)) return null
  return { questionId: raw.questionId, body: raw.body, createdAt: raw.createdAt, updatedAt: raw.updatedAt }
}

export function normalizeActivityDay(raw: unknown): ActivityDay | null {
  if (!isObj(raw)) return null
  if (!isStr(raw.date) || !DATE_KEY.test(raw.date)) return null
  const counts = [raw.reviewed, raw.mastered, raw.notesEdited]
  if (!counts.every((c) => isInt(c) && c >= 0)) return null
  return {
    date: raw.date,
    reviewed: raw.reviewed as number,
    mastered: raw.mastered as number,
    notesEdited: raw.notesEdited as number,
  }
}

/** Settings are merged field-by-field over defaults: invalid fields fall back, never fail. */
export function normalizeSettings(raw: unknown): AppSettings {
  const s: AppSettings = { ...DEFAULT_SETTINGS }
  if (!isObj(raw)) return s
  if (isInt(raw.dailyGoal) && raw.dailyGoal >= 1 && raw.dailyGoal <= 500) s.dailyGoal = raw.dailyGoal
  if (isBool(raw.showPersonalAngle)) s.showPersonalAngle = raw.showPersonalAngle
  if (isBool(raw.hideAnswersByDefault)) s.hideAnswersByDefault = raw.hideAnswersByDefault
  if (isBool(raw.onboardingDismissed)) s.onboardingDismissed = raw.onboardingDismissed
  if (isIsoOrNull(raw.lastBackupAt)) s.lastBackupAt = raw.lastBackupAt
  return s
}

/** Normalizes a list, dropping invalid items and de-duplicating by key (newest `updatedAt` wins when present). */
export function normalizeList<T>(
  items: readonly unknown[],
  normalize: (raw: unknown) => T | null,
  keyOf: (item: T) => string,
  newer?: (a: T, b: T) => boolean,
): { items: T[]; dropped: number } {
  const map = new Map<string, T>()
  let dropped = 0
  for (const raw of items) {
    const item = normalize(raw)
    if (!item) {
      dropped++
      continue
    }
    const key = keyOf(item)
    const existing = map.get(key)
    if (existing) {
      dropped++
      if (newer && !newer(item, existing)) continue
    }
    map.set(key, item)
  }
  return { items: [...map.values()], dropped }
}

export const newerByUpdatedAt = <T extends { updatedAt: string }>(a: T, b: T): boolean =>
  Date.parse(a.updatedAt) > Date.parse(b.updatedAt)
