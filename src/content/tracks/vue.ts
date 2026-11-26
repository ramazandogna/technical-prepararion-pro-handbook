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
          intent:
            'Tests whether you understand the design problems the Composition API solves (scattered concerns, mixins, weak typing) rather than just preferring it. A strong answer names concrete benefits, shows a composable, and gives an honest case for the Options API.',
          hints: [
            'In an Options API component, where does the code for one feature (say "search") live: in one place, or across `data`, `computed`, `watch` and `methods`?',
            'Before composables, how did Vue 2 apps share logic between components, and what went wrong with it (naming collisions, "where did `this.foo` come from?")?',
            'Think about TypeScript: what is harder to type, `this` inside an options object or plain variables and functions?',
            'Answer shape: "Organise by concern, reuse through composables instead of mixins, better TS inference, leaner compiled output; Options is still supported and fine for legacy code or very simple components."',
          ],
          walkthrough: [
            {
              title: 'Name the problem it solves',
              body: `The Options API groups code by **option type**, so one feature is scattered across \`data\`, \`computed\`, \`watch\` and \`methods\`, and logic reuse relied on **mixins**. The Composition API groups by **logical concern** and reuses logic through **composables**.`,
            },
            {
              title: 'List the concrete benefits',
              body: `- **Colocation:** a feature's state, computed values and handlers sit together and can be extracted to \`useX()\` unchanged.
- **Reuse without mixins:** explicit inputs and outputs, no name collisions, clear origin.
- **TypeScript:** \`defineProps<Props>()\`, \`defineEmits\`, plain variables infer naturally.
- **Output:** \`<script setup>\` compiles into the render function's scope and minifies better.`,
            },
            {
              title: 'Show a composable in use',
              body: `\`\`\`html
<script setup lang="ts">
const { initialQuery = '' } = defineProps<{ initialQuery?: string }>() // 3.5 reactive destructure
const { query, results, loading } = useSearch(() => initialQuery)
</script>
\`\`\`
The getter keeps the destructured prop reactive when passed into the composable.`,
            },
            {
              title: 'Be fair to the Options API',
              body: `It is **not deprecated**; it is implemented on top of the Composition API. Reasonable for existing Options codebases, very small components, or teams new to Vue. Both can be mixed during a migration. The cost of Composition is freedom: without conventions, \`setup\` becomes one long function.`,
            },
            {
              title: 'Say it in 30 seconds',
              body: `"The Composition API lets me organise code by feature and extract it into composables, which replaced mixins and their collisions. It types far better and \`<script setup>\` compiles to leaner code. I'd still accept Options in a legacy codebase or a trivial component, since it's fully supported, but for a library like REI-KIT, composables are what keep behaviour consistent."`,
            },
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
          intent:
            'Tests whether you can explain dependency tracking mechanically (effects, track on get, trigger on set, batched scheduling) and the practical ref/reactive rules that follow. A strong answer covers Proxy vs defineProperty, unwrapping rules, and escape hatches like shallowRef and markRaw.',
          hints: [
            'Vue needs to know which effects (render functions, computed values, watchers) depend on which properties. When is the cheapest moment to record that?',
            'A Proxy `get` trap records "the running effect depends on target.key" (`track`); the `set` trap re-runs those effects (`trigger`). Why can a Proxy not wrap the number `0`?',
            '`ref` is an object with a `.value` getter/setter doing the same track/trigger, so primitives and reassignable values work. Where does Vue unwrap refs for you, and where not?',
            'Shape: "Proxy get → track, set → trigger; updates are batched and flushed in a microtask (nextTick); ref for any value, reactive for objects; unwrapped in templates and reactive properties, not in arrays or Maps; shallowRef/markRaw for big or foreign objects."',
          ],
          walkthrough: [
            {
              title: 'Start with the core idea',
              body: `Vue records **which reactive properties an effect reads**, and **re-runs that effect when one of them is written**. Effects are component render functions, \`computed\` getters and watchers.`,
            },
            {
              title: 'Explain track and trigger',
              body: `\`reactive(obj)\` returns a **Proxy**:
\`\`\`ts
get(target, key)  { track(target, key);   return Reflect.get(target, key) }
set(target, key, v) { Reflect.set(target, key, v); trigger(target, key) }
\`\`\`
\`track\` links the active effect to \`target.key\`; \`trigger\` schedules every linked effect. Component updates are **queued and flushed in a microtask**, hence \`await nextTick()\` before reading the DOM. Vue 3.5 reworked this internally (version counters, linked lists) for much lower memory use, with no API change.`,
            },
            {
              title: 'ref vs reactive',
              body: `- \`ref\` wraps any value behind \`.value\` (primitives cannot be proxied); objects inside become reactive. Reassigning \`.value\` is reactive.
- \`reactive\` works only on objects; **destructuring or replacing the variable loses reactivity**.
- Vue recommends \`ref\` as the default.
- Unwrapping: top-level refs in templates and refs nested in a reactive object; **not** inside reactive arrays or \`Map\`/\`Set\`.`,
            },
            {
              title: 'History and escape hatches',
              body: `Vue 2's \`Object.defineProperty\` could not see added/deleted keys or array index writes (hence \`Vue.set\`); Proxy intercepts all of these, plus \`Map\`/\`Set\`. For performance: \`shallowRef\`/\`shallowReactive\` for large immutable data, \`markRaw\` for third-party instances (chart, map), \`toRaw\` to read the original.`,
            },
            {
              title: 'Say it in 30 seconds',
              body: `"reactive returns a Proxy: reads call track, which links the running effect to that key, and writes call trigger, which queues those effects; DOM updates are batched until nextTick. ref is a .value accessor doing the same, so it works for primitives and reassignment, which is why it's the default. Refs unwrap in templates and inside reactive objects but not in arrays or Maps, and I use shallowRef or markRaw for big or foreign objects."`,
            },
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
          intent:
            'Tests whether you know the three classic ways reactivity is lost and why each happens at the Proxy level. A strong answer fixes each bug with the right tool (toRefs, getter source, mutate or use ref) and generalises to composable inputs and 3.5 props destructuring.',
          hints: [
            'Reactivity lives in the Proxy. Each bug is a place where the code stops going through the Proxy. Where does that happen?',
            '`const { count } = state` performs one read and stores a number. `watch(state.count, ...)` also evaluates `state.count` once. What does `watch` actually receive?',
            'The template was compiled against the first `state` proxy. Reassigning the `let` variable to a new proxy notifies nobody.',
            'Fixes: `toRefs(state)` (or use `state.count`), `watch(() => state.count, cb)`, and `state.items = items` (or switch to `const items = ref<string[]>([])` and assign `.value`).',
          ],
          walkthrough: [
            {
              title: 'Find where the Proxy is bypassed',
              body: `Vue only sees reads and writes that go **through the reactive proxy**. Each symptom is a spot where the code reads a plain value or swaps the proxy out.`,
            },
            {
              title: 'Bugs 1 and 2: plain values',
              body: `- \`const { count } = state\` reads once → a plain \`0\`. Fix: \`const { count } = toRefs(state)\` or use \`state.count\` in the template.
- \`watch(state.count, cb)\` passes the number \`0\`; Vue warns "Invalid watch source". Fix: a getter.
\`\`\`ts
watch(() => state.count, (n) => console.log('count is', n))
\`\`\``,
            },
            {
              title: 'Bug 3: replacing the proxy',
              body: `The template is bound to the **original** proxy; \`state = reactive({...})\` creates a new one nobody watches. Mutate instead, or model with refs:
\`\`\`ts
const items = ref<string[]>([])
async function load() { items.value = await fetchItems() } // replacing .value is reactive
\`\`\`
A \`let\` around a reactive object is a code smell.`,
            },
            {
              title: 'Generalise the rule',
              body: `- Passing \`state.count\` into a composable passes a number; pass a ref or getter and read it with \`toValue()\`.
- Vue 3.5 **reactive props destructure**: \`const { size = 'md' } = defineProps<...>()\` compiles to \`props.size\`, but to pass \`size\` into \`watch\` or a composable, wrap it: \`() => size\`.
- \`deep: true\` does not fix watching a primitive.`,
            },
            {
              title: 'Say it in 30 seconds',
              body: `"All three bugs bypass the proxy. Destructuring reads a plain number, so I use toRefs. watch received a number, so I pass a getter. And replacing the reactive object leaves the template bound to the old proxy, so I mutate it or, better, use refs where replacing .value is reactive. Same rule for composables: pass refs or getters, read with toValue."`,
            },
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
          intent:
            'Tests whether you separate derivation from side effects and understand how each watcher tracks dependencies and when it runs. A strong answer gives an example of each, explains cleanup for async work, flush timing, and the after-await tracking trap.',
          hints: [
            'Split the three into two groups: one produces a value, the other two perform side effects. Which is which?',
            '`watch` has explicit sources, is lazy by default and gives you new and old values. `watchEffect` runs immediately and tracks whatever it reads. What does "reads" miss in an async function?',
            'For an async watcher that fetches, how do you cancel the previous run when the source changes again? (Vue 3.5 added a function for this.)',
            'Shape: "computed = pure cached derivation; watch(() => route.params.id, fetch, { immediate: true }) with onWatcherCleanup(() => ctrl.abort()) before the first await; watchEffect for obvious sync deps like document.title; flush pre/post/sync."',
          ],
          walkthrough: [
            {
              title: 'Group them: derive vs side effect',
              body: `**\`computed\` derives a value** (pure, cached, lazy). **\`watch\` and \`watchEffect\` perform side effects** (fetch, log, touch the DOM, persist). If a watcher only writes state that mirrors other state, it should be a \`computed\`.`,
            },
            {
              title: 'Example of each',
              body: `\`\`\`ts
const visible = computed(() => todos.value.filter((t) => !t.done))

watch(() => route.params.id, async (id) => {
  const c = new AbortController()
  onWatcherCleanup(() => c.abort()) // 3.5; register before the first await
  user.value = await fetchUser(String(id), c.signal)
}, { immediate: true })

watchEffect(() => { document.title = \`\${unread.value} unread\` })
\`\`\``,
            },
            {
              title: 'Tracking and timing details',
              body: `- \`watch\`: explicit sources, lazy unless \`immediate\`, old/new values, \`deep\` (a number in 3.5), \`once\`.
- \`watchEffect\`: immediate, auto-tracks **synchronous** reads only; anything read after \`await\` is not tracked.
- \`flush: 'pre'\` (default, before re-render), \`'post'\` (after DOM update, for measuring), \`'sync'\` (rare, expensive).`,
            },
            {
              title: 'Lifetime and cleanup',
              body: `Watchers created synchronously in \`setup\` stop on unmount. Ones created after an \`await\` or outside components must be stopped with the returned handle (3.5 adds \`pause()\`/\`resume()\`) or grouped in an \`effectScope\`. Cleanups run before the next run and on stop.`,
            },
            {
              title: 'Say it in 30 seconds',
              body: `"computed is for derived values: pure and cached. watch is for side effects when I want explicit sources and old and new values, like refetching when a route param changes, with onWatcherCleanup to abort the previous request. watchEffect is convenient for side effects with obvious synchronous dependencies, but it doesn't track reads after an await. I use flush 'post' when I need the updated DOM."`,
            },
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
          intent:
            'Tests whether you know Vue batches DOM updates asynchronously and where the DOM exists in the lifecycle. A strong answer picks nextTick plus a template ref and explains why the other options fail, including the SSR implication.',
          hints: [
            'When you set a ref, does Vue patch the DOM synchronously, or later?',
            'Vue queues component updates and flushes them in a microtask. Is there a promise you can await that resolves after that flush?',
            'Does the DOM exist during `setup` or `onBeforeMount`? And would they run again after a later state change anyway?',
            'Answer: b. `show.value = true; await nextTick(); input.value?.focus()` with `const input = useTemplateRef<HTMLInputElement>("search")`.',
          ],
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
          intent:
            'Tests whether you can design a component library API: clear data ownership, typed contracts, and customisation through slots instead of prop explosion. A strong answer shows defineProps/defineModel/defineEmits/scoped slots in code and explains one-way data flow, including deep prop mutation.',
          hints: [
            'Who owns the rows, the selection and the sort state: the table, or the page using it? How does each direction of data travel?',
            '`v-model:selected` is sugar for a prop plus an `update:selected` event. Which macro gives the child a ref that does both?',
            'The consumer wants a status badge in one column and a link in another. Would you add props for each, or let the parent render cells with the row data?',
            'Shape: `generic="Row extends { id: string | number }"`, `defineProps<{ rows: Row[]; columns: ... }>()`, `defineModel("selected")`, `defineEmits<{ rowClick: [row: Row] }>()`, a per-column scoped slot (`cell-<key>`) exposing `row` and `value` with a default, plus an `#empty` slot.',
          ],
          walkthrough: [
            {
              title: 'Set the ownership rule',
              body: `**Props down, events up, slots for customisation.** The consumer owns data (\`rows\`) and controlled state (\`selected\`, \`sort\`); the table renders and reports intent. A child never mutates props, **including deep mutation of an object prop**, which Vue does not warn about.`,
            },
            {
              title: 'Type the contract',
              body: `\`\`\`html
<script setup lang="ts" generic="Row extends { id: string | number }">
const props = defineProps<{ rows: Row[]; columns: { key: keyof Row & string; label: string }[]; loading?: boolean }>()
const selected = defineModel<Row['id'][]>('selected', { default: () => [] })
const emit = defineEmits<{ rowClick: [row: Row] }>()
</script>
\`\`\`
\`defineModel\` returns a ref: reading it reads the prop, assigning it emits \`update:selected\`. With a default it works uncontrolled too.`,
            },
            {
              title: 'Use scoped slots for flexibility',
              body: `\`\`\`html
<td v-for="c in props.columns" :key="c.key">
  <slot :name="\`cell-\${c.key}\`" :row="row" :value="row[c.key]">{{ row[c.key] }}</slot>
</td>
<!-- consumer -->
<template #cell-status="{ value }"><Badge :tone="value" /></template>
\`\`\`
Type slots with \`defineSlots\`. One slot replaces a dozen formatting props.`,
            },
            {
              title: 'Library-level details',
              body: `- Declare every emit (undeclared listeners fall through as attributes).
- Decide \`inheritAttrs\` and where \`$attrs\` go (root \`<table>\` or a wrapper).
- Accessibility: real table semantics, \`aria-sort\` on sortable headers, keyboard-operable row actions.
- Keep the API small; add props only for behaviour, not presentation.`,
            },
            {
              title: 'Say it in 30 seconds',
              body: `"Props down, events up: the table never mutates rows, even deeply. Controlled state like selection and sort goes through defineModel so it works with v-model or uncontrolled with a default. Rendering flexibility comes from scoped slots per cell plus an empty slot, instead of many props. Everything is typed with a generic Row, and the table ships with aria-sort and proper semantics."`,
            },
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
          intent:
            'Tests whether you can pick the right sharing mechanism by scope (props, provide/inject, Pinia) and use injection safely. A strong answer shows a typed InjectionKey, provides readonly refs plus mutators, and handles a missing provider.',
          hints: [
            'Think of `<Tabs>` and `<Tab>`: the tab needs the active id, but the user places tabs anywhere inside. Are props practical here?',
            'How do you make `inject()` return a typed value instead of `unknown`, and avoid collisions between libraries?',
            'If you provide `active.value` (a string), what happens when it changes? And who should be allowed to change it?',
            'Shape: `export const TabsKey: InjectionKey<{ active: Readonly<Ref<string>>; select(id: string): void }> = Symbol("Tabs")`; `provide(TabsKey, { active: readonly(active), select })`; `inject(TabsKey)` and throw if missing.',
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
          intent:
            'Tests whether you can write a composable that handles flexible reactive inputs, cancellation and cleanup, and returns a destructurable API. A strong answer writes working code and states the design rules, including SSR behaviour in Nuxt.',
          hints: [
            'The input may be a string, a ref or a getter. Which Vue 3.3+ type and helper normalise all three?',
            'You need to re-run when the URL changes and also on first use. Which watcher setup gives you both, plus a hook to cancel the previous run?',
            'How do you implement `refresh()` when the URL has not changed? Think of a counter that is also a watch source.',
            'Skeleton: `watch([() => toValue(url), version], async ([u], _o, onCleanup) => { const c = new AbortController(); onCleanup(() => c.abort()); ... }, { immediate: true })`; return `{ data, error, loading, refresh: () => version.value++ }` as refs.',
          ],
          walkthrough: [
            {
              title: 'Clarify the contract',
              body: `Input: \`MaybeRefOrGetter<string>\`. Output: refs \`{ data, error, loading, refresh }\`. Behaviour: fetch immediately, refetch on URL change or \`refresh()\`, never let a stale response win, clean up on unmount.`,
            },
            {
              title: 'Normalise input and watch it',
              body: `\`toValue(url)\` reads a string, ref or getter uniformly. Watch a getter plus a \`version\` counter:
\`\`\`ts
const version = ref(0)
watch([() => toValue(url), version], run, { immediate: true })
\`\`\`
\`immediate\` gives the first fetch; \`version.value++\` gives \`refresh\`.`,
            },
            {
              title: 'Write the fetch with cancellation',
              body: `\`\`\`ts
async ([u], _old, onCleanup) => {
  const c = new AbortController()
  onCleanup(() => c.abort()) // next run or unmount
  loading.value = true; error.value = null
  try {
    const res = await fetch(u, { signal: c.signal })
    if (!res.ok) throw new Error(\`HTTP \${res.status}\`)
    data.value = (await res.json()) as T
  } catch (e) {
    if ((e as Error).name !== 'AbortError') error.value = e as Error
  } finally {
    if (!c.signal.aborted) loading.value = false
  }
}
\`\`\`
Use \`shallowRef\` for \`data\`: payloads are replaced, not deeply mutated.`,
            },
            {
              title: 'Design rules and SSR',
              body: `- Return **an object of refs** so callers can destructure.
- One concern per composable, called synchronously in \`setup\`; outside components use \`effectScope\`/\`onScopeDispose\`.
- This fetches on the client only. In **Nuxt**, use \`useFetch\`/\`useAsyncData\`, which fetch on the server and reuse the payload during hydration.
- For shared caching, Pinia Colada or TanStack Query.`,
            },
            {
              title: 'Say it in 30 seconds',
              body: `"I accept MaybeRefOrGetter and read it with toValue, watch that getter plus a version counter with immediate true, and create an AbortController per run that onCleanup aborts, so stale responses never land and unmount cleans up. I return refs, use shallowRef for the payload, and in Nuxt I'd use its useFetch to avoid double fetching on hydration."`,
            },
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
          intent:
            'Tests whether you can structure routing for auth and performance and know the instance-reuse trap. A strong answer uses route meta plus a global guard returning a redirect, lazy imports, handles param changes, and states that client guards are UX, not security.',
          hints: [
            'Where would you declare "this route needs login" so you do not repeat the check in every component?',
            'In Vue Router 4, a guard can return a value instead of calling `next()`. What do `false`, `undefined` and a route location each mean?',
            'From `/users/1` to `/users/2`, is the component unmounted and remounted? Does `onMounted` run again?',
            'Shape: `meta: { requiresAuth: true }` + `beforeEach(to => !auth.isLoggedIn && to.meta.requiresAuth ? { path: "/login", query: { redirect: to.fullPath } } : undefined)`; `component: () => import(...)`; `watch(() => route.params.id, load, { immediate: true })`; server still authorises.',
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
          intent:
            'Tests whether you can place state by ownership and scope, and know what Pinia adds beyond a module-level ref, especially for SSR. A strong answer gives a clear rule, a setup-store example with storeToRefs, the common pitfalls, and a feature-based structure.',
          hints: [
            'Classify state: local to one component, logic reused but per caller, or shared across distant pages. Which tool fits each?',
            'A `ref` exported from a module is also "global". On an SSR server handling many users, what is wrong with that?',
            'What happens to reactivity when you write `const { dailyGoal } = useSettingsStore()`?',
            'Shape: "Component state by default; composables for reusable per-caller logic; Pinia for shared client-owned state (per-request on SSR, devtools, plugins); storeToRefs for state/getters; split by domain; server data in a query cache."',
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
          intent:
            'Tests whether you know why Vue rarely needs manual memoisation and which Vue-specific levers actually matter. A strong answer explains per-component tracking and compiler patch flags, then gives a measured checklist (shallowRef/markRaw, virtualisation, stable props, async components, lazy hydration) and positions Vapor Mode correctly.',
          hints: [
            'When a parent re-renders in Vue, does a child with unchanged props re-render? Compare with React.',
            'A 10,000-row API payload in `ref()` becomes 10,000 deep proxies. Does chart data need to be deeply reactive?',
            'Beyond reactivity: how much DOM is rendered, and how much JavaScript is loaded and hydrated upfront?',
            'Checklist: measure (Vue Devtools, Performance panel) → `shallowRef`/`markRaw` → virtualise → stable props via `computed` → `v-memo`/`v-once`/`KeepAlive` → `defineAsyncComponent` + `hydrateOnVisible()` → Vapor Mode as an opt-in future option.',
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

**Looking ahead: Vapor Mode.** An opt-in compilation strategy (introduced with Vue 3.6, still maturing) that compiles \`<script setup>\` components to direct DOM operations **without a virtual DOM**, similar to Solid. It is enabled per component (\`<script setup vapor>\`) and can be mixed with regular components, giving smaller runtime and faster updates. Mention it as an emerging option for hot paths, not as something most production apps have migrated to.`,
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
          intent:
            'Tests whether you choose rendering modes per route from freshness and personalisation, and understand the hydration and SSR-safety consequences. A strong answer gives a comparison, shows Nuxt routeRules, justifies a concrete choice for a real project, and lists Vue 3.5 hydration tools.',
          hints: [
            'For each page ask two questions: how often does the content change, and is it the same for every visitor?',
            'Must one app use one mode? Nuxt lets you set rendering per route pattern. What is that config called?',
            'Course pages: public, SEO-relevant, rarely changing. Learner dashboard: personalised. Which mode suits each?',
            'Shape: table SPA/SSR/SSG/hybrid → `routeRules: { "/": { prerender: true }, "/courses/**": { swr: 3600 }, "/dashboard/**": { ssr: false } }` → useFetch/useAsyncData avoid refetch on hydrate → mismatch causes + `useId`, `data-allow-mismatch`, lazy hydration → per-request state.',
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
        {
          id: 'vue-ssr-hydration-debug',
          title: 'Debug: Vue/Nuxt hydration mismatch',
          type: 'debugging',
          difficulty: 'advanced',
          priority: 'must',
          tags: ['ssr', 'hydration', 'hydration-mismatch', 'nuxt', 'useid', 'data-allow-mismatch'],
          estMinutes: 10,
          roles: ['frontend', 'full-stack'],
          prompt: `In a Nuxt 3 app this header component logs **"Hydration completed but contains mismatches"** and the theme flickers on load. In production the warning has no detail. **Find the causes, fix them, and explain how you would debug this in production.**`,
          code: {
            language: 'html',
            source: `<script setup lang="ts">
const theme = localStorage.getItem('theme') ?? 'light'
const menuId = \`menu-\${Math.random().toString(36).slice(2)}\`
const greeting = new Date().getHours() < 12 ? 'Good morning' : 'Good afternoon'
</script>

<template>
  <header :class="theme">
    <p>
      {{ greeting }}
      <div class="badge">Beta</div>
    </p>
    <button :aria-controls="menuId">Menu</button>
    <nav :id="menuId">...</nav>
  </header>
</template>`,
          },
          intent:
            'Tests whether you can reason about what runs on the server vs the client in Vue SSR and fix each mismatch with the right tool instead of disabling SSR. A strong answer finds all four causes, fixes them (cookie/SSR state, useId, client-only time, valid nesting), and knows how to get mismatch details in production.',
          hints: [
            'Go line by line through `<script setup>`: which lines run on the server, and would they produce the same value in the browser a moment later?',
            '`localStorage` does not exist on the server (it actually throws there). `Math.random()` and `new Date()` give different results on each side. One more cause is in the template, not the script.',
            'A `<div>` inside a `<p>` is invalid HTML: the browser closes the `<p>` early while parsing, so the DOM no longer matches the server vnode tree.',
            'Fixes: theme from a cookie (`useCookie("theme")`) so the server knows it; `const menuId = useId()`; compute the greeting in `onMounted` or wrap it in `<ClientOnly>` / `data-allow-mismatch="text"`; change `<p>` to `<div>` or `<div class="badge">` to `<span>`.',
          ],
          answer: `**Four causes; each one makes the first client render differ from the server HTML.**

1. **\`localStorage\` in \`setup\`:** \`setup\` runs on the server, where \`localStorage\` is undefined (in Nuxt this throws during SSR or is guarded and falls back to \`'light'\`). The client then reads \`'dark'\`, so the \`class\` differs, and the theme flickers.
2. **\`Math.random()\` id:** a different id on each side; the \`aria-controls\`/\`id\` pair mismatches.
3. **\`new Date()\`:** server and browser can be in different time zones, and time passes between renders.
4. **Invalid nesting:** \`<div>\` inside \`<p>\`. The HTML parser auto-closes the \`<p>\`, so the real DOM tree differs from the vnode tree Vue expects.

**Fixes:**
\`\`\`html
<script setup lang="ts">
const theme = useCookie<'light' | 'dark'>('theme', { default: () => 'light' }) // readable on server and client
const menuId = useId() // Vue 3.5: stable across SSR and hydration
const greeting = ref('Hello')
onMounted(() => {
  greeting.value = new Date().getHours() < 12 ? 'Good morning' : 'Good afternoon'
})
</script>

<template>
  <header :class="theme">
    <div>
      {{ greeting }}
      <span class="badge">Beta</span>
    </div>
    <button :aria-controls="menuId">Menu</button>
    <nav :id="menuId">...</nav>
  </header>
</template>
\`\`\`
- **Persisted user preferences** that affect the first paint belong in a **cookie** (or server session), not \`localStorage\`, so the server renders the right HTML and nothing flickers.
- **Client-only values:** set them in \`onMounted\`, wrap in \`<ClientOnly>\` (Nuxt), or, for a single value that is expected to differ, mark it with \`data-allow-mismatch="text"\` (Vue 3.5).
- **Ids:** \`useId()\` instead of random values or counters.

**Debugging in production:** Vue strips mismatch details from production builds. Enable them with the compile-time flag \`__VUE_PROD_HYDRATION_MISMATCH_DETAILS__: true\` (set through Vite's \`define\`, e.g. \`vite.define\` in \`nuxt.config.ts\`) in a staging build, reproduce with extensions disabled (they inject attributes), and compare **View Source** (server HTML) with the Elements panel (post-hydration DOM). Check for third-party scripts that mutate the DOM before hydration.`,
          keyPoints: [
            'setup runs on both server and client; first client render must match',
            'Preferences affecting first paint go in cookies, not localStorage',
            'useId for SSR-stable ids; onMounted / ClientOnly for client-only values',
            'Invalid HTML nesting is a mismatch cause the parser creates',
            'data-allow-mismatch for expected differences; production details flag for debugging',
          ],
          pitfalls: [
            'Turning off SSR for the page to "fix" it',
            'Guarding with `typeof window` inside setup, which still renders different output',
            'Using a module-level counter for ids (it leaks between requests on the server)',
          ],
          followUps: [
            'How would you avoid a dark-mode flash on a fully static (prerendered) site?',
            'What does lazy hydration change about mismatches?',
          ],
          walkthrough: [
            {
              title: 'Frame what must match',
              body: `\`setup\` and the template render **twice**: on the server to HTML, then in the browser during hydration. Vue compares the vnode tree with the existing DOM. Any value that can differ between the two runs, or any DOM the parser rewrote, is a mismatch.`,
            },
            {
              title: 'Find the four causes',
              body: `- \`localStorage\` → unavailable on the server, so \`class\` differs (and flickers).
- \`Math.random()\` → different \`id\` / \`aria-controls\`.
- \`new Date()\` → time zone and time differ.
- \`<div>\` inside \`<p>\` → the parser closes \`<p>\` early, changing the DOM tree.`,
            },
            {
              title: 'Fix each with the right tool',
              body: `\`\`\`ts
const theme = useCookie('theme', { default: () => 'light' })
const menuId = useId()
const greeting = ref('Hello')
onMounted(() => { greeting.value = computeGreeting() })
\`\`\`
And use \`<span>\` inside the paragraph (or a \`<div>\` wrapper). For a single expected difference, \`data-allow-mismatch="text"\`; for widgets that cannot render on the server, \`<ClientOnly>\`.`,
            },
            {
              title: 'Debug it in production',
              body: `- Build staging with \`__VUE_PROD_HYDRATION_MISMATCH_DETAILS__: true\` to get the diff.
- Compare View Source (server HTML) with the hydrated DOM.
- Test in a clean profile: extensions inject attributes.
- Look for third-party scripts (consent, analytics, widgets) touching the DOM before hydration.`,
            },
            {
              title: 'Say it in 30 seconds',
              body: `"setup runs on both server and client, so anything environment- or time-dependent breaks hydration. Here: localStorage, Math.random, the date, and a div inside a p that the parser rewrites. I'd move the theme to a cookie so the server renders it, use useId, compute the greeting in onMounted, and fix the nesting. In production I'd enable the hydration-details flag on staging and diff the server HTML against the DOM."`,
            },
          ],
          personalAngle:
            'Your consent and accessibility scripts ran on customers\' SSR sites. Use that as the real example: a script that touched the DOM before the host framework hydrated, and how you scheduled or isolated it to avoid mismatches.',
          references: [{ label: 'Vue docs: SSR hydration mismatch', url: 'https://vuejs.org/guide/scaling-up/ssr.html' }],
        },
        {
          id: 'vue-3-5-modern-apis',
          title: 'Modern Vue 3.5+: what changed and how you use it',
          type: 'concept',
          difficulty: 'core',
          priority: 'should',
          tags: ['vue-3-5', 'props-destructure', 'usetemplateref', 'useid', 'lazy-hydration', 'vapor-mode'],
          estMinutes: 6,
          roles: ['frontend', 'full-stack'],
          prompt: `"You have used Vue for a few years. **What changed in Vue 3.4–3.5 (and what is coming with Vapor Mode) that affects how you write components today?** Show at least three APIs in code."`,
          intent:
            'Tests whether your Vue knowledge is current and whether you understand the trade-offs of each new API, not just the names. A strong answer covers reactive props destructure (and its getter caveat), useTemplateRef, useId, defineModel, onWatcherCleanup, lazy hydration, and positions Vapor Mode accurately.',
          hints: [
            'Start with `<script setup>` macros: what changed about destructuring `defineProps()`, and which macro replaced the prop + emit pair for `v-model`?',
            'Template refs used to require a `ref(null)` with a matching variable name. What does 3.5 offer instead, and how do SSR-safe ids work now?',
            'For SSR: what new options let a component hydrate only when visible or idle?',
            'Shape: `const { size = "md" } = defineProps<P>()` (pass `() => size` onward) · `defineModel()` · `useTemplateRef("el")` · `useId()` · `onWatcherCleanup()` · `defineAsyncComponent({ loader, hydrate: hydrateOnVisible() })` · Vapor Mode opt-in per component, no virtual DOM, still maturing.',
          ],
          answer: `**Vue 3.4–3.5 mostly removed boilerplate and footguns in \`<script setup>\` and improved SSR; Vapor Mode is the next step for performance.**

**Reactive props destructure (3.5, stable):**
\`\`\`ts
const { size = 'md', disabled = false } = defineProps<{ size?: 'sm' | 'md'; disabled?: boolean }>()
watch(() => size, (s) => console.log(s)) // pass a getter, not the bare variable
\`\`\`
The compiler rewrites \`size\` to \`props.size\`, so it stays reactive and native defaults replace \`withDefaults\`. Caveat: \`watch(size, ...)\` or \`useX(size)\` passes a plain value; wrap it in a getter.

**\`defineModel\` (3.4):** a ref that reads the prop and emits \`update:x\` on write; supports multiple models and modifiers.

**\`useTemplateRef\` (3.5):**
\`\`\`ts
const input = useTemplateRef<HTMLInputElement>('search') // matches ref="search"
onMounted(() => input.value?.focus())
\`\`\`
Decouples the variable name from the \`ref\` string and works with dynamic ref names.

**\`useId\` (3.5):** SSR-stable unique ids for \`label for\`, \`aria-describedby\`, \`aria-controls\`.

**Watchers:** \`onWatcherCleanup\` (cancel the previous async run), \`deep: number\`, \`once\`, and \`pause()\`/\`resume()\` on handles.

**SSR:** lazy hydration strategies for async components:
\`\`\`ts
const Comments = defineAsyncComponent({ loader: () => import('./Comments.vue'), hydrate: hydrateOnVisible() })
\`\`\`
plus \`hydrateOnIdle\`, \`hydrateOnInteraction\`, \`hydrateOnMediaQuery\`; and \`data-allow-mismatch\` for expected differences.

**Internals:** the 3.5 reactivity refactor cut memory use substantially and sped up large arrays, with no API change.

**\`Teleport\` \`defer\`** (3.5) lets a teleport target be rendered later in the same tree.

**Vapor Mode:** an opt-in compile target (introduced with Vue 3.6, still maturing) that compiles \`<script setup>\` components to direct DOM updates without the virtual DOM, opted into per component and interoperable with normal components. Useful for performance-critical subtrees; most apps are not migrating wholesale yet.`,
          keyPoints: [
            'Reactive props destructure with native defaults; pass getters onward',
            'defineModel for v-model',
            'useTemplateRef and useId',
            'onWatcherCleanup and watcher pause/resume',
            'Lazy hydration strategies and data-allow-mismatch',
            'Vapor Mode: opt-in, no virtual DOM, still maturing',
          ],
          pitfalls: [
            'Passing a destructured prop directly to watch or a composable',
            'Claiming Vapor Mode replaces the virtual DOM for all apps today',
          ],
          followUps: [
            'How would you migrate a component library like REI-KIT to these APIs safely?',
            'When would Vapor Mode not be worth it?',
          ],
          personalAngle:
            'REI-KIT is a good migration story: describe moving components from withDefaults to destructured defaults, or from manual id counters to useId, and what you checked to avoid breaking consumers.',
          references: [{ label: 'Vue blog: Announcing Vue 3.5', url: 'https://blog.vuejs.org/posts/vue-3-5' }],
        },
      ],
    },
  ],
}

export default track
