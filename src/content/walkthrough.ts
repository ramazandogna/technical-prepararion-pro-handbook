/**
 * The guided answer: authored `walkthrough` steps, or the model answer split at its bold section
 * headings ("**Why:**", "**Fix:**" …). Pure; shared by the answer view and the "closed" rule.
 */
import type { Question, WalkthroughStep } from '@/types/content'

const SECTION = /^\*\*([^*\n]{2,60}?)[:.]?\*\*[:.]?\s*/

function autoSteps(answer: string): WalkthroughStep[] {
  const blocks = answer.split(/\n{2,}(?=\*\*[^*\n]{2,60}\*\*)/)
  const steps = blocks
    .map((block, i) => {
      const text = block.trim()
      const m = SECTION.exec(text)
      if (m && i > 0) return { title: (m[1] ?? '').trim(), body: text.slice(m[0].length).trim() || text }
      return { title: i === 0 ? 'The direct answer' : `Part ${i + 1}`, body: text }
    })
    .filter((s) => s.body.length > 0)
  // Merge very short trailing fragments so each step is worth a stamp.
  const merged: WalkthroughStep[] = []
  for (const s of steps) {
    const last = merged[merged.length - 1]
    if (last && s.body.length < 120) last.body += `\n\n**${s.title}:** ${s.body}`
    else merged.push({ ...s })
  }
  return merged.slice(0, 8)
}

const cache = new WeakMap<Question, WalkthroughStep[]>()

export function walkthroughOf(question: Question): WalkthroughStep[] {
  let steps = cache.get(question)
  if (!steps) {
    steps = question.walkthrough?.length ? question.walkthrough : autoSteps(question.answer)
    cache.set(question, steps)
  }
  return steps
}

/** Every stamp the learner must press to close the question. */
export function requiredStamps(question: Question): string[] {
  return [
    ...walkthroughOf(question).map((_, i) => `step-${i}`),
    ...question.keyPoints.map((_, i) => `kp-${i}`),
  ]
}

/** The whole answer as one Markdown document — for "Copy answer". */
export function answerAsMarkdown(question: Question): string {
  const parts = [`# ${question.title}`, '', '## Question', question.prompt]
  if (question.code) parts.push('', '```' + question.code.language, question.code.source, '```')
  if (question.intent) parts.push('', '## What it tests', question.intent)
  parts.push('', '## Model answer', question.answer)
  const steps = question.walkthrough
  if (steps?.length) {
    parts.push('', '## Step by step')
    steps.forEach((s, i) => parts.push('', `### ${i + 1}. ${s.title}`, s.body))
  }
  if (question.keyPoints.length) parts.push('', '## Key points', ...question.keyPoints.map((k) => `- ${k}`))
  if (question.pitfalls?.length) parts.push('', '## Pitfalls', ...question.pitfalls.map((k) => `- ${k}`))
  if (question.followUps?.length) parts.push('', '## Follow-ups', ...question.followUps.map((k) => `- ${k}`))
  return parts.join('\n')
}
