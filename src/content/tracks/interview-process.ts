import type { Track } from '@/types/content'

const track: Track = {
  id: 'interview-process',
  code: 'A',
  title: 'Interview Process & Communication',
  summary: 'How technical interviews actually run, and how to think out loud, clarify, test and recover.',
  rationale:
    'You have shipped real systems, but interviews score how you reason in front of someone, not what you have shipped. A repeatable routine for clarifying, communicating, testing and recovering is the cheapest way to raise your pass rate in every other track.',
  icon: 'MessagesSquare',
  phase: 1,
  modules: [
    {
      id: 'ip-landscape',
      title: 'The interview landscape',
      summary: 'Which rounds exist, what each one scores, and how loops differ by company type.',
      questions: [
        {
          id: 'ip-interview-types',
          title: 'What each interview round is really scoring',
          type: 'concept',
          difficulty: 'foundation',
          priority: 'must',
          tags: ['interview-types', 'rubric', 'preparation'],
          estMinutes: 4,
          roles: ['general'],
          prompt: `A recruiter tells you the loop is: online assessment, technical screen, two coding rounds, one system design round and one behavioral round. **For each round, what is the interviewer actually trying to find out, and how would you change your preparation?**`,
          hints: [
            'Think about the signal each round can produce that the others cannot.',
            'Separate "correct output" from "how you got there". Most rounds score both.',
            'The OA is graded by a machine; everything else is graded by a human writing notes.',
          ],
          answer: `Each round exists to collect **one kind of signal** the others cannot. Preparing well means optimising for that signal.

| Round | Primary signal | What to optimise |
| --- | --- | --- |
| Online assessment | Correctness and efficiency against hidden tests | Edge cases, speed, avoiding a timeout with brute force |
| Technical screen | "Can this person code and communicate?" | A clean, working solution plus narration |
| Coding rounds | Problem solving, data-structure choice, code quality, testing | The clarify → plan → code → test loop |
| System design | Scoping, trade-offs, depth when probed | A structured approach and explicit trade-offs |
| Behavioral | Evidence of values: ownership, conflict, growth | STAR stories with *your* actions and measurable results |

**Why this matters:** human interviewers fill in a rubric that usually covers *communication, problem solving, technical competence and testing*. A candidate who reaches the optimal solution in silence can score lower than one who reaches a good solution while explaining their choices, testing and correcting a bug.

**How to adjust your preparation:**
- For the OA, practise under a timer and write edge-case tests in your head before you submit.
- For live rounds, practise **out loud**. Record yourself once; most people are surprised by how long they go quiet.
- For design, rehearse a fixed structure so your attention goes to trade-offs rather than "what comes next".
- For behavioral, build a story bank before the loop, not the night before.

Always ask the recruiter: *"What does each round cover, and which language or tools can I use?"* Companies expect the question, and the answer often changes what you prepare.`,
          keyPoints: [
            'Each round targets a distinct signal',
            'Human rounds score process and communication, not just the final answer',
            'Testing your own code is part of the rubric',
            'Ask the recruiter what each round covers',
          ],
          pitfalls: [
            'Treating every round as a LeetCode round',
            'Assuming behavioral rounds are a formality',
          ],
          followUps: ['How would you prepare differently for a startup loop with a take-home?'],
          references: [{ label: 'Tech Interview Handbook', url: 'https://www.techinterviewhandbook.org/' }],
        },
        {
          id: 'ip-company-type-loops',
          title: 'Tailoring preparation to the company type',
          type: 'tradeoff',
          difficulty: 'advanced',
          priority: 'should',
          tags: ['company-types', 'japan', 'strategy'],
          estMinutes: 5,
          roles: ['general'],
          companyTypes: ['startup', 'big-tech', 'japan-international', 'japan-traditional'],
          prompt: `You have interviews coming up at a Tokyo startup, an English-friendly Tokyo tech company and a traditional Japanese enterprise. **You only have three weeks. How do you split your preparation, and why?**`,
          hints: [
            'Which of these is most likely to run an algorithmic coding test early?',
            'Where does Japanese ability and 志望動機 matter most?',
            'Some preparation transfers to all three. Start there.',
          ],
          answer: `Start with what **transfers to all three**, then add what each company type specifically scores.

**Shared core (about 40% of the time):**
- A 90-second self-introduction and a "why this company" answer for each.
- Two or three project deep dives (the accessibility platform, the scraping system, REI-KIT), each with a diagram you can draw.
- Six to eight STAR stories.

**English-friendly Tokyo tech (about 35%):** these companies often put an **online coding test** first (platforms such as Codility or HackerRank are common) and then run coding, design and deep-dive rounds that resemble Western tech loops. Prioritise timed pattern practice (hash maps, two pointers, sliding window, BFS/DFS, heaps) and one practical system design, such as a job scheduler or scraping pipeline.

**Startup (about 15%):** expect practical rounds such as a take-home, pairing or "build this feature". Prepare by tightening framework fundamentals (React/Vue state, effects, data fetching) and by being ready to talk about product trade-offs and shipping speed. Your 0→1 platform work is the strongest story here.

**Traditional Japanese enterprise (about 10%, more if it is your top choice):** expect 書類選考, possibly an aptitude test such as SPI, and several interviews that move up the hierarchy. The questions centre on motivation (志望動機), long-term plans and consistency across rounds, and some or all of it may be in Japanese. Prepare a 職務経歴書, a Japanese 自己紹介, and answers to "why Japan / why this company / where will you be in 5 years".

**Principle:** prepare first for the earliest filter (the OA), because failing it ends the process before your strengths can show.`,
          keyPoints: [
            'Prioritise the earliest filter in each process',
            'Shared preparation: self-introduction, deep dives, STAR stories',
            'Tokyo international companies often start with a coding test',
            'Traditional companies weigh motivation, consistency and Japanese',
          ],
          pitfalls: [
            'Spending all your time on algorithms when one target is mostly behavioral or in Japanese',
            'Using one generic motivation answer for every company',
          ],
          followUps: ['How would you answer "Why Japan?" in a way that sounds long-term?'],
          personalAngle:
            'Pick a different lead story per company type: the accessibility platform 0→1 for startups, scraping reliability for tech companies, and enterprise client integrations for traditional firms.',
        },
        {
          id: 'ip-first-five-minutes',
          title: 'What to do in the first minutes of a coding round',
          type: 'multiple-choice',
          difficulty: 'foundation',
          priority: 'should',
          tags: ['clarifying', 'coding-interview', 'framework'],
          estMinutes: 2,
          roles: ['general'],
          prompt: `The interviewer pastes a problem: *"Given a list of meeting time ranges, return the minimum number of rooms needed."* **What is the best first move?**`,
          choices: [
            {
              id: 'a',
              text: 'Start coding the heap solution right away to save time',
              correct: false,
              explanation: 'You may solve the wrong problem, and you give the interviewer no signal about your reasoning.',
            },
            {
              id: 'b',
              text: 'Restate the problem, ask about input format and edge cases (empty list, touching intervals), and walk through a small example',
              correct: true,
              explanation: 'Clarifying requirements and edge cases is explicitly scored and prevents rework.',
            },
            {
              id: 'c',
              text: 'Ask the interviewer which algorithm they expect',
              correct: false,
              explanation: 'Asking for the solution gives up the signal they are trying to measure.',
            },
            {
              id: 'd',
              text: 'Write a full test suite before discussing an approach',
              correct: false,
              explanation: 'A couple of examples help, but a full suite before any approach wastes time.',
            },
          ],
          hints: ['What would you do if a product manager gave you this ticket?'],
          answer: `**Restate, clarify and run an example first.** In 2–4 minutes you confirm the problem and surface the edge cases that decide the algorithm.

For this problem, useful questions are:
- Are intervals \`[start, end)\`? If one meeting ends at 10:00 and another starts at 10:00, can they share a room? (This changes \`<\` to \`<=\` in the comparison.)
- Is the input sorted? Can it be empty? How large can *n* be?
- Integers or timestamps?

Then walk through \`[[0,30],[5,10],[15,20]]\`: at time 5 two meetings overlap, and at 15 the second has ended, so the answer is **2**.

Only then propose an approach: *"Sort by start time and keep a min-heap of end times, giving O(n log n)"*, and confirm before you code. Interviewers consistently report that candidates who skip this step lose more time than they save.`,
          keyPoints: [
            'Restate the problem in your own words',
            'Ask about boundaries and input size',
            'Work through a concrete example before coding',
            'Confirm the approach before writing code',
          ],
          pitfalls: ['Asking so many questions that you never start; aim for 2–4 minutes'],
        },
      ],
    },
    {
      id: 'ip-solving',
      title: 'Solving out loud',
      summary: 'A repeatable framework for coding rounds: clarify, plan, communicate, manage time and explain trade-offs.',
      questions: [
        {
          id: 'ip-problem-solving-framework',
          title: 'Your problem-solving framework',
          type: 'concept',
          difficulty: 'foundation',
          priority: 'must',
          tags: ['framework', 'coding-interview', 'communication'],
          estMinutes: 4,
          roles: ['general'],
          prompt: `**Walk me through how you approach a coding problem you have never seen before**, from the moment I paste it until you say "done".`,
          hints: [
            'There are roughly six steps. The first and last are the ones people skip.',
            'Where does complexity analysis belong: before or after coding?',
          ],
          answer: `I use the same six steps every time, so my attention goes to the problem rather than the process:

1. **Clarify (2–4 min):** restate the problem; ask about input types, size, edge cases (empty, duplicates, negatives) and the expected output format.
2. **Examples (2 min):** work one normal case and one edge case by hand. This often reveals the pattern.
3. **Approach (5 min):** state the brute force and its complexity, then look for the bottleneck. *"Repeated lookups suggest a hash map; contiguous ranges suggest a sliding window; shortest path suggests BFS."* Agree on the approach with the interviewer before coding.
4. **Code (15 min):** write clear code with good names, narrate the *why*, and use helper functions to keep the main logic readable.
5. **Test (5 min):** trace my own example through the code line by line, then the edge cases. Fix bugs out loud.
6. **Analyse and extend:** state the final time and space complexity and mention what I would change for larger inputs or production use.

\`\`\`text
Clarify → Examples → Approach (+ Big O) → Code → Test → Complexity & follow-ups
\`\`\`

The framework works because it **makes your reasoning visible** (which is what the rubric scores) and catches misunderstandings before they cost 15 minutes.`,
          keyPoints: [
            'Clarify and run examples before coding',
            'Brute force first, then optimise by finding the bottleneck',
            'Agree on the approach before writing code',
            'Test by tracing your own code, not only by "looking at it"',
            'State the final complexity',
          ],
          pitfalls: ['Skipping the brute force; it is a valid starting answer and shows progress'],
          followUps: ['What do you do if you cannot find anything better than the brute force?'],
          references: [{ label: 'Tech Interview Handbook', url: 'https://www.techinterviewhandbook.org/' }],
        },
        {
          id: 'ip-clarifying-requirements',
          title: 'Clarifying an ambiguous practical task',
          type: 'concept',
          difficulty: 'core',
          priority: 'must',
          tags: ['clarifying', 'requirements', 'practical-interview'],
          estMinutes: 5,
          roles: ['frontend', 'full-stack'],
          companyTypes: ['startup', 'mid-size', 'japan-international'],
          prompt: `"**Build an autocomplete search box** that calls \`/api/search?q=\`. You have 40 minutes." What do you ask before you write any code?`,
          hints: [
            'Group your questions: functional, edge cases, non-functional.',
            'Think about what happens when a user types fast.',
            'Accessibility is a requirement too.',
          ],
          answer: `I ask a few targeted questions in three groups, then **state my assumptions** for anything that is still open, so I can start within about 3 minutes.

**Functional**
- What does the API return (shape, maximum results)? Do I render plain text or highlight the match?
- What happens on selection: navigate, fill the input, or emit an event?
- Is there a minimum query length?

**Edge cases and behaviour**
- Typing fast: should I **debounce** (around 250 ms)? And what about **out-of-order responses**? An older request can resolve after a newer one, so I would cancel it with \`AbortController\` or ignore stale results.
- Empty results, errors and a loading state: what should the user see?
- Should results be cached per query?

**Non-functional**
- **Accessibility:** keyboard navigation (arrow keys, Enter, Escape) and the ARIA combobox pattern (\`role="combobox"\`, \`aria-expanded\`, \`aria-activedescendant\`, a listbox of options).
- Framework constraints (React or Vue, any library allowed?) and whether tests are expected.

Then I summarise: *"I'll build the input with a 250 ms debounce, abort stale requests, show loading, empty and error states, and support keyboard navigation. Caching is a stretch goal."* That gives the interviewer a chance to redirect me and shows I think like a product engineer, not just a coder.`,
          keyPoints: [
            'Group questions: functional, edge cases, non-functional',
            'Raise debouncing and race conditions on your own',
            'Treat accessibility as a requirement',
            'State your assumptions and the scope out loud',
          ],
          pitfalls: [
            'Asking dozens of questions instead of stating assumptions',
            'Forgetting stale responses (a race condition) entirely',
          ],
          followUps: ['How would you implement cancellation of stale requests?'],
          personalAngle:
            'Your accessibility platform background is a differentiator here: naming the combobox ARIA pattern without being asked is a strong signal.',
          references: [{ label: 'WAI-ARIA Authoring Practices: Combobox', url: 'https://www.w3.org/WAI/ARIA/apg/patterns/combobox/' }],
        },
        {
          id: 'ip-thinking-out-loud',
          title: 'Communicating while you code',
          type: 'concept',
          difficulty: 'core',
          priority: 'must',
          tags: ['communication', 'thinking-aloud', 'collaboration'],
          estMinutes: 4,
          roles: ['general'],
          prompt: `Interviewers often write "candidate was quiet" or "hard to follow". **How do you communicate effectively during a live coding round without slowing yourself down?**`,
          hints: [
            'Narrate decisions, not keystrokes.',
            'Think about signposting: tell them where you are in your plan.',
          ],
          answer: `Narrate **decisions and intent**, not every keystroke, and signpost where you are in your plan.

**What to say:**
- **Before a block:** *"Now I'll build the frequency map. One pass, O(n)."*
- **At decision points:** *"I could sort, but that is O(n log n). A hash set keeps it O(n) at the cost of O(n) memory, and I think that trade is fine here."*
- **When unsure:** *"I'm not sure whether \`splice\` mutates here. I'll assume it does and verify when I test."*
- **When pausing:** *"Give me 30 seconds to think about the termination condition."* Silence is fine when you have announced it.

**What to avoid:** reading the code aloud character by character, or long unexplained silences, which force the interviewer to guess.

**Treat the interviewer as a collaborator.** Check in at milestones (*"Does this approach make sense before I implement it?"*). Hints are part of the process; taking one well (*"Good point, a heap would avoid re-sorting"*) is a positive signal.

**Practice:** record one practice problem and listen back, or do a mock with a friend. Most people find long silent stretches they did not notice, especially when working in a second language. Prepare a few stock English phrases in advance so language does not take attention away from the problem.`,
          keyPoints: [
            'Narrate decisions and trade-offs, not keystrokes',
            'Signpost progress through your plan',
            'Announce pauses',
            'Check in at milestones and take hints gracefully',
          ],
          pitfalls: ['Going silent while debugging, which is exactly when narration helps most'],
          followUps: ['How do you handle an interviewer who stays silent and gives no feedback?'],
          personalAngle:
            'You already explain technical trade-offs to enterprise clients in meetings. Bring that same "explain it to the customer" mode into coding rounds.',
        },
        {
          id: 'ip-time-management',
          title: 'Managing a 45-minute coding round',
          type: 'concept',
          difficulty: 'core',
          priority: 'should',
          tags: ['time-management', 'coding-interview'],
          estMinutes: 3,
          roles: ['general'],
          prompt: `You are 25 minutes into a 45-minute round and still refining the optimal approach, with no code written. **What do you do?**`,
          hints: [
            'A working suboptimal solution beats a perfect idea with no code.',
            'Say your time decision out loud.',
          ],
          answer: `**Commit to the best approach I can fully implement now, and say so.** *"I'll implement the O(n log n) sort-based version so we have working code, then discuss how to reach O(n) if time allows."*

A rough budget for a 45-minute round with one problem:

| Phase | Minutes |
| --- | --- |
| Clarify and examples | 5 |
| Approach and complexity | 5–8 |
| Code | 15–20 |
| Test and fix | 5–7 |
| Follow-ups and your questions | 5 |

**Tactics:**
- **Set checkpoints:** if there is no agreed approach by minute 12–15, take the brute force or the best known approach.
- **Stub helpers:** write \`isValid(cell)\` as a call and implement it later, so the main logic lands first.
- **Skip boilerplate:** ask whether you can assume parsed input, or leave input validation as a comment.
- **Leave time for testing.** Untested code that has a bug often scores worse than slightly slower code that you verified.

If two problems are expected, ask at the start. Then aim for roughly 20 minutes on the first so the second gets a fair attempt.`,
          keyPoints: [
            'Working code beats a perfect idea with no code',
            'Use time checkpoints',
            'Stub helpers to land the main logic first',
            'Reserve time for testing',
          ],
          pitfalls: ['Optimising silently until time runs out'],
        },
        {
          id: 'ip-explaining-tradeoffs',
          title: 'Explaining trade-offs convincingly',
          type: 'tradeoff',
          difficulty: 'advanced',
          priority: 'must',
          tags: ['tradeoffs', 'communication', 'decision-making'],
          estMinutes: 5,
          roles: ['general'],
          prompt: `"**Why did you choose Redis for the job queue instead of just using the database?**" Show how you structure a trade-off answer so it sounds senior rather than defensive.`,
          hints: [
            'Lead with the decision, then the constraints that drove it.',
            'Name what you gave up, not only what you gained.',
            'Say when you would choose differently.',
          ],
          answer: `A strong trade-off answer follows **Decision → Context → Options → Why → Cost → When I'd revisit**.

> *"We used Redis with BullMQ for scraping jobs (**decision**). We needed retries, delayed jobs, concurrency limits and fast enqueue for thousands of tasks, and Redis was already running for caching (**context**). The alternatives were a Postgres-backed queue using \`SELECT … FOR UPDATE SKIP LOCKED\`, or a managed queue (**options**). BullMQ gave us retries, back-off and rate limiting out of the box, and Redis handles high-churn queue operations without adding write load to the primary database (**why**). The cost is a second stateful system to operate and weaker durability: we had to configure persistence and design jobs to be idempotent, because a job can run twice after a crash (**cost**). If volume were low, or we needed jobs inside the same transaction as business writes, I'd move to a Postgres queue to keep one source of truth (**revisit**)."*

**Why this structure works:**
- It shows the decision was **driven by constraints**, not taste.
- Naming the costs shows maturity; every choice has them.
- "When I'd revisit" shows you can adapt to new information.

Use the same skeleton for everything from \`useMemo\` vs no memo, to SSR vs SPA, to a monolith vs services.`,
          keyPoints: [
            'Lead with the decision and its constraints',
            'Compare at least one real alternative',
            'State the costs honestly',
            'Say when you would choose differently',
          ],
          pitfalls: [
            '"It is the industry standard" as the only reason',
            'Claiming the choice has no downsides',
          ],
          followUps: ['What happens to in-flight jobs if Redis restarts?'],
          personalAngle:
            'Make sure the details match what you actually built on the scraping system (persistence settings, recovery jobs, idempotency). Interviewers will probe them.',
        },
      ],
    },
    {
      id: 'ip-verify-recover',
      title: 'Testing, mistakes and recovery',
      summary: 'Verify your own code, handle being stuck, recover from mistakes and finish strongly.',
      questions: [
        {
          id: 'ip-testing-your-solution',
          title: 'Testing your own solution live',
          type: 'debugging',
          difficulty: 'core',
          priority: 'must',
          tags: ['testing', 'edge-cases', 'dry-run'],
          estMinutes: 6,
          roles: ['general'],
          prompt: `You wrote this to return the **index of the first duplicate value** (or -1). Before saying "done", test it out loud the way you would in an interview. What do you find?`,
          code: {
            language: 'typescript',
            source: `function firstDuplicateIndex(nums: number[]): number {
  const seen = new Set<number>()
  for (let i = 1; i < nums.length; i++) {
    if (seen.has(nums[i])) return i
    seen.add(nums[i])
  }
  return -1
}`,
          },
          hints: [
            'Trace a small input by hand: [3, 1, 3].',
            'Which element never gets added to the set?',
          ],
          answer: `**Bug: the loop starts at \`i = 1\`, so \`nums[0]\` is never added to \`seen\`.** For \`[3, 1, 3]\` the function returns -1 instead of 2.

How to test out loud in an interview:

1. **Trace a normal case** with a variables table:
   | i | nums[i] | seen before | result |
   | --- | --- | --- | --- |
   | 1 | 1 | {} | add 1 |
   | 2 | 3 | {1} | add 3, no duplicate found |

   The trace shows 3 at index 0 was never recorded.
2. **Edge cases:** \`[]\` → -1 ✓; \`[5]\` → -1 ✓; \`[2, 2]\` → should be 1 but returns -1 ✗ (same bug).
3. **Fix and re-test:**

\`\`\`ts
function firstDuplicateIndex(nums: number[]): number {
  const seen = new Set<number>()
  for (let i = 0; i < nums.length; i++) {
    if (seen.has(nums[i])) return i
    seen.add(nums[i])
  }
  return -1
}
// O(n) time, O(n) space
\`\`\`

**A checklist of edge cases to try:** empty input, a single element, all equal, already sorted or reversed, negatives or zero, very large n, and off-by-one boundaries such as the first and last index. Finding your own bug *calmly* is a positive signal. Interviewers expect bugs; they score how you find them.`,
          keyPoints: [
            'Trace a concrete input line by line',
            'Use a short list of edge-case categories',
            'Re-test after fixing',
            'Restate the complexity',
          ],
          pitfalls: ['"Looks right to me" without tracing', 'Only testing the happy path'],
        },
        {
          id: 'ip-being-stuck',
          title: 'What to do when you are stuck',
          type: 'concept',
          difficulty: 'core',
          priority: 'must',
          tags: ['stuck', 'recovery', 'hints'],
          estMinutes: 4,
          roles: ['general'],
          prompt: `Ten minutes in, you have no idea how to beat the O(n²) brute force. **What do you actually do and say?**`,
          hints: [
            'Writing the brute force is progress, not failure.',
            'There is a short list of moves for unblocking yourself.',
          ],
          answer: `Make progress visible and use a **checklist of unblocking moves**, not silence.

1. **Say where you are:** *"I have O(n²) from comparing every pair. I'm looking for the repeated work."*
2. **Find the bottleneck:** what is the inner loop recomputing? Repeated lookups suggest a **hash map**; repeated range sums suggest **prefix sums**; "best so far" suggests **greedy or a heap**.
3. **Run the pattern checklist:** is the input sorted (or would sorting help)? Two pointers or binary search. Contiguous subarray? Sliding window. A graph or grid? BFS/DFS. Overlapping subproblems? DP.
4. **Simplify:** solve a smaller version (n = 3, no duplicates), or the 1-D version of a 2-D problem, then generalise.
5. **Work more examples by hand,** especially ones where the brute force does a lot of wasted work.
6. **If still stuck, code the brute force,** cleanly and tested. *"Let me get a correct version down, then optimise."* A working O(n²) solution with clear analysis often scores better than an unfinished O(n) one.
7. **Accept hints gracefully.** Interviewers expect to give them; using a hint well is itself a signal.

What not to do: go quiet for minutes, give up, or start coding a half-formed idea in the hope that it works.`,
          keyPoints: [
            'Say where you are and what you are looking for',
            'Find the repeated work in the brute force',
            'Run through a checklist of patterns',
            'Fall back to a clean brute force',
            'Use hints as collaboration',
          ],
          pitfalls: ['Long silence', 'Abandoning the brute force without writing it'],
          followUps: ['How do you react if the interviewer\'s hint does not make sense to you?'],
        },
        {
          id: 'ip-handling-mistakes',
          title: 'Recovering from a mistake mid-interview',
          type: 'behavioral',
          difficulty: 'foundation',
          priority: 'should',
          tags: ['mistakes', 'recovery', 'composure'],
          estMinutes: 3,
          roles: ['general'],
          prompt: `While testing, you realise that your whole approach is wrong for one category of input (for example, negative numbers break your sliding window). **How do you handle it?**`,
          hints: ['Composure is part of the score.', 'Can the existing code be adapted, or do you need to pivot?'],
          answer: `**Name it, scope it, then decide whether to adapt or pivot, all out loud.**

1. **Name it plainly:** *"This breaks with negative numbers: shrinking the window no longer guarantees a smaller sum."* There is no need to apologise repeatedly.
2. **Scope the impact:** is it one case (a guard clause fixes it) or does it break the core assumption? A sliding window needs monotonicity, so negatives break the idea itself.
3. **Decide with time in mind:** *"With 15 minutes left I'll switch to prefix sums plus a hash map, which handles negatives in O(n). Most of the loop structure carries over."* Or, if time is short: *"I'll note the limitation and explain the fix."*
4. **Re-test the case that failed** after the change.

**Why it scores well:** interviewers see bugs constantly. Catching your own mistake, reasoning about its root cause and recovering calmly reflects how you would handle a production incident, which is exactly the signal they want. Trying to hide a flaw, or freezing, is what hurts.

The same applies to factual mistakes in discussion: *"Actually, I said \`Promise.all\` cancels the others. It doesn't; it just rejects early. Let me correct that."*`,
          keyPoints: [
            'Name the mistake without over-apologising',
            'Decide between a local fix and a pivot',
            'Base the decision on the time left',
            'Re-test the failing case',
          ],
          pitfalls: ['Hiding a known flaw and hoping the interviewer misses it'],
          personalAngle:
            'Treat it like your scraping recovery work: detect the failure, contain it, recover and verify. The interviewer is watching the same instinct.',
        },
        {
          id: 'ip-questions-for-interviewer',
          title: 'Closing well: your questions for them',
          type: 'concept',
          difficulty: 'foundation',
          priority: 'nice',
          tags: ['closing', 'questions', 'motivation'],
          estMinutes: 3,
          roles: ['general'],
          prompt: `"**Do you have any questions for me?**" What makes a strong answer here, and what would you ask an engineer, compared with a hiring manager?`,
          hints: ['Questions reveal what you care about.', 'Tailor them to the interviewer\'s role.'],
          answer: `Always ask **two or three specific questions that show what you care about**. Generic or no questions read as low interest.

**To an engineer:**
- *"What does a typical feature go through from ticket to production? How long does CI take, and how often do you deploy?"*
- *"What is the hardest technical problem the team is facing right now?"*
- *"How are frontend architecture decisions made? Is there a design system?"*

**To a hiring manager:**
- *"What would success look like for this role in the first 3 to 6 months?"*
- *"How does the team balance product work against technical debt?"*
- *"How do engineers grow here? Is there a technical career track?"*

**In Tokyo specifically** (when it is relevant to you): team language (English, Japanese or mixed), support for Japanese study, and how teams with mixed languages communicate.

**Avoid:** questions answered on their careers page, leading with salary or perks in technical rounds (keep those for the recruiter), and *"How did I do?"*

Write your questions down beforehand; it is fine to read them.`,
          keyPoints: [
            'Ask specific questions tailored to the interviewer\'s role',
            'Show interest in how work actually gets done',
            'Keep compensation for the recruiter',
          ],
          pitfalls: ['"No, I think you covered everything"'],
        },
      ],
    },
  ],
}

export default track
