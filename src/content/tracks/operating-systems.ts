import type { Track } from '@/types/content'

const track: Track = {
  id: 'operating-systems',
  code: 'K',
  title: 'Operating Systems',
  summary: 'Processes, threads, memory, scheduling, synchronization and Linux fundamentals.',
  rationale:
    'You have configured Linux servers over SSH and run containers in production, but OS questions test the concepts underneath: what a process really is, how memory is virtualised, and why concurrent code breaks. These questions separate an engineer from a framework user, and your server work makes the answers concrete.',
  icon: 'Cpu',
  phase: 3,
  modules: [
    {
      id: 'os-processes-threads',
      title: 'Processes, threads & scheduling',
      summary: 'Execution units, concurrency vs parallelism, scheduling and context switches.',
      questions: [
        {
          id: 'os-process-vs-thread',
          title: 'Process vs thread',
          type: 'concept',
          difficulty: 'foundation',
          priority: 'must',
          tags: ['processes', 'threads', 'memory', 'isolation'],
          estMinutes: 4,
          roles: ['general'],
          prompt: `What is the difference between a **process** and a **thread**? When would you choose multiple processes over multiple threads? Relate it to Node.js and Chrome.`,
          hints: [
            'What does each one own, and what is shared?',
            'Think about what happens when one crashes.',
          ],
          answer: `A **process** is a running program with its **own virtual address space** and OS resources: file descriptors, environment, PID, credentials. A **thread** is a unit of execution **inside** a process. Threads share the process's memory and file descriptors, but each has its **own stack, registers and program counter**.

| | Processes | Threads |
| --- | --- | --- |
| Memory | Isolated | Shared |
| Create / switch cost | Higher (new page tables; fork uses copy-on-write) | Lower |
| Communication | IPC: pipes, sockets, shared memory | Shared variables (needs synchronization) |
| Failure | Crash is contained | A segfault kills every thread |

**Choose processes** for **isolation and fault containment**: separate privileges, untrusted code, or a crash that mustn't take everything down. **Choose threads** for **cheap shared-memory parallelism** where you control the code and can synchronize properly.

**Examples:**
- **Chrome** uses a **multi-process** architecture: renderers per site, plus GPU and network processes. A crashing tab doesn't kill the browser, and sandboxing limits what a compromised renderer can do.
- **Node.js** is one process whose JavaScript runs on a single main thread, while libuv uses a thread pool for some I/O. \`worker_threads\` are real threads, each with **its own V8 isolate**, so they share memory only through \`SharedArrayBuffer\`. \`cluster\` and \`child_process\` create **separate processes**.
- **Containers** are ordinary processes isolated by namespaces and cgroups, not VMs.`,
          keyPoints: [
            'Process = own address space + resources',
            'Thread = execution context sharing process memory, own stack/registers',
            'Isolation vs cost/communication trade-off',
            'Crash containment',
            'Node worker_threads vs cluster/child_process; Chrome multi-process',
          ],
          pitfalls: ['Saying threads have separate heaps', 'Calling containers lightweight VMs'],
          followUps: ['What does fork() do, and what is copy-on-write?'],
          personalAngle:
            'Puppeteer launches Chromium as separate processes. Use the zombie or leaked Chrome processes you may have dealt with in scraping jobs as a concrete example of process lifecycle management.',
          references: [{ label: 'Node.js docs: Worker threads', url: 'https://nodejs.org/api/worker_threads.html' }],
        },
        {
          id: 'os-concurrency-parallelism-scheduling',
          title: 'Concurrency vs parallelism, scheduling and context switches',
          type: 'concept',
          difficulty: 'core',
          priority: 'must',
          tags: ['concurrency', 'parallelism', 'scheduling', 'context-switch'],
          estMinutes: 6,
          roles: ['general'],
          prompt: `Explain **concurrency vs parallelism**. How does an OS scheduler decide what runs, and what does a **context switch** cost?`,
          hints: [
            'One is about structure, the other about simultaneous execution.',
            'Preemption uses timer interrupts.',
            'The direct cost is saving registers; the hidden cost is caches and TLB.',
          ],
          answer: `**Concurrency** means dealing with many tasks at once by **interleaving** their progress. It is about structure, and is possible on one core. **Parallelism** means **executing** many tasks simultaneously on multiple cores. Node's event loop is highly concurrent but runs JavaScript without parallelism. A worker pool on 8 cores is parallel.

**Scheduling:** the kernel keeps runnable threads in run queues, one per CPU. A **preemptive** scheduler uses **timer interrupts** to take the CPU back when a time slice ends, or when a higher-priority task wakes. Classic policies are FIFO, round robin, priority and multilevel feedback queues. Linux used **CFS** (Completely Fair Scheduler, which tracks virtual runtime per task in a red-black tree) and since kernel 6.6 uses **EEVDF**, which also optimises latency. Both aim at **fairness** weighted by \`nice\` values. I/O-bound threads sleep often and get good latency when they wake. CPU-bound threads use up their slices.

**Context switch:** the kernel saves the current thread's registers, program counter and stack pointer, picks the next thread, and restores its state. Switching between **processes** also changes the **address space** (page table base), which can flush **TLB** entries unless PCID/ASID tagging is used.
- Direct cost: roughly a microsecond or a few.
- **Hidden cost:** cold **CPU caches** and TLB misses after the switch. This often dominates.

**Why it matters:** thousands of threads blocking on I/O cause heavy context switching and memory use (one stack per thread). That's why event loops (Node, nginx) and async runtimes multiplex many connections onto few threads. On Linux, \`vmstat 1\` (\`cs\` column) and \`pidstat -w\` show switch rates.`,
          keyPoints: [
            'Concurrency = interleaving/structure; parallelism = simultaneous execution',
            'Preemptive scheduling via timer interrupts; run queues',
            'Linux CFS/EEVDF fairness, nice',
            'Context switch saves/restores state; address space + TLB for processes',
            'Hidden cost: cache/TLB pollution',
          ],
          pitfalls: ['Using concurrency and parallelism as synonyms', 'Thinking async JS runs in parallel'],
          followUps: ['Why can adding threads make a CPU-bound program slower?'],
          references: [{ label: 'Linux kernel docs: Scheduler', url: 'https://docs.kernel.org/scheduler/index.html' }],
        },
        {
          id: 'os-syscalls-kernel-mode',
          title: 'User mode, kernel mode and system calls',
          type: 'concept',
          difficulty: 'foundation',
          priority: 'should',
          tags: ['kernel', 'syscalls', 'user-mode', 'interrupts'],
          estMinutes: 4,
          roles: ['general'],
          prompt: `What is the difference between **user mode** and **kernel mode**? What happens, step by step, when your Node.js code reads a file?`,
          hints: [
            'The CPU has privilege levels.',
            'A system call is a controlled entry into the kernel.',
          ],
          answer: `The CPU runs code at different **privilege levels**. **User mode** (applications) can't touch hardware, other processes' memory or page tables directly. **Kernel mode** (the OS) can execute privileged instructions and access all memory. This boundary is what makes process isolation and security enforceable.

A **system call** is the controlled way for user code to ask the kernel for something: \`read\`, \`write\`, \`open\`, \`mmap\`, \`fork\`/\`clone\`, \`socket\`, \`epoll_wait\`. A special instruction (\`syscall\` on x86-64) switches to kernel mode at a fixed entry point. The kernel validates the arguments, does the work, and returns to user mode. **Interrupts** (timer, network card, disk) and **exceptions** (page faults, divide by zero) also enter the kernel.

**\`fs.readFile\` in Node, step by step:**
1. JavaScript calls into Node's C++ bindings, which submit the work to **libuv**.
2. libuv queues it on its **thread pool**, because regular file I/O can't use epoll readiness on Linux.
3. A pool thread makes syscalls: \`openat\`, \`fstat\`, \`read\` (possibly several times), \`close\`.
4. For \`read\`, the kernel checks the **page cache**. If the data is cached it copies it into the user buffer. If not, it issues disk I/O, the thread **sleeps**, and the scheduler runs something else until the disk interrupt wakes it.
5. libuv signals the main loop, and your callback or promise runs in the poll phase.

**Why it matters:** syscalls and mode switches cost far more than plain function calls, so batching I/O (larger buffers, fewer small writes) matters. \`strace -c -p <pid>\` shows which syscalls a process spends its time in.`,
          keyPoints: [
            'Privilege levels: user vs kernel',
            'Syscall = controlled transition with argument validation',
            'Interrupts and exceptions also enter kernel',
            'Traces readFile through libuv thread pool, syscalls, page cache',
            'Syscall overhead → batch I/O; strace',
          ],
          pitfalls: ['Thinking libraries talk to hardware directly'],
          references: [{ label: 'Linux man page: syscalls(2)', url: 'https://man7.org/linux/man-pages/man2/syscalls.2.html' }],
        },
        {
          id: 'os-io-models-epoll',
          title: 'Blocking vs non-blocking I/O and epoll',
          type: 'tradeoff',
          difficulty: 'advanced',
          priority: 'should',
          tags: ['io', 'epoll', 'non-blocking', 'event-loop', 'c10k'],
          estMinutes: 6,
          roles: ['backend'],
          prompt: `Compare **thread-per-connection blocking I/O** with **non-blocking I/O plus an event loop** (epoll). Why can nginx or Node handle 10,000 idle connections cheaply, and where does the event-loop model break down?`,
          hints: [
            'What does each blocked thread cost?',
            'epoll tells you which descriptors are ready instead of scanning them all.',
          ],
          answer: `**Thread-per-connection, blocking:** each connection gets a thread that calls \`read()\` and **sleeps** until data arrives. The code is simple and linear, and CPU-heavy work parallelises naturally. The cost: **each thread has a stack** (often 1–8 MB reserved), a kernel task struct, and scheduler overhead. 10 k mostly idle connections means 10 k threads, a lot of memory and **context switching**. Java's virtual threads and Go's goroutines get around this with cheap user-space threads on top of non-blocking I/O.

**Non-blocking + event loop:** sockets are set \`O_NONBLOCK\`. One thread asks the kernel *which* descriptors are ready using an **I/O multiplexing** syscall:
- \`select\`/\`poll\`: pass the whole set every call, O(n) per call.
- **\`epoll\`** (Linux), **kqueue** (BSD/macOS), **IOCP** (Windows): register interest once, then \`epoll_wait\` returns **only ready descriptors**, roughly O(ready). An idle connection costs only a few KB of kernel and user state.
- Newer: **io_uring**, which submits and completes I/O through shared ring buffers with fewer syscalls.

The loop then runs short callbacks for the ready descriptors. This is how libuv (Node), nginx and Redis handle **C10K** and beyond with few threads.

**Where it breaks down:**
- **CPU-bound or blocking work in a callback stalls every connection** (JSON-parsing a 50 MB body, sync crypto, \`fs.readFileSync\`).
- Regular **file I/O** isn't readiness-based on Linux, which is why libuv uses a thread pool for it.
- Code turns into callbacks and state machines; async/await hides that, but you still have to reason about interleaving.
- One loop uses one core. Scale with multiple processes or workers (\`cluster\`, nginx \`worker_processes auto\`, multiple containers).`,
          keyPoints: [
            'Blocking thread cost: stack memory, context switches',
            'Non-blocking + readiness notification',
            'select/poll O(n) vs epoll/kqueue',
            'C10K; libuv/nginx/Redis model',
            'Breaks on CPU-bound/blocking callbacks; one core per loop',
          ],
          pitfalls: ['Saying event loops are always faster', 'Thinking epoll works for regular files'],
          followUps: ['What is io_uring and why does it matter?'],
          references: [{ label: 'Linux man page: epoll(7)', url: 'https://man7.org/linux/man-pages/man7/epoll.7.html' }],
        },
      ],
    },
    {
      id: 'os-memory',
      title: 'Memory management',
      summary: 'Stack vs heap, virtual memory, paging and what OOM really means.',
      questions: [
        {
          id: 'os-stack-vs-heap',
          title: 'Stack vs heap',
          type: 'multiple-choice',
          difficulty: 'foundation',
          priority: 'should',
          tags: ['stack', 'heap', 'memory', 'recursion'],
          estMinutes: 3,
          roles: ['general'],
          prompt: `Which statements about the **stack** and the **heap** are true? Select all that apply.`,
          choices: [
            { id: 'a', text: 'Each thread has its own stack; the heap is shared by all threads of a process', correct: true, explanation: 'Stacks hold per-thread call frames; heap memory is process-wide.' },
            { id: 'b', text: 'Stack allocation is just moving a pointer, so it is very fast', correct: true, explanation: 'Frames are pushed/popped by adjusting the stack pointer.' },
            { id: 'c', text: 'Deep recursion can overflow the stack even when plenty of heap is free', correct: true, explanation: 'Stacks have a fixed maximum size (often 8 MB main thread on Linux; V8 has its own limit).' },
            { id: 'd', text: 'In JavaScript, objects referenced by a local variable live on the stack and are freed on return', correct: false, explanation: 'Objects live on the V8 heap; only the reference may be on the stack. GC frees them when unreachable.' },
          ],
          hints: ['Think about per-thread vs per-process, and lifetimes.'],
          answer: `**a, b and c.**

- The **stack** holds **call frames**: return addresses, parameters, local variables of fixed size. It is **per thread**, grows and shrinks in LIFO order, and allocation is a pointer bump, so it's fast and cache-friendly. Lifetime is tied to the function call. Its size is limited (Linux main thread ~8 MB by \`ulimit -s\`, smaller for other threads), so unbounded recursion causes a **stack overflow**. In JS that's \`RangeError: Maximum call stack size exceeded\`.
- The **heap** holds dynamically allocated data whose size or lifetime isn't known at compile time. It is **shared** by the process's threads, managed by an allocator (\`malloc\`/\`free\`) or a **garbage collector**, and is slower to allocate and prone to fragmentation.

**In JavaScript** (option d is false), objects, arrays and closures live on the **V8 heap**. A local variable holds a *reference*, and the object is freed by the GC once unreachable, not when the function returns. That's why closures can keep data alive after their function has finished.

**Practical consequences:** convert deep recursion into iteration with an explicit stack (DFS on huge trees). Node's \`--max-old-space-size\` controls the V8 heap limit; the stack limit is separate.`,
          keyPoints: [
            'Stack per thread, heap shared',
            'Stack: LIFO frames, fast, limited size',
            'Heap: dynamic lifetime, allocator/GC',
            'JS objects live on the heap regardless of where referenced',
          ],
          pitfalls: ['Believing JS primitives/objects follow C-like stack rules'],
          references: [{ label: 'MDN: Memory management', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Memory_management' }],
        },
        {
          id: 'os-virtual-memory-paging',
          title: 'Virtual memory and paging',
          type: 'concept',
          difficulty: 'core',
          priority: 'must',
          tags: ['virtual-memory', 'paging', 'tlb', 'page-fault', 'oom'],
          estMinutes: 7,
          roles: ['general', 'backend'],
          prompt: `What is **virtual memory**, and how does paging work? What is a **page fault**? Your container gets **OOM-killed** even though \`top\` showed the process using less than the host's free RAM. Why?`,
          hints: [
            'Every process sees its own address space; the MMU translates.',
            'Minor vs major page faults.',
            'Containers have a cgroup memory limit independent of host RAM.',
          ],
          answer: `**Virtual memory** gives every process its **own private, contiguous address space**. The **MMU** translates virtual addresses to physical ones using **page tables** maintained by the kernel. Memory is managed in **pages** (usually 4 KB; huge pages are 2 MB or 1 GB). Benefits:
- **Isolation**: processes can't touch each other's memory.
- **Overcommit and lazy allocation**: \`malloc\` reserves address space, and physical frames are assigned on first touch.
- **Sharing**: shared libraries and \`fork\` with **copy-on-write**.
- **Memory-mapped files** (\`mmap\`) and **swap**.

The **TLB** caches recent translations. A TLB miss requires a page-table walk.

**Page fault:** the CPU accesses a page with no valid mapping, and the kernel handles it:
- **Minor fault**: the page is in RAM but not mapped yet (first touch, copy-on-write, page cache). Cheap.
- **Major fault**: the page must be read **from disk** (swap or a file). Takes milliseconds, which is catastrophic for latency.
- **Invalid access** → \`SIGSEGV\`.

**The container OOM kill:** the container runs in a **cgroup with a memory limit** (\`docker run -m 512m\`, Kubernetes \`limits.memory\`). When the cgroup's usage, which **includes page cache and kernel memory attributed to it**, can't be reclaimed below the limit, the **kernel OOM killer** kills a process in that cgroup. Exit code 137 means \`SIGKILL\`. Host free RAM is irrelevant. Other factors:
- \`top\` RSS doesn't show cgroup accounting. Use \`docker stats\`, \`cat /sys/fs/cgroup/memory.current\` or \`memory.events\`.
- **Node**: V8 sizes its heap from system memory. Set \`--max-old-space-size\` below the container limit (leave room for buffers, native memory and the thread pool), or V8 grows its heap past the limit before GC pressure starts.
- Memory spikes from buffering large payloads.`,
          keyPoints: [
            'Per-process address space translated by MMU via page tables',
            'Pages, lazy allocation, copy-on-write, mmap, swap',
            'TLB caches translations',
            'Minor vs major page faults; SIGSEGV for invalid',
            'cgroup memory limit + OOM killer (exit 137); Node heap sizing',
          ],
          pitfalls: ['Equating virtual memory with swap', 'Assuming container limits follow host RAM'],
          followUps: ['What does thrashing look like and how do you detect it?'],
          personalAngle:
            'Headless Chromium in Docker is a classic OOM case: /dev/shm defaults to 64 MB and many tabs add up. If you hit this with Puppeteer, explain the --shm-size or --disable-dev-shm-usage fix.',
          references: [{ label: 'Linux kernel docs: cgroup v2 memory', url: 'https://docs.kernel.org/admin-guide/cgroup-v2.html' }],
        },
      ],
    },
    {
      id: 'os-synchronization',
      title: 'Synchronization & deadlocks',
      summary: 'Race conditions, mutexes vs semaphores, and the four deadlock conditions.',
      questions: [
        {
          id: 'os-race-condition-js',
          title: 'A race condition in single-threaded JavaScript',
          type: 'debugging',
          difficulty: 'core',
          priority: 'must',
          tags: ['race-condition', 'synchronization', 'async', 'mutex'],
          estMinutes: 7,
          roles: ['backend', 'full-stack'],
          prompt: `"Node is single-threaded, so it can't have race conditions." Prove this wrong with the code below, which sometimes **oversells stock**, and fix it.`,
          code: {
            language: 'typescript',
            source: `app.post('/buy/:id', async (req, res) => {
  const item = await db.item.findUnique({ where: { id: req.params.id } })
  if (item!.stock < 1) return res.status(409).send('Sold out')
  await chargeCustomer(req.user, item!.price)     // takes ~300 ms
  await db.item.update({ where: { id: item!.id }, data: { stock: item!.stock - 1 } })
  res.send('ok')
})`,
          },
          hints: [
            'Every await is a point where other requests can run.',
            'This is a check-then-act on shared state, and there may be several instances.',
            'Make the decrement conditional and atomic in the database.',
          ],
          answer: `A **race condition** is when correctness depends on the **interleaving** of operations on shared state. JavaScript runs one callback at a time, but **every \`await\` yields**. Two requests can both read \`stock = 1\`, both pass the check, both charge, and both write \`stock = 0\`. The result is two sales of one item, plus a **lost update**. With several Node instances, the shared state (the database) is accessed in parallel anyway.

This is a **check-then-act** (TOCTOU) bug. The check and the write must be **one atomic step**, at the place that owns the state:

\`\`\`ts
app.post('/buy/:id', async (req, res) => {
  // atomic conditional decrement: only one request can win the last unit
  const reserved = await db.item.updateMany({
    where: { id: req.params.id, stock: { gte: 1 } },
    data: { stock: { decrement: 1 } },
  })
  if (reserved.count === 0) return res.status(409).send('Sold out')
  try {
    await chargeCustomer(req.user, req.params.id)
  } catch (err) {
    await db.item.update({ where: { id: req.params.id }, data: { stock: { increment: 1 } } }) // compensate
    throw err
  }
  res.send('ok')
})
\`\`\`

**Alternatives:** \`SELECT … FOR UPDATE\` inside a transaction (pessimistic locking), an optimistic \`version\` column (\`UPDATE … WHERE version = $v\`, retry on 0 rows), or a **distributed lock** in Redis for non-database resources. Don't hold a database lock during the 300 ms external charge.

**OS vocabulary:** the read-check-write region is a **critical section**. Correctness needs **mutual exclusion**, through a mutex, an atomic instruction (compare-and-swap) or, here, the database's row-level atomicity. An in-process async mutex would only fix a single instance.`,
          keyPoints: [
            'await = interleaving point; races without threads',
            'Check-then-act / lost update identified',
            'Atomic conditional update at the source of truth',
            'Compensation for failure after reservation',
            'Multiple instances make in-process locks insufficient',
          ],
          pitfalls: ['Adding an in-memory flag/mutex as the fix', 'Holding a DB lock across the external payment call'],
          followUps: ['How would you implement a Redis lock safely (TTL, ownership token)?'],
          personalAngle:
            'Scheduled scraping jobs with restart and recovery can hit the same race: two workers picking up the same job. Explain how you prevented double processing, for example with BullMQ job locks or unique keys.',
          references: [{ label: 'PostgreSQL docs: Explicit locking', url: 'https://www.postgresql.org/docs/current/explicit-locking.html' }],
        },
        {
          id: 'os-mutex-semaphore-deadlock',
          title: 'Mutex vs semaphore, and the four deadlock conditions',
          type: 'concept',
          difficulty: 'core',
          priority: 'should',
          tags: ['mutex', 'semaphore', 'deadlock', 'coffman'],
          estMinutes: 6,
          roles: ['general'],
          prompt: `What is the difference between a **mutex** and a **semaphore**? What are the **four conditions** required for deadlock, and how do you prevent it in practice?`,
          hints: [
            'A mutex has an owner; a counting semaphore is a permit counter.',
            'Coffman conditions: mutual exclusion, hold and wait, ...',
            'Breaking any one condition prevents deadlock.',
          ],
          answer: `**Mutex** (mutual-exclusion lock): **one** holder at a time, and the thread that locks it must unlock it (**ownership**). It protects a critical section. **Semaphore**: a counter with atomic \`wait\` (decrement, block at 0) and \`signal\` (increment). A **counting semaphore** limits concurrency to N, for example "at most 5 concurrent Puppeteer pages" or a database connection pool. It has **no owner**, so one thread can signal another, which makes it useful for signaling. A binary semaphore resembles a mutex but lacks ownership, so it can't support priority inheritance or recursive locking.

\`\`\`ts
// counting semaphore in async JS (concurrency limiter)
class Semaphore {
  private queue: (() => void)[] = []
  constructor(private permits: number) {}
  async acquire() {
    if (this.permits > 0) { this.permits--; return }
    await new Promise<void>((r) => this.queue.push(r))
  }
  release() {
    const next = this.queue.shift()
    if (next) next(); else this.permits++
  }
}
\`\`\`

**Deadlock requires all four Coffman conditions:**
1. **Mutual exclusion**: resources can't be shared.
2. **Hold and wait**: a holder of one resource waits for another.
3. **No preemption**: resources can't be forcibly taken.
4. **Circular wait**: a cycle of waiting threads.

**Prevention breaks one of them:**
- **Lock ordering** removes circular wait. This is the most practical fix.
- Acquire all locks at once, or use **try-lock with timeout** and back off, which removes hold-and-wait.
- Lock timeouts and lease TTLs act as preemption (distributed locks).
- Lock-free structures and message passing reduce mutual exclusion.

Databases *detect* deadlocks instead and abort a victim. Related problems: **livelock** (threads keep reacting to each other without progress) and **starvation** (a thread never gets the resource).`,
          keyPoints: [
            'Mutex: exclusive, owned; semaphore: counter, no owner, signaling',
            'Counting semaphore = concurrency limiter',
            'Four Coffman conditions',
            'Prevention by breaking a condition; lock ordering',
            'Detection vs prevention; livelock/starvation',
          ],
          pitfalls: ['Saying a binary semaphore is identical to a mutex', 'Listing only "circular wait"'],
          followUps: ['What is priority inversion?'],
          personalAngle:
            'Limiting concurrent browser pages in your scrapers is a counting semaphore. Mention the limit you used and why.',
          references: [{ label: 'MDN: Atomics', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics' }],
        },
      ],
    },
    {
      id: 'os-linux',
      title: 'File systems & Linux fundamentals',
      summary: 'Inodes, permissions, signals and the commands you use on a server.',
      questions: [
        {
          id: 'os-inodes-file-descriptors',
          title: 'Inodes, links and file descriptors',
          type: 'concept',
          difficulty: 'core',
          priority: 'nice',
          tags: ['filesystem', 'inode', 'file-descriptor', 'linux'],
          estMinutes: 5,
          roles: ['backend', 'general'],
          prompt: `What is an **inode**? Explain hard vs symbolic links. A server's disk is full, you delete a 20 GB log file, and \`df\` **still shows the disk full**. Why?`,
          hints: [
            'File names are directory entries pointing to inodes.',
            'Data is freed when the link count AND open file count reach zero.',
          ],
          answer: `An **inode** stores a file's **metadata**: type, permissions, owner, size, timestamps, link count and pointers to data blocks. It **does not store the name**. A **directory** is a table mapping **names to inode numbers**.

- **Hard link**: another directory entry pointing to the **same inode**. Both names are equal, and the data survives until the **link count** reaches 0. Hard links can't span file systems and usually can't point to directories.
- **Symbolic link**: a separate small file containing a **path**. It can cross file systems and point to directories, and it **dangles** if the target is removed.

**File descriptors:** when a process opens a file, the kernel gives it a small integer (0 stdin, 1 stdout, 2 stderr, 3+ others) referring to an open-file entry that references the **inode**. Sockets and pipes are file descriptors too, and the per-process limit is \`ulimit -n\`.

**The full disk:** \`rm\` only removed the **directory entry**. The application (or logger) still has the file **open**, so the inode and its blocks stay allocated until the last descriptor closes. \`df\` reports block usage (still full), while \`du\` walks names (it no longer sees the file).

\`\`\`bash
sudo lsof +L1                 # open files with link count 0 (deleted but open)
# fix: restart/reload the process, or truncate through the fd:
: > /proc/<pid>/fd/<fd>
\`\`\`

**Prevention:** use log rotation (\`logrotate\` with \`copytruncate\`, or signal the app to reopen), Docker log driver limits (\`max-size\`, \`max-file\`), or log to stdout and let the platform handle it. Also check \`df -i\`: a disk can run out of **inodes** while blocks remain, for example with millions of tiny cache files.`,
          keyPoints: [
            'Inode = metadata + block pointers, no name',
            'Hard link = same inode; symlink = path',
            'FDs reference open files; ulimit -n',
            'Deleted-but-open files keep space; lsof +L1',
            'Inode exhaustion (df -i); log rotation',
          ],
          pitfalls: ['Thinking rm immediately frees space'],
          personalAngle:
            'Docker container logs filling a server disk is a common incident when you manage servers over SSH. If it happened to you, tell it as a short incident story with the max-size fix.',
          references: [{ label: 'Linux man page: inode(7)', url: 'https://man7.org/linux/man-pages/man7/inode.7.html' }],
        },
        {
          id: 'os-linux-signals-permissions',
          title: 'Linux on a server: signals, permissions and triage commands',
          type: 'project-deep-dive',
          difficulty: 'advanced',
          priority: 'should',
          tags: ['linux', 'signals', 'permissions', 'ssh', 'docker', 'troubleshooting'],
          estMinutes: 10,
          roles: ['backend', 'full-stack'],
          prompt: `You SSH into a production server: the API is slow and some deploys fail with "permission denied". **Walk me through your triage**: commands, what you look for, and how signals and permissions are involved. Also, why does \`docker stop\` sometimes take 10 seconds?`,
          hints: [
            'Start broad: load, CPU, memory, disk, network, then narrow to the process.',
            'rwx bits for user/group/other; who does the deploy run as?',
            'docker stop sends SIGTERM, waits, then SIGKILL. Who is PID 1?',
          ],
          answer: `**1. Broad health (first minute):**

\`\`\`bash
uptime                       # load averages vs CPU count
top / htop                   # CPU hogs, %wa (I/O wait), memory, swap
free -h; vmstat 1 5          # memory, swap in/out (si/so), run queue, context switches
df -h; df -i                 # disk blocks and inodes
iostat -x 1                  # disk saturation (%util, await)
ss -tulpn                    # listening ports and owning processes
journalctl -u api -n 200 --no-pager; dmesg -T | tail   # app logs, OOM kills
docker ps; docker stats; docker logs --tail 200 api
\`\`\`

**2. Narrow to the process:** \`ps aux --sort=-%cpu\`, \`pidstat 1\`, \`lsof -p <pid>\` (fd leaks), \`strace -p <pid>\` (stuck syscalls). For connectivity, \`curl -v localhost:3000/health\`.

**Permissions:** each file has an owner, a group and \`rwx\` bits for user, group and other (\`chmod 640\` means owner rw, group r). On directories, \`x\` means "can traverse". Typical deploy failures: the CI user doesn't own the deploy directory, a file was created by \`root\` during a manual \`sudo\` fix, the user isn't in the \`docker\` group (which is effectively root access), or SSH keys are too open (\`~/.ssh\` needs 700, private keys 600). Diagnose with \`ls -la\`, \`id deploy\` and \`namei -l /path\`. Fix ownership with \`chown\`, not \`chmod 777\`.

**Signals:** asynchronous notifications to a process. \`SIGTERM\` (15) is a polite stop that can be handled for **graceful shutdown**. \`SIGKILL\` (9) can't be caught. \`SIGINT\` is Ctrl-C. \`SIGHUP\` is often "reload config". Send them with \`kill -TERM <pid>\`.

**The 10-second \`docker stop\`:** Docker sends \`SIGTERM\` to the container's **PID 1**, waits 10 s, then sends \`SIGKILL\`. If PID 1 is a shell (\`CMD npm start\` in shell form, or \`sh -c\`), the shell **doesn't forward** the signal to Node. PID 1 also gets **no default signal handlers**, so unhandled SIGTERM is ignored. Fixes: use exec-form \`CMD ["node", "dist/main.js"]\`, run with \`--init\` or **tini** as PID 1 (which also reaps zombie processes such as orphaned Chromium), and handle \`SIGTERM\` in the app: stop accepting requests, drain, close the database pool, exit.`,
          keyPoints: [
            'Systematic triage: load, CPU, memory, disk, I/O, network, logs',
            'Process-level tools: ps, pidstat, lsof, strace',
            'rwx/ownership model; chown over chmod 777; docker group = root',
            'SIGTERM vs SIGKILL; graceful shutdown',
            'PID 1 signal forwarding; exec form, tini/--init',
          ],
          pitfalls: ['chmod -R 777 as a fix', 'kill -9 as the first move'],
          followUps: ['What is a zombie process and how is it reaped?'],
          personalAngle:
            'This is your territory: you configured servers over SSH and deployed with Docker and CI/CD. Tell one real incident in this structure (symptom, triage commands, root cause, fix, prevention).',
          references: [{ label: 'Linux man page: signal(7)', url: 'https://man7.org/linux/man-pages/man7/signal.7.html' }],
        },
      ],
    },
  ],
}

export default track
