import type { Track } from '@/types/content'

const track: Track = {
  id: 'typescript',
  code: 'D',
  title: 'TypeScript',
  summary: 'The type system as a design tool: inference, generics, narrowing and advanced types.',
  rationale:
    'You write TypeScript every day, including a 106-component library, but interviews check whether you understand the type system rather than just satisfy it: structural typing, generics, narrowing, and the line between compile time and runtime. Strong answers here also make your React, Vue and NestJS answers sound senior.',
  icon: 'FileCode2',
  phase: 1,
  modules: [
    {
      id: 'ts-type-system',
      title: 'How the type system works',
      summary: 'Inference, structural typing, interface vs type, top and bottom types, and what exists only at compile time.',
      questions: [
        {
          id: 'ts-inference-structural-typing',
          title: 'Inference and structural typing',
          type: 'concept',
          difficulty: 'foundation',
          priority: 'must',
          tags: ['inference', 'structural-typing', 'excess-property-check', 'widening'],
          estMinutes: 4,
          roles: ['frontend', 'full-stack', 'backend'],
          prompt: `**TypeScript is "structurally typed". What does that mean**, and why does the first call below compile while the second fails?

\`\`\`ts
type Point = { x: number; y: number }
const p3 = { x: 1, y: 2, z: 3 }
draw(p3)                    // OK
draw({ x: 1, y: 2, z: 3 }) // Error: Object literal may only specify known properties
\`\`\``,
          hints: [
            'Compatibility is decided by shape, not by the name of the type.',
            'Fresh object literals get an extra check.',
          ],
          answer: `**Structural typing means a value is assignable to a type if it has at least the required members with compatible types.** Names and declarations do not matter. A \`{ x, y, z }\` object *is* a \`Point\` because it has \`x\` and \`y\`.

**Why the second call fails:** an **excess property check** applies only to *fresh object literals* passed or assigned directly to a typed target. TypeScript assumes an extra property in a literal is probably a typo, such as \`{ widht: 10 }\`. Once the object is stored in a variable (\`p3\`), it is no longer fresh, and ordinary structural compatibility applies.

**Inference:** TypeScript infers types from initialisers, return statements and context:
\`\`\`ts
let a = 'hi' // string (widened, because let can change)
const b = 'hi' // 'hi' (a literal type)
const cfg = { mode: 'dark' } // { mode: string }: properties widen
const cfg2 = { mode: 'dark' } as const // { readonly mode: 'dark' }
const xs = [1, 'a'] // (string | number)[]
window.addEventListener('click', (e) => e.clientX) // e: MouseEvent, from contextual typing
\`\`\`

**Practical guidance:** let inference work for locals, and **annotate the boundaries**: exported function parameters and return types, public APIs, and data from outside. Use \`satisfies\` to check a value against a type *without* widening it:
\`\`\`ts
const routes = { home: '/', about: '/about' } satisfies Record<string, string>
// keeps the literal keys home | about, and is still checked
\`\`\`

**Consequence of structural typing:** two different types with the same shape (such as \`UserId\` and \`OrderId\`, both \`string\`) are interchangeable. When that matters, use *branded types* (\`string & { __brand: 'UserId' }\`).`,
          keyPoints: [
            'Assignability is based on shape, not name',
            'Excess property checks apply only to fresh literals',
            'let/const widening and as const',
            'Annotate boundaries; infer locals',
            'satisfies checks without widening',
          ],
          pitfalls: ['Thinking TypeScript is nominal like Java or C#', 'Calling excess property checks "structural typing"'],
          followUps: ['How would you prevent mixing UserId and OrderId?'],
          references: [{ label: 'TypeScript Handbook: Type Compatibility', url: 'https://www.typescriptlang.org/docs/handbook/type-compatibility.html' }],
        },
        {
          id: 'ts-interface-vs-type',
          title: 'interface vs type alias',
          type: 'tradeoff',
          difficulty: 'foundation',
          priority: 'should',
          tags: ['interface', 'type-alias', 'declaration-merging'],
          estMinutes: 3,
          roles: ['frontend', 'full-stack', 'backend'],
          prompt: `**When do you use \`interface\` and when \`type\`?** Is there any real difference?`,
          hints: ['One can be reopened (merged); the other can express unions.'],
          answer: `**For object shapes they are mostly interchangeable. The differences are a few capabilities, so pick one convention and use it consistently.**

**Only \`interface\` can:**
- **Merge declarations:** two \`interface Window {…}\` declarations combine. This is how you augment library types, such as \`declare module 'vue' { interface ComponentCustomProperties {…} }\`, or Pinia and Vue Router types.
- Use \`extends\`, which reports conflicting members as errors and can be slightly faster for the compiler on large hierarchies than \`&\` intersections.

**Only \`type\` can:**
- Express **unions**, primitives, tuples and function types directly: \`type Status = 'idle' | 'loading'\`.
- Use **mapped and conditional types**: \`type Readonlyish<T> = { readonly [K in keyof T]: T[K] }\`.
- Alias anything, including template-literal types.

\`\`\`ts
interface ButtonProps { label: string; onClick(): void }
interface IconButtonProps extends ButtonProps { icon: string }

type Variant = 'primary' | 'ghost'
type Props = ButtonProps & { variant?: Variant }
\`\`\`

**A reasonable convention:** \`interface\` for public, extendable object contracts (component props in a library, augmentable types); \`type\` for unions, compositions and computed types. Many teams simply use \`type\` everywhere except where merging is needed. Both are fine if applied consistently.

One subtle difference: interfaces are not implicitly index-signature compatible, so an \`interface\` value is not assignable to \`Record<string, unknown>\`, whereas an equivalent \`type\` alias is.`,
          keyPoints: [
            'Mostly interchangeable for object shapes',
            'Interfaces merge, which is used for module augmentation',
            'Types handle unions, tuples, mapped and conditional types',
            'Consistency matters more than the choice',
          ],
          pitfalls: ['Claiming one is "faster" or "better" in general'],
          personalAngle:
            'REI-KIT likely needed declaration merging or augmentation for global component types. If so, it is a concrete example of the one capability only interfaces have.',
        },
        {
          id: 'ts-any-unknown-never',
          title: 'any vs unknown vs never',
          type: 'multiple-choice',
          difficulty: 'core',
          priority: 'must',
          tags: ['any', 'unknown', 'never', 'type-safety'],
          estMinutes: 3,
          roles: ['frontend', 'full-stack', 'backend'],
          prompt: `You are typing the result of \`JSON.parse\` on an API response you do not control. **Which statement is correct?**`,
          choices: [
            {
              id: 'a',
              text: 'Use `any`, since it is the honest type for unknown data',
              correct: false,
              explanation: '`any` turns off checking and spreads silently to everything it touches.',
            },
            {
              id: 'b',
              text: 'Use `unknown` and narrow it (type guard or schema validation) before use',
              correct: true,
              explanation: '`unknown` accepts any value, but you must prove its shape before using it.',
            },
            {
              id: 'c',
              text: 'Use `never`, because the type is not known at compile time',
              correct: false,
              explanation: '`never` is the empty type: no value can have it.',
            },
            {
              id: 'd',
              text: 'Cast it with `as ApiResponse`, which validates the data at runtime',
              correct: false,
              explanation: 'Assertions are compile-time only; nothing is checked at runtime.',
            },
          ],
          hints: ['Which type forces you to check before use?'],
          answer: `**\`unknown\`, then narrow it.**

- **\`any\`** opts out of type checking. Any operation is allowed, and it **spreads**: \`const x: any\`, then \`x.foo.bar\` is also \`any\`, so errors surface at runtime. Reserve it for migration escape hatches, and prefer \`// @ts-expect-error\` with a comment.
- **\`unknown\`** is the safe **top type**. Every value is assignable to it, but you cannot use it until you narrow it:
\`\`\`ts
const data: unknown = JSON.parse(text)
if (typeof data === 'object' && data !== null && 'id' in data && typeof data.id === 'string') {
  data.id // string
}
// in practice: const user = UserSchema.parse(data)  (Zod, Valibot and similar)
\`\`\`
- **\`never\`** is the **bottom type**, with no values. It appears as the return type of functions that throw or never return, in impossible branches after exhaustive narrowing, and as the result of filtering in conditional types (\`Exclude<'a' | 'b', 'a'>\` gives \`'b'\`, because \`'a'\` maps to \`never\`).

**Assertions (\`as\`)** tell the compiler to trust you. They do not check anything at runtime. A double assertion (\`as unknown as T\`) is a red flag in code review.

Use \`catch (err)\` with \`useUnknownInCatchVariables\` (part of \`strict\`), so that \`err\` is \`unknown\` and must be narrowed (\`err instanceof Error\`).`,
          keyPoints: [
            'any disables checking and spreads',
            'unknown is the safe top type and must be narrowed',
            'never is the bottom type, used for exhaustiveness and filtering',
            'as is not runtime validation',
          ],
          pitfalls: ['Treating `as` as validation'],
        },
        {
          id: 'ts-runtime-vs-compile-time',
          title: 'Compile time vs runtime: what survives?',
          type: 'concept',
          difficulty: 'core',
          priority: 'must',
          tags: ['type-erasure', 'runtime-validation', 'enums', 'zod', 'api-boundaries'],
          estMinutes: 5,
          roles: ['frontend', 'full-stack', 'backend'],
          prompt: `Your typed \`fetchUser(): Promise<User>\` crashes in production with \`Cannot read properties of undefined\`. **Explain why TypeScript did not catch it, what TypeScript emits at runtime, and how you make API boundaries safe.**`,
          hints: [
            'Types are erased.',
            'Which TypeScript features do produce runtime code?',
            'Validate where data enters the system.',
          ],
          answer: `**TypeScript's types are erased at compile time.** The output JavaScript contains no types, so \`Promise<User>\` was a *promise you made to the compiler*, not a check. If the API returns \`{ data: { user } }\` or a 500 error body, nothing stops it.

**What does exist at runtime:**
- \`enum\` (except \`const enum\` in some setups) compiles to a real object.
- \`namespace\` with values, parameter properties (\`constructor(private x: number)\`) and legacy decorators all emit code. NestJS relies on \`emitDecoratorMetadata\` for dependency injection.
- Everything else (\`interface\`, \`type\`, generics, \`as\`, \`satisfies\`) disappears.

Modern toolchains reflect this: \`isolatedModules\` and \`verbatimModuleSyntax\` (for transpilers such as esbuild and Vite) and \`erasableSyntaxOnly\` (TypeScript 5.8, matching Node's built-in type stripping) push you towards syntax that can simply be erased. Many teams now prefer string-literal unions over \`enum\`.

**Making the boundary safe:** validate **at the edges** (HTTP responses, request bodies, \`localStorage\`, IndexedDB, \`postMessage\`, environment variables), and derive the static type from the schema so the two cannot drift apart:

\`\`\`ts
import { z } from 'zod'

const User = z.object({ id: z.string(), name: z.string(), email: z.string().email().optional() })
type User = z.infer<typeof User>

async function fetchUser(id: string): Promise<User> {
  const res = await fetch(\`/api/users/\${id}\`)
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`)
  return User.parse(await res.json()) // throws a clear error if the shape is wrong
}
\`\`\`

Inside the system, trust the types. At the boundary, prove them. Generating types from an OpenAPI schema, or sharing them in a monorepo, helps, but it still does not validate what actually arrives at runtime.`,
          keyPoints: [
            'Types are erased; there are no runtime checks',
            'enums, namespaces, decorators and parameter properties emit code',
            'Validate at the boundaries with a schema',
            'Derive types from schemas (z.infer)',
            'Handle non-OK HTTP responses explicitly',
          ],
          pitfalls: ['"TypeScript guarantees the API shape"', 'Validating deep inside the app instead of at the edge'],
          followUps: ['How would you share types between a NestJS backend and a Vue frontend?'],
          personalAngle:
            'Enterprise integrations are where unexpected payloads show up. Describe a real integration issue where runtime data did not match the expected type, and how you guarded against it.',
        },
      ],
    },
    {
      id: 'ts-generics-advanced',
      title: 'Generics & type-level programming',
      summary: 'Generics with constraints, keyof/typeof, utility types, conditional and mapped types, and typing functions.',
      questions: [
        {
          id: 'ts-generics-constraints-keyof',
          title: 'Generics with constraints, keyof and typeof',
          type: 'coding',
          difficulty: 'core',
          priority: 'must',
          tags: ['generics', 'constraints', 'keyof', 'typeof', 'indexed-access'],
          estMinutes: 12,
          roles: ['frontend', 'full-stack', 'backend'],
          prompt: `Write fully typed versions of:
1. \`pluck(items, key)\`, which returns an array of \`items[i][key]\`, with \`key\` restricted to real keys and the correct element type in the result.
2. \`groupBy(items, getKey)\`.

Then derive a \`RouteName\` type from a runtime \`ROUTES\` object.`,
          hints: [
            'Constrain K with `extends keyof T`.',
            'The element type is the indexed access type T[K].',
            '`keyof typeof value` turns a runtime object into a union of its keys.',
          ],
          answer: `**Generics let the types flow from the input to the output. Constraints restrict what callers may pass.**

\`\`\`ts
function pluck<T, K extends keyof T>(items: readonly T[], key: K): T[K][] {
  return items.map((item) => item[key])
}

const users = [{ id: 1, name: 'Ana' }, { id: 2, name: 'Ken' }]
const names = pluck(users, 'name') // string[]
pluck(users, 'age') // Error: '"age"' is not assignable to '"id" | "name"'

function groupBy<T, K extends PropertyKey>(
  items: readonly T[],
  getKey: (item: T) => K,
): Partial<Record<K, T[]>> {
  const out: Partial<Record<K, T[]>> = {}
  for (const item of items) {
    const k = getKey(item)
    ;(out[k] ??= []).push(item)
  }
  return out
}
// Built-in since ES2024: Object.groupBy(items, getKey) and Map.groupBy(items, getKey)
\`\`\`

**Why \`Partial<Record<K, T[]>>\`:** with \`K = 'admin' | 'user'\`, an input with no admins has no \`admin\` key. A plain \`Record<K, T[]>\` would claim the key always exists.

**\`keyof\` and \`typeof\` together:**
\`\`\`ts
const ROUTES = { home: '/', settings: '/settings', question: '/q/:id' } as const
type RouteName = keyof typeof ROUTES // 'home' | 'settings' | 'question'
type RoutePath = (typeof ROUTES)[RouteName] // '/' | '/settings' | '/q/:id'
\`\`\`
- \`typeof\` (in a type position) gets the type of a *value*.
- \`keyof\` gives the union of a type's keys.
- \`T[K]\` (indexed access) looks up the type of a property.

**Good generic hygiene:**
- Each type parameter should appear at least twice, relating an input to an output (or to another input). If it appears only once, use a concrete type or \`unknown\`.
- Prefer inference at the call site to explicit \`<T>\` arguments.
- Add constraints (\`extends\`) only when the body needs them.`,
          keyPoints: [
            'K extends keyof T restricts keys',
            'T[K] gives the property type',
            'keyof typeof derives types from runtime values',
            'as const preserves literal types',
            'Honest return types (Partial when keys may be missing)',
          ],
          pitfalls: ['Adding generics that appear only once', 'Returning Record<K, T[]> when keys may be missing'],
          followUps: ['Type a `get(obj, "a.b.c")` path accessor.'],
        },
        {
          id: 'ts-utility-types',
          title: 'Utility types you actually use',
          type: 'concept',
          difficulty: 'core',
          priority: 'should',
          tags: ['utility-types', 'partial', 'pick-omit', 'record', 'returntype'],
          estMinutes: 5,
          roles: ['frontend', 'full-stack', 'backend'],
          prompt: `You have \`type User = { id: string; name: string; email: string; passwordHash: string; createdAt: Date }\`. **Using built-in utility types, derive:** a public user DTO, an update payload, and the type of whatever \`getUser()\` resolves to. Explain each utility type you use.`,
          hints: [
            'Remove fields, make fields optional, and unwrap a Promise.',
            'Omit, Partial, Pick, Awaited and ReturnType.',
          ],
          answer: `**Derive related types from a single source of truth, so a change to \`User\` flows everywhere automatically.**

\`\`\`ts
type User = { id: string; name: string; email: string; passwordHash: string; createdAt: Date }

type PublicUser = Omit<User, 'passwordHash'> // never expose the hash
type UpdateUser = Partial<Pick<User, 'name' | 'email'>> // only these, all optional
type CreateUser = Omit<User, 'id' | 'createdAt'> // set by the server
type UserById = Record<User['id'], PublicUser>

declare function getUser(id: string): Promise<PublicUser>
type GetUserResult = Awaited<ReturnType<typeof getUser>> // PublicUser
\`\`\`

**The utility types worth knowing well:**
| Type | Does |
| --- | --- |
| \`Partial<T>\` / \`Required<T>\` | make every property optional or required |
| \`Readonly<T>\` | makes every property readonly (shallow) |
| \`Pick<T, K>\` / \`Omit<T, K>\` | keep or remove keys |
| \`Record<K, V>\` | an object with keys K and values V |
| \`Exclude<U, X>\` / \`Extract<U, X>\` | filter **union members** |
| \`NonNullable<T>\` | removes \`null\` and \`undefined\` |
| \`ReturnType<F>\` / \`Parameters<F>\` | function output and input types |
| \`Awaited<T>\` | unwraps (nested) Promises |
| \`NoInfer<T>\` (TS 5.4) | stops a position from being used to infer a type parameter |

**Subtleties to mention:**
- \`Omit\` is not checked: \`Omit<User, 'pasword'>\` compiles quietly, even with the typo. A stricter version is \`Omit<T, K extends keyof T>\`, or use \`Pick\` for an allow-list.
- \`Omit\` over a **union** does not distribute; it collapses the union to the common keys.
- \`Partial\` is shallow; deep versions are custom mapped types.
- For public API responses, an **allow-list** (\`Pick\`) is safer than a deny-list (\`Omit\`): a new sensitive field added to \`User\` later will not leak automatically.`,
          keyPoints: [
            'Derive types from one source of truth',
            'Omit/Pick/Partial for DTOs',
            'Awaited<ReturnType<typeof fn>>',
            'Exclude/Extract work on unions; Pick/Omit work on keys',
            'Prefer allow-lists for public data',
          ],
          pitfalls: ['Omit does not check the key exists', 'Using Exclude on object keys instead of union members'],
        },
        {
          id: 'ts-conditional-mapped-types',
          title: 'Conditional and mapped types',
          type: 'coding',
          difficulty: 'advanced',
          priority: 'should',
          tags: ['conditional-types', 'mapped-types', 'infer', 'template-literal-types', 'distributive'],
          estMinutes: 15,
          roles: ['frontend', 'full-stack'],
          prompt: `Implement these types and explain how they work:
1. \`ElementType<T>\`: the element type of an array, otherwise \`T\` itself.
2. \`DeepReadonly<T>\`.
3. \`Getters<T>\`: \`{ name: string }\` becomes \`{ getName: () => string }\`.

Also explain why \`ToArray<string | number>\` gives \`string[] | number[]\`.`,
          hints: [
            'Conditional types use `T extends X ? A : B`, and `infer` captures part of a type.',
            'Mapped types iterate with `[K in keyof T]`; `as` remaps keys.',
            'A conditional type on a naked type parameter distributes over unions.',
          ],
          answer: `\`\`\`ts
// 1. Conditional type with infer
type ElementType<T> = T extends readonly (infer U)[] ? U : T
type A = ElementType<string[]> // string
type B = ElementType<number> // number

// 2. Recursive mapped type
type DeepReadonly<T> = T extends (...args: never[]) => unknown
  ? T // leave functions alone
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T

// 3. Key remapping with a template literal type
type Getters<T> = {
  [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K]
}
type G = Getters<{ name: string; age: number }>
// { getName: () => string; getAge: () => number }
\`\`\`

**How they work:**
- **Conditional types** (\`T extends X ? A : B\`) are if-statements at the type level. **\`infer U\`** declares a type variable that is captured from the matched structure. This is how \`ReturnType\`, \`Parameters\` and \`Awaited\` are built.
- **Mapped types** (\`{ [K in keyof T]: … }\`) transform each property. Modifiers can be added or removed (\`readonly\`, \`?\`, \`-readonly\`, \`-?\`), and the **\`as\` clause** renames keys or filters them (map a key to \`never\` to drop it).

**Distribution:**
\`\`\`ts
type ToArray<T> = T extends unknown ? T[] : never
type X = ToArray<string | number> // string[] | number[]
type ToArrayND<T> = [T] extends [unknown] ? T[] : never
type Y = ToArrayND<string | number> // (string | number)[]
\`\`\`
When the checked type is a **naked type parameter**, the conditional type is applied to *each union member separately* and the results are unioned. Wrapping both sides in a tuple (\`[T]\`) turns distribution off. Distribution is why \`Exclude<T, U> = T extends U ? never : T\` works.

**When to use this in real code:** library typings (REI-KIT props, typed event emitters, form libraries) and deriving types from configuration. In application code, keep it minimal: readable types beat clever ones, and deep recursive types slow down the compiler and the editor.`,
          keyPoints: [
            'Conditional types with infer',
            'Mapped types with modifiers and as-remapping',
            'Template literal types for key names',
            'Distribution over naked type parameters, and [T] to disable it',
            'Prefer readability in application code',
          ],
          pitfalls: ['Forgetting distribution, which produces unexpected unions', 'DeepReadonly that also maps over function types'],
          followUps: ['Implement `Awaited<T>` yourself.'],
          personalAngle:
            'If REI-KIT derives prop or emit types (for example, variants or a palette from a config object), that is a strong real-world example of mapped and conditional types.',
        },
        {
          id: 'ts-function-typing',
          title: 'Typing functions: overloads, callbacks and this',
          type: 'concept',
          difficulty: 'core',
          priority: 'nice',
          tags: ['functions', 'overloads', 'callbacks', 'void', 'generics'],
          estMinutes: 5,
          roles: ['frontend', 'full-stack', 'backend'],
          prompt: `**How do you type a function whose return type depends on its argument?** For example, \`parse(input: string)\` returns \`number\` while \`parse(input: string[])\` returns \`number[]\`. Compare overloads, generics and union parameters, and explain why \`() => void\` accepts a function that returns a value.`,
          hints: [
            'Overloads are a list of signatures plus one implementation.',
            'A conditional return type is another option.',
            'void in a callback type means "the return value is ignored".',
          ],
          answer: `**Use overloads when a small, fixed set of input types maps to different outputs. Use generics when the output follows the input's type. Use a plain union parameter when the output does not depend on the input.**

\`\`\`ts
// Overloads: callers see only the first two signatures
function parse(input: string): number
function parse(input: string[]): number[]
function parse(input: string | string[]): number | number[] {
  return Array.isArray(input) ? input.map(Number) : Number(input)
}
const n = parse('4') // number
const ns = parse(['1', '2']) // number[]

// Generic plus conditional return: flexible, but the body usually needs an assertion
function parse2<T extends string | string[]>(input: T): T extends string ? number : number[] {
  return (Array.isArray(input) ? input.map(Number) : Number(input)) as T extends string ? number : number[]
}
\`\`\`

**Overload rules:** order the signatures from most to least specific; the implementation signature is not callable from outside; and the body is checked only against the implementation signature, so the overloads can lie if the body is wrong.

**Callback typing:**
- \`type Handler = (event: MouseEvent) => void\`. A function that returns a value **is** assignable to it. \`void\` in a callback position means "the caller ignores the result", which is why \`arr.forEach((x) => list.push(x))\` compiles even though \`push\` returns a number.
- Parameters are compared *bivariantly* for method-style declarations but *contravariantly* for function-type properties under \`strictFunctionTypes\`. Prefer \`onChange: (v: string) => void\` over \`onChange(v: string): void\` in interfaces when you want the stricter check.
- Fewer parameters are fine: \`(a) => …\` is assignable to \`(a, b) => …\`.

**\`this\` parameters:** \`function onClick(this: HTMLButtonElement, e: MouseEvent) {}\` types \`this\` for code that is called with a receiver. The parameter is erased at compile time.`,
          keyPoints: [
            'Overloads for a fixed input-to-output mapping',
            'Generics when the output follows the input type',
            'Implementation signatures are hidden; the body can be wrong',
            'void callbacks may return values that are ignored',
            'strictFunctionTypes and method vs property syntax',
          ],
          pitfalls: ['Using a union parameter and union return when callers need the precise type'],
        },
      ],
    },
    {
      id: 'ts-narrowing-config',
      title: 'Narrowing, unions & the compiler',
      summary: 'Type guards, discriminated unions with exhaustiveness checks, and strict compiler settings.',
      questions: [
        {
          id: 'ts-narrowing-type-guards',
          title: 'Debug: narrowing that does not stick, and a lying type guard',
          type: 'debugging',
          difficulty: 'core',
          priority: 'must',
          tags: ['narrowing', 'type-guards', 'type-predicates', 'filter'],
          estMinutes: 8,
          roles: ['frontend', 'full-stack', 'backend'],
          prompt: `This code has **one compile error and one runtime bug**. Find both, and explain how narrowing and type predicates work.`,
          code: {
            language: 'typescript',
            source: `type User = { id: string; name: string; email?: string }

function isUser(x: unknown): x is User {
  return typeof x === 'object' && x !== null && 'id' in x
}

function emailsFrom(payload: unknown[]): string[] {
  const users = payload.filter(isUser)
  console.log(users.map((u) => u.name.toUpperCase()))
  return users
    .filter((u) => u.email !== undefined)
    .map((u) => u.email.toLowerCase()) // compile error here
}`,
          },
          hints: [
            'Does checking u.email inside filter change the type of the array elements?',
            'What does isUser actually verify, compared with what it claims?',
          ],
          answer: `**Compile error:** \`'u.email' is possibly 'undefined'\`. A \`filter\` callback narrows only *inside* the callback. Checking a **property** (\`u.email\`) does not narrow the element type \`User\`, so after \`filter\` the array is still \`User[]\`. (TypeScript 5.5 infers type predicates from some callbacks, such as \`x => x !== undefined\`, but only when the check narrows the parameter itself, not one of its properties.)

Fixes:
\`\`\`ts
type WithEmail = User & { email: string }
const hasEmail = (u: User): u is WithEmail => u.email !== undefined
return users.filter(hasEmail).map((u) => u.email.toLowerCase())

// or: users.flatMap((u) => (u.email ? [u.email.toLowerCase()] : []))
\`\`\`

**Runtime bug:** \`isUser\` **lies**. It only checks \`id\`, but it tells the compiler the value is a full \`User\`. A payload item \`{ id: '1' }\` passes, and then \`u.name.toUpperCase()\` throws. The compiler **does not verify the body of a type predicate**; \`x is User\` is a promise you make. Check every field you rely on, or use a schema validator:
\`\`\`ts
function isUser(x: unknown): x is User {
  return typeof x === 'object' && x !== null &&
    'id' in x && typeof x.id === 'string' &&
    'name' in x && typeof x.name === 'string' &&
    (!('email' in x) || x.email === undefined || typeof x.email === 'string')
}
\`\`\`

**The narrowing toolbox:** \`typeof\`, \`instanceof\`, \`in\`, equality and truthiness checks, discriminant checks (\`s.kind === 'a'\`), user-defined predicates (\`x is T\`), and assertion functions (\`asserts x is T\`). Narrowing is **flow-based**: it can be lost across function boundaries, after reassignment, or for mutable properties when other code runs in between.`,
          keyPoints: [
            'Narrowing inside a callback does not change the array type',
            'Use a type predicate (or flatMap) with filter',
            'Type predicates are unchecked promises',
            'The narrowing tools: typeof, instanceof, in, discriminants, asserts',
            'Narrowing is flow-sensitive',
          ],
          pitfalls: ['Fixing it with `u.email!`, which hides the problem', 'Trusting predicates that check one field'],
          followUps: ['What is an assertion function, and when is it better than a predicate?'],
        },
        {
          id: 'ts-discriminated-unions-exhaustive',
          title: 'Discriminated unions and exhaustiveness',
          type: 'coding',
          difficulty: 'core',
          priority: 'must',
          tags: ['discriminated-unions', 'never', 'exhaustiveness', 'state-modeling'],
          estMinutes: 12,
          roles: ['frontend', 'full-stack', 'backend'],
          prompt: `A component stores \`{ loading: boolean; error?: Error; data?: T }\`, and bugs appear where \`loading\` and \`error\` are both set. **Remodel the state with a discriminated union and make the render function fail to compile when someone adds a new state.**`,
          hints: [
            'Give each state a literal tag field.',
            'In the switch default branch, assign the value to never.',
          ],
          answer: `**Model each valid state explicitly with a literal tag, so impossible combinations cannot be represented, and use \`never\` to force exhaustive handling.**

\`\`\`ts
type RemoteData<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error }

function assertNever(x: never): never {
  throw new Error(\`Unhandled state: \${JSON.stringify(x)}\`)
}

function render<T>(state: RemoteData<T>, view: (data: T) => string): string {
  switch (state.status) {
    case 'idle':
      return ''
    case 'loading':
      return 'Loading…'
    case 'success':
      return view(state.data) // narrowed: data exists here
    case 'error':
      return \`Failed: \${state.error.message}\`
    default:
      return assertNever(state) // compile error if a new status is not handled
  }
}
\`\`\`

**Why it is better:**
- With four optional fields there are 2⁴ combinations, most of them invalid. The union allows exactly **four**.
- Checking \`state.status\` **narrows** the whole object, so \`data\` is available only where it exists, without \`!\` assertions.
- If someone adds \`| { status: 'refreshing'; data: T }\`, every \`switch\` with \`assertNever\` fails to compile until it handles the new state. Refactoring becomes safe.

**Where else to use them:** API results (\`{ ok: true; value } | { ok: false; error }\`), Redux or Pinia actions, event payloads, WebSocket messages, form or wizard steps, and job states in a queue (\`queued | running | failed | done\`).

**Variations:** \`satisfies never\` inside \`default\` does the same check without a helper. ESLint's \`switch-exhaustiveness-check\` rule enforces it across a codebase.`,
          keyPoints: [
            'A literal discriminant on each variant',
            'Makes illegal states unrepresentable',
            'Narrowing by tag gives safe access to fields',
            'assertNever / never for exhaustiveness',
            'Adding a variant becomes a compile-time to-do list',
          ],
          pitfalls: ['Using boolean flags for mutually exclusive states', 'A default branch that silently returns'],
          followUps: ['How would you model a job that can be retried with an attempt count?'],
          personalAngle:
            'Your scraping job lifecycle (scheduled, running, failed, recovering, done) is a natural discriminated union. Use it as your example instead of the generic fetch state.',
        },
        {
          id: 'ts-strict-mode-compiler',
          title: 'Strict mode and the compiler pipeline',
          type: 'concept',
          difficulty: 'advanced',
          priority: 'should',
          tags: ['strict-mode', 'tsconfig', 'compiler', 'isolated-modules', 'tooling'],
          estMinutes: 5,
          roles: ['frontend', 'full-stack', 'backend'],
          prompt: `**What does \`"strict": true\` actually enable**, which other flags would you add for a new project, and how do \`tsc\`, Vite/esbuild and \`vue-tsc\` divide the work?`,
          hints: [
            'strict is a bundle of flags.',
            'Indexed access is not checked by strict alone.',
            'Transpilers strip types; they do not type-check.',
          ],
          answer: `**\`strict\` is a bundle of flags** that are all worth having. New flags may be added to it in future versions:
- \`strictNullChecks\`: \`null\` and \`undefined\` are separate types. This is the most valuable flag.
- \`noImplicitAny\`: an error when a type falls back to \`any\`.
- \`strictFunctionTypes\`: contravariant parameter checks for function types.
- \`strictBindCallApply\`, \`strictPropertyInitialization\`, \`noImplicitThis\`, \`alwaysStrict\`, and \`useUnknownInCatchVariables\` (\`catch (e)\` gives \`unknown\`).

**Flags worth adding on top:**
- \`noUncheckedIndexedAccess\`: \`arr[i]\` and \`record[key]\` become \`T | undefined\`. This catches real bugs, at the cost of some noise.
- \`exactOptionalPropertyTypes\`: \`{ a?: string }\` no longer accepts an explicit \`undefined\`.
- \`noImplicitOverride\` and \`noFallthroughCasesInSwitch\`.
- \`verbatimModuleSyntax\` (forces \`import type\` for type-only imports) and \`isolatedModules\`, so that each file can be transpiled on its own.

**The pipeline:**
- **Transpilers** (esbuild in Vite, SWC, Babel, Node's type stripping) **remove types file by file and never type-check**. That makes them fast, but a type error will not fail \`vite dev\` or \`vite build\` on its own.
- **\`tsc --noEmit\`** does the full type check across the program. **\`vue-tsc\`** wraps it so that \`.vue\` single-file components are checked too. Run it in CI and in your editor (Volar / Vue language tools).
- Project references (\`tsconfig.app.json\` and \`tsconfig.node.json\`) split app code and tooling code, so each gets the right \`lib\` and \`types\`.
- Microsoft is porting the compiler to native code (Go) for much faster checks on large codebases, planned as TypeScript 7. The type system itself stays the same.`,
          keyPoints: [
            'strict is a family of flags',
            'Add noUncheckedIndexedAccess and exactOptionalPropertyTypes',
            'Transpilers strip types and do not check them',
            'tsc / vue-tsc type-check in CI',
            'isolatedModules / verbatimModuleSyntax for per-file transpilation',
          ],
          pitfalls: ['Assuming Vite build fails on type errors', 'Thinking strict includes noUncheckedIndexedAccess'],
          followUps: ['How would you migrate a large JavaScript codebase to strict TypeScript incrementally?'],
          references: [{ label: 'TSConfig reference', url: 'https://www.typescriptlang.org/tsconfig/' }],
        },
      ],
    },
  ],
}

export default track
