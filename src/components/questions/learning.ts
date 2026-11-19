/** Shared helpers for the question experience (UX Engineer). */
import type { ReviewGrade } from '@/types/progress'
import { useProgressStore } from '@/stores/progress'

type ProgressStore = ReturnType<typeof useProgressStore>

/**
 * A question becomes 'learning' the first time the learner actually engages with it
 * (reveals a hint / the answer, checks an MCQ, or grades) — never by merely visiting.
 */
export async function markEngaged(progress: ProgressStore, questionId: string): Promise<void> {
  if (progress.statusOf(questionId) === 'new') await progress.setStatus(questionId, 'learning')
}

export interface GradeOption {
  value: ReviewGrade
  label: string
  description: string
  key: string
}

export const GRADE_OPTIONS: readonly GradeOption[] = [
  { value: 'again', label: 'Again', description: "Couldn't recall it", key: '1' },
  { value: 'hard', label: 'Hard', description: 'Got there with effort', key: '2' },
  { value: 'good', label: 'Good', description: 'Recalled the key points', key: '3' },
  { value: 'easy', label: 'Easy', description: 'Instant and complete', key: '4' },
]

/** True when a keyboard event comes from somewhere the user is typing or a modifier is held. */
export function isTypingContext(event: KeyboardEvent): boolean {
  if (event.metaKey || event.ctrlKey || event.altKey || event.defaultPrevented || event.isComposing) return true
  const target = event.target
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  if (target.closest('[role="dialog"], [role="menu"], [role="listbox"], [role="combobox"]')) return true
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

/** Space/Enter on a focused control already activates it; shortcuts must not double-fire. */
export function isActivationOnControl(event: KeyboardEvent): boolean {
  if (event.key !== ' ' && event.key !== 'Enter') return false
  const target = event.target
  return target instanceof HTMLElement && !!target.closest('button, a, [role="button"], summary, label')
}

/** "today", "tomorrow", "in 4 days", "on 3 Dec". */
export function describeNextReview(iso: string | null | undefined, now = new Date()): string | null {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const days = Math.round((startOf(date) - startOf(now)) / 86_400_000)
  if (days <= 0) return 'later today'
  if (days === 1) return 'tomorrow'
  if (days < 14) return `in ${days} days`
  return `on ${date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}`
}
