import type { Track } from '@/types/content'

const track: Track = {
  id: 'behavioral',
  code: 'S',
  title: 'Behavioral & Project Deep Dives',
  summary: 'Your stories, structured: STAR answers, a sharp pitch, and deep dives into the systems you actually built.',
  rationale:
    'Your strongest evidence is real: a B2B platform taken from planning to paying customers, a scraping system that has to survive failures, and a published UI library. Interviewers only credit what you can explain clearly, with your own decisions and results, so this track turns that experience into rehearsed, honest stories.',
  icon: 'Users',
  phase: 4,
  modules: [
    {
      id: 'beh-foundations',
      title: 'Story foundations',
      summary: 'The structure behind every behavioral answer, your opening pitch, and how to close the interview well.',
      questions: [
        {
          id: 'beh-star-story-bank',
          title: 'STAR / STARL: structuring any behavioral answer',
          type: 'behavioral',
          difficulty: 'foundation',
          priority: 'must',
          tags: ['star', 'story-bank', 'structure'],
          estMinutes: 4,
          roles: ['general'],
          prompt: `Before the questions start, the interviewer says: *"In this round I'll ask about past situations. Please give concrete examples."* **How do you structure each answer, and how do you prepare a set of stories that covers the questions they are likely to ask?**`,
          hints: [
            'There is a well-known four-letter structure. Which part should take the most time?',
            'Interviewers write down what *you* did, not what "we" did.',
            'One good story can answer several different questions if you prepare its angles.',
          ],
          answer: `Use **STAR**, with an optional **L** for *Learning*:

- **Situation** (1–2 sentences): context only. Company, project, stakes.
- **Task**: what *you* were responsible for, and what made it hard.
- **Action** (about 60% of the answer): the specific decisions you made, the alternatives you considered and why you chose one. Say "I", not "we".
- **Result**: the outcome, measured where possible. If you have no number, describe a concrete change (a customer went live, an incident stopped recurring).
- **Learning**: what you would repeat or do differently. This is what makes a story sound senior.

Aim for **about two minutes**, then stop and let them ask follow-ups. Follow-ups are where they check that the story is yours.

**Build a story bank before the loop.** Write 6–8 stories in a table with columns for the themes they cover:

| Story | Ownership | Conflict | Failure | Ambiguity | Deadline | Technical depth |
| --- | --- | --- | --- | --- | --- | --- |
| Accessibility platform, planning to beta | ✓ | | | ✓ | ✓ | ✓ |
| Scraping recovery jobs | ✓ | | ✓ | | | ✓ |
| Enterprise SSR/SPA integration issue | | ✓ | | ✓ | ✓ | |

For each story, write the numbers and names you can safely share: [metric], [timeline], [team size]. Never invent a metric. "I don't have the exact figure, but it went from [roughly X] to [Y]" is acceptable; a made-up number that collapses under a follow-up is not.

Rehearse out loud. A story that reads well on paper often runs to four minutes when spoken.`,
          keyPoints: [
            'Situation and Task short; Action is the bulk',
            'Use "I" for your own decisions',
            'Results are concrete, never invented',
            'A Learning step shows reflection',
            'Prepare a story bank mapped to themes',
          ],
          pitfalls: [
            'Spending a minute on background and rushing the actions',
            'Describing what the team did without your role',
            'Inventing metrics you cannot defend',
          ],
          followUps: ['What would you do differently if you ran that project again?', 'What did your manager think of that decision?'],
          personalAngle:
            'Your Efilli projects give you most columns of the table already: the accessibility platform covers ownership and ambiguity, the scraping system covers failure and recovery, and the enterprise integrations cover client-facing pressure.',
          references: [{ label: 'Tech Interview Handbook', url: 'https://www.techinterviewhandbook.org/' }],
        },
        {
          id: 'beh-tell-me-about-yourself',
          title: '"Tell me about yourself": the 90-second pitch',
          type: 'behavioral',
          difficulty: 'foundation',
          priority: 'must',
          tags: ['pitch', 'introduction', 'positioning'],
          estMinutes: 3,
          roles: ['full-stack', 'general'],
          prompt: `*"So, tell me a little about yourself."* **Give your 90-second answer for a mid-level full-stack product engineer role.**`,
          hints: [
            'This is a positioning statement, not your life story or a CV read-out.',
            'Present → past highlights → why this role.',
            'End on something that invites the follow-up you want.',
          ],
          answer: `Use **present → proof → direction**, about 90 seconds, then stop.

1. **Who you are now (one sentence):** your positioning. "I'm a full-stack product engineer" is clearer than a list of technologies.
2. **Proof (two or three highlights):** pick the experience that matches *this* role, with your role and a result.
3. **Direction (one or two sentences):** what you want next and why this company fits.

**Sample skeleton** (fill the brackets; keep only what is true):

> I'm a full-stack product engineer with about [three] years of experience, mostly in TypeScript across React, Vue and Node.js.
>
> Most recently at Efilli I was the lead for backend and infrastructure on a B2B accessibility platform. I worked on it from planning through beta: I designed the architecture, built the backend, set up the servers with Docker and CI/CD pipelines, and worked closely with a senior frontend developer. Shortly after beta we signed our first two paying customers.
>
> I also built automated scraping systems with Redis, scheduled jobs and recovery mechanisms, and I handled technical integration meetings with enterprise clients, mostly SSR and SPA compatibility issues.
>
> Outside work I maintain REI-KIT, a Vue 3 and TypeScript UI library on npm with a focus on accessibility, and I use it in my own apps.
>
> I'm based in Tokyo, and I'm looking for a product team where I can own features end to end, [reason that is specific to this company].

**Why it works:** it gives the interviewer three hooks (the platform, the scraping system, REI-KIT) and lets you steer the next question toward a deep dive you have rehearsed.

Tailor the proof: for a frontend role lead with consent UIs, React/Vue and REI-KIT; for a backend role lead with the platform backend, infrastructure and the scraping pipeline.`,
          keyPoints: [
            'Clear positioning in the first sentence',
            'Two or three highlights with your role and outcome',
            'Tailored to the role being interviewed for',
            'Ends with direction and a reason for this company',
            'About 90 seconds',
          ],
          pitfalls: [
            'Reading the CV chronologically from university',
            'Listing technologies without outcomes',
            'Talking for four minutes',
          ],
          followUps: ['Tell me more about the accessibility platform architecture.', 'Why are you looking now?'],
          personalAngle:
            'Prepare a frontend-led and a backend-led version of the same pitch so you can switch depending on the role.',
        },
        {
          id: 'beh-why-leaving-next-role',
          title: '"Why are you leaving?" and "What are you looking for next?"',
          type: 'behavioral',
          difficulty: 'core',
          priority: 'should',
          tags: ['motivation', 'career', 'next-role'],
          estMinutes: 3,
          roles: ['general'],
          prompt: `*"Why did you leave your last role, and what are you looking for in your next one?"*`,
          hints: [
            'Interviewers are checking for risk: will this person leave us for the same reason?',
            'Move toward something rather than away from something.',
            'Connect what you want to what this company actually offers.',
          ],
          answer: `**Keep it short, honest, forward-looking, and connected to this company.** The interviewer is checking two things: whether there is a red flag, and whether what you want exists here.

**Structure:**
1. **One honest sentence about the change**, with no blame: the project reached a natural end, you want a different scale or product, you want a team with more engineering peers, and so on. Pick the reason that is actually true.
2. **What you learned there** (one sentence) so the previous role sounds like growth, not escape.
3. **What you want next**, stated as concrete criteria.
4. **Why this company meets those criteria**, with one specific detail you researched.

**Sample skeleton:**

> At Efilli I grew from intern to leading backend and infrastructure for a B2B platform, and I'm proud that it reached paying customers. [Honest, neutral reason for leaving, for example: the stage of the product, wanting a larger engineering team, relocating focus to Tokyo product companies.]
>
> Next, I want a product team where I can own features end to end, work with engineers I can learn from on [system design / scale / code review culture], and keep a mix of backend and frontend work.
>
> That's why [company] interests me: [specific product, technical challenge or team practice you found in their engineering blog or job description].

**If you are currently between roles,** say so plainly and say what you are doing with the time: structured interview preparation, REI-KIT, Japanese study for N3. A gap explained with purpose is not a red flag.

Never criticise the previous employer, manager or colleagues, even if asked directly. "It was a small team, so I had to own many areas, which taught me a lot; now I want more depth in [area]" is the most negative it should get.`,
          keyPoints: [
            'Honest, brief, no blame',
            'Frames the move as growth toward something',
            'Concrete criteria for the next role',
            'Ties criteria to specifics about this company',
          ],
          pitfalls: [
            'Complaining about salary, a manager or the company',
            'A generic "looking for new challenges"',
            'Giving a different reason in each round',
          ],
          followUps: ['What would make you leave a job within a year?', 'Where do you want to be in five years?'],
          personalAngle:
            'Your path from intern (Aug 2023) to lead backend and infrastructure (2024–2026) at one company is a strong growth signal; mention it before the reason you left.',
        },
        {
          id: 'beh-questions-for-interviewer',
          title: 'Questions to ask the interviewer',
          type: 'behavioral',
          difficulty: 'foundation',
          priority: 'should',
          tags: ['reverse-questions', 'closing', 'research'],
          estMinutes: 3,
          roles: ['general'],
          prompt: `*"We have five minutes left. Do you have any questions for me?"* **What do you ask, and how do you choose?**`,
          hints: [
            '"No questions" is read as low interest.',
            'Match the question to the interviewer\'s role: an engineer, a manager and a recruiter know different things.',
            'Good questions also help you decide whether to accept an offer.',
          ],
          answer: `**Always ask two or three questions**, chosen for the person in front of you. Good questions show interest, show how you think about work, and collect information you need for your own decision.

**To an engineer:**
- "What does a typical feature go through from idea to production here?"
- "What part of the system would you most like to redesign, and why hasn't it happened yet?"
- "How do code review and on-call work on this team?"

**To an engineering manager:**
- "What would success look like for this role in the first three to six months?"
- "What is the biggest challenge the team is facing this year?"
- "How do engineers here grow toward senior: what does that path look like in practice?"

**To a recruiter:**
- "What are the next steps and the timeline?"
- "Is there anything in my background you would like me to clarify for the next round?"

**How to choose:**
- Prepare five or six and pick what was not already answered during the interview.
- Use your research: "I read that you moved to [technology]. What drove that?" shows real interest.
- Listen to the answer and ask one follow-up. That turns it into a conversation.

**Avoid** asking about salary or holidays in an early technical round (save that for the recruiter), and avoid anything answered on the first page of their website.`,
          keyPoints: [
            'Always ask; tailor to the interviewer\'s role',
            'Ask about success criteria and team practices',
            'Use specific research',
            'Follow up on the answer',
          ],
          pitfalls: ['Saying "No, I think you covered everything"', 'Asking about compensation in a technical round'],
          followUps: ['Is there anything about this role that worries you?'],
          personalAngle:
            'Ask about accessibility and frontend architecture where relevant: your platform and REI-KIT work make those questions sound informed rather than generic.',
        },
      ],
    },
    {
      id: 'beh-deep-dives',
      title: 'Project deep dives',
      summary: 'Explain your real systems at the level of decisions, trade-offs and failure modes, and survive the follow-ups.',
      questions: [
        {
          id: 'beh-dd-accessibility-platform',
          title: 'Deep dive: the accessibility platform you led from planning to paying customers',
          type: 'project-deep-dive',
          difficulty: 'advanced',
          priority: 'must',
          tags: ['deep-dive', 'architecture', 'infrastructure', 'ownership', 'accessibility'],
          estMinutes: 15,
          roles: ['full-stack', 'backend'],
          prompt: `*"You mentioned leading backend and infrastructure for an accessibility platform. Walk me through it: what it does, how it's built, the key decisions you made, and what you would change."*`,
          hints: [
            'Start with the problem and the users before any technology.',
            'Draw the architecture: clients, API, data stores, background work, deployment.',
            'Have two or three decisions ready, each with the alternative you rejected.',
          ],
          answer: `A deep dive is scored on **clarity of the big picture, ownership of decisions, and depth when probed.** Use this order and draw as you talk.

**1. Problem and users (30 seconds).** What the platform does for which customers, and why it mattered to them. [One sentence on the product. Who buys it, who uses it.]

**2. Your role.** "I was the lead for backend and infrastructure. I designed the architecture, built the backend, configured the servers over SSH, set up Docker and the CI/CD pipelines in YAML, and deployed the infrastructure. A senior frontend developer owned the UI; we agreed the API contract together."

**3. Architecture (draw it).** [Client / embed] → [API service: framework] → [database] plus [cache / queue if any] → deployed as Docker containers on [servers], with a CI/CD pipeline that [builds, tests, deploys]. Mark what is synchronous and what runs in the background.

**4. Two or three decisions with trade-offs.** Prepare each as *options → choice → why → cost*:
- [Data model / database choice]: why it fit the access patterns.
- [Deployment: Docker on servers you configured instead of a managed platform]: control and cost versus operational burden.
- [API design or contract with the frontend]: how you avoided blocking each other.

**5. Outcome.** The platform went from planning to beta, and the first two paying customers came shortly after beta. Add what you can measure: [time to onboard a customer], [uptime or incident count], [performance figure].

**6. What you would change.** One honest item, for example [observability you added late, a schema you would design differently, tests you would write earlier]. This answer is often weighted heavily.

**Prepare for follow-ups:** "How did you deploy without downtime?", "What happens if the server goes down?", "How did you handle secrets?", "How would this scale to 100 customers?", "How did you test accessibility?" Write a two-sentence answer to each before the interview.`,
          keyPoints: [
            'Problem and users before technology',
            'Clear statement of personal ownership',
            'An architecture diagram with data flow',
            'Decisions with alternatives and costs',
            'Concrete outcome: beta to first paying customers',
            'Honest retrospective',
          ],
          pitfalls: [
            'Listing technologies without explaining why',
            'Claiming credit for the frontend work your colleague owned',
            'No answer to "what would you change?"',
            'Inventing scale numbers',
          ],
          followUps: [
            'How did you handle deployments and rollbacks?',
            'What would break first if traffic grew tenfold?',
            'How did you make sure the product itself was accessible?',
          ],
          personalAngle:
            'This is your flagship story. Practise drawing the diagram in under two minutes on a whiteboard and in a shared online doc, because Tokyo loops use both.',
        },
        {
          id: 'beh-dd-scraping-system',
          title: 'Deep dive: the scraping system and its failure modes',
          type: 'project-deep-dive',
          difficulty: 'advanced',
          priority: 'must',
          tags: ['deep-dive', 'scraping', 'redis', 'reliability', 'scheduling'],
          estMinutes: 15,
          roles: ['backend', 'full-stack'],
          prompt: `*"Tell me about the automated scraping system. How were jobs scheduled, what happened when something failed halfway, and how did the matching over thousands of records work?"*`,
          hints: [
            'Describe the pipeline as stages: schedule → fetch → parse → match → store.',
            'For each stage, ask "what if this fails, or runs twice?"',
            'Interviewers love idempotency, retries with backoff and dead-letter handling.',
          ],
          answer: `Present it as a **pipeline with explicit failure handling**, because reliability is what makes this story senior.

**1. Purpose.** What was scraped and why the business needed it. [One sentence.]

**2. Pipeline (draw it):**
- **Scheduler:** scheduled jobs trigger runs [every N / on a cron].
- **Workers:** browser automation (Puppeteer-style) fetches and parses pages.
- **Redis:** [queue / job state / locks / cache: say exactly what you used it for].
- **Matching:** compares scraped items against thousands of existing records.
- **Storage:** results written to [database].

**3. Failure modes and how you handled them.** This is the core of the answer:
- **Crash mid-run:** recovery/restart mechanisms resume from saved progress instead of starting over. Explain where progress was stored ([Redis key / database checkpoint]) and how a restarted job knew where to continue.
- **Duplicate runs:** if a job could run twice (a retry or an overlapping schedule), explain how you prevented double processing: [a lock, idempotent writes keyed on a stable id, upserts].
- **Target site changes or blocks:** [selector failures detected how? alerts? retries with backoff?].
- **Slow pages / timeouts:** [timeouts per page, limits on concurrent browsers to control memory].
- **Bad matches:** how false positives were detected and corrected.

**4. Matching logic.** Explain the approach: [normalisation of names or fields, exact keys first, then fuzzy comparison, thresholds]. Mention complexity: comparing every item against every record is O(n·m); indexing or bucketing by a normalised key avoids that.

**5. Results.** [Runs per day], [records processed], [how much manual work it replaced], [failure rate before and after recovery jobs]. Only numbers you can stand behind.

**6. What you'd change.** For example: moving to a dedicated job queue such as BullMQ for retries and visibility, adding metrics per stage, or a review UI for low-confidence matches.`,
          keyPoints: [
            'Pipeline described as clear stages',
            'Recovery from saved progress, not a full restart',
            'Idempotency and protection against duplicate runs',
            'Explicit role of Redis',
            'Matching approach with complexity awareness',
            'Measured outcome and an honest improvement',
          ],
          pitfalls: [
            'Only describing the happy path',
            'Being vague about what Redis actually stored',
            'Ignoring browser memory and concurrency limits',
          ],
          followUps: [
            'How would you make a job safe to retry?',
            'How did you know a run had silently produced wrong data?',
            'How would you scale this to ten times the sources?',
          ],
          personalAngle:
            'Connect this story to the system design track: a "design a web crawler or job scheduler" question is your chance to reuse these exact failure modes.',
          references: [{ label: 'Redis documentation', url: 'https://redis.io/docs/' }],
        },
        {
          id: 'beh-dd-enterprise-integrations',
          title: 'Deep dive: enterprise integrations and SSR/SPA compatibility',
          type: 'project-deep-dive',
          difficulty: 'core',
          priority: 'should',
          tags: ['deep-dive', 'ssr', 'spa', 'integration', 'client-communication'],
          estMinutes: 10,
          roles: ['frontend', 'full-stack'],
          prompt: `*"You worked on integrations for enterprise clients. Describe a difficult integration issue: what broke, how you diagnosed it, and how you communicated with the client."*`,
          hints: [
            'What is different about running third-party code on a server-rendered page versus a client-rendered SPA?',
            'Think about hydration, route changes without full reloads, and when the DOM exists.',
            'Half the story is the meeting with the client, not the code.',
          ],
          answer: `This story shows two things at once: **technical debugging across environments you don't control** and **communication with non-team stakeholders**.

**1. Situation.** An enterprise client integrated [your product / script / component] into their site, built with [SSR framework or SPA]. [What the client saw going wrong.]

**2. Diagnosis.** Typical root causes in this space, so you can explain yours precisely:
- **SSR:** code that touches window or document runs on the server and throws; markup rendered on the server differs from the client and causes hydration mismatches.
- **SPA:** client-side route changes don't reload the page, so a script that initialises once on load never re-runs or attaches to stale DOM.
- **Timing:** the element you need does not exist yet when your code runs.
- **Isolation:** the host page's CSS or global JavaScript conflicts with yours.

Describe *how* you found it: [reproduced in a minimal SSR/SPA app, checked the console and network tab on their staging site, compared server HTML with hydrated DOM].

**3. Fix.** [For example: guarding browser-only code and initialising after mount, listening for route changes, a framework-specific integration in React + TypeScript, scoping styles.] Mention how you made the fix general so the next client would not hit it.

**4. Communication.** Enterprise clients care about risk and timelines. Explain how you: joined the technical meeting, translated the cause into plain language, gave options with trade-offs, agreed next steps in writing, and followed up when it shipped.

**5. Result.** [Client went live on date / issue closed / integration guide written for other clients.]

**Learning:** for example, "test against both an SSR and an SPA sample app before any client sees a release."`,
          keyPoints: [
            'Precise root cause: SSR, hydration, SPA routing or timing',
            'Systematic diagnosis with a minimal reproduction',
            'Fix generalised beyond one client',
            'Clear, written communication with the client',
          ],
          pitfalls: [
            'Blaming the client\'s code',
            'A vague "we fixed some compatibility issues"',
            'Skipping the communication half',
          ],
          followUps: ['What is a hydration mismatch and how do you debug one?', 'How would you test an embed across frameworks automatically?'],
          personalAngle:
            'Pair this story with the Next.js and React tracks: being able to explain hydration from first principles turns a client anecdote into a technical-depth signal.',
        },
        {
          id: 'beh-dd-rei-kit',
          title: 'Deep dive: why you built REI-KIT, a UI library',
          type: 'project-deep-dive',
          difficulty: 'core',
          priority: 'should',
          tags: ['deep-dive', 'design-system', 'accessibility', 'api-design', 'versioning'],
          estMinutes: 10,
          roles: ['frontend', 'full-stack'],
          prompt: `*"I see you maintain a UI library on npm. Why build your own instead of using an existing one? How do you design component APIs, handle accessibility, and version changes without breaking users?"*`,
          hints: [
            '"Why not use X?" deserves a real answer, not "I wanted to learn".',
            'Think about the decisions a library forces: what it renders, what strings it owns, what it leaves to the app.',
            'Semantic versioning, changelogs and deprecation paths.',
          ],
          answer: `Treat REI-KIT as a product with users (your own apps) and present **motivation, design principles, accessibility, and release discipline**.

**1. Why build it.** [Your real reason, for example: the same components were being rebuilt across Hibi, Kakei and Kakehashi; existing libraries did not fit the design or accessibility standard you wanted; you wanted one consistent layer across your apps.] Acknowledge the cost: maintaining a library is ongoing work, which is why most teams should adopt an existing one.

**2. Scope.** Vue 3 + TypeScript, around 106 components, 4 materials and 10 palettes, published on npm, used by your own apps including the one you are preparing with.

**3. API design principles.** Prepare two or three concrete examples:
- Components take text as props instead of calling a translation library, so the library forces no i18n choice on apps.
- Props are typed; generics where a value type flows through (for example a select's option values).
- Sensible defaults, with escape hatches through slots.

**4. Accessibility.** Explain what "WCAG-checked" means in practice for you: [keyboard support, focus management in dialogs, ARIA roles, colour contrast checks across palettes]. Give one example of a bug you found and fixed.

**5. Versioning.** Semantic versioning: breaking changes only in major versions, deprecations announced first, a changelog per release. [How you test before publishing: type checks, tests, a showcase app.]

**6. What you learned.** For example: API decisions are hard to undo once others depend on them; documentation and examples matter as much as code.`,
          keyPoints: [
            'Honest motivation and awareness of maintenance cost',
            'Concrete API design principles with examples',
            'Specific accessibility practices',
            'Semantic versioning and deprecation discipline',
          ],
          pitfalls: [
            'Only saying "to learn"',
            'Claiming full WCAG compliance without explaining how it was checked',
            'No awareness of the cost of breaking changes',
          ],
          followUps: ['How would you introduce a breaking change to a prop used everywhere?', 'How do you test keyboard accessibility?'],
          personalAngle:
            'You can open this very app during a remote interview: it is built on REI-KIT, so you can show a real consumer of your API.',
          references: [{ label: 'REI-KIT on npm', url: 'https://www.npmjs.com/package/rei-kit' }],
        },
        {
          id: 'beh-dd-scrape-compare',
          title: 'Deep dive: Scrape & Compare, an AI-powered matching engine',
          type: 'project-deep-dive',
          difficulty: 'core',
          priority: 'nice',
          tags: ['deep-dive', 'ai', 'matching', 'side-project'],
          estMinutes: 8,
          roles: ['full-stack', 'backend'],
          prompt: `*"Tell me about Scrape & Compare. How does the AI matching work, and how do you know whether the matches are any good?"*`,
          hints: [
            'Interviewers want to see that you treat model output as untrusted input.',
            'How do you measure quality without a labelled dataset?',
            'Cost and latency of model calls are design constraints.',
          ],
          answer: `Present it as **a pipeline with an AI step**, and spend most of the time on evaluation, cost and failure handling. That is what separates engineering from a demo.

**1. Problem.** Matching job postings to [a profile / CV / criteria]. Why keyword search alone was not enough: [synonyms, different seniority wording, mixed languages].

**2. Pipeline.** [Scrape postings] → [normalise and store] → [AI step: embeddings for similarity, an LLM for scoring/explanation, or both] → [ranked results with reasons]. Say which model or API you used and why.

**3. Treat the model as unreliable.**
- Validate structured output against a schema and retry or fall back when it does not match.
- Keep deterministic filters (location, language, visa support) outside the model.
- Cache results so the same posting is not scored twice.

**4. Evaluation.** Even without a large labelled set, you can: hand-label [N] postings as good/bad matches and measure agreement; compare against a keyword baseline; track how often you agree with the top results. Be honest about how far you got.

**5. Cost and latency.** Calls per run, batching, and where you cut cost (filtering before the model call, smaller models for first-pass scoring).

**6. Next steps.** [What you would improve.]

If the project is early-stage, say so. "It's a working prototype; here is what I'd need before trusting it" is a stronger answer than overselling.`,
          keyPoints: [
            'Clear pipeline with the AI step in context',
            'Validation of model output',
            'Deterministic rules outside the model',
            'Some form of evaluation against a baseline',
            'Cost and latency awareness',
          ],
          pitfalls: ['"The AI just works"', 'No evaluation at all', 'Overstating the project\'s maturity'],
          followUps: ['How would you detect when quality drops after a model change?'],
          personalAngle:
            'It reuses the scraping and matching experience from Efilli; say so explicitly, because it shows a theme in your work rather than an isolated toy.',
        },
      ],
    },
    {
      id: 'beh-situations',
      title: 'Difficult situations',
      summary: 'Conflict, failure, ambiguity, deadlines and feedback: the classic behavioral prompts with honest story skeletons.',
      questions: [
        {
          id: 'beh-conflict-disagreement',
          title: 'A disagreement with a colleague about a technical decision',
          type: 'behavioral',
          difficulty: 'advanced',
          priority: 'must',
          tags: ['conflict', 'collaboration', 'communication'],
          estMinutes: 4,
          roles: ['general'],
          prompt: `*"Tell me about a time you disagreed with a teammate on a technical decision. What happened?"*`,
          hints: [
            'The interviewer is not scoring who was right. What are they scoring?',
            'Show that you understood the other person\'s position.',
            'A good ending is a decision and a working relationship, not a "win".',
          ],
          answer: `They are scoring **how you disagree**: respect, evidence, willingness to be wrong, and commitment once a decision is made.

**Framework:**
1. **Situation:** the decision and why it mattered.
2. **Both positions, fairly:** state the other person's reasoning as they would state it.
3. **What you did:** asked questions to understand constraints, proposed criteria (performance, delivery time, maintainability), built a small proof or gathered data, and agreed how to decide.
4. **Outcome:** the decision, even if it was theirs, and how you supported it.
5. **Learning:** what you now do earlier in similar situations.

**Sample skeleton** (choose a real disagreement; the API contract with the senior frontend developer on the accessibility platform is a natural candidate if it is true):

> On the accessibility platform I owned the backend, and a senior frontend developer owned the UI. We disagreed about [the shape of an API / where some logic should live / a library choice]. I preferred [option A] because [reason]; they preferred [option B] because [their reason, stated fairly].
>
> Instead of arguing in the abstract, I suggested we agree on what mattered most: [criteria]. I [built a quick prototype / measured / listed the impact on both sides]. [Outcome: we chose X, or a combination.] When the decision went [their way / a middle way], I [implemented it fully and documented why].
>
> What I learned: [for example, agree on decision criteria before debating solutions, and write the API contract down early].

Choose a real, moderate conflict. Avoid stories where the other person was simply incompetent, and avoid "I've never had a disagreement".`,
          keyPoints: [
            'States the other side fairly',
            'Uses criteria and evidence rather than opinion',
            'Commits to the final decision',
            'Relationship intact; learning stated',
          ],
          pitfalls: ['A story where you were completely right and they were wrong', 'Claiming no conflicts ever', 'Escalating to a manager as the first move'],
          followUps: ['What if you still believed they were wrong after the decision?', 'How do you disagree with someone more senior?'],
          personalAngle:
            'Working with a senior frontend developer while you led the backend is a credible setting; use a real moment from that collaboration.',
        },
        {
          id: 'beh-failure-mistake',
          title: 'A mistake or failure you were responsible for',
          type: 'behavioral',
          difficulty: 'core',
          priority: 'must',
          tags: ['failure', 'accountability', 'learning', 'incident'],
          estMinutes: 4,
          roles: ['general'],
          prompt: `*"Tell me about a time something you built or decided went wrong. What did you do?"*`,
          hints: [
            'Choose a real mistake with real consequences, but not a catastrophe.',
            'Own it in the first two sentences.',
            'The best part of the answer is the change you made so it could not happen again.',
          ],
          answer: `They are scoring **accountability, response under pressure, and systemic learning**.

**Framework:**
1. **The mistake, owned clearly:** "I [did / missed / assumed] X." No hedging, no blame.
2. **Impact:** who or what was affected, honestly sized.
3. **Immediate response:** how you noticed, communicated, and fixed or mitigated it.
4. **Root cause:** why it was possible, beyond "I was careless".
5. **Prevention:** the process or technical change that stops a repeat (a test, an alert, a checklist, a review step).
6. **Learning:** one sentence.

**Sample skeleton** (choose your real incident; the scraping system is a natural source if a failure there led to the recovery jobs):

> On the scraping system, I [designed jobs that restarted from the beginning after a failure / assumed the target pages' structure would not change / did not alert on empty results]. When [event], the result was [impact: stale data, a missed run, a delayed delivery to a client].
>
> I [noticed through ... / was told by ...], told [my lead / the client contact] what had happened and when it would be fixed, and [immediate fix].
>
> The root cause was [no checkpointing / no monitoring for silent failure / no test for the edge case]. I added [recovery from saved progress / an alert on abnormal result counts / a validation step], and since then [result you can honestly claim].
>
> What I learned: [for example, design every scheduled job assuming it will crash halfway].

Keep the failure real. "My weakness is that I work too hard" style answers lose credibility instantly.`,
          keyPoints: [
            'Clear ownership without excuses',
            'Honest impact',
            'Prompt communication',
            'Root cause beyond individual error',
            'Systemic prevention',
          ],
          pitfalls: ['A fake failure that is really a boast', 'Blaming tools or colleagues', 'No prevention step'],
          followUps: ['How did your manager react?', 'What would you monitor now that you did not then?'],
          personalAngle:
            'If the recovery/restart mechanisms came out of a real failure, this story also sets up your scraping deep dive.',
        },
        {
          id: 'beh-ownership-ambiguity',
          title: 'Taking ownership of an ambiguous problem',
          type: 'behavioral',
          difficulty: 'core',
          priority: 'must',
          tags: ['ownership', 'ambiguity', 'planning', 'initiative'],
          estMinutes: 4,
          roles: ['general'],
          prompt: `*"Tell me about a time you were given a goal with unclear requirements. How did you move forward?"*`,
          hints: [
            'What did you do in the first week, before writing much code?',
            'Assumptions written down are better than assumptions kept in your head.',
            'Show how you reduced risk with something small and shippable.',
          ],
          answer: `They are scoring whether you **create clarity instead of waiting for it**, and whether you take responsibility for the outcome rather than just the tasks.

**Framework:**
1. **The ambiguous goal** and what was unknown (users, scope, technology, deadline).
2. **How you created clarity:** asked stakeholders specific questions, wrote down assumptions, defined what "done" means for a first version.
3. **How you reduced risk:** a small first slice, a prototype, or a spike on the riskiest part.
4. **How you kept people aligned:** short written updates, decisions recorded.
5. **Result and learning.**

**Sample skeleton** (the accessibility platform from planning is the obvious real example):

> When the accessibility platform started, it was at the planning stage: [what was undefined, for example which features the beta needed, how customers would integrate, what infrastructure we would run on].
>
> As the person responsible for backend and infrastructure, I [listed the open questions and took them to (product owner / founder / client)], wrote down the assumptions we agreed on, and proposed a beta scope of [core features].
>
> I started with the riskiest part, [for example the deployment pipeline or the integration point], so problems surfaced early. I set up Docker and CI/CD before the feature work grew, which meant [every change could be deployed the same way].
>
> We reached beta, and shortly after, the first two paying customers. Looking back, I would [write a short design doc earlier / validate an assumption with a customer sooner].

Ownership means you also owned the unglamorous parts: servers configured over SSH, pipelines, deployment. Mention them; they prove end-to-end responsibility.`,
          keyPoints: [
            'Turns ambiguity into explicit questions and assumptions',
            'Defines a small first scope',
            'Tackles the riskiest part early',
            'Keeps stakeholders aligned in writing',
            'Owns the outcome end to end',
          ],
          pitfalls: ['Waiting for someone to define requirements', 'Building everything before validating anything'],
          followUps: ['What did you decide not to build for the beta?', 'How did you know the scope was right?'],
          personalAngle:
            'Your "planning through beta to paying customers" arc is exactly what this question asks for; make the first-week actions vivid.',
        },
        {
          id: 'beh-prioritisation-deadline',
          title: 'Prioritising under a tight deadline',
          type: 'behavioral',
          difficulty: 'core',
          priority: 'should',
          tags: ['prioritisation', 'deadline', 'trade-offs', 'scope'],
          estMinutes: 4,
          roles: ['general'],
          prompt: `*"Describe a time you had more work than time before a deadline. How did you decide what to do?"*`,
          hints: [
            'Scope, time and quality: which one did you trade, and who agreed?',
            'How did you rank the work?',
            'What did you communicate, to whom, and when?',
          ],
          answer: `They are scoring **judgement and communication**, not heroics.

**Framework:**
1. **The deadline and why it mattered** (a customer go-live, a beta launch, a client meeting).
2. **The gap:** what was planned versus what was realistic.
3. **How you prioritised:** ranked tasks by impact on the goal and by risk; separated must-have from nice-to-have; identified what could be simplified.
4. **Who you told and when:** you raised the trade-off early, with options, rather than missing the date silently.
5. **Outcome:** what shipped, what was deferred, and whether the deferred work was done later.
6. **Learning.**

**Sample skeleton:**

> Before [beta launch / an enterprise client's go-live], we had [list of remaining work] and about [time]. It was clear we could not finish everything at the quality we wanted.
>
> I listed the remaining tasks and asked of each: does the customer need this on day one? What breaks if it slips? That gave three groups: [must-have], [could be simplified, e.g. manual process instead of automation], [could wait].
>
> I shared that list with [stakeholder] [N days] before the deadline, with the trade-off spelled out, and we agreed to [decision].
>
> We delivered [what shipped] on time; [deferred item] followed [when]. The thing I'd keep doing is raising the trade-off early with options instead of asking for permission at the last minute.

Do not present "I worked every night" as the solution. Interviewers hear it as a planning failure.`,
          keyPoints: [
            'Explicit prioritisation criteria',
            'Trade-off raised early with options',
            'Stakeholders agreed to the scope change',
            'Deferred work was followed up',
          ],
          pitfalls: ['Heroic overtime as the strategy', 'Cutting testing silently', 'Missing the deadline without warning'],
          followUps: ['What did you cut, and did anyone complain?', 'How do you estimate work now?'],
        },
        {
          id: 'beh-feedback-seniors',
          title: 'Receiving feedback and working with senior engineers',
          type: 'behavioral',
          difficulty: 'core',
          priority: 'nice',
          tags: ['feedback', 'growth', 'collaboration', 'mentorship'],
          estMinutes: 3,
          roles: ['general'],
          prompt: `*"Tell me about a piece of critical feedback you received. What did you do with it?"* Often followed by: *"How do you work with engineers more senior than you?"*`,
          hints: [
            'Pick feedback that actually changed how you work.',
            'Show the change with evidence, not just agreement.',
            'Working with seniors: how do you use their time well?',
          ],
          answer: `They are scoring **coachability and self-awareness**, which matter a lot for a mid-level hire.

**Framework for feedback:**
1. **The feedback**, quoted as closely as you remember, from whom.
2. **Your first reaction**, honestly (a little defensiveness is human; say how you got past it).
3. **What you changed**, concretely.
4. **Evidence it worked:** a later review, a result, a habit you still keep.

**Sample skeleton:**

> When I moved from frontend to leading backend and infrastructure, [a senior colleague / my manager] told me that [real feedback, for example: my pull requests were too large to review, I made decisions without writing down why, I didn't communicate progress early enough].
>
> At first [honest reaction]. Then I [concrete change: split work into smaller PRs, wrote short decision notes, sent a weekly written update].
>
> [Evidence: reviews became faster, the client/team referred to the notes, the same feedback did not come up again.]

**Working with senior engineers:**
- Come with a specific question and what you have already tried; it respects their time.
- Ask for the reasoning behind their decisions, not just the answer, so you need them less next time.
- Disagree with evidence when you have it; they usually value that more than silent agreement.
- Make their job easier: write clear PR descriptions and flag risks early.

Your collaboration with the senior frontend developer on the accessibility platform is a natural source for both parts of this answer.`,
          keyPoints: [
            'Real, specific feedback',
            'Concrete behavioural change',
            'Evidence the change stuck',
            'Uses senior engineers\' time well and learns their reasoning',
          ],
          pitfalls: ['"I can\'t think of any feedback"', 'Feedback that is secretly praise', 'Agreeing without changing anything'],
          followUps: ['Have you ever given difficult feedback to someone else?'],
          personalAngle:
            'Your growth from intern to lead at Efilli implies a lot of feedback absorbed quickly; pick the single piece that changed your work most.',
        },
      ],
    },
  ],
}

export default track
