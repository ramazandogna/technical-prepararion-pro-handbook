import type { ResearchMeta } from '@/types/content'

/** Interview-landscape research behind the curriculum. Owned by the curriculum architect. */
export const research: ResearchMeta = {
  methodology: `This curriculum is built from a focused review of how software engineers are actually interviewed in 2025–2026, weighted toward **mid-level full-stack and frontend roles in Tokyo**.

**What was reviewed**

- **Official company guidance**: Google's *How we hire*, Meta's full-loop prep page, Amazon's SDE prep pages and Leadership Principles, SmartNews' engineering-interview page, and LY Corporation's engineer recruiting pages and FAQ.
- **Widely used references**: Tech Interview Handbook, the System Design Primer, *Cracking the Coding Interview* and interviewing.io's guides.
- **Japanese hiring material**: general guides to 中途 and 新卒 selection flows (書類選考 → 適性検査/SPI → 複数回の面接 → 内定/オファー面談), plus engineer-hiring advice on casual interviews (カジュアル面談) and coding tests.

**How it was used**

Recurring stages and evaluation criteria were pulled out and turned into stage profiles and company *archetypes*. Track priorities (\`must\` / \`should\` / \`nice\`) reflect how often a topic shows up for a mid-level candidate, not how hard it is.

**Limitations**

- Company loops change often and vary by team, level and region. Where no official source exists, the profiles describe **patterns, not promises**.
- Candidate reports (Glassdoor and similar) were used only to confirm broad patterns, never as sources for specific claims.
- Some official pages are short, and round counts in particular differ between sources. **Always confirm the loop with your recruiter.**

*Last reviewed: November 2026.*`,

  stages: [
    {
      id: 'document-screening',
      name: 'Résumé / document screening (書類選考)',
      description:
        'Your résumé (and in Japan often a 履歴書 and 職務経歴書) is screened against the role before any conversation. In Japanese processes this is an explicit, named stage with a pass/fail result.',
      whatTheyEvaluate: [
        'Relevant experience for the level (scope, ownership, impact)',
        'Tech-stack overlap with the role',
        'Clarity: can a non-engineer recruiter see the impact in 30 seconds?',
        'For Japanese-language roles: document format, consistency and Japanese ability where stated',
      ],
      howToPrepare: [
        'Write impact bullets: action + technology + measurable result (e.g. paying customers after beta, records matched, uptime)',
        'Keep an English CV and, if you are targeting Japanese companies, a 職務経歴書 that tells the same story',
        'Tailor the top third of your résumé to each role (full-stack vs frontend vs backend)',
        'Link REI-KIT (npm) and live projects; reviewers do click them',
      ],
      commonAt: ['startup', 'mid-size', 'big-tech', 'japan-international', 'japan-traditional'],
    },
    {
      id: 'recruiter-screen',
      name: 'Recruiter / casual screen (カジュアル面談)',
      description:
        'A 20–45 minute conversation about your background, motivation, logistics (visa, notice period, salary range, language) and the role. In Japan a カジュアル面談 is often framed as a two-way, non-evaluative chat, but it still leaves an impression.',
      whatTheyEvaluate: [
        'Motivation and fit for the role and company',
        'Communication clarity (English and/or Japanese)',
        'Logistics: level, compensation expectations, start date, work authorisation',
        'Whether your story is coherent: why this move, why now',
      ],
      howToPrepare: [
        'Have a 60–90 second self-introduction ready in English, and a short Japanese 自己紹介',
        'Know your salary range and how you will phrase it',
        'Prepare 3 sharp questions about the team, the stack and the interview loop',
        'Ask explicitly which stages follow and what each one covers',
      ],
      commonAt: ['startup', 'mid-size', 'big-tech', 'japan-international', 'japan-traditional'],
    },
    {
      id: 'aptitude-test',
      name: 'Aptitude / personality test (適性検査・SPI)',
      description:
        'Standardised verbal, numerical and personality tests (SPI is the best-known), common at traditional Japanese companies, especially for new graduates and often for mid-career hires too. Usually taken online before or around the first interview.',
      whatTheyEvaluate: [
        'Basic verbal and numerical reasoning under time pressure',
        'Personality profile and consistency against the company\'s preferences',
        'Japanese reading speed, when the test is in Japanese',
      ],
      howToPrepare: [
        'Ask whether the test is SPI, another provider\'s test or company-specific, and which language it is in',
        'Do one or two timed practice sets of the numerical section; speed matters more than difficulty',
        'Answer the personality section honestly and consistently; contradictory answers are flagged',
      ],
      commonAt: ['japan-traditional'],
    },
    {
      id: 'online-assessment',
      name: 'Online coding assessment',
      description:
        'A timed, auto-graded coding test on a platform such as Codility, HackerRank or CodeSignal: usually 2–4 algorithmic problems in 60–90 minutes. Common as an early filter at Tokyo tech companies with high application volume.',
      whatTheyEvaluate: [
        'Correctness against hidden test cases, including edge cases',
        'Efficiency: brute force often times out on large inputs',
        'Fluency in your chosen language under time pressure',
      ],
      howToPrepare: [
        'Practise pattern-based problems (track B) in TypeScript/JavaScript with a timer',
        'Always handle empty input, single element, duplicates and large n',
        'Read every problem first and solve the easiest one first',
        'Know your language\'s standard library: sort comparators, Map/Set, string methods',
      ],
      commonAt: ['mid-size', 'big-tech', 'japan-international'],
    },
    {
      id: 'technical-phone-screen',
      name: 'Technical phone / video screen',
      description:
        'A 45–60 minute live interview with an engineer, usually one or two coding problems in a shared editor, sometimes with quick language or framework questions. It decides whether you reach the full loop.',
      whatTheyEvaluate: [
        'Problem solving: clarify, plan, code, test',
        'Communication while coding',
        'Working, reasonably clean code within the time limit',
        'Core language knowledge (closures, async, types)',
      ],
      howToPrepare: [
        'Rehearse the clarify → examples → approach → complexity → code → test loop out loud (track A)',
        'Practise in a plain editor without autocomplete',
        'Prepare crisp explanations of event loop, closures and React/Vue rendering for quick-fire questions',
      ],
      commonAt: ['startup', 'mid-size', 'big-tech', 'japan-international'],
    },
    {
      id: 'live-coding',
      name: 'Live coding (algorithmic or practical)',
      description:
        'Onsite or virtual coding rounds. Big tech favours algorithm and data-structure problems; product companies increasingly use practical tasks (build a small component, implement debounce, call an API and render the result).',
      whatTheyEvaluate: [
        'Choice of data structures and algorithmic pattern',
        'Code quality: naming, decomposition, edge cases',
        'Testing your own code without prompting',
        'Collaboration: taking hints, explaining trade-offs',
      ],
      howToPrepare: [
        'Cover the core patterns: hash map, two pointers, sliding window, BFS/DFS, heap, binary search, DP basics',
        'Prepare practical frontend tasks: debounce/throttle, a Promise pool, an autocomplete, a todo list with state',
        'Narrate decisions; silent coding is the most common failure mode',
      ],
      commonAt: ['startup', 'mid-size', 'big-tech', 'japan-international'],
    },
    {
      id: 'take-home',
      name: 'Take-home assignment (技術課題)',
      description:
        'A small project built in your own time (typically a few hours to a few days), often followed by a review call where you walk through and extend it. Popular with startups and with Japanese tech companies that run a 技術課題 step.',
      whatTheyEvaluate: [
        'Real-world code quality: structure, naming, tests, README',
        'Product judgement: what you chose to build and what you cut',
        'How well you explain and defend your decisions in the review',
      ],
      howToPrepare: [
        'Clarify scope and time expectations before you start',
        'Ship a README with setup, decisions, trade-offs and "what I would do next"',
        'Add a few meaningful tests instead of chasing coverage',
        'Rehearse the walkthrough: architecture, one hard bug, one trade-off',
      ],
      commonAt: ['startup', 'mid-size', 'japan-international'],
    },
    {
      id: 'debugging-pairing',
      name: 'Debugging / pair programming',
      description:
        'You get an existing codebase or failing feature and work through it with an engineer: find a bug, add a feature or refactor. It mirrors day-to-day work more closely than algorithm rounds.',
      whatTheyEvaluate: [
        'Systematic debugging: reproduce, form a hypothesis, isolate, verify',
        'Reading unfamiliar code quickly',
        'Using tools: devtools, logs, the debugger, tests',
        'Collaboration and openness to suggestions',
      ],
      howToPrepare: [
        'Practise explaining your debugging process out loud on real bugs',
        'Know browser DevTools well: breakpoints, network, performance, the accessibility tree',
        'Prepare a story about a hard production bug (for example, scraping job recovery)',
      ],
      commonAt: ['startup', 'mid-size', 'japan-international'],
    },
    {
      id: 'system-design',
      name: 'System design / frontend architecture',
      description:
        'A 45–60 minute open-ended design discussion. Backend-leaning rounds cover APIs, data, scaling and reliability; frontend rounds cover component architecture, state, data fetching, rendering strategy and performance. At mid-level the bar is a sound, well-reasoned design rather than planet-scale depth.',
      whatTheyEvaluate: [
        'Requirement gathering and scoping (functional and non-functional)',
        'A clear high-level design with sensible components and data model',
        'Trade-off reasoning: consistency, latency, cost, complexity',
        'Depth on one or two areas when probed',
      ],
      howToPrepare: [
        'Use a repeatable structure: requirements → estimates → API → data model → high level → deep dive → bottlenecks',
        'Practise designs that resemble your own work: a job scheduler, a scraping pipeline, an embeddable widget',
        'Prepare a frontend design: a news feed, autocomplete or design-system architecture',
      ],
      commonAt: ['mid-size', 'big-tech', 'japan-international'],
    },
    {
      id: 'project-deep-dive',
      name: 'Project deep dive',
      description:
        'You walk through a past project in depth: architecture, your specific contribution, hard decisions, failures and outcomes. The interviewer keeps asking "why?" to find where your understanding ends.',
      whatTheyEvaluate: [
        'Ownership and the scope of your individual contribution',
        'Depth of technical understanding behind decisions',
        'Honest reflection: what you would change',
        'Impact, measured in users, revenue, reliability or time saved',
      ],
      howToPrepare: [
        'Prepare 2–3 projects (accessibility platform, scraping system, REI-KIT) with a diagram you can draw in 2 minutes',
        'For each: goal, constraints, architecture, your role, a hard problem, the result, what you would change',
        'Use "I" for your decisions and "we" for team outcomes',
      ],
      commonAt: ['startup', 'mid-size', 'big-tech', 'japan-international', 'japan-traditional'],
    },
    {
      id: 'behavioral',
      name: 'Behavioral / culture / final interview (最終面接)',
      description:
        'Structured questions about past behaviour: conflict, failure, ambiguity, leadership and growth. Big tech scores these against explicit frameworks (for example, Amazon\'s Leadership Principles). In Japanese processes the final interview is often with a director or executive and focuses on motivation, long-term fit and values.',
      whatTheyEvaluate: [
        'Evidence of values the company names (ownership, collaboration, customer focus)',
        'Self-awareness and learning from mistakes',
        'Communication and conflict handling',
        'Long-term motivation: why this company, why Japan, career direction',
      ],
      howToPrepare: [
        'Build 8–10 STAR stories mapped to common themes; include metrics where you can',
        'Read the company\'s published values or principles and map your stories to them',
        'Prepare "Why this company?" and "Why Tokyo/Japan?" answers that are specific, not generic',
        'For Japanese finals: polite register, a clear career vision and consistency with earlier rounds',
      ],
      commonAt: ['startup', 'mid-size', 'big-tech', 'japan-international', 'japan-traditional'],
    },
  ],

  companies: [
    {
      type: 'startup',
      label: 'Startups',
      summary:
        'Short, practical loops focused on whether you can ship features end to end with little supervision.',
      typicalLoop: [
        'Recruiter or founder chat',
        'Practical technical interview or take-home',
        'Pairing or review of the take-home',
        'Culture / founder conversation',
        'Offer (often within 1–3 weeks)',
      ],
      emphasis: [
        'Product sense and speed of delivery',
        'Breadth across frontend, backend and infrastructure',
        'Ownership and comfort with ambiguity',
        'Practical framework knowledge over algorithm puzzles',
      ],
      notes:
        'Your 0→1 experience on the accessibility platform (architecture, deployment, first paying customers) maps directly onto what startups look for. Lead with it.',
    },
    {
      type: 'mid-size',
      label: 'Mid-size product companies',
      summary:
        'Structured but pragmatic loops that mix moderate algorithms, practical coding and architecture.',
      typicalLoop: [
        'Recruiter screen',
        'Online assessment or technical phone screen',
        'Live coding (algorithmic or practical)',
        'System or frontend design',
        'Project deep dive and behavioral',
        'Hiring manager conversation',
      ],
      emphasis: [
        'Solid fundamentals: medium-level DSA, language depth',
        'Design reasoning at the scale of a single product',
        'Collaboration and code quality',
        'Testing and production awareness',
      ],
    },
    {
      type: 'big-tech',
      label: 'Big tech (FAANG-style)',
      summary:
        'Standardised, rubric-scored loops in which algorithmic coding dominates at mid-level and design weight grows with level.',
      typicalLoop: [
        'Recruiter screen',
        'Online assessment and/or 45-minute technical screen',
        'Full loop of roughly 4–6 interviews: 2–3 coding, 1 system design (level-dependent), 1–2 behavioral',
        'Hiring committee or calibrated decision',
        'Team matching (at some companies)',
      ],
      emphasis: [
        'Algorithms and data structures under time pressure',
        'Clear communication of approach and complexity',
        'Behavioral evidence scored against published values (for example, Amazon\'s Leadership Principles or Meta\'s behavioral focus areas)',
        'System design for mid-level and above',
      ],
      notes:
        'Google, Meta and Amazon all publish official prep material. Read it before your loop, as it states what interviewers score. Processes often take 1–3 months.',
    },
    {
      type: 'japan-international',
      label: 'Tokyo international / English-friendly tech',
      summary:
        'Tokyo tech companies that hire globally (the Mercari, SmartNews, PayPay, Rakuten type). Loops resemble Western tech hiring, often with an early coding test, and English is commonly accepted.',
      typicalLoop: [
        '書類選考 / résumé screen',
        'Online coding test (platforms such as Codility or HackerRank are common) or take-home assignment',
        '2–3 technical interviews: coding, system design, project deep dive',
        'Hiring manager / culture interview',
        'Offer meeting (オファー面談), sometimes with reference checks',
      ],
      emphasis: [
        'Coding fundamentals (a test early in the process is common)',
        'Practical system design and production experience',
        'Alignment with published company values',
        'English communication; Japanese is a plus and is required for some teams',
      ],
      notes:
        'Language requirements differ by company and team. For example, LY Corporation states that its new-graduate engineer selection is conducted in Japanese, while other companies run entirely English loops. Check every job description, and treat candidate-reported round counts as approximate.',
    },
    {
      type: 'japan-traditional',
      label: 'Traditional Japanese companies (日系企業)',
      summary:
        'Japanese-language processes with formal document screening, frequent aptitude tests and several interview rounds that move up the hierarchy, with less live coding.',
      typicalLoop: [
        '書類選考 (履歴書 + 職務経歴書)',
        '適性検査 / SPI (common for new graduates, also used in mid-career hiring)',
        '一次面接: team lead or HR (experience and skills)',
        '二次面接: manager or department head',
        '最終面接: director or executive (motivation, long-term fit)',
        '内定 → オファー面談 / 条件提示',
      ],
      emphasis: [
        'Motivation (志望動機) and long-term commitment',
        'Communication in business Japanese (敬語)',
        'Consistency of your story across rounds',
        'Experience walkthroughs rather than algorithm puzzles; some companies add a coding test',
      ],
      notes:
        'Mid-career (中途) flows are typically shorter than new-graduate ones: document screening, 1–3 interviews and an offer, often within 1–2 months. Ask whether a coding test or 技術面接 is included, since this varies widely.',
    },
  ],

  sources: [
    {
      label: 'Google — How we hire',
      url: 'https://www.google.com/about/careers/applications/how-we-hire/',
      kind: 'official-guide',
      note: 'Official overview of Google\'s application and interview stages.',
    },
    {
      label: 'Google Tech Dev Guide',
      url: 'https://techdevguide.withgoogle.com/',
      kind: 'official-guide',
      note: 'Google\'s own practice paths for coding interview fundamentals.',
    },
    {
      label: 'Meta — Preparing for your full loop interview',
      url: 'https://www.metacareers.com/swe-prep-onsite/',
      kind: 'official-guide',
      note: 'Official description of the coding, design and behavioral conversations in Meta\'s loop.',
    },
    {
      label: 'Amazon — SDE II interview prep',
      url: 'https://amazon.jobs/content/en/how-we-hire/sde-ii-interview-prep',
      kind: 'official-guide',
      note: 'Official prep for mid-level SDE loops: coding, design and Leadership Principles.',
    },
    {
      label: 'Amazon — System design interview prep',
      url: 'https://amazon.jobs/content/en/how-we-hire/sde-iii-interview-prep',
      kind: 'official-guide',
      note: 'Says answers should draw on past work and include metrics where possible.',
    },
    {
      label: 'Amazon — Leadership Principles',
      url: 'https://www.amazon.jobs/content/en/our-workplace/leadership-principles',
      kind: 'official-guide',
      note: 'The principles that Amazon\'s behavioral questions are scored against.',
    },
    {
      label: 'SmartNews — Engineering interviews',
      url: 'https://careers.smartnews.com/engineer-interviews',
      kind: 'official-guide',
      note: 'Describes an early code test on an external platform and structured, scored interviews.',
    },
    {
      label: 'LY Corporation — Engineer recruiting (new graduates)',
      url: 'https://www.lycorp.co.jp/en/recruit/newgrads/engineer/',
      kind: 'official-guide',
      note: 'Flow: application → coding test → interviews → offer; selection conducted in Japanese.',
    },
    {
      label: 'LY Corporation — Recruiting FAQ',
      url: 'https://www.lycorp.co.jp/en/recruit/faq/',
      kind: 'official-guide',
      note: 'Coding test as the first selection step, plus online interviews.',
    },
    {
      label: 'Mercari Careers',
      url: 'https://careers.mercari.com/',
      kind: 'official-guide',
      note: 'Official careers site; check each role for its current selection steps.',
    },
    {
      label: 'Mercari Engineering Blog',
      url: 'https://engineering.mercari.com/en/',
      kind: 'engineering-blog',
      note: 'Shows the stack and engineering culture, which helps with deep dives and "why us" answers.',
    },
    {
      label: 'Tech Interview Handbook',
      url: 'https://www.techinterviewhandbook.org/',
      kind: 'community',
      note: 'Free guide to coding-interview patterns, the interview rubric and behavioral prep.',
    },
    {
      label: 'The System Design Primer',
      url: 'https://github.com/donnemartin/system-design-primer',
      kind: 'community',
      note: 'Standard open reference for system design building blocks and practice prompts.',
    },
    {
      label: 'Cracking the Coding Interview',
      url: 'https://www.crackingthecodinginterview.com/',
      kind: 'book',
      note: 'Classic book on problem-solving frameworks and behavioral prep.',
    },
    {
      label: 'interviewing.io — Company hiring guides',
      url: 'https://interviewing.io/guides/hiring-process',
      kind: 'community',
      note: 'Community breakdowns of big-tech hiring processes, used to check broad patterns only.',
    },
    {
      label: 'SPI3 (Recruit) — official site',
      url: 'https://www.spi.recruit.co.jp/',
      kind: 'official-guide',
      note: 'Provider of the SPI aptitude test widely used in Japanese hiring.',
    },
    {
      label: 'web.dev — Learn',
      url: 'https://web.dev/learn',
      kind: 'documentation',
      note: 'Authoritative basis for frontend performance, accessibility and Core Web Vitals content.',
    },
  ],

  lastReviewed: '2026-11-19',
}
