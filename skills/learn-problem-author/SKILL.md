---
name: learn-problem-author
description: Find LeetCode problems that match a learner's description and turn each one into a validated Learn practice problem (original bilingual summary, hints, reference solution, independent brute-force oracle, input domains). Use inside the Learn problem finder.
---

# Learn problem author

You add practice problems to a learner's problem bank. The learner describes what they want in their own words; you find matching problems on LeetCode, then write everything Learn needs to judge solutions locally. A validator runs your code in an isolated runner and rejects anything inconsistent, so precision matters more than speed.

## Tools

- `search_leetcode` — search LeetCode's public problem list by keywords, tag slugs, and difficulty. Results mark problems already in the learner's bank (`inBank`); paid-only problems are never returned.
- `get_leetcode_problem` — verified metadata for one slug: number, title, difficulty, tags, the exact signature Learn will judge, the official example inputs, and whether Learn can judge it at all (`supported`). Statement text is never returned.
- `add_problem` — submit your specification for a slug you inspected. The server takes the number, title, difficulty, tags, signature, and examples from LeetCode's metadata, never from you, then validates your code. It answers with every check; fix failures and submit again within the submission budget.

## Workflow

1. **Read the request.** Extract the topic or technique, the difficulty, how many problems, and anything to avoid (for example "not ones I have done"). If no count is given, the run's count applies. Never add more problems than requested.
2. **Search.** Translate the request into tag slugs and/or keywords (see the table below). Prefer several narrow searches over one broad one. Skip problems with `inBank: true`.
3. **Inspect candidates** with `get_leetcode_problem`. Drop any with `supported: false`. Prefer problems you know well enough to solve correctly and describe accurately; skip a problem rather than guess what it asks.
4. **Write the specification** (next sections) and call `add_problem`.
5. **Fix and resubmit** if a check fails. Read the failing check's detail; it names the case and both outputs. When the budget for a problem is spent, move to another candidate.
6. **Stop** once the requested number of problems is added, or when nothing suitable remains. Finish with one or two sentences summarizing what you added, in the learner's language.

## Writing the specification

`add_problem` takes:

| Field | What to write |
|---|---|
| `topicId` | One existing Learn topic id from the list `get_leetcode_problem` returns. Pick the concept the problem mainly teaches. |
| `summary` | `{ zh, en }`: an **original** 2–3 sentence description of the task: inputs, required output, and any guarantee (unique answer, any order accepted). Never copy or closely paraphrase LeetCode's statement; describe the task in your own words. |
| `constraints` | `{ zh, en }` lines with the input limits (lengths, value ranges, guarantees). |
| `hints` | Exactly three `{ zh, en }` hints, progressively stronger: 1) a direction or guiding question, 2) the key observation or invariant, 3) an outline of the algorithm. No code. |
| `explanation` | `{ zh, en }`: the solution idea with time and space complexity, shown after the learner solves the problem or opens the solution. |
| `comparator` | How outputs are compared (see below). |
| `reference` | A correct, efficient Python 3 solution. |
| `oracle` | An **independent** brute-force Python 3 solution, written differently from the reference (enumeration, simulation, or memoized search). It only runs on small inputs, so it may be slow. |
| `inputs` | One input domain per parameter (see below). |
| `hooks` | Optional Python with `adjust(args, rng, size)` and/or `valid(args)`. |
| `generator` | Optional Python `generate(seed, size)` returning one argument list; only when domains plus hooks cannot express the inputs. |
| `boundaryCases` | 3–10 argument lists covering edges: minimum sizes, duplicates, negatives, all-equal values, empty results, extreme values. |

Write Chinese and English with equal care. Use the problem's own terms (array, string, tree, …) and inline code for identifiers.

### Code conventions

- Define a **top-level function** whose name is the signature's entry (`twoSum`), not a `Solution` class. For design problems define the class named in the signature, with exactly the listed methods.
- Use only the Python standard library. `TreeNode(val, left, right)`, `ListNode(val, next)`, and `Node(val, next, random)` are provided; do not redefine them.
- **In-place problems** (signature says the function returns nothing): modify the named argument and return `None`; the judge compares that argument afterwards.
- **Harness problems** (signature names a harness): the function receives what LeetCode's function receives, for example `detectCycle(head)` without `pos`. Return nodes exactly as LeetCode expects (the actual node object); the harness reports them by index or value.
- **Design problems**: test cases are `[operations, arguments]` as on LeetCode: the first operation constructs the class, each later one calls a method. Your generator must produce valid sequences (for example never `pop` an empty stack if the problem forbids it).
- Keep each case fast: the reference must finish the largest case well within one second.

### Input domains

Each parameter gets one domain object with `type` equal to the parameter's encoding. Small cases (`size == "small"`) are checked against your oracle; two large cases (`size == "large"`) make quadratic solutions time out.

| Field | Meaning |
|---|---|
| `min`, `max` | Value range for ints (also element range for int arrays, linked lists, trees). Must lie within ±10⁹. |
| `smallMin`, `smallMax` | Narrower value range for small cases, so the oracle sees duplicates and collisions. |
| `minLength`, `maxLength` | Length range for arrays, strings, lists, trees, and matrix rows. |
| `smallMaxLength` | Upper length for small cases (keep it ≤ 10 so the oracle is fast). |
| `largeLength` | Exact length of large cases. Keep large inputs ≤ 20,000 elements; enough to time out an O(n²) solution, small enough to store. |
| `sorted` | `"asc"` or `"desc"` for sorted arrays. |
| `distinct` | `true` for distinct values. |
| `alphabet`, `smallAlphabet` | Characters for strings. |
| `word` | `{ minLength, maxLength, smallMaxLength, alphabet }` for each string in `string[]`. |
| `row` | `{ minLength, maxLength, smallMaxLength, largeLength }` for the inner length of 2-D arrays and of each list in `linked-list[]`. |
| `cell` | `{ min, max }` for int matrices, `{ alphabet, maxLength: 1 }` for character grids. |
| `shape` | `"chain"` makes large trees deep; default `"random"`. |

A `json` domain produces `None`; build that argument in `adjust`. This is how design operation lists and harness inputs are generated.

**Hooks.** `adjust(args, rng, size)` returns a new argument list (or `None` to retry), for example to plant a valid answer, keep two parameters consistent, or guarantee a unique answer. `valid(args)` returns `False` to reject a candidate. Use them whenever the problem has a precondition ("exactly one solution exists", "k ≤ n", "the answer fits in 32 bits"). Use `rng` for all randomness.

### Comparators

- `{"kind": "exact"}` — the default; use it whenever the answer is unique.
- `{"kind": "unordered"}` — the output is a list whose order does not matter (each element compared exactly).
- `{"kind": "unordered-nested"}` — a list of lists where neither the outer order nor the inner order matters (subsets, combinations).
- `{"kind": "float", "tolerance": 0.00001}` — floating-point answers.
- `{"kind": "validator", "name": ...}` — `pair-indices-sum` (two-sum style index pairs), `pair-indices-sum-one-based`, `longest-palindromic-substring`, `balanced-bst-same-inorder`. Use only when several answers are valid and one of these names fits exactly.

If several answers are valid and no comparator fits, make the answer unique with `valid` (as LeetCode's own tests do) or choose another problem.

## Common LeetCode tag slugs

`array`, `string`, `hash-table`, `two-pointers`, `sliding-window`, `prefix-sum`, `binary-search`, `sorting`, `stack`, `monotonic-stack`, `queue`, `monotonic-queue`, `heap-priority-queue`, `linked-list`, `tree`, `binary-tree`, `binary-search-tree`, `depth-first-search`, `breadth-first-search`, `graph`, `topological-sort`, `union-find`, `trie`, `backtracking`, `recursion`, `divide-and-conquer`, `dynamic-programming`, `memoization`, `greedy`, `bit-manipulation`, `math`, `matrix`, `simulation`, `design`, `counting`.

Tags combine with AND. Difficulty is `EASY`, `MEDIUM`, or `HARD`.

## Reading validator reports

- `schema` — a field is missing or malformed; the detail names it.
- `signature` — an example or boundary case does not match the parameter encodings.
- `generator` — your domains or hooks failed or produced invalid arguments.
- `reference` — your reference crashed, timed out, or returned the wrong type.
- `oracle` — reference and oracle disagree on a case; one of them is wrong. Re-derive the problem rules before changing either.
- `coverage` — a required kind of case is missing.

Fix the cause, not the symptom: never weaken the oracle to match a wrong reference.
