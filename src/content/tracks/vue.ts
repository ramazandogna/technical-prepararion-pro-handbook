import type { Track } from '@/types/content'

const track: Track = {
  id: 'vue',
  code: 'G',
  title: 'Vue',
  summary: 'Reactivity internals, Composition API, component design, Router, Pinia and Nuxt.',
  rationale:
    'Vue is the stack you know most deeply. You built REI-KIT (106 components) and Kakehashi on it, and you shipped Vue consent UIs. Interviewers will expect depth here: how the reactivity system works, the trade-offs between its APIs, and how you architect and render Vue apps. This track turns that experience into precise explanations.',
  icon: 'Component',
  phase: 2,
  modules: [
    {
      id: 'vue-reactivity',
      title: 'Reactivity & the Composition API',
      summary: 'Composition vs Options API, Proxy-based reactivity, ref vs reactive, computed and watchers, and the lifecycle.',
      questions: [
        {
          id: 'vue-composition-vs-options',
          title: 'Composition API vs Options API',
          type: 'tradeoff',
          difficulty: 'foundation',
          priority: 'must',
          tags: ['composition-api', 'options-api', 'script-setup', 'typescript'],
          estMinutes: 4,
          roles: ['frontend', 'full-stack'],
          prompt: `**Why does the Composition API exist, and when (if ever) would you still choose the Options API?**`,
          hints: [
            'Think about organising code by logical concern rather than by option type.',
            'How did you reuse logic before composables?',
            'TypeScript inference.',
          ],
          answer: `**The Composition API organises code by logical concern and makes logic reusable through composables, with first-class TypeScript inference.** The Options API groups code by *option type* (\`data\`, \`methods\`, \`computed\`, \`watch\`), so one feature is spread across the whole component.

**Advantages of the Composition API (\`<script setup>\`):**
- **Colocation:** everything for "search" (its state, computed values, watchers and handlers) sits together and can be **extracted into \`useSearch()\`** without changes.
- **Reuse without mixins:** mixins had naming collisions, unclear origins (where does \`this.foo\` come from?) and implicit coupling. Composables are plain functions with explicit inputs and outputs.
- **TypeScript:** ordinary variables and functions infer naturally. \`defineProps<Props>()\` and \`defineEmits<…>()\` give typed props and events without the gymnastics of \`this\`.
- **Smaller and faster output:** \`<script setup>\` compiles to a render function in the same scope (no proxy access through \`this\`), and the code minifies better.

\`\`\`html
<script setup lang="ts">
import { useSearch } from '@/composables/useSearch'
const props = defineProps<{ initialQuery?: string }>()
const { query, results, loading } = useSearch(() => props.initialQuery ?? '')
</script>
\`\`\`

**When the Options API is still reasonable:** maintaining an existing Options codebase (both APIs are fully supported, and Options is implemented on top of Composition), very simple components, and teams new to Vue who find the structure easier at first. The APIs can be mixed during a migration.

**The trade-off:** the Composition API gives more freedom, which needs discipline. Without conventions, \`setup\` can become one long, unstructured function. Group code by feature and extract composables early.`,
          keyPoints: [
            'Organised by logical concern, not option type',
            'Composables replace mixins',
            'Better TypeScript inference',
            'script setup compiles to more efficient code',
            'Options API is still valid; it needs less discipline but reuses logic poorly',
          ],
          pitfalls: ['Saying the Options API is deprecated (it is not)'],
          personalAngle:
            'REI-KIT is presumably written with script setup and typed props. Mention how composables keep 106 components consistent (for example, shared focus or theme logic).',
          references: [{ label: 'Vue docs: Composition API FAQ', url: 'https://vuejs.org/guide/extras/composition-api-faq.html' }],
        },
        {
          id: 'vue-reactivity-internals',
          title: 'How Vue reactivity works (Proxy, ref vs reactive)',
          type: 'concept',
          difficulty: 'advanced',
          priority: 'must',
          tags: ['reactivity', 'proxy', 'ref', 'reactive', 'dependency-tracking', 'unwrapping'],
          estMinutes: 7,
          roles: ['frontend', 'full-stack'],
          prompt: `**Explain how Vue 3's reactivity system works under the hood.** What is the difference between \`ref\` and \`reactive\`, and when is a ref automatically unwrapped?`,
          hints: [
            'Tracking happens on property reads; triggering happens on writes.',
            'reactive() returns a Proxy. What is a ref?',
            'Vue 2 used Object.defineProperty, which had limitations.',
          ],
          answer: `**Vue tracks which reactive properties an *effect* reads, and re-runs that effect when one of them is written.** The effects are component render functions, \`computed\` values and watchers.

**The mechanics:**
- **\`reactive(obj)\`** returns an ES **Proxy**. The \`get\` trap calls **\`track()\`**, recording a dependency from the currently running effect to that \`target.key\`. The \`set\` and \`delete\` traps call **\`trigger()\`**, which schedules every effect that depends on the key. Nested objects are wrapped lazily, when they are accessed.
- **\`ref(value)\`** is an object with a \`.value\` getter and setter that does the same track and trigger. It exists because **primitives cannot be proxied**, and because a ref can be passed around and reassigned without losing reactivity. If you put an object in a ref, the object is made \`reactive\`.
- **Scheduling:** triggered component updates are **queued and batched**, then flushed asynchronously in a microtask. That is why the DOM updates after \`await nextTick()\`.
- Vue 3.5 reworked the internals (version counting and doubly linked dependency lists) and substantially reduced memory use, with no API changes.

**Why Proxy, compared with Vue 2:** \`Object.defineProperty\` could not detect added or deleted properties or assignments to array indices, hence \`Vue.set\`. Proxies intercept all of these, along with \`Map\`, \`Set\` and \`has\`/\`ownKeys\`.

**\`ref\` vs \`reactive\`:**
| | \`ref\` | \`reactive\` |
| --- | --- | --- |
| Holds | any value | objects only |
| Access | \`.value\` in script | direct property access |
| Reassigning the whole value | \`r.value = newObj\` works | replacing the variable breaks the connection |
| Destructuring | — | **loses reactivity** (use \`toRefs\`) |

The official recommendation is to **use \`ref\` as the primary API**, because it has fewer pitfalls.

**Automatic unwrapping happens:**
- in **templates**, for top-level refs (\`{{ count }}\`, not \`count.value\`);
- when a ref is a **property of a reactive object** (\`state.count\` where \`count\` is a ref);
- **but not** inside reactive *arrays* or collections such as \`Map\`, where \`.value\` is still needed.

**Escape hatches:** \`shallowRef\` and \`shallowReactive\` (only the top level is tracked, which suits large immutable data), \`markRaw\` (never proxy this object, for example a third-party class instance), and \`toRaw\`.`,
          keyPoints: [
            'Proxy get → track, set → trigger',
            'Effects are render functions, computed values and watchers',
            'ref wraps primitives with a .value accessor; objects inside become reactive',
            'Batched, asynchronous DOM updates (nextTick)',
            'Unwrapping rules: templates and reactive properties, but not arrays or collections',
            'shallowRef and markRaw for large or foreign objects',
          ],
          pitfalls: ['Saying ref is "for primitives only"', 'Thinking DOM updates happen synchronously after a write'],
          followUps: ['How would you build a minimal reactive() and effect() yourself?', 'Why is a computed value lazy?'],
          references: [{ label: 'Vue docs: Reactivity in Depth', url: 'https://vuejs.org/guide/extras/reactivity-in-depth.html' }],
        },
        {
          id: 'vue-reactivity-pitfalls',
          title: 'Debug: losing reactivity',
          type: 'debugging',
          difficulty: 'core',
          priority: 'must',
          tags: ['reactivity', 'destructuring', 'torefs', 'watch', 'pitfalls'],
          estMinutes: 7,
          roles: ['frontend', 'full-stack'],
          prompt: `The count in the template never updates, the watcher never fires, and after \`load()\` the list stays empty. **Find all three bugs.**`,
          code: {
            language: 'html',
            source: `<script setup lang="ts">
import { reactive, watch } from 'vue'

let state = reactive({ count: 0, items: [] as string[] })
const { count } = state

function increment() {
  state.count++
}

watch(state.count, (n) => console.log('count is', n))

async function load() {
  const items = await fetchItems()
  state = reactive({ count: 0, items })
}
</script>

<template>
  <button @click="increment">{{ count }}</button>
  <li v-for="item in state.items" :key="item">{{ item }}</li>
</template>`,
          },
          hints: [
            'What does destructuring a property out of a Proxy give you?',
            'watch needs a source it can track. What is state.count at call time?',
            'The template captured the original proxy object.',
          ],
          answer: `**Bug 1: destructuring breaks reactivity.** \`const { count } = state\` reads the property **once** and stores the plain number 0. The template shows that constant.
- Fix: use \`state.count\` in the template, or \`const { count } = toRefs(state)\` (or \`toRef(state, 'count')\`), which creates refs linked to the proxy.

**Bug 2: \`watch(state.count, …)\` passes a number, not a reactive source.** Vue warns *"Invalid watch source"*.
- Fix: use a getter, \`watch(() => state.count, (n) => …)\`. A watch source must be a ref, a reactive object, a getter, or an array of these.

**Bug 3: replacing the reactive object.** The template (and any watcher) is bound to the **original** proxy. Assigning a new proxy to \`state\` does not notify anything. (\`let\` here should itself be a warning sign.)
- Fix: **mutate** it (\`state.items = items\`, or \`Object.assign(state, { items })\`), or, better, model the data with \`ref\`, where replacing \`.value\` *is* reactive:

\`\`\`html
<script setup lang="ts">
import { ref, watch } from 'vue'

const count = ref(0)
const items = ref<string[]>([])

watch(count, (n) => console.log('count is', n))

async function load() {
  items.value = await fetchItems() // replacing .value triggers updates
}
</script>
\`\`\`

**Related rules:**
- **Props destructuring is reactive in Vue 3.5:** \`const { size = 'md' } = defineProps<…>()\` is compiled to \`props.size\` accesses. To pass a destructured prop to a watcher or composable, wrap it in a getter: \`watch(() => size, …)\`, or \`useX(() => size)\`.
- **Passing \`state.count\` into a composable** passes a plain value. Pass a ref or a getter, and read it with \`toValue()\` inside.
- Do not \`reactive()\` large immutable API payloads; use \`shallowRef\` for performance.`,
          keyPoints: [
            'Destructuring a reactive object reads plain values (use toRefs)',
            'watch sources must be a ref, reactive object or getter',
            'Replacing a reactive variable breaks bindings; mutate, or use ref',
            'Props destructuring is reactive in 3.5, but pass getters onward',
            'Use getters and toValue for composable inputs',
          ],
          pitfalls: ['Fixing bug 3 by calling reactive() again', 'Thinking deep: true fixes a watch on a primitive value'],
          followUps: ['What does toValue() do, and why do composables accept MaybeRefOrGetter?'],
        },
        {
          id: 'vue-computed-watch-watcheffect',
          title: 'computed vs watch vs watchEffect',
          type: 'tradeoff',
          difficulty: 'core',
          priority: 'must',
          tags: ['computed', 'watch', 'watcheffect', 'side-effects', 'onwatchercleanup'],
          estMinutes: 6,
          roles: ['frontend', 'full-stack'],
          prompt: `**When do you use \`computed\`, \`watch\` and \`watchEffect\`?** Give an example of each, and explain cleanup and flush timing.`,
          hints: [
            'One is for deriving values, the others for side effects.',
            'watch: explicit sources and old and new values. watchEffect: automatic tracking.',
            'Vue 3.5 added onWatcherCleanup.',
          ],
          answer: `**\`computed\` derives a value; watchers perform side effects.** If you are setting state inside a watcher just to mirror other state, you probably want \`computed\`.

**\`computed\`:** a cached, lazy and **pure** derived value. It recalculates only when a dependency changes and something reads it.
\`\`\`ts
const fullName = computed(() => \`\${first.value} \${last.value}\`)
const visible = computed(() => todos.value.filter((t) => !t.done))
\`\`\`
Never perform side effects (fetching, mutating) inside a computed getter. Writable computed values (\`get\` and \`set\`) exist for \`v-model\` proxies.

**\`watch(source, cb, options)\`:** explicit sources, **lazy by default**, and you get the new and old values. Use it when you need to know *what* changed or want control over timing:
\`\`\`ts
watch(
  () => route.params.id,
  async (id, _old) => {
    const controller = new AbortController()
    onWatcherCleanup(() => controller.abort()) // Vue 3.5; must be called before the first await
    user.value = await fetchUser(id as string, controller.signal)
  },
  { immediate: true },
)
\`\`\`
Options: \`immediate\`, \`deep\` (\`true\`, or a depth number in 3.5), \`once\` (3.4+), and \`flush\`.

**\`watchEffect(fn)\`:** runs **immediately** and **automatically tracks** every reactive value read *synchronously* during the run. It is convenient when the dependencies are obvious:
\`\`\`ts
watchEffect(() => {
  document.title = \`\${unread.value} unread · Inbox\`
})
\`\`\`
The catch: anything read **after an \`await\`** is not tracked, and dependencies are implicit, which is harder to review in large effects.

**Flush timing:** \`'pre'\` (the default) runs before the component re-renders; \`'post'\` (\`watchPostEffect\`) runs after the DOM has updated, so use it to measure or touch the DOM; \`'sync'\` runs immediately on every change (rarely needed, and expensive).

**Lifetime:** watchers created synchronously in \`setup\` stop automatically when the component unmounts. Ones created asynchronously, or outside components, must be stopped by calling the returned handle (3.5 also adds \`pause()\` and \`resume()\`), or grouped in an \`effectScope\`.`,
          keyPoints: [
            'computed: pure, cached, lazy derivation',
            'watch: explicit sources, lazy, old and new values',
            'watchEffect: immediate, automatic tracking, synchronous reads only',
            'onWatcherCleanup / onCleanup for cancellation',
            'flush: pre, post or sync; stop asynchronously created watchers',
          ],
          pitfalls: ['Using a watcher to sync derived state', 'Reading dependencies after await in watchEffect'],
          personalAngle:
            'In Kakehashi or Hibi, find one place where a watcher could be a computed value (or the reverse) and describe the refactor. Concrete examples beat definitions.',
          references: [{ label: 'Vue docs: Watchers', url: 'https://vuejs.org/guide/essentials/watchers.html' }],
        },
        {
          id: 'vue-lifecycle-nexttick',
          title: 'Lifecycle hooks and nextTick',
          type: 'multiple-choice',
          difficulty: 'foundation',
          priority: 'should',
          tags: ['lifecycle', 'nexttick', 'onmounted', 'template-refs', 'ssr'],
          estMinutes: 3,
          roles: ['frontend', 'full-stack'],
          prompt: `Inside \`<script setup>\` you need to **focus an input and measure its width** after a value change causes it to render. **Which approach is correct?**`,
          choices: [
            {
              id: 'a',
              text: 'Set the state, then read the element immediately in the same function',
              correct: false,
              explanation: 'DOM updates are batched asynchronously, so the element has not been updated yet.',
            },
            {
              id: 'b',
              text: 'Set the state, then `await nextTick()`, then use the template ref',
              correct: true,
              explanation: 'nextTick resolves after Vue has flushed pending DOM updates.',
            },
            {
              id: 'c',
              text: 'Do it in `onBeforeMount`',
              correct: false,
              explanation: 'The DOM does not exist yet in onBeforeMount, and it is not about later updates anyway.',
            },
            {
              id: 'd',
              text: 'Do it at the top level of `setup`',
              correct: false,
              explanation: 'setup runs before the component is mounted, so there is no DOM yet.',
            },
          ],
          hints: ['When does Vue apply DOM updates after a state change?'],
          answer: `**Set the state, \`await nextTick()\`, then use the template ref.** Vue batches DOM updates and flushes them in a microtask. \`nextTick\` resolves after that flush.

\`\`\`ts
const input = useTemplateRef<HTMLInputElement>('search') // Vue 3.5; or ref(null) with ref="search"
async function openSearch() {
  showSearch.value = true
  await nextTick()
  input.value?.focus()
  width.value = input.value?.offsetWidth ?? 0
}
\`\`\`

**Lifecycle order (Composition API):**
1. \`setup\` / \`<script setup>\`: reactive state and composables. There is **no DOM** yet. This replaces \`beforeCreate\` and \`created\`.
2. \`onBeforeMount\` → **\`onMounted\`**: the DOM exists. Use it for DOM access, third-party widgets and **client-only APIs**.
3. \`onBeforeUpdate\` → \`onUpdated\`: after a re-render. Avoid changing state here, since it can cause loops.
4. \`onBeforeUnmount\` → **\`onUnmounted\`**: remove listeners, timers and observers.
5. Also: \`onActivated\` and \`onDeactivated\` (KeepAlive), \`onErrorCaptured\`, and \`onServerPrefetch\` (SSR).

**SSR rule:** only \`setup\` (and \`onServerPrefetch\`) run on the server. **\`onMounted\` and \`onUpdated\` never run there**, so code in them may safely use \`window\` and \`document\`. Code at the top level of \`setup\` may not.

Hooks must be registered **synchronously** during \`setup\`, not after an \`await\`, because Vue needs the current component instance at that moment.`,
          keyPoints: [
            'DOM updates are batched; nextTick waits for the flush',
            'useTemplateRef in Vue 3.5',
            'onMounted for DOM and client-only code',
            'Clean up in onUnmounted',
            'Only setup runs during SSR; register hooks synchronously',
          ],
          pitfalls: ['Registering lifecycle hooks after await'],
        },
      ],
    },
    {
      id: 'vue-components',
      title: 'Component design & composables',
      summary: 'Props, emits, v-model and slots; provide/inject; and writing robust composables.',
      questions: [
        {
          id: 'vue-props-emits-slots',
          title: 'Props, emits, v-model and slots',
          type: 'concept',
          difficulty: 'core',
          priority: 'must',
          tags: ['props', 'emits', 'v-model', 'definemodel', 'slots', 'scoped-slots', 'component-api'],
          estMinutes: 6,
          roles: ['frontend', 'full-stack'],
          prompt: `You are designing a reusable \`<DataTable>\` for a component library. **How do you design its API with props, emits, \`v-model\` and slots?** Explain one-way data flow, \`defineModel\` and scoped slots.`,
          hints: [
            'Data goes down through props and events go up.',
            'defineModel removes the props-plus-emit boilerplate for v-model.',
            'Scoped slots let the parent render each row using the child\'s data.',
          ],
          answer: `**Props down, events up, and slots for anything the consumer should be able to customise.** A good library API is small, typed and predictable.

\`\`\`html
<script setup lang="ts" generic="Row extends { id: string | number }">
const props = withDefaults(defineProps<{
  rows: Row[]
  columns: { key: keyof Row & string; label: string }[]
  loading?: boolean
}>(), { loading: false })

const selected = defineModel<Row['id'][]>('selected', { default: () => [] }) // v-model:selected
const sort = defineModel<{ key: string; dir: 'asc' | 'desc' } | null>('sort', { default: null })

const emit = defineEmits<{ rowClick: [row: Row] }>()
</script>

<template>
  <table>
    <thead><tr><th v-for="c in props.columns" :key="c.key">{{ c.label }}</th></tr></thead>
    <tbody>
      <tr v-for="row in props.rows" :key="row.id" @click="emit('rowClick', row)">
        <td v-for="c in props.columns" :key="c.key">
          <!-- scoped slot: the parent decides how each cell renders -->
          <slot :name="\`cell-\${c.key}\`" :row="row" :value="row[c.key]">{{ row[c.key] }}</slot>
        </td>
      </tr>
    </tbody>
  </table>
  <slot v-if="!props.rows.length && !props.loading" name="empty">No data</slot>
</template>
\`\`\`

**One-way data flow:** a child must **never mutate its props**. Vue warns about reassigning them, but *deeply mutating* an object prop is silently allowed, and it is just as wrong. To change parent state, **emit an event**. That keeps ownership clear and makes behaviour easier to trace.

**\`v-model\` and \`defineModel\` (stable since 3.4):** \`v-model:selected="ids"\` is sugar for \`:selected\` plus \`@update:selected\`. \`defineModel()\` returns a ref that reads the prop and emits the update when you assign it, so the child code looks like local state while still respecting one-way flow. Multiple \`v-model\`s and modifiers are supported.

**Slots:**
- **Default and named slots** handle layout and content (\`#empty\`, \`#toolbar\`).
- **Scoped slots** pass child data *up* to the parent's template (\`#cell-status="{ value }"\`), which is how you get rendering flexibility without dozens of props.
- Type them with \`defineSlots<…>()\`.

**Library design guidance:** typed props with sensible defaults, \`generic\` components for row types, emits declared explicitly (undeclared listeners fall through as attributes), controlled-or-uncontrolled support via \`defineModel\` defaults, \`inheritAttrs\` and \`$attrs\` used deliberately, and accessibility built in (table semantics, \`aria-sort\`).`,
          keyPoints: [
            'Props down, events up; never mutate props, including deeply',
            'defineModel for v-model (multiple models and modifiers)',
            'Scoped slots for rendering flexibility',
            'Typed props, emits and slots; generic components',
            'Design the attribute fall-through deliberately',
          ],
          pitfalls: ['Mutating an object prop deeply "because Vue does not warn"', 'Adding a prop for every customisation instead of a slot'],
          followUps: ['How do you support both controlled and uncontrolled usage?'],
          personalAngle:
            'This is REI-KIT territory: you have made these decisions 106 times. Prepare one component (such as a select or table) whose API you can whiteboard, including a decision you later regretted or changed.',
          references: [{ label: 'Vue docs: Component v-model', url: 'https://vuejs.org/guide/components/v-model.html' }],
        },
        {
          id: 'vue-provide-inject',
          title: 'provide / inject for dependency injection',
          type: 'concept',
          difficulty: 'core',
          priority: 'nice',
          tags: ['provide-inject', 'dependency-injection', 'injectionkey', 'compound-components'],
          estMinutes: 4,
          roles: ['frontend', 'full-stack'],
          prompt: `**When would you use \`provide\`/\`inject\` instead of props or Pinia?** How do you type it and keep it reactive?`,
          hints: [
            'Think about prop drilling, and about compound components such as Tabs and Tab.',
            'InjectionKey<T> gives typing.',
            'Provide refs, plus functions for changing them.',
          ],
          answer: `**Use \`provide\`/\`inject\` for a subtree-scoped dependency.** It avoids prop drilling in **compound components** (\`<Tabs>\` and \`<Tab>\`, \`<Form>\` and \`<Field>\`, \`<Accordion>\`), and it is a way to inject services or configuration (a theme, a library-wide config, an API client) without making them global.

\`\`\`ts
// tabs-context.ts
import type { InjectionKey, Ref } from 'vue'
export interface TabsContext {
  active: Readonly<Ref<string>>
  select: (id: string) => void
}
export const TabsKey: InjectionKey<TabsContext> = Symbol('Tabs')

// Tabs.vue
const active = ref(props.defaultValue)
provide(TabsKey, { active: readonly(active), select: (id) => (active.value = id) })

// Tab.vue
const tabs = inject(TabsKey)
if (!tabs) throw new Error('<Tab> must be used inside <Tabs>')
const isActive = computed(() => tabs.active.value === props.id)
\`\`\`

**Rules:**
- **Provide refs** (or reactive objects) to stay reactive, and expose state as **\`readonly\`** with **functions** for changing it, so that mutations stay with the owner.
- Use a **\`Symbol\` \`InjectionKey<T>\`** for type safety and to avoid name collisions.
- Handle a missing provider: give a default (\`inject(Key, fallback)\`) or throw a clear error.
- \`app.provide()\` provides app-wide values, which is how plugins expose configuration.

**Choosing:**
| Need | Use |
| --- | --- |
| Direct parent-to-child data | props |
| A family of components in one subtree, or scoped configuration | provide/inject |
| Truly global, shared app state (with devtools and SSR handling) | Pinia |

Compared with React context, injected **refs update consumers in a fine-grained way**: only the components that read \`active.value\` re-render, so there is no need to split contexts for performance.`,
          keyPoints: [
            'Subtree-scoped dependency injection; compound components',
            'Typed InjectionKey symbols',
            'Provide readonly refs plus functions to change them',
            'Handle a missing provider',
            'Fine-grained updates, unlike React context',
          ],
          pitfalls: ['Providing plain values and expecting reactivity', 'Letting consumers mutate provided state directly'],
          personalAngle:
            'REI-KIT probably uses provide/inject for theme, material or palette context and for compound components. That makes a concrete, credible answer.',
        },
        {
          id: 'vue-composable-usefetch',
          title: 'Write a robust composable: useFetch',
          type: 'coding',
          difficulty: 'core',
          priority: 'must',
          tags: ['composables', 'maybereforgetter', 'tovalue', 'watch', 'cancellation'],
          estMinutes: 20,
          roles: ['frontend', 'full-stack'],
          prompt: `Write \`useFetch<T>(url)\`. \`url\` may be a string, a ref or a getter. The composable re-fetches when the URL changes, cancels stale requests, and returns \`{ data, error, loading, refresh }\`. What makes a composable well designed?`,
          hints: [
            'Accept MaybeRefOrGetter<string> and read it with toValue().',
            'Use watch on a getter with immediate: true, and onCleanup to abort.',
            'Return refs, not a reactive object, so callers can destructure.',
          ],
          answer: `\`\`\`ts
import { ref, shallowRef, toValue, watch, type MaybeRefOrGetter } from 'vue'

export function useFetch<T>(url: MaybeRefOrGetter<string>) {
  const data = shallowRef<T | null>(null) // payloads are replaced, not mutated deeply
  const error = shallowRef<Error | null>(null)
  const loading = ref(false)
  const version = ref(0) // bump to refresh

  watch(
    [() => toValue(url), version],
    async ([u], _old, onCleanup) => {
      const controller = new AbortController()
      onCleanup(() => controller.abort()) // runs when the URL changes or the component unmounts
      loading.value = true
      error.value = null
      try {
        const res = await fetch(u, { signal: controller.signal })
        if (!res.ok) throw new Error(\`HTTP \${res.status}\`)
        data.value = (await res.json()) as T
      } catch (e) {
        if ((e as Error).name !== 'AbortError') error.value = e as Error
      } finally {
        if (!controller.signal.aborted) loading.value = false
      }
    },
    { immediate: true },
  )

  return { data, error, loading, refresh: () => version.value++ }
}

// usage
const route = useRoute()
const { data: user, loading } = useFetch<User>(() => \`/api/users/\${route.params.id}\`)
\`\`\`

**What makes a composable well designed:**
- **Flexible inputs:** accept \`MaybeRefOrGetter\` and normalise with \`toValue()\`, so callers can pass a constant, a ref or a getter (including a destructured prop).
- **Return an object of refs:** callers can destructure it and keep reactivity. Avoid returning a \`reactive\` object.
- **Clean up after itself:** cancel requests and remove listeners. Watchers created during \`setup\` stop on unmount automatically, and composables used outside components should use \`effectScope\` / \`onScopeDispose\`.
- **\`shallowRef\` for large payloads** avoids deep proxying.
- **One concern per composable**, named \`useX\`, called synchronously at the top of \`setup\`.
- **SSR awareness:** this composable fetches on the client. In **Nuxt**, use \`useFetch\` or \`useAsyncData\`, which fetch on the server, serialise the result into the payload and **avoid fetching again during hydration**.

For production apps, Pinia Colada or TanStack Query for Vue add caching, deduplication and invalidation on top of this pattern.`,
          keyPoints: [
            'MaybeRefOrGetter with toValue()',
            'watch a getter with immediate: true; abort in onCleanup',
            'Return refs so callers can destructure',
            'shallowRef for payloads',
            'SSR: Nuxt useFetch/useAsyncData avoid double fetching',
          ],
          pitfalls: ['Accepting only a string, so it does not react to route changes', 'Using watchEffect and reading the URL after an await'],
          followUps: ['How would you add caching shared between components?'],
          personalAngle:
            'Kakehashi and Kakei likely have data-loading composables. Compare this version with what you wrote there, and say what you would change.',
          references: [{ label: 'Vue docs: Composables', url: 'https://vuejs.org/guide/reusability/composables.html' }],
        },
      ],
    },
    {
      id: 'vue-ecosystem',
      title: 'Router, Pinia, performance & SSR',
      summary: 'Routing and guards, Pinia and app architecture, rendering performance, and SSR, Nuxt and prerendering.',
      questions: [
        {
          id: 'vue-router-guards',
          title: 'Vue Router: guards, lazy routes and data loading',
          type: 'concept',
          difficulty: 'core',
          priority: 'should',
          tags: ['vue-router', 'navigation-guards', 'lazy-loading', 'auth', 'code-splitting'],
          estMinutes: 5,
          roles: ['frontend', 'full-stack'],
          prompt: `**How do you protect authenticated routes and keep the initial bundle small with Vue Router?** Explain the guard types and lazy-loaded routes, and what happens when only the params change.`,
          hints: [
            'There are global, per-route and in-component guards.',
            'Use route meta for requirements.',
            'Navigating from /users/1 to /users/2 reuses the same component instance.',
          ],
          answer: `**Declare requirements in route \`meta\`, enforce them in a global \`beforeEach\` guard, and lazy-load route components with dynamic imports.**

\`\`\`ts
const routes = [
  { path: '/', component: () => import('@/views/HomeView.vue') },
  {
    path: '/settings',
    component: () => import('@/views/SettingsView.vue'), // its own chunk
    meta: { requiresAuth: true },
  },
  { path: '/:pathMatch(.*)*', component: () => import('@/views/NotFound.vue') },
]

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { path: '/login', query: { redirect: to.fullPath } } // return a redirect
  }
  // returning nothing (or true) allows the navigation; returning false cancels it
})
\`\`\`
Type \`meta\` by augmenting \`RouteMeta\` with \`declare module 'vue-router'\`.

**Guard types, in order:** global \`beforeEach\` → per-route \`beforeEnter\` → in-component \`onBeforeRouteUpdate\` → global \`beforeResolve\` (after async components have resolved; a good place for final checks) → navigation confirmed → \`afterEach\` (analytics, page titles, focus management). In-component \`onBeforeRouteLeave\` handles "you have unsaved changes".

**Params change, same component:** going from \`/users/1\` to \`/users/2\` **reuses the instance**, so \`onMounted\` does not run again. React to the change with \`watch(() => route.params.id, load, { immediate: true })\`, or force a remount with \`<RouterView :key="route.fullPath" />\`.

**Points to mention:**
- **Client-side guards are a UX feature, not security.** The API must authorise every request.
- Lazy routes plus a \`<Suspense>\` or loading state; prefetch likely next routes.
- **Accessibility on navigation:** move focus to the main heading, or announce the route change, in \`afterEach\`, because screen readers do not notice SPA navigation by themselves.
- Configure \`scrollBehavior\` to restore scroll positions.
- Newer router versions add data loaders (experimental) and typed routes (via unplugin-vue-router).`,
          keyPoints: [
            'Route meta plus a global beforeEach that returns a redirect',
            'Lazy routes with dynamic import()',
            'Guard order; beforeRouteLeave for unsaved changes',
            'Param changes reuse the instance: watch the params',
            'Client guards are not security; focus management on navigation',
          ],
          pitfalls: ['Relying on route guards for security', 'Expecting onMounted to rerun when params change'],
          personalAngle:
            'Bring in the accessibility angle: route-change focus management in SPAs is something your accessibility platform would flag on customer sites.',
          references: [{ label: 'Vue Router: Navigation Guards', url: 'https://router.vuejs.org/guide/advanced/navigation-guards.html' }],
        },
        {
          id: 'vue-pinia-architecture',
          title: 'Pinia and Vue application architecture',
          type: 'tradeoff',
          difficulty: 'core',
          priority: 'should',
          tags: ['pinia', 'state-management', 'architecture', 'storetorefs', 'ssr'],
          estMinutes: 6,
          roles: ['frontend', 'full-stack'],
          prompt: `**When do you put state in a Pinia store, and when in a composable or a component?** How do you structure a medium-sized Vue app, and what Pinia pitfalls should you know?`,
          hints: [
            'A composable with state at module level is also "global". What does Pinia add?',
            'Destructuring a store.',
            'Organise by feature, not by file type.',
          ],
          answer: `**Use Pinia for client-owned state shared across distant parts of the app (session, preferences, a cart, cross-page workflows). Use composables for reusable logic whose state belongs to each caller. Use component state for everything local.**

**What Pinia adds over "a ref at module level":**
- **SSR safety:** state is created per app instance (per request), whereas module-level refs leak between users on the server. This is the most important difference.
- Devtools (timeline, state editing), HMR, plugins (persistence, logging), and \`$reset\`/\`$patch\`/\`$subscribe\`.
- Lazy, testable stores (\`setActivePinia(createPinia())\` in tests).

\`\`\`ts
export const useSettingsStore = defineStore('settings', () => {
  const dailyGoal = ref(10)
  const theme = ref<'light' | 'dark'>('light')
  const isAmbitious = computed(() => dailyGoal.value >= 20)
  async function update(patch: Partial<{ dailyGoal: number }>) {
    if (patch.dailyGoal !== undefined) dailyGoal.value = patch.dailyGoal
    await persist()
  }
  return { dailyGoal, theme, isAmbitious, update } // setup store: return everything
})

// in a component
const settings = useSettingsStore()
const { dailyGoal, isAmbitious } = storeToRefs(settings) // keep reactivity
const { update } = settings // actions can be destructured directly
\`\`\`

**Pitfalls:**
- **Destructuring the store directly loses reactivity.** Use \`storeToRefs\` for state and getters.
- Putting **server data** in stores without invalidation. Use a query layer (Pinia Colada, TanStack Query) or clear ownership rules.
- One giant store. Split by domain (\`auth\`, \`cart\`, \`settings\`); stores can use one another inside actions or getters.
- With setup stores, every piece of state must be returned, or SSR hydration and devtools will not see it.

**Architecture for a medium-sized app (by feature):**
\`\`\`text
src/
  app/ (router, layouts, providers)
  features/questions/ (components, composables, store, api, types)
  features/review/
  shared/ (ui, utils, composables)
\`\`\`
Rules: features depend on \`shared\`, never on each other's internals; API access goes through a typed client layer; validation happens at the boundaries; and components are split into presentational ones (props in, events out) and containers that connect to stores and APIs.`,
          keyPoints: [
            'Pinia for shared, client-owned state; composables for reusable logic',
            'Per-request state for SSR safety',
            'storeToRefs for destructuring',
            'Split stores by domain; do not cache server data without invalidation',
            'Feature-based folder structure',
          ],
          pitfalls: ['Module-level refs as global state in SSR apps', 'Destructuring a store without storeToRefs'],
          personalAngle:
            'This app (Interview OS) uses Pinia setup stores backed by IndexedDB, and Hibi and Kakei likely do something similar. Explain your store boundaries in one of them.',
          references: [{ label: 'Pinia documentation', url: 'https://pinia.vuejs.org/' }],
        },
        {
          id: 'vue-performance',
          title: 'Vue performance: what to reach for',
          type: 'concept',
          difficulty: 'advanced',
          priority: 'should',
          tags: ['performance', 'shallowref', 'v-memo', 'keepalive', 'async-components', 'compiler'],
          estMinutes: 6,
          roles: ['frontend', 'full-stack'],
          prompt: `A Vue dashboard with large tables and charts feels slow. **What do you check, and which Vue-specific tools do you use?** Why does Vue usually need less manual memoisation than React?`,
          hints: [
            'Fine-grained reactivity plus a compiler.',
            'Large data does not need to be deeply reactive.',
            'Load less and render less.',
          ],
          answer: `**Vue tracks dependencies per component, so only components whose reactive dependencies changed re-render.** Children do not re-render just because a parent did, provided their props have not changed. The **template compiler** also hoists static content and adds *patch flags*, so only dynamic bindings are compared. This is why Vue rarely needs \`memo\`-style hand optimisation. Performance problems usually come from **too much reactive data, too much DOM, or too much JavaScript**.

**Checklist, measured with Vue Devtools (component render timings) and the Chrome Performance panel:**
1. **Large data:** use \`shallowRef\` or \`markRaw\` for big API payloads or chart datasets, so Vue does not create deep proxies for thousands of objects. Replace the value instead of mutating it deeply.
2. **Large lists:** virtualise (\`vue-virtual-scroller\` or TanStack Virtual), paginate, and use stable \`:key\`s.
3. **Stable props:** passing a *new* object or inline array to a child on every render forces it to update. Compute it once with \`computed\`.
4. **Expensive computations:** move them to \`computed\` (cached) rather than calling methods in the template, which run on every render.
5. **\`v-memo\`** skips re-rendering list items unless the listed values change (\`v-memo="[item.id === selectedId]"\`). It is rarely needed. **\`v-once\`** renders static content once.
6. **Code splitting:** lazy routes and \`defineAsyncComponent\` for heavy widgets (charts, editors). \`<KeepAlive>\` caches expensive tab views instead of remounting them.
7. **Third-party libraries:** mark chart or map instances with \`markRaw\` and update them imperatively, rather than making them reactive.
8. **SSR or prerendering** for faster first content, and **lazy hydration** (Vue 3.5: \`defineAsyncComponent({ loader, hydrate: hydrateOnVisible() })\`) to reduce hydration cost and improve INP.

**Looking ahead:** *Vapor Mode*, an opt-in compilation strategy without a virtual DOM, is in development for future Vue releases. Mention it as an emerging direction, not something most apps use today.`,
          keyPoints: [
            'Per-component dependency tracking; the compiler hoists static content and adds patch flags',
            'shallowRef and markRaw for big data and third-party instances',
            'Virtualise long lists; keep props stable; use computed caching',
            'v-memo, v-once and KeepAlive as targeted tools',
            'Async components and lazy hydration',
          ],
          pitfalls: ['Making a 10k-row payload deeply reactive', 'Calling expensive methods in templates'],
          followUps: ['How would you profile which component re-renders?'],
        },
        {
          id: 'vue-ssr-nuxt-prerendering',
          title: 'SSR, prerendering and Nuxt rendering modes',
          type: 'tradeoff',
          difficulty: 'advanced',
          priority: 'should',
          tags: ['ssr', 'ssg', 'prerendering', 'nuxt', 'hydration', 'route-rules'],
          estMinutes: 7,
          roles: ['frontend', 'full-stack'],
          prompt: `**Compare SPA, SSR, prerendering (SSG) and hybrid rendering for a Vue app.** How did you, or would you, choose for a course platform like Kakehashi, and what causes hydration problems in Vue?`,
          hints: [
            'How fresh is the content, and how personalised?',
            'Nuxt routeRules lets you choose per route.',
            'Hydration mismatches in Vue have the same causes as in React.',
          ],
          answer: `**Choose per route, based on how fresh and how personalised the content is.**

| Mode | HTML produced | Good for | Costs |
| --- | --- | --- | --- |
| SPA (CSR) | an empty shell, rendered by JavaScript | apps behind a login, dashboards | slower first content, weak SEO |
| SSR | per request | personalised or fresh public pages | server cost, TTFB, hydration |
| Prerender (SSG) | at build time | content that changes rarely: marketing, docs, course pages | rebuilds needed to update |
| Hybrid / ISR-like | per route (prerender, cache with revalidation, SSR or SPA) | real products | more configuration |

**Nuxt makes hybrid rendering declarative:**
\`\`\`ts
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    '/': { prerender: true },
    '/courses/**': { swr: 3600 }, // cached SSR, revalidated hourly
    '/dashboard/**': { ssr: false }, // SPA behind login
  },
})
\`\`\`
Use \`useFetch\` or \`useAsyncData\` for data: they run on the server, serialise the result into the payload and **do not fetch again during hydration**. A plain \`fetch\` in \`onMounted\` would wait until the client.

**For a course platform like Kakehashi:** course and lesson pages are public, SEO-relevant and change infrequently, so **prerendering** gives the fastest LCP, cheap hosting and good SEO. Progress tracking and the learner's dashboard are personalised, so they render on the client (or with SSR) after hydration. Course updates trigger a rebuild, or use a revalidating cache when they become frequent.

**Hydration in Vue:** the first client render must match the server HTML. Common causes of mismatches: \`window\` or \`localStorage\` access during \`setup\`, \`Date.now()\` or random values, invalid HTML nesting, and browser extensions or third-party scripts changing the DOM. Fixes: put client-only work in \`onMounted\`, use \`<ClientOnly>\` in Nuxt, \`useId()\` (3.5) for stable IDs, and \`data-allow-mismatch\` (3.5) for values that are expected to differ. **Lazy hydration** (3.5) defers hydrating below-the-fold components, which improves INP.

**SSR safety:** no shared module-level state between requests (use Pinia or \`useState\` in Nuxt), and no direct use of browser globals in \`setup\`.`,
          keyPoints: [
            'Choose per route by freshness and personalisation',
            'Prerendering for stable public content; SPA for authenticated apps',
            'Nuxt routeRules for hybrid rendering',
            'useFetch/useAsyncData avoid double fetching',
            'Hydration rules; useId, data-allow-mismatch and lazy hydration in 3.5',
            'Per-request state on the server',
          ],
          pitfalls: ['"SSR is always better for performance"', 'Fetching in onMounted in an SSR app'],
          followUps: ['How would you handle authenticated SSR pages with cookies?'],
          personalAngle:
            'Kakehashi is prerendered and runs on REI-KIT. Be ready to explain why you chose prerendering over SSR, how you handle the personalised parts, and what the prerendered output did for LCP and SEO. Your content and SEO background (2M+ visitors) gives you credibility here.',
          references: [{ label: 'Nuxt: Rendering modes', url: 'https://nuxt.com/docs/guide/concepts/rendering' }],
        },
      ],
    },
  ],
}

export default track
