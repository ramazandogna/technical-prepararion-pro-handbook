import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { toDateKey } from 'rei-kit'
import { getEntry } from '@/content'
import { rolePlans } from '@/content/meta/plans'
import { buildSession } from '@/services/session'
import { describeStorageError, getAdapter, metaRepo } from '@/services/storage'
import { normalizeSession } from '@/services/backup/validate'
import type { RoleId, StudySession } from '@/types/session'
import { useProgressStore } from './progress'

/** Today's guided study session — one at a time, resumed until every item is done. */
export const useSessionStore = defineStore('session', () => {
  const ready = ref(false)
  const error = ref<string | null>(null)
  const session = ref<StudySession | null>(null)
  let initPromise: Promise<void> | null = null

  async function load(): Promise<void> {
    try {
      await getAdapter()
      const s = normalizeSession(await metaRepo.get('session'))
      // Drop items whose question no longer exists in the curriculum.
      if (s) s.items = s.items.filter((i) => getEntry(i.questionId))
      session.value = s
    } catch (e) {
      error.value = describeStorageError('load your session', e)
    } finally {
      ready.value = true
    }
  }
  const init = () => (initPromise ??= load())
  function reload(): Promise<void> {
    initPromise = load()
    return initPromise
  }

  async function save(next: StudySession | null): Promise<void> {
    session.value = next
    try {
      await metaRepo.set('session', next ? JSON.parse(JSON.stringify(next)) : null)
    } catch (e) {
      error.value = describeStorageError('save your session', e)
    }
  }

  const planOf = (role: RoleId) => rolePlans.find((p) => p.role === role)

  const remaining = computed(() => session.value?.items.filter((i) => !session.value!.done.includes(i.questionId)) ?? [])
  const current = computed(() => remaining.value[0] ?? null)
  const finished = computed(() => !!session.value && session.value.items.length > 0 && remaining.value.length === 0)

  function activeFor(role: RoleId): StudySession | null {
    return session.value?.role === role ? session.value : null
  }

  /** Resume the role's unfinished session, or build a fresh one. Returns the first question id. */
  async function start(role: RoleId, fresh = false): Promise<string | null> {
    await init()
    const progress = useProgressStore()
    await progress.init()
    const existing = activeFor(role)
    if (!fresh && existing && !finished.value && existing.items.length) return current.value?.questionId ?? null
    const plan = planOf(role)
    if (!plan) return null
    const now = new Date()
    await save(buildSession(plan, (id) => progress.get(id), now, toDateKey(now)))
    return current.value?.questionId ?? null
  }

  /** Mark a question done in the session (closed or skipped); returns the next id or null when finished. */
  async function complete(questionId: string): Promise<string | null> {
    const s = session.value
    if (!s || !s.items.some((i) => i.questionId === questionId)) return null
    if (!s.done.includes(questionId)) {
      await save({ ...s, done: [...s.done, questionId], updatedAt: new Date().toISOString() })
    }
    return current.value?.questionId ?? null
  }

  function inSession(questionId: string): boolean {
    return !!session.value?.items.some((i) => i.questionId === questionId)
  }

  return { ready, error, session, init, reload, start, complete, current, remaining, finished, activeFor, planOf, inSession }
})
