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
          intent: `Tests whether you know where a predicate runs in a LEFT JOIN and how SQL three-valued logic treats NULL. A strong answer gives both row counts, explains that WHERE on the right table turns the outer join into an inner join, and shows the correct anti-join.`,
          hints: [
            `A LEFT JOIN keeps every row from the left table. The ON condition only decides which right rows attach to it.`,
            `WHERE runs after the join has produced its rows. For a user with no matching order, what is the value of o.status?`,
            `NULL = 'paid' is not false, it is unknown, and WHERE keeps only rows that are true. Count which users survive in each query.`,
            `Q1: Aya-10, Ben-NULL, Chen-NULL (3 rows). Q2: the join gives Aya-10, Aya-11, Ben-12, Chen-NULL; only Aya-10 has status 'paid' (1 row).`,
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
          walkthrough: [
            {
              title: 'Name what is being asked',
              body: `Two queries differ only in **where the \`status = 'paid'\` filter sits**: in the \`ON\` clause or in \`WHERE\`. The interviewer wants row counts and the reason, not just "they differ".`,
            },
            {
              title: 'Apply the logical order: FROM/JOIN, then WHERE',
              body: `A \`LEFT JOIN\` first pairs each user with matching orders and pads users without a match with NULLs. Only then does \`WHERE\` filter. In Q1 the filter is part of the match, so non-matching users are padded, not removed. In Q2 the filter runs on the joined result.`,
            },
            {
              title: 'Work the data',
              body: `**Q1 → 3 rows:** Aya-10, Ben-NULL, Chen-NULL.

**Q2 → 1 row:** the join yields Aya-10, Aya-11, Ben-12, Chen-NULL. \`WHERE o.status = 'paid'\` keeps only Aya-10, because \`NULL = 'paid'\` is **unknown** and unknown rows are dropped. A WHERE on the right table effectively makes it an inner join.`,
            },
            {
              title: 'Cover the edge case: anti-joins and NOT IN',
              body: `To find users **without** a paid order, use \`NOT EXISTS\`:

\`\`\`sql
SELECT u.* FROM users u
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id AND o.status = 'paid');
\`\`\`

Avoid \`NOT IN (subquery)\`: one NULL in the subquery makes the whole predicate unknown, so it returns nothing.`,
            },
            {
              title: 'Say it in 30 seconds',
              body: `"Q1 returns 3, Q2 returns 1. ON decides which right rows match, so every user stays. WHERE filters after the join, and for unmatched users \`o.status\` is NULL, which is unknown, so they disappear. Filters on the optional side belong in ON; for 'users without X' I use NOT EXISTS."`,
            },
          ],
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
          intent: `Tests fluency with window functions, the most common "write SQL live" topic for backend roles. A strong answer partitions per customer, filters the rank in an outer query, defines a deterministic running total, and can explain the three ranking functions and the supporting index.`,
          hints: [
            `You need a ranking that restarts for each customer. Which clause inside OVER() does that?`,
            `Window functions are evaluated after WHERE, so you cannot filter on rn in the same SELECT. Wrap it in a CTE or subquery.`,
            `The running total is SUM(total) OVER (PARTITION BY customer_id ORDER BY created_at, id). Think about ties in created_at and the default frame.`,
            `Skeleton: WITH ranked AS (SELECT o.*, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC, id DESC) rn, SUM(total) OVER (PARTITION BY customer_id ORDER BY created_at, id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) running_total FROM orders o) SELECT ... FROM ranked WHERE rn <= 3.`,
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
          walkthrough: [
            {
              title: 'Restate the task',
              body: `Per customer: keep the **3 newest orders**, and on each row show the **running total of all their spend in chronological order**. Then compare ROW_NUMBER, RANK and DENSE_RANK. Two separate window computations with different orderings.`,
            },
            {
              title: 'Know the mechanism: windows do not collapse rows',
              body: `\`OVER (PARTITION BY customer_id ORDER BY ...)\` computes a value per row within its customer's group, unlike \`GROUP BY\`. Window functions run **after WHERE**, so a filter on the rank needs an outer query.`,
            },
            {
              title: 'Write the query',
              body: `\`\`\`sql
WITH ranked AS (
  SELECT o.*,
    ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC, id DESC) AS rn,
    SUM(total)   OVER (PARTITION BY customer_id ORDER BY created_at, id
                       ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total
  FROM orders o
)
SELECT customer_id, id, total, created_at, running_total
FROM ranked WHERE rn <= 3
ORDER BY customer_id, created_at DESC;
\`\`\``,
            },
            {
              title: 'Handle ties, frames and performance',
              body: `- The default frame with ORDER BY is \`RANGE ... CURRENT ROW\`, which includes **peers with the same timestamp**. Explicit \`ROWS\` plus the \`id\` tie-breaker makes the sum deterministic.
- For 100, 90, 90, 80: ROW_NUMBER 1,2,3,4; RANK 1,2,2,4; DENSE_RANK 1,2,2,3.
- Index \`(customer_id, created_at DESC, id DESC)\` avoids the sort; for a few customers a \`LATERAL ... LIMIT 3\` join can be faster.`,
            },
            {
              title: 'Say it in 30 seconds',
              body: `"I compute ROW_NUMBER partitioned by customer ordered newest first, plus a SUM window ordered oldest first with an explicit ROWS frame, inside a CTE, then filter rn <= 3 outside because windows run after WHERE. ROW_NUMBER is unique, RANK leaves gaps on ties, DENSE_RANK does not. An index on customer and created_at removes the sort."`,
            },
          ],
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
          intent: `Tests whether you understand how a B-tree is ordered and can predict index use from column order, not from memorised rules. A strong answer classifies each query correctly with a reason, states "equality first, range or sort last", and names the write cost of indexes.`,
          hints: [
            `Think of a phone book sorted by last name, then first name. Which lookups are fast?`,
            `The index can only seek on a leftmost prefix: customer_id, then customer_id + status, then all three.`,
            `For query C, status is not fixed. Within customer 42, are rows ordered by created_at, or by status first?`,
            `A: yes. B: no (not a prefix). C: seek yes, but it must sort. D: yes, ideal (equality, equality, range). E: only customer_id is used; lower(status) needs an expression index.`,
          ],
          answer: `A **B-tree** keeps keys **sorted** in a balanced tree of pages. Lookups, range scans and ordered reads are O(log n) to find the start and then sequential along the leaf pages. A composite index is sorted by \`customer_id\`, then \`status\` within that, then \`created_at\` within that. It can only seek on a **leftmost prefix** of its columns.

- **A, yes:** equality on the first two columns, a tight range.
- **B, not efficiently:** \`status\` isn't a leftmost prefix. Rows with \`'paid'\` are scattered across every customer. PostgreSQL may do a sequential scan, or occasionally a full index scan. Since PostgreSQL 18 a **skip scan** can help when the leading column has few distinct values, but don't rely on it.
- **C, partially:** it seeks to \`customer_id = 42\`, but within that range rows are ordered by \`status\` first, so it **must sort** by \`created_at\`. An index on \`(customer_id, created_at)\` would serve this \`ORDER BY … LIMIT\` with no sort.
- **D, yes, fully:** equality, equality, then a **range on the last column**. This is the ideal "equality first, range last" shape.
- **E, partially:** \`customer_id = 42\` can use the index, but \`lower(status)\` can't match the \`status\` column. You'd need an expression index on \`(lower(status))\`.

**Costs of indexes:** every \`INSERT\`/\`UPDATE\`/\`DELETE\` must update each index (write amplification, WAL volume, and fewer HOT updates). They take disk and cache space, and the planner has more options to weigh. Unused indexes are pure cost; check \`pg_stat_user_indexes\`.

**Tools:** \`INCLUDE\` columns for **index-only scans**, **partial indexes** (\`WHERE status = 'pending'\`), and \`CREATE INDEX CONCURRENTLY\` in production to avoid blocking writes.`,
          walkthrough: [
            {
              title: 'Picture the sort order',
              body: `A composite B-tree on \`(customer_id, status, created_at)\` is one sorted list: by customer, then by status inside each customer, then by date inside each status. Lookups are O(log n) to find a start point, then a sequential walk along leaf pages.`,
            },
            {
              title: 'Apply the leftmost-prefix rule to each query',
              body: `- **A** (customer + status): leftmost prefix, tight range. Efficient.
- **B** (status only): not a prefix; 'paid' rows are scattered under every customer. Likely seq scan (PG 18 skip scan helps only with few distinct leading values).
- **C** (customer, ORDER BY created_at): seeks customer 42, but rows are ordered by status first, so it **sorts**. \`(customer_id, created_at)\` would avoid that.
- **D** (equality, equality, range on last column): the ideal shape.
- **E**: \`lower(status)\` does not match the indexed \`status\`; only \`customer_id\` helps.`,
            },
            {
              title: 'Give the rule and the fixes',
              body: `**Equality columns first, then the range or sort column.** Use an expression index for functions:

\`\`\`sql
CREATE INDEX CONCURRENTLY orders_cust_created ON orders (customer_id, created_at DESC);
CREATE INDEX CONCURRENTLY orders_lower_status ON orders (lower(status));
\`\`\``,
            },
            {
              title: 'Mention the costs and tools',
              body: `Every index slows INSERT/UPDATE/DELETE (write amplification, WAL, fewer HOT updates) and uses disk and cache. Find unused ones in \`pg_stat_user_indexes\`. Useful tools: \`INCLUDE\` for index-only scans, partial indexes (\`WHERE status = 'pending'\`), and \`CONCURRENTLY\` in production.`,
            },
            {
              title: 'Say it in 30 seconds',
              body: `"A composite B-tree is sorted by its columns left to right, so it only seeks on a leftmost prefix. A and D are efficient, D ideally because the range is on the last column. B can't seek, C seeks but sorts, and E needs an expression index. I put equality columns first and the range or sort column last, and I remember each index taxes writes."`,
            },
          ],
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
          intent: `Tests whether you can read a real query plan and reason from evidence to a fix. A strong answer spots the sequential scan and the wasted rows, notices the estimate-vs-actual gap, proposes the matching composite index plus fresh statistics, and says how to verify the fix.`,
          hints: [
            `Compare the estimated rows (rows=120) with the actual rows (rows=58210). What does a 485x gap say about the planner?`,
            `How many rows were read and thrown away to return 58k? Look at "Rows Removed by Filter".`,
            `The filter is equality on account_id plus a range on created_at. What index shape serves that, and how do you add it without blocking writes?`,
            `Fix: CREATE INDEX CONCURRENTLY ON events (account_id, created_at); then ANALYZE events; optionally CREATE STATISTICS on the correlated columns; re-run EXPLAIN (ANALYZE, BUFFERS) and expect an Index or Bitmap Index Scan.`,
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
          walkthrough: [
            {
              title: 'Read the plan top-down for red flags',
              body: `Three signals: a **Seq Scan** over ~16M rows; **Rows Removed by Filter: 15,941,790** to return 58k (99.6% wasted); and **Buffers read=210,800**, meaning most pages came from disk or the OS cache.`,
            },
            {
              title: 'Explain why the planner chose this',
              body: `It estimated **120 rows** but got **58,210**. With stale or uncorrelated statistics the planner thought the result was tiny, and with no index matching \`(account_id, created_at)\` a seq scan was its only option anyway.`,
            },
            {
              title: 'Apply the fix',
              body: `\`\`\`sql
CREATE INDEX CONCURRENTLY events_account_created_idx ON events (account_id, created_at);
ANALYZE events;
-- optional: correlated columns
CREATE STATISTICS events_acct_time (dependencies) ON account_id, created_at FROM events;
\`\`\`
Then re-run \`EXPLAIN (ANALYZE, BUFFERS)\` and expect an Index Scan or Bitmap Index Scan with estimates close to actuals.`,
            },
            {
              title: 'Go one level further',
              body: `- Select only needed columns; with \`INCLUDE\` you may get an index-only scan.
- Huge append-only time series: **range partitioning by created_at** or a **BRIN** index.
- \`EXPLAIN ANALYZE\` **executes** the statement: wrap writes in \`BEGIN ... ROLLBACK\`.
- When reading plans generally: multiply per-loop time by \`loops\`, and look for sorts spilling to disk.`,
            },
            {
              title: 'Say it in 30 seconds',
              body: `"It's a seq scan throwing away 99.6% of 16M rows, and the planner underestimated by 485x, so statistics are off. I'd add a concurrent composite index on account_id then created_at, run ANALYZE, maybe extended stats, and confirm with EXPLAIN ANALYZE BUFFERS that it becomes an index scan."`,
            },
          ],
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
          intent: `Tests whether you recognise the N+1 pattern in ORM code and know how your ORM batches relations. A strong answer counts the queries, explains why Promise.all is not a fix, rewrites it with include/select/_count, and describes how you would detect it before production.`,
          hints: [
            `Count the database round trips for 50 posts.`,
            `Promise.all makes the queries concurrent. Does it reduce their number, or the pool connections they need?`,
            `Prisma can load relations and counts as part of the findMany call. Which options do that?`,
            `Use findMany({ where, take: 50, include: { author: { select: { id: true, name: true } }, _count: { select: { comments: true } } } }), then enable query logging to confirm 1–3 queries.`,
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
          walkthrough: [
            {
              title: 'Name the problem and count it',
              body: `1 query for posts plus 2 per post: **101 queries for 50 posts**. Latency and load grow linearly with N. \`Promise.all\` only runs them concurrently, which **exhausts the connection pool** faster under traffic.`,
            },
            {
              title: 'Understand how the ORM batches',
              body: `With \`include\`, Prisma loads each relation with one batched \`WHERE id IN (...)\` query, or with \`relationLoadStrategy: 'join'\` a single JOIN plus JSON aggregation. \`_count\` becomes one grouped count. Query count no longer depends on N.`,
            },
            {
              title: 'Rewrite the code',
              body: `\`\`\`ts
const posts = await prisma.post.findMany({
  where: { published: true },
  take: 50,
  include: {
    author: { select: { id: true, name: true } },
    _count: { select: { comments: true } },
  },
})
\`\`\``,
            },
            {
              title: 'Cover the variants and detection',
              body: `- \`select\` only needed fields; avoid including deep trees.
- GraphQL resolvers: **DataLoader** batches per tick.
- Complex aggregates: one raw SQL query with JOIN + GROUP BY (\`$queryRaw\` or TypedSQL).
- Detect: \`log: ['query']\` in dev, OpenTelemetry spans per request, and a test asserting a max query count per endpoint.`,
            },
            {
              title: 'Say it in 30 seconds',
              body: `"That's N+1: 101 queries for 50 posts, and Promise.all just makes them hit the pool at once. I'd use include with a narrow select and _count, which Prisma resolves in a couple of batched queries. I catch it with query logging and tracing, and a test that bounds queries per request."`,
            },
          ],
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
          intent: `Tests whether you understand concurrency anomalies concretely, not just the names of isolation levels. A strong answer defines ACID precisely, maps each level to the anomalies it allows in PostgreSQL specifically, explains MVCC snapshots, and gives a practical fix for lost updates.`,
          hints: [
            `List the anomalies first: dirty read, non-repeatable read, phantom, lost update, write skew.`,
            `PostgreSQL never allows dirty reads, even if you ask for READ UNCOMMITTED. What is its default level?`,
            `Under MVCC, readers see a snapshot. Is it taken per statement or per transaction at each level?`,
            `Read Committed: snapshot per statement. Repeatable Read: one snapshot per transaction, no phantoms in PG, write skew still possible. Serializable: SSI aborts dangerous patterns, so retry on SQLSTATE 40001. Fix lost updates with atomic UPDATE ... SET x = x - 1 or SELECT ... FOR UPDATE.`,
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
          walkthrough: [
            {
              title: 'Define ACID precisely',
              body: `**Atomicity**: all or nothing. **Consistency**: constraints hold before and after. **Isolation**: concurrent transactions behave as if ordered, to the level promised. **Durability**: committed data survives a crash via the WAL.`,
            },
            {
              title: 'Name the anomalies with one example each',
              body: `Dirty read (uncommitted data), non-repeatable read (same row, new value), phantom (range query gains rows), **lost update** (two read-modify-writes, one wins), **write skew** (two doctors each see another on call and both go off call).`,
            },
            {
              title: 'Map the levels in PostgreSQL',
              body: `| Level | PostgreSQL |
| --- | --- |
| Read Uncommitted | behaves as Read Committed |
| **Read Committed** (default) | snapshot per **statement**; lost updates possible |
| Repeatable Read | snapshot per **transaction**; no phantoms; write skew possible |
| Serializable | SSI aborts dangerous dependencies; **retry on 40001** |`,
            },
            {
              title: 'Explain MVCC and the practical fixes',
              body: `Updates write **new row versions** tagged with \`xmin\`/\`xmax\`; a snapshot decides visibility, so **readers and writers don't block each other**. VACUUM removes dead versions; long transactions cause bloat.

Lost update fix on Read Committed:
\`\`\`sql
UPDATE products SET stock = stock - 1 WHERE id = $1 AND stock > 0;
\`\`\`
Or \`SELECT ... FOR UPDATE\`, or an optimistic \`version\` column.`,
            },
            {
              title: 'Say it in 30 seconds',
              body: `"Postgres defaults to Read Committed: each statement sees a fresh snapshot, so lost updates can happen. Repeatable Read pins one snapshot per transaction, Serializable adds SSI and you must retry 40001. MVCC keeps row versions so reads never block writes. In practice I stay on Read Committed and make updates atomic or lock with FOR UPDATE."`,
            },
          ],
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
          intent: `Tests whether you know what a deadlock is mechanically and how real systems handle it. A strong answer picks consistent lock ordering, retry of the victim and short transactions, and explains why higher isolation or dropping the transaction is wrong.`,
          hints: [
            `A deadlock needs a cycle in the wait-for graph. Draw who holds which row and who waits for which.`,
            `If both jobs lock rows in the same order, can a cycle form?`,
            `Postgres resolves deadlocks itself by aborting one transaction. What should the application do with that error?`,
            `Correct: consistent ordering (ORDER BY id FOR UPDATE), retry on 40P01 with backoff, and short transactions. Wrong: Serializable (still locks, adds failures) and autocommit (breaks atomicity).`,
          ],
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
          intent: `Tests whether you understand database connections as a scarce server resource and can reason about pool sizing when scaling horizontally. A strong answer does the instances × pool arithmetic, recommends small pools plus a server-side pooler, and names the pooler's caveats.`,
          hints: [
            `In PostgreSQL, each connection is a separate backend process. What does that cost?`,
            `Multiply the per-instance pool size by the number of instances, then add migrations, cron jobs and admin tools.`,
            `What sits between many app instances and Postgres to multiplex connections, and what breaks in transaction mode?`,
            `Size pools so instances × pool < max_connections with headroom (5–10 per instance), add PgBouncer or a managed pooler in transaction mode (watch SET, advisory locks, LISTEN, prepared statements), and set statement and idle-in-transaction timeouts.`,
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
        {
          id: 'db-upsert-race-condition',
          title: 'Debug: duplicate rows from check-then-insert',
          type: 'debugging',
          difficulty: 'core',
          priority: 'must',
          tags: ['race-condition', 'upsert', 'unique-constraint', 'on-conflict', 'prisma', 'idempotency'],
          estMinutes: 8,
          roles: ['backend', 'full-stack'],
          prompt: `Support reports that some tenants have **two "Slack" connections**, and the dashboard then shows a stale token. The endpoint is called when the user clicks "Connect", and the client retries on timeout. **Why does this happen, and how do you make it correct under concurrency?**`,
          code: {
            language: 'typescript',
            source: `// POST /integrations/:provider/connect
async function connectAccount(tenantId: string, provider: string, token: string) {
  const existing = await prisma.connection.findFirst({ where: { tenantId, provider } })
  if (existing) {
    return prisma.connection.update({ where: { id: existing.id }, data: { token } })
  }
  return prisma.connection.create({ data: { tenantId, provider, token } })
}`,
          },
          intent: `Tests whether you see a check-then-act race in innocent-looking ORM code and know that only the database can enforce uniqueness across concurrent requests. A strong answer explains the interleaving, adds a unique constraint, switches to an atomic upsert, and handles the leftover duplicates and the conflict error.`,
          hints: [
            `Imagine two requests for the same tenant arriving 5 ms apart (a double-click plus a retry). Walk through both calls line by line.`,
            `Both findFirst calls can return null before either create commits. Which layer is the only one that sees both inserts?`,
            `A unique constraint on (tenantId, provider) turns the race into an error. Then make the write itself atomic instead of read-then-write.`,
            `Add @@unique([tenantId, provider]) (after deduplicating existing rows), then use prisma.connection.upsert({ where: { tenantId_provider: { tenantId, provider } }, create: {...}, update: { token } }) or INSERT ... ON CONFLICT (tenant_id, provider) DO UPDATE SET token = EXCLUDED.token; catch P2002 and retry once as a fallback.`,
          ],
          answer: `**It is a check-then-act race.** Two requests for the same tenant interleave like this:

| Request A | Request B |
| --- | --- |
| \`findFirst\` → null | |
| | \`findFirst\` → null |
| \`create\` | |
| | \`create\` → **second row** |

Nothing in the database says "one connection per tenant and provider", so both inserts succeed. Afterwards \`findFirst\` returns whichever row comes first, and updates may go to the other one: hence the stale token. Wrapping the code in a transaction at Read Committed does **not** help, because neither transaction sees the other's uncommitted insert.

**Fix 1: let the database enforce the invariant.**
\`\`\`prisma
model Connection {
  id       String @id @default(cuid())
  tenantId String
  provider String
  token    String
  @@unique([tenantId, provider])
}
\`\`\`
Deduplicate existing rows first (keep the newest per pair), or the migration fails.

**Fix 2: make the write a single atomic statement.**
\`\`\`ts
return prisma.connection.upsert({
  where: { tenantId_provider: { tenantId, provider } },
  create: { tenantId, provider, token },
  update: { token },
})
\`\`\`
In raw SQL this is \`INSERT ... ON CONFLICT (tenant_id, provider) DO UPDATE SET token = EXCLUDED.token\`, which is race-free. Prisma sends a native \`ON CONFLICT\` upsert when the query meets its conditions (a single unique selector, no nested writes); otherwise it reads then writes, and a concurrent call can still fail with **\`P2002\` (unique violation)**. Catch it and retry once: the retry will take the update path.

**Alternatives when no natural unique key exists:** a transaction-scoped advisory lock (\`pg_advisory_xact_lock(hashtext(tenantId || provider))\`), or Serializable isolation with a retry on 40001.

**Same pattern elsewhere:** "create user if email not taken", "one active subscription per account", idempotency keys. The rule: **uniqueness is a database constraint, not an if statement.**`,
          walkthrough: [
            {
              title: 'Restate the symptom',
              body: `Duplicate rows for one \`(tenantId, provider)\` pair, produced by double-clicks and client retries, and stale reads afterwards. That combination points to **concurrent requests**, not a logic bug in one request.`,
            },
            {
              title: 'Show the interleaving',
              body: `Both requests run \`findFirst\` before either \`create\` commits, so both see null and both insert. The application cannot see the other request; only the database can. A transaction at Read Committed does not change this.`,
            },
            {
              title: 'Fix it with a constraint plus an atomic upsert',
              body: `\`\`\`prisma
@@unique([tenantId, provider])
\`\`\`
\`\`\`ts
await prisma.connection.upsert({
  where: { tenantId_provider: { tenantId, provider } },
  create: { tenantId, provider, token },
  update: { token },
})
\`\`\`
SQL equivalent: \`INSERT ... ON CONFLICT (tenant_id, provider) DO UPDATE SET token = EXCLUDED.token\`.`,
            },
            {
              title: 'Cover the edge cases',
              body: `- Clean up existing duplicates before adding the constraint (keep the newest).
- If Prisma falls back to read-then-write, catch **P2002** and retry once.
- No natural key? Use \`pg_advisory_xact_lock\` or Serializable with retries.
- Return the same response for a retried request so the client stays idempotent.`,
            },
            {
              title: 'Say it in 30 seconds',
              body: `"It's check-then-act: two requests both see no row and both insert. Only the database sees both, so I add a unique constraint on tenant and provider, dedupe existing data, and replace the read-then-write with an upsert, which is INSERT ON CONFLICT DO UPDATE. If the ORM can't do it natively I catch the unique violation and retry."`,
            },
          ],
          keyPoints: [
            'Identifies check-then-act race between concurrent requests',
            'Transactions at Read Committed do not prevent it',
            'Unique constraint as the source of truth for uniqueness',
            'Atomic upsert: INSERT ... ON CONFLICT DO UPDATE / Prisma upsert',
            'Handles existing duplicates and P2002 / unique-violation retries',
          ],
          pitfalls: [
            'Adding a mutex in Node memory (does not work across instances)',
            'Wrapping it in a transaction and assuming that fixes it',
            'Adding the unique constraint without cleaning existing duplicates first',
          ],
          followUps: ['How would you implement server-side idempotency keys for POST /payments with this pattern?', 'What does ON CONFLICT DO NOTHING return, and how do you get the existing row back?'],
          personalAngle:
            'Your scraping pipeline upserted thousands of records on re-runs: explain which unique keys made recovery jobs safe to repeat, and where a missing constraint would have created duplicates.',
          references: [{ label: 'PostgreSQL docs: INSERT ... ON CONFLICT', url: 'https://www.postgresql.org/docs/current/sql-insert.html' }],
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
          intent: `Tests whether you model data from access patterns and can justify duplication. A strong answer gives a clean relational schema, says when denormalisation is worth its sync cost, and makes embed-vs-reference decisions in MongoDB based on boundedness, ownership and co-reading.`,
          hints: [
            `Normalisation gives each fact one home. Sketch users, posts and comments with foreign keys first.`,
            `Denormalise only for a measured hot read path. What does each copy cost you on write?`,
            `In MongoDB, ask of each relation: is it read together, owned by the parent, and bounded? Remember the 16 MB document limit.`,
            `Embed bounded owned data (tags, line items), reference shared or unbounded data (authors, all comments), and use the subset pattern (latest 5 comments embedded) plus an extended reference ({ _id, name } of the author).`,
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
          intent: `Tests whether you can design a cache that is correct under concurrency and failure, not just fast. A strong answer chooses cache-aside with delete-on-write, justifies TTLs and jitter, picks Redis structures by use case, and handles stampedes and Redis outages.`,
          hints: [
            `Start with the read path: where does the app look first, and what happens on a miss?`,
            `On a write, should you update the cached value or delete it? Think about two concurrent writers.`,
            `A hot key expires and 1,000 requests miss at once. How do you let only one of them rebuild it?`,
            `Cache-aside: GET, on miss read DB and SET key EX ttl+jitter; on write update DB then DEL key. Stampede: SET lock:key NX PX 5000 single-flight or stale-while-revalidate. Add negative caching, versioned key prefixes and a DB fallback when Redis is down.`,
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
          walkthrough: [
            {
              title: 'Clarify requirements and scale',
              body: `Ask: read/write ratio, acceptable staleness per field (price vs description), and peak QPS on hot products. That sets the TTL budget and whether stampedes matter. State that **Postgres stays the source of truth**.`,
            },
            {
              title: 'Define the API and data shapes',
              body: `Key scheme \`product:v1:{id}\` holding serialized JSON (a string) or a hash for field updates. Other structures by need: sorted sets for "top products", sets for tags, HyperLogLog for unique viewers.`,
            },
            {
              title: 'Lay out the read and write paths',
              body: `\`\`\`ts
const hit = await redis.get(key)
if (hit) return JSON.parse(hit)
const row = await db.product.findUnique({ where: { id } })
await redis.set(key, JSON.stringify(row), 'EX', 300 + Math.floor(Math.random() * 60))
// on write: update the DB, then redis.del(key)
\`\`\`
Delete beats set on write: concurrent setters can leave the older value; a delete just costs one miss.`,
            },
            {
              title: 'Deep dive: stampede, penetration, outage',
              body: `- **Stampede:** single-flight lock (\`SET lock:key 1 NX PX 5000\`), stale-while-revalidate, or early probabilistic refresh.
- **Missing IDs:** cache "not found" briefly.
- **Memory:** \`maxmemory\` + \`allkeys-lru\`/\`lfu\` for a pure cache.
- **Redis down:** fall back to the DB with timeouts; protect it with a circuit breaker.`,
            },
            {
              title: 'Trade-offs and how to present it',
              body: `Name the residual race (a reader sets an old row right after the delete) and that **TTL bounds it**. Contrast write-through (always warm, caches unread data) and write-behind (data loss risk). In the interview: draw the two paths first, then spend most time on invalidation and the hot-key story.`,
            },
          ],
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
        {
          id: 'db-zero-downtime-migration',
          title: 'Zero-downtime schema migrations (expand and contract)',
          type: 'tradeoff',
          difficulty: 'advanced',
          priority: 'must',
          tags: ['migrations', 'zero-downtime', 'expand-contract', 'postgresql', 'prisma', 'locks', 'deployments'],
          estMinutes: 10,
          roles: ['backend', 'full-stack'],
          prompt: `The \`users\` table has 40M rows and the API is deployed with rolling updates. You need to **rename \`name\` to \`full_name\`, make \`email\` NOT NULL, and add an index on \`email\`**, with no downtime and no failed requests. **How do you plan and ship this?** What would go wrong if you just ran the migration Prisma generates?`,
          intent: `Tests whether you have operated a live database: old and new app versions run at the same time during a deploy, and DDL takes locks. A strong answer uses expand and contract across several deploys, backfills in batches, uses the lock-friendly PostgreSQL variants (CONCURRENTLY, NOT VALID, lock_timeout), and has a rollback story at every step.`,
          hints: [
            `During a rolling deploy, which versions of the app are talking to the database at the same moment? Which of them knows the new column name?`,
            `A rename is a breaking change for the old version. Split it into steps that are each backward compatible: add, write both, backfill, switch reads, remove.`,
            `ALTER TABLE takes an ACCESS EXCLUSIVE lock and can queue behind a long query, blocking everything after it. What settings and DDL variants avoid that?`,
            `Plan: (1) ADD COLUMN full_name (nullable, instant); (2) deploy dual-write; (3) backfill in batches of ~5k by id; (4) deploy reads from full_name; (5) stop writing name; (6) DROP name later. For email: ADD CONSTRAINT ... CHECK (email IS NOT NULL) NOT VALID, VALIDATE CONSTRAINT, then SET NOT NULL; CREATE INDEX CONCURRENTLY outside a transaction; SET lock_timeout = '5s' and retry.`,
          ],
          answer: `**Use expand and contract: every migration must work with both the currently deployed code and the next version**, because a rolling deploy runs both at once, and you may need to roll back.

**Why the generated migration is dangerous:** an ORM rename is often generated as \`DROP COLUMN name\` + \`ADD COLUMN full_name\` (data loss), or as \`RENAME COLUMN\`, which instantly breaks every old instance still selecting \`name\`. \`SET NOT NULL\` scans 40M rows under an \`ACCESS EXCLUSIVE\` lock, and a plain \`CREATE INDEX\` blocks writes for minutes. Always generate with \`prisma migrate dev --create-only\` and edit the SQL.

**The rename, over several deploys:**
1. **Expand:** \`ALTER TABLE users ADD COLUMN full_name text;\` (nullable, no default: a metadata-only change).
2. **Deploy dual-write:** the app writes both \`name\` and \`full_name\`, still reads \`name\`.
3. **Backfill in batches**, so no long transaction or replication lag spike:
\`\`\`sql
UPDATE users SET full_name = name
WHERE id IN (SELECT id FROM users WHERE full_name IS NULL AND name IS NOT NULL LIMIT 5000);
-- repeat until 0 rows, with a short pause between batches
\`\`\`
4. **Deploy read switch:** read \`full_name\`, keep writing both (rollback still possible).
5. **Deploy stop-writing** \`name\`.
6. **Contract:** \`ALTER TABLE users DROP COLUMN name;\` days later, once nothing references it.

**NOT NULL without a long lock:**
\`\`\`sql
ALTER TABLE users ADD CONSTRAINT users_email_not_null CHECK (email IS NOT NULL) NOT VALID; -- instant
ALTER TABLE users VALIDATE CONSTRAINT users_email_not_null; -- scans, but allows reads and writes
ALTER TABLE users ALTER COLUMN email SET NOT NULL; -- PG 12+: uses the valid check, no scan
ALTER TABLE users DROP CONSTRAINT users_email_not_null;
\`\`\`
Fix the NULL rows (and make the app always send email) first.

**The index:** \`CREATE INDEX CONCURRENTLY users_email_idx ON users (email);\` It cannot run inside a transaction block, and if it fails it leaves an **INVALID** index to drop and retry.

**Lock safety for every DDL step:** \`SET lock_timeout = '5s'\` so a statement waiting behind a long-running query gives up instead of queueing every other request behind it; retry it in a quiet moment. Also set a \`statement_timeout\` for the session.

**Process:** migrations run as a separate CI step before the deploy, are reviewed like code, and each phase has a rollback (the old column still exists until the contract step).`,
          walkthrough: [
            {
              title: 'State the constraint that drives everything',
              body: `During a rolling deploy, **old and new code hit the same database at once**, and you may roll back. So every schema change must be compatible with both versions. That rules out a one-shot rename.`,
            },
            {
              title: 'Know which DDL locks hurt',
              body: `\`ALTER TABLE\` takes an **ACCESS EXCLUSIVE** lock; if a long query holds a conflicting lock, the ALTER waits and **every new query queues behind it**. \`SET NOT NULL\` scans the table under that lock, and plain \`CREATE INDEX\` blocks writes. Adding a nullable column is instant.`,
            },
            {
              title: 'Ship the rename as expand and contract',
              body: `1. \`ADD COLUMN full_name text\` (instant).
2. Deploy dual-write (write both, read old).
3. Backfill in batches of a few thousand rows by id.
4. Deploy reads from \`full_name\`.
5. Stop writing \`name\`.
6. \`DROP COLUMN name\` later.`,
            },
            {
              title: 'Use the lock-friendly variants',
              body: `\`\`\`sql
SET lock_timeout = '5s';
ALTER TABLE users ADD CONSTRAINT email_nn CHECK (email IS NOT NULL) NOT VALID;
ALTER TABLE users VALIDATE CONSTRAINT email_nn;
ALTER TABLE users ALTER COLUMN email SET NOT NULL; -- PG 12+, no rescan
CREATE INDEX CONCURRENTLY users_email_idx ON users (email); -- not in a transaction
\`\`\`
Review ORM-generated SQL with \`prisma migrate dev --create-only\`: renames can come out as drop + add.`,
            },
            {
              title: 'Say it in 30 seconds',
              body: `"Rolling deploys mean two app versions share one schema, so I use expand and contract: add the new column, dual-write, backfill in batches, switch reads, stop the old writes, and drop it later. For NOT NULL I add a NOT VALID check and validate it, the index goes in CONCURRENTLY, and every DDL runs with a lock_timeout so it can't queue the whole app behind it."`,
            },
          ],
          keyPoints: [
            'Old and new code run simultaneously: every step backward compatible',
            'Expand → dual-write → batched backfill → switch reads → contract',
            'DDL lock queueing; lock_timeout and retries',
            'CHECK NOT VALID + VALIDATE before SET NOT NULL; CREATE INDEX CONCURRENTLY',
            'Review ORM-generated SQL; rollback path at each phase',
          ],
          pitfalls: [
            'Running RENAME COLUMN in the same deploy as the code change',
            'Backfilling 40M rows in one UPDATE (long transaction, bloat, replication lag)',
            'Running CREATE INDEX CONCURRENTLY inside a migration transaction',
            'Trusting the ORM-generated migration without reading it',
          ],
          followUps: ['How would you change a column type from int to bigint on a hot table?', 'How do you run migrations in CI/CD so a failed migration does not leave a half-deployed app?'],
          personalAngle:
            'You deployed the accessibility platform with Docker and YAML pipelines: describe where migrations ran in that pipeline and how you would split a breaking change into expand and contract steps there.',
          references: [{ label: 'PostgreSQL docs: ALTER TABLE', url: 'https://www.postgresql.org/docs/current/sql-altertable.html' }],
        },
      ],
    },
  ],
}

export default track
