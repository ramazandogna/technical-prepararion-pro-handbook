import type { Track } from '@/types/content'

const track: Track = {
  id: 'backend',
  code: 'I',
  title: 'Backend: Node.js, HTTP & NestJS',
  summary: 'Node runtime internals, API design, auth, real-time and NestJS architecture.',
  rationale:
    'You led backend and infrastructure for a B2B platform, so interviewers will push past "I built APIs" into event-loop internals, idempotency, auth and NestJS lifecycle details. This track turns that hands-on experience into precise, defensible answers.',
  icon: 'Server',
  phase: 2,
  modules: [
    {
      id: 'be-node-runtime',
      title: 'Node.js runtime internals',
      summary: 'Event loop phases, libuv, streams, and CPU- vs I/O-bound work.',
      questions: [
        {
          id: 'be-event-loop-phases',
          title: 'Event loop phases and execution order',
          type: 'output',
          difficulty: 'core',
          priority: 'must',
          tags: ['event-loop', 'libuv', 'microtasks', 'nexttick'],
          estMinutes: 6,
          roles: ['backend', 'full-stack'],
          prompt: `What does this Node.js script print, and **why**? Walk through the event loop phases involved.`,
          code: {
            language: 'javascript',
            source: `const fs = require('node:fs')

fs.readFile(__filename, () => {
  setTimeout(() => console.log('timeout'), 0)
  setImmediate(() => console.log('immediate'))
  process.nextTick(() => console.log('nextTick'))
  Promise.resolve().then(() => console.log('promise'))
})

console.log('sync')`,
          },
          hints: [
            'The callback runs in the poll phase. Which phase comes right after poll?',
            'process.nextTick and promise microtasks drain after each callback, before moving on.',
            'nextTick queue has priority over the promise microtask queue in CommonJS.',
          ],
          answer: `**Output:**

\`\`\`plaintext
sync
nextTick
promise
immediate
timeout
\`\`\`

**Why:**
1. \`sync\` runs during the initial synchronous execution of the script.
2. The \`readFile\` callback runs later, in the **poll phase** (I/O callbacks).
3. Inside it, \`setTimeout\` and \`setImmediate\` are scheduled. Then **after the callback finishes**, Node drains the **\`process.nextTick\` queue** first, then the **promise microtask queue**. So we get \`nextTick\` and then \`promise\`.
4. After poll, the loop goes to the **check phase**, where \`setImmediate\` callbacks run, so \`immediate\` comes next.
5. Only on the **next iteration** does the **timers phase** run the 0 ms timeout.

**Event loop phases** (libuv), in order: **timers** (\`setTimeout\`/\`setInterval\`) → **pending callbacks** (some deferred system errors) → **idle/prepare** (internal) → **poll** (retrieve new I/O events and run their callbacks, block here if nothing else is pending) → **check** (\`setImmediate\`) → **close callbacks** (\`'close'\` events).

**Ordering trap:** at the **top level of the main module**, the order of \`setTimeout(…, 0)\` versus \`setImmediate\` is **non-deterministic**, because it depends on whether 1 ms has elapsed when the loop starts. Inside an I/O callback, \`setImmediate\` always wins. In ES modules, top-level code itself runs as a microtask, so promise callbacks can run before nextTick callbacks there.`,
          keyPoints: [
            'Names the phases: timers, pending, poll, check, close',
            'nextTick then promise microtasks drain between callbacks',
            'setImmediate runs in check, right after poll',
            'Top-level timeout vs immediate order is non-deterministic',
          ],
          pitfalls: [
            'Saying setTimeout 0 always runs before setImmediate',
            'Treating nextTick as part of the event loop phases',
          ],
          followUps: ['How can recursive process.nextTick starve I/O?', 'How would you detect event-loop lag in production?'],
          references: [{ label: 'Node.js: The event loop', url: 'https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick' }],
        },
        {
          id: 'be-libuv-threadpool-cpu-bound',
          title: 'libuv thread pool, CPU-bound work and worker threads',
          type: 'tradeoff',
          difficulty: 'core',
          priority: 'must',
          tags: ['libuv', 'thread-pool', 'worker-threads', 'cpu-bound', 'io-bound'],
          estMinutes: 6,
          roles: ['backend', 'full-stack'],
          prompt: `Node is "single-threaded", yet \`fs.readFile\` and \`crypto.pbkdf2\` don't block. **How?** And an endpoint that resizes images makes the whole API slow. What is happening, and what are your options?`,
          hints: [
            'Network I/O and file I/O are handled differently by libuv.',
            'The thread pool defaults to 4 threads.',
            'CPU work on the main thread blocks every request.',
          ],
          answer: `**JavaScript runs on one main thread**, but **libuv** handles I/O off that thread:
- **Network I/O** (TCP, HTTP) uses the OS's non-blocking mechanisms (epoll, kqueue, IOCP). No extra threads are needed; the poll phase gets readiness events.
- **File system operations, DNS \`lookup\`, \`crypto.pbkdf2/scrypt\` and \`zlib\`** go to the **libuv thread pool** (default **4 threads**, \`UV_THREADPOOL_SIZE\` up to 1024). Callbacks return to the main loop when the work finishes.

**The image endpoint** does **CPU-bound work in JavaScript** (or a synchronous call) on the main thread. While it runs, the event loop can't process any other request, timer or I/O callback. Latency rises for *every* route, and health checks may time out.

**Options:**
1. **Worker threads** (\`node:worker_threads\`), ideally a pool such as Piscina. Each worker has its own V8 isolate and event loop. You communicate with \`postMessage\` and can transfer \`ArrayBuffer\`s with zero copy.
2. **Offload to a job queue** (BullMQ + Redis) with separate worker processes. This is better when the work can be async to the user, needs retries, or should scale independently.
3. Use **native libraries** that do the work off-thread (\`sharp\` uses libuv and its own threads).
4. **Scale processes**, either with \`node:cluster\` or multiple containers behind a load balancer. This adds throughput but doesn't stop one request from blocking its own process.

\`\`\`js
const { Worker } = require('node:worker_threads')
const run = (file, data) => new Promise((res, rej) => {
  const w = new Worker(file, { workerData: data })
  w.once('message', res); w.once('error', rej)
})
\`\`\`

**Rule of thumb:** Node excels at **I/O-bound** concurrency. Move **CPU-bound** work off the main thread.`,
          keyPoints: [
            'Network I/O uses OS async primitives; fs/crypto/zlib/dns.lookup use thread pool',
            'Default pool size 4 (UV_THREADPOOL_SIZE)',
            'CPU work on main thread blocks all requests',
            'Worker threads vs job queue vs native libs vs more processes',
          ],
          pitfalls: [
            'Saying all async I/O uses the thread pool',
            'Thinking async/await makes CPU work non-blocking',
          ],
          followUps: ['Why might raising UV_THREADPOOL_SIZE help a DNS-heavy service?'],
          personalAngle:
            'Your Puppeteer scraping and matching over thousands of records is a natural example: explain which parts were I/O-bound (browser, network) and which were CPU-bound (matching), and how you separated them with Redis-backed jobs.',
          references: [{ label: "Node.js: Don't block the event loop", url: 'https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop' }],
        },
        {
          id: 'be-streams-backpressure',
          title: 'Streams and backpressure',
          type: 'debugging',
          difficulty: 'advanced',
          priority: 'should',
          tags: ['streams', 'backpressure', 'buffer', 'memory'],
          estMinutes: 8,
          roles: ['backend'],
          prompt: `This export endpoint works in development but **runs out of memory** in production on large tables. Explain the problem and fix it.`,
          code: {
            language: 'javascript',
            source: `app.get('/export', async (req, res) => {
  const rows = await db.query('SELECT * FROM events') // millions of rows
  let csv = 'id,type,created_at\\n'
  for (const r of rows) csv += r.id + ',' + r.type + ',' + r.created_at + '\\n'
  res.send(csv)
})`,
          },
          hints: [
            'How much of the data is in memory at the peak?',
            'Stream rows from the database cursor into the response.',
            'What happens if the client downloads slower than you produce?',
          ],
          answer: `The handler **buffers everything**: all rows from the driver, then one giant string (strings are immutable, so repeated \`+=\` creates intermediate copies), then the response body. Peak memory grows with table size, and a few concurrent exports crash the process.

**Fix: stream end to end**, from a database cursor through a transform into the HTTP response, and let **backpressure** regulate the flow.

\`\`\`js
const { pipeline } = require('node:stream/promises')
const { Transform } = require('node:stream')
const QueryStream = require('pg-query-stream')

app.get('/export', async (req, res, next) => {
  const client = await pool.connect()
  try {
    const rows = client.query(new QueryStream('SELECT id, type, created_at FROM events'))
    const toCsv = new Transform({
      objectMode: true,
      transform(r, _enc, cb) { cb(null, r.id + ',' + r.type + ',' + r.created_at.toISOString() + '\\n') },
    })
    res.setHeader('Content-Type', 'text/csv')
    res.write('id,type,created_at\\n')
    await pipeline(rows, toCsv, res)
  } catch (err) { next(err) } finally { client.release() }
})
\`\`\`

**Backpressure:** a writable stream's \`write()\` returns \`false\` once its internal buffer passes \`highWaterMark\`. A well-behaved producer pauses until \`'drain'\`. \`pipeline()\` (or \`.pipe()\`) handles this automatically, so a slow client slows the database read instead of filling memory. \`pipeline\` also **destroys all streams and propagates errors** when any stage fails or the client disconnects. Plain \`.pipe()\` doesn't, which leaks file descriptors and connections.

**Buffer** note: binary chunks are \`Buffer\`s (a \`Uint8Array\` subclass, allocated outside the V8 heap). Object-mode streams carry JS objects, where \`highWaterMark\` counts objects rather than bytes.`,
          keyPoints: [
            'Identifies full buffering and string concatenation',
            'Streams from a DB cursor through Transform to response',
            'write() returns false → wait for drain = backpressure',
            'pipeline() handles errors/cleanup; .pipe() does not',
            'Releases DB client in finally',
          ],
          pitfalls: [
            'Only increasing --max-old-space-size',
            'Using .pipe() without error handling',
          ],
          followUps: ['How would you stream a large upload to S3 without buffering?'],
          references: [{ label: 'Node.js: Backpressuring in streams', url: 'https://nodejs.org/en/learn/modules/backpressuring-in-streams' }],
        },
        {
          id: 'be-async-error-handling',
          title: 'Async error handling and process crashes',
          type: 'multiple-choice',
          difficulty: 'foundation',
          priority: 'should',
          tags: ['error-handling', 'promises', 'process', 'unhandled-rejection'],
          estMinutes: 3,
          roles: ['backend', 'full-stack'],
          prompt: `In Node.js 22, a promise rejects and **nothing handles it**. What happens by default, and what is the right production stance? Select all that are correct.`,
          choices: [
            { id: 'a', text: 'The process emits `unhandledRejection` and, with no listener, exits with a non-zero code', correct: true, explanation: 'Since Node 15 the default `--unhandled-rejections=throw` mode turns it into an uncaught exception.' },
            { id: 'b', text: 'The rejection is silently ignored', correct: false, explanation: 'That was roughly the old behaviour (a warning); not since Node 15.' },
            { id: 'c', text: 'After `uncaughtException`, the safest action is to log and exit, letting a supervisor restart the process', correct: true, explanation: 'State may be corrupted; resuming is unsafe.' },
            { id: 'd', text: 'Wrapping `app.listen()` in try/catch catches errors thrown in later async callbacks', correct: false, explanation: 'try/catch only covers synchronous code and awaited promises in the same async function.' },
          ],
          hints: ['Node changed the default in version 15.'],
          answer: `**a and c.** Since Node.js 15 an unhandled rejection is **treated like an uncaught exception**: the process logs it and exits with code 1, unless you register an \`unhandledRejection\` listener.

**Production stance:**
- Handle errors where they happen: \`await\` inside \`try/catch\`, \`.catch()\` on fire-and-forget promises, and \`'error'\` listeners on streams and EventEmitters. An unhandled \`'error'\` event also throws.
- In Express 4, async handler errors must be passed to \`next(err)\`, because Express 4 doesn't catch rejected promises. **Express 5** and **NestJS** do this for you.
- Treat \`uncaughtException\` and \`unhandledRejection\` handlers as a **last resort**: log with context, flush, and **exit**. Let Docker, systemd, PM2 or Kubernetes restart the process. Continuing after an unknown error risks corrupted in-memory state and leaked resources.
- Do a graceful shutdown on \`SIGTERM\`: stop accepting connections, finish in-flight requests, close the database pool.

\`try/catch\` around \`app.listen()\` (option d) only covers synchronous startup code. It doesn't cover callbacks that run on later event-loop ticks.`,
          keyPoints: [
            'Unhandled rejections crash the process since Node 15',
            'Handle at the source; stream/emitter error listeners',
            'Global handlers: log + exit, rely on supervisor restart',
            'Express 4 needs next(err) for async errors',
          ],
          pitfalls: ['Swallowing errors in a global handler and continuing'],
          personalAngle:
            'Your scraper recovery and restart mechanisms are a good concrete story here: crash fast, have a supervisor restart the process, and resume jobs idempotently.',
          references: [{ label: 'Node.js docs: process events', url: 'https://nodejs.org/api/process.html' }],
        },
      ],
    },
    {
      id: 'be-http-api-design',
      title: 'HTTP semantics & API design',
      summary: 'REST semantics, pagination, versioning, idempotency and validation.',
      questions: [
        {
          id: 'be-http-methods-idempotency',
          title: 'HTTP method semantics and idempotency keys',
          type: 'concept',
          difficulty: 'core',
          priority: 'must',
          tags: ['http', 'rest', 'idempotency', 'status-codes', 'api-design'],
          estMinutes: 6,
          roles: ['backend', 'full-stack'],
          prompt: `Which HTTP methods are **safe** and which are **idempotent**? A mobile client retries \`POST /payments\` after a timeout and the customer is **charged twice**. How do you design the API to prevent that?`,
          hints: [
            'Safe means no state change; idempotent means repeating has the same effect as once.',
            'POST is neither, so the client needs a way to identify "the same request".',
            'Store the key with the result, atomically.',
          ],
          answer: `**Safe** methods don't change server state: \`GET\`, \`HEAD\`, \`OPTIONS\`. **Idempotent** methods have the same effect whether sent once or N times: all safe methods plus \`PUT\` and \`DELETE\`. **\`POST\` and \`PATCH\` are not idempotent** by definition. \`PATCH\` can be, depending on the operation.

Idempotency concerns the **effect on server state**, not the response. A second \`DELETE\` may return 404 and still be idempotent.

**The double charge:** the first request succeeded but the response was lost, so the retry created a second payment. **Fix with an idempotency key:**

1. The client generates a UUID per logical operation and sends \`Idempotency-Key: <uuid>\`, reusing it on every retry.
2. The server **atomically records** \`(key, user, request hash, status)\` before doing work, for example with a unique constraint or Redis \`SET key value NX EX 86400\`.
3. If the key exists and is **completed**, return the **stored response**. If it is **in progress**, return 409 or ask the client to retry later. If the same key arrives with a **different body**, return 422.
4. Perform the side effect and store the result **in the same transaction** where possible, and pass the key down to the payment provider (most support idempotency keys).

\`\`\`sql
CREATE TABLE idempotency_keys (
  key uuid, user_id bigint, request_hash text, response jsonb, status text,
  created_at timestamptz DEFAULT now(), PRIMARY KEY (user_id, key)
);
\`\`\`

**Related status codes:** \`201 Created\` with \`Location\`, \`202 Accepted\` for async work, \`409 Conflict\`, \`422\` for validation, \`429\` with \`Retry-After\`. For updates, \`ETag\` plus \`If-Match\` gives optimistic concurrency (\`412 Precondition Failed\`).`,
          keyPoints: [
            'Correct safe/idempotent classification',
            'Idempotency is about server state, not response',
            'Client-generated Idempotency-Key reused on retry',
            'Atomic key insert + stored response replay',
            'Handle in-progress and mismatched bodies',
          ],
          pitfalls: [
            'Saying PUT is not idempotent or POST is',
            'Checking the key and inserting it in two non-atomic steps',
          ],
          followUps: ['How long do you keep idempotency keys?', 'How does this relate to at-least-once message delivery?'],
          personalAngle:
            'Retried scraping jobs are the same problem as retried requests. Describe how your recovery jobs avoided duplicate records, for example with upserts on natural keys.',
          references: [{ label: 'MDN: HTTP request methods', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods' }],
        },
        {
          id: 'be-pagination-versioning',
          title: 'Pagination and API versioning',
          type: 'tradeoff',
          difficulty: 'core',
          priority: 'must',
          tags: ['pagination', 'cursor', 'versioning', 'api-design'],
          estMinutes: 6,
          roles: ['backend', 'full-stack'],
          prompt: `Design pagination for \`GET /orders\` on a table with 50 million rows that receives constant inserts. **Offset or cursor?** And how would you version this API when you need a breaking change?`,
          hints: [
            'What does the database do with OFFSET 1000000?',
            'What happens to page 2 if new rows are inserted while the user is on page 1?',
            'Cursor = the sort key of the last item seen.',
          ],
          answer: `**Use cursor (keyset) pagination** for large or fast-changing collections.

**Offset** (\`LIMIT 20 OFFSET 40\`) is simple and supports "jump to page N", but:
- The database still **reads and discards** all offset rows, so deep pages get slower roughly linearly.
- With concurrent inserts or deletes, items **shift**, so users see duplicates or miss rows between pages.

**Cursor/keyset** uses the sort key of the last row seen, with a **unique tie-breaker**:

\`\`\`sql
SELECT id, created_at, total FROM orders
WHERE user_id = $1 AND (created_at, id) < ($2, $3)   -- values from the cursor
ORDER BY created_at DESC, id DESC
LIMIT 21;                                             -- fetch one extra to know hasNext
-- backed by: CREATE INDEX ON orders (user_id, created_at DESC, id DESC);
\`\`\`

The response returns an **opaque** cursor (base64 of \`created_at,id\`) so clients don't depend on its internals: \`{ data: [...], nextCursor: "…", hasMore: true }\`. Every page is an index range scan, so cost is constant and stable under inserts. Trade-offs: no arbitrary page jumps, and the sort has to match an index. Offset is fine for small admin tables.

**Versioning:**
- **URL versioning** (\`/v1/orders\`) is the most common: explicit, cache-friendly, and easy to route. Alternatives are a header (\`Accept: application/vnd.acme.v2+json\`) or a date-based version header.
- Avoid breaking changes: **adding** fields and optional parameters is non-breaking. Removing or renaming fields, changing types or changing semantics is breaking.
- For breaking changes, run v1 and v2 side by side, announce deprecation with \`Deprecation\` and \`Sunset\` headers, monitor v1 traffic, then remove it.`,
          keyPoints: [
            'Offset cost grows with depth and is unstable under writes',
            'Keyset with unique tie-breaker and matching index',
            'Opaque cursor + hasMore (limit+1 trick)',
            'Additive changes are non-breaking',
            'URL vs header versioning; deprecation process',
          ],
          pitfalls: ['Cursor on a non-unique column without tie-breaker', 'Bumping the version for additive changes'],
          followUps: ['How would you support "total count" without a slow COUNT(*)?'],
          references: [{ label: 'PostgreSQL docs: LIMIT and OFFSET', url: 'https://www.postgresql.org/docs/current/queries-limit.html' }],
        },
        {
          id: 'be-authn-authz-sessions-jwt',
          title: 'Authentication vs authorization; sessions vs JWT',
          type: 'tradeoff',
          difficulty: 'core',
          priority: 'must',
          tags: ['auth', 'jwt', 'sessions', 'cookies', 'authorization'],
          estMinutes: 7,
          roles: ['backend', 'full-stack'],
          prompt: `Explain **authentication vs authorization**. For a web app plus an API, would you use **server-side sessions or JWTs**? How do you handle logout and token revocation?`,
          hints: [
            'Who are you vs what may you do.',
            'Where does the state live, and what does revocation cost in each model?',
            'Storage location matters: httpOnly cookies vs localStorage.',
          ],
          answer: `**Authentication** establishes **who** the caller is (password, OAuth/OIDC, passkey). **Authorization** decides **what they may do** (roles, ownership, policies). AuthN happens once per session. AuthZ happens on **every** protected operation, close to the data.

**Server-side sessions:** after login the server stores session data (in Redis or the database) and sets an **opaque session ID** in an \`HttpOnly; Secure; SameSite=Lax\` cookie.
- Revocation is trivial: delete the session. You can see and terminate active sessions.
- Costs a store lookup per request, which is cheap with Redis.

**JWT (stateless):** the server signs claims (\`sub\`, \`exp\`, roles) and any service with the key can verify them without a lookup.
- Good for service-to-service calls, multiple APIs, and mobile clients.
- **Revocation is hard**: a token is valid until \`exp\`. The usual mitigation is short-lived access tokens (5–15 min) plus a **refresh token** that is stored server-side, rotated on each use, and revocable. Or keep a denylist, which reintroduces state.
- Claims go stale: role changes don't apply until refresh.

**My default:** for a first-party web app, **session cookies** (simple, revocable, safe against XSS token theft). For third-party or mobile API clients, **short-lived JWT access tokens plus rotating refresh tokens** (OAuth 2.1 style). Avoid storing tokens in \`localStorage\`, because any XSS can read them. With cookies, handle CSRF with \`SameSite\`, Origin checks or CSRF tokens.

**Logout:** for sessions, destroy the server session and clear the cookie. For JWTs, revoke the refresh token family, let the access token expire, and clear cookies.

**Must-mention details:** validate the JWT \`alg\` (never accept \`none\`), check \`exp\`, \`aud\` and \`iss\`, hash passwords with argon2id or bcrypt, and regenerate the session ID on login (prevents session fixation).`,
          keyPoints: [
            'AuthN = identity, AuthZ = permissions on every request',
            'Sessions: opaque ID in HttpOnly cookie, easy revocation',
            'JWT: stateless verification, hard revocation → short TTL + refresh rotation',
            'Avoid localStorage for tokens; handle CSRF for cookies',
            'Validate alg/exp/aud/iss',
          ],
          pitfalls: [
            'Saying JWTs are encrypted (they are usually only signed)',
            'Claiming JWT is always more scalable without discussing revocation',
          ],
          followUps: ['How does OAuth 2.0 authorization code + PKCE work?', 'How would you implement RBAC in NestJS?'],
          references: [{ label: 'OWASP Session Management Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html' }],
        },
        {
          id: 'be-rate-limiting-realtime',
          title: 'Rate limiting, and WebSockets vs SSE',
          type: 'tradeoff',
          difficulty: 'advanced',
          priority: 'should',
          tags: ['rate-limiting', 'redis', 'websockets', 'sse', 'realtime'],
          estMinutes: 8,
          roles: ['backend', 'full-stack'],
          prompt: `Two parts: (1) Implement **rate limiting** of 100 requests per minute per API key across **several Node instances**. Which algorithm and storage? (2) You need to push live job-progress updates to a dashboard. **WebSockets or Server-Sent Events?**`,
          hints: [
            'In-memory counters do not work across instances.',
            'Compare fixed window, sliding window and token bucket at window boundaries.',
            'Is the communication one-way or bidirectional?',
          ],
          answer: `**(1) Rate limiting**

Storage must be **shared** across instances, so use **Redis** (atomic and fast). Per-process memory would allow N × the limit.

Algorithms:
- **Fixed window** (\`INCR key:minute\` with \`EXPIRE\`): simple, but allows up to **2×** the limit around a window boundary.
- **Sliding window log** (a sorted set of timestamps): precise but uses memory per request.
- **Sliding window counter** (weights the previous window): a good approximation that is cheap.
- **Token bucket**: refills at a fixed rate up to a burst capacity. It allows controlled bursts and is the common API choice.

Make it atomic with a **Lua script** (or a library such as \`rate-limiter-flexible\`) so the read-modify-write can't race:

\`\`\`lua
local n = redis.call('INCR', KEYS[1])
if n == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[1]) end
return n
\`\`\`

Respond with **429 Too Many Requests** plus \`Retry-After\` and rate-limit headers. Also rate limit at the edge or gateway (nginx, a CDN or WAF) for abusive traffic, and decide whether to **fail open or closed** if Redis is down.

**(2) Job-progress updates → SSE**

**Server-Sent Events** are **one-way, server to client** over plain HTTP (\`text/event-stream\`). They are built into browsers (\`EventSource\`), **reconnect automatically** with \`Last-Event-ID\`, and pass through proxies and HTTP/2 easily. That fits progress updates.

**WebSockets** are **full-duplex** over an upgraded connection. Use them for chat, collaborative editing, games, or high-frequency client-to-server messages. You handle reconnection, heartbeats and auth yourself, and load balancers need upgrade support and long idle timeouts.

**Both, at scale:** connections are sticky to one instance, so you need a fan-out bus (Redis pub/sub or streams) for an event produced on instance A to reach a client connected to instance B.`,
          keyPoints: [
            'Shared store (Redis) for multi-instance limits',
            'Fixed window boundary burst vs sliding/token bucket',
            'Atomic Lua/INCR+EXPIRE; 429 + Retry-After',
            'SSE: one-way, HTTP, auto-reconnect',
            'WebSocket: bidirectional; needs pub/sub fan-out at scale',
          ],
          pitfalls: ['In-memory rate limiter behind a load balancer', 'Choosing WebSockets by default for one-way updates'],
          followUps: ['How would you rate limit by user and by IP simultaneously?'],
          personalAngle:
            'You already ran Redis for scraping jobs. A dashboard showing scrape-job progress over SSE, fanned out via Redis pub/sub, is a design you can sketch with confidence.',
          references: [{ label: 'MDN: Server-sent events', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events' }],
        },
      ],
    },
    {
      id: 'be-nestjs',
      title: 'NestJS architecture',
      summary: 'Dependency injection, modules and the request lifecycle.',
      questions: [
        {
          id: 'be-nest-di-modules',
          title: 'Dependency injection and modules in NestJS',
          type: 'concept',
          difficulty: 'foundation',
          priority: 'should',
          tags: ['nestjs', 'dependency-injection', 'modules', 'providers'],
          estMinutes: 5,
          roles: ['backend'],
          prompt: `How does **dependency injection** work in NestJS? What are providers and modules, and why would you get the error *"Nest can't resolve dependencies of the UsersService"*?`,
          hints: [
            'The IoC container builds instances from constructor parameter types.',
            'A provider is only visible inside its module unless exported.',
          ],
          answer: `NestJS has an **IoC container**. Classes marked \`@Injectable()\` are **providers**. Nest reads their **constructor parameter types** (via TypeScript's \`emitDecoratorMetadata\`), resolves each dependency from the container, and instantiates them in dependency order. By default providers are **singletons** per application. \`Scope.REQUEST\` and \`Scope.TRANSIENT\` exist, but request scope bubbles up the chain and costs performance.

**Modules** (\`@Module\`) are the encapsulation unit:
- \`providers\`: created and owned by this module.
- \`exports\`: the subset other modules may inject.
- \`imports\`: modules whose exports this module can use.
- \`controllers\`: route handlers.

\`\`\`ts
@Module({ imports: [TypeOrmModule.forFeature([User])], providers: [UsersService], exports: [UsersService] })
export class UsersModule {}

@Module({ imports: [UsersModule], providers: [AuthService] }) // AuthService can inject UsersService
export class AuthModule {}
\`\`\`

**"Can't resolve dependencies"** usually means one of:
1. The dependency's module isn't in \`imports\`, or the provider isn't **exported**.
2. A **circular dependency** between providers or modules. Fix it by restructuring, or as a last resort use \`forwardRef()\`.
3. Injecting an interface or a non-class token without \`@Inject(TOKEN)\`. Interfaces disappear at runtime.
4. A provider listed in two modules, which creates two separate instances (a subtle bug rather than an error).

**Why DI matters:** you can swap implementations (\`{ provide: MailService, useClass: FakeMail }\`) in tests with \`Test.createTestingModule().overrideProvider()\`. Dynamic modules (\`forRoot\`/\`forRootAsync\`) provide configured providers such as database connections.`,
          keyPoints: [
            'Constructor-type-based injection from IoC container',
            'Singleton default; request/transient scopes and their cost',
            'Module encapsulation: providers/exports/imports',
            'Common resolution errors: not exported, circular, interface tokens',
            'DI enables test overrides',
          ],
          pitfalls: ['Registering the same provider in multiple modules', 'Injecting by interface type'],
          followUps: ['When would you use a request-scoped provider?'],
          references: [{ label: 'NestJS docs: Providers', url: 'https://docs.nestjs.com/providers' }],
        },
        {
          id: 'be-nest-request-lifecycle',
          title: 'NestJS request lifecycle: middleware, guards, interceptors, pipes',
          type: 'concept',
          difficulty: 'core',
          priority: 'must',
          tags: ['nestjs', 'guards', 'interceptors', 'pipes', 'middleware', 'dto', 'lifecycle'],
          estMinutes: 7,
          roles: ['backend'],
          prompt: `A request hits a NestJS controller. **In what order** do middleware, guards, interceptors, pipes and exception filters run? Where would you put authentication, role checks, request logging/timing, DTO validation and error formatting?`,
          hints: [
            'Middleware runs before Nest knows which handler will run.',
            'Guards answer a yes/no question; pipes transform and validate arguments.',
            'Interceptors wrap the handler: before and after.',
          ],
          answer: `**Order:**

1. **Middleware**: Express/Fastify-level, before route resolution. It has no handler metadata.
2. **Guards**: global → controller → route. They return true/false and have \`ExecutionContext\`, so they can read metadata such as \`@Roles()\`.
3. **Interceptors (before)**: global → controller → route.
4. **Pipes**: global → controller → route → parameter. They transform and validate handler arguments.
5. **Controller handler**, then services.
6. **Interceptors (after)**: run in reverse order through the RxJS \`Observable\` stream.
7. **Exception filters**: run when anything above throws (route → controller → global, first match wins).

**Where things go:**
- **Authentication** (verify the JWT or session and attach \`req.user\`): a guard such as \`AuthGuard('jwt')\`, often global with a \`@Public()\` opt-out. Middleware also works, but guards know the route.
- **Role and permission checks**: a \`RolesGuard\` reading \`Reflector\` metadata.
- **Logging and timing, response mapping, caching, timeouts**: an **interceptor**, because it sees both before and after.
- **DTO validation**: the global \`ValidationPipe\`.
- **Error formatting**: an **exception filter**, for example mapping Prisma \`P2002\` to 409.

\`\`\`ts
app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))

export class CreateUserDto {
  @IsEmail() email!: string
  @IsString() @MinLength(8) password!: string
}
\`\`\`

\`whitelist\` strips unknown properties, which prevents mass assignment. \`transform\` converts the plain body into the DTO class instance and applies primitive conversions.`,
          keyPoints: [
            'Middleware → guards → interceptors → pipes → handler → interceptors → filters',
            'Guards have ExecutionContext + metadata; middleware does not',
            'Interceptors wrap via RxJS for before/after logic',
            'ValidationPipe with whitelist/transform + class-validator DTOs',
            'Exception filters for consistent error responses',
          ],
          pitfalls: [
            'Putting pipes before guards (validating before authorizing)',
            'Doing role checks in middleware without route metadata',
          ],
          followUps: ['How would you implement a global @Public() decorator with a JWT guard?'],
          personalAngle:
            'If you used NestJS for the accessibility platform backend, walk through one real request: which guard authenticated the customer site, how DTOs were validated, and how errors were shaped.',
          references: [{ label: 'NestJS docs: Request lifecycle', url: 'https://docs.nestjs.com/faq/request-lifecycle' }],
        },
      ],
    },
  ],
}

export default track
