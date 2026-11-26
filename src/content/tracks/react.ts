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
          intent:
            'Tests whether you understand that state is a per-render snapshot and that setState queues updates rather than mutating. A strong answer gives both numbers (log and display), walks the update queue step by step, and names the updater form as the fix.',
          hints: [
            'Inside this render, `count` is a `const`. Can anything in `handleClick` change it?',
            '`setCount` does not assign; it pushes an entry onto an update queue that React processes on the next render.',
            'Process the queue in order: "replace with 0+1", "replace with 0+1", then "take the pending value and add 1".',
            'The log runs before any re-render, so it sees the old snapshot: `0`. The queue yields 1 → 1 → 2, and there is a single batched re-render.',
          ],
          walkthrough: [
            {
              title: 'Separate the two questions',
              body: `The interviewer asks two things: what the **log** prints (during the click, in the *current* render) and what the **screen** shows (after the *next* render). Answer them separately: **logs \`0\`, displays \`2\`**.`,
            },
            {
              title: 'State is a snapshot per render',
              body: `Each render is a function call with its own \`const count\`. \`handleClick\` closes over that render's value. \`setCount\` asks React to schedule a new render with a new value; it never reassigns the local \`count\`. So \`console.log(count)\` prints \`0\`.`,
            },
            {
              title: 'Walk the update queue',
              body: `React 18+ batches all updates from the same event into one render and applies them in order:
\`\`\`text
setCount(0 + 1)      -> queue: replace with 1     pending = 1
setCount(0 + 1)      -> queue: replace with 1     pending = 1
setCount(c => c + 1) -> queue: updater(1)         pending = 2
\`\`\`
A value replaces; an updater function receives the **pending** value. One re-render with \`count = 2\`.`,
            },
            {
              title: 'Edge cases and the fix',
              body: `- Use \`setX(prev => ...)\` whenever the next value depends on the previous one: repeated calls, timers, async callbacks.
- Batching also applies in \`setTimeout\` and promise callbacks since React 18. \`flushSync\` forces a synchronous render (rarely needed, e.g. scroll to a newly added item).
- Contrast with Vue: \`count.value++\` changes the value immediately; only the DOM update is deferred to the next tick.`,
            },
            {
              title: 'Say it in 30 seconds',
              body: `"It logs 0 and shows 2. State is a snapshot: \`count\` is a constant for this render, and \`setCount\` only queues an update. React batches the three calls: the first two replace with 0 + 1, the updater gets the pending 1 and returns 2. One re-render. If the next state depends on the previous one, I always use the updater form."`,
            },
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
          intent:
            'Tests whether you know how React decides to reuse or remount a component, and that local state belongs to a position in the tree. A strong answer traces the deletion key by key, fixes it with a stable id, and mentions using key on purpose to reset state.',
          hints: [
            'React matches old and new children in a list by their `key`, not by the data they display.',
            'Before the delete, keys are 0, 1, 2. After deleting the first item, which keys exist, and which instance owns key 0?',
            'The instance with key 0 is reused, so its `useState` slot (the old draft) survives. `useState(todo.title)` only reads the prop on mount.',
            'Fix: `key={todo.id}`. Then the instance for the deleted todo unmounts and every other row keeps its own state.',
          ],
          walkthrough: [
            {
              title: 'Restate the symptom',
              body: `State "moves" to the wrong row after a deletion. That is almost always an **identity** problem: React thinks the second row's component *is* the old first row's component.`,
            },
            {
              title: 'How reconciliation matches children',
              body: `For each position React compares the element **type** and **key** with the previous render:
- same type + same key → **reuse the instance** (state kept), update props
- different type or key → unmount the old, mount a new one (state lost)

With \`key={i}\`, keys are positions. After deleting item 0, the old second todo now renders with key 0, so it inherits instance 0 and its \`draft\`. Key 2 disappears and its instance unmounts.`,
            },
            {
              title: 'Apply the fix',
              body: `\`\`\`jsx
{todos.map((todo) => (
  <TodoRow key={todo.id} todo={todo} onDelete={() => onDelete(todo.id)} />
))}
\`\`\`
Keys must be **stable, unique among siblings and derived from the data**. If items have no id, create one when the item is created (\`crypto.randomUUID()\`), not during render.`,
            },
            {
              title: 'Edge cases and related traps',
              body: `- Index keys are acceptable only for static lists that never reorder, filter or prepend.
- \`key={Math.random()}\` remounts every row on every render: lost focus, slow.
- A component **defined inside** another component is a new type each render, so it remounts every time.
- Use key deliberately to reset: \`<ProfileForm key={userId} />\`.
- \`useState(prop)\` copies the prop only once; this bug is amplified by "props as initial state".`,
            },
            {
              title: 'Say it in 30 seconds',
              body: `"Index keys tie state to a position. After deleting the first row, the second todo gets key 0, so React reuses the first row's instance and its draft state. Keys must be stable ids from the data, so I'd use \`todo.id\`. Same type and key means reuse, different means remount, and I can change a key on purpose to reset a form."`,
            },
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
          intent:
            'Tests whether you know why the rules of hooks exist (call-order slots on the fiber), not just the rule. A strong answer picks the right options, explains the mechanism, and knows the React 19 `use` exception.',
          hints: [
            'React does not know your hooks by name. How else could it tell `useState` #1 from `useState` #2 between renders?',
            'Hooks are stored as an ordered list per component and matched by call order. Which options could change the number or order of calls between renders?',
            'An early return before a hook and a hook inside a loop both change the call count. A custom hook at the top level does not.',
            '`use()` does not occupy a hook slot, so React 19 allows it in conditions (but not in try/catch). Answer: a and b.',
          ],
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
          intent:
            'Tests whether you treat effects as synchronisation with external systems: correct dependencies, cleanup for everything you start, and protection against out-of-order async results. A strong answer finds all three bugs, explains each mechanism, and writes the fixed code.',
          hints: [
            'Look at each effect and ask: which values does it read, what does it start, and what stops it?',
            'The interval effect has `[]` dependencies, so its callback closes over the `seconds` from the first render forever.',
            'Nothing calls `clearInterval`, and nothing stops a slow response for an old `userId` from overwriting a newer one.',
            'Fix shape: `setSeconds(s => s + 1)` + `return () => clearInterval(id)`; for fetch, create an `AbortController`, pass `signal`, ignore `AbortError`, and `return () => controller.abort()`.',
          ],
          walkthrough: [
            {
              title: 'Audit each effect',
              body: `For every effect ask three questions: **what reactive values does it read**, **what does it start**, and **what stops it**. That checklist finds all three bugs: a stale closure, a missing cleanup and a fetch race.`,
            },
            {
              title: 'Bug 1 and 2: the interval',
              body: `With \`[]\`, the effect runs once and the callback captures \`seconds = 0\`, so \`setSeconds(0 + 1)\` runs forever: the counter sticks at 1. The interval is never cleared, so it leaks after unmount, and StrictMode's dev remount creates two.
\`\`\`jsx
useEffect(() => {
  const id = setInterval(() => setSeconds((s) => s + 1), 1000)
  return () => clearInterval(id)
}, [])
\`\`\`
The updater form removes the dependency on \`seconds\`, so the interval is created once.`,
            },
            {
              title: 'Bug 3: the fetch race',
              body: `If \`userId\` goes 1 → 2 and response 1 arrives last, user 1 is shown for id 2. Cancel the stale request in the cleanup:
\`\`\`jsx
useEffect(() => {
  const controller = new AbortController()
  fetch(\`/api/users/\${userId}\`, { signal: controller.signal })
    .then((r) => { if (!r.ok) throw new Error(\`HTTP \${r.status}\`); return r.json() })
    .then(setUser)
    .catch((err) => { if (err.name !== 'AbortError') setError(err) })
  return () => controller.abort()
}, [userId])
\`\`\`
An \`ignore\` boolean set in cleanup works too when the API cannot be aborted.`,
            },
            {
              title: 'Trade-offs and the bigger picture',
              body: `- Adding \`seconds\` to deps "works" but tears down and recreates the interval every tick.
- Never silence \`exhaustive-deps\`; restructure instead. For "read the latest value without re-running", React 19.2's \`useEffectEvent\` is the tool.
- Many effects should not exist: derive during render, handle events in handlers, reset with \`key\`.
- In real apps, fetch with a loader, Server Components or TanStack Query, which handle races, caching and dedup.`,
            },
            {
              title: 'Say it in 30 seconds',
              body: `"Three bugs. The interval closes over the first \`seconds\`, so I use the updater form. It is never cleared, so I return \`clearInterval\`; StrictMode would expose that. And the fetch can race when \`userId\` changes, so I abort the previous request in cleanup and handle errors. Effects synchronise with external systems: everything they start, the cleanup stops."`,
            },
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
          intent:
            'Tests whether you understand memoisation as a reference-stability and expensive-work tool, not a default. A strong answer says when each API pays off, prefers structural fixes first, explains useRef, and positions the React Compiler accurately.',
          hints: [
            'Memoisation costs memory and a dependency comparison on every render. Who benefits from a stable reference?',
            'A `useCallback` only helps if something compares it: a `React.memo` child, or a dependency array of an effect or another memo.',
            'Before memoising, can you move state down or pass the expensive subtree as `children` so it does not re-render at all?',
            'Answer shape: "No. useMemo for measured expensive work or stable references; useCallback + memo child together; useRef for mutable non-render values; the Compiler now does most of this automatically."',
          ],
          walkthrough: [
            {
              title: 'Answer the yes/no first',
              body: `**No.** Memoising everything adds cost (memory, comparisons, noisy code) and only helps where a **reference is compared** or the computation is **measurably expensive**.`,
            },
            {
              title: 'How the pieces fit',
              body: `- \`React.memo(Child)\` skips re-rendering when props are shallow-equal.
- That only works if props keep the same reference, which is what \`useCallback\` (functions) and \`useMemo\` (objects, arrays, expensive results) provide.
- Without a memo child or a dependency array that cares, \`useCallback\` is pure overhead.
\`\`\`jsx
const Row = memo(Row_)
const onSelect = useCallback((id) => setSelected(id), [])
const sorted = useMemo(() => [...items].sort(byDate), [items])
\`\`\``,
            },
            {
              title: 'Structural fixes before memoisation',
              body: `- **Colocate state** so fewer components re-render.
- **Lift content up as \`children\`**: a component that owns state and receives \`children\` does not re-render those children when its state changes.
- **Virtualise** long lists. These usually beat any amount of memo.`,
            },
            {
              title: 'useRef and the React Compiler',
              body: `\`useRef\` holds a mutable value that survives renders **without** triggering one: DOM nodes, timer ids, the previous value. Do not read or write \`ref.current\` during render. In React 19, \`ref\` is a normal prop, so \`forwardRef\` is unnecessary.

The **React Compiler** (v1.0, Oct 2025) memoises components, JSX and values at build time for code that follows the rules of React. Manual \`useMemo\`/\`useCallback\` remain for effect-dependency stability, third-party libraries that compare identity, and opting out with \`'use no memo'\` when debugging.`,
            },
            {
              title: 'Say it in 30 seconds',
              body: `"Not by default. Memo only pays off when a reference is compared or the work is expensive and measured. useCallback matters together with a React.memo child or as a dependency. I'd first colocate state or use children composition. useRef is for mutable values that shouldn't re-render. With the React Compiler, most manual memoisation goes away."`,
            },
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
          intent:
            'Tests whether you know context has no selectors: every consumer re-renders when the value identity changes. A strong answer names the new-object-per-render cause, gives a ladder of fixes (memoise, split, external store), and says what context is actually for.',
          hints: [
            'How does React decide that a context value "changed"? What comparison does it use?',
            'The provider builds `{ user, theme, cart, setCart }` as a new object literal on every render, so `Object.is` is always false.',
            'Even with a stable object, cart changes still re-render theme and user consumers. Can a consumer subscribe to part of a context?',
            'Ladder: `useMemo` the value → split contexts by change frequency (and state vs dispatch) → a selector store (Zustand/Redux via `useSyncExternalStore`) for hot shared state.',
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
          intent:
            'Tests whether you can compose hooks, manage timers and cancellation with effect cleanups, and type async state well. A strong answer splits debounce from fetch, aborts stale requests, models status as a discriminated union, and mentions when a query library is the better choice.',
          hints: [
            'Two concerns are tangled here: "wait until the user stops typing" and "fetch, but never show stale results". Could each be its own hook?',
            '`useDebouncedValue(value, delay)`: set a timeout in an effect, and clear it in the cleanup so each keystroke restarts the timer.',
            'For the fetch: an effect keyed on the debounced query, an `AbortController` per run, and `controller.abort()` in the cleanup. Ignore `AbortError`.',
            'Type it: `type SearchState<T> = { status: "idle" | "loading" | "success"; results: T[]; error: null } | { status: "error"; results: T[]; error: Error }`; keep the previous results while loading.',
          ],
          walkthrough: [
            {
              title: 'Clarify the contract',
              body: `Input: a raw \`query\` string. Output: \`{ status, results, error }\`. Requirements: 300 ms debounce, cancel stale requests, typed, reusable. Ask: should an empty query reset to idle? (Yes.) Should old results stay visible while loading? (Yes, to avoid flicker.)`,
            },
            {
              title: 'Build the debounce hook',
              body: `\`\`\`tsx
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}
\`\`\`
The cleanup runs before the next effect, so every keystroke restarts the timer.`,
            },
            {
              title: 'Build the fetching hook',
              body: `\`\`\`tsx
export function useSearch<T>(query: string): SearchState<T> {
  const q = useDebouncedValue(query.trim())
  const [state, setState] = useState<SearchState<T>>({ status: 'idle', results: [], error: null })
  useEffect(() => {
    if (!q) { setState({ status: 'idle', results: [], error: null }); return }
    const c = new AbortController()
    setState((s) => ({ status: 'loading', results: s.results, error: null }))
    fetch(\`/api/search?q=\${encodeURIComponent(q)}\`, { signal: c.signal })
      .then((r) => { if (!r.ok) throw new Error(\`HTTP \${r.status}\`); return r.json() as Promise<T[]> })
      .then((results) => setState({ status: 'success', results, error: null }))
      .catch((e: Error) => { if (e.name !== 'AbortError') setState((s) => ({ status: 'error', results: s.results, error: e })) })
    return () => c.abort()
  }, [q])
  return state
}
\`\`\``,
            },
            {
              title: 'Edge cases and trade-offs',
              body: `- \`encodeURIComponent\` the query; check \`r.ok\` because \`fetch\` does not reject on 4xx/5xx.
- Do not create a debounced function during render; it is recreated every render.
- Test with \`renderHook\`, fake timers and MSW.
- In production, TanStack Query (\`queryKey: ['search', q]\`) adds caching, dedup and retries; \`useDeferredValue\` keeps typing responsive for client-side filtering.`,
            },
            {
              title: 'Say it in 30 seconds',
              body: `"I'd compose two hooks: useDebouncedValue with a timeout cleared in cleanup, and useSearch that fetches on the debounced value with an AbortController aborted in cleanup, so stale responses can't win. Status is a discriminated union, and I keep old results while loading. In a real app I'd put the fetch behind TanStack Query for caching."`,
            },
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
          intent:
            'Tests whether you know the exact scope of each boundary and can design loading and failure UX deliberately. A strong answer lists what error boundaries do not catch, names what triggers Suspense, and explains placement per independent region.',
          hints: [
            'One boundary handles "not ready yet", the other handles "something threw". Which is which?',
            'Error boundaries only catch errors thrown while React is rendering their subtree. Is an `onClick` handler part of rendering?',
            'Suspense reacts to something "suspending": `React.lazy`, `use(promise)`, or a Suspense-enabled data source. With a transition, React keeps the old UI instead of the fallback.',
            'Placement: one root boundary as a last resort, plus a Suspense + ErrorBoundary pair around each independently useful widget or route segment (Next.js: `loading.tsx` / `error.tsx`).',
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
          intent:
            'Tests whether you can separate a rendering technique (SSR) from a component type (RSC) and reason about the server/client module boundary. A strong answer explains what ships to the browser, what `use client` really marks, and the security implication of server functions.',
          hints: [
            'SSR answers "where is the first HTML produced?". RSC answers a different question: "where does this component run at all?"',
            'A Server Component runs only on the server, can be `async`, and is never hydrated. What does that mean for the JavaScript bundle?',
            '`\'use client\'` is placed at the top of a module. What happens to everything that module imports?',
            'Shape: "SSR = HTML + full hydration; RSC = server-only components, zero JS, serialisable props across the boundary; `use client` = module-graph boundary; `use server` functions = public endpoints, so validate and authorise."',
          ],
          walkthrough: [
            {
              title: 'Separate the two concepts',
              body: `**SSR** is a rendering technique: run the tree on the server to HTML, then ship all the component JS and **hydrate** it. **RSC** is a component type: components that run **only on the server** and send a serialised RSC payload; their code never reaches the browser. Frameworks combine both: the RSC tree is SSR'd to HTML for first paint.`,
            },
            {
              title: 'The module boundary',
              body: `In the App Router every component is a Server Component by default. \`'use client'\` at the top of a file makes **that module and everything it imports** client code (still SSR'd, then hydrated).
- Server → client: allowed, props must be serialisable (no functions except server functions, no class instances).
- Client → server import: not allowed, but a server component can be passed as \`children\` to a client component.`,
            },
            {
              title: 'Show it in code',
              body: `\`\`\`tsx
// page.tsx (server)
export default async function Page() {
  const orders = await db.order.findMany({ take: 50 })
  return <OrderFilters initialOrders={orders}><Summary /></OrderFilters>
}
// order-filters.tsx
'use client'
export function OrderFilters({ initialOrders, children }) { /* useState, onClick */ }
\`\`\`
Keep \`'use client'\` at the **leaves** (the interactive bits) to keep bundles small.`,
            },
            {
              title: 'Server functions and trade-offs',
              body: `\`'use server'\` functions run on the server and can be called from the client (form \`action\`, \`useActionState\`). Under the hood they are a POST endpoint, so **validate input and check auth inside each one**; never trust that only your UI calls them.

Trade-offs: smaller bundles, data fetching next to the data, no API layer for reads; in exchange for framework dependence, serialisation limits, a harder mental model and caching you must understand.`,
            },
            {
              title: 'Say it in 30 seconds',
              body: `"SSR renders HTML and then hydrates everything; Server Components run only on the server and ship no JavaScript, so they can be async and hit the database directly. \`'use client'\` marks a module-graph boundary: that file and its imports go to the browser, and props crossing it must be serialisable. Server functions are callable from the client, so I treat each like a public endpoint with validation and auth."`,
            },
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
          intent:
            'Tests whether you understand that hydration requires the first client render to match the server HTML exactly. A strong answer finds both causes in the snippet, fixes them without blanket suppression, and lists other real-world causes such as invalid nesting and DOM-mutating third-party scripts.',
          hints: [
            'Hydration re-renders on the client and compares with the server HTML. Which values in this component can differ between those two renders?',
            'On the server `typeof window` is `"undefined"`, so `isMobile` is always false there. And `new Date()` is evaluated at two different moments, possibly in different time zones.',
            'Rule: the first client render must equal the server render. Move layout differences to CSS and client-only values to after hydration.',
            'Fix shape: render both "Hello" and "Hi" with `hidden md:inline` / `md:hidden`; `const [now, setNow] = useState(null)` + `useEffect(() => setNow(new Date()), [])`; `suppressHydrationWarning` only on the `<time>` text node.',
          ],
          walkthrough: [
            {
              title: 'Explain hydration first',
              body: `The server sends HTML. On the client, \`hydrateRoot\` renders the same tree and **attaches** to the existing DOM instead of creating it. React expects the first client render to produce identical output. On a mismatch, React throws away that boundary's HTML and re-renders on the client: slower, and the user may see a flash.`,
            },
            {
              title: 'Find the two causes',
              body: `1. \`typeof window !== 'undefined'\` is false on the server ("Hello") and true on a phone ("Hi").
2. \`new Date().toLocaleTimeString()\` runs at two moments, and server/browser time zone and locale can differ.

Both make the first client render differ from the HTML.`,
            },
            {
              title: 'Fix without hiding it',
              body: `\`\`\`jsx
export function Greeting() {
  const [now, setNow] = useState(null)
  useEffect(() => setNow(new Date()), [])
  return (
    <p>
      <span className="hidden md:inline">Hello</span>
      <span className="md:hidden">Hi</span>
      {now && <>, it is <time suppressHydrationWarning>{now.toLocaleTimeString()}</time></>}
    </p>
  )
}
\`\`\`
Layout → CSS media queries. Client-only values (time, \`localStorage\`, viewport) → placeholder first, fill in an effect, or \`useSyncExternalStore\` with \`getServerSnapshot\`.`,
            },
            {
              title: 'Other causes to check',
              body: `- Invalid nesting (\`<div>\` in \`<p>\`, \`<a>\` in \`<a>\`): the browser repairs the HTML before React sees it.
- Random ids → \`useId\`.
- Browser extensions or **third-party scripts** (consent banners, widgets) mutating the DOM before hydration.
- Data that changed between server render and client (serialise it into the page instead of refetching).
React 19 prints a single diff of expected vs actual, which speeds this up.`,
            },
            {
              title: 'Say it in 30 seconds',
              body: `"Hydration needs the first client render to match the server HTML. Here \`window\` doesn't exist on the server and the date differs by time and zone. I'd move the mobile text to CSS, render the time only after mount in an effect, and keep \`suppressHydrationWarning\` to that single text node. I'd also check invalid nesting and scripts that mutate the DOM before hydration."`,
            },
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
          intent:
            'Tests whether you diagnose before optimising and know the high-impact levers in order. A strong answer names concrete tools (Profiler, Performance panel, production build), then virtualisation, transitions/deferred values, and state colocation, and connects it to INP.',
          hints: [
            'Before changing code: which tool tells you what re-rendered and why, and how long it took?',
            'How many DOM nodes does a 5,000-row table create on each keystroke? Do you need them all?',
            'Typing must feel instant; the table can lag slightly. Which React 19 APIs let you mark one update as less urgent?',
            'Order: profile in a production build → virtualise → `useDeferredValue(text)` + `useMemo` filtered rows (or `useTransition`) → colocate filter state → memo rows / React Compiler → server-side filtering or a Worker.',
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
          intent:
            'Tests whether your tests give confidence through refactors: user-visible behaviour, mocking only at system edges, and a sensible split between component and end-to-end tests. A strong answer shows a concrete test and covers async and error states.',
          hints: [
            'If you rename an internal state variable, should a test fail? What should tests observe instead?',
            'Where is the cleanest seam to fake data for a component that calls `fetch`: the hook, the module, or the network?',
            'Find elements the way assistive tech does: `getByRole("button", { name: /subscribe/i })`. Await async UI with `findBy`.',
            'Shape: RTL + user-event + MSW handler per test; cover loading, success, empty, error and validation; unit tests for pure logic; a few Playwright E2E tests for critical flows.',
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
        {
          id: 'react-compiler-when-memo',
          title: 'React Compiler: what it does and when manual memo is still needed',
          type: 'tradeoff',
          difficulty: 'advanced',
          priority: 'should',
          tags: ['react-compiler', 'memoization', 'usememo', 'usecallback', 'rules-of-react', 'performance'],
          estMinutes: 6,
          roles: ['frontend', 'full-stack'],
          prompt: `Your team enables the **React Compiler** on a large codebase. A teammate proposes deleting every \`useMemo\`, \`useCallback\` and \`React.memo\` in the same PR. **What does the compiler actually do, what can break, and where would you still keep or add manual memoisation?**`,
          intent:
            'Tests whether you understand the compiler as automatic, build-time memoisation that relies on the rules of React, not as magic. A strong answer explains what it memoises, how it bails out on rule violations, why identity-sensitive code can still need manual control, and how to roll it out safely.',
          hints: [
            'The compiler works at build time. What does it need to assume about your components to safely cache their output?',
            'It memoises JSX, values and callbacks per component at a finer grain than you would by hand. What happens to a component that mutates props or reads a ref during render?',
            'Which code depends on a value keeping the same identity for correctness, not just speed? Think effect dependencies and third-party libraries.',
            'Answer shape: "Compiler auto-memoises rule-following code and skips the rest; enable it with the ESLint rules first, roll out incrementally, keep manual memo where identity is semantic (effect deps, external libs), and only delete old memo after profiling."',
          ],
          answer: `**The React Compiler is a build-time Babel/SWC plugin that automatically memoises components, hooks, JSX and intermediate values, so code that follows the rules of React re-renders only what actually changed.** Version 1.0 shipped in October 2025 and works with React 17+ (19 natively). It does not change semantics; it caches.

**How it works:** it analyses each component's data flow and inserts fine-grained caching (conceptually a \`useMemo\` around every derived value and JSX subtree, keyed on the exact inputs). That is often *more* precise than hand-written memo, including memoising after an early return, which hooks cannot do.

**What it relies on (the rules of React):** components and hooks are pure during render, props and state are not mutated, refs are not read during render, hooks are called unconditionally. When the compiler detects a violation, it **skips that component** (bail-out) rather than miscompiling it. Code that "worked by accident" (mutating an array and relying on a parent re-render) can behave differently once memoised.

**Rollout:**
\`\`\`bash
npm i -D babel-plugin-react-compiler eslint-plugin-react-hooks@latest
\`\`\`
- Turn on the compiler-aware lint rules first and fix violations.
- Enable per directory or with \`compilationMode: 'annotation'\` (\`'use memo'\`), then widen.
- Use \`'use no memo'\` on a component to opt out while debugging.
- Verify with React DevTools (the "Memo ✨" badge) and the Profiler.

**Where manual control still matters:**
- **Effect dependencies where identity is semantic.** If an effect must not re-subscribe, make that explicit rather than depending on compiler output.
- **Third-party libraries** that compare by identity or keep their own caches (chart libs, some form or table libraries).
- **Expensive work you want shared across components** (that is a cache or a store, not memo).
- **Code the compiler bails out on**, until it is fixed.

**About the PR:** do not delete existing memo in the same change. The compiler keeps working with it. Remove it later, behind profiling, in small steps.`,
          keyPoints: [
            'Build-time automatic memoisation of components, values and JSX',
            'Depends on the rules of React; bails out on violations instead of miscompiling',
            'Roll out with the lint rules, incrementally, with opt-out directives',
            'Manual memo still useful where identity is semantic or for external libraries',
            'Do not mass-delete memo in the enabling PR; profile first',
          ],
          pitfalls: [
            '"The compiler makes performance work unnecessary" (it does not virtualise lists or fix slow algorithms)',
            'Assuming it fixes code that mutates props or state',
            'Enabling it app-wide without the lint rules and a profiling baseline',
          ],
          followUps: [
            'How would you verify a component is compiled?',
            'Does the compiler replace useDeferredValue or virtualisation?',
          ],
          walkthrough: [
            {
              title: 'Say what it is',
              body: `A **build-time** plugin that memoises components, values and JSX automatically. It does not change what your code means; it adds caching so unchanged inputs skip work. v1.0, October 2025.`,
            },
            {
              title: 'Explain the contract it depends on',
              body: `It assumes the **rules of React**: pure render, no mutation of props/state, no ref reads during render, unconditional hooks. If it cannot prove a component is safe, it **skips** it. Code that relied on accidental re-renders (mutate then re-render) is what can change behaviour.`,
            },
            {
              title: 'Roll it out safely',
              body: `1. Enable the compiler-aware \`eslint-plugin-react-hooks\` rules and fix violations.
2. Turn the compiler on for one area (or annotation mode with \`'use memo'\`).
3. Check DevTools for the "Memo ✨" badge and profile before and after.
4. Opt out a component with \`'use no memo'\` while debugging.`,
            },
            {
              title: 'Keep manual memo where identity matters',
              body: `- Effect deps where re-running is a correctness issue (subscriptions, sockets).
- Libraries that compare props by identity.
- Bail-out components until fixed.
And the compiler does **not** virtualise lists, fix O(n²) work or split bundles.`,
            },
            {
              title: 'Say it in 30 seconds',
              body: `"The compiler auto-memoises rule-following code at build time and skips components that break the rules. I'd enable the lint rules first, roll it out incrementally and verify with DevTools. I wouldn't delete existing memo in the same PR: it's harmless, and I'd keep manual memo where identity is semantic, like effect dependencies or identity-sensitive libraries."`,
            },
          ],
          references: [{ label: 'react.dev: React Compiler', url: 'https://react.dev/learn/react-compiler' }],
        },
        {
          id: 'react-server-action-form',
          title: 'Build a form with Server Actions, useActionState and useOptimistic',
          type: 'coding',
          difficulty: 'advanced',
          priority: 'must',
          tags: ['server-actions', 'useactionstate', 'useoptimistic', 'useformstatus', 'forms', 'react-19'],
          estMinutes: 20,
          roles: ['frontend', 'full-stack'],
          prompt: `Using React 19 (in a Next.js App Router app), build an **"add comment" form**: it submits through a **Server Action**, validates on the server, shows field errors, disables the button while pending, and shows the new comment **optimistically** before the server confirms. Keep it working without JavaScript where possible.`,
          intent:
            'Tests whether you can use the React 19 form primitives end to end: a server function as the form action, useActionState for result/error state, useFormStatus or isPending for pending UI, and useOptimistic for instant feedback. A strong answer validates and authorises on the server and explains progressive enhancement and rollback.',
          hints: [
            'Start on the server: a `\'use server\'` function that receives `FormData`, validates it, writes, and returns a result object. What should it return on a validation error?',
            '`useActionState(action, initialState)` returns `[state, formAction, isPending]`. The action signature becomes `(prevState, formData) => newState`.',
            'Optimistic UI: `const [optimistic, addOptimistic] = useOptimistic(comments, (list, c) => [...list, c])`, called inside the action before awaiting the server.',
            'Skeleton: `<form action={formAction}>` + `name` attributes + server-side zod validation + `revalidatePath` on success + `state.errors?.body` rendered under the field + `<button disabled={isPending}>`.',
          ],
          answer: `**Put the mutation in a Server Action, drive the form with \`useActionState\`, and layer \`useOptimistic\` on top for instant feedback.** Validation and authorisation live on the server because the action is a public endpoint.

\`\`\`ts
// app/posts/[id]/actions.ts
'use server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const Schema = z.object({ postId: z.string(), body: z.string().trim().min(1).max(500) })
export type CommentState = { ok: boolean; errors?: { body?: string[] }; message?: string }

export async function addComment(_prev: CommentState, formData: FormData): Promise<CommentState> {
  const user = await getSessionUser()
  if (!user) return { ok: false, message: 'Please sign in.' }
  const parsed = Schema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { ok: false, errors: parsed.error.flatten().fieldErrors }
  await db.comment.create({ data: { ...parsed.data, authorId: user.id } })
  revalidatePath(\`/posts/\${parsed.data.postId}\`)
  return { ok: true }
}
\`\`\`

\`\`\`tsx
// comment-form.tsx
'use client'
import { useActionState, useOptimistic, startTransition } from 'react'
import { addComment, type CommentState } from './actions'

export function Comments({ postId, comments }: { postId: string; comments: Comment[] }) {
  const [optimistic, addOptimistic] = useOptimistic(comments, (list, c: Comment) => [...list, c])
  const [state, formAction, isPending] = useActionState<CommentState, FormData>(
    async (prev, fd) => {
      addOptimistic({ id: 'tmp', body: String(fd.get('body')), pending: true })
      return addComment(prev, fd)
    },
    { ok: false },
  )

  return (
    <>
      <ul>{optimistic.map((c) => <li key={c.id} aria-busy={c.pending}>{c.body}</li>)}</ul>
      <form action={formAction}>
        <input type="hidden" name="postId" value={postId} />
        <label htmlFor="body">Comment</label>
        <textarea id="body" name="body" aria-describedby="body-err" />
        {state.errors?.body && <p id="body-err" role="alert">{state.errors.body[0]}</p>}
        <button disabled={isPending}>{isPending ? 'Posting…' : 'Post'}</button>
      </form>
    </>
  )
}
\`\`\`

**Why each piece:**
- **\`useActionState\`** holds the action's last return value (errors, messages) and gives \`isPending\`. React runs the action in a transition; the form resets on success.
- **\`useOptimistic\`** shows a temporary state only while the action is pending. When it settles, React swaps back to the real \`comments\` prop, which is fresh because of \`revalidatePath\`. On failure the optimistic item simply disappears (automatic rollback); show \`state.message\`.
- **\`useFormStatus\`** is the alternative for a reusable \`<SubmitButton>\` that reads the parent form's pending state.
- **Progressive enhancement:** passing the Server Action itself to \`action\` lets the form post before hydration. Wrapping it in a client closure (as above for optimism) needs JS; for full no-JS support pass \`addComment\` directly and add the optimistic layer as an enhancement.`,
          keyPoints: [
            'Server Action receives FormData; validate and authorise inside it',
            'useActionState: (prev, formData) => state, plus isPending',
            'useOptimistic: temporary state during the transition, auto rollback',
            'revalidatePath / revalidateTag so the real data replaces the optimistic item',
            'Accessible errors (aria-describedby, role=alert) and progressive enhancement',
          ],
          pitfalls: [
            'Trusting client-side validation only',
            'Forgetting `name` attributes, so FormData is empty',
            'Keeping optimistic items in useState and never reconciling them with server data',
            'Using onSubmit + preventDefault + fetch, losing progressive enhancement',
          ],
          followUps: [
            'How would you handle a duplicate submit or idempotency?',
            'How is useFormStatus different from isPending?',
            'How do you test a Server Action?',
          ],
          walkthrough: [
            {
              title: 'Clarify the flow',
              body: `Submit → server validates and writes → UI shows errors or the new comment. Requirements: pending state, field errors, optimistic insert, works before hydration where possible. Name the primitives: **Server Action**, \`useActionState\`, \`useOptimistic\`, \`revalidatePath\`.`,
            },
            {
              title: 'Write the Server Action first',
              body: `\`\`\`ts
'use server'
export async function addComment(_prev: CommentState, fd: FormData): Promise<CommentState> {
  const user = await getSessionUser()
  if (!user) return { ok: false, message: 'Please sign in.' }
  const parsed = Schema.safeParse(Object.fromEntries(fd))
  if (!parsed.success) return { ok: false, errors: parsed.error.flatten().fieldErrors }
  await db.comment.create({ data: { ...parsed.data, authorId: user.id } })
  revalidatePath(\`/posts/\${parsed.data.postId}\`)
  return { ok: true }
}
\`\`\`
Return expected errors as data; throw only for unexpected failures (an error boundary catches those).`,
            },
            {
              title: 'Wire the client form',
              body: `\`\`\`tsx
const [optimistic, addOptimistic] = useOptimistic(comments, (l, c) => [...l, c])
const [state, formAction, isPending] = useActionState(async (prev, fd) => {
  addOptimistic({ id: 'tmp', body: String(fd.get('body')), pending: true })
  return addComment(prev, fd)
}, { ok: false })
// <form action={formAction}> ... <button disabled={isPending}>
\`\`\`
Render \`state.errors?.body\` linked with \`aria-describedby\`.`,
            },
            {
              title: 'Edge cases and trade-offs',
              body: `- **Rollback** is automatic: optimistic state ends with the transition; show \`state.message\` on failure.
- **Double submit:** \`disabled={isPending}\`, plus server idempotency if it matters.
- **No-JS:** pass the Server Action directly to \`action\` for full progressive enhancement; the optimistic wrapper is an enhancement.
- **Security:** the action is a POST endpoint: auth, validation, rate limits.`,
            },
            {
              title: 'Say it in 30 seconds',
              body: `"The mutation is a Server Action that authorises, validates with zod, writes and revalidates the path, returning field errors as data. On the client, useActionState gives me the last result and isPending, and useOptimistic shows the comment immediately and rolls back automatically if the action fails. The form uses the action prop, so it can post before hydration."`,
            },
          ],
          personalAngle:
            'Consent and accessibility settings forms are a natural example: explain how you would move a settings save to a server action with optimistic toggles and server-side validation.',
          references: [
            { label: 'react.dev: useActionState', url: 'https://react.dev/reference/react/useActionState' },
            { label: 'react.dev: useOptimistic', url: 'https://react.dev/reference/react/useOptimistic' },
          ],
        },
      ],
    },
  ],
}

export default track
