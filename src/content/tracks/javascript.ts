import type { Track } from '@/types/content'

const track: Track = {
  id: 'javascript',
  code: 'C',
  title: 'JavaScript',
  summary: 'The language beneath every framework you use: scope, closures, this, prototypes and the event loop.',
  rationale:
    'Frontend and full-stack screens almost always include "what does this print?" and "implement debounce or a promise pool" questions, and React, Vue and Node behaviour all follow from them. You use JavaScript daily; this track turns intuition into explanations you can give precisely under pressure.',
  icon: 'Braces',
  phase: 1,
  modules: [
    {
      id: 'js-language-core',
      title: 'Scope, this & objects',
      summary: 'Execution contexts, closures, hoisting, this binding, prototypes and equality.',
      questions: [
        {
          id: 'js-closures-scope-hoisting',
          title: 'Closures, scope and hoisting in a loop',
          type: 'output',
          difficulty: 'foundation',
          priority: 'must',
          tags: ['closures', 'scope', 'hoisting', 'var-let', 'execution-context'],
          estMinutes: 5,
          roles: ['frontend', 'full-stack'],
          prompt: `**What does this print, and in what order?** Explain using scope, closures and hoisting.`,
          code: {
            language: 'javascript',
            source: `for (var i = 0; i < 3; i++) setTimeout(() => console.log('var', i))
for (let j = 0; j < 3; j++) setTimeout(() => console.log('let', j))

console.log(typeof hoisted, typeof notYet)

function hoisted() {}
var notYet = () => {}`,
          },
          hints: [
            'Synchronous code runs before any setTimeout callback.',
            'How many bindings of i exist, compared with j?',
            'Function declarations are hoisted with their body; var only with undefined.',
          ],
          answer: `\`\`\`text
function undefined
var 3
var 3
var 3
let 0
let 1
let 2
\`\`\`

**Why:**
- **Hoisting:** when the execution context is created, *function declarations* are hoisted with their bodies (\`typeof hoisted === 'function'\`). \`var\` declarations are hoisted but initialised to \`undefined\`, so \`notYet\` is still \`undefined\` when the log runs.
- **Ordering:** the \`console.log\` is synchronous, and the timer callbacks run later, as macrotasks.
- **\`var\`** is function-scoped: there is **one** \`i\` binding shared by all three closures, and by the time they run it is 3.
- **\`let\`** in a \`for\` header creates a **new binding per iteration**, so each closure captures its own \`j\`.

**A closure** is a function together with references to the variables of the scope in which it was *created* (lexical scope). It holds the **binding**, not a snapshot of the value, which is why every \`var\` callback sees the final 3.

**The temporal dead zone (TDZ):** \`let\`, \`const\` and \`class\` are also hoisted, but they are uninitialised until their declaration runs. Accessing them earlier throws a \`ReferenceError\`:

\`\`\`js
console.log(x) // ReferenceError: Cannot access 'x' before initialization
let x = 1
\`\`\`

**Practical uses of closures:** private state (counters, memoisation caches), factory functions, partial application, and every React or Vue callback that reads props or state. They are also the cause of *stale closure* bugs in React effects.`,
          keyPoints: [
            'var is function-scoped, with one shared binding',
            'let creates a new binding per loop iteration',
            'Closures capture bindings, not values',
            'Function declarations are hoisted with their body; var as undefined',
            'let and const are subject to the TDZ',
          ],
          pitfalls: ['Saying let is "not hoisted"; it is hoisted but in the TDZ', 'Saying closures copy values'],
          followUps: ['How would you fix the var version without using let?', 'What is a stale closure in React?'],
          references: [{ label: 'MDN: Closures', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures' }],
        },
        {
          id: 'js-this-binding',
          title: 'How this is determined',
          type: 'output',
          difficulty: 'core',
          priority: 'must',
          tags: ['this', 'arrow-functions', 'call-apply-bind', 'strict-mode'],
          estMinutes: 6,
          roles: ['frontend', 'full-stack'],
          prompt: `Assume this runs as an **ES module** (strict mode). **What does each line log?**`,
          code: {
            language: 'javascript',
            source: `const obj = {
  name: 'obj',
  regular() { return this?.name },
  arrow: () => this?.name,
  nested() { return [1].map(function () { return this?.name })[0] },
  nestedArrow() { return [1].map(() => this.name)[0] },
}
const { regular } = obj

console.log(obj.regular())
console.log(regular())
console.log(obj.arrow())
console.log(obj.nested())
console.log(obj.nestedArrow())
console.log(obj.regular.call({ name: 'other' }))`,
          },
          hints: [
            'For regular functions, this depends on how the function is called, not where it is defined.',
            'Arrow functions have no this of their own; they use the this of the enclosing scope.',
            'At the top level of a module, this is undefined.',
          ],
          answer: `\`\`\`text
obj
undefined
undefined
undefined
obj
other
\`\`\`

**The rules, in order of precedence:**
1. **\`new\`:** \`this\` is the newly created object.
2. **Explicit:** \`call\`, \`apply\` and \`bind\` set \`this\` (\`bind\` returns a permanently bound function), giving \`'other'\`.
3. **Implicit:** \`obj.method()\` sets \`this\` to \`obj\`, giving \`'obj'\`.
4. **Default:** a plain call \`fn()\` gives \`undefined\` in strict mode (the global object in sloppy scripts). Destructuring \`regular\` **loses the receiver**, so it returns \`undefined\`.

**Arrow functions** ignore all of these rules and use the \`this\` of their **lexical** scope:
- \`arrow\` is defined in an object literal at module top level, where \`this\` is \`undefined\`. An object literal does not create a scope for \`this\`.
- \`nestedArrow\`'s callback inherits \`this\` from \`nestedArrow()\`, which was called as \`obj.nestedArrow()\`, so it logs \`'obj'\`.
- \`nested\` uses a regular \`function\` callback, which \`map\` calls with \`this = undefined\` (no \`thisArg\` was passed).

**Where this bites in practice:**
- Passing methods as callbacks: \`button.addEventListener('click', obj.handle)\` loses \`obj\`. Use \`obj.handle.bind(obj)\` or an arrow wrapper.
- Class fields declared as arrow functions (\`handle = () => {…}\`) capture the instance, at the cost of one function per instance.
- In DOM listeners declared with \`function\`, \`this\` is \`event.currentTarget\`.`,
          keyPoints: [
            'this is decided at call time for regular functions',
            'Precedence: new > explicit > implicit > default',
            'Arrow functions use lexical this',
            'Extracting a method loses its receiver',
            'Strict mode default this is undefined',
          ],
          pitfalls: [
            'Thinking an object literal gives arrow functions a this',
            'Expecting the global object in strict mode or modules',
          ],
          followUps: ['Can you rebind an arrow function with bind?', 'What does bind do when called twice?'],
          references: [{ label: 'MDN: this', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this' }],
        },
        {
          id: 'js-prototype-chain',
          title: 'Prototypes and the prototype chain',
          type: 'concept',
          difficulty: 'core',
          priority: 'should',
          tags: ['prototypes', 'inheritance', 'classes', 'objects'],
          estMinutes: 5,
          roles: ['frontend', 'full-stack'],
          prompt: `**Explain the prototype chain.** What is the difference between \`prototype\` and \`__proto__\`, and what does \`class\` actually do?`,
          hints: [
            'Property lookup walks a chain of linked objects.',
            'One of them is a property of functions; the other is the internal link of every object.',
          ],
          answer: `Every object has an internal \`[[Prototype]]\` link to another object (or \`null\`). **When you read a property, the engine checks the object itself, then follows \`[[Prototype]]\` up the chain until it finds the property or reaches \`null\`.** That is the prototype chain, and it is how JavaScript implements inheritance.

- **\`obj.__proto__\`** (or, better, \`Object.getPrototypeOf(obj)\`) is that internal link.
- **\`Fn.prototype\`** is a regular property *of functions*: the object that becomes the \`[[Prototype]]\` of instances created with \`new Fn()\`.

\`\`\`js
class Animal {
  constructor(name) { this.name = name } // own property
  speak() { return \`\${this.name} makes a sound\` } // on Animal.prototype
}
class Dog extends Animal {
  speak() { return \`\${super.speak()}, woof\` }
}
const d = new Dog('Rex')

Object.getPrototypeOf(d) === Dog.prototype // true
Object.getPrototypeOf(Dog.prototype) === Animal.prototype // true
Object.hasOwn(d, 'name') // true  (own)
Object.hasOwn(d, 'speak') // false (inherited)
// chain: d → Dog.prototype → Animal.prototype → Object.prototype → null
\`\`\`

**\`class\` is mostly syntax over the same mechanism:** methods go on \`.prototype\`, and \`extends\` links the prototypes. It does add real semantics: class code is always in strict mode, the class must be called with \`new\`, \`super\` works, private \`#fields\` are genuinely private, and class declarations are in the TDZ until they are evaluated.

**Practical consequences:**
- Methods on the prototype are shared by all instances, which saves memory. Arrow-function class fields create one function per instance.
- **Writing** a property always creates it on the object itself (it *shadows* the inherited one); it does not modify the prototype.
- \`Object.create(proto)\` creates an object with a given prototype. \`Object.create(null)\` creates a dictionary with no inherited keys.
- Modifying the prototypes of built-in objects (\`Array.prototype.foo = …\`) is unsafe, and merging untrusted objects can lead to **prototype pollution** through \`__proto__\` keys.`,
          keyPoints: [
            'Property lookup walks [[Prototype]] links',
            'prototype is a property of functions; __proto__ is the instance link',
            'class is largely syntax over prototypes',
            'Writes shadow inherited properties; they do not modify the prototype',
            'Prototype pollution risk',
          ],
          pitfalls: ['Mixing up prototype and __proto__', 'Saying JavaScript classes are like Java classes'],
          followUps: ['How does instanceof work?', 'What is prototype pollution, and how do you prevent it?'],
          references: [{ label: 'MDN: Inheritance and the prototype chain', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain' }],
        },
        {
          id: 'js-coercion-equality-references',
          title: 'Coercion, equality and reference semantics',
          type: 'multiple-choice',
          difficulty: 'foundation',
          priority: 'must',
          tags: ['coercion', 'equality', 'primitives', 'references'],
          estMinutes: 4,
          roles: ['frontend', 'full-stack'],
          prompt: `**Which of these expressions evaluate to \`true\`?** Select all that apply.`,
          choices: [
            {
              id: 'a',
              text: '`[] == false`',
              correct: true,
              explanation: 'Loose equality converts both sides: [] becomes "" and then 0, and false becomes 0, so 0 == 0.',
            },
            {
              id: 'b',
              text: '`null == 0`',
              correct: false,
              explanation: 'null is loosely equal only to undefined (and itself); there is no numeric conversion for ==.',
            },
            {
              id: 'c',
              text: '`NaN === NaN`',
              correct: false,
              explanation: 'NaN is the only value not equal to itself.',
            },
            {
              id: 'd',
              text: '`Object.is(NaN, NaN)`',
              correct: true,
              explanation: 'Object.is uses SameValue: NaN equals NaN, and +0 and -0 are different.',
            },
            {
              id: 'e',
              text: '`{ a: 1 } === { a: 1 }`',
              correct: false,
              explanation: 'Objects are compared by reference, and these are two different objects.',
            },
          ],
          hints: ['== converts both sides through ToPrimitive and then to numbers in most cases.', 'Objects are never compared by content.'],
          answer: `**a and d are true.**

**Loose equality (\`==\`)** applies conversion rules: \`null == undefined\` is true (and neither equals anything else); booleans become numbers; objects go through \`ToPrimitive\` (\`valueOf\` and then \`toString\`), so \`[]\` becomes \`""\` and then 0. This is why \`[] == false\` is true even though \`[]\` is *truthy*: truthiness and \`==\` are different rules.

**Strict equality (\`===\`)** never converts types. Its only surprises are \`NaN !== NaN\` and \`+0 === -0\`. **\`Object.is\`** fixes both, and it is what React uses to compare state and dependencies.

**Primitive vs reference:**
- The primitives (\`string\`, \`number\`, \`bigint\`, \`boolean\`, \`undefined\`, \`null\`, \`symbol\`) are immutable and compared by value.
- Objects, arrays and functions are compared by **reference identity**. Assigning one or passing it to a function copies the reference, so mutating through one variable is visible through the other.

\`\`\`js
const a = { tags: ['x'] }
const b = { ...a } // shallow copy: b.tags === a.tags
b.tags.push('y') // a.tags is now ['x', 'y']
const c = structuredClone(a) // deep copy (no functions or DOM nodes)
\`\`\`

**In practice:** use \`===\` everywhere. \`x == null\` is an accepted idiom that checks for both \`null\` and \`undefined\`. Reference semantics are also why React and Vue need immutable updates or reactive proxies to detect changes.`,
          keyPoints: [
            '== converts; === does not',
            'null == undefined only',
            'NaN !== NaN; Object.is handles NaN and -0',
            'Objects are compared by reference',
            'Spread is a shallow copy; structuredClone is deep',
          ],
          pitfalls: ['Confusing truthiness with == true', 'Thinking spread deep-copies nested objects'],
        },
      ],
    },
    {
      id: 'js-async',
      title: 'Async & concurrency',
      summary: 'The event loop, Promises, async/await, error handling, concurrency control and race conditions.',
      questions: [
        {
          id: 'js-event-loop-order',
          title: 'Event loop: microtasks vs macrotasks',
          type: 'output',
          difficulty: 'core',
          priority: 'must',
          tags: ['event-loop', 'microtasks', 'macrotasks', 'promises', 'async-await'],
          estMinutes: 6,
          roles: ['frontend', 'full-stack', 'backend'],
          prompt: `**What is the exact output order?** Then explain the call stack, the microtask queue and the macrotask queue.`,
          code: {
            language: 'javascript',
            source: `console.log('1')
setTimeout(() => console.log('2'), 0)
Promise.resolve()
  .then(() => console.log('3'))
  .then(() => console.log('4'))
queueMicrotask(() => console.log('5'))
;(async () => {
  console.log('6')
  await null
  console.log('7')
})()
console.log('8')`,
          },
          hints: [
            'An async function runs synchronously until its first await.',
            'All microtasks run before the next macrotask.',
            'A chained .then is only queued once the previous one has run.',
          ],
          answer: `\`\`\`text
1 6 8 3 5 7 4 2
\`\`\`

**Step by step:**
1. **Synchronous code runs on the call stack:** \`1\`; the timer is registered; \`.then(3)\` is **queued** because the promise is already resolved; \`5\` is queued; the async function logs \`6\` synchronously, and \`await null\` queues its continuation (\`7\`); then \`8\`.
2. The stack is empty, so the engine **drains the microtask queue**, which holds \`[3, 5, 7]\`. Running 3 resolves the next promise in the chain, which queues \`4\` at the end. Then 5, then 7, then 4.
3. Only when the microtask queue is empty does the **next macrotask** run: the timer, which logs \`2\`.

**The model:**
- **Call stack:** synchronous execution.
- **Microtasks:** promise reactions, \`await\` continuations, \`queueMicrotask\` and \`MutationObserver\`. **All of them** run after each task, including microtasks queued while draining.
- **Macrotasks (tasks):** timers, I/O, UI events and \`MessageChannel\`. **One** runs per loop iteration.
- In browsers, **rendering** (requestAnimationFrame, style, layout, paint) can happen between tasks, never in the middle of a microtask drain. A long synchronous task, or an endless chain of microtasks, therefore blocks painting.

**Node.js differences:** libuv runs the loop in phases (timers → pending → poll → check → close). \`process.nextTick\` callbacks run *before* promise microtasks. \`setImmediate\` runs in the check phase.

**Why it matters:** it explains why \`await\` never runs "immediately", why a heavy \`.then\` chain can freeze the UI, and why Vue's \`nextTick\` and batched state updates rely on microtasks.`,
          keyPoints: [
            'Synchronous code first, including the start of async functions',
            'The whole microtask queue drains before the next macrotask',
            'A chained then is queued only after the previous one runs',
            'Rendering happens between tasks',
            'Node: nextTick runs before promise microtasks; the loop runs in phases',
          ],
          pitfalls: ['Thinking setTimeout(0) runs before promises', 'Thinking an await continuation runs synchronously'],
          followUps: ['How would you yield to the browser during a long computation?', 'What does process.nextTick do differently?'],
          references: [{ label: 'MDN: The event loop', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop' }],
        },
        {
          id: 'js-promise-combinators',
          title: 'Promise.all vs allSettled vs race vs any',
          type: 'tradeoff',
          difficulty: 'core',
          priority: 'must',
          tags: ['promises', 'async-await', 'error-handling', 'concurrency'],
          estMinutes: 5,
          roles: ['frontend', 'full-stack', 'backend'],
          prompt: `A dashboard loads user, orders and recommendations in parallel. **Which Promise combinator do you use, and how do you handle errors?** Compare \`all\`, \`allSettled\`, \`race\` and \`any\`.`,
          hints: [
            'Is the page useless if recommendations fail?',
            'Does a rejection in Promise.all cancel the other requests?',
          ],
          answer: `**Use \`Promise.all\` for the data the page cannot work without, and \`Promise.allSettled\` for optional parts, so a failing recommendations service does not take down the page.**

| Combinator | Resolves when | Rejects when | Use for |
| --- | --- | --- | --- |
| \`all\` | all fulfil (results keep the input order) | **the first** rejection | all-or-nothing dependencies |
| \`allSettled\` | all settle | never | independent, partial-failure tolerant work |
| \`race\` | the first to settle, either way | the first to settle rejects | timeouts |
| \`any\` | the first to fulfil | all reject (\`AggregateError\`) | fallbacks or mirrors |

\`\`\`ts
const [user, orders] = await Promise.all([getUser(id), getOrders(id)]) // critical
const [recs] = await Promise.allSettled([getRecommendations(id)]) // optional
const recommendations = recs.status === 'fulfilled' ? recs.value : []
\`\`\`

**Key detail:** when \`Promise.all\` rejects early, **the other promises keep running**. Promises are not cancellable. To actually stop the work, pass an \`AbortSignal\` to \`fetch\`, or to your own functions, and abort it on failure.

**Timeouts:** \`fetch(url, { signal: AbortSignal.timeout(5000) })\` is usually cleaner than \`Promise.race\` against a timer, because it actually cancels the request.

**Error handling with async/await:**
- Wrap \`await\` calls in \`try/catch\` at the level that can *do something* about the error (show a fallback, retry, report it), not around every line.
- \`await\` in a loop runs the iterations **sequentially**. Start the promises first if they are independent.
- Every promise needs a handler, or the result is an \`unhandledrejection\` (which terminates the process by default in Node 15 and later).`,
          keyPoints: [
            'all fails fast; allSettled tolerates partial failure',
            'race for timeouts; any for fallbacks',
            'Rejection does not cancel the other promises; use AbortSignal',
            'Sequential vs parallel await',
            'Unhandled rejections crash Node',
          ],
          pitfalls: ['Assuming Promise.all cancels the remaining work', 'Awaiting independent requests one at a time'],
          followUps: ['How would you retry with exponential back-off?'],
          references: [{ label: 'MDN: Promise', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise' }],
        },
        {
          id: 'js-async-foreach-bug',
          title: 'Debug: async inside forEach',
          type: 'debugging',
          difficulty: 'core',
          priority: 'should',
          tags: ['async-await', 'error-handling', 'promises', 'loops'],
          estMinutes: 6,
          roles: ['frontend', 'full-stack', 'backend'],
          prompt: `Users report "all saved" appearing while saves are still in progress, and errors never reach the \`catch\`. **What is wrong? Fix it in two ways.**`,
          code: {
            language: 'javascript',
            source: `async function saveAll(users) {
  try {
    users.forEach(async (user) => {
      await api.save(user)
    })
    console.log('all saved')
  } catch (err) {
    console.error('failed', err)
  }
}`,
          },
          hints: [
            'What does forEach do with the value its callback returns?',
            'Where does a rejection inside the callback go?',
          ],
          answer: `**\`forEach\` ignores the promises its async callback returns.** It starts every save, returns synchronously, and \`'all saved'\` is logged immediately. The rejections happen *later*, outside the \`try\` block, so they become **unhandled rejections** that the \`catch\` never sees.

**Fix 1: sequential**, when order matters or the API has rate limits:
\`\`\`js
async function saveAll(users) {
  try {
    for (const user of users) {
      await api.save(user)
    }
    console.log('all saved')
  } catch (err) {
    console.error('failed', err) // stops at the first failure
  }
}
\`\`\`

**Fix 2: parallel**, which is faster:
\`\`\`js
async function saveAll(users) {
  const results = await Promise.allSettled(users.map((u) => api.save(u)))
  const failed = results.filter((r) => r.status === 'rejected')
  if (failed.length) console.error(\`\${failed.length} saves failed\`, failed)
  else console.log('all saved')
}
\`\`\`

Use \`Promise.all\` instead if one failure should fail the whole operation. For thousands of users, neither fix is ideal: unbounded parallelism can overload the API, so use a **concurrency limit** (a promise pool).

**Other array methods behave the same way:** \`map\` returns promises (fine with \`Promise.all\`), but \`filter\`, \`some\` and \`reduce\` with async callbacks do not wait, and \`filter\` treats every returned promise as truthy.`,
          keyPoints: [
            'forEach ignores returned promises',
            'Rejections escape the surrounding try/catch',
            'Use for...of for sequential work',
            'Use Promise.all or allSettled with map for parallel work',
            'Limit concurrency for large batches',
          ],
          pitfalls: ['Adding await before users.forEach (it returns undefined)'],
          personalAngle:
            'Your scraping jobs processed thousands of records. Explain how you bounded concurrency there and what happened to the failed items (retry or a recovery job).',
        },
        {
          id: 'js-promise-pool',
          title: 'Implement a promise pool (concurrency limit)',
          type: 'coding',
          difficulty: 'advanced',
          priority: 'should',
          tags: ['concurrency', 'promises', 'async-await', 'coding'],
          estMinutes: 20,
          roles: ['frontend', 'full-stack', 'backend'],
          prompt: `Implement \`mapWithConcurrency(items, limit, fn)\`. It runs the async \`fn\` over \`items\` with **at most \`limit\` calls in flight**, and resolves with the results **in input order**.`,
          hints: [
            'Start `limit` workers that each pull the next index from a shared counter.',
            'JavaScript is single-threaded: `next++` between awaits cannot race.',
            'Write results by index to keep the input order.',
          ],
          answer: `**Use a worker pool: \`limit\` async workers share a cursor and pull items until none are left.**

\`\`\`ts
async function mapWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length)
  let next = 0

  async function worker(): Promise<void> {
    while (next < items.length) {
      const i = next++ // claimed synchronously, so no two workers get the same index
      results[i] = await fn(items[i], i)
    }
  }

  const workers = Array.from({ length: Math.max(1, Math.min(limit, items.length)) }, worker)
  await Promise.all(workers)
  return results
}

// usage
const pages = await mapWithConcurrency(urls, 5, (url) => fetch(url).then((r) => r.text()))
\`\`\`

**Why there is no race on \`next\`:** JavaScript runs one piece of code at a time on a single thread. \`next++\` happens synchronously between awaits, so two workers can never claim the same index.

**Design decisions to discuss:**
- **Errors:** as written, the first rejection rejects \`Promise.all\`, but the other workers keep going. Options: catch inside the worker and store \`{ status, value | reason }\` (the \`allSettled\` style), or share an \`AbortController\` and stop all workers on the first failure.
- **Retries:** wrap \`fn\` with retries and exponential back-off plus jitter for transient errors.
- **Order:** writing results by index preserves the input order even though calls complete out of order.
- **Rate limits** differ from concurrency limits. "At most 5 in flight" is not the same as "at most 10 per second", which needs a token bucket.

This is how libraries such as \`p-limit\` work, and it is the in-process version of what a queue like BullMQ does with its \`concurrency\` option.`,
          keyPoints: [
            'N workers pulling from a shared cursor',
            'The single-threaded event loop makes the cursor safe',
            'Write by index to keep the order',
            'Define the error policy explicitly',
            'Concurrency limits are not rate limits',
          ],
          pitfalls: [
            'Batching in fixed chunks of N, which leaves the pool idle while it waits for the slowest call',
            'Pushing results in completion order',
          ],
          followUps: ['Add cancellation with AbortSignal.', 'How would you add a per-second rate limit?'],
          personalAngle:
            'Relate it to your Puppeteer and BullMQ scraping: a browser pool is a concurrency limit, and explaining why you chose the number of workers you did shows real-world judgement.',
        },
        {
          id: 'js-debounce-throttle-race',
          title: 'Debounce, throttle and stale-response races',
          type: 'coding',
          difficulty: 'core',
          priority: 'must',
          tags: ['debounce', 'throttle', 'race-conditions', 'abortcontroller', 'browser-apis'],
          estMinutes: 20,
          roles: ['frontend', 'full-stack'],
          prompt: `Implement \`debounce\` and \`throttle\`. Then: a debounced search box still sometimes shows results for an **older** query. Why, and how do you fix it?`,
          hints: [
            'Debounce: reset a timer on every call. Throttle: allow at most one call per interval.',
            'Debouncing reduces the number of requests, but responses can still arrive out of order.',
            'Cancel the previous request, or ignore responses that are not from the latest one.',
          ],
          answer: `**Debounce** waits until calls have stopped for \`wait\` ms. **Throttle** runs at most once per \`interval\`.

\`\`\`ts
function debounce<A extends unknown[]>(fn: (...args: A) => void, wait: number) {
  let timer: ReturnType<typeof setTimeout> | undefined
  const debounced = (...args: A) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), wait)
  }
  debounced.cancel = () => clearTimeout(timer)
  return debounced
}

function throttle<A extends unknown[]>(fn: (...args: A) => void, interval: number) {
  let last = 0
  return (...args: A) => {
    const now = Date.now()
    if (now - last >= interval) {
      last = now
      fn(...args) // leading edge; production versions often add a trailing call
    }
  }
}
\`\`\`

**When to use which:** debounce for search inputs, resize-end handling and autosave. Throttle for scroll and pointer-move handlers and progress reporting. For visual updates, \`requestAnimationFrame\` is the natural throttle.

**The race:** debouncing reduces *how many* requests are sent, but responses can still **arrive out of order**. A slow response for \`"rea"\` can land after a fast one for \`"react"\` and overwrite it.

**Fix: abort the previous request.**
\`\`\`ts
let controller: AbortController | undefined

async function search(q: string) {
  controller?.abort() // cancel the in-flight request
  controller = new AbortController()
  try {
    const res = await fetch(\`/api/search?q=\${encodeURIComponent(q)}\`, { signal: controller.signal })
    render(await res.json())
  } catch (err) {
    if ((err as Error).name !== 'AbortError') throw err
  }
}
\`\`\`

An alternative is a **request id**: increment a counter for each request and ignore any response whose id is not the latest. Use it when the operation cannot be aborted. In React, the cleanup function of an effect is the natural place to abort; in Vue, use \`onWatcherCleanup\` (3.5) or the \`onCleanup\` argument of \`watch\`.`,
          keyPoints: [
            'Debounce resets a timer; throttle limits the rate',
            'Choose based on the use case',
            'Out-of-order responses are a race condition',
            'Use AbortController to cancel, or ignore stale responses with a request id',
            'Framework cleanup hooks are where cancellation belongs',
          ],
          pitfalls: [
            'Creating a new debounced function on every render',
            'Thinking debounce alone fixes stale results',
          ],
          followUps: ['Add leading/trailing options to debounce.', 'How would you test debounce with fake timers?'],
          references: [{ label: 'MDN: AbortController', url: 'https://developer.mozilla.org/en-US/docs/Web/API/AbortController' }],
        },
      ],
    },
    {
      id: 'js-runtime',
      title: 'Memory, collections, iteration & modules',
      summary: 'Garbage collection and leaks, keyed collections, iterators and generators, and the module system.',
      questions: [
        {
          id: 'js-memory-gc-weak-collections',
          title: 'Memory leaks, GC and Weak collections',
          type: 'concept',
          difficulty: 'advanced',
          priority: 'should',
          tags: ['memory', 'garbage-collection', 'weakmap', 'map-set', 'leaks'],
          estMinutes: 6,
          roles: ['frontend', 'full-stack', 'backend'],
          prompt: `A long-running SPA (or a Node worker) slowly grows in memory. **How does JavaScript garbage collection work, what usually causes leaks, and where do \`Map\`, \`Set\`, \`WeakMap\` and \`WeakSet\` fit in?**`,
          hints: [
            'GC frees what is unreachable, not what is unused.',
            'Think listeners, timers, caches and closures.',
            'Weak collections do not keep their keys alive.',
          ],
          answer: `**The GC frees objects that are no longer reachable from the roots** (the global object, the active stack and closures in use). **A leak is memory that is still reachable but no longer needed.** V8 uses a *generational*, mostly concurrent *mark-and-sweep/compact* collector: most objects die young in a cheap young generation, and survivors are promoted to the old generation.

**Common leak sources:**
- **Event listeners and subscriptions** that are never removed (on \`window\`, sockets or stores), which keep components and their closures alive.
- **Timers** (\`setInterval\`) never cleared after unmount.
- **Unbounded caches**: a \`Map\` used as a memo cache that only ever grows.
- **Detached DOM nodes** still referenced from JavaScript.
- **Closures** capturing large objects; in Node, module-level arrays that keep growing.

**Collections:**
| | Keys | Iterable | Holds keys strongly | Use |
| --- | --- | --- | --- | --- |
| \`Map\` | any value | yes, in insertion order | yes | dictionaries with dynamic keys, counts, LRU caches |
| \`Set\` | any value | yes | yes | uniqueness, membership |
| \`WeakMap\` | objects (and non-registered symbols) | no | **no** | metadata attached to objects you do not own |
| \`WeakSet\` | objects | no | **no** | "have I seen or processed this object?" |

\`\`\`js
const meta = new WeakMap()
function track(el) { meta.set(el, { seenAt: Date.now() }) }
// when el is removed and dropped everywhere else, its entry can be collected
\`\`\`

Weak collections are **not iterable and have no size**, because their contents depend on GC timing. \`WeakRef\` and \`FinalizationRegistry\` exist but are non-deterministic; avoid relying on them for program logic.

**Diagnosing a leak:** take heap snapshots in Chrome DevTools (or Node with \`--inspect\`), perform the suspected action several times, take another snapshot and compare them, looking for growing retainers or detached elements.`,
          keyPoints: [
            'Reachability, not use, decides what is collected',
            'Generational mark-and-sweep in V8',
            'Leaks: listeners, timers, unbounded caches, detached DOM',
            'Weak collections do not prevent collection and are not iterable',
            'Heap snapshot comparison to diagnose',
          ],
          pitfalls: ['Thinking a WeakMap is a size-limited cache', 'Saying JavaScript cannot leak because it has a GC'],
          followUps: ['How would you build a bounded LRU cache with Map?'],
          personalAngle:
            'Long-running Puppeteer workers are a classic leak source (pages and browser contexts not closed). If your recovery or restart jobs ever compensated for memory growth, say so honestly and explain what you would instrument.',
        },
        {
          id: 'js-iterators-generators',
          title: 'Iterators and (async) generators',
          type: 'coding',
          difficulty: 'advanced',
          priority: 'nice',
          tags: ['iterators', 'generators', 'async-iteration', 'pagination'],
          estMinutes: 15,
          roles: ['full-stack', 'backend'],
          prompt: `An API returns paginated results: \`{ items, nextCursor }\`. **Write an async generator that yields every item across all pages**, so the caller can write \`for await (const item of allItems())\`. What does the iterator protocol look like underneath?`,
          hints: [
            'An async generator is `async function*`.',
            'Loop while there is a cursor, and `yield` each item.',
            'The protocol is an object with a next() method returning { value, done }.',
          ],
          answer: `**An async generator turns cursor pagination into a lazy stream.** Pages are fetched only as the consumer asks for more items.

\`\`\`ts
type Page<T> = { items: T[]; nextCursor: string | null }

async function* allItems<T>(
  fetchPage: (cursor: string | null) => Promise<Page<T>>,
): AsyncGenerator<T> {
  let cursor: string | null = null
  do {
    const page = await fetchPage(cursor)
    yield* page.items // yield each item of the page
    cursor = page.nextCursor
  } while (cursor)
}

for await (const job of allItems(fetchJobsPage)) {
  if (job.matches) break // break calls return(); no further pages are fetched
}
\`\`\`

**The protocol underneath:**
- An **iterable** has a \`[Symbol.iterator]()\` method (or \`[Symbol.asyncIterator]()\` for async) that returns an **iterator**.
- An **iterator** has \`next()\`, which returns \`{ value, done }\` (a Promise of that for async iterators), and optionally \`return()\` for cleanup.
- \`for...of\`, spread, destructuring, \`Array.from\`, and \`Map\`/\`Set\` constructors all consume iterables.

\`\`\`js
const range = {
  *[Symbol.iterator]() { for (let i = 0; i < 3; i++) yield i },
}
;[...range] // [0, 1, 2]
\`\`\`

**Why generators are useful:**
- **Laziness:** compute values on demand, including infinite sequences.
- **Pausable functions:** \`yield\` suspends the function and the caller resumes it.
- **Cleanup:** \`break\` or \`return\` in the consumer runs the generator's \`finally\` block, a good place to release resources.
- Node streams are async iterables (\`for await (const chunk of stream)\`), and newer iterator helpers (\`.map\`, \`.filter\`, \`.take\` on iterators) are available in modern engines.`,
          keyPoints: [
            'async function* with yield and for await',
            'Lazy, on-demand page fetching',
            'The iterable/iterator protocol: Symbol.iterator, next(), { value, done }',
            'break triggers return(), and finally blocks run',
          ],
          pitfalls: ['Loading all pages into an array first, which defeats laziness'],
          followUps: ['How would you add concurrency (prefetching the next page)?'],
          personalAngle:
            'Scraping over thousands of records is a good fit: an async generator over source pages feeding the matching logic keeps memory flat.',
        },
        {
          id: 'js-modules-esm-cjs',
          title: 'ES modules vs CommonJS',
          type: 'tradeoff',
          difficulty: 'core',
          priority: 'nice',
          tags: ['modules', 'esm', 'commonjs', 'tree-shaking', 'node'],
          estMinutes: 5,
          roles: ['frontend', 'full-stack', 'backend'],
          prompt: `**What are the practical differences between ES modules and CommonJS?** Why does tree-shaking depend on ESM, and what problems have you hit mixing the two in Node?`,
          hints: [
            'One is static and analysable at build time; the other is a function call at runtime.',
            'Think about live bindings and top-level await.',
          ],
          answer: `**ESM is static** (\`import\` and \`export\` are declarations resolved before any code runs). **CommonJS is dynamic** (\`require()\` is a synchronous function call at runtime that returns a \`module.exports\` object).

| | ESM | CommonJS |
| --- | --- | --- |
| Syntax | \`import\` / \`export\` | \`require\` / \`module.exports\` |
| Resolution | static, before execution | at runtime, synchronous |
| Bindings | **live** (read-only views of the exporter's variables) | a copy of the exported value |
| Top-level \`await\` | yes | no |
| \`this\` at top level | \`undefined\` | \`module.exports\` |
| Browser support | native (\`<script type="module">\`) | needs a bundler |

**Tree-shaking:** because ESM imports are static, a bundler (Vite/Rollup/Rolldown, esbuild, webpack) can see which exports are used and drop the rest. With \`require\`, any property might be accessed at runtime, so the bundler cannot safely remove code. Side effects also matter: \`"sideEffects": false\` in \`package.json\` tells the bundler that unused modules can be skipped entirely.

**Dynamic \`import()\`** returns a Promise and is the basis for **code splitting** (route-level lazy components in Vue Router and \`React.lazy\`).

**Node interop in practice:**
- The module type is set by the \`"type"\` field in \`package.json\` or by the \`.mjs\`/\`.cjs\` extension.
- ESM can \`import\` CommonJS (as a default export, with best-effort named exports).
- Recent Node versions (22 and later) can also \`require()\` synchronous ESM modules (without top-level await), which removes most of the older pain.
- Libraries publish both formats with conditional \`"exports"\`. That can cause the *dual-package hazard*: two copies of the module, with two separate states.`,
          keyPoints: [
            'Static ESM vs runtime CommonJS',
            'Live bindings vs copied values',
            'Static analysis enables tree-shaking',
            'Dynamic import() enables code splitting',
            'Node interop: the type field, require(esm), conditional exports',
          ],
          pitfalls: ['Thinking import is just syntax over require', 'Forgetting about side effects when tree-shaking'],
          personalAngle:
            'Publishing REI-KIT to npm means you have dealt with package `exports`, ESM builds and tree-shakeable components. Use it as the concrete example.',
          references: [{ label: 'Node.js: Modules (ECMAScript)', url: 'https://nodejs.org/api/esm.html' }],
        },
      ],
    },
  ],
}

export default track
