import type { Track } from '@/types/content'

const track: Track = {
  id: 'cs-fundamentals',
  code: 'B',
  title: 'CS Fundamentals: Data Structures & Algorithms',
  summary: 'Complexity, core data structures and the algorithmic patterns that solve most coding rounds.',
  rationale:
    'Product work rarely asks you to write a heap or a BFS by hand, but online assessments and coding rounds at Tokyo tech companies and big tech do, often as the very first filter. This track trains pattern recognition, so an unfamiliar problem maps to a known shape quickly, with solutions in the TypeScript you already write.',
  icon: 'Binary',
  phase: 1,
  modules: [
    {
      id: 'cs-warmups',
      title: 'Warm-ups: mapping & everyday algorithms',
      summary:
        'The easy first problem of a frontend or full-stack coding round: reshape API data, count, dedupe, flatten, merge and debounce, cleanly and in TypeScript.',
      questions: [
        {
          id: 'cs-warm-group-orders-by-customer',
          title: 'Group API data: order totals per customer',
          type: 'coding',
          difficulty: 'foundation',
          priority: 'must',
          tags: ['warm-up', 'hash-map', 'grouping', 'reduce', 'data-transformation'],
          estMinutes: 12,
          roles: ['frontend', 'full-stack', 'backend'],
          prompt: `An API returns a flat list of orders. Return **one entry per customer** with their total spend and order count, **sorted by total, highest first**.

\`\`\`ts
type Order = { id: string; customerId: string; amount: number; status: 'paid' | 'refunded' }
type CustomerTotal = { customerId: string; total: number; orders: number }

function totalsByCustomer(orders: Order[]): CustomerTotal[]
\`\`\`

Only \`paid\` orders count.`,
          intent:
            'This is the "can you reshape data without fuss" opener. The interviewer wants a single pass into a Map keyed by customer, correct filtering, a non-mutating sort, and a quick word on money precision and complexity.',
          hints: [
            'You need to look up "the running total for this customer" quickly while walking the list. Which structure gives O(1) lookup by key?',
            'Use a `Map<string, CustomerTotal>`. Skip refunded orders, then create or update the entry for `order.customerId`.',
            'After the loop, turn `map.values()` into an array and sort with a numeric comparator `(a, b) => b.total - a.total`.',
            'Skeleton: `for (const o of orders) { if (o.status !== \'paid\') continue; const t = acc.get(o.customerId) ?? { customerId: o.customerId, total: 0, orders: 0 }; t.total += ___; t.orders += ___; acc.set(o.customerId, t) } return [...acc.values()].sort(___)`',
          ],
          answer: `**One pass into a \`Map\` keyed by \`customerId\`, then sort the values.** O(n + m log m) where m is the number of customers.

\`\`\`ts
type Order = { id: string; customerId: string; amount: number; status: 'paid' | 'refunded' }
type CustomerTotal = { customerId: string; total: number; orders: number }

function totalsByCustomer(orders: Order[]): CustomerTotal[] {
  const acc = new Map<string, CustomerTotal>()
  for (const o of orders) {
    if (o.status !== 'paid') continue
    const t = acc.get(o.customerId) ?? { customerId: o.customerId, total: 0, orders: 0 }
    t.total += o.amount
    t.orders += 1
    acc.set(o.customerId, t)
  }
  return [...acc.values()].sort((a, b) => b.total - a.total)
}
\`\`\`

**Why a \`Map\` and not \`reduce\` into an object:** a Map has no prototype keys (a customer id of \`"__proto__"\` cannot break it), keeps insertion order, and reads clearly. A \`reduce\` with a Map accumulator is equally fine; what matters is a **single pass** rather than \`filter\` per customer (O(n·m)).

**Since ES2024** you can also write \`Map.groupBy(orders, o => o.customerId)\` and sum each group, but say whether your target runtime supports it.

**Points worth saying out loud:**
- **Money:** floating-point sums drift (\`0.1 + 0.2\`). Real systems store **integer minor units** (cents, yen) and format at the edge.
- **Sorting:** \`[...acc.values()]\` is already a new array, so \`sort\` does not mutate the input. Ties: add a secondary key (\`customerId\`) for a stable, deterministic order.
- **Complexity:** O(n) to aggregate, O(m log m) to sort, O(m) extra space.`,
          walkthrough: [
            {
              title: 'Restate and clarify',
              body: 'Input: flat orders. Output: one row per customer with total and count, paid only, highest total first. Ask: are amounts in minor units (cents/yen)? How should ties be ordered? Can the list be empty (→ `[]`)?',
            },
            {
              title: 'Choose the data structure',
              body: '"Aggregate by key" means a **hash map**. A `Map<string, CustomerTotal>` gives O(1) get/set per order, so the whole aggregation is one O(n) pass instead of filtering per customer.',
            },
            {
              title: 'Build it',
              body: `\`\`\`ts
function totalsByCustomer(orders: Order[]): CustomerTotal[] {
  const acc = new Map<string, CustomerTotal>()
  for (const o of orders) {
    if (o.status !== 'paid') continue
    const t = acc.get(o.customerId) ?? { customerId: o.customerId, total: 0, orders: 0 }
    t.total += o.amount
    t.orders += 1
    acc.set(o.customerId, t)
  }
  return [...acc.values()].sort((a, b) => b.total - a.total)
}
\`\`\``,
            },
            {
              title: 'Complexity and edge cases',
              body: '**O(n + m log m)** time, O(m) space. Empty input → `[]`. Floating-point money drifts; prefer integer minor units. Add a tie-breaker for deterministic output. The default `sort()` compares strings, so always pass a comparator.',
            },
            {
              title: 'Say it in the interview',
              body: '*"I\'ll aggregate in one pass with a Map keyed by customer, skipping refunds, then sort the values by total descending. That\'s linear plus m log m for the sort. In production I\'d keep amounts in integer cents."*',
            },
          ],
          keyPoints: [
            'Single pass into a Map keyed by customer',
            'Filter inside the loop instead of a separate pass per customer',
            'Numeric comparator and a non-mutating sort',
            'Mentions money precision (integer minor units)',
            'States O(n + m log m)',
          ],
          pitfalls: [
            'Filtering the whole array once per customer (O(n·m))',
            'Calling sort() without a comparator',
            'Using a plain object and tripping over prototype keys',
          ],
          followUps: [
            'Now also return each customer\'s most recent order date.',
            'The list has 10 million rows and comes from a stream. What changes?',
          ],
          personalAngle:
            'This is the same shape as the matching logic over thousands of scraped records: say you have aggregated by key in a Map in production, and mention how you kept the pass linear.',
        },
        {
          id: 'cs-warm-two-sum-map',
          title: 'Two Sum with a hash map',
          type: 'coding',
          difficulty: 'foundation',
          priority: 'must',
          tags: ['warm-up', 'hash-map', 'arrays', 'two-sum'],
          estMinutes: 10,
          roles: ['general'],
          prompt: `Given \`nums: number[]\` and \`target: number\`, return the **indices of two different elements** that add up to \`target\`. Assume exactly one answer exists. Start with the brute force, then make it O(n).

Example: \`twoSum([2, 7, 11, 15], 9)\` → \`[0, 1]\``,
          intent:
            'The most common warm-up in existence. The interviewer is checking that you state the O(n²) baseline, then trade space for time with a value → index map, and that you avoid using the same element twice.',
          hints: [
            'Brute force: try every pair i < j. What is the cost, and what question does the inner loop keep asking?',
            'For each `nums[i]`, the partner you need is `target - nums[i]`. Can you look that up in O(1)?',
            'Keep a `Map<number, number>` from value to index of the numbers you have **already** passed. Check before you insert.',
            'Skeleton: `for (let i = 0; i < nums.length; i++) { const j = seen.get(target - nums[i]); if (j !== undefined) return [___, ___]; seen.set(nums[i], i) }`',
          ],
          answer: `**Store each value's index in a \`Map\`; for every element, look up its complement.** O(n) time, O(n) space.

\`\`\`ts
function twoSum(nums: number[], target: number): [number, number] {
  const seen = new Map<number, number>() // value -> index
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i]
    const j = seen.get(need)
    if (j !== undefined) return [j, i]
    seen.set(nums[i], i)
  }
  throw new Error('No solution')
}
\`\`\`

**Why check before inserting:** with \`[3, 3]\` and target 6, the second 3 finds the first one's index. With \`[3]\` and target 6, checking first stops the single 3 from pairing with itself.

**Why \`j !== undefined\` and not \`if (j)\`:** index 0 is falsy. This is the most common bug in this problem.

**The baseline to mention first:** two nested loops over i < j is O(n²) time, O(1) space. Saying it shows you know what you are improving.

**Variations to recognise:**
- **Sorted input:** two pointers from both ends give O(n) time and **O(1)** space.
- **Count all pairs:** keep value → count instead of value → index.
- **Three Sum:** sort, then run the two-pointer version for each element (O(n²)).

**The general pattern:** *"Have I already seen the thing that completes this one?"* is a hash-map lookup. The same idea powers deduping, the first repeated item and the prefix-sum problems.`,
          walkthrough: [
            {
              title: 'Restate and clarify',
              body: 'Return two **indices** (not values) of different elements summing to target. Ask: exactly one answer? Can values repeat or be negative? Is the array sorted (that would change the best approach)?',
            },
            {
              title: 'Baseline, then the data structure',
              body: 'Brute force checks every pair: **O(n²)**. The inner loop keeps asking "does `target − x` exist?". A `Map` from value to index answers that in O(1), trading O(n) space for O(n) time.',
            },
            {
              title: 'Build it',
              body: `\`\`\`ts
function twoSum(nums: number[], target: number): [number, number] {
  const seen = new Map<number, number>()
  for (let i = 0; i < nums.length; i++) {
    const j = seen.get(target - nums[i])
    if (j !== undefined) return [j, i]
    seen.set(nums[i], i)
  }
  throw new Error('No solution')
}
\`\`\``,
            },
            {
              title: 'Complexity and edge cases',
              body: '**O(n) time, O(n) space.** Look up **before** inserting so an element never pairs with itself. Use `!== undefined` because index 0 is falsy. Duplicates like `[3, 3]` work because the first 3 is already in the map.',
            },
            {
              title: 'Say it in the interview',
              body: '*"Brute force is n squared. The inner loop is really a lookup for the complement, so I keep a map of values I\'ve seen to their index and check it as I go: one pass, linear time. If the array were sorted I\'d use two pointers for O(1) space."*',
            },
          ],
          keyPoints: [
            'States the O(n²) baseline first',
            'Map from value to index, looking up the complement',
            'Checks before inserting to avoid self-pairing',
            'Handles index 0 correctly',
            'Knows the sorted two-pointer variant',
          ],
          pitfalls: ['`if (seen.get(need))` failing when the index is 0', 'Inserting before checking, so x pairs with itself when 2x = target'],
          followUps: ['What if the input is sorted?', 'Return all unique pairs instead of one.'],
        },
        {
          id: 'cs-warm-dedupe-latest-by-key',
          title: 'Dedupe records by key, keeping the latest',
          type: 'coding',
          difficulty: 'foundation',
          priority: 'must',
          tags: ['warm-up', 'hash-map', 'dedupe', 'data-transformation'],
          estMinutes: 12,
          roles: ['frontend', 'full-stack', 'backend'],
          prompt: `You merge user records from two paginated API calls and get duplicates. **Keep one record per \`id\`: the one with the newest \`updatedAt\`** (ISO strings). Keep the output in the order each id first appeared.

\`\`\`ts
type UserRecord = { id: string; name: string; updatedAt: string }
function dedupeLatest(records: UserRecord[]): UserRecord[]
\`\`\``,
          intent:
            'A realistic data-cleanup task. The interviewer wants a Map keyed by id with a correct "newer wins" comparison, preserved first-seen order, and a remark on comparing dates safely.',
          hints: [
            'You need "the best record so far for this id" in O(1). Which structure?',
            'Walk the list; for each record, compare with the stored one and replace it only if this one is newer.',
            'A `Map` keeps the insertion order of its **first** `set` for each key, even when you overwrite the value later. That gives you first-seen order for free.',
            'Skeleton: `for (const r of records) { const cur = byId.get(r.id); if (!cur || Date.parse(r.updatedAt) > Date.parse(___)) byId.set(r.id, r) } return [...byId.values()]`',
          ],
          answer: `**Keep a \`Map<id, record>\`; overwrite only when the incoming record is newer.** O(n) time, O(u) space for u unique ids.

\`\`\`ts
type UserRecord = { id: string; name: string; updatedAt: string }

function dedupeLatest(records: UserRecord[]): UserRecord[] {
  const byId = new Map<string, UserRecord>()
  for (const r of records) {
    const current = byId.get(r.id)
    if (!current || Date.parse(r.updatedAt) > Date.parse(current.updatedAt)) {
      byId.set(r.id, r)
    }
  }
  return [...byId.values()]
}
\`\`\`

**Order:** \`Map\` iteration follows the order in which keys were **first inserted**; re-setting an existing key updates the value but keeps its position. So the output is in first-seen order without extra work.

**Comparing dates:** \`Date.parse\` returns milliseconds, which is safe across time zones and formats. Comparing ISO strings lexicographically also works **only** if every value uses the same format and the UTC \`Z\` suffix; say which assumption you are making. Invalid dates parse to \`NaN\`, and every comparison with \`NaN\` is false, so a bad timestamp never wins; mention whether that is the behaviour you want.

**Ties:** with equal \`updatedAt\`, this keeps the first one seen. If "last one wins" is preferred, use \`>=\`.

**Alternatives:**
- Sort by \`updatedAt\` descending, then keep the first per id with a \`Set\`: O(n log n) and loses first-seen order.
- \`new Map(records.map(r => [r.id, r]))\` keeps the **last** occurrence, not the newest; only correct if the input is already time-ordered.`,
          walkthrough: [
            {
              title: 'Restate and clarify',
              body: 'One record per `id`, the newest by `updatedAt`, output in first-appearance order. Ask: are timestamps all UTC ISO strings? On equal timestamps, first or last wins? Any invalid dates?',
            },
            {
              title: 'Choose the data structure',
              body: 'A `Map<string, UserRecord>` holds the best record per id. It also preserves **first insertion order** even when a value is replaced, which matches the ordering requirement.',
            },
            {
              title: 'Build it',
              body: `\`\`\`ts
function dedupeLatest(records: UserRecord[]): UserRecord[] {
  const byId = new Map<string, UserRecord>()
  for (const r of records) {
    const current = byId.get(r.id)
    if (!current || Date.parse(r.updatedAt) > Date.parse(current.updatedAt)) {
      byId.set(r.id, r)
    }
  }
  return [...byId.values()]
}
\`\`\``,
            },
            {
              title: 'Complexity and edge cases',
              body: '**O(n) time, O(u) space.** Empty input → `[]`. `NaN` from a bad date never wins a comparison. Lexicographic ISO comparison only works with one consistent UTC format. `new Map(records.map(...))` keeps the **last**, not the newest.',
            },
            {
              title: 'Say it in the interview',
              body: '*"I keep the best record per id in a Map and replace it only when the incoming one is newer. Map keeps first-insertion order, so output order is free. It\'s one linear pass; I parse the dates instead of comparing strings unless we guarantee UTC ISO."*',
            },
          ],
          keyPoints: [
            'Map keyed by id with a "newer wins" rule',
            'Knows Map preserves first-insertion order on overwrite',
            'Compares timestamps numerically, not as arbitrary strings',
            'States the tie-breaking rule',
          ],
          pitfalls: [
            'Building a Map from the array, which keeps the last record rather than the newest',
            'Comparing date strings in mixed formats',
            'Using filter + findIndex, which is O(n²)',
          ],
          followUps: ['Records now arrive as a stream over hours. How do you dedupe with bounded memory?'],
          personalAngle:
            'Scraping pipelines produce exactly this: the same listing fetched twice with different timestamps. Describe how your Redis-backed jobs decided which version won.',
        },
        {
          id: 'cs-warm-first-unique-char',
          title: 'Frequency count: first non-repeating character',
          type: 'coding',
          difficulty: 'foundation',
          priority: 'should',
          tags: ['warm-up', 'hash-map', 'strings', 'counting'],
          estMinutes: 10,
          roles: ['general'],
          prompt: `Return the **index of the first character that appears exactly once** in a string, or \`-1\` if there is none.

Examples: \`"leetcode"\` → 0, \`"loveleetcode"\` → 2, \`"aabb"\` → -1`,
          intent:
            'Tests the two-pass counting pattern. A strong answer counts in one pass, finds the first count of 1 in a second pass, states O(n) and mentions Unicode or alphabet assumptions.',
          hints: [
            'You cannot know a character is unique until you have seen the whole string. How many passes does that suggest?',
            'Pass 1: count every character in a `Map<string, number>`.',
            'Pass 2: walk the string again in order and return the first index whose count is 1.',
            'Skeleton: `for (const ch of s) counts.set(ch, (counts.get(ch) ?? 0) + 1); for (let i = 0; i < s.length; i++) if (counts.get(s[i]) === ___) return i; return -1`',
          ],
          answer: `**Two passes: count, then scan in order for the first count of 1.** O(n) time, O(k) space for k distinct characters.

\`\`\`ts
function firstUniqChar(s: string): number {
  const counts = new Map<string, number>()
  for (const ch of s) counts.set(ch, (counts.get(ch) ?? 0) + 1)
  for (let i = 0; i < s.length; i++) {
    if (counts.get(s[i]) === 1) return i
  }
  return -1
}
\`\`\`

**Why two passes:** uniqueness depends on the whole string; a character that looks unique at index 0 may repeat at the end. The second pass walks the **string**, not the Map, so "first" means first in the original order.

**Alternatives to mention:**
- If the input is guaranteed lowercase a–z, a fixed \`Int32Array(26)\` is faster and O(1) space.
- \`s.indexOf(ch) === s.lastIndexOf(ch)\` for each character is O(n²): fine to mention, not to ship.

**Unicode note:** \`for...of\` iterates by **code point**, while \`s[i]\` indexes **UTF-16 code units**. For emoji or other astral characters they disagree. If that matters, iterate with \`[...s]\` in both passes and return the index in that array, and say so.

**The pattern:** "frequency count, then query" covers anagram checks, majority element, "can this ransom note be built from this magazine", and top-k frequent.`,
          walkthrough: [
            {
              title: 'Restate and clarify',
              body: 'Return the **index** of the first character with frequency 1, or -1. Ask: lowercase ASCII only, or arbitrary Unicode? Case-sensitive? Empty string → -1.',
            },
            {
              title: 'Choose the approach',
              body: 'You only know a character is unique after seeing everything, so **count first, decide second**. A `Map<string, number>` holds counts; a second pass over the original string preserves "first" order.',
            },
            {
              title: 'Build it',
              body: `\`\`\`ts
function firstUniqChar(s: string): number {
  const counts = new Map<string, number>()
  for (const ch of s) counts.set(ch, (counts.get(ch) ?? 0) + 1)
  for (let i = 0; i < s.length; i++) {
    if (counts.get(s[i]) === 1) return i
  }
  return -1
}
\`\`\``,
            },
            {
              title: 'Complexity and edge cases',
              body: '**O(n) time, O(k) space.** For a–z only, a 26-slot array is O(1) space. Emoji break the mix of `for...of` (code points) and `s[i]` (code units); use `[...s]` consistently if needed. `indexOf === lastIndexOf` per char is O(n²).',
            },
            {
              title: 'Say it in the interview',
              body: '*"Uniqueness depends on the whole string, so I count in one pass and then scan the string again for the first count of one. Linear time; if it\'s only lowercase letters I\'d use a 26-length array."*',
            },
          ],
          keyPoints: ['Count first, then query', 'Second pass over the string preserves order', 'O(n) time', 'Mentions alphabet or Unicode assumptions'],
          pitfalls: ['Scanning the Map instead of the string (works by accident for Map, breaks for plain objects with numeric-like keys)', 'O(n²) indexOf/lastIndexOf'],
          followUps: ['Now the characters arrive as a stream. Return the first unique character after each new one.'],
        },
        {
          id: 'cs-warm-flatten-object-paths',
          title: 'Flatten a nested object into dot paths',
          type: 'coding',
          difficulty: 'core',
          priority: 'should',
          tags: ['warm-up', 'recursion', 'objects', 'data-transformation'],
          estMinutes: 15,
          roles: ['frontend', 'full-stack'],
          prompt: `Write \`flatten(obj)\` that turns a nested object into a single-level object whose keys are **dot paths**. Arrays use their index as a path segment.

\`\`\`ts
flatten({ user: { name: 'Aki', tags: ['a', 'b'] }, active: true })
// { 'user.name': 'Aki', 'user.tags.0': 'a', 'user.tags.1': 'b', active: true }
\`\`\`

Then: how would you flatten a nested **array** (\`[1, [2, [3]]]\` → \`[1, 2, 3]\`) without \`.flat(Infinity)\`?`,
          intent:
            'Tests recursion over JSON-like data and clean path building. A strong answer separates "plain object or array → recurse" from "leaf → assign", handles empty objects, null and Dates, and mentions depth or cycles.',
          hints: [
            'Every value is either a container (plain object or array) or a leaf. What should happen to each?',
            'Write a helper `walk(value, path)`. For containers, call it on each child with `path ? path + \'.\' + key : key`. For leaves, assign `out[path] = value`.',
            'Watch out: `typeof null === \'object\'`, and a `Date` is an object you probably want to keep as a leaf. Check for plain objects explicitly.',
            'Skeleton: `const walk = (v: unknown, path: string) => { if (isContainer(v) && Object.keys(v).length) { for (const [k, child] of Object.entries(v)) walk(child, path ? ___ : k) } else out[path] = v }`',
          ],
          answer: `**Recurse with the current path; containers recurse, leaves are written to the output.** O(total number of nodes).

\`\`\`ts
type Json = string | number | boolean | null | Json[] | { [k: string]: Json }

const isContainer = (v: unknown): v is Record<string, unknown> | unknown[] =>
  Array.isArray(v) || (typeof v === 'object' && v !== null && Object.getPrototypeOf(v) === Object.prototype)

function flatten(obj: Record<string, Json>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  const walk = (value: unknown, path: string) => {
    if (isContainer(value) && Object.keys(value).length > 0) {
      for (const [key, child] of Object.entries(value)) {
        walk(child, path ? path + '.' + key : key)
      }
    } else if (path) {
      out[path] = value // leaf, or an empty {} / [] kept as-is
    }
  }
  walk(obj, '')
  return out
}
\`\`\`

**Decisions to state:**
- **Plain-object check:** \`typeof v === 'object'\` alone treats \`null\`, \`Date\` and \`Map\` as containers. Checking the prototype keeps them as leaves.
- **Empty containers:** without the \`length > 0\` check, \`{ a: {} }\` would vanish. Keeping \`'a': {}\` makes the operation reversible.
- **Keys containing dots** make the result ambiguous; mention escaping or a different separator.
- **Cycles:** \`JSON\`-shaped data has none, but for arbitrary objects track visited objects in a \`WeakSet\`.

**Flattening a nested array** is the same recursion with a simpler leaf rule:

\`\`\`ts
function flattenArray<T>(arr: unknown[]): T[] {
  const out: T[] = []
  const stack = [...arr].reverse()
  while (stack.length) {
    const v = stack.pop()
    if (Array.isArray(v)) for (let i = v.length - 1; i >= 0; i--) stack.push(v[i])
    else out.push(v as T)
  }
  return out
}
\`\`\`

The explicit stack avoids recursion-depth limits; recursion is also fine if you say so.`,
          walkthrough: [
            {
              title: 'Restate and clarify',
              body: 'Nested object → one level, keys joined with dots, array indices as segments. Ask: keep empty objects/arrays? Treat `Date`/`null` as leaves? Can keys contain dots? Can there be cycles?',
            },
            {
              title: 'Choose the approach',
              body: 'The data is a tree, so **recursion with an accumulated path**. Two cases only: a non-empty plain object or array → recurse into each entry; anything else → `out[path] = value`.',
            },
            {
              title: 'Build it',
              body: `\`\`\`ts
const isContainer = (v: unknown): v is Record<string, unknown> | unknown[] =>
  Array.isArray(v) || (typeof v === 'object' && v !== null && Object.getPrototypeOf(v) === Object.prototype)

function flatten(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  const walk = (value: unknown, path: string) => {
    if (isContainer(value) && Object.keys(value).length > 0) {
      for (const [key, child] of Object.entries(value)) walk(child, path ? path + '.' + key : key)
    } else if (path) {
      out[path] = value
    }
  }
  walk(obj, '')
  return out
}
\`\`\``,
            },
            {
              title: 'Complexity and edge cases',
              body: '**O(N)** for N nodes (plus path-string building). `typeof null === \'object\'` is the classic trap. Empty containers are kept as leaves so nothing is lost. Deep nesting can hit the recursion limit; an explicit stack fixes it. Cycles need a `WeakSet`.',
            },
            {
              title: 'Say it in the interview',
              body: '*"It\'s a tree walk carrying the path. Containers recurse, leaves get written. I treat only plain objects and arrays as containers so null and Dates stay leaves, and I keep empty objects so it can be unflattened."* Then do the array version with a stack.',
            },
          ],
          keyPoints: [
            'Recursion carrying the current path',
            'Distinguishes plain objects and arrays from other objects and null',
            'Handles empty containers deliberately',
            'Mentions cycles and recursion depth',
          ],
          pitfalls: ['Treating null as an object and crashing on Object.entries(null)', 'Leading dot on top-level keys', 'Silently dropping empty objects'],
          followUps: ['Write `unflatten`.', 'How would you use this to build form field names or i18n keys?'],
        },
        {
          id: 'cs-warm-merge-meeting-slots',
          title: 'Merge overlapping meeting slots',
          type: 'coding',
          difficulty: 'core',
          priority: 'should',
          tags: ['warm-up', 'intervals', 'sorting', 'greedy'],
          estMinutes: 15,
          roles: ['general', 'full-stack'],
          prompt: `A calendar API gives you busy slots as \`[start, end]\` minute pairs, unsorted. **Merge any overlapping or touching slots** and return them sorted.

\`\`\`ts
mergeSlots([[540, 600], [570, 630], [720, 780], [630, 660]])
// [[540, 660], [720, 780]]
\`\`\``,
          intent:
            'The standard intervals problem in a product costume. The interviewer checks that you sort by start first, merge greedily into the last result, decide whether touching slots merge, and avoid mutating the input.',
          hints: [
            'Overlaps are hard to find in random order. What one operation makes every overlapping slot sit next to its neighbour?',
            'After sorting by start, each slot either overlaps the **last merged slot** or starts a new one.',
            'Overlap test with touching included: `slot.start <= last.end`. Merge with `last.end = Math.max(last.end, slot.end)`.',
            'Skeleton: `const sorted = [...slots].sort((a, b) => a[0] - b[0]); const out = []; for (const [s, e] of sorted) { const last = out.at(-1); if (last && s <= last[1]) last[1] = Math.max(___, ___); else out.push([s, e]) } return out`',
          ],
          answer: `**Sort by start time, then sweep once, extending the last merged slot or starting a new one.** O(n log n) time.

\`\`\`ts
type Slot = [start: number, end: number]

function mergeSlots(slots: Slot[]): Slot[] {
  const sorted = [...slots].sort((a, b) => a[0] - b[0])
  const merged: Slot[] = []
  for (const [start, end] of sorted) {
    const last = merged[merged.length - 1]
    if (last && start <= last[1]) {
      last[1] = Math.max(last[1], end) // overlap or touch: extend
    } else {
      merged.push([start, end]) // copy, never alias the input tuple
    }
  }
  return merged
}
\`\`\`

**Why sorting makes it easy:** once slots are ordered by start, a slot can only overlap the slot just before it (after merging). That turns an O(n²) pairwise comparison into one linear sweep.

**Why \`Math.max\`:** a slot can be fully contained in the previous one (\`[540, 700]\` then \`[560, 600]\`); just assigning \`end\` would shrink it.

**Touching slots:** \`<=\` merges \`[570, 630]\` and \`[630, 660]\`. For a calendar that is usually right; for half-open intervals where touching is not overlapping, use \`<\`. Ask.

**Complexity:** O(n log n) for the sort plus O(n) for the sweep; O(n) for the output.

**Follow-ups this unlocks:**
- **Free slots:** after merging, the gaps between consecutive merged slots are the free time.
- **Can one person attend all meetings?** Sort, and check whether any \`start < previous end\`.
- **Minimum meeting rooms:** sort starts and ends separately, or use a min-heap of end times.`,
          walkthrough: [
            {
              title: 'Restate and clarify',
              body: 'Unsorted `[start, end]` slots → merged, sorted, no overlaps. Ask: do touching slots (end = next start) merge? Are slots always valid (start ≤ end)? May I mutate the input?',
            },
            {
              title: 'Choose the approach',
              body: '**Sort by start**, then a single greedy sweep. After sorting, a slot can only overlap the most recently merged slot, so you only ever compare with `merged.at(-1)`.',
            },
            {
              title: 'Build it',
              body: `\`\`\`ts
function mergeSlots(slots: [number, number][]): [number, number][] {
  const sorted = [...slots].sort((a, b) => a[0] - b[0])
  const merged: [number, number][] = []
  for (const [start, end] of sorted) {
    const last = merged[merged.length - 1]
    if (last && start <= last[1]) last[1] = Math.max(last[1], end)
    else merged.push([start, end])
  }
  return merged
}
\`\`\``,
            },
            {
              title: 'Complexity and edge cases',
              body: '**O(n log n)** time, O(n) output. Use `Math.max` for contained slots. Push a **new** tuple so you never mutate the caller\'s arrays. Empty input → `[]`. `<=` vs `<` decides whether touching slots merge.',
            },
            {
              title: 'Say it in the interview',
              body: '*"Sorting by start puts every overlap next to its neighbour, so I sweep once and either extend the last merged slot or start a new one. n log n for the sort, linear after. The gaps between merged slots give free time if we need it next."*',
            },
          ],
          keyPoints: ['Sort by start first', 'Compare only with the last merged interval', 'Math.max for contained intervals', 'Decides on touching intervals explicitly', 'Does not mutate the input'],
          pitfalls: ['Forgetting to sort', 'Setting last.end = end, which shrinks contained intervals', 'Sorting the caller\'s array in place'],
          followUps: ['Return the free slots between 9:00 and 18:00.', 'How many meeting rooms are needed?'],
        },
        {
          id: 'cs-warm-chunk-paginate',
          title: 'Chunk an array and paginate results',
          type: 'coding',
          difficulty: 'foundation',
          priority: 'should',
          tags: ['warm-up', 'arrays', 'pagination', 'generics'],
          estMinutes: 10,
          roles: ['frontend', 'full-stack'],
          prompt: `1. Write a generic \`chunk<T>(items: T[], size: number): T[][]\`. \`chunk([1,2,3,4,5], 2)\` → \`[[1,2],[3,4],[5]]\`.
2. Write \`paginate<T>(items: T[], page: number, pageSize: number)\` returning \`{ data, page, pageSize, total, totalPages, hasNext }\` with **1-based** pages.`,
          intent:
            'A quick check of loop arithmetic, generics and input validation. The interviewer listens for off-by-one care, a guard against size ≤ 0, and the 1-based page math with Math.ceil.',
          hints: [
            'Chunking: step through the array `size` items at a time. What does `slice(i, i + size)` return near the end?',
            'Guard the input: what happens to your loop if `size` is 0?',
            'Pagination: the start index for 1-based page p is `(p - 1) * pageSize`; total pages is `Math.ceil(total / pageSize)`.',
            'Skeleton: `for (let i = 0; i < items.length; i += size) out.push(items.slice(i, ___))` and `const start = (page - 1) * pageSize; return { data: items.slice(start, start + pageSize), totalPages: Math.ceil(___), hasNext: page < totalPages }`',
          ],
          answer: `**Step by \`size\` and slice; for pagination, compute the start index from a 1-based page.** Both O(n) / O(pageSize).

\`\`\`ts
function chunk<T>(items: readonly T[], size: number): T[][] {
  if (!Number.isInteger(size) || size <= 0) throw new RangeError('size must be a positive integer')
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size)) // slice clamps at the end
  }
  return out
}

type Page<T> = { data: T[]; page: number; pageSize: number; total: number; totalPages: number; hasNext: boolean }

function paginate<T>(items: readonly T[], page: number, pageSize: number): Page<T> {
  if (pageSize <= 0) throw new RangeError('pageSize must be positive')
  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const current = Math.min(Math.max(1, Math.floor(page)), totalPages) // clamp bad input
  const start = (current - 1) * pageSize
  return {
    data: items.slice(start, start + pageSize),
    page: current,
    pageSize,
    total,
    totalPages,
    hasNext: current < totalPages,
  }
}
\`\`\`

**Edge cases worth naming:**
- \`size = 0\` makes the chunk loop infinite; validate.
- \`slice\` clamps past the end, so the last chunk is just shorter; no special case needed.
- Page 0, negative pages or pages past the end: **clamp** (friendly UI) or **throw** (strict API). Pick one and say why.
- Empty list: \`totalPages\` of 1 with empty \`data\` is easier for UIs than 0.

**Connect it to real APIs:** this is **offset pagination**. It is simple and allows jumping to page N, but on a large, changing table \`OFFSET\` gets slower and rows shift between requests. **Cursor (keyset) pagination** (\`WHERE id > :lastId LIMIT n\`) is stable and fast, at the cost of no random page access.`,
          walkthrough: [
            {
              title: 'Restate and clarify',
              body: 'Chunk into groups of `size` (last one may be shorter). Paginate with 1-based pages. Ask: on invalid size/page, throw or clamp? What should an empty list return?',
            },
            {
              title: 'Choose the approach',
              body: 'Both are index arithmetic over an array. `slice(start, end)` is safe past the end, so the loop steps by `size`; pagination needs `start = (page − 1) × pageSize` and `totalPages = ceil(total / pageSize)`.',
            },
            {
              title: 'Build it',
              body: `\`\`\`ts
function chunk<T>(items: readonly T[], size: number): T[][] {
  if (!Number.isInteger(size) || size <= 0) throw new RangeError('size must be a positive integer')
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size))
  return out
}

function paginate<T>(items: readonly T[], page: number, pageSize: number) {
  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const current = Math.min(Math.max(1, Math.floor(page)), totalPages)
  const start = (current - 1) * pageSize
  return { data: items.slice(start, start + pageSize), page: current, pageSize, total, totalPages, hasNext: current < totalPages }
}
\`\`\``,
            },
            {
              title: 'Complexity and edge cases',
              body: 'Chunk is **O(n)**; a page slice is O(pageSize). `size = 0` loops forever without the guard. Decide clamp vs throw for bad pages. Offset pagination is fine in memory; on a database prefer cursors for large, changing data.',
            },
            {
              title: 'Say it in the interview',
              body: '*"I step by size and slice, which clamps at the end, and I validate size so the loop can\'t spin. For pages it\'s start = (page − 1) × size and ceil for the total. On a real API I\'d move to cursor pagination once the table is big."*',
            },
          ],
          keyPoints: ['Steps by size with slice', 'Validates size and page', 'Correct 1-based math with Math.ceil', 'Mentions offset vs cursor pagination'],
          pitfalls: ['Infinite loop when size is 0', 'Off-by-one with 0-based vs 1-based pages', 'Math.floor instead of Math.ceil for total pages'],
          followUps: ['How would you implement cursor pagination for this endpoint?'],
        },
        {
          id: 'cs-warm-valid-parentheses',
          title: 'Valid parentheses with a stack',
          type: 'coding',
          difficulty: 'foundation',
          priority: 'must',
          tags: ['warm-up', 'stack', 'strings'],
          estMinutes: 10,
          roles: ['general'],
          prompt: `Given a string containing only \`()[]{}\`, return \`true\` if **every bracket is closed by the same type in the correct order**.

Examples: \`"()[]{}"\` → true, \`"(]"\` → false, \`"([)]"\` → false, \`"{[]}"\` → true`,
          intent:
            'Tests recognising a LIFO problem and handling the two failure edges: a closer with an empty stack, and leftovers at the end. A strong answer uses a closer → opener map and returns stack.length === 0.',
          hints: [
            'The most recently opened bracket must be the first one closed. Which data structure is "last in, first out"?',
            'Push every opening bracket. On a closing bracket, the top of the stack must be its matching opener.',
            'A lookup `{ \')\': \'(\', \']\': \'[\', \'}\': \'{\' }` avoids a chain of ifs. Two ways to fail: mismatch/empty stack, or brackets left over at the end.',
            'Skeleton: `for (const ch of s) { if (ch in pairs) { if (stack.pop() !== pairs[ch]) return false } else stack.push(ch) } return ___`',
          ],
          answer: `**Push openers; on a closer, pop and check it matches. Valid only if the stack ends empty.** O(n) time, O(n) space.

\`\`\`ts
const PAIRS: Record<string, string> = { ')': '(', ']': '[', '}': '{' }

function isValid(s: string): boolean {
  if (s.length % 2 === 1) return false // quick exit
  const stack: string[] = []
  for (const ch of s) {
    const opener = PAIRS[ch]
    if (opener) {
      if (stack.pop() !== opener) return false // empty stack pops undefined
    } else {
      stack.push(ch)
    }
  }
  return stack.length === 0
}
\`\`\`

**Why a stack:** brackets nest, and the innermost (most recent) opener must close first. That is exactly LIFO. \`"([)]"\` fails because when \`)\` arrives the top is \`[\`.

**The two failure modes people miss:**
- A closer when the stack is empty (\`")("\`): \`pop()\` returns \`undefined\`, which never equals an opener, so it fails correctly.
- Leftover openers (\`"(("\`): the loop finishes without error, so you **must** return \`stack.length === 0\`, not \`true\`.

**If the string contains other characters** (e.g. validating \`"fn(a[0])"\`), skip anything that is neither an opener nor a closer.

**Counter-only shortcut:** with a **single** bracket type, a counter that never goes negative and ends at 0 is enough (O(1) space). With multiple types you need the stack, because a counter cannot tell \`"([)]"\` from \`"([])"\`.

**Where it shows up in real work:** template or JSX linting, matching tags in a parser, and editor bracket highlighting.`,
          walkthrough: [
            {
              title: 'Restate and clarify',
              body: 'Every bracket must close with the same type in the right nesting order. Ask: only bracket characters, or other text too? Empty string → true.',
            },
            {
              title: 'Choose the data structure',
              body: 'The latest unclosed opener must close first: **LIFO → stack**. A map from closer to opener keeps the check to one line.',
            },
            {
              title: 'Build it',
              body: `\`\`\`ts
const PAIRS: Record<string, string> = { ')': '(', ']': '[', '}': '{' }

function isValid(s: string): boolean {
  const stack: string[] = []
  for (const ch of s) {
    const opener = PAIRS[ch]
    if (opener) {
      if (stack.pop() !== opener) return false
    } else {
      stack.push(ch)
    }
  }
  return stack.length === 0
}
\`\`\``,
            },
            {
              title: 'Complexity and edge cases',
              body: '**O(n) time, O(n) space.** A closer on an empty stack pops `undefined` and fails. Leftover openers mean invalid, so return `stack.length === 0`. Odd length is an instant false. One bracket type only → a counter suffices.',
            },
            {
              title: 'Say it in the interview',
              body: '*"Nesting means the most recent opener closes first, so a stack. Push openers, and on a closer pop and compare via a lookup map. At the end the stack must be empty, otherwise something was left open."*',
            },
          ],
          keyPoints: ['Recognises LIFO', 'Closer → opener map', 'Handles empty-stack closers', 'Returns stack.length === 0', 'Knows when a counter suffices'],
          pitfalls: ['Returning true at the end without checking leftovers', 'Using a counter for multiple bracket types'],
          followUps: ['Return the minimum number of brackets to add to make it valid.'],
        },
        {
          id: 'cs-warm-debounce',
          title: 'Implement debounce',
          type: 'coding',
          difficulty: 'core',
          priority: 'must',
          tags: ['warm-up', 'debounce', 'closures', 'timers', 'generics'],
          estMinutes: 12,
          roles: ['frontend', 'full-stack'],
          prompt: `Implement \`debounce(fn, wait)\`: the returned function delays calling \`fn\` until \`wait\` ms have passed **since the last call**, and uses the **latest arguments**. Type it so the wrapper accepts the same parameters as \`fn\`. Add a \`cancel()\` method.

Typical use: a search box that should call the API only after the user stops typing.`,
          intent:
            'Tests closures, timers and typing a higher-order function. A strong answer stores one timer in a closure, clears it on every call, forwards the latest arguments (and `this` if relevant), and offers cancel and a cleanup story.',
          hints: [
            'Each call should "restart the countdown". What do you need to remember between calls, and where can it live?',
            'Keep a `timer` variable in the closure. Every call does `clearTimeout(timer)` and starts a new `setTimeout`.',
            'Type it with a generic over the parameter tuple: `<A extends unknown[]>(fn: (...args: A) => void, wait: number)`; the returned function takes `...args: A`.',
            'Skeleton: `let timer: ReturnType<typeof setTimeout> | undefined; const debounced = (...args: A) => { clearTimeout(timer); timer = setTimeout(() => fn(___), wait) }; debounced.cancel = () => clearTimeout(___); return debounced`',
          ],
          answer: `**Keep one timer in a closure; every call clears it and schedules a new one with the latest arguments.**

\`\`\`ts
type Debounced<A extends unknown[]> = ((...args: A) => void) & { cancel: () => void }

function debounce<A extends unknown[]>(fn: (...args: A) => void, wait: number): Debounced<A> {
  let timer: ReturnType<typeof setTimeout> | undefined

  const debounced = (...args: A) => {
    clearTimeout(timer) // restart the countdown
    timer = setTimeout(() => {
      timer = undefined
      fn(...args) // latest args win
    }, wait)
  }

  debounced.cancel = () => {
    clearTimeout(timer)
    timer = undefined
  }

  return debounced
}

// usage
const search = debounce((q: string) => fetchResults(q), 300)
search('v'); search('vu'); search('vue') // one call, with 'vue', 300 ms after the last keystroke
\`\`\`

**How it works:** the closure keeps \`timer\` alive between calls. Each call cancels the pending one, so \`fn\` runs only after a quiet period of \`wait\` ms.

**Typing:** a generic over the **parameter tuple** \`A\` keeps the caller's argument types; \`ReturnType<typeof setTimeout>\` works in both browsers (\`number\`) and Node (\`Timeout\`).

**Things to mention:**
- **\`this\`:** an arrow wrapper drops the caller's \`this\`. If it is used as an object method, write \`function (this: unknown, ...args: A)\` and call \`fn.apply(this, args)\`.
- **Cleanup:** in a component, call \`cancel()\` on unmount (\`onUnmounted\` / a \`useEffect\` cleanup) so a late call does not hit a destroyed component.
- **Leading edge:** some UIs want the first call immediately, then silence; that is a \`leading\` option.
- **Debounce vs throttle:** debounce waits for silence (search input, resize end); throttle guarantees at most one call per interval (scroll, drag).
- **Debounce does not fix races:** an older request can still resolve after a newer one. Pair it with \`AbortController\` or a request id.`,
          walkthrough: [
            {
              title: 'Restate and clarify',
              body: 'Call `fn` once, `wait` ms after the **last** call, with the latest arguments; expose `cancel()`. Ask: trailing only, or a leading option? Does `fn` need `this`? Must it return a value (usually no)?',
            },
            {
              title: 'Choose the mechanism',
              body: 'State that survives between calls lives in a **closure**: one `timer` handle. Each call `clearTimeout`s it and schedules a new `setTimeout`, which restarts the quiet period.',
            },
            {
              title: 'Build it',
              body: `\`\`\`ts
function debounce<A extends unknown[]>(fn: (...args: A) => void, wait: number) {
  let timer: ReturnType<typeof setTimeout> | undefined
  const debounced = (...args: A) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      timer = undefined
      fn(...args)
    }, wait)
  }
  debounced.cancel = () => {
    clearTimeout(timer)
    timer = undefined
  }
  return debounced
}
\`\`\``,
            },
            {
              title: 'Edge cases and trade-offs',
              body: '`clearTimeout(undefined)` is safe. Arrow wrappers lose `this`; use `function` + `apply` if needed. Cancel on unmount. Debounce ≠ throttle. Debounce reduces requests but does not prevent out-of-order responses; add `AbortController`.',
            },
            {
              title: 'Say it in the interview',
              body: '*"The closure holds one timer. Every call clears it and starts a new one, so fn fires only after wait ms of silence, with the latest args. I type it generically over the argument tuple and add cancel for component cleanup. For search I\'d also abort stale requests."*',
            },
          ],
          keyPoints: [
            'Timer stored in a closure and cleared on every call',
            'Latest arguments forwarded',
            'Generic over the parameter tuple; portable timer type',
            'cancel() and cleanup on unmount',
            'Distinguishes debounce from throttle and from race handling',
          ],
          pitfalls: [
            'Declaring the timer inside the returned function, so it resets every call',
            'Forgetting to forward arguments',
            'Typing the timer as number and breaking in Node',
          ],
          followUps: ['Add a `leading` option.', 'Implement throttle.', 'How do you stop an older search response overwriting a newer one?'],
          personalAngle:
            'Consent UIs and search inputs on enterprise sites are natural examples: mention where you debounced user input or resize handlers and how you cleaned up on unmount.',
        },
        {
          id: 'cs-warm-deep-get',
          title: 'Safe deep access: get(obj, "a.b[0].c")',
          type: 'coding',
          difficulty: 'foundation',
          priority: 'should',
          tags: ['warm-up', 'objects', 'strings', 'optional-chaining'],
          estMinutes: 12,
          roles: ['frontend', 'full-stack'],
          prompt: `Implement \`get(obj, path, fallback?)\` like lodash's: it reads a nested value by a string path and returns \`fallback\` if any step is missing.

\`\`\`ts
const data = { user: { addresses: [{ city: 'Tokyo' }] } }
get(data, 'user.addresses[0].city') // 'Tokyo'
get(data, 'user.phone.number', 'n/a') // 'n/a'
\`\`\`

Why would you write this instead of using \`?.\`?`,
          intent:
            'Tests string parsing plus defensive traversal. A strong answer tokenises both dot and bracket syntax, stops on null or undefined without throwing, distinguishes "missing" from falsy values like 0, and knows when optional chaining is the better tool.',
          hints: [
            'Turn the path into a list of keys first. How can `a.b[0].c` become `[\'a\', \'b\', \'0\', \'c\']`?',
            'Replace `[n]` with `.n`, then split on dots, filtering empty segments.',
            'Walk the keys; if the current value is `null` or `undefined` at any point, stop and return the fallback. Return the fallback only for `undefined`, not for `0`, `\'\'` or `false`.',
            'Skeleton: `const keys = path.replace(/\\[(\\w+)\\]/g, \'.$1\').split(\'.\').filter(Boolean); let cur: unknown = obj; for (const k of keys) { if (cur == null) return fallback; cur = (cur as Record<string, unknown>)[___] } return cur === undefined ? fallback : cur`',
          ],
          answer: `**Tokenise the path into keys, then walk them, bailing out with the fallback on \`null\`/\`undefined\`.** O(length of the path).

\`\`\`ts
function get<T = unknown>(obj: unknown, path: string | readonly PropertyKey[], fallback?: T): T | undefined {
  const keys = Array.isArray(path)
    ? path
    : (path as string).replace(/\\[(\\w+)\\]/g, '.$1').split('.').filter(Boolean)
  let cur: unknown = obj
  for (const key of keys) {
    if (cur == null) return fallback // null or undefined: stop safely
    cur = (cur as Record<PropertyKey, unknown>)[key]
  }
  return cur === undefined ? fallback : (cur as T)
}
\`\`\`

**Details that matter:**
- **Tokenising:** \`replace(/\\[(\\w+)\\]/g, '.$1')\` turns \`addresses[0]\` into \`addresses.0\`; \`filter(Boolean)\` removes the empty segment from a leading bracket (\`"[0].a"\`).
- **\`cur == null\`** is the one place loose equality is idiomatic: it matches both \`null\` and \`undefined\`.
- **Falsy values are real values:** returning the fallback for \`0\`, \`''\` or \`false\` is a classic bug (\`cur || fallback\`). Only \`undefined\` means missing. Use \`??\` semantics if \`null\` should also fall back; state which.
- Accepting an **array path** avoids parsing and supports keys that contain dots.

**Why not just \`?.\`:** use \`data.user?.addresses?.[0]?.city ?? 'n/a'\` whenever the path is **known at compile time**: it is typed, faster and clearer. A string-path \`get\` is for **dynamic paths**: table column configs (\`accessor: 'user.address.city'\`), form libraries, i18n keys, or reading fields named in a JSON config.

**Typing note:** a fully typed version can infer the result type from a literal path with template literal types (\`Get<T, 'a.b'>\`), but that is a TypeScript follow-up, not the warm-up.

**Security note (for \`set\`):** a matching \`set(obj, path, value)\` must reject \`__proto__\`, \`constructor\` and \`prototype\` segments, or user-controlled paths enable prototype pollution.`,
          walkthrough: [
            {
              title: 'Restate and clarify',
              body: 'Read a nested value from a string path with dots and `[index]`, returning a fallback if any step is missing. Ask: should `null` also trigger the fallback, or only `undefined`? Should array paths be accepted?',
            },
            {
              title: 'Choose the approach',
              body: 'Two phases: **tokenise** the path into keys (regex `[n]` → `.n`, then split), then **walk** the keys with a cursor, stopping safely when the cursor becomes `null` or `undefined`.',
            },
            {
              title: 'Build it',
              body: `\`\`\`ts
function get<T = unknown>(obj: unknown, path: string, fallback?: T): T | undefined {
  const keys = path.replace(/\\[(\\w+)\\]/g, '.$1').split('.').filter(Boolean)
  let cur: unknown = obj
  for (const key of keys) {
    if (cur == null) return fallback
    cur = (cur as Record<string, unknown>)[key]
  }
  return cur === undefined ? fallback : (cur as T)
}
\`\`\``,
            },
            {
              title: 'Complexity and edge cases',
              body: '**O(path length)**. Do not use `cur || fallback`: `0`, `\'\'` and `false` are valid values. `cur == null` catches both nullish values. Keys containing dots need an array path. A sibling `set` must block `__proto__` to avoid prototype pollution.',
            },
            {
              title: 'Say it in the interview',
              body: '*"I split the path into keys, converting brackets to dots, then walk them and stop at the first nullish value. I only fall back on undefined, so zero and empty strings survive. For static paths I\'d just use optional chaining; this is for config-driven paths like table columns."*',
            },
          ],
          keyPoints: [
            'Tokenises dot and bracket syntax',
            'Stops on null/undefined without throwing',
            'Falls back only for undefined, not falsy',
            'Knows optional chaining is better for static paths',
          ],
          pitfalls: ['`return cur || fallback`, which swallows 0 and empty strings', 'Throwing on null in the middle of a path', 'Ignoring prototype pollution in the matching set()'],
          followUps: ['Write `set(obj, path, value)` that creates missing levels.', 'Type `get` so the return type is inferred from a literal path.'],
        },
      ],
    },
    {
      id: 'cs-complexity',
      title: 'Complexity & bit-level basics',
      summary: 'Analyse time and space precisely, and handle the bit tricks that appear in assessments.',
      questions: [
        {
          id: 'cs-big-o-analysis',
          title: 'Analysing time and space complexity',
          type: 'concept',
          difficulty: 'foundation',
          priority: 'must',
          tags: ['big-o', 'complexity', 'amortized', 'recursion'],
          estMinutes: 5,
          roles: ['general'],
          prompt: `Give the time and space complexity of this function and explain how you derived it. Then: **what does "amortised O(1)" mean for \`Array.prototype.push\`?**`,
          code: {
            language: 'typescript',
            source: `function pairsWithSum(nums: number[], target: number): number {
  const sorted = [...nums].sort((a, b) => a - b)
  let count = 0
  for (const n of sorted) {
    let lo = 0, hi = sorted.length - 1
    while (lo <= hi) {
      const mid = (lo + hi) >> 1
      if (sorted[mid] === target - n) { count++; break }
      if (sorted[mid] < target - n) lo = mid + 1
      else hi = mid - 1
    }
  }
  return count
}`,
          },
          intent:
            'Tests whether you can derive complexity from code instead of guessing from the number of loops. A strong answer goes block by block, counts space (the copy, the sort, the stack), and explains amortised cost with the doubling argument.',
          hints: [
            'Analyse each block separately (copy, sort, loop), then keep the dominant term.',
            'The inner while loop is not a full scan: what happens to the range lo..hi each iteration?',
            'Copy = O(n) time and space; sort = O(n log n); loop = n × O(log n). Now add them.',
            'For push: most pushes write into spare capacity; a resize copies everything but capacity doubles, so total copy work over n pushes is ≤ ~2n. Divide by n.',
          ],
          walkthrough: [
            {
              title: 'Restate what is being asked',
              body: 'Two answers are wanted: the **time** and the **space** of this function, with the derivation, plus a definition of **amortised O(1)**. Say up front you will go block by block and add the costs.',
            },
            {
              title: 'Cost each block',
              body: `- \`[...nums]\`: O(n) time, **O(n) space**.
- \`sort\`: O(n log n) time; TimSort may use O(n) extra space.
- \`for\` loop: n iterations × a binary search that halves the range each step = **O(n log n)**.`,
            },
            {
              title: 'Combine with the rules',
              body: `Sequential blocks **add**, nested blocks **multiply**: O(n) + O(n log n) + O(n log n) = **O(n log n) time, O(n) space**. Do not say O(n²) just because there are two loops: the inner one is logarithmic.`,
            },
            {
              title: 'Explain amortised O(1) push',
              body: 'A dynamic array keeps spare capacity. Most pushes are O(1); when full, it allocates a buffer about twice as large and copies (O(n)). Because capacity grows geometrically, the copies total about 2n over n pushes, so the **average per push is O(1)** even though one push can be O(n).',
            },
            {
              title: 'Say it in the interview',
              body: '*"Copy is linear, the sort dominates at n log n, and the loop is n binary searches, also n log n, so O(n log n) time and O(n) space. I could make it O(n) with a hash map, Two-Sum style."* Offering the improvement unprompted is the senior signal.',
            },
          ],
          answer: `**Time: O(n log n). Space: O(n).**

**Derivation, block by block:**
- \`[...nums]\` copies the array: O(n) time, **O(n) space**.
- \`sort\`: O(n log n) time. V8 uses TimSort, which also needs up to O(n) auxiliary space.
- The loop runs n times, and each iteration runs a binary search costing O(log n), so the loop is O(n log n).
- Total: O(n) + O(n log n) + O(n log n) = **O(n log n)**. Drop the constants and the lower-order terms.

**Rules to say out loud:**
- Sequential blocks add; nested blocks multiply.
- Halving the search space each step gives log n.
- Recursion: time ≈ (number of calls) × (work per call); space ≈ the maximum depth of the call stack. Naive Fibonacci is O(2ⁿ) time but only O(n) stack depth.
- With two inputs, keep both variables: O(n + m), not O(n).

**Amortised O(1) \`push\`:** a dynamic array has spare capacity. Most pushes write into free space in O(1). When it fills up, the engine allocates a larger buffer (with geometric growth) and copies everything, which is O(n). Because the capacity grows geometrically, the copies happen rarely: across n pushes the total copy work is bounded by roughly 2n, so **the average cost per push is O(1)**, even though a single push can be O(n).

**Note:** this function could be O(n) with a hash map (a Two Sum count), which is the natural follow-up.`,
          keyPoints: [
            'Analyse block by block and keep the dominant term',
            'Account for space used by copies, sorting and recursion',
            'Binary search is O(log n) because it halves the range',
            'Amortised means averaged over a sequence of operations',
          ],
          pitfalls: [
            'Forgetting the space used by sorting or by the call stack',
            'Calling it O(n²) because there are two loops, without checking what the inner loop does',
          ],
          followUps: ['How would you make this O(n)?', 'What is the complexity of `Array.prototype.shift`, and why?'],
        },
        {
          id: 'cs-bit-manipulation',
          title: 'Bit manipulation basics',
          type: 'multiple-choice',
          difficulty: 'foundation',
          priority: 'nice',
          tags: ['bit-manipulation', 'xor', 'math'],
          estMinutes: 3,
          roles: ['general'],
          prompt: `Every number in an array appears **twice except one**. Which approach finds the single number in O(n) time and **O(1) extra space**?`,
          choices: [
            {
              id: 'a',
              text: 'Sort, then scan adjacent pairs',
              correct: false,
              explanation: 'This takes O(n log n) time, and sorting needs extra space or mutates the input.',
            },
            {
              id: 'b',
              text: 'XOR all the numbers together: `nums.reduce((a, b) => a ^ b, 0)`',
              correct: true,
              explanation: 'x ^ x = 0 and x ^ 0 = x, and XOR is commutative, so every pair cancels and only the single number remains.',
            },
            {
              id: 'c',
              text: 'Count occurrences in a `Map` and return the key with count 1',
              correct: false,
              explanation: 'This is O(n) time but O(n) space.',
            },
            {
              id: 'd',
              text: 'Sum all values and subtract twice the sum of the unique values',
              correct: false,
              explanation: 'Finding the unique values needs a Set, which is O(n) space.',
            },
          ],
          intent:
            'Checks whether you know the XOR cancellation trick and can rule out options on the O(1)-space constraint, not just on time. Strong answers eliminate each wrong choice by naming the space or time it costs.',
          hints: [
            'Read the constraint twice: O(1) extra space rules out anything that stores the values.',
            'Which binary operator turns two equal numbers into 0?',
            'x ^ x = 0 and x ^ 0 = x, and XOR is commutative. What is left if you XOR every element?',
          ],
          answer: `**XOR everything.** Because \`x ^ x === 0\`, \`x ^ 0 === x\`, and XOR is commutative and associative, the pairs cancel in any order.

\`\`\`ts
const singleNumber = (nums: number[]) => nums.reduce((acc, n) => acc ^ n, 0)
\`\`\`

**Other bit tricks worth knowing:**
- \`n & 1\`: is n odd?
- \`n & (n - 1)\`: clears the lowest set bit, so \`n > 0 && (n & (n - 1)) === 0\` tests for a power of two.
- Counting set bits: repeat \`n &= n - 1\` until n is 0.
- \`1 << k\`: a mask for bit k; use \`flags | mask\` to set it, \`flags & ~mask\` to clear it and \`flags & mask\` to test it.

**JavaScript caveat:** bitwise operators convert their operands to **32-bit signed integers**, so they break for values above 2³¹ − 1. \`>>>\` is the unsigned right shift. For larger values, use \`BigInt\`.`,
          keyPoints: [
            'XOR cancels equal pairs',
            'n & (n - 1) clears the lowest set bit',
            'JavaScript bitwise operators work on 32-bit signed integers',
          ],
          pitfalls: ['Using bitwise operators on values above 2^31 in JavaScript'],
        },
      ],
    },
    {
      id: 'cs-data-structures',
      title: 'Core data structures',
      summary: 'Hash maps, stacks, linked lists, trees, heaps, tries and graphs: what each is good for and how they are used in problems.',
      questions: [
        {
          id: 'cs-hashmap-group-anagrams',
          title: 'Hash maps: group anagrams',
          type: 'coding',
          difficulty: 'foundation',
          priority: 'must',
          tags: ['hash-map', 'strings', 'grouping'],
          estMinutes: 15,
          roles: ['general'],
          prompt: `Given an array of lowercase words, **group the words that are anagrams of each other**. Order does not matter.

Example: \`["eat","tea","tan","ate","nat","bat"]\` → \`[["eat","tea","ate"],["tan","nat"],["bat"]]\``,
          intent:
            'The classic "group by a derived key" problem. The interviewer wants you to find a canonical key, use a Map correctly, and compare the sort-key and count-key trade-off with accurate complexity.',
          hints: [
            'Two words are anagrams when they contain the same letters. What single value would be identical for all of them?',
            'Use that value as the key in a `Map<string, string[]>` and push each word into its bucket.',
            'Simplest key: `[...word].sort().join(\'\')`. Faster key: an array of 26 counts joined with a separator.',
            'Skeleton: `for (const w of words) { const key = ___; const g = groups.get(key); g ? g.push(w) : groups.set(key, [w]) } return [...groups.values()]`',
          ],
          walkthrough: [
            {
              title: 'Restate and clarify',
              body: 'Group words that are anagrams; output order does not matter. Ask: only lowercase a–z? Can the list be empty? Are duplicates allowed (they just land in the same group)?',
            },
            {
              title: 'Pick a canonical key and a Map',
              body: 'All anagrams share the same **sorted letters** or the same **letter counts**. Use that as a key in a `Map<string, string[]>`: one pass, O(1) average lookup per word.',
            },
            {
              title: 'Build it',
              body: `\`\`\`ts
function groupAnagrams(words: string[]): string[][] {
  const groups = new Map<string, string[]>()
  for (const word of words) {
    const counts = new Array<number>(26).fill(0)
    for (const ch of word) counts[ch.charCodeAt(0) - 97]++
    const key = counts.join(',')
    const group = groups.get(key)
    if (group) group.push(word)
    else groups.set(key, [word])
  }
  return [...groups.values()]
}
\`\`\``,
            },
            {
              title: 'Complexity and edge cases',
              body: 'Count key: **O(n·k)** time and space (n words, max length k). Sort key: O(n·k log k), simpler to write. Use a separator in the count key, a `Map` not a plain object, and a `Map<string, number>` of counts for Unicode.',
            },
            {
              title: 'Say it in the interview',
              body: '*"Anagrams share a canonical form, so I group by it in a Map. I\'ll start with the sorted-letters key for clarity, then switch to a 26-count key to drop the log factor."*',
            },
          ],
          answer: `**Map each word to a canonical key, then group the words in a \`Map\`.**

\`\`\`ts
function groupAnagrams(words: string[]): string[][] {
  const groups = new Map<string, string[]>()
  for (const word of words) {
    const counts = new Array<number>(26).fill(0)
    for (const ch of word) counts[ch.charCodeAt(0) - 97]++
    const key = counts.join(',') // e.g. "1,0,0,0,1,..."
    const group = groups.get(key)
    if (group) group.push(word)
    else groups.set(key, [word])
  }
  return [...groups.values()]
}
\`\`\`

**Complexity:** with n words of maximum length k, this is **O(n·k)** time and O(n·k) space. A simpler key, \`[...word].sort().join('')\`, gives O(n·k log k), which is often fine and easier to write. State the trade-off.

**The general pattern:** *"group by some property"* or *"have I seen this before?"* points to a hash map or set, with O(1) average lookup. Variations include Two Sum (map each value to its index), first unique character (counts), and detecting duplicates (a Set).

**Points to mention in an interview:**
- Use a **\`Map\`** rather than a plain object for dynamic keys: no prototype keys, any key type, and \`size\` built in.
- Join the counts with a separator. Without one, counts such as \`1,11\` and \`11,1\` produce the same string.
- For Unicode input, count with a \`Map<string, number>\` instead of a fixed array of 26.`,
          keyPoints: [
            'Use a canonical key for each group',
            'Map has O(1) average lookup',
            'Compare the sort-based key with the count-based key',
            'Use a separator in the count key',
          ],
          pitfalls: ['Joining the counts without a separator', 'Using a plain object with arbitrary keys like "__proto__"'],
          followUps: ['How would you handle Unicode input?'],
        },
        {
          id: 'cs-monotonic-stack',
          title: 'Stacks: next warmer day (monotonic stack)',
          type: 'coding',
          difficulty: 'core',
          priority: 'must',
          tags: ['stack', 'monotonic-stack', 'queue', 'arrays'],
          estMinutes: 20,
          roles: ['general'],
          prompt: `Given daily temperatures, return an array where \`answer[i]\` is **how many days you must wait after day i for a warmer temperature** (0 if there is none).

Example: \`[73,74,75,71,69,72,76,73]\` → \`[1,1,4,2,1,1,0,0]\``,
          intent:
            'Tests whether you recognise the "next greater element" shape and reach the monotonic stack instead of the O(n²) scan. A strong answer explains why each index is pushed and popped once, so the total is O(n).',
          hints: [
            'Start with the brute force: scan forward from each day. Why is it O(n²), and what work does it repeat?',
            'Keep the days that are still waiting for a warmer day. Which of them can today resolve?',
            'Use a stack of **indices** whose temperatures decrease from bottom to top. A warmer day pops and resolves everything colder on top.',
            'Skeleton: `for (let i = 0; i < t.length; i++) { while (stack.length && t[i] > t[stack.at(-1)!]) { const j = stack.pop()!; ans[j] = ___ } stack.push(i) }`',
          ],
          walkthrough: [
            {
              title: 'Restate and clarify',
              body: 'For each day, how many days until a strictly warmer one; 0 if never. Confirm "warmer" means strictly greater and that the output has the same length as the input.',
            },
            {
              title: 'Choose the data structure',
              body: 'The brute force rescans the future for each day. Instead, keep the **unresolved** days on a stack. Their temperatures are decreasing (otherwise they would already be resolved), so a new warmer day resolves them from the top down.',
            },
            {
              title: 'Build it',
              body: `\`\`\`ts
function dailyTemperatures(temps: number[]): number[] {
  const answer = new Array<number>(temps.length).fill(0)
  const stack: number[] = [] // indices, temps decreasing
  for (let i = 0; i < temps.length; i++) {
    while (stack.length && temps[i] > temps[stack[stack.length - 1]]) {
      const j = stack.pop()!
      answer[j] = i - j
    }
    stack.push(i)
  }
  return answer
}
\`\`\``,
            },
            {
              title: 'Complexity and edge cases',
              body: '**O(n) time** amortised: each index is pushed once and popped at most once. O(n) space. Store **indices**, not values, so you can compute distances. Equal temperatures stay on the stack (strict `>`). Days left on the stack keep 0.',
            },
            {
              title: 'Say it in the interview',
              body: '*"Brute force is O(n²). The unresolved days form a decreasing stack, so a warmer day pops and answers them. Each index enters and leaves once, so it\'s linear."* Mention valid parentheses as the simpler stack cousin if asked.',
            },
          ],
          answer: `**Use a monotonic stack of indices still waiting for a warmer day.** Each index is pushed once and popped once, so the whole thing is **O(n)**.

\`\`\`ts
function dailyTemperatures(temps: number[]): number[] {
  const answer = new Array<number>(temps.length).fill(0)
  const stack: number[] = [] // indices; their temps are decreasing from bottom to top
  for (let i = 0; i < temps.length; i++) {
    while (stack.length && temps[i] > temps[stack[stack.length - 1]]) {
      const j = stack.pop()!
      answer[j] = i - j
    }
    stack.push(i)
  }
  return answer
}
\`\`\`

**Why it works:** while the stack's temperatures are decreasing, none of those days has seen a warmer day yet. A new warmer temperature resolves every smaller day on top of the stack.

**Complexity:** O(n) time (amortised, since each index is pushed and popped at most once) and O(n) space.

**Stack vs queue in interviews:**
- **Stack (LIFO):** matching brackets, undo, iterative DFS, expression evaluation, monotonic "next greater" problems.
- **Queue (FIFO):** BFS, task scheduling, sliding-window maximum (with a deque).
- In JavaScript, \`push\` and \`pop\` are O(1), but **\`shift\` is O(n)**. For a real queue, use a head index or a linked list.

Valid parentheses is the warm-up version: push opening brackets, and on a closing bracket check that the top of the stack matches.`,
          keyPoints: [
            'The stack holds unresolved indices',
            'Each element is pushed and popped once, giving amortised O(n)',
            'Store indices, not values, so you can compute distances',
            'Array.shift is O(n) in JavaScript',
          ],
          pitfalls: ['Storing values instead of indices', 'Using shift() as a queue in a hot loop'],
          followUps: ['How would you find the next greater element in a circular array?'],
        },
        {
          id: 'cs-linked-list-reverse-cycle',
          title: 'Linked lists: reverse and detect a cycle',
          type: 'coding',
          difficulty: 'core',
          priority: 'should',
          tags: ['linked-list', 'two-pointers', 'fast-slow-pointers'],
          estMinutes: 15,
          roles: ['general'],
          prompt: `Using \`type ListNode = { val: number; next: ListNode | null }\`:
1. **Reverse a singly linked list** in place.
2. **Detect whether a list has a cycle**, using O(1) extra space.`,
          intent:
            'Tests careful pointer manipulation and the fast/slow pointer trick. A strong answer saves `next` before re-pointing, returns the new head, and detects a cycle in O(1) space while guarding against null.',
          hints: [
            'Reversal: you walk the list once and flip each arrow. What do you lose the moment you overwrite `curr.next`?',
            'Keep three references: `prev`, `curr` and a saved `next`. Return `prev` at the end.',
            'Cycle: two pointers, one moving 1 step and one moving 2. If there is a loop, can the fast one avoid the slow one forever?',
            'Skeleton: `while (curr) { const next = curr.next; curr.next = ___; prev = ___; curr = ___ }` and `while (fast && fast.next) { slow = slow.next; fast = fast.next.next; if (slow === fast) return true }`',
          ],
          walkthrough: [
            {
              title: 'Restate and clarify',
              body: 'Two tasks on a singly linked list: reverse it in place, and detect a cycle with O(1) extra space. Ask about the empty list and single-node list; both should just work.',
            },
            {
              title: 'Pick the technique',
              body: 'Reversal: iterate and **re-point each `next` backwards**, carrying `prev`. Cycle: **Floyd\'s fast/slow pointers**; a `Set` of visited nodes works too but is O(n) space, which the prompt forbids.',
            },
            {
              title: 'Build it',
              body: `\`\`\`ts
function reverse(head: ListNode | null): ListNode | null {
  let prev: ListNode | null = null
  let curr = head
  while (curr) {
    const next = curr.next
    curr.next = prev
    prev = curr
    curr = next
  }
  return prev
}

function hasCycle(head: ListNode | null): boolean {
  let slow = head, fast = head
  while (fast && fast.next) {
    slow = slow!.next
    fast = fast.next.next
    if (slow === fast) return true
  }
  return false
}
\`\`\``,
            },
            {
              title: 'Complexity and edge cases',
              body: 'Both are **O(n) time, O(1) space**. Check `fast && fast.next` before `fast.next.next`. Inside a cycle, fast gains one step per iteration, so it must meet slow. A dummy head simplifies insert/delete variants.',
            },
            {
              title: 'Say it in the interview',
              body: '*"I save next, flip the pointer, and advance; prev ends up as the new head. For the cycle I use fast and slow pointers: fast closes the gap by one each step, so they meet if and only if there is a loop."*',
            },
          ],
          answer: `**1. Reverse by re-pointing each \`next\` backwards: O(n) time, O(1) space.**

\`\`\`ts
type ListNode = { val: number; next: ListNode | null }

function reverse(head: ListNode | null): ListNode | null {
  let prev: ListNode | null = null
  let curr = head
  while (curr) {
    const next = curr.next // save before overwriting
    curr.next = prev
    prev = curr
    curr = next
  }
  return prev // new head
}
\`\`\`

**2. Use Floyd's fast/slow pointers: O(n) time, O(1) space.**

\`\`\`ts
function hasCycle(head: ListNode | null): boolean {
  let slow = head
  let fast = head
  while (fast && fast.next) {
    slow = slow!.next
    fast = fast.next.next
    if (slow === fast) return true
  }
  return false
}
\`\`\`

If there is a cycle, the fast pointer gains one step per iteration and must eventually land on the slow one; if not, it reaches \`null\`. A \`Set\` of visited nodes also works, but uses O(n) space.

**Why linked lists still come up:** they test pointer manipulation and edge cases (an empty list, one node, the head changing). Use a **dummy head node** to avoid special-casing the head when inserting or deleting. Related patterns: finding the middle (fast/slow), merging two sorted lists, removing the n-th node from the end (two pointers n apart). In real JavaScript code you rarely build linked lists, but an LRU cache uses a doubly linked list together with a Map.`,
          keyPoints: [
            'Save next before re-pointing',
            'Return prev as the new head',
            'Fast/slow pointers detect a cycle in O(1) space',
            'A dummy head simplifies edge cases',
          ],
          pitfalls: ['Losing the rest of the list by overwriting next first', 'Not checking fast.next before fast.next.next'],
          followUps: ['How would you find the node where the cycle starts?', 'Design an LRU cache.'],
        },
        {
          id: 'cs-validate-bst',
          title: 'Trees: the validate-BST bug',
          type: 'debugging',
          difficulty: 'core',
          priority: 'must',
          tags: ['trees', 'bst', 'recursion', 'dfs'],
          estMinutes: 15,
          roles: ['general'],
          prompt: `This function is supposed to check whether a binary tree is a valid **binary search tree**. It passes simple tests but is wrong. **Find a counter-example and fix it.**`,
          code: {
            language: 'typescript',
            source: `type TreeNode = { val: number; left: TreeNode | null; right: TreeNode | null }

function isValidBST(node: TreeNode | null): boolean {
  if (!node) return true
  if (node.left && node.left.val >= node.val) return false
  if (node.right && node.right.val <= node.val) return false
  return isValidBST(node.left) && isValidBST(node.right)
}`,
          },
          intent:
            'Tests whether you know the BST invariant is about whole subtrees, and whether you can produce a counter-example before fixing. A strong answer draws the failing tree, then passes (min, max) bounds down the recursion.',
          hints: [
            'The BST rule is about every node in a subtree, not just the direct children. Which check is missing?',
            'Try a root of 5 whose right child is 7, where 7 has a left child of 3. What does the function return?',
            'Each node must lie inside an allowed range inherited from its ancestors. Going left tightens the max; going right tightens the min.',
            'Skeleton: `function isValidBST(node, min = -Infinity, max = Infinity) { if (!node) return true; if (node.val <= min || node.val >= max) return false; return isValidBST(node.left, ___, ___) && isValidBST(node.right, ___, ___) }`',
          ],
          walkthrough: [
            {
              title: 'Restate and find the bug',
              body: 'The function only compares a node with its **direct children**. The BST property says **every** value in the left subtree is smaller and every value in the right subtree is larger.',
            },
            {
              title: 'Show a counter-example',
              body: `\`\`\`text
    5
     \\
      7
     /
    3   <- valid relative to 7, but 3 < 5 in 5's right subtree
\`\`\`
Every parent–child pair passes, so the buggy code returns \`true\`.`,
            },
            {
              title: 'Fix it with bounds',
              body: `\`\`\`ts
function isValidBST(node: TreeNode | null, min = -Infinity, max = Infinity): boolean {
  if (!node) return true
  if (node.val <= min || node.val >= max) return false
  return isValidBST(node.left, min, node.val) && isValidBST(node.right, node.val, max)
}
\`\`\`
Alternative: an in-order traversal must be strictly increasing.`,
            },
            {
              title: 'Complexity and edge cases',
              body: '**O(n) time, O(h) space** for the recursion stack (log n balanced, n skewed). Use `<=`/`>=` to reject duplicates unless the spec allows them. Very deep trees can overflow the JS stack; switch to an explicit stack.',
            },
            {
              title: 'Say it in the interview',
              body: '*"It checks only local pairs. Here\'s a tree where 3 sits in 5\'s right subtree and passes. The fix is to carry the valid range down: left children narrow the max, right children narrow the min."*',
            },
          ],
          answer: `**Bug: it only compares each node with its direct children.** The BST property says that **every** node in the left subtree is less than the node, and every node in the right subtree is greater.

**Counter-example:**
\`\`\`text
    5
     \\
      7
     /
    3      <- 3 < 5, but it sits in 5's right subtree
\`\`\`
Each parent–child pair looks valid, so the function returns \`true\`, but the tree is not a BST.

**Fix: pass the valid range down the tree.**

\`\`\`ts
function isValidBST(
  node: TreeNode | null,
  min = -Infinity,
  max = Infinity,
): boolean {
  if (!node) return true
  if (node.val <= min || node.val >= max) return false
  return isValidBST(node.left, min, node.val) && isValidBST(node.right, node.val, max)
}
\`\`\`

**Alternative:** an in-order traversal of a BST yields strictly increasing values, so you can track the previous value and check that each value is larger.

**Complexity:** O(n) time, and O(h) space for the recursion stack, where h is the tree height (O(log n) when balanced, O(n) when skewed).

**Tree points to mention:** pre-, in- and post-order traversal (DFS) versus level-order (BFS with a queue); a BST search is O(h), so balancing (AVL, red-black) is what guarantees O(log n); and recursion depth on very deep trees can overflow the stack in JavaScript, in which case convert to iteration.`,
          keyPoints: [
            'The BST property applies to whole subtrees',
            'Pass (min, max) bounds down the recursion',
            'In-order traversal of a BST is sorted',
            'Space is O(h), the height of the tree',
          ],
          pitfalls: ['Comparing only direct children', 'Allowing duplicates by using < instead of <='],
          followUps: ['Find the k-th smallest element in a BST.', 'What is the lowest common ancestor in a BST?'],
        },
        {
          id: 'cs-heap-top-k',
          title: 'Heaps: top k frequent elements',
          type: 'coding',
          difficulty: 'core',
          priority: 'should',
          tags: ['heap', 'priority-queue', 'hash-map', 'bucket-sort'],
          estMinutes: 25,
          roles: ['general'],
          prompt: `Return the **k most frequent elements** of an integer array. JavaScript has no built-in heap, so explain what you would do in an interview.`,
          intent:
            'Tests "count, then select top k" and whether you can talk honestly about JavaScript having no heap. A strong answer offers sort (simple), a size-k min-heap (O(n log k)) and bucket sort (O(n)), and lets the interviewer choose.',
          hints: [
            'Step one is always the same: count frequencies with a `Map<number, number>`.',
            'The easy version sorts the map entries by count descending and takes k. What does that cost?',
            'A **min**-heap capped at size k keeps the k most frequent: push each entry, pop when size exceeds k.',
            'O(n) option: `buckets[f]` = values with frequency f (f ≤ n). Walk `for (let f = n; f > 0 && out.length < k; f--) out.push(...(buckets[f] ?? []))`.',
          ],
          walkthrough: [
            {
              title: 'Restate and clarify',
              body: 'Return the k values that occur most often. Ask: is the answer unique (ties)? Does output order matter? Is k ≤ number of distinct values?',
            },
            {
              title: 'Count, then choose a selection strategy',
              body: `Count with a \`Map\`. Then pick one of:
- **Sort entries** by count: O(m log m), simplest.
- **Min-heap of size k**: O(m log k), best when k ≪ m.
- **Buckets by frequency**: O(n), since a frequency is at most n.`,
            },
            {
              title: 'Build the bucket version (shortest to write)',
              body: `\`\`\`ts
function topKFrequent(nums: number[], k: number): number[] {
  const freq = new Map<number, number>()
  for (const n of nums) freq.set(n, (freq.get(n) ?? 0) + 1)
  const buckets: number[][] = Array.from({ length: nums.length + 1 }, () => [])
  for (const [val, f] of freq) buckets[f].push(val)
  const out: number[] = []
  for (let f = nums.length; f > 0 && out.length < k; f--) out.push(...buckets[f])
  return out.slice(0, k)
}
\`\`\`
If they want the heap, write the small \`MinHeap\` from the answer.`,
            },
            {
              title: 'Complexity and edge cases',
              body: 'Buckets: O(n) time and space. Heap: O(n log k) time, O(m + k) space. Use a **min**-heap (evict the least frequent), not a max-heap of everything. Watch parent/child index arithmetic: `(i - 1) >> 1`, `2i + 1`, `2i + 2`.',
            },
            {
              title: 'Say it in the interview',
              body: '*"JavaScript has no priority queue, so I can sort entries in m log m, write a small heap for m log k, or bucket by frequency for linear time. Which would you like?"* Asking is a strength here.',
            },
          ],
          answer: `**Count with a \`Map\`, then keep a min-heap of size k, keyed by frequency.** This is O(n log k). There is also an **O(n) bucket approach**.

\`\`\`ts
class MinHeap<T> {
  private items: T[] = []
  constructor(private score: (item: T) => number) {}
  get size() { return this.items.length }
  peek() { return this.items[0] }
  push(item: T) {
    this.items.push(item)
    let i = this.items.length - 1
    while (i > 0) {
      const p = (i - 1) >> 1
      if (this.score(this.items[p]) <= this.score(this.items[i])) break
      ;[this.items[p], this.items[i]] = [this.items[i], this.items[p]]
      i = p
    }
  }
  pop(): T | undefined {
    const top = this.items[0]
    const last = this.items.pop()
    if (this.items.length && last !== undefined) {
      this.items[0] = last
      let i = 0
      for (;;) {
        const l = 2 * i + 1, r = l + 1
        let m = i
        if (l < this.items.length && this.score(this.items[l]) < this.score(this.items[m])) m = l
        if (r < this.items.length && this.score(this.items[r]) < this.score(this.items[m])) m = r
        if (m === i) break
        ;[this.items[m], this.items[i]] = [this.items[i], this.items[m]]
        i = m
      }
    }
    return top
  }
}

function topKFrequent(nums: number[], k: number): number[] {
  const freq = new Map<number, number>()
  for (const n of nums) freq.set(n, (freq.get(n) ?? 0) + 1)
  const heap = new MinHeap<[number, number]>(([, f]) => f)
  for (const entry of freq) {
    heap.push(entry)
    if (heap.size > k) heap.pop() // evict the least frequent
  }
  const result: number[] = []
  while (heap.size) result.push(heap.pop()![0])
  return result
}
\`\`\`

**Bucket alternative, O(n):** create \`buckets[f]\` holding the values with frequency f (f ≤ n), then walk from the highest frequency down until you have collected k values.

**What to say in an interview:** *"JavaScript has no priority queue, so I'll write a small binary heap, or sort the entries in O(m log m) if you're happy with that."* Asking which they prefer is a good move. A heap gives O(log n) push and pop and O(1) peek; use it for "top k", "k-th largest", merging k sorted lists, scheduling, and Dijkstra.`,
          keyPoints: [
            'Count frequencies first',
            'A min-heap of size k keeps the top k in O(n log k)',
            'Bucket sort gives O(n) because frequencies are bounded by n',
            'Offer the simpler sort-based solution as an option',
          ],
          pitfalls: ['Using a max-heap of all n elements when only k are needed', 'Wrong child index arithmetic'],
          followUps: ['How would you find the median of a stream?'],
        },
        {
          id: 'cs-trie-autocomplete',
          title: 'Tries: prefix autocomplete',
          type: 'coding',
          difficulty: 'advanced',
          priority: 'nice',
          tags: ['trie', 'strings', 'prefix', 'dfs'],
          estMinutes: 25,
          roles: ['general', 'frontend'],
          prompt: `Implement a **Trie** with \`insert(word)\` and \`suggest(prefix, limit)\`, which returns up to \`limit\` stored words starting with \`prefix\`. When would you use a trie instead of filtering an array?`,
          intent:
            'Tests whether you can build a small tree structure from scratch and, just as important, judge when it is overkill. A strong answer implements insert and prefix-DFS cleanly and then argues for a simple filter or a backend index in most UIs.',
          hints: [
            'What does each node need? A way to reach children by character, and a flag for "a word ends here".',
            'Use `class TrieNode { children = new Map<string, TrieNode>(); isWord = false }`.',
            '`suggest` has two phases: walk down the prefix (return [] if a char is missing), then DFS from that node collecting words until you hit `limit`.',
            'Skeleton: `const dfs = (n: TrieNode, path: string) => { if (out.length >= limit) return; if (n.isWord) out.push(path); for (const [ch, child] of n.children) dfs(child, ___) }`',
          ],
          walkthrough: [
            {
              title: 'Restate and clarify',
              body: 'Two operations: `insert(word)` and `suggest(prefix, limit)`. Ask about case sensitivity, ordering of suggestions, and dataset size, because size decides whether a trie is worth it.',
            },
            {
              title: 'Design the node',
              body: 'Each node holds `children: Map<string, TrieNode>` and `isWord: boolean`. Words that share a prefix share a path, so reaching a prefix costs O(P) regardless of how many words exist.',
            },
            {
              title: 'Build it',
              body: `\`\`\`ts
insert(word: string) {
  let node = this.root
  for (const ch of word) {
    let next = node.children.get(ch)
    if (!next) node.children.set(ch, (next = new TrieNode()))
    node = next
  }
  node.isWord = true
}

suggest(prefix: string, limit = 10): string[] {
  let node = this.root
  for (const ch of prefix) {
    const next = node.children.get(ch)
    if (!next) return []
    node = next
  }
  const out: string[] = []
  const dfs = (n: TrieNode, path: string) => {
    if (out.length >= limit) return
    if (n.isWord) out.push(path)
    for (const [ch, child] of n.children) dfs(child, path + ch)
  }
  dfs(node, prefix)
  return out
}
\`\`\``,
            },
            {
              title: 'Complexity and edge cases',
              body: 'Insert O(L); suggest O(P + visited nodes), capped by `limit`. Memory is high (a Map per node). Do not forget `isWord`, or "car" disappears when "cart" exists. The prefix itself can be a word.',
            },
            {
              title: 'Say it in the interview',
              body: '*"For a few thousand words I\'d just filter with startsWith and debounce; a trie pays off for big dictionaries and many queries. In production I\'d serve autocomplete from a search index."* The judgement is what earns the points.',
            },
          ],
          answer: `**A trie stores strings character by character, so finding the prefix takes O(length of the prefix) no matter how many words are stored.**

\`\`\`ts
class TrieNode {
  children = new Map<string, TrieNode>()
  isWord = false
}

class Trie {
  private root = new TrieNode()

  insert(word: string): void {
    let node = this.root
    for (const ch of word) {
      let next = node.children.get(ch)
      if (!next) node.children.set(ch, (next = new TrieNode()))
      node = next
    }
    node.isWord = true
  }

  suggest(prefix: string, limit = 10): string[] {
    let node = this.root
    for (const ch of prefix) {
      const next = node.children.get(ch)
      if (!next) return []
      node = next
    }
    const out: string[] = []
    const dfs = (n: TrieNode, path: string) => {
      if (out.length >= limit) return
      if (n.isWord) out.push(path)
      for (const [ch, child] of n.children) dfs(child, path + ch)
    }
    dfs(node, prefix)
    return out
  }
}
\`\`\`

**Complexity:** \`insert\` is O(L). \`suggest\` is O(P) to reach the prefix plus the size of the subtree visited (capped by \`limit\`). Memory can be high, since each node holds a Map.

**Trie or array filter?**
- For a few thousand words, \`words.filter(w => w.startsWith(q))\` is O(n·P) per keystroke and usually fast enough; it is simpler and the right choice for most UIs.
- A trie pays off with large dictionaries, many queries, or extra needs such as word games, IP routing (longest-prefix match) or spell checking.
- In production, autocomplete is usually served from the **backend** (a search index), with debouncing and caching on the client.`,
          keyPoints: [
            'Each node holds a map of children and an end-of-word flag',
            'Prefix lookup is O(P), independent of n',
            'Collect suggestions with a DFS from the prefix node',
            'Weigh it against a simple filter for small data',
          ],
          pitfalls: ['Forgetting the isWord flag, so "car" is not found when "cart" exists'],
          followUps: ['How would you rank suggestions by popularity?'],
        },
      ],
    },
    {
      id: 'cs-patterns',
      title: 'Algorithmic patterns',
      summary: 'Sliding window, prefix sums, BFS/DFS, binary search, backtracking, greedy and dynamic programming.',
      questions: [
        {
          id: 'cs-sliding-window-longest-unique',
          title: 'Sliding window: longest substring without repeats',
          type: 'coding',
          difficulty: 'core',
          priority: 'must',
          tags: ['sliding-window', 'two-pointers', 'strings', 'hash-map'],
          estMinutes: 20,
          roles: ['general'],
          prompt: `Return the **length of the longest substring without repeating characters**.

Example: \`"abcabcbb"\` → 3 (\`"abc"\`), \`"pwwkew"\` → 3 (\`"wke"\`).`,
          intent:
            'The canonical sliding-window problem. The interviewer checks that you keep a valid window with two pointers, update it in O(1) per character, and handle the "abba" case where the left pointer must never move backwards.',
          hints: [
            'The answer is a contiguous range. Can you grow a window to the right and shrink it from the left?',
            'Track the last index where each character was seen in a `Map<string, number>`.',
            'On a repeat, jump `left` to just past the previous occurrence, but only if that occurrence is inside the window.',
            'Skeleton: `for (let r = 0; r < s.length; r++) { const p = last.get(s[r]); if (p !== undefined && p >= left) left = ___; last.set(s[r], r); best = Math.max(best, ___) }`',
          ],
          walkthrough: [
            {
              title: 'Restate and clarify',
              body: 'Return the **length** of the longest substring (contiguous) with no repeated characters. Clarify: empty string → 0; character set (ASCII or Unicode); case-sensitive.',
            },
            {
              title: 'Choose the pattern',
              body: '"Longest contiguous range with a property that only gets worse as it grows" means **sliding window**. Keep `[left, right]` duplicate-free and a `Map` from character to last index, so you can jump `left` in O(1).',
            },
            {
              title: 'Build it',
              body: `\`\`\`ts
function lengthOfLongestSubstring(s: string): number {
  const lastSeen = new Map<string, number>()
  let left = 0, best = 0
  for (let right = 0; right < s.length; right++) {
    const prev = lastSeen.get(s[right])
    if (prev !== undefined && prev >= left) left = prev + 1
    lastSeen.set(s[right], right)
    best = Math.max(best, right - left + 1)
  }
  return best
}
\`\`\``,
            },
            {
              title: 'Complexity and edge cases',
              body: '**O(n) time**, O(min(n, alphabet)) space. The `prev >= left` guard matters: in `"abba"`, the second `a` was last seen at 0, which is already outside the window; without the guard `left` jumps back. Rebuilding a Set per window is O(n²).',
            },
            {
              title: 'Say it in the interview',
              body: '*"I keep a window with no duplicates and remember where each char was last seen. On a repeat inside the window I move left past it. Each index moves at most twice, so it\'s linear."* Then mention that sliding windows need a monotonic property.',
            },
          ],
          answer: `**Use a variable-size sliding window with a map from each character to its last index: O(n).**

\`\`\`ts
function lengthOfLongestSubstring(s: string): number {
  const lastSeen = new Map<string, number>()
  let left = 0
  let best = 0
  for (let right = 0; right < s.length; right++) {
    const ch = s[right]
    const prev = lastSeen.get(ch)
    if (prev !== undefined && prev >= left) left = prev + 1 // shrink past the duplicate
    lastSeen.set(ch, right)
    best = Math.max(best, right - left + 1)
  }
  return best
}
\`\`\`

**Why \`prev >= left\`:** a character seen *before* the current window is not a duplicate inside it. Without the check, \`left\` can jump backwards (try \`"abba"\`).

**Complexity:** O(n) time, because each index enters and leaves the window at most once, and O(min(n, alphabet size)) space.

**When to use each two-pointer variant:**
- **Sliding window:** "longest or shortest *contiguous* subarray or substring with property X", where the property is **monotonic**: extending the window can only make it worse (more repeats, a larger sum of positive numbers).
- **Opposite-end two pointers:** a sorted array where you look for a pair (Two Sum II, container with most water) or a palindrome check.
- **Fast/slow pointers:** cycles, middle of a list, removing duplicates in place.

If the property is not monotonic (for example, a sum with negative numbers), the sliding window breaks; switch to prefix sums.`,
          keyPoints: [
            'Variable window with left and right pointers',
            'Map from character to last index',
            'Guard so the left pointer never moves backwards',
            'O(n) because each index moves at most twice',
            'Sliding window needs a monotonic property',
          ],
          pitfalls: ['Missing the prev >= left check ("abba")', 'Rebuilding a Set for each window, which is O(n²)'],
          followUps: ['What if at most k distinct characters are allowed?'],
        },
        {
          id: 'cs-prefix-sum-subarray-k',
          title: 'Prefix sums: count subarrays summing to k',
          type: 'coding',
          difficulty: 'advanced',
          priority: 'should',
          tags: ['prefix-sum', 'hash-map', 'arrays'],
          estMinutes: 25,
          roles: ['general'],
          prompt: `Given an integer array (which **may contain negatives**) and an integer \`k\`, return **how many contiguous subarrays sum to k**. Why does a sliding window fail here?`,
          intent:
            'Tests the prefix-sum + hash-map pattern and whether you understand why a sliding window breaks with negatives. A strong answer derives `prefix[i] = prefix[j] - k`, seeds the map with {0: 1}, and orders lookup before insert.',
          hints: [
            'Try a sliding window on `[1, -1, 1]`, k = 1. Why can you not decide when to shrink?',
            'Write any subarray sum as a difference: sum(i..j) = prefix[j + 1] − prefix[i].',
            'At each position you need **how many earlier prefixes equal `prefix − k`**. Count prefixes in a Map seeded with `{0: 1}`.',
            'Skeleton: `for (const n of nums) { prefix += n; count += seen.get(___) ?? 0; seen.set(prefix, (seen.get(prefix) ?? 0) + 1) }`',
          ],
          walkthrough: [
            {
              title: 'Restate and clarify',
              body: 'Count **contiguous** subarrays whose sum is exactly k; values can be negative. Confirm it is a count, not the subarrays themselves.',
            },
            {
              title: 'Rule out the window, pick prefix sums',
              body: 'With negatives, extending a window can lower the sum, so there is no monotonic shrink rule. Instead, a subarray `(i..j]` sums to k exactly when `prefix[j] − prefix[i] = k`, so count earlier prefixes equal to `prefix[j] − k` in a Map.',
            },
            {
              title: 'Build it',
              body: `\`\`\`ts
function subarraySum(nums: number[], k: number): number {
  const seen = new Map<number, number>([[0, 1]])
  let prefix = 0, count = 0
  for (const n of nums) {
    prefix += n
    count += seen.get(prefix - k) ?? 0
    seen.set(prefix, (seen.get(prefix) ?? 0) + 1)
  }
  return count
}
\`\`\``,
            },
            {
              title: 'Complexity and edge cases',
              body: '**O(n) time, O(n) space.** The `{0: 1}` seed counts subarrays starting at index 0. Look up **before** inserting the current prefix, or k = 0 counts empty subarrays.',
            },
            {
              title: 'Say it in the interview',
              body: '*"Negatives kill the sliding window. A subarray sum is a difference of two prefix sums, so at each step I ask how many earlier prefixes equal prefix minus k, and keep counts in a map."*',
            },
          ],
          answer: `**Use a running prefix sum and a hash map counting how often each prefix sum has occurred: O(n).**

\`\`\`ts
function subarraySum(nums: number[], k: number): number {
  const seen = new Map<number, number>([[0, 1]]) // the empty prefix
  let prefix = 0
  let count = 0
  for (const n of nums) {
    prefix += n
    count += seen.get(prefix - k) ?? 0 // earlier prefixes that make the sum k
    seen.set(prefix, (seen.get(prefix) ?? 0) + 1)
  }
  return count
}
\`\`\`

**Why it works:** a subarray \`(i..j]\` sums to k exactly when \`prefix[j] - prefix[i] = k\`, that is, when \`prefix[i] = prefix[j] - k\`. Counting the earlier prefixes with that value counts every subarray ending at j.

**Why \`{0: 1}\`:** it accounts for subarrays that start at index 0.

**Why a sliding window fails:** with negative numbers, growing the window can *decrease* the sum, so there is no rule for when to shrink it. The monotonicity the window relies on is gone.

**Complexity:** O(n) time, O(n) space.

**The general prefix-sum pattern:**
- Range sum queries in O(1) after O(n) preprocessing: \`sum(l, r) = P[r + 1] - P[l]\`.
- 2-D prefix sums for rectangle sums in a matrix.
- Similar tricks: "subarray sum divisible by k" (store \`prefix % k\`), "longest subarray with equal 0s and 1s" (map 0 to -1 and store the first index of each prefix).`,
          keyPoints: [
            'A subarray sum is a difference of two prefix sums',
            'Map from prefix sum to count, seeded with {0: 1}',
            'O(n) time, single pass',
            'A sliding window fails without monotonicity',
          ],
          pitfalls: ['Forgetting the {0: 1} seed', 'Inserting the current prefix before looking it up (wrong when k = 0)'],
          followUps: ['Return the longest such subarray instead of the count.'],
        },
        {
          id: 'cs-graph-bfs-dfs-grid',
          title: 'Graphs: islands and shortest path in a grid',
          type: 'coding',
          difficulty: 'core',
          priority: 'must',
          tags: ['graphs', 'bfs', 'dfs', 'grid', 'shortest-path'],
          estMinutes: 25,
          roles: ['general'],
          prompt: `Given a grid of \`'1'\` (land) and \`'0'\` (water):
1. **Count the islands** (connected horizontally or vertically).
2. Then: **what changes if I ask for the shortest path** from the top-left to the bottom-right through land?`,
          intent:
            'Tests modelling a grid as an implicit graph and choosing the right traversal: flood-fill for connectivity, BFS for shortest path. A strong answer tracks visited cells correctly, bounds-checks neighbours, and explains why DFS cannot give shortest paths.',
          hints: [
            'Treat each cell as a node with edges to its four neighbours. What does "an island" mean in graph terms?',
            'Scan every cell; each time you hit unvisited land, count one island and flood-fill all land reachable from it.',
            'Use an explicit stack (or queue) and a `seen` grid. For shortest path, switch to BFS and mark visited when you **enqueue**.',
            'Skeleton: `for (const [dr, dc] of DIRS) { const nr = r + dr, nc = c + dc; if (inBounds && grid[nr][nc] === \'1\' && !seen[nr][nc]) { seen[nr][nc] = true; stack.push([nr, nc]) } }`',
          ],
          walkthrough: [
            {
              title: 'Restate and clarify',
              body: 'Count groups of `\'1\'` cells connected up/down/left/right (no diagonals). Ask whether you may mutate the grid and how large it can be (recursion depth).',
            },
            {
              title: 'Model it as a graph',
              body: 'Cells are nodes; edges go to the 4 neighbours. An island is a **connected component**, so: for each unvisited land cell, increment the count and flood-fill (DFS or BFS) to mark the whole component.',
            },
            {
              title: 'Build it',
              body: `\`\`\`ts
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]] as const
function numIslands(grid: string[][]): number {
  const rows = grid.length, cols = grid[0]?.length ?? 0
  const seen = Array.from({ length: rows }, () => new Array<boolean>(cols).fill(false))
  let islands = 0
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    if (grid[r][c] !== '1' || seen[r][c]) continue
    islands++
    const stack: [number, number][] = [[r, c]]
    seen[r][c] = true
    while (stack.length) {
      const [cr, cc] = stack.pop()!
      for (const [dr, dc] of DIRS) {
        const nr = cr + dr, nc = cc + dc
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === '1' && !seen[nr][nc]) {
          seen[nr][nc] = true
          stack.push([nr, nc])
        }
      }
    }
  }
  return islands
}
\`\`\``,
            },
            {
              title: 'Complexity, edge cases and the shortest-path twist',
              body: '**O(rows × cols)** time and space. Empty grid → 0. For the shortest path, use **BFS** with a queue and a head index (not `shift()`), storing distance; the first time you reach the target is shortest. DFS does not guarantee that. Weighted cells → Dijkstra.',
            },
            {
              title: 'Say it in the interview',
              body: '*"The grid is an implicit graph; islands are connected components, so I flood-fill each new land cell iteratively to avoid stack overflow. For shortest path I switch to BFS because it explores by distance."*',
            },
          ],
          answer: `**1. Count islands: flood-fill each new land cell with DFS or BFS. O(rows × cols).**

\`\`\`ts
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]] as const

function numIslands(grid: string[][]): number {
  const rows = grid.length, cols = grid[0]?.length ?? 0
  const seen = Array.from({ length: rows }, () => new Array<boolean>(cols).fill(false))
  let islands = 0
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== '1' || seen[r][c]) continue
      islands++
      const stack: [number, number][] = [[r, c]] // iterative DFS: no recursion limit
      seen[r][c] = true
      while (stack.length) {
        const [cr, cc] = stack.pop()!
        for (const [dr, dc] of DIRS) {
          const nr = cr + dr, nc = cc + dc
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === '1' && !seen[nr][nc]) {
            seen[nr][nc] = true
            stack.push([nr, nc])
          }
        }
      }
    }
  }
  return islands
}
\`\`\`

**2. Shortest path: switch to BFS.** BFS explores in order of distance, so the first time it reaches the target is via a shortest path (in an unweighted graph). Use a queue of \`[r, c, dist]\` with a **head index** rather than \`shift()\`, and mark cells as visited **when you enqueue them**, not when you dequeue them, to avoid duplicates. DFS does *not* find shortest paths.

**Choosing a traversal:**
- **DFS:** connectivity, cycle detection, topological sort, exhaustive search (backtracking).
- **BFS:** shortest path in unweighted graphs, levels, the "minimum number of steps".
- **Dijkstra** (BFS with a heap) for weighted edges; **topological sort** (Kahn's algorithm) for dependency ordering, such as build steps or a job DAG.

**Graph representation:** an adjacency list (\`Map<node, node[]>\`) costs O(V + E) space and suits sparse graphs; an adjacency matrix costs O(V²) and gives O(1) edge lookup.`,
          keyPoints: [
            'A grid is an implicit graph with four neighbours per cell',
            'Use a visited set, or mutate the grid if allowed',
            'BFS gives shortest paths in unweighted graphs; DFS does not',
            'Iterative DFS avoids stack overflow',
            'O(V + E), here O(rows × cols)',
          ],
          pitfalls: [
            'Marking visited on dequeue in BFS, which adds duplicates',
            'Using DFS for shortest paths',
            'Recursive DFS overflowing on large grids',
          ],
          followUps: ['What if moving through some cells costs more?', 'How would you order jobs that have dependencies?'],
          personalAngle:
            'Topological ordering is a natural bridge to your work: scheduled scraping jobs with dependencies form a DAG, and recovery jobs need to know which steps can safely be re-run.',
        },
        {
          id: 'cs-sorting-binary-search',
          title: 'Sorting and binary search trade-offs',
          type: 'tradeoff',
          difficulty: 'core',
          priority: 'should',
          tags: ['sorting', 'binary-search', 'stability', 'searching'],
          estMinutes: 6,
          roles: ['general'],
          prompt: `Three short questions:
1. Is JavaScript's \`Array.prototype.sort\` stable, and what goes wrong with \`[10, 9, 1].sort()\`?
2. When is it worth sorting first so that you can binary search?
3. What is "binary search on the answer"?`,
          intent:
            'Checks practical sorting knowledge in JavaScript (stability, the string-comparison trap, mutation) and whether you can reason about when preprocessing pays off. Binary search on the answer separates pattern-aware candidates from memorisers.',
          hints: [
            'Without a comparator, what type does `sort` convert each element to before comparing?',
            'Compare costs: one O(n log n) sort plus q searches at O(log n), versus q linear scans at O(n). When does the first win?',
            'Binary search does not need a sorted array, only a predicate that flips from false to true exactly once.',
            'Skeleton: `while (lo < hi) { const mid = lo + ((hi - lo) >> 1); if (ok(mid)) hi = ___; else lo = ___ } return lo`',
          ],
          answer: `**1.** Since ES2019, \`Array.prototype.sort\` is **required to be stable**: elements that compare equal keep their original order, so sorting by a secondary key and then a primary key works. **Without a comparator, values are compared as strings**, so \`[10, 9, 1].sort()\` gives \`[1, 10, 9]\`. Always pass \`(a, b) => a - b\`. Also, \`sort\` **mutates** the array; use \`toSorted()\` (ES2023) for a copy.

**2.** Sorting costs O(n log n) once, and each binary search is then O(log n). With q queries, compare **O(n log n + q log n)** against **O(q·n)**. Sorting wins once q is more than about log n. For a single lookup, a linear scan (O(n)) or a hash set is better. Sorting also enables two-pointer techniques, merging intervals and grouping equal items next to each other.

**Know the algorithms at the level of their trade-offs:**
| Algorithm | Time | Space | Stable | Notes |
| --- | --- | --- | --- | --- |
| Merge sort | O(n log n) | O(n) | yes | predictable; good for linked lists and external sorting |
| Quick sort | O(n log n) average, O(n²) worst | O(log n) | no | fast in practice; uses a random pivot |
| Heap sort | O(n log n) | O(1) | no | in place |
| Counting/radix | O(n + k) | O(k) | yes | for small integer ranges |
| TimSort (V8) | O(n log n), O(n) on nearly sorted input | O(n) | yes | merge sort plus insertion sort |

**3. Binary search on the answer:** if a predicate \`ok(x)\` is monotonic (false…false, true…true), you can binary search for the smallest x where it is true, even with no sorted array. Example: *"the minimum speed to finish all tasks in H hours"* → binary search the speed, where \`ok(speed)\` computes the total hours in O(n).

\`\`\`ts
function lowerBound(lo: number, hi: number, ok: (x: number) => boolean): number {
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2)
    if (ok(mid)) hi = mid
    else lo = mid + 1
  }
  return lo
}
\`\`\``,
          keyPoints: [
            'JavaScript sort is stable but compares as strings by default',
            'Sort once when there are many queries',
            'Know merge, quick and heap sort at the trade-off level',
            'Binary search on a monotonic predicate',
          ],
          pitfalls: ['Calling sort() with no comparator on numbers', 'Off-by-one errors and infinite loops in binary search'],
        },
        {
          id: 'cs-backtracking-subsets',
          title: 'Recursion and backtracking: generate subsets',
          type: 'coding',
          difficulty: 'core',
          priority: 'should',
          tags: ['recursion', 'backtracking', 'combinatorics', 'dfs'],
          estMinutes: 20,
          roles: ['general'],
          prompt: `Return **all subsets** of an array of distinct integers. Then: how would you change it to return only subsets that **sum to a target**, and what does "pruning" mean?`,
          intent:
            'Tests the backtracking template (choose, explore, un-choose) and honest complexity for exponential output. A strong answer copies the path when recording, then adds a target-sum constraint with a clear pruning rule.',
          hints: [
            'Each element is either in or out, so there are 2ⁿ subsets. Picture a decision tree of depth n.',
            'Keep one mutable `path` and a `start` index; every node of the recursion is itself a subset to record.',
            'Template: record a **copy** of path, then for each i from start: push, recurse with i + 1, pop.',
            'Pruning skeleton (sorted, positive values): `if (remaining === 0) { result.push([...path]); return } for (let i = start; i < n; i++) { if (sorted[i] > remaining) break; path.push(sorted[i]); go(i + 1, ___); path.pop() }`',
          ],
          walkthrough: [
            {
              title: 'Restate and clarify',
              body: 'Return every subset of distinct integers, including the empty set; order does not matter. Then a variant: only subsets summing to a target. Ask whether values are positive (it enables pruning).',
            },
            {
              title: 'Pick the template',
              body: '**Backtracking**: state = (`path`, `start`); choices = any index ≥ start; record at every node; undo each choice after exploring it.',
            },
            {
              title: 'Build it',
              body: `\`\`\`ts
function subsets(nums: number[]): number[][] {
  const result: number[][] = []
  const path: number[] = []
  const backtrack = (start: number) => {
    result.push([...path])
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i])
      backtrack(i + 1)
      path.pop()
    }
  }
  backtrack(0)
  return result
}
\`\`\`
For a target: sort, pass \`remaining\`, record when it hits 0, and \`break\` when \`sorted[i] > remaining\`.`,
            },
            {
              title: 'Complexity and edge cases',
              body: '**O(n·2ⁿ)** time (2ⁿ subsets, each copied in O(n)), O(n) recursion depth. Push a **copy** of `path`, not `path`. Forgetting `pop()` corrupts later branches. Duplicates in input need sorting plus `if (i > start && nums[i] === nums[i - 1]) continue`.',
            },
            {
              title: 'Say it in the interview',
              body: '*"It\'s a decision tree, so I backtrack: choose, recurse, un-choose, recording a copy at each node. Output is 2ⁿ, so n·2ⁿ is optimal. With a target and positive numbers, sorting lets me prune as soon as a value exceeds what\'s left."*',
            },
          ],
          answer: `**Backtracking: build a path, recurse, then undo the choice. There are 2ⁿ subsets, so the cost is O(n·2ⁿ).**

\`\`\`ts
function subsets(nums: number[]): number[][] {
  const result: number[][] = []
  const path: number[] = []
  const backtrack = (start: number) => {
    result.push([...path]) // copy: path keeps changing
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]) // choose
      backtrack(i + 1) // explore
      path.pop() // un-choose
    }
  }
  backtrack(0)
  return result
}
\`\`\`

**With a target sum and pruning** (for example, positive numbers, sorted first):

\`\`\`ts
function subsetsWithSum(nums: number[], target: number): number[][] {
  const sorted = [...nums].sort((a, b) => a - b)
  const result: number[][] = []
  const path: number[] = []
  const go = (start: number, remaining: number) => {
    if (remaining === 0) { result.push([...path]); return }
    for (let i = start; i < sorted.length; i++) {
      if (sorted[i] > remaining) break // prune: later values are even larger
      path.push(sorted[i])
      go(i + 1, remaining - sorted[i])
      path.pop()
    }
  }
  go(0, target)
  return result
}
\`\`\`

**The template behind most backtracking problems:** define the *state* (path, start index, remaining), the *choices* at each step, the *goal* (when to record a result) and the *constraints* (when to prune). Permutations use a \`used\` array instead of a \`start\` index; N-Queens and Sudoku add validity checks.

**Recursion points to mention:** every recursion needs a base case; the call-stack depth is O(n); and JavaScript engines do not reliably optimise tail calls, so very deep recursion can throw \`RangeError: Maximum call stack size exceeded\`.`,
          keyPoints: [
            'Choose, explore, un-choose',
            'Copy the path when recording a result',
            'There are 2^n subsets, so output size bounds the time',
            'Prune branches that cannot succeed',
            'Stack depth limits in JavaScript',
          ],
          pitfalls: ['Pushing path itself instead of a copy', 'Forgetting to pop after recursing'],
          followUps: ['How do you avoid duplicate subsets if the input has duplicates?'],
        },
        {
          id: 'cs-greedy-vs-dp-coins',
          title: 'Greedy vs dynamic programming: coin change',
          type: 'coding',
          difficulty: 'advanced',
          priority: 'must',
          tags: ['dynamic-programming', 'greedy', 'memoization', 'tabulation'],
          estMinutes: 30,
          roles: ['general'],
          prompt: `Given coin denominations and an amount, return the **minimum number of coins** that make up the amount (or -1). Would "always take the largest coin" work? Then solve it properly.`,
          intent:
            'Tests whether you can disprove greedy with a counter-example and then build a DP from state, transition and base case. A strong answer names optimal substructure and overlapping subproblems and returns -1 for unreachable amounts.',
          hints: [
            'Try greedy on coins [1, 3, 4] with amount 6. How many coins does it use, and what is the real minimum?',
            'Define `dp[a]` = the minimum number of coins for amount a. What is `dp[0]`?',
            'The last coin used is some c, so `dp[a] = 1 + min over coins c ≤ a of dp[a − c]`. Fill a from 1 up to amount.',
            'Skeleton: `const dp = new Array(amount + 1).fill(Infinity); dp[0] = 0; for (let a = 1; a <= amount; a++) for (const c of coins) if (c <= a) dp[a] = Math.min(dp[a], ___); return dp[amount] === Infinity ? -1 : dp[amount]`',
          ],
          walkthrough: [
            {
              title: 'Restate and test greedy',
              body: 'Minimum coins to reach `amount`, unlimited coins of each denomination, -1 if impossible. Greedy on `[1, 3, 4]`, 6 → 4+1+1 (3 coins) but 3+3 is 2. **Greedy is wrong in general.**',
            },
            {
              title: 'Define the DP',
              body: '**State:** `dp[a]` = fewest coins for a. **Transition:** `dp[a] = 1 + min(dp[a − c])`. **Base:** `dp[0] = 0`. **Order:** increasing a, so subproblems are ready. It works because of optimal substructure and overlapping subproblems.',
            },
            {
              title: 'Build it',
              body: `\`\`\`ts
function coinChange(coins: number[], amount: number): number {
  const dp = new Array<number>(amount + 1).fill(Infinity)
  dp[0] = 0
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) {
      if (c <= a && dp[a - c] + 1 < dp[a]) dp[a] = dp[a - c] + 1
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount]
}
\`\`\``,
            },
            {
              title: 'Complexity and edge cases',
              body: '**O(amount × coins) time, O(amount) space.** amount = 0 → 0. Unreachable → keep Infinity and convert to -1. Top-down memo recursion is equivalent but risks stack depth for large amounts.',
            },
            {
              title: 'Say it in the interview',
              body: '*"Greedy fails on 1, 3, 4 for 6. The best answer for a uses some last coin c plus the best for a − c, so I tabulate bottom-up. Greedy is only safe when I can give an exchange argument, like interval scheduling by earliest end."*',
            },
          ],
          answer: `**Greedy fails in general; use DP.** With coins \`[1, 3, 4]\` and amount 6, greedy takes 4 + 1 + 1 (3 coins), but 3 + 3 uses 2. Greedy is only correct when you can prove the *greedy-choice property*. Standard currency systems happen to have it; arbitrary coin sets do not.

**Bottom-up DP:**

\`\`\`ts
function coinChange(coins: number[], amount: number): number {
  const dp = new Array<number>(amount + 1).fill(Infinity)
  dp[0] = 0
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) {
      if (c <= a && dp[a - c] + 1 < dp[a]) dp[a] = dp[a - c] + 1
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount]
}
// O(amount × coins) time, O(amount) space
\`\`\`

**How to recognise and build a DP solution:**
1. **Optimal substructure:** the best answer for \`a\` is built from best answers to smaller subproblems.
2. **Overlapping subproblems:** a naive recursion recomputes \`dp[a - c]\` exponentially many times.
3. Define the **state** (\`dp[a]\`), the **transition** (\`1 + min dp[a - c]\`), the **base case** (\`dp[0] = 0\`) and the **evaluation order** (increasing a).
4. Choose **top-down** (recursion plus a memo Map, often easier to derive) or **bottom-up** (a table, with no recursion-depth risk and often less space).

**When greedy is correct:** interval scheduling (sort by end time and take each meeting that does not overlap), jump game (track the furthest reachable index), and Huffman coding. In an interview, give a one-line argument for why greedy is safe, such as an exchange argument: *"choosing the meeting that ends earliest never leaves less room for the rest."*

**Classic DP shapes:** climbing stairs and house robber (1-D), longest common subsequence and edit distance (2-D over two strings), 0/1 knapsack, and longest increasing subsequence.`,
          keyPoints: [
            'Give a counter-example for greedy',
            'State, transition, base case and evaluation order',
            'Optimal substructure plus overlapping subproblems',
            'Top-down memoisation versus bottom-up tabulation',
            'Justify greedy with an exchange argument when it is used',
          ],
          pitfalls: ['Assuming greedy works without a proof', 'Returning Infinity instead of -1'],
          followUps: ['Count the number of ways to make the amount instead.', 'Can you reduce the space for 2-D DP?'],
        },
      ],
    },
  ],
}

export default track
