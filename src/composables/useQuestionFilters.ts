/**
 * Library search + filters, synced to the URL query so results are linkable and
 * survive reloads / back navigation.
 */
import { computed, ref, watch, type ComputedRef, type Ref, type WritableComputedRef } from 'vue'
import { useRoute, useRouter, type LocationQuery } from 'vue-router'
import { useDebouncedCallback } from 'rei-kit'
import { allEntries, type QuestionEntry } from '@/content'
import type { Difficulty, Priority, QuestionType, TrackId } from '@/types/content'
import type { ProgressStatus } from '@/types/progress'
import { useProgressStore } from '@/stores/progress'
import { useNotesStore } from '@/stores/notes'
import { DIFFICULTY_ORDER } from '@/components/common/labels'

export type SortKey = 'curriculum' | 'difficulty' | 'recent'

export interface QuestionFilters {
  q: string
  track: TrackId | ''
  type: QuestionType | ''
  difficulty: Difficulty | ''
  priority: Priority | ''
  status: ProgressStatus | ''
  bookmarked: boolean
  note: boolean
  sort: SortKey
}

const SORTS: readonly SortKey[] = ['curriculum', 'difficulty', 'recent']
const PAGE_SIZE = 30

/** Lowercased searchable text per entry, built once. */
const haystacks = new Map<string, string>(
  allEntries.map((e) => [
    e.question.id,
    [e.question.title, e.question.prompt, e.question.tags.join(' '), e.module.title, e.track.title, e.track.code]
      .join(' ')
      .toLowerCase(),
  ]),
)

function first(value: LocationQuery[string] | undefined): string {
  const v = Array.isArray(value) ? value[0] : value
  return typeof v === 'string' ? v : ''
}

/** Pure filter: exported so other surfaces (e.g. command menu) can reuse it. */
export function matchesSearch(entry: QuestionEntry, query: string): boolean {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (terms.length === 0) return true
  const text = haystacks.get(entry.question.id) ?? ''
  return terms.every((t) => text.includes(t))
}

export function useQuestionFilters(): {
  filters: ComputedRef<QuestionFilters>
  searchText: Ref<string>
  setFilter: <K extends keyof QuestionFilters>(key: K, value: QuestionFilters[K]) => void
  field: <K extends Exclude<keyof QuestionFilters, 'q'>>(key: K) => WritableComputedRef<QuestionFilters[K]>
  clear: () => void
  activeCount: ComputedRef<number>
  results: ComputedRef<QuestionEntry[]>
  visible: ComputedRef<QuestionEntry[]>
  hasMore: ComputedRef<boolean>
  showMore: () => void
} {
  const route = useRoute()
  const router = useRouter()
  const progress = useProgressStore()
  const notes = useNotesStore()

  const filters = computed<QuestionFilters>(() => {
    const q = route.query
    const sort = first(q.sort) as SortKey
    return {
      q: first(q.q),
      track: first(q.track) as TrackId | '',
      type: first(q.type) as QuestionType | '',
      difficulty: first(q.difficulty) as Difficulty | '',
      priority: first(q.priority) as Priority | '',
      status: first(q.status) as ProgressStatus | '',
      bookmarked: first(q.bookmarked) === '1',
      note: first(q.note) === '1',
      sort: SORTS.includes(sort) ? sort : 'curriculum',
    }
  })

  function toQuery(f: QuestionFilters): Record<string, string> {
    const out: Record<string, string> = {}
    if (f.q.trim()) out.q = f.q.trim()
    if (f.track) out.track = f.track
    if (f.type) out.type = f.type
    if (f.difficulty) out.difficulty = f.difficulty
    if (f.priority) out.priority = f.priority
    if (f.status) out.status = f.status
    if (f.bookmarked) out.bookmarked = '1'
    if (f.note) out.note = '1'
    if (f.sort !== 'curriculum') out.sort = f.sort
    return out
  }

  function setFilter<K extends keyof QuestionFilters>(key: K, value: QuestionFilters[K]) {
    const next = { ...filters.value, [key]: value }
    void router.replace({ query: toQuery(next) })
  }

  function field<K extends Exclude<keyof QuestionFilters, 'q'>>(key: K) {
    return computed<QuestionFilters[K]>({
      get: () => filters.value[key],
      set: (v) => setFilter(key, v),
    })
  }

  // Search box is local state, written to the URL after a short pause.
  const searchText = ref(filters.value.q)
  const pushSearch = useDebouncedCallback((value: string) => setFilter('q', value), 250)
  watch(searchText, (v) => {
    if (v.trim() !== filters.value.q) pushSearch.run(v)
  })
  watch(
    () => filters.value.q,
    (q) => {
      if (q !== searchText.value.trim()) searchText.value = q
    },
  )

  function clear() {
    pushSearch.cancel()
    searchText.value = ''
    void router.replace({ query: filters.value.sort !== 'curriculum' ? { sort: filters.value.sort } : {} })
  }

  const activeCount = computed(() => {
    const f = filters.value
    return [f.q, f.track, f.type, f.difficulty, f.priority, f.status, f.bookmarked, f.note].filter(Boolean).length
  })

  const results = computed<QuestionEntry[]>(() => {
    const f = filters.value
    const list = allEntries.filter((e) => {
      const q = e.question
      if (f.track && e.track.id !== f.track) return false
      if (f.type && q.type !== f.type) return false
      if (f.difficulty && q.difficulty !== f.difficulty) return false
      if (f.priority && q.priority !== f.priority) return false
      if (f.status && progress.statusOf(q.id) !== f.status) return false
      if (f.bookmarked && !progress.get(q.id).bookmarked) return false
      if (f.note && !notes.get(q.id)) return false
      return matchesSearch(e, f.q)
    })
    if (f.sort === 'difficulty') {
      // Array.prototype.sort is stable: ties keep curriculum order.
      list.sort((a, b) => DIFFICULTY_ORDER[a.question.difficulty] - DIFFICULTY_ORDER[b.question.difficulty])
    } else if (f.sort === 'recent') {
      const seen = (e: QuestionEntry) => progress.get(e.question.id).lastSeenAt ?? ''
      list.sort((a, b) => seen(b).localeCompare(seen(a)))
    }
    return list
  })

  const limit = ref(PAGE_SIZE)
  watch(filters, () => (limit.value = PAGE_SIZE))
  const visible = computed(() => results.value.slice(0, limit.value))
  const hasMore = computed(() => results.value.length > limit.value)

  return {
    filters,
    searchText,
    setFilter,
    field,
    clear,
    activeCount,
    results,
    visible,
    hasMore,
    showMore: () => {
      limit.value += PAGE_SIZE
    },
  }
}
