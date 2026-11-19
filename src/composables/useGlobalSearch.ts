import { computed, type Component } from 'vue'
import { useRouter } from 'vue-router'
import type { CommandGroup } from 'rei-kit/web'
import { BookOpen, Info, LayoutDashboard, Library, Map, NotebookPen, RotateCcw, Settings } from 'lucide-vue-next'
import { allEntries, tracks } from '@/content'

interface PageLink {
  to: string
  label: string
  icon: Component
  keywords: string[]
}

export const PAGES: readonly PageLink[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, keywords: ['home', 'today', 'streak'] },
  { to: '/roadmap', label: 'Roadmap', icon: Map, keywords: ['phases', 'plan', 'weeks'] },
  { to: '/review', label: 'Review', icon: RotateCcw, keywords: ['due', 'practice', 'spaced'] },
  { to: '/library', label: 'Library', icon: Library, keywords: ['questions', 'search', 'filter'] },
  { to: '/notes', label: 'Notes', icon: NotebookPen, keywords: ['notes', 'journal'] },
  { to: '/settings', label: 'Settings', icon: Settings, keywords: ['theme', 'backup', 'export', 'import', 'reset'] },
  { to: '/about', label: 'About', icon: Info, keywords: ['research', 'methodology', 'stages', 'sources'] },
]

/** Command menu groups + a select handler that navigates. Ids are prefixed by kind. */
export function useGlobalSearch() {
  const router = useRouter()

  const groups = computed<CommandGroup<string>[]>(() => {
    const out: CommandGroup<string>[] = [
      {
        label: 'Pages',
        items: PAGES.map((p) => ({ id: `page:${p.to}`, label: p.label, icon: p.icon, keywords: p.keywords })),
      },
      {
        label: 'Tracks',
        items: tracks.map((t) => ({
          id: `track:${t.id}`,
          label: `${t.code} · ${t.title}`,
          hint: `Phase ${t.phase}`,
          icon: BookOpen,
          keywords: [t.summary],
        })),
      },
    ]
    if (allEntries.length > 0) {
      out.push({
        label: 'Questions',
        items: allEntries.map((e) => ({
          id: `q:${e.question.id}`,
          label: e.question.title,
          hint: `${e.track.code} · ${e.track.title}`,
          keywords: [...e.question.tags, e.module.title, e.track.title],
        })),
      })
    }
    return out
  })

  function select(id: string) {
    const [kind, ...rest] = id.split(':')
    const value = rest.join(':')
    if (kind === 'page') void router.push(value)
    else if (kind === 'track') void router.push(`/tracks/${value}`)
    else if (kind === 'q') void router.push(`/q/${value}`)
  }

  return { groups, select }
}
