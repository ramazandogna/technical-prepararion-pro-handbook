import type { Track } from '@/types/content'

const track: Track = {
  id: 'frontend',
  code: 'E',
  title: 'Frontend Engineering',
  summary: 'How the browser turns code into pixels, and how to build fast, accessible, maintainable UIs.',
  rationale:
    'Framework questions are only half of a frontend loop. The other half is the browser itself: rendering, events, storage, performance metrics and accessibility. Your accessibility platform, enterprise consent UIs and REI-KIT give you rare first-hand depth on several of these. This track helps you explain that depth in the vocabulary interviewers expect.',
  icon: 'LayoutTemplate',
  phase: 2,
  modules: [
    {
      id: 'fe-browser-rendering',
      title: 'The browser & rendering',
      summary: 'Browser architecture, the critical rendering path, reflow and repaint, and event propagation.',
      questions: [
        {
          id: 'fe-browser-architecture',
          title: 'How a modern browser is structured',
          type: 'concept',
          difficulty: 'core',
          priority: 'should',
          tags: ['browser-architecture', 'main-thread', 'compositor', 'site-isolation'],
          estMinutes: 5,
          roles: ['frontend', 'full-stack'],
          prompt: `**Describe the architecture of a modern browser such as Chrome.** Which processes and threads exist, and why does "keep the main thread free" matter so much?`,
          hints: [
            'Think about the browser process and renderer processes.',
            'Inside a renderer, which thread runs JavaScript, style and layout?',
            'Some animations can run without the main thread. Which ones?',
          ],
          answer: `**Chrome is multi-process.** A **browser process** handles the UI, navigation and permissions; a **GPU process** handles drawing; **network and storage services** run separately; and each site gets its own sandboxed **renderer process** (with *site isolation*, different sites run in different processes, for security against attacks like Spectre and for stability).

**Inside a renderer process:**
- The **main thread** runs JavaScript, style calculation, layout, paint recording and most event handling. **Only one of these can happen at a time.**
- The **compositor thread** (with raster workers) takes painted layers, rasterises tiles and composites the frame. It can scroll and run \`transform\` and \`opacity\` animations **without the main thread**.
- **Web Workers** have their own threads and event loops, with no DOM access, and communicate through \`postMessage\`.

**Why "keep the main thread free":** a frame has about **16.7 ms** at 60 Hz. If a JavaScript task takes 200 ms, the browser cannot respond to input, run layout or paint during that time, so clicks feel sluggish (a poor **INP**) and animations that depend on the main thread stutter. Tasks over 50 ms count as **long tasks**.

**Practical consequences:**
- Split long work into chunks and yield between them (\`scheduler.yield()\` where it is supported, or \`setTimeout\`), or move it to a Worker.
- Animate \`transform\` and \`opacity\`, which the compositor can handle, rather than \`top\`, \`left\` or \`width\`.
- Third-party scripts share your main thread, which is why script budgets and loading strategy matter for embedded widgets.`,
          keyPoints: [
            'Multi-process: browser, GPU, network and per-site renderers',
            'Site isolation for security',
            'The main thread does JavaScript, style, layout and paint',
            'The compositor handles scrolling, transform and opacity',
            'Long tasks block input and rendering',
          ],
          pitfalls: ['"JavaScript runs on its own thread separate from rendering"'],
          followUps: ['When would you use a Web Worker, and what are its limits?'],
          personalAngle:
            'Consent and accessibility widgets run inside the customer\'s page and share its main thread. Talk about how you kept their scripts small and lazy so they did not hurt the host page\'s responsiveness.',
          references: [{ label: 'Chrome for Developers: Inside look at modern web browser', url: 'https://developer.chrome.com/blog/inside-browser-part1' }],
        },
        {
          id: 'fe-critical-rendering-path',
          title: 'The critical rendering path',
          type: 'concept',
          difficulty: 'core',
          priority: 'must',
          tags: ['critical-rendering-path', 'dom', 'cssom', 'layout', 'paint', 'composite', 'render-blocking'],
          estMinutes: 6,
          roles: ['frontend', 'full-stack'],
          prompt: `**What happens between receiving the HTML and the first pixels on screen?** Which resources block rendering, and how do \`async\`, \`defer\` and \`type="module"\` change things?`,
          hints: [
            'There are two trees, then they combine.',
            'CSS blocks rendering; synchronous scripts block parsing.',
            'Layout → paint → composite.',
          ],
          answer: `**The steps of the critical rendering path:**
1. **Parse HTML into the DOM.** The parser is incremental, and a *preload scanner* looks ahead to fetch resources early.
2. **Parse CSS into the CSSOM.** **CSS is render-blocking**: the browser will not paint until the CSSOM for the stylesheets in \`<head>\` is ready, which avoids a flash of unstyled content.
3. **Style:** compute styles by combining DOM and CSSOM into a *render tree* (only visible nodes; \`display: none\` is excluded).
4. **Layout (reflow):** calculate the geometry (size and position) of each box.
5. **Paint:** record draw operations (text, colours, borders, shadows) into layers.
6. **Composite:** rasterise the layers and assemble them on the GPU into the final frame.

**Scripts:**
| | Blocks HTML parsing? | Runs | Order kept |
| --- | --- | --- | --- |
| \`<script>\` | **yes** (fetch and run) | immediately | yes |
| \`async\` | no (fetched in parallel) | as soon as it has downloaded | no |
| \`defer\` | no | after parsing, before \`DOMContentLoaded\` | yes |
| \`type="module"\` | no (deferred by default) | after parsing | yes |

A classic synchronous script also has to wait for any pending CSS, because it might read styles.

**Optimising the path:**
- Inline **critical CSS** and load the rest without blocking. Keep CSS small and remove what is unused.
- Use \`defer\` or modules for application code, and \`async\` for independent third-party scripts.
- \`<link rel="preload">\` for the LCP image or key fonts, \`fetchpriority="high"\` on the hero image, and \`preconnect\` for important origins.
- Use \`font-display: swap\` or \`optional\` to avoid invisible text.
- **SSR or prerendering** sends meaningful HTML, so first paint does not wait for JavaScript.`,
          keyPoints: [
            'DOM + CSSOM → style → layout → paint → composite',
            'CSS blocks rendering; synchronous scripts block parsing',
            'async vs defer vs module scripts',
            'Preload, critical CSS, fetchpriority',
            'SSR or prerendering for earlier meaningful paint',
          ],
          pitfalls: ['Saying async preserves order', 'Forgetting that CSS blocks rendering'],
          followUps: ['How would you find what is delaying LCP on a page?'],
          personalAngle:
            'Kakehashi is prerendered. Explain what that changes on this path: meaningful HTML at first paint, followed by hydration.',
          references: [{ label: 'web.dev: Critical rendering path', url: 'https://web.dev/articles/critical-rendering-path' }],
        },
        {
          id: 'fe-layout-thrashing',
          title: 'Debug: reflow, repaint and layout thrashing',
          type: 'debugging',
          difficulty: 'advanced',
          priority: 'must',
          tags: ['reflow', 'repaint', 'layout-thrashing', 'performance', 'animation'],
          estMinutes: 8,
          roles: ['frontend', 'full-stack'],
          prompt: `This runs on a list of 500 cards and freezes the page for about a second. **Why is it slow, and how do you fix it?** Also explain the difference between reflow and repaint.`,
          code: {
            language: 'javascript',
            source: `const cards = document.querySelectorAll('.card')
cards.forEach((card) => {
  const height = card.offsetHeight // read
  card.style.height = height * 1.5 + 'px' // write
})`,
          },
          hints: [
            'Reading offsetHeight needs up-to-date layout.',
            'The write in each iteration invalidates the layout for the next read.',
            'Separate the reads from the writes.',
          ],
          answer: `**This is layout thrashing, also called *forced synchronous layout*.** Each \`style.height\` write invalidates the layout, and the next iteration's \`offsetHeight\` read forces the browser to recalculate it **immediately**, 500 times, instead of once before the next frame.

**Fix: batch all the reads, then all the writes.**
\`\`\`js
const cards = [...document.querySelectorAll('.card')]
const heights = cards.map((c) => c.offsetHeight) // one layout
requestAnimationFrame(() => {
  cards.forEach((c, i) => {
    c.style.height = heights[i] * 1.5 + 'px' // writes only; layout runs once before paint
  })
})
\`\`\`
Better still, avoid JavaScript measurement entirely when CSS can express the result (\`grid\`, \`aspect-ratio\`, a \`scale\` transform).

**Reflow vs repaint vs composite:**
- **Reflow (layout):** geometry changes (\`width\`, \`height\`, \`top\`, font size, adding nodes) mean the browser recalculates positions, often for many elements. This is the most expensive step.
- **Repaint:** visual-only changes (\`color\`, \`background\`, \`box-shadow\`) mean pixels are redrawn without layout.
- **Composite only:** \`transform\` and \`opacity\` on an element with its own layer can be handled by the compositor without layout or paint. This is the cheapest kind of change, and the one to use for animation.

**Properties that force layout when read** after a write include \`offsetTop/Left/Width/Height\`, \`clientWidth\`, \`scrollTop\`, \`getBoundingClientRect()\` and \`getComputedStyle()\`.

**Tools:** the DevTools **Performance** panel shows purple "Layout" blocks with a *forced reflow* warning and the line of JavaScript responsible. You can also use \`ResizeObserver\` to react to size changes without polling, and \`content-visibility: auto\` to skip rendering work for off-screen cards.`,
          keyPoints: [
            'Interleaved reads and writes force synchronous layout',
            'Batch reads, then writes (rAF)',
            'Reflow > repaint > composite in cost',
            'Animate transform and opacity',
            'Use the Performance panel to find forced reflow',
          ],
          pitfalls: ['Adding will-change everywhere, which wastes memory on layers'],
          followUps: ['How would you animate an accordion opening smoothly?'],
          references: [{ label: 'web.dev: Avoid large, complex layouts and layout thrashing', url: 'https://web.dev/articles/avoid-large-complex-layouts-and-layout-thrashing' }],
        },
        {
          id: 'fe-event-propagation-delegation',
          title: 'Event propagation and delegation',
          type: 'output',
          difficulty: 'foundation',
          priority: 'must',
          tags: ['events', 'bubbling', 'capturing', 'event-delegation', 'dom'],
          estMinutes: 4,
          roles: ['frontend', 'full-stack'],
          prompt: `Given \`<div id="outer"><button id="btn">Click</button></div>\`, **what is logged when the button is clicked?** Then explain event delegation and when you would use it.`,
          code: {
            language: 'javascript',
            source: `const log = (m) => console.log(m)
outer.addEventListener('click', () => log('outer bubble'))
outer.addEventListener('click', () => log('outer capture'), { capture: true })
btn.addEventListener('click', () => log('btn'))
document.addEventListener('click', () => log('document'))`,
          },
          hints: [
            'There are three phases: capture (top-down), target, then bubble (bottom-up).',
            'Registration order does not matter across phases.',
          ],
          answer: `\`\`\`text
outer capture
btn
outer bubble
document
\`\`\`

**Propagation:** an event travels **down** from \`window\` to the target (the **capture** phase), fires on the **target**, then travels back **up** (the **bubble** phase). Listeners added with \`{ capture: true }\` run on the way down, and the default ones run on the way up. Registration order only matters *within* the same element and phase.

- \`event.target\` is the element that was actually clicked (possibly a nested \`<span>\`). \`event.currentTarget\` is the element whose listener is running.
- \`stopPropagation()\` stops the event from travelling further; \`stopImmediatePropagation()\` also skips the remaining listeners on the same element; \`preventDefault()\` cancels the browser's default action (submitting a form, following a link). The last one is unrelated to propagation.
- Some events do not bubble (\`focus\`, \`blur\`, \`mouseenter\`). Use \`focusin\` and \`focusout\` for delegation.

**Event delegation:** attach **one listener to a common ancestor** and use \`target.closest()\` to find the item:
\`\`\`js
list.addEventListener('click', (e) => {
  const item = e.target.closest('[data-id]')
  if (!item || !list.contains(item)) return
  select(item.dataset.id)
})
\`\`\`
**Why:** fewer listeners for large or dynamic lists, it works automatically for items added later, and there is no cleanup per item. React attaches its listeners at the root container for the same reason, and Vue's \`@click\` on list items is usually fine without it.

**Caution:** calling \`stopPropagation\` in a component breaks delegation and analytics higher up, so use it sparingly.`,
          keyPoints: [
            'Capture, then target, then bubble',
            'target vs currentTarget',
            'stopPropagation vs preventDefault',
            'Delegation with closest() for dynamic lists',
            'Non-bubbling events and focusin/focusout',
          ],
          pitfalls: ['Assuming registration order decides the order across phases', 'Confusing preventDefault with stopPropagation'],
        },
      ],
    },
    {
      id: 'fe-html-css-a11y',
      title: 'HTML, CSS, accessibility & storage',
      summary: 'Semantic HTML, accessibility, layout and responsiveness, and choosing browser storage.',
      questions: [
        {
          id: 'fe-semantic-html-a11y',
          title: 'Semantic HTML and accessibility fundamentals',
          type: 'concept',
          difficulty: 'core',
          priority: 'must',
          tags: ['accessibility', 'semantic-html', 'aria', 'wcag', 'keyboard'],
          estMinutes: 5,
          roles: ['frontend', 'full-stack'],
          prompt: `**Why does semantic HTML matter, and how do you make a custom component accessible?** When should you use ARIA, and when should you avoid it?`,
          hints: [
            'Assistive technology reads the accessibility tree, which is built from semantics.',
            'The first rule of ARIA.',
            'Name, role, value, keyboard support and focus.',
          ],
          answer: `**Semantic elements give you behaviour and meaning for free:** roles, accessible names, keyboard support and focus handling, which assistive technologies read through the **accessibility tree**. A \`<button>\` is focusable, activates with Enter and Space, and is announced as "button". A \`<div onclick>\` has none of that.

**Semantics to use by default:** landmarks (\`<header>\`, \`<nav>\`, \`<main>\`, \`<footer>\`), a sensible heading hierarchy (\`h1\` to \`h6\` without skipping levels), \`<button>\` for actions and \`<a href>\` for navigation, \`<label for>\` for inputs, \`<fieldset>\` and \`<legend>\` for groups, lists and tables for lists and tables, and \`alt\` text on images (\`alt=""\` for decorative ones).

**The first rule of ARIA:** *do not use ARIA if a native element or attribute does the job.* ARIA changes only what is **announced**, not how the element **behaves**. A \`role="button"\` div still needs \`tabindex="0"\`, Enter and Space handlers and focus styles. Incorrect ARIA is worse than none.

**When a custom widget is unavoidable** (combobox, tabs, menu, tree), follow the **WAI-ARIA Authoring Practices** pattern:
- **Name, role, value:** e.g. \`role="tab"\`, \`aria-selected\`, \`aria-controls\`, and an accessible name.
- **Keyboard:** the expected keys (arrow keys within tabs, Escape to close), and a *roving tabindex* or \`aria-activedescendant\`.
- **Focus:** a visible focus indicator (\`:focus-visible\`), focus moved into dialogs and returned afterwards.
- **State changes announced:** live regions (\`aria-live="polite"\`) for asynchronous updates such as "3 results".

**Beyond markup:** colour contrast (WCAG AA is 4.5:1 for body text), not relying on colour alone, \`prefers-reduced-motion\`, zoom to 200% without loss, and touch targets of a reasonable size. Test with a keyboard only, a screen reader (VoiceOver, NVDA) and automated tools (axe, Lighthouse). Automated tools catch only a portion of the issues.`,
          keyPoints: [
            'Native semantics give roles, names, keyboard and focus support',
            'First rule of ARIA: prefer native elements',
            'ARIA changes semantics, not behaviour',
            'Name/role/value, keyboard and focus management',
            'Contrast and reduced motion; test with real assistive technology',
          ],
          pitfalls: ['Adding role="button" without keyboard support', 'Relying only on automated audits'],
          followUps: ['How would you make a toast notification accessible?'],
          personalAngle:
            'This is your home ground. You were lead backend on an accessibility platform, and REI-KIT is WCAG-checked. Give one concrete example of a WCAG issue the platform detected or fixed, and how REI-KIT enforces contrast.',
          references: [
            { label: 'WAI-ARIA Authoring Practices Guide', url: 'https://www.w3.org/WAI/ARIA/apg/' },
            { label: 'MDN: Accessibility', url: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility' },
          ],
        },
        {
          id: 'fe-accessible-dialog-review',
          title: 'Review: fix an inaccessible confirm dialog',
          type: 'debugging',
          difficulty: 'advanced',
          priority: 'should',
          tags: ['accessibility', 'dialog', 'focus-management', 'forms', 'code-review'],
          estMinutes: 10,
          roles: ['frontend', 'full-stack'],
          prompt: `**Review this "delete project" modal for accessibility.** List the problems, then describe the fixed version.`,
          code: {
            language: 'html',
            source: `<div class="overlay" onclick="closeModal()">
  <div class="modal">
    <div class="title">Delete project?</div>
    <img src="warning.svg">
    <input placeholder="Type the project name">
    <div class="btn danger" onclick="confirmDelete()">Delete</div>
    <span class="x" onclick="closeModal()">×</span>
  </div>
</div>`,
          },
          hints: [
            'Can a keyboard user reach and activate everything?',
            'What does a screen reader announce when the modal opens?',
            'Where does focus go, and can it escape behind the modal?',
          ],
          answer: `**Problems:**
1. **No dialog semantics:** there is no \`role="dialog"\`, no \`aria-modal\` and no accessible name, so screen readers do not know a dialog opened.
2. **The "buttons" are \`div\` and \`span\` elements:** they are not focusable, cannot be activated with the keyboard and have no role. The "×" has no accessible name (it is read as "times" or nothing).
3. **The input has no label:** a placeholder is not a label, it disappears while typing, and it often has low contrast.
4. **The image has no \`alt\`:** screen readers may read the file name. It is decorative here, so it should have \`alt=""\`.
5. **No focus management:** focus is not moved into the modal, Tab can reach the page behind it, there is no Escape handling, and focus is not returned to the trigger on close.
6. **Clicking the overlay closes the modal**, and clicks inside \`.modal\` bubble up to the overlay, so clicking the input closes the dialog.

**Fixed version:** use the native \`<dialog>\` element. \`showModal()\` provides top-layer rendering, makes the rest of the page **inert**, handles **Escape**, and moves focus into the dialog.
\`\`\`html
<dialog id="delete-dialog" aria-labelledby="del-title" aria-describedby="del-desc">
  <h2 id="del-title">Delete project?</h2>
  <p id="del-desc"><img src="warning.svg" alt=""> This cannot be undone.</p>
  <label for="confirm-name">Type the project name to confirm</label>
  <input id="confirm-name" autocomplete="off">
  <button type="button" class="danger" onclick="confirmDelete()">Delete project</button>
  <button type="button" aria-label="Close" onclick="closeDialog()">×</button>
</dialog>
\`\`\`
\`\`\`js
const trigger = document.activeElement
dialog.showModal()
dialog.addEventListener('close', () => trigger?.focus(), { once: true }) // return focus
\`\`\`

**Other improvements:** disable "Delete" until the name matches, and announce the reason with \`aria-describedby\`; give the destructive button a clear label ("Delete project", not "OK"); make sure the danger colour has sufficient contrast and is not the only cue; and close on a backdrop click only when \`event.target === dialog\`.`,
          keyPoints: [
            'Dialog role, name and aria-modal (or native dialog)',
            'Real buttons with accessible names',
            'Labels, not placeholders',
            'Focus moved in, kept in, returned on close, Escape to close',
            'Decorative images get alt=""',
          ],
          pitfalls: ['Fixing semantics but forgetting focus return', 'Using aria-hidden on the page without making it inert'],
          personalAngle:
            'Consent dialogs are exactly this pattern, often with legal pressure to be accessible. Mention how your enterprise consent UIs handled focus and keyboard access while embedded in customer pages.',
          references: [{ label: 'MDN: <dialog>', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog' }],
        },
        {
          id: 'fe-css-layout-responsive',
          title: 'Modern CSS layout and responsive design',
          type: 'tradeoff',
          difficulty: 'core',
          priority: 'should',
          tags: ['css', 'flexbox', 'grid', 'container-queries', 'responsive', 'cascade'],
          estMinutes: 5,
          roles: ['frontend', 'full-stack'],
          prompt: `**Flexbox or Grid: how do you decide?** How do you build responsive components in 2026: media queries, container queries or fluid units? And how do you keep the CSS cascade under control in a component library?`,
          hints: [
            'One dimension or two?',
            'A component does not know the viewport; it knows its container.',
            'Cascade layers and specificity.',
          ],
          answer: `**Flexbox for one-dimensional flow** (a row or column of items whose sizes come from their content: toolbars, button groups, centring). **Grid for two-dimensional layout** (rows *and* columns aligned together: page shells, card galleries, forms). They combine well: a Grid page containing Flex components.

\`\`\`css
.gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr)); gap: 1rem; }
.toolbar { display: flex; align-items: center; gap: .5rem; }
\`\`\`

**Responsive strategy:**
- **Mobile-first media queries** for *page-level* layout changes (sidebar ↔ tab bar).
- **Container queries** for *components*. A card adapts to the width of its container, not the viewport, so it works in a sidebar and in a main column:
\`\`\`css
.card-wrap { container-type: inline-size; }
@container (min-width: 30rem) { .card { grid-template-columns: 8rem 1fr; } }
\`\`\`
- **Fluid values** (\`clamp(1rem, 0.9rem + 0.5vw, 1.25rem)\`), \`min()\` and \`max()\` and intrinsic sizing reduce the number of breakpoints.
- Use \`rem\` for type and spacing so text scales with user settings; use \`dvh\` or \`svh\` for mobile viewport height.

**Keeping the cascade under control in a component library:**
- **Cascade layers** (\`@layer reset, tokens, components, utilities;\`) make precedence explicit regardless of specificity, so consumers can override library styles predictably.
- Keep specificity low and flat (single classes, \`:where()\` for zero-specificity defaults).
- **Design tokens as CSS custom properties** (\`--color-primary\`) for theming. They inherit and can be overridden per subtree.
- Utility frameworks (Tailwind, UnoCSS) avoid the cascade by keeping styles local. Scoped styles (Vue \`scoped\`, CSS Modules) avoid leaking styles, and Shadow DOM gives full isolation at the cost of harder theming.`,
          keyPoints: [
            'Flex for one dimension, Grid for two',
            'Container queries for component-level responsiveness',
            'clamp() and fluid units reduce breakpoints',
            'Cascade layers and low specificity',
            'Custom properties for theming',
          ],
          pitfalls: ['Viewport media queries inside reusable components', 'Fighting specificity with !important'],
          personalAngle:
            'REI-KIT has 4 materials and 10 palettes. That is a design-token and cascade-management story you can tell: how themes are switched, and how consumers override styles.',
          references: [{ label: 'MDN: CSS container queries', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries' }],
        },
        {
          id: 'fe-web-storage',
          title: 'Choosing browser storage',
          type: 'multiple-choice',
          difficulty: 'foundation',
          priority: 'should',
          tags: ['web-storage', 'localstorage', 'cookies', 'indexeddb', 'security'],
          estMinutes: 3,
          roles: ['frontend', 'full-stack'],
          prompt: `Where should a web app keep a **session authentication token** so that it is **not readable by injected JavaScript (XSS)**?`,
          choices: [
            {
              id: 'a',
              text: '`localStorage`',
              correct: false,
              explanation: 'Any script on the origin, including an XSS payload, can read localStorage.',
            },
            {
              id: 'b',
              text: 'An `HttpOnly; Secure; SameSite` cookie set by the server',
              correct: true,
              explanation: 'HttpOnly cookies cannot be read by JavaScript and are sent with requests automatically. SameSite (plus CSRF tokens where needed) addresses CSRF.',
            },
            {
              id: 'c',
              text: '`sessionStorage`',
              correct: false,
              explanation: 'It is scoped to the tab, but scripts on the page can still read it.',
            },
            {
              id: 'd',
              text: 'IndexedDB, encrypted with a key stored in the code',
              correct: false,
              explanation: 'A key shipped with the code is readable by any script, so this protects nothing.',
            },
          ],
          hints: ['Which storage is invisible to document.cookie and scripts?'],
          answer: `**Use an \`HttpOnly\`, \`Secure\`, \`SameSite=Lax\` (or \`Strict\`) cookie.** JavaScript cannot read it, so an XSS payload cannot steal the token, although XSS can still *make requests* as the user. That is why preventing XSS still matters.

**Overview of browser storage:**
| | Capacity | Lifetime | Readable by JavaScript | Sent with requests | API |
| --- | --- | --- | --- | --- | --- |
| Cookies | ~4 KB each | set by Expires/Max-Age | unless \`HttpOnly\` | **yes**, automatically | header / \`document.cookie\` |
| \`localStorage\` | ~5 MB per origin | until cleared | yes | no | synchronous strings |
| \`sessionStorage\` | ~5 MB | the tab's session | yes | no | synchronous strings |
| IndexedDB | large (a share of disk) | until cleared or evicted | yes | no | asynchronous, structured, indexed |
| Cache Storage | large | until cleared | yes | no | Request/Response pairs (service workers) |

**Choosing:**
- **Auth sessions:** HttpOnly cookies, with CSRF protection through \`SameSite\` and tokens for state-changing cross-site cases.
- **Small preferences** (theme, the last open tab): \`localStorage\`. Remember that it is synchronous and blocks the main thread, so keep it small.
- **App data and offline use:** IndexedDB, through a wrapper such as \`idb\`. It is asynchronous, can store structured objects and blobs, and supports indexes and transactions.
- Call \`navigator.storage.persist()\` to ask the browser not to evict the data. Safari can evict script-created storage after a period without user interaction.

Every option except HttpOnly cookies is readable by any script on the origin, including third-party scripts. Never store secrets there.`,
          keyPoints: [
            'HttpOnly cookies are not readable by JavaScript',
            'Cookies are sent automatically, so CSRF must be considered',
            'localStorage is synchronous, small and string-only',
            'IndexedDB for structured or offline data',
            'Eviction and persistence',
          ],
          pitfalls: ['Storing JWTs in localStorage "because it is easy"'],
        },
      ],
    },
    {
      id: 'fe-architecture-performance',
      title: 'Architecture, state, performance & debugging',
      summary: 'Core Web Vitals, state management choices, embeddable component architecture and systematic debugging.',
      questions: [
        {
          id: 'fe-core-web-vitals',
          title: 'Core Web Vitals: measure and improve',
          type: 'concept',
          difficulty: 'core',
          priority: 'must',
          tags: ['core-web-vitals', 'lcp', 'inp', 'cls', 'performance'],
          estMinutes: 6,
          roles: ['frontend', 'full-stack'],
          prompt: `**What are the Core Web Vitals, what are good values, and what would you do to improve each one?**`,
          hints: [
            'Loading, responsiveness and visual stability.',
            'INP replaced FID in 2024.',
            'Field data (real users) vs lab data (Lighthouse).',
          ],
          answer: `There are three metrics, each judged at the **75th percentile of real-user visits**:

| Metric | Measures | Good |
| --- | --- | --- |
| **LCP**, Largest Contentful Paint | loading: when the main content appears | ≤ 2.5 s |
| **INP**, Interaction to Next Paint | responsiveness: the delay from an interaction to the next frame (it replaced FID in March 2024) | ≤ 200 ms |
| **CLS**, Cumulative Layout Shift | visual stability: unexpected layout movement | ≤ 0.1 |

**Improving LCP:** find the LCP element (often the hero image or a heading), then reduce each part of the timeline:
- **TTFB:** CDN, caching, SSR or SSG instead of rendering on the client.
- **Resource load delay:** make the LCP image discoverable in the HTML (not a CSS background or loaded by JavaScript), add \`fetchpriority="high"\`, and do not lazy-load it.
- **Load time:** modern formats (AVIF or WebP), responsive \`srcset\`, compression.
- **Render delay:** less render-blocking CSS and JavaScript, critical CSS, and fonts that do not hide text.

**Improving INP:** break up **long tasks** on the main thread; keep event handlers small and defer non-urgent work (\`requestIdleCallback\`, or \`setTimeout\` after showing feedback); reduce hydration cost; virtualise large lists; avoid layout thrashing; and use React transitions or Vue's fine-grained updates.

**Improving CLS:** set \`width\` and \`height\` (or \`aspect-ratio\`) on images and embeds; reserve space for ads, banners and asynchronous content; use \`font-display\` together with metric-matched fallback fonts; and animate with \`transform\` rather than properties that trigger layout.

**Measuring:** **field data** comes from CrUX and the \`web-vitals\` library sending real-user metrics to analytics. **Lab data** (Lighthouse and the DevTools Performance panel) is reproducible, which makes it good for debugging, but it does not reflect real devices and networks. Google Search uses the field data.`,
          keyPoints: [
            'LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 at p75',
            'INP replaced FID',
            'LCP: discoverability, priority, TTFB, render-blocking resources',
            'INP: long tasks and hydration cost',
            'CLS: reserve space',
            'Field vs lab data',
          ],
          pitfalls: ['Quoting FID as current', 'Optimising only the Lighthouse score without field data'],
          followUps: ['A cookie banner causes CLS on every page. How do you fix it?'],
          personalAngle:
            'Consent banners are a well-known source of CLS and slow LCP. If your consent UIs reserved space or rendered as overlays to avoid layout shifts, that is a strong, specific story. Your content and SEO background also means you have seen the business side of Core Web Vitals.',
          references: [{ label: 'web.dev: Web Vitals', url: 'https://web.dev/articles/vitals' }],
        },
        {
          id: 'fe-state-management',
          title: 'Where should this state live?',
          type: 'tradeoff',
          difficulty: 'core',
          priority: 'must',
          tags: ['state-management', 'server-state', 'url-state', 'global-state', 'architecture'],
          estMinutes: 6,
          roles: ['frontend', 'full-stack'],
          prompt: `In a product dashboard you have: the current user, a list of orders from the API, table filters, a modal's open state and an unsaved form. **Where does each piece of state belong, and when do you actually need a global store?**`,
          hints: [
            'Not all state is the same kind: server state, UI state, URL state, form state.',
            'Server state is really a cache.',
            'Can the user share or bookmark it?',
          ],
          answer: `**Classify the state first, then place it as close to where it is used as possible.** Most "global state" problems are really *server cache* problems.

| State | Kind | Where |
| --- | --- | --- |
| Orders from the API | **server state** (a cache of remote data) | a query cache: TanStack Query, Pinia Colada, SWR, or framework loaders |
| Table filters, sort and page | **URL state** | query parameters, so the view is shareable, bookmarkable and survives a reload |
| Modal open | **local UI state** | the component (\`ref\` or \`useState\`) |
| Unsaved form | **form state** | local, or a form library; optionally a draft in \`localStorage\` |
| Current user and session | **global client state** | a small store or context (Pinia, Zustand, Context) |

**Why server state is different:** it has a source of truth elsewhere, so it needs caching, deduplication, background refetching, invalidation after mutations, and loading and error states. Copying it into a global store by hand means reimplementing all of that badly (stale data, duplicate requests).

**When a global store is justified:** state that is truly shared across distant parts of the tree and **owned by the client**: authentication or session, the user's preferences, a shopping cart, a multi-step workflow, or cross-cutting UI such as toasts. Keep it small and normalised, and expose actions rather than raw mutations.

**Rules of thumb:**
- Lift state only as high as the nearest common parent; reach for context or provide/inject before a global store.
- **Derive instead of storing:** a filtered list is \`computed\` or \`useMemo\` from the list and the filters, not a second copy.
- A single source of truth for each fact.`,
          keyPoints: [
            'Classify: server, URL, local UI, form and global client state',
            'Server state belongs in a query cache',
            'Filters in the URL',
            'Global stores only for shared, client-owned state',
            'Derive rather than duplicate',
          ],
          pitfalls: ['Putting everything in Redux or Pinia', 'Copying fetched data into a store with no invalidation'],
          followUps: ['How would you handle optimistic updates for an order status change?'],
        },
        {
          id: 'fe-embeddable-widget-design',
          title: 'Design an embeddable third-party widget',
          type: 'system-design',
          difficulty: 'advanced',
          priority: 'should',
          tags: ['component-architecture', 'third-party-scripts', 'shadow-dom', 'performance', 'frontend-system-design'],
          estMinutes: 35,
          roles: ['frontend', 'full-stack'],
          companyTypes: ['startup', 'mid-size', 'japan-international'],
          prompt: `**Design a widget, such as a consent banner or an accessibility toolbar, that thousands of customer websites embed with one \`<script>\` tag.** Cover loading, isolation, configuration, compatibility with SSR and SPA sites, performance and accessibility.`,
          hints: [
            'You do not control the host page: its CSS, its frameworks, or its Content Security Policy.',
            'Think in layers: a tiny loader, the main bundle, configuration from a CDN.',
            'How do you avoid breaking SPA navigation and hydration?',
          ],
          answer: `**Requirements to clarify first:** what the widget does (UI only, or does it also block other scripts, as consent tools must?), expected traffic, configuration per customer, required browsers, and legal or accessibility requirements (WCAG AA).

**Architecture:**
1. **A tiny loader** (a few KB, \`async\`, served from a CDN under a versioned URL). It reads \`data-site-id\` from its own script tag, fetches the **site configuration** (JSON from the CDN with a short TTL and a stale-while-revalidate cache), and lazy-loads the main bundle only when it is needed.
2. **The main bundle:** built with a small framework (Preact, Vue's runtime, or plain DOM), with no reliance on globals from the host page. Shared dependencies are bundled, never taken from \`window\`.
3. **Isolation:** render inside a **Shadow DOM** root, so host CSS cannot break the widget and widget CSS cannot leak out. Theming goes through CSS custom properties, which do cross the shadow boundary. Use an iframe only when stronger isolation is required (for example, payment fields), because it complicates sizing and accessibility.
4. **A public API:** \`window.Widget.on('consent', cb)\`, \`open()\` and similar, plus \`CustomEvent\`s and a queue for calls made before the script has loaded (\`window.Widget = window.Widget || []\`).

**Compatibility with SSR and SPA hosts:**
- Never modify DOM that the host framework owns; mount into your own container appended to \`<body>\`. Otherwise the host's **hydration fails** because its DOM no longer matches.
- Survive client-side navigation: watch \`popstate\` and history changes, and remount if the host replaces \`<body>\`.
- Be idempotent if the script is injected twice.
- Respect the host's CSP by documenting the required \`script-src\` and \`connect-src\`, and by avoiding \`eval\` and inline styles where possible (styles inside the shadow root are fine).

**Performance:** load \`async\` and never block rendering; avoid layout shift (render as an overlay or reserve space); keep work off the critical path; keep a strict size budget; and use a long-cached, versioned main bundle with a short-cached loader for fast rollouts.

**Accessibility:** the dialog pattern (focus management, Escape, labelled buttons), sufficient contrast with any customer theme (validate the customer's colours), and \`prefers-reduced-motion\`.

**Operations:** staged rollouts per site, error reporting from inside the widget tagged with the site id, a kill switch in the configuration, and backwards compatibility for the public API.`,
          keyPoints: [
            'A tiny async loader, configuration from a CDN, a lazy main bundle',
            'Shadow DOM isolation; theming through custom properties',
            'Do not touch host-owned DOM (hydration)',
            'Handle SPA navigation and double injection',
            'No CLS, a size budget, versioned caching, a kill switch',
            'Accessible dialog behaviour',
          ],
          pitfalls: ['Relying on host globals such as jQuery or React', 'Injecting global CSS', 'Blocking rendering with a synchronous script'],
          followUps: ['How would a consent tool block analytics scripts until consent is given?', 'How do you roll out a breaking change?'],
          personalAngle:
            'This is close to your real work: enterprise consent UIs and an accessibility platform embedded on customer sites, plus the SSR/SPA compatibility issues you solved. Present it as "here is how I did it, and what I would change". That is much stronger than a hypothetical design.',
        },
        {
          id: 'fe-debugging-devtools',
          title: 'Debugging a frontend issue systematically',
          type: 'concept',
          difficulty: 'core',
          priority: 'nice',
          tags: ['debugging', 'devtools', 'production', 'observability'],
          estMinutes: 5,
          roles: ['frontend', 'full-stack'],
          prompt: `A customer reports: "**The checkout button sometimes does nothing on our site.**" You cannot reproduce it locally. **Walk me through how you debug it.**`,
          hints: [
            '"Sometimes" suggests timing, the environment, or particular data.',
            'Get evidence from production before guessing.',
            'Which DevTools panels would you use once you can reproduce it?',
          ],
          answer: `**Gather evidence → reproduce → isolate → fix → prevent a recurrence.**

**1. Gather evidence first.**
- Ask for the browser and version, device, extensions, a URL, a timestamp, the steps and a screen recording.
- Check **error monitoring** (such as Sentry) for errors on that page around that time, along with release versions and breadcrumbs.
- Check whether it started with a deployment: compare the release time with when the reports began.

**2. Reproduce by varying conditions,** since "sometimes" usually means timing or environment:
- Network throttling (Slow 4G) and CPU throttling (4× to 6×): this often reveals **race conditions**, such as clicking before hydration has finished or before the handler is attached.
- A fresh profile, incognito mode, an ad blocker, a different locale, a logged-out session, a cold cache.
- Clicking quickly twice, or before the page has finished loading.

**3. Isolate with DevTools:**
- **Console:** errors, and *Pause on exceptions* (including caught ones).
- **Elements → Event Listeners:** is the click handler attached? Is an invisible overlay intercepting the click (inspect the element at that point, or check \`pointer-events\`)?
- **Sources:** event-listener breakpoints for \`click\`, conditional breakpoints and logpoints.
- **Network:** a failing or hanging request? Preserve the log across navigations.
- **Performance:** a long task blocking input, as seen on the main-thread track.

**4. Fix the root cause, not the symptom.** For example: disable the button until the app has hydrated, show loading feedback, make the handler idempotent, and stop the third-party overlay from intercepting clicks.

**5. Prevent a recurrence:** a regression test (Playwright with throttling), error tracking with useful context, and a postmortem if customers were affected.

**Common root causes:** clicks before hydration in SSR apps, a third-party overlay (consent or chat) covering the button, unhandled promise rejections, browser-specific APIs, and CSP blocking a script.`,
          keyPoints: [
            'Evidence before guessing: monitoring, versions, environment',
            'Reproduce with throttling and different environments',
            'Use DevTools listeners, breakpoints, network and performance',
            'Fix the root cause and add a regression test',
            'Typical causes: hydration timing, overlays, CSP',
          ],
          pitfalls: ['Changing code before you can reproduce the issue', 'Treating "works on my machine" as an answer'],
          personalAngle:
            'Enterprise integration issues are exactly this kind of problem: your script on their SSR or SPA site behaving differently. Pick one real incident and walk through it with this structure.',
        },
      ],
    },
  ],
}

export default track
