/**
 * Markdown + syntax highlighting for STATIC, TRUSTED curriculum content only.
 * Never pass user-authored text (notes) through here: the output is bound with v-html.
 *
 * Rendering is memoized per source string — content is immutable, so a question
 * re-visited (or the same card in a review session) costs nothing to show again.
 */
import { Marked, type Token, type Tokens, type TokensList } from 'marked'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import json from 'highlight.js/lib/languages/json'
import bash from 'highlight.js/lib/languages/bash'
import sql from 'highlight.js/lib/languages/sql'
import css from 'highlight.js/lib/languages/css'
import xml from 'highlight.js/lib/languages/xml'
import yaml from 'highlight.js/lib/languages/yaml'
import python from 'highlight.js/lib/languages/python'
import plaintext from 'highlight.js/lib/languages/plaintext'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('json', json)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('css', css)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('yaml', yaml)
hljs.registerLanguage('python', python)
hljs.registerLanguage('plaintext', plaintext)
hljs.registerAliases(['vue'], { languageName: 'xml' })
hljs.registerAliases(['shell', 'console', 'sh'], { languageName: 'bash' })
hljs.registerAliases(['text', 'txt'], { languageName: 'plaintext' })

export type MarkdownSegment = { kind: 'html'; html: string } | { kind: 'code'; code: string; language: string }

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const marked = new Marked({
  gfm: true,
  breaks: false,
  renderer: {
    link({ href, title, tokens }: Tokens.Link): string {
      const text = this.parser.parseInline(tokens)
      const external = /^https?:\/\//i.test(href)
      const attrs = [`href="${escapeHtml(href)}"`]
      if (title) attrs.push(`title="${escapeHtml(title)}"`)
      if (external) attrs.push('target="_blank"', 'rel="noopener noreferrer"')
      return `<a ${attrs.join(' ')}>${text}</a>`
    },
    // Fallback only: top-level fenced code is lifted out into CodeSnippet segments.
    code({ text, lang }: Tokens.Code): string {
      return `<pre class="hljs-pre"><code class="hljs">${highlightCode(text, lang ?? '')}</code></pre>`
    },
  },
})

/** Normalised language id for display / highlighting ('ts' → 'typescript'). */
export function resolveLanguage(language: string | undefined): string {
  const id = (language ?? '').trim().toLowerCase().split(/\s+/)[0] ?? ''
  const lang = hljs.getLanguage(id)
  if (!lang) return 'plaintext'
  // getLanguage resolves aliases; find the canonical registered name.
  return hljs.listLanguages().find((name) => hljs.getLanguage(name) === lang) ?? 'plaintext'
}

const highlightCache = new Map<string, string>()

/** HTML-escaped, highlight.js-annotated markup for `code`. Safe for v-html (hljs escapes input). */
export function highlightCode(code: string, language: string | undefined): string {
  const lang = resolveLanguage(language)
  const key = `${lang}\u0000${code}`
  const cached = highlightCache.get(key)
  if (cached !== undefined) return cached
  let html: string
  try {
    html = lang === 'plaintext' ? escapeHtml(code) : hljs.highlight(code, { language: lang, ignoreIllegals: true }).value
  } catch {
    html = escapeHtml(code)
  }
  highlightCache.set(key, html)
  return html
}

const segmentCache = new Map<string, MarkdownSegment[]>()

/** Splits Markdown into HTML runs and fenced code blocks (rendered by CodeSnippet for copy + a11y). */
export function renderMarkdown(source: string): MarkdownSegment[] {
  const cached = segmentCache.get(source)
  if (cached) return cached
  const tokens = marked.lexer(source)
  const segments: MarkdownSegment[] = []
  let run: Token[] = []
  const flush = () => {
    if (!run.length) return
    const list = Object.assign(run, { links: tokens.links }) as TokensList
    segments.push({ kind: 'html', html: marked.parser(list) })
    run = []
  }
  for (const token of tokens) {
    if (token.type === 'code') {
      flush()
      const code = token as Tokens.Code
      segments.push({ kind: 'code', code: code.text, language: code.lang ?? '' })
    } else {
      run.push(token)
    }
  }
  flush()
  segmentCache.set(source, segments)
  return segments
}

const inlineCache = new Map<string, string>()

/** Inline Markdown (choice text, key points) → HTML without a wrapping <p>. */
export function renderInline(source: string): string {
  const cached = inlineCache.get(source)
  if (cached !== undefined) return cached
  const html = marked.parseInline(source) as string
  inlineCache.set(source, html)
  return html
}

export function useMarkdown() {
  return { renderMarkdown, renderInline, highlightCode, resolveLanguage }
}
