# Interview OS — UX Specification

Owner: UX Engineer. Binding for `QuestionView`, `ReviewView`, `components/questions/**`, `components/content/**`.

## Experience principles
1. **Active recall first.** Every question is attempted before anything is revealed. Answers, hints and MCQ verdicts
   are always behind an explicit action. The UI never "helps" by showing the answer early.
2. **One honest signal.** After seeing the answer the learner self-grades (Again/Hard/Good/Easy). Ticking the key points
   they covered makes that grade honest; the scheduler does the rest.
3. **Calm and professional.** Neutral surfaces, role colors only for meaning (positive = correct, negative = wrong,
   warning = hints/pitfalls, primary = action/personal angle). No confetti, no streak guilt.
4. **Nothing lost.** Notes autosave; progress writes are optimistic; destructive actions confirm or offer undo.
5. **Keyboard-fast, touch-friendly.** Every action has a ≥ 44px target on mobile and a single-key shortcut on desktop.

## Information architecture
Dashboard → Roadmap → Track → Module → **Question** (`/q/:id`). Library/Notes/command search link straight to questions.
**Review** (`/review`) is a focused session mode reusing the same question components with `fresh` state.
Breadcrumb on a question: `Track › Module` (module links to `/tracks/:id#mod-:moduleId`).

## Question page anatomy (`/q/:questionId`)
Main column (in order):
1. **Prompt card** — meta badges (type, difficulty, priority, ~minutes), h1 title, prompt Markdown, code snippet, tags.
2. **Attempt** — MCQ: choice list + "Check answer". Others: **Think first** panel with optional countdown timer
   (`estMinutes`); disappears once the answer is revealed; "Time's up" nudge when it hits 0.
3. **Hints** — ladder (only if hints exist).
4. **Model answer** — hidden panel → answer, key-point checklist, pitfalls, follow-ups, personal angle, references.
5. **Self-grade** — appears only after reveal.
6. **Prev / Next** — curriculum order (`neighbours`).

Side panel (lg+: sticky right column 18.5–20rem; mobile: after the flow): status + bookmark + mastered/reset,
notes editor, shortcut legend (desktop only).

## Interaction specs
- **Progressive hints:** one at a time, "Show hint 2 of 3"; header shows "2 of 3". Highest index persisted via
  `progress.revealHint`; on the question page previously revealed hints stay visible. New hints are announced
  (`aria-live`) and scrolled into view; focus stays on the button so repeated presses work.
- **Answer reveal:** `Reveal answer` (Space). Persisted via `progress.revealAnswer`. Focus moves to the "Model answer"
  heading; a polite live region says "Answer revealed". On the question page an already-revealed answer stays open
  with **Hide & retry** (local only) for a fresh attempt. If `settings.hideAnswersByDefault === false` it starts open.
  Personal angle shows only when `settings.showPersonalAngle`.
- **Key-point checklist:** local checkboxes ("3 / 5 covered"), feeds the grade hint ("You ticked 3 of 5 key points").
- **MCQ:** radios when one choice is correct, checkboxes ("Select all that apply") otherwise. Native inputs in a
  `fieldset`/`legend`; the whole row is the label. Check → inputs lock; each choice shows Correct / Incorrect /
  "Correct — you missed this one" with icon + text (never color alone) and its explanation (`aria-describedby`).
  Summary feedback in a live region; "Try again" resets. Checking marks a `new` question `learning`.
- **Self-grading:** four buttons in a 2×2 (mobile) / 1×4 grid, keys 1–4, `aria-pressed` on the chosen one. Calls
  `progress.grade`; then "Saved. Next review tomorrow." (live). Re-grading is allowed.
- **Status rules:** visiting never changes status. Revealing a hint/answer (store `touch`), checking an MCQ or grading
  moves `new → learning` and sets `lastSeenAt`.
- **Notes:** `BaseTextarea`, plain text only (never Markdown/v-html). Debounced autosave 700 ms via `notes.save`;
  status line "Saving… / Saved at 14:02 / Note cleared / Couldn't save"; pending save flushed on question change
  and unmount. Empty body deletes the note (store contract).
- **Status bar:** StatusBadge, Bookmark toggle (`pressed`, toast), Mark mastered (toast with Undo), Reset
  (`BasePopconfirm`, keeps the note).

### Keyboard shortcuts (never fire while typing, with modifiers, or inside dialogs/menus)
| Key | Question page | Review |
| --- | --- | --- |
| `H` | next hint | next hint |
| `Space` / `Enter` | reveal answer (if hidden; ignored on a focused control) | same |
| `1`–`4` | grade (when visible) | grade |
| `N` / `P` | next / previous question | `N` / `Enter` → next card after grading |
| `B` | toggle bookmark | — |

## Review session flow (`/review`)
Sources: default = `progress.dueIds`; `?mode=new` = next N `new` questions (N = `settings.dailyGoal`);
`?mode=bookmarks`; `?track=<id>` = that track's not-mastered questions. The queue is **snapshotted** at start.
Header: "Practice session" eyebrow, title, Exit, `ProgressBar` (graded/total) + "3 / 12".
Card: track › module line → prompt (h2, receives focus on each new card) → MCQ (if any) → hints (fresh, hidden once
answer is open) → answer (fresh, always starts hidden) → self-grade → **Next question** (focused after grading) / Skip.
Summary: counts per grade + skipped, "Worth another look" list (Again/Hard) using `QuestionListItem`, actions:
Learn N new, Practice again / Check for more due, Back to dashboard.
Empty: per mode ("Nothing due right now" → Learn N new, Practice bookmarks, Open roadmap; "No bookmarks yet";
"Track mastered"; "Track not found").

## Responsive rules
- Mobile-first, works from **360px**. Cards use `p-4` below `sm`, `lg` padding above. No horizontal page scroll:
  code blocks and Markdown tables scroll inside themselves (focusable, named regions).
- `lg` (1024px): question page becomes two columns; shortcut hints (`BaseKbd`) only from `sm`/`lg`.
- Primary actions are full-width on mobile (Reveal answer) and inline on desktop.
- Review content is capped at `max-w-3xl` for reading comfort.

## Accessibility rules
- Visible focus everywhere (`focus-ring` / 2px primary outline); programmatic focus targets use `.focus-target`.
- One h1 per page (question title / session title); sections are labelled by their h2.
- Live regions exist before their text changes: hints list, answer status, MCQ verdict, grade result, notes status.
- Meaning is never color-only: icons + words for correct/wrong, grade names next to color accents.
- External links open in a new tab with an sr-only "(opens in a new tab)".
- Motion: reveal transitions are 180ms and disabled under `prefers-reduced-motion`.

## Empty / error states
Unknown question id → `EmptyState` "Question not found" + Library / Dashboard. Review empty states as above.
Notes save failure shows inline error and keeps the text. Store `error` alerts are rendered by the shell.

## rei-kit usage map
| Need | Component |
| --- | --- |
| Cards / sections | `BaseCard` |
| Buttons, router links | `BaseButton` (`as="router-link"`, `pressed` for toggles) |
| Badges | `BaseBadge` via common `TypeBadge` / `DifficultyBadge` / `PriorityBadge` / `StatusBadge` |
| Code | `CodeBlock` (wrapped by `CodeSnippet`, hljs HTML in the default slot, copy button) |
| Breadcrumb | `BaseBreadcrumb` (`rei-kit/web`) |
| Key-point checklist | `BaseCheckbox` |
| Notes | `BaseTextarea` + `useDebouncedCallback` |
| Shortcuts | `BaseKbd` |
| Confirm reset | `BasePopconfirm` |
| Feedback | `useToast` (bookmark, mastered + Undo, reset) |
| Session progress | `ProgressBar` |
| Empty states | `EmptyState` |
| MCQ | native radio/checkbox in `fieldset` (BaseRadioGroup cannot render Markdown labels + per-choice feedback) |

Markdown: `MarkdownContent` (trusted static content only) → `.prose-ios`; hljs theme in `app.css` uses role vars only.
