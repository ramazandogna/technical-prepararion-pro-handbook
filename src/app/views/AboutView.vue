<script setup lang="ts">
import { computed } from 'vue'
import { BaseBadge, BaseCard, formatDate } from 'rei-kit'
import { BaseAccordion } from 'rei-kit/web'
import { ExternalLink, Lock, Mail, Repeat, Route, Sparkles } from 'lucide-vue-next'
import type { CompanyType, ResearchSource } from '@/types/content'
import { research } from '@/content/meta/research'
import MarkdownContent from '@/components/content/MarkdownContent.vue'
import PageTitle from '@/components/common/PageTitle.vue'

const COMPANY_LABEL: Record<CompanyType, string> = {
  startup: 'Startup',
  'mid-size': 'Mid-size',
  'big-tech': 'Big tech',
  'japan-international': 'Japan · international',
  'japan-traditional': 'Japan · traditional',
}

const SOURCE_KIND_LABEL: Record<ResearchSource['kind'], string> = {
  'official-guide': 'Official guide',
  'engineering-blog': 'Engineering blog',
  book: 'Book',
  documentation: 'Documentation',
  community: 'Community',
}

const stageItems = computed(() => research.stages.map((s) => ({ key: s.id, title: s.name })))
const stageById = computed(() => new Map(research.stages.map((s) => [s.id, s])))

const reviewed = computed(() => {
  const d = new Date(research.lastReviewed)
  return Number.isNaN(d.getTime()) ? research.lastReviewed : formatDate(d, { year: 'numeric', month: 'long' })
})

const howItWorks = [
  { icon: Route, title: 'One button a day', body: 'Pick a role and press Start. A hiring panel decided the daily mix: algorithms first, then the topics that role is tested on.' },
  { icon: Sparkles, title: 'Active recall', body: 'Answer first, use hints only when stuck, then compare with a model answer and the key points an interviewer listens for.' },
  { icon: Repeat, title: 'Spaced review', body: 'Your self-grade (Again, Hard, Good, Easy) sets when a question comes back. Hard ones return sooner.' },
  { icon: Lock, title: 'Private by design', body: 'No account. Progress lives in this browser; with a personal sync code an encrypted copy follows you to every device.' },
]
</script>

<template>
  <div class="mx-auto flex max-w-4xl flex-col gap-8">
    <PageTitle
      eyebrow="About"
      title="Research & method"
      description="How the curriculum was built, what real interview loops look like, and how this app helps you practise."
    />

    <section aria-labelledby="how-title" class="flex flex-col gap-4">
      <h2 id="how-title" class="text-ink text-xl font-semibold">How this app works</h2>
      <ul class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <li v-for="item in howItWorks" :key="item.title">
          <BaseCard class="h-full">
            <div class="flex gap-3">
              <component :is="item.icon" class="text-primary mt-0.5 size-5 shrink-0" aria-hidden="true" />
              <div>
                <h3 class="text-ink font-medium">{{ item.title }}</h3>
                <p class="text-ink-soft mt-1 text-sm leading-relaxed">{{ item.body }}</p>
              </div>
            </div>
          </BaseCard>
        </li>
      </ul>
    </section>

    <section aria-labelledby="method-title" class="flex flex-col gap-3">
      <div class="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="method-title" class="text-ink text-xl font-semibold">Methodology</h2>
        <p class="text-ink-soft text-xs">Last reviewed {{ reviewed }}</p>
      </div>
      <BaseCard padding="lg">
        <MarkdownContent :source="research.methodology" />
      </BaseCard>
    </section>

    <section v-if="research.stages.length > 0" aria-labelledby="stages-title" class="flex flex-col gap-3">
      <h2 id="stages-title" class="text-ink text-xl font-semibold">Interview stages</h2>
      <BaseAccordion :items="stageItems" :heading-level="3" multiple>
        <template #default="{ item }">
          <div v-if="stageById.get(item.key)" class="flex flex-col gap-4 text-sm">
            <p class="text-ink-soft leading-relaxed">{{ stageById.get(item.key)?.description }}</p>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <h4 class="text-ink font-medium">What they evaluate</h4>
                <ul class="text-ink-soft mt-1.5 list-disc space-y-1 pl-5">
                  <li v-for="w in stageById.get(item.key)?.whatTheyEvaluate" :key="w">{{ w }}</li>
                </ul>
              </div>
              <div>
                <h4 class="text-ink font-medium">How to prepare</h4>
                <ul class="text-ink-soft mt-1.5 list-disc space-y-1 pl-5">
                  <li v-for="h in stageById.get(item.key)?.howToPrepare" :key="h">{{ h }}</li>
                </ul>
              </div>
            </div>
            <div class="flex flex-wrap gap-1.5" aria-label="Common at">
              <BaseBadge v-for="c in stageById.get(item.key)?.commonAt" :key="c" tone="neutral">{{ COMPANY_LABEL[c] }}</BaseBadge>
            </div>
          </div>
        </template>
      </BaseAccordion>
    </section>

    <section v-if="research.companies.length > 0" aria-labelledby="companies-title" class="flex flex-col gap-3">
      <h2 id="companies-title" class="text-ink text-xl font-semibold">Company types</h2>
      <ul class="grid grid-cols-1 gap-3 md:grid-cols-2">
        <li v-for="c in research.companies" :key="c.type">
          <BaseCard class="h-full">
            <h3 class="text-ink font-semibold">{{ c.label }}</h3>
            <p class="text-ink-soft mt-1 text-sm leading-relaxed">{{ c.summary }}</p>
            <h4 class="text-ink mt-3 text-xs font-medium tracking-wide uppercase">Typical loop</h4>
            <ol class="text-ink-soft mt-1 list-decimal space-y-0.5 pl-5 text-sm">
              <li v-for="step in c.typicalLoop" :key="step">{{ step }}</li>
            </ol>
            <h4 class="text-ink mt-3 text-xs font-medium tracking-wide uppercase">Emphasis</h4>
            <ul class="text-ink-soft mt-1 list-disc space-y-0.5 pl-5 text-sm">
              <li v-for="e in c.emphasis" :key="e">{{ e }}</li>
            </ul>
            <p v-if="c.notes" class="text-ink-soft mt-3 text-sm italic">{{ c.notes }}</p>
          </BaseCard>
        </li>
      </ul>
    </section>

    <section v-if="research.sources.length > 0" aria-labelledby="sources-title" class="flex flex-col gap-3">
      <h2 id="sources-title" class="text-ink text-xl font-semibold">Sources</h2>
      <BaseCard padding="none">
        <ul class="divide-hair divide-y">
          <li v-for="s in research.sources" :key="s.url" class="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:gap-3">
            <a
              :href="s.url"
              target="_blank"
              rel="noopener noreferrer"
              class="text-ink hover:text-primary focus-ring inline-flex min-w-0 flex-1 items-center gap-1.5 rounded font-medium"
            >
              <span class="min-w-0">{{ s.label }}</span>
              <ExternalLink class="size-3.5 shrink-0" aria-hidden="true" />
              <span class="sr-only">(opens in a new tab)</span>
            </a>
            <span v-if="s.note" class="text-ink-soft text-sm sm:max-w-[45%]">{{ s.note }}</span>
            <BaseBadge tone="neutral" class="self-start sm:self-auto">{{ SOURCE_KIND_LABEL[s.kind] }}</BaseBadge>
          </li>
        </ul>
      </BaseCard>
    </section>

    <section aria-labelledby="privacy-title">
      <BaseCard padding="lg">
        <div class="flex gap-3">
          <Lock class="text-positive mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <div>
            <h2 id="privacy-title" class="text-ink font-semibold">Privacy</h2>
            <p class="text-ink-soft mt-1 text-sm leading-relaxed">
              Interview OS has no backend of its own. Progress lives in this browser (IndexedDB). If you set a sync code,
              an end-to-end encrypted copy (AES-GCM, key derived from your code) is stored on textdb.dev — without the
              code it is unreadable. Exporting a JSON backup still works any time.
            </p>
          </div>
        </div>
      </BaseCard>
    </section>

    <section aria-labelledby="credits-title">
      <BaseCard padding="lg">
        <div class="flex gap-3">
          <Mail class="text-primary mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <div class="flex flex-col gap-1">
            <h2 id="credits-title" class="text-ink font-semibold">Credits &amp; contact</h2>
            <p class="text-ink-soft text-sm">Built by Ramazan.</p>
            <p class="text-ink-soft text-sm">
              Requests and questions:
              <span class="text-ink font-mono select-all">doganrmzn40 [ @ ] gmail [ . ] com</span>
            </p>
            <a
              href="https://github.com/ramazandogna"
              target="_blank"
              rel="noopener noreferrer"
              class="text-primary focus-ring inline-flex items-center gap-1 self-start rounded text-sm underline underline-offset-2"
            >
              github.com/ramazandogna
              <ExternalLink class="size-3.5" aria-hidden="true" />
              <span class="sr-only">(opens in a new tab)</span>
            </a>
          </div>
        </div>
      </BaseCard>
    </section>
  </div>
</template>
