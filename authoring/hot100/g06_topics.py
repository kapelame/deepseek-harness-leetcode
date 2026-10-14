"""Topic 回溯 with lesson and seeded variants."""

PROBLEMS = []

TOPICS = [
    dict(
        id="backtracking", order=12,
        title=("回溯：在决策树上做选择、递归、撤销", "Backtracking: choose, explore, undo on a decision tree"),
        summary=("当答案是“所有满足条件的组合/排列/划分”时，把构造过程画成决策树，DFS 遍历它：做选择、递归、撤销选择，并尽早剪掉不可能的分支。",
                 "When the answer is every combination, permutation, or split that satisfies a rule, draw construction as a decision tree and DFS through it: choose, recurse, undo, and prune impossible branches early."),
        prerequisites=["trees"],
        problems=["subsets"],
        variants=["backtracking-subsets-with-duplicates", "backtracking-combination-sum-once"],
        lesson=dict(
            motivation=("你在规划周末：有电影、徒步、读书三件事可选，想列出所有可能的安排组合，好和朋友商量。\n\n三件事时可以手写；十件事时有 1024 种组合，必须系统地枚举，而且不能漏、不能重。\n\n把“对每件事决定做或不做”看成一棵决策树：每一层是一件事，每个分支是一种选择，每片叶子是一种完整的安排。回溯就是在这棵树上做深度优先搜索——向下走时做选择，返回时撤销选择。",
                        "You are planning a weekend with three options, a film, a hike, and a book, and want to list every possible combination to discuss with friends.\n\nWith three you can write them out; with ten there are 1024 combinations, which you must enumerate systematically without missing or repeating any.\n\nSee \"decide yes or no for each option\" as a decision tree: each level is an option, each branch a choice, each leaf a complete plan. Backtracking is a depth-first search of that tree: make a choice going down and undo it coming back."),
            strategy=("**模板**：\n```\ndef dfs(状态):\n    if 到达叶子: 记录答案; return\n    for 选择 in 当前可选:\n        if 不合法: continue      # 剪枝\n        做选择\n        dfs(新状态)\n        撤销选择\n```\n\n**去重的三种方式**：\n- 组合/子集：规定元素按下标递增选取（递归从 start 开始），避免 [1,2] 与 [2,1]。\n- 输入有重复值：排序后，同一层中跳过与前一个相同的值（`i > start and nums[i] == nums[i-1]`）。\n- 排列：用 used 数组标记已选元素。\n\n**剪枝**：剩余目标为负、括号不合法、与已放皇后冲突时立即返回。\n\n**复杂度**：与答案数量相关，例如子集 O(n·2ⁿ)、排列 O(n·n!)。",
                      "**Template**:\n```\ndef dfs(state):\n    if at a leaf: record the answer; return\n    for choice in available choices:\n        if invalid: continue      # prune\n        make the choice\n        dfs(new state)\n        undo the choice\n```\n\n**Three ways to avoid duplicates**:\n- Combinations and subsets: pick elements in increasing index order (recurse from start) so [1,2] and [2,1] are one answer.\n- Repeated input values: sort, then skip a value equal to its predecessor within the same level (`i > start and nums[i] == nums[i-1]`).\n- Permutations: mark chosen elements in a used array.\n\n**Pruning**: return immediately when the remaining target is negative, parentheses become invalid, or a queen conflicts.\n\n**Complexity**: proportional to the number of answers, for example O(n·2ⁿ) for subsets and O(n·n!) for permutations."),
            example=dict(
                title=("例：nums = [1, 2, 3] 的子集", "Example: subsets of [1, 2, 3]"),
                body=("dfs(start) 一进入就记录当前路径，再从 start 往后尝试加入元素。", "dfs(start) records the current path on entry, then tries adding each element from start onward."),
                columns=["call", "path recorded", "next choices"],
                trace=[
                    ({"call": "dfs(0)", "path recorded": "[]", "next choices": "1, 2, 3"}, ("空集也是子集。", "The empty set is a subset too.")),
                    ({"call": "dfs(1)", "path recorded": "[1]", "next choices": "2, 3"}, ("选了 1 之后，只能从 1 的后面继续选。", "After choosing 1, only later elements may follow.")),
                    ({"call": "dfs(2)", "path recorded": "[1, 2]", "next choices": "3"}, ("继续向下：[1, 2, 3] 随后被记录。", "Going deeper records [1, 2, 3] next.")),
                    ({"call": "撤销 2，选 3", "path recorded": "[1, 3]", "next choices": "—"}, ("回溯：弹出 2，尝试同层的下一个选择。", "Backtrack: pop 2 and try the next choice at that level.")),
                    ({"call": "回到 dfs(0)，选 2", "path recorded": "[2], [2, 3], [3]", "next choices": "—"}, ("从 start 开始保证 [2, 1] 不会出现。", "Starting from start guarantees [2, 1] never appears.")),
                ],
            ),
            check=[
                dict(id="undo", prompt=("回溯中“撤销选择”这一步的作用是什么？", "What does the undo step accomplish in backtracking?"),
                     options=[("让共享的路径/状态恢复到进入该分支之前，供同层的下一个选择使用", "It restores the shared path and state so the next choice at the same level starts clean"),
                              ("删除已经记录的答案", "It deletes recorded answers"),
                              ("让递归提前结束", "It ends the recursion early")],
                     answer=0, explanation=("所有分支共用同一个 path，返回前必须恢复，否则兄弟分支会带着错误的状态出发。", "All branches share one path; it must be restored before returning, or sibling branches start from the wrong state.")),
                dict(id="duplicates", prompt=("nums = [1, 2, 2] 求不重复子集时，排序后为什么跳过“同一层中与前一个相同的值”？", "For distinct subsets of [1, 2, 2], why skip a value equal to its predecessor within the same level after sorting?"),
                     options=[("同一层选第一个 2 和第二个 2 会产生完全相同的子树", "Choosing the first or the second 2 at one level yields identical subtrees"),
                              ("因为重复值不能出现在任何子集中", "Because repeated values cannot appear in any subset"),
                              ("为了让结果按字典序排列", "To sort the results lexicographically")],
                     answer=0, explanation=("[2, 2] 仍然合法：它来自不同层（先选第一个 2，下一层再选第二个 2）；只有同一层的重复选择才会产生重复子集。", "[2, 2] is still valid because the two 2s are chosen at different levels; only repeated choices within one level create duplicate subsets.")),
            ],
            practice="subsets",
            reflection=("画出 nums = [1, 2] 时子集回溯的决策树，标出每次记录答案和撤销选择的位置。", "Draw the decision tree of subset backtracking for [1, 2], marking where answers are recorded and choices undone."),
        ),
    ),
]

VARIANTS = [
    dict(
        id="backtracking-subsets-with-duplicates", parent="subsets", topic="backtracking",
        title=("含重复元素的子集", "Subsets of a Multiset"),
        summary=("数组可能含重复值，返回所有不重复的子集。", "The array may contain repeated values; return every distinct subset."),
        statement=("给定可能包含**重复**值的整数数组 `nums`，返回它的所有子集。结果中不能包含重复的子集（两个子集包含的各个值的出现次数完全相同即视为重复），子集与子集内部的顺序都不限。",
                   "Given an integer array `nums` that may contain **repeated** values, return all of its subsets. The result must not contain duplicate subsets (two subsets are duplicates when every value occurs the same number of times in both); neither the subsets nor the values inside them need any particular order."),
        difficulty="medium", skills=["backtracking", "deduplication by sorting"],
        differences=[("input-structure", ("输入可能有重复值，原来的枚举会产生重复子集。", "The input may repeat values, so plain enumeration produces duplicate subsets.")),
                     ("reasoning", ("需要排序并在同一层跳过相同的值，同时保留 [2, 2] 这类来自不同层的组合。", "You must sort and skip equal values within a level while keeping combinations like [2, 2] that come from different levels."))],
        transfer=("“dfs(start) 进入即记录、从 start 往后选”的子集模板不变；新增的是排序与同层去重。",
                  "The subset template, recording on entry and choosing from start onward, stays; sorting and same-level deduplication are new."),
        entry="subsetsWithDup", params=[("nums", "int[]")], returns="int[][]", comparator={"kind": "unordered-nested"},
        constraints=[("1 ≤ n ≤ 10，-10 ≤ nums[i] ≤ 10", "1 ≤ n ≤ 10, -10 ≤ nums[i] ≤ 10")],
        examples=[[[1, 2, 2]], [[0]], [[2, 1, 2, 1]]],
        boundary=[[[5]], [[1, 1]], [[3, 3, 3]], [[-10, 10, -10]]],
        inputs=[{"type": "int[]", "minLength": 1, "maxLength": 10, "smallMaxLength": 6, "largeLength": 10, "min": -10, "max": 10, "smallMin": 0, "smallMax": 2}],
        hints=[("先排序，让相同的值挨在一起。", "Sort first so equal values sit together."),
               ("在 dfs(start) 的循环里，如果 i > start 且 nums[i] == nums[i-1]，说明这个值在本层已经试过了。", "Inside dfs(start), when i > start and nums[i] == nums[i-1], that value was already tried at this level."),
               ("跳过它即可；注意 i == start 时不能跳过，否则 [2, 2] 会被漏掉。", "Skip it, but never when i == start, or subsets like [2, 2] would be lost.")],
        reference='''
def subsetsWithDup(nums):
    nums = sorted(nums)
    out, path = [], []
    def dfs(start):
        out.append(path[:])
        for i in range(start, len(nums)):
            if i > start and nums[i] == nums[i - 1]:
                continue
            path.append(nums[i])
            dfs(i + 1)
            path.pop()
    dfs(0)
    return out
''',
        oracle='''
def subsetsWithDup(nums):
    seen = set()
    for mask in range(1 << len(nums)):
        seen.add(tuple(sorted(nums[i] for i in range(len(nums)) if mask >> i & 1)))
    return [list(s) for s in seen]
''',
        mutants={
            "no-dedup": '''
def subsetsWithDup(nums):
    out, path = [], []
    def dfs(start):
        out.append(path[:])
        for i in range(start, len(nums)):
            path.append(nums[i])
            dfs(i + 1)
            path.pop()
    dfs(0)
    return out
''',
            "over-dedup": '''
def subsetsWithDup(nums):
    nums = sorted(nums)
    out, path = [], []
    def dfs(start):
        out.append(path[:])
        for i in range(start, len(nums)):
            if i > 0 and nums[i] == nums[i - 1]:
                continue
            path.append(nums[i])
            dfs(i + 1)
            path.pop()
    dfs(0)
    return out
''',
        },
    ),
    dict(
        id="backtracking-combination-sum-once", parent="combination-sum", topic="backtracking",
        title=("每个数只用一次的组合总和", "Combination Sum Using Each Number Once"),
        summary=("候选数可能重复，每个位置的数最多用一次，求所有和为 target 的不重复组合。", "Candidates may repeat and each position may be used once; return every distinct combination summing to target."),
        statement=("给定可能包含重复值的正整数数组 `candidates` 和正整数 `target`，找出所有和为 `target` 的组合。`candidates` 中的**每个位置**在一个组合里最多使用一次。\n\n结果中不能有重复的组合（各值出现次数相同即视为重复），组合之间与组合内部的顺序都不限。",
                   "Given positive integers `candidates`, which may contain repeated values, and a positive `target`, find every combination that sums to `target`. Each **position** in `candidates` may be used at most once per combination.\n\nThe result must not contain duplicate combinations (equal counts of every value); neither the combinations nor their contents need any particular order."),
        difficulty="medium", skills=["backtracking", "pruning", "deduplication by sorting"],
        differences=[("constraints", ("每个元素最多用一次，递归时要从 i + 1 开始，而不是 i。", "Each element may be used once, so recursion continues from i + 1 instead of i.")),
                     ("input-structure", ("候选数可能有重复值，需要同层去重。", "Candidates may repeat, which needs same-level deduplication."))],
        transfer=("组合总和的回溯框架与“剩余目标为负就剪枝”保持不变；变化在于递归起点改为 i + 1，并加入排序后的同层去重。",
                  "The combination-sum backtracking frame and its negative-remainder pruning carry over; the recursion starts at i + 1 and sorted same-level deduplication is added."),
        entry="combinationSum2", params=[("candidates", "int[]"), ("target", "int")], returns="int[][]", comparator={"kind": "unordered-nested"},
        constraints=[("1 ≤ n ≤ 100，1 ≤ candidates[i] ≤ 50，1 ≤ target ≤ 30", "1 ≤ n ≤ 100, 1 ≤ candidates[i] ≤ 50, 1 ≤ target ≤ 30")],
        examples=[[[10, 1, 2, 7, 6, 1, 5], 8], [[2, 5, 2, 1, 2], 5]],
        boundary=[[[1], 1], [[1], 2], [[2, 2], 2], [[1, 1, 1], 2], [[50], 30]],
        inputs=[{"type": "int[]", "minLength": 1, "maxLength": 100, "smallMaxLength": 8, "largeLength": 40, "min": 1, "max": 50, "smallMin": 1, "smallMax": 5},
                {"type": "int", "min": 1, "max": 30, "smallMin": 1, "smallMax": 9}],
        hints=[("和“组合总和”比，哪里需要改动才能保证每个位置只用一次？", "Compared with combination sum, what changes so each position is used once?"),
               ("递归调用传 i + 1；为了不产生重复组合，先排序，同一层跳过与前一个相同的值。", "Recurse with i + 1; to avoid duplicate combinations, sort and skip a value equal to the previous one within a level."),
               ("排序后，候选数大于剩余目标时可以直接 break。", "After sorting, break as soon as a candidate exceeds the remaining target.")],
        reference='''
def combinationSum2(candidates, target):
    candidates = sorted(candidates)
    out, path = [], []
    def dfs(start, remain):
        if remain == 0:
            out.append(path[:])
            return
        for i in range(start, len(candidates)):
            if i > start and candidates[i] == candidates[i - 1]:
                continue
            if candidates[i] > remain:
                break
            path.append(candidates[i])
            dfs(i + 1, remain - candidates[i])
            path.pop()
    dfs(0, target)
    return out
''',
        oracle='''
def combinationSum2(candidates, target):
    found = set()
    def walk(i, remain, chosen):
        if remain == 0:
            found.add(tuple(sorted(chosen)))
            return
        if i == len(candidates) or remain < 0:
            return
        walk(i + 1, remain - candidates[i], chosen + [candidates[i]])
        walk(i + 1, remain, chosen)
    walk(0, target, [])
    return [list(c) for c in found]
''',
        mutants={
            "reuse": '''
def combinationSum2(candidates, target):
    candidates = sorted(set(candidates))
    out, path = [], []
    def dfs(start, remain):
        if remain == 0:
            out.append(path[:])
            return
        for i in range(start, len(candidates)):
            if candidates[i] > remain:
                break
            path.append(candidates[i])
            dfs(i, remain - candidates[i])
            path.pop()
    dfs(0, target)
    return out
''',
            "no-dedup": '''
def combinationSum2(candidates, target):
    candidates = sorted(candidates)
    out, path = [], []
    def dfs(start, remain):
        if remain == 0:
            out.append(path[:])
            return
        for i in range(start, len(candidates)):
            if candidates[i] > remain:
                break
            path.append(candidates[i])
            dfs(i + 1, remain - candidates[i])
            path.pop()
    dfs(0, target)
    return out
''',
        },
    ),
]
