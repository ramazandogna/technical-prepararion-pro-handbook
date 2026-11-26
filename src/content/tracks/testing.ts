import type { Track } from '@/types/content'

const track: Track = {
  id: 'testing',
  code: 'R',
  title: 'Testing & Code Quality',
  summary: 'Testing strategy, test doubles, async and component tests, reliable E2E, CI and code review.',
  rationale:
    'You have written Vitest/Jest tests and driven real browsers with Puppeteer and Playwright, but interviews ask you to justify a strategy: what to test at which level, how to keep tests fast and trustworthy, and how quality is protected in CI and code review. This track turns habits into arguments you can defend.',
  icon: 'FlaskConical',
  phase: 3,
  modules: [
    {
      id: 'test-strategy',
      title: 'Testing strategy',
      summary: 'Levels of testing, how to balance them, and what coverage and TDD can and cannot tell you.',
      questions: [
        {
          id: 'test-pyramid-vs-trophy',
          title: 'Testing pyramid vs testing trophy',
          type: 'tradeoff',
          difficulty: 'foundation',
          priority: 'must',
          tags: ['test-strategy', 'pyramid', 'trophy', 'integration-tests'],
          estMinutes: 5,
          roles: ['general'],
          prompt: `*"You're joining a team with almost no tests on a full-stack TypeScript product. How would you decide how many unit, integration and end-to-end tests to write?"* Mention the testing pyramid and the testing trophy.`,
          intent: `Tests whether you choose a test mix from product risk and cost rather than reciting a diagram. A strong answer explains both models and why they mostly agree, then gives a concrete, ordered plan for a team with almost no tests.`,
          hints: [
            `Every test level trades speed and precision against realism and confidence. Place unit, integration and E2E on that line.`,
            `The trophy adds a base layer below unit tests and puts most weight on one level. Which ones, and why for UI-heavy apps?`,
            `Do not answer with percentages. Start from where bugs would hurt this product most.`,
            `Plan: strict TypeScript + lint in CI first; a few E2E smoke tests on money paths; integration tests (API against a real test DB, components with mocked network) for new code; dense unit tests for pure logic; a regression test for every bug.`,
          ],
          answer: `Choose the mix by **confidence per unit of cost**, starting from the product's biggest risks.

**Testing pyramid** (Mike Cohn, popularised by Martin Fowler): many fast **unit** tests at the base, fewer **integration/service** tests, very few slow **end-to-end** tests at the top. The reasoning: unit tests are cheap, fast and pinpoint failures; E2E tests are slow and brittle.

**Testing trophy** (Kent C. Dodds): **static analysis** (TypeScript, ESLint) at the base, a thin layer of unit tests, the **largest layer of integration tests**, and a few E2E tests on top. The reasoning: in UI-heavy apps, most bugs live in how pieces work together, and tests that resemble real usage give more confidence per test. Types catch a whole class of errors for free.

They are not really opposed. Both say: **lots of fast tests, few slow ones, and pick the level that gives real confidence**. The trophy mostly moves the "sweet spot" from isolated units to integrated components or modules.

**What I'd do on that team:**
1. Turn on strict TypeScript and linting in CI: cheapest win.
2. Add **a handful of E2E smoke tests** for the money paths (sign up, core workflow, payment) so the worst regressions are caught immediately.
3. Write **integration tests** for new and changed code: API handlers against a real test database, components rendered with their children and a mocked network.
4. Write **unit tests** for pure logic with many edge cases: parsers, pricing, scheduling, matching rules.
5. Add a test for every bug fixed, at the lowest level that reproduces it.

The shape is a result, not a target. Measure it by "do failures catch real bugs, and do developers trust the suite?"`,
          walkthrough: [
            {
              title: 'Name what is being asked',
              body: `Not "draw the pyramid", but "how would **you** decide the mix on a real team". The interviewer wants the trade-off and a plan.`,
            },
            {
              title: 'Explain both models',
              body: `**Pyramid** (Cohn/Fowler): many fast unit tests, fewer integration, very few E2E. **Trophy** (Kent C. Dodds): static analysis at the base, a thin unit layer, **most weight on integration**, a few E2E. Both say: many fast tests, few slow ones, at the level that gives real confidence.`,
            },
            {
              title: 'Give the plan',
              body: `1. Strict TypeScript and ESLint in CI.
2. A handful of E2E smoke tests for sign-up, the core workflow and payment.
3. Integration tests for new and changed code: API against a real test DB, components with a mocked network.
4. Unit tests for pure logic with many edge cases (parsing, pricing, matching).
5. A test for every bug fixed, at the lowest level that reproduces it.`,
            },
            {
              title: 'Cover the edge cases',
              body: `The shape is an outcome, not a quota. Watch for only-E2E suites (slow, flaky) and only-mocked unit suites (green while production breaks). Judge the suite by whether failures catch real bugs and developers trust it.`,
            },
            {
              title: 'Say it in 30 seconds',
              body: `"I pick the level with the best confidence per cost. The pyramid and the trophy agree on lots of fast tests and few slow ones; the trophy just centres on integration, which fits UI-heavy apps. On a new team I'd turn on strict types, add E2E smoke tests for money paths, write integration tests for new code, unit-test tricky logic, and add a regression test per bug."`,
            },
          ],
          keyPoints: [
            'Pyramid: many unit, fewer integration, few E2E',
            'Trophy: static analysis base, most weight on integration',
            'Trade-off is speed/precision vs realism/confidence',
            'Start from product risk and critical paths',
            'Static typing is the cheapest layer',
          ],
          pitfalls: [
            'Treating the shape as a quota',
            'Only E2E tests (slow, flaky) or only mocked unit tests (low confidence)',
          ],
          followUps: ['Where would you test the matching logic of a scraping pipeline?', 'How do you keep integration tests fast?'],
          personalAngle:
            'Use the scraping system as the example: the matching rules deserve dense unit tests, while the fetch → parse → store flow needs a few integration tests against saved HTML fixtures.',
          references: [{ label: 'The Practical Test Pyramid (Martin Fowler)', url: 'https://martinfowler.com/articles/practical-test-pyramid.html' }],
        },
        {
          id: 'test-levels-mc',
          title: 'Which level should this test live at?',
          type: 'multiple-choice',
          difficulty: 'foundation',
          priority: 'must',
          tags: ['unit-tests', 'integration-tests', 'e2e', 'test-strategy'],
          estMinutes: 3,
          roles: ['general'],
          prompt: `You must test that **a user who submits the signup form with an already-registered email sees the message "Email already in use"**. The check happens in a NestJS endpoint that queries PostgreSQL; the form is a Vue component. **Which test gives the best confidence for its cost?** Select all that apply.`,
          choices: [
            {
              id: 'a',
              text: 'A component test that renders the form, mocks the HTTP layer to return a 409 response, submits, and asserts the message is shown.',
              correct: true,
              explanation: 'Fast and precise for the UI contract: given a 409, the user sees the right message.',
            },
            {
              id: 'b',
              text: 'An API integration test that calls the signup endpoint twice with the same email against a test database and asserts a 409 the second time.',
              correct: true,
              explanation: 'Verifies the real uniqueness check, including the database constraint, without a browser.',
            },
            {
              id: 'c',
              text: 'A unit test of the Vue component that asserts an internal errorMessage ref is set.',
              correct: false,
              explanation: 'Tests implementation details; it can pass while the message is not rendered, and breaks on harmless refactors.',
            },
            {
              id: 'd',
              text: 'Only an E2E test through the browser, backend and database, for every error case of the form.',
              correct: false,
              explanation: 'One E2E for the main signup path is reasonable; covering every error case end to end is slow and brittle.',
            },
          ],
          intent: `Tests whether you can split one user-visible behaviour into contracts and test each at the cheapest realistic level. A strong answer picks the API integration test against a real database and the component test with a mocked 409, and explains why internal-state and all-E2E options are worse.`,
          hints: [
            `Split the behaviour into two contracts: the backend rejects duplicates, and the UI shows a message for that rejection.`,
            `For the backend part, what could a mocked repository fail to catch that a real database would?`,
            `For the UI part, which option asserts what the user sees rather than an internal ref?`,
            `A (component test with mocked 409, asserting the visible message) and B (API test against a test DB, second call returns 409) are correct; C tests internals; D pushes every case through slow E2E.`,
          ],
          answer: `**A and B.** Split the behaviour at the API contract and test each side at the cheapest level that is still realistic:

- **B (API integration test)** proves the backend really rejects duplicates, including the unique constraint in PostgreSQL. A mocked repository could not catch a missing index or constraint.
- **A (component test)** proves the UI turns a 409 into the visible message. Mocking the network is fine here because the contract (status 409 plus an error body) is what you are testing.

**C** tests implementation details: an internal ref can be set while the template shows nothing, and renaming it breaks the test without any user-visible change.

**D** is not wrong as a single smoke test of signup, but pushing every validation case through E2E makes the suite slow and flaky. Keep E2E for critical paths and let integration tests cover the variations.

The general rule: **test behaviour at the boundary the user or caller sees**, and pick the lowest level that exercises the real thing you are worried about.`,
          walkthrough: [
            {
              title: 'Split the behaviour at the API contract',
              body: `One feature, two contracts: **the backend returns 409 for a duplicate email**, and **the UI turns a 409 into "Email already in use"**. Each can be tested independently at a cheap level.`,
            },
            {
              title: 'Test the backend against the real thing',
              body: `**B**: call the endpoint twice against a test database and expect 409 the second time. Only a real database proves the unique constraint exists; a mocked repository would test your assumptions.`,
            },
            {
              title: 'Test the UI through what the user sees',
              body: `**A**: render the form, mock HTTP to return 409, submit, and assert the visible message. Mocking the network is fine because the contract is exactly what is under test.`,
            },
            {
              title: 'Reject the others with reasons',
              body: `**C** asserts an internal ref: it can pass while nothing renders and breaks on harmless refactors. **D** is fine as one signup smoke test, but every error case end to end is slow and brittle.`,
            },
            {
              title: 'Say it in 30 seconds',
              body: `"A and B. I split at the API: an integration test against a real database proves duplicates get a 409, and a component test with a mocked 409 proves the user sees the message. Asserting internal state tests implementation, and pushing every case through E2E is slow; I keep E2E for the main path."`,
            },
          ],
          keyPoints: [
            'Split at the API contract',
            'Backend rule tested against a real database',
            'UI tested through what the user sees',
            'E2E reserved for critical paths',
          ],
          pitfalls: ['Asserting on internal component state', 'Mocking the database when the constraint is the thing under test'],
          followUps: ['How do you keep the frontend mock and the real API response in sync?'],
        },
        {
          id: 'test-coverage-limits',
          title: 'What code coverage does and does not tell you',
          type: 'concept',
          difficulty: 'core',
          priority: 'should',
          tags: ['coverage', 'mutation-testing', 'quality-metrics'],
          estMinutes: 4,
          roles: ['general'],
          prompt: `*"Our manager wants 90% coverage enforced in CI. Is that a good idea?"*`,
          intent: `Tests whether you understand what coverage measures and can push back on a metric target constructively. A strong answer separates execution from verification, prefers branch coverage, proposes better uses (gap-finding, no-decline floors), and mentions mutation testing.`,
          hints: [
            `Coverage measures which lines ran during the tests. Does it measure what was checked?`,
            `Could a test with zero assertions reach 100%? What behaviour does a hard target encourage?`,
            `Which coverage type is more informative than line coverage, and which technique checks whether tests would notice a bug?`,
            `Answer: use coverage to find untested risky code and enforce "no drop on changed files" instead of a global 90% gate; prefer branch coverage; use mutation testing (Stryker) on critical modules; require tests for new behaviour in review.`,
          ],
          answer: `**Coverage is a useful signal for finding untested code, and a poor target.** It tells you what *executed* during tests, not whether anything was *verified*.

**Types:** line and statement coverage (was this line run?), **branch coverage** (was each side of every if/else and ternary taken?), and function coverage. Branch coverage is the more informative one. In Vitest, coverage comes from the v8 or istanbul provider.

**Why a hard percentage backfires:**
- A test with no assertions can produce 100% coverage.
- Teams start testing trivial getters and generated code to hit the number, while the hard edge cases stay untested.
- The last 10% is often error handling that is expensive to reach, so people write convoluted tests or exclude files.

**Better uses:**
- Read the coverage report to find **untested risky code**: business rules, error paths, branches in matching or pricing logic.
- Enforce a **floor that prevents decline** (for example "coverage must not drop on changed files"), rather than a global target.
- Combine with code review: "is the new behaviour tested?" matters more than the number.

**Mutation testing** (for example Stryker for JavaScript/TypeScript) answers the real question: it makes small changes to your code, such as flipping a > to >=, and checks that some test fails. Surviving mutants show assertions that are missing. It is slower, so it suits critical modules.

**My answer to the manager:** use coverage to find gaps and stop it from falling, require tests for new behaviour in review, and do not make 90% a gate on its own.`,
          keyPoints: [
            'Coverage measures execution, not verification',
            'Branch coverage beats line coverage',
            'Targets encourage low-value tests',
            'Use as a gap-finder and a no-regression floor',
            'Mutation testing checks assertion quality',
          ],
          pitfalls: ['Equating high coverage with correctness', 'Excluding files just to reach a target'],
          followUps: ['How would you introduce mutation testing without slowing CI?'],
          references: [{ label: 'Vitest: Coverage', url: 'https://vitest.dev/guide/coverage' }],
        },
        {
          id: 'test-tdd-tradeoffs',
          title: 'Test-driven development: when it helps and when it does not',
          type: 'tradeoff',
          difficulty: 'core',
          priority: 'nice',
          tags: ['tdd', 'design', 'workflow'],
          estMinutes: 4,
          roles: ['general'],
          prompt: `*"Do you practise TDD? When would you use it and when not?"*`,
          intent: `Tests whether you have an honest, nuanced position on TDD instead of a slogan. A strong answer explains the loop, names where it pays off (tricky logic, bug fixes, API design) and where it does not (exploration, fast-changing UI), and admits its costs.`,
          hints: [
            `Describe the loop in three words, and why the steps are small.`,
            `How well do you know the requirements and the design? Where does test-first force useful decisions?`,
            `Where would tests written first mostly get thrown away?`,
            `Position: test-first for pure logic and bug reproductions, test-alongside for features, spike-then-test for exploration; always test behaviour through public interfaces so refactoring stays cheap.`,
          ],
          answer: `**TDD is a tool I use when the behaviour is clear and the logic is tricky; I don't apply it dogmatically.**

**The loop:** write a failing test (red), write the simplest code to pass (green), improve the design with the tests as a safety net (refactor). Small steps.

**Where it pays off:**
- **Pure logic with many edge cases:** parsers, date and scheduling rules, matching and scoring functions, validation. Writing the cases first forces you to define the behaviour.
- **Bug fixes:** write a test that reproduces the bug first. It proves the fix and prevents regressions.
- **Designing an API:** writing the call site first in a test shows whether the interface is pleasant to use.

**Where it is less useful:**
- **Exploratory or prototype work**, where you do not know the shape yet. Tests written now get thrown away. Spike first, then write tests for what survives.
- **UI layout and visual design**, which change quickly and are better checked visually or with a few behaviour tests.
- **Thin glue code** around a framework, where an integration test after the fact gives more value.

**Costs to admit:** slower at first, and if tests are coupled to implementation details they make refactoring harder, which is the opposite of the goal. Testing behaviour through public interfaces avoids that.

**A practical position:** "test-first for logic and bugs, test-alongside for features, and never merge new behaviour without tests."`,
          keyPoints: [
            'Red, green, refactor in small steps',
            'Strong for pure logic, edge cases and bug reproduction',
            'Weak for exploration and fast-changing UI',
            'Test behaviour, not implementation, to keep refactoring cheap',
          ],
          pitfalls: ['Claiming strict TDD for everything if you do not', 'Dismissing TDD without understanding its design benefit'],
          followUps: ['Show me how you would test-drive a function that normalises company names for matching.'],
          personalAngle:
            'The matching logic in your scraping work is a perfect TDD example: list tricky name pairs as test cases first, then make them pass.',
        },
      ],
    },
    {
      id: 'test-unit-async',
      title: 'Unit tests, doubles and async code',
      summary: 'Mocks, stubs, spies and fakes; fake timers and promises; Vitest and Jest behaviour that surprises people.',
      questions: [
        {
          id: 'test-doubles',
          title: 'Mocks, stubs, spies and fakes',
          type: 'concept',
          difficulty: 'core',
          priority: 'must',
          tags: ['test-doubles', 'mocks', 'stubs', 'spies', 'fakes', 'vitest'],
          estMinutes: 5,
          roles: ['general'],
          prompt: `*"Explain the difference between a mock, a stub, a spy and a fake. When would you use each, and when is mocking a bad idea?"*`,
          intent: `Tests whether you use test-double vocabulary precisely and know when doubles help or hide bugs. A strong answer defines each double, shows vi.fn and vi.spyOn, prefers asserting state over interactions, and explains "do not mock what you do not own" and why fakes are often best.`,
          hints: [
            `Some doubles provide answers; others record or verify calls. Which is which?`,
            `A fake is a working implementation, just simpler. Give an example for a repository.`,
            `What happens to your test suite when you mock an ORM or SDK you do not own, and its behaviour differs from your mock?`,
            `Table: dummy (unused), stub (canned answers), spy (records calls), mock (verifies expectations), fake (in-memory repo). vi.fn() is stub + spy. Prefer state assertions; verify interactions only when the call is the behaviour (email, charge); wrap third-party code behind your own interface.`,
          ],
          answer: `All are **test doubles** (Gerard Meszaros's term): stand-ins for a real dependency.

| Double | What it does | Typical use |
| --- | --- | --- |
| **Dummy** | Passed but never used | Filling a required parameter |
| **Stub** | Returns canned answers | "The API returns this user" |
| **Spy** | Records how it was called (often wrapping the real thing) | Assert an analytics event was sent |
| **Mock** | Pre-programmed with expectations it verifies | Assert the email service was called once with X |
| **Fake** | A working but simplified implementation | In-memory repository instead of PostgreSQL |

In Vitest (Jest is almost identical), vi.fn() creates a function that is both stub and spy, and vi.spyOn(obj, 'method') wraps an existing method:

\`\`\`ts
import { expect, it, vi } from 'vitest'
import { registerUser } from './register'

it('sends a welcome email after registering', async () => {
  const users = new InMemoryUserRepo() // fake
  const mailer = { send: vi.fn().mockResolvedValue(undefined) } // stub + spy

  await registerUser({ email: 'a@example.com' }, { users, mailer })

  expect(await users.findByEmail('a@example.com')).toBeDefined() // state
  expect(mailer.send).toHaveBeenCalledWith(expect.objectContaining({ to: 'a@example.com' })) // interaction
})
\`\`\`

**Prefer state over interaction:** checking the result (a user exists) survives refactoring; checking every call couples the test to the implementation. Verify interactions only when the call *is* the behaviour, such as sending an email or charging a card.

**When mocking hurts:**
- Mocking what you don't own (an ORM, a third-party SDK) tests your assumptions about it, not the real thing. Wrap it behind your own interface and test the wrapper with an integration test.
- Mocking everything gives fast tests that all pass while the system is broken.
- Deep mock chains (a mock returning a mock returning a mock) signal a design that needs a simpler boundary.

Fakes often give the best balance: realistic behaviour, fast, and reusable across many tests.`,
          walkthrough: [
            {
              title: 'Name what is being asked',
              body: `Definitions **and** judgment: what each double is, when to use it, and when mocking makes tests lie.`,
            },
            {
              title: 'Define the doubles',
              body: `| Double | Does | Example |
| --- | --- | --- |
| Dummy | passed, unused | required argument |
| Stub | canned answers | "API returns this user" |
| Spy | records calls | analytics event sent |
| Mock | verifies expectations | mailer called once with X |
| Fake | simple working impl | in-memory repository |`,
            },
            {
              title: 'Show it in Vitest',
              body: `\`\`\`ts
const users = new InMemoryUserRepo() // fake
const mailer = { send: vi.fn().mockResolvedValue(undefined) } // stub + spy
await registerUser({ email: 'a@example.com' }, { users, mailer })
expect(await users.findByEmail('a@example.com')).toBeDefined() // state
expect(mailer.send).toHaveBeenCalledWith(expect.objectContaining({ to: 'a@example.com' }))
\`\`\``,
            },
            {
              title: 'Know when mocking hurts',
              body: `Prefer **state over interaction** assertions. Do not mock what you do not own (ORM, SDK): wrap it and test the wrapper with an integration test. Deep mock chains signal a bad boundary. Fakes often give the best balance of speed and realism.`,
            },
            {
              title: 'Say it in 30 seconds',
              body: `"A stub returns canned data, a spy records calls, a mock verifies expected calls, and a fake is a simple working implementation like an in-memory repo. I mostly assert on resulting state and only verify calls when the call is the point, like sending an email. I don't mock libraries I don't own; I wrap them and integration-test the wrapper."`,
            },
          ],
          keyPoints: [
            'Stub returns answers; spy records; mock verifies expectations; fake works simply',
            'vi.fn / vi.spyOn and their Jest equivalents',
            'Prefer asserting state over interactions',
            'Do not mock what you do not own; wrap it',
            'Fakes balance speed and realism',
          ],
          pitfalls: ['Using "mock" for every double without distinction', 'Over-mocking until tests pass while production fails'],
          followUps: ['How would you test code that calls Redis?'],
          references: [{ label: "Mocks Aren't Stubs (Martin Fowler)", url: 'https://martinfowler.com/articles/mocksArentStubs.html' }],
        },
        {
          id: 'test-async-timers',
          title: 'Testing debounced and async code with fake timers',
          type: 'coding',
          difficulty: 'core',
          priority: 'must',
          tags: ['async', 'fake-timers', 'debounce', 'vitest', 'jest'],
          estMinutes: 15,
          roles: ['general'],
          prompt: `Here is a debounce helper used for autosaving notes. **Write Vitest tests that prove it calls the function once, with the latest arguments, only after the quiet period.** Then explain how you would test an async function that retries after a delay.`,
          code: {
            language: 'typescript',
            source: `export function debounce<A extends unknown[]>(fn: (...args: A) => void, ms: number) {
  let timer: ReturnType<typeof setTimeout> | undefined
  return (...args: A) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}`,
          },
          intent: `Tests whether you can write deterministic tests for time-based and async code. A strong answer uses fake timers, asserts right before and at the boundary, checks the latest arguments and single call, uses the async timer helpers when promises are involved, and restores real timers.`,
          hints: [
            `Real waiting makes tests slow and flaky. How can the test control the clock instead?`,
            `To prove "only after the quiet period", which two moments should you assert at?`,
            `When a retry waits on a timer inside a promise chain, the sync advanceTimersByTime may not flush the promise callbacks. Which variant does?`,
            `Skeleton: beforeEach(vi.useFakeTimers); afterEach(vi.useRealTimers); call debounced('a'), ('ab'), ('abc'); advanceTimersByTime(799) → not called; advanceTimersByTime(1) → calledTimes(1) with 'abc'. For retries: const p = runWithRetry(fn); await vi.advanceTimersByTimeAsync(1000); await expect(p).resolves.toBe('ok').`,
          ],
          answer: `Use **fake timers** so the test controls time instead of waiting for it.

\`\`\`ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { debounce } from './debounce'

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('calls once with the latest arguments after the quiet period', () => {
    const save = vi.fn()
    const debounced = debounce(save, 800)

    debounced('a')
    debounced('ab')
    debounced('abc')

    vi.advanceTimersByTime(799)
    expect(save).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(save).toHaveBeenCalledTimes(1)
    expect(save).toHaveBeenCalledWith('abc')
  })

  it('restarts the timer on every call', () => {
    const save = vi.fn()
    const debounced = debounce(save, 800)

    debounced('a')
    vi.advanceTimersByTime(500)
    debounced('b')
    vi.advanceTimersByTime(500)
    expect(save).not.toHaveBeenCalled()

    vi.advanceTimersByTime(300)
    expect(save).toHaveBeenCalledTimes(1)
    expect(save).toHaveBeenCalledWith('b')
  })
})
\`\`\`

Testing at 799 and 800 ms proves the boundary, not just "eventually".

**Async code with delays** (for example "fetch, and on failure retry after 1 s"): promises and timers interleave, so use the async timer helpers, which flush pending promise callbacks between timer steps:

\`\`\`ts
it('retries once after a failure', async () => {
  vi.useFakeTimers()
  const fetchJob = vi.fn().mockRejectedValueOnce(new Error('timeout')).mockResolvedValueOnce('ok')

  const result = runWithRetry(fetchJob, { delayMs: 1000 })
  await vi.advanceTimersByTimeAsync(1000)

  await expect(result).resolves.toBe('ok')
  expect(fetchJob).toHaveBeenCalledTimes(2)
})
\`\`\`

**Rules for async tests:**
- Always await (or return) the promise. A forgotten await lets the test finish before the assertion runs, so it passes falsely.
- Use resolves / rejects for promise assertions.
- Restore real timers after each test so they don't leak into other tests.

Jest has the same API under jest.useFakeTimers(), jest.advanceTimersByTime() and jest.advanceTimersByTimeAsync() in recent versions.`,
          walkthrough: [
            {
              title: 'Restate the contract to test',
              body: `Three properties: called **once**, with the **latest arguments**, **only after** the quiet period, and each call restarts the timer. Then a second part: async code with a delay.`,
            },
            {
              title: 'Control time with fake timers',
              body: `\`vi.useFakeTimers()\` replaces \`setTimeout\` so time moves only when the test calls \`vi.advanceTimersByTime(ms)\`. No real waiting, no flakiness. Restore with \`vi.useRealTimers()\` in \`afterEach\`.`,
            },
            {
              title: 'Write the tests',
              body: `\`\`\`ts
it('calls once with the latest args after 800 ms', () => {
  const save = vi.fn()
  const debounced = debounce(save, 800)
  debounced('a'); debounced('ab'); debounced('abc')
  vi.advanceTimersByTime(799)
  expect(save).not.toHaveBeenCalled()
  vi.advanceTimersByTime(1)
  expect(save).toHaveBeenCalledTimes(1)
  expect(save).toHaveBeenCalledWith('abc')
})
\`\`\`
Add a second test: call, advance 500, call again, advance 500 → not called; advance 300 → called with the second value.`,
            },
            {
              title: 'Handle async code and common traps',
              body: `\`\`\`ts
const result = runWithRetry(fetchJob, { delayMs: 1000 })
await vi.advanceTimersByTimeAsync(1000) // flushes promise callbacks between timers
await expect(result).resolves.toBe('ok')
\`\`\`
Always \`await\` promise assertions (a missing await makes the test pass falsely), and never leak fake timers into other tests.`,
            },
            {
              title: 'Say it in 30 seconds',
              body: `"I use fake timers so the test owns the clock. I call the debounced function three times, advance 799 ms and assert nothing happened, then 1 ms more and assert one call with the last arguments. For async retries I use advanceTimersByTimeAsync so promises flush, always await the assertion, and restore real timers after each test."`,
            },
          ],
          keyPoints: [
            'Fake timers instead of real waiting',
            'Assert just before and at the boundary',
            'Latest arguments and single call',
            'Async timer helpers when promises and timers mix',
            'Always await; restore real timers',
          ],
          pitfalls: [
            'Using real setTimeout waits in tests',
            'Forgetting await, so assertions never run',
            'Leaking fake timers into other tests',
          ],
          followUps: ['How would you test the same autosave inside a Vue component?'],
          references: [{ label: 'Vitest: Mocking timers', url: 'https://vitest.dev/guide/mocking' }],
        },
        {
          id: 'test-vi-mock-hoisting',
          title: 'Why does this module mock break? (vi.mock hoisting)',
          type: 'output',
          difficulty: 'advanced',
          priority: 'should',
          tags: ['vitest', 'jest', 'module-mocking', 'hoisting'],
          estMinutes: 5,
          roles: ['general'],
          prompt: `**What happens when this Vitest file runs, and how do you fix it?**`,
          code: {
            language: 'typescript',
            source: `import { expect, it, vi } from 'vitest'
import { greet } from './greet' // greet() calls getUser() from './api'

const fakeUser = { name: 'Aiko' }

vi.mock('./api', () => ({
  getUser: vi.fn(() => fakeUser),
}))

it('greets the user', () => {
  expect(greet()).toBe('Hello, Aiko')
})`,
          },
          intent: `Tests whether you understand how module mocking actually works in Vitest and Jest, not just its syntax. A strong answer predicts the failure, explains hoisting and the temporal dead zone, and gives the idiomatic fixes (inline data, vi.hoisted, automock + per-test setup).`,
          hints: [
            `vi.mock is not executed on the line where it is written. Where does the transformer move it?`,
            `If vi.mock runs before the imports, when does its factory run, and has const fakeUser been initialised by then?`,
            `Accessing a const before its declaration line runs is a temporal dead zone error.`,
            `Fixes: define the data inside the factory; or const { fakeUser } = vi.hoisted(() => ({ fakeUser: { name: 'Aiko' } })); or vi.mock('./api') then vi.mocked(getUser).mockReturnValue({ name: 'Aiko' }) inside the test.`,
          ],
          answer: `**The test fails with an error about the mock factory**: the underlying cause is a ReferenceError, because the factory reads fakeUser before it is initialised.

**Why:** Vitest **hoists vi.mock calls to the top of the file**, above the imports, so the mock is registered before any module loads (Jest does the same with jest.mock). The order effectively becomes:

1. vi.mock('./api', factory) registered.
2. import './greet' runs, which imports './api', which calls the factory.
3. The factory reads fakeUser, but the line const fakeUser = ... has not run yet. A const in its temporal dead zone throws.

Vitest reports this with a message explaining that vi.mock is hoisted and that the factory must not use top-level variables.

**Fixes:**

\`\`\`ts
// 1. Define the data inside the factory
vi.mock('./api', () => ({
  getUser: vi.fn(() => ({ name: 'Aiko' })),
}))

// 2. Or hoist the shared value explicitly
const { fakeUser } = vi.hoisted(() => ({ fakeUser: { name: 'Aiko' } }))
vi.mock('./api', () => ({ getUser: vi.fn(() => fakeUser) }))

// 3. Or mock simply and set behaviour per test
import { getUser } from './api'
vi.mock('./api')
it('greets the user', () => {
  vi.mocked(getUser).mockReturnValue({ name: 'Aiko' })
  expect(greet()).toBe('Hello, Aiko')
})
\`\`\`

Option 3 is often the cleanest: the automock replaces exports with vi.fn(), and each test configures what it needs. Jest uses jest.mock with the same rule; in Jest, factory variables prefixed with mock are allowed as an escape hatch.

**Broader lesson:** heavy module mocking is a sign the code reaches for dependencies directly. Passing dependencies in (as parameters or through a small interface) often removes the need for module mocks entirely.`,
          walkthrough: [
            {
              title: 'Predict the result',
              body: `The test **fails before the assertion**: Vitest reports an error from the mock factory, caused by a ReferenceError because \`fakeUser\` is read before it is initialised.`,
            },
            {
              title: 'Explain the mechanism: hoisting',
              body: `Vitest (and Jest) **hoist \`vi.mock\` above the imports** so the mock is registered before any module loads. Order becomes: register mock → import \`./greet\` → it imports \`./api\` → factory runs → reads \`fakeUser\`, which is still in its **temporal dead zone**.`,
            },
            {
              title: 'Apply a fix',
              body: `\`\`\`ts
// inline data
vi.mock('./api', () => ({ getUser: vi.fn(() => ({ name: 'Aiko' })) }))

// or hoist the shared value
const { fakeUser } = vi.hoisted(() => ({ fakeUser: { name: 'Aiko' } }))
vi.mock('./api', () => ({ getUser: vi.fn(() => fakeUser) }))

// or automock and configure per test
vi.mock('./api')
vi.mocked(getUser).mockReturnValue({ name: 'Aiko' })
\`\`\``,
            },
            {
              title: 'Cover the edge cases',
              body: `Changing \`const\` to \`var\` hides the problem (the value is \`undefined\`). Jest allows factory variables prefixed with \`mock\` as an escape hatch. Heavy module mocking often means the code should take its dependencies as parameters instead.`,
            },
            {
              title: 'Say it in 30 seconds',
              body: `"It throws: vi.mock is hoisted above the imports, so the factory runs when greet imports api, before const fakeUser is initialised, which is a TDZ error. I'd put the data inside the factory, use vi.hoisted, or automock the module and set the return value per test with vi.mocked."`,
            },
          ],
          keyPoints: [
            'vi.mock / jest.mock are hoisted above imports',
            'Factory runs when the mocked module is first imported',
            'Top-level const is in the TDZ at that point',
            'Fixes: inline data, vi.hoisted, or automock plus per-test setup',
          ],
          pitfalls: ['Assuming vi.mock runs in source order', 'Fixing it by changing const to var and hiding the real problem'],
          followUps: ['When would you prefer dependency injection over module mocking?'],
          references: [{ label: 'Vitest: vi API', url: 'https://vitest.dev/api/vi' }],
        },
        {
          id: 'test-nestjs-testcontainers',
          title: 'Testing a NestJS service: mocked repository vs Testcontainers',
          type: 'coding',
          difficulty: 'core',
          priority: 'must',
          tags: ['nestjs', 'testcontainers', 'integration-tests', 'prisma', 'postgresql', 'mocking', 'vitest'],
          estMinutes: 20,
          roles: ['backend', 'full-stack'],
          prompt: `\`InvitesService.accept(token, userId)\` checks the invite is not expired, adds the user to the workspace, and marks the invite used, **all in one transaction**. A teammate wrote the test below with a mocked repository and it passes, but production had a bug where **two concurrent accepts both succeeded**. **How would you test this service?** Write one unit test and one integration test, and explain what each can and cannot catch.`,
          code: {
            language: 'typescript',
            source: `const repo = {
  findInvite: vi.fn().mockResolvedValue({ id: 'i1', workspaceId: 'w1', expiresAt: future, usedAt: null }),
  addMember: vi.fn().mockResolvedValue(undefined),
  markUsed: vi.fn().mockResolvedValue(undefined),
}
const service = new InvitesService(repo as any)

it('accepts an invite', async () => {
  await service.accept('tok', 'u1')
  expect(repo.addMember).toHaveBeenCalledWith('w1', 'u1')
  expect(repo.markUsed).toHaveBeenCalledWith('i1')
})`,
          },
          intent: `Tests whether you know what a mocked repository can prove and when you need a real database. A strong answer keeps a fast unit test for pure rules (expiry, already used), adds an integration test with a real PostgreSQL container that exercises transactions and constraints, sets it up properly in NestJS (TestingModule, migrations, isolation between tests), and explains the cost trade-off.`,
          hints: [
            `The production bug was about concurrency and the database. Can a vi.fn() repository ever reproduce two transactions racing?`,
            `Keep the mock for what it is good at: branching rules like "expired" or "already used". What does a unit test of those look like with Test.createTestingModule and useValue?`,
            `For the race you need a real PostgreSQL with your real migrations. Which library starts a throwaway container from a test, and how do you point Prisma at it?`,
            `Integration skeleton: beforeAll → new PostgreSqlContainer('postgres:17-alpine').start(); run prisma migrate deploy with DATABASE_URL = container.getConnectionUri(); build the Nest module with the real PrismaService; afterEach TRUNCATE; test: seed an invite, run two accept() calls with Promise.allSettled, expect exactly one fulfilled and one membership row. Fix in code: UPDATE invites SET used_at = now() WHERE id = $1 AND used_at IS NULL and check the row count.`,
          ],
          answer: `**Use both, for different questions.** A mocked repository tests the **service's decisions**; a real database tests **the queries, transactions and constraints** the service relies on. The teammate's test can never catch the race, because the mock has no concurrency, no transactions and no constraints. It also mostly asserts calls, so it would pass even if \`markUsed\` silently did nothing.

**1. Unit test: fast, for rules and branches**
\`\`\`ts
import { Test } from '@nestjs/testing'

it('rejects an expired invite and changes nothing', async () => {
  const repo = { findInvite: vi.fn(), addMember: vi.fn(), markUsedIfUnused: vi.fn() }
  repo.findInvite.mockResolvedValue({ id: 'i1', workspaceId: 'w1', expiresAt: past, usedAt: null })

  const moduleRef = await Test.createTestingModule({
    providers: [InvitesService, { provide: InvitesRepository, useValue: repo }],
  }).compile()
  const service = moduleRef.get(InvitesService)

  await expect(service.accept('tok', 'u1')).rejects.toThrow(InviteExpiredError)
  expect(repo.addMember).not.toHaveBeenCalled()
})
\`\`\`
Cheap (milliseconds), so write one per rule: expired, already used, wrong workspace.

**2. Integration test: a real PostgreSQL in a container (Testcontainers)**
\`\`\`ts
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql'
import { execSync } from 'node:child_process'

let container: StartedPostgreSqlContainer
let prisma: PrismaService
let service: InvitesService

beforeAll(async () => {
  container = await new PostgreSqlContainer('postgres:17-alpine').start()
  const url = container.getConnectionUri()
  execSync('npx prisma migrate deploy', { env: { ...process.env, DATABASE_URL: url } })
  process.env.DATABASE_URL = url
  const moduleRef = await Test.createTestingModule({ imports: [InvitesModule] }).compile()
  prisma = moduleRef.get(PrismaService)
  service = moduleRef.get(InvitesService)
}, 60_000)

afterEach(() => prisma.$executeRawUnsafe('TRUNCATE invites, memberships, workspaces, users CASCADE'))
afterAll(async () => { await prisma.$disconnect(); await container.stop() })

it('lets only one of two concurrent accepts succeed', async () => {
  const { token } = await seedInvite(prisma)
  const results = await Promise.allSettled([service.accept(token, 'u1'), service.accept(token, 'u2')])
  expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1)
  expect(await prisma.membership.count()).toBe(1)
})
\`\`\`
This test fails against the buggy code, which is exactly what you want. The fix is a **conditional update inside the transaction** (\`UPDATE invites SET used_at = now() WHERE id = $1 AND used_at IS NULL\`, then throw if 0 rows changed), or \`SELECT ... FOR UPDATE\`, or a unique constraint on membership.

**Trade-offs**
- Testcontainers needs Docker in CI and adds a few seconds of startup: start **one container per test file or per run**, not per test, and isolate tests by truncating or by wrapping each test in a rolled-back transaction.
- Real Postgres catches what mocks cannot: missing migrations, constraint names, JSON and date handling, Prisma query shape, transactions and locks.
- An in-memory fake or SQLite is faster but behaves differently from PostgreSQL; do not trust it for concurrency or SQL features.

**Rule of thumb:** unit-test the decisions, integration-test anything whose correctness lives in the database.`,
          walkthrough: [
            {
              title: 'Name what is being asked',
              body: `Why did a passing test miss a production race, and what test strategy would have caught it? The interviewer wants you to separate **logic the service decides** from **behaviour the database guarantees**.`,
            },
            {
              title: 'Understand what each test can prove',
              body: `A \`vi.fn()\` repository has no transactions, locks or constraints, so it cannot reproduce two concurrent accepts. It is still the cheapest way to cover rules like "expired" or "already used". A real database is the only place a race, a constraint or a migration bug shows up.`,
            },
            {
              title: 'Write both tests',
              body: `Unit (Nest DI with a mock):
\`\`\`ts
const moduleRef = await Test.createTestingModule({
  providers: [InvitesService, { provide: InvitesRepository, useValue: repo }],
}).compile()
\`\`\`
Integration (real Postgres):
\`\`\`ts
container = await new PostgreSqlContainer('postgres:17-alpine').start()
execSync('npx prisma migrate deploy', { env: { ...process.env, DATABASE_URL: container.getConnectionUri() } })
const results = await Promise.allSettled([service.accept(t, 'u1'), service.accept(t, 'u2')])
expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1)
\`\`\``,
            },
            {
              title: 'Cover the edge cases and costs',
              body: `- One container per file or run; isolate by \`TRUNCATE\` or rolled-back transactions.
- Raise hook timeouts for container startup; CI needs Docker.
- Don't use SQLite as a stand-in for Postgres concurrency.
- Fix the bug with \`UPDATE ... WHERE used_at IS NULL\` and a row-count check, or \`FOR UPDATE\`.`,
            },
            {
              title: 'Say it in 30 seconds',
              body: `"The mock can only test the service's decisions, so I keep unit tests with a mocked repository for rules like expiry. The race lives in the database, so I add an integration test with Testcontainers: real Postgres, real migrations, the real Nest module, and two concurrent accepts where exactly one must win. That test fails on the bug and passes once the update is conditional."`,
            },
          ],
          keyPoints: [
            'Mocks test decisions; real databases test queries, transactions and constraints',
            'NestJS TestingModule with useValue for unit tests',
            'Testcontainers PostgreSQL with real migrations for integration tests',
            'A concurrency test with Promise.allSettled that reproduces the bug',
            'Cost control: one container per file or run, truncate or rollback between tests',
          ],
          pitfalls: [
            'Believing a green mocked test proves database behaviour',
            'Using SQLite or an in-memory DB to test PostgreSQL-specific behaviour',
            'Starting a new container for every test',
            'Asserting only that repository methods were called',
          ],
          followUps: ['How would you run these integration tests in GitHub Actions?', 'When would you use a rolled-back transaction per test instead of TRUNCATE?'],
          personalAngle:
            'You built the accessibility platform backend with NestJS-style services and Docker: describe which parts you would cover with Testcontainers (anything relying on Postgres constraints or transactions) versus fast unit tests.',
          references: [{ label: 'NestJS docs: Testing', url: 'https://docs.nestjs.com/fundamentals/testing' }, { label: 'Testcontainers for Node.js', url: 'https://node.testcontainers.org/' }],
        },
      ],
    },
    {
      id: 'test-ui-e2e',
      title: 'Component and end-to-end testing',
      summary: 'Testing Library philosophy for Vue and React, Playwright strategy, and fixing flaky tests.',
      questions: [
        {
          id: 'test-testing-library',
          title: 'Component tests with Testing Library (Vue and React)',
          type: 'concept',
          difficulty: 'core',
          priority: 'must',
          tags: ['testing-library', 'component-tests', 'vue', 'react', 'accessibility'],
          estMinutes: 6,
          roles: ['frontend', 'full-stack'],
          prompt: `*"How do you test UI components? What is the Testing Library philosophy, and how does it change which queries and assertions you use?"*`,
          intent: `Tests whether you write component tests that check behaviour the way users experience it. A strong answer states the guiding principle, uses the query priority (role first) and the getBy/queryBy/findBy semantics correctly, shows a short Vue or React example, and mocks the network rather than children.`,
          hints: [
            `"The more your tests resemble the way your software is used..." What follows from that for queries and assertions?`,
            `Which query is preferred, and why does it double as a small accessibility check?`,
            `getBy, queryBy and findBy differ in what they do when the element is missing or not there yet. Which one do you use for async content, and which for asserting absence?`,
            `Example: const user = userEvent.setup(); render(NoteEditor, { props }); await user.type(screen.getByRole('textbox', { name: 'Note' }), 'text'); expect(await screen.findByText('Saved')).toBeInTheDocument(). Mock HTTP with MSW, not child components.`,
          ],
          answer: `**Test components the way a user uses them**: find elements by what users perceive (role, label, text), interact through realistic events, and assert on visible output, not internal state. Testing Library's guiding principle: *"The more your tests resemble the way your software is used, the more confidence they can give you."*

**Query priority:** getByRole (with an accessible name) first, then getByLabelText, getByPlaceholderText and getByText; getByTestId only as a last resort. Querying by role has a bonus: if the test cannot find "button named Save", a screen-reader user probably cannot either.

**Query variants:**
- getBy: element must exist now (throws otherwise).
- queryBy: returns null; use it to assert something is **absent**.
- findBy: returns a promise and retries; use it for things that appear **asynchronously**.

**Vue (@testing-library/vue):**

\`\`\`ts
import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import NoteEditor from './NoteEditor.vue'

it('shows a saved state after typing', async () => {
  const user = userEvent.setup()
  render(NoteEditor, { props: { questionId: 'js-closures' } })

  await user.type(screen.getByRole('textbox', { name: 'Note' }), 'Closures capture variables')

  expect(await screen.findByText('Saved')).toBeInTheDocument()
})
\`\`\`

**React (@testing-library/react)** is the same apart from render(<NoteEditor questionId="js-closures" />). That is the point: tests describe behaviour, not the framework.

**Practices:**
- Prefer user-event over fireEvent; it simulates the full sequence (focus, keydown, input, keyup).
- toBeInTheDocument and similar matchers come from jest-dom (@testing-library/jest-dom), which works with Vitest too.
- Mock the network at the boundary (for example with MSW) rather than mocking child components.
- Do not assert on component instance state, CSS class names or the number of renders unless that is the requirement.

Accessibility can be layered on with automated checks (axe-based tools) inside component tests, which catch issues such as missing labels or invalid ARIA, though not everything a manual check would find.`,
          walkthrough: [
            {
              title: 'State the philosophy',
              body: `Test components **the way a user uses them**: find elements by role, label and text; interact with realistic events; assert visible output, not internal state. Tests then survive refactors and describe behaviour.`,
            },
            {
              title: 'Choose queries correctly',
              body: `Priority: \`getByRole\` (with name) → \`getByLabelText\` → \`getByText\` → \`getByTestId\` last. Variants: **getBy** must exist now, **queryBy** returns null (assert absence), **findBy** waits (async content). If "button named Save" cannot be found, a screen-reader user probably cannot find it either.`,
            },
            {
              title: 'Write a test',
              body: `\`\`\`ts
const user = userEvent.setup()
render(NoteEditor, { props: { questionId: 'js-closures' } })
await user.type(screen.getByRole('textbox', { name: 'Note' }), 'Closures capture variables')
expect(await screen.findByText('Saved')).toBeInTheDocument()
\`\`\`
The React version differs only in \`render(<NoteEditor ... />)\`.`,
            },
            {
              title: 'Cover the practices and traps',
              body: `Prefer \`user-event\` over \`fireEvent\`. Mock the network at the boundary (MSW) instead of child components. Avoid asserting class names, instance state or render counts. Never use \`getBy\` plus sleeps for async content; use \`findBy\`. Layer axe checks on top for automated a11y issues.`,
            },
            {
              title: 'Say it in 30 seconds',
              body: `"I test components like a user: query by role and accessible name, interact with user-event, and assert what's on screen. getBy for things that must be there, queryBy to assert absence, findBy for async. I mock the network with MSW rather than mocking children, and I never assert internal state."`,
            },
          ],
          keyPoints: [
            'Test from the user\'s perspective',
            'getByRole with accessible name first; test ids last',
            'getBy / queryBy / findBy semantics',
            'user-event over fireEvent',
            'Mock the network, not child components',
          ],
          pitfalls: [
            'Asserting internal state or class names',
            'Using getBy for async content and adding sleeps',
            'data-testid everywhere',
          ],
          followUps: ['How would you test a modal\'s focus trap?', 'What can automated accessibility checks not catch?'],
          personalAngle:
            'Use REI-KIT as your example: explain which user-visible behaviours its components should guarantee (keyboard use, labels, focus in dialogs) and how behaviour tests plus axe-style checks protect them across palettes and materials.',
          references: [{ label: 'Testing Library: Guiding principles', url: 'https://testing-library.com/docs/guiding-principles' }],
        },
        {
          id: 'test-flaky-playwright',
          title: 'Debug a flaky Playwright test',
          type: 'debugging',
          difficulty: 'advanced',
          priority: 'must',
          tags: ['playwright', 'e2e', 'flaky-tests', 'auto-waiting'],
          estMinutes: 10,
          roles: ['general'],
          prompt: `This E2E test passes locally but fails roughly one run in five on CI. The notes editor autosaves with an 800 ms debounce and shows "Saved" when the write completes. **Find the causes of the flakiness and fix the test.**`,
          code: {
            language: 'typescript',
            source: `import { test, expect } from '@playwright/test'

test('saves a note', async ({ page }) => {
  await page.goto('/q/js-closure-counter')
  await page.locator('textarea.note-input').fill('closures capture variables')
  await page.waitForTimeout(500)
  expect(await page.locator('.save-status').isVisible()).toBe(true)
  expect(await page.locator('.save-status').textContent()).toBe('Saved')
})`,
          },
          intent: `Tests whether you can diagnose flakiness from the code and know Playwright's waiting model. A strong answer identifies the fixed sleep racing the debounce, the non-retrying checks and the brittle selectors, rewrites the test with web-first assertions and role locators, verifies persistence, and names the debugging tools.`,
          hints: [
            `Compare the fixed wait (500 ms) with the debounce (800 ms) plus the save time. What happens on a slower CI machine?`,
            `Do isVisible() and textContent() wait and retry, or read the page once?`,
            `Playwright has assertions that retry until they pass or time out. Which ones fit "status shows Saved"?`,
            `Fix: remove waitForTimeout; fill getByRole('textbox', { name: 'Note' }); await expect(page.getByRole('status')).toHaveText('Saved'); then page.reload() and expect the textbox toHaveValue(...). Reproduce with --repeat-each and trace: 'on-first-retry'.`,
          ],
          answer: `There are three problems; the first two cause the flakiness directly.

**1. A fixed sleep shorter than the work.** waitForTimeout(500) waits half a second, but the save only starts after an 800 ms debounce, plus the time to write. Whether the status has appeared by then depends on machine speed. Fixed sleeps are either too short (flaky) or too long (slow).

**2. Non-retrying checks.** isVisible() and textContent() read the page **once**. Wrapping them in expect(...) with a plain value means no retrying. If the text is "Saving…" at that instant, the test fails.

**3. Brittle selectors.** textarea.note-input and .save-status are implementation details; a CSS refactor breaks the test without any user-visible change.

**Fixed test:**

\`\`\`ts
import { test, expect } from '@playwright/test'

test('saves a note', async ({ page }) => {
  await page.goto('/q/js-closure-counter')

  await page.getByRole('textbox', { name: 'Note' }).fill('closures capture variables')

  // Web-first assertion: retries until it passes or the timeout expires
  await expect(page.getByRole('status')).toHaveText('Saved')

  // Prove it persisted, not just that a label changed
  await page.reload()
  await expect(page.getByRole('textbox', { name: 'Note' })).toHaveValue('closures capture variables')
})
\`\`\`

**Why it works:** Playwright's web-first assertions (toBeVisible, toHaveText, toHaveValue) **auto-retry** until the condition holds, and actions such as fill auto-wait for the element to be actionable. The test now waits exactly as long as needed. Role-based locators survive styling changes and require the UI to be accessible.

**Other common flakiness causes worth naming:**
- Tests sharing state (one test relies on data another created, or tests run in parallel against the same account).
- Real third-party network calls; mock them with page.route.
- Animations, time and randomness; control them or wait for the final state.

**Debugging tools:** run repeatedly with --repeat-each to reproduce, set retries on CI, and record a trace on first retry (trace: 'on-first-retry') to inspect the DOM, network and console at the moment of failure. Retries are a diagnostic aid, not the fix.`,
          walkthrough: [
            {
              title: 'Restate the symptom',
              body: `Passes locally, fails ~20% on CI, around an 800 ms debounced autosave. Intermittent + timing-related + slower machine = a **race between the test and real work**.`,
            },
            {
              title: 'Find the causes',
              body: `1. \`waitForTimeout(500)\` is shorter than the debounce plus the write.
2. \`isVisible()\` and \`textContent()\` read **once**; \`expect\` on a plain value never retries.
3. \`textarea.note-input\` and \`.save-status\` are styling details, so refactors break the test.`,
            },
            {
              title: 'Rewrite the test',
              body: `\`\`\`ts
test('saves a note', async ({ page }) => {
  await page.goto('/q/js-closure-counter')
  await page.getByRole('textbox', { name: 'Note' }).fill('closures capture variables')
  await expect(page.getByRole('status')).toHaveText('Saved') // auto-retries
  await page.reload()
  await expect(page.getByRole('textbox', { name: 'Note' })).toHaveValue('closures capture variables')
})
\`\`\``,
            },
            {
              title: 'Cover other causes and tools',
              body: `Other flakiness sources: shared state between tests, real third-party calls (mock with \`page.route\`), animations and time. Reproduce with \`--repeat-each=20\`, record \`trace: 'on-first-retry'\` and inspect DOM, network and console. Retries diagnose; they do not fix.`,
            },
            {
              title: 'Say it in 30 seconds',
              body: `"The fixed 500 ms sleep races an 800 ms debounce, and isVisible and textContent don't retry, so slower CI machines fail. I remove the sleep, use role locators and web-first assertions like toHaveText that wait for the condition, and reload to prove it actually persisted. To confirm, I run it with repeat-each and look at the trace."`,
            },
          ],
          keyPoints: [
            'Fixed sleeps are a race against real work',
            'isVisible/textContent do not retry; web-first assertions do',
            'Role-based locators over CSS classes',
            'Verify persistence, not just a label',
            'Traces and repeat runs to reproduce flakiness',
          ],
          pitfalls: [
            'Increasing the timeout to 2000 ms and calling it fixed',
            'Relying on CI retries to hide flakiness',
            'Order-dependent tests',
          ],
          followUps: ['How would you seed test data without going through the UI?', 'How do you quarantine a flaky test without losing it?'],
          personalAngle:
            'Your Puppeteer and Playwright scraping work taught the same lesson from the other side: wait for a condition in the page, never for a fixed amount of time.',
          references: [{ label: 'Playwright: Best practices', url: 'https://playwright.dev/docs/best-practices' }],
        },
        {
          id: 'test-e2e-strategy',
          title: 'Designing a maintainable E2E suite with Playwright',
          type: 'concept',
          difficulty: 'core',
          priority: 'should',
          tags: ['playwright', 'e2e', 'test-data', 'authentication', 'isolation'],
          estMinutes: 6,
          roles: ['general'],
          prompt: `*"You're asked to set up end-to-end tests for a web app with login, a dashboard and a few core workflows. How would you structure the suite so it stays fast and reliable as it grows?"*`,
          intent: `Tests whether you can keep an E2E suite fast and trustworthy as it grows. A strong answer limits scope to critical journeys, guarantees isolation, seeds data through the API, reuses authenticated state, mocks third parties, and parallelises in CI with traces.`,
          hints: [
            `What should E2E cover, and what should it leave to integration and component tests?`,
            `Logging in through the UI in every test is slow. How can tests start already authenticated?`,
            `How do tests get their data without depending on each other or colliding in parallel?`,
            `Shape: critical journeys only; fresh context per test; seed via API fixtures with unique data; a setup project that saves storageState; role locators and web-first assertions; page.route for third parties; sharding, traces on first retry and HTML reports in CI against a production build.`,
          ],
          answer: `Keep the suite **small, independent and focused on critical user journeys**.

**1. Scope.** Cover the paths that would hurt most if broken: sign in, the core workflow, payment or data export. Leave validation variations and edge cases to integration and component tests.

**2. Isolation.** Every test must pass on its own and in any order. Playwright gives each test a fresh browser context by default (separate cookies and storage). Do not let test B depend on data created by test A.

**3. Test data through the API.** Create users and records with API calls or database seeding in fixtures, not by clicking through the UI. Use unique data per test (for example a unique email), so parallel workers do not collide, and clean up or use a disposable database.

**4. Authentication once.** Log in once in a setup project, save the session with storageState, and reuse it in tests that need an authenticated user. Only the login test itself goes through the login form.

**5. Locators and assertions.** Prefer role, label and text locators; use web-first assertions that auto-wait. Avoid fixed sleeps.

**6. Structure.** Fixtures for shared setup (authenticated page, seeded data). Page objects only where they reduce real duplication, kept thin so they don't hide what the test does.

**7. External services.** Mock third-party calls with page.route, or point the app at a sandbox; never depend on a real external service in CI.

**8. CI.** Run in parallel and shard across machines as the suite grows; record traces on first retry; upload the HTML report as an artifact; run against a production-like build, not the dev server.

A good health check: if a test fails, can someone tell from the report which user-visible behaviour broke within a minute?`,
          keyPoints: [
            'E2E limited to critical journeys',
            'Independent tests with fresh contexts',
            'Seed data via API; unique per test',
            'Reuse authenticated state (storageState)',
            'Mock third parties; parallelise and shard in CI',
          ],
          pitfalls: [
            'Logging in through the UI in every test',
            'Shared accounts and order-dependent tests',
            'Testing every edge case end to end',
          ],
          followUps: ['How would you test an email-verification flow end to end?'],
          personalAngle:
            'You already know browser automation from scraping; the difference here is that you control the app, so you can seed data and expose stable roles and labels instead of fighting the DOM.',
          references: [{ label: 'Playwright documentation', url: 'https://playwright.dev/docs/intro' }],
        },
        {
          id: 'test-msw-network-mocking',
          title: 'Mocking the network with MSW in component tests',
          type: 'coding',
          difficulty: 'core',
          priority: 'should',
          tags: ['msw', 'mocking', 'component-tests', 'vitest', 'api-contract', 'testing-library'],
          estMinutes: 15,
          roles: ['frontend', 'full-stack'],
          prompt: `A Vue/React signup form posts to \`/api/signup\`. The current tests do \`vi.mock('../api/client')\` and break whenever someone refactors the client (switching from axios to fetch broke 40 tests). **Rewrite the setup with Mock Service Worker (MSW)** so the tests cover the success path and the "email already in use" (409) path. Then explain how you keep these mocks in sync with the real API.`,
          intent: `Tests whether you mock at the right boundary. A strong answer moves mocking from internal modules to the network, sets up MSW for Vitest correctly (lifecycle, unhandled requests, per-test overrides), asserts user-visible outcomes, and has a concrete answer for mock drift against the real API.`,
          hints: [
            `Why did switching HTTP libraries break tests that are supposed to test the form? Where should the mock sit so implementation changes do not matter?`,
            `MSW intercepts requests at the network level. In Node (Vitest) you use setupServer from msw/node. What lifecycle hooks does it need?`,
            `Define default happy-path handlers once, and override per test with server.use(...) for the 409 case. What should happen to requests you forgot to mock?`,
            `Skeleton: const server = setupServer(http.post('/api/signup', () => HttpResponse.json({ id: 'u1' }, { status: 201 }))); beforeAll(() => server.listen({ onUnhandledRequest: 'error' })); afterEach(() => server.resetHandlers()); afterAll(() => server.close()); in the 409 test: server.use(http.post('/api/signup', () => HttpResponse.json({ error: { code: 'EMAIL_TAKEN' } }, { status: 409 }))) then assert findByText('Email already in use').`,
          ],
          answer: `**Mock the network, not your modules.** The form's contract with the outside world is HTTP: "POST \`/api/signup\` returns 201 or 409". Mocking \`../api/client\` couples tests to how the request is made, so refactoring the client breaks tests while behaviour is unchanged. **MSW** intercepts real \`fetch\`/XHR calls, so any client implementation works.

**Shared setup (\`test/server.ts\`, loaded from Vitest \`setupFiles\`):**
\`\`\`ts
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll } from 'vitest'

export const handlers = [
  http.post('/api/signup', async ({ request }) => {
    const body = (await request.json()) as { email: string }
    return HttpResponse.json({ id: 'u1', email: body.email }, { status: 201 })
  }),
]
export const server = setupServer(...handlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' })) // forgotten mocks fail loudly
afterEach(() => server.resetHandlers()) // drop per-test overrides
afterAll(() => server.close())
\`\`\`

**Tests:**
\`\`\`ts
import { http, HttpResponse } from 'msw'
import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { server } from '../test/server'
import SignupForm from './SignupForm.vue'

async function submit(email: string) {
  const user = userEvent.setup()
  render(SignupForm)
  await user.type(screen.getByLabelText('Email'), email)
  await user.type(screen.getByLabelText('Password'), 'correct horse battery')
  await user.click(screen.getByRole('button', { name: 'Create account' }))
}

it('shows a welcome message on success', async () => {
  await submit('aya@example.com')
  expect(await screen.findByText('Welcome, aya@example.com')).toBeInTheDocument()
})

it('shows "Email already in use" on 409', async () => {
  server.use(
    http.post('/api/signup', () =>
      HttpResponse.json({ error: { code: 'EMAIL_TAKEN', message: 'Email already in use' } }, { status: 409 }),
    ),
  )
  await submit('taken@example.com')
  expect(await screen.findByText('Email already in use')).toBeInTheDocument()
})
\`\`\`
Relative URLs need a base URL in jsdom or your client config; use the same base the app uses.

**Keeping mocks honest (mock drift):**
- **Share the contract:** generate TypeScript types from the backend's OpenAPI spec (or share zod schemas in a monorepo) and type the handler responses, so a changed field fails type-checking.
- **Backend integration tests** prove the real API returns that 409 shape; the frontend mock relies on the same documented contract.
- For separate teams, **contract tests** (consumer-driven, for example Pact) or schema validation of responses in CI.
- Reuse the same handlers for local development and Storybook, so drift is noticed quickly.

**Also useful:** \`delay()\` to test loading states, \`HttpResponse.error()\` for network failures, and assertions on the request body inside a handler when the payload is the behaviour.`,
          walkthrough: [
            {
              title: 'Name the real problem',
              body: `Tests mock an **internal module**, so they test how the request is made rather than what the form does. Switching axios to fetch changed nothing for users but broke 40 tests. The fix is to mock at the **network boundary**.`,
            },
            {
              title: 'Understand how MSW works',
              body: `MSW intercepts outgoing requests (in Node via \`setupServer\` from \`msw/node\`) and answers them with handlers. The component uses its real HTTP client, so any client implementation passes. Lifecycle: \`listen\` before all, \`resetHandlers\` after each, \`close\` after all.`,
            },
            {
              title: 'Write the setup and the override',
              body: `\`\`\`ts
export const server = setupServer(
  http.post('/api/signup', () => HttpResponse.json({ id: 'u1' }, { status: 201 })),
)
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// in the 409 test
server.use(http.post('/api/signup', () =>
  HttpResponse.json({ error: { code: 'EMAIL_TAKEN' } }, { status: 409 })))
expect(await screen.findByText('Email already in use')).toBeInTheDocument()
\`\`\``,
            },
            {
              title: 'Cover drift and edge cases',
              body: `- \`onUnhandledRequest: 'error'\` makes forgotten mocks fail loudly.
- Type handler responses from OpenAPI-generated types or shared zod schemas.
- Backend integration tests (or Pact contract tests) prove the real API matches.
- Test loading with \`delay()\` and network failures with \`HttpResponse.error()\`.`,
            },
            {
              title: 'Say it in 30 seconds',
              body: `"I'd stop mocking the API client and mock HTTP with MSW: default happy-path handlers in a setup file, onUnhandledRequest set to error, and a per-test server.use override for the 409. The tests then only assert what the user sees. To avoid drift I type the handlers from the OpenAPI schema and let backend integration tests prove the real responses."`,
            },
          ],
          keyPoints: [
            'Mock at the network boundary, not internal modules',
            'setupServer lifecycle: listen, resetHandlers, close',
            'onUnhandledRequest: error to catch missing mocks',
            'Per-test overrides with server.use for error paths',
            'Prevent drift: shared or generated types, backend tests, contract tests',
          ],
          pitfalls: [
            'Forgetting resetHandlers, so one test\'s override leaks into the next',
            'Mocking fetch globally with vi.fn and hand-built Response objects everywhere',
            'Mocks that no longer match the real API shape',
          ],
          followUps: ['How would you test a component that polls an endpoint every 5 seconds?', 'Would you use MSW in Playwright E2E tests, or page.route?'],
          personalAngle:
            'For REI-KIT-based apps like Hibi or Kakei, describe which API calls you would put behind shared MSW handlers so component tests, local development and demos use the same fake backend.',
          references: [{ label: 'MSW documentation', url: 'https://mswjs.io/docs/' }],
        },
      ],
    },
    {
      id: 'test-quality-ci',
      title: 'Quality in CI and code review',
      summary: 'Running tests in pipelines efficiently, and reviewing code in a way that improves quality and the team.',
      questions: [
        {
          id: 'test-ci-pipeline',
          title: 'Running tests in CI: fast feedback without losing confidence',
          type: 'tradeoff',
          difficulty: 'advanced',
          priority: 'should',
          tags: ['ci', 'github-actions', 'pipelines', 'sharding', 'flaky-tests'],
          estMinutes: 8,
          roles: ['general'],
          prompt: `*"Our CI takes 25 minutes and developers have started ignoring red builds. How would you restructure testing in the pipeline?"*`,
          intent: `Tests whether you can fix both the speed and the trust problem of a CI pipeline. A strong answer orders checks fast to slow, parallelises and caches, runs the right suites at the right time, handles flaky tests with ownership, and measures the result.`,
          hints: [
            `Order checks from fastest to slowest. Where should a typo fail?`,
            `What can be cached, run in parallel or sharded?`,
            `Why do developers ignore red builds? Fixing speed alone will not fix that.`,
            `Plan: type-check + lint → unit → integration with service containers → sharded E2E; npm cache on the lockfile; full suites on merge or nightly; quarantine flaky tests with an owner and deadline; upload reports and traces; required checks on main; target < 10 min PR feedback.`,
          ],
          answer: `Two problems: **slow feedback** and **lost trust**. Fix both.

**1. Order stages by speed and fail fast.** Type check and lint (seconds), then unit and component tests, then integration tests against services, then E2E. A typo should fail in one minute, not after twenty.

**2. Parallelise and cache.**
- Cache dependencies (npm cache keyed on the lockfile) and build outputs.
- Run independent jobs in parallel; shard slow suites (Vitest and Playwright both support sharding).
- Start databases or Redis as service containers instead of installing them in each run.

**3. Run the right tests at the right time.** Everything on pull requests to main; optionally only affected packages in a monorepo; a full E2E and longer suites on merge or nightly.

\`\`\`yaml
jobs:
  checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run type-check && npm run lint
      - run: npx vitest run
  e2e:
    needs: checks
    runs-on: ubuntu-latest
    strategy:
      matrix: { shard: [1, 2, 3] }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci && npx playwright install --with-deps chromium
      - run: npx playwright test --shard=\${{ matrix.shard }}/3
      - uses: actions/upload-artifact@v4
        if: failure()
        with: { name: playwright-report-\${{ matrix.shard }}, path: playwright-report }
\`\`\`

**4. Restore trust.**
- Track flaky tests. Quarantine a flaky test with an owner and a deadline, fix the cause, and return it to the suite. Never leave a known-flaky test blocking everyone.
- Make failures readable: upload reports and traces as artifacts.
- Make the main branch protected: required checks must pass before merging.

**5. Measure.** Pipeline duration and flaky-failure rate over time; set a target such as "feedback on a PR within ten minutes".

The goal is a pipeline developers trust enough that a red build always means "stop and look".`,
          keyPoints: [
            'Fast checks first, fail early',
            'Caching, parallel jobs, sharding, service containers',
            'Full suites on merge or nightly where appropriate',
            'Quarantine and fix flaky tests with ownership',
            'Artifacts and required checks restore trust',
          ],
          pitfalls: [
            'Adding retries everywhere instead of fixing flakiness',
            'Deleting slow tests without replacing their coverage',
            'Running E2E against a dev server',
          ],
          followUps: ['How do you decide which tests run on every commit?'],
          personalAngle:
            'You set up CI/CD with YAML pipelines for the accessibility platform; describe how you ordered its steps and what you would add now (test sharding, artifacts, required checks).',
          references: [{ label: 'GitHub Actions documentation', url: 'https://docs.github.com/en/actions' }],
        },
        {
          id: 'test-code-review',
          title: 'Code review: what you look for and how you give feedback',
          type: 'behavioral',
          difficulty: 'foundation',
          priority: 'nice',
          tags: ['code-review', 'collaboration', 'quality', 'pull-requests'],
          estMinutes: 4,
          roles: ['general'],
          prompt: `*"How do you approach code review, both as a reviewer and as an author?"*`,
          intent: `Tests collaboration maturity: what you prioritise in reviews and how you communicate. A strong answer puts correctness, tests and design before style, automates formatting, gives kind and specific feedback with severity labels, and describes how you make your own PRs easy to review.`,
          hints: [
            `What should a human reviewer focus on that tools cannot check?`,
            `How do you phrase a comment so it improves the code without friction? Think questions, reasons and severity.`,
            `What makes your own pull request easy to review?`,
            `Shape: correctness → tests → design → security/performance → readability; formatting left to Prettier/ESLint; "nit:"/"blocking:" labels and questions; small PRs with what/why/how-to-test; prompt reviews and moving big debates to a call.`,
          ],
          answer: `Code review exists to **catch problems early, share knowledge, and keep the codebase consistent**, not to prove who is right.

**As a reviewer, in priority order:**
1. **Correctness and behaviour:** does it do what the ticket says? Edge cases, error handling, concurrency, data migrations.
2. **Tests:** is the new behaviour tested at a sensible level? Would the tests fail if the code were wrong?
3. **Design:** is the change in the right place? Does it add complexity the problem does not need?
4. **Security and performance:** input validation, authorisation checks, N+1 queries, unbounded loops.
5. **Readability:** naming and structure that the next person will understand.

Leave formatting and style to tools (Prettier, ESLint, type checks in CI) so humans don't spend comments on them.

**How to comment:**
- Ask questions rather than issue orders: "What happens if this list is empty?"
- Explain why, and label severity: blocking issue vs suggestion ("nit:", "optional:").
- Praise good solutions; it reinforces what to repeat.
- For larger disagreements, move to a short call and write the decision back in the PR.
- Review promptly; a PR waiting two days blocks a teammate.

**As an author:**
- Keep pull requests small and focused; one reason to change.
- Write a description: what, why, how to test, screenshots for UI changes, risks.
- Review your own diff first.
- Respond to every comment, and don't take feedback personally.

A healthy review culture is measured by whether people learn from it and whether defects are caught before production, not by the number of comments.`,
          keyPoints: [
            'Correctness and tests before style',
            'Automate formatting and linting',
            'Questions, reasons and severity labels',
            'Small PRs with clear descriptions',
            'Prompt, respectful reviews',
          ],
          pitfalls: ['Nitpicking style while missing a logic bug', 'Approving large PRs without reading them', 'Comments that criticise the person'],
          followUps: ['How do you review a PR from someone more senior than you?'],
          personalAngle:
            'Working with a senior frontend developer on the accessibility platform is a natural example of reviewing across specialities: explain what you looked for when reviewing work outside your speciality and what you learned from their reviews of yours.',
        },
      ],
    },
  ],
}

export default track
