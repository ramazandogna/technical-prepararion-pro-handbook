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
          intent:
            'Tests whether you understand the process and thread model well enough to reason about responsiveness and security. A strong answer names the processes and site isolation, explains what the main thread vs compositor do, and turns that into concrete practices (yielding, workers, compositor-only animation).',
          hints: [
            'Why does one crashed tab not take down the whole browser? Think about which processes exist.',
            'Inside one renderer process, which single thread runs JavaScript, style, layout and most event handlers?',
            'Some work can continue while that thread is busy: scrolling and certain animations. Which thread does it, and which CSS properties qualify?',
            'Shape: browser + GPU + network/storage + per-site sandboxed renderers (site isolation, Spectre) → main thread vs compositor vs workers → 16.7 ms frame budget, long tasks > 50 ms hurt INP → yield (`scheduler.yield()`), Workers, animate `transform`/`opacity`.',
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
          intent:
            'Tests whether you can describe the pipeline from bytes to pixels and use it to explain what blocks first paint. A strong answer lists the stages in order, distinguishes render-blocking CSS from parser-blocking scripts, compares async/defer/module precisely, and ends with concrete optimisations.',
          hints: [
            'The browser builds two trees from two kinds of resource. Which ones, and how are they combined?',
            'After the styles are known, three more stages produce pixels. Which one computes geometry, which records drawing, which assembles layers on the GPU?',
            'CSS and classic scripts block different things. Which one blocks rendering, and which one blocks HTML parsing? How do `async` and `defer` differ in timing and order?',
            'Shape: DOM + CSSOM → style/render tree → layout → paint → composite; CSS render-blocking, `<script>` parser-blocking; async = run on download (no order), defer/module = after parse (in order); fixes: critical CSS, defer, preload/fetchpriority for LCP, font-display, SSR/prerender.',
          ],
          walkthrough: [
            {
              title: 'Walk the pipeline',
              body: `1. HTML → **DOM** (incremental; the preload scanner fetches ahead).
2. CSS → **CSSOM**.
3. **Style**: combine into the render tree (visible nodes only).
4. **Layout**: geometry of every box.
5. **Paint**: record draw operations into layers.
6. **Composite**: rasterise and assemble layers on the GPU.`,
            },
            {
              title: 'What blocks what',
              body: `- **CSS is render-blocking**: no paint until the CSSOM for \`<head>\` stylesheets exists (prevents FOUC).
- **Classic \`<script>\` is parser-blocking**: parsing stops to fetch and run it, and it also waits for pending CSS because it may read styles.`,
            },
            {
              title: 'Compare script loading',
              body: `| | Blocks parsing | Runs | Order |
| --- | --- | --- | --- |
| \`<script>\` | yes | immediately | yes |
| \`async\` | no | when downloaded | no |
| \`defer\` | no | after parse, before DOMContentLoaded | yes |
| \`type="module"\` | no | deferred by default | yes |`,
            },
            {
              title: 'Optimise the path',
              body: `- Inline critical CSS, load the rest non-blocking, drop unused CSS.
- \`defer\`/modules for app code, \`async\` for independent third parties.
- \`<link rel="preload">\` + \`fetchpriority="high"\` for the LCP image; \`preconnect\` to key origins.
- \`font-display: swap\`/\`optional\`.
- SSR/prerender so first paint does not wait for JS.`,
            },
            {
              title: 'Say it in 30 seconds',
              body: `"HTML becomes the DOM and CSS the CSSOM; they combine into the render tree, then layout computes geometry, paint records drawing and the compositor assembles layers. CSS blocks rendering and classic scripts block parsing. async runs as soon as it downloads with no ordering; defer and modules run in order after parsing. To speed it up: critical CSS, deferred scripts, preload and fetchpriority for the LCP image, and server-rendered HTML."`,
            },
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
          intent:
            'Tests whether you can recognise forced synchronous layout from code and fix it by batching, and whether you know the relative cost of layout, paint and composite. A strong answer explains why each iteration forces layout, shows the read-then-write fix, and names the DevTools evidence.',
          hints: [
            'To return `offsetHeight`, what must the browser make sure is up to date first?',
            'After `card.style.height = ...`, the layout is dirty. What does the next iteration\'s read then force the browser to do, and how many times does that happen?',
            'If all 500 reads happened before any write, how many layouts would be needed?',
            'Fix: `const heights = cards.map(c => c.offsetHeight)` then `requestAnimationFrame(() => cards.forEach((c, i) => c.style.height = heights[i] * 1.5 + "px"))`. Cost order: layout > paint > composite-only (`transform`, `opacity`).',
          ],
          walkthrough: [
            {
              title: 'Name the problem',
              body: `This is **layout thrashing** (forced synchronous layout). Normally the browser batches layout once per frame; interleaving geometry reads with style writes forces it to lay out **on demand**, here 500 times.`,
            },
            {
              title: 'Explain the mechanism',
              body: `Iteration 1: read (layout is clean) → write (layout dirty). Iteration 2: read \`offsetHeight\` → the browser must recompute layout **now** to answer → write (dirty again)… Each forced layout may touch the whole list, so the cost is roughly O(n²).`,
            },
            {
              title: 'Batch reads, then writes',
              body: `\`\`\`js
const cards = [...document.querySelectorAll('.card')]
const heights = cards.map((c) => c.offsetHeight) // one layout
requestAnimationFrame(() => {
  cards.forEach((c, i) => { c.style.height = heights[i] * 1.5 + 'px' }) // one layout before paint
})
\`\`\`
Better: let CSS do it (\`grid\`, \`aspect-ratio\`, a \`scale\` transform) so no JS measurement is needed.`,
            },
            {
              title: 'Reflow vs repaint vs composite',
              body: `- **Reflow/layout**: geometry changes (width, height, fonts, DOM insertions): most expensive.
- **Repaint**: visual-only (color, background, shadow).
- **Composite**: \`transform\`/\`opacity\` on its own layer: cheapest; use for animation.
Layout-forcing reads: \`offset*\`, \`client*\`, \`scrollTop\`, \`getBoundingClientRect()\`, \`getComputedStyle()\`. Evidence: purple Layout blocks with a "Forced reflow" warning in the Performance panel. Also \`content-visibility: auto\` for off-screen cards.`,
            },
            {
              title: 'Say it in 30 seconds',
              body: `"Each write dirties layout and the next offsetHeight read forces the browser to recompute it synchronously, 500 times. I'd read all heights first, then write them in one requestAnimationFrame, so layout runs once, or avoid measuring with CSS. Layout is the most expensive step, paint is cheaper, and transform or opacity changes only need compositing. The Performance panel flags this as forced reflow."`,
            },
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
          intent:
            'Tests whether you know the three propagation phases precisely and can apply them to event delegation. A strong answer gives the exact log order, explains why registration order does not decide it, distinguishes target/currentTarget and stopPropagation/preventDefault, and writes a delegation handler with closest().',
          hints: [
            'An event travels in three phases. In which direction does each one go?',
            'The capture listener on `outer` was registered after the bubble listener. Does registration order matter across phases, or only within the same element and phase?',
            'Order the four listeners by phase: what fires on the way down, at the target, and on the way up to `document`?',
            'Answer: `outer capture`, `btn`, `outer bubble`, `document`. Delegation: one listener on the list, `e.target.closest("[data-id]")`, check `list.contains(item)`.',
          ],
          walkthrough: [
            {
              title: 'Recall the phases',
              body: `**Capture** (window → target's parent), **target**, then **bubble** (target's parent → window). \`{ capture: true }\` listeners run on the way down; default listeners run on the way up.`,
            },
            {
              title: 'Order the listeners',
              body: `\`\`\`text
outer capture   <- capture phase, on the way down
btn             <- target
outer bubble    <- bubbling up
document        <- bubbling further up
\`\`\`
Registration order only matters for listeners on the same element in the same phase.`,
            },
            {
              title: 'Use it: event delegation',
              body: `\`\`\`js
list.addEventListener('click', (e) => {
  const item = e.target.closest('[data-id]')
  if (!item || !list.contains(item)) return
  select(item.dataset.id)
})
\`\`\`
One listener for any number of items, works for items added later, no per-item cleanup.`,
            },
            {
              title: 'Edge cases',
              body: `- \`target\` (clicked element, maybe a nested span) vs \`currentTarget\` (element running the listener).
- \`stopPropagation\` stops travel; \`stopImmediatePropagation\` also skips remaining listeners on that element; \`preventDefault\` cancels the default action and is unrelated to propagation.
- \`focus\`/\`blur\`/\`mouseenter\` do not bubble; delegate with \`focusin\`/\`focusout\`.
- Over-using \`stopPropagation\` breaks delegation and analytics above you.`,
            },
            {
              title: 'Say it in 30 seconds',
              body: `"It logs outer capture, btn, outer bubble, document: capture runs top-down first, then the target, then bubbling bottom-up, and registration order only matters within one phase. Delegation puts one listener on a parent and uses closest to find the item, which handles dynamic lists cheaply. I'd use focusin for focus events and avoid stopPropagation because it breaks delegation higher up."`,
            },
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
          intent:
            'Tests whether you understand accessibility as semantics plus behaviour, not as adding ARIA attributes. A strong answer explains the accessibility tree, states the first rule of ARIA and why ARIA does not add behaviour, lists name/role/value + keyboard + focus requirements for custom widgets, and describes realistic testing.',
          hints: [
            'A screen reader does not read your pixels. What structure does it read, and where does that structure come from?',
            'Compare `<button>` and `<div onclick>`: list everything the native element gives you for free.',
            'If you add `role="button"` to a div, what does it gain and what is still missing? That is the first rule of ARIA.',
            'Shape: native semantics (landmarks, headings, button vs link, labels, alt) → first rule of ARIA, ARIA changes announcement not behaviour → custom widget = APG pattern: name/role/value, keyboard, focus, live regions → contrast, reduced motion, zoom → test with keyboard, screen reader and axe.',
          ],
          walkthrough: [
            {
              title: 'Start from the accessibility tree',
              body: `Assistive tech reads the **accessibility tree**, built from HTML semantics: each node has a **role**, an accessible **name**, a **state/value**. Native elements populate it correctly and add behaviour: \`<button>\` is focusable, works with Enter and Space, and is announced as a button. \`<div onclick>\` has none of it.`,
            },
            {
              title: 'Default to native semantics',
              body: `Landmarks (\`header\`, \`nav\`, \`main\`, \`footer\`), a heading hierarchy, \`<button>\` for actions and \`<a href>\` for navigation, \`<label for>\`, \`<fieldset>\`/\`<legend>\`, real lists and tables, \`alt\` text (\`alt=""\` for decorative images).`,
            },
            {
              title: 'Use ARIA only when needed',
              body: `**First rule of ARIA:** do not use it if a native element does the job. ARIA changes what is **announced**, not what the element **does**:
\`\`\`html
<!-- still needs tabindex, Enter/Space handlers, focus styles -->
<div role="button" tabindex="0">Save</div>
\`\`\`
For custom widgets (combobox, tabs, menu), follow the **WAI-ARIA APG** pattern: name/role/value, expected keys, roving tabindex or \`aria-activedescendant\`, visible \`:focus-visible\`, focus moved into and back from dialogs, \`aria-live\` for async updates.`,
            },
            {
              title: 'Beyond markup and testing',
              body: `Contrast (AA 4.5:1 body text), not colour alone, \`prefers-reduced-motion\`, 200% zoom and reflow, target size. Test keyboard-only, with VoiceOver/NVDA, and with axe/Lighthouse, knowing automated tools catch only a portion of issues.`,
            },
            {
              title: 'Say it in 30 seconds',
              body: `"Semantic HTML builds the accessibility tree, so native elements give roles, names, keyboard support and focus for free. The first rule of ARIA is not to use it when a native element works, because ARIA only changes what's announced, not behaviour. For custom widgets I follow the APG pattern: name, role, value, keyboard and focus management, plus live regions. And I test with a keyboard and a real screen reader, not just axe."`,
            },
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
          intent:
            'Tests whether you can audit real markup systematically for semantics, keyboard access, naming and focus management. A strong answer lists the concrete problems, rewrites it with a native dialog and real buttons and labels, and covers focus return, Escape, inertness and the bubbling overlay-click bug.',
          hints: [
            'Try it keyboard-only: can you Tab to "Delete" and the "×", and activate them with Enter or Space?',
            'When this opens, what does a screen reader announce? Does it know a dialog appeared, and what are the input, image and close control called?',
            'Where is focus after opening, can Tab reach the page behind, does Escape work, and where does focus go on close? Also: what happens when you click the input, given the overlay listener?',
            'Fix shape: `<dialog aria-labelledby aria-describedby>` + `showModal()` (inert background, Escape, initial focus), `<h2>`, `<label for>`, `alt=""`, two `<button type="button">` with "Delete project" and `aria-label="Close"`, focus returned to the trigger on `close`, backdrop close only when `e.target === dialog`.',
          ],
          walkthrough: [
            {
              title: 'Audit in passes',
              body: `Go through four lenses: **semantics** (what is it?), **keyboard** (can I operate it?), **naming** (what is it called?), **focus** (where am I?). Each lens finds different bugs.`,
            },
            {
              title: 'List the problems',
              body: `1. No \`role="dialog"\`/\`aria-modal\`/name: nothing announces the dialog.
2. \`div\`/\`span\` "buttons": not focusable, no role, no keyboard; "×" has no name.
3. Placeholder instead of a label.
4. Image without \`alt\`.
5. No focus move, no trap, no Escape, no focus return.
6. Clicks inside \`.modal\` bubble to the overlay and close it.`,
            },
            {
              title: 'Rewrite with native elements',
              body: `\`\`\`html
<dialog id="delete-dialog" aria-labelledby="del-title" aria-describedby="del-desc">
  <h2 id="del-title">Delete project?</h2>
  <p id="del-desc"><img src="warning.svg" alt=""> This cannot be undone.</p>
  <label for="confirm-name">Type the project name to confirm</label>
  <input id="confirm-name" autocomplete="off">
  <button type="button" class="danger">Delete project</button>
  <button type="button" aria-label="Close">×</button>
</dialog>
\`\`\`
\`\`\`js
const trigger = document.activeElement
dialog.showModal() // top layer, inert page, Escape, initial focus
dialog.addEventListener('close', () => trigger?.focus(), { once: true })
dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close() })
\`\`\``,
            },
            {
              title: 'Polish and edge cases',
              body: `- Disable "Delete" until the name matches and explain why via \`aria-describedby\`.
- Danger colour with sufficient contrast, not the only cue.
- If you cannot use \`<dialog>\`, you need \`inert\` on the background, a focus trap and manual Escape handling; \`aria-hidden\` alone is not enough.`,
            },
            {
              title: 'Say it in 30 seconds',
              body: `"It has no dialog semantics, fake div buttons that keyboards can't reach, an unlabelled input, an image without alt, no focus management, and clicks inside bubble up and close it. I'd use a native dialog with showModal, which makes the page inert and handles Escape, add a heading as its label, real buttons with clear names, a proper label, and return focus to the trigger on close."`,
            },
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
          intent:
            'Tests whether your CSS approach is current and principled: picking layout primitives by dimensionality, making components responsive to their container, and controlling the cascade in shared code. A strong answer gives a short rule with code, uses container queries and fluid units, and explains cascade layers and tokens.',
          hints: [
            'Are you laying out items along one axis, or aligning rows and columns together?',
            'A card is reused in a sidebar and in the main column. Does the viewport width tell it how much space it has?',
            'In a component library, how do consumers override styles without a specificity war or `!important`?',
            'Shape: Flex = 1D, Grid = 2D (combine); media queries for page layout, `container-type: inline-size` + `@container` for components, `clamp()` for fluid type; `@layer reset, tokens, components, utilities`, `:where()` for zero specificity, custom properties for themes.',
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
          intent:
            'Tests whether you know which browser storage is readable by scripts and the security trade-off that follows. A strong answer chooses the HttpOnly cookie, explains that XSS can still act as the user, mentions CSRF mitigation, and knows when the other stores are appropriate.',
          hints: [
            'An XSS payload runs as JavaScript on your origin. Which of these stores can JavaScript on the origin read?',
            'Is there a cookie attribute that hides a cookie from `document.cookie` entirely?',
            'Cookies are sent automatically with requests. What new risk does that create, and which attribute mitigates it?',
            'Answer: b. `HttpOnly; Secure; SameSite=Lax` cookie set by the server. XSS can still make requests as the user, so prevent XSS too; use CSRF tokens for state-changing cross-site cases.',
          ],
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
          intent:
            'Tests whether your performance knowledge matches how Google and real teams measure it today. A strong answer names LCP, INP and CLS with thresholds at p75, breaks each into causes with concrete fixes, and distinguishes field from lab data.',
          hints: [
            'The three metrics cover loading, responsiveness and visual stability. Which metric covers each, and which one replaced FID in 2024?',
            'What are the "good" thresholds, and at which percentile of real users are they judged?',
            'For LCP, think of the timeline: TTFB, resource load delay, load time, render delay. For INP: what blocks the main thread after a click? For CLS: what appears without reserved space?',
            'Shape: LCP ≤ 2.5 s / INP ≤ 200 ms / CLS ≤ 0.1 at p75 → LCP: discoverable hero + `fetchpriority="high"` + no lazy-load + SSR/CDN; INP: break long tasks, yield, less hydration; CLS: dimensions/aspect-ratio, reserved slots, font metrics → field (CrUX, web-vitals) vs lab (Lighthouse).',
          ],
          walkthrough: [
            {
              title: 'Define the three metrics',
              body: `| Metric | Measures | Good (p75) |
| --- | --- | --- |
| LCP | when the main content appears | ≤ 2.5 s |
| INP | interaction → next paint, worst-ish of the visit | ≤ 200 ms |
| CLS | unexpected layout movement | ≤ 0.1 |
INP replaced FID in March 2024.`,
            },
            {
              title: 'Fix LCP by sub-part',
              body: `- **TTFB:** CDN, caching, SSR/SSG.
- **Load delay:** LCP image in the HTML (not CSS background or JS), \`fetchpriority="high"\`, never \`loading="lazy"\`.
- **Load time:** AVIF/WebP, \`srcset\`, compression.
- **Render delay:** less render-blocking CSS/JS, fonts that don't hide text.`,
            },
            {
              title: 'Fix INP and CLS',
              body: `**INP:** break long tasks and yield (\`scheduler.yield()\`), show feedback first then defer work, reduce hydration cost, virtualise lists, avoid layout thrashing, transitions in React.
**CLS:** \`width\`/\`height\` or \`aspect-ratio\` on media, reserve space for banners/ads, metric-matched fallback fonts, animate \`transform\`.`,
            },
            {
              title: 'Measure the right data',
              body: `**Field** (CrUX, \`web-vitals\` library → analytics, with attribution builds) is what Google uses and what users feel. **Lab** (Lighthouse, Performance panel) is reproducible and good for debugging. Optimising the Lighthouse score alone can miss real-user INP problems entirely.`,
            },
            {
              title: 'Say it in 30 seconds',
              body: `"LCP for loading, under 2.5 seconds; INP for responsiveness, under 200 milliseconds, which replaced FID; CLS for stability, under 0.1, all at the 75th percentile of real users. I fix LCP by making the hero discoverable and prioritised and cutting TTFB, INP by breaking up long tasks and hydration, and CLS by reserving space. I measure with field data and debug with lab tools."`,
            },
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
          intent:
            'Tests whether you classify state by ownership and lifetime before choosing a tool, and recognise server state as a cache. A strong answer places each item correctly with a reason, explains why server data does not belong in a hand-rolled global store, and states when a global store is justified.',
          hints: [
            'Not all state is the same kind. Which of these pieces has its source of truth on the server, which in the URL, which only in one component?',
            'The orders list is really a copy of data that lives elsewhere. What does a copy need (freshness, deduplication, invalidation) that plain state does not provide?',
            'Should a colleague be able to open your exact filtered view from a link? Where must the filters live for that?',
            'Answer shape: orders → query cache (TanStack Query / Pinia Colada / loaders); filters → URL params; modal → local; form → local or form library (+ draft); user/session → small global store. Global stores only for shared, client-owned state; derive instead of copying.',
          ],
          walkthrough: [
            {
              title: 'Classify before choosing',
              body: `Five kinds of state: **server** (remote source of truth), **URL** (shareable view), **local UI**, **form**, **global client**. The kind decides the home; the library comes second.`,
            },
            {
              title: 'Place each piece',
              body: `| State | Kind | Home |
| --- | --- | --- |
| Orders | server | query cache (TanStack Query, Pinia Colada, SWR, loaders) |
| Filters/sort/page | URL | query params |
| Modal open | local UI | component state |
| Unsaved form | form | local / form library, optional draft in storage |
| Current user | global client | small store or context |`,
            },
            {
              title: 'Explain why server state differs',
              body: `It needs caching, dedup, background refetch, invalidation after mutations, and loading/error states. Copying it into Redux or Pinia by hand reimplements all of that, usually with stale data and duplicate requests.`,
            },
            {
              title: 'When a global store is justified',
              body: `Shared across distant parts of the tree **and** owned by the client: session, preferences, cart, multi-step workflow, toasts. Keep it small, expose actions. Otherwise lift state only to the nearest common parent, use context/provide-inject, and **derive** filtered lists instead of storing them.`,
            },
            {
              title: 'Say it in 30 seconds',
              body: `"I classify first. Orders are server state, so they go in a query cache that handles freshness and invalidation. Filters go in the URL so the view is shareable. The modal and the form are local. Only the current user is global client state, in a small store. I reach for a global store only for state that's shared widely and owned by the client, and I derive rather than duplicate."`,
            },
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
          intent:
            'Tests frontend system design under a hostile environment: a host page you do not control. A strong answer clarifies requirements, proposes a layered loading architecture, isolation, a public API, SSR/SPA compatibility, performance budgets, accessibility and operational safety (rollouts, kill switch).',
          hints: [
            'List what you do not control on the host page: its CSS, its JavaScript globals and frameworks, its CSP, its DOM and hydration. Each is a design constraint.',
            'Think in layers: what is the smallest thing the customer embeds, where does per-site configuration come from, and when does the heavy UI load?',
            'How do you keep host CSS out of your widget (and yours out of theirs), and how do you avoid breaking the host framework\'s hydration or SPA navigation?',
            'Shape: requirements → tiny async loader (`data-site-id`) → CDN config with SWR + lazy main bundle → Shadow DOM + CSS custom properties → `window.Widget` API with a pre-load queue → own container on `<body>`, history listeners, idempotent init → no CLS, size budget, versioned caching → accessible dialog → staged rollout, error reporting, kill switch.',
          ],
          walkthrough: [
            {
              title: 'Clarify requirements and constraints',
              body: `Ask: UI only, or must it also block other scripts (consent)? Traffic, per-customer configuration, browser support, WCAG AA. Then list constraints: unknown host CSS, frameworks, CSP, and a DOM the host framework owns and hydrates.`,
            },
            {
              title: 'Layer the loading',
              body: `1. **Loader** (a few KB, \`async\`, versioned CDN URL): reads \`data-site-id\`, fetches site config (short TTL, stale-while-revalidate), lazy-loads the main bundle only when needed.
2. **Main bundle**: Preact, Vue runtime or plain DOM, all dependencies bundled, no host globals.
3. **Public API**:
\`\`\`js
window.Widget = window.Widget || []          // queue calls made before load
Widget.push(['on', 'consent', (c) => { /* ... */ }])
\`\`\``,
            },
            {
              title: 'Isolate and stay compatible',
              body: `- Render inside **Shadow DOM**; theme via CSS custom properties (they cross the boundary). iframe only when strong isolation is required.
- Mount into **your own container** on \`<body>\`; never mutate host-owned DOM, or its hydration fails.
- Survive SPA navigation (history/popstate), remount if \`<body>\` is replaced, idempotent init if injected twice.
- Document CSP needs (\`script-src\`, \`connect-src\`); no \`eval\`.`,
            },
            {
              title: 'Performance, accessibility, operations',
              body: `- Never render-blocking; overlay or reserved space for zero CLS; strict size budget; long-cached versioned bundle, short-cached loader.
- Dialog pattern: focus in/out, Escape, labelled buttons; validate customer theme contrast; reduced motion.
- Staged rollouts per site, error reporting tagged with site id, a **kill switch** in config, backwards-compatible API.`,
            },
            {
              title: 'Say it in 30 seconds',
              body: `"A tiny async loader reads the site id, fetches cached config from a CDN and lazy-loads the main bundle. The UI renders in a Shadow DOM inside its own body container, so host CSS can't break it and I never touch DOM the host hydrates. It handles SPA navigation and double injection, has a queued public API, causes no layout shift, is an accessible dialog, and ships with staged rollouts and a kill switch."`,
            },
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
          intent:
            'Tests whether you debug with a method (evidence, reproduce, isolate, fix, prevent) rather than guessing. A strong answer uses production evidence first, varies timing and environment to reproduce, names specific DevTools techniques, and lists the realistic root causes for a dead button.',
          hints: [
            'What does "sometimes" usually point to: timing, environment, or specific data? What evidence can you collect before touching code?',
            'Which production sources (error monitoring, release timeline, user details) narrow it down without reproducing locally?',
            'To reproduce timing bugs, what can you throttle? Then, which DevTools views show whether a listener is attached or an invisible element is intercepting the click?',
            'Shape: evidence (browser, extensions, Sentry, deploy timeline) → reproduce (CPU/network throttling, click before hydration, ad blocker, cold cache) → isolate (Event Listeners, element at point, listener breakpoints, Network, Performance) → fix root cause → Playwright regression test.',
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
        {
          id: 'fe-inp-debugging',
          title: 'Debug: a poor INP on a filter interaction',
          type: 'debugging',
          difficulty: 'advanced',
          priority: 'must',
          tags: ['inp', 'core-web-vitals', 'long-tasks', 'scheduler-yield', 'performance', 'loaf'],
          estMinutes: 12,
          roles: ['frontend', 'full-stack'],
          prompt: `Field data shows a **p75 INP of 650 ms** on a product listing page, and attribution points at clicks on the category filter chips. Here is the handler. **How do you confirm the cause, and how do you bring INP under 200 ms?**`,
          code: {
            language: 'javascript',
            source: `chips.addEventListener('click', (e) => {
  const category = e.target.closest('[data-cat]').dataset.cat
  chips.querySelectorAll('.chip').forEach((c) => c.classList.toggle('active', c.dataset.cat === category))

  const visible = allProducts.filter((p) => matches(p, category)) // 20,000 items, regex matching
  grid.innerHTML = visible.map(renderCard).join('')                // thousands of cards

  grid.querySelectorAll('.card').forEach((card) => {
    card.style.minHeight = card.offsetHeight + 'px'                // read + write per card
  })

  analytics.track('filter', { category, count: visible.length })  // sync, JSON-serialises state
  localStorage.setItem('lastFilter', JSON.stringify({ category, visible }))
})`,
          },
          intent:
            'Tests whether you understand what INP measures (input delay + processing + presentation delay) and can fix a slow interaction by giving fast visual feedback and moving or splitting the rest of the work. A strong answer uses field attribution and a lab trace to confirm, identifies each expensive step in the handler, and applies yielding, deferral, rendering reduction and layout fixes.',
          hints: [
            'INP is the time from the click to the next frame being painted. Which three phases make it up, and which one would this handler inflate?',
            'Go line by line: which steps must happen before the user sees feedback, and which could happen after the next paint?',
            'There is a hidden layout-thrashing loop, a huge `innerHTML`, synchronous analytics and a big synchronous `localStorage` write. Which of these can be removed, deferred, or done off the main thread?',
            'Fix shape: toggle the active chip first → `await scheduler.yield()` (fallback `setTimeout(0)`) → filter (memoised index or a Worker) → render only the first page or a virtualised window → drop the per-card min-height loop (CSS) → `requestIdleCallback` for analytics and a small `localStorage` value.',
          ],
          answer: `**INP = input delay + processing time + presentation delay** for the slowest interactions (roughly the worst one per page visit, at p75). This handler does all of its work synchronously before the browser can paint, so the user waits for every step.

**Confirm first:**
- **Field attribution:** \`onINP(report, { reportAllChanges: true })\` from \`web-vitals/attribution\` gives the target, the phase breakdown and Long Animation Frame (LoAF) script attribution. Here processing time will dominate.
- **Lab trace:** DevTools Performance panel with **4× CPU throttling**, click a chip, and inspect the interaction track: one long task with a big "Recalculate style / Layout" block and repeated **forced reflow** warnings.

**Costs in the handler:**
1. Filtering 20,000 items with regexes on every click.
2. \`innerHTML\` with thousands of cards: parse, style, layout for all of them.
3. **Layout thrashing:** read \`offsetHeight\`, write \`minHeight\`, per card.
4. Synchronous analytics serialisation and a large \`localStorage\` write (synchronous, blocks the main thread).

**Fix: give feedback first, then yield, then do less work.**
\`\`\`js
const yieldToMain = () =>
  globalThis.scheduler?.yield ? scheduler.yield() : new Promise((r) => setTimeout(r, 0))

chips.addEventListener('click', async (e) => {
  const chip = e.target.closest('[data-cat]')
  if (!chip) return
  const category = chip.dataset.cat
  for (const c of chips.querySelectorAll('.chip')) c.setAttribute('aria-pressed', String(c === chip))

  await yieldToMain() // the browser can paint the pressed chip now

  const visible = productsByCategory.get(category) ?? [] // precomputed index instead of regex scans
  renderPage(grid, visible.slice(0, 48))                // first page; virtualise or paginate the rest
  liveRegion.textContent = \`\${visible.length} products\`

  requestIdleCallback(() => {
    analytics.track('filter', { category, count: visible.length })
    localStorage.setItem('lastFilter', category)          // store the small key, not the results
  })
})
\`\`\`
- Remove the measure-and-set loop; reserve card height with CSS (\`aspect-ratio\`, a fixed grid row size), or \`content-visibility: auto\` with \`contain-intrinsic-size\` for off-screen cards.
- If filtering is still heavy, move it to a **Web Worker** and render when it returns; abort stale results if the user clicks again.
- In a framework: \`startTransition\`/\`useDeferredValue\` (React) or keeping the chip state separate from the list render so the urgent update is small.
- Also check **input delay**: other long tasks (third-party scripts, hydration) running when the click happens.

**Verify:** compare the lab trace (no task over 50 ms before the first paint), then watch field p75 INP over the following days.`,
          keyPoints: [
            'INP = input delay + processing + presentation delay, at p75',
            'Confirm with web-vitals attribution / LoAF and a throttled Performance trace',
            'Visual feedback first, then yield (scheduler.yield with fallback)',
            'Render less: precomputed index, pagination or virtualisation, no innerHTML of thousands',
            'Remove layout thrashing; defer analytics and storage to idle time',
          ],
          pitfalls: [
            'Debouncing the click, which delays feedback and makes INP worse',
            'Optimising only with an unthrottled desktop trace',
            'Moving everything into a single setTimeout, which still blocks the next interaction',
          ],
          followUps: [
            'How does hydration affect INP on an SSR page?',
            'When is a Web Worker worth the serialisation cost?',
          ],
          walkthrough: [
            {
              title: 'Understand what INP measures',
              body: `From the input to the **next paint**: **input delay** (main thread busy when the click lands) + **processing** (your handlers) + **presentation delay** (style, layout, paint of the result). A synchronous handler that does everything blocks the paint until it finishes.`,
            },
            {
              title: 'Confirm with data',
              body: `\`\`\`js
import { onINP } from 'web-vitals/attribution'
onINP((m) => send({ value: m.value, target: m.attribution.interactionTarget,
  input: m.attribution.inputDelay, processing: m.attribution.processingDuration,
  presentation: m.attribution.presentationDelay }))
\`\`\`
Then a lab trace with 4× CPU throttling: look for one long task with forced reflows.`,
            },
            {
              title: 'Feedback first, then yield',
              body: `\`\`\`js
setPressed(chip)
await (globalThis.scheduler?.yield?.() ?? new Promise((r) => setTimeout(r, 0)))
renderPage(grid, (index.get(category) ?? []).slice(0, 48))
requestIdleCallback(() => { analytics.track(/*...*/); localStorage.setItem('lastFilter', category) })
\`\`\`
The pressed chip paints immediately; the heavy work runs in later tasks.`,
            },
            {
              title: 'Do less work overall',
              body: `- Precompute an index instead of regex-scanning 20,000 items per click; or use a Worker.
- Render a page or a virtualised window, not thousands of cards via \`innerHTML\`.
- Delete the read/write loop (layout thrashing); size with CSS; \`content-visibility: auto\`.
- Store a small key, not the filtered results.
- Check input delay from third-party scripts and hydration.`,
            },
            {
              title: 'Say it in 30 seconds',
              body: `"INP is input delay plus processing plus presentation delay until the next paint. Attribution and a throttled trace would show one long task: regex filtering of 20,000 items, a huge innerHTML, a layout-thrashing loop and synchronous analytics and storage. I'd update the chip first, yield with scheduler.yield, render from a precomputed index with pagination or virtualisation, remove the measure loop, and push analytics and storage to idle time. Then confirm in field data."`,
            },
          ],
          personalAngle:
            'Your accessibility platform and consent widgets ran on customer pages, where they added to input delay for every interaction. Mention how you would measure your own script\'s contribution with LoAF script attribution.',
          references: [
            { label: 'web.dev: Interaction to Next Paint', url: 'https://web.dev/articles/inp' },
            { label: 'web.dev: Optimize long tasks', url: 'https://web.dev/articles/optimize-long-tasks' },
          ],
        },
        {
          id: 'fe-accessible-combobox',
          title: 'Build an accessible autocomplete (combobox) with correct focus management',
          type: 'coding',
          difficulty: 'advanced',
          priority: 'should',
          tags: ['accessibility', 'combobox', 'aria-activedescendant', 'focus-management', 'keyboard', 'live-region'],
          estMinutes: 25,
          roles: ['frontend', 'full-stack'],
          prompt: `Build a **city autocomplete**: typing filters a list of suggestions; arrow keys move through them; Enter selects; Escape closes. It must work with a keyboard and a screen reader. **Write the markup and the key handling, and explain your focus strategy.** (Framework-agnostic; plain DOM is fine.)`,
          intent:
            'Tests whether you can implement a non-trivial ARIA pattern correctly, not just name it. A strong answer uses the WAI-ARIA combobox pattern (input with role=combobox, aria-expanded, aria-controls, aria-activedescendant, listbox/option with aria-selected), keeps DOM focus on the input, implements the keyboard contract, announces result counts, and covers mouse and edge cases.',
          hints: [
            'Where should real DOM focus stay while the user arrows through suggestions: on the input, or on each option? What would happen to typing if focus moved?',
            'If focus stays on the input, how does a screen reader know which option is "current"? Look for an ARIA attribute that points at an id.',
            'List the roles and states: the input, the popup list, each option, whether the popup is open, which option is highlighted, and how the number of results is announced.',
            'Skeleton: `<input role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="city-list" aria-activedescendant="">` + `<ul id="city-list" role="listbox">` with `<li role="option" id="city-3" aria-selected="true">`; keydown: ArrowDown/Up move index and set `aria-activedescendant`, Enter selects, Escape closes; a polite live region says "5 suggestions".',
          ],
          answer: `**Use the WAI-ARIA combobox pattern with \`aria-activedescendant\`: DOM focus stays on the input, and the input points at the visually highlighted option.** That keeps typing, the caret and IME composition working while screen readers announce the active option.

\`\`\`html
<label for="city">City</label>
<input id="city" type="text" role="combobox"
       aria-autocomplete="list" aria-expanded="false"
       aria-controls="city-list" autocomplete="off">
<ul id="city-list" role="listbox" aria-label="City suggestions" hidden></ul>
<div id="city-status" class="visually-hidden" aria-live="polite"></div>
\`\`\`

\`\`\`js
const input = document.getElementById('city')
const list = document.getElementById('city-list')
const status = document.getElementById('city-status')
let items = []
let active = -1

function render() {
  list.replaceChildren(...items.map((name, i) => {
    const li = document.createElement('li')
    li.id = \`city-opt-\${i}\`
    li.role = 'option'
    li.textContent = name
    li.setAttribute('aria-selected', String(i === active))
    li.addEventListener('pointerdown', (e) => { e.preventDefault(); choose(i) }) // keep focus in input
    return li
  }))
  const open = items.length > 0
  list.hidden = !open
  input.setAttribute('aria-expanded', String(open))
  if (active >= 0) {
    input.setAttribute('aria-activedescendant', \`city-opt-\${active}\`)
    document.getElementById(\`city-opt-\${active}\`).scrollIntoView({ block: 'nearest' })
  } else {
    input.removeAttribute('aria-activedescendant')
  }
}

function close() { items = []; active = -1; render() }
function choose(i) { input.value = items[i]; close() }

input.addEventListener('input', () => {
  const q = input.value.trim().toLowerCase()
  items = q ? CITIES.filter((c) => c.toLowerCase().includes(q)).slice(0, 8) : []
  active = -1
  render()
  status.textContent = q ? \`\${items.length} suggestions\` : ''
})

input.addEventListener('keydown', (e) => {
  if (e.isComposing) return // do not hijack IME (Japanese input)
  const open = items.length > 0
  switch (e.key) {
    case 'ArrowDown': e.preventDefault(); if (open) { active = (active + 1) % items.length; render() } break
    case 'ArrowUp':   e.preventDefault(); if (open) { active = (active - 1 + items.length) % items.length; render() } break
    case 'Enter':     if (open && active >= 0) { e.preventDefault(); choose(active) } break
    case 'Escape':    if (open) { e.preventDefault(); close() } else { input.value = '' } break
  }
})
input.addEventListener('blur', () => setTimeout(close, 0))
\`\`\`

**Focus strategy:**
- **\`aria-activedescendant\`** (focus stays on the input) is the right choice for comboboxes; **roving \`tabindex\`** (moving real focus) suits menus, tabs and toolbars, not text inputs.
- Options are **not** in the Tab order; Tab leaves the widget.
- \`pointerdown\` + \`preventDefault\` keeps the input focused when clicking an option.

**Details that separate good from great:**
- Respect **IME composition** (\`isComposing\`) so Enter confirms Japanese input rather than selecting.
- Announce counts in a **polite live region**, debounced for fast typing.
- Visible highlight that does not rely on colour alone; sufficient contrast; \`:focus-visible\` on the input.
- With async suggestions: debounce, abort stale requests, announce "Loading".
- Prefer a tested library or a native \`<datalist>\` / \`<select>\` (customisable select is arriving in browsers) when requirements allow; custom comboboxes are easy to get subtly wrong.
- Test with VoiceOver and NVDA, not only axe.`,
          keyPoints: [
            'role=combobox on the input with aria-expanded, aria-controls, aria-autocomplete',
            'listbox/option with aria-selected; aria-activedescendant keeps DOM focus on the input',
            'Keyboard contract: arrows, Enter, Escape; options out of the Tab order',
            'Polite live region for result counts',
            'IME-safe key handling; pointerdown preventDefault for mouse selection',
          ],
          pitfalls: [
            'Moving DOM focus into the list, which breaks typing and the caret',
            'Putting role=listbox on a div of buttons and making each one tabbable',
            'Handling Enter during IME composition',
            'Announcing every keystroke assertively',
          ],
          followUps: [
            'How would you make the same component in Vue or React and test it?',
            'When would you choose roving tabindex instead?',
          ],
          walkthrough: [
            {
              title: 'Pick the pattern and focus strategy',
              body: `This is the **WAI-ARIA combobox** pattern. Real focus must stay on the input so typing works; the "current" option is communicated with **\`aria-activedescendant\`** pointing at the option's id. (Roving tabindex is for menus, tabs, toolbars.)`,
            },
            {
              title: 'Write the markup',
              body: `\`\`\`html
<label for="city">City</label>
<input id="city" role="combobox" aria-autocomplete="list"
       aria-expanded="false" aria-controls="city-list" autocomplete="off">
<ul id="city-list" role="listbox" aria-label="City suggestions" hidden></ul>
<div class="visually-hidden" aria-live="polite" id="city-status"></div>
\`\`\`
Each option: \`<li role="option" id="city-opt-3" aria-selected="true">\`.`,
            },
            {
              title: 'Implement the keyboard contract',
              body: `\`\`\`js
input.addEventListener('keydown', (e) => {
  if (e.isComposing) return
  if (e.key === 'ArrowDown') { e.preventDefault(); active = (active + 1) % items.length; render() }
  if (e.key === 'ArrowUp')   { e.preventDefault(); active = (active - 1 + items.length) % items.length; render() }
  if (e.key === 'Enter' && active >= 0) { e.preventDefault(); choose(active) }
  if (e.key === 'Escape') { e.preventDefault(); close() }
})
\`\`\`
\`render()\` updates \`aria-expanded\`, \`aria-selected\`, \`aria-activedescendant\` and scrolls the active option into view.`,
            },
            {
              title: 'Edge cases',
              body: `- Mouse: \`pointerdown\` + \`preventDefault\` so the input keeps focus.
- IME: ignore keys while \`isComposing\` (critical for Japanese users).
- Announce "5 suggestions" politely, debounced; announce loading for async.
- Close on blur; Tab moves on, options are never tabbable.
- Prefer native or a proven library when possible; test with real screen readers.`,
            },
            {
              title: 'Say it in 30 seconds',
              body: `"I'd follow the APG combobox pattern: the input has role combobox with aria-expanded and aria-controls, the popup is a listbox of options with aria-selected. Focus stays on the input, and aria-activedescendant points at the highlighted option, so typing keeps working. Arrows move, Enter selects, Escape closes, a polite live region announces the count, and I skip key handling during IME composition."`,
            },
          ],
          personalAngle:
            'This is your accessibility-platform and REI-KIT territory. If REI-KIT has a select or autocomplete, explain which focus strategy it uses and how you verified it with a screen reader; the IME detail is a strong point for Japanese companies.',
          references: [{ label: 'WAI-ARIA APG: Combobox pattern', url: 'https://www.w3.org/WAI/ARIA/apg/patterns/combobox/' }],
        },
      ],
    },
  ],
}

export default track
