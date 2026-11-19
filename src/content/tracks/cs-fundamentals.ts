import type { Track } from '@/types/content'

const track: Track = {
  id: 'cs-fundamentals',
  code: 'B',
  title: 'CS Fundamentals: Data Structures & Algorithms',
  summary: 'Complexity, core data structures and the algorithmic patterns that solve most coding rounds.',
  rationale:
    'Product work rarely asks you to write a heap or a BFS by hand, but online assessments and coding rounds at Tokyo tech companies and big tech do, often as the very first filter. This track trains pattern recognition, so an unfamiliar problem maps to a known shape quickly, with solutions in the TypeScript you already write.',
  icon: 'Binary',
  phase: 1,
  modules: [
    {
      id: 'cs-complexity',
      title: 'Complexity & bit-level basics',
      summary: 'Analyse time and space precisely, and handle the bit tricks that appear in assessments.',
      questions: [
        {
          id: 'cs-big-o-analysis',
          title: 'Analysing time and space complexity',
          type: 'concept',
          difficulty: 'foundation',
          priority: 'must',
          tags: ['big-o', 'complexity', 'amortized', 'recursion'],
          estMinutes: 5,
          roles: ['general'],
          prompt: `Give the time and space complexity of this function and explain how you derived it. Then: **what does "amortised O(1)" mean for \`Array.prototype.push\`?**`,
          code: {
            language: 'typescript',
            source: `function pairsWithSum(nums: number[], target: number): number {
  const sorted = [...nums].sort((a, b) => a - b)
  let count = 0
  for (const n of sorted) {
    let lo = 0, hi = sorted.length - 1
    while (lo <= hi) {
      const mid = (lo + hi) >> 1
      if (sorted[mid] === target - n) { count++; break }
      if (sorted[mid] < target - n) lo = mid + 1
      else hi = mid - 1
    }
  }
  return count
}`,
          },
          hints: [
            'Analyse each block separately, then keep the dominant term.',
            'The copy and the sort both cost something in space as well.',
            'Amortised means the average over a sequence of operations, not the worst single one.',
          ],
          answer: `**Time: O(n log n). Space: O(n).**

**Derivation, block by block:**
- \`[...nums]\` copies the array: O(n) time, **O(n) space**.
- \`sort\`: O(n log n) time. V8 uses TimSort, which also needs up to O(n) auxiliary space.
- The loop runs n times, and each iteration runs a binary search costing O(log n), so the loop is O(n log n).
- Total: O(n) + O(n log n) + O(n log n) = **O(n log n)**. Drop the constants and the lower-order terms.

**Rules to say out loud:**
- Sequential blocks add; nested blocks multiply.
- Halving the search space each step gives log n.
- Recursion: time ≈ (number of calls) × (work per call); space ≈ the maximum depth of the call stack. Naive Fibonacci is O(2ⁿ) time but only O(n) stack depth.
- With two inputs, keep both variables: O(n + m), not O(n).

**Amortised O(1) \`push\`:** a dynamic array has spare capacity. Most pushes write into free space in O(1). When it fills up, the engine allocates a larger buffer (with geometric growth) and copies everything, which is O(n). Because the capacity grows geometrically, the copies happen rarely: across n pushes the total copy work is bounded by roughly 2n, so **the average cost per push is O(1)**, even though a single push can be O(n).

**Note:** this function could be O(n) with a hash map (a Two Sum count), which is the natural follow-up.`,
          keyPoints: [
            'Analyse block by block and keep the dominant term',
            'Account for space used by copies, sorting and recursion',
            'Binary search is O(log n) because it halves the range',
            'Amortised means averaged over a sequence of operations',
          ],
          pitfalls: [
            'Forgetting the space used by sorting or by the call stack',
            'Calling it O(n²) because there are two loops, without checking what the inner loop does',
          ],
          followUps: ['How would you make this O(n)?', 'What is the complexity of `Array.prototype.shift`, and why?'],
        },
        {
          id: 'cs-bit-manipulation',
          title: 'Bit manipulation basics',
          type: 'multiple-choice',
          difficulty: 'foundation',
          priority: 'nice',
          tags: ['bit-manipulation', 'xor', 'math'],
          estMinutes: 3,
          roles: ['general'],
          prompt: `Every number in an array appears **twice except one**. Which approach finds the single number in O(n) time and **O(1) extra space**?`,
          choices: [
            {
              id: 'a',
              text: 'Sort, then scan adjacent pairs',
              correct: false,
              explanation: 'This takes O(n log n) time, and sorting needs extra space or mutates the input.',
            },
            {
              id: 'b',
              text: 'XOR all the numbers together: `nums.reduce((a, b) => a ^ b, 0)`',
              correct: true,
              explanation: 'x ^ x = 0 and x ^ 0 = x, and XOR is commutative, so every pair cancels and only the single number remains.',
            },
            {
              id: 'c',
              text: 'Count occurrences in a `Map` and return the key with count 1',
              correct: false,
              explanation: 'This is O(n) time but O(n) space.',
            },
            {
              id: 'd',
              text: 'Sum all values and subtract twice the sum of the unique values',
              correct: false,
              explanation: 'Finding the unique values needs a Set, which is O(n) space.',
            },
          ],
          hints: ['What is x ^ x?'],
          answer: `**XOR everything.** Because \`x ^ x === 0\`, \`x ^ 0 === x\`, and XOR is commutative and associative, the pairs cancel in any order.

\`\`\`ts
const singleNumber = (nums: number[]) => nums.reduce((acc, n) => acc ^ n, 0)
\`\`\`

**Other bit tricks worth knowing:**
- \`n & 1\`: is n odd?
- \`n & (n - 1)\`: clears the lowest set bit, so \`n > 0 && (n & (n - 1)) === 0\` tests for a power of two.
- Counting set bits: repeat \`n &= n - 1\` until n is 0.
- \`1 << k\`: a mask for bit k; use \`flags | mask\` to set it, \`flags & ~mask\` to clear it and \`flags & mask\` to test it.

**JavaScript caveat:** bitwise operators convert their operands to **32-bit signed integers**, so they break for values above 2³¹ − 1. \`>>>\` is the unsigned right shift. For larger values, use \`BigInt\`.`,
          keyPoints: [
            'XOR cancels equal pairs',
            'n & (n - 1) clears the lowest set bit',
            'JavaScript bitwise operators work on 32-bit signed integers',
          ],
          pitfalls: ['Using bitwise operators on values above 2^31 in JavaScript'],
        },
      ],
    },
    {
      id: 'cs-data-structures',
      title: 'Core data structures',
      summary: 'Hash maps, stacks, linked lists, trees, heaps, tries and graphs: what each is good for and how they are used in problems.',
      questions: [
        {
          id: 'cs-hashmap-group-anagrams',
          title: 'Hash maps: group anagrams',
          type: 'coding',
          difficulty: 'foundation',
          priority: 'must',
          tags: ['hash-map', 'strings', 'grouping'],
          estMinutes: 15,
          roles: ['general'],
          prompt: `Given an array of lowercase words, **group the words that are anagrams of each other**. Order does not matter.

Example: \`["eat","tea","tan","ate","nat","bat"]\` → \`[["eat","tea","ate"],["tan","nat"],["bat"]]\``,
          hints: [
            'Anagrams share some canonical form. What could that be?',
            'Use that canonical form as a key in a Map.',
            'Sorting each word works; a 26-letter count avoids the sort.',
          ],
          answer: `**Map each word to a canonical key, then group the words in a \`Map\`.**

\`\`\`ts
function groupAnagrams(words: string[]): string[][] {
  const groups = new Map<string, string[]>()
  for (const word of words) {
    const counts = new Array<number>(26).fill(0)
    for (const ch of word) counts[ch.charCodeAt(0) - 97]++
    const key = counts.join(',') // e.g. "1,0,0,0,1,..."
    const group = groups.get(key)
    if (group) group.push(word)
    else groups.set(key, [word])
  }
  return [...groups.values()]
}
\`\`\`

**Complexity:** with n words of maximum length k, this is **O(n·k)** time and O(n·k) space. A simpler key, \`[...word].sort().join('')\`, gives O(n·k log k), which is often fine and easier to write. State the trade-off.

**The general pattern:** *"group by some property"* or *"have I seen this before?"* points to a hash map or set, with O(1) average lookup. Variations include Two Sum (map each value to its index), first unique character (counts), and detecting duplicates (a Set).

**Points to mention in an interview:**
- Use a **\`Map\`** rather than a plain object for dynamic keys: no prototype keys, any key type, and \`size\` built in.
- Join the counts with a separator. Without one, counts such as \`1,11\` and \`11,1\` produce the same string.
- For Unicode input, count with a \`Map<string, number>\` instead of a fixed array of 26.`,
          keyPoints: [
            'Use a canonical key for each group',
            'Map has O(1) average lookup',
            'Compare the sort-based key with the count-based key',
            'Use a separator in the count key',
          ],
          pitfalls: ['Joining the counts without a separator', 'Using a plain object with arbitrary keys like "__proto__"'],
          followUps: ['How would you handle Unicode input?'],
        },
        {
          id: 'cs-monotonic-stack',
          title: 'Stacks: next warmer day (monotonic stack)',
          type: 'coding',
          difficulty: 'core',
          priority: 'must',
          tags: ['stack', 'monotonic-stack', 'queue', 'arrays'],
          estMinutes: 20,
          roles: ['general'],
          prompt: `Given daily temperatures, return an array where \`answer[i]\` is **how many days you must wait after day i for a warmer temperature** (0 if there is none).

Example: \`[73,74,75,71,69,72,76,73]\` → \`[1,1,4,2,1,1,0,0]\``,
          hints: [
            'The brute force scans forward from each day: O(n²).',
            'Keep the days that are still waiting for an answer.',
            'A stack of indices with decreasing temperatures: when a warmer day arrives, pop and resolve.',
          ],
          answer: `**Use a monotonic stack of indices still waiting for a warmer day.** Each index is pushed once and popped once, so the whole thing is **O(n)**.

\`\`\`ts
function dailyTemperatures(temps: number[]): number[] {
  const answer = new Array<number>(temps.length).fill(0)
  const stack: number[] = [] // indices; their temps are decreasing from bottom to top
  for (let i = 0; i < temps.length; i++) {
    while (stack.length && temps[i] > temps[stack[stack.length - 1]]) {
      const j = stack.pop()!
      answer[j] = i - j
    }
    stack.push(i)
  }
  return answer
}
\`\`\`

**Why it works:** while the stack's temperatures are decreasing, none of those days has seen a warmer day yet. A new warmer temperature resolves every smaller day on top of the stack.

**Complexity:** O(n) time (amortised, since each index is pushed and popped at most once) and O(n) space.

**Stack vs queue in interviews:**
- **Stack (LIFO):** matching brackets, undo, iterative DFS, expression evaluation, monotonic "next greater" problems.
- **Queue (FIFO):** BFS, task scheduling, sliding-window maximum (with a deque).
- In JavaScript, \`push\` and \`pop\` are O(1), but **\`shift\` is O(n)**. For a real queue, use a head index or a linked list.

Valid parentheses is the warm-up version: push opening brackets, and on a closing bracket check that the top of the stack matches.`,
          keyPoints: [
            'The stack holds unresolved indices',
            'Each element is pushed and popped once, giving amortised O(n)',
            'Store indices, not values, so you can compute distances',
            'Array.shift is O(n) in JavaScript',
          ],
          pitfalls: ['Storing values instead of indices', 'Using shift() as a queue in a hot loop'],
          followUps: ['How would you find the next greater element in a circular array?'],
        },
        {
          id: 'cs-linked-list-reverse-cycle',
          title: 'Linked lists: reverse and detect a cycle',
          type: 'coding',
          difficulty: 'core',
          priority: 'should',
          tags: ['linked-list', 'two-pointers', 'fast-slow-pointers'],
          estMinutes: 15,
          roles: ['general'],
          prompt: `Using \`type ListNode = { val: number; next: ListNode | null }\`:
1. **Reverse a singly linked list** in place.
2. **Detect whether a list has a cycle**, using O(1) extra space.`,
          hints: [
            'For the reversal you need three references: prev, current and next.',
            'For the cycle: two pointers moving at different speeds.',
          ],
          answer: `**1. Reverse by re-pointing each \`next\` backwards: O(n) time, O(1) space.**

\`\`\`ts
type ListNode = { val: number; next: ListNode | null }

function reverse(head: ListNode | null): ListNode | null {
  let prev: ListNode | null = null
  let curr = head
  while (curr) {
    const next = curr.next // save before overwriting
    curr.next = prev
    prev = curr
    curr = next
  }
  return prev // new head
}
\`\`\`

**2. Use Floyd's fast/slow pointers: O(n) time, O(1) space.**

\`\`\`ts
function hasCycle(head: ListNode | null): boolean {
  let slow = head
  let fast = head
  while (fast && fast.next) {
    slow = slow!.next
    fast = fast.next.next
    if (slow === fast) return true
  }
  return false
}
\`\`\`

If there is a cycle, the fast pointer gains one step per iteration and must eventually land on the slow one; if not, it reaches \`null\`. A \`Set\` of visited nodes also works, but uses O(n) space.

**Why linked lists still come up:** they test pointer manipulation and edge cases (an empty list, one node, the head changing). Use a **dummy head node** to avoid special-casing the head when inserting or deleting. Related patterns: finding the middle (fast/slow), merging two sorted lists, removing the n-th node from the end (two pointers n apart). In real JavaScript code you rarely build linked lists, but an LRU cache uses a doubly linked list together with a Map.`,
          keyPoints: [
            'Save next before re-pointing',
            'Return prev as the new head',
            'Fast/slow pointers detect a cycle in O(1) space',
            'A dummy head simplifies edge cases',
          ],
          pitfalls: ['Losing the rest of the list by overwriting next first', 'Not checking fast.next before fast.next.next'],
          followUps: ['How would you find the node where the cycle starts?', 'Design an LRU cache.'],
        },
        {
          id: 'cs-validate-bst',
          title: 'Trees: the validate-BST bug',
          type: 'debugging',
          difficulty: 'core',
          priority: 'must',
          tags: ['trees', 'bst', 'recursion', 'dfs'],
          estMinutes: 15,
          roles: ['general'],
          prompt: `This function is supposed to check whether a binary tree is a valid **binary search tree**. It passes simple tests but is wrong. **Find a counter-example and fix it.**`,
          code: {
            language: 'typescript',
            source: `type TreeNode = { val: number; left: TreeNode | null; right: TreeNode | null }

function isValidBST(node: TreeNode | null): boolean {
  if (!node) return true
  if (node.left && node.left.val >= node.val) return false
  if (node.right && node.right.val <= node.val) return false
  return isValidBST(node.left) && isValidBST(node.right)
}`,
          },
          hints: [
            'The BST property applies to whole subtrees, not just to direct children.',
            'Try a root of 5 whose right child is 7, where 7 has a left child of 3.',
            'Pass down an allowed (min, max) range.',
          ],
          answer: `**Bug: it only compares each node with its direct children.** The BST property says that **every** node in the left subtree is less than the node, and every node in the right subtree is greater.

**Counter-example:**
\`\`\`text
    5
     \\
      7
     /
    3      <- 3 < 5, but it sits in 5's right subtree
\`\`\`
Each parent–child pair looks valid, so the function returns \`true\`, but the tree is not a BST.

**Fix: pass the valid range down the tree.**

\`\`\`ts
function isValidBST(
  node: TreeNode | null,
  min = -Infinity,
  max = Infinity,
): boolean {
  if (!node) return true
  if (node.val <= min || node.val >= max) return false
  return isValidBST(node.left, min, node.val) && isValidBST(node.right, node.val, max)
}
\`\`\`

**Alternative:** an in-order traversal of a BST yields strictly increasing values, so you can track the previous value and check that each value is larger.

**Complexity:** O(n) time, and O(h) space for the recursion stack, where h is the tree height (O(log n) when balanced, O(n) when skewed).

**Tree points to mention:** pre-, in- and post-order traversal (DFS) versus level-order (BFS with a queue); a BST search is O(h), so balancing (AVL, red-black) is what guarantees O(log n); and recursion depth on very deep trees can overflow the stack in JavaScript, in which case convert to iteration.`,
          keyPoints: [
            'The BST property applies to whole subtrees',
            'Pass (min, max) bounds down the recursion',
            'In-order traversal of a BST is sorted',
            'Space is O(h), the height of the tree',
          ],
          pitfalls: ['Comparing only direct children', 'Allowing duplicates by using < instead of <='],
          followUps: ['Find the k-th smallest element in a BST.', 'What is the lowest common ancestor in a BST?'],
        },
        {
          id: 'cs-heap-top-k',
          title: 'Heaps: top k frequent elements',
          type: 'coding',
          difficulty: 'core',
          priority: 'should',
          tags: ['heap', 'priority-queue', 'hash-map', 'bucket-sort'],
          estMinutes: 25,
          roles: ['general'],
          prompt: `Return the **k most frequent elements** of an integer array. JavaScript has no built-in heap, so explain what you would do in an interview.`,
          hints: [
            'First count the frequencies with a Map.',
            'A min-heap of size k keeps the k largest values seen so far.',
            'Frequencies are bounded by n. Could you bucket by frequency?',
          ],
          answer: `**Count with a \`Map\`, then keep a min-heap of size k, keyed by frequency.** This is O(n log k). There is also an **O(n) bucket approach**.

\`\`\`ts
class MinHeap<T> {
  private items: T[] = []
  constructor(private score: (item: T) => number) {}
  get size() { return this.items.length }
  peek() { return this.items[0] }
  push(item: T) {
    this.items.push(item)
    let i = this.items.length - 1
    while (i > 0) {
      const p = (i - 1) >> 1
      if (this.score(this.items[p]) <= this.score(this.items[i])) break
      ;[this.items[p], this.items[i]] = [this.items[i], this.items[p]]
      i = p
    }
  }
  pop(): T | undefined {
    const top = this.items[0]
    const last = this.items.pop()
    if (this.items.length && last !== undefined) {
      this.items[0] = last
      let i = 0
      for (;;) {
        const l = 2 * i + 1, r = l + 1
        let m = i
        if (l < this.items.length && this.score(this.items[l]) < this.score(this.items[m])) m = l
        if (r < this.items.length && this.score(this.items[r]) < this.score(this.items[m])) m = r
        if (m === i) break
        ;[this.items[m], this.items[i]] = [this.items[i], this.items[m]]
        i = m
      }
    }
    return top
  }
}

function topKFrequent(nums: number[], k: number): number[] {
  const freq = new Map<number, number>()
  for (const n of nums) freq.set(n, (freq.get(n) ?? 0) + 1)
  const heap = new MinHeap<[number, number]>(([, f]) => f)
  for (const entry of freq) {
    heap.push(entry)
    if (heap.size > k) heap.pop() // evict the least frequent
  }
  const result: number[] = []
  while (heap.size) result.push(heap.pop()![0])
  return result
}
\`\`\`

**Bucket alternative, O(n):** create \`buckets[f]\` holding the values with frequency f (f ≤ n), then walk from the highest frequency down until you have collected k values.

**What to say in an interview:** *"JavaScript has no priority queue, so I'll write a small binary heap, or sort the entries in O(m log m) if you're happy with that."* Asking which they prefer is a good move. A heap gives O(log n) push and pop and O(1) peek; use it for "top k", "k-th largest", merging k sorted lists, scheduling, and Dijkstra.`,
          keyPoints: [
            'Count frequencies first',
            'A min-heap of size k keeps the top k in O(n log k)',
            'Bucket sort gives O(n) because frequencies are bounded by n',
            'Offer the simpler sort-based solution as an option',
          ],
          pitfalls: ['Using a max-heap of all n elements when only k are needed', 'Wrong child index arithmetic'],
          followUps: ['How would you find the median of a stream?'],
        },
        {
          id: 'cs-trie-autocomplete',
          title: 'Tries: prefix autocomplete',
          type: 'coding',
          difficulty: 'advanced',
          priority: 'nice',
          tags: ['trie', 'strings', 'prefix', 'dfs'],
          estMinutes: 25,
          roles: ['general', 'frontend'],
          prompt: `Implement a **Trie** with \`insert(word)\` and \`suggest(prefix, limit)\`, which returns up to \`limit\` stored words starting with \`prefix\`. When would you use a trie instead of filtering an array?`,
          hints: [
            'Each node maps a character to a child node and marks whether a word ends there.',
            'Walk down to the prefix node, then DFS to collect words.',
          ],
          answer: `**A trie stores strings character by character, so finding the prefix takes O(length of the prefix) no matter how many words are stored.**

\`\`\`ts
class TrieNode {
  children = new Map<string, TrieNode>()
  isWord = false
}

class Trie {
  private root = new TrieNode()

  insert(word: string): void {
    let node = this.root
    for (const ch of word) {
      let next = node.children.get(ch)
      if (!next) node.children.set(ch, (next = new TrieNode()))
      node = next
    }
    node.isWord = true
  }

  suggest(prefix: string, limit = 10): string[] {
    let node = this.root
    for (const ch of prefix) {
      const next = node.children.get(ch)
      if (!next) return []
      node = next
    }
    const out: string[] = []
    const dfs = (n: TrieNode, path: string) => {
      if (out.length >= limit) return
      if (n.isWord) out.push(path)
      for (const [ch, child] of n.children) dfs(child, path + ch)
    }
    dfs(node, prefix)
    return out
  }
}
\`\`\`

**Complexity:** \`insert\` is O(L). \`suggest\` is O(P) to reach the prefix plus the size of the subtree visited (capped by \`limit\`). Memory can be high, since each node holds a Map.

**Trie or array filter?**
- For a few thousand words, \`words.filter(w => w.startsWith(q))\` is O(n·P) per keystroke and usually fast enough; it is simpler and the right choice for most UIs.
- A trie pays off with large dictionaries, many queries, or extra needs such as word games, IP routing (longest-prefix match) or spell checking.
- In production, autocomplete is usually served from the **backend** (a search index), with debouncing and caching on the client.`,
          keyPoints: [
            'Each node holds a map of children and an end-of-word flag',
            'Prefix lookup is O(P), independent of n',
            'Collect suggestions with a DFS from the prefix node',
            'Weigh it against a simple filter for small data',
          ],
          pitfalls: ['Forgetting the isWord flag, so "car" is not found when "cart" exists'],
          followUps: ['How would you rank suggestions by popularity?'],
        },
      ],
    },
    {
      id: 'cs-patterns',
      title: 'Algorithmic patterns',
      summary: 'Sliding window, prefix sums, BFS/DFS, binary search, backtracking, greedy and dynamic programming.',
      questions: [
        {
          id: 'cs-sliding-window-longest-unique',
          title: 'Sliding window: longest substring without repeats',
          type: 'coding',
          difficulty: 'core',
          priority: 'must',
          tags: ['sliding-window', 'two-pointers', 'strings', 'hash-map'],
          estMinutes: 20,
          roles: ['general'],
          prompt: `Return the **length of the longest substring without repeating characters**.

Example: \`"abcabcbb"\` → 3 (\`"abc"\`), \`"pwwkew"\` → 3 (\`"wke"\`).`,
          hints: [
            'The answer is a contiguous range. Can you grow and shrink a window?',
            'Track the last index at which each character was seen.',
            'When you see a repeat, jump the left edge past its previous occurrence, but never move it backwards.',
          ],
          answer: `**Use a variable-size sliding window with a map from each character to its last index: O(n).**

\`\`\`ts
function lengthOfLongestSubstring(s: string): number {
  const lastSeen = new Map<string, number>()
  let left = 0
  let best = 0
  for (let right = 0; right < s.length; right++) {
    const ch = s[right]
    const prev = lastSeen.get(ch)
    if (prev !== undefined && prev >= left) left = prev + 1 // shrink past the duplicate
    lastSeen.set(ch, right)
    best = Math.max(best, right - left + 1)
  }
  return best
}
\`\`\`

**Why \`prev >= left\`:** a character seen *before* the current window is not a duplicate inside it. Without the check, \`left\` can jump backwards (try \`"abba"\`).

**Complexity:** O(n) time, because each index enters and leaves the window at most once, and O(min(n, alphabet size)) space.

**When to use each two-pointer variant:**
- **Sliding window:** "longest or shortest *contiguous* subarray or substring with property X", where the property is **monotonic**: extending the window can only make it worse (more repeats, a larger sum of positive numbers).
- **Opposite-end two pointers:** a sorted array where you look for a pair (Two Sum II, container with most water) or a palindrome check.
- **Fast/slow pointers:** cycles, middle of a list, removing duplicates in place.

If the property is not monotonic (for example, a sum with negative numbers), the sliding window breaks; switch to prefix sums.`,
          keyPoints: [
            'Variable window with left and right pointers',
            'Map from character to last index',
            'Guard so the left pointer never moves backwards',
            'O(n) because each index moves at most twice',
            'Sliding window needs a monotonic property',
          ],
          pitfalls: ['Missing the prev >= left check ("abba")', 'Rebuilding a Set for each window, which is O(n²)'],
          followUps: ['What if at most k distinct characters are allowed?'],
        },
        {
          id: 'cs-prefix-sum-subarray-k',
          title: 'Prefix sums: count subarrays summing to k',
          type: 'coding',
          difficulty: 'advanced',
          priority: 'should',
          tags: ['prefix-sum', 'hash-map', 'arrays'],
          estMinutes: 25,
          roles: ['general'],
          prompt: `Given an integer array (which **may contain negatives**) and an integer \`k\`, return **how many contiguous subarrays sum to k**. Why does a sliding window fail here?`,
          hints: [
            'sum(i..j) = prefix[j + 1] - prefix[i].',
            'At each j, you need the number of earlier prefixes equal to prefix - k.',
            'Store counts of prefix sums in a Map, starting with {0: 1}.',
          ],
          answer: `**Use a running prefix sum and a hash map counting how often each prefix sum has occurred: O(n).**

\`\`\`ts
function subarraySum(nums: number[], k: number): number {
  const seen = new Map<number, number>([[0, 1]]) // the empty prefix
  let prefix = 0
  let count = 0
  for (const n of nums) {
    prefix += n
    count += seen.get(prefix - k) ?? 0 // earlier prefixes that make the sum k
    seen.set(prefix, (seen.get(prefix) ?? 0) + 1)
  }
  return count
}
\`\`\`

**Why it works:** a subarray \`(i..j]\` sums to k exactly when \`prefix[j] - prefix[i] = k\`, that is, when \`prefix[i] = prefix[j] - k\`. Counting the earlier prefixes with that value counts every subarray ending at j.

**Why \`{0: 1}\`:** it accounts for subarrays that start at index 0.

**Why a sliding window fails:** with negative numbers, growing the window can *decrease* the sum, so there is no rule for when to shrink it. The monotonicity the window relies on is gone.

**Complexity:** O(n) time, O(n) space.

**The general prefix-sum pattern:**
- Range sum queries in O(1) after O(n) preprocessing: \`sum(l, r) = P[r + 1] - P[l]\`.
- 2-D prefix sums for rectangle sums in a matrix.
- Similar tricks: "subarray sum divisible by k" (store \`prefix % k\`), "longest subarray with equal 0s and 1s" (map 0 to -1 and store the first index of each prefix).`,
          keyPoints: [
            'A subarray sum is a difference of two prefix sums',
            'Map from prefix sum to count, seeded with {0: 1}',
            'O(n) time, single pass',
            'A sliding window fails without monotonicity',
          ],
          pitfalls: ['Forgetting the {0: 1} seed', 'Inserting the current prefix before looking it up (wrong when k = 0)'],
          followUps: ['Return the longest such subarray instead of the count.'],
        },
        {
          id: 'cs-graph-bfs-dfs-grid',
          title: 'Graphs: islands and shortest path in a grid',
          type: 'coding',
          difficulty: 'core',
          priority: 'must',
          tags: ['graphs', 'bfs', 'dfs', 'grid', 'shortest-path'],
          estMinutes: 25,
          roles: ['general'],
          prompt: `Given a grid of \`'1'\` (land) and \`'0'\` (water):
1. **Count the islands** (connected horizontally or vertically).
2. Then: **what changes if I ask for the shortest path** from the top-left to the bottom-right through land?`,
          hints: [
            'Treat each cell as a node, with edges to its four neighbours.',
            'For each unvisited land cell, flood-fill and count one island.',
            'Shortest path in an unweighted graph means BFS, level by level.',
          ],
          answer: `**1. Count islands: flood-fill each new land cell with DFS or BFS. O(rows × cols).**

\`\`\`ts
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]] as const

function numIslands(grid: string[][]): number {
  const rows = grid.length, cols = grid[0]?.length ?? 0
  const seen = Array.from({ length: rows }, () => new Array<boolean>(cols).fill(false))
  let islands = 0
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== '1' || seen[r][c]) continue
      islands++
      const stack: [number, number][] = [[r, c]] // iterative DFS: no recursion limit
      seen[r][c] = true
      while (stack.length) {
        const [cr, cc] = stack.pop()!
        for (const [dr, dc] of DIRS) {
          const nr = cr + dr, nc = cc + dc
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === '1' && !seen[nr][nc]) {
            seen[nr][nc] = true
            stack.push([nr, nc])
          }
        }
      }
    }
  }
  return islands
}
\`\`\`

**2. Shortest path: switch to BFS.** BFS explores in order of distance, so the first time it reaches the target is via a shortest path (in an unweighted graph). Use a queue of \`[r, c, dist]\` with a **head index** rather than \`shift()\`, and mark cells as visited **when you enqueue them**, not when you dequeue them, to avoid duplicates. DFS does *not* find shortest paths.

**Choosing a traversal:**
- **DFS:** connectivity, cycle detection, topological sort, exhaustive search (backtracking).
- **BFS:** shortest path in unweighted graphs, levels, the "minimum number of steps".
- **Dijkstra** (BFS with a heap) for weighted edges; **topological sort** (Kahn's algorithm) for dependency ordering, such as build steps or a job DAG.

**Graph representation:** an adjacency list (\`Map<node, node[]>\`) costs O(V + E) space and suits sparse graphs; an adjacency matrix costs O(V²) and gives O(1) edge lookup.`,
          keyPoints: [
            'A grid is an implicit graph with four neighbours per cell',
            'Use a visited set, or mutate the grid if allowed',
            'BFS gives shortest paths in unweighted graphs; DFS does not',
            'Iterative DFS avoids stack overflow',
            'O(V + E), here O(rows × cols)',
          ],
          pitfalls: [
            'Marking visited on dequeue in BFS, which adds duplicates',
            'Using DFS for shortest paths',
            'Recursive DFS overflowing on large grids',
          ],
          followUps: ['What if moving through some cells costs more?', 'How would you order jobs that have dependencies?'],
          personalAngle:
            'Topological ordering is a natural bridge to your work: scheduled scraping jobs with dependencies form a DAG, and recovery jobs need to know which steps can safely be re-run.',
        },
        {
          id: 'cs-sorting-binary-search',
          title: 'Sorting and binary search trade-offs',
          type: 'tradeoff',
          difficulty: 'core',
          priority: 'should',
          tags: ['sorting', 'binary-search', 'stability', 'searching'],
          estMinutes: 6,
          roles: ['general'],
          prompt: `Three short questions:
1. Is JavaScript's \`Array.prototype.sort\` stable, and what goes wrong with \`[10, 9, 1].sort()\`?
2. When is it worth sorting first so that you can binary search?
3. What is "binary search on the answer"?`,
          hints: [
            'Default sort compares strings.',
            'Compare one O(n log n) sort followed by q searches with q linear scans.',
            'Binary search works on any monotonic yes/no predicate.',
          ],
          answer: `**1.** Since ES2019, \`Array.prototype.sort\` is **required to be stable**: elements that compare equal keep their original order, so sorting by a secondary key and then a primary key works. **Without a comparator, values are compared as strings**, so \`[10, 9, 1].sort()\` gives \`[1, 10, 9]\`. Always pass \`(a, b) => a - b\`. Also, \`sort\` **mutates** the array; use \`toSorted()\` (ES2023) for a copy.

**2.** Sorting costs O(n log n) once, and each binary search is then O(log n). With q queries, compare **O(n log n + q log n)** against **O(q·n)**. Sorting wins once q is more than about log n. For a single lookup, a linear scan (O(n)) or a hash set is better. Sorting also enables two-pointer techniques, merging intervals and grouping equal items next to each other.

**Know the algorithms at the level of their trade-offs:**
| Algorithm | Time | Space | Stable | Notes |
| --- | --- | --- | --- | --- |
| Merge sort | O(n log n) | O(n) | yes | predictable; good for linked lists and external sorting |
| Quick sort | O(n log n) average, O(n²) worst | O(log n) | no | fast in practice; uses a random pivot |
| Heap sort | O(n log n) | O(1) | no | in place |
| Counting/radix | O(n + k) | O(k) | yes | for small integer ranges |
| TimSort (V8) | O(n log n), O(n) on nearly sorted input | O(n) | yes | merge sort plus insertion sort |

**3. Binary search on the answer:** if a predicate \`ok(x)\` is monotonic (false…false, true…true), you can binary search for the smallest x where it is true, even with no sorted array. Example: *"the minimum speed to finish all tasks in H hours"* → binary search the speed, where \`ok(speed)\` computes the total hours in O(n).

\`\`\`ts
function lowerBound(lo: number, hi: number, ok: (x: number) => boolean): number {
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2)
    if (ok(mid)) hi = mid
    else lo = mid + 1
  }
  return lo
}
\`\`\``,
          keyPoints: [
            'JavaScript sort is stable but compares as strings by default',
            'Sort once when there are many queries',
            'Know merge, quick and heap sort at the trade-off level',
            'Binary search on a monotonic predicate',
          ],
          pitfalls: ['Calling sort() with no comparator on numbers', 'Off-by-one errors and infinite loops in binary search'],
        },
        {
          id: 'cs-backtracking-subsets',
          title: 'Recursion and backtracking: generate subsets',
          type: 'coding',
          difficulty: 'core',
          priority: 'should',
          tags: ['recursion', 'backtracking', 'combinatorics', 'dfs'],
          estMinutes: 20,
          roles: ['general'],
          prompt: `Return **all subsets** of an array of distinct integers. Then: how would you change it to return only subsets that **sum to a target**, and what does "pruning" mean?`,
          hints: [
            'Each element is either in or out: a decision tree of depth n.',
            'Choose, explore, un-choose.',
            'Pruning: stop exploring a branch that cannot lead to a valid answer.',
          ],
          answer: `**Backtracking: build a path, recurse, then undo the choice. There are 2ⁿ subsets, so the cost is O(n·2ⁿ).**

\`\`\`ts
function subsets(nums: number[]): number[][] {
  const result: number[][] = []
  const path: number[] = []
  const backtrack = (start: number) => {
    result.push([...path]) // copy: path keeps changing
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]) // choose
      backtrack(i + 1) // explore
      path.pop() // un-choose
    }
  }
  backtrack(0)
  return result
}
\`\`\`

**With a target sum and pruning** (for example, positive numbers, sorted first):

\`\`\`ts
function subsetsWithSum(nums: number[], target: number): number[][] {
  const sorted = [...nums].sort((a, b) => a - b)
  const result: number[][] = []
  const path: number[] = []
  const go = (start: number, remaining: number) => {
    if (remaining === 0) { result.push([...path]); return }
    for (let i = start; i < sorted.length; i++) {
      if (sorted[i] > remaining) break // prune: later values are even larger
      path.push(sorted[i])
      go(i + 1, remaining - sorted[i])
      path.pop()
    }
  }
  go(0, target)
  return result
}
\`\`\`

**The template behind most backtracking problems:** define the *state* (path, start index, remaining), the *choices* at each step, the *goal* (when to record a result) and the *constraints* (when to prune). Permutations use a \`used\` array instead of a \`start\` index; N-Queens and Sudoku add validity checks.

**Recursion points to mention:** every recursion needs a base case; the call-stack depth is O(n); and JavaScript engines do not reliably optimise tail calls, so very deep recursion can throw \`RangeError: Maximum call stack size exceeded\`.`,
          keyPoints: [
            'Choose, explore, un-choose',
            'Copy the path when recording a result',
            'There are 2^n subsets, so output size bounds the time',
            'Prune branches that cannot succeed',
            'Stack depth limits in JavaScript',
          ],
          pitfalls: ['Pushing path itself instead of a copy', 'Forgetting to pop after recursing'],
          followUps: ['How do you avoid duplicate subsets if the input has duplicates?'],
        },
        {
          id: 'cs-greedy-vs-dp-coins',
          title: 'Greedy vs dynamic programming: coin change',
          type: 'coding',
          difficulty: 'advanced',
          priority: 'must',
          tags: ['dynamic-programming', 'greedy', 'memoization', 'tabulation'],
          estMinutes: 30,
          roles: ['general'],
          prompt: `Given coin denominations and an amount, return the **minimum number of coins** that make up the amount (or -1). Would "always take the largest coin" work? Then solve it properly.`,
          hints: [
            'Try coins [1, 3, 4] with amount 6.',
            'dp[a] = the minimum number of coins for amount a. How does it relate to smaller amounts?',
            'dp[a] = 1 + min over coins c of dp[a - c].',
          ],
          answer: `**Greedy fails in general; use DP.** With coins \`[1, 3, 4]\` and amount 6, greedy takes 4 + 1 + 1 (3 coins), but 3 + 3 uses 2. Greedy is only correct when you can prove the *greedy-choice property*. Standard currency systems happen to have it; arbitrary coin sets do not.

**Bottom-up DP:**

\`\`\`ts
function coinChange(coins: number[], amount: number): number {
  const dp = new Array<number>(amount + 1).fill(Infinity)
  dp[0] = 0
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) {
      if (c <= a && dp[a - c] + 1 < dp[a]) dp[a] = dp[a - c] + 1
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount]
}
// O(amount × coins) time, O(amount) space
\`\`\`

**How to recognise and build a DP solution:**
1. **Optimal substructure:** the best answer for \`a\` is built from best answers to smaller subproblems.
2. **Overlapping subproblems:** a naive recursion recomputes \`dp[a - c]\` exponentially many times.
3. Define the **state** (\`dp[a]\`), the **transition** (\`1 + min dp[a - c]\`), the **base case** (\`dp[0] = 0\`) and the **evaluation order** (increasing a).
4. Choose **top-down** (recursion plus a memo Map, often easier to derive) or **bottom-up** (a table, with no recursion-depth risk and often less space).

**When greedy is correct:** interval scheduling (sort by end time and take each meeting that does not overlap), jump game (track the furthest reachable index), and Huffman coding. In an interview, give a one-line argument for why greedy is safe, such as an exchange argument: *"choosing the meeting that ends earliest never leaves less room for the rest."*

**Classic DP shapes:** climbing stairs and house robber (1-D), longest common subsequence and edit distance (2-D over two strings), 0/1 knapsack, and longest increasing subsequence.`,
          keyPoints: [
            'Give a counter-example for greedy',
            'State, transition, base case and evaluation order',
            'Optimal substructure plus overlapping subproblems',
            'Top-down memoisation versus bottom-up tabulation',
            'Justify greedy with an exchange argument when it is used',
          ],
          pitfalls: ['Assuming greedy works without a proof', 'Returning Infinity instead of -1'],
          followUps: ['Count the number of ways to make the amount instead.', 'Can you reduce the space for 2-D DP?'],
        },
      ],
    },
  ],
}

export default track
