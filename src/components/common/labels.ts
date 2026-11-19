/**
 * Shared display labels and badge tones for content/progress enums.
 * Owned by the Frontend Architect; reused by question components so every
 * surface names things the same way.
 */
import type { Difficulty, Priority, QuestionType } from '@/types/content'
import type { ProgressStatus } from '@/types/progress'

export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger'

export interface Option<T extends string> {
  value: T
  label: string
}

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  foundation: 'Foundation',
  core: 'Core',
  advanced: 'Advanced',
}
export const DIFFICULTY_TONE: Record<Difficulty, BadgeTone> = {
  foundation: 'success',
  core: 'primary',
  advanced: 'warning',
}
export const DIFFICULTY_ORDER: Record<Difficulty, number> = { foundation: 0, core: 1, advanced: 2 }

export const PRIORITY_LABEL: Record<Priority, string> = {
  must: 'Must know',
  should: 'Should know',
  nice: 'Nice to have',
}
export const PRIORITY_TONE: Record<Priority, BadgeTone> = {
  must: 'danger',
  should: 'neutral',
  nice: 'neutral',
}

export const TYPE_LABEL: Record<QuestionType, string> = {
  concept: 'Concept',
  coding: 'Coding',
  output: 'Output',
  debugging: 'Debugging',
  'system-design': 'System design',
  tradeoff: 'Trade-off',
  'multiple-choice': 'Multiple choice',
  behavioral: 'Behavioral',
  'project-deep-dive': 'Project deep dive',
}

export const STATUS_LABEL: Record<ProgressStatus, string> = {
  new: 'New',
  learning: 'Learning',
  reviewing: 'Reviewing',
  mastered: 'Mastered',
}
export const STATUS_TONE: Record<ProgressStatus, BadgeTone> = {
  new: 'neutral',
  learning: 'warning',
  reviewing: 'primary',
  mastered: 'success',
}

function toOptions<T extends string>(labels: Record<T, string>): Option<T>[] {
  return (Object.keys(labels) as T[]).map((value) => ({ value, label: labels[value] }))
}

export const DIFFICULTY_OPTIONS = toOptions(DIFFICULTY_LABEL)
export const PRIORITY_OPTIONS = toOptions(PRIORITY_LABEL)
export const TYPE_OPTIONS = toOptions(TYPE_LABEL)
export const STATUS_OPTIONS = toOptions(STATUS_LABEL)
