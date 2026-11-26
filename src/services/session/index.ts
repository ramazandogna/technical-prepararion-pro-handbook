/**
 * Session engine: turns a role plan into today's ordered list of questions. Pure — no storage.
 * Each slot takes, from its pool, unfinished started questions first, then new ones (must → nice,
 * curriculum order), and only then re-practises closed ones (earliest review first).
 * Due spaced reviews are appended at the end (max 2).
 */
import { allEntries, type QuestionEntry } from '@/content'
import { requiredStamps } from '@/content/walkthrough'
import { isClosed, isDue } from '@/services/progress'
import type { Priority } from '@/types/content'
import type { ProgressRecord } from '@/types/progress'
import type { RolePlan, SessionSlot, StudySession } from '@/types/session'

const PRIORITY_RANK: Record<Priority, number> = { must: 0, should: 1, nice: 2 }
export const REVIEW_SLOT_ID = 'review'
const MAX_REVIEWS = 2

export function matchesSlot(entry: QuestionEntry, slot: SessionSlot): boolean {
  const q = entry.question
  if (!slot.trackIds.includes(entry.track.id)) return false
  if (slot.types?.length && !slot.types.includes(q.type)) return false
  if (slot.difficulty?.length && !slot.difficulty.includes(q.difficulty)) return false
  if (slot.priority?.length && !slot.priority.includes(q.priority)) return false
  if (slot.tags?.length && !slot.tags.some((t) => q.tags.includes(t))) return false
  return true
}

export function slotPool(slot: SessionSlot): QuestionEntry[] {
  return allEntries.filter((e) => matchesSlot(e, slot))
}

export function buildSession(
  plan: RolePlan,
  recordOf: (id: string) => ProgressRecord,
  now: Date,
  dateKey: string,
): StudySession {
  const order = new Map(allEntries.map((e, i) => [e.question.id, i]))
  const picked = new Set<string>()
  const items: StudySession['items'] = []

  const rank = (e: QuestionEntry): [number, number, number] => {
    const r = recordOf(e.question.id)
    if (isClosed(r, requiredStamps(e.question))) {
      return [2, r.nextReviewAt ? Date.parse(r.nextReviewAt) : 0, order.get(e.question.id) ?? 0]
    }
    const tier = r.status === 'new' ? 1 : 0
    return [tier, PRIORITY_RANK[e.question.priority], order.get(e.question.id) ?? 0]
  }
  const compare = (a: QuestionEntry, b: QuestionEntry) => {
    const ra = rank(a)
    const rb = rank(b)
    return ra[0] - rb[0] || ra[1] - rb[1] || ra[2] - rb[2]
  }

  for (const slot of plan.slots) {
    const pool = slotPool(slot).filter((e) => !picked.has(e.question.id)).sort(compare)
    for (const e of pool.slice(0, slot.count)) {
      picked.add(e.question.id)
      items.push({ questionId: e.question.id, slotId: slot.id })
    }
  }

  const due = allEntries
    .filter((e) => !picked.has(e.question.id) && isDue(recordOf(e.question.id), now))
    .sort((a, b) => Date.parse(recordOf(a.question.id).nextReviewAt!) - Date.parse(recordOf(b.question.id).nextReviewAt!))
    .slice(0, MAX_REVIEWS)
  for (const e of due) items.push({ questionId: e.question.id, slotId: REVIEW_SLOT_ID })

  const iso = now.toISOString()
  return { role: plan.role, date: dateKey, items, done: [], startedAt: iso, updatedAt: iso }
}
