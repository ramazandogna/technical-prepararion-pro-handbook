import type { Track } from '@/types/content'

const track: Track = {
  id: 'databases',
  code: 'J',
  title: 'Databases',
  summary: 'SQL, indexing, transactions, isolation, data modelling, MongoDB and Redis.',
  rationale:
    'You have used PostgreSQL, MongoDB, Redis and Prisma in production, but interviews probe the internals behind them: why an index is or isn\'t used, what an isolation level actually prevents, and how a cache goes stale. Most backend and full-stack loops have at least one round that tests this.',
  icon: 'Database',
  phase: 2,
  modules: [
    {
      id: 'db-sql',
      title: 'SQL querying',
      summary: 'Joins, CTEs and window functions, the queries you write live.',
      questions: [
        {
          id: 'db-join-output',
          title: 'LEFT JOIN with a filter: predict the rows',
          type: 'output',
          difficulty: 'foundation',
          priority: 'must',
          tags: ['sql', 'joins', 'left-join', 'null'],
          estMinutes: 5,
          roles: ['backend', 'full-stack'],
          prompt: `Given the data below, **how many rows does each query return, and why do they differ?**`,
          code: {
            language: 'sql',
            source: `-- users:  (1,'Aya'), (2,'Ben'), (3,'Chen')
-- orders: (10, user_id 1, 'paid'), (11, user_id 1, 'refunded'), (12, user_id 2, 'refunded')

-- Q1
SELECT u.name, o.id FROM users u
LEFT JOIN orders o ON o.user_id = u.id AND o.status = 'paid';

-- Q2
SELECT u.name, o.id FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE o.status = 'paid';`,
          },
          hints: [
            'A LEFT JOIN keeps every left row; the ON condition only decides which right rows match.',
            'WHERE runs after the join. What is NULL = \'paid\'?',
          ],
          answer: `**Q1 returns 3 rows. Q2 returns 1 row.**

**Q1:** the status filter is in the **\`ON\` clause**, so it only decides which orders match. A \`LEFT JOIN\` keeps every user:

| name | id |
| --- | --- |
| Aya | 10 |
| Ben | NULL |
| Chen | NULL |

**Q2:** the join first produces Aya-10, Aya-11, Ben-12 and Chen-NULL. Then **\`WHERE o.status = 'paid'\`** filters the result. For Chen, \`NULL = 'paid'\` is **unknown**, not true, so the row is removed. Only \`Aya | 10\` remains. A filter on the right table in \`WHERE\` **turns the LEFT JOIN into an inner join**.

**Rule:** conditions that define *which right rows match* go in \`ON\`. Conditions on the final result go in \`WHERE\`. To find users **without** paid orders, use an anti-join:

\`\`\`sql
SELECT u.* FROM users u
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id AND o.status = 'paid');
\`\`\`

Prefer \`NOT EXISTS\` over \`NOT IN (subquery)\`: if the subquery returns any NULL, \`NOT IN\` matches nothing.`,
          keyPoints: [
            'ON filters the matching; WHERE filters the result',
            'WHERE on right table cancels LEFT JOIN semantics',
            'Three-valued logic: NULL comparisons are unknown',
            'NOT EXISTS for anti-joins; NOT IN trap with NULLs',
          ],
          pitfalls: ['Assuming both queries are equivalent', 'Using NOT IN with nullable subquery'],
          followUps: ['Rewrite Q2 to also show users with no paid orders as NULL.'],
          references: [{ label: 'PostgreSQL docs: Joined tables', url: 'https://www.postgresql.org/docs/current/queries-table-expressions.html' }],
        },
        {
          id: 'db-window-functions-cte',
          title: 'Top N per group with CTEs and window functions',
          type: 'coding',
          difficulty: 'core',
          priority: 'must',
          tags: ['sql', 'window-functions', 'cte', 'row-number', 'top-n'],
          estMinutes: 15,
          roles: ['backend', 'full-stack'],
          prompt: `Table \`orders(id, customer_id, total, created_at)\`. Write a query returning **each customer's 3 most recent orders**, plus a column with that customer's **running total** of spend in chronological order. Explain \`ROW_NUMBER\` vs \`RANK\` vs \`DENSE_RANK\`.`,
          hints: [
            'You need a ranking per customer: PARTITION BY.',
            'You cannot filter on a window function in WHERE of the same query level.',
            'Running total = SUM() OVER with an ORDER BY.',
          ],
          answer: `Compute the window values in a **CTE**, then filter in the outer query. Window functions are evaluated **after** \`WHERE\`, so you can't filter on them at the same level.

\`\`\`sql
WITH ranked AS (
  SELECT
    o.*,
    ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC, id DESC) AS rn,
    SUM(total)   OVER (PARTITION BY customer_id ORDER BY created_at, id
                       ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total
  FROM orders o
)
SELECT customer_id, id, total, created_at, running_total
FROM ranked
WHERE rn <= 3
ORDER BY customer_id, created_at DESC;
\`\`\`

**How it works:** \`PARTITION BY\` restarts the calculation per customer. Unlike \`GROUP BY\`, **rows aren't collapsed**. The running total is computed over **all** of the customer's orders before the filter, which is usually what you want.

**Frame detail:** with \`ORDER BY\`, the default frame is \`RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\`, which includes **ties** (peers with the same \`created_at\`). Explicit \`ROWS\` plus a tie-breaker gives a deterministic running sum.

**Ranking functions** for values 100, 90, 90, 80:
- \`ROW_NUMBER\`: 1, 2, 3, 4. Unique; ties broken arbitrarily unless the order is total.
- \`RANK\`: 1, 2, 2, 4. Gaps after ties.
- \`DENSE_RANK\`: 1, 2, 2, 3. No gaps.

**Performance:** an index on \`(customer_id, created_at DESC, id DESC)\` lets PostgreSQL avoid a sort. For "top N per group" over a few customers, a \`LATERAL\` join with \`LIMIT 3\` per customer can be faster still.`,
          keyPoints: [
            'PARTITION BY + ORDER BY inside OVER()',
            'Filter window results in an outer query/CTE',
            'Knows ROW_NUMBER / RANK / DENSE_RANK differences',
            'Frame clause: ROWS vs default RANGE with ties',
            'Supporting index or LATERAL alternative',
          ],
          pitfalls: ['Using WHERE rn <= 3 in the same SELECT', 'Using GROUP BY and losing row detail'],
          followUps: ['Rewrite with a LATERAL join. When is it faster?'],
          references: [{ label: 'PostgreSQL docs: Window functions', url: 'https://www.postgresql.org/docs/current/tutorial-window.html' }],
        },
      ],
    },
    {
      id: 'db-indexing-performance',
      title: 'Indexes & query optimization',
      summary: 'B-trees, composite indexes, EXPLAIN ANALYZE and the N+1 problem.',
      questions: [
        {
          id: 'db-btree-composite-index',
          title: 'B-tree and composite indexes: the leftmost prefix',
          type: 'concept',
          difficulty: 'core',
          priority: 'must',
          tags: ['indexes', 'b-tree', 'composite-index', 'postgresql'],
          estMinutes: 6,
          roles: ['backend', 'full-stack'],
          prompt: `You have \`CREATE INDEX ON orders (customer_id, status, created_at)\`. **Which of these queries can use it efficiently, and why?** Then explain how a B-tree index works and what indexes cost.`,
          code: {
            language: 'sql',
            source: `-- A
SELECT * FROM orders WHERE customer_id = 42 AND status = 'paid';
-- B
SELECT * FROM orders WHERE status = 'paid';
-- C
SELECT * FROM orders WHERE customer_id = 42 ORDER BY created_at DESC LIMIT 10;
-- D
SELECT * FROM orders WHERE customer_id = 42 AND status = 'paid' AND created_at > now() - interval '7 days';
-- E
SELECT * FROM orders WHERE lower(status) = 'paid' AND customer_id = 42;`,
          },
          hints: [
            'Think of a phone book sorted by last name, then first name.',
            'Equality columns first, then range or sort.',
            'Is the index sorted by created_at within a customer when status is not fixed?',
          ],
          answer: `A **B-tree** keeps keys **sorted** in a balanced tree of pages. Lookups, range scans and ordered reads are O(log n) to find the start and then sequential along the leaf pages. A composite index is sorted by \`customer_id\`, then \`status\` within that, then \`created_at\` within that. It can only seek on a **leftmost prefix** of its columns.

- **A, yes:** equality on the first two columns, a tight range.
- **B, not efficiently:** \`status\` isn't a leftmost prefix. Rows with \`'paid'\` are scattered across every customer. PostgreSQL may do a sequential scan, or occasionally a full index scan. Since PostgreSQL 18 a **skip scan** can help when the leading column has few distinct values, but don't rely on it.
- **C, partially:** it seeks to \`customer_id = 42\`, but within that range rows are ordered by \`status\` first, so it **must sort** by \`created_at\`. An index on \`(customer_id, created_at)\` would serve this \`ORDER BY … LIMIT\` with no sort.
- **D, yes, fully:** equality, equality, then a **range on the last column**. This is the ideal "equality first, range last" shape.
- **E, partially:** \`customer_id = 42\` can use the index, but \`lower(status)\` can't match the \`status\` column. You'd need an expression index on \`(lower(status))\`.

**Costs of indexes:** every \`INSERT\`/\`UPDATE\`/\`DELETE\` must update each index (write amplification, WAL volume, and fewer HOT updates). They take disk and cache space, and the planner has more options to weigh. Unused indexes are pure cost; check \`pg_stat_user_indexes\`.

**Tools:** \`INCLUDE\` columns for **index-only scans**, **partial indexes** (\`WHERE status = 'pending'\`), and \`CREATE INDEX CONCURRENTLY\` in production to avoid blocking writes.`,
          keyPoints: [
            'Sorted balanced tree; O(log n) seek + leaf range scan',
            'Leftmost prefix rule',
            'Equality columns first, range/sort column last',
            'Functions on columns defeat plain indexes (use expression index)',
            'Write cost of indexes; CONCURRENTLY; partial/covering indexes',
          ],
          pitfalls: [
            'Saying column order in a composite index does not matter',
            'Adding an index per column instead of one composite index',
          ],
          followUps: ['When would the planner ignore a perfectly good index?'],
          references: [{ label: 'PostgreSQL docs: Multicolumn indexes', url: 'https://www.postgresql.org/docs/current/indexes-multicolumn.html' }],
        },
        {
          id: 'db-explain-analyze',
          title: 'Reading EXPLAIN ANALYZE to fix a slow query',
          type: 'debugging',
          difficulty: 'advanced',
          priority: 'should',
          tags: ['explain', 'query-optimization', 'postgresql', 'performance'],
          estMinutes: 8,
          roles: ['backend'],
          prompt: `This query takes 2.4 s. Read the plan: **what is wrong, and what would you change?**`,
          code: {
            language: 'plaintext',
            source: `EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM events WHERE account_id = 7 AND created_at > now() - interval '1 day';

Seq Scan on events  (cost=0.00..412000.00 rows=120 width=96)
                    (actual time=0.03..2398.1 rows=58210 loops=1)
  Filter: ((account_id = 7) AND (created_at > (now() - '1 day'::interval)))
  Rows Removed by Filter: 15941790
  Buffers: shared hit=1200 read=210800
Planning Time: 0.2 ms
Execution Time: 2405.3 ms`,
          },
          hints: [
            'Compare estimated rows with actual rows.',
            'How many rows were read to return 58k?',
            'Is there an index for this filter, and are statistics fresh?',
          ],
          answer: `**Diagnosis:**
1. **Seq Scan** over about 16 M rows to return 58 k: "Rows Removed by Filter: 15,941,790". About 99.6% of the work is wasted.
2. **Estimate vs actual: 120 vs 58,210 rows**, a 485× misestimate. The planner's statistics are stale or can't capture the correlation between \`account_id\` and recent \`created_at\`.
3. **Buffers read=210,800** means most pages came from disk or the OS cache rather than shared buffers. The scan is I/O-bound.

**Fixes, in order:**

\`\`\`sql
-- 1. an index that matches: equality first, range last
CREATE INDEX CONCURRENTLY events_account_created_idx ON events (account_id, created_at);

-- 2. refresh statistics (autovacuum may lag on big, append-heavy tables)
ANALYZE events;

-- 3. optionally, extended stats for correlated columns
CREATE STATISTICS events_acct_time (dependencies) ON account_id, created_at FROM events;
\`\`\`

Re-run \`EXPLAIN (ANALYZE, BUFFERS)\`. You want an **Index Scan** or **Bitmap Index Scan** on the new index with estimates within a small factor of actual. Also:
- Select only the needed columns instead of \`*\`. A covering index with \`INCLUDE\` may then give an **index-only scan**.
- For a huge time-series table, consider **range partitioning by \`created_at\`** so old partitions are pruned, or a **BRIN** index if rows are physically in time order.

**How to read plans generally:** read inside-out. Compare \`rows\` estimates with actuals, multiply per-loop times by \`loops\` (the nested-loop trap), and look for unexpected Seq Scans, Sorts spilling to disk ("external merge"), and Hash joins exceeding \`work_mem\`. Plain \`EXPLAIN\` shows only estimates. \`ANALYZE\` actually executes the query, so wrap writes in a transaction you roll back.`,
          keyPoints: [
            'Spots seq scan + huge Rows Removed by Filter',
            'Compares estimated vs actual rows (stale stats)',
            'Composite index (account_id, created_at), CONCURRENTLY',
            'ANALYZE / extended statistics',
            'Knows EXPLAIN vs EXPLAIN ANALYZE (executes!)',
          ],
          pitfalls: ['Running EXPLAIN ANALYZE on a DELETE in production without a transaction', 'Indexing created_at alone'],
          followUps: ['When is a sequential scan actually the best plan?'],
          references: [{ label: 'PostgreSQL docs: Using EXPLAIN', url: 'https://www.postgresql.org/docs/current/using-explain.html' }],
        },
        {
          id: 'db-n-plus-one-prisma',
          title: 'The N+1 query problem (Prisma)',
          type: 'debugging',
          difficulty: 'core',
          priority: 'must',
          tags: ['n-plus-one', 'prisma', 'orm', 'performance'],
          estMinutes: 6,
          roles: ['backend', 'full-stack'],
          prompt: `This endpoint gets slower as the number of posts grows. **What's the problem and how do you fix it in Prisma?** How would you catch it before production?`,
          code: {
            language: 'typescript',
            source: `const posts = await prisma.post.findMany({ where: { published: true }, take: 50 })
const result = await Promise.all(
  posts.map(async (p) => ({
    ...p,
    author: await prisma.user.findUnique({ where: { id: p.authorId } }),
    commentCount: await prisma.comment.count({ where: { postId: p.id } }),
  })),
)`,
          },
          hints: [
            'Count the queries for 50 posts.',
            'Let the ORM fetch relations in a batch.',
          ],
          answer: `This is the **N+1 problem**: 1 query for the posts plus **2 per post**, so **101 queries** for 50 posts. Each one pays a network round trip and a pool checkout. \`Promise.all\` makes them concurrent, but they still exhaust the connection pool and swamp the database under load.

**Fix: load the relations in the same request.**

\`\`\`ts
const posts = await prisma.post.findMany({
  where: { published: true },
  take: 50,
  include: {
    author: { select: { id: true, name: true } },
    _count: { select: { comments: true } },
  },
})
\`\`\`

Prisma resolves \`include\` with a **batched \`WHERE id IN (…)\` query per relation** or, with the relation-joins strategy (\`relationLoadStrategy: 'join'\`), a single query using JOINs and JSON aggregation. That's 1–3 queries regardless of N. \`_count\` becomes one grouped count.

**Other approaches:**
- \`select\` only the fields you need (avoids over-fetching large columns).
- In GraphQL resolvers, where N+1 is natural, use **DataLoader** to batch per tick. Prisma's \`findUnique\` is batched automatically within the same tick.
- For complex aggregates, write one raw SQL query with \`JOIN\` and \`GROUP BY\` (\`prisma.$queryRaw\` or TypedSQL).

**Catching it early:**
- Turn on query logging (\`new PrismaClient({ log: ['query'] })\`) in development and look at the count per request.
- Use APM or OpenTelemetry tracing, where database spans fan out per request.
- Add tests that assert an upper bound on queries per endpoint.`,
          keyPoints: [
            'Counts 1 + 2N queries',
            'include/select with _count to batch',
            'Prisma batches via IN() or join strategy',
            'DataLoader for GraphQL',
            'Detect via query logs / tracing',
          ],
          pitfalls: ['Thinking Promise.all fixes N+1', 'Over-including entire relation trees'],
          followUps: ['How would you paginate comments per post without N+1?'],
          personalAngle:
            'Your matching logic over thousands of scraped records is a natural setting. Explain how you loaded related data in batches instead of per record.',
          references: [{ label: 'Prisma docs: Query optimization', url: 'https://www.prisma.io/docs/orm/prisma-client/queries/query-optimization-performance' }],
        },
      ],
    },
    {
      id: 'db-transactions',
      title: 'Transactions, isolation & concurrency',
      summary: 'ACID, isolation anomalies, MVCC, locks and connection pooling.',
      questions: [
        {
          id: 'db-isolation-levels',
          title: 'Isolation levels and the anomalies they prevent',
          type: 'concept',
          difficulty: 'advanced',
          priority: 'must',
          tags: ['transactions', 'acid', 'isolation', 'mvcc', 'postgresql'],
          estMinutes: 8,
          roles: ['backend'],
          prompt: `Explain **ACID**, then the SQL **isolation levels** and the anomalies each permits. What does PostgreSQL use by default, and how does **MVCC** implement it?`,
          hints: [
            'Anomalies: dirty read, non-repeatable read, phantom, lost update, write skew.',
            'PostgreSQL never allows dirty reads, even at READ UNCOMMITTED.',
            'MVCC readers see a snapshot; when is that snapshot taken?',
          ],
          answer: `**ACID:**
- **Atomicity**: all or nothing (rollback on failure).
- **Consistency**: constraints hold before and after.
- **Isolation**: concurrent transactions behave as if run in some order, to the degree the level promises.
- **Durability**: once committed, the data survives a crash (via the WAL).

**Anomalies:**
- **Dirty read**: seeing uncommitted data.
- **Non-repeatable read**: re-reading a row gives a different value.
- **Phantom**: re-running a range query returns new rows.
- **Lost update**: two read-modify-writes, one overwrites the other.
- **Write skew**: two transactions read overlapping data and write different rows, breaking an invariant (for example, two doctors both go off call).

| Level | PostgreSQL behaviour |
| --- | --- |
| Read Uncommitted | Treated as Read Committed (no dirty reads) |
| **Read Committed** (default) | Each **statement** sees a fresh snapshot. Non-repeatable reads, phantoms and lost updates are possible |
| Repeatable Read | One snapshot for the **whole transaction**. Prevents non-repeatable reads and phantoms. A concurrent update of the same row fails with a serialization error. Write skew is still possible |
| Serializable | SSI detects dangerous read/write dependencies and aborts one transaction. No anomalies |

**MVCC:** an update writes a **new row version**. Each version carries \`xmin\`/\`xmax\` transaction IDs, and a reader's snapshot decides which versions are visible. **Readers don't block writers and writers don't block readers.** Only writers to the *same row* block each other. Old versions are cleaned up by **VACUUM**. Long-running transactions hold back that cleanup and cause bloat.

**Practical guidance:** stay on Read Committed, and fix lost updates with an atomic \`UPDATE … SET stock = stock - 1 WHERE stock > 0\`, \`SELECT … FOR UPDATE\`, or optimistic version columns. Use Serializable for complex invariants, and **retry on SQLSTATE 40001**.`,
          keyPoints: [
            'ACID defined precisely',
            'Names anomalies including lost update and write skew',
            'Postgres default Read Committed; RU behaves as RC',
            'MVCC: row versions, snapshots, readers do not block writers',
            'Serializable requires retry on serialization failure',
          ],
          pitfalls: [
            'Claiming Repeatable Read in Postgres allows phantoms (it does not)',
            'Forgetting that Serializable needs application-level retries',
          ],
          followUps: ['How would you implement a seat reservation without overselling?'],
          references: [{ label: 'PostgreSQL docs: Transaction isolation', url: 'https://www.postgresql.org/docs/current/transaction-iso.html' }],
        },
        {
          id: 'db-locks-deadlocks',
          title: 'Locks and deadlocks',
          type: 'multiple-choice',
          difficulty: 'core',
          priority: 'should',
          tags: ['locks', 'deadlock', 'transactions', 'postgresql'],
          estMinutes: 4,
          roles: ['backend'],
          prompt: `Two transfer jobs run concurrently. Job 1 does \`UPDATE accounts … WHERE id = 1\` then \`… WHERE id = 2\`. Job 2 updates id 2 and then id 1. Occasionally one fails with **"deadlock detected"**. **Which fixes are correct?** Select all that apply.`,
          choices: [
            { id: 'a', text: 'Always lock rows in a consistent order (e.g. by ascending id)', correct: true, explanation: 'Consistent ordering removes the circular wait.' },
            { id: 'b', text: 'Raise the isolation level to SERIALIZABLE', correct: false, explanation: 'Row locks are still taken; you also add serialization failures.' },
            { id: 'c', text: 'Retry the aborted transaction, since the database chose it as the victim', correct: true, explanation: 'Postgres aborts one participant; retrying with backoff is the expected handling.' },
            { id: 'd', text: 'Keep transactions short and avoid user/network waits while holding locks', correct: true, explanation: 'Less lock time means fewer collisions.' },
            { id: 'e', text: 'Remove the transaction so each UPDATE autocommits', correct: false, explanation: 'Avoids the deadlock but breaks atomicity of the transfer.' },
          ],
          hints: ['A deadlock needs a cycle in the wait-for graph.'],
          answer: `**a, c and d.**

A **deadlock** is a cycle in the waits-for graph. Job 1 holds the lock on row 1 and waits for row 2, while Job 2 holds row 2 and waits for row 1. PostgreSQL checks for cycles after \`deadlock_timeout\` (1 s by default) and **aborts one transaction** with SQLSTATE \`40P01\`.

**Fixes:**
- **Consistent lock ordering** removes the cycle:
  \`\`\`sql
  SELECT * FROM accounts WHERE id IN ($1, $2) ORDER BY id FOR UPDATE;
  \`\`\`
- **Retry** deadlock and serialization failures with backoff. Treat it as a normal concurrency outcome.
- **Short transactions**: never call external APIs or wait for user input while holding locks.

**Lock basics:** \`UPDATE\`/\`DELETE\`/\`SELECT … FOR UPDATE\` take **row locks**. Plain \`SELECT\`s take none, thanks to MVCC. DDL such as \`ALTER TABLE\` takes **table locks** and can queue behind long queries, blocking everyone else. Use \`lock_timeout\` for migrations. \`FOR UPDATE SKIP LOCKED\` gives a simple, safe job queue in Postgres.

Option e removes atomicity: a crash between the two updates loses money.`,
          keyPoints: [
            'Deadlock = circular wait',
            'Consistent lock ordering',
            'DB picks a victim; retry with backoff',
            'Short transactions; no external calls while holding locks',
            'SKIP LOCKED for job queues',
          ],
          pitfalls: ['Thinking higher isolation prevents deadlocks'],
          references: [{ label: 'PostgreSQL docs: Explicit locking', url: 'https://www.postgresql.org/docs/current/explicit-locking.html' }],
        },
        {
          id: 'db-connection-pooling',
          title: 'Connection pooling',
          type: 'tradeoff',
          difficulty: 'core',
          priority: 'should',
          tags: ['connection-pool', 'pgbouncer', 'postgresql', 'serverless'],
          estMinutes: 5,
          roles: ['backend', 'full-stack'],
          prompt: `After scaling from 2 to 20 Node instances, PostgreSQL starts rejecting connections: **"sorry, too many clients already."** Why, and how do you fix it?`,
          hints: [
            'Each Postgres connection is a process.',
            'Multiply per-instance pool size by instance count.',
          ],
          answer: `Each PostgreSQL connection is a **separate backend process** using several MB of RAM, and \`max_connections\` is commonly 100. Every Node instance has its own pool (Prisma's default is \`num_cpus * 2 + 1\`; \`pg\` defaults to 10). With 20 instances × 10 that's 200 connections, before migrations, cron jobs and admin tools. More connections than CPU cores also **reduces** throughput through contention.

**Fixes:**
1. **Size pools deliberately**: total = instances × pool size, which must stay below \`max_connections\` with headroom. A small pool per instance (5–10) is usually enough, because queries should take milliseconds.
2. **Add a server-side pooler** such as **PgBouncer** (or a managed one like RDS Proxy or Supabase Supavisor) in **transaction mode**. Thousands of client connections are multiplexed onto a few dozen real ones. Caveats: session state doesn't survive between transactions (\`SET\`, advisory locks, \`LISTEN\`), and prepared statements need pooler support. With Prisma, use \`pgbouncer=true\` or a recent version that supports it, plus a direct URL for migrations.
3. **Serverless functions** each open their own connection, which explodes under bursts. Use a pooler or an HTTP-based driver.
4. **Hold connections briefly**: no long transactions, always release in \`finally\`, and set \`statement_timeout\` and \`idle_in_transaction_session_timeout\`.

**Signals:** the app waits on pool checkout (p99 latency rises while the database CPU stays low), and \`pg_stat_activity\` shows many \`idle in transaction\` sessions.`,
          keyPoints: [
            'Connection = process; max_connections limit',
            'Total = instances × pool size',
            'PgBouncer transaction mode and its caveats',
            'Serverless connection storms',
            'Short transactions, release in finally, timeouts',
          ],
          pitfalls: ['Raising max_connections to 2000 as the fix', 'Making the pool huge per instance'],
          personalAngle:
            'If you scaled the accessibility platform with Docker containers, explain how you sized pools per container and what you would add (PgBouncer) as instances grow.',
          references: [{ label: 'PostgreSQL docs: Connections and authentication', url: 'https://www.postgresql.org/docs/current/runtime-config-connection.html' }],
        },
      ],
    },
    {
      id: 'db-modelling-nosql-cache',
      title: 'Modelling, MongoDB & Redis caching',
      summary: 'Normalization trade-offs, document modelling, Redis structures and cache invalidation.',
      questions: [
        {
          id: 'db-normalization-mongo-modelling',
          title: 'Normalization vs denormalization; modelling in MongoDB',
          type: 'tradeoff',
          difficulty: 'core',
          priority: 'should',
          tags: ['normalization', 'denormalization', 'mongodb', 'data-modelling'],
          estMinutes: 7,
          roles: ['backend', 'full-stack'],
          prompt: `Model **blog posts with comments and authors** in PostgreSQL and in MongoDB. When do you denormalize, and when would you embed vs reference in MongoDB?`,
          hints: [
            'Normalization removes duplication so each fact has one home.',
            'MongoDB: model for your access pattern; mind the 16 MB document limit and unbounded arrays.',
          ],
          answer: `**Relational (normalized, roughly 3NF):** \`users(id, name)\`, \`posts(id, author_id → users, title, body)\`, \`comments(id, post_id → posts, author_id → users, body, created_at)\`. Each fact lives in **one place**, so updates are cheap and anomaly-free, and integrity is enforced with foreign keys. Reads need joins.

**Denormalize when reads dominate and measurements show joins or aggregates are the bottleneck**: a \`comment_count\` column on \`posts\`, an author name snapshot on an order (a historical fact, so duplication is *correct*), or materialized views for dashboards. The cost is keeping copies in sync (triggers, the same transaction, or async jobs) and the risk of drift.

**MongoDB: model for the access pattern.**
- **Embed** when data is read together, owned by the parent, and **bounded**: a post with its tags, or an order with its line items.
- **Reference** when data is shared, updated independently, or **unbounded**: authors (shared across posts), and comments (they can grow without limit; documents max out at **16 MB**, and large arrays are expensive to update).
- **Hybrid patterns**: embed the **latest N comments** in the post for the first page and keep all comments in a separate collection (the subset pattern). Embed \`{ _id, name, avatar }\` of the author as an **extended reference** and accept occasional staleness.

\`\`\`js
// posts
{ _id, title, body, author: { _id, name }, tags: ['db'], commentCount: 132,
  recentComments: [{ _id, author: { _id, name }, body, createdAt }] } // capped at 5
// comments
{ _id, postId, author: { _id, name }, body, createdAt }  // index { postId: 1, createdAt: -1 }
\`\`\`

**Choosing the database:** relational for strong integrity, ad-hoc queries and multi-entity transactions. Documents for flexible schemas and aggregate-shaped reads. MongoDB supports multi-document transactions, but needing them often is a sign of a relational model.`,
          keyPoints: [
            'Normalization: single source of truth, FK integrity',
            'Denormalize for measured read hot paths; sync cost',
            'Embed bounded, owned, co-read data',
            'Reference shared/unbounded data; 16 MB limit',
            'Subset / extended reference patterns',
          ],
          pitfalls: ['Embedding unbounded comment arrays', 'Saying MongoDB has no schema design'],
          followUps: ['How do you keep the denormalized author name in sync?'],
          personalAngle:
            'You have used both PostgreSQL and MongoDB. Pick one real entity from Scrape & Compare or the C2C marketplace and explain why it lived where it did.',
          references: [{ label: 'MongoDB docs: Data modeling', url: 'https://www.mongodb.com/docs/manual/data-modeling/' }],
        },
        {
          id: 'db-redis-caching-invalidation',
          title: 'Redis data structures, caching patterns and invalidation',
          type: 'system-design',
          difficulty: 'advanced',
          priority: 'must',
          tags: ['redis', 'caching', 'cache-aside', 'invalidation', 'ttl', 'stampede'],
          estMinutes: 10,
          roles: ['backend', 'full-stack'],
          prompt: `Product pages hit PostgreSQL hard. Design a **Redis cache**: which pattern, which data structures, how you **invalidate**, how you pick **TTLs**, and what happens when a hot key expires.`,
          hints: [
            'Cache-aside is the default; compare it with write-through.',
            'Delete on write vs update on write: which is safer under races?',
            'A popular key expiring sends many concurrent misses to the database.',
          ],
          answer: `**Pattern: cache-aside (lazy loading).** On read, try Redis; on a miss, read the database, then \`SET key value EX ttl\`. On write, **update the database, then delete the key**.

\`\`\`ts
async function getProduct(id: string) {
  const key = 'product:v1:' + id
  const hit = await redis.get(key)
  if (hit) return JSON.parse(hit)
  const row = await db.product.findUnique({ where: { id } })
  await redis.set(key, JSON.stringify(row), 'EX', 300 + Math.floor(Math.random() * 60)) // jittered TTL
  return row
}
async function updateProduct(id: string, data: ProductInput) {
  await db.product.update({ where: { id }, data })
  await redis.del('product:v1:' + id)
}
\`\`\`

**Why delete rather than set on write:** two concurrent writers updating the cache can leave the *older* value in place. Deleting forces the next read to load the current row. A small race remains (a reader loads an old row just before the delete, then sets it), which **TTL bounds**. Write-through (write cache and database together) keeps the cache warm but caches data nobody reads. Write-behind risks data loss.

**Data structures:** **strings** for serialized objects. **Hashes** for objects with field-level updates. **Sorted sets** for leaderboards, "top products" and sliding-window rate limits. **Sets** for tags and membership. **Lists/Streams** for queues (BullMQ uses lists, sorted sets and streams). **HyperLogLog** for approximate unique counts.

**TTL:** this is your staleness budget. Choose it per data type (prices short, categories long) and **add jitter** so keys don't expire together. Configure \`maxmemory\` with an eviction policy (\`allkeys-lru\` or \`allkeys-lfu\`) for a pure cache.

**Hot key expiry (cache stampede):** many concurrent misses all hit the database. Mitigations:
- **Single-flight lock**: \`SET lock:key 1 NX PX 5000\`. One request rebuilds while others wait briefly or serve stale data.
- **Stale-while-revalidate**: store a soft expiry inside the value, refresh in the background, and keep serving the old value.
- **Early probabilistic refresh** before the TTL.

**Also mention:** version the key prefix (\`v1\`) to invalidate everything on a schema change, cache negative results briefly (prevents miss floods for nonexistent IDs), and remember the database is the source of truth. The system must survive Redis being down.`,
          keyPoints: [
            'Cache-aside read path; DB then delete on write',
            'Why delete beats set (race), TTL as safety net',
            'Appropriate Redis structures per use case',
            'Jittered TTLs, eviction policy',
            'Stampede protection: lock, SWR, early refresh',
            'Negative caching, key versioning, Redis-down behaviour',
          ],
          pitfalls: [
            'Updating cache before the DB commit',
            'No TTL (stale forever on missed invalidation)',
            'Using KEYS * in production to invalidate',
          ],
          followUps: ['How would you invalidate a list cache like "products in category X"?', 'Redis persistence: RDB vs AOF?'],
          personalAngle:
            'You used Redis with scheduled scraping jobs. Contrast Redis as a job store (BullMQ, needs persistence) with Redis as a disposable cache (eviction allowed), and how you configured each.',
          references: [{ label: 'Redis docs: Data types', url: 'https://redis.io/docs/latest/develop/data-types/' }],
        },
      ],
    },
  ],
}

export default track
