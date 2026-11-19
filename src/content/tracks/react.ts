import type { Track } from '@/types/content'

const track: Track = {
  id: 'react',
  code: 'F',
  title: 'React',
  summary: 'Rendering model, hooks, reconciliation, performance and modern server-side React.',
  rationale:
    'Most Tokyo frontend and full-stack roles list React. You have shipped React + TypeScript integrations, but interviews probe the model underneath: render vs commit, effects and closures, keys, and React 19\'s server-side features. This track also prepares you to compare React with Vue, a question you will get because both are on your CV.',
  icon: 'Atom',
  phase: 2,
  modules: [
    {
      id: 'react-model',
      title: 'Rendering model',
      summary: 'State as a snapshot, batching, reconciliation and keys, and the rules of hooks.',
      questions: [
        {
          id: 'react-state-snapshot-batching',
          title: 'State as a snapshot and batching',
          type: 'output',
          difficulty: 'foundation',
          priority: 'must',
          tags: ['state', 'batching', 'rendering', 'usestate'],
          estMinutes: 4,
          roles: ['frontend', 'full-stack'],
          prompt: `The button is clicked **once**. **What is logged, and what number is displayed after the re-render?** Explain why.`,
          code: {
            language: 'javascript',
            source: `function Counter() {
  const [count, setCount] = useState(0)

  function handleClick() {
    setCount(count + 1)
    setCount(count + 1)
    setCount((c) => c + 1)
    console.log(count)
  }

  return <button onClick={handleClick}>{count}</button>
}`,
          },
          hints: [
            'Inside this render, count is a constant.',
            'setState queues an update; it does not change the variable.',
            'An updater function receives the pending value.',
          ],
          answer: `**It logs \`0\` and displays \`2\`.**

**Why:**
- **State is a snapshot for each render.** \`count\` is a \`const\` of value 0 inside this render's \`handleClick\`. Calling \`setCount\` **queues** an update and schedules a re-render; it does not change the local variable, so the log prints \`0\`.
- **Updates are batched.** React 18 and later batch every update in the same event, including those in timeouts and promises, then process the queue in order:
  1. \`setCount(0 + 1)\` → replace with 1
  2. \`setCount(0 + 1)\` → replace with 1
  3. \`setCount(c => c + 1)\` → the updater receives the pending value 1, giving **2**
- There is a single re-render, with \`count = 2\`.

**Rendering in short:** a **render** calls your component function to compute JSX, and must be pure. The **commit** applies the minimal set of DOM changes. **Effects** run after the commit. A re-render is triggered by a state change in the component, a parent re-rendering, or a context it consumes changing. Props changing is a consequence of the parent re-rendering, not a separate trigger.

**Rule of thumb:** use the **updater form** (\`setX(prev => …)\`) whenever the new state depends on the previous one, especially in asynchronous callbacks, intervals and repeated calls.

**Comparison with Vue:** in Vue, \`count.value++\` mutates a reactive ref immediately (the value changes synchronously), while the DOM update is batched until the next tick. This is one of the cleanest ways to contrast the two models.`,
          keyPoints: [
            'State is a constant snapshot for each render',
            'setState queues an update and schedules a re-render',
            'Automatic batching (React 18+)',
            'Updater functions chain on the pending value',
            'Render must be pure; commit and effects come after',
          ],
          pitfalls: ['Expecting 3', 'Expecting the log to show the new value'],
          followUps: ['How does this differ in Vue?', 'When would you need flushSync?'],
          references: [{ label: 'react.dev: State as a Snapshot', url: 'https://react.dev/learn/state-as-a-snapshot' }],
        },
        {
          id: 'react-reconciliation-keys',
          title: 'Debug: reconciliation and index keys',
          type: 'debugging',
          difficulty: 'core',
          priority: 'must',
          tags: ['reconciliation', 'keys', 'lists', 'state-preservation'],
          estMinutes: 6,
          roles: ['frontend', 'full-stack'],
          prompt: `Each \`TodoRow\` has a local "editing" text input. After **deleting the first todo**, the second row shows the first row's draft text. **Why, and how does reconciliation explain it?**`,
          code: {
            language: 'javascript',
            source: `function TodoList({ todos, onDelete }) {
  return (
    <ul>
      {todos.map((todo, i) => (
        <TodoRow key={i} todo={todo} onDelete={() => onDelete(todo.id)} />
      ))}
    </ul>
  )
}

function TodoRow({ todo, onDelete }) {
  const [draft, setDraft] = useState(todo.title)
  return (
    <li>
      <input value={draft} onChange={(e) => setDraft(e.target.value)} />
      <button onClick={onDelete}>Delete</button>
    </li>
  )
}`,
          },
          hints: [
            'React matches old and new children by key.',
            'After the deletion, which component instance has key 0?',
          ],
          answer: `**Index keys tie component state to a position instead of to an item.** After deleting item 0, the item that used to be at index 1 now has **key 0**. React sees key 0 still present, **reuses that component instance and its state** (\`draft\` from the old first row), and passes it the new \`todo\` prop. Because \`useState(todo.title)\` uses the prop only as the *initial* value, the stale draft remains. The last key simply disappears.

**Fix: use a stable, unique identity:**
\`\`\`jsx
{todos.map((todo) => (
  <TodoRow key={todo.id} todo={todo} onDelete={() => onDelete(todo.id)} />
))}
\`\`\`

**Reconciliation in short:** on every render React compares the new element tree with the previous one:
- If the **type** at a position is different (\`<div>\` → \`<span>\`, or \`CompA\` → \`CompB\`), React destroys the subtree and remounts it, losing its state.
- If the type is the same, React keeps the instance and updates its props.
- For **lists**, children are matched by \`key\`. A key must be stable, unique among siblings and derived from the data. Index keys are fine only for static lists that are never reordered, filtered or prepended to.

**Using \`key\` deliberately:** changing a key forces a remount, which is a clean way to reset state:
\`\`\`jsx
<ProfileForm key={userId} userId={userId} /> // fresh form state per user
\`\`\`

**Related mistakes:** \`key={Math.random()}\` remounts every row on every render (slow, and focus is lost). Defining a component *inside* another component creates a new type on each render, so it is remounted every time.`,
          keyPoints: [
            'Keys identify a child across renders',
            'Index keys bind state to a position',
            'Same type and key: reuse; different: remount',
            'Changing a key resets state on purpose',
            'Random keys and inline component definitions cause remounts',
          ],
          pitfalls: ['Random keys', '"Keys are only there to silence the warning"'],
          followUps: ['Why is defining a component inside another component a bug?'],
          references: [{ label: 'react.dev: Preserving and Resetting State', url: 'https://react.dev/learn/preserving-and-resetting-state' }],
        },
        {
          id: 'react-rules-of-hooks',
          title: 'Rules of hooks and common mistakes',
          type: 'multiple-choice',
          difficulty: 'foundation',
          priority: 'should',
          tags: ['hooks', 'rules-of-hooks', 'common-mistakes'],
          estMinutes: 3,
          roles: ['frontend', 'full-stack'],
          prompt: `**Which of these breaks the rules of hooks?** Select all that apply.`,
          choices: [
            {
              id: 'a',
              text: '`if (!user) return null` placed **before** a `useState` call',
              correct: true,
              explanation: 'An early return before a hook means the hook is called on some renders and not on others.',
            },
            {
              id: 'b',
              text: 'Calling `useEffect` inside a `for` loop over props.items',
              correct: true,
              explanation: 'The number of hook calls would change with the length of the list.',
            },
            {
              id: 'c',
              text: 'Calling a custom hook `useCart()` at the top level of a component',
              correct: false,
              explanation: 'Custom hooks are hooks; calling them at the top level is correct.',
            },
            {
              id: 'd',
              text: 'Calling `use(promise)` inside an `if` block',
              correct: false,
              explanation: 'React 19\'s `use` is the exception: it may be called conditionally.',
            },
          ],
          hints: ['React identifies each hook by its call order.'],
          answer: `**a and b break the rules.** Call hooks **only at the top level** of a component or custom hook, never conditionally, in loops or after an early return, and **only from React functions**.

**Why:** React does not know hooks by name. It stores them as a list on the component's fiber and matches them by **call order**: the first \`useState\` gets slot 0, the next gets slot 1, and so on. If the order changes between renders, state ends up in the wrong hook. The ESLint plugin \`eslint-plugin-react-hooks\` catches these mistakes, and its \`exhaustive-deps\` rule catches missing dependencies.

**React 19's \`use\`** reads a promise or a context and **may be called conditionally**, because it does not store anything in a hook slot. It still cannot be called inside \`try/catch\`.

**Common hook mistakes to know:**
- Copying props into state (\`useState(props.value)\`) and expecting it to stay in sync. Derive the value instead, or reset with a \`key\`.
- Storing derived data in state with an effect to update it, which causes an extra render. Compute it during render.
- Mutating state (\`arr.push\`, then \`setArr(arr)\`): the reference is the same, so React bails out and nothing re-renders.
- Creating objects or functions inline and listing them as effect dependencies, so the effect runs on every render.
- Expensive initial state: \`useState(compute())\` runs \`compute\` on every render; use \`useState(() => compute())\`.`,
          keyPoints: [
            'Hooks are matched by call order',
            'Top level only: no conditions, loops or early returns before them',
            'use() may be called conditionally',
            'Derive rather than syncing state; do not mutate state',
            'Use lazy initial state for expensive defaults',
          ],
          pitfalls: ['Thinking hooks are matched by variable name'],
        },
      ],
    },
    {
      id: 'react-hooks',
      title: 'Hooks in depth',
      summary: 'Effect pitfalls, memoisation and refs, context performance, and writing custom hooks.',
      questions: [
        {
          id: 'react-useeffect-pitfalls',
          title: 'Debug: useEffect stale closures and races',
          type: 'debugging',
          difficulty: 'core',
          priority: 'must',
          tags: ['useeffect', 'stale-closure', 'race-conditions', 'cleanup', 'dependencies'],
          estMinutes: 10,
          roles: ['frontend', 'full-stack'],
          prompt: `This component has **at least three bugs**. Find them and fix them.`,
          code: {
            language: 'javascript',
            source: `function Dashboard({ userId }) {
  const [seconds, setSeconds] = useState(0)
  const [user, setUser] = useState(null)

  useEffect(() => {
    setInterval(() => setSeconds(seconds + 1), 1000)
  }, [])

  useEffect(() => {
    fetch(\`/api/users/\${userId}\`)
      .then((r) => r.json())
      .then(setUser)
  }, [userId])

  return <p>{user?.name} has been here {seconds}s</p>
}`,
          },
          hints: [
            'Which value of seconds does the interval callback see?',
            'What happens to the interval when the component unmounts?',
            'userId changes quickly from 1 to 2, and the response for 1 arrives last.',
          ],
          answer: `**Bug 1: a stale closure.** The effect runs once (\`[]\`), so the interval callback closes over \`seconds = 0\` permanently, and the counter stays stuck at 1.
**Bug 2: no cleanup.** The interval is never cleared. It leaks after unmount, and React StrictMode's development double-mount creates two intervals.
**Bug 3: a race condition.** If \`userId\` changes from 1 to 2 and the response for 1 arrives *after* the response for 2, the page shows the wrong user. There is also no error handling.

\`\`\`jsx
function Dashboard({ userId }) {
  const [seconds, setSeconds] = useState(0)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000) // updater: no stale value
    return () => clearInterval(id) // cleanup
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetch(\`/api/users/\${userId}\`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(\`HTTP \${r.status}\`)
        return r.json()
      })
      .then(setUser)
      .catch((err) => {
        if (err.name !== 'AbortError') console.error(err)
      })
    return () => controller.abort() // a stale request can never overwrite newer data
  }, [userId])

  return <p>{user?.name} has been here {seconds}s</p>
}
\`\`\`

**A mental model for effects:** an effect **synchronises** the component with an external system (timers, subscriptions, the network, the DOM, widgets). Every effect that starts something needs a cleanup that stops it. Dependencies are *every reactive value the effect reads*, not a choice about "when it should run".

**You might not need an effect** for: deriving data from props or state (compute it during render), responding to a user event (do it in the event handler), or resetting state when a prop changes (use a \`key\`). For data fetching in real apps, prefer a framework loader, Server Components, or a query library, which handle caching, deduplication and races for you.

**StrictMode** mounts, unmounts and remounts components in development **on purpose**, to surface missing cleanups like bug 2.`,
          keyPoints: [
            'Stale closure: use the updater form or correct dependencies',
            'Every subscription or timer needs a cleanup',
            'Abort or ignore stale fetches',
            'Effects synchronise with external systems',
            'StrictMode double-invokes effects to expose missing cleanups',
          ],
          pitfalls: ['Silencing exhaustive-deps', 'Adding seconds to the dependencies, which recreates the interval every second (it works, but is wasteful)'],
          followUps: ['What is useEffectEvent for?', 'How would TanStack Query change this code?'],
          references: [{ label: 'react.dev: You Might Not Need an Effect', url: 'https://react.dev/learn/you-might-not-need-an-effect' }],
        },
        {
          id: 'react-memo-callback-ref',
          title: 'useMemo, useCallback, React.memo and useRef',
          type: 'tradeoff',
          difficulty: 'core',
          priority: 'must',
          tags: ['usememo', 'usecallback', 'react-memo', 'useref', 'react-compiler', 'memoization'],
          estMinutes: 6,
          roles: ['frontend', 'full-stack'],
          prompt: `A teammate wraps **every** function in \`useCallback\` and every value in \`useMemo\` "for performance". **Is that right?** When do these hooks actually help, how do they relate to \`React.memo\`, and what is \`useRef\` for? How does the React Compiler change this?`,
          hints: [
            'Memoisation has a cost, and it only pays off when something compares references.',
            'useCallback without a memoised child is usually pointless.',
            'useRef stores a mutable value that does not trigger a re-render.',
          ],
          answer: `**No. Memoisation is a targeted tool.** Each hook costs memory, comparison work and complexity, and it only helps when **someone compares the reference** or the computation is genuinely expensive.

**When they help:**
- **\`useMemo\`** helps (1) for genuinely **expensive computations** (measure them first: about 1 ms or more), or (2) to keep a **stable reference** for an object or array passed to a memoised child or used as an effect dependency.
- **\`useCallback(fn, deps)\`** is \`useMemo(() => fn, deps)\`. It is useful when the function goes to a **\`React.memo\`** child, or is a dependency of an effect or another hook.
- **\`React.memo(Component)\`** skips re-rendering a child when its props are shallowly equal. It only works if the props *are* stable, which is where \`useCallback\` and \`useMemo\` come in. Without \`React.memo\` on the child, a \`useCallback\` passed to it does nothing.

\`\`\`jsx
const Row = memo(function Row({ item, onSelect }) { /* ... */ })

function List({ items }) {
  const [selected, setSelected] = useState(null)
  const onSelect = useCallback((id) => setSelected(id), []) // stable, so Row can skip
  const sorted = useMemo(() => [...items].sort(byDate), [items]) // expensive for large lists
  return sorted.map((it) => <Row key={it.id} item={it} onSelect={onSelect} />)
}
\`\`\`

**Better alternatives first:** move state down (colocation), or pass \`children\` so that the expensive subtree is not re-rendered by the parent's state.

**\`useRef\`** holds a **mutable value that persists across renders without triggering a re-render**: DOM nodes (\`ref={inputRef}\`), timer ids, the previous value, the latest callback. Do not read or write \`ref.current\` during render (except for lazy initialisation), because it makes rendering impure. In React 19, \`ref\` is a regular prop on function components, so \`forwardRef\` is no longer needed.

**The React Compiler** (stable since late 2025) automatically memoises components and values at build time, which removes most hand-written \`useMemo\`, \`useCallback\` and \`memo\` in code that follows the rules of React. Manual memoisation is then for edge cases and effect dependencies.`,
          keyPoints: [
            'Memoisation only pays off when references are compared or the work is expensive',
            'useCallback is only useful with memo children or as a dependency',
            'Prefer colocation and children composition first',
            'useRef: mutable, persistent, no re-render; not read during render',
            'The React Compiler automates memoisation',
          ],
          pitfalls: ['Memoising everything', 'Expecting useMemo to be a semantic guarantee (React may discard the cache)'],
          followUps: ['How would you find the component that re-renders too often?'],
          references: [{ label: 'react.dev: useMemo', url: 'https://react.dev/reference/react/useMemo' }],
        },
        {
          id: 'react-context-performance',
          title: 'Context: when to use it, and why it re-renders',
          type: 'concept',
          difficulty: 'core',
          priority: 'should',
          tags: ['context', 'performance', 'state-management', 'usesyncexternalstore'],
          estMinutes: 5,
          roles: ['frontend', 'full-stack'],
          prompt: `You put \`{ user, theme, cart, setCart }\` into a single \`AppContext\`. Adding an item to the cart now re-renders the whole app. **Why, and how would you structure this?**`,
          hints: [
            'Every consumer re-renders when the context value changes, compared by Object.is.',
            'The value object is new on every render of the provider.',
            'Split contexts by how often they change, or use a store with selectors.',
          ],
          answer: `**Every component that reads a context re-renders whenever the provider's \`value\` changes, compared with \`Object.is\`, and there is no way to subscribe to part of the value.** Here the value is a **new object on every provider render**, and it bundles fast-changing data (\`cart\`) with slow-changing data (\`user\`, \`theme\`), so every consumer re-renders on every cart change.

**Fixes, from simplest to most capable:**
1. **Memoise the value**, so unrelated parent re-renders do not change it:
\`\`\`jsx
const value = useMemo(() => ({ cart, setCart }), [cart])
return <CartContext value={value}>{children}</CartContext> // React 19: <Context> works as a provider
\`\`\`
2. **Split contexts by change frequency and concern:** \`UserContext\`, \`ThemeContext\`, \`CartContext\`. You can also split *state* from *dispatch* (\`setCart\` is stable), so components that only write never re-render.
3. **Use a store with selectors** for frequently changing shared state: Zustand, Redux Toolkit or Jotai. These build on \`useSyncExternalStore\`, so a component re-renders only when **its selected slice** changes (\`useCartStore(s => s.count)\`).

**What context is good for:** dependency injection of values that change rarely: theme, locale, the current user, feature flags, and service instances such as an API client. It is a **transport mechanism, not a state manager**: the state still lives in \`useState\` or \`useReducer\` in the provider.

**Avoid context** for server data (use a query cache) and for very frequent updates (pointer positions, text input), unless they are isolated in a small subtree.`,
          keyPoints: [
            'All consumers re-render when the value changes (Object.is)',
            'A new object literal on each render is a hidden cause',
            'Split by concern and change frequency; separate state from dispatch',
            'Selector-based stores via useSyncExternalStore',
            'Context is for dependency injection, not a state manager',
          ],
          pitfalls: ['Expecting React.memo to stop context-triggered re-renders'],
          personalAngle:
            'Compare it with Vue: provide/inject combined with reactive refs gives fine-grained updates without splitting contexts. Having worked in both frameworks, you can explain why this problem is mostly React-specific.',
        },
        {
          id: 'react-custom-hook-search',
          title: 'Write a custom hook: debounced search',
          type: 'coding',
          difficulty: 'core',
          priority: 'should',
          tags: ['custom-hooks', 'debounce', 'abortcontroller', 'composition'],
          estMinutes: 20,
          roles: ['frontend', 'full-stack'],
          prompt: `Write \`useSearch(query)\`. It debounces the query by 300 ms, fetches \`/api/search?q=\`, cancels stale requests and returns \`{ status, results, error }\`. Make it reusable and typed.`,
          hints: [
            'Split it into two hooks: useDebouncedValue, and the fetch logic.',
            'Abort in the effect cleanup.',
            'Model the status as a union.',
          ],
          answer: `**Compose two small hooks: one that debounces a value and one that fetches with cancellation.** Custom hooks share *stateful logic*, not state: every component that calls one gets its own copy.

\`\`\`tsx
import { useEffect, useState } from 'react'

export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id) // reset on every change
  }, [value, delay])
  return debounced
}

type SearchState<T> =
  | { status: 'idle'; results: T[]; error: null }
  | { status: 'loading'; results: T[]; error: null }
  | { status: 'success'; results: T[]; error: null }
  | { status: 'error'; results: T[]; error: Error }

export function useSearch<T>(query: string): SearchState<T> {
  const q = useDebouncedValue(query.trim(), 300)
  const [state, setState] = useState<SearchState<T>>({ status: 'idle', results: [], error: null })

  useEffect(() => {
    if (!q) {
      setState({ status: 'idle', results: [], error: null })
      return
    }
    const controller = new AbortController()
    setState((s) => ({ status: 'loading', results: s.results, error: null })) // keep old results visible
    fetch(\`/api/search?q=\${encodeURIComponent(q)}\`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(\`HTTP \${r.status}\`)
        return r.json() as Promise<T[]>
      })
      .then((results) => setState({ status: 'success', results, error: null }))
      .catch((err: Error) => {
        if (err.name !== 'AbortError') setState((s) => ({ status: 'error', results: s.results, error: err }))
      })
    return () => controller.abort()
  }, [q])

  return state
}
\`\`\`

**Design points to mention:**
- **Naming:** a function must start with \`use\` and call hooks for it to be a hook. Lint rules rely on the prefix.
- **Single responsibility:** \`useDebouncedValue\` is reusable on its own.
- **Cancellation in the cleanup** prevents race conditions, and it covers unmounting too.
- **Keeping previous results while loading** prevents flicker. \`useDeferredValue\` is an alternative approach that keeps typing responsive.
- **Testing:** use \`renderHook\` from Testing Library, fake timers and MSW to mock \`fetch\`.
- **In production:** TanStack Query with \`queryKey: ['search', q]\` adds caching and deduplication. Say that you would use it in a real application.`,
          keyPoints: [
            'Compose small hooks',
            'Debounce with a timer and cleanup',
            'Abort stale requests in the cleanup',
            'Typed union for the status',
            'Keep previous results to avoid flicker',
          ],
          pitfalls: ['Debouncing the fetch function inside render (a new debounce on every render)', 'Not handling unmount'],
          followUps: ['How would you cache results per query?'],
          personalAngle:
            'Scrape & Compare likely has search or filter UIs. Mention how you handled typing latency and stale results there.',
        },
      ],
    },
    {
      id: 'react-modern',
      title: 'Modern React: Suspense, server & quality',
      summary: 'Error boundaries, Suspense, Server Components, SSR and hydration, performance and testing.',
      questions: [
        {
          id: 'react-error-boundaries-suspense',
          title: 'Error boundaries and Suspense',
          type: 'concept',
          difficulty: 'core',
          priority: 'should',
          tags: ['error-boundaries', 'suspense', 'lazy', 'use', 'loading-states'],
          estMinutes: 5,
          roles: ['frontend', 'full-stack'],
          prompt: `**Explain error boundaries and Suspense.** What do they catch, what do they not catch, and how do you place them in an app?`,
          hints: [
            'One handles "not ready yet", the other "something broke".',
            'Error boundaries do not catch errors in event handlers.',
            'Think about granularity: the whole page vs a widget.',
          ],
          answer: `They are the two **declarative boundaries** in React: **Suspense** handles *"not ready yet"* by showing a fallback while children load, and an **error boundary** handles *"something threw"* by showing a fallback UI instead of unmounting the whole app.

**Error boundaries:**
- They catch errors thrown **during rendering, in lifecycle methods and in constructors** of their subtree.
- They do **not** catch errors in **event handlers** (use \`try/catch\` there), in asynchronous code (timers, a promise without \`use\`), in SSR, or in the boundary itself.
- They are still written as **class components** (\`static getDerivedStateFromError\` and \`componentDidCatch\`); most teams use the \`react-error-boundary\` package. React 19 adds the root options \`onCaughtError\` and \`onUncaughtError\` for reporting.

\`\`\`jsx
<ErrorBoundary fallback={<WidgetError />} onError={report}>
  <Suspense fallback={<WidgetSkeleton />}>
    <RevenueChart />
  </Suspense>
</ErrorBoundary>
\`\`\`

**Suspense:**
- It shows the nearest \`fallback\` while something in its subtree **suspends**: \`React.lazy\` code splitting, React 19's \`use(promise)\`, or Suspense-enabled data sources (framework loaders, TanStack Query's \`useSuspenseQuery\`, Server Components).
- With **transitions** (\`startTransition\`), React keeps showing the existing UI instead of falling back to a spinner again.
- On the server it enables **streaming SSR**: the shell is sent first, and each boundary's HTML streams in when it is ready.

**Placement:**
- Wrap each **independently useful region** (a widget, a panel, a route segment), so one failure or slow request does not blank the page.
- Put an app-level boundary at the root as the last line of defence.
- Do not nest boundaries so finely that the page becomes a mass of spinners. Design the loading sequence.
- Next.js maps both to files: \`loading.tsx\` (Suspense) and \`error.tsx\` (an error boundary) per route segment.`,
          keyPoints: [
            'Suspense for loading; error boundaries for render errors',
            'Error boundaries do not catch event-handler or async errors',
            'Error boundaries are still class components (or react-error-boundary)',
            'Suspense triggers: lazy, use(), suspense-enabled data',
            'Granular placement per independent region; streaming SSR',
          ],
          pitfalls: ['Expecting a boundary to catch an onClick error'],
          followUps: ['How do you reset an error boundary after the user retries?'],
        },
        {
          id: 'react-server-components',
          title: 'React Server Components vs client components',
          type: 'concept',
          difficulty: 'advanced',
          priority: 'must',
          tags: ['server-components', 'use-client', 'server-functions', 'react-19', 'bundle-size'],
          estMinutes: 6,
          roles: ['frontend', 'full-stack'],
          prompt: `**What are React Server Components, and how are they different from SSR?** What does \`'use client'\` actually mean, and how do server functions (\`'use server'\`) fit in?`,
          hints: [
            'SSR renders to HTML; RSC changes where components run.',
            'Server components never ship their code to the browser.',
            "'use client' marks a boundary, not a single component.",
          ],
          answer: `**Server Components (RSC) are components that run only on the server** (at build time or per request) and send a serialised description of their output (the RSC payload) to the client. **Their code and dependencies never reach the browser bundle.** Client Components are the familiar interactive components; they are pre-rendered to HTML on the server *and* hydrated in the browser.

**RSC vs SSR:**
- **SSR** is a *rendering technique*: run the React tree on the server to produce HTML for a fast first paint, then **hydrate all of it** on the client. The whole component tree's JavaScript is still shipped.
- **RSC** is a *component type*: server components are **never hydrated** and ship no JavaScript. They can be \`async\` and read databases or files directly. The two are combined: frameworks SSR the result of the RSC tree.

\`\`\`tsx
// app/orders/page.tsx: a Server Component by default (Next.js App Router)
import { db } from '@/lib/db'
import { OrderFilters } from './order-filters' // a client component

export default async function OrdersPage() {
  const orders = await db.order.findMany({ take: 50 }) // runs on the server, no API layer needed
  return <OrderFilters initialOrders={orders} /> // props must be serialisable
}
\`\`\`
\`\`\`tsx
'use client' // order-filters.tsx: this module and its imports go to the client bundle
export function OrderFilters({ initialOrders }) { /* useState, onClick ... */ }
\`\`\`

**What \`'use client'\` means:** it marks a **boundary in the module graph**. That file *and everything it imports* become client code. Server components can render client components and pass them serialisable props, including other server-rendered elements as \`children\`. Client components cannot import server components.

**Server functions (\`'use server'\`)** are async functions that run on the server and can be called from the client, for example as a form \`action\`. React 19's \`useActionState\`, \`useFormStatus\` and \`useOptimistic\` build on them. **Treat each one as a public HTTP endpoint**: validate the input and check authorisation inside it.

**Trade-offs:** smaller bundles and data fetching close to the data, in exchange for a more complex mental model, a requirement for framework support (Next.js is the main one), serialisation limits on props, and caching behaviour you need to understand.`,
          keyPoints: [
            'RSC run only on the server and ship no JavaScript',
            'SSR produces HTML and hydrates; RSC are never hydrated',
            "'use client' is a module-graph boundary",
            'Props across the boundary must be serialisable',
            'Server functions are public endpoints: validate and authorise',
          ],
          pitfalls: ['"RSC is just SSR"', "Putting 'use client' at the top of every file"],
          followUps: ['How would you pass an interactive component into a server layout?'],
          references: [{ label: 'react.dev: Server Components', url: 'https://react.dev/reference/rsc/server-components' }],
        },
        {
          id: 'react-ssr-hydration-mismatch',
          title: 'Debug: hydration mismatches',
          type: 'debugging',
          difficulty: 'advanced',
          priority: 'must',
          tags: ['ssr', 'hydration', 'hydration-mismatch', 'nextjs'],
          estMinutes: 8,
          roles: ['frontend', 'full-stack'],
          prompt: `This component logs **"Hydration failed because the server rendered HTML didn't match the client"** in production. **Explain hydration, identify the causes, and fix them.**`,
          code: {
            language: 'javascript',
            source: `export function Greeting() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  return (
    <p>
      {isMobile ? 'Hi' : 'Hello'}, it is {new Date().toLocaleTimeString()}
    </p>
  )
}`,
          },
          hints: [
            'On the server, window is undefined.',
            'The server and the browser render at different times, possibly in different time zones and locales.',
            'Render the same thing first, then update on the client.',
          ],
          answer: `**Hydration** is React attaching event handlers and state to HTML that was rendered on the server. It renders the tree again on the client and **expects exactly the same output** on the first pass. When the output differs, React reports a mismatch and, for that boundary, falls back to rendering on the client. That costs performance, and the page can visibly flicker.

**Causes in this component:**
1. \`typeof window\` is \`false\` on the server, so the server renders "Hello", while the client renders "Hi" on mobile.
2. \`new Date().toLocaleTimeString()\` differs because time has passed between the two renders, and the time zone or locale may differ between server and browser.

**Fixes:**
\`\`\`jsx
export function Greeting() {
  const [now, setNow] = useState(null) // identical on server and first client render
  useEffect(() => setNow(new Date()), []) // client only, after hydration
  return (
    <p>
      <span className="hidden md:inline">Hello</span>
      <span className="md:hidden">Hi</span>
      {now && <>, it is <time suppressHydrationWarning>{now.toLocaleTimeString()}</time></>}
    </p>
  )
}
\`\`\`
- **Layout-dependent output → CSS media queries**, not JavaScript checks of \`window\`. Both versions render; CSS decides which is shown.
- **Client-only values** (time, \`localStorage\`, viewport) → render a neutral placeholder first and fill it in an effect. For external stores, use \`useSyncExternalStore\` with a \`getServerSnapshot\`.
- \`suppressHydrationWarning\` is acceptable for *single text nodes* that are expected to differ (timestamps). It is not a general fix.

**Other common causes:** invalid HTML nesting (\`<div>\` inside \`<p>\`, \`<a>\` inside \`<a>\`), which the browser repairs before React sees it; browser extensions injecting attributes; random IDs (use \`useId\`); and **third-party scripts modifying the DOM before hydration**.

**React 19** reports mismatches with a single diff of the expected and actual content, which makes them easier to track down.`,
          keyPoints: [
            'Hydration expects the first client render to match the server HTML',
            'Window checks and dates are classic causes',
            'Use CSS for layout differences; effects for client-only values',
            'useSyncExternalStore with getServerSnapshot; useId for IDs',
            'Invalid nesting and DOM-modifying scripts',
          ],
          pitfalls: ['Wrapping the whole app in suppressHydrationWarning', 'Using typeof window to branch rendering output'],
          personalAngle:
            'Your enterprise SSR/SPA integration work is the perfect story here. A third-party script (consent or accessibility) changing DOM that React then hydrates is a real cause of hydration errors. Explain how you mounted outside the host framework\'s tree to avoid it.',
          references: [{ label: 'react.dev: hydrateRoot', url: 'https://react.dev/reference/react-dom/client/hydrateRoot' }],
        },
        {
          id: 'react-performance-transitions',
          title: 'Diagnosing and fixing React performance',
          type: 'concept',
          difficulty: 'advanced',
          priority: 'should',
          tags: ['performance', 'profiler', 'usetransition', 'usedeferredvalue', 'virtualization'],
          estMinutes: 6,
          roles: ['frontend', 'full-stack'],
          prompt: `Typing in a filter box above a 5,000-row table is laggy. **How do you diagnose it, and what are your options for fixing it?**`,
          hints: [
            'Measure first: what re-renders, and how long does it take?',
            'Mark some updates as non-urgent.',
            'Do not render 5,000 rows.',
          ],
          answer: `**Measure, then fix the biggest cost.** Usually that means rendering too much, rendering too often, or doing urgent and non-urgent work in the same update.

**Diagnose:**
- The **React DevTools Profiler:** record while typing, then look at which components rendered, why ("props changed", "parent rendered", "hooks changed") and how long each took. Turn on "Highlight updates when components render".
- The **Chrome Performance panel:** long tasks during key presses, which directly hurt **INP**.
- Check with a production build. Development builds are much slower.

**Fixes, roughly in order of impact:**
1. **Virtualise the list** (TanStack Virtual, react-window). Render only the ~30 visible rows instead of 5,000 DOM nodes. This is often a 10–100× improvement.
2. **Separate urgent from non-urgent updates:**
\`\`\`jsx
const [text, setText] = useState('')
const deferredText = useDeferredValue(text) // the table renders with a lagging value
const rows = useMemo(() => filterRows(allRows, deferredText), [deferredText])
// the input stays responsive; React can interrupt rendering the stale table
\`\`\`
   or \`startTransition(() => setFilter(text))\` with \`useTransition\` to get an \`isPending\` flag.
3. **Colocate state:** keep the filter text in the input component, so typing does not re-render the whole page.
4. **Memoise the row component** (\`React.memo\`) with stable props, or let the React Compiler do it.
5. **Move the work off the client:** filter on the server for large datasets, or in a Web Worker.
6. **Debounce** the filter if exact keystroke-by-keystroke results are not needed.

**How concurrent rendering helps:** transitions make rendering **interruptible**. React can drop a stale render of the table when a new keystroke arrives, instead of blocking the main thread until it finishes.`,
          keyPoints: [
            'Profile first (React Profiler, Performance panel), using a production build',
            'Virtualise long lists',
            'useDeferredValue / useTransition for non-urgent updates',
            'Colocate state; memoise rows',
            'Server-side filtering or workers for heavy data',
          ],
          pitfalls: ['Adding useMemo everywhere without profiling', 'Measuring with a development build'],
          followUps: ['What is the difference between useTransition and useDeferredValue?'],
        },
        {
          id: 'react-testing-concepts',
          title: 'Testing React components',
          type: 'concept',
          difficulty: 'core',
          priority: 'nice',
          tags: ['testing', 'react-testing-library', 'msw', 'vitest', 'playwright'],
          estMinutes: 5,
          roles: ['frontend', 'full-stack'],
          prompt: `**How do you test a React component that fetches data and handles a form submit?** What do you mock, what do you not mock, and where do end-to-end tests fit in?`,
          hints: [
            'Test what the user sees and does, not implementation details.',
            'Mock at the network boundary.',
            'Query by role and accessible name.',
          ],
          answer: `**Test behaviour through the UI the way a user would, and mock only at the system's edges**, usually the network.

**Tools:** Vitest or Jest as the runner, **React Testing Library** (RTL) for rendering and queries, \`@testing-library/user-event\` for realistic interactions, **MSW** (Mock Service Worker) to intercept \`fetch\` at the network level, and Playwright for end-to-end tests.

\`\`\`tsx
test('submits the form and shows a confirmation', async () => {
  server.use(http.post('/api/subscribe', () => HttpResponse.json({ ok: true }))) // MSW
  const user = userEvent.setup()
  render(<SubscribeForm />)

  await user.type(screen.getByRole('textbox', { name: /email/i }), 'ana@example.com')
  await user.click(screen.getByRole('button', { name: /subscribe/i }))

  expect(await screen.findByText(/thanks for subscribing/i)).toBeInTheDocument()
})
\`\`\`

**Principles:**
- **Query by role and accessible name** (\`getByRole('button', { name })\`), then by label text, with test IDs last. This also checks accessibility, because if you cannot find the button by role, neither can a screen reader.
- **Do not test implementation details:** internal state, hook calls, or class names. Refactors should not break tests.
- Use **\`findBy\`** or **\`waitFor\`** for asynchronous UI. RTL wraps updates in \`act()\` for you, and an act warning usually means you forgot to await something.
- **Mock at the boundary:** MSW for HTTP. Avoid mocking child components or hooks unless they are truly expensive or non-deterministic (time, randomness).
- Cover the states: loading, success, empty, error and validation errors.

**The pyramid (or "trophy"):** many fast **integration-style component tests**, unit tests for pure logic (formatters, reducers, schedulers), and a few **Playwright end-to-end tests** for critical paths (log in, checkout) against a real build. Add accessibility checks with axe in component tests or with Playwright.`,
          keyPoints: [
            'Test user-visible behaviour',
            'Query by role and accessible name',
            'Mock at the network boundary with MSW',
            'findBy / waitFor for async UI; act warnings',
            'A balance of unit, component and end-to-end tests',
          ],
          pitfalls: ['Snapshot-testing everything', 'Asserting on internal state'],
          personalAngle:
            'You have used Jest, Vitest and Playwright. Tie it to the accessibility angle: role-based queries double as an accessibility check, which is something your accessibility-platform background lets you explain convincingly.',
          references: [{ label: 'Testing Library: Guiding principles', url: 'https://testing-library.com/docs/guiding-principles' }],
        },
      ],
    },
  ],
}

export default track
