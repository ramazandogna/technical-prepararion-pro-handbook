import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { addDays, toDateKey } from 'rei-kit'
import { allQuestionIds, getEntry, trackQuestionIds } from '@/content'
import type { ActivityDay, ProgressRecord, ProgressStatus, ReviewGrade } from '@/types/progress'
import { applyStatus, defaultRecord, schedule } from '@/services/progress'
import {
  activityRepo,
  describeStorageError,
  getAdapter,
  getStorageStatus,
  progressRepo,
} from '@/services/storage'
import { normalizeActivityDay, normalizeList, normalizeProgressRecord, newerByUpdatedAt } from '@/services/backup/validate'

type ActivityField = 'reviewed' | 'mastered' | 'notesEdited'

const TICK_MS = 30_000

export const useProgressStore = defineStore('progress', () => {
  const ready = ref(false)
  const error = ref<string | null>(null)
  const records = ref<Record<string, ProgressRecord>>({})
  const activity = ref<Record<string, ActivityDay>>({})

  /** Ticking clock so `dueIds`, `todayCount`, `streak` stay fresh in long sessions. */
  const now = ref(Date.now())
  let ticker: ReturnType<typeof setInterval> | undefined

  // Stable, frozen defaults for ids without a stored record (never persisted).
  const defaults = new Map<string, ProgressRecord>()

  let initPromise: Promise<void> | null = null

  async function load(): Promise<void> {
    try {
      await getAdapter()
      const storageError = getStorageStatus().error
      const [rawRecords, rawDays] = await Promise.all([progressRepo.all(), activityRepo.all()])
      const recs = normalizeList(rawRecords, normalizeProgressRecord, (r) => r.questionId, newerByUpdatedAt).items
      const days = normalizeList(rawDays, normalizeActivityDay, (d) => d.date).items
      records.value = Object.fromEntries(recs.map((r) => [r.questionId, r]))
      activity.value = Object.fromEntries(days.map((d) => [d.date, d]))
      error.value = storageError
    } catch (e) {
      console.error('[progress] load failed', e)
      error.value = describeStorageError('load your progress', e)
    } finally {
      ready.value = true
      if (!ticker && typeof window !== 'undefined') {
        ticker = setInterval(() => (now.value = Date.now()), TICK_MS)
      }
    }
  }

  function init(): Promise<void> {
    if (!initPromise) initPromise = load()
    return initPromise
  }

  /** Re-read everything from storage (after restore / reset). */
  function reload(): Promise<void> {
    defaults.clear()
    initPromise = load()
    return initPromise
  }

  function get(id: string): ProgressRecord {
    const stored = records.value[id]
    if (stored) return stored
    let d = defaults.get(id)
    if (!d) {
      d = Object.freeze(defaultRecord(id))
      defaults.set(id, d)
    }
    return d
  }

  function statusOf(id: string): ProgressStatus {
    return get(id).status
  }

  async function persistRecord(record: ProgressRecord): Promise<void> {
    try {
      await progressRepo.put(record)
    } catch (e) {
      console.error('[progress] save failed', e)
      error.value = describeStorageError('save your progress', e)
    }
  }

  /** Optimistic in-memory update, then persist. */
  async function write(id: string, change: (current: ProgressRecord, now: Date) => ProgressRecord): Promise<ProgressRecord> {
    await init()
    const at = new Date()
    const next = change({ ...get(id) }, at)
    records.value[id] = next
    await persistRecord(next)
    return next
  }

  async function setStatus(id: string, status: ProgressStatus): Promise<void> {
    await write(id, (r, at) => applyStatus(r, status, at))
  }

  /** Marks a 'new' question as started when the learner interacts with it. */
  const touch = (r: ProgressRecord, at: Date): ProgressRecord => ({
    ...r,
    status: r.status === 'new' ? 'learning' : r.status,
    lastSeenAt: at.toISOString(),
    updatedAt: at.toISOString(),
  })

  async function revealHint(id: string, index: number): Promise<void> {
    if (!Number.isInteger(index) || index < 0) return
    if (get(id).hintsRevealed >= index) return
    await write(id, (r, at) => ({ ...touch(r, at), hintsRevealed: Math.max(r.hintsRevealed, index) }))
  }

  async function revealAnswer(id: string): Promise<void> {
    if (get(id).answerRevealed) return
    await write(id, (r, at) => ({ ...touch(r, at), answerRevealed: true }))
  }

  /** Press or lift a "learned" stamp ('step-<i>' / 'kp-<i>'). Pressing counts as engaging with the question. */
  async function toggleStamp(id: string, stampId: string): Promise<void> {
    await write(id, (r, at) => {
      const current = new Set(r.stamps ?? [])
      if (current.has(stampId)) current.delete(stampId)
      else current.add(stampId)
      return { ...touch(r, at), stamps: [...current] }
    })
  }

  async function toggleBookmark(id: string): Promise<void> {
    await write(id, (r, at) => ({ ...r, bookmarked: !r.bookmarked, updatedAt: at.toISOString() }))
  }

  async function grade(id: string, g: ReviewGrade): Promise<void> {
    await init()
    const wasMastered = get(id).status === 'mastered'
    const next = await write(id, (r, at) => schedule(r, g, at))
    now.value = Date.now()
    await recordActivity('reviewed')
    if (!wasMastered && next.status === 'mastered') await recordActivity('mastered')
  }

  async function resetQuestion(id: string): Promise<void> {
    await init()
    if (!records.value[id]) return
    const { [id]: _removed, ...rest } = records.value
    void _removed
    records.value = rest
    try {
      await progressRepo.remove(id)
    } catch (e) {
      console.error('[progress] reset failed', e)
      error.value = describeStorageError('reset this question', e)
    }
  }

  /** Increment a counter on today's ActivityDay (also used by the notes store). */
  async function recordActivity(field: ActivityField, by = 1): Promise<void> {
    await init()
    const date = toDateKey(new Date())
    const day: ActivityDay = { ...(activity.value[date] ?? { date, reviewed: 0, mastered: 0, notesEdited: 0 }) }
    day[field] += by
    activity.value[date] = day
    try {
      await activityRepo.put(day)
    } catch (e) {
      console.error('[progress] activity save failed', e)
      error.value = describeStorageError('save today’s activity', e)
    }
  }

  // ---- derived -------------------------------------------------------------

  const dueIds = computed<string[]>(() => {
    const t = now.value
    return Object.values(records.value)
      .filter((r) => r.nextReviewAt !== null && Date.parse(r.nextReviewAt) <= t && getEntry(r.questionId))
      .sort((a, b) => Date.parse(a.nextReviewAt as string) - Date.parse(b.nextReviewAt as string))
      .map((r) => r.questionId)
  })

  const bookmarkedIds = computed<string[]>(() =>
    allQuestionIds.filter((id) => records.value[id]?.bookmarked === true),
  )

  const counts = computed<Record<ProgressStatus, number>>(() => {
    const c: Record<ProgressStatus, number> = { new: 0, learning: 0, reviewing: 0, mastered: 0 }
    for (const id of allQuestionIds) c[records.value[id]?.status ?? 'new']++
    return c
  })

  function trackStats(trackId: string): { total: number; mastered: number; started: number; percent: number } {
    const ids = trackQuestionIds(trackId)
    let mastered = 0
    let started = 0
    for (const id of ids) {
      const s = records.value[id]?.status ?? 'new'
      if (s !== 'new') started++
      if (s === 'mastered') mastered++
    }
    const total = ids.length
    return { total, mastered, started, percent: total === 0 ? 0 : Math.round((mastered / total) * 100) }
  }

  const today = computed(() => toDateKey(new Date(now.value)))

  const todayCount = computed<number>(() => activity.value[today.value]?.reviewed ?? 0)

  const streak = computed<number>(() => {
    const active = (key: string) => (activity.value[key]?.reviewed ?? 0) > 0
    let cursor = today.value
    if (!active(cursor)) cursor = addDays(cursor, -1)
    let n = 0
    while (active(cursor)) {
      n++
      cursor = addDays(cursor, -1)
    }
    return n
  })

  return {
    ready,
    error,
    records,
    activity,
    init,
    reload,
    get,
    statusOf,
    setStatus,
    revealHint,
    revealAnswer,
    toggleBookmark,
    toggleStamp,
    grade,
    resetQuestion,
    recordActivity,
    dueIds,
    bookmarkedIds,
    counts,
    trackStats,
    streak,
    todayCount,
  }
})
