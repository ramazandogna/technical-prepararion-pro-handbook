/**
 * Content registry. Pure data + lookup helpers; no Vue, no persistence.
 * Owned by the Team Lead. Track files are owned by the curriculum authors.
 */
import type { Module, Question, Track, TrackId } from '@/types/content'
import tA from './tracks/interview-process'
import tB from './tracks/cs-fundamentals'
import tC from './tracks/javascript'
import tD from './tracks/typescript'
import tE from './tracks/frontend'
import tF from './tracks/react'
import tG from './tracks/vue'
import tH from './tracks/nextjs'
import tI from './tracks/backend'
import tJ from './tracks/databases'
import tK from './tracks/operating-systems'
import tL from './tracks/networking'
import tM from './tracks/computer-architecture'
import tN from './tracks/languages-compilers'
import tO from './tracks/system-design'
import tP from './tracks/devops'
import tQ from './tracks/security'
import tR from './tracks/testing'
import tS from './tracks/behavioral'
import tT from './tracks/japan-career'

export const tracks: readonly Track[] = [tA, tB, tC, tD, tE, tF, tG, tH, tI, tJ, tK, tL, tM, tN, tO, tP, tQ, tR, tS, tT]

export interface QuestionEntry {
  question: Question
  track: Track
  module: Module
}

const entries: QuestionEntry[] = []
const byId = new Map<string, QuestionEntry>()
for (const track of tracks) {
  for (const module of track.modules) {
    for (const question of module.questions) {
      const entry = { question, track, module }
      if (byId.has(question.id) && import.meta.env.DEV) {
        console.warn(`[content] duplicate question id: ${question.id}`)
      }
      entries.push(entry)
      byId.set(question.id, entry)
    }
  }
}

/** Every question, in curriculum order. */
export const allEntries: readonly QuestionEntry[] = entries

export const allQuestionIds: readonly string[] = entries.map((e) => e.question.id)

export function getEntry(questionId: string): QuestionEntry | undefined {
  return byId.get(questionId)
}

export function getTrack(trackId: string): Track | undefined {
  return tracks.find((t) => t.id === (trackId as TrackId))
}

export function trackQuestionIds(trackId: string): string[] {
  return entries.filter((e) => e.track.id === trackId).map((e) => e.question.id)
}

/** Previous / next question within the whole curriculum order. */
export function neighbours(questionId: string): { prev?: QuestionEntry; next?: QuestionEntry } {
  const i = entries.findIndex((e) => e.question.id === questionId)
  if (i === -1) return {}
  return { prev: entries[i - 1], next: entries[i + 1] }
}

export const allTags: readonly string[] = [...new Set(entries.flatMap((e) => e.question.tags))].sort()
