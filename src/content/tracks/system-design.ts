import type { Track } from '@/types/content'

const track: Track = {
  id: 'system-design',
  code: 'O',
  title: 'System Design',
  summary: 'Requirements to architecture: scaling, data, caching, queues and reliability trade-offs.',
  rationale:
    'You have already designed and run a production backend (the Efilli accessibility platform) and a queue-driven scraping system, but system design rounds grade how you articulate that thinking under time pressure. This track gives you a repeatable structure, the vocabulary interviewers listen for, and mid-level design prompts tied to systems you have actually built.',
  icon: 'Workflow',
  phase: 4,
  modules: [
    {
      id: 'sd-foundations',
      title: 'Framework & building blocks',
      summary: 'A repeatable interview structure, scaling basics, load balancing and caching.',
      questions: [
        {
          id: 'sd-interview-framework',
          title: 'How to run a system design interview',
          type: 'concept',
          difficulty: 'foundation',
          priority: 'must',
          tags: ['framework', 'requirements', 'estimation', 'communication'],
          estMinutes: 5,
          roles: ['general'],
          companyTypes: ['startup', 'mid-size', 'big-tech', 'japan-international'],
          prompt: `"You have 45 minutes to design a system." **Walk me through how you would structure those 45 minutes**, and show how you would do a quick capacity estimate.`,
          intent: `Tests whether you can run a 45-minute design round with structure instead of jumping to boxes. A strong answer gives a time-boxed sequence (requirements, estimates, API, data, architecture, deep dive, wrap-up), does a quick estimate that changes a decision, and shows how you keep the interviewer involved.`,
          hints: [
            `Do not draw boxes in the first five minutes. What do you need to know before any box makes sense?`,
            `Split requirements into functional (what it does) and non-functional (scale, latency, availability, consistency).`,
            `Estimate only numbers that change a decision: QPS, storage and the read/write ratio. 1 day is about 10^5 seconds.`,
            `Sequence: requirements 5–8 min → estimates 3–5 → API 3–5 → data model 5 → high-level design 10 → 1–2 deep dives 10–15 → trade-offs and 10x. Example: 10M DAU × 10 reads = 100M/day ≈ 1,200/s, so peak 3–5x.`,
          ],
          answer: `**Use a fixed sequence and say it out loud, so the interviewer can follow and steer you:**

1. **Clarify requirements (5–8 min).**
   - *Functional:* the 3–5 core use cases ("users shorten a URL; anyone can open it"). Agree on what is out of scope.
   - *Non-functional:* scale, latency target, availability, consistency needs, durability, security and compliance.
2. **Estimate (3–5 min)**, only the numbers that drive decisions:
   - 10M DAU × 10 reads/day = 100M reads/day ≈ **1,200 reads/s on average**, so plan for ~3–5× at peak.
   - With 1M writes/day × 500 B ≈ 0.5 GB/day ≈ **~180 GB/year**, which fits one Postgres instance comfortably.
   - The read:write ratio (here 100:1) tells you caching and read replicas matter more than write sharding.
3. **API (3–5 min).** List the endpoints or events with their key fields: \`POST /urls {longUrl} → {code}\`.
4. **Data model (5 min).** The entities, access patterns, SQL vs NoSQL, and the keys and indexes the queries need.
5. **High-level architecture (10 min).** Client → LB → stateless app servers → DB, plus a cache, a queue or a CDN only where a requirement asks for one.
6. **Deep dives (10–15 min).** Pick 1–2 bottlenecks (hot keys, fan-out, consistency) or let the interviewer choose.
7. **Wrap-up.** Trade-offs, failure modes, monitoring, and what you would do at 10× scale.

**Habits that score well:**
- State assumptions explicitly ("I'll assume 100:1 reads to writes; correct me").
- Start simple and evolve: a single DB first, then add replicas and a cache when the numbers demand it.
- Name trade-offs instead of picking a "best" technology.
- Check in with the interviewer: "Should I go deeper on storage or on the feed?"

**Handy numbers:** 1 day ≈ 86,400 s ≈ 10⁵ s; a single Postgres node handles thousands of simple QPS; Redis handles ~100k ops/s; a memory read takes nanoseconds, an in-datacenter network round trip ~0.5 ms, and a cross-continent one ~100–150 ms.`,
          walkthrough: [
            {
              title: 'Clarify requirements and scale',
              body: `Spend 5–8 minutes on **3–5 functional use cases** and the **non-functional** ones: scale, latency, availability, consistency, compliance. Say what is out of scope. Then a quick estimate: 10M DAU × 10 reads/day ≈ **1,200 reads/s**, peak 3–5x; 1M writes/day × 500 B ≈ 180 GB/year.`,
            },
            {
              title: 'Define the API and data model',
              body: `List endpoints or events with key fields (\`POST /urls {longUrl} → {code}\`), then entities, access patterns, and the keys and indexes those patterns need. This anchors the architecture in concrete queries.`,
            },
            {
              title: 'Draw the high-level architecture',
              body: `Start simple: client → LB → stateless app servers → database. Add a cache, queue or CDN **only when a requirement or number asks for it**, and say which one.`,
            },
            {
              title: 'Deep dive on 1–2 bottlenecks',
              body: `Pick the hard part (hot keys, fan-out, consistency, ID generation) or ask: "Should I go deeper on storage or on the feed?" Go into failure modes and data flow there instead of skimming everything.`,
            },
            {
              title: 'Trade-offs and the 45-minute delivery',
              body: `Close with trade-offs you made, failure modes, monitoring and what changes at 10x. Throughout: state assumptions ("I'll assume 100:1 reads; correct me"), start simple and evolve, and check in every few minutes.`,
            },
          ],
          keyPoints: [
            'Clarify functional and non-functional requirements before designing',
            'Do a back-of-the-envelope estimate that drives decisions (QPS, storage, read/write ratio)',
            'Define the API and data model before the architecture',
            'Start simple, then evolve to fix specific bottlenecks',
            'Name trade-offs explicitly and check in with the interviewer',
          ],
          pitfalls: [
            'Jumping straight to microservices, Kafka and Kubernetes without requirements',
            'Spending 15 minutes on precise arithmetic that does not change any decision',
            'Monologuing without checking which area the interviewer cares about',
          ],
          followUps: ['How would your estimate change if usage were 10× spikier?', 'Which non-functional requirement usually dominates for a B2B SaaS?'],
          personalAngle:
            'Frame your Efilli platform story with the same steps: requirements from the first customers, the scale you designed for, then the architecture. It shows the framework is how you actually think.',
          references: [{ label: 'System Design Primer (GitHub)', url: 'https://github.com/donnemartin/system-design-primer' }],
        },
        {
          id: 'sd-scaling-load-balancing',
          title: 'Vertical vs horizontal scaling and load balancing',
          type: 'tradeoff',
          difficulty: 'foundation',
          priority: 'must',
          tags: ['scaling', 'load-balancing', 'stateless', 'sessions'],
          estMinutes: 5,
          roles: ['backend', 'full-stack'],
          prompt: `Our Node.js API is getting slow under load. **Compare scaling vertically and horizontally.** What has to be true about the app before you can put a load balancer in front of several instances?`,
          intent: `Tests whether you know the practical preconditions for horizontal scaling, not just the definitions. A strong answer compares vertical and horizontal honestly, lists the state that must move out of the process (sessions, files, jobs, sockets), explains L4 vs L7 and health checks, and predicts the database as the next bottleneck.`,
          hints: [
            `One option means a bigger machine, the other means more machines. What does each cost and where does each stop?`,
            `Where does per-user state live today: process memory, local disk, or a shared store? What breaks when the next request lands on another instance?`,
            `Think about scheduled jobs and WebSockets too, not only sessions.`,
            `Answer shape: vertical first while cheap (and one Node process per core); horizontal needs sessions in Redis or tokens, files in S3, jobs run once via a queue or leader, a pub/sub backplane for sockets; L4 vs L7, least-connections, health checks and draining; then DB pooling and replicas.`,
          ],
          answer: `**Vertical scaling** means a bigger machine (more CPU and RAM). **Horizontal scaling** means more machines behind a load balancer.

| | Vertical | Horizontal |
| --- | --- | --- |
| Effort | Simple: no code changes | The app must be stateless |
| Limit | Hardware ceiling, cost grows steeply | Near-linear, up to the shared bottleneck (often the DB) |
| Availability | Single point of failure | Survives losing an instance |
| Deploys | Downtime or failover needed | Rolling deploys |

**Scale vertically first** while it is cheap, and **scale horizontally** when you need redundancy or pass the ceiling. Note that Node is single-threaded per process: on one machine, run one process per core (cluster mode, PM2, or several containers) before buying a bigger box.

**Before adding a load balancer, the app must be stateless:**
- **Sessions** go in a shared store (Redis or the DB) or a signed token, not in process memory.
- **Uploads and files** go to object storage (S3), not local disk.
- **In-memory caches and timers** become a shared cache, and scheduled jobs run once (a queue or a leader), not once per instance.
- **WebSockets** need sticky sessions or a pub/sub backplane so a message can reach a user connected to another instance.

**Load balancer basics:**
- **L4** (TCP) is fast and protocol-agnostic. **L7** (HTTP) can route by path or header, terminate TLS and retry.
- Algorithms: round robin, least connections (good for uneven request cost), and consistent hashing (for cache affinity).
- **Health checks** remove dead instances; connection draining lets in-flight requests finish during deploys.
- The LB itself must be redundant: a managed LB, or a pair with failover.

**The usual next bottleneck is the database.** Add read replicas, a cache and connection pooling (PgBouncer), because 20 app instances × 20 connections can exhaust Postgres.`,
          walkthrough: [
            {
              title: 'Define both options and their limits',
              body: `**Vertical:** a bigger machine; no code changes, but a hardware ceiling and a single point of failure. **Horizontal:** more machines behind a load balancer; near-linear and redundant, but the app must be stateless. Node is single-threaded, so first run one process per core.`,
            },
            {
              title: 'List what must become stateless',
              body: `- Sessions → Redis/DB or signed tokens.
- Uploads → object storage, not local disk.
- In-memory caches and cron → shared cache; jobs run once (queue or leader).
- WebSockets → sticky sessions or a pub/sub backplane.`,
            },
            {
              title: 'Explain the load balancer',
              body: `**L4** (TCP) is fast and protocol-agnostic; **L7** (HTTP) routes by path or header, terminates TLS and can retry. Algorithms: round robin, least connections for uneven requests, consistent hashing for affinity. **Health checks** and **connection draining** make rolling deploys safe; the LB itself must be redundant.`,
            },
            {
              title: 'Predict the next bottleneck',
              body: `More app instances multiply DB connections (20 × 20 = 400). Add pooling (PgBouncer), read replicas and a cache before the database falls over.`,
            },
            {
              title: 'Say it in 30 seconds',
              body: `"I'd scale vertically and use all cores first because it's cheap. To go horizontal the app must be stateless: sessions in Redis, files in S3, cron run once, sockets through pub/sub. Then an L7 load balancer with health checks and draining. The database becomes the next limit, so I'd watch connections and add pooling and replicas."`,
            },
          ],
          keyPoints: [
            'Vertical is simple but has a ceiling and is a single point of failure',
            'Horizontal scaling requires stateless app servers',
            'Move sessions, files and scheduled jobs to shared infrastructure',
            'L4 vs L7 load balancers, algorithms and health checks',
            'The database becomes the next bottleneck: pooling and replicas',
          ],
          pitfalls: [
            'Adding instances while sessions still live in memory, so users get logged out randomly',
            'Running cron jobs on every instance, so each job runs N times',
            'Forgetting the DB connection limit when multiplying instances',
          ],
          followUps: ['How would you scale WebSocket connections horizontally?', 'When would you choose least-connections over round robin?'],
          personalAngle:
            'Mention the Efilli servers you configured: what ran on one box versus several, and how you handled scheduled scraping jobs so they did not run twice.',
        },
        {
          id: 'sd-caching-strategies',
          title: 'Caching strategies and invalidation',
          type: 'tradeoff',
          difficulty: 'core',
          priority: 'must',
          tags: ['caching', 'redis', 'cdn', 'invalidation', 'stampede'],
          estMinutes: 7,
          roles: ['backend', 'full-stack'],
          prompt: `A product page reads from Postgres and gets 50× more reads than writes. **Where would you add caching, which strategy would you use, and how do you keep the cache from serving stale or wrong data?**`,
          intent: `Tests whether you can place caches at the right layers and keep them correct. A strong answer names the layers, picks cache-aside with delete-on-write and a TTL, explains why, and covers stampede, penetration, hot keys and cache-down behaviour, then applies it to the product page.`,
          hints: [
            `Caches exist at several layers, from the browser to the database. Which can serve an anonymous product page?`,
            `Who fills the cache: the application on a miss, or the write path? What happens with two concurrent writers if you update the cache on write?`,
            `A popular key expires and 1,000 requests miss at the same moment. Also: what if Redis is down?`,
            `Answer shape: CDN with s-maxage + stale-while-revalidate for anonymous pages; Redis cache-aside for product JSON, TTL 5–10 min with jitter, DB update then DEL; single-flight lock or SWR for stampedes; negative caching; DB fallback with timeouts.`,
          ],
          answer: `**Cache at the layer closest to the user that still gives correct results**, and choose the strategy based on how stale the data may be.

**Layers:** browser (Cache-Control) → CDN (static assets and public pages) → application cache (Redis) → the DB's own buffer cache.

**Strategies:**
- **Cache-aside (lazy loading)**, the default: read from the cache; on a miss, read the DB, then \`SET key value EX ttl\`. On a write, update the DB, then **delete** the key. It is simple and only caches what is read.
- **Write-through:** write to the cache and the DB together. Reads are always warm, but you also cache data nobody reads.
- **Write-behind:** write to the cache and flush to the DB asynchronously. Writes are fast, but data can be lost if the cache dies. Rarely the right choice for business data.
- **Read-through:** the cache library loads from the DB itself. Same idea as cache-aside, with the logic in the library.

**Invalidation and consistency:**
- **TTL** is the safety net: even if an invalidation is missed, staleness is bounded.
- **Delete rather than update on write.** Two concurrent updates to the cache can land in the wrong order; a delete just causes one extra miss.
- For stricter needs, use versioned keys (\`product:42:v7\`) or invalidate through an event (CDC or a queue) after commit.
- Cache only after the transaction commits, never inside it.

**Failure modes to mention:**
- **Stampede:** a hot key expires and every request hits the DB. Fix it with a per-key lock or single-flight, early probabilistic refresh, or stale-while-revalidate.
- **Penetration:** repeated lookups of keys that do not exist. Cache the "not found" result with a short TTL, or use a Bloom filter.
- **Hot keys:** one key overloads one Redis shard. Add a local in-process cache in front, or replicate the key.
- **Cache down:** the app must fall back to the DB with a timeout, and the DB must survive that load, or you need a circuit breaker.

**For this case:** CDN or HTTP caching for anonymous product pages (\`s-maxage\` plus stale-while-revalidate), and cache-aside in Redis for product JSON with a 5–10 minute TTL and delete-on-write. Measure the hit ratio.`,
          walkthrough: [
            {
              title: 'Pick the layers',
              body: `Browser (\`Cache-Control\`) → CDN (public pages, assets) → application cache (Redis) → DB buffer cache. Cache as close to the user as correctness allows; never cache per-user data under a shared CDN key.`,
            },
            {
              title: 'Choose the strategy',
              body: `**Cache-aside** by default: read cache, on miss read DB and \`SET key value EX ttl\`; on write, update DB then **delete** the key. Write-through keeps reads warm but caches unread data; write-behind risks loss.`,
            },
            {
              title: 'Keep it correct',
              body: `- TTL bounds staleness when an invalidation is missed.
- Delete, not update, avoids out-of-order writes.
- Populate only after the transaction commits.
- Stricter needs: versioned keys or event-driven invalidation (outbox or CDC).`,
            },
            {
              title: 'Handle the failure modes',
              body: `**Stampede:** single-flight lock, early refresh, stale-while-revalidate. **Penetration:** cache "not found" briefly or use a Bloom filter. **Hot key:** in-process LRU in front. **Cache down:** fall back to the DB with timeouts and a circuit breaker.`,
            },
            {
              title: 'Say it in 30 seconds',
              body: `"For anonymous product pages I'd use the CDN with s-maxage and stale-while-revalidate, and Redis cache-aside for product JSON with a jittered 5–10 minute TTL and delete-on-write. I'd protect hot keys from stampedes with a single-flight lock, cache misses briefly, and make sure the DB survives Redis being down. Then I'd measure the hit ratio."`,
            },
          ],
          keyPoints: [
            'Several cache layers: browser, CDN, application, database',
            'Cache-aside with delete-on-write as the default pattern',
            'A TTL bounds staleness when invalidation fails',
            'Stampede, penetration and hot-key problems, and their fixes',
            'Graceful degradation when the cache is unavailable',
          ],
          pitfalls: [
            'Updating the cache on write instead of deleting, which causes race conditions',
            'Caching per-user or authorised data at the CDN under a shared key',
            'No TTL at all, so one missed invalidation means stale data forever',
          ],
          followUps: ['How would you cache a personalised feed?', 'How do you measure whether a cache is worth it?'],
          references: [{ label: 'Redis docs', url: 'https://redis.io/docs/' }],
        },
      ],
    },
    {
      id: 'sd-data',
      title: 'Data at scale',
      summary: 'Replication, sharding, consistency models and API and data design.',
      questions: [
        {
          id: 'sd-replication-sharding',
          title: 'Replication vs partitioning (sharding)',
          type: 'concept',
          difficulty: 'core',
          priority: 'must',
          tags: ['replication', 'sharding', 'partitioning', 'consistent-hashing', 'postgresql'],
          estMinutes: 7,
          roles: ['backend', 'full-stack'],
          prompt: `Explain the difference between **replication** and **sharding**. What problem does each solve, what new problems does each introduce, and how do you pick a shard key?`,
          intent: `Tests whether you can separate scaling reads and availability from scaling writes and size, and whether you know the costs of each. A strong answer explains sync vs async replication and read-your-own-writes, compares partitioning schemes, gives shard-key criteria, and treats sharding as a last resort.`,
          hints: [
            `One technique copies the same data to more nodes; the other splits different data across nodes. Which problem does each solve?`,
            `A user updates their profile and reloads, and a replica serves the old value. What is that called, and how do you fix it?`,
            `A good shard key spreads load evenly and keeps most queries on one shard. What would you pick for a B2B SaaS?`,
            `Answer shape: replication (leader-follower, sync vs async, lag, read-your-own-writes via leader routing or LSN) vs sharding (range, hash/consistent hashing, directory); shard key = high cardinality, even, matches access pattern (tenant_id); order: indexes → vertical → replicas + cache → partitions → shards.`,
          ],
          answer: `**Replication** stores **copies of the same data** on several nodes. **Sharding (partitioning)** **splits the data** so that each node holds a subset.

**Replication** solves read scale and availability.
- **Leader–follower:** writes go to the leader and stream to read replicas (Postgres streaming replication). If the leader fails, a replica is promoted.
- **Synchronous vs asynchronous:** sync waits for the replica's acknowledgement (durable, but slower and blocked if the replica is down). Async is fast but can **lose recent writes on failover** and causes **replication lag**.
- **New problems:** stale reads. A user updates their profile, reloads, and a lagging replica shows the old value. Fixes: **read-your-own-writes** (route that user's reads to the leader for a few seconds, or compare an LSN or version), and monotonic reads (keep a user on one replica).
- Multi-leader or leaderless setups (Dynamo-style quorums, with W + R > N) allow writes in several places but need conflict resolution.

**Sharding** solves **write throughput and data size** that one node cannot hold.
- **Range partitioning** (by date or id range) gives efficient range scans but risks hot spots (all of today's writes hit one shard).
- **Hash partitioning** spreads load evenly but makes range queries scatter across shards. **Consistent hashing** (or many virtual buckets mapped to nodes) limits the data moved when nodes are added.
- **Directory or lookup** partitioning keeps a mapping service from tenant to shard. It is flexible and common for multi-tenant SaaS.
- **New problems:** cross-shard queries and joins, cross-shard transactions (avoid them, or use sagas), rebalancing, global unique ids (Snowflake ids or UUIDv7), and hot keys (a celebrity or a large tenant).

**Choosing a shard key:**
1. High cardinality and even distribution.
2. It matches the dominant access pattern, so most queries hit one shard (\`tenant_id\` for B2B SaaS, \`user_id\` for user data).
3. It does not grow monotonically, unless you hash it.

**Order of operations in practice:** indexes and query fixes → vertical scale → read replicas plus a cache → partition tables inside one DB (Postgres declarative partitioning) → shard across nodes only when necessary, because it is a one-way door.`,
          walkthrough: [
            {
              title: 'Separate the two ideas',
              body: `**Replication** = copies of the same data (read scale, availability). **Sharding** = splitting data so each node holds a subset (write throughput, data size). Replicas do **not** add write capacity.`,
            },
            {
              title: 'Explain replication and its problems',
              body: `Leader–follower: writes to the leader, streamed to replicas. **Sync** is durable but slower; **async** is fast but can lose recent writes on failover and causes **lag**. Fix stale reads with **read-your-own-writes** (route the user to the leader briefly, or compare LSN/version) and monotonic reads.`,
            },
            {
              title: 'Explain partitioning schemes',
              body: `- **Range:** good range scans, hot spots on "today".
- **Hash / consistent hashing:** even spread, scatter for ranges; minimal movement when nodes change.
- **Directory:** tenant → shard map; flexible for SaaS.
New problems: cross-shard joins and transactions, rebalancing, global IDs, hot tenants.`,
            },
            {
              title: 'Choose a shard key and an order of operations',
              body: `Key: high cardinality, even distribution, matches the dominant query (\`tenant_id\`, \`user_id\`), not monotonic unless hashed. Order: indexes → vertical scale → replicas + cache → in-DB partitioning → sharding, because sharding is a one-way door.`,
            },
            {
              title: 'Say it in 30 seconds',
              body: `"Replication copies data for read scale and failover, at the cost of lag, so I handle read-your-own-writes. Sharding splits data for write scale, at the cost of cross-shard queries and rebalancing. I'd shard a SaaS by tenant_id with a directory for big tenants, but only after indexes, replicas, caching and partitioning stop being enough."`,
            },
          ],
          keyPoints: [
            'Replication = copies for read scale and availability; sharding = splits for write scale and size',
            'Sync vs async replication and replication lag',
            'Read-your-own-writes as the classic consistency fix',
            'Range vs hash vs directory partitioning, and consistent hashing',
            'Shard key: even distribution plus single-shard queries; shard as a last resort',
          ],
          pitfalls: [
            'Saying replicas increase write throughput',
            'Choosing a monotonically increasing key for range sharding, which creates a hot shard',
            'Sharding before trying indexes, replicas and caching',
          ],
          followUps: ['How would you reshard with zero downtime?', 'How do you handle one huge tenant in a tenant-sharded system?'],
          references: [{ label: 'PostgreSQL docs: high availability and replication', url: 'https://www.postgresql.org/docs/current/high-availability.html' }],
        },
        {
          id: 'sd-cap-pacelc',
          title: 'CAP and PACELC in practice',
          type: 'multiple-choice',
          difficulty: 'core',
          priority: 'should',
          tags: ['cap', 'pacelc', 'consistency', 'availability', 'distributed-systems'],
          estMinutes: 3,
          roles: ['backend', 'general'],
          prompt: `A network partition separates two data centres, and both keep receiving writes. **Which statement about CAP and PACELC is correct?**`,
          choices: [
            {
              id: 'a',
              text: 'You pick two of C, A and P up front, so a "CA" system simply never experiences partitions.',
              correct: false,
              explanation:
                'Partitions happen whether you want them or not. In a distributed system P is not optional; the real choice is how you behave during one.',
            },
            {
              id: 'b',
              text: 'During a partition you must choose between consistency (reject or block some requests) and availability (answer, possibly with stale or conflicting data); PACELC adds that, even without a partition, you trade latency against consistency.',
              correct: true,
              explanation:
                'That is the accurate reading. Postgres with synchronous replicas leans PC/EC; Cassandra or DynamoDB with tunable quorums usually lean PA/EL.',
            },
            {
              id: 'c',
              text: 'Eventual consistency means data may be permanently lost, so it is only for unimportant data.',
              correct: false,
              explanation:
                'Eventual consistency means replicas converge if writes stop. It concerns how up to date reads are, not durability. Shopping carts, likes and DNS all use it.',
            },
            {
              id: 'd',
              text: 'The "C" in CAP is the same as the "C" in ACID.',
              correct: false,
              explanation:
                'CAP C means linearizability: every read sees the latest write. ACID C means transactions preserve invariants (constraints). They are different properties.',
            },
          ],
          intent: `Tests whether you understand CAP as a choice made during a partition, and PACELC as the everyday latency trade-off. A strong answer rejects "pick two", distinguishes CAP consistency from ACID consistency, and applies the choice per feature.`,
          hints: [
            `In a system spread over a network, is a partition something you can choose not to have?`,
            `During a partition, a node can answer (maybe with stale data) or refuse. Which letters do those map to?`,
            `PACELC adds the Else case: with no partition, what do you trade when you wait for a quorum or a synchronous replica?`,
            `B is correct: P is not optional; during a partition choose C (reject/block) or A (answer, reconcile later); else choose latency vs consistency. CAP C is linearizability, not ACID C. Decide per feature: payments CP, presence AP.`,
          ],
          answer: `**B is correct.** CAP is often taught as "pick two", but **partition tolerance is not optional** for anything distributed over a network. The real question is: **when a partition happens, does each side keep answering (A), or refuse or block to avoid divergence (C)?**

- **CP behaviour:** the minority side rejects writes, or reads time out. Examples: a ZooKeeper or etcd leader election, or a Postgres primary with synchronous replication when the replica is unreachable. Choose it for money, inventory and uniqueness constraints.
- **AP behaviour:** both sides accept writes and reconcile later (last-write-wins, CRDTs, merge in the application). Choose it for carts, presence, counters and feeds.

**PACELC:** *if Partition, choose A or C; Else, choose Latency or Consistency.* Most of the time there is no partition, and the everyday trade-off is **latency**: waiting for a quorum or a synchronous replica makes every write slower.

**In an interview, apply it per feature, not per system:** "Payments are CP: strongly consistent in Postgres. The 'who is online' indicator is AP: Redis with a TTL, fine to be a few seconds wrong."`,
          keyPoints: [
            'Partitions are unavoidable; choose behaviour during them',
            'CP rejects or blocks; AP answers with possibly stale or conflicting data',
            'PACELC: latency vs consistency when there is no partition',
            'CAP consistency ≠ ACID consistency',
            'Choose per feature, not per system',
          ],
          pitfalls: ['Describing a single-node database as a "CA distributed system"', 'Equating eventual consistency with data loss'],
          followUps: ['How do quorum reads and writes (R + W > N) give stronger consistency?'],
        },
        {
          id: 'sd-api-data-modelling',
          title: 'Designing an API and its data model',
          type: 'concept',
          difficulty: 'foundation',
          priority: 'should',
          tags: ['api-design', 'rest', 'pagination', 'data-modelling', 'versioning'],
          estMinutes: 6,
          roles: ['backend', 'full-stack'],
          prompt: `Design the API and data model for **comments on articles** (create, list newest first with pagination, edit, delete). **What do the endpoints, the table and the indexes look like, and how do you paginate?**`,
          intent: `Tests whether you design APIs from access patterns and know the details that bite in production. A strong answer gives resource-oriented endpoints with correct status codes, a table whose index matches the main query, keyset pagination with a tiebreaker, and mentions idempotency, ownership checks and soft deletes.`,
          hints: [
            `Start from the access patterns: which query will run most often?`,
            `Your main list is "comments for article X, newest first". What index matches that exactly?`,
            `OFFSET 10000 gets slow and shifts when new comments arrive. What pagination avoids both?`,
            `Endpoints: GET /articles/:id/comments?cursor&limit, POST (Idempotency-Key), PATCH/DELETE /comments/:id with ownership checks. Index (article_id, created_at DESC, id DESC); keyset WHERE (created_at, id) < ($2, $3) LIMIT 21 with an opaque cursor; soft delete via deleted_at.`,
          ],
          answer: `**Start from the access patterns, then the resources, then the storage.**

**Endpoints (REST, resource-oriented):**
\`\`\`http
GET    /articles/:articleId/comments?limit=20&cursor=...   → { items, nextCursor }
POST   /articles/:articleId/comments   { body }            → 201 + comment
PATCH  /comments/:id                   { body }            → 200 (author only)
DELETE /comments/:id                                       → 204 (author or moderator)
\`\`\`
- Nouns for resources, HTTP verbs for actions, and correct status codes (400 validation, 401, 403, 404, 409, 429).
- One consistent error shape: \`{ error: { code, message, details } }\`.
- Accept an \`Idempotency-Key\` header on POST so a retried request does not create a duplicate comment.
- Versioning: \`/v1\` or a header. Add fields compatibly and never repurpose an existing one.

**Data model (PostgreSQL):**
\`\`\`sql
CREATE TABLE comments (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  article_id  bigint NOT NULL REFERENCES articles(id),
  author_id   bigint NOT NULL REFERENCES users(id),
  body        text   NOT NULL CHECK (length(body) BETWEEN 1 AND 5000),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz,
  deleted_at  timestamptz
);
CREATE INDEX comments_article_created ON comments (article_id, created_at DESC, id DESC);
\`\`\`
The composite index matches the main query exactly: filter by article, order by newest.

**Pagination: cursor (keyset), not offset.**
- \`OFFSET 10000\` still scans and discards 10,000 rows, and new inserts shift pages, causing duplicates or skipped items.
- Keyset pagination: \`WHERE article_id = $1 AND (created_at, id) < ($2, $3) ORDER BY created_at DESC, id DESC LIMIT 21\`. Fetch \`limit + 1\` rows to know whether there is a next page, and encode \`(created_at, id)\` as an opaque base64 cursor.
- The trade-off: no "jump to page 37". That is fine for feeds.

**Other decisions to mention:** soft delete (\`deleted_at\`) to keep threads intact, with the body shown as "[deleted]"; authorisation checks in the service layer (the author edits only their own comments, which prevents IDOR); a per-user rate limit on POST; denormalised \`comment_count\` on articles, updated in the same transaction, if counts are shown everywhere.`,
          keyPoints: [
            'Design from access patterns',
            'Resource-oriented endpoints, proper status codes and a consistent error shape',
            'Composite index matching filter plus sort order',
            'Cursor (keyset) pagination instead of offset, and why',
            'Idempotency keys, authorisation (IDOR) and soft deletes',
          ],
          pitfalls: [
            'Offset pagination on large or fast-changing lists',
            'Ordering by created_at alone without a unique tiebreaker',
            'Checking only authentication, not ownership (IDOR)',
          ],
          followUps: ['How would you support threaded replies?', 'When would GraphQL be a better fit than REST here?'],
          references: [{ label: 'MDN: HTTP response status codes', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status' }],
        },
      ],
    },
    {
      id: 'sd-reliability',
      title: 'Async processing & reliability',
      summary: 'Queues, retries with backoff and jitter, idempotency and rate limiting.',
      questions: [
        {
          id: 'sd-queues-async',
          title: 'When and how to use a message queue',
          type: 'tradeoff',
          difficulty: 'core',
          priority: 'must',
          tags: ['queues', 'async', 'bullmq', 'kafka', 'delivery-semantics', 'dlq'],
          estMinutes: 7,
          roles: ['backend', 'full-stack'],
          prompt: `A sign-up request currently sends a welcome email, generates a PDF and calls a CRM synchronously, and it often takes 6 seconds or fails. **How would you redesign this with a queue?** Cover delivery guarantees, failures and when a queue is the wrong tool.`,
          intent: `Tests whether you know when to move work off the request path and what a queue really guarantees. A strong answer splits sync and async work, explains at-least-once delivery and idempotent consumers, solves the dual-write problem with an outbox, and covers retries, DLQs, monitoring and when not to use a queue.`,
          hints: [
            `What must happen before you answer the user, and what can happen a few seconds later?`,
            `Most queues deliver at least once. What does that require of the consumer?`,
            `You insert the user, then enqueue a job, and the process crashes in between. How do you make those two writes consistent?`,
            `Answer shape: write user + outbox row in one transaction, return 201; relay publishes outbox to BullMQ/SQS; workers are idempotent (dedupe on job id, upserts); exponential backoff + jitter, max attempts, DLQ with replay; monitor depth and oldest-job age; Kafka when you need a replayable log.`,
          ],
          answer: `**Respond after the essential work only, and move the rest to background jobs.** Sign-up writes the user row, enqueues jobs, and returns 201 in milliseconds. Workers send the email, render the PDF and sync the CRM independently.

**Why queues help:**
- **Latency:** the user does not wait for slow third parties.
- **Resilience:** if the CRM is down, jobs wait and retry instead of failing sign-up.
- **Load levelling:** bursts are absorbed and workers process at a steady rate. Scale workers independently of the API.
- **Decoupling:** new consumers (analytics) can subscribe without touching sign-up.

**Delivery semantics:**
- **At-most-once:** may lose messages. Rarely acceptable.
- **At-least-once:** the default (BullMQ, SQS, RabbitMQ with acknowledgements). Messages may be **delivered twice**, so **consumers must be idempotent**: dedupe on a job or event id, use upserts, or unique constraints.
- **"Exactly-once"** is in practice at-least-once plus idempotent processing.

**The dual-write problem:** "insert the user, then enqueue" can crash between the two steps. Use the **transactional outbox**: write the user and an \`outbox\` row in the same DB transaction, and have a relay publish the outbox rows to the queue.

**Failure handling:**
- Retries with **exponential backoff and jitter**, and a max attempts setting.
- A **dead-letter queue** for jobs that keep failing, with alerting and a way to inspect and replay them.
- Timeouts on every external call, and a visibility timeout or lock longer than the job's worst-case time.
- Monitoring: queue depth, age of the oldest job, failure rate, and processing time.

**Queue (BullMQ or SQS) vs log (Kafka):** a queue distributes tasks to competing workers, and a message is removed once processed. A log keeps an ordered, replayable stream that many consumer groups read at their own offsets, which suits event sourcing, analytics and high throughput.

**When not to use a queue:** when the user needs the result right now (a payment authorisation), when ordering and consistency across steps are critical and simple, or when the added operational complexity is not justified at your scale.`,
          walkthrough: [
            {
              title: 'Split essential from deferrable work',
              body: `Sign-up only needs the user row before responding. Email, PDF and CRM sync go to background jobs. The request returns **201 in milliseconds**, and a CRM outage no longer fails sign-up.`,
            },
            {
              title: 'State the delivery semantics',
              body: `At-most-once loses messages; **at-least-once** (BullMQ, SQS, RabbitMQ with acks) may deliver twice. So **consumers must be idempotent**: dedupe on a job or event id, use upserts and unique constraints. "Exactly-once" in practice = at-least-once + idempotency.`,
            },
            {
              title: 'Solve the dual write with an outbox',
              body: `\`\`\`sql
BEGIN;
INSERT INTO users (...) VALUES (...);
INSERT INTO outbox (type, payload) VALUES ('user.created', '{...}');
COMMIT;
\`\`\`
A relay reads unsent outbox rows and publishes them, so a crash can delay a job but never lose it.`,
            },
            {
              title: 'Handle failures and choose the tool',
              body: `Retries with exponential backoff and jitter, max attempts, a **DLQ** with alerting and replay, timeouts on every external call, and dashboards for queue depth and oldest-job age. Queue (BullMQ/SQS) for tasks; log (Kafka) for replayable streams with many consumer groups. Skip the queue when the user needs the result now.`,
            },
            {
              title: 'Say it in 30 seconds',
              body: `"I'd write the user and an outbox row in one transaction and return right away. A relay publishes to the queue, and separate workers send the email, render the PDF and sync the CRM. Delivery is at-least-once, so every consumer is idempotent. Failed jobs back off with jitter and land in a DLQ I can inspect and replay."`,
            },
          ],
          keyPoints: [
            'Do only the essential work synchronously; enqueue the rest',
            'At-least-once delivery requires idempotent consumers',
            'Transactional outbox to avoid the dual-write problem',
            'Retries with backoff, a DLQ, timeouts and monitoring of queue depth and age',
            'Queue vs log (BullMQ/SQS vs Kafka) trade-off',
          ],
          pitfalls: [
            'Assuming the queue guarantees exactly-once delivery',
            'Enqueuing inside a DB transaction that may roll back (or after it, without an outbox)',
            'Infinite retries with no DLQ, so poison messages block workers',
          ],
          followUps: ['How do you preserve ordering per user while processing in parallel?', 'How would you replay a day of failed jobs safely?'],
          personalAngle:
            'Use your Redis-backed scraping jobs: how you retried failed scrapes, what you did with jobs that kept failing, and how recovery jobs restarted stuck work. That is a DLQ-and-replay story from production.',
          references: [{ label: 'BullMQ documentation', url: 'https://docs.bullmq.io/' }],
        },
        {
          id: 'sd-retries-idempotency',
          title: 'Debug: retries that charge customers twice',
          type: 'debugging',
          difficulty: 'advanced',
          priority: 'must',
          tags: ['retries', 'idempotency', 'backoff', 'jitter', 'timeouts'],
          estMinutes: 10,
          roles: ['backend', 'full-stack'],
          prompt: `During a payment provider incident, some customers were **charged twice** and the provider's API got **hammered in synchronized waves**. Here is our client code. **Find the problems and fix them.**`,
          code: {
            language: 'typescript',
            source: `async function chargeWithRetry(orderId: string, amount: number) {
  for (let attempt = 1; attempt <= 10; attempt++) {
    try {
      return await fetch('https://pay.example.com/charges', {
        method: 'POST',
        body: JSON.stringify({ orderId, amount }),
      }).then((r) => r.json())
    } catch (err) {
      await new Promise((r) => setTimeout(r, 1000))
    }
  }
  throw new Error('payment failed')
}`,
          },
          intent: `Tests whether you understand that a timeout is ambiguous and that naive retries cause both duplicates and retry storms. A strong answer finds all four bugs (no idempotency key, fixed delay, wrong error classification, no timeout and too many attempts), fixes them in code, and describes the server side of idempotency.`,
          hints: [
            `If the request timed out, did the charge happen or not? Can the client know?`,
            `Every client waits exactly one second, then all retry together. What does that do to a recovering provider?`,
            `fetch only rejects on network errors. What happens on a 503, and should you retry a 400?`,
            `Fix: a stable Idempotency-Key per order (charge-\${orderId}), AbortSignal.timeout(5000) per attempt, retry only network errors/408/429/5xx (honour Retry-After), at most 3–5 attempts with full jitter: sleep(Math.random() * Math.min(cap, base * 2 ** attempt)).`,
          ],
          answer: `**Four bugs, each with a fix.**

**1. Retries are not idempotent (the double charge).** A timeout or connection reset does not mean the charge failed: the provider may have processed it and the response was lost. Retrying a non-idempotent POST creates a second charge.
*Fix:* send an **idempotency key** that stays the same across retries of the same logical operation (for example derived from \`orderId\`). The server stores the key with the result and returns the original result for duplicates. Most payment APIs support an \`Idempotency-Key\` header.

**2. Fixed delay, so a thundering herd.** Every client retries at exactly 1s, 2s, 3s… in sync, hitting a recovering service in waves.
*Fix:* **exponential backoff with jitter**: \`delay = random(0, min(cap, base × 2^attempt))\` ("full jitter").

**3. Retrying the wrong things, and not retrying the right ones.** \`fetch\` resolves on HTTP errors, so a 503 is treated as success and \`r.json()\` returns an error body. And if it did throw on a 400 (bad request), retrying would never help.
*Fix:* retry only **transient** failures: network errors, timeouts, 408, 429 (respect \`Retry-After\`) and 5xx. Fail fast on other 4xx responses.

**4. No timeout and too many attempts.** A hung request can wait forever, and 10 attempts multiply load during an outage.
*Fix:* a per-attempt timeout (\`AbortSignal.timeout\`), a small max (3–5), and an overall deadline. At scale, add a **circuit breaker** or retry budget so that callers stop retrying when the dependency is clearly down.

\`\`\`ts
const RETRYABLE = new Set([408, 429, 500, 502, 503, 504])

async function chargeWithRetry(orderId: string, amount: number) {
  const idempotencyKey = \`charge-\${orderId}\`
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch('https://pay.example.com/charges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
        body: JSON.stringify({ orderId, amount }),
        signal: AbortSignal.timeout(5000),
      })
      if (res.ok) return await res.json()
      if (!RETRYABLE.has(res.status)) throw new NonRetryableError(res.status)
    } catch (err) {
      if (err instanceof NonRetryableError) throw err
    }
    const cap = Math.min(10_000, 250 * 2 ** attempt)
    await sleep(Math.random() * cap) // full jitter
  }
  throw new Error('payment failed after retries')
}
\`\`\`

**On the server side**, idempotency means: a unique constraint on \`(idempotency_key)\`, storing the response, and handling a concurrent duplicate (return 409 or wait) while the first request is still in progress.`,
          walkthrough: [
            {
              title: 'Restate the incident',
              body: `Two symptoms: **double charges** and **synchronized waves** of retries. The first is a correctness bug (non-idempotent retries); the second is a load bug (fixed delays). Look for both in the loop.`,
            },
            {
              title: 'Find the four bugs',
              body: `1. A timeout does not mean failure; retrying a non-idempotent POST can charge twice.
2. A fixed 1 s delay synchronizes every client.
3. \`fetch\` resolves on 503, so errors look like success; and a 400 would be retried pointlessly.
4. No per-attempt timeout, and 10 attempts amplify load during an outage.`,
            },
            {
              title: 'Write the fixed client',
              body: `\`\`\`ts
const RETRYABLE = new Set([408, 429, 500, 502, 503, 504])
const key = \`charge-\${orderId}\` // stable across retries
for (let attempt = 0; attempt < 4; attempt++) {
  try {
    const res = await fetch(url, { method: 'POST', body,
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key },
      signal: AbortSignal.timeout(5000) })
    if (res.ok) return await res.json()
    if (!RETRYABLE.has(res.status)) throw new NonRetryableError(res.status)
  } catch (e) { if (e instanceof NonRetryableError) throw e }
  await sleep(Math.random() * Math.min(10_000, 250 * 2 ** attempt)) // full jitter
}
\`\`\``,
            },
            {
              title: 'Cover the server side and the edges',
              body: `Server: a unique constraint on the idempotency key, store the response, return it for duplicates, and return 409 (or wait) for a concurrent in-flight duplicate. Also respect \`Retry-After\`, add a **circuit breaker** or retry budget, and retry at one layer only.`,
            },
            {
              title: 'Say it in 30 seconds',
              body: `"A timeout is ambiguous, so retries must carry a stable idempotency key or we double-charge. Fixed delays sync everyone into waves, so I use exponential backoff with full jitter. fetch doesn't throw on 5xx, so I classify status codes and retry only transient ones, with a per-attempt timeout and a small attempt cap, plus a circuit breaker at scale."`,
            },
          ],
          keyPoints: [
            'A timeout is ambiguous: the side effect may have happened',
            'Idempotency keys stable across retries make retries safe',
            'Exponential backoff with jitter prevents synchronized retry storms',
            'Retry only transient errors (network, 429, 5xx); respect Retry-After',
            'Per-attempt timeouts, bounded attempts and circuit breakers',
          ],
          pitfalls: [
            'Generating a new idempotency key on each retry',
            'Assuming fetch rejects on HTTP error statuses',
            'Retrying at every layer (client, gateway, service), which multiplies load exponentially',
          ],
          followUps: ['How would you implement idempotency keys on the server with Postgres?', 'What is a circuit breaker and what are its states?'],
          personalAngle:
            'Your scraping recovery logic faced the same question: when a scrape job timed out, was the data already written? Explain how you made re-runs safe (upserts, dedupe keys).',
          references: [{ label: 'AWS Architecture Blog: Exponential backoff and jitter', url: 'https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/' }],
        },
        {
          id: 'sd-rate-limiting',
          title: 'Designing a rate limiter',
          type: 'concept',
          difficulty: 'core',
          priority: 'should',
          tags: ['rate-limiting', 'token-bucket', 'redis', 'api-gateway'],
          estMinutes: 8,
          roles: ['backend'],
          prompt: `Design rate limiting for a public API: **100 requests per minute per API key**, across 10 API instances. Which algorithm, where does the state live, and what does the client see?`,
          intent: `Tests whether you can pick a rate-limiting algorithm and make it correct across many instances. A strong answer compares the algorithms (including the fixed-window boundary burst), keeps state in Redis with an atomic update, defines the 429 contract, and decides fail-open vs fail-closed.`,
          hints: [
            `Compare fixed window, sliding window and token bucket. What happens at a window boundary with a fixed window?`,
            `With 10 instances, what limit do per-instance memory counters actually enforce?`,
            `The check and the increment must be one atomic step. How do you do that in Redis?`,
            `Token bucket or sliding-window counter in Redis via a Lua script (or INCR + EXPIRE for a fixed window) keyed by API key; 429 + Retry-After + RateLimit-* headers; enforce at the gateway; usually fail open with a local fallback if Redis is down.`,
          ],
          answer: `**Use a token bucket (or a sliding-window counter) with its state in Redis, enforced at the gateway or in middleware, and return 429 with useful headers.**

**Algorithms:**
- **Fixed window** (a counter per minute): simple, but allows a burst of 2× at the boundary (100 at 0:59 and 100 at 1:00).
- **Sliding window log:** store each request's timestamp. Exact, but memory grows with traffic.
- **Sliding window counter:** weight the previous window's count by the overlap. A good approximation and cheap.
- **Token bucket:** tokens refill at a rate r up to a capacity b, and each request takes one. It allows **controlled bursts** and a smooth average. This is the most common choice (used by AWS and Stripe-style APIs).
- **Leaky bucket:** a queue drained at a fixed rate. It smooths output, which suits outbound calls to a fragile dependency.

**Distributed state:** 10 instances with in-memory counters would allow up to 1,000/min. Keep the counter in **Redis**, and make check-and-update **atomic** with a Lua script (or \`INCR\` plus \`EXPIRE\` for a fixed window) so concurrent requests cannot race.
\`\`\`lua
-- fixed window, KEYS[1] = rl:{apiKey}:{minute}
local n = redis.call('INCR', KEYS[1])
if n == 1 then redis.call('EXPIRE', KEYS[1], 60) end
return n
\`\`\`

**Client contract:**
- Respond **429 Too Many Requests** with \`Retry-After\`, plus \`RateLimit-Limit\`, \`RateLimit-Remaining\` and \`RateLimit-Reset\` headers.
- Document limits per plan and per endpoint (expensive endpoints cost more tokens).

**Design decisions to mention:**
- **Where:** at the edge or API gateway (cheap rejection before work), with finer limits in the app (per user, per endpoint).
- **Key:** API key or user id; IP address only for unauthenticated traffic (NAT and proxies make IPs shared).
- **If Redis fails:** fail open (availability) or fail closed (protection). Usually fail open with a local fallback limit.
- **Latency:** one Redis round trip per request; batch or use local approximations at very high QPS.
- Different from **load shedding**, which protects the server regardless of who is calling.`,
          keyPoints: [
            'Fixed window boundary burst vs sliding window vs token bucket',
            'Shared state in Redis; per-instance counters do not work',
            'Atomic check-and-increment (Lua or INCR + EXPIRE)',
            '429 with Retry-After and rate-limit headers',
            'Fail-open vs fail-closed when the limiter store is down',
          ],
          pitfalls: ['In-memory counters per instance behind a load balancer', 'A non-atomic GET then SET, which races under concurrency'],
          followUps: ['How would you rate-limit login attempts differently from API calls?'],
          references: [{ label: 'MDN: 429 Too Many Requests', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429' }],
        },
      ],
    },
    {
      id: 'sd-case-studies',
      title: 'Full design prompts',
      summary: 'Mid-level design rounds end to end, several tied to systems you have built.',
      questions: [
        {
          id: 'sd-url-shortener',
          title: 'Design a URL shortener',
          type: 'system-design',
          difficulty: 'core',
          priority: 'must',
          tags: ['url-shortener', 'id-generation', 'caching', 'redirects', 'analytics'],
          estMinutes: 40,
          roles: ['backend', 'full-stack', 'general'],
          companyTypes: ['startup', 'mid-size', 'big-tech', 'japan-international'],
          prompt: `Design a URL shortening service like bit.ly: users create short links, anyone opening a short link is redirected, and link owners see click counts. Assume **100M new links per month** and **a 100:1 read-to-write ratio**.`,
          intent: `Tests a full, classic design round end to end at mid-level depth. A strong answer estimates traffic and storage, designs a collision-free and unguessable code scheme, keeps the redirect hot path cache-heavy and independent of analytics, and discusses 301 vs 302, abuse and scaling.`,
          hints: [
            `Estimate redirect QPS and 5-year storage first. How many characters of base62 do you need?`,
            `How will you generate short, unique codes without collisions, guessable sequences or a single bottleneck?`,
            `Redirects are the hot path. What can be cached, and should click counting be on that path?`,
            `Numbers: ~40 writes/s, ~4k redirects/s, ~3 TB over 5 years, 7 base62 chars ≈ 3.5T codes. Codes: random 7 chars + unique constraint (or scrambled counter / range leases). Path: CDN → redirect service → Redis → DB; 302 for analytics; click events to a queue, aggregated async.`,
          ],
          answer: `**Requirements**
- Functional: create a short link (optional custom alias and expiry); redirect; click analytics for owners.
- Non-functional: redirects are low-latency (p99 < 50 ms) and highly available; codes are unique and not trivially guessable; analytics may lag by minutes.

**Estimates**
- Writes: 100M/month ≈ **40/s** on average (peak ~200/s).
- Reads: 100× → **~4,000 redirects/s** on average (peak ~20k/s).
- Storage: 100M × 12 months × 5 years = 6B links × ~500 B ≈ **3 TB**.
- Code length: base62 with 7 characters gives 62⁷ ≈ 3.5 trillion codes, which is plenty.

**API**
\`\`\`http
POST /api/links { longUrl, customAlias?, expiresAt? } → 201 { code, shortUrl }
GET  /:code → 301/302 Location: longUrl
GET  /api/links/:code/stats → { clicks, byDay[] }
\`\`\`
**301 or 302:** a 301 is cached by browsers (less load, but you lose click counts and cannot change the target), so use **302** when analytics matter.

**Data model**
- \`links(code PK, long_url, owner_id, created_at, expires_at)\`. The access is a pure key-value lookup by code, so Postgres (partitioned later) or a KV store like DynamoDB both work.
- \`click_events\` go to an append-only stream, and rollups go to \`link_daily_clicks(code, day, count)\`.

**Code generation (the key deep dive)**
1. **Hash the long URL** (for example the first 7 base62 chars of SHA-256). Collisions must be checked and retried, and the same URL from different users maps to the same code, which may be undesirable.
2. **Counter + base62:** a unique id encoded in base62. No collisions, but sequential codes are guessable. Shuffle the id (a bijective scramble) or use a **range allocator** where each app server leases a block of 10,000 ids from a coordinator (a DB sequence or ZooKeeper), so there is no per-request coordination.
3. **Random 7 chars plus a unique constraint**, with a retry on conflict. Simple, and collisions are rare while the space is mostly empty.

I would choose **random or scrambled-counter codes with a unique constraint**: simple, unguessable and horizontally scalable.

**Architecture**
Client → CDN/edge → LB → stateless **redirect service** → **Redis cache** (code → URL; the hit ratio is very high because popular links are a small hot set) → DB on a miss.
A separate **write API** validates the URL (scheme allow-list, malware or blocklist check) and inserts the link.
**Clicks:** the redirect handler publishes an event to a queue or log (Kafka, Kinesis or a Redis stream) asynchronously and **never blocks the redirect**. A consumer aggregates counts into rollup tables.

**Deep dives and trade-offs**
- **Hot links:** the cache absorbs them. For extreme virality, add edge caching of the 302 with a short TTL (giving up some click accuracy) or a local in-process LRU.
- **Expiry:** check \`expires_at\` on read and clean up lazily with a background job.
- **Abuse:** rate-limit creation per user or IP, scan target URLs, and allow reporting.
- **Availability:** redirects are read-only, so DB replicas plus the cache keep them working even if the write path is down.
- **Analytics accuracy vs latency:** eventual counts, plus dedupe of bot traffic.

**At 10×:** shard links by a hash of the code, run multi-region read replicas, and serve redirects from the edge.`,
          walkthrough: [
            {
              title: 'Clarify requirements and scale',
              body: `Functional: create (custom alias, expiry), redirect, click stats. Non-functional: redirect p99 < 50 ms, high availability, unguessable codes, analytics may lag. Numbers: 100M/month ≈ **40 writes/s**, 100:1 → **~4k redirects/s**, 6B links × 500 B ≈ **3 TB**; base62⁷ ≈ 3.5T codes.`,
            },
            {
              title: 'Define the API and data model',
              body: `\`\`\`http
POST /api/links { longUrl, customAlias?, expiresAt? } → 201 { code, shortUrl }
GET  /:code → 302 Location: longUrl
GET  /api/links/:code/stats
\`\`\`
\`links(code PK, long_url, owner_id, created_at, expires_at)\` is a pure key-value lookup. Clicks go to an append-only stream; rollups to \`link_daily_clicks\`.`,
            },
            {
              title: 'Draw the architecture',
              body: `Client → CDN/edge → LB → stateless **redirect service** → **Redis** (code → URL, very high hit ratio) → DB on miss. A separate write API validates URLs (scheme allow-list, malware check). The redirect handler **publishes click events asynchronously** and never waits for analytics.`,
            },
            {
              title: 'Deep dive: code generation and hot links',
              body: `Options: hash + truncate (collisions, same URL → same code), counter + base62 (guessable unless scrambled; range leases avoid coordination), **random 7 chars + unique constraint** (simple, retry on rare conflict). Hot links: cache, local LRU, or short edge caching of the 302. Expiry checked on read, cleaned lazily.`,
            },
            {
              title: 'Trade-offs and how to present it in 45 minutes',
              body: `**301 vs 302:** 301 is cached by browsers (less load, lost analytics, can't change target), so use 302. Also abuse limits, eventual analytics, and at 10x: shard by hash of code and serve from the edge. Spend most of the time on code generation and the read path; mention analytics briefly.`,
            },
          ],
          keyPoints: [
            'Estimates: ~4k redirects/s, ~3 TB over 5 years, 7-char base62 is enough',
            'Code generation options and their trade-offs (hash, counter + base62, random + unique)',
            'Cache-heavy read path; redirects must not wait for analytics',
            '301 vs 302 and its effect on analytics',
            'Abuse prevention and expiry handling',
          ],
          pitfalls: [
            'Writing click counts synchronously in the redirect path',
            'Ignoring collisions when truncating a hash',
            'Sequential guessable codes that let anyone enumerate links',
          ],
          followUps: ['How would you support custom domains per customer?', 'How would you remove a malicious link that is already cached at the edge?'],
        },
        {
          id: 'sd-notification-service',
          title: 'Design a notification service',
          type: 'system-design',
          difficulty: 'core',
          priority: 'should',
          tags: ['notifications', 'queues', 'fan-out', 'preferences', 'idempotency'],
          estMinutes: 40,
          roles: ['backend', 'full-stack'],
          prompt: `Design a notification service used by other internal services to send **email, push and in-app notifications**. It must respect user preferences and quiet hours, avoid duplicates, and survive provider outages. Assume **~50M notifications per day** with spikes during marketing campaigns.`,
          intent: `Tests whether you can design an asynchronous, multi-channel delivery system that is fair, deduplicated and resilient to provider failures. A strong answer accepts with 202, routes through preferences and quiet hours, isolates transactional from bulk traffic, uses per-channel queues with provider rate limits, and handles duplicates and failover.`,
          hints: [
            `Separate accepting a request from delivering it. What status code does the API return?`,
            `Each channel (email, push, in-app) has different providers, limits and failure modes. How do you keep one from blocking another?`,
            `A 5M-user marketing campaign starts. How do you make sure a password reset still arrives in seconds?`,
            `Shape: ingest API (idempotencyKey unique, outbox) → router workers (preferences, quiet hours as delayed jobs, templates) → per-channel queues with priority lanes → provider adapters (rate limits, retries + jitter, circuit breaker, secondary provider) → status webhooks; in-app inbox + SSE/WebSocket push.`,
          ],
          answer: `**Requirements**
- Functional: \`send(userId, templateId, data, channels?)\`; user preferences per category and channel; quiet hours and time zones; templates; an in-app inbox with read and unread state; delivery status.
- Non-functional: at-least-once delivery with **no visible duplicates**; transactional messages (password reset) delivered within seconds even during a marketing blast; provider outages must not lose messages.

**Estimates:** 50M/day ≈ 600/s on average; campaigns may hit **10k+/s** for minutes. Delivery logs: ~50M rows/day, kept for 30–90 days and then archived.

**API (internal)**
\`\`\`http
POST /notifications
{ idempotencyKey, userId, category: "security" | "marketing" | ..., templateId, data, priority }
→ 202 { notificationId }
GET /users/:id/inbox?cursor=...   PATCH /inbox/:id { read: true }
\`\`\`
The API returns **202 Accepted**: delivery is asynchronous.

**Data**
- \`notifications(id, idempotency_key UNIQUE, user_id, category, template_id, payload, status, created_at)\`
- \`deliveries(notification_id, channel, provider, status, attempts, provider_message_id, updated_at)\`
- \`preferences(user_id, category, channel, enabled)\`, plus quiet hours and time zone; cached in Redis.
- \`device_tokens(user_id, platform, token, last_seen)\`
- The inbox table is partitioned by user, newest first.

**Architecture**
1. **Ingest API** validates the request, dedupes on \`idempotencyKey\` (unique constraint), stores the notification, and publishes it to a queue. Uses the transactional outbox pattern.
2. **Router workers** load preferences, apply quiet hours (a delayed job until the morning in the user's time zone), choose channels, render templates, and enqueue **one job per channel**.
3. **Per-channel queues and workers** (email, push, in-app), each with its own concurrency and rate limit matching the provider's quota (SES, FCM/APNs).
4. **Priority isolation:** separate queues (or priorities) for transactional vs bulk traffic, so a 5M-user campaign never delays password resets.
5. **Provider adapters** with timeouts, retries with backoff and jitter, a circuit breaker, and **failover to a secondary provider** for email.
6. **Status tracking:** provider webhooks (delivered, bounced, complained) update \`deliveries\`; hard bounces and invalid push tokens are disabled automatically.
7. **In-app:** write to the inbox table and push in real time via WebSocket or SSE if the user is online.

**Deep dives**
- **Duplicates:** at-least-once queues mean a worker can crash after sending but before acknowledging. Mitigate with a per-delivery idempotency key passed to the provider where supported, and a "sent" marker checked before sending. Exactly-once is impossible end to end, so the goal is to minimise duplicates.
- **Fan-out campaigns:** a campaign job pages through the audience in batches and enqueues gradually (throttled), instead of 5M jobs at once.
- **Ordering:** usually not required, except in-app read state; use timestamps.
- **Compliance:** unsubscribe links, respecting opt-outs (marketing) while security messages are always sent, and storing consent.
- **Observability:** queue age per channel, send rate, bounce rate, and provider error rate, with alerts.

**Trade-offs:** latency vs throughput (batching sends), cost (SMS is expensive, so make it opt-in), and consistency of preferences (cache TTL means a just-disabled preference may lag by seconds, which is acceptable except for legal opt-outs, which invalidate the cache immediately).`,
          walkthrough: [
            {
              title: 'Clarify requirements and scale',
              body: `\`send(userId, templateId, data, channels?)\`, preferences per category and channel, quiet hours and time zones, an in-app inbox, delivery status. At-least-once with **no visible duplicates**; transactional messages in seconds even during campaigns. 50M/day ≈ 600/s average, **10k+/s** bursts.`,
            },
            {
              title: 'Define the API and data model',
              body: `\`POST /notifications { idempotencyKey, userId, category, templateId, data, priority } → 202\`. Tables: \`notifications\` (unique idempotency_key), \`deliveries\` per channel with status and attempts, \`preferences\` (cached in Redis), \`device_tokens\`, and an inbox partitioned by user.`,
            },
            {
              title: 'Draw the architecture',
              body: `Ingest API (dedupe + outbox) → **router workers** (preferences, quiet hours as delayed jobs, render templates) → **one queue per channel**, with separate transactional and bulk lanes → provider adapters with rate limits matching SES/FCM/APNs quotas → provider webhooks update delivery status. In-app: write to inbox, push via SSE or WebSocket if online.`,
            },
            {
              title: 'Deep dive: duplicates, campaigns, failures',
              body: `- A worker can crash after sending but before acking: pass a per-delivery id to providers that support it, and check a "sent" marker first.
- Campaigns page through the audience and enqueue gradually.
- Provider outages: retries with jitter, circuit breaker, **failover to a secondary email provider**.
- Hard bounces and dead push tokens are disabled automatically.`,
            },
            {
              title: 'Trade-offs and how to present it in 45 minutes',
              body: `Name latency vs batching, SMS cost, and preference-cache staleness (legal opt-outs invalidate immediately). Lead with the accept/deliver split and priority isolation, since they answer the hardest requirement, then go deep on dedupe and provider failover.`,
            },
          ],
          keyPoints: [
            'Accept fast (202) and deliver asynchronously via queues',
            'Preferences, quiet hours and time zones applied in a routing step',
            'Per-channel queues with provider-specific rate limits and priority isolation',
            'Idempotency keys and dedupe; at-least-once means minimising duplicates',
            'Provider failover, circuit breakers, bounce and token cleanup',
          ],
          pitfalls: [
            'One shared queue, so marketing blasts delay security emails',
            'Sending synchronously inside the caller request',
            'Ignoring provider rate limits and getting throttled or banned',
          ],
          followUps: ['How would you add digesting (one email summarising ten events)?', 'How would you test template changes safely?'],
        },
        {
          id: 'sd-job-scraping-pipeline',
          title: 'Design a job-scraping and matching pipeline',
          type: 'system-design',
          difficulty: 'advanced',
          priority: 'must',
          tags: ['scraping', 'pipeline', 'bullmq', 'redis', 'deduplication', 'matching', 'puppeteer'],
          estMinutes: 45,
          roles: ['backend', 'full-stack'],
          prompt: `Design a system that **scrapes job postings from ~200 job boards and company career pages daily**, normalises and deduplicates them, and **matches them to user profiles**, notifying users of strong matches. Some sites need a headless browser; some block aggressive scrapers.`,
          intent: `Tests whether you can design a multi-stage, failure-prone data pipeline with cost and politeness constraints, and is a chance to show real experience. A strong answer stages the pipeline with queues, separates cheap HTTP fetches from expensive browsers, keeps raw pages, dedupes in two levels, matches in two stages, and treats recovery and per-source health as first-class.`,
          hints: [
            `Break it into stages connected by queues: discover, fetch, parse, normalise, dedupe, match, notify. Why queues between them?`,
            `Headless browsers are expensive and some sites block you. How do you limit concurrency per site and overall?`,
            `The same job appears on several boards with slightly different text. How do you detect that cheaply and then fuzzily?`,
            `Shape: scheduler with a stable jobId per source/day → discovery → HTTP pool + small browser pool with per-domain limiters → raw HTML in S3 → per-source parsers (JSON-LD first) → dedupe by canonical URL/ATS id then SimHash fingerprint → SQL prefilter + embedding scoring → digest notifications; idempotent upserts, DLQ, stalled-job recovery, parse-rate alerts.`,
          ],
          answer: `**Requirements**
- Functional: scheduled crawling per source; parsing into a common schema (title, company, location, salary, description, url, posted date); dedupe across sources; matching to user profiles (skills, location, seniority); notify on matches above a threshold; mark postings closed when they disappear.
- Non-functional: politeness (respect robots.txt and terms, per-domain rate limits); resilience to site changes and blocking; freshness within ~24 h; cost control (browsers are expensive); observability per source.

**Estimates:** 200 sources × ~500 postings ≈ **100k postings/day**, most unchanged. Page fetches ≈ 100k–300k/day ≈ 2–4/s on average, which is modest. Browser pages take ~2–5 s each, so the cost is dominated by browser time, not QPS.

**Pipeline (stages connected by queues, e.g. BullMQ on Redis)**
1. **Scheduler** creates a \`crawl-source\` job per source on a cron schedule, using a stable **jobId per source and day** so that duplicates are ignored.
2. **Discovery workers** fetch listing pages and emit \`fetch-posting\` jobs for new or changed URLs (compare against \`seen_urls\` with last-modified or a content hash).
3. **Fetch workers**: two pools. **HTTP fetchers** (cheap, high concurrency) for static pages and JSON APIs; **browser workers** (Puppeteer or Playwright; few, pooled contexts) only for sources marked \`needsBrowser\`. Use a **per-domain rate limiter** (a BullMQ group or limiter key per domain) and global browser concurrency. Store the raw HTML in object storage, so parsing can be re-run without refetching.
4. **Parse and normalise** with per-source adapters (selectors or JSON-LD \`JobPosting\` when present) into the common schema. Normalise location, salary and currency, and extract skills against a taxonomy.
5. **Dedupe:** an exact match on the canonical URL or the ATS job id; a near-duplicate match with a fingerprint of (normalised company + title + location) plus a **SimHash or MinHash** of the description. Merge into one canonical \`job\` with several \`job_sources\`.
6. **Matching:** a two stage approach. A cheap SQL filter (location, seniority, required skills overlap via GIN index or pgvector prefilter), then scoring (weighted skills match plus embedding similarity between the profile and the description). Store \`matches(user_id, job_id, score, reasons)\`.
7. **Notify:** enqueue digests (daily) or instant alerts above a threshold, via the notification service.

**Data:** Postgres for \`sources\`, \`jobs\`, \`job_sources\`, \`matches\`, \`users/profiles\` (pgvector for embeddings); Redis for queues, rate limiters and short-lived dedupe sets; S3 for raw pages.

**Reliability deep dive**
- Every job is **idempotent**: upsert by canonical keys, so re-running a stage is safe.
- **Retries with backoff and jitter**; after N failures, move the job to a **failed or DLQ state**, with alerting **per source**.
- **Stalled job recovery:** browser workers crash or hang. Use timeouts per page, kill zombie Chrome processes, and rely on BullMQ's stalled-job detection to re-queue the work. A **recovery job** re-enqueues sources whose last crawl did not complete.
- **Site changes:** detect when the parse success rate for a source drops (for example 0 postings or missing fields) and alert, instead of silently storing garbage. Keep raw HTML for re-parsing after the selector fix.
- **Blocking:** respect rate limits, rotate user agents only within the site's terms, back off on 429 or 403, and prefer official APIs, ATS feeds (Greenhouse, Lever) or JSON-LD when available.

**Trade-offs:** freshness vs cost (crawl high-yield sources more often); precision vs recall in dedupe (a false merge hides a job, a missed merge shows a duplicate, so tune thresholds and allow manual unmerge); embeddings improve matching but add cost and latency, so compute them once per new job, not per user.

**Observability:** per-source dashboards for postings found, parse errors, duration and blocks; queue depth and age per stage; browser pool utilisation.`,
          walkthrough: [
            {
              title: 'Clarify requirements and scale',
              body: `Daily crawl of ~200 sources, common schema, cross-source dedupe, matching to profiles, notifications, closing removed postings. Non-functional: politeness, resilience to site changes, 24 h freshness, cost control. ~100k postings/day ≈ 2–4 fetches/s: cost is **browser time**, not QPS.`,
            },
            {
              title: 'Define the data model',
              body: `Postgres: \`sources\`, \`jobs\` (canonical), \`job_sources\` (one row per board), \`profiles\` with pgvector embeddings, \`matches(user_id, job_id, score, reasons)\`. Redis for queues, rate limiters and short dedupe sets. S3 for raw HTML so parsing can be re-run.`,
            },
            {
              title: 'Draw the pipeline',
              body: `Scheduler (stable jobId per source and day) → discovery → **two fetch pools**: cheap HTTP and a small pooled browser pool for \`needsBrowser\` sources, both behind **per-domain rate limits** → parse/normalise (JSON-LD \`JobPosting\` first) → dedupe → match → notify. Each stage is a BullMQ queue and every job is an idempotent upsert.`,
            },
            {
              title: 'Deep dive: dedupe, matching and recovery',
              body: `- **Dedupe:** exact canonical URL or ATS id, then a fingerprint of company + title + location plus SimHash/MinHash of the description.
- **Matching:** SQL prefilter (location, seniority, skills via GIN or pgvector), then weighted scoring with embeddings computed once per job.
- **Recovery:** page timeouts, kill zombie Chrome, stalled-job detection, DLQ, a recovery job for incomplete crawls, alerts when a source's parse rate drops.`,
            },
            {
              title: 'Trade-offs and how to present it in 45 minutes',
              body: `Freshness vs cost, dedupe precision vs recall (allow manual unmerge), embeddings vs latency. Present it as what you actually built (Puppeteer, Redis, recovery jobs, matching over thousands of records), then what you would add at 10x. Spend the deep dive on reliability, where your experience is strongest.`,
            },
          ],
          keyPoints: [
            'Staged pipeline connected by queues, each stage idempotent',
            'Separate cheap HTTP fetchers from expensive browser workers; per-domain rate limits',
            'Store raw pages so parsing can be re-run',
            'Two-level dedupe: canonical keys, then near-duplicate fingerprints',
            'Recovery: timeouts, stalled-job handling, DLQ and per-source health alerts',
          ],
          pitfalls: [
            'Using a headless browser for every page',
            'No per-domain politeness, leading to blocks and possible legal issues',
            'Silent failures when a site changes its markup',
          ],
          followUps: ['How would you let users give feedback that improves matching?', 'How would you backfill matches when a user updates their profile?'],
          personalAngle:
            'This is Scrape & Compare plus your Efilli scraping work. Lead with what you actually built (Puppeteer, Redis, scheduled and recovery jobs, matching over thousands of records), then show what you would add at 10× scale.',
          references: [{ label: 'BullMQ documentation', url: 'https://docs.bullmq.io/' }],
        },
        {
          id: 'sd-realtime-chat',
          title: 'Design real-time chat with presence',
          type: 'system-design',
          difficulty: 'advanced',
          priority: 'should',
          tags: ['websockets', 'chat', 'presence', 'pub-sub', 'ordering'],
          estMinutes: 45,
          roles: ['backend', 'full-stack'],
          prompt: `Design a chat feature for a B2B product: **1:1 and group conversations (up to 500 members)**, real-time delivery, unread counts, message history, and **online/typing presence**. Assume **1M daily active users and 2M concurrent connections at peak**.`,
          intent: `Tests whether you can design stateful real-time infrastructure with durability and ordering guarantees. A strong answer separates stateful gateways from stateless chat logic, persists before acking, orders by per-conversation sequence numbers, treats pub/sub as lossy with a resync path, and keeps presence cheap and ephemeral.`,
          hints: [
            `How does a message reach a user connected to a different gateway server than the sender?`,
            `Which data must be durable and strictly ordered (messages), and which can be lossy (typing, presence)?`,
            `Clients reconnect and may have missed messages. How do they know, without trusting clocks?`,
            `Shape: WebSocket gateways (~50k conns each) registering user → gateway in Redis; stateless chat service assigns per-conversation seq, persists, then acks; fan-out via Redis pub/sub/NATS; clients detect seq gaps and fetch; presence = TTL keys refreshed by heartbeats, sent only to viewers; typing via pub/sub only, throttled.`,
          ],
          answer: `**Requirements**
- Functional: send and receive messages in real time; history with pagination; unread counts; delivered and read receipts (optional); online and typing indicators; offline users see messages later or get a push.
- Non-functional: message delivery latency < 200 ms p95; **no message loss**; per-conversation ordering; presence can be approximate.

**Estimates:** 2M concurrent WebSockets at ~50k connections per gateway node ≈ **40+ gateway nodes**. If 1M DAU send 40 messages/day = 40M messages/day ≈ 500/s on average, peaking at a few thousand per second; with groups, fan-out multiplies deliveries. Storage: 40M × 1 KB ≈ 40 GB/day.

**API**
- WebSocket events: \`send {clientMsgId, conversationId, body}\`, \`message\`, \`ack {clientMsgId, serverId, seq}\`, \`typing\`, \`presence\`, \`read {conversationId, seq}\`.
- REST: \`GET /conversations/:id/messages?before=seq&limit=50\`, \`GET /conversations\` with unread counts.

**Data**
- \`messages(conversation_id, seq, id, sender_id, body, created_at)\` with primary key \`(conversation_id, seq)\`. A wide-column store (Cassandra or ScyllaDB) fits huge write volume; Postgres partitioned by conversation works at this scale too.
- \`conversation_members(conversation_id, user_id, last_read_seq)\`; the unread count is the latest seq minus last_read_seq.
- **Presence** lives in Redis only: \`presence:{userId}\` with a 60 s TTL, refreshed by heartbeats.

**Architecture**
1. **Gateway nodes** hold WebSocket connections (stateful). Behind an L4/L7 LB with long-lived connection support. The gateway authenticates on connect and registers \`user → gateway\` in Redis.
2. **Chat service** (stateless): validates membership, assigns a **per-conversation sequence number** (an atomic counter, \`INCR\` in Redis or a DB sequence per conversation), persists the message, and **only then acks** to the sender.
3. **Fan-out via pub/sub**: publish to a channel per conversation or per gateway (Redis pub/sub, NATS or Kafka). Gateways subscribed for their connected users push the message.
4. **Offline users:** the message is already stored; send a push notification via the notification service; on reconnect, the client fetches messages after its last seen seq.

**Deep dives**
- **Ordering and dedupe:** the client sends \`clientMsgId\` (idempotent retry); the server dedupes and assigns \`seq\`; clients render by seq and detect gaps (missed seq), then fetch to fill them. This avoids relying on clock time.
- **Delivery guarantees:** persist before ack; pub/sub is lossy, so **the database is the source of truth** and reconnect-and-sync repairs anything missed.
- **Presence at scale:** heartbeats every 30 s refresh a TTL key; **do not broadcast every change to everyone**. Send presence only to users who currently view a relevant conversation or contact list, and batch or debounce changes. **Typing indicators are ephemeral**: pub/sub only, never stored, throttled to one event per 3 s.
- **Large groups:** fan-out on write to 500 members is fine; for very large channels, have clients pull or subscribe to the channel topic instead of per-user delivery.
- **Gateway failure:** clients reconnect with exponential backoff and jitter (to avoid a reconnect storm), then resync from their last seq.
- **Security:** authorise every send against membership; rate-limit messages; sanitise rendering (XSS).

**Trade-offs:** WebSockets vs SSE plus POST (SSE is simpler but one-directional); Redis pub/sub (simple, lossy) vs Kafka (durable, heavier); strong per-conversation ordering vs global ordering (unnecessary and expensive).`,
          walkthrough: [
            {
              title: 'Clarify requirements and scale',
              body: `1:1 and groups up to 500, history, unread counts, presence and typing, offline push. **No message loss**, per-conversation ordering, < 200 ms p95; presence may be approximate. 2M concurrent sockets ≈ **40+ gateway nodes**; ~40M messages/day ≈ 500/s average.`,
            },
            {
              title: 'Define the API and data model',
              body: `WebSocket events: \`send {clientMsgId, conversationId, body}\`, \`ack {clientMsgId, seq}\`, \`message\`, \`typing\`, \`read\`. REST for history: \`GET /conversations/:id/messages?before=seq\`. \`messages\` keyed by \`(conversation_id, seq)\`; \`conversation_members(last_read_seq)\` gives unread counts; presence only in Redis with a TTL.`,
            },
            {
              title: 'Draw the architecture',
              body: `Stateful **gateways** hold sockets and register \`user → gateway\` in Redis. A stateless **chat service** checks membership, assigns the next **seq**, persists, **then acks**. Fan-out via pub/sub (Redis, NATS or Kafka) to the gateways that hold the recipients. Offline users get a push and sync on reconnect.`,
            },
            {
              title: 'Deep dive: ordering, delivery, presence',
              body: `- \`clientMsgId\` dedupes retries; \`seq\` orders; clients detect **gaps** and fetch. No client clocks.
- Pub/sub is best-effort: **the DB is the source of truth**, reconnect-and-sync repairs misses.
- Presence: heartbeats refresh a 60 s TTL key; send changes only to users viewing relevant screens; typing is ephemeral and throttled.
- Reconnect with jittered backoff to avoid a storm when a gateway dies.`,
            },
            {
              title: 'Trade-offs and how to present it in 45 minutes',
              body: `WebSocket vs SSE + POST, Redis pub/sub (simple, lossy) vs Kafka (durable, heavier), per-conversation vs global ordering. Present gateways and the send path first, then spend the deep dive on "persist, then ack, then fan out" and the resync path; that is where interviewers probe.`,
            },
          ],
          keyPoints: [
            'Stateful WebSocket gateways plus a user-to-gateway registry and pub/sub fan-out',
            'Persist before ack; the DB is the source of truth, pub/sub is best-effort',
            'Per-conversation sequence numbers plus client message ids for ordering and dedupe',
            'Presence via TTL heartbeats in Redis; typing indicators are ephemeral and throttled',
            'Reconnect with jittered backoff and resync from last seq',
          ],
          pitfalls: [
            'Ordering by client timestamps',
            'Broadcasting every presence change to all contacts',
            'Assuming pub/sub delivery is reliable without a resync path',
          ],
          followUps: ['How would you add end-to-end encryption, and what would it break?', 'How would you implement read receipts efficiently in large groups?'],
        },
        {
          id: 'sd-accessibility-scanner-saas',
          title: 'Design an accessibility-scanning SaaS',
          type: 'system-design',
          difficulty: 'advanced',
          priority: 'nice',
          tags: ['multi-tenant', 'saas', 'headless-browser', 'queues', 'accessibility', 'reports'],
          estMinutes: 45,
          roles: ['backend', 'full-stack'],
          prompt: `Design a B2B SaaS that **crawls customers' websites, runs automated accessibility checks on each page, and shows issues and trends in a dashboard**. Customers range from 50-page sites to 200k-page enterprise sites. Scans run on a schedule or on demand.`,
          intent: `Tests multi-tenant job-system design with an expensive, risky worker (a real browser on arbitrary sites). A strong answer gives tenant-fair scheduling, browser pooling and autoscaling, issue fingerprinting across pages and scans, SSRF-safe sandboxing, and partial-failure handling, while being honest about what you built.`,
          hints: [
            `This is a multi-tenant job system. How do you stop one 200k-page scan from starving 50-page customers?`,
            `Running axe-core needs a real browser per page. What dominates cost, and how do you contain memory leaks and crashes?`,
            `The same broken header appears on 50,000 pages. How do you store and present that as one problem, and track it between scans?`,
            `Shape: orchestrator seeds URL frontier (sitemap + crawl, page caps) → per-tenant queues with weighted fair scheduling and per-domain limits → sandboxed browser workers (fresh context per page, recycle every N, no internal network) → result processor computing fingerprints (rule + selector + snippet hash) into issue_groups → precomputed dashboards, async PDF reports.`,
          ],
          answer: `**Requirements**
- Functional: register sites and verify ownership; configure crawl scope (start URLs, include and exclude patterns, auth); scheduled and on-demand scans; per-page results (rule, WCAG criterion, severity, element selector, HTML snippet); dashboards with trends, per-issue grouping, export (CSV or PDF) and a public API or CI integration.
- Non-functional: **tenant isolation** (data and fair resource use); scans finish within an SLA (small sites in minutes, large sites within hours); politeness toward customers' servers; cost control; security (we run a browser on arbitrary sites).

**Estimates:** 1,000 customers with 5k pages average ≈ 5M page scans/week ≈ **8 pages/s on average**, burstier in practice. Each browser page takes ~3–6 s, so ~50–100 concurrent browser pages are needed; browser time is the main cost.

**Data**
- \`tenants\`, \`sites\`, \`scans(id, site_id, status, started_at, finished_at, pages_total, pages_done)\`
- \`pages(scan_id, url, status, http_status, duration)\`
- \`issues(scan_id, page_id, rule_id, impact, wcag, selector, snippet_hash)\` (large: partition by scan or month).
- \`issue_groups(site_id, rule_id, fingerprint, first_seen, last_seen, status)\`: a fingerprint of (rule + normalised selector + snippet hash) groups the **same component problem across thousands of pages** and tracks it between scans (new, fixed, regressed).
- Postgres with row-level tenant scoping (\`tenant_id\` on every table, or RLS policies); object storage for screenshots and raw results.

**Architecture**
1. **API and dashboard** (stateless) for configuration, results and an API for CI ("fail the build if critical issues increase").
2. **Scan orchestrator:** creates a scan, seeds the URL frontier (sitemap.xml plus crawling), dedupes and normalises URLs, enforces the page cap per plan.
3. **Queue per priority and tenant-fair scheduling:** a global queue would let a 200k-page scan starve everyone. Use **per-tenant queues or groups with round-robin or weighted fair scheduling**, per-tenant concurrency caps, and **per-domain rate limits** (to avoid DoSing customers).
4. **Browser workers** in containers: pooled Chromium contexts (a fresh context per page for isolation), load the page, wait for network idle with a timeout, inject the rule engine (axe-core), collect results, optionally take a screenshot. Restart browsers every N pages to contain memory leaks. Autoscale on queue depth.
5. **Result processor:** writes issues in batches, computes fingerprints, updates issue groups and scan progress (live progress through polling or SSE).
6. **Report generation** as async jobs (PDF), plus notifications on scan completion or regressions.

**Deep dives**
- **Security of running untrusted pages:** sandboxed containers with no access to internal networks (block metadata IPs and private ranges, which prevents SSRF), resource limits, and no persistent state between tenants.
- **Authenticated scans:** encrypted customer credentials or recorded login steps, stored in a secrets manager and decrypted only in the worker.
- **Reliability:** idempotent page jobs (keyed by scan + URL), retries with backoff, stalled-job recovery, and a scan marked "partial" rather than failing entirely.
- **Data volume:** issues dominate storage, so keep detailed rows for recent scans and aggregate older ones; dashboards read precomputed aggregates.
- **Accuracy:** automated tools catch only part of WCAG; the UI should say so and support manual review states.

**Trade-offs:** freshness vs cost (incremental scans of changed pages via sitemap lastmod or content hash); per-tenant isolation (shared workers with fair scheduling vs dedicated pools for enterprise plans); depth vs speed (screenshots and full-page states are expensive, so make them opt-in).`,
          walkthrough: [
            {
              title: 'Clarify requirements and scale',
              body: `Site registration and verification, crawl scope, scheduled and on-demand scans, per-page issues with WCAG mapping, trends, exports and CI integration. Non-functional: **tenant isolation and fairness**, scan SLAs, politeness to customer servers, security. ~5M pages/week ≈ 8 pages/s at 3–6 s each → 50–100 concurrent browser pages.`,
            },
            {
              title: 'Define the API and data model',
              body: `\`scans\`, \`pages\`, and \`issues(scan_id, page_id, rule_id, impact, wcag, selector, snippet_hash)\`, partitioned by scan or month. \`issue_groups(site_id, rule_id, fingerprint, first_seen, last_seen, status)\` groups repeated component problems across pages and scans. \`tenant_id\` everywhere, optionally with RLS.`,
            },
            {
              title: 'Draw the architecture',
              body: `API/dashboard → **scan orchestrator** (sitemap + crawl, URL normalisation, plan page caps) → **per-tenant queues with weighted fair scheduling** and per-domain rate limits → **browser workers** (fresh context per page, inject axe-core, recycle every N pages, autoscale on queue depth) → result processor (batched writes, fingerprints, progress via SSE) → async reports and notifications.`,
            },
            {
              title: 'Deep dive: isolation, security, reliability',
              body: `- Sandboxed containers with **egress blocked to private ranges and metadata IPs** (SSRF).
- Authenticated scans with credentials from a secrets manager, decrypted only in the worker.
- Idempotent page jobs keyed by scan + URL, retries, stalled-job recovery, scans marked "partial" instead of failed.
- Keep detailed rows for recent scans, aggregates for older ones.`,
            },
            {
              title: 'Trade-offs and how to present it in 45 minutes',
              body: `Incremental vs full scans, shared fair workers vs dedicated enterprise pools, screenshots as opt-in. Say clearly that automated checks cover only part of WCAG. Since it is close to the Efilli platform, separate what you built from what you would add, and never claim scale you did not have.`,
            },
          ],
          keyPoints: [
            'Multi-tenant fairness: per-tenant queues or groups and concurrency caps',
            'Browser workers are the cost centre: pooling, recycling and autoscaling on queue depth',
            'Issue fingerprinting groups repeated component problems and tracks them across scans',
            'Sandboxing and SSRF protection when rendering arbitrary sites',
            'Idempotent page jobs, partial scans and precomputed aggregates',
          ],
          pitfalls: [
            'One global FIFO queue so a large tenant starves small ones',
            'Listing 50,000 identical issues instead of grouping them',
            'Letting the browser reach internal networks',
          ],
          followUps: ['How would you integrate with customers’ CI to block regressions?', 'How would you price and enforce plan limits?'],
          personalAngle:
            'This is close to the Efilli accessibility platform you led from planning to beta. Be ready to say which parts you built, which decisions you made (and why), and what you would change now. Never claim scale you did not have.',
          references: [{ label: 'W3C: WCAG overview', url: 'https://www.w3.org/WAI/standards-guidelines/wcag/' }],
        },
        {
          id: 'sd-realtime-activity-feed',
          title: 'Design a real-time activity feed for a SaaS (SSE + queue)',
          type: 'system-design',
          difficulty: 'core',
          priority: 'must',
          tags: ['sse', 'websockets', 'real-time', 'fan-out', 'pub-sub', 'outbox', 'feed'],
          estMinutes: 40,
          roles: ['backend', 'full-stack'],
          companyTypes: ['startup', 'mid-size', 'japan-international'],
          prompt: `Design the **activity feed of a B2B project-management SaaS**: when someone creates a task, comments or changes a status, everyone in that workspace sees it **live** ("Aya moved *Checkout bug* to Done"), and can scroll back through history. Some projects are private. Assume **5k workspaces, 500k DAU, 100k concurrent open tabs at peak, ~2k events/s at peak**. Which transport would you choose, and how does an event get from the API to the right browsers?`,
          intent: `Tests whether you can design a real-time path end to end: the transport choice, reliable event capture, fan-out across many server instances, permission filtering, and recovery after disconnects. A strong answer justifies SSE (or WebSocket) from the requirements, uses an outbox and a queue so no event is lost, treats pub/sub as best-effort with a Last-Event-ID resync, and handles private projects and slow clients.`,
          hints: [
            `Is the live traffic two-way or only server to browser? That decides between WebSocket and Server-Sent Events.`,
            `The API writes a task update to Postgres. How do you guarantee the matching feed event is published, even if the process crashes right after the commit?`,
            `Users of one workspace are connected to different gateway instances. How does an event reach all of them, and what does a browser that was offline for 30 seconds do on reconnect?`,
            `Shape: domain write + outbox row in one transaction → relay → queue/stream → feed worker stores feed_events(workspace_id, id, actor, verb, object, project_id) and publishes to Redis channel ws:{id} → SSE gateways subscribed per workspace filter by project ACL and push "id:" lines → client reconnects with Last-Event-ID, gateway replays missed rows from the DB, then goes live; heartbeats every 20 s; bounded per-connection buffers.`,
          ],
          answer: `**Requirements**
- Functional: live feed per workspace; history with infinite scroll; private projects visible only to members; grouped items ("Aya and 3 others commented") are nice to have.
- Non-functional: live latency < 2 s p95; **no lost events** in history; the live stream may briefly miss events as long as clients can catch up; must survive deploys and instance failures.

**Estimates:** 100k concurrent connections at ~20–50k per gateway node → 3–5 gateway nodes plus headroom. 2k events/s peak written once each; average workspace fan-out is small (tens of online users), large workspaces up to thousands. Storage: 2k/s peak, ~50M events/day at most × ~300 B ≈ 15 GB/day, so keep 90 days hot and archive.

**Transport: Server-Sent Events.** The live path is **one-way** (server → browser); actions go through normal REST calls. SSE runs over plain HTTP (works through most proxies, multiplexed on HTTP/2 or HTTP/3), sends cookies automatically, and has **built-in reconnect with \`Last-Event-ID\`**. Choose WebSocket if you need two-way low-latency traffic (collaborative editing, chat, typing). Caveats: \`EventSource\` cannot set custom headers (use the session cookie, or a short-lived token in the URL), proxies must not buffer (\`X-Accel-Buffering: no\`), and you send a heartbeat comment every ~20 s so idle connections are not cut.

**API and data**
\`\`\`http
GET /workspaces/:id/feed?before=<cursor>&limit=50   → history (keyset pagination)
GET /workspaces/:id/feed/stream                      → text/event-stream
\`\`\`
\`feed_events(workspace_id, id, actor_id, verb, object_type, object_id, project_id, data jsonb, created_at)\`, primary key \`(workspace_id, id)\`, where \`id\` is time-ordered (a sequence or UUIDv7). The workspace feed is stored **once per workspace** and filtered on read, not copied into every user's inbox.

**Architecture: the path of one event**
1. The task service updates the task **and inserts an outbox row in the same transaction**.
2. A relay publishes outbox rows to a queue or stream (BullMQ, Redis Streams, or Kafka at larger scale).
3. **Feed workers** (idempotent on event id) insert into \`feed_events\` and \`PUBLISH ws:{workspaceId}\` on Redis pub/sub.
4. **SSE gateways** subscribe to the channels of workspaces that have connected users. For each connection they check visibility (project membership cached per user, invalidated on membership change) and write \`id: <eventId>\\ndata: {...}\\n\\n\`.
5. **Reconnect:** the browser sends \`Last-Event-ID\`; the gateway reads newer rows from \`feed_events\`, sends them, then continues live. Pub/sub is lossy; **the table is the source of truth**.

**Deep dives**
- **Private projects:** filter at the gateway for workspace-scoped feeds. If permissions get complex, publish per-audience channels or compute the audience in the worker.
- **Slow clients and backpressure:** a bounded buffer per connection; if it overflows, close the stream and let the client resync from Last-Event-ID.
- **Big workspaces:** one publish per event per workspace, not per user; gateways fan out locally to their own connections.
- **Deploys and failures:** gateways drain connections; clients reconnect with jittered backoff (the browser's \`retry:\` field plus your own jitter) so a restart is not a thundering herd.
- **Grouping** ("and 3 others") at read time over a time window, not at write time.
- **Observability:** connected clients per node, publish-to-deliver latency, resync count, outbox lag.

**Trade-offs:** SSE vs WebSocket (simplicity vs two-way); Redis pub/sub (simple, lossy) vs Redis Streams or Kafka for the live path (replayable, heavier); fan-out on read (one copy, filter at read) vs fan-out on write (per-user inboxes, needed for personalised "for you" feeds). Polling every 10 s is a valid v1 for small scale; say when you would graduate from it.`,
          walkthrough: [
            {
              title: 'Clarify requirements and scale',
              body: `Live feed per workspace, history, private projects. Live < 2 s; **history must be complete**, the live stream may miss events if clients can catch up. 100k concurrent tabs → a handful of gateway nodes; 2k events/s peak written once each. Ask whether traffic is one-way: it is, so SSE is on the table.`,
            },
            {
              title: 'Define the API and data model',
              body: `\`GET /workspaces/:id/feed?before=cursor\` for history and \`GET /workspaces/:id/feed/stream\` (\`text/event-stream\`) for live. \`feed_events\` keyed by \`(workspace_id, id)\` with a time-ordered id, stored once per workspace and filtered by project visibility on read.`,
            },
            {
              title: 'Draw the event path',
              body: `Task update + **outbox row in one transaction** → relay → queue → idempotent feed worker writes \`feed_events\` and \`PUBLISH ws:{workspaceId}\` → SSE gateways subscribed to that workspace check visibility and push:

\`\`\`text
id: 01J9Z6...
event: activity
data: {"actor":"Aya","verb":"moved","object":"Checkout bug","to":"Done"}
\`\`\``,
            },
            {
              title: 'Deep dive: reconnects, permissions, backpressure',
              body: `- **Reconnect:** the browser sends \`Last-Event-ID\`; the gateway replays newer rows from the table, then goes live. Pub/sub is best-effort; the table is the truth.
- **Private projects:** filter per connection with a cached membership set.
- **Slow clients:** bounded buffer; overflow → close and let the client resync.
- **Ops:** heartbeats every ~20 s, no proxy buffering, drain on deploy, jittered reconnect.`,
            },
            {
              title: 'Trade-offs and how to present it in 45 minutes',
              body: `Justify SSE over WebSocket from "one-way traffic" and mention when you would switch. Contrast Redis pub/sub with Streams/Kafka, and fan-out on read vs write. Spend most of the time on the event path and the reconnect story; that is what separates a working design from a demo.`,
            },
          ],
          keyPoints: [
            'Transport chosen from requirements: SSE for one-way, WebSocket for two-way',
            'Outbox + queue so no committed change loses its event',
            'Redis pub/sub fan-out to stateful gateways; one publish per workspace',
            'Last-Event-ID resync from the DB; pub/sub treated as lossy',
            'Permission filtering, backpressure, heartbeats and jittered reconnects',
          ],
          pitfalls: [
            'Publishing to pub/sub directly from the request handler with no durable record',
            'Choosing WebSocket by default without a reason, then rebuilding reconnect and auth by hand',
            'Copying every event into every user inbox for a workspace-wide feed',
            'Forgetting proxy buffering and idle timeouts, so SSE silently stalls in production',
          ],
          followUps: ['How would you add a personalised "for you" feed with per-user ranking?', 'How would you load-test 100k concurrent SSE connections?'],
          personalAngle:
            'On the accessibility platform, scan progress is a natural live-update case: explain whether you used polling, SSE or WebSockets for it and how you would move to this design.',
          references: [{ label: 'MDN: Using server-sent events', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events' }],
        },
        {
          id: 'sd-webhook-delivery',
          title: 'Design outgoing webhooks for a SaaS',
          type: 'system-design',
          difficulty: 'advanced',
          priority: 'should',
          tags: ['webhooks', 'queues', 'retries', 'hmac', 'multi-tenant', 'ssrf', 'idempotency'],
          estMinutes: 40,
          roles: ['backend', 'full-stack'],
          prompt: `Customers want **webhooks**: they register HTTPS endpoints, subscribe to event types (\`invoice.paid\`, \`scan.completed\`), and your platform POSTs events to them. Expect **~20M events per day**, and assume many customer endpoints are slow, flaky or down for days. **Design the delivery system.** How do customers trust that a request really came from you?`,
          intent: `Tests reliable delivery to systems you do not control: at-least-once semantics, retries over long periods, isolation so one bad endpoint cannot slow everyone, signing, and SSRF safety. A strong answer separates event capture from delivery, isolates per endpoint, defines a clear contract (event ids, signatures, ordering caveats) and gives customers visibility and replay.`,
          hints: [
            `Separate "an event happened" from "we delivered it to endpoint X". How do you capture events so none are lost?`,
            `One customer's endpoint takes 30 s to time out. How do you stop it from delaying deliveries to everyone else?`,
            `Retries will deliver some events twice and out of order. What do you put in the payload and headers so customers can cope, and verify the sender?`,
            `Shape: outbox → event bus → fan-out to one delivery job per (event, endpoint) → per-endpoint queues/concurrency caps with a 5–10 s timeout → exponential backoff with jitter over ~3 days → auto-disable and email after persistent failure; headers webhook-id, webhook-timestamp, HMAC-SHA256 signature of id.timestamp.body; resolve and block private IPs at send time; delivery log + replay UI.`,
          ],
          answer: `**Requirements**
- Functional: endpoint registration per tenant with event-type subscriptions; signed deliveries; retries; delivery logs; manual and bulk replay; a test-send button; secret rotation.
- Non-functional: **at-least-once delivery** (never silently drop), fairness between tenants, bounded latency for healthy endpoints (seconds), and safety: we are sending requests to arbitrary URLs.

**Estimates:** 20M events/day ≈ 230/s on average, peaks maybe 2k/s. With an average of 1.5 subscribed endpoints, ~30M delivery attempts/day before retries. Delivery logs dominate storage, so keep 30 days.

**Contract (what customers see)**
\`\`\`http
POST https://customer.example.com/hooks
webhook-id: evt_01J9...            (stable across retries: dedupe key)
webhook-timestamp: 1767225600
webhook-signature: v1,<base64 HMAC-SHA256(secret, id + "." + timestamp + "." + body)>
{ "id": "evt_01J9...", "type": "invoice.paid", "created": "...", "data": { ... } }
\`\`\`
- Any 2xx within the timeout is success; anything else is retried. Customers should **respond fast and process asynchronously**.
- **No ordering guarantee:** include \`created\` and the object's version, or send thin events ("invoice 42 changed") and let customers fetch the current state.
- The timestamp in the signature lets receivers **reject replays** older than ~5 minutes.

**Architecture**
1. Domain services write an **outbox** row with the event in the same transaction.
2. A relay publishes to an event bus or queue.
3. A **fan-out worker** looks up subscribed endpoints and creates one **delivery job per (event, endpoint)**, idempotent on that pair.
4. **Delivery workers** pull from **per-endpoint (or per-tenant) queues** with concurrency caps, so a slow endpoint only slows itself. Each attempt: resolve DNS, **block private and metadata IPs**, POST with a 5–10 s timeout, no redirects, response size cap.
5. Failures go back with **exponential backoff and jitter** (for example 1 min, 5 min, 30 min, 2 h ... up to ~3 days). After persistent failure, **disable the endpoint** and email the customer; events remain replayable.
6. Every attempt is written to \`delivery_attempts(delivery_id, status_code, duration, error, at)\` for the customer-facing log.

**Deep dives**
- **Isolation:** without per-endpoint queues, a single endpoint that hangs for 30 s ties up all workers (head-of-line blocking). BullMQ groups, per-endpoint rate limits, or a "slow lane" for endpoints with high latency.
- **Circuit breaking:** after N consecutive failures, pause the endpoint for a while instead of hammering it; probe periodically.
- **Secrets:** a per-endpoint signing secret, shown once; **rotation with two active secrets** (sign with both during the overlap).
- **Payload size and PII:** cap the body, avoid sending sensitive fields; fetch-on-demand for large objects.
- **Security:** SSRF is the big one; resolve and validate on every attempt (DNS can change), and run senders in a network segment with no internal access.

**Trade-offs:** fat vs thin payloads (convenience vs freshness and data exposure); per-endpoint queues (fair, more moving parts) vs shared queue with short timeouts (simpler, less fair); retry window length vs storage; strict ordering (per-endpoint serial delivery, slow) vs parallel delivery plus versioned payloads.`,
          walkthrough: [
            {
              title: 'Clarify requirements and scale',
              body: `Registration and subscriptions, signed deliveries, retries, logs, replay, rotation. **At-least-once**, fairness between tenants, seconds of latency for healthy endpoints, and SSRF safety. 20M events/day ≈ 230/s average, ~30M attempts/day before retries.`,
            },
            {
              title: 'Define the contract and data model',
              body: `Headers \`webhook-id\` (stable dedupe key), \`webhook-timestamp\`, \`webhook-signature\` = HMAC-SHA256 over \`id.timestamp.body\`. 2xx = success; no ordering guarantee, so include \`created\` and a version. Tables: \`endpoints\`, \`subscriptions\`, \`deliveries(event_id, endpoint_id, status, next_attempt_at)\` unique on the pair, \`delivery_attempts\` for logs.`,
            },
            {
              title: 'Draw the architecture',
              body: `Outbox → event bus → **fan-out worker** (one delivery job per event × endpoint) → **per-endpoint queues** with concurrency caps → delivery workers (DNS resolve + private-IP block, 5–10 s timeout, no redirects) → retry with backoff and jitter over ~3 days → auto-disable and notify. Attempts logged for the customer UI and replay.`,
            },
            {
              title: 'Deep dive: isolation, failures, security',
              body: `- A hanging endpoint must not consume all workers: per-endpoint queues or groups, a slow lane, circuit breaking after N failures.
- Two active secrets during rotation; secrets shown once.
- SSRF: validate the resolved IP on **every** attempt; send from an isolated network segment.
- Keep payloads small and free of unnecessary PII.`,
            },
            {
              title: 'Trade-offs and how to present it in 45 minutes',
              body: `Fat vs thin payloads, fairness vs simplicity, ordering vs throughput, retry window vs storage. Present the customer contract early (it shows product thinking), then spend the deep dive on per-endpoint isolation and the retry/disable lifecycle.`,
            },
          ],
          keyPoints: [
            'Outbox and one delivery job per (event, endpoint); at-least-once with stable event ids',
            'Per-endpoint isolation to avoid head-of-line blocking; timeouts and circuit breaking',
            'Exponential backoff with jitter over days, then disable and notify',
            'HMAC signatures over id + timestamp + body; replay window; secret rotation',
            'SSRF protection on customer URLs; delivery logs and replay for customers',
          ],
          pitfalls: [
            'Sending webhooks synchronously inside the API request',
            'One shared worker pool where a slow endpoint blocks everyone',
            'Promising ordering or exactly-once delivery',
            'Signing without a timestamp, so captured requests can be replayed',
          ],
          followUps: ['How would you let a customer replay all events from last Tuesday safely?', 'How would you guarantee per-object ordering for one enterprise customer who needs it?'],
          personalAngle:
            'Your scraping jobs already had retries, recovery and failure handling against sites you did not control; frame webhook delivery as the same problem in the outbound direction.',
          references: [{ label: 'Standard Webhooks specification', url: 'https://www.standardwebhooks.com/' }],
        },
      ],
    },
  ],
}

export default track
