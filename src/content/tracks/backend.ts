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
    {
      id: 'be-runtimes-tooling',
      title: 'Runtimes & tooling (Node 24, Bun, Vite, NestJS)',
      summary: 'Thread-pool behaviour in practice, modern Node features, Bun vs Node, Vite dev vs build, NestJS scopes and module debugging, and monorepos with shared types.',
      questions: [
        {
          id: 'be-rt-threadpool-saturation-output',
          title: 'Output: saturating the libuv thread pool',
          type: 'output',
          difficulty: 'core',
          priority: 'should',
          tags: ['node', 'libuv', 'thread-pool', 'event-loop', 'crypto'],
          estMinutes: 6,
          roles: ['backend', 'full-stack'],
          prompt: `Assume one \`pbkdf2\` call takes about **500 ms** of CPU, the machine has 8 cores, and \`UV_THREADPOOL_SIZE\` is not set. **What does this print, roughly when, and what changes if you set \`UV_THREADPOOL_SIZE=5\` or switch to \`pbkdf2Sync\`?**`,
          code: {
            language: 'javascript',
            source: `const crypto = require('node:crypto')
const start = Date.now()
const log = (label) => console.log(label, Math.round((Date.now() - start) / 100) * 100)

for (let i = 1; i <= 5; i++) {
  crypto.pbkdf2('pw', 'salt', 300_000, 64, 'sha512', () => log('hash ' + i))
}
setTimeout(() => log('timer'), 0)`,
          },
          intent:
            'Tests whether you can predict thread-pool behaviour from its default size, not just recite that "crypto is async". A strong answer explains the 4 + 1 batching, why the timer is unaffected, and contrasts the async and sync APIs and their effect on the event loop.',
          hints: [
            'Is the main thread busy while the hashes run?',
            'How many libuv thread-pool threads exist by default?',
            'Five jobs, four workers: when does the fifth job start?',
            'Shape of the answer: "timer ~0", then four "hash" lines (any order) at ~500, then one at ~1000. Now redo it for pool size 5 and for the Sync version.',
          ],
          answer: `**Output (default pool of 4 threads):**

\`\`\`plaintext
timer 0
hash 1 500     (hashes 1–4 finish around 500 ms, in no guaranteed order)
hash 2 500
hash 3 500
hash 4 500
hash 5 1000
\`\`\`

**Why:**
- \`crypto.pbkdf2\` (async) runs on the **libuv thread pool**, which has **4 threads by default**. The main thread is free, so the 0 ms timer fires almost immediately.
- Four jobs run in parallel on four threads (the machine has enough cores). Job 5 **waits in the pool queue** until a thread frees up, so it finishes around 1000 ms.
- The completion order of 1–4 depends on thread scheduling, so do not promise "1, 2, 3, 4".

**\`UV_THREADPOOL_SIZE=5\`:** all five run in parallel and finish around 500 ms. It must be set before the pool is first used, ideally as an environment variable at process start. Larger is not always better: more threads than cores just time-slice.

**\`pbkdf2Sync\`:** each hash runs **on the main thread**, one after another: hashes print at about 500, 1000, 1500, 2000, 2500, and the timer prints **last**, around 2500 ms, because the event loop was blocked the whole time. In a server, that means no other request is served.

**Practical consequence:** the same pool serves \`fs\`, \`dns.lookup\`, \`zlib\` and async crypto. A burst of password hashing can delay unrelated file reads or DNS lookups. Network sockets do *not* use the pool, so plain HTTP traffic is not queued behind it, but its handlers can still be waiting on \`fs\` or DNS.`,
          walkthrough: [
            {
              title: 'Locate where the work runs',
              body: 'Async `pbkdf2` is dispatched to the **libuv thread pool**; the main thread only schedules it. So the timer is not blocked and prints at about 0 ms.',
            },
            {
              title: 'Apply the pool size',
              body: 'Default 4 threads → hashes 1–4 run together and finish around 500 ms (order not guaranteed); hash 5 queues and finishes around 1000 ms.',
            },
            {
              title: 'Change the variables',
              body: '`UV_THREADPOOL_SIZE=5` → all at about 500 ms. `pbkdf2Sync` → serial on the main thread, 500…2500 ms, and the timer prints last.',
            },
            {
              title: 'Connect it to production and say it',
              body: '*"The pool is shared by fs, dns.lookup, zlib and crypto, so heavy hashing can delay unrelated I/O. I would size the pool deliberately or move hashing to worker threads."*',
            },
          ],
          keyPoints: [
            'Async crypto runs on the libuv pool; main thread stays free',
            'Default pool size 4 → fifth job queues',
            'Completion order within a batch is not guaranteed',
            'Sync API blocks the event loop; timer runs last',
            'Pool is shared with fs, dns.lookup and zlib',
          ],
          pitfalls: ['Predicting 1..5 all at ~500 ms', 'Thinking network I/O shares the thread pool'],
          followUps: ['How would you measure event-loop delay in production (perf_hooks.monitorEventLoopDelay)?'],
          references: [{ label: "Node.js: Don't block the event loop", url: 'https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop' }],
        },
        {
          id: 'be-rt-node-modern-features',
          title: 'Node 22/24 features worth knowing',
          type: 'concept',
          difficulty: 'foundation',
          priority: 'must',
          tags: ['node', 'node-24', 'fetch', 'test-runner', 'typescript', 'tooling'],
          estMinutes: 5,
          roles: ['backend', 'full-stack'],
          prompt: `*"We're on Node 24 LTS. Which built-in features would let you **remove dependencies** from a typical TypeScript service, and where are their limits?"*`,
          intent:
            'Tests whether you keep up with the platform and can judge when a built-in replaces a dependency. A strong answer names fetch, the test runner, watch mode, env files and type stripping, and states each one\'s limits accurately.',
          hints: [
            'Think of the dependencies a typical service has: an HTTP client, a test framework, nodemon, dotenv, ts-node/tsx.',
            'Which of those has a built-in equivalent now?',
            'Type stripping is the subtle one: what does it do, and what does it not do?',
            'Checklist: fetch (undici) → node:test + node --test → --watch → --env-file / process.loadEnvFile → running .ts with erasable syntax only, no type checking.',
          ],
          answer: `**Several common dependencies now have built-in equivalents; know their limits.**

- **\`fetch\`, \`Request\`, \`Response\`, \`AbortController\`, Web Streams** are global (implemented by undici). This can replace \`axios\`/\`node-fetch\` for most calls. Limits: no automatic error on 4xx/5xx (check \`res.ok\`), set timeouts with \`AbortSignal.timeout(ms)\`.
- **Test runner:** \`node:test\` + \`node --test\` gives \`describe\`/\`it\`, mocking (\`mock.fn\`, \`mock.timers\`), watch mode and coverage reporting. Good for libraries and services; Vitest or Jest still offer richer ecosystems (snapshots, browser-like environments, plugins).
- **Watch mode:** \`node --watch src/main.ts\` restarts on change; replaces \`nodemon\` for simple setups.
- **Env files:** \`node --env-file=.env\` or \`process.loadEnvFile()\` replaces \`dotenv\` for loading; validation is still your job (zod at startup).
- **\`node --run <script>\`** runs package.json scripts with less overhead than \`npm run\`.
- **TypeScript type stripping:** recent Node (enabled by default since 23.6 and backported to 22.18) runs \`.ts\` files directly by **erasing** type annotations. Limits:
  - **No type checking**: still run \`tsc --noEmit\` in CI.
  - Only **erasable syntax**: \`enum\`, \`namespace\` with runtime code and constructor parameter properties need transformation (\`--experimental-transform-types\`) or a rewrite. TypeScript's \`erasableSyntaxOnly\` option flags them.
  - Relative imports need the real extension (\`./user.ts\`), \`tsconfig\` paths are not resolved, and it does not apply to dependencies inside \`node_modules\`.
  - Decorators (NestJS) are not supported this way, so Nest projects still compile.
- **Also useful:** \`require()\` of synchronous ES modules works without a flag in current LTS lines, a global \`WebSocket\` client, \`fs.glob\`, and the permission model (\`--permission\`).

\`\`\`bash
node --env-file=.env --watch src/server.ts   # dev loop without nodemon/dotenv/tsx
node --test --experimental-test-coverage
\`\`\``,
          walkthrough: [
            {
              title: 'Start from dependencies',
              body: 'Frame the answer as "what can I delete": HTTP client, test runner, nodemon, dotenv, ts-node/tsx.',
            },
            {
              title: 'Map each to a built-in',
              body: 'Global `fetch`, `node:test`, `--watch`, `--env-file`, `node --run`, direct `.ts` execution.',
            },
            {
              title: 'State the limits precisely',
              body: 'fetch does not throw on HTTP errors; node:test has a smaller ecosystem; type stripping does **not type-check**, supports only erasable syntax, needs `.ts` extensions and does not handle decorators.',
            },
            {
              title: 'Give a recommendation',
              body: '*"For a small service I would use built-ins plus `tsc --noEmit` in CI; for NestJS I still compile because of decorators."*',
            },
          ],
          keyPoints: [
            'Global fetch (undici) and AbortSignal.timeout',
            'node:test with mocking and coverage',
            '--watch and --env-file replace nodemon and dotenv',
            'Type stripping: no type check, erasable syntax only',
            'Decorator-based NestJS still needs a compile step',
          ],
          pitfalls: ['Claiming Node now type-checks TypeScript', 'Assuming enums work under type stripping'],
          followUps: ['Would you migrate an existing Jest suite to node:test? Why or why not?'],
          references: [
            { label: 'Node.js docs: Modules: TypeScript', url: 'https://nodejs.org/api/typescript.html' },
            { label: 'Node.js docs: Test runner', url: 'https://nodejs.org/api/test.html' },
          ],
        },
        {
          id: 'be-rt-bun-vs-node',
          title: 'Bun vs Node for a product team',
          type: 'tradeoff',
          difficulty: 'core',
          priority: 'should',
          tags: ['bun', 'node', 'runtime', 'tooling', 'tradeoff'],
          estMinutes: 6,
          roles: ['backend', 'full-stack'],
          prompt: `A teammate proposes moving your NestJS API and its tooling from Node to **Bun** because "it's much faster". **How would you evaluate that, and what would you recommend?**`,
          intent:
            'Tests whether you can separate tooling speed from production runtime risk and decide with evidence. A strong answer explains what Bun is, where it clearly helps, the compatibility and operational risks, and proposes an incremental, measured adoption.',
          hints: [
            'Bun is several tools in one. Which parts could you adopt without changing the production runtime?',
            'Where would "faster" actually show up for a typical database-bound API?',
            'What breaks first when a runtime is "mostly" Node-compatible?',
            'Skeleton: Bun = runtime (JavaScriptCore) + package manager + test runner + bundler → low-risk: bun install / bun test locally and in CI → higher-risk: production runtime → benchmark your real endpoints, run full test suite, check native addons, APM agents and Nest decorators → decide per layer.',
          ],
          answer: `**Adopt Bun where the risk is low and the gain is measurable (tooling, scripts), and move the production runtime only after your own benchmarks and test suite justify it.**

**What Bun is:** a JavaScript runtime built on JavaScriptCore (Node uses V8), plus a package manager, test runner and bundler in one binary. It runs TypeScript directly and implements most Node APIs (\`node:fs\`, \`node:http\`, \`node:crypto\`...), plus its own (\`Bun.serve\`, built-in SQLite and other clients).

**Where it clearly helps:**
- **Install speed** (\`bun install\`) and fast startup: shorter CI and local loops.
- **Scripts and tests:** \`bun test\` is fast and Jest-like; running TS scripts needs no build step.
- New greenfield services that do not depend on Node-specific internals.

**Where "much faster" may not matter:** a typical API spends its time waiting on PostgreSQL, Redis and other services. Framework-level HTTP benchmarks rarely translate into lower p95 for a database-bound endpoint. Measure your real routes.

**Risks for production:**
- **Compatibility gaps:** "mostly compatible" fails at the edges: native addons, some \`node:\` modules or flags, APM and observability agents, and libraries depending on V8-specific behaviour. NestJS relies on decorator metadata; test it, do not assume.
- **Operational maturity:** your Docker images, profiling tools, heap snapshot workflows, security patch cadence and team experience are built around Node.
- **Two runtimes** in one team means two sets of bugs to reason about.

**Recommendation:**
1. Use Bun as a **package manager / test runner / script runner** if it measurably speeds up CI; keep the lockfile policy clear.
2. For the runtime, run the **full test suite and a load test of real endpoints** under Bun in staging, verify observability works, then decide.
3. Revisit as compatibility improves; the decision is reversible if you avoid Bun-only APIs in shared code.`,
          walkthrough: [
            {
              title: 'Unpack "Bun"',
              body: 'It is a runtime **and** a package manager, test runner and bundler. Each layer can be adopted separately, with very different risk.',
            },
            {
              title: 'Check where speed matters',
              body: 'Install and startup speed help CI immediately. For a database-bound API, runtime speed rarely moves p95; it must be measured on real routes.',
            },
            {
              title: 'List production risks',
              body: 'Edge compatibility (native addons, APM agents, decorator metadata), operational tooling, team experience, two runtimes to support.',
            },
            {
              title: 'Recommend incrementally',
              body: '*"Tooling first if CI gets faster; runtime only after the full suite and a load test pass in staging, and without Bun-only APIs so we can roll back."*',
            },
          ],
          keyPoints: [
            'Bun = runtime + package manager + test runner + bundler',
            'Low-risk wins: install, tests, scripts',
            'I/O-bound APIs: runtime speed often not the bottleneck',
            'Compatibility edges: native addons, APM, decorators',
            'Measure with real endpoints; keep it reversible',
          ],
          pitfalls: ['Deciding from hello-world benchmarks', 'Rewriting to Bun-only APIs before validating'],
          followUps: ['How would you run the same test suite against both runtimes in CI?'],
          personalAngle:
            'You deploy with Docker and CI/CD pipelines: describe how you would run a Bun variant of the image in staging side by side with the Node one before switching.',
          references: [{ label: 'Bun documentation', url: 'https://bun.sh/docs' }],
        },
        {
          id: 'be-rt-vite-dev-vs-build',
          title: 'Vite: dev server vs production build',
          type: 'concept',
          difficulty: 'core',
          priority: 'should',
          tags: ['vite', 'esm', 'hmr', 'bundling', 'esbuild', 'rolldown', 'tooling'],
          estMinutes: 6,
          roles: ['frontend', 'full-stack'],
          prompt: `**Why is the Vite dev server fast to start even on a big app, why does it still bundle for production, and what kinds of bugs appear only in the production build?**`,
          intent:
            'Tests whether you understand the native-ESM dev model, dependency pre-bundling and HMR, and why production still needs a bundler. A strong answer explains both modes and names concrete dev/prod divergence and how to catch it.',
          hints: [
            'In dev, does Vite bundle your source code before serving the first page?',
            'Your own code and node_modules are treated differently. Why do dependencies get pre-bundled?',
            'Why would serving hundreds of unbundled modules be fine on localhost but bad in production?',
            'Skeleton: dev = native ESM on demand + per-file transform + pre-bundled deps cached in node_modules/.vite + HMR over WebSocket along the module graph; prod = Rollup/Rolldown bundle with tree-shaking, code splitting, minification, hashed assets; divergence = CJS interop, env vars, dynamic imports, CSS order → test with vite build && vite preview.',
          ],
          answer: `**In dev Vite does not bundle your source: the browser loads native ES modules on demand and Vite transforms each file when requested. For production it bundles, because many small requests, no tree-shaking and no minification would be slow for real users.**

**Dev server:**
- **Native ESM on demand:** \`index.html\` imports \`/src/main.ts\`; the browser requests each import and Vite transforms that file only (TS, JSX, Vue SFC). Startup cost does not grow with app size; only the modules a page actually imports are processed.
- **Dependency pre-bundling:** \`node_modules\` packages are pre-bundled once and cached in \`node_modules/.vite\`. Reasons: convert CommonJS to ESM so the browser can import it, and collapse packages with hundreds of internal modules into one request. Historically this used esbuild; Vite 8 moved to the Rust-based Rolldown toolchain.
- **HMR:** over a WebSocket. When a file changes, Vite walks the module graph to the nearest HMR boundary (a Vue SFC, a React component with Fast Refresh) and swaps only that module, keeping state. Changing a file with no boundary triggers a full reload.

**Production build:** bundled with Rollup (Vite 7 and earlier) or Rolldown (Vite 8): tree-shaking, code splitting on dynamic \`import()\`, minification, CSS extraction and content-hashed filenames for long-term caching.

**Dev-only vs prod-only bugs:**
- **CommonJS interop:** a default-vs-named import that works with pre-bundled deps fails in the build, or the reverse.
- **Environment variables:** only \`VITE_\`-prefixed variables are exposed via \`import.meta.env\`, statically replaced at build time.
- **Dynamic imports** with fully dynamic paths cannot be analysed; use \`import.meta.glob\`.
- **CSS order** and chunking differences; **base path** issues when deploying to a subpath (such as GitHub Pages).
- Case-sensitive paths that work on macOS but fail on Linux CI.

**How to catch them:** run \`vite build && vite preview\` locally and in CI, and run end-to-end tests against the preview build, not the dev server.`,
          walkthrough: [
            {
              title: 'Explain dev mode',
              body: 'No bundling of your code: the browser imports native ESM and Vite transforms each requested file. Startup does not scale with app size.',
            },
            {
              title: 'Explain pre-bundling and HMR',
              body: 'Dependencies are pre-bundled once (CJS → ESM, fewer requests) and cached. HMR swaps modules along the graph to the nearest boundary over a WebSocket.',
            },
            {
              title: 'Explain why production bundles',
              body: 'Real networks punish request waterfalls. Rollup (≤ v7) or Rolldown (v8) gives tree-shaking, code splitting, minification and hashed assets.',
            },
            {
              title: 'Name divergence and close',
              body: 'CJS interop, `VITE_` env vars, dynamic imports, CSS order, base path, case sensitivity. Say: *"Dev and prod use different pipelines, so I run E2E against `vite preview` in CI."*',
            },
          ],
          keyPoints: [
            'Dev: native ESM on demand, per-file transforms',
            'Dependency pre-bundling: CJS → ESM, fewer requests, cached',
            'HMR via module graph boundaries over WebSocket',
            'Prod: Rollup/Rolldown bundle with tree-shaking, splitting, hashing',
            'Test the build with vite preview to catch divergence',
          ],
          pitfalls: ['Saying Vite uses esbuild for production bundles', 'Only ever testing against the dev server'],
          followUps: ['How would you diagnose a large production chunk?'],
          personalAngle:
            'This app itself deploys to GitHub Pages under a subpath with a configured base. Mention that as a real dev/prod difference you have handled.',
          references: [{ label: 'Vite guide', url: 'https://vite.dev/guide/' }],
        },
        {
          id: 'be-rt-nest-lifecycle-scopes-mcq',
          title: 'NestJS lifecycle order and DI scopes',
          type: 'multiple-choice',
          difficulty: 'core',
          priority: 'must',
          tags: ['nestjs', 'lifecycle', 'dependency-injection', 'scopes', 'guards'],
          estMinutes: 5,
          roles: ['backend'],
          prompt: `**Which statements about NestJS are true?** (Select all that apply.)`,
          choices: [
            {
              id: 'a',
              text: 'A guard that returns `false` stops the request before any pipe runs, so `ValidationPipe` never sees the body.',
              correct: true,
              explanation: 'Order is middleware → guards → interceptors (before) → pipes → handler. A failed guard throws ForbiddenException before pipes.',
            },
            {
              id: 'b',
              text: 'Middleware can read route metadata such as `@Roles()` through `Reflector`.',
              correct: false,
              explanation: 'Middleware runs before the handler is resolved and has no ExecutionContext. Use a guard for metadata-based checks.',
            },
            {
              id: 'c',
              text: 'If a default-scoped controller injects a `Scope.REQUEST` service, the controller also becomes request-scoped.',
              correct: true,
              explanation: 'Request scope bubbles up the injection chain: anything depending on a request-scoped provider is re-created per request.',
            },
            {
              id: 'd',
              text: 'Exceptions thrown inside guards bypass exception filters.',
              correct: false,
              explanation: 'Filters handle exceptions from guards, interceptors, pipes and handlers alike.',
            },
            {
              id: 'e',
              text: 'A `Scope.TRANSIENT` provider is a single instance shared by all consumers.',
              correct: false,
              explanation: 'Each consumer that injects a transient provider gets its own dedicated instance.',
            },
          ],
          intent:
            'Tests precise knowledge of the request pipeline order and the three injection scopes, including the performance consequence of request scope bubbling. A strong answer picks a and c and explains why each wrong option is wrong.',
          hints: [
            'Write the pipeline order down first: middleware, guards, interceptors, pipes, handler, then interceptors after, with filters catching errors.',
            'Which of these components receive an ExecutionContext with handler metadata?',
            'Scopes: DEFAULT (singleton), REQUEST (per request), TRANSIENT (per consumer). What happens to things that depend on a request-scoped provider?',
          ],
          answer: `**Correct: a and c.**

**Lifecycle order:** middleware → guards → interceptors (before) → pipes → handler → interceptors (after) → response. Exception filters catch anything thrown along the way.

- **(a) True.** Guards run before pipes. A guard returning \`false\` throws \`ForbiddenException\`, so the request never reaches \`ValidationPipe\`. This is deliberate: authorize before doing work on the body.
- **(b) False.** Middleware runs at the HTTP-adapter level, before Nest resolves the handler, so there is no \`ExecutionContext\` or route metadata. Role checks belong in a guard using \`Reflector\`.
- **(c) True.** **Scope bubbles up.** A controller that injects a request-scoped service must itself be created per request, and so on up the chain. This costs performance (allocation per request) and is a common hidden slowdown. Alternatives: pass request data explicitly, or use \`AsyncLocalStorage\` (for example via a CLS module) for request context such as a tenant id or trace id while keeping providers singleton.
- **(d) False.** Exception filters handle exceptions from guards, interceptors, pipes and handlers.
- **(e) False.** **Transient** providers give each consumer its own instance; **default** scope is the shared singleton.

\`\`\`ts
@Injectable({ scope: Scope.REQUEST })
export class TenantContext {
  constructor(@Inject(REQUEST) private req: Request) {}
  get tenantId() { return this.req.headers['x-tenant-id'] }
}
// Every provider and controller that injects TenantContext is now request-scoped too.
\`\`\``,
          walkthrough: [
            {
              title: 'Write the pipeline',
              body: 'Middleware → guards → interceptors → pipes → handler → interceptors (after); filters catch errors anywhere. Most options are decided by this order alone.',
            },
            {
              title: 'Evaluate lifecycle options (a, b, d)',
              body: '(a) guards before pipes: true. (b) middleware has no ExecutionContext: false. (d) filters catch guard exceptions: false.',
            },
            {
              title: 'Evaluate scope options (c, e)',
              body: 'Request scope **bubbles up** to every dependent: (c) true. Transient = one instance per consumer: (e) false.',
            },
            {
              title: 'Add the practical point',
              body: '*"Request scope is a performance trap; for tenant or trace context I prefer AsyncLocalStorage and singleton providers."*',
            },
          ],
          keyPoints: [
            'Middleware → guards → interceptors → pipes → handler → interceptors',
            'Guards have ExecutionContext and metadata; middleware does not',
            'Filters catch exceptions from every stage',
            'Request scope bubbles up the dependency chain',
            'Transient = per consumer; default = singleton',
          ],
          pitfalls: ['Making a widely used provider request-scoped for convenience'],
          followUps: ['How would you carry a tenant id through the app without request-scoped providers?'],
          references: [
            { label: 'NestJS docs: Injection scopes', url: 'https://docs.nestjs.com/fundamentals/injection-scopes' },
            { label: 'NestJS docs: Request lifecycle', url: 'https://docs.nestjs.com/faq/request-lifecycle' },
          ],
        },
        {
          id: 'be-rt-nest-circular-dependency-debug',
          title: 'Debug: NestJS circular dependency and "can\'t resolve dependencies"',
          type: 'debugging',
          difficulty: 'core',
          priority: 'must',
          tags: ['nestjs', 'dependency-injection', 'circular-dependency', 'modules', 'debugging'],
          estMinutes: 10,
          roles: ['backend'],
          prompt: `After adding "users can see their orders" and "cancelling an order notifies the user", the app fails at startup with:

\`Nest can't resolve dependencies of the OrdersService (?). Please make sure that the argument dependency at index [0] is available in the OrdersModule context.\`

**What is wrong, and how would you fix it properly?**`,
          code: {
            language: 'typescript',
            source: `// users.module.ts
@Module({ imports: [OrdersModule], providers: [UsersService], exports: [UsersService] })
export class UsersModule {}

// orders.module.ts
@Module({ imports: [UsersModule], providers: [OrdersService], exports: [OrdersService] })
export class OrdersModule {}

// users.service.ts
@Injectable()
export class UsersService {
  constructor(private readonly orders: OrdersService) {}
  listOrders(userId: string) { return this.orders.findByUser(userId) }
  notify(userId: string, msg: string) { /* send email */ }
}

// orders.service.ts
@Injectable()
export class OrdersService {
  constructor(private readonly users: UsersService) {}
  async cancel(orderId: string) {
    const order = await this.repo.cancel(orderId)
    await this.users.notify(order.userId, 'Order cancelled')
  }
}`,
          },
          intent:
            'Tests whether you can read Nest DI errors and fix the design rather than only silencing the error. A strong answer identifies the module and provider cycle, explains why the dependency resolves as undefined, and prefers restructuring (extract a module or use events) over forwardRef.',
          hints: [
            'Draw the arrows: which module imports which, and which service injects which?',
            'When two files import each other, one of the imported classes can be undefined at the moment decorators are evaluated. That is the "?" in the message.',
            'Does UsersService really need OrdersService, or does it need something narrower?',
            'Skeleton: extract NotificationsModule (exports NotificationsService) used by OrdersModule; move listOrders to OrdersService or an OrdersController route; or emit an OrderCancelled event; forwardRef(() => X) on both sides only as a last resort.',
          ],
          answer: `**There is a cycle at two levels: \`UsersModule ↔ OrdersModule\` and \`UsersService ↔ OrdersService\`.** When TypeScript files import each other, one class is still \`undefined\` when the other's constructor metadata is recorded, so Nest sees an unknown token at index 0 and prints \`(?)\`. Barrel files (\`index.ts\` re-exports) can create the same file-level cycle even when modules look fine.

**Proper fix: break the cycle by restructuring.** The dependency is really "orders need to send notifications", and "users' orders" is an orders query.

\`\`\`ts
// notifications.module.ts: leaf module, depends on nothing above it
@Module({ providers: [NotificationsService], exports: [NotificationsService] })
export class NotificationsModule {}

// orders.module.ts
@Module({ imports: [NotificationsModule], providers: [OrdersService], exports: [OrdersService] })
export class OrdersModule {}

@Injectable()
export class OrdersService {
  constructor(private readonly notifications: NotificationsService) {}
  findByUser(userId: string) { /* ... */ }
  async cancel(orderId: string) {
    const order = await this.repo.cancel(orderId)
    await this.notifications.send(order.userId, 'Order cancelled')
  }
}
// UsersModule no longer imports OrdersModule; GET /users/:id/orders lives in an orders controller.
\`\`\`

**Alternative: domain events.** \`OrdersService\` emits \`order.cancelled\` (for example with \`@nestjs/event-emitter\` or a queue); a listener in the users or notifications module reacts. Orders no longer know who listens.

**Last resort: \`forwardRef\`.** It works, but hides a design smell, and must be applied on **both** sides:
\`\`\`ts
@Module({ imports: [forwardRef(() => UsersModule)] })                      // module level
constructor(@Inject(forwardRef(() => UsersService)) private users: UsersService) {} // provider level
\`\`\`

**Related "can't resolve" causes to check:** the provider's module is not in \`imports\`, the provider is not in \`exports\`, an interface used as a token without \`@Inject()\`, or the same provider listed in two modules (two instances). Tools such as \`madge --circular\` find file-level cycles.`,
          walkthrough: [
            {
              title: 'Read the error',
              body: '`(?)` at index [0] means Nest saw an **undefined** token for the first constructor parameter. That points to a missing export/import or a circular file import.',
            },
            {
              title: 'Draw the dependency graph',
              body: 'UsersModule → OrdersModule → UsersModule, and UsersService ↔ OrdersService. A cycle on both levels.',
            },
            {
              title: 'Find the real dependency',
              body: 'Orders need **notifications**, not users. "List a user\'s orders" is an orders query. Extract `NotificationsModule` as a leaf, or emit a domain event.',
            },
            {
              title: 'Mention forwardRef correctly',
              body: '`forwardRef(() => X)` on both module imports and `@Inject(forwardRef(...))` on both constructors resolves it, but it treats the symptom.',
            },
            {
              title: 'Say it in the interview',
              body: '*"A circular dependency is a boundary problem. I extract the shared capability into a leaf module or use events, and keep forwardRef as a last resort."*',
            },
          ],
          keyPoints: [
            'Reads "(?) at index [0]" as an undefined token',
            'Identifies module-level and provider-level cycles',
            'Restructures: leaf module or domain events',
            'forwardRef on both sides as a last resort',
            'Other causes: not exported/imported, interface tokens, duplicate providers, barrel cycles',
          ],
          pitfalls: ['Adding forwardRef on one side only', 'Fixing by listing UsersService in OrdersModule providers (creates a second instance)'],
          followUps: ['How would you enforce module boundaries automatically (lint rules, dependency-cruiser)?'],
          references: [{ label: 'NestJS docs: Circular dependency', url: 'https://docs.nestjs.com/fundamentals/circular-dependency' }],
        },
        {
          id: 'be-rt-monorepo-shared-types',
          title: 'Monorepo with shared types between front end and NestJS',
          type: 'system-design',
          difficulty: 'advanced',
          priority: 'should',
          tags: ['monorepo', 'typescript', 'nestjs', 'vue', 'react', 'zod', 'pnpm', 'contracts'],
          estMinutes: 30,
          roles: ['full-stack'],
          prompt: `You own a Vue (or React) front end and a NestJS API that drift apart: the API renames a field, the UI breaks in production. **Design a monorepo setup where both share types and validation, and explain the trade-offs.**`,
          intent:
            'Tests whether you can design a contract boundary, not just "share a types folder". A strong answer puts runtime-validated schemas in a dedicated package, keeps server internals out of it, sets up workspace tooling and CI, and addresses deploy-order compatibility.',
          hints: [
            'Sharing TypeScript types alone gives compile-time safety. What protects you at runtime, when the deployed API and the deployed UI are different versions?',
            'What should never go into the shared package?',
            'How do the apps consume the package: from source or from a build? What does each choice need?',
            'Skeleton: pnpm workspaces → packages/contracts (zod schemas + z.infer types, no Nest/ORM imports) → api validates with the schemas in a pipe, web parses responses → turbo/nx for affected builds and caching → CI runs typecheck for all → additive, backward-compatible changes because deploys are not atomic.',
          ],
          answer: `**Create a \`contracts\` package with runtime schemas (zod) as the single source of truth; both apps import it; the API validates requests with it and the UI can validate responses; CI type-checks everything together; changes stay backward compatible because deploys are not atomic.**

**Layout (pnpm workspaces):**
\`\`\`plaintext
apps/web        Vue 3 / React (Vite)
apps/api        NestJS
packages/contracts   zod schemas + inferred types, framework-free
pnpm-workspace.yaml  packages: ['apps/*', 'packages/*']
\`\`\`

\`\`\`ts
// packages/contracts/src/orders.ts
import { z } from 'zod'
export const OrderDto = z.object({ id: z.string().uuid(), totalJpy: z.number().int(), status: z.enum(['open', 'cancelled']) })
export type OrderDto = z.infer<typeof OrderDto>
export const CancelOrderBody = z.object({ reason: z.string().max(500).optional() })
\`\`\`

- **API:** validate bodies with a small \`ZodValidationPipe\` (or a library integrating zod with Nest), and type controller return values as \`OrderDto\`.
- **Web:** \`import type { OrderDto }\` for typing; optionally \`OrderDto.parse(json)\` at the API client boundary to fail loudly on drift.
- Both depend on \`"@app/contracts": "workspace:*"\`.

**What stays out of contracts:** ORM entities, Nest decorators, database ids you do not expose, secrets. Contracts describe the **wire format**, not the persistence model; mapping happens in the API.

**Consumption choice:**
- **From source** (point \`exports\` at \`src/index.ts\`, Vite and the Nest build compile it): simplest, instant feedback.
- **Built package** with TypeScript project references (\`composite\`, \`tsc -b\`): cleaner boundaries and faster incremental builds at larger scale.

**Tooling and CI:** Turborepo or Nx for "affected" builds and caching; one CI job runs \`tsc -b\`/typecheck and tests for every app when contracts change, so a renamed field fails the build of the app that uses it.

**Deploy order:** API and UI ship separately, so a renamed field still breaks the older UI in users' browsers. Make **additive** changes (add the new field, migrate the UI, remove the old field later), or version the endpoint.

**Alternative:** generate an OpenAPI spec from the API and a typed client from it. This is better when other teams or other languages consume the API; the zod-first package is simpler when one team owns both ends in TypeScript.`,
          walkthrough: [
            {
              title: 'Define the real problem',
              body: 'Two separately deployed apps share a **wire contract**. Types catch drift at build time; runtime validation and compatible changes protect deployed versions.',
            },
            {
              title: 'Design the contracts package',
              body: 'pnpm workspaces with `packages/contracts`: zod schemas + `z.infer` types, framework-free. No ORM entities or decorators: wire format only.',
            },
            {
              title: 'Wire both apps to it',
              body: 'API validates with a zod pipe and types responses; web imports types and optionally parses responses. Choose source vs built package (project references).',
            },
            {
              title: 'Add CI and deploy safety',
              body: 'Turbo/Nx affected builds, typecheck all apps on contract changes, additive changes or versioning because deploys are not atomic.',
            },
            {
              title: 'Compare the alternative and close',
              body: '*"zod-first contracts when one team owns both ends; OpenAPI codegen when external or multi-language clients consume the API."*',
            },
          ],
          keyPoints: [
            'Dedicated contracts package with runtime schemas',
            'Wire format only; no ORM entities or Nest decorators',
            'API validates with the schema; UI types and optionally parses',
            'Workspace tooling + CI typecheck across apps',
            'Backward-compatible changes because deploys are not atomic',
            'OpenAPI codegen as the alternative for external consumers',
          ],
          pitfalls: [
            'Sharing ORM entity classes with the front end',
            'Assuming a shared type prevents runtime breakage across deploys',
          ],
          followUps: ['How would you version the contracts package if a mobile app also consumed it?'],
          personalAngle:
            'You worked as backend lead next to a senior frontend developer; describe how a shared contract would have changed (or did change) your API change process.',
          references: [
            { label: 'pnpm: Workspaces', url: 'https://pnpm.io/workspaces' },
            { label: 'TypeScript: Project References', url: 'https://www.typescriptlang.org/docs/handbook/project-references.html' },
          ],
        },
      ],
    },
  ],
}

export default track
