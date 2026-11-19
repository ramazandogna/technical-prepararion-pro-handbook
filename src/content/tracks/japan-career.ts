import type { Track } from '@/types/content'

const track: Track = {
  id: 'japan-career',
  code: 'T',
  title: 'Tokyo Job Market & Career',
  summary: 'Interviewing in Tokyo: international vs Japanese processes, recruiters, salary talks, self-introductions and etiquette.',
  rationale:
    'You are job hunting in Tokyo with professional English and Japanese at pre-N3 level, so the process itself is part of the challenge. Knowing how international and traditional companies hire, how agencies work, and how to introduce yourself and your Japanese level honestly removes avoidable mistakes before the technical rounds even start.',
  icon: 'MapPin',
  phase: 4,
  modules: [
    {
      id: 'jp-market',
      title: 'The Tokyo market',
      summary: 'Company types, recruiters and agencies, and how to discuss salary without guessing.',
      questions: [
        {
          id: 'jp-international-vs-traditional',
          title: 'International vs traditional Japanese hiring processes',
          type: 'tradeoff',
          difficulty: 'core',
          priority: 'must',
          tags: ['japan', 'hiring-process', 'company-types', 'strategy'],
          estMinutes: 5,
          roles: ['general'],
          companyTypes: ['japan-international', 'japan-traditional', 'startup'],
          prompt: `A friend asks: *"In Tokyo, what's the difference between applying to an English-friendly tech company and a traditional Japanese company? Which should I target?"* **Explain the differences and how they affect your strategy.**`,
          hints: [
            'Compare documents, language, rounds and what is evaluated.',
            'Where do algorithms matter most, and where does motivation matter most?',
            'Your current Japanese level is a real constraint. Be strategic, not wishful.',
          ],
          answer: `The two groups differ in **language, documents, interview content and decision style**. Patterns vary by company, so confirm with the recruiter, but these tendencies are common:

| | English-friendly / international tech | Traditional Japanese company |
| --- | --- | --- |
| Language | English interviews; Japanese may be "a plus" | Mostly Japanese; business-level often expected |
| Documents | English CV/résumé, sometimes LinkedIn | 履歴書 (rirekisho) and 職務経歴書 (career history), often in a set format |
| Early filter | Online coding test or technical screen is common | 書類選考 (document screening), sometimes an aptitude test such as SPI |
| Rounds | Coding, system design, project deep dive, behavioral | Several interviews moving up the hierarchy, ending with senior management |
| What is scored | Technical skill, communication, impact | Motivation (志望動機), long-term fit, consistency, attitude, Japanese |
| Pace | Often a few weeks | Can be slower; decisions often by consensus |

**Strategy for your profile:**
- **Primary target:** English-friendly product companies and startups. Your English, full-stack experience and shipped projects are directly scored there, and Japanese is usually not the deciding factor.
- **Secondary target:** Japanese companies with international engineering teams, where daily work is in English but some Japanese helps. Your N3 preparation is a plus to mention.
- **Selective:** fully Japanese-language roles. Apply when the role is a strong fit, but expect business-level Japanese to be a hard requirement in many of them.

Preparation that transfers everywhere: a strong self-introduction, two or three project deep dives, and a clear, specific answer to "why this company" and "why Japan / why Tokyo".

These are generalisations. Read each job description's language requirement literally, and ask the recruiter what the interview language is for every round.`,
          keyPoints: [
            'Different documents: English CV vs 履歴書 / 職務経歴書',
            'International companies: coding tests and technical rounds first',
            'Traditional companies: motivation, consistency, Japanese',
            'Target strategy matched to current Japanese level',
            'Confirm interview language per round',
          ],
          pitfalls: [
            'Treating every Tokyo company as the same process',
            'Applying to business-level Japanese roles without preparation',
            'Assuming all foreign-founded companies run in English',
          ],
          followUps: ['How would you answer "Why do you want to work in Japan long term?"'],
          personalAngle:
            'Your profile fits English-speaking product teams best right now; frame Japanese study (N3) as a long-term commitment rather than a current skill.',
        },
        {
          id: 'jp-recruiter-agency-screen',
          title: 'The recruiter or agency screening call',
          type: 'behavioral',
          difficulty: 'foundation',
          priority: 'must',
          tags: ['recruiter', 'agency', 'screening', 'japan'],
          estMinutes: 4,
          roles: ['general'],
          prompt: `An agency recruiter calls: *"I have a few roles at Tokyo tech companies. Can you walk me through your background, what you're looking for, your visa status and your salary expectations?"* **How do you handle this call?**`,
          hints: [
            'The recruiter is deciding which roles to submit you for. Make that easy.',
            'Have a clear target: role type, stack, language environment, location/remote.',
            'You can collect information without committing to a number.',
          ],
          answer: `Treat the call as **a matching conversation**: give a crisp profile, state clear criteria, and collect information.

**1. Short background (60 seconds).** A trimmed version of your pitch: full-stack product engineer, about [three] years, TypeScript with React, Vue and Node.js, led backend and infrastructure for a B2B accessibility platform, Tokyo-based, professional English, studying Japanese toward N3.

**2. Clear criteria.** Recruiters submit candidates who are easy to place:
- Role: [full-stack / backend / frontend] product engineering, mid-level.
- Environment: English-speaking team, or bilingual with English as the working language.
- Work style: [on-site / hybrid / remote preference].
- Company type: [product company, startup stage], [industries of interest].

**3. Visa status.** State it factually: [your current status of residence and its validity]. Ask whether the client company supports visa changes or sponsorship if relevant.

**4. Salary.** If you are not ready, give a researched range or turn it back: "I'm looking for a market-rate offer for a mid-level engineer in Tokyo. What range does this role have?" Agencies usually know the budget.

**5. Questions to ask the recruiter:**
- Which companies, and what is the interview language for each round?
- What does the process look like (online test, number of rounds, take-home)?
- Why is the position open, and how big is the team?
- Will you tell me before submitting my CV to a company? (Avoid being submitted twice by different agencies.)

**After the call:** send a short written summary of your criteria, keep a list of where each agency has submitted you, and never let two agencies submit you to the same company.`,
          keyPoints: [
            'Crisp background and clear target criteria',
            'Factual visa status',
            'Salary deflected or given as a researched range',
            'Ask about interview language and process',
            'Control where your CV is submitted',
          ],
          pitfalls: [
            'Agreeing to "any role" so the recruiter has nothing to match',
            'Giving a low number on the spot',
            'Being submitted to the same company by two agencies',
          ],
          followUps: ['How do you choose between several agencies?'],
          personalAngle:
            'Mention REI-KIT and the accessibility platform by name; recruiters forward short, concrete highlights to hiring managers.',
        },
        {
          id: 'jp-agency-model-mc',
          title: 'How recruitment agencies work in Japan',
          type: 'multiple-choice',
          difficulty: 'foundation',
          priority: 'should',
          tags: ['agency', 'recruiter', 'japan', 'process'],
          estMinutes: 2,
          roles: ['general'],
          prompt: `Which statement about typical contingency recruitment agencies (人材紹介) in Japan is **most accurate**?`,
          choices: [
            {
              id: 'a',
              text: 'The candidate pays the agency a fee once they accept an offer.',
              correct: false,
              explanation: 'In the usual contingency model the hiring company pays the fee; candidates should not be charged.',
            },
            {
              id: 'b',
              text: 'The hiring company pays the agency, typically a fee linked to the hire\'s salary, so the agency\'s incentive is to place you, ideally quickly.',
              correct: true,
              explanation: 'This is the common model. It explains why agencies are helpful but may also push you toward a quick decision.',
            },
            {
              id: 'c',
              text: 'It is best to let several agencies submit your CV to the same company to increase your chances.',
              correct: false,
              explanation: 'Duplicate submissions create ownership disputes between agencies and can get your application rejected.',
            },
            {
              id: 'd',
              text: 'Agencies cannot help with salary negotiation, so you must negotiate directly with the company.',
              correct: false,
              explanation: 'Agencies commonly negotiate on your behalf; that is part of their service.',
            },
          ],
          hints: ['Follow the money: who pays the agency?'],
          answer: `**B.** In the common contingency model (人材紹介), the **hiring company pays the agency** when you are hired, usually a fee related to your salary. You do not pay.

**What this means for you:**
- Agencies are a free, useful channel: they know which companies hire foreign engineers, the real interview process, and the salary budget.
- Their incentive is a placement. A good agent is still on your side, but expect some pressure to accept quickly. Make decisions on your own timeline.
- Because the fee is tied to salary, agents usually help negotiate the offer.
- **Track every submission.** If two agencies submit you to the same company, the company may reject the application to avoid a dispute.

Applying directly through a company's careers page is also normal, especially at international tech companies. Some companies prefer direct applicants because there is no agency fee. Use both channels, but never both for the same company.`,
          keyPoints: [
            'Hiring company pays the agency',
            'Agency incentive is placement',
            'Agencies help negotiate',
            'Avoid duplicate submissions',
          ],
          pitfalls: ['Paying an agency yourself', 'Letting multiple agencies submit to the same company'],
          followUps: ['When would you apply directly instead of through an agency?'],
        },
        {
          id: 'jp-salary-expectations',
          title: 'Salary expectations and offer negotiation in Tokyo',
          type: 'tradeoff',
          difficulty: 'advanced',
          priority: 'must',
          tags: ['salary', 'negotiation', 'offer', 'japan'],
          estMinutes: 5,
          roles: ['general'],
          prompt: `*"What are your salary expectations?"* Later you receive an offer letter stating 年収 [amount]. **How do you research a range, answer the question, and evaluate the offer?**`,
          hints: [
            'Base your number on data you collected, not on your previous salary.',
            'What is included in the annual figure? Bonus? Overtime?',
            'Compare offers on the same basis before negotiating.',
          ],
          answer: `**Research first, answer with a range or ask for theirs, and compare offers component by component.** Never invent a number on the spot.

**1. Research a range** (do this before any recruiter call):
- Salary ranges published in job postings for similar roles in Tokyo; many international companies list them.
- Public salary surveys and guides published by recruitment agencies, and crowd-sourced compensation sites that include Tokyo data.
- Ask agency recruiters directly what the budget for a role is; they usually know.
- Ask engineers in your network what is typical for mid-level roles at different company types.
Write down a **walk-away number**, a **target** and a **stretch** figure.

**2. Answering the question:**
- Early, if you can: "I'd like to understand the role first. What range has been budgeted?"
- If pressed: give a researched range whose bottom is a number you would genuinely accept. "Based on my research for mid-level full-stack roles in Tokyo, I'm looking at [range]."
- Avoid anchoring on your previous salary.

**3. Understanding a Japanese offer.** Ask how the figure is built:
- Is 年収 (annual income) **base salary only, or base plus bonus**? Some companies pay bonuses (賞与) on top of monthly salary and include an expected bonus in the 年収 figure.
- Is **fixed overtime pay** (みなし残業 / 固定残業代) included? If so, how many hours per month does it cover, and is overtime above that paid?
- Allowances such as commuting (通勤手当), housing, remote work, plus stock options or RSUs at some companies.
- Probation period (試用期間), holidays, and how raises are decided.

**4. Negotiating.** Be polite and specific: thank them, state the gap, and give a reason (a competing offer, market data, scope of the role). Agencies often negotiate for you. Ask for the final offer in writing (労働条件通知書 or an offer letter) before resigning anywhere or declining other offers.

Exact market figures change and vary widely by company, so rely on current data you collected, not on fixed numbers from any guide.`,
          keyPoints: [
            'Range based on collected market data',
            'Prefer to hear their budget first',
            'Clarify base vs bonus vs fixed overtime',
            'Compare total package, not one number',
            'Get the final offer in writing',
          ],
          pitfalls: [
            'Quoting a number without research',
            'Accepting without checking whether overtime is included',
            'Comparing a base-only figure with a base-plus-bonus figure',
          ],
          followUps: ['How would you respond if the offer is below your walk-away number?'],
          personalAngle:
            'Having led backend and infrastructure for a product that reached paying customers supports asking for the upper part of a mid-level range; say it in terms of scope, not years.',
        },
      ],
    },
    {
      id: 'jp-introductions',
      title: 'Introductions, motivation and Japanese ability',
      summary: 'Self-introductions in English and Japanese, 志望動機, and talking honestly about your Japanese level.',
      questions: [
        {
          id: 'jp-self-intro-english',
          title: 'Self-introduction in English for a Tokyo interview',
          type: 'behavioral',
          difficulty: 'foundation',
          priority: 'must',
          tags: ['self-introduction', 'english', 'pitch', 'japan'],
          estMinutes: 3,
          roles: ['general'],
          prompt: `The interviewer, a Japanese engineering manager speaking English, says: *"Please introduce yourself briefly."* **Give a one-minute introduction suited to a Tokyo interview.**`,
          hints: [
            '"Briefly" in this context often means about one minute.',
            'Clear, simple English works better than idioms.',
            'Include why you are in Tokyo and your Japanese study; they will wonder anyway.',
          ],
          answer: `Keep it **one minute, clear, and structured**: who you are, two highlights, why Tokyo and this company, then a polite close.

**Why adjust it for Tokyo:**
- The interviewer may be working in their second language. Short sentences, no idioms, moderate speed.
- "Why are you in Japan, and will you stay?" is often on their mind. Answer it before they ask.
- A polite opening and closing fit expectations at Japanese companies and cost nothing at international ones.

**Sample skeleton:**

> Thank you for your time today. My name is [name]. I'm a full-stack software engineer with about [three] years of experience, mainly TypeScript with React, Vue and Node.js.
>
> At my previous company, Efilli, I led backend and infrastructure for a B2B accessibility platform, from planning to beta. We gained our first two paying customers shortly after beta. I also built automated scraping systems with Redis and recovery jobs, and supported enterprise clients with technical integrations.
>
> I live in Tokyo, and I'm studying Japanese for the JLPT N3. [One honest sentence on why Tokyo long-term.]
>
> I'm interested in [company] because [specific reason]. Thank you, I look forward to talking with you today.

**Delivery tips:** pause between sections, make eye contact (camera on video calls), and stop at one minute. If they want more, they will ask, and the deep dive is where you go into detail.`,
          keyPoints: [
            'About one minute',
            'Simple, clear English',
            'Two concrete highlights',
            'Addresses why Tokyo and Japanese study',
            'Polite opening and close',
          ],
          pitfalls: ['Speaking fast with idioms', 'A three-minute career history', 'Not mentioning the company at all'],
          followUps: ['Why did you choose Japan?', 'How long do you plan to stay in Japan?'],
          personalAngle:
            'Reuse the 90-second pitch from the behavioral track, cut to one minute, and add the Tokyo and Japanese-study sentence.',
        },
        {
          id: 'jp-jikoshoukai',
          title: '自己紹介: a short self-introduction in Japanese',
          type: 'behavioral',
          difficulty: 'core',
          priority: 'must',
          tags: ['jikoshoukai', 'japanese', 'self-introduction', 'keigo'],
          estMinutes: 3,
          roles: ['general'],
          companyTypes: ['japan-international', 'japan-traditional'],
          prompt: `The interview is in English, but the interviewer asks: *"Could you introduce yourself in Japanese, just briefly?"* **Prepare a 30–45 second 自己紹介 in polite Japanese that fits your level.**`,
          hints: [
            'Use です/ます form and a few set phrases. Accuracy matters more than complexity.',
            'Start with はじめまして and your name with と申します.',
            'End with よろしくお願いいたします.',
          ],
          answer: `Keep it **short, polite (です・ます) and within your level**. A clean 30-second introduction with correct set phrases makes a better impression than a long one with mistakes, and it shows effort.

**Sample (fill the brackets):**

はじめまして。[名前]と申します。
*Nice to meet you. My name is [name].*

本日はお時間をいただき、ありがとうございます。
*Thank you for your time today.*

大学ではコンピュータ工学を専攻しました。
*I majored in computer engineering at university.*

ソフトウェアエンジニアとして、約[3]年働いてきました。
*I have worked as a software engineer for about [three] years.*

前職では、アクセシビリティのプラットフォームで、バックエンドとインフラを担当しました。
*At my previous job, I was responsible for the backend and infrastructure of an accessibility platform.*

フロントエンドでは、ReactやVue、TypeScriptを使っています。
*On the frontend, I use React, Vue and TypeScript.*

今、日本語を勉強していて、JLPTのN3を目指しています。
*I'm studying Japanese and aiming for the JLPT N3.*

どうぞよろしくお願いいたします。
*I look forward to working with you / thank you.*

**Notes:**
- と申します is the humble form of と言います; it is standard in interviews.
- If you are still employed, use 現職では (at my current job) instead of 前職では.
- Practise until you can say it naturally without reading. If you then need to switch back to English, say: すみません、ここからは英語でお話ししてもよろしいでしょうか。(*Sorry, may I continue in English from here?*)
- Do not memorise more than you can understand; the interviewer may ask a simple follow-up in Japanese.`,
          keyPoints: [
            'Polite です・ます form throughout',
            'Set phrases: はじめまして, と申します, よろしくお願いいたします',
            'Content matches real experience',
            'Short and accurate rather than long',
            'A polite way to switch back to English',
          ],
          pitfalls: [
            'Memorising a long script beyond your level',
            'Mixing casual forms (だ, してる) into an interview',
            'Reading from notes on camera',
          ],
          followUps: ['どうして日本で働きたいですか。(Why do you want to work in Japan?)'],
          personalAngle:
            'This is a good item to practise aloud with your N3 study partner or tutor; record yourself and check pitch and pauses.',
        },
        {
          id: 'jp-shiboudouki',
          title: '志望動機: why this company',
          type: 'behavioral',
          difficulty: 'core',
          priority: 'should',
          tags: ['shiboudouki', 'motivation', 'research', 'japan'],
          estMinutes: 4,
          roles: ['general'],
          companyTypes: ['japan-international', 'japan-traditional'],
          prompt: `*"御社を志望した理由を教えてください"* / *"Why do you want to join our company?"* **Build a motivation answer that would satisfy a Japanese hiring manager.**`,
          hints: [
            'Japanese interviewers often probe this in every round and check for consistency.',
            'Company-specific reasons beat industry-level reasons.',
            'Connect their needs, your experience and your future plan.',
          ],
          answer: `志望動機 is weighted heavily in Japanese hiring, and often asked in every round. A strong answer has three linked parts: **why this company, what you bring, and what you want to achieve there.**

**1. Why this company (specific).** Something you could not say about a competitor: their product, a technical challenge in their engineering blog, their users, how the team works. "You're a leading company" is not a reason.

**2. What you bring.** One or two experiences that match their needs, with a result.

**3. Future plan.** What you want to contribute or grow into over the next few years. Japanese companies often value signals of long-term commitment.

**English skeleton:**

> I'm applying for two reasons. First, [specific thing about the company]. Second, I think my experience with [backend and infrastructure for a B2B platform / accessible frontends / scraping and data pipelines] can help with [their challenge]. In the future I'd like to [goal within the company].

**Simple Japanese version (N3-friendly):**

御社を志望した理由は二つあります。
*There are two reasons I applied to your company.*

一つ目は、[御社のプロダクト]に強く興味を持ったからです。
*First, I became very interested in [your product].*

二つ目は、私の[バックエンドとインフラ]の経験を生かせると思ったからです。
*Second, I believe I can use my experience in [backend and infrastructure].*

将来は、[目標]に貢献したいと考えています。
*In the future, I would like to contribute to [goal].*

**Consistency matters:** write your 志望動機 down and use the same core reasons in every round, adding detail as you meet more senior interviewers.`,
          keyPoints: [
            'Company-specific reason',
            'Matches your experience to their need',
            'Long-term contribution',
            'Consistent across rounds',
          ],
          pitfalls: [
            'Generic praise of the company',
            'Reasons only about what you get (salary, visa, location)',
            'Different motivations in different rounds',
          ],
          followUps: ['他社と比べて、なぜ当社なのですか。(Why us rather than other companies?)'],
          personalAngle:
            'For companies with accessibility, consent or B2B integration needs, your Efilli work gives you a reason that is both specific and credible.',
        },
        {
          id: 'jp-japanese-ability',
          title: 'Answering "How is your Japanese?" honestly',
          type: 'behavioral',
          difficulty: 'advanced',
          priority: 'must',
          tags: ['japanese-level', 'jlpt', 'honesty', 'language'],
          estMinutes: 3,
          roles: ['general'],
          prompt: `*"The team works in English, but some meetings and documents are in Japanese. What is your Japanese level, and could you work in Japanese?"*`,
          hints: [
            'Overstating your level is discovered quickly and damages trust.',
            'Describe what you can actually do, not just a JLPT label.',
            'Show a plan and a trajectory.',
          ],
          answer: `**Be precise and honest, describe concrete abilities, and show a credible plan.** Overstating is discovered in the first meeting; understating with no plan looks like a long-term risk.

**Know the vocabulary employers use:**
- **Business level (ビジネスレベル)**: can run meetings, read specifications and write emails in Japanese. Often associated with N2 or above, but in practice it is about real working ability, not only the certificate.
- **Conversational (日常会話レベル)**: daily conversation, simple workplace exchanges.
- **JLPT**: N5 (basic) to N1 (advanced). N3 is intermediate: everyday situations, slower speech. Preparing for N3 means you are not yet at business level, and that is fine to say.

**Answer structure:**
1. **Current level, plainly.** "I'm currently preparing for the JLPT N3."
2. **What you can do today**, concretely: [for example, self-introduction and simple conversation, reading short messages with some help, following slow speech]. Only list what is true.
3. **How you would cope now:** working language English; translation tools for documents; asking colleagues to confirm important points; writing follow-ups in English.
4. **Plan:** [exam date], [study routine], and a goal such as working toward N2.

**Sample skeleton:**

> My Japanese is at an intermediate-beginner level. I'm studying for the JLPT N3 [this year / exam date]. I can [real abilities], but I'm not yet at business level, so for technical discussions I'd work in English and use translation for Japanese documents. I study [routine], and my goal is to reach [goal] so I can join Japanese meetings more fully.

If the role really requires business-level Japanese, it is better to find out in this conversation than after joining.`,
          keyPoints: [
            'Honest JLPT status',
            'Concrete current abilities',
            'Practical coping strategy for today',
            'Credible study plan and goal',
            'Understands "business level" vs "conversational"',
          ],
          pitfalls: [
            'Claiming "business level" without it',
            'Only saying "a little" with no plan',
            'Treating the JLPT label as the whole answer',
          ],
          followUps: ['Could you answer the next question in Japanese?', 'When do you expect to reach business level?'],
          personalAngle:
            'Kakehashi, your Japanese course platform, is evidence of sustained interest in the language; mention it briefly if Japanese study comes up.',
          references: [{ label: 'JLPT official site', url: 'https://www.jlpt.jp/e/' }],
        },
      ],
    },
    {
      id: 'jp-process',
      title: 'Process, etiquette and practicalities',
      summary: '逆質問, interview manners and basic 敬語, visa questions, and remote and take-home norms.',
      questions: [
        {
          id: 'jp-gyaku-shitsumon',
          title: '逆質問: questions at the end of a Japanese interview',
          type: 'behavioral',
          difficulty: 'foundation',
          priority: 'should',
          tags: ['gyaku-shitsumon', 'reverse-questions', 'japan', 'keigo'],
          estMinutes: 3,
          roles: ['general'],
          companyTypes: ['japan-international', 'japan-traditional'],
          prompt: `*"最後に、何か質問はありますか。"* (*"Finally, do you have any questions?"*) **What do you ask, and how do you phrase it politely?**`,
          hints: [
            'In Japanese interviews, 逆質問 is often explicitly evaluated as a sign of motivation.',
            'Questions about contributing and learning read better than questions about benefits.',
            'Use polite request forms such as 教えていただけますか.',
          ],
          answer: `**逆質問 (reverse questions)** is often treated as part of the evaluation: it shows motivation, preparation and how you think about contributing. Always ask one or two.

**Good themes:** expectations for the role, how the team works, how you can prepare before joining, growth and evaluation.

**Polite Japanese examples (with English):**
- 入社までに、勉強しておいたほうがいいことはありますか。
  *Is there anything I should study before joining?*
- 配属予定のチームの開発の進め方について、教えていただけますか。
  *Could you tell me how the team I would join develops software?*
- 入社後、最初の三か月でどのようなことを期待されていますか。
  *What would you expect from me in the first three months?*
- エンジニアの評価は、どのように行われていますか。
  *How are engineers evaluated?*

**In English** at international companies, the behavioral track's questions apply: success criteria for the role, biggest team challenge, how features go to production.

**Etiquette:**
- Start with a short thanks: 本日はありがとうございます。質問を二つさせていただいてもよろしいでしょうか。(*Thank you for today. May I ask two questions?*)
- Avoid opening with salary, overtime or holidays, especially in early rounds with Japanese companies. The recruiter or HR is the place for those.
- Do not ask what is clearly on their website.
- If everything was covered: 丁寧にご説明いただいたので、今は特にございません。(*You explained everything thoroughly, so I have no questions right now.*) Use this only as a last resort.`,
          keyPoints: [
            '逆質問 often signals motivation and is evaluated',
            'Polite request forms (教えていただけますか)',
            'Focus on contribution, team and growth',
            'Save conditions for HR or the recruiter',
          ],
          pitfalls: ['Saying 特にありません immediately', 'Leading with salary and holidays', 'Asking what the website already answers'],
          followUps: ['御社で活躍している方の共通点は何ですか。(What do people who do well here have in common?)'],
        },
        {
          id: 'jp-interview-etiquette',
          title: 'Interview manners and basic 敬語',
          type: 'concept',
          difficulty: 'core',
          priority: 'should',
          tags: ['etiquette', 'keigo', 'culture', 'japan'],
          estMinutes: 4,
          roles: ['general'],
          companyTypes: ['japan-international', 'japan-traditional'],
          prompt: `**What manners and basic polite language should you know for an in-person or online interview at a Japanese company?**`,
          hints: [
            'Think arrival, entering the room, sitting, speaking about the company, and leaving.',
            '御社 and 貴社 both mean "your company". When is each used?',
            'Online interviews have their own version of punctuality.',
          ],
          answer: `Manners are noticed more at traditional Japanese companies than at international ones, but basic courtesy helps everywhere. Practices vary; when in doubt, follow the interviewer's lead.

**Timing**
- In person: arrive at the building about 10 minutes early; going to reception much earlier can be inconvenient for them.
- Online: test your camera, microphone and connection beforehand and join a few minutes early. Use a quiet, tidy background.
- If you will be late, contact them **before** the start time with an apology and a new arrival time.

**Entering and sitting (in person)**
- Knock, and enter after you hear どうぞ. Say 失礼いたします (*excuse me*) as you enter.
- Wait to sit until invited: when they say どうぞおかけください, answer 失礼いたします and sit.
- A small bow when greeting and leaving; sit upright and keep your bag beside your chair.

**Basic 敬語 (polite language)**
- 御社 (onsha) when **speaking** about their company; 貴社 (kisha) when **writing**, in emails or documents.
- と申します to give your name; いたします and させていただきます as humble forms of します.
- Polite requests: ～していただけますか (*could you ...?*).
- Being clear matters more than complex 敬語. Consistent です・ます form is acceptable at your level.

**Closing**
- 本日はありがとうございました。(*Thank you for today.*) and よろしくお願いいたします.
- Online: thank them and wait for the interviewer to end the call.
- A short thank-you email the same day is appreciated by some companies, though not always expected.

**Dress:** a dark suit is the safe default for traditional companies; international tech companies are often business casual. Ask the recruiter if unsure.`,
          keyPoints: [
            'Punctual but not too early; contact before being late',
            'Wait to be invited to sit; 失礼いたします',
            '御社 in speech, 貴社 in writing',
            'Clear です・ます over complex 敬語',
            'Dress and formality depend on company type',
          ],
          pitfalls: ['Using 貴社 in speech or 御社 in a cover letter', 'Sitting before being invited', 'Leaving an online call before the interviewer'],
          followUps: ['How would you write a short thank-you email in Japanese?'],
        },
        {
          id: 'jp-visa-questions',
          title: 'Visa and work-permit questions',
          type: 'concept',
          difficulty: 'core',
          priority: 'should',
          tags: ['visa', 'status-of-residence', 'japan', 'logistics'],
          estMinutes: 3,
          roles: ['general'],
          prompt: `*"What is your current visa status? Would you need sponsorship?"* **How do you answer, and what should you ask the company?** (This is interview guidance, not legal advice.)`,
          hints: [
            'Answer factually and briefly; employers want to know about risk and timing.',
            'What does the company need to do, if anything, for you to start?',
            'Where do you check the actual rules?',
          ],
          answer: `**Answer factually, briefly and confidently, then ask what support the company provides.** Employers ask because they need to know whether you can start, when, and whether they must do paperwork.

**How to answer:**
- State your current status of residence and its expiry date: "I currently hold [status of residence], valid until [date]."
- Say whether a change of employer or status is needed for this role, if you know: "[My status allows this kind of work / I would need to change my status / I'd like to confirm with you]."
- Keep it short. If you are unsure about a detail, say you will confirm. Do not guess about legal requirements.

**Questions to ask the company or recruiter:**
- Do you support applications or changes of status of residence for engineers? Have you hired foreign engineers before?
- Will you provide the documents needed for an application or renewal?
- Do you work with an immigration lawyer or an administrative scrivener (行政書士)?
- How does the expected start date account for processing time?

**Things to verify yourself, using official sources:**
- Which status of residence covers software engineering work. Many engineers hold "Engineer/Specialist in Humanities/International Services" (技術・人文知識・国際業務), but your situation may differ.
- Any procedures or notifications required when you change employers.
- Rules on side projects or freelance work under your status.

Rules change and individual cases differ. Check the **Immigration Services Agency of Japan** website and, for anything uncertain, ask a qualified professional. Do not rely on forums or on this summary for legal decisions.`,
          keyPoints: [
            'Factual statement of status and validity',
            'Ask about company support and documents',
            'Plan start date around processing time',
            'Verify rules with official ISA sources or a professional',
          ],
          pitfalls: [
            'Guessing about legal requirements in the interview',
            'Hiding or being vague about visa status',
            'Resigning before confirming the new status situation',
          ],
          followUps: ['What happens to your visa if you change jobs?'],
          references: [{ label: 'Immigration Services Agency of Japan', url: 'https://www.isa.go.jp/' }],
        },
        {
          id: 'jp-remote-takehome-norms',
          title: 'Remote work, hybrid policies and take-home assignments',
          type: 'tradeoff',
          difficulty: 'advanced',
          priority: 'nice',
          tags: ['remote', 'hybrid', 'take-home', 'work-style', 'japan'],
          estMinutes: 4,
          roles: ['general'],
          companyTypes: ['startup', 'japan-international', 'japan-traditional'],
          prompt: `A Tokyo startup sends a take-home assignment ("about 4 hours, due in a week") and mentions a "flexible hybrid" policy. **How do you approach the take-home, and what do you clarify about remote work before accepting an offer?**`,
          hints: [
            'A take-home is graded on more than whether it works.',
            '"Hybrid" can mean very different things in practice.',
            'Get work-style terms in writing, like any other condition.',
          ],
          answer: `**Take-homes:** treat them as a small production task that someone will review and discuss with you.

- **Clarify first:** expected time, allowed libraries, whether tests are expected, how it will be evaluated, and whether there is a follow-up review session. Asking is normal and shows professionalism.
- **Respect the time box.** If it says four hours, aim for a clean four-hour solution, not a weekend of polish. Write down what you would add with more time.
- **What reviewers look for:** working core functionality, readable structure, a few meaningful tests, error handling, and a README explaining how to run it, decisions and trade-offs.
- **Prepare for the review call:** you will be asked why you chose your structure and how you would extend it. Know your own code well.
- **Boundaries:** if an assignment looks like unpaid production work or would take days, it is reasonable to ask whether a shorter version or a live exercise is possible.

**Remote and hybrid:** policies vary a lot between companies in Tokyo, and they change. Clarify:
- How many office days per week or month, and whether it is fixed by team.
- Core hours or flexible hours (フレックスタイム), and meeting time zones.
- Whether remote work from outside Tokyo or outside Japan is allowed, and for how long.
- Equipment and home-office or commuting allowances.
- Whether the policy is written in the employment contract or work rules, or is informal and could change.

Ask the recruiter or HR, not in a technical round, and confirm important points in the written offer.`,
          keyPoints: [
            'Clarify take-home scope and evaluation',
            'Respect the time box and document trade-offs',
            'README, tests and readable structure matter',
            'Concrete questions about office days, hours and location',
            'Work-style terms confirmed in writing',
          ],
          pitfalls: [
            'Spending several days on a "4-hour" assignment',
            'Submitting without a README or tests',
            'Assuming "hybrid" means mostly remote',
          ],
          followUps: ['What would you include in the README of a take-home?'],
          personalAngle:
            'Your Docker and CI experience is useful here: a take-home that runs with one command and has a simple CI check stands out.',
        },
      ],
    },
  ],
}

export default track
