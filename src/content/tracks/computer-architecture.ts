import type { Track } from '@/types/content'

const track: Track = {
  id: 'computer-architecture',
  code: 'M',
  title: 'Computer Architecture',
  summary: 'CPU, caches, memory and storage — enough hardware to reason about performance.',
  rationale:
    'Your Computer Engineering degree covered this, but interviews want it applied: why one loop is 10× faster than another, why arrays beat linked lists, why a job is I/O-bound. A short refresh turns theory you already know into performance arguments you can make out loud.',
  icon: 'MemoryStick',
  phase: 3,
  modules: [
    {
      id: 'arch-data-representation',
      title: 'Bits, bytes & numbers',
      summary: 'Binary and hex, integer limits and how JavaScript represents numbers.',
      questions: [
        {
          id: 'arch-binary-hex-conversion',
          title: 'Binary, hex and bitwise conversions',
          type: 'coding',
          difficulty: 'foundation',
          priority: 'must',
          tags: ['binary', 'hexadecimal', 'bitwise', 'conversion'],
          estMinutes: 8,
          roles: ['general'],
          prompt: `Without a calculator: convert **\`0x2F\`** to decimal and binary, and **\`200\`** to binary and hex. How many distinct values fit in **one byte**? Then write \`toBinary(n: number): string\` for non-negative integers **without** using \`toString(2)\`.`,
          hints: [
            'One hex digit = exactly 4 bits (a nibble).',
            '200 = 128 + 64 + 8.',
            'Repeatedly take n % 2 (or n & 1) and shift right.',
          ],
          answer: `**0x2F** → each hex digit is 4 bits: \`2\` = \`0010\`, \`F\` = \`1111\`, so **\`0b0010_1111\`**. In decimal, 2·16 + 15 = **47**.

**200** → 128 + 64 + 8 = **\`1100_1000\`**. Split into nibbles: \`1100\` = C, \`1000\` = 8, so **\`0xC8\`**.

**One byte = 8 bits = 2⁸ = 256 values**: 0–255 unsigned, or −128 to 127 in **two's complement** signed. Useful anchors: 2¹⁰ ≈ 1 thousand (KiB), 2²⁰ ≈ 1 million, 2³² ≈ 4.29 billion (IPv4 addresses, 32-bit pointers → a 4 GiB address limit).

\`\`\`ts
function toBinary(n: number): string {
  if (!Number.isInteger(n) || n < 0) throw new RangeError('non-negative integer expected')
  if (n === 0) return '0'
  let out = ''
  while (n > 0) {
    out = (n % 2) + out   // lowest bit
    n = Math.floor(n / 2) // shift right
  }
  return out
}
// toBinary(200) → '11001000'
\`\`\`

I used \`% 2\` and \`Math.floor\` instead of \`n & 1\` and \`n >>= 1\` on purpose: **JS bitwise operators convert to 32-bit signed integers**, so the bitwise version breaks above 2³¹ − 1. With \`BigInt\` you can use \`n & 1n\` and \`n >>= 1n\` safely. Complexity is O(log n).

**Where this shows up:** colours (\`#FF8800\`), Unix permissions (\`chmod 755\` is octal: rwx r-x r-x), bit flags and masks, IPv4 subnet masks (\`/24\` = \`255.255.255.0\`), UTF-8 byte sequences, and reading hex dumps or memory addresses.`,
          keyPoints: [
            'Hex digit = 4 bits; converts both directions correctly',
            '256 values per byte; two\'s complement range',
            'Correct algorithm with O(log n)',
            'JS bitwise ops are 32-bit signed',
            'Real-world uses: permissions, masks, colours',
          ],
          pitfalls: ['Using >> on numbers above 2^31', 'Forgetting the n = 0 case'],
          followUps: ['How is −1 represented in 8-bit two\'s complement, and why?'],
          references: [{ label: 'MDN: Bitwise AND', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_AND' }],
        },
        {
          id: 'arch-floating-point-output',
          title: 'Floating point and integer limits in JavaScript',
          type: 'output',
          difficulty: 'core',
          priority: 'should',
          tags: ['floating-point', 'ieee-754', 'integers', 'bigint', 'javascript'],
          estMinutes: 5,
          roles: ['general', 'frontend', 'backend'],
          prompt: `What does each line print, and what hardware representation explains it?`,
          code: {
            language: 'javascript',
            source: `console.log(0.1 + 0.2 === 0.3)
console.log(2 ** 53 === 2 ** 53 + 1)
console.log((2 ** 31) | 0)
console.log(9007199254740993n + 1n)
console.log(Number.MAX_SAFE_INTEGER)`,
          },
          hints: [
            'Numbers are IEEE 754 double precision: 52-bit fraction.',
            'Bitwise OR forces a 32-bit signed integer.',
          ],
          answer: `\`\`\`plaintext
false
true
-2147483648
9007199254740994n
9007199254740991
\`\`\`

**Why:**
1. JS \`number\` is an **IEEE 754 64-bit double**: 1 sign bit, 11 exponent bits, 52 fraction bits. **0.1 and 0.2 have no exact binary representation** (like 1/3 in decimal), so the sum is \`0.30000000000000004\`. Compare with a tolerance (\`Math.abs(a - b) < Number.EPSILON\` scaled to the magnitude), or keep money as **integer minor units** (cents, yen) or decimal strings.
2. Doubles have **53 bits of integer precision**. Above \`2**53\`, not every integer can be represented, so \`2**53 + 1\` rounds back to \`2**53\`.
3. \`| 0\` converts to a **32-bit two's complement** integer. 2³¹ overflows to the most negative value, −2,147,483,648.
4. **BigInt** is arbitrary precision, so it's exact. Use it for 64-bit IDs (for example Snowflake or Twitter IDs, or database \`bigint\` columns). Many drivers return those as strings for this reason.
5. \`Number.MAX_SAFE_INTEGER\` = 2⁵³ − 1. "Safe" means every integer up to it is exactly representable and distinct.

**Practical rule:** IDs from a \`BIGINT\` column above 2⁵³ will be silently corrupted by \`JSON.parse\` in JS. Serialize them as strings.`,
          keyPoints: [
            'IEEE 754 double: 53-bit integer precision',
            '0.1/0.2 not representable in binary',
            'Bitwise → 32-bit signed overflow',
            'BigInt for exact large integers; IDs as strings in JSON',
            'Money as integer minor units',
          ],
          pitfalls: ['Calling 0.1 + 0.2 a JavaScript bug'],
          personalAngle:
            'Kakei (your finance tracker) is a natural example: explain how you stored amounts. Integer yen avoids floating-point issues entirely.',
          references: [{ label: 'MDN: Number.MAX_SAFE_INTEGER', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER' }],
        },
      ],
    },
    {
      id: 'arch-cpu-memory',
      title: 'CPU, caches & memory',
      summary: 'Registers, the memory hierarchy, locality and addressing.',
      questions: [
        {
          id: 'arch-cpu-registers-pipeline',
          title: 'How a CPU executes instructions',
          type: 'concept',
          difficulty: 'foundation',
          priority: 'should',
          tags: ['cpu', 'registers', 'pipeline', 'branch-prediction', 'cores'],
          estMinutes: 5,
          roles: ['general'],
          prompt: `Explain, at a level useful to a software engineer, how a CPU executes code: **registers, the fetch–decode–execute cycle, pipelining, branch prediction** and **multiple cores**. Why can a sorted array make a loop faster?`,
          hints: [
            'Registers are the fastest storage, inside the core.',
            'Pipelines overlap instructions; a mispredicted branch flushes work.',
          ],
          answer: `A **core** repeatedly **fetches** an instruction from memory (via the instruction cache), **decodes** it, **executes** it in an ALU or another unit, and **writes back** results. **Registers** are a small set of very fast storage inside the core: general-purpose registers, the program counter, the stack pointer, flags. Operands normally have to be in registers to be used. Everything else is a load or store through the caches.

**Pipelining:** stages overlap, so while one instruction executes the next is decoding and a third is being fetched. Modern cores are also **superscalar** (several instructions per cycle) and execute **out of order**, reordering independent instructions to hide memory latency.

**Branch prediction:** at an \`if\` the pipeline can't wait to learn the outcome, so it **predicts** and executes speculatively. A **misprediction** throws away the speculative work, costing about 15–20 cycles. Predictable branches are almost free; random ones are expensive.

**Why sorting can help:** in \`for (x of data) if (x > 128) sum += x\`, random data makes the branch unpredictable (about 50% misses). Sorted data produces one long run of "false" then "true", which is nearly perfectly predicted. The famous Stack Overflow benchmark showed several times the speedup. Compilers or JITs sometimes remove the branch altogether (branchless code, conditional moves, SIMD).

**Multiple cores** run independent threads **in parallel**. Each core has its own registers and L1/L2 caches. **SMT/Hyper-Threading** lets one core interleave two hardware threads to fill idle units, but that's not 2× performance. Clock speeds plateaued around 2005, so performance now comes from more cores, wider SIMD, and better cache use. Software has to be parallel and cache-friendly to benefit.`,
          keyPoints: [
            'Fetch–decode–execute–writeback; registers',
            'Pipelining, superscalar, out-of-order',
            'Branch prediction and misprediction cost',
            'Sorted-data branch example',
            'Multicore, SMT, why clock speed plateaued',
          ],
          pitfalls: ['Treating SMT threads as full cores'],
        },
        {
          id: 'arch-cache-hierarchy-locality',
          title: 'Cache hierarchy and locality',
          type: 'concept',
          difficulty: 'core',
          priority: 'must',
          tags: ['cache', 'locality', 'memory-hierarchy', 'latency', 'cache-line'],
          estMinutes: 7,
          roles: ['general', 'backend'],
          prompt: `Describe the **memory hierarchy** with rough latencies. What are **temporal and spatial locality**, what is a **cache line**, and why does traversing a 2D array **row by row** beat column by column?`,
          code: {
            language: 'javascript',
            source: `const N = 4096
const grid = new Float64Array(N * N) // row-major: index = row * N + col

// A
for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) sum += grid[r * N + c]
// B
for (let c = 0; c < N; c++) for (let r = 0; r < N; r++) sum += grid[r * N + c]`,
          },
          hints: [
            'Memory is fetched in 64-byte blocks.',
            'In A, consecutive accesses are 8 bytes apart; in B, 32 KB apart.',
          ],
          answer: `**Hierarchy** (approximate, modern CPU):

| Level | Size | Latency |
| --- | --- | --- |
| Registers | ~100s of bytes | ~0 cycles |
| L1 cache (per core) | 32–64 KB | ~1 ns (4 cycles) |
| L2 (per core) | 0.5–2 MB | ~3–5 ns |
| L3 (shared) | 8–100+ MB | ~10–20 ns |
| DRAM | GBs | **~80–100 ns** |
| NVMe SSD | TBs | ~20–100 µs |
| Network RTT in a datacenter / Tokyo–US | | ~0.5 ms / ~150 ms |

A main-memory access costs **hundreds of instructions' worth** of time. Caches exist to hide it.

**Locality:**
- **Temporal**: data used recently is likely to be used again soon (loop variables, hot objects).
- **Spatial**: data *near* recently used data is likely to be used next (array elements).

Caches move memory in **cache lines** (usually **64 bytes**). Loading one \`Float64\` brings its 7 neighbours along. The **hardware prefetcher** also detects sequential or strided patterns and fetches ahead.

**A vs B:** the array is **row-major**. Loop **A** walks memory sequentially: one miss per 8 elements, and the prefetcher streams the rest. Loop **B** jumps \`N × 8 = 32 KB\` between accesses, so **every access touches a different cache line**. Lines are evicted before their neighbours are used, and the strides also thrash the TLB. B is typically **several times to 10×+ slower** for the same arithmetic.

**Software takeaways:** prefer contiguous data (arrays, typed arrays, struct-of-arrays for hot fields), process data in the order it's laid out, block or tile large matrix operations, and avoid pointer-chasing through scattered heap objects. In multi-threaded code, watch for **false sharing**: two threads writing different variables on the *same* cache line keep invalidating each other's copy.`,
          keyPoints: [
            'Hierarchy with order-of-magnitude latencies; DRAM ~100 ns',
            'Temporal vs spatial locality',
            '64-byte cache lines; prefetching',
            'Row-major traversal explanation',
            'Contiguous layouts; false sharing',
          ],
          pitfalls: ['Saying both loops are equal because Big-O is the same'],
          followUps: ['What is false sharing and how do you avoid it?'],
          references: [{ label: 'MDN: Typed arrays', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Typed_arrays' }],
        },
        {
          id: 'arch-arrays-vs-linked-lists',
          title: 'Why arrays beat linked lists in practice',
          type: 'tradeoff',
          difficulty: 'core',
          priority: 'must',
          tags: ['arrays', 'linked-lists', 'cache', 'big-o', 'data-structures'],
          estMinutes: 5,
          roles: ['general'],
          prompt: `A linked list has O(1) insertion in the middle, and an array has O(n). Yet benchmarks often show **arrays (vectors) winning even for middle insertions** on lists of tens of thousands of elements. Why? When *is* a linked list the right choice?`,
          hints: [
            'Big-O hides constant factors and memory behaviour.',
            'To insert in the middle of a linked list, you first have to find the middle.',
          ],
          answer: `**Big-O counts operations, not cache misses.** On real hardware the difference is memory behaviour:

- **Arrays are contiguous.** Scanning is sequential, the prefetcher streams cache lines, and each 64-byte line holds many elements. Shifting elements for an insert is a \`memmove\`: a tight, SIMD-friendly copy of contiguous memory, far faster than its O(n) suggests.
- **Linked list nodes are scattered** across the heap. Every \`next\` is a **dependent load**: the CPU can't fetch node k+1 until node k arrives, so traversal is roughly **one cache miss (~100 ns) per node**. Each node also carries pointer overhead (and in JS, an object header), so fewer nodes fit in cache.
- **The O(1) insert assumes you already hold a pointer to the position.** Usually you have to **search** for it first, which is O(n) with a cache miss at every step. That search dominates the array's fast O(n) shift.
- Arrays allocate once (amortised doubling). Lists allocate per node, which adds GC and allocator pressure.

**When a linked list is right:**
- You **already hold node references** and do many splices: **LRU caches** (hash map → doubly-linked-list nodes for O(1) move-to-front), free lists, intrusive lists in kernels.
- You need stable references or iterators that stay valid while other elements change.
- You need real-time guarantees with no occasional O(n) resize copy.
- Persistent or immutable structures with shared tails (functional programming).

**In JavaScript:** V8 stores arrays of small integers or doubles as **contiguous packed backing stores**, so they get these benefits. For a queue, avoid \`array.shift()\` in hot loops (it's O(n)). Use a ring buffer or a head index instead of reaching for a linked list.`,
          keyPoints: [
            'Big-O ignores cache behaviour and constants',
            'Contiguous memory + prefetching vs pointer chasing',
            'O(1) insert requires already having the node; search is O(n)',
            'Allocation/GC overhead of nodes',
            'Valid list uses: LRU, held references, splicing',
          ],
          pitfalls: ['Recommending linked lists for general-purpose sequences'],
          followUps: ['Implement an LRU cache with O(1) get/put.'],
          references: [{ label: 'V8 blog: Elements kinds', url: 'https://v8.dev/blog/elements-kinds' }],
        },
        {
          id: 'arch-memory-addressing',
          title: 'Memory addressing, alignment and endianness',
          type: 'concept',
          difficulty: 'advanced',
          priority: 'nice',
          tags: ['addressing', 'pointers', 'alignment', 'endianness', 'dataview'],
          estMinutes: 5,
          roles: ['general'],
          prompt: `What is a **memory address**, and what do **32-bit vs 64-bit**, **alignment** and **endianness** mean? Where would you run into endianness as a JavaScript or Node developer?`,
          hints: [
            'Memory is byte-addressable.',
            'Which byte of 0x12345678 is stored first?',
            'Binary protocols and file formats.',
          ],
          answer: `Memory is **byte-addressable**: every byte has a numeric **address**, and a pointer is a variable holding one. Programs see **virtual addresses**, translated by the MMU.

**32-bit vs 64-bit:** the width of registers and pointers. 32-bit pointers address 2³² bytes = **4 GiB**. 64-bit CPUs use 48–57 bits of virtual address in practice, which is huge. Bigger pointers use more memory, which is why V8 uses **pointer compression** (32-bit offsets inside a heap cage) to save memory and cache space.

**Alignment:** a 4-byte value is *aligned* if its address is a multiple of 4. CPUs load aligned data in one access. Misaligned access is slower or faults on some architectures, so compilers **pad** structs. Field order changes struct size: \`{u8, u64, u8}\` takes 24 bytes, \`{u64, u8, u8}\` takes 16. In JS, a \`Float64Array\` view requires its byte offset to be a multiple of 8.

**Endianness:** the byte order of multi-byte values. For \`0x12345678\`:
- **Little-endian** (x86, ARM by default) stores \`78 56 34 12\`: least significant byte at the lowest address.
- **Big-endian** stores \`12 34 56 78\`. This is **network byte order**, used in IP, TCP and most binary protocol headers.

**Where JS developers meet it:**

\`\`\`js
const buf = new ArrayBuffer(4)
new DataView(buf).setUint32(0, 0x12345678)       // DataView defaults to BIG-endian
new Uint8Array(buf)                              // [0x12, 0x34, 0x56, 0x78]
new Uint32Array(buf)[0].toString(16)             // '78563412' on little-endian hardware
Buffer.from([0x12, 0x34]).readUInt16BE(0)        // 0x1234; readUInt16LE → 0x3412
\`\`\`

This matters when parsing binary formats (PNG and MP4 are big-endian, WAV is little-endian), WebSocket frames, protocol buffers, and hashing or crypto byte arrays. **Typed arrays use platform endianness; \`DataView\` and Buffer's \`readXXBE/LE\` are explicit.** Prefer the explicit forms for portable code.`,
          keyPoints: [
            'Byte-addressable memory; pointers hold addresses',
            '32-bit = 4 GiB limit; 64-bit; V8 pointer compression',
            'Alignment and struct padding',
            'Little vs big endian; network byte order',
            'DataView / Buffer BE/LE methods',
          ],
          pitfalls: ['Assuming typed arrays are always big-endian'],
          references: [{ label: 'MDN: DataView', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView' }],
        },
        {
          id: 'arch-ram-vs-storage-page-cache',
          title: 'RAM vs storage, and the OS page cache',
          type: 'concept',
          difficulty: 'foundation',
          priority: 'should',
          tags: ['ram', 'storage', 'page-cache', 'buffer-pool', 'memory'],
          estMinutes: 4,
          roles: ['general', 'backend'],
          prompt: `What is the difference between **RAM and storage**? A Linux server running PostgreSQL shows only 300 MB "free" out of 16 GB. Is it about to run out of memory?`,
          hints: [
            'Volatile vs persistent, and the latency gap.',
            'Linux uses otherwise idle RAM to cache files.',
            'Look at "available", not "free".',
          ],
          answer: `**RAM (DRAM)** is **volatile** working memory: byte-addressable, about 100 ns latency, tens of GB/s, and wiped on power loss. It holds running programs' code, stacks, heaps and caches. **Storage** (SSD/HDD) is **persistent** and block-addressed, with latency in µs (NVMe) to ms (HDD) and far more capacity per yen. The CPU can't compute on storage directly: data has to be loaded into RAM, then the caches, then registers.

**Linux page cache:** the kernel uses **otherwise unused RAM to cache file contents** (and buffers writes before flushing them). Reading a recently used file is then a memory copy instead of a disk read. That cached memory is **reclaimable**: when a program needs memory, clean cache pages are simply dropped.

So **"free: 300 MB" is normal and healthy**. Check the right column:

\`\`\`bash
free -h
#        total  used  free  shared  buff/cache  available
# Mem:    15Gi  4.1Gi 300Mi  210Mi      11Gi       10Gi
\`\`\`

**\`available\`** (~10 GB here) estimates how much can be allocated without swapping. Signs of real memory pressure are low *available*, swap activity (\`vmstat\` \`si\`/\`so\` > 0), major page faults, and OOM-killer messages in \`dmesg\`.

**PostgreSQL specifically** caches twice: its own **shared_buffers** (commonly ~25% of RAM) and the OS page cache for everything else. That's why \`effective_cache_size\` is set to reflect both. A database whose **working set fits in RAM** is dramatically faster than one reading from disk. Often the cheapest fix for a slow database is more RAM or a smaller working set, not faster disks.`,
          keyPoints: [
            'Volatile vs persistent; latency/capacity trade-off',
            'CPU only computes on data in RAM/registers',
            'Page cache uses idle RAM and is reclaimable',
            'Read available, not free; real pressure signals',
            'shared_buffers + page cache; working set in RAM',
          ],
          pitfalls: ['Panicking about low "free" memory', 'Running drop_caches as a fix'],
          personalAngle:
            'You have run Postgres and Redis on servers you configured. Mention how you sized memory between them and what you monitored.',
          references: [{ label: 'PostgreSQL docs: Resource consumption', url: 'https://www.postgresql.org/docs/current/runtime-config-resource.html' }],
        },
      ],
    },
    {
      id: 'arch-storage-workloads',
      title: 'Storage & workload characterisation',
      summary: 'SSD vs HDD, and diagnosing CPU- vs I/O-bound systems.',
      questions: [
        {
          id: 'arch-ssd-vs-hdd',
          title: 'SSD vs HDD and what it means for databases',
          type: 'multiple-choice',
          difficulty: 'core',
          priority: 'should',
          tags: ['storage', 'ssd', 'hdd', 'iops', 'fsync'],
          estMinutes: 4,
          roles: ['general', 'backend'],
          prompt: `Which statements about storage are **true**? Select all that apply.`,
          choices: [
            { id: 'a', text: 'HDD random reads are slow mainly because of seek time and rotational latency (milliseconds)', correct: true, explanation: 'A mechanical head must move and wait for the platter; ~100–200 random IOPS.' },
            { id: 'b', text: 'On SSDs, random and sequential reads perform identically', correct: false, explanation: 'The gap is much smaller than on HDDs, but sequential/large I/O still has higher throughput.' },
            { id: 'c', text: '`fsync` forces data to durable storage, and its latency limits commit rate for databases', correct: true, explanation: 'Each durable commit waits for WAL flush; group commit and battery-backed caches help.' },
            { id: 'd', text: 'SSDs cannot overwrite a page in place; they write to erased blocks and garbage-collect', correct: true, explanation: 'Flash translation layers handle this; it causes write amplification and wear.' },
          ],
          hints: ['Think mechanical parts vs flash cells.'],
          answer: `**a, c and d.**

- **HDDs** are spinning platters with a moving head. A random access pays **seek plus rotational latency** (~5–10 ms), giving only **~100–200 random IOPS**, while sequential throughput is decent (~150–250 MB/s). This is why classic databases were designed around **sequential writes** (WAL, LSM trees) and why random I/O was the enemy.
- **SSDs (NVMe)** have no moving parts: **~10–100 µs** latency, **hundreds of thousands of IOPS** and GB/s throughput. They excel at **parallel random I/O** (deep queues), but sequential large I/O still wins on throughput. Flash can't be overwritten in place: the **FTL** writes to erased blocks and garbage-collects, which causes **write amplification** and finite endurance (TBW).
- **\`fsync\`** forces the OS page cache and the device cache to stable storage. Databases call it on commit to keep their **durability** promise, so **fsync latency limits commits per second**. PostgreSQL batches with group commit, and \`synchronous_commit = off\` trades a small window of possible loss for speed. Cloud disks (EBS and similar) add network latency and IOPS caps per volume size.

**Why developers care:** choose volume types and IOPS for databases deliberately, keep the working set in RAM (the buffer cache hit rate matters more than disk speed), and never run a production database on a container's ephemeral overlay filesystem.`,
          keyPoints: [
            'HDD seek/rotation ms, ~100s IOPS',
            'SSD µs latency, high parallel IOPS, still prefers sequential',
            'FTL, erase blocks, write amplification',
            'fsync = durability cost per commit; group commit',
            'Cloud volume IOPS limits; working set in RAM',
          ],
          pitfalls: ['Saying SSDs make I/O patterns irrelevant'],
          references: [{ label: 'PostgreSQL docs: WAL configuration', url: 'https://www.postgresql.org/docs/current/wal-configuration.html' }],
        },
        {
          id: 'arch-cpu-vs-io-bound',
          title: 'Diagnosing CPU-bound vs I/O-bound workloads',
          type: 'debugging',
          difficulty: 'advanced',
          priority: 'must',
          tags: ['cpu-bound', 'io-bound', 'profiling', 'performance', 'scaling'],
          estMinutes: 8,
          roles: ['backend', 'full-stack'],
          prompt: `A nightly job that processes 200k records went from 20 minutes to 3 hours. On the server, \`top\` shows **CPU at 12%** across 8 cores and \`%wa\` near zero. **Is it CPU-bound or I/O-bound? What would you measure next, and how does the answer change the fix?**`,
          hints: [
            'Low CPU and low iowait means the process is mostly waiting, but not on local disk.',
            'Network round trips to a database or API are I/O too.',
            'Concurrency helps waiting work; more cores help computing work.',
          ],
          answer: `**Mostly waiting, so I/O-bound** or latency-bound. But not on local disk (\`%wa\` ≈ 0). The usual suspect is **network round trips**: a database query or API call **per record**, run sequentially. 200k records × 50 ms = 2.8 hours. A slowdown from 20 minutes points at **increased per-call latency** (a database moved to another region, a slow query after data growth, an API rate limit or retries) multiplied by a sequential loop.

**Measure next:**
- **Per-record timing breakdown**: log or trace spans (OpenTelemetry) around the database and HTTP calls. Is it many fast calls or a few slow ones?
- **Database side**: \`pg_stat_statements\` (mean time per query, calls), \`EXPLAIN ANALYZE\` on the hot query (did a missing index start to matter as the table grew?), lock waits.
- **Network**: RTT to the database (\`ping\`, \`mtr\`), connection pool wait time, HTTP 429s and retries.
- **The process**: a Node \`--cpu-prof\` or flame graph (\`0x\`, clinic), and event-loop delay (\`perf_hooks.monitorEventLoopDelay\`) to rule out blocking.

**How the classification changes the fix:**
- **I/O-bound (this case):** **reduce round trips** (batch queries with \`WHERE id = ANY($1)\`, bulk \`INSERT … ON CONFLICT\`, \`COPY\`), add **bounded concurrency** (process 20–50 records in flight with a limiter, not all 200k at once), fix the slow query or index, and move compute close to the data. More CPU cores won't help.
- **CPU-bound** (CPU pinned near 100% on one core for a Node process): optimise the algorithm (for example matching from O(n²) to a hash join, O(n)), parallelise with worker threads or multiple processes, and move heavy work out of JS. More concurrency on one thread won't help.

**Mental model:** throughput ≈ concurrency / latency (Little's law). I/O-bound work scales with **concurrency**; CPU-bound work scales with **cores and algorithmic efficiency**.`,
          keyPoints: [
            'Low CPU + low iowait = waiting on network/remote I/O',
            'Per-record sequential round trips × latency',
            'Measure with tracing, pg_stat_statements, EXPLAIN, profiles',
            'I/O-bound fix: batching + bounded concurrency',
            'CPU-bound fix: algorithm, workers/processes',
            "Little's law framing",
          ],
          pitfalls: ['Adding CPU cores to an I/O-bound job', 'Unbounded Promise.all over 200k records'],
          followUps: ['How do you choose the concurrency limit?'],
          personalAngle:
            'Your matching logic over thousands of scraped records and scheduled recovery jobs fits this exactly. Explain which parts were network-bound (fetching) and which were CPU-bound (matching), and what you did about each.',
          references: [{ label: 'Node.js: Profiling Node.js applications', url: 'https://nodejs.org/en/learn/getting-started/profiling' }],
        },
        {
          id: 'arch-latency-numbers',
          title: 'Latency numbers every engineer should know',
          type: 'multiple-choice',
          difficulty: 'core',
          priority: 'nice',
          tags: ['latency', 'estimation', 'performance', 'back-of-envelope'],
          estMinutes: 3,
          roles: ['general'],
          prompt: `Order these from **fastest to slowest**: (1) network round trip within one datacenter, (2) L1 cache reference, (3) round trip Tokyo ↔ US West, (4) main memory reference, (5) read 4 KB randomly from NVMe SSD.`,
          choices: [
            { id: 'a', text: '2 → 4 → 1 → 5 → 3', correct: false, explanation: 'A datacenter round trip (~0.5 ms) is slower than a random NVMe read (~20–100 µs).' },
            { id: 'b', text: '2 → 4 → 5 → 1 → 3', correct: true, explanation: 'L1 ~1 ns, DRAM ~100 ns, NVMe random ~20–100 µs, datacenter RTT ~0.5 ms, Tokyo–US ~100+ ms.' },
            { id: 'c', text: '4 → 2 → 5 → 1 → 3', correct: false, explanation: 'L1 is ~100× faster than DRAM.' },
            { id: 'd', text: '2 → 5 → 4 → 1 → 3', correct: false, explanation: 'Any SSD access is far slower than a DRAM reference.' },
          ],
          hints: ['Think in powers of 10: ns, 100 ns, µs, 100 µs, ms, 100 ms.'],
          answer: `**b: L1 → DRAM → random NVMe read → datacenter round trip → trans-Pacific round trip.**

Approximate orders of magnitude (modern hardware; exact numbers vary, and **orders of magnitude are what interviewers check**):

| Operation | Time |
| --- | --- |
| L1 cache reference | ~1 ns |
| Branch mispredict | ~5 ns |
| Main memory reference | ~100 ns |
| Random 4 KB read, NVMe SSD | ~20–100 µs |
| Read 1 MB sequentially from RAM | ~50–250 µs |
| Round trip inside a datacenter | ~0.5 ms |
| Read 1 MB sequentially from SSD | ~0.2–1 ms |
| HDD seek | ~5–10 ms |
| Tokyo ↔ US West round trip | ~100–120 ms |

Bulk-transfer figures such as "1 MB from RAM" depend heavily on bandwidth and vary a lot between hardware generations. Admitting that nuance is better than defending a memorised number.

**How to use this in interviews:**
- **Back-of-envelope design:** "each request makes 10 sequential database calls at 1 ms each, so 10 ms minimum. A cross-region database would make it 1 s."
- **Why caches and batching matter:** memory is ~1000× faster than a network hop, and a network hop is ~100× faster than a trans-Pacific one.
- **Region choice for Japanese users:** a US-hosted origin adds ~100+ ms per round trip, and pages need several round trips.`,
          keyPoints: [
            'Correct order of magnitude for each tier',
            'ns (cache) → 100 ns (RAM) → µs (SSD) → ms (network/HDD) → 100 ms (intercontinental)',
            'Uses numbers for back-of-envelope reasoning',
            'Acknowledges hardware variance',
          ],
          pitfalls: ['Memorising exact numbers without the orders of magnitude'],
          personalAngle:
            'Living in Tokyo gives you a concrete hook: the Tokyo–US round trip is a number you can feel in your own apps.',
          references: [{ label: 'web.dev: Time to First Byte', url: 'https://web.dev/articles/ttfb' }],
        },
      ],
    },
  ],
}

export default track
