import { computed } from 'vue'
import { allEntries, type QuestionEntry } from '@/content'
import { useProgressStore } from '@/stores/progress'

/**
 * The next question to study: the first not-mastered question in curriculum
 * order after the most recently seen one (wrapping around). Null when every
 * question is mastered or there is no content yet.
 */
export function useContinueLearning() {
  const progress = useProgressStore()

  const lastSeenIndex = computed(() => {
    let best = -1
    let bestAt = ''
    allEntries.forEach((e, i) => {
      const at = progress.records[e.question.id]?.lastSeenAt
      if (at && at > bestAt) {
        bestAt = at
        best = i
      }
    })
    return best
  })

  const next = computed<QuestionEntry | null>(() => {
    const n = allEntries.length
    if (n === 0) return null
    const start = lastSeenIndex.value + 1
    for (let k = 0; k < n; k++) {
      const entry = allEntries[(start + k) % n]
      if (entry && progress.statusOf(entry.question.id) !== 'mastered') return entry
    }
    return null
  })

  const hasStarted = computed(() => lastSeenIndex.value !== -1)

  return { next, hasStarted }
}
