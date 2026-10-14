"""Hot 100 groups 回溯 / 二分查找 / 栈 (problems not shipped before)."""

ORIGINAL = ("（本课程原创简述，完整题面见 LeetCode 官方页面。）", " (Original summary written for Learn; see LeetCode for the official statement.)")


def summary(zh, en):
    return (zh + ORIGINAL[0], en + ORIGINAL[1])


PROBLEMS = [
    dict(
        slug="permutations", topics=["backtracking"], entry="permute",
        params=[("nums", "int[]")], returns="int[][]", comparator={"kind": "unordered"},
        summary=summary("给定互不相同的整数数组，返回它的所有全排列，顺序不限。", "Given distinct integers, return every permutation in any order."),
        constraints=[("1 ≤ n ≤ 6，-10 ≤ nums[i] ≤ 10，元素互不相同", "1 ≤ n ≤ 6, -10 ≤ nums[i] ≤ 10, all distinct")],
        hints=[("把生成排列看成逐位填空：第一位有 n 种选择，第二位有 n-1 种……", "Build a permutation one position at a time: n choices for the first, n-1 for the second, and so on."),
               ("用 used 数组记录哪些数已被选入当前路径。", "Track which numbers are already on the current path with a used array."),
               ("路径长度等于 n 时记录一个答案；递归返回后撤销选择（回溯）。", "Record an answer when the path has n numbers; undo the choice after the recursive call returns.")],
        explanation=("回溯：在决策树上做 DFS，每层选择一个未使用的数，到叶子记录路径，返回时撤销。共 n! 个结果，时间 O(n·n!)。",
                     "Backtracking: DFS over the decision tree picks an unused number per level, records the path at a leaf, and undoes the choice on return. n! results, O(n·n!) time."),
        boundary=[[[1]], [[0, 1]], [[-10, 10, 0]]],
        inputs=[{"type": "int[]", "minLength": 1, "maxLength": 6, "smallMaxLength": 4, "largeLength": 6, "min": -10, "max": 10, "distinct": True}],
        reference='''
def permute(nums):
    out, path, used = [], [], [False] * len(nums)
    def dfs():
        if len(path) == len(nums):
            out.append(path[:])
            return
        for i, x in enumerate(nums):
            if not used[i]:
                used[i] = True
                path.append(x)
                dfs()
                path.pop()
                used[i] = False
    dfs()
    return out
''',
        oracle='''
import itertools
def permute(nums):
    return [list(p) for p in itertools.permutations(nums)]
''',
    ),
    dict(
        slug="subsets", topics=["backtracking"], entry="subsets",
        params=[("nums", "int[]")], returns="int[][]", comparator={"kind": "unordered-nested"},
        summary=summary("给定互不相同的整数数组，返回它的所有子集（幂集），不能包含重复子集，顺序不限。", "Given distinct integers, return every subset (the power set) without duplicates, in any order."),
        constraints=[("1 ≤ n ≤ 10，-10 ≤ nums[i] ≤ 10，元素互不相同", "1 ≤ n ≤ 10, -10 ≤ nums[i] ≤ 10, all distinct")],
        hints=[("每个元素只有两种状态：选或不选。", "Each element is either in or out."),
               ("递归到第 i 个元素时，分别走“选它”和“不选它”两条分支。", "At element i, recurse once with it and once without it."),
               ("或者按起点枚举：dfs(start) 每进入一次就记录当前路径，再从 start 往后依次尝试加入元素。", "Or enumerate by start: dfs(start) records the current path on entry, then tries adding each later element.")],
        explanation=("回溯枚举每个元素的选/不选，共 2ⁿ 个子集，时间 O(n·2ⁿ)。", "Backtracking over in/out for each element yields 2ⁿ subsets in O(n·2ⁿ) time."),
        boundary=[[[0]], [[1, 2]], [[-10, 10, 0]]],
        inputs=[{"type": "int[]", "minLength": 1, "maxLength": 10, "smallMaxLength": 5, "largeLength": 10, "min": -10, "max": 10, "distinct": True}],
        reference='''
def subsets(nums):
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
        oracle='''
def subsets(nums):
    return [[nums[i] for i in range(len(nums)) if mask >> i & 1] for mask in range(1 << len(nums))]
''',
    ),
    dict(
        slug="letter-combinations-of-a-phone-number", topics=["backtracking"], entry="letterCombinations",
        params=[("digits", "string")], returns="string[]", comparator={"kind": "unordered"},
        summary=summary("电话按键 2–9 各对应几个字母（2→abc，3→def，…，7→pqrs，9→wxyz）。给定数字串，返回它能表示的所有字母组合，顺序不限；输入为空时返回空列表。",
                        "Phone keys 2–9 map to letters (2→abc, 3→def, …, 7→pqrs, 9→wxyz). Return every letter combination the digits can spell, in any order; an empty input gives an empty list."),
        constraints=[("0 ≤ |digits| ≤ 4，digits[i] ∈ ['2', '9']", "0 ≤ |digits| ≤ 4, digits[i] in ['2', '9']")],
        hints=[("每一位数字提供几个候选字母，组合数是它们的乘积。", "Each digit offers a few letters; the count of combinations is their product."),
               ("按位置递归：第 i 层从第 i 个数字的字母中选一个。", "Recurse by position: level i picks one letter of digit i."),
               ("注意空输入要返回 []，而不是 [\"\"]。", "Note that empty input returns [], not [\"\"].")],
        explanation=("回溯逐位选择字母，共 ∏(候选数) 个结果，时间 O(4ⁿ·n)。", "Backtracking picks one letter per digit, producing the product of the choices, O(4ⁿ·n) time."),
        boundary=[[""], ["2"], ["7"], ["79"]],
        inputs=[{"type": "string", "minLength": 0, "maxLength": 4, "smallMaxLength": 3, "largeLength": 4, "alphabet": "23456789"}],
        reference='''
def letterCombinations(digits):
    keys = {"2": "abc", "3": "def", "4": "ghi", "5": "jkl", "6": "mno", "7": "pqrs", "8": "tuv", "9": "wxyz"}
    if not digits:
        return []
    out, path = [], []
    def dfs(i):
        if i == len(digits):
            out.append("".join(path))
            return
        for ch in keys[digits[i]]:
            path.append(ch)
            dfs(i + 1)
            path.pop()
    dfs(0)
    return out
''',
        oracle='''
import itertools
def letterCombinations(digits):
    keys = {"2": "abc", "3": "def", "4": "ghi", "5": "jkl", "6": "mno", "7": "pqrs", "8": "tuv", "9": "wxyz"}
    if not digits:
        return []
    return ["".join(p) for p in itertools.product(*(keys[d] for d in digits))]
''',
    ),
    dict(
        slug="combination-sum", topics=["backtracking"], entry="combinationSum",
        params=[("candidates", "int[]"), ("target", "int")], returns="int[][]", comparator={"kind": "unordered-nested"},
        summary=summary("给定互不相同的正整数 candidates 和目标 target，找出所有和为 target 的组合；同一个数可以无限次使用。组合之间不能重复（只看各数出现次数），顺序不限。",
                        "Given distinct positive integers and a target, return every combination summing to target; a number may be reused without limit. Combinations are unique by the count of each number, in any order."),
        constraints=[("1 ≤ n ≤ 30，2 ≤ candidates[i] ≤ 40，1 ≤ target ≤ 40", "1 ≤ n ≤ 30, 2 ≤ candidates[i] ≤ 40, 1 ≤ target ≤ 40")],
        hints=[("怎样避免 [2,3] 和 [3,2] 被当成两个组合？", "How do you avoid counting [2,3] and [3,2] as different combinations?"),
               ("规定组合内元素按下标非递减选取：递归时从当前下标开始，而不是从 0 开始。", "Pick elements in non-decreasing index order: recurse from the current index rather than from 0."),
               ("可以重复使用当前数，所以递归时仍传当前下标 i；剩余目标为负时剪枝。", "The current number may repeat, so recurse with index i itself; prune when the remaining target goes negative.")],
        explanation=("回溯 + 起始下标去重，并对剩余目标剪枝（候选排序后可提前结束循环）。", "Backtracking with a start index for uniqueness and pruning on the remaining target; sorting the candidates lets the loop stop early."),
        boundary=[[[2], 1], [[2], 2], [[7, 3, 2], 7], [[40], 40]],
        inputs=[{"type": "int[]", "minLength": 1, "maxLength": 30, "smallMaxLength": 4, "largeLength": 12, "min": 2, "max": 40, "smallMin": 2, "smallMax": 9, "distinct": True},
                {"type": "int", "min": 1, "max": 40, "smallMin": 1, "smallMax": 14}],
        reference='''
def combinationSum(candidates, target):
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
            dfs(i, remain - candidates[i])
            path.pop()
    dfs(0, target)
    return out
''',
        oracle='''
def combinationSum(candidates, target):
    results = set()
    def build(remain, chosen):
        if remain == 0:
            results.add(tuple(sorted(chosen)))
            return
        for c in candidates:
            if c <= remain:
                build(remain - c, chosen + [c])
    build(target, [])
    return [list(r) for r in results]
''',
    ),
    dict(
        slug="generate-parentheses", topics=["backtracking"], entry="generateParenthesis",
        params=[("n", "int")], returns="string[]", comparator={"kind": "unordered"},
        summary=summary("生成所有由 n 对括号组成的合法括号串，顺序不限。", "Generate every well-formed string of n pairs of parentheses, in any order."),
        constraints=[("1 ≤ n ≤ 8", "1 ≤ n ≤ 8")],
        hints=[("在构造过程中，什么时候可以放一个左括号？什么时候可以放右括号？", "While building, when may you add an opening parenthesis, and when a closing one?"),
               ("左括号用了不到 n 个就能放左括号；右括号数少于左括号数才能放右括号。", "Add '(' while fewer than n are used; add ')' only while there are fewer ')' than '('."),
               ("满足这两个条件的回溯只会生成合法串，不需要事后检查。", "Backtracking under these two rules only produces valid strings, so no final check is needed.")],
        explanation=("带约束的回溯：维护已用左、右括号数，只在合法前提下扩展。结果数为卡特兰数。", "Constrained backtracking: count opens and closes and extend only while the prefix stays valid. The result count is a Catalan number."),
        boundary=[[1], [2], [3]],
        inputs=[{"type": "int", "min": 1, "max": 8, "smallMin": 1, "smallMax": 4}],
        reference='''
def generateParenthesis(n):
    out = []
    def dfs(path, opened, closed):
        if len(path) == 2 * n:
            out.append(path)
            return
        if opened < n:
            dfs(path + "(", opened + 1, closed)
        if closed < opened:
            dfs(path + ")", opened, closed + 1)
    dfs("", 0, 0)
    return out
''',
        oracle='''
import itertools
def generateParenthesis(n):
    def valid(s):
        depth = 0
        for ch in s:
            depth += 1 if ch == "(" else -1
            if depth < 0:
                return False
        return depth == 0
    return ["".join(p) for p in itertools.product("()", repeat=2 * n) if valid(p)]
''',
    ),
    dict(
        slug="word-search", topics=["backtracking"], entry="exist", perCaseMs=3000,
        params=[("board", "string[][]"), ("word", "string")], returns="bool",
        summary=summary("在字符网格中判断能否找到单词：单词由上下左右相邻的格子按顺序组成，同一个格子不能重复使用。", "Decide whether the word appears in the grid as a path of horizontally or vertically adjacent cells, using each cell at most once."),
        constraints=[("1 ≤ m, n ≤ 6，1 ≤ |word| ≤ 15，由大小写英文字母组成", "1 ≤ m, n ≤ 6, 1 ≤ |word| ≤ 15, upper- and lowercase letters")],
        hints=[("从每个与首字母相同的格子出发尝试。", "Try every cell that matches the first letter."),
               ("DFS 匹配第 k 个字母时，向四个方向找第 k+1 个；当前格子在路径中时不能再用。", "When matching letter k, look in four directions for letter k+1; a cell on the current path cannot be reused."),
               ("进入格子时临时标记（例如改成 '#'），返回时恢复，这就是回溯。", "Mark a cell when entering (for example as '#') and restore it on return: that is the backtracking.")],
        explanation=("对每个起点做 DFS 回溯，访问时临时标记格子。最坏 O(mn·3^L)，L 为单词长度。", "DFS backtracking from every start, temporarily marking visited cells. Worst case O(mn·3^L) for word length L."),
        boundary=[[[["a"]], "a"], [[["a"]], "b"], [[["a", "b"]], "ba"], [[["a", "a"]], "aaa"], [[["A", "B"], ["C", "D"]], "ABDC"]],
        inputs=[{"type": "string[][]", "minLength": 1, "maxLength": 6, "smallMaxLength": 3, "largeLength": 6, "row": {"minLength": 1, "maxLength": 6, "smallMaxLength": 3, "largeLength": 6}, "cell": {"alphabet": "ab", "maxLength": 1}},
                {"type": "string", "minLength": 1, "maxLength": 15, "smallMaxLength": 4, "largeLength": 10, "alphabet": "ab"}],
        hooks='''
def adjust(args, rng, size):
    board, word = args
    board = [[cell if cell else "a" for cell in row] for row in board]
    if rng.random() < 0.5:
        rows, cols = len(board), len(board[0])
        r, c = rng.randrange(rows), rng.randrange(cols)
        path = [(r, c)]
        while len(path) < min(len(word), rows * cols):
            options = [(r + dr, c + dc) for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1))
                       if 0 <= r + dr < rows and 0 <= c + dc < cols and (r + dr, c + dc) not in path]
            if not options:
                break
            r, c = rng.choice(options)
            path.append((r, c))
        word = "".join(board[i][j] for i, j in path)
    return [board, word]
''',
        reference='''
def exist(board, word):
    rows, cols = len(board), len(board[0])
    def dfs(r, c, k):
        if board[r][c] != word[k]:
            return False
        if k == len(word) - 1:
            return True
        saved, board[r][c] = board[r][c], "#"
        found = any(0 <= nr < rows and 0 <= nc < cols and dfs(nr, nc, k + 1)
                    for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)))
        board[r][c] = saved
        return found
    return any(dfs(r, c, 0) for r in range(rows) for c in range(cols))
''',
        oracle='''
def exist(board, word):
    rows, cols = len(board), len(board[0])
    paths = [[(r, c)] for r in range(rows) for c in range(cols) if board[r][c] == word[0]]
    for k in range(1, len(word)):
        nxt = []
        for path in paths:
            r, c = path[-1]
            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= nr < rows and 0 <= nc < cols and (nr, nc) not in path and board[nr][nc] == word[k]:
                    nxt.append(path + [(nr, nc)])
        paths = nxt
    return bool(paths)
''',
    ),
    dict(
        slug="palindrome-partitioning", topics=["backtracking"], entry="partition",
        params=[("s", "string")], returns="string[][]", comparator={"kind": "unordered"},
        summary=summary("把字符串分割成若干子串，使每个子串都是回文串，返回所有可能的分割方案，方案之间顺序不限。", "Split the string into substrings that are all palindromes and return every such split, in any order."),
        constraints=[("1 ≤ |s| ≤ 16，只含小写字母", "1 ≤ |s| ≤ 16, lowercase letters")],
        hints=[("第一刀切在哪里？切下的前缀必须是回文。", "Where does the first cut go? The prefix cut off must be a palindrome."),
               ("对每个回文前缀，递归处理剩下的后缀。", "For each palindromic prefix, recurse on the remaining suffix."),
               ("可以先用动态规划预处理 isPal[i][j]，让每次判断 O(1)。", "Precompute isPal[i][j] with dynamic programming so each check is O(1).")],
        explanation=("回溯枚举切分位置，只沿回文前缀深入；预处理回文表后每步判断 O(1)。最坏 O(n·2ⁿ)。", "Backtracking enumerates cut positions, descending only through palindromic prefixes; a precomputed palindrome table makes each check O(1). Worst case O(n·2ⁿ)."),
        boundary=[["a"], ["aa"], ["ab"], ["aab"], ["aaaa"]],
        inputs=[{"type": "string", "minLength": 1, "maxLength": 16, "smallMaxLength": 6, "largeLength": 14, "alphabet": "ab"}],
        reference='''
def partition(s):
    n = len(s)
    pal = [[False] * n for _ in range(n)]
    for i in range(n - 1, -1, -1):
        for j in range(i, n):
            pal[i][j] = s[i] == s[j] and (j - i < 2 or pal[i + 1][j - 1])
    out, path = [], []
    def dfs(i):
        if i == n:
            out.append(path[:])
            return
        for j in range(i, n):
            if pal[i][j]:
                path.append(s[i:j + 1])
                dfs(j + 1)
                path.pop()
    dfs(0)
    return out
''',
        oracle='''
def partition(s):
    out = []
    n = len(s)
    for mask in range(1 << (n - 1)):
        parts, start = [], 0
        for i in range(n - 1):
            if mask >> i & 1:
                parts.append(s[start:i + 1])
                start = i + 1
        parts.append(s[start:])
        if all(p == p[::-1] for p in parts):
            out.append(parts)
    return out
''',
    ),
    dict(
        slug="n-queens", topics=["backtracking"], entry="solveNQueens",
        params=[("n", "int")], returns="string[][]", comparator={"kind": "unordered"},
        summary=summary("在 n×n 棋盘上放置 n 个皇后，使它们互不攻击（不同行、不同列、不在同一斜线上）。返回所有方案，每个方案用 n 个字符串表示棋盘，'Q' 为皇后、'.' 为空位。",
                        "Place n queens on an n×n board so no two attack each other (no shared row, column, or diagonal). Return every solution as n strings with 'Q' for a queen and '.' for an empty square."),
        constraints=[("1 ≤ n ≤ 9", "1 ≤ n ≤ 9")],
        hints=[("每行恰好放一个皇后，所以可以逐行决定它在哪一列。", "Each row holds exactly one queen, so decide its column row by row."),
               ("记录已占用的列、主对角线（r - c）和副对角线（r + c）。", "Track occupied columns, main diagonals (r - c), and anti-diagonals (r + c)."),
               ("放下皇后后递归下一行，返回时把三个集合恢复。", "After placing a queen, recurse to the next row and restore the three sets on return.")],
        explanation=("逐行回溯，用三个集合 O(1) 判断冲突。搜索量远小于 nⁿ。", "Row-by-row backtracking with three sets for O(1) conflict checks; the search is far smaller than nⁿ."),
        boundary=[[1], [2], [3], [4]],
        inputs=[{"type": "int", "min": 1, "max": 9, "smallMin": 1, "smallMax": 6}],
        reference='''
def solveNQueens(n):
    out, cols, diag, anti, place = [], set(), set(), set(), []
    def dfs(r):
        if r == n:
            out.append(["." * c + "Q" + "." * (n - c - 1) for c in place])
            return
        for c in range(n):
            if c in cols or r - c in diag or r + c in anti:
                continue
            cols.add(c); diag.add(r - c); anti.add(r + c); place.append(c)
            dfs(r + 1)
            cols.remove(c); diag.remove(r - c); anti.remove(r + c); place.pop()
    dfs(0)
    return out
''',
        oracle='''
import itertools
def solveNQueens(n):
    out = []
    for perm in itertools.permutations(range(n)):
        if len({r - c for r, c in enumerate(perm)}) == n and len({r + c for r, c in enumerate(perm)}) == n:
            out.append(["." * c + "Q" + "." * (n - c - 1) for c in perm])
    return out
''',
    ),
    dict(
        slug="search-a-2d-matrix", topics=["binary-search"], entry="searchMatrix",
        params=[("matrix", "int[][]"), ("target", "int")], returns="bool",
        summary=summary("矩阵每行递增，且每行第一个数大于上一行最后一个数。判断 target 是否在矩阵中，要求 O(log(mn))。", "Rows are increasing and each row starts above the previous row's end; report whether target is present in O(log(mn))."),
        constraints=[("1 ≤ m, n ≤ 100，-10⁴ ≤ 元素, target ≤ 10⁴", "1 ≤ m, n ≤ 100, -10⁴ ≤ values, target ≤ 10⁴")],
        hints=[("把整个矩阵按行拼起来，会得到什么样的一维数组？", "If you concatenate the rows, what kind of 1-D array do you get?"),
               ("一个有序数组，长度 m·n。下标 k 对应 matrix[k // n][k % n]。", "A sorted array of length m·n, where index k maps to matrix[k // n][k % n]."),
               ("在 [0, mn-1] 上做普通二分查找。", "Run an ordinary binary search over [0, mn-1].")],
        explanation=("把矩阵视为有序一维数组做二分，下标换算为行列。时间 O(log(mn))，空间 O(1)。", "Binary search over the matrix viewed as one sorted array, converting indices to row and column. O(log(mn)) time, O(1) space."),
        boundary=[[[[1]], 1], [[[1]], 2], [[[1, 3]], 3], [[[1], [3]], 2], [[[-10000, 10000]], 10000]],
        inputs=[{"type": "int[][]", "minLength": 1, "maxLength": 100, "smallMaxLength": 4, "largeLength": 100, "row": {"minLength": 1, "maxLength": 100, "smallMaxLength": 4, "largeLength": 100}, "cell": {"min": 0, "max": 0}},
                {"type": "int", "min": -10000, "max": 10000}],
        hooks='''
def adjust(args, rng, size):
    grid, _ = args
    rows, cols = len(grid), len(grid[0])
    values = sorted(rng.sample(range(-10000, 10001), rows * cols))
    matrix = [values[r * cols:(r + 1) * cols] for r in range(rows)]
    target = rng.choice(values) if rng.random() < 0.5 else rng.randint(values[0] - 2, values[-1] + 2)
    return [matrix, target]
''',
        reference='''
def searchMatrix(matrix, target):
    rows, cols = len(matrix), len(matrix[0])
    lo, hi = 0, rows * cols - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        value = matrix[mid // cols][mid % cols]
        if value == target:
            return True
        if value < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return False
''',
        oracle='''
def searchMatrix(matrix, target):
    return any(target in row for row in matrix)
''',
    ),
    dict(
        slug="find-first-and-last-position-of-element-in-sorted-array", topics=["binary-search"], entry="searchRange",
        params=[("nums", "int[]"), ("target", "int")], returns="int[]",
        summary=summary("在非递减数组中找出 target 第一次和最后一次出现的下标；不存在则返回 [-1, -1]。要求 O(log n)。", "In a non-decreasing array, return the first and last index of target, or [-1, -1] if absent, in O(log n)."),
        constraints=[("0 ≤ n ≤ 10⁵，-10⁹ ≤ nums[i], target ≤ 10⁹，nums 非递减", "0 ≤ n ≤ 10⁵, -10⁹ ≤ nums[i], target ≤ 10⁹, nums non-decreasing")],
        hints=[("找到一个 target 后向两边扩展，最坏会退化成 O(n)。", "Finding one target and expanding outward degrades to O(n) in the worst case."),
               ("做两次二分：一次找“第一个 ≥ target”的位置，一次找“第一个 > target”的位置。", "Run two binary searches: the first position ≥ target and the first position > target."),
               ("左边界 = lower_bound(target)，右边界 = lower_bound(target + 1) - 1；左边界越界或值不等时返回 [-1, -1]。", "Left = lower_bound(target), right = lower_bound(target + 1) - 1; if left is out of range or holds another value, return [-1, -1].")],
        explanation=("两次下界二分确定区间两端。时间 O(log n)，空间 O(1)。", "Two lower-bound searches find both ends. O(log n) time, O(1) space."),
        boundary=[[[], 0], [[1], 1], [[1], 2], [[2, 2], 2], [[1, 2, 2, 3], 2]],
        inputs=[{"type": "int[]", "minLength": 0, "smallMaxLength": 8, "largeLength": 20000, "min": -1000000000, "max": 1000000000, "smallMin": 0, "smallMax": 4, "sorted": "asc"},
                {"type": "int", "min": -1000000000, "max": 1000000000, "smallMin": -1, "smallMax": 5}],
        hooks='''
def adjust(args, rng, size):
    nums, target = args
    if size == "large":
        nums = sorted(rng.randint(0, 50) for _ in range(len(nums)))
        target = rng.randint(-1, 51)
    return [nums, target]
''',
        reference='''
import bisect
def searchRange(nums, target):
    left = bisect.bisect_left(nums, target)
    if left == len(nums) or nums[left] != target:
        return [-1, -1]
    return [left, bisect.bisect_right(nums, target) - 1]
''',
        oracle='''
def searchRange(nums, target):
    hits = [i for i, x in enumerate(nums) if x == target]
    return [hits[0], hits[-1]] if hits else [-1, -1]
''',
    ),
    dict(
        slug="search-in-rotated-sorted-array", topics=["binary-search"], entry="search",
        params=[("nums", "int[]"), ("target", "int")], returns="int",
        summary=summary("一个元素互不相同的升序数组在某个位置被旋转过（如 [4,5,6,7,0,1,2]）。在其中查找 target，返回下标，不存在返回 -1。要求 O(log n)。",
                        "A sorted array of distinct values was rotated at some pivot (such as [4,5,6,7,0,1,2]). Return the index of target or -1, in O(log n)."),
        constraints=[("1 ≤ n ≤ 5000，-10⁴ ≤ nums[i], target ≤ 10⁴，元素互不相同", "1 ≤ n ≤ 5000, -10⁴ ≤ nums[i], target ≤ 10⁴, distinct values")],
        hints=[("从中点切开后，左右两半中至少有一半是有序的。", "After splitting at the middle, at least one half is sorted."),
               ("比较 nums[lo] 与 nums[mid] 判断哪一半有序。", "Compare nums[lo] with nums[mid] to tell which half is sorted."),
               ("若 target 落在有序那一半的范围内，就去那一半；否则去另一半。", "If target lies within the sorted half's range, search there; otherwise search the other half.")],
        explanation=("二分时先判断哪一侧有序，再根据 target 是否落在该侧范围决定方向。时间 O(log n)，空间 O(1)。", "At each step determine the sorted side and go there only if target falls within its range. O(log n) time, O(1) space."),
        boundary=[[[1], 1], [[1], 0], [[3, 1], 1], [[1, 3], 3], [[5, 1, 3], 5]],
        inputs=[{"type": "int[]", "minLength": 1, "maxLength": 5000, "smallMaxLength": 8, "largeLength": 5000, "min": -10000, "max": 10000, "smallMin": -8, "smallMax": 8, "distinct": True, "sorted": "asc"},
                {"type": "int", "min": -10000, "max": 10000, "smallMin": -9, "smallMax": 9}],
        hooks='''
def adjust(args, rng, size):
    nums, target = args
    k = rng.randrange(len(nums))
    nums = nums[k:] + nums[:k]
    if rng.random() < 0.6:
        target = rng.choice(nums)
    return [nums, target]
''',
        reference='''
def search(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[lo] <= nums[mid]:
            if nums[lo] <= target < nums[mid]:
                hi = mid - 1
            else:
                lo = mid + 1
        else:
            if nums[mid] < target <= nums[hi]:
                lo = mid + 1
            else:
                hi = mid - 1
    return -1
''',
        oracle='''
def search(nums, target):
    return nums.index(target) if target in nums else -1
''',
    ),
    dict(
        slug="find-minimum-in-rotated-sorted-array", topics=["binary-search"], entry="findMin",
        params=[("nums", "int[]")], returns="int",
        summary=summary("元素互不相同的升序数组被旋转过若干次。返回其中的最小值，要求 O(log n)。", "A sorted array of distinct values was rotated some number of times; return its minimum in O(log n)."),
        constraints=[("1 ≤ n ≤ 5000，-5000 ≤ nums[i] ≤ 5000，元素互不相同", "1 ≤ n ≤ 5000, -5000 ≤ nums[i] ≤ 5000, distinct values")],
        hints=[("最小值就是旋转点。拿 nums[mid] 和谁比较能判断旋转点在哪一侧？", "The minimum is the rotation point. Comparing nums[mid] with what tells you its side?"),
               ("和 nums[hi] 比较：nums[mid] > nums[hi] 说明最小值在 mid 右边。", "Compare with nums[hi]: if nums[mid] > nums[hi], the minimum lies right of mid."),
               ("否则最小值在 [lo, mid]（mid 本身可能就是最小值），令 hi = mid；lo == hi 时结束。", "Otherwise it is in [lo, mid], since mid itself may be the minimum; set hi = mid and stop when lo == hi.")],
        explanation=("与右端点比较的二分：始终保持最小值在 [lo, hi] 中。时间 O(log n)，空间 O(1)。", "Binary search against the right end keeps the minimum inside [lo, hi]. O(log n) time, O(1) space."),
        boundary=[[[1]], [[2, 1]], [[1, 2]], [[3, 4, 5, 1, 2]], [[-5000, 5000]]],
        inputs=[{"type": "int[]", "minLength": 1, "maxLength": 5000, "smallMaxLength": 8, "largeLength": 5000, "min": -5000, "max": 5000, "distinct": True, "sorted": "asc"}],
        hooks='''
def adjust(args, rng, size):
    nums = args[0]
    k = rng.randrange(len(nums))
    return [nums[k:] + nums[:k]]
''',
        reference='''
def findMin(nums):
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] > nums[hi]:
            lo = mid + 1
        else:
            hi = mid
    return nums[lo]
''',
        oracle='''
def findMin(nums):
    smallest = nums[0]
    for x in nums:
        if x < smallest:
            smallest = x
    return smallest
''',
    ),
    dict(
        slug="median-of-two-sorted-arrays", topics=["binary-search"], entry="findMedianSortedArrays",
        params=[("nums1", "int[]"), ("nums2", "int[]")], returns="float", comparator={"kind": "float", "tolerance": 0.00001},
        summary=summary("给定两个升序数组，求合并后的中位数，要求 O(log(m+n))。", "Given two sorted arrays, return the median of their union in O(log(m+n))."),
        constraints=[("0 ≤ m, n ≤ 1000，1 ≤ m + n ≤ 2000，-10⁶ ≤ 元素 ≤ 10⁶；答案误差不超过 10⁻⁵", "0 ≤ m, n ≤ 1000, 1 ≤ m + n ≤ 2000, -10⁶ ≤ values ≤ 10⁶; answers within 10⁻⁵ are accepted")],
        hints=[("合并再取中间是 O(m+n)。中位数本质上是把所有数分成左右两半。", "Merging costs O(m+n). The median really splits everything into a left and a right half."),
               ("在较短数组上二分切分点 i，另一数组的切分点 j 由“左半部分共 (m+n+1)/2 个数”决定。", "Binary search a cut i in the shorter array; the other cut j follows from the left half holding (m+n+1)/2 numbers."),
               ("合法切分满足 A[i-1] ≤ B[j] 且 B[j-1] ≤ A[i]；此时中位数由两侧边界值决定。", "A valid cut has A[i-1] ≤ B[j] and B[j-1] ≤ A[i]; the median then comes from the boundary values.")],
        explanation=("在较短数组上二分切分位置，使两个数组的左半部分合起来恰好是较小的一半。时间 O(log min(m, n))。", "Binary search the cut in the shorter array so that the two left parts together form the smaller half. O(log min(m, n)) time."),
        boundary=[[[1], []], [[], [2]], [[1], [2]], [[1, 2], [3, 4]], [[-1000000], [1000000]]],
        inputs=[{"type": "int[]", "minLength": 0, "maxLength": 1000, "smallMaxLength": 5, "largeLength": 1000, "min": -1000000, "max": 1000000, "smallMin": -5, "smallMax": 5, "sorted": "asc"},
                {"type": "int[]", "minLength": 0, "maxLength": 1000, "smallMaxLength": 5, "largeLength": 1000, "min": -1000000, "max": 1000000, "smallMin": -5, "smallMax": 5, "sorted": "asc"}],
        hooks='''
def valid(args):
    return len(args[0]) + len(args[1]) >= 1
''',
        reference='''
def findMedianSortedArrays(nums1, nums2):
    a, b = (nums1, nums2) if len(nums1) <= len(nums2) else (nums2, nums1)
    m, n = len(a), len(b)
    half = (m + n + 1) // 2
    lo, hi = 0, m
    inf = float("inf")
    while True:
        i = (lo + hi) // 2
        j = half - i
        a_left = a[i - 1] if i > 0 else -inf
        a_right = a[i] if i < m else inf
        b_left = b[j - 1] if j > 0 else -inf
        b_right = b[j] if j < n else inf
        if a_left <= b_right and b_left <= a_right:
            if (m + n) % 2:
                return float(max(a_left, b_left))
            return (max(a_left, b_left) + min(a_right, b_right)) / 2
        if a_left > b_right:
            hi = i - 1
        else:
            lo = i + 1
''',
        oracle='''
def findMedianSortedArrays(nums1, nums2):
    merged = sorted(nums1 + nums2)
    n = len(merged)
    return float(merged[n // 2]) if n % 2 else (merged[n // 2 - 1] + merged[n // 2]) / 2
''',
    ),
    dict(
        slug="decode-string", topics=["stack"], entry="decodeString",
        params=[("s", "string")], returns="string",
        summary=summary("解码形如 k[encoded] 的字符串：方括号内的内容重复 k 次，可以嵌套，如 \"3[a2[c]]\" → \"accaccacc\"。输入保证合法。", "Decode strings of the form k[encoded], where the bracketed part repeats k times and may nest, for example \"3[a2[c]]\" → \"accaccacc\". Inputs are always valid."),
        constraints=[("1 ≤ |s| ≤ 30，1 ≤ k ≤ 300，输出长度 ≤ 10⁵", "1 ≤ |s| ≤ 30, 1 ≤ k ≤ 300, output length ≤ 10⁵")],
        hints=[("遇到 '[' 时，需要暂时搁置“外层已经拼好的内容和重复次数”。", "On '[', you must set aside the outer text built so far and its repeat count."),
               ("用栈保存 (外层字符串, 次数)；遇到 ']' 时弹出，把当前内容重复后接到外层字符串后面。", "Push (outer string, count); on ']' pop it and append the current text repeated count times."),
               ("数字可能有多位，要累积：num = num * 10 + int(ch)。", "Counts can have several digits: num = num * 10 + int(ch).")],
        explanation=("栈保存外层上下文，']' 时展开当前层。时间与输出长度成正比。", "A stack keeps the outer context and ']' expands the current level; time is proportional to the output length."),
        boundary=[["a"], ["1[a]"], ["2[ab]"], ["3[a2[c]]"], ["2[abc]3[cd]ef"], ["10[a]"]],
        inputs=[{"type": "string"}],
        hooks='''
def adjust(args, rng, size):
    def build(depth):
        parts = []
        for _ in range(rng.randint(1, 2)):
            if depth < 2 and rng.random() < 0.5:
                parts.append(str(rng.randint(1, 4 if size == "small" else 12)) + "[" + build(depth + 1) + "]")
            else:
                parts.append("".join(rng.choice("abc") for _ in range(rng.randint(1, 2))))
        return "".join(parts)
    while True:
        s = build(0)
        if len(s) <= 30:
            return [s]
''',
        reference='''
def decodeString(s):
    stack, current, num = [], "", 0
    for ch in s:
        if ch.isdigit():
            num = num * 10 + int(ch)
        elif ch == "[":
            stack.append((current, num))
            current, num = "", 0
        elif ch == "]":
            outer, count = stack.pop()
            current = outer + current * count
        else:
            current += ch
    return current
''',
        oracle='''
import re
def decodeString(s):
    pattern = re.compile(r"(\\d+)\\[([a-z]*)\\]")
    while True:
        expanded = pattern.sub(lambda m: m.group(2) * int(m.group(1)), s)
        if expanded == s:
            return s
        s = expanded
''',
    ),
    dict(
        slug="largest-rectangle-in-histogram", topics=["stack"], entry="largestRectangleArea",
        params=[("heights", "int[]")], returns="int",
        summary=summary("柱状图中每根柱子宽度为 1、高度为 heights[i]，求能勾勒出的最大矩形面积。", "Bars of width 1 have heights heights[i]; return the area of the largest rectangle inside the histogram."),
        constraints=[("1 ≤ n ≤ 10⁵，0 ≤ heights[i] ≤ 10⁴", "1 ≤ n ≤ 10⁵, 0 ≤ heights[i] ≤ 10⁴")],
        hints=[("以柱子 i 的高度为矩形高度时，矩形最多能向左右延伸到哪里？", "With bar i's height as the rectangle height, how far can it extend left and right?"),
               ("延伸到两侧第一个比它矮的柱子为止。这就是“上一个/下一个更小元素”问题。", "Until the first shorter bar on each side: a previous/next smaller element problem."),
               ("单调递增栈：当前柱子比栈顶矮时弹出栈顶，此时栈顶的右边界是当前位置、左边界是新的栈顶。", "With an increasing stack, pop while the current bar is shorter than the top; the popped bar's right bound is the current index and its left bound the new top.")],
        explanation=("单调栈一次扫描求出每根柱子作为最矮柱时的最大宽度。时间 O(n)，空间 O(n)。", "One monotonic-stack pass finds, for each bar, the widest span where it is the shortest. O(n) time and space."),
        boundary=[[[0]], [[5]], [[2, 4]], [[2, 1, 2]], [[1, 2, 3, 4, 5]], [[5, 4, 3, 2, 1]]],
        inputs=[{"type": "int[]", "minLength": 1, "smallMaxLength": 9, "largeLength": 20000, "min": 0, "max": 10000, "smallMin": 0, "smallMax": 6}],
        reference='''
def largestRectangleArea(heights):
    stack, best = [-1], 0
    for i, h in enumerate(heights + [0]):
        while stack[-1] != -1 and heights[stack[-1]] > h:
            height = heights[stack.pop()]
            best = max(best, height * (i - stack[-1] - 1))
        stack.append(i)
    return best
''',
        oracle='''
def largestRectangleArea(heights):
    best = 0
    for i in range(len(heights)):
        low = heights[i]
        for j in range(i, len(heights)):
            low = min(low, heights[j])
            best = max(best, low * (j - i + 1))
    return best
''',
    ),
]
