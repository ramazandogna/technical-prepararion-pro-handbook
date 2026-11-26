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
          intent:
            'Tests whether you know the App Router conventions and the React mechanisms behind them (layouts persist, loading = Suspense, error = error boundary). A strong answer covers each special file, dynamic segments with async params, and route groups.',
          hints: [
            'What turns a folder under `app/` into a URL segment, and what makes that segment actually routable?',
            'Navigate from `/dashboard/a` to `/dashboard/b`: which file\'s component stays mounted with its state, and which file is re-mounted on every navigation?',
            '`loading.tsx` and `error.tsx` are not Next.js inventions. Which two React features do they wrap the page in? Which one must be a Client Component?',
            'Shape: folders = segments; page = routable UI; layout = persistent wrapper; loading = Suspense fallback; error = client error boundary with `reset`; `[slug]`/`[...slug]`/`[[...slug]]` with `const { slug } = await params`; `(group)` and `_private` folders.',
          ],
          walkthrough: [
            {
              title: 'Folders and special files',
              body: `Folders under \`app/\` map to URL segments. A segment becomes routable only when it has a \`page.tsx\` (or \`route.ts\` for an HTTP handler). Other files in the folder add UI around that page.`,
            },
            {
              title: 'What each file maps to',
              body: `- \`layout.tsx\`: wraps the segment and children; **persists** across sibling navigation (state survives). The root layout renders \`<html>\`/\`<body>\`.
- \`template.tsx\`: like a layout but **re-mounts** on each navigation.
- \`loading.tsx\`: a **Suspense** fallback around the page (instant loading state, streaming).
- \`error.tsx\`: an **error boundary**; must be \`'use client'\`; receives \`error\` and \`reset\`.
- \`not-found.tsx\`: rendered by \`notFound()\`.`,
            },
            {
              title: 'Dynamic segments',
              body: `\`\`\`tsx
// app/blog/[slug]/page.tsx
export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params // a Promise since Next.js 15
  return <article>{(await getPost(slug)).title}</article>
}
export async function generateStaticParams() {
  return (await getSlugs()).map((slug) => ({ slug }))
}
\`\`\`
Also \`[...slug]\` (catch-all) and \`[[...slug]]\` (optional catch-all).`,
            },
            {
              title: 'Organisation helpers',
              body: `- \`(marketing)\` route groups share a layout without adding a URL segment.
- \`_components\` private folders never become routes.
- Parallel routes (\`@slot\`) and intercepting routes (\`(.)photo\`) for modals and split views.`,
            },
            {
              title: 'Say it in 30 seconds',
              body: `"Folders are URL segments and page.tsx makes one routable. Layouts wrap children and persist across navigation; templates re-mount. loading.tsx is a Suspense fallback and error.tsx is a client error boundary with reset. Dynamic segments use brackets, and since Next 15 params is a promise I await. Route groups in parentheses organise code without changing the URL."`,
            },
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
          intent:
            'Tests whether you can place the server/client boundary deliberately for bundle size, data access and interactivity. A strong answer states the default, what each type can do, what `use client` really marks, the composition rules (children pattern), and how to protect server-only code.',
          hints: [
            'Which of the two ships its component JavaScript to the browser, and which is the default in the App Router?',
            'List what forces a Client Component: state, effects, event handlers, browser APIs, context providers. What does a Server Component get in exchange (async, DB access, secrets)?',
            '`\'use client\'` applies to a module. What happens to the modules it imports? Can a Client Component import a Server Component?',
            'Shape: "Server by default, zero JS; client for interactivity; use client = module-graph boundary, push it to the leaves; serialisable props; pass server content as children into client providers; `import \'server-only\'` to guard secrets."',
          ],
          walkthrough: [
            {
              title: 'Define both types',
              body: `**Server Components** (default) render on the server, can be \`async\`, read DBs and secrets, and **ship no component JS**; only the RSC payload is sent. **Client Components** are also SSR'd to HTML, then **hydrated** so state, effects, handlers and browser APIs work.`,
            },
            {
              title: "What 'use client' marks",
              body: `It is a **module-graph boundary**: the file and everything it imports join the client bundle. You put it on the entry file of an interactive subtree, not on every interactive file. Props crossing it must be **serialisable** (no functions except Server Actions, no class instances).`,
            },
            {
              title: 'Composition patterns',
              body: `A Client Component cannot import a Server Component, but it can **receive** one as \`children\`:
\`\`\`tsx
// layout.tsx (server)
<ThemeProvider>{children}</ThemeProvider> // ThemeProvider is 'use client'; children stay server
\`\`\`
Keep pages server-side and make only \`<LikeButton>\` client-side. Use \`import 'server-only'\` in modules holding secrets or DB access.`,
            },
            {
              title: 'Decision rule and trade-offs',
              body: `Server for data fetching, heavy deps (markdown, highlighting), secrets, SEO content. Client for interactivity and browser APIs. Trade-off: every client boundary adds JS and hydration cost; every server component adds a server round trip on navigation and serialisation limits.`,
            },
            {
              title: 'Say it in 30 seconds',
              body: `"Server Components are the default: they run only on the server, can await data directly, and ship no JS. Client Components are SSR'd and hydrated for interactivity. 'use client' marks a module boundary, so I push it down to leaves like a like button. Props across it must be serialisable, and I pass server content into client providers as children. server-only guards secret modules."`,
            },
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
          intent:
            'Tests whether you know that `use client` components still render on the server and that the first client render must match that HTML. A strong answer finds all three causes, fixes them deterministically (effect, cookie, useId), and explains why `typeof window` branching is itself the bug.',
          hints: [
            'Does `\'use client\'` mean "only renders in the browser"? Where else does this component run?',
            'Compare each value on the server (a container, likely UTC, no `localStorage`) and in the user\'s browser a moment later. Which three differ?',
            'The `typeof window` check does not avoid the problem; it creates it, because the two renders take different branches.',
            'Fix shape: render deterministic defaults first (`"Hello"`, `"light"`), then `useEffect(() => setClient({ greeting, theme: localStorage.getItem("theme") ?? "light" }), [])`; drop `Math.random()` or use `useId`; better, read the theme from a cookie on the server.',
          ],
          walkthrough: [
            {
              title: 'Correct the assumption',
              body: `\`'use client'\` components are **still rendered to HTML on the server**, then hydrated. Hydration requires the first client render to produce the same markup.`,
            },
            {
              title: 'Find the three causes',
              body: `1. \`new Date().getHours()\`: server time zone (often UTC) vs the user's.
2. \`typeof window\` branch: server returns \`'light'\`, client reads \`localStorage\`.
3. \`Math.random()\`: different every render.`,
            },
            {
              title: 'Make the first render deterministic',
              body: `\`\`\`tsx
const [client, setClient] = useState<{ greeting: string; theme: string } | null>(null)
useEffect(() => {
  const h = new Date().getHours()
  setClient({ greeting: h < 12 ? 'Good morning' : 'Good afternoon', theme: localStorage.getItem('theme') ?? 'light' })
}, [])
return <p className={client?.theme ?? 'light'}>{client?.greeting ?? 'Hello'}</p>
\`\`\``,
            },
            {
              title: 'Better options and trade-offs',
              body: `- **Theme in a cookie**, read with \`cookies()\` on the server: no mismatch and no flash (but the route becomes dynamic).
- Browser-only widgets: \`dynamic(() => import('./Widget'), { ssr: false })\` from a Client Component.
- \`suppressHydrationWarning\` only for a single unavoidable text node (timestamp).
- Also check invalid nesting and DOM-mutating extensions/scripts.`,
            },
            {
              title: 'Say it in 30 seconds',
              body: `"Client Components still render on the server, so the first browser render must match. Here time zone, localStorage behind a window check, and Math.random all differ. I'd render a deterministic default and fill client values in an effect, or better, store the theme in a cookie so the server renders it correctly with no flash."`,
            },
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
          intent:
            'Tests whether you can pick a rendering strategy from content freshness and personalisation, and know how the App Router chooses it implicitly. A strong answer gives a table with real example pages, explains ISR and on-demand revalidation, and mentions Partial Prerendering.',
          hints: [
            'One axis separates all four: when is the HTML produced? Build time, request time, or in the browser?',
            'ISR is not a fifth rendering engine. It is static output plus a rule for when to regenerate. What are the two triggers?',
            'In the App Router there is no `getServerSideProps`. What makes a route switch from static to dynamic on its own?',
            'Shape: table (SSG docs / ISR catalogue / SSR dashboard / CSR app shell) → static by default, dynamic when using `cookies()`, `headers()`, `searchParams`, `connection()` → `export const revalidate = 3600` or `revalidateTag` → PPR mixes both.',
          ],
          walkthrough: [
            {
              title: 'One axis: when HTML is produced',
              body: `- **SSG:** at build. **ISR:** at build, then regenerated after \`revalidate\` seconds or on demand. **SSR:** per request. **CSR:** in the browser after JS loads.`,
            },
            {
              title: 'Give a page for each',
              body: `| Strategy | Example | Cost |
| --- | --- | --- |
| SSG | docs, landing page | stale until rebuild |
| ISR | product catalogue, articles | brief staleness |
| SSR | personalised dashboard | server work, TTFB |
| CSR | editor behind login | SEO, first paint |`,
            },
            {
              title: 'How the App Router decides',
              body: `Routes are **static by default** and become **dynamic** when they read request-time data (\`cookies()\`, \`headers()\`, \`searchParams\`, \`connection()\`) or uncached data.
\`\`\`ts
export const revalidate = 3600            // time-based ISR
revalidateTag('posts', 'max')             // on-demand after a CMS webhook (Next 16 signature)
\`\`\``,
            },
            {
              title: 'Mixing them: PPR',
              body: `With **Cache Components** (Next.js 16, \`cacheComponents: true\`), a page is a static shell plus dynamic holes in \`<Suspense>\` streamed per request. The choice moves from "per page" to "per component".`,
            },
            {
              title: 'Say it in 30 seconds',
              body: `"They differ by when HTML is generated: build, build plus regeneration, request, or browser. In the App Router a route is static by default and becomes dynamic when it reads cookies, headers or search params. I default to static, add ISR or tag revalidation for shared content that changes, make only per-user parts dynamic, and keep CSR for interactive islands. With Cache Components one page can mix both."`,
            },
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
          intent:
            'Tests whether you can debug staleness by layer rather than by guessing, and whether your knowledge reflects Next.js 15/16 defaults. A strong answer names the layers, explains why a static route can still be stale with no-store defaults, and fixes it with tags plus invalidation from the mutation.',
          hints: [
            'Where can an old price live? Think of caches on the server (data and rendered output) and one in the browser.',
            'Next.js 15 stopped caching `fetch` by default. So why can the page still be stale? What happens to a route that uses no dynamic API?',
            'Instead of disabling caching, can you label the cached data and invalidate exactly that label when the admin saves?',
            'Fix shape: read with `fetch(url, { next: { tags: ["product-" + id] } })` (or `"use cache"` + `cacheTag()` in Next 16); in the Server Action after the DB write call `revalidateTag("product-" + id, "max")` or `updateTag()` for read-your-own-writes.',
          ],
          walkthrough: [
            {
              title: 'Ask which layer is stale',
              body: `1. **Request memoization** (one render).
2. **Data cache** (opt-in \`fetch\` caching across requests).
3. **Full route cache** (HTML + RSC payload of static routes).
4. **Client router cache** (visited segments in the browser).
Staleness bugs are about identifying the layer before fixing.`,
            },
            {
              title: 'Know the current defaults',
              body: `Since Next.js 15, \`fetch\` and GET route handlers are **not** cached by default and the router cache does not reuse page segments. But a route with **no dynamic API is still prerendered at build**, so the price was baked into static HTML. "No-store by default" is not "dynamic by default".`,
            },
            {
              title: 'Tag and invalidate',
              body: `\`\`\`ts
const product = await fetch(\`\${api}/products/\${id}\`, { next: { tags: [\`product-\${id}\`] } }).then((r) => r.json())

'use server'
export async function updatePrice(id: string, price: number) {
  await db.product.update({ where: { id }, data: { price } })
  updateTag(\`product-\${id}\`) // Next 16, read-your-own-writes; or revalidateTag(tag, 'max')
}
\`\`\`
Invalidating inside a Server Action also refreshes the admin's router cache.`,
            },
            {
              title: 'Next 16 and production caveats',
              body: `- With **Cache Components**, caching is explicit: \`'use cache'\` + \`cacheLife()\` + \`cacheTag()\`.
- Self-hosted with several instances: use a shared cache handler, or invalidation only hits one instance.
- Avoid \`dynamic = 'force-dynamic'\` everywhere: it fixes staleness by removing all caching.`,
            },
            {
              title: 'Say it in 30 seconds',
              body: `"I'd first find which layer served the old price: data cache, full route cache or router cache. Even with Next 15's uncached fetch default, a route with no dynamic APIs is prerendered, so the price was in static HTML. I'd tag the product data and call updateTag or revalidateTag from the Server Action that saves it, which also refreshes the admin's client cache."`,
            },
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
  revalidateTag('product-' + id, 'max') // Next 16 signature; or updateTag() for read-your-own-writes
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
          intent:
            'Tests whether you can turn a blocking server render into a streamed one by restructuring components and data dependencies. A strong answer explains chunked HTML per Suspense boundary, isolates slow data, removes waterfalls, and knows the status-code caveat.',
          hints: [
            'Why is the page blank for 3 seconds? What is the page component waiting for before it can return anything?',
            'If each slow piece were its own async component, what React boundary would let the server send the rest first?',
            'Are the three requests dependent on each other? If not, why are they awaited one after another?',
            'Shape: `<Header />` + `<Suspense fallback={<Skeleton/>}><Stats/></Suspense>` + `<Suspense ...><RevenueChart/></Suspense>`; `Promise.all` for independent fetches; `notFound()`/`redirect()` before streaming starts.',
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
          intent:
            'Tests whether you know what actually opts a route into request-time rendering, and the common misconception about `use client`. A strong answer picks a, b and e, explains why, and flags the root-layout trap.',
          hints: [
            'Which of these values can only be known when a real HTTP request arrives?',
            'Are Client Components skipped at build time, or still rendered to HTML and hydrated later?',
            '`generateStaticParams` lists paths. Does that move rendering earlier or later?',
            'Answer: a, b, e. Cookies, search params and headers are per request; `use client` and `generateStaticParams` keep the route static. Beware `headers()` in the root layout making every page dynamic.',
          ],
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
        {
          id: 'next-cache-components-ppr',
          title: "Cache Components and Partial Prerendering with 'use cache'",
          type: 'coding',
          difficulty: 'advanced',
          priority: 'should',
          tags: ['cache-components', 'use-cache', 'ppr', 'cachelife', 'cachetag', 'nextjs-16', 'suspense'],
          estMinutes: 15,
          roles: ['frontend', 'full-stack'],
          prompt: `A product page shows **product details** (change a few times a day), **reviews** (change often, shared by all users) and a **"your cart" badge** (per user, from a cookie). Today the whole page is dynamic because it reads \`cookies()\`. Using **Next.js 16 Cache Components**, restructure it so most of the page is a static shell and only the right parts are dynamic. Show the code and explain how invalidation works.`,
          intent:
            'Tests whether you can design caching per component instead of per route using the Next.js 16 model: a static shell, cached data with explicit lifetimes and tags, and request-time holes inside Suspense. A strong answer writes the components, chooses cacheLife profiles deliberately, isolates cookie reads, and wires tag invalidation from mutations.',
          hints: [
            'Classify the three parts by two questions: is it the same for every user, and how stale may it be?',
            'With `cacheComponents: true`, data is uncached unless you mark it. Which directive caches a function or component, and which two helpers set its lifetime and tag?',
            'Anything that reads `cookies()` is request-time. Where must that component sit so the rest of the page can still be prerendered?',
            'Skeleton: `async function getProduct(id) { "use cache"; cacheLife("hours"); cacheTag(`product-${id}`); ... }`; reviews with `cacheLife("minutes")`; `<Suspense fallback={<CartSkeleton/>}><CartBadge/></Suspense>` where CartBadge awaits `cookies()`; admin action calls `updateTag(`product-${id}`)`.',
          ],
          answer: `**Make caching a per-component decision: cache shared data with \`'use cache'\` + \`cacheLife\` + \`cacheTag\`, and push per-request reads into a \`<Suspense>\` hole.** The prerendered result is a static shell (served from the edge instantly) with the dynamic part streamed per request; this is Partial Prerendering.

\`\`\`ts
// next.config.ts
export default { cacheComponents: true }
\`\`\`

\`\`\`tsx
// app/products/[id]/page.tsx
import { Suspense } from 'react'
import { cacheLife, cacheTag } from 'next/cache'
import { cookies } from 'next/headers'

async function getProduct(id: string) {
  'use cache'
  cacheLife('hours')              // stale/revalidate/expire profile
  cacheTag(\`product-\${id}\`)
  return db.product.findUnique({ where: { id } })
}

async function getReviews(id: string) {
  'use cache'
  cacheLife('minutes')
  cacheTag(\`reviews-\${id}\`)
  return db.review.findMany({ where: { productId: id }, take: 20 })
}

async function CartBadge() {
  const session = (await cookies()).get('session')?.value // request-time: must be inside Suspense
  const count = session ? await getCartCount(session) : 0
  return <span aria-label={\`\${count} items in cart\`}>{count}</span>
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [product, reviews] = await Promise.all([getProduct(id), getReviews(id)])
  return (
    <>
      <header><Suspense fallback={<span>…</span>}><CartBadge /></Suspense></header>
      <ProductDetails product={product} />
      <ReviewList reviews={reviews} />
    </>
  )
}
export async function generateStaticParams() {
  return (await getTopProductIds()).map((id) => ({ id }))
}
\`\`\`

**Invalidation:**
\`\`\`ts
'use server'
export async function updateProduct(id: string, data: ProductInput) {
  await requireAdmin()
  await db.product.update({ where: { id }, data })
  updateTag(\`product-\${id}\`) // expire now; the admin sees their own write
}
export async function addReview(id: string, input: ReviewInput) {
  /* auth + validate + insert */
  revalidateTag(\`reviews-\${id}\`, 'max') // stale-while-revalidate for everyone else
}
\`\`\`

**Rules and trade-offs:**
- In Cache Components mode, reading uncached data or request APIs **outside \`<Suspense>\`** is a build error, which forces you to decide.
- Arguments and closed-over values become part of the **cache key**; they must be serialisable. Do not read \`cookies()\` inside a \`'use cache'\` scope; pass the value in or use \`'use cache: private'\` for per-user caching.
- Pick \`cacheLife\` by business tolerance, not by habit; tags give precise invalidation.
- Self-hosting with several instances needs a shared cache handler (\`'use cache: remote'\` / a custom handler).`,
          keyPoints: [
            'cacheComponents: true makes caching explicit and per component',
            "'use cache' + cacheLife + cacheTag for shared data",
            'Request-time reads (cookies) inside Suspense → static shell + dynamic hole (PPR)',
            'updateTag for read-your-own-writes; revalidateTag(tag, profile) for SWR',
            'Cache keys include arguments; no request APIs inside cached scopes',
          ],
          pitfalls: [
            'Reading cookies() at the top of the page, making everything dynamic again',
            'Caching per-user data in a shared cache',
            'Using force-dynamic to silence the build error',
          ],
          followUps: [
            'How would you cache per-user data safely?',
            'What changes when this runs on three self-hosted instances?',
          ],
          walkthrough: [
            {
              title: 'Classify each part',
              body: `| Part | Shared? | Staleness | Strategy |
| --- | --- | --- | --- |
| Product details | yes | hours | \`'use cache'\`, \`cacheLife('hours')\`, tag |
| Reviews | yes | minutes | \`'use cache'\`, \`cacheLife('minutes')\`, tag |
| Cart badge | per user | none | request-time, inside \`<Suspense>\` |`,
            },
            {
              title: 'Cache the shared data',
              body: `\`\`\`ts
async function getProduct(id: string) {
  'use cache'
  cacheLife('hours')
  cacheTag(\`product-\${id}\`)
  return db.product.findUnique({ where: { id } })
}
\`\`\`
The function's arguments are part of the cache key.`,
            },
            {
              title: 'Isolate the dynamic hole',
              body: `\`\`\`tsx
<Suspense fallback={<span>…</span>}>
  <CartBadge /> {/* awaits cookies() */}
</Suspense>
\`\`\`
The shell (header, details, reviews) is prerendered; only \`CartBadge\` renders per request and streams in. That is Partial Prerendering.`,
            },
            {
              title: 'Invalidate and know the limits',
              body: `- Admin edit: \`updateTag('product-' + id)\` inside the Server Action (expires immediately, read-your-own-writes).
- New review: \`revalidateTag('reviews-' + id, 'max')\` (stale-while-revalidate).
- No \`cookies()\` inside \`'use cache'\`; use \`'use cache: private'\` for per-user caching.
- Multiple instances need a shared cache handler.`,
            },
            {
              title: 'Say it in 30 seconds',
              body: `"With Cache Components, caching is per component. Product and reviews are shared, so I cache their loaders with 'use cache', a cacheLife that matches how stale they may be, and a tag. The cart badge reads cookies, so it sits in a Suspense boundary and streams per request, while the rest is a prerendered shell. Mutations call updateTag or revalidateTag for exactly those tags."`,
            },
          ],
          references: [{ label: 'Next.js docs: Caching and Revalidating', url: 'https://nextjs.org/docs/app/getting-started/caching-and-revalidating' }],
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
          intent:
            'Tests whether you understand the transport behind Server Actions and therefore treat them as public endpoints. A strong answer explains the action ID and POST round trip, shows authenticate → validate → authorise → revalidate in code, and lists the classic security mistakes.',
          hints: [
            'The function body never reaches the browser. What does the client receive instead, and what happens over the network when you call it?',
            'If it is a POST to your server with serialised arguments, who else can send that request?',
            'What three checks belong at the top of every action, and what must you be careful about in its return value?',
            'Shape: `"use server"` → `const session = await auth()` → `Schema.safeParse(formData)` → scope the DB write to `session.userId` → `revalidatePath` → return a minimal result. Plus: works without JS, CSRF origin checks help but do not replace auth.',
          ],
          walkthrough: [
            {
              title: 'Explain the mechanism',
              body: `A \`'use server'\` function stays on the server. At build time the client gets an **action ID**. Calling it (form \`action\`, event handler, \`useActionState\`) sends a **POST** to the current route with serialised arguments; the response can include the updated RSC payload, so mutation and UI refresh happen in one round trip.`,
            },
            {
              title: 'Write a secure action',
              body: `\`\`\`ts
'use server'
export async function createPost(_prev: unknown, formData: FormData) {
  const session = await auth()
  if (!session) return { error: 'Unauthorized' }
  const parsed = Schema.safeParse({ title: formData.get('title') })
  if (!parsed.success) return { error: 'Invalid title' }
  await db.post.create({ data: { ...parsed.data, authorId: session.userId } })
  revalidatePath('/posts')
  return { ok: true }
}
\`\`\``,
            },
            {
              title: 'List the security mistakes',
              body: `- Treating actions as private: anyone can POST any arguments.
- Relying on middleware/proxy for authorisation (CVE-2025-29927 showed why).
- Trusting hidden inputs or bound ids: validate and scope to the user.
- Returning whole DB rows: return values go to the client.
Next.js adds origin checks and encrypts closed-over values; those complement, not replace, your checks.`,
            },
            {
              title: 'UX features and limits',
              body: `Forms with actions work before hydration (progressive enhancement). \`useActionState\`, \`useFormStatus\` and \`useOptimistic\` give result, pending and optimistic UI. Actions run sequentially per client and are not a public API for third parties; use route handlers for those.`,
            },
            {
              title: 'Say it in 30 seconds',
              body: `"A Server Action is a server function the client calls by ID through a POST, so it's effectively a public endpoint. Inside every action I authenticate, validate with a schema, scope the write to the current user, revalidate, and return only what the UI needs. Forms work without JS, and I'd never rely on middleware alone for authorisation."`,
            },
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
          intent:
            'Tests whether you choose the endpoint type by who the caller is and what contract it needs. A strong answer assigns each case with a reason (own UI vs external client, raw body, stable URL, versioning) and warns against Server Components fetching their own API routes.',
          hints: [
            'For each case, who calls the endpoint: your own React UI, or an external system you do not control?',
            'Stripe verifies webhooks with a signature over the exact bytes it sent, and retries on non-2xx. What does that require from the endpoint?',
            'Server Action IDs are generated per build. Could a mobile app depend on them?',
            'Answer: profile form → Server Action (progressive enhancement, revalidate in one round trip); Stripe → route handler with `await req.text()` + signature check + explicit status; mobile API → versioned route handler or separate backend.',
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
          intent:
            'Tests whether you know where middleware (proxy.ts in Next 16) sits in the request path and why it is the wrong place for real authorisation and heavy work. A strong answer lists good uses, pushes back with latency and security reasons (including a real CVE), and puts authorisation next to data access.',
          hints: [
            'When does middleware run relative to routing and rendering, and for which requests (think prefetches and RSC requests too)?',
            'What does a database query in middleware cost if it runs on every matched navigation?',
            'If middleware is skipped or misconfigured, what still protects the data? Remember CVE-2025-29927.',
            'Shape: "Middleware/proxy for rewrites, redirects, headers and cheap session-cookie checks; authorisation in a data-access layer used by Server Components, Actions and route handlers; Next 16 renames it to proxy.ts."',
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
        {
          id: 'next-auth-data-access-layer',
          title: 'Authorisation in the App Router: a data access layer',
          type: 'coding',
          difficulty: 'advanced',
          priority: 'must',
          tags: ['auth', 'authorization', 'data-access-layer', 'server-only', 'dto', 'security', 'server-actions'],
          estMinutes: 20,
          roles: ['full-stack'],
          prompt: `In a multi-tenant SaaS built on the App Router, pages, Server Actions and route handlers all read and write \`invoice\` data. Auth checks are currently scattered (some in middleware, some in pages, some missing). **Design and write a data access layer** that makes it hard to leak another tenant's data, and explain how it interacts with caching.`,
          intent:
            'Tests whether you can centralise authorisation in a server-only layer that every entry point (Server Components, Actions, route handlers) must go through, and avoid data leaks to the client. A strong answer writes a cached session check, tenant-scoped queries, DTOs, and explains why middleware and page-level checks are insufficient and how per-user data must not enter shared caches.',
          hints: [
            'List every entry point that touches invoices. Which of them does middleware or a layout check actually protect? (Hint: a Server Action can be POSTed directly.)',
            'If every read and write must check the session and tenant, where should that check live so nobody can forget it?',
            'What should a query return to a Server Component that passes data to a Client Component: the full DB row or a minimal object?',
            'Skeleton: `lib/dal.ts` with `import "server-only"`; `export const verifySession = cache(async () => { ... })`; `getInvoices()` → `const s = await verifySession(); return db.invoice.findMany({ where: { tenantId: s.tenantId } }).then(toInvoiceDTO)`; actions call DAL functions, never `db` directly.',
          ],
          answer: `**Put every data read and write behind a server-only module that verifies the session and scopes by tenant itself; pages, Server Actions and route handlers call the DAL, never the ORM directly.** Middleware stays an optimistic redirect, not the security boundary.

\`\`\`ts
// lib/dal.ts
import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export const verifySession = cache(async () => {
  const token = (await cookies()).get('session')?.value
  const session = token ? await decryptAndValidate(token) : null // signature + expiry
  if (!session) redirect('/login')
  return { userId: session.userId, tenantId: session.tenantId, role: session.role }
})

export type InvoiceDTO = { id: string; number: string; total: number; status: 'draft' | 'paid' }
const toDTO = (i: Invoice): InvoiceDTO => ({ id: i.id, number: i.number, total: i.total, status: i.status })

export async function listInvoices(): Promise<InvoiceDTO[]> {
  const s = await verifySession()
  const rows = await db.invoice.findMany({ where: { tenantId: s.tenantId }, take: 100 })
  return rows.map(toDTO)
}

export async function markPaid(invoiceId: string) {
  const s = await verifySession()
  if (s.role !== 'admin') throw new Forbidden()
  const res = await db.invoice.updateMany({ where: { id: invoiceId, tenantId: s.tenantId }, data: { status: 'paid' } })
  if (res.count === 0) throw new NotFound() // never reveal that it exists in another tenant
}
\`\`\`

\`\`\`ts
// app/invoices/actions.ts
'use server'
export async function markPaidAction(_: unknown, fd: FormData) {
  const id = z.string().uuid().parse(fd.get('id'))
  await markPaid(id) // auth happens inside the DAL
  revalidatePath('/invoices')
  return { ok: true }
}
\`\`\`

**Why this shape:**
- **One choke point:** the tenant filter is in the query (\`where: { tenantId }\`), not in an \`if\` someone can forget. \`updateMany\` with both id and tenant prevents IDOR.
- **\`server-only\`** makes the build fail if a client module imports the DAL.
- **\`React.cache\`** dedupes \`verifySession\` within one request, so many components can call it cheaply.
- **DTOs** return only fields the UI needs; whatever a Server Component passes to a Client Component, or an action returns, is serialised to the browser. React's experimental \`taintObjectReference\` can add a guard.
- **Middleware/proxy** can redirect anonymous users early, but Server Actions and route handlers are reachable directly, and middleware bypasses have happened (CVE-2025-29927).
- **Caching:** per-user or per-tenant data must not go into shared caches. Do not wrap DAL reads in \`'use cache'\` unless the tenant id is an explicit argument (part of the key), or use \`'use cache: private'\`. Session reads make the component dynamic, so place it inside \`<Suspense>\`.
- Add database-level defence where possible (PostgreSQL row-level security keyed on tenant).`,
          keyPoints: [
            'Single server-only DAL; entry points never call the ORM directly',
            'verifySession wrapped in React.cache; validates signature and expiry',
            'Tenant scoping inside the query; updateMany with id + tenant prevents IDOR',
            'DTOs: never pass full rows across the client boundary',
            'Middleware is an optimistic gate, not the security boundary',
            'Keep per-user data out of shared caches; consider RLS',
          ],
          pitfalls: [
            'Checking auth only in layout.tsx (layouts do not re-run on every navigation and do not protect actions)',
            'Returning 403 vs 404 differently and leaking existence across tenants',
            'Caching tenant data with a key that does not include the tenant',
          ],
          followUps: [
            'How would you test that tenant isolation holds?',
            'Where would row-level security in PostgreSQL fit?',
          ],
          walkthrough: [
            {
              title: 'Map the entry points',
              body: `Invoices are touched by **Server Components, Server Actions and route handlers**. Middleware and layouts do not protect actions or handlers, which are directly POST-able, and layouts don't re-run on every navigation. So authorisation must sit **where the data is accessed**.`,
            },
            {
              title: 'Build the session check',
              body: `\`\`\`ts
import 'server-only'
export const verifySession = cache(async () => {
  const token = (await cookies()).get('session')?.value
  const session = token ? await decryptAndValidate(token) : null
  if (!session) redirect('/login')
  return { userId: session.userId, tenantId: session.tenantId, role: session.role }
})
\`\`\`
\`cache\` dedupes it per request; \`server-only\` blocks client imports.`,
            },
            {
              title: 'Scope every query and return DTOs',
              body: `\`\`\`ts
export async function markPaid(id: string) {
  const s = await verifySession()
  if (s.role !== 'admin') throw new Forbidden()
  const r = await db.invoice.updateMany({ where: { id, tenantId: s.tenantId }, data: { status: 'paid' } })
  if (r.count === 0) throw new NotFound()
}
\`\`\`
Tenant filters live in the query, not in a separate \`if\`. Reads map rows to minimal DTOs before they reach a Client Component.`,
            },
            {
              title: 'Caching and defence in depth',
              body: `- Never put per-tenant data in a shared cache unless the tenant is part of the key (an argument), or use \`'use cache: private'\`.
- Session reads are request-time → put those components in \`<Suspense>\`.
- Add PostgreSQL row-level security as a second layer, and integration tests that try cross-tenant ids.`,
            },
            {
              title: 'Say it in 30 seconds',
              body: `"I'd centralise all invoice access in a server-only data access layer. A React.cache'd verifySession validates the cookie, and every query is scoped by tenant inside the where clause, so an id from another tenant simply returns nothing. Actions and route handlers call the DAL, never the ORM. It returns DTOs, not rows. Middleware only does optimistic redirects, and tenant data never goes into a shared cache."`,
            },
          ],
          personalAngle:
            'Your B2B accessibility platform served multiple customers. Use it as the example: how customer (tenant) isolation was enforced in the backend, and how you would enforce the same rule if that dashboard were rebuilt on the App Router.',
          references: [{ label: 'Next.js docs: Authentication', url: 'https://nextjs.org/docs/app/guides/authentication' }],
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
          intent:
            'Tests whether you can implement SEO correctly in the App Router and understand what actually drives rankings. A strong answer shows static and dynamic metadata, the SEO file conventions, canonical/hreflang/status codes, and stresses server-rendered content.',
          hints: [
            'Setting `document.title` in an effect happens after JS runs. What API puts metadata into the server-rendered `<head>`?',
            'There is a static form and a function form. When do you need the function form, and does it cause a second data fetch?',
            'Which files in `app/` generate a sitemap, robots rules and Open Graph images?',
            'Shape: `export const metadata` with `title.template` + `metadataBase`; `generateMetadata({ params })` with `alternates.canonical` and `openGraph`; `sitemap.ts`, `robots.ts`, `opengraph-image.tsx`; plus `notFound()` for 404s, hreflang, JSON-LD, Core Web Vitals.',
          ],
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
          intent:
            'Tests whether you can diagnose LCP systematically and know what Vercel was doing for you that you must now provide yourself. A strong answer finds the LCP element and its sub-parts, lists the Next.js levers, and covers standalone output, shared caches across replicas, consistent build and action keys, and build-time env vars.',
          hints: [
            'Before fixing LCP, identify the LCP element. Is it an image, a text block waiting for a font, or is the server response itself slow (TTFB)?',
            'Which Next.js components handle hero images, fonts and third-party scripts, and which option preloads the hero image?',
            'On Vercel, ISR cache, image optimisation and the CDN are managed. With three Docker replicas behind a load balancer, where does each replica store its ISR cache?',
            'Shape: LCP element + field data → `next/image priority` + `sizes`, `next/font`, less client JS, static/ISR + streaming → `output: "standalone"` multi-stage image, shared cache handler (Redis), same build ID and `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`, CDN for `/_next/static`, `NEXT_PUBLIC_*` baked at build.',
          ],
          walkthrough: [
            {
              title: 'Split the problem',
              body: `Two separate questions: **why is LCP slow on mobile**, and **what changes when leaving Vercel**. Answer them in that order, measuring first.`,
            },
            {
              title: 'Diagnose and fix LCP',
              body: `Find the LCP element (Lighthouse, CrUX, \`useReportWebVitals\`) and break it into TTFB, resource load delay, load time and render delay.
- Hero image: \`<Image priority sizes="100vw" />\`; never lazy-load it.
- Fonts: \`next/font\` (self-hosted, \`size-adjust\` fallback).
- TTFB: static/ISR where possible, stream slow parts with Suspense, remove waterfalls.
- Less JS: Server Components, \`'use client'\` at leaves, \`next/dynamic\`, \`next/script\` \`lazyOnload\`.`,
            },
            {
              title: 'Containerise correctly',
              body: `\`\`\`dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY . .
RUN npm ci && npm run build   # next.config: output: 'standalone'

FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
CMD ["node", "server.js"]
\`\`\``,
            },
            {
              title: 'Multi-instance pitfalls',
              body: `- ISR/data cache is **per instance on disk**: configure a shared **cache handler** (e.g. Redis) or replicas disagree and \`revalidateTag\` hits one.
- Same build ID, deployment ID and \`NEXT_SERVER_ACTIONS_ENCRYPTION_KEY\` on all replicas.
- Image optimisation uses CPU (\`sharp\`): cache at a CDN or use a loader.
- CDN for immutable \`/_next/static\`; health checks and graceful shutdown.
- \`NEXT_PUBLIC_*\` is inlined at build time, not container start.`,
            },
            {
              title: 'Say it in 30 seconds',
              body: `"First I'd identify the LCP element from field data: usually the hero image, a font or slow TTFB, fixed with next/image priority, next/font, static or ISR rendering and less client JS. For self-hosting: standalone output in a multi-stage Docker image, a shared Redis cache handler so revalidation works across replicas, the same build ID and action encryption key everywhere, a CDN for static assets, and remembering NEXT_PUBLIC vars are build-time."`,
            },
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
