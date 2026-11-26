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
          intent:
            'Tests whether you can define structural typing precisely and explain the excess-property check as a separate rule for fresh literals. Strong answers also cover widening, `as const` and `satisfies`, and name branded types as the escape hatch.',
          hints: [
            'Does `draw` care what the argument is *called*, or only which properties it has?',
            'Both calls pass the same shape. What is different about the second argument: where does it come from?',
            'A **fresh object literal** written directly at a typed position gets an extra "known properties only" check, to catch typos. A variable is not fresh.',
            'Near-answer: "assignable if it has at least the required members" → excess property check only on fresh literals → inference examples (`let` widens, `const` keeps literals, `as const`, `satisfies`) → branded types for nominal-ish IDs.',
          ],
          walkthrough: [
            {
              title: 'Define structural typing',
              body: 'A value is assignable to a type if it has **at least the required members with compatible types**. Names and declarations do not matter, so `{ x, y, z }` *is* a `Point`.',
            },
            {
              title: 'Explain why the second call fails',
              body: 'An **excess property check** runs only on **fresh object literals** assigned or passed directly to a typed target: an extra key there is probably a typo (`widht`). `p3` is a variable, no longer fresh, so normal structural rules apply.',
            },
            {
              title: 'Show inference and widening',
              body: `\`\`\`ts
let a = 'hi'                 // string (widened)
const b = 'hi'               // 'hi'
const cfg = { mode: 'dark' } // { mode: string }
const cfg2 = { mode: 'dark' } as const // { readonly mode: 'dark' }
const routes = { home: '/' } satisfies Record<string, string> // checked, keys kept
\`\`\``,
            },
            {
              title: 'Edge cases and trade-offs',
              body: 'Structural typing makes `UserId` and `OrderId` (both `string`) interchangeable; use **branded types** when that matters. Annotate boundaries (exports, public APIs, external data); let locals infer.',
            },
            {
              title: 'Say it in the interview',
              body: '*"TypeScript checks shape, not names, so p3 is a Point because it has x and y. The literal fails only because fresh literals get an excess-property check to catch typos. I infer locals, annotate boundaries, and use satisfies to check without widening."*',
            },
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
          intent:
            'Tests whether you know the real capability differences instead of folklore. A strong answer says they overlap for object shapes, names declaration merging (interface) and unions/mapped/conditional types (type), and argues for a consistent convention.',
          hints: [
            'For a plain object shape, can you write the same thing with both? Start there.',
            'What happens if you declare `interface Window { ... }` twice? What about `type Window = ...` twice?',
            'Try writing `\'idle\' | \'loading\'` or `{ [K in keyof T]: ... }` as an interface. Which keyword is required?',
            'Near-answer: mostly interchangeable → interface only: declaration merging (module augmentation), `extends` errors → type only: unions, tuples, mapped/conditional/template types → pick a convention; note interfaces are not implicitly `Record<string, unknown>`-compatible.',
          ],
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
          intent:
            'Tests whether you treat external data as untrusted at the type level: `unknown` plus narrowing or schema validation. A strong answer also explains why `any` spreads, what `never` is for, and that `as` validates nothing at runtime.',
          hints: [
            'Which of these types still lets the compiler protect you after `JSON.parse`?',
            '`any` allows every operation; `unknown` allows none until you narrow. Which is safer for data you do not control?',
            '`never` has no values at all. And does `as ApiResponse` emit any runtime code?',
            'Near-answer: (b). Narrow with `typeof x === \'object\' && x !== null && \'id\' in x`, or in practice `UserSchema.parse(data)`.',
          ],
          walkthrough: [
            {
              title: 'Restate the situation',
              body: 'The data comes from `JSON.parse` on an API you do not control, so its shape is **unproven**. The right type must let you accept anything but force you to prove the shape before use.',
            },
            {
              title: 'Eliminate the wrong options',
              body: '**any** disables checking and spreads (`x.foo.bar` is also `any`). **never** is the empty type: no value has it. **as** is compile-time only; nothing is checked at runtime. That leaves **unknown**.',
            },
            {
              title: 'Show narrowing',
              body: `\`\`\`ts
const data: unknown = JSON.parse(text)
if (typeof data === 'object' && data !== null && 'id' in data && typeof data.id === 'string') {
  data.id // string
}
// production: const user = UserSchema.parse(data) // Zod / Valibot
\`\`\``,
            },
            {
              title: 'Say it in the interview',
              body: '*"unknown, then narrow. It\'s the safe top type: anything goes in, nothing comes out unchecked. any switches checking off and leaks, never is the bottom type for exhaustiveness, and as is just a promise to the compiler. At API boundaries I validate with a schema."*',
            },
          ],
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
          intent:
            'Tests whether you understand type erasure and therefore where runtime validation must live. A strong answer lists what does emit code (enums, decorators, parameter properties), validates at the edges with a schema, and derives the static type from it.',
          hints: [
            'Open the compiled JavaScript in your head: where does `Promise<User>` appear in it?',
            'So the annotation was a claim, not a check. What could the API actually have returned (wrapped payload, error body)?',
            'A few TypeScript features *do* emit code: `enum`, `namespace` with values, parameter properties, decorators. Everything else is erased.',
            'Near-answer: `const User = z.object({ id: z.string(), name: z.string() }); type User = z.infer<typeof User>`; in `fetchUser`, check `res.ok`, then `return User.parse(await res.json())`.',
          ],
          walkthrough: [
            {
              title: 'Restate the failure',
              body: 'A function typed `Promise<User>` returned something that was not a `User`, and TypeScript did not complain. The question is why, and how to stop it happening at the boundary.',
            },
            {
              title: 'Explain erasure',
              body: 'Types are **erased** at compile time. `Promise<User>` is a promise you made to the compiler, not a runtime check. If the API sends `{ data: { user } }` or a 500 body, nothing intercepts it.',
            },
            {
              title: 'Name what survives',
              body: '`enum` (real objects), `namespace` with values, parameter properties, and decorators (NestJS DI relies on `emitDecoratorMetadata`) emit code. `interface`, `type`, generics, `as`, `satisfies` disappear. `erasableSyntaxOnly` and Node type stripping push towards erasable syntax.',
            },
            {
              title: 'Build the safe boundary',
              body: `\`\`\`ts
import { z } from 'zod'
const User = z.object({ id: z.string(), name: z.string() })
type User = z.infer<typeof User>

async function fetchUser(id: string): Promise<User> {
  const res = await fetch(\`/api/users/\${id}\`)
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`)
  return User.parse(await res.json())
}
\`\`\``,
            },
            {
              title: 'Say it in the interview',
              body: '*"Types are erased, so Promise<User> was a claim. I validate at every edge: responses, request bodies, storage, env. I derive the type from the schema so they can\'t drift, and inside the app I trust the types."*',
            },
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
          intent:
            'Tests whether you can make types flow from inputs to outputs with generics, constrain them correctly, and derive types from runtime values. A strong answer uses `K extends keyof T`, `T[K]`, an honest `Partial<Record<...>>` return, and `keyof typeof`.',
          hints: [
            '`pluck` needs two type parameters: the item type and the key type. How do you restrict the key to real keys of the item?',
            'The result element type is "the type of property K on T". What is the indexed-access syntax for that?',
            'For `groupBy`, the key type must be usable as an object key (`PropertyKey`). If a group can be missing, should the return type say every key exists?',
            'Skeleton: `function pluck<T, K extends keyof T>(items: readonly T[], key: K): ___[] { return items.map((i) => i[key]) }` and `type RouteName = keyof typeof ___`',
          ],
          walkthrough: [
            {
              title: 'Restate and clarify',
              body: '`pluck` must reject unknown keys and return the right element type; `groupBy` must be generic over item and key; `RouteName` must come from a runtime object, so it stays in sync.',
            },
            {
              title: 'Choose the type tools',
              body: '**Constraint** `K extends keyof T` limits keys. **Indexed access** `T[K]` gives the property type. `typeof value` lifts a value into a type, `keyof` takes its keys, and `as const` keeps literal types.',
            },
            {
              title: 'Build it',
              body: `\`\`\`ts
function pluck<T, K extends keyof T>(items: readonly T[], key: K): T[K][] {
  return items.map((item) => item[key])
}

function groupBy<T, K extends PropertyKey>(items: readonly T[], getKey: (item: T) => K): Partial<Record<K, T[]>> {
  const out: Partial<Record<K, T[]>> = {}
  for (const item of items) (out[getKey(item)] ??= []).push(item)
  return out
}

const ROUTES = { home: '/', settings: '/settings' } as const
type RouteName = keyof typeof ROUTES // 'home' | 'settings'
\`\`\``,
            },
            {
              title: 'Edge cases and trade-offs',
              body: '`Record<K, T[]>` would lie when a group is empty, hence `Partial`. Each type parameter should appear at least twice (relating input to output). Prefer call-site inference over explicit `<T>`. ES2024 has `Object.groupBy` / `Map.groupBy`.',
            },
            {
              title: 'Say it in the interview',
              body: '*"K extends keyof T restricts the key, and T[K] carries the property type into the result. For groupBy I return Partial<Record> because some groups may not exist. And keyof typeof ROUTES with as const keeps the route names in sync with the object."*',
            },
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
          intent:
            'Tests whether you derive DTOs from one source of truth instead of duplicating shapes, and know the sharp edges (unchecked `Omit`, union collapse, shallow `Partial`). A strong answer prefers allow-lists for public data.',
          hints: [
            'Name the three operations you need: remove a field, make some fields optional, and get the resolved type of a function.',
            'Removing and keeping keys: `Omit` and `Pick`. Making optional: `Partial`. Getting a function\'s output: `ReturnType`, unwrapped with `Awaited`.',
            'For the public DTO, which is safer if someone adds `ssn` to `User` next month: a deny-list (`Omit`) or an allow-list (`Pick`)?',
            'Near-answer: `type PublicUser = Omit<User, \'passwordHash\'>`, `type UpdateUser = Partial<Pick<User, \'name\' | \'email\'>>`, `type R = Awaited<ReturnType<typeof getUser>>`.',
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
          intent:
            'Tests type-level programming fluency: conditional types with `infer`, recursive mapped types, key remapping with template literals, and distribution over unions. A strong answer explains each mechanism and argues for restraint in application code.',
          hints: [
            '`ElementType`: pattern-match on "is T an array of something?" and capture that something. Which keyword captures a type inside `extends`?',
            '`DeepReadonly`: map over `keyof T` adding `readonly`, and recurse into each property. What should happen to functions and primitives?',
            '`Getters`: a mapped type can rename keys with `as`. Build the new key with a template literal type and `Capitalize`.',
            'Skeleton: `type ElementType<T> = T extends readonly (infer U)[] ? U : T`; for Getters, remap each key with ``as `get${Capitalize<string & K>}` `` and give it the value type `() => ___`; for distribution compare `T extends unknown ? T[] : never` with `[T] extends [unknown] ? T[] : never`.',
          ],
          walkthrough: [
            {
              title: 'Restate the three types',
              body: 'Unwrap an array element (or return T), make an object readonly at every depth, and turn each key `k` into `getK: () => T[k]`. Then explain why `ToArray<string | number>` distributes.',
            },
            {
              title: 'Pick the mechanisms',
              body: '**Conditional + `infer`** for pattern-matching a type. **Mapped types** (`[K in keyof T]`) with modifiers for readonly. **Key remapping** (`as`) with **template literal types** for renamed keys.',
            },
            {
              title: 'Build it',
              body: `\`\`\`ts
type ElementType<T> = T extends readonly (infer U)[] ? U : T

type DeepReadonly<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T

type Getters<T> = {
  [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K]
}
\`\`\``,
            },
            {
              title: 'Explain distribution and edge cases',
              body: 'A conditional on a **naked type parameter** is applied to each union member separately: `ToArray<string | number>` → `string[] | number[]`. Wrap in a tuple (`[T] extends [unknown]`) to stop it. Leave functions alone in `DeepReadonly`. `string & K` filters out symbol keys for `Capitalize`.',
            },
            {
              title: 'Say it in the interview',
              body: '*"Conditional types are type-level ifs, and infer captures a piece, which is how ReturnType works. Mapped types transform each key, and as lets me rename them with template literals. Distribution happens on naked type parameters; a tuple wrapper turns it off. I keep this in library code and out of app code."*',
            },
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
          intent:
            'Tests whether you can choose between overloads, generics and unions based on how output relates to input, and know the callback rules (`void` returns, parameter bivariance, `this` parameters). Strong answers mention that overload bodies are not checked against each signature.',
          hints: [
            'Does the output type depend on the input type? If yes, a union-in/union-out signature loses information for callers.',
            'Overloads: list the public signatures, then write one implementation signature that covers them all. Which signatures can callers see?',
            'A generic with a conditional return type also works, but what does the body usually need to satisfy it?',
            'Near-answer: `function parse(input: string): number; function parse(input: string[]): number[]; function parse(input: string | string[]) { ... }`. For callbacks: `() => void` means "result ignored", so returning a value is allowed.',
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
          intent:
            'Tests whether you understand that narrowing is flow-based and local, so a property check inside `filter` does not change the array type, and that type predicates are unchecked promises. A strong answer fixes both bugs without `!`.',
          hints: [
            'Hover over `users` after `.filter((u) => u.email !== undefined)`. Is its type any different from before the filter?',
            'Narrowing inside a callback stays inside the callback. To change the *element type* of the result, `filter` needs a callback whose return type is `u is Something`.',
            'Now the runtime bug: `isUser` claims `x is User`. Which fields does it actually check, and which field does the next line use?',
            'Near-answer: `const hasEmail = (u: User): u is User & { email: string } => u.email !== undefined`, then `users.filter(hasEmail).map((u) => u.email.toLowerCase())`; and make `isUser` check `typeof x.name === \'string\'` too (or use a schema).',
          ],
          walkthrough: [
            {
              title: 'Restate: two bugs',
              body: 'One **compile** error on `u.email.toLowerCase()` and one **runtime** crash. Treat them separately: the first is about how narrowing flows, the second about what a type predicate promises.',
            },
            {
              title: 'Explain the compile error',
              body: 'Narrowing in a `filter` callback is **local** to that callback. Checking a **property** (`u.email`) does not change the element type, so the result is still `User[]` and `email` is `string | undefined`. (TS 5.5 infers predicates only when the check narrows the parameter itself.)',
            },
            {
              title: 'Fix both',
              body: `\`\`\`ts
const hasEmail = (u: User): u is User & { email: string } => u.email !== undefined
return users.filter(hasEmail).map((u) => u.email.toLowerCase())

function isUser(x: unknown): x is User {
  return typeof x === 'object' && x !== null &&
    'id' in x && typeof x.id === 'string' &&
    'name' in x && typeof x.name === 'string'
}
\`\`\`
Or skip the predicate: \`users.flatMap((u) => (u.email ? [u.email.toLowerCase()] : []))\`.`,
            },
            {
              title: 'Explain the runtime bug and edge cases',
              body: '`isUser` checks only `id` but claims a full `User`. `{ id: \'1\' }` passes and `u.name.toUpperCase()` throws. The compiler **never verifies a predicate body**. `u.email!` silences the compile error but hides the problem. Narrowing also resets after reassignment or across function calls.',
            },
            {
              title: 'Say it in the interview',
              body: '*"The filter narrows inside the callback but not the array type, so I give filter a real type predicate or use flatMap. The runtime crash is because isUser lies: it checks id but promises name. Predicates are trusted, not verified, so they must check everything, or I use a schema."*',
            },
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
          intent:
            'Tests state modelling: replacing independent flags with a discriminated union so illegal states cannot exist, and using `never` to make the compiler flag unhandled variants. A strong answer shows narrowing by tag and the refactor-safety payoff.',
          hints: [
            'List the states the component can really be in. How many are there, and how many combinations do the three optional fields allow?',
            'Give each state its own object type with a literal `status` field, and put `data` / `error` only on the states that have them.',
            'In a `switch (state.status)`, each `case` narrows the whole object. In `default`, what type is left if every case is handled?',
            'Skeleton: `type RemoteData<T> = { status: \'idle\' } | { status: \'loading\' } | { status: \'success\'; data: T } | { status: \'error\'; error: Error }` and `default: return assertNever(state)` with `function assertNever(x: never): never { throw ... }`',
          ],
          walkthrough: [
            {
              title: 'Restate the problem',
              body: '`{ loading; error?; data? }` allows contradictory combinations (loading **and** error). The goal: make only valid states representable, and make the compiler complain when a new state is not handled.',
            },
            {
              title: 'Model it as a discriminated union',
              body: 'One variant per real state, each with a **literal tag** (`status`). Fields live only on the variants that have them: `data` on `success`, `error` on `error`. Four states instead of 2⁴ combinations.',
            },
            {
              title: 'Build it',
              body: `\`\`\`ts
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
    case 'idle': return ''
    case 'loading': return 'Loading…'
    case 'success': return view(state.data)
    case 'error': return \`Failed: \${state.error.message}\`
    default: return assertNever(state)
  }
}
\`\`\``,
            },
            {
              title: 'Edge cases and trade-offs',
              body: 'Adding `{ status: \'refreshing\'; data: T }` makes every `assertNever` switch fail to compile: a to-do list for free. A `default` that silently returns defeats this. `satisfies never` or ESLint `switch-exhaustiveness-check` are alternatives.',
            },
            {
              title: 'Say it in the interview',
              body: '*"Booleans let impossible combinations exist, so I model each state with a literal tag. Switching on the tag narrows the object, so data is only reachable on success. The never default makes any new state a compile error until it\'s handled."*',
            },
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
          intent:
            'Tests whether you know what `strict` really covers, which extra flags catch real bugs, and that transpilers strip types without checking them. A strong answer ends with where type-checking actually runs (tsc / vue-tsc in CI and editor).',
          hints: [
            '`strict` is not one check. Name the most valuable flag inside it.',
            'Is `arr[10]` typed as `T | undefined` under `strict` alone? Which flag changes that?',
            'Does `vite build` fail on a type error? What does esbuild do with types?',
            'Near-answer: strict = strictNullChecks, noImplicitAny, strictFunctionTypes, … → add noUncheckedIndexedAccess, exactOptionalPropertyTypes, verbatimModuleSyntax, isolatedModules → transpilers strip per file, `tsc --noEmit` / `vue-tsc` check in CI.',
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
