import type { Track } from '@/types/content'

const track: Track = {
  id: 'nextjs',
  code: 'H',
  title: 'Next.js',
  summary: 'App Router, server/client components, rendering strategies, caching and deployment.',
  rationale:
    'Next.js appears in a large share of Tokyo full-stack job posts, and interviewers use it to test whether you understand rendering and caching as well as the API surface. Your enterprise SSR/SPA integration work and SEO background give you real stories here. Tie them to the App Router model.',
  icon: 'Layers',
  phase: 2,
  modules: [
    {
      id: 'next-routing-components',
      title: 'App Router & component model',
      summary: 'File-system routing, layouts, and the server/client component boundary.',
      questions: [
        {
          id: 'next-app-router-basics',
          title: 'How the App Router maps files to UI',
          type: 'concept',
          difficulty: 'foundation',
          priority: 'must',
          tags: ['app-router', 'routing', 'layouts'],
          estMinutes: 4,
          roles: ['frontend', 'full-stack'],
          prompt: `Walk me through how routing works in the Next.js **App Router**. What do \`page.tsx\`, \`layout.tsx\`, \`loading.tsx\` and \`error.tsx\` each do, and how are dynamic segments handled?`,
          hints: [
            'Folders define URL segments; special files define what renders for that segment.',
            'Think about what stays mounted when you navigate between sibling pages.',
            'loading and error are wired to React features: Suspense and error boundaries.',
          ],
          answer: `In the App Router, **folders under \`app/\` define URL segments** and a few **special files** define the UI for each segment.

- \`page.tsx\` makes a segment publicly routable and renders its unique content.
- \`layout.tsx\` wraps its segment and all its children. Layouts **persist across navigation**: they don't re-mount, so their state and DOM survive. The root layout must render \`<html>\` and \`<body>\`.
- \`loading.tsx\` becomes a **React Suspense fallback** around the page, so the route streams an instant loading state.
- \`error.tsx\` becomes a **React error boundary** for the segment. It must be a Client Component and receives \`error\` and \`reset\`.
- \`not-found.tsx\`, \`template.tsx\` (like a layout but re-mounts on every navigation) and \`route.ts\` (an HTTP handler instead of UI) complete the set.

**Dynamic segments** use brackets: \`app/blog/[slug]/page.tsx\`, catch-all \`[...slug]\` and optional catch-all \`[[...slug]]\`. Since Next.js 15, \`params\` and \`searchParams\` are **Promises**, so you await them:

\`\`\`tsx
export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)
  return <article>{post.title}</article>
}
\`\`\`

Folders in parentheses, like \`(marketing)\`, are **route groups**. They organise code or share a layout without adding a URL segment. Folders prefixed with \`_\` are private and never become routes. Use \`generateStaticParams\` to prerender known dynamic paths at build time.`,
          keyPoints: [
            'Folders = segments, special files = UI per segment',
            'Layouts persist and do not re-render on sibling navigation',
            'loading = Suspense boundary, error = error boundary (client)',
            'params are async since Next.js 15',
            'Route groups and private folders',
          ],
          pitfalls: [
            'Saying layouts re-mount on every navigation (that is template.tsx)',
            'Forgetting error.tsx must be a Client Component',
          ],
          followUps: ['When would you use a template instead of a layout?', 'What are parallel and intercepting routes?'],
          references: [{ label: 'Next.js docs: Layouts and Pages', url: 'https://nextjs.org/docs/app/getting-started/layouts-and-pages' }],
        },
        {
          id: 'next-server-vs-client-components',
          title: 'Server Components vs Client Components',
          type: 'tradeoff',
          difficulty: 'core',
          priority: 'must',
          tags: ['server-components', 'client-components', 'rsc', 'use-client'],
          estMinutes: 6,
          roles: ['frontend', 'full-stack'],
          prompt: `What is the difference between a **Server Component** and a **Client Component** in Next.js? How do you decide which one to use, and what does \`'use client'\` actually do?`,
          hints: [
            'Which one ships JavaScript to the browser?',
            'Interactivity (state, effects, event handlers, browser APIs) forces one choice.',
            "'use client' marks a boundary for a module and everything it imports, not one component.",
          ],
          answer: `**Server Components are the default** in the App Router. They render on the server (at build or request time), can be \`async\`, read databases and secrets directly, and **ship no component JavaScript** to the browser. Only their rendered output (the RSC payload) is sent. **Client Components** are rendered to HTML on the server too, then **hydrated** in the browser so they can use state, effects, event handlers and browser APIs.

\`'use client'\` declares a **module boundary**. That file, and every module it imports, becomes part of the client bundle. You don't add it to every interactive file, only at the entry point of a client subtree.

**How to decide:**
- Use a Server Component for data fetching, large dependencies (markdown, syntax highlighting, date libraries), secrets, and static or SEO content.
- Use a Client Component for \`useState\`/\`useEffect\`, \`onClick\`, \`window\`/\`localStorage\`, and context providers.
- **Push the boundary down to the leaves.** Keep the page a Server Component and make only the \`<LikeButton>\` a client one.

**Composition rules:**
- A Server Component can import and render a Client Component and pass **serializable props**.
- A Client Component **cannot import** a Server Component, but it can receive one as \`children\` or another prop. This is how you wrap server content in a client provider.

\`\`\`tsx
// layout.tsx (server)
<ThemeProvider>{children}</ThemeProvider> // ThemeProvider is 'use client'; children stay server-rendered
\`\`\`

Use the \`server-only\` package to make a module fail the build if it is imported on the client.`,
          keyPoints: [
            'Server is the default; no JS shipped for server components',
            "'use client' marks a module graph boundary",
            'Props across the boundary must be serializable',
            'Pass server components to client ones as children',
            'Push client boundaries to the leaves',
          ],
          pitfalls: [
            'Thinking Client Components are not rendered on the server at all',
            'Putting use client at the top of the layout and losing all server benefits',
            'Passing functions or class instances as props from server to client',
          ],
          followUps: ['How would you use a context provider in an App Router app?', 'What is the RSC payload?'],
          personalAngle:
            'Your enterprise SSR/SPA integration issues are a good lead-in: explain how the server/client boundary decides what code runs where, and how that would have changed the integration bugs you debugged.',
          references: [{ label: 'Next.js docs: Server and Client Components', url: 'https://nextjs.org/docs/app/getting-started/server-and-client-components' }],
        },
        {
          id: 'next-hydration-mismatch',
          title: 'Debugging a hydration mismatch',
          type: 'debugging',
          difficulty: 'core',
          priority: 'must',
          tags: ['hydration', 'ssr', 'debugging'],
          estMinutes: 6,
          roles: ['frontend', 'full-stack'],
          prompt: `This component throws **"Hydration failed because the server rendered HTML didn't match the client"** in production. Why, and how do you fix it?`,
          code: {
            language: 'typescript',
            source: `'use client'

export function Greeting() {
  const hour = new Date().getHours()
  const theme = typeof window !== 'undefined' ? localStorage.getItem('theme') : 'light'
  return (
    <p className={theme ?? 'light'}>
      {hour < 12 ? 'Good morning' : 'Good afternoon'} — {Math.random().toFixed(2)}
    </p>
  )
}`,
          },
          hints: [
            'Hydration expects the first client render to produce exactly the server HTML.',
            'Three values here differ between server and browser.',
            'Move browser-only reads into an effect, or skip SSR for that part.',
          ],
          answer: `**Hydration** attaches React to server-rendered HTML. It requires the **first client render to produce the same markup** as the server. This component breaks that in three ways:

1. \`new Date().getHours()\` runs in the **server's timezone** (often UTC on Vercel) and then in the user's timezone.
2. \`typeof window\` branching: on the server \`theme\` is \`'light'\`, but on the client it is whatever is in \`localStorage\`.
3. \`Math.random()\` differs on every render.

**Fix:** render something deterministic first, then update after mount.

\`\`\`tsx
'use client'
import { useEffect, useState } from 'react'

export function Greeting() {
  const [client, setClient] = useState<{ greeting: string; theme: string } | null>(null)
  useEffect(() => {
    const h = new Date().getHours()
    setClient({ greeting: h < 12 ? 'Good morning' : 'Good afternoon', theme: localStorage.getItem('theme') ?? 'light' })
  }, [])
  return <p className={client?.theme ?? 'light'}>{client?.greeting ?? 'Hello'}</p>
}
\`\`\`

**Other options:**
- \`dynamic(() => import('./Greeting'), { ssr: false })\` from a Client Component, for widgets that are browser-only.
- Store theme in a **cookie** and read it on the server, so both sides agree. This also avoids a flash of the wrong theme.
- Use \`suppressHydrationWarning\` only for unavoidable single-element differences such as a timestamp. It doesn't fix nested content.
- For random IDs, use \`useId()\`.

Other common causes include invalid HTML nesting (\`<div>\` inside \`<p>\`) and browser extensions that modify the DOM.`,
          keyPoints: [
            'First client render must match server HTML',
            'Time, timezone, random and window/localStorage are typical culprits',
            'Defer browser-only values to useEffect or ssr:false',
            'Cookies let the server know user preferences',
            'Invalid HTML nesting also causes mismatches',
          ],
          pitfalls: [
            'Using typeof window checks during render as a fix (that is the bug)',
            'Blanket suppressHydrationWarning',
          ],
          followUps: ['How do you avoid a flash of incorrect theme with SSR?'],
          personalAngle:
            'Consent banners injected into enterprise SSR sites are a classic source of DOM differences before hydration. If you hit this at Efilli, describe how you isolated the injected markup.',
          references: [{ label: 'Next.js: hydration error', url: 'https://nextjs.org/docs/messages/react-hydration-error' }],
        },
      ],
    },
    {
      id: 'next-rendering-data',
      title: 'Rendering, data fetching & caching',
      summary: 'Static vs dynamic rendering, ISR, streaming, and how caching works in current Next.js.',
      questions: [
        {
          id: 'next-ssr-ssg-isr',
          title: 'SSR vs SSG vs ISR vs CSR',
          type: 'tradeoff',
          difficulty: 'foundation',
          priority: 'must',
          tags: ['ssr', 'ssg', 'isr', 'csr', 'rendering'],
          estMinutes: 5,
          roles: ['frontend', 'full-stack'],
          prompt: `Compare **SSR, SSG, ISR and client-side rendering**. For each, give a page you would build that way, and explain how you pick one in the App Router.`,
          hints: [
            'Ask when the HTML is generated: build time, request time, or in the browser.',
            'ISR is static plus a freshness policy.',
            'In the App Router you choose implicitly through the data you access.',
          ],
          answer: `The difference is **when the HTML is produced**.

| Strategy | HTML produced | Good for | Cost |
| --- | --- | --- | --- |
| **SSG** | At build time | Marketing, docs, blog | Stale until rebuild |
| **ISR** | At build time, then regenerated in the background after \`revalidate\` seconds or on demand | Product catalogue, articles | Brief staleness |
| **SSR** | On every request | Personalised dashboards, pages depending on cookies or headers | Server work and higher TTFB |
| **CSR** | In the browser after JS loads | Highly interactive app shells behind login | Poor SEO and slower first paint |

**In the App Router you don't pick a mode per page with a function** (\`getServerSideProps\`/\`getStaticProps\` are Pages Router APIs). A route is **static by default** and becomes **dynamic** when it uses request-time data: \`cookies()\`, \`headers()\`, \`searchParams\`, \`connection()\`, or uncached data.

\`\`\`ts
// ISR for a route
export const revalidate = 3600
// on-demand revalidation after a CMS webhook
revalidatePath('/blog/' + slug)   // or revalidateTag('posts')
\`\`\`

With **Partial Prerendering** (enabled through Cache Components in Next.js 16), one page can mix both: a static shell is served instantly and the dynamic holes stream in inside \`<Suspense>\`.

**How I choose:** default to static. Use ISR or tags when content changes but isn't per-user. Use dynamic rendering only for the parts that need request data. Keep CSR for interactive islands rather than whole pages.`,
          keyPoints: [
            'Distinguish by when HTML is generated',
            'ISR = static + background regeneration (time or on-demand)',
            'App Router infers static vs dynamic from data access',
            'Dynamic APIs: cookies, headers, searchParams',
            'Partial Prerendering mixes static shell + dynamic holes',
          ],
          pitfalls: [
            'Describing getServerSideProps as the App Router way',
            'Saying SSR is always better for SEO than SSG',
          ],
          followUps: ['How does on-demand revalidation work with a headless CMS?'],
          personalAngle:
            'Your 2M-visitor content site and Kakehashi (prerendered) are good examples of when static plus revalidation is the right answer.',
          references: [{ label: 'Next.js docs: Caching and Revalidating', url: 'https://nextjs.org/docs/app/getting-started/caching-and-revalidating' }],
        },
        {
          id: 'next-caching-semantics',
          title: 'Caching in current Next.js',
          type: 'concept',
          difficulty: 'advanced',
          priority: 'must',
          tags: ['caching', 'fetch', 'revalidation', 'use-cache'],
          estMinutes: 8,
          roles: ['frontend', 'full-stack'],
          prompt: `Users report that a product page shows a **stale price** after an admin updates it. Explain the caching layers in Next.js, what is cached by default in current versions, and how you would make the update show up immediately.`,
          hints: [
            'Separate server-side caches (data and rendered output) from the client-side router cache.',
            'Defaults changed in Next.js 15: fetch and GET route handlers are no longer cached by default.',
            'Tag the data, then invalidate the tag from the mutation.',
          ],
          answer: `Next.js has several caching layers. You debug staleness by asking **which layer served the old value**:

1. **Request memoization**: the same \`fetch\` (or a \`React.cache\` function) called multiple times in one render runs once. It lasts for one request only.
2. **Data cache**: persists \`fetch\` results across requests and deploys if you opt in (\`cache: 'force-cache'\` or \`next: { revalidate, tags }\`).
3. **Full route cache**: the HTML and RSC payload of **static** routes, produced at build time or revalidated through ISR.
4. **Client router cache**: RSC payloads of visited routes are kept in the browser for back/forward navigation and prefetching.

**Defaults changed in Next.js 15.** \`fetch\` is **not cached by default**, GET route handlers are not cached, and the client router cache no longer reuses page segments (stale time 0). A **static route** is still fully cached at build time, though. So "no-store by default" doesn't mean "dynamic by default". If the page used no dynamic API, the price was baked in at build time.

In **Next.js 16 with Cache Components**, caching is explicit: mark functions or components with \`'use cache'\` and control them with \`cacheLife()\` and \`cacheTag()\`.

**Fix: tag the data and invalidate it when you write.**

\`\`\`ts
// read
const product = await fetch(api + '/products/' + id, { next: { tags: ['product-' + id] } }).then(r => r.json())

// server action after the admin saves
'use server'
export async function updatePrice(id: string, price: number) {
  await db.product.update({ where: { id }, data: { price } })
  revalidateTag('product-' + id) // updateTag() in Next 16 for read-your-own-writes
}
\`\`\`

Calling \`revalidatePath\` or \`revalidateTag\` inside a Server Action also refreshes the client router cache for that user. Use \`router.refresh()\` for manual client refreshes.`,
          keyPoints: [
            'Four layers: memoization, data cache, full route cache, router cache',
            'Next 15: fetch/GET handlers not cached by default; static routes still prerendered',
            'Tags + revalidateTag/revalidatePath for on-demand invalidation',
            "Next 16 'use cache' + cacheLife/cacheTag make caching explicit",
            'Identify which layer is stale before fixing',
          ],
          pitfalls: [
            'Answering with Next 13/14 defaults (fetch cached by default) without noting the change',
            'Fixing with export const dynamic = "force-dynamic" everywhere and losing all caching',
          ],
          followUps: ['How does caching behave when self-hosting on multiple instances?', 'What is the difference between revalidateTag and updateTag?'],
          references: [{ label: 'Next.js docs: Caching and Revalidating', url: 'https://nextjs.org/docs/app/getting-started/caching-and-revalidating' }],
        },
        {
          id: 'next-streaming-suspense',
          title: 'Streaming with Suspense',
          type: 'concept',
          difficulty: 'core',
          priority: 'should',
          tags: ['streaming', 'suspense', 'performance', 'ttfb'],
          estMinutes: 5,
          roles: ['frontend', 'full-stack'],
          prompt: `A dashboard page awaits three API calls; the slowest takes 3 seconds and the page is blank until then. **How does streaming in the App Router help, and how would you restructure the page?**`,
          hints: [
            'Sequential awaits in one component block everything below.',
            'Suspense boundaries let the server flush HTML in chunks.',
            'Start independent requests in parallel.',
          ],
          answer: `**Streaming** lets the server send HTML in **chunks**. The shell and fast parts arrive first, and each slow part is flushed when its data resolves. It is built on React Suspense: anything inside a \`<Suspense>\` boundary that suspends is replaced by its fallback in the first chunk. Later the server streams the real HTML plus a small inline script that swaps it in. TTFB and FCP improve, and the browser can start loading CSS and JS earlier.

**Restructure:**
1. Move each slow data dependency into **its own async Server Component**.
2. Wrap each one in \`<Suspense>\` with a skeleton. \`loading.tsx\` wraps the whole page, which is coarser.
3. Don't create waterfalls: start independent requests together.

\`\`\`tsx
export default function Dashboard() {
  return (
    <>
      <Header />                                  {/* instant */}
      <Suspense fallback={<StatsSkeleton />}><Stats /></Suspense>
      <Suspense fallback={<ChartSkeleton />}><RevenueChart /></Suspense>  {/* the 3s one */}
    </>
  )
}

async function Stats() {
  const [a, b] = await Promise.all([getUsers(), getOrders()]) // parallel, not sequential
  return <StatCards users={a} orders={b} />
}
\`\`\`

Selective hydration also lets React hydrate the parts that have arrived and prioritise whatever the user interacts with.

**Caveats:** once streaming starts, the status code and headers are already sent. So call \`notFound()\` or \`redirect()\` before the first await that suspends, or accept a 200 with an error UI. Search crawlers do receive the full streamed HTML.`,
          keyPoints: [
            'HTML is flushed in chunks per Suspense boundary',
            'Isolate slow data in its own async component',
            'Avoid sequential await waterfalls (Promise.all)',
            'loading.tsx = page-level boundary; Suspense = granular',
            'Headers/status are committed once streaming starts',
          ],
          pitfalls: ['Wrapping everything in one Suspense boundary', 'Thinking streaming hurts SEO'],
          followUps: ['How do you set the right HTTP status for a not-found item in a streamed page?'],
          references: [{ label: 'Next.js docs: Loading UI and Streaming', url: 'https://nextjs.org/docs/app/api-reference/file-conventions/loading' }],
        },
        {
          id: 'next-dynamic-route-mcq',
          title: 'What makes a route dynamic?',
          type: 'multiple-choice',
          difficulty: 'core',
          priority: 'should',
          tags: ['rendering', 'dynamic-apis', 'static'],
          estMinutes: 3,
          roles: ['frontend', 'full-stack'],
          prompt: `In the App Router (Next.js 15+), **which of these cause a route to be rendered dynamically at request time?** Select all that apply.`,
          choices: [
            { id: 'a', text: 'Calling `cookies()` in a Server Component', correct: true, explanation: 'Cookies are request-specific, so the route cannot be prerendered.' },
            { id: 'b', text: 'Reading `searchParams` in a page', correct: true, explanation: 'Query strings are only known at request time.' },
            { id: 'c', text: "Adding `'use client'` to a component on the page", correct: false, explanation: 'Client Components are still prerendered to HTML; the directive does not make the route dynamic.' },
            { id: 'd', text: 'Using `generateStaticParams` for a `[slug]` route', correct: false, explanation: 'This prerenders the listed paths at build time.' },
            { id: 'e', text: 'Calling `headers()` in a layout', correct: true, explanation: 'Request headers are dynamic; using them in a layout affects every route below it.' },
          ],
          hints: ['Which values are only known when a real request arrives?'],
          answer: `**a, b and e.** \`cookies()\`, \`headers()\`, \`searchParams\` (and \`connection()\` and uncached data access) are **request-time data**, so the route can't be prerendered. In older versions this is called **dynamic rendering**. With Partial Prerendering or Cache Components, only the Suspense subtree that reads them becomes dynamic.

\`'use client'\` doesn't make a route dynamic. Client Components are still rendered to HTML at build time and hydrated later. \`generateStaticParams\` does the opposite: it lists the dynamic segments to prerender at build.

**A subtle trap:** calling \`headers()\` or \`cookies()\` in the **root layout**, for example to read a locale or theme, silently makes **every page dynamic**. Check the build output (the static/dynamic markers per route) after adding them, and prefer reading such values in the leaf that needs them, inside a Suspense boundary.`,
          keyPoints: [
            'Request-time APIs opt into dynamic rendering',
            "'use client' does not affect static vs dynamic",
            'Dynamic APIs in a layout affect all child routes',
            'Check the build output route table',
          ],
          pitfalls: ['Believing client components disable prerendering'],
          references: [{ label: 'Next.js docs: Dynamic APIs', url: 'https://nextjs.org/docs/app/api-reference/functions/cookies' }],
        },
      ],
    },
    {
      id: 'next-server-features',
      title: 'Server features: actions, route handlers, middleware',
      summary: 'Mutations, HTTP endpoints, and request interception at the edge.',
      questions: [
        {
          id: 'next-server-actions',
          title: 'Server Actions: how they work and how to secure them',
          type: 'concept',
          difficulty: 'core',
          priority: 'must',
          tags: ['server-actions', 'mutations', 'forms', 'security'],
          estMinutes: 6,
          roles: ['full-stack'],
          prompt: `What is a **Server Action**? How does a form submit reach your server code, and what security mistakes do people make with them?`,
          hints: [
            'The function stays on the server; the client gets a reference.',
            'It is still a public POST endpoint.',
            'Validate input and check authorization inside every action.',
          ],
          answer: `A **Server Action** is an async function marked \`'use server'\` that runs on the server but can be called from the client: passed to \`<form action>\`, called from an event handler, or used with \`useActionState\`. At build time Next.js replaces the client-side reference with an **ID**. Calling it sends a **POST request** to the current route with the serialized arguments. The response can include the re-rendered RSC payload, so one round trip covers both the mutation and the UI update.

\`\`\`ts
'use server'
import { z } from 'zod'

const Schema = z.object({ title: z.string().min(1).max(200) })

export async function createPost(_prev: unknown, formData: FormData) {
  const session = await auth()                      // 1. authenticate
  if (!session) return { error: 'Unauthorized' }
  const parsed = Schema.safeParse({ title: formData.get('title') }) // 2. validate
  if (!parsed.success) return { error: 'Invalid title' }
  await db.post.create({ data: { ...parsed.data, authorId: session.userId } }) // 3. authorize by scoping
  revalidatePath('/posts')                           // 4. refresh caches
  return { ok: true }
}
\`\`\`

Forms with actions work **before JavaScript loads** (progressive enhancement). \`useFormStatus\` and \`useOptimistic\` provide pending and optimistic UI.

**Security mistakes:**
- **Treating actions as private.** Anyone can POST to them with any arguments. Authenticate and authorize *inside* the action. Middleware alone isn't enough.
- **Trusting arguments.** Hidden inputs or bound IDs can be tampered with. Validate them, and scope queries to the current user.
- **Leaking data in return values.** Whatever you return is sent to the client.

Next.js adds some protection: Origin/Host checks against CSRF, encrypted closed-over variables, and unused actions removed from the build. These complement your checks; they don't replace them.`,
          keyPoints: [
            "'use server' function invoked via POST with an action ID",
            'Progressive enhancement with forms',
            'Always authenticate, authorize and validate inside the action',
            'revalidatePath/Tag to update UI after mutation',
            'Return values are sent to the client',
          ],
          pitfalls: [
            'Assuming actions are unreachable unless rendered',
            'Relying on middleware for authorization',
          ],
          followUps: ['When would you use a route handler instead of a Server Action?'],
          references: [{ label: 'Next.js docs: Updating Data', url: 'https://nextjs.org/docs/app/getting-started/updating-data' }],
        },
        {
          id: 'next-route-handlers-vs-actions',
          title: 'Route handlers vs Server Actions',
          type: 'tradeoff',
          difficulty: 'core',
          priority: 'should',
          tags: ['route-handlers', 'server-actions', 'api'],
          estMinutes: 4,
          roles: ['full-stack', 'backend'],
          prompt: `You need (1) a form to update a user's profile, (2) a webhook endpoint for Stripe, and (3) a JSON API consumed by a mobile app. **Route handler or Server Action for each, and why?**`,
          hints: [
            'Who is the caller: your own React UI or an external client?',
            'Webhooks need raw body access and a stable URL.',
          ],
          answer: `**Server Actions** are best for **mutations triggered by your own UI**. **Route handlers** (\`app/api/.../route.ts\`) are best for **HTTP endpoints with a stable contract** that something else calls.

1. **Profile form → Server Action.** It is invoked from your own component, gets progressive enhancement and typed arguments, and can \`revalidatePath\` and return re-rendered UI in the same round trip.
2. **Stripe webhook → route handler.** You need a stable public URL, the **raw request body** to verify the signature, and control over the status code (Stripe retries on non-2xx).
3. **Mobile JSON API → route handler**, or a separate backend. Action IDs are internal and change between builds, so they aren't a public API. You also want versioning, CORS, and standard REST semantics.

\`\`\`ts
// app/api/webhooks/stripe/route.ts
export async function POST(req: Request) {
  const body = await req.text()             // raw body for signature check
  const sig = req.headers.get('stripe-signature')
  const event = stripe.webhooks.constructEvent(body, sig!, process.env.STRIPE_WEBHOOK_SECRET!)
  await handle(event)
  return new Response(null, { status: 200 })
}
\`\`\`

Route handlers use the standard Web \`Request\`/\`Response\` APIs. Since Next.js 15, GET handlers aren't cached by default. Also, a Server Component should **call your data layer directly** instead of fetching your own route handler, which adds an unnecessary HTTP hop.`,
          keyPoints: [
            'Actions for own-UI mutations; handlers for external callers',
            'Webhooks need raw body + stable URL + status control',
            'Action IDs are not a public API contract',
            'Server Components should not fetch their own API routes',
          ],
          pitfalls: ['Calling your own /api route from a Server Component'],
          personalAngle:
            'If your accessibility platform exposed APIs to customer sites, explain why that contract belongs in route handlers or a separate NestJS service rather than in Server Actions.',
          references: [{ label: 'Next.js docs: Route Handlers', url: 'https://nextjs.org/docs/app/getting-started/route-handlers-and-middleware' }],
        },
        {
          id: 'next-middleware-proxy',
          title: 'Middleware (Proxy): what belongs there',
          type: 'concept',
          difficulty: 'core',
          priority: 'should',
          tags: ['middleware', 'proxy', 'auth', 'edge'],
          estMinutes: 5,
          roles: ['full-stack'],
          prompt: `What is Next.js **middleware** used for? A teammate wants to do all authorization and database lookups in it. What do you say?`,
          hints: [
            'It runs before routing for matched paths, on every request.',
            'Think about latency and what runtime it executes in.',
            'It is a first gate, not the only one.',
          ],
          answer: `Middleware runs **before a request is routed** for paths that match its \`matcher\`. It can **rewrite, redirect, set headers or cookies, or return a response early**. In **Next.js 16 the file is renamed from \`middleware.ts\` to \`proxy.ts\`** (the exported function is \`proxy\`), to make clear that it is a network-boundary proxy. The concept is the same.

**Good uses:** locale or A/B rewrites, redirecting unauthenticated users to \`/login\` based on the **presence or validity of a session cookie**, setting security headers, bot filtering, geolocation routing.

\`\`\`ts
export function proxy(req: NextRequest) {
  if (!req.cookies.get('session')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
}
export const config = { matcher: ['/dashboard/:path*'] }
\`\`\`

**Pushback on doing everything in it:**
- It runs on **every matched request**, including prefetches and RSC requests. A database lookup there adds latency to every navigation.
- It is a **coarse, optimistic check**. Real authorization must also happen **where the data is accessed**: in Server Components, Server Actions and route handlers, ideally in one data-access layer. Relying on middleware alone has caused real auth-bypass vulnerabilities (CVE-2025-29927 allowed skipping middleware with a crafted internal header).
- It historically ran in the Edge runtime with a limited API. Node.js runtime is now supported, but it is still the wrong place for heavy logic.

**Summary:** middleware handles routing decisions and cheap session checks. Authorization lives next to the data.`,
          keyPoints: [
            'Runs before routing for matched paths',
            'Rewrite/redirect/headers/early response',
            'Renamed to proxy.ts in Next.js 16',
            'Cheap optimistic checks only; authorize at data access',
            'Runs on every matched request, so keep it fast',
          ],
          pitfalls: [
            'Middleware as the only security layer',
            'Database queries per request in middleware',
          ],
          followUps: ['How would you structure a data access layer that enforces authorization?'],
          references: [{ label: 'Next.js docs: Route Handlers and Middleware', url: 'https://nextjs.org/docs/app/getting-started/route-handlers-and-middleware' }],
        },
      ],
    },
    {
      id: 'next-production',
      title: 'SEO, performance & deployment',
      summary: 'Metadata, Core Web Vitals and running Next.js in production.',
      questions: [
        {
          id: 'next-metadata-seo',
          title: 'SEO and metadata in the App Router',
          type: 'concept',
          difficulty: 'foundation',
          priority: 'should',
          tags: ['seo', 'metadata', 'open-graph'],
          estMinutes: 4,
          roles: ['frontend', 'full-stack'],
          prompt: `How do you handle **SEO** in a Next.js App Router app: titles, descriptions, Open Graph images, sitemaps, and canonical URLs for dynamic pages?`,
          hints: ['There is a static object form and a function form.', 'Some files in app/ are special for SEO.'],
          answer: `Use the **Metadata API** in layouts and pages. It renders into \`<head>\` on the server, so crawlers get it without running JavaScript.

\`\`\`ts
// static
export const metadata: Metadata = {
  title: { default: 'Acme', template: '%s | Acme' },
  description: 'Example store',
  metadataBase: new URL('https://acme.example'),
}

// dynamic
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)          // memoized: the page's call reuses it
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: '/blog/' + slug },
    openGraph: { images: [post.cover] },
  }
}
\`\`\`

Metadata **merges from the root layout down**, and child segments override parents. The title \`template\` gives consistent suffixes.

**File conventions:** \`app/sitemap.ts\`, \`app/robots.ts\`, \`opengraph-image.tsx\` (generated OG images with \`ImageResponse\`), \`icon\` and \`manifest\`.

**Beyond tags:** what matters most for SEO is **server-rendered content** (static or ISR), semantic HTML, correct status codes (\`notFound()\` returns 404), canonical URLs to avoid duplicates from query strings, \`hreflang\` alternates for i18n, structured data (JSON-LD in a script tag), and good Core Web Vitals.`,
          keyPoints: [
            'metadata object vs generateMetadata',
            'Merges down the segment tree; title templates',
            'sitemap.ts / robots.ts / opengraph-image conventions',
            'Canonical + hreflang + correct status codes',
            'Server-rendered content matters more than tags',
          ],
          pitfalls: ['Setting document.title in a useEffect'],
          personalAngle:
            'You ran SEO for a 2M-visitor content site. Mention concrete wins like canonical URLs and structured data, which shows you understand SEO beyond the framework API.',
          references: [{ label: 'Next.js docs: Metadata and OG images', url: 'https://nextjs.org/docs/app/getting-started/metadata-and-og-images' }],
        },
        {
          id: 'next-performance-deploy',
          title: 'Performance and self-hosting in production',
          type: 'system-design',
          difficulty: 'advanced',
          priority: 'nice',
          tags: ['performance', 'deployment', 'docker', 'core-web-vitals', 'self-hosting'],
          estMinutes: 10,
          roles: ['full-stack'],
          prompt: `Your Next.js app has a poor LCP on mobile, and the company wants to move it **from Vercel to self-hosted Docker containers** behind a load balancer. What do you check for performance, and what changes when self-hosting?`,
          hints: [
            'LCP is usually an image, font or slow server response.',
            'Self-hosting: think about the build output mode, image optimization, and caches shared across instances.',
          ],
          answer: `**Performance (LCP first):**
- **Find the LCP element** with Lighthouse or field data (CrUX, \`useReportWebVitals\`). If it's an image, use \`next/image\` with \`priority\` (preloads it), correct \`sizes\`, and modern formats. Never lazy-load the hero image.
- Use **\`next/font\`** to self-host fonts with \`size-adjust\` fallbacks, which avoids layout shift and extra round trips.
- **Reduce client JS:** keep pages as Server Components, push \`'use client'\` to the leaves, lazy-load heavy widgets with \`next/dynamic\`, and analyse the bundle.
- **Server response:** make routes static or ISR where possible, stream slow parts with Suspense, and avoid fetch waterfalls.
- Use \`next/script\` with \`lazyOnload\` for third-party tags.

**Self-hosting changes:**
- Set \`output: 'standalone'\` in \`next.config\`. It produces a minimal \`server.js\` plus only the needed \`node_modules\`, which suits a small multi-stage Docker image. Copy \`.next/static\` and \`public\` in, or serve them from a CDN.
- With **multiple instances**, the ISR and data cache is **per instance and on local disk** by default. Configure a shared **cache handler** (for example Redis), or instances will serve different versions and \`revalidateTag\` only affects one of them.
- Set a stable **build ID** and deployment ID across instances, and keep the same \`NEXT_SERVER_ACTIONS_ENCRYPTION_KEY\` so Server Actions work behind a load balancer.
- **Image optimization** runs on your server (it uses \`sharp\`) and costs CPU. Cache it at a CDN or use a loader.
- Put a **CDN** in front for \`/_next/static\` (immutable hashed assets). Handle graceful shutdown, health checks, and \`NEXT_PUBLIC_*\` values, which are inlined at **build time**, not runtime.`,
          keyPoints: [
            'Identify LCP element; next/image priority, next/font',
            'Reduce client JS via server components and dynamic imports',
            "output: 'standalone' for Docker",
            'Shared cache handler across instances for ISR/revalidation',
            'Consistent build ID / action encryption key behind LB',
            'NEXT_PUBLIC_ vars are build-time',
          ],
          pitfalls: [
            'Assuming revalidation works across replicas without a shared cache',
            'Expecting NEXT_PUBLIC_ env vars to change at container start',
          ],
          followUps: ['How would you do zero-downtime deploys for this app?'],
          personalAngle:
            'You have deployed with Docker and CI/CD over SSH. Walk through the multi-stage Dockerfile and how your pipeline would roll out new containers.',
          references: [{ label: 'Next.js docs: Self-Hosting', url: 'https://nextjs.org/docs/app/guides/self-hosting' }],
        },
      ],
    },
  ],
}

export default track
