import type { Track } from '@/types/content'

const track: Track = {
  id: 'languages-compilers',
  code: 'N',
  title: 'Languages & Compilers',
  summary: 'Compilers, interpreters, JIT, ASTs, type systems and garbage collection.',
  rationale:
    'You use compilers every day (TypeScript, Vite, the Vue SFC compiler behind REI-KIT, ESLint) without having to think about them. Knowing how source becomes tokens, ASTs, bytecode and optimised machine code lets you explain build tooling and V8 performance at the depth senior interviewers expect.',
  icon: 'Code2',
  phase: 3,
  modules: [
    {
      id: 'lang-execution-models',
      title: 'How code runs',
      summary: 'Compilers vs interpreters, bytecode vs machine code, and what a runtime is.',
      questions: [
        {
          id: 'lang-compiler-vs-interpreter',
          title: 'Compiler vs interpreter (and why the line is blurry)',
          type: 'concept',
          difficulty: 'foundation',
          priority: 'must',
          tags: ['compiler', 'interpreter', 'bytecode', 'machine-code', 'runtime'],
          estMinutes: 4,
          roles: ['general'],
          prompt: `What is the difference between a **compiler** and an **interpreter**? Is JavaScript compiled or interpreted? And what do we mean by a language **runtime**?`,
          hints: [
            'A compiler translates; an interpreter executes.',
            'Bytecode is an intermediate form for a virtual machine.',
            'Modern engines combine both.',
          ],
          answer: `A **compiler translates** a program from one language to another *before* it runs: C → machine code, TypeScript → JavaScript, Java → JVM bytecode. An **interpreter executes** a program directly, reading source or an intermediate form and performing each operation as it goes.

| | Ahead-of-time compiled (C, Rust, Go) | Interpreted |
| --- | --- | --- |
| Startup | Fast (native code ready) | Fast (no build), slower per operation |
| Peak speed | High; whole-program optimisation | Lower |
| Portability | Per target CPU/OS | Anywhere the interpreter runs |
| Errors | Many caught at compile time | Found at run time |

**Bytecode vs machine code:** **machine code** is the CPU's own instruction set (x86-64, ARM64), executed directly by hardware. **Bytecode** is a compact, portable instruction set for a **virtual machine** (JVM, V8's Ignition, CPython), run by an interpreter or compiled further.

**Is JavaScript compiled?** "Compiled vs interpreted" is a property of **implementations**, not languages. V8 **parses** JS into an AST, **compiles it to bytecode**, **interprets** that bytecode, then **JIT-compiles** hot functions to optimised machine code using runtime feedback. So modern JS is both, *just in time*. TypeScript is a **transpiler** (source-to-source) whose output then goes through that pipeline.

**Runtime:** everything the program needs while running beyond its own code: the engine (V8), memory management and **GC**, the standard library, and host APIs and scheduling. Node.js = V8 + libuv (event loop, I/O) + core modules (\`fs\`, \`http\`). The browser = engine + DOM, \`fetch\`, the rendering loop. That's why \`setTimeout\` and \`fetch\` aren't part of the ECMAScript language itself.`,
          keyPoints: [
            'Compiler translates; interpreter executes',
            'Bytecode (VM) vs machine code (CPU)',
            'Compiled/interpreted is an implementation property',
            'V8: parse → bytecode → interpret → JIT',
            'Runtime = engine + GC + host APIs (Node: V8 + libuv)',
          ],
          pitfalls: ['Saying "JavaScript is interpreted, so it is slow"', 'Calling setTimeout part of the JS language'],
          followUps: ['What is WebAssembly and where does it fit?'],
          references: [{ label: 'V8 blog', url: 'https://v8.dev/blog' }],
        },
        {
          id: 'lang-static-vs-dynamic-typing',
          title: 'Static vs dynamic, strong vs weak typing',
          type: 'tradeoff',
          difficulty: 'core',
          priority: 'should',
          tags: ['type-systems', 'static-typing', 'dynamic-typing', 'typescript', 'type-checking'],
          estMinutes: 5,
          roles: ['general'],
          prompt: `Explain **static vs dynamic** typing and **strong vs weak** typing. Where does TypeScript fit, and what does "TypeScript's type system is unsound" mean in practice?`,
          hints: [
            'Static vs dynamic: when are types checked?',
            'Strong vs weak: how freely are values implicitly converted?',
            'TS types are erased; what can bypass them?',
          ],
          answer: `Two independent axes:
- **Static vs dynamic** is about **when** types are checked. Static languages check at **compile time** (Java, Rust, Go, TypeScript). Dynamic languages check at **run time**, attaching types to *values* instead of *variables* (JavaScript, Python, Ruby).
- **Strong vs weak** is about **implicit conversions**. JavaScript is **weakly typed**: \`'5' * 2 === 10\`, \`[] + {}\` is \`'[object Object]'\`. Python is dynamic but **strong**: \`'5' * 2\` repeats the string, and \`'5' + 2\` throws. These terms are informal, so define them when you use them.

**Type checking** in a compiler is a pass over the AST that assigns types to expressions and rejects invalid operations, often with **inference** (\`const x = 1\` infers \`number\`). Type systems are **nominal** (Java: names matter) or **structural** (TypeScript: shape matters, so any object with \`{ id: string }\` fits).

**TypeScript** is a **static, structural, gradual** type system layered on JavaScript. Types are **erased** at compile time, with no run-time checks, so JS semantics are unchanged. It is **intentionally unsound** in places, trading guarantees for ergonomics and JS compatibility:

\`\`\`ts
const xs: string[] = []
const first: string = xs[0]          // undefined at runtime (unless noUncheckedIndexedAccess)
const u = JSON.parse(body) as User   // assertion: trust me
let animals: Animal[] = dogs; animals.push(cat) // array covariance
\`\`\`

Plus \`any\`, method parameter bivariance, and unvalidated external data. **Practical consequences:** **validate at boundaries** (request bodies, \`JSON.parse\`, \`localStorage\`, third-party APIs) with Zod, Valibot or hand-written guards. Enable \`strict\` and \`noUncheckedIndexedAccess\`, and prefer \`unknown\` over \`any\`.

**Trade-off:** static typing catches whole classes of bugs early, enables tooling (refactors, autocomplete) and documents intent, at the cost of upfront ceremony. Dynamic typing gives speed of iteration and flexibility, but needs more tests and run-time checks.`,
          keyPoints: [
            'Static/dynamic = when; strong/weak = implicit conversion',
            'Nominal vs structural; inference',
            'TS: static, structural, gradual, erased',
            'Concrete unsoundness examples',
            'Validate untrusted data at runtime boundaries',
          ],
          pitfalls: ['Conflating static with strong', 'Believing TS types exist at runtime'],
          personalAngle:
            'This app\'s backup import validates JSON by hand because TS types vanish at runtime. Use your own projects (REI-KIT props, API payloads) as examples of validating at boundaries.',
          references: [{ label: 'TypeScript Handbook: Type compatibility', url: 'https://www.typescriptlang.org/docs/handbook/type-compatibility.html' }],
        },
        {
          id: 'lang-type-erasure-mcq',
          title: 'What survives TypeScript compilation?',
          type: 'multiple-choice',
          difficulty: 'foundation',
          priority: 'must',
          tags: ['typescript', 'type-erasure', 'transpilation', 'enums'],
          estMinutes: 3,
          roles: ['general', 'frontend', 'backend'],
          prompt: `After \`tsc\` (or esbuild/SWC stripping types) compiles your code, **which of these exist at runtime?** Select all that apply.`,
          choices: [
            { id: 'a', text: 'An `interface User { id: string }` declaration', correct: false, explanation: 'Interfaces and type aliases are erased completely.' },
            { id: 'b', text: 'A regular `enum Role { Admin, User }`', correct: true, explanation: 'Non-const enums emit a real JavaScript object (with reverse mappings for numeric members).' },
            { id: 'c', text: 'The check implied by `const u = data as User`', correct: false, explanation: 'Assertions emit no code; nothing is checked.' },
            { id: 'd', text: 'A `class` with a `private` field declared via TS `private`', correct: true, explanation: 'The class and field exist; only the privacy check is compile-time. Use `#field` for runtime privacy.' },
            { id: 'e', text: 'Generic type parameters like `<T>` in `function id<T>(x: T)`', correct: false, explanation: 'Generics are erased; there is no runtime T.' },
          ],
          hints: ['Ask: does this construct generate JavaScript, or only describe it?'],
          answer: `**b and d.**

TypeScript is a **type-level layer over JavaScript**. Compilation **type-checks**, then **erases** types and emits plain JS. Anything that is purely a *description* disappears: interfaces, type aliases, annotations, generics, \`as\` assertions, \`satisfies\`. **Constructs that generate JS remain:**
- **Enums** (non-\`const\`) compile to an object. That's one reason many teams prefer **union literal types** (\`type Role = 'admin' | 'user'\`) or \`as const\` objects.
- **Classes** exist, but TS \`private\`/\`protected\` are compile-time only. At runtime the field is an ordinary property. ECMAScript **\`#private\`** fields are enforced by the engine.
- **Parameter properties**, \`namespace\` with values, and legacy decorators (with \`emitDecoratorMetadata\`, which NestJS relies on for DI) also emit code.

**Consequences:**
1. **Types don't validate data.** \`as User\` on \`JSON.parse\` output is a promise to the compiler, not a check. Validate at boundaries.
2. Node 22.18+/23.6+ can run \`.ts\` files directly through **type stripping**. It only removes erasable syntax, so enums and parameter properties need \`--experimental-transform-types\`, or must be avoided. TS 5.8's \`erasableSyntaxOnly\` flag enforces that style.
3. Fast transpilers (esbuild, SWC, Vite) strip types **file by file without type-checking**. Run \`tsc --noEmit\` or \`vue-tsc\` separately in CI, which is exactly what this project's build script does.`,
          keyPoints: [
            'Types, interfaces, generics, assertions are erased',
            'Enums and classes emit runtime code',
            'TS private vs #private',
            'No runtime validation from types',
            'Type stripping / erasableSyntaxOnly; separate type-check in CI',
          ],
          pitfalls: ['Believing `as` performs a runtime cast'],
          references: [{ label: 'TypeScript Handbook: Enums', url: 'https://www.typescriptlang.org/docs/handbook/enums.html' }],
        },
      ],
    },
    {
      id: 'lang-front-end-of-compilers',
      title: 'Lexing, parsing & ASTs',
      summary: 'The compiler front end, and the tools you use daily that are built on it.',
      questions: [
        {
          id: 'lang-lexing-parsing-ast',
          title: 'From source to AST: lexing and parsing',
          type: 'concept',
          difficulty: 'core',
          priority: 'must',
          tags: ['lexer', 'parser', 'ast', 'babel', 'eslint', 'vue-compiler'],
          estMinutes: 6,
          roles: ['general', 'frontend'],
          prompt: `Walk me through the **phases of a compiler**. What is an **AST**, and how do **ESLint, Babel/SWC, Prettier and the Vue SFC compiler** use one?`,
          hints: [
            'Characters → tokens → tree → checked tree → output.',
            'Linters analyse the tree; transpilers transform it; formatters re-print it.',
          ],
          answer: `**Phases:**
1. **Lexing (tokenizing):** characters become **tokens**. \`let total = a + 42;\` becomes \`let\`, \`Identifier(total)\`, \`=\`, \`Identifier(a)\`, \`+\`, \`Number(42)\`, \`;\`. Whitespace and comments are usually dropped, though tools like Prettier keep comments attached.
2. **Parsing:** tokens become a tree according to the **grammar**, handling precedence and associativity. JS engines use hand-written **recursive descent** parsers. The output is an **AST** (abstract syntax tree): a structural tree without syntactic noise like parentheses or semicolons.
3. **Semantic analysis:** scope resolution (which declaration does each identifier refer to?), **type checking** (\`tsc\`), early errors.
4. **Transformation / IR:** lowering to an intermediate representation, then optimisation (constant folding, dead-code elimination, inlining).
5. **Code generation:** machine code, bytecode, or **source code** for transpilers. Source maps map output back to the original positions.

\`\`\`json
{ "type": "BinaryExpression", "operator": "+",
  "left": { "type": "Identifier", "name": "a" },
  "right": { "type": "NumericLiteral", "value": 42 } }
\`\`\`

**Tools you already use:**
- **ESLint** parses to an ESTree AST (typescript-eslint for TS), then **walks it with visitors**. Each rule subscribes to node types (\`CallExpression\`, \`MemberExpression\`) and reports problems. With type information it can also query the TS checker.
- **Babel / SWC / esbuild / oxc**: parse, **transform** (JSX → \`jsx()\` calls, strip TS types, downlevel syntax), generate code.
- **Prettier** parses, then **re-prints** the AST in its own style, ignoring your original formatting.
- **Vue SFC compiler** (\`@vue/compiler-sfc\`) splits the \`.vue\` file into blocks, parses the template to a **template AST**, applies **transforms** (\`v-if\`, \`v-for\`, \`v-model\`), and generates a **render function**. It also marks **static hoisting** and **patch flags**, so the runtime diff can skip static nodes. That's compile-time optimisation feeding the virtual DOM.
- **Bundlers** (Vite/Rolldown) parse imports to build the module graph and **tree-shake** unused exports.`,
          keyPoints: [
            'Lexing → parsing → semantic analysis → IR/optimisation → codegen',
            'AST = structural tree without syntax noise',
            'Linters visit, transpilers transform, formatters re-print',
            'Vue compiler: template AST → render fn with patch flags/hoisting',
            'Source maps; tree-shaking from import graph',
          ],
          pitfalls: ['Confusing tokens with AST nodes', 'Thinking Prettier preserves your formatting choices'],
          followUps: ['How does tree-shaking decide what is safe to remove (sideEffects)?'],
          personalAngle:
            'REI-KIT ships Vue SFCs. Explain what @vue/compiler-sfc does to your components at build time, and how patch flags make runtime updates cheaper.',
          references: [
            { label: 'AST Explorer', url: 'https://astexplorer.net/' },
            { label: 'Vue docs: Rendering mechanism', url: 'https://vuejs.org/guide/extras/rendering-mechanism.html' },
          ],
        },
        {
          id: 'lang-write-tokenizer-evaluator',
          title: 'Write a tokenizer and evaluator for arithmetic',
          type: 'coding',
          difficulty: 'advanced',
          priority: 'should',
          tags: ['lexer', 'parser', 'recursive-descent', 'precedence', 'coding'],
          estMinutes: 25,
          roles: ['general'],
          prompt: `Implement \`evaluate(expr: string): number\` supporting integers, \`+ - * /\`, parentheses and whitespace, with **correct precedence**, e.g. \`evaluate('2 + 3 * (4 - 1)') === 11\`. **Don't use \`eval\` or \`Function\`.** Structure it as a tokenizer plus a parser.`,
          hints: [
            'Tokenize first: numbers, operators, parens.',
            'One function per precedence level: expression (+ -) → term (* /) → factor (number or parenthesised expression).',
            'Each level loops while the next token is one of its operators. That gives left associativity.',
          ],
          answer: `A **recursive-descent parser** with one function per precedence level. The grammar:

\`\`\`plaintext
expr   := term (('+' | '-') term)*
term   := factor (('*' | '/') factor)*
factor := NUMBER | '(' expr ')' | '-' factor
\`\`\`

\`\`\`ts
type Token = { kind: 'num'; value: number } | { kind: 'op'; value: '+' | '-' | '*' | '/' | '(' | ')' }

function tokenize(src: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  while (i < src.length) {
    const ch = src[i]!
    if (ch === ' ') { i++; continue }
    if (ch >= '0' && ch <= '9') {
      let j = i
      while (j < src.length && src[j]! >= '0' && src[j]! <= '9') j++
      tokens.push({ kind: 'num', value: Number(src.slice(i, j)) })
      i = j
      continue
    }
    if ('+-*/()'.includes(ch)) { tokens.push({ kind: 'op', value: ch as '+' }); i++; continue }
    throw new SyntaxError('Unexpected character ' + ch + ' at ' + i)
  }
  return tokens
}

export function evaluate(src: string): number {
  const tokens = tokenize(src)
  let pos = 0
  const peek = () => tokens[pos]
  const isOp = (v: string) => peek()?.kind === 'op' && peek()!.value === v

  function expr(): number {
    let left = term()
    while (isOp('+') || isOp('-')) {
      const op = tokens[pos++]!.value
      const right = term()
      left = op === '+' ? left + right : left - right
    }
    return left
  }
  function term(): number {
    let left = factor()
    while (isOp('*') || isOp('/')) {
      const op = tokens[pos++]!.value
      const right = factor()
      if (op === '/' && right === 0) throw new RangeError('Division by zero')
      left = op === '*' ? left * right : left / right
    }
    return left
  }
  function factor(): number {
    const t = peek()
    if (!t) throw new SyntaxError('Unexpected end of input')
    if (t.kind === 'num') { pos++; return t.value }
    if (isOp('-')) { pos++; return -factor() }          // unary minus
    if (isOp('(')) {
      pos++
      const v = expr()
      if (!isOp(')')) throw new SyntaxError('Expected )')
      pos++
      return v
    }
    throw new SyntaxError('Unexpected token ' + t.value)
  }

  const result = expr()
  if (pos !== tokens.length) throw new SyntaxError('Unexpected trailing input')
  return result
}
\`\`\`

**Why it's correct:** \`*\` and \`/\` bind tighter because \`term\` is parsed *inside* \`expr\`. The \`while\` loops give **left associativity** (\`8 - 3 - 2 = 3\`, not 7). It runs in **O(n)** time.

**Talking points:** this evaluates directly. A real compiler would **build AST nodes** instead (\`{ type: 'Binary', op, left, right }\`) and evaluate or generate code in a separate pass. Alternatives are **shunting-yard** (Dijkstra; operator stack → RPN) and **Pratt parsing** (binding powers, easy to extend with new operators). Test edge cases: \`'2*(3'\`, \`'1/0'\`, \`'--3'\`, \`''\`, and \`'7 - 2 - 1'\`.`,
          keyPoints: [
            'Separates tokenizer and parser',
            'Grammar with one level per precedence',
            'Loops give left associativity',
            'Handles parentheses, unary minus, errors, trailing input',
            'Mentions AST building, shunting-yard / Pratt',
          ],
          pitfalls: ['Evaluating strictly left-to-right ignoring precedence', 'Right-associative subtraction via naive recursion'],
          followUps: ['Add exponentiation (right-associative) — what changes?'],
          references: [{ label: 'MDN: eval() — never use eval!', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval' }],
        },
        {
          id: 'lang-eslint-custom-rule',
          title: 'Writing a custom ESLint rule',
          type: 'coding',
          difficulty: 'core',
          priority: 'nice',
          tags: ['eslint', 'ast', 'visitor', 'tooling'],
          estMinutes: 15,
          roles: ['frontend', 'full-stack'],
          prompt: `Your team keeps shipping \`console.log\` calls with the word "TODO" in them. **Write an ESLint rule** that reports \`console.*(...)\` calls whose first argument is a string literal containing "TODO". How does ESLint find these nodes?`,
          hints: [
            'Look at the AST for console.log("x") in AST Explorer: CallExpression → MemberExpression callee.',
            'Rules return a visitor object keyed by node type.',
          ],
          answer: `ESLint parses each file into an **ESTree AST** and **traverses** it. A rule's \`create(context)\` returns a **visitor**: an object whose keys are node types or selectors. ESLint calls each handler when the traversal enters a matching node.

The AST for \`console.log("TODO: x")\` is a \`CallExpression\` whose \`callee\` is a \`MemberExpression\` (\`object: Identifier(console)\`, \`property: Identifier(log)\`) and whose \`arguments[0]\` is a string \`Literal\`.

\`\`\`js
// eslint-plugin-local/rules/no-todo-console.js
export default {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow console calls containing TODO' },
    messages: { todo: 'Remove console.{{method}} with TODO before merging.' },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node) {
        const callee = node.callee
        if (
          callee.type !== 'MemberExpression' ||
          callee.object.type !== 'Identifier' || callee.object.name !== 'console' ||
          callee.property.type !== 'Identifier'
        ) return
        const first = node.arguments[0]
        const text =
          first?.type === 'Literal' && typeof first.value === 'string' ? first.value
          : first?.type === 'TemplateLiteral' ? first.quasis.map((q) => q.value.cooked).join('')
          : null
        if (text && text.includes('TODO')) {
          context.report({ node, messageId: 'todo', data: { method: callee.property.name } })
        }
      },
    }
  },
}
\`\`\`

Register it in \`eslint.config.js\` (flat config) as a local plugin: \`plugins: { local: { rules: { 'no-todo-console': rule } } }\` and \`rules: { 'local/no-todo-console': 'error' }\`.

**Points worth mentioning:**
- **Selectors** can express this declaratively: \`'CallExpression[callee.object.name="console"]'\`.
- This is purely **syntactic**. \`const c = console; c.log('TODO')\` slips through. For more, use **scope analysis** (\`context.sourceCode.getScope(node)\`), or typed linting via typescript-eslint's type checker.
- Add a \`fix\` (\`fixer.remove(node)\`) only when it's safe. Removing an expression statement can change code that depends on its side effects.
- Test with \`RuleTester\`, using valid and invalid cases.`,
          keyPoints: [
            'ESLint = parse to ESTree + visitor traversal',
            'Correct AST shape: CallExpression / MemberExpression / Literal',
            'meta.messages + context.report',
            'Flat config local plugin registration',
            'Limits of syntactic analysis; scope/type info; RuleTester',
          ],
          pitfalls: ['Regex over source text instead of the AST'],
          personalAngle:
            'For REI-KIT you could enforce library conventions this way, for example requiring visible-string props. A custom rule is a strong talking point about tooling ownership.',
          references: [{ label: 'ESLint docs: Custom rules', url: 'https://eslint.org/docs/latest/extend/custom-rules' }],
        },
      ],
    },
    {
      id: 'lang-v8-jit',
      title: 'JIT compilation in V8',
      summary: 'Ignition, the optimising tiers, hidden classes and inline caches.',
      questions: [
        {
          id: 'lang-v8-pipeline',
          title: 'The V8 pipeline: Ignition, Sparkplug, Maglev, TurboFan',
          type: 'concept',
          difficulty: 'core',
          priority: 'must',
          tags: ['v8', 'jit', 'ignition', 'turbofan', 'deoptimization'],
          estMinutes: 6,
          roles: ['general', 'frontend', 'backend'],
          prompt: `What happens inside V8 between loading a JS file and running a hot function at near-native speed? What is a **JIT**, and what is **deoptimization**?`,
          hints: [
            'Parse → bytecode → interpret → collect feedback → optimise hot code.',
            'Optimised code relies on assumptions about types.',
          ],
          answer: `A **JIT (just-in-time) compiler** compiles code **while the program runs**, using **observed run-time behaviour** to specialise it. That's something an ahead-of-time compiler for a dynamic language can't do.

**V8's tiers:**
1. **Parse.** Functions are **lazily** pre-parsed (only fully parsed when first called) to save startup time. The full parse builds an AST.
2. **Ignition** (interpreter): compiles the AST to **bytecode** and interprets it. Start-up is fast and memory use is low. While running it records **type feedback** in feedback vectors: which shapes and types each operation saw.
3. **Sparkplug** (baseline compiler): quickly turns bytecode into unoptimised machine code, removing interpreter dispatch overhead.
4. **Maglev** (mid-tier optimiser, since 2023): a fast optimising compiler using feedback. Good code, compiled quickly.
5. **TurboFan** (top tier): heavily optimises **hot** functions with **speculative** assumptions from the feedback ("\`x\` is always a small integer", "\`obj\` always has shape S"). It inlines, eliminates checks and allocations (escape analysis), and generates tight machine code.

**Deoptimization:** optimised code includes cheap **guards** for its assumptions. If one fails (a string shows up where only small integers were seen, or an object with a different shape arrives), V8 **deopts**: it discards the optimised frame, rebuilds the interpreter state, and continues in bytecode. It may re-optimise later with the broader feedback. Frequent deopt/reopt cycles are a real performance cost.

**Practical implications:** keep hot functions **monomorphic** (same argument types and object shapes), initialise objects consistently, avoid mixing types in arrays, and avoid \`delete\` on hot objects. **Benchmark carefully**: warm up before measuring, because early runs measure the interpreter.

\`\`\`bash
node --trace-opt --trace-deopt app.js   # see what gets optimised and why it deopts
\`\`\``,
          keyPoints: [
            'JIT uses runtime feedback to specialise',
            'Ignition bytecode + feedback vectors',
            'Tiering: Sparkplug, Maglev, TurboFan',
            'Speculative optimisation with guards',
            'Deoptimization and its cost; monomorphic code',
          ],
          pitfalls: ['Saying V8 compiles everything to optimised machine code upfront'],
          followUps: ['Why do micro-benchmarks of JS often lie?'],
          references: [{ label: 'V8 blog: Maglev', url: 'https://v8.dev/blog/maglev' }],
        },
        {
          id: 'lang-hidden-classes-inline-caches',
          title: 'Hidden classes and inline caches',
          type: 'output',
          difficulty: 'advanced',
          priority: 'should',
          tags: ['v8', 'hidden-classes', 'shapes', 'inline-caches', 'performance'],
          estMinutes: 7,
          roles: ['general', 'frontend', 'backend'],
          prompt: `Both factories produce objects with \`x\` and \`y\`. In a hot loop calling \`len(p)\` over a mixed array of both kinds, **why is \`len\` slower than if every point came from \`makeA\`?** Explain hidden classes (shapes) and inline caches.`,
          code: {
            language: 'javascript',
            source: `function makeA(x, y) { return { x, y } }
function makeB(x, y) { const p = {}; p.y = y; p.x = x; return p }

function len(p) { return Math.sqrt(p.x * p.x + p.y * p.y) }

const points = []
for (let i = 0; i < 1e6; i++) points.push(i % 2 ? makeA(i, i) : makeB(i, i))
let s = 0
for (const p of points) s += len(p)`,
          },
          hints: [
            'Property order is part of an object\'s shape.',
            'An inline cache remembers the shape → offset mapping seen at a property access site.',
          ],
          answer: `**V8 gives every object a hidden class** (called a *Map* internally, *shape* in general). It describes which properties exist **and in what order**, and at what **offset** each value is stored. Adding a property moves the object along a **transition chain**: \`{}\` → \`{y}\` → \`{y, x}\`.

\`makeA\` produces shape **S1 = {x, y}**. \`makeB\` adds \`y\` first and \`x\` second, giving shape **S2 = {y, x}**. Same properties, **different order, so different hidden classes** and different offsets for \`x\`.

**Inline caches (ICs):** each property access site, such as \`p.x\` in \`len\`, caches "for shape S, \`x\` is at offset N". States:
- **Monomorphic**: one shape seen. The fastest case: a shape check plus a direct load, and TurboFan can inline it.
- **Polymorphic**: 2–4 shapes. A small list of checks. Slower and harder to optimise.
- **Megamorphic**: more shapes. Falls back to a generic, hash-like lookup. Much slower.

Here every access in \`len\` is **polymorphic** (S1 and S2 alternate), so the optimised code needs shape dispatch on every access. With only \`makeA\` it would be monomorphic, with straight-line loads, often noticeably faster in hot loops.

**Habits that keep shapes stable:**
- Create objects with **all properties at once, in the same order** (object literals, class constructors that assign every field).
- Avoid adding properties later or using \`delete\` (which can drop the object into slow **dictionary mode**). Set the property to \`undefined\` instead.
- Don't mix element kinds in hot arrays (integers, doubles, objects), and avoid holes.

**Caveat:** this matters in **hot paths** such as parsers, renderers and tight numeric loops. In ordinary app code, clarity wins. Measure before micro-optimising.`,
          keyPoints: [
            'Hidden class = property set + order + offsets',
            'Different insertion order → different shapes',
            'IC states: monomorphic, polymorphic, megamorphic',
            'Consistent construction; avoid delete/late additions',
            'Only matters on hot paths; measure',
          ],
          pitfalls: ['Thinking only the property names matter, not their order'],
          followUps: ['How do classes with fields declared in the constructor help?'],
          references: [{ label: 'V8 blog: Fast properties', url: 'https://v8.dev/blog/fast-properties' }],
        },
      ],
    },
    {
      id: 'lang-memory-management',
      title: 'Garbage collection',
      summary: 'How V8 reclaims memory, and how leaks still happen.',
      questions: [
        {
          id: 'lang-gc-generational',
          title: 'Mark-sweep and generational garbage collection',
          type: 'concept',
          difficulty: 'core',
          priority: 'must',
          tags: ['garbage-collection', 'mark-sweep', 'generational', 'v8', 'orinoco'],
          estMinutes: 6,
          roles: ['general', 'backend'],
          prompt: `How does **garbage collection** work in V8? Explain **reachability**, **mark-sweep(-compact)** and the **generational hypothesis**. Why doesn't JS use reference counting?`,
          hints: [
            'Garbage = unreachable from roots, not "unused".',
            'Most objects die young.',
            'What happens with a cycle under reference counting?',
          ],
          answer: `**Tracing GC** frees objects that are **unreachable** from the **roots** (the stack, global objects, handles held by the engine and embedder). Being reachable means "still referenced", even if your code will never use the object again. That's why leaks are possible.

**Mark-sweep-compact (major GC):**
1. **Mark**: starting from the roots, traverse every reference and mark reachable objects (tri-colour marking: white = unvisited, grey = discovered but not scanned, black = done).
2. **Sweep**: unmarked memory is reclaimed into free lists.
3. **Compact**: move live objects together to fight fragmentation, and update pointers.

**Generational hypothesis:** **most objects die young** (temporary arrays, closures, promise results). V8 splits the heap:
- **Young generation** (small): allocation is a fast pointer bump. A **scavenger** (a semi-space copying collector) copies live objects to the other half. Cost is proportional to **survivors**, not garbage, so it's very cheap. Objects that survive twice are **promoted**.
- **Old generation**: long-lived objects, collected with mark-sweep-compact, less often.
- A **write barrier** tracks old→young pointers, so a minor GC doesn't have to scan the whole old generation.

**Orinoco** (V8's GC project) makes it mostly **parallel, incremental and concurrent**. Marking runs on helper threads and in small increments interleaved with JS, which keeps **stop-the-world pauses** short (usually a few ms).

**Why not reference counting?** Every reference assignment would update a counter (overhead, and harder with threads). Worse, **cycles** (\`a.self = a\`, or parent ↔ child DOM links) never reach zero and leak. Tracing handles cycles naturally. CPython uses refcounting **plus** a cycle collector, and Swift uses ARC with weak references.

**Tuning in Node:** \`--max-old-space-size\` sets the old-generation limit. Hitting it gives "JavaScript heap out of memory". Watch GC pauses with \`--trace-gc\` or \`perf_hooks\`.`,
          keyPoints: [
            'Reachability from roots defines liveness',
            'Mark, sweep, compact phases',
            'Young gen scavenger (cost ∝ survivors) + promotion; old gen mark-compact',
            'Write barriers; incremental/concurrent (Orinoco)',
            'Reference counting fails on cycles',
          ],
          pitfalls: ['Saying GC frees objects that are "no longer used"', 'Claiming JS uses reference counting'],
          followUps: ['How do WeakMap and WeakRef interact with the GC?'],
          references: [{ label: 'V8 blog: Trash talk (Orinoco GC)', url: 'https://v8.dev/blog/trash-talk' }],
        },
        {
          id: 'lang-memory-leak-debugging',
          title: 'Finding a memory leak in a long-running Node process',
          type: 'debugging',
          difficulty: 'advanced',
          priority: 'should',
          tags: ['memory-leak', 'closures', 'heap-snapshot', 'node', 'gc'],
          estMinutes: 8,
          roles: ['backend', 'full-stack'],
          prompt: `A Node worker's memory grows steadily until it's OOM-killed every few hours. **Find the leak(s)** in this code, explain why the GC can't free the memory, and describe how you'd find leaks like this in general.`,
          code: {
            language: 'typescript',
            source: `const cache = new Map<string, Result>()
const emitter = new EventEmitter()

export async function processJob(job: Job) {
  const page = await browser.newPage()
  const html = await page.content()           // ~2 MB string

  emitter.on('shutdown', () => {
    console.log('job', job.id, 'html size', html.length)
  })

  const result = match(html)
  cache.set(job.id, result)                   // job ids are unique
  return result                               // page is never closed
}`,
          },
          hints: [
            'Something is retained per job, forever. Look for things that only grow.',
            'A listener closure keeps everything it references alive.',
            'Some resources are not JS heap at all.',
          ],
          answer: `**Three leaks**, each keeping memory **reachable**, so the GC is doing its job correctly:

1. **Listener closure leak:** each job adds a \`'shutdown'\` listener that **closes over \`html\` (2 MB) and \`job\`**. The emitter is module-level (a root), so every listener, and every \`html\` string, stays reachable. Node warns with \`MaxListenersExceededWarning\` after 10 listeners; that's a classic signal. Fix: don't register per-job listeners on long-lived emitters. If you must, use \`emitter.once\` or remove the listener in \`finally\`, and capture only what you need (\`const id = job.id\`).
2. **Unbounded cache:** \`cache\` is a module-level \`Map\` keyed by **unique** IDs, so it only grows. Fix: an **LRU with max size or TTL** (for example \`lru-cache\`), or store results externally (Redis with TTL). A \`WeakMap\` only helps when keys are objects whose lifetime should control the entry. It can't hold string keys.
3. **Resource leak outside the JS heap:** \`page\` is never closed. Each Puppeteer page holds a renderer target in **Chromium processes**, which isn't the Node heap at all. Fix: \`try { … } finally { await page.close() }\`.

\`\`\`ts
const cache = new LRUCache<string, Result>({ max: 5_000, ttl: 60 * 60_000 })
export async function processJob(job: Job) {
  const page = await browser.newPage()
  try {
    const result = match(await page.content())
    cache.set(job.id, result)
    return result
  } finally {
    await page.close()
  }
}
\`\`\`

**General method:**
- **Confirm it's a leak**: \`process.memoryUsage()\` over time. \`heapUsed\` keeps climbing after GCs, versus RSS growth from native memory or buffers.
- **Heap snapshots**: run with \`--inspect\`, or call \`v8.writeHeapSnapshot()\`. Take three snapshots minutes apart under load, compare them in Chrome DevTools, sort by **retained size**, and follow the **retainer path** to the root (here: EventEmitter → listeners → closure → \`html\`).
- **Usual suspects**: module-level maps and arrays, listeners and timers (\`setInterval\` closures), closures capturing large scopes, unbounded queues, and unclosed resources (sockets, browser pages, database clients).
- **Mitigate** with \`--max-old-space-size\` and periodic worker recycling while you fix the root cause, not instead of fixing it.`,
          keyPoints: [
            'Leaks = unintended reachability, not GC failure',
            'Per-job listener closure capturing large data',
            'Unbounded module-level cache → LRU/TTL',
            'Non-heap resources (Puppeteer pages) need explicit close',
            'Heap snapshot comparison and retainer paths',
          ],
          pitfalls: ['Blaming the GC', 'Using WeakMap with string keys', 'Only raising the heap limit'],
          followUps: ['How would you detect leaks automatically in CI or staging?'],
          personalAngle:
            'This is close to your Puppeteer and Redis scraping work. If your recovery and restart jobs ever covered for a slow leak, say so honestly, then explain how you would find the root cause with heap snapshots.',
          references: [{ label: 'Node.js docs: Using heap snapshots', url: 'https://nodejs.org/en/learn/diagnostics/memory/using-heap-snapshot' }],
        },
      ],
    },
  ],
}

export default track
