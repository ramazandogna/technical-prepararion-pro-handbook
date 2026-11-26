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
          intent:
            'Tests whether you can trace execution order and explain it with the right vocabulary: one shared `var` binding versus a fresh `let` binding per iteration, closures capturing bindings, and what hoisting does to declarations versus `var` initialisers.',
          hints: [
            'Which line runs first: the `console.log(typeof ...)` or any timer callback?',
            'Count bindings: how many `i` variables exist for the whole loop, and how many `j` variables?',
            'Hoisting: a function declaration is hoisted with its body; a `var` is hoisted as `undefined` until its assignment line runs.',
            'Near-answer: the first line is `function undefined`; then three lines with the same value of `i` (what is `i` after the loop ends?); then `let 0`, `let ___`, `let ___`.',
          ],
          walkthrough: [
            {
              title: 'Restate and order the phases',
              body: 'Split the code into **synchronous** work (the two loops register timers, then the `typeof` log) and **later** work (six timer callbacks, in registration order). So the `typeof` line prints first.',
            },
            {
              title: 'Apply hoisting',
              body: '`function hoisted() {}` is hoisted **with its body** → `function`. `var notYet` is hoisted but initialised to `undefined`; the arrow function is only assigned later → `undefined`. First line: `function undefined`.',
            },
            {
              title: 'Apply closures and bindings',
              body: '`var i` is function-scoped: **one binding**, shared by all three closures, and it is 3 when they run → `var 3` ×3. `let j` in a `for` header creates a **new binding per iteration** → `let 0`, `let 1`, `let 2`.',
            },
            {
              title: 'Edge cases worth adding',
              body: '`let`/`const` are hoisted too but sit in the **TDZ**: reading them early throws `ReferenceError`. Without `let`, fix the `var` loop with an IIFE or `setTimeout(fn, 0, i)` to pass the value in.',
            },
            {
              title: 'Say it in the interview',
              body: '*"Sync code first, so the typeof line prints function and undefined. Then the timers: the var loop shares one binding that ended at 3, and let creates a fresh binding per iteration, so 0, 1, 2. Closures capture bindings, not values."*',
            },
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
          intent:
            'Tests whether you apply the call-site rules for `this` mechanically (new, explicit, implicit, default) and know that arrow functions skip them and use lexical `this`. A strong answer explains each line by naming the rule that applies.',
          hints: [
            'For a regular function, look at the **call site**: what is to the left of the dot when it is called?',
            'Destructuring `regular` out of `obj` and calling it bare: which rule applies, and what is the default in strict mode?',
            'Arrow functions have no own `this`. For `arrow`, what is `this` at the top level of an ES module? (An object literal is not a scope.)',
            'Near-answer: `obj`, `undefined`, `undefined`, then the regular callback passed to `map` gets `this = ___`, the arrow callback inherits from `nestedArrow()` → `___`, and `.call` sets it to `___`.',
          ],
          walkthrough: [
            {
              title: 'Restate the rules',
              body: 'For regular functions `this` is decided **at call time**, by precedence: `new` > explicit (`call`/`apply`/`bind`) > implicit (`obj.fn()`) > default (`undefined` in strict mode). Arrow functions ignore all of this and use **lexical** `this`.',
            },
            {
              title: 'Lines 1–3',
              body: '`obj.regular()` → implicit → `obj`. `regular()` → bare call, receiver lost → `undefined` (the `?.` prevents a throw). `obj.arrow()` → arrow defined at module top level, where `this` is `undefined` → `undefined`.',
            },
            {
              title: 'Lines 4–6',
              body: '`nested`: the inner `function` is called by `map` with no `thisArg` → `undefined`. `nestedArrow`: the inner arrow inherits `this` from `nestedArrow()`, called as `obj.nestedArrow()` → `obj`. `.call({ name: \'other\' })` → explicit → `other`.',
            },
            {
              title: 'Practical edge cases',
              body: 'Passing `obj.handle` as a callback loses `this`; use `.bind(obj)` or an arrow wrapper. `bind` on an arrow function does nothing to `this`. Binding twice keeps the first binding. In DOM `function` listeners, `this` is `currentTarget`.',
            },
            {
              title: 'Say it in the interview',
              body: '*"I look at each call site. Method call gives obj, the bare call loses the receiver so undefined in strict mode, and arrows take this from where they were defined: module top level is undefined, inside nestedArrow it\'s obj. call overrides with other."*',
            },
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
          intent:
            'Tests whether you understand inheritance as delegation through linked objects rather than copying, and can separate `Fn.prototype` from an instance\'s `[[Prototype]]`. Strong answers trace a concrete chain and note what `class` adds beyond syntax.',
          hints: [
            'When you read `d.speak` and `d` has no own `speak`, where does the engine look next?',
            'Every object has one hidden link. Functions additionally have a normal property. Which is which: `__proto__` or `prototype`?',
            '`new Dog()` sets the new object\'s `[[Prototype]]` to `Dog.prototype`. `extends` links `Dog.prototype` to `Animal.prototype`.',
            'Near-answer: draw `d → Dog.prototype → Animal.prototype → Object.prototype → null`, then list what `class` adds: strict mode, must use `new`, `super`, `#private`, TDZ.',
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
          intent:
            'Tests precise knowledge of `==` conversion rules, the `NaN` and `-0` edge cases, and reference equality. A strong answer explains each option by the rule that decides it and separates truthiness from loose equality.',
          hints: [
            'Take each option on its own and ask: does this operator convert types at all?',
            'For `==` with an object and a boolean: the boolean becomes a number, the object goes through `ToPrimitive` (`[]` → `""` → 0).',
            '`null == x` has a special rule: it is true only for `null` and `undefined`. And what is the one value not equal to itself under `===`?',
            'Near-answer: (a) 0 == 0, (b) special null rule, (c) NaN rule, (d) SameValue treats NaN as equal, (e) two distinct object references. Two are true.',
          ],
          walkthrough: [
            {
              title: 'Restate the rules',
              body: '`===` never converts. `==` converts: `null == undefined` only; booleans → numbers; objects → `ToPrimitive` (`valueOf`, then `toString`). `Object.is` is `===` except `NaN` equals `NaN` and `+0` ≠ `-0`.',
            },
            {
              title: 'Walk each option',
              body: '**a** `[] == false`: `false` → 0, `[]` → `""` → 0 → **true**. **b** `null == 0`: null only loosely equals undefined → false. **c** `NaN === NaN` → false. **d** `Object.is(NaN, NaN)` → **true**. **e** two different objects → false.',
            },
            {
              title: 'Connect to reference semantics',
              body: 'Objects compare by identity. Spread is a **shallow** copy (nested objects shared); `structuredClone` is deep. That is why frameworks need immutable updates or proxies to notice changes.',
            },
            {
              title: 'Say it in the interview',
              body: '*"a and d. The empty array is truthy, but == doesn\'t use truthiness: both sides go to 0. null only equals undefined loosely. NaN isn\'t equal to itself except under Object.is, which React uses. Objects compare by reference. In code I use === everywhere, plus x == null as a nullish check."*',
            },
          ],
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
          intent:
            'The classic event-loop trace. The interviewer wants the exact order and, more importantly, the model behind it: sync code first (including the start of an async function), then the whole microtask queue in FIFO order, then one macrotask.',
          hints: [
            'First list only the synchronous logs. Remember an async function runs synchronously until its first `await`.',
            'Now write the microtask queue in the order items are **added**: which callbacks are queued during the synchronous phase?',
            'A chained `.then(4)` is not queued up front; it is queued only when `.then(3)` finishes. Timers wait until the microtask queue is empty.',
            'Near-answer: sync = `1 6 8`; microtasks queued = `[3, 5, 7]`, and running 3 appends ___; macrotask last = ___.',
          ],
          walkthrough: [
            {
              title: 'Run the synchronous phase',
              body: 'Logs `1`. Registers the timer. `Promise.resolve().then(3)` **queues** 3 (the promise is already resolved). `queueMicrotask` queues 5. The async IIFE logs `6` and `await null` queues its continuation 7. Logs `8`. So far: **1 6 8**.',
            },
            {
              title: 'Drain the microtask queue',
              body: 'Queue is `[3, 5, 7]`. Run 3 → its returned promise resolves → **4 is appended** → `[5, 7, 4]`. Run 5, 7, 4. All microtasks drain, including ones added during draining: **3 5 7 4**.',
            },
            {
              title: 'Run the next macrotask',
              body: 'Only now does the timer callback run: **2**. Final: `1 6 8 3 5 7 4 2`.',
            },
            {
              title: 'Model and edge cases',
              body: 'Microtasks: promise reactions, `await` continuations, `queueMicrotask`, `MutationObserver`. Macrotasks: timers, I/O, events. Browsers can render **between** tasks, never mid-drain. Node: `process.nextTick` runs before promise microtasks; libuv runs phases.',
            },
            {
              title: 'Say it in the interview',
              body: '*"Sync first: 1, 6 because the async function runs until await, then 8. Then the whole microtask queue in order, 3, 5, 7, and 4 joins the end once 3 resolves. Then one macrotask: the timer, 2."*',
            },
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
          intent:
            'Tests whether you pick combinators by failure semantics, not by habit. A strong answer splits critical and optional data, knows that a rejection does not cancel the other promises, and reaches for AbortSignal for real cancellation and timeouts.',
          hints: [
            'Ask the product question first: is the page useless if recommendations fail? If not, should their failure fail everything?',
            'Map each combinator to "resolves when" and "rejects when". Which one never rejects?',
            'When `Promise.all` rejects early, are the other `fetch` calls stopped? What would actually stop them?',
            'Near-answer: `const [user, orders] = await Promise.all([...critical])`; `const [recs] = await Promise.allSettled([...optional])`; use `recs.status === \'fulfilled\' ? recs.value : []`; timeouts via `AbortSignal.timeout(ms)`.',
          ],
          walkthrough: [
            {
              title: 'Restate and clarify',
              body: 'Three parallel loads; the question is **what happens when one fails**. Ask which parts the page cannot render without. Usually user and orders are critical, recommendations are optional.',
            },
            {
              title: 'Map combinators to failure semantics',
              body: '`all`: fulfils with all results in order, rejects on the **first** rejection. `allSettled`: never rejects, gives `{ status, value | reason }`. `race`: first to settle either way (timeouts). `any`: first to fulfil, `AggregateError` if all fail (fallbacks/mirrors).',
            },
            {
              title: 'Build it',
              body: `\`\`\`ts
const [user, orders] = await Promise.all([getUser(id), getOrders(id)])
const [recs] = await Promise.allSettled([getRecommendations(id)])
const recommendations = recs.status === 'fulfilled' ? recs.value : []
\`\`\`
Start both groups before awaiting if they are independent.`,
            },
            {
              title: 'Edge cases and trade-offs',
              body: 'A rejection in `all` does **not** cancel the others; pass an `AbortSignal` and abort on failure. Prefer `AbortSignal.timeout(5000)` over `race` with a timer because it cancels the request. Every promise needs a handler or Node exits on `unhandledrejection`.',
            },
            {
              title: 'Say it in the interview',
              body: '*"Critical data goes through Promise.all so we fail fast; optional widgets go through allSettled so one flaky service doesn\'t blank the page. Promises aren\'t cancellable, so I wire AbortController for timeouts and early failure."*',
            },
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
          intent:
            'Tests whether you know `forEach` ignores returned promises and why the surrounding try/catch cannot see the rejections. A strong answer explains both symptoms, offers sequential and parallel fixes, and mentions bounding concurrency.',
          hints: [
            'An `async` callback returns a promise. What does `forEach` do with the return value of its callback?',
            'If nobody awaits those promises, when does `\'all saved\'` log, and where do later rejections end up relative to the `try` block?',
            'You need something that gives you the promises back: `for...of` with `await` (sequential), or `map` + `Promise.all/allSettled` (parallel).',
            'Near-answer: `for (const user of users) await api.save(user)` inside the try, or `const results = await Promise.allSettled(users.map((u) => api.save(u)))` and then count `r.status === \'rejected\'`.',
          ],
          walkthrough: [
            {
              title: 'Restate the symptoms',
              body: 'Two bugs: "all saved" logs **before** saves finish, and errors **never reach** `catch`. Both point to the promises not being awaited.',
            },
            {
              title: 'Find the cause',
              body: '`forEach` calls the async callback, gets a promise back and **throws it away**. It returns synchronously, so the log runs immediately. Rejections happen later, after `try` has exited, so they become **unhandled rejections**.',
            },
            {
              title: 'Fix it two ways',
              body: `\`\`\`js
// sequential: order or rate limits matter
for (const user of users) await api.save(user)

// parallel: faster, collect failures
const results = await Promise.allSettled(users.map((u) => api.save(u)))
const failed = results.filter((r) => r.status === 'rejected')
\`\`\`
Use \`Promise.all\` if one failure should fail the whole operation.`,
            },
            {
              title: 'Edge cases and trade-offs',
              body: '`await users.forEach(...)` does nothing (`forEach` returns `undefined`). `filter`/`some`/`reduce` with async callbacks are also broken; `filter` sees every promise as truthy. Thousands of items need a **concurrency limit**, not unbounded `map`.',
            },
            {
              title: 'Say it in the interview',
              body: '*"forEach discards the promises, so the function finishes immediately and the rejections fire outside the try. I\'d use for...of if order or rate limits matter, otherwise map plus allSettled, and a pool if the batch is large."*',
            },
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
          intent:
            'Tests concurrency control with promises and an accurate model of the single-threaded event loop. A strong answer uses N workers pulling from a shared cursor (not fixed batches), writes results by index, and states an explicit error policy.',
          hints: [
            'Fixed batches of `limit` (await a batch, then the next) are easy but leave slots idle waiting for the slowest. What keeps every slot busy?',
            'Start `limit` async **workers**. Each one loops: claim the next index, await `fn`, repeat until none are left.',
            'The claim `const i = next++` is synchronous, so two workers can never get the same index. Store `results[i]` to keep input order.',
            'Skeleton: `async function worker() { while (next < items.length) { const i = next++; results[i] = await fn(___, i) } } await Promise.all(Array.from({ length: Math.min(limit, items.length) }, ___)); return results`',
          ],
          walkthrough: [
            {
              title: 'Restate and clarify',
              body: 'Run `fn` over all items, never more than `limit` in flight, results in **input** order. Ask: on error, fail fast or collect? Is `limit` ≥ 1? Empty input → `[]`.',
            },
            {
              title: 'Choose the design',
              body: '**Worker pool**: `limit` workers share a cursor and pull work. Unlike fixed batches, a fast worker immediately picks the next item, so throughput is not bounded by the slowest call in each batch.',
            },
            {
              title: 'Build it',
              body: `\`\`\`ts
async function mapWithConcurrency<T, R>(
  items: readonly T[], limit: number, fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length)
  let next = 0
  async function worker() {
    while (next < items.length) {
      const i = next++
      results[i] = await fn(items[i], i)
    }
  }
  await Promise.all(Array.from({ length: Math.max(1, Math.min(limit, items.length)) }, worker))
  return results
}
\`\`\``,
            },
            {
              title: 'Edge cases and trade-offs',
              body: 'No race on `next`: JavaScript runs one piece of code at a time. The first rejection rejects `Promise.all`, but other workers keep going; catch inside the worker for `allSettled` style, or share an `AbortController`. Concurrency limit ≠ rate limit (token bucket).',
            },
            {
              title: 'Say it in the interview',
              body: '*"I start limit workers that each pull the next index from a shared counter. Claiming the index is synchronous, so there\'s no race, and writing by index keeps order. I\'d make the error policy explicit and add AbortSignal for cancellation."*',
            },
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
          intent:
            'Tests closures and timers (debounce/throttle), choosing between them by use case, and spotting that debounce does not fix out-of-order responses. A strong answer fixes the race with AbortController or a request id and places cleanup in the framework lifecycle.',
          hints: [
            'Debounce: what state must survive between calls, and what should every call do to it?',
            'Throttle: remember when you last ran; ignore calls until `interval` ms have passed.',
            'The race: two requests are in flight. Which one finishes last, and does debounce control that?',
            'Near-answer: `controller?.abort(); controller = new AbortController(); fetch(url, { signal: controller.signal })`, and ignore `AbortError` in the catch. Or keep `const id = ++latest` and drop responses where `id !== latest`.',
          ],
          walkthrough: [
            {
              title: 'Restate and clarify',
              body: 'Two utilities plus a bug: **debounce** fires after `wait` ms of silence, **throttle** at most once per interval, and a debounced search sometimes shows **older** results. Ask whether leading/trailing options are needed.',
            },
            {
              title: 'Build debounce and throttle',
              body: `\`\`\`ts
function debounce<A extends unknown[]>(fn: (...args: A) => void, wait: number) {
  let timer: ReturnType<typeof setTimeout> | undefined
  const d = (...args: A) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), wait) }
  d.cancel = () => clearTimeout(timer)
  return d
}

function throttle<A extends unknown[]>(fn: (...args: A) => void, interval: number) {
  let last = 0
  return (...args: A) => {
    const now = Date.now()
    if (now - last >= interval) { last = now; fn(...args) }
  }
}
\`\`\``,
            },
            {
              title: 'Diagnose the race',
              body: 'Debounce reduces **how many** requests go out, not **when they return**. A slow response for `"rea"` can land after a fast one for `"react"` and overwrite it. That is a race condition, not a timing-constant problem.',
            },
            {
              title: 'Fix it',
              body: `\`\`\`ts
let controller: AbortController | undefined
async function search(q: string) {
  controller?.abort()
  controller = new AbortController()
  try {
    const res = await fetch(\`/api/search?q=\${encodeURIComponent(q)}\`, { signal: controller.signal })
    render(await res.json())
  } catch (err) {
    if ((err as Error).name !== 'AbortError') throw err
  }
}
\`\`\`
If the work cannot be aborted, use a request id and ignore stale responses.`,
            },
            {
              title: 'Say it in the interview',
              body: '*"Debounce resets a timer per call; throttle gates on the last run time. Search gets debounce, scroll gets throttle or rAF. Debounce doesn\'t order responses, so I abort the previous request, in React in the effect cleanup, in Vue with onWatcherCleanup."*',
            },
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
          intent:
            'Tests whether you reason about leaks as "still reachable but no longer needed", can name the usual culprits in SPAs and Node workers, and know what weak collections do and do not guarantee. Strong answers end with how to diagnose a leak.',
          hints: [
            'The GC does not know what you still need. What property of an object decides whether it can be collected?',
            'List things that keep references alive after a component or job is "done": listeners, timers, caches, closures, detached DOM.',
            'A `WeakMap` key does not keep its object alive. Why does that make weak collections non-iterable with no `size`?',
            'Near-answer: reachability from roots → generational mark-and-sweep → leak sources list → Map/Set vs WeakMap/WeakSet table → heap-snapshot comparison in DevTools.',
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
          intent:
            'Tests whether you can turn cursor pagination into a lazy stream with an async generator and explain the iterator protocol underneath. A strong answer fetches pages only on demand and knows that `break` triggers `return()` and `finally`.',
          hints: [
            'The caller wants `for await (const item of ...)`. Which kind of function produces an async iterable directly?',
            'Inside `async function*`, loop: fetch a page with the current cursor, yield its items, move to `nextCursor`, stop when it is `null`.',
            '`yield* page.items` yields each item of an array. A `do...while` handles the first request with a `null` cursor.',
            'Skeleton: `async function* allItems(fetchPage) { let cursor = null; do { const page = await fetchPage(cursor); yield* ___; cursor = ___ } while (cursor) }`',
          ],
          walkthrough: [
            {
              title: 'Restate and clarify',
              body: 'Wrap a cursor-paginated API so callers can iterate every item with `for await`. Ask: should pages be fetched lazily (yes, usually)? What does the first request send as a cursor?',
            },
            {
              title: 'Choose the tool',
              body: 'An **async generator** (`async function*`) is both the producer and an async iterable. `yield` pauses until the consumer asks for the next value, so pages are fetched **on demand**.',
            },
            {
              title: 'Build it',
              body: `\`\`\`ts
async function* allItems<T>(
  fetchPage: (cursor: string | null) => Promise<{ items: T[]; nextCursor: string | null }>,
): AsyncGenerator<T> {
  let cursor: string | null = null
  do {
    const page = await fetchPage(cursor)
    yield* page.items
    cursor = page.nextCursor
  } while (cursor)
}
\`\`\``,
            },
            {
              title: 'Protocol and edge cases',
              body: 'Iterable: `[Symbol.asyncIterator]()` returns an iterator whose `next()` resolves to `{ value, done }`. `break` in the consumer calls `return()`, so `finally` blocks run and no more pages are fetched. Collecting all pages into an array first defeats laziness.',
            },
            {
              title: 'Say it in the interview',
              body: '*"An async generator gives a lazy stream: fetch a page, yield its items, follow the cursor. The consumer pulls, so breaking early stops fetching. Underneath it\'s just an object with next() returning value and done."*',
            },
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
          intent:
            'Tests whether you understand that ESM is static and CommonJS is a runtime function call, and can connect that to tree-shaking, code splitting and real Node interop problems. Strong answers use a concrete packaging example.',
          hints: [
            'Can a bundler know what `require(name)` returns before the code runs? Can it know what `import { x } from \'y\'` imports?',
            'Compare what each gives you: a live binding to the exporter\'s variable, or a copy of `module.exports` at require time.',
            'Think Node interop: the `"type"` field, `.mjs`/`.cjs`, conditional `"exports"`, and what Node 22+ changed about `require()` of ESM.',
            'Near-answer: static vs dynamic → tree-shaking (+ `"sideEffects": false`) → dynamic `import()` for code splitting → interop table and the dual-package hazard.',
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
    {
      id: 'js-machine-coding',
      title: 'Machine coding: polyfills & utilities',
      summary: 'Live-coding classics in TypeScript: Promise.all/allSettled, a typed EventEmitter, deepClone with cycles, curry and memoize, a retrying fetch with timeouts and AbortController, and an LRU cache.',
      questions: [
        {
          id: 'js-mc-promise-all',
          title: 'Implement Promise.all (and how allSettled differs)',
          type: 'coding',
          difficulty: 'core',
          priority: 'must',
          tags: ['machine-coding', 'promises', 'polyfill', 'async'],
          estMinutes: 20,
          roles: ['full-stack', 'frontend', 'backend'],
          prompt: `*"Without using \`Promise.all\`, write \`promiseAll(values)\`. It must keep the input order, accept plain values as well as promises, reject on the first rejection, and resolve an empty input immediately. Then write \`promiseAllSettled\` and tell me when you would pick each."*`,
          intent: 'Tests whether you understand promise settlement well enough to rebuild a combinator: order by index (not by completion), a counter instead of array length, wrapping non-promises, and the empty-input edge case. A strong answer also explains fail-fast vs collect-everything semantics.',
          hints: [
            'Results finish in any order, but the output must match the input order. What do you store, and where?',
            'You cannot use `results.length` to know when you are done, because `results[3] = x` makes length 4. Keep a separate counter.',
            'Wrap every item with `Promise.resolve(item)` so plain values and thenables work. What happens with zero items?',
            `Skeleton: \`new Promise((resolve, reject) => { const items = Array.from(values); let left = items.length; if (!left) return resolve([]); items.forEach((it, i) => Promise.resolve(it).then(v => { out[i] = v; if (--left === 0) resolve(out) }, reject)) })\`.`,
          ],
          answer: `**Direct answer:** create one outer promise, store each result **at its index**, count down a \`remaining\` counter, and pass \`reject\` straight through so the first rejection wins.

\`\`\`ts
export function promiseAll<T>(values: Iterable<T | PromiseLike<T>>): Promise<Awaited<T>[]> {
  return new Promise((resolve, reject) => {
    const items = Array.from(values)          // accept any iterable, not only arrays
    const results = new Array<Awaited<T>>(items.length)
    let remaining = items.length
    if (remaining === 0) return resolve(results) // empty input resolves immediately

    items.forEach((item, i) => {
      Promise.resolve(item).then((value) => {     // plain values and thenables work too
        results[i] = value as Awaited<T>          // keep input order
        if (--remaining === 0) resolve(results)
      }, reject)                                  // first rejection settles the outer promise
    })
  })
}

export function promiseAllSettled<T>(
  values: Iterable<T | PromiseLike<T>>,
): Promise<PromiseSettledResult<Awaited<T>>[]> {
  // Turn every input into a promise that never rejects, then reuse promiseAll.
  return promiseAll(
    Array.from(values, (item) =>
      Promise.resolve(item).then(
        (value) => ({ status: 'fulfilled' as const, value }),
        (reason: unknown) => ({ status: 'rejected' as const, reason }),
      ),
    ),
  )
}
\`\`\`

**Why each detail matters:**
- **Index, not push:** promises settle in any order; \`push\` would order results by completion time.
- **Counter, not \`length\`:** assigning \`results[4]\` first makes \`length\` 5 immediately.
- **Calling \`resolve\`/\`reject\` again is harmless:** a promise settles once, so later rejections are ignored. That is exactly fail-fast.
- **No cancellation:** after a rejection, the other operations **keep running**. \`Promise.all\` cannot stop them. If you need that, pass an \`AbortSignal\` to the underlying work.

**When to use which:**
| | \`all\` | \`allSettled\` | \`any\` | \`race\` |
|---|---|---|---|---|
| Settles when | all fulfil, or first rejects | everything settles | first fulfils (or all reject: \`AggregateError\`) | first settles |
| Use for | "I need every result" | dashboards, batch jobs, partial failure reporting | fastest mirror | timeouts |`,
          walkthrough: [
            {
              title: 'Wrap everything in one outer promise',
              body: `Return \`new Promise((resolve, reject) => ...)\`. Convert the input with \`Array.from\` so any iterable works, and resolve \`[]\` straight away when it is empty.`,
            },
            {
              title: 'Store by index and count down',
              body: `For each item, \`Promise.resolve(item).then(...)\`, write \`results[i] = value\`, and decrement \`remaining\`. Resolve when it reaches 0. Do not use \`push\` or \`results.length\`.`,
            },
            {
              title: 'Pass rejection through',
              body: `Hand \`reject\` as the second \`.then\` argument. The first rejection settles the outer promise; later calls are ignored because a promise settles only once. Mention that other work keeps running.`,
            },
            {
              title: 'Derive allSettled',
              body: `Map each item to a promise that always fulfils with \`{ status, value }\` or \`{ status, reason }\`, then reuse \`promiseAll\`. Close by contrasting all / allSettled / any / race.`,
            },
          ],
          keyPoints: [
            'Results stored by index to preserve input order',
            'Separate counter; empty input resolves immediately',
            'Promise.resolve wraps plain values and thenables',
            'Fail-fast: first rejection wins, other work is not cancelled',
            'allSettled never rejects; returns status objects',
          ],
          pitfalls: [
            'Using push, which orders results by completion',
            'Checking results.length === items.length to detect completion',
            'Forgetting the empty-array case (the promise never settles)',
            'Believing Promise.all cancels the remaining operations',
          ],
          followUps: [
            'Implement Promise.any, including the AggregateError case.',
            'How would you limit concurrency to 3 at a time?',
          ],
          references: [
            { label: 'MDN: Promise.all()', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all' },
          ],
        },
        {
          id: 'js-mc-event-emitter',
          title: 'Implement a typed EventEmitter (on / off / once / emit)',
          type: 'coding',
          difficulty: 'core',
          priority: 'must',
          tags: ['machine-coding', 'event-emitter', 'pub-sub', 'typescript', 'polyfill'],
          estMinutes: 20,
          roles: ['full-stack', 'frontend', 'backend'],
          prompt: `*"Build a small EventEmitter in TypeScript with \`on\`, \`off\`, \`once\` and \`emit\`. \`on\` should return an unsubscribe function. Bonus: make event names and payloads type-safe."*`,
          intent: 'Tests data-structure choice and the two classic edge cases: removing a once listener by its original function, and a listener that unsubscribes itself during emit. A strong answer also types the event map so `emit` checks its arguments.',
          hints: [
            'What structure maps an event name to its listeners? Do you want to allow the same function twice?',
            'How will `off(event, fn)` find a listener that was registered with `once`? If you wrap `fn`, you lose the reference.',
            'What happens if a listener calls `off` on itself while you loop over the list?',
            `Shape: \`Map<event, Array<{ fn, once }>>\`; \`emit\` loops over a **copy** (\`[...list]\`), removes \`once\` entries before calling them; \`off\` compares \`entry.fn === fn\`. Type with \`class Emitter<E extends Record<string, unknown[]>>\` and \`emit<K extends keyof E>(event: K, ...args: E[K])\`.`,
          ],
          answer: `**Direct answer:** a \`Map\` from event name to an array of \`{ fn, once }\` entries. Storing a \`once\` flag (instead of a wrapper function) means \`off\` can always find the listener by the function the caller passed. \`emit\` iterates over a **snapshot** so listeners can unsubscribe during emit.

\`\`\`ts
type Listener<A extends unknown[]> = (...args: A) => void
type Entry = { fn: Listener<any[]>; once: boolean }

export class Emitter<Events extends Record<string, unknown[]>> {
  private listeners = new Map<keyof Events, Entry[]>()

  on<K extends keyof Events>(event: K, fn: Listener<Events[K]>): () => void {
    return this.add(event, { fn: fn as Listener<any[]>, once: false })
  }

  once<K extends keyof Events>(event: K, fn: Listener<Events[K]>): () => void {
    return this.add(event, { fn: fn as Listener<any[]>, once: true })
  }

  off<K extends keyof Events>(event: K, fn: Listener<Events[K]>): void {
    const list = this.listeners.get(event)
    const entry = list?.find((e) => e.fn === fn)
    if (entry) this.remove(event, entry)
  }

  emit<K extends keyof Events>(event: K, ...args: Events[K]): boolean {
    const list = this.listeners.get(event)
    if (!list?.length) return false
    for (const entry of [...list]) {          // snapshot: safe if listeners call off()
      if (entry.once) this.remove(event, entry) // remove first, so re-emitting inside fn is safe
      entry.fn(...args)
    }
    return true
  }

  private add(event: keyof Events, entry: Entry): () => void {
    const list = this.listeners.get(event) ?? []
    list.push(entry)
    this.listeners.set(event, list)
    return () => this.remove(event, entry)    // unsubscribes exactly this registration
  }

  private remove(event: keyof Events, entry: Entry): void {
    const list = this.listeners.get(event)
    if (!list) return
    const i = list.indexOf(entry)
    if (i !== -1) list.splice(i, 1)
    if (list.length === 0) this.listeners.delete(event) // no empty arrays left behind
  }
}

// Usage: payloads are checked at compile time
const bus = new Emitter<{ login: [userId: string]; logout: [] }>()
const stop = bus.on('login', (id) => console.log(id.toUpperCase()))
bus.emit('login', 'u_1')
// bus.emit('login', 42)  // type error
stop()
\`\`\`

**Design decisions to say out loud:**
- **Array, not Set:** Node's emitter allows the same function twice; a \`Set\` would dedupe. Either is fine if you state it.
- **Errors:** a throwing listener stops the loop and propagates out of \`emit\` (Node does the same). Wrap each call in \`try/catch\` if listeners must be isolated.
- **Memory:** unsubscribe in component unmount (\`onUnmounted\` / effect cleanup). Node warns at more than 10 listeners per event for this reason.`,
          walkthrough: [
            {
              title: 'Choose the data structure',
              body: `A \`Map<eventName, Entry[]>\` where an entry is \`{ fn, once }\`. Keeping the original \`fn\` lets \`off\` find \`once\` listeners too.`,
            },
            {
              title: 'Write add / remove helpers',
              body: `\`add\` pushes the entry and returns \`() => remove(event, entry)\`; \`remove\` splices by entry identity and deletes the key when the list is empty.`,
            },
            {
              title: 'Make emit safe',
              body: `Loop over \`[...list]\` so a listener can unsubscribe itself or others without skipping entries. Remove \`once\` entries **before** calling them.`,
            },
            {
              title: 'Add the types',
              body: `\`Emitter<E extends Record<string, unknown[]>>\` and \`emit<K extends keyof E>(event: K, ...args: E[K])\` make wrong payloads a compile error. Close with error isolation and memory-leak notes.`,
            },
          ],
          keyPoints: [
            'Map of event to listener list',
            'once tracked by a flag so off(original fn) still works',
            'emit iterates a snapshot',
            'on returns an unsubscribe function',
            'Typed event map with tuple payloads',
          ],
          pitfalls: [
            'Wrapping once listeners so off(fn) can no longer remove them',
            'Mutating the array while iterating it, which skips listeners',
            'Leaving empty arrays or never unsubscribing (leaks)',
          ],
          followUps: [
            'How would you support wildcard events like "user:*"?',
            'How does this relate to Vue\'s removed $on/$off and libraries like mitt?',
          ],
          personalAngle: 'Your Chrome extension work used message passing between content scripts and the background worker; that is the same pub/sub idea, and a good real example of why unsubscribing matters.',
          references: [
            { label: 'Node.js: Events', url: 'https://nodejs.org/api/events.html' },
          ],
        },
        {
          id: 'js-mc-deep-clone',
          title: 'Implement deepClone with cycles, Date, Map and Set',
          type: 'coding',
          difficulty: 'core',
          priority: 'must',
          tags: ['machine-coding', 'deep-clone', 'recursion', 'weakmap', 'structured-clone'],
          estMinutes: 20,
          roles: ['full-stack', 'frontend', 'backend'],
          prompt: `*"Write \`deepClone(value)\`. It must handle nested objects and arrays, \`Date\`, \`Map\`, \`Set\`, and **circular references**. Then tell me why you would or would not just use \`structuredClone\` or \`JSON.parse(JSON.stringify(x))\`."*`,
          intent: 'Tests recursion with a visited map, type-by-type handling, and knowing the built-in alternatives and their limits. A strong answer registers the clone in the WeakMap before recursing, so cycles and shared references are preserved.',
          hints: [
            'Start with the base case: which values can you return as they are?',
            'A cycle means `a.self === a`. How do you remember objects you have already cloned?',
            'When must you store the new object in that map: before or after copying its children?',
            `Skeleton: \`if (v === null || typeof v !== "object") return v; if (seen.has(v)) return seen.get(v); if (v instanceof Date) ...; if (v instanceof Map) { const out = new Map(); seen.set(v, out); v.forEach((val, k) => out.set(deepClone(k, seen), deepClone(val, seen))); return out }\` and the same pattern for Set, arrays and plain objects.`,
          ],
          answer: `**Direct answer:** recurse by type and keep a \`WeakMap\` from original to clone. Put the clone into the map **before** copying children; that single line handles both cycles and shared references.

\`\`\`ts
export function deepClone<T>(value: T, seen = new WeakMap<object, unknown>()): T {
  // Primitives and functions are returned as is (functions are shared, not copied).
  if (value === null || typeof value !== 'object') return value
  if (seen.has(value)) return seen.get(value) as T

  if (value instanceof Date) return new Date(value.getTime()) as T
  if (value instanceof RegExp) return new RegExp(value.source, value.flags) as T

  if (value instanceof Map) {
    const out = new Map()
    seen.set(value, out)                       // register before recursing
    value.forEach((v, k) => out.set(deepClone(k, seen), deepClone(v, seen)))
    return out as T
  }
  if (value instanceof Set) {
    const out = new Set()
    seen.set(value, out)
    value.forEach((v) => out.add(deepClone(v, seen)))
    return out as T
  }
  if (Array.isArray(value)) {
    const out: unknown[] = []
    seen.set(value, out)
    value.forEach((v, i) => { out[i] = deepClone(v, seen) })
    return out as T
  }

  // Plain objects and class instances: keep the prototype, copy own keys (including symbols).
  const out = Object.create(Object.getPrototypeOf(value)) as Record<PropertyKey, unknown>
  seen.set(value, out)
  for (const key of Reflect.ownKeys(value)) {
    out[key] = deepClone((value as Record<PropertyKey, unknown>)[key], seen)
  }
  return out as T
}

const a: any = { d: new Date(), m: new Map([[1, { x: 1 }]]) }
a.self = a
const b = deepClone(a)
console.log(b.self === b, b.d !== a.d, b.m.get(1) !== a.m.get(1)) // true true true
\`\`\`

**Why \`WeakMap\`:** keys are objects, and it does not keep the originals alive after the call.

**Limits of this version:** getters are invoked and stored as plain values, non-enumerable properties become enumerable, and class instances with private \`#fields\` cannot be copied from outside.

**Built-in alternatives:**
- **\`structuredClone\`** (browsers, Node 17+): handles cycles, \`Date\`, \`Map\`, \`Set\`, typed arrays and more. It **throws** on functions and DOM nodes and **drops prototypes**, so class instances come back as plain objects. In production, use it first.
- **\`JSON.parse(JSON.stringify(x))\`:** loses \`undefined\`, functions and symbols, turns \`Date\` into a string, \`Map\`/\`Set\` into \`{}\`, and **throws on cycles**. Only good for plain JSON data.`,
          walkthrough: [
            {
              title: 'Handle the base cases',
              body: `\`null\` and anything that is not an object (primitives, functions) is returned as is. Then check the \`seen\` WeakMap and return the existing clone if present.`,
            },
            {
              title: 'Branch by type',
              body: `\`Date\` and \`RegExp\` are rebuilt from their values. For \`Map\`, \`Set\`, arrays and objects, create an empty container first.`,
            },
            {
              title: 'Register before recursing',
              body: `\`seen.set(original, clone)\` happens **before** children are copied. That is what makes \`a.self = a\` terminate and keeps shared references shared.`,
            },
            {
              title: 'Compare with built-ins',
              body: `\`structuredClone\` is the production default (cycles, Map, Set, Date) but throws on functions and drops prototypes; the JSON trick loses types and throws on cycles.`,
            },
          ],
          keyPoints: [
            'Recursive by type with a WeakMap of visited objects',
            'Clone registered before children are copied',
            'Date/RegExp rebuilt; Map keys and values both cloned',
            'structuredClone as the built-in, with its limits',
            'JSON round-trip loses types and fails on cycles',
          ],
          pitfalls: [
            'Setting seen after recursion, which causes infinite recursion on cycles',
            'Using a plain object as the visited map (keys become "[object Object]")',
            'Claiming structuredClone copies functions or class prototypes',
          ],
          followUps: [
            'How would you make it iterative to avoid stack overflow on very deep data?',
            'Why does Vue\'s reactive proxy break structuredClone, and how do you work around it (toRaw)?',
          ],
          references: [
            { label: 'MDN: structuredClone()', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone' },
          ],
        },
        {
          id: 'js-mc-curry-memoize',
          title: 'Implement curry and memoize (with a cache key)',
          type: 'coding',
          difficulty: 'core',
          priority: 'should',
          tags: ['machine-coding', 'curry', 'memoize', 'closures', 'higher-order-functions'],
          estMinutes: 20,
          roles: ['full-stack', 'frontend', 'backend'],
          prompt: `*"Write \`curry(fn)\` so that \`curry(add3)(1)(2)(3)\`, \`(1, 2)(3)\` and \`(1)(2, 3)\` all work. Then write \`memoize(fn, options)\` with a configurable **cache key** and a size limit. How does your memoize behave with object arguments and with async functions?"*`,
          intent: 'Tests closures and argument accumulation (curry), and cache-key design (memoize): what makes two calls "the same", unbounded growth, and caching rejected promises. A strong answer names the limits of fn.length and JSON.stringify keys.',
          hints: [
            'curry: how do you know when enough arguments have been collected?',
            'curry: return a function that keeps the arguments collected so far and asks for more.',
            'memoize: the default key `JSON.stringify(args)` works for primitives. What breaks with objects, `undefined`, or a function that returns `undefined`?',
            `Skeleton: \`curried(...args) { return args.length >= arity ? fn(...args) : (...more) => curried(...args, ...more) }\`; memoize keeps \`Map<string, R>\`, uses \`cache.has(k)\` (not a truthy check), evicts the oldest key when \`size > max\`, and deletes the entry if a cached promise rejects.`,
          ],
          answer: `**curry:** collect arguments until there are \`arity\` of them, then call \`fn\`.

\`\`\`ts
export function curry<R>(fn: (...args: any[]) => R, arity = fn.length) {
  return function curried(...args: unknown[]): any {
    if (args.length >= arity) return fn(...args)
    return (...more: unknown[]) => curried(...args, ...more)
  }
}

const add3 = (a: number, b: number, c: number) => a + b + c
const c = curry(add3)
c(1)(2)(3) === c(1, 2)(3) && c(1)(2, 3) === 6 // true
\`\`\`
\`fn.length\` ignores parameters with defaults and rest parameters, so \`(a, b = 1) => ...\` has length 1. That is why \`arity\` is a parameter.

**memoize:** cache by a key function, check with \`has\` (so \`undefined\` results are cached too), bound the size, and do not keep failed promises.

\`\`\`ts
type MemoOptions<A extends unknown[]> = {
  key?: (...args: A) => string
  maxSize?: number
}

export function memoize<A extends unknown[], R>(
  fn: (...args: A) => R,
  { key = (...args) => JSON.stringify(args), maxSize = 1000 }: MemoOptions<A> = {},
) {
  const cache = new Map<string, R>()

  const memo = (...args: A): R => {
    const k = key(...args)
    if (cache.has(k)) return cache.get(k) as R

    const result = fn(...args)
    cache.set(k, result)
    if (cache.size > maxSize) cache.delete(cache.keys().next().value as string) // drop oldest

    if (result instanceof Promise) {
      result.catch(() => cache.delete(k)) // a rejected call can be retried later
    }
    return result
  }
  memo.clear = () => cache.clear()
  return memo
}

const getUser = memoize((id: string) => fetch(\`/api/users/\${id}\`).then((r) => r.json()), {
  key: (id) => id,
  maxSize: 200,
})
\`\`\`

**Cache-key trade-offs:**
- \`JSON.stringify\` treats \`{a:1,b:2}\` and \`{b:2,a:1}\` as different keys, turns \`undefined\` into \`null\` in arrays, and throws on cycles, \`BigInt\`, and so on.
- For **object identity** (same object means same result), use a \`WeakMap\` keyed by the object, so entries disappear with the object.
- Caching the **promise** (not the resolved value) also dedupes concurrent calls: two callers in the same tick share one request.
- Memoize only **pure** functions, or accept staleness explicitly (add a TTL).`,
          walkthrough: [
            {
              title: 'Write curry with an accumulator',
              body: `\`curried(...args)\` calls \`fn\` when \`args.length >= arity\`; otherwise it returns \`(...more) => curried(...args, ...more)\`. Mention why \`arity\` defaults to \`fn.length\` but can be overridden.`,
            },
            {
              title: 'Build the memo core',
              body: `Compute \`k = key(...args)\`; return the cached value when \`cache.has(k)\`; otherwise call \`fn\`, store, return. Use \`has\`, not \`if (cache.get(k))\`, so falsy results are cached.`,
            },
            {
              title: 'Bound and fix async',
              body: `Evict the oldest key when the size limit is exceeded (a Map keeps insertion order). Store the promise for in-flight dedupe, and delete it on rejection.`,
            },
            {
              title: 'Discuss the key',
              body: `JSON keys depend on property order and fail on cycles; WeakMap gives identity semantics. Only memoize pure functions or add a TTL.`,
            },
          ],
          keyPoints: [
            'curry accumulates args via closure until arity is reached',
            'fn.length ignores default and rest params',
            'cache.has, not a truthy check',
            'Bounded cache; evict oldest',
            'Cache promises for dedupe; evict on rejection',
          ],
          pitfalls: [
            'Unbounded memo cache in a long-running server (memory leak)',
            'Caching a rejected promise forever',
            'Using JSON.stringify keys for objects without discussing order and identity',
          ],
          followUps: [
            'Turn the size limit into a true LRU. What changes?',
            'How do Vue computed and React useMemo differ from a general memoize?',
          ],
        },
        {
          id: 'js-mc-fetch-retry-timeout',
          title: 'fetch wrapper: retry with exponential backoff, timeout and AbortController',
          type: 'coding',
          difficulty: 'advanced',
          priority: 'must',
          tags: ['machine-coding', 'fetch', 'abort-controller', 'retry', 'backoff', 'resilience'],
          estMinutes: 30,
          roles: ['full-stack', 'frontend', 'backend'],
          prompt: `*"Write \`fetchWithRetry(url, init, options)\`. Each attempt has its own **timeout**. Retry network errors, timeouts, 429 and 5xx with **exponential backoff and jitter** (respect \`Retry-After\`). Do **not** retry other 4xx. The caller can **cancel** everything with an \`AbortSignal\`, including during the wait between attempts."*`,
          intent: 'Tests real-world async control flow: per-attempt timeouts vs a user cancel, which failures are retryable, backoff with jitter, and cleanup. A strong answer also raises idempotency: retrying a POST can duplicate side effects.',
          hints: [
            'Split failures into two groups: worth retrying (network, timeout, 429, 5xx) and final (other 4xx, caller cancelled).',
            'Per-attempt timeout and user cancellation are two different signals. How can a single fetch listen to both?',
            'Backoff: `base * 2 ** attempt`, capped, with random jitter so many clients do not retry at the same moment. The sleep must also stop when the caller aborts.',
            `Skeleton: \`for (let attempt = 0; ; attempt++) { const signal = AbortSignal.any([userSignal, AbortSignal.timeout(ms)]); try { const res = await fetch(url, { ...init, signal }); if (res.ok || !retryable(res.status) || attempt >= retries) return res; await sleep(delay, userSignal) } catch (e) { if (userSignal?.aborted || attempt >= retries) throw e; await sleep(delay, userSignal) } }\`.`,
          ],
          answer: `**Direct answer:** loop over attempts. Combine the caller's signal with a fresh per-attempt \`AbortSignal.timeout()\` using \`AbortSignal.any()\`. Return final responses, retry retryable ones after a jittered, capped, abortable sleep, and never retry once the caller has aborted.

\`\`\`ts
type RetryOptions = {
  retries?: number      // extra attempts after the first
  timeoutMs?: number    // per attempt
  baseDelayMs?: number
  maxDelayMs?: number
  signal?: AbortSignal  // caller cancellation
}

const RETRYABLE = (status: number) => status === 408 || status === 429 || status >= 500

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason)
    const onAbort = () => { clearTimeout(id); reject(signal!.reason) }
    const id = setTimeout(() => { signal?.removeEventListener('abort', onAbort); resolve() }, ms)
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

export async function fetchWithRetry(
  url: string,
  init: RequestInit = {},
  { retries = 3, timeoutMs = 5000, baseDelayMs = 300, maxDelayMs = 5000, signal }: RetryOptions = {},
): Promise<Response> {
  // "Full jitter": random delay between 0 and the capped exponential value.
  const backoff = (attempt: number) => Math.random() * Math.min(maxDelayMs, baseDelayMs * 2 ** attempt)

  for (let attempt = 0; ; attempt++) {
    const timeout = AbortSignal.timeout(timeoutMs)
    const attemptSignal = signal ? AbortSignal.any([signal, timeout]) : timeout

    try {
      const res = await fetch(url, { ...init, signal: attemptSignal })
      if (res.ok || !RETRYABLE(res.status) || attempt >= retries) return res // caller checks res.ok

      const retryAfterSec = Number(res.headers.get('retry-after')) // seconds form only
      await res.body?.cancel()                                     // free the connection
      await sleep(retryAfterSec > 0 ? Math.min(retryAfterSec * 1000, maxDelayMs) : backoff(attempt), signal)
    } catch (err) {
      if (signal?.aborted) throw err   // the caller cancelled: never retry
      if (attempt >= retries) throw err // TypeError (network) or TimeoutError, out of attempts
      await sleep(backoff(attempt), signal)
    }
  }
}

// Usage in a component: cancel on unmount
const controller = new AbortController()
fetchWithRetry('/api/report', {}, { signal: controller.signal, retries: 2 })
// onUnmounted(() => controller.abort())
\`\`\`

**Points to raise without being asked:**
- **Idempotency:** retry \`GET\`/\`PUT\`/\`DELETE\` freely. Retry \`POST\` only with an \`Idempotency-Key\` header the server honours; otherwise a timeout after the server committed creates a duplicate order.
- **Timeout vs cancel:** a timeout raises a \`TimeoutError\` \`DOMException\` and is retryable; a user abort is final. Checking \`signal.aborted\` tells them apart.
- **Request bodies:** a \`ReadableStream\` body cannot be sent twice; strings, \`FormData\` and \`Blob\` can.
- **Jitter** prevents a thundering herd when a server recovers. Also cap the total time, not only the attempt count, for user-facing calls.`,
          walkthrough: [
            {
              title: 'Classify the outcomes',
              body: `Final: \`res.ok\`, 4xx other than 408/429, the caller aborted, or attempts exhausted. Retryable: network \`TypeError\`, per-attempt timeout, 408, 429, 5xx.`,
            },
            {
              title: 'Wire the signals',
              body: `Each attempt gets \`AbortSignal.timeout(timeoutMs)\`, combined with the caller's signal via \`AbortSignal.any([...])\`. Pass that to \`fetch\`.`,
            },
            {
              title: 'Write an abortable backoff',
              body: `Delay \`random() * min(max, base * 2 ** attempt)\` (full jitter), or \`Retry-After\` when present. \`sleep(ms, signal)\` clears its timer and rejects on abort, so cancel works between attempts too.`,
            },
            {
              title: 'Assemble the loop',
              body: `\`for (attempt = 0; ; attempt++)\` with \`try { fetch; return or sleep } catch { rethrow if aborted or exhausted; sleep }\`. Cancel unused bodies with \`res.body?.cancel()\`.`,
            },
            {
              title: 'Raise idempotency',
              body: `Say that POST retries need an \`Idempotency-Key\`, and that stream bodies cannot be replayed. This is what separates a senior-sounding answer.`,
            },
          ],
          keyPoints: [
            'Per-attempt timeout combined with caller signal (AbortSignal.any)',
            'Retry only network errors, timeouts, 408/429/5xx',
            'Exponential backoff, capped, with jitter; honour Retry-After',
            'Caller abort is final, including during the sleep',
            'Non-idempotent requests need an Idempotency-Key',
          ],
          pitfalls: [
            'One timeout for the whole operation, so a slow first attempt eats all retries',
            'Retrying 400/401/404, which never succeed',
            'A sleep that ignores abort, so cancelled requests keep retrying',
            'Expecting fetch to reject on HTTP 500 (it resolves)',
          ],
          followUps: [
            'Where would a circuit breaker fit, and how is it different from retries?',
            'How would TanStack Query or Vue Query retry settings replace parts of this?',
          ],
          personalAngle: 'Your scraping jobs had recovery and restart logic; describe which failures you retried, how you spaced the retries, and which errors you treated as final.',
          references: [
            { label: 'MDN: AbortSignal.any()', url: 'https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/any_static' },
          ],
        },
        {
          id: 'js-mc-lru-cache',
          title: 'Implement an LRU cache with a Map',
          type: 'coding',
          difficulty: 'core',
          priority: 'should',
          tags: ['machine-coding', 'lru', 'cache', 'map', 'data-structures'],
          estMinutes: 15,
          roles: ['full-stack', 'frontend', 'backend'],
          prompt: `*"Implement \`LRUCache<K, V>\` with a fixed capacity: \`get(key)\` and \`set(key, value)\` in **O(1)**. When it is full, \`set\` evicts the least recently used entry. Reading a key counts as using it."*`,
          intent: 'Tests whether you know that a JS Map keeps insertion order and can use delete-and-reinsert to move a key to the "most recent" end. A strong answer states the complexity, handles updates to existing keys, and can explain the hash map + doubly linked list version used in other languages.',
          hints: [
            'You need two things: fast lookup by key, and the order of use. Which built-in JS structure gives you both?',
            'A `Map` iterates in insertion order. How do you make an existing key the newest?',
            'Which key is the oldest, and how do you get it without looping over the whole map?',
            'Skeleton: `get`: if present, `delete` then `set` again and return the value. `set`: if the key exists, `delete` it; else if `size >= capacity`, `delete(this.map.keys().next().value)`; then `set`.',
          ],
          answer: `**Direct answer:** a \`Map\` already keeps keys in insertion order. Treat the **first** key as least recently used and the **last** as most recently used. "Touching" a key means deleting and re-inserting it. All operations are O(1).

\`\`\`ts
export class LRUCache<K, V> {
  private map = new Map<K, V>()

  constructor(private readonly capacity: number) {
    if (!Number.isInteger(capacity) || capacity < 1) throw new RangeError('capacity must be a positive integer')
  }

  get(key: K): V | undefined {
    if (!this.map.has(key)) return undefined
    const value = this.map.get(key) as V // has() check: stored undefined values work too
    this.map.delete(key)                  // move to the "most recent" end
    this.map.set(key, value)
    return value
  }

  set(key: K, value: V): this {
    if (this.map.has(key)) {
      this.map.delete(key)                // updating also counts as use
    } else if (this.map.size >= this.capacity) {
      const oldest = this.map.keys().next().value as K
      this.map.delete(oldest)             // evict least recently used
    }
    this.map.set(key, value)
    return this
  }

  has(key: K): boolean { return this.map.has(key) } // peek: does not change order
  delete(key: K): boolean { return this.map.delete(key) }
  get size(): number { return this.map.size }
}

const cache = new LRUCache<string, number>(2)
cache.set('a', 1).set('b', 2)
cache.get('a')       // order is now b, a
cache.set('c', 3)    // evicts b
console.log([...cache['map'].keys()]) // ['a', 'c']
\`\`\`

**Why it is O(1):** \`Map\` \`get\`/\`set\`/\`delete\` are O(1) on average, and \`keys().next()\` reads only the first entry.

**In other languages** (or if asked to avoid Map ordering): a **hash map from key to node** plus a **doubly linked list**. Move a node to the head on access, remove from the tail on eviction, each in O(1).

**Production notes:** add a TTL for staleness, and limit by total size in bytes, not entry count, when values vary a lot. In Node, the \`lru-cache\` package does both. A per-process cache is not shared between instances; use Redis for that.`,
          walkthrough: [
            {
              title: 'Pick the structure',
              body: `A \`Map\` gives O(1) lookup and remembers insertion order. First key = least recently used; last key = most recently used.`,
            },
            {
              title: 'Implement get',
              body: `If the key is missing, return \`undefined\`. Otherwise read it, \`delete\` it and \`set\` it again so it moves to the end.`,
            },
            {
              title: 'Implement set with eviction',
              body: `Existing key: delete first (update = use). New key at capacity: delete \`map.keys().next().value\`. Then \`set\`.`,
            },
            {
              title: 'State complexity and alternatives',
              body: `All O(1). Mention the hash map + doubly linked list design, TTL, size-in-bytes limits, and that the cache is per process.`,
            },
          ],
          keyPoints: [
            'Map insertion order models recency',
            'delete + set moves a key to most recent',
            'Evict map.keys().next().value',
            'Updates count as use; capacity validated',
            'Knows the hash map + doubly linked list version',
          ],
          pitfalls: [
            'Evicting on update of an existing key when full',
            'Using an array and indexOf, which is O(n)',
            'Checking `if (map.get(k))`, which breaks for falsy values',
          ],
          followUps: [
            'Add a TTL per entry. Do you expire lazily on get or with a timer?',
            'How would you share this cache across several Node instances?',
          ],
          references: [
            { label: 'MDN: Map', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map' },
          ],
        },
      ],
    },
  ],
}

export default track
