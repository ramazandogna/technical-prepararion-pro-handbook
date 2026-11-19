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
          hints: [
            'Every level trades speed and precision against confidence.',
            'The trophy puts most weight on one particular level. Which, and why for UI-heavy apps?',
            'Start with the risk: where do bugs actually hurt this product?',
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
          hints: ['Split the behaviour into a backend contract and a UI contract.', 'Which option tests what the user sees rather than internals?'],
          answer: `**A and B.** Split the behaviour at the API contract and test each side at the cheapest level that is still realistic:

- **B (API integration test)** proves the backend really rejects duplicates, including the unique constraint in PostgreSQL. A mocked repository could not catch a missing index or constraint.
- **A (component test)** proves the UI turns a 409 into the visible message. Mocking the network is fine here because the contract (status 409 plus an error body) is what you are testing.

**C** tests implementation details: an internal ref can be set while the template shows nothing, and renaming it breaks the test without any user-visible change.

**D** is not wrong as a single smoke test of signup, but pushing every validation case through E2E makes the suite slow and flaky. Keep E2E for critical paths and let integration tests cover the variations.

The general rule: **test behaviour at the boundary the user or caller sees**, and pick the lowest level that exercises the real thing you are worried about.`,
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
          hints: [
            'Coverage measures which lines ran, not what was checked.',
            'Which kind of coverage is more informative than line coverage?',
            'Is there a technique that checks whether tests would notice a bug?',
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
          hints: ['Red, green, refactor.', 'Think about how well you know the requirements and the design.'],
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
          hints: [
            'Some doubles provide answers; others record or verify calls.',
            'A fake is a working implementation, just simpler.',
            'What happens to your tests when you mock things you do not own?',
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
          hints: [
            'Real waiting makes tests slow and flaky. Control the clock instead.',
            'Check just before and exactly at the boundary.',
            'For promises and timers together, the async version of the timer API helps.',
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
          hints: [
            'vi.mock is not executed where it is written.',
            'Where do imports and vi.mock calls end up after transformation?',
            'What is a temporal dead zone?',
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
          hints: [
            '"The more your tests resemble the way your software is used..."',
            'Which query is preferred, and why does it double as an accessibility check?',
            'getBy, queryBy and findBy behave differently.',
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
          hints: [
            'Compare the fixed wait with the debounce duration. What happens on a slower CI machine?',
            'Do isVisible() and textContent() retry?',
            'Playwright has assertions that wait automatically.',
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
          hints: [
            'What should E2E cover, and what should it leave to lower levels?',
            'Logging in through the UI in every test is slow.',
            'How do tests get their data without depending on each other?',
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
          hints: [
            'Order checks from fastest to slowest and fail early.',
            'What can be cached or parallelised?',
            'Why do people ignore red builds? Fix that cause too.',
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
          hints: [
            'What should a human focus on that tools cannot check?',
            'How do you phrase a comment so it improves the code without friction?',
            'What makes a pull request easy to review?',
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
