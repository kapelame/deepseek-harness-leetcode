"""Hot 100 groups 动态规划 / 多维动态规划, with the dynamic-programming topic and variants."""

ORIGINAL = ("（本课程原创简述，完整题面见 LeetCode 官方页面。）", " (Original summary written for Learn; see LeetCode for the official statement.)")


def summary(zh, en):
    return (zh + ORIGINAL[0], en + ORIGINAL[1])


TOPICS = [
    dict(
        id="dynamic-programming", order=16,
        title=("动态规划：定义状态、写出转移、按顺序填表", "Dynamic programming: define states, write transitions, fill in order"),
        summary=("当问题可以拆成重叠的子问题、且最优解由子问题的最优解组成时，用表格记住每个子问题的答案，避免重复计算。核心是把“状态”和“转移”写清楚。",
                 "When a problem splits into overlapping subproblems whose best answers build the overall best, record each subproblem's answer in a table instead of recomputing it. The heart of it is stating the state and the transition precisely."),
        prerequisites=["backtracking"],
        problems=["house-robber"],
        variants=["dp-house-robber-circle", "dp-coin-change-combinations"],
        lesson=dict(
            motivation=("一个小偷沿街作案，每间房子里有一定的钱，但相邻两间房子不能都偷，否则会触发警报。他想偷到尽可能多的钱。\n\n用回溯枚举每间房偷或不偷，有 2ⁿ 种方案。但仔细看：决定“前 i 间房最多能偷多少”时，只需要知道“前 i-1 间”和“前 i-2 间”的最优结果——这些子问题被反复用到。\n\n把每个子问题的答案存进表里，从小到大依次计算，指数级的搜索就变成了一次线性扫描。这就是动态规划。",
                        "A thief walks down a street where each house holds some money, but robbing two adjacent houses trips the alarm. He wants the most money possible.\n\nBacktracking over rob or skip for each house tries 2ⁿ plans. Look closer: the best haul from the first i houses only needs the best from the first i-1 and the first i-2 houses, and those subproblems are reused again and again.\n\nStore each subproblem's answer in a table and compute them from small to large, and the exponential search becomes one linear scan. That is dynamic programming."),
            strategy=("**四步法**：\n1. **状态**：dp[i]（或 dp[i][j]）表示什么？要精确到“前 i 个”“以 i 结尾”“长度为 i”。\n2. **转移**：dp[i] 如何由更小的状态得到？列出最后一步的所有可能选择。\n3. **初始值**：最小子问题的答案，例如 dp[0]。\n4. **顺序**：保证计算 dp[i] 时，它依赖的状态都已算好。\n\n**常见类型**：\n- 线性 DP：打家劫舍、爬楼梯、最长递增子序列。\n- 背包：零钱兑换（完全背包）、分割等和子集（0-1 背包）——注意内外循环顺序。\n- 二维/网格 DP：路径数、最小路径和。\n- 双序列 DP：最长公共子序列、编辑距离——dp[i][j] 看两个前缀。\n\n**空间优化**：如果 dp[i] 只依赖前一两行/前一两个值，可以用滚动变量或一维数组。",
                      "**Four steps**:\n1. **State**: what does dp[i] (or dp[i][j]) mean? Be precise: \"the first i items\", \"ending at i\", \"of length i\".\n2. **Transition**: how does dp[i] follow from smaller states? List every possible last step.\n3. **Base cases**: answers to the smallest subproblems, such as dp[0].\n4. **Order**: make sure every state dp[i] depends on is computed first.\n\n**Common families**:\n- Linear DP: house robber, climbing stairs, longest increasing subsequence.\n- Knapsack: coin change (unbounded), partition equal subset sum (0-1); mind the loop order.\n- Grid DP: path counts, minimum path sums.\n- Two-sequence DP: longest common subsequence, edit distance, where dp[i][j] looks at two prefixes.\n\n**Space**: when dp[i] depends only on the previous one or two values or rows, keep rolling variables or a single row."),
            example=dict(
                title=("例：打家劫舍 nums = [2, 7, 9, 3, 1]", "Example: house robber on [2, 7, 9, 3, 1]"),
                body=("dp[i] = 前 i 间房最多能偷的钱 = max(dp[i-1], dp[i-2] + nums[i-1])。", "dp[i] = the most from the first i houses = max(dp[i-1], dp[i-2] + nums[i-1])."),
                columns=["i", "house", "skip it", "rob it", "dp[i]"],
                trace=[
                    ({"i": "1", "house": "2", "skip it": "0", "rob it": "0+2", "dp[i]": "2"}, ("只有一间房，偷。", "With one house, rob it.")),
                    ({"i": "2", "house": "7", "skip it": "2", "rob it": "0+7", "dp[i]": "7"}, ("偷第二间比第一间多。", "Robbing the second beats the first.")),
                    ({"i": "3", "house": "9", "skip it": "7", "rob it": "2+9", "dp[i]": "11"}, ("偷第 1、3 间。", "Rob houses 1 and 3.")),
                    ({"i": "4", "house": "3", "skip it": "11", "rob it": "7+3", "dp[i]": "11"}, ("不偷第 4 间更好。", "Skipping house 4 is better.")),
                    ({"i": "5", "house": "1", "skip it": "11", "rob it": "11+1", "dp[i]": "12"}, ("答案 12：偷第 1、3、5 间。", "Answer 12: houses 1, 3, and 5.")),
                ],
            ),
            check=[
                dict(id="state", prompt=("最长递增子序列中，dp[i] 定义为“以 nums[i] 结尾的最长递增子序列长度”，为什么要强调“结尾”？", "In longest increasing subsequence, dp[i] is the longest increasing subsequence ending at nums[i]. Why insist on 'ending at'?"),
                     options=[("转移时需要知道子序列最后一个元素，才能判断能否接上 nums[i]", "The transition must know the subsequence's last element to decide whether nums[i] can extend it"),
                              ("为了节省空间", "To save space"),
                              ("因为答案总是 dp[n-1]", "Because the answer is always dp[n-1]")],
                     answer=0, explanation=("“以 i 结尾”让我们知道最后一个元素就是 nums[i]，转移 dp[i] = max(dp[j]) + 1（nums[j] < nums[i]）才成立；最终答案是所有 dp[i] 的最大值。", "Ending at i fixes the last element as nums[i], which makes dp[i] = max(dp[j]) + 1 over nums[j] < nums[i] valid; the answer is the maximum over all dp[i].")),
                dict(id="knapsack-order", prompt=("零钱兑换 II（求组合数）中，外层循环遍历硬币、内层循环遍历金额，为什么不会把 1+2 和 2+1 算成两种？", "In coin change II, counting combinations, why does looping coins outside and amounts inside avoid counting 1+2 and 2+1 twice?"),
                     options=[("硬币按固定顺序被考虑，每种组合只按这个顺序被构造一次", "Coins are considered in a fixed order, so each combination is built once in that order"),
                              ("因为 dp 数组是一维的", "Because the dp array is one-dimensional"),
                              ("因为金额从小到大遍历", "Because amounts go from small to large")],
                     answer=0, explanation=("交换内外层循环就会按“最后一枚硬币”区分，从而统计排列数。", "Swapping the loops distinguishes sequences by their last coin and counts permutations instead.")),
            ],
            practice="house-robber",
            reflection=("为“编辑距离”写出 dp[i][j] 的定义和三种转移（插入、删除、替换），并解释为什么 dp[i][0] = i。", "Write the definition of dp[i][j] for edit distance and its three transitions (insert, delete, replace), and explain why dp[i][0] = i."),
        ),
    ),
]

VARIANTS = [
    dict(
        id="dp-house-robber-circle", parent="house-robber", topic="dynamic-programming",
        title=("环形街道上的打家劫舍", "House Robber on a Circular Street"),
        summary=("房子围成一圈（首尾相邻），相邻房子不能同时偷，求最多能偷多少。", "The houses form a circle, so the first and last are adjacent; rob no two neighbors and return the maximum total."),
        statement=("街道上的房子围成一个**圆圈**：第一间和最后一间房子也相邻。`nums[i]` 是第 `i` 间房子里的钱，相邻的两间房子不能在同一晚都被偷。\n\n返回最多能偷到的钱。",
                   "The houses stand in a **circle**, so the first and last houses are neighbors too. `nums[i]` is the money in house `i`, and two neighboring houses cannot both be robbed on the same night.\n\nReturn the maximum amount that can be robbed."),
        difficulty="medium", skills=["linear DP", "case splitting"],
        differences=[("input-structure", ("街道变成环形，第一间与最后一间房子相邻。", "The street becomes a circle, so the first and last houses are adjacent.")),
                     ("reasoning", ("需要拆成两种情况：不偷第一间，或不偷最后一间，分别做线性 DP 后取较大值。", "Split into two cases, skipping the first house or skipping the last, run the linear DP on each, and take the larger."))],
        transfer=("线性打家劫舍的状态与转移完全复用；新的步骤是把环拆成两条线：首尾不能同时偷，所以至少有一端被排除。",
                  "The linear state and transition are reused as is; the new step breaks the circle into two lines, since the two ends cannot both be robbed."),
        entry="robCircle", params=[("nums", "int[]")], returns="int",
        constraints=[("1 ≤ n ≤ 100，0 ≤ nums[i] ≤ 1000", "1 ≤ n ≤ 100, 0 ≤ nums[i] ≤ 1000")],
        examples=[[[2, 3, 2]], [[1, 2, 3, 1]], [[1, 2, 3]]],
        boundary=[[[5]], [[1, 2]], [[3, 1, 3]], [[0, 0, 0]], [[1000, 1, 1, 1000]]],
        inputs=[{"type": "int[]", "minLength": 1, "maxLength": 100, "smallMaxLength": 8, "largeLength": 100, "min": 0, "max": 1000, "smallMin": 0, "smallMax": 9}],
        hints=[("首尾相邻意味着什么？第一间和最后一间房子不能同时偷。", "What does adjacency of the ends mean? The first and last houses cannot both be robbed."),
               ("所以最优方案要么不包含第一间，要么不包含最后一间。", "So the best plan excludes either the first house or the last."),
               ("分别对 nums[1:] 和 nums[:-1] 做线性打家劫舍，取较大值；只有一间房时直接返回它。", "Run the linear version on nums[1:] and on nums[:-1] and take the larger; with one house, return it.")],
        reference='''
def robCircle(nums):
    def line(houses):
        take = skip = 0
        for x in houses:
            take, skip = skip + x, max(take, skip)
        return max(take, skip)
    if len(nums) == 1:
        return nums[0]
    return max(line(nums[1:]), line(nums[:-1]))
''',
        oracle='''
def robCircle(nums):
    n = len(nums)
    best = 0
    for mask in range(1 << n):
        ok = all(not (mask >> i & 1 and mask >> ((i + 1) % n) & 1) for i in range(n)) if n > 1 else True
        if ok:
            best = max(best, sum(nums[i] for i in range(n) if mask >> i & 1))
    return best
''',
        mutants={
            "linear": '''
def robCircle(nums):
    take = skip = 0
    for x in nums:
        take, skip = skip + x, max(take, skip)
    return max(take, skip)
''',
            "drop-both-ends": '''
def robCircle(nums):
    if len(nums) <= 2:
        return max(nums)
    take = skip = 0
    for x in nums[1:-1]:
        take, skip = skip + x, max(take, skip)
    return max(take, skip)
''',
        },
    ),
    dict(
        id="dp-coin-change-combinations", parent="coin-change", topic="dynamic-programming",
        title=("凑出金额的组合数", "Ways to Make an Amount"),
        summary=("每种硬币数量不限，求凑出 amount 的组合数（不区分顺序）。", "With unlimited coins of each kind, count the combinations that make amount, ignoring order."),
        statement=("给定互不相同的正整数面额 `coins` 和总金额 `amount`，每种面额的硬币数量不限。返回凑成 `amount` 的**组合数**：只看每种硬币用了几枚，`1 + 2` 和 `2 + 1` 算同一种。金额为 0 时有 1 种组合（什么都不用）。\n\n保证答案在 32 位有符号整数范围内。",
                   "Given distinct positive denominations `coins` and an `amount`, with unlimited coins of each kind, return the number of **combinations** that make `amount`: only the count of each coin matters, so `1 + 2` and `2 + 1` are the same. An amount of 0 has exactly 1 combination, using nothing.\n\nThe answer fits in a signed 32-bit integer."),
        difficulty="medium", skills=["unbounded knapsack", "counting DP", "loop order"],
        differences=[("output", ("从“最少硬币数”变成“方案数”，转移从取最小值变成求和。", "From the fewest coins to the number of ways, so the transition sums instead of taking a minimum.")),
                     ("reasoning", ("必须避免把不同顺序算成不同方案：外层遍历硬币、内层遍历金额。", "Different orders must not count separately: loop over coins outside and amounts inside."))],
        transfer=("完全背包“dp[x] 依赖 dp[x - coin]”的结构保持不变；变化在于聚合方式（最小值 → 求和）和循环顺序对计数的影响。",
                  "The unbounded-knapsack structure, dp[x] from dp[x - coin], carries over; what changes is the aggregation (minimum → sum) and how loop order affects counting."),
        entry="change", params=[("amount", "int"), ("coins", "int[]")], returns="int",
        constraints=[("0 ≤ amount ≤ 5000，1 ≤ coins.length ≤ 300，1 ≤ coins[i] ≤ 5000，面额互不相同", "0 ≤ amount ≤ 5000, 1 ≤ coins.length ≤ 300, 1 ≤ coins[i] ≤ 5000, distinct denominations")],
        examples=[[5, [1, 2, 5]], [3, [2]], [10, [10]]],
        boundary=[[0, [7]], [1, [2]], [4, [1, 2]], [7, [2, 3]]],
        inputs=[{"type": "int", "min": 0, "max": 5000, "smallMin": 0, "smallMax": 12}, {"type": "int[]", "minLength": 1, "maxLength": 300, "smallMaxLength": 4, "largeLength": 30, "min": 1, "max": 5000, "smallMin": 1, "smallMax": 8, "distinct": True}],
        hooks='''
def valid(args):
    amount, coins = args
    ways = [1] + [0] * amount
    for c in coins:
        for x in range(c, amount + 1):
            ways[x] += ways[x - c]
    return ways[amount] <= 2 ** 31 - 1
''',
        hints=[("dp[x] 表示凑出金额 x 的组合数，dp[0] = 1。", "Let dp[x] be the number of ways to make x, with dp[0] = 1."),
               ("如果外层循环金额、内层循环硬币，[1, 2] 和 [2, 1] 会被分别计数。为什么？", "With amounts outside and coins inside, [1, 2] and [2, 1] are counted separately. Why?"),
               ("外层循环硬币：for coin in coins: for x in range(coin, amount + 1): dp[x] += dp[x - coin]。这样每种组合按硬币顺序只被构造一次。", "Loop coins outside: for coin in coins: for x in range(coin, amount + 1): dp[x] += dp[x - coin]. Each combination is built once, in coin order.")],
        reference='''
def change(amount, coins):
    ways = [1] + [0] * amount
    for coin in coins:
        for x in range(coin, amount + 1):
            ways[x] += ways[x - coin]
    return ways[amount]
''',
        oracle='''
def change(amount, coins):
    from functools import lru_cache
    @lru_cache(maxsize=None)
    def count(i, remain):
        if remain == 0:
            return 1
        if i == len(coins):
            return 0
        total = 0
        used = 0
        while used * coins[i] <= remain:
            total += count(i + 1, remain - used * coins[i])
            used += 1
        return total
    return count(0, amount)
''',
        mutants={
            "permutations": '''
def change(amount, coins):
    ways = [1] + [0] * amount
    for x in range(1, amount + 1):
        for coin in coins:
            if coin <= x:
                ways[x] += ways[x - coin]
    return ways[amount]
''',
            "fewest-coins": '''
def change(amount, coins):
    inf = float("inf")
    best = [0] + [inf] * amount
    for x in range(1, amount + 1):
        for coin in coins:
            if coin <= x:
                best[x] = min(best[x], best[x - coin] + 1)
    return -1 if best[amount] == inf else best[amount]
''',
        },
    ),
]

PROBLEMS = [
    dict(
        slug="climbing-stairs", topics=["dynamic-programming"], entry="climbStairs",
        params=[("n", "int")], returns="int",
        summary=summary("爬 n 级台阶，每次可以爬 1 级或 2 级，有多少种不同的爬法？", "Climbing n steps one or two at a time, how many distinct ways are there?"),
        constraints=[("1 ≤ n ≤ 45", "1 ≤ n ≤ 45")],
        hints=[("最后一步是从第 n-1 级还是第 n-2 级上来的？", "Was the last move from step n-1 or from step n-2?"),
               ("ways(n) = ways(n-1) + ways(n-2)。", "ways(n) = ways(n-1) + ways(n-2)."),
               ("初始 ways(1) = 1，ways(2) = 2；只需要两个变量滚动计算。", "With ways(1) = 1 and ways(2) = 2, two rolling variables suffice.")],
        explanation=("斐波那契式递推，用两个变量滚动。时间 O(n)，空间 O(1)。", "A Fibonacci-style recurrence with two rolling variables. O(n) time, O(1) space."),
        boundary=[[1], [2], [3], [45]],
        inputs=[{"type": "int", "min": 1, "max": 45, "smallMin": 1, "smallMax": 15}],
        reference='''
def climbStairs(n):
    a, b = 1, 1
    for _ in range(n):
        a, b = b, a + b
    return a
''',
        oracle='''
from functools import lru_cache
@lru_cache(maxsize=None)
def climbStairs(n):
    if n <= 1:
        return 1
    return climbStairs(n - 1) + climbStairs(n - 2)
''',
    ),
    dict(
        slug="pascals-triangle", topics=["dynamic-programming"], entry="generate",
        params=[("numRows", "int")], returns="int[][]",
        summary=summary("生成杨辉三角的前 numRows 行：每行首尾为 1，中间每个数等于上一行左上方和右上方两数之和。", "Generate the first numRows rows of Pascal's triangle: each row starts and ends with 1, and every inner number is the sum of the two numbers above it."),
        constraints=[("1 ≤ numRows ≤ 30", "1 ≤ numRows ≤ 30")],
        hints=[("第 i 行有 i+1 个数，首尾都是 1。", "Row i has i+1 numbers, starting and ending with 1."),
               ("row[j] = prev[j-1] + prev[j]，其中 1 ≤ j ≤ i-1。", "row[j] = prev[j-1] + prev[j] for 1 ≤ j ≤ i-1."),
               ("逐行由上一行生成，直到 numRows 行。", "Build each row from the previous one until there are numRows rows.")],
        explanation=("逐行递推，每个内部元素由上一行两个相邻元素相加。时间 O(numRows²)。", "Row-by-row recurrence, each inner element summing two adjacent elements of the previous row. O(numRows²) time."),
        boundary=[[1], [2], [3], [30]],
        inputs=[{"type": "int", "min": 1, "max": 30, "smallMin": 1, "smallMax": 8}],
        reference='''
def generate(numRows):
    rows = [[1]]
    for _ in range(numRows - 1):
        prev = rows[-1]
        rows.append([1] + [prev[j - 1] + prev[j] for j in range(1, len(prev))] + [1])
    return rows
''',
        oracle='''
import math
def generate(numRows):
    return [[math.comb(i, j) for j in range(i + 1)] for i in range(numRows)]
''',
    ),
    dict(
        slug="house-robber", topics=["dynamic-programming"], entry="rob",
        params=[("nums", "int[]")], returns="int",
        summary=summary("沿街的每间房子里有一定的钱，相邻两间房子不能都偷。求最多能偷到多少钱。", "Each house on a street holds some money and no two adjacent houses may both be robbed; return the maximum total."),
        constraints=[("1 ≤ n ≤ 100，0 ≤ nums[i] ≤ 400", "1 ≤ n ≤ 100, 0 ≤ nums[i] ≤ 400")],
        hints=[("对第 i 间房只有两种选择：偷或不偷。", "For house i there are only two choices: rob it or not."),
               ("偷：前 i-2 间的最优 + nums[i]；不偷：前 i-1 间的最优。", "Rob: best of the first i-2 houses + nums[i]; skip: best of the first i-1."),
               ("dp[i] = max(dp[i-1], dp[i-2] + nums[i])，只依赖前两个值，可用两个变量滚动。", "dp[i] = max(dp[i-1], dp[i-2] + nums[i]) depends on two values, so roll two variables.")],
        explanation=("线性 DP，状态为前 i 间房的最优值。时间 O(n)，空间 O(1)。", "Linear DP over the best value of the first i houses. O(n) time, O(1) space."),
        boundary=[[[0]], [[5]], [[1, 2]], [[2, 1, 1, 2]], [[400, 0, 0, 400]]],
        inputs=[{"type": "int[]", "minLength": 1, "maxLength": 100, "smallMaxLength": 9, "largeLength": 100, "min": 0, "max": 400, "smallMin": 0, "smallMax": 9}],
        reference='''
def rob(nums):
    take = skip = 0
    for x in nums:
        take, skip = skip + x, max(take, skip)
    return max(take, skip)
''',
        oracle='''
def rob(nums):
    n = len(nums)
    best = 0
    for mask in range(1 << n):
        if mask & (mask >> 1) == 0:
            best = max(best, sum(nums[i] for i in range(n) if mask >> i & 1))
    return best
''',
    ),
    dict(
        slug="perfect-squares", topics=["dynamic-programming"], entry="numSquares",
        params=[("n", "int")], returns="int",
        summary=summary("返回和为 n 的完全平方数（1, 4, 9, 16, …）的最少个数。", "Return the fewest perfect squares (1, 4, 9, 16, …) that sum to n."),
        constraints=[("1 ≤ n ≤ 10⁴", "1 ≤ n ≤ 10⁴")],
        hints=[("最后加上的那个平方数是 j²，那么剩下的部分是 n - j²。", "If the last square added is j², the rest is n - j²."),
               ("dp[x] = 1 + min(dp[x - j²])，对所有 j² ≤ x。", "dp[x] = 1 + min(dp[x - j²]) over every j² ≤ x."),
               ("dp[0] = 0，从小到大填表；这是一个完全背包。", "dp[0] = 0; fill from small to large. It is an unbounded knapsack.")],
        explanation=("完全背包式 DP，时间 O(n√n)，空间 O(n)。", "Unbounded-knapsack DP in O(n√n) time and O(n) space."),
        boundary=[[1], [2], [4], [12], [13]],
        inputs=[{"type": "int", "min": 1, "max": 10000, "smallMin": 1, "smallMax": 40}],
        perCaseMs=3000,
        reference='''
def numSquares(n):
    squares = [j * j for j in range(1, int(n ** 0.5) + 1)]
    dp = [0] + [n] * n
    for x in range(1, n + 1):
        for sq in squares:
            if sq > x:
                break
            if dp[x - sq] + 1 < dp[x]:
                dp[x] = dp[x - sq] + 1
    return dp[n]
''',
        oracle='''
def numSquares(n):
    level, frontier, seen = 0, {n}, {n}
    while frontier:
        level += 1
        nxt = set()
        for value in frontier:
            j = 1
            while j * j <= value:
                rest = value - j * j
                if rest == 0:
                    return level
                if rest not in seen:
                    seen.add(rest)
                    nxt.add(rest)
                j += 1
        frontier = nxt
''',
    ),
    dict(
        slug="coin-change", topics=["dynamic-programming"], entry="coinChange",
        params=[("coins", "int[]"), ("amount", "int")], returns="int",
        summary=summary("给定若干种面额的硬币（每种数量不限），求凑出 amount 所需的最少硬币数；凑不出返回 -1。", "Given coin denominations with unlimited supply, return the fewest coins that make amount, or -1 if impossible."),
        constraints=[("1 ≤ coins.length ≤ 12，1 ≤ coins[i] ≤ 2³¹-1，0 ≤ amount ≤ 10⁴", "1 ≤ coins.length ≤ 12, 1 ≤ coins[i] ≤ 2³¹-1, 0 ≤ amount ≤ 10⁴")],
        hints=[("贪心（每次用最大面额）对 coins = [1, 3, 4]、amount = 6 会出错吗？", "Does greedy (largest coin first) fail for coins = [1, 3, 4], amount = 6?"),
               ("会：贪心得到 4+1+1，最优是 3+3。需要考虑所有“最后一枚硬币”的可能。", "Yes: greedy gives 4+1+1, the best is 3+3. Consider every possible last coin."),
               ("dp[x] = 1 + min(dp[x - coin])，dp[0] = 0，无法凑出用 ∞ 表示。", "dp[x] = 1 + min(dp[x - coin]), dp[0] = 0, with ∞ for unreachable amounts.")],
        explanation=("完全背包求最小值，时间 O(amount × 面额数)，空间 O(amount)。", "Unbounded knapsack minimizing the count, O(amount × denominations) time and O(amount) space."),
        boundary=[[[1], 0], [[2], 3], [[1], 1], [[2, 5], 6], [[2147483647], 2]],
        inputs=[{"type": "int[]", "minLength": 1, "maxLength": 12, "smallMaxLength": 3, "largeLength": 12, "min": 1, "max": 1000000000, "smallMin": 1, "smallMax": 9, "distinct": True},
                {"type": "int", "min": 0, "max": 10000, "smallMin": 0, "smallMax": 25}],
        hooks='''
def adjust(args, rng, size):
    coins, amount = args
    if size == "large":
        coins = rng.sample(range(2, 60), len(coins))
    return [coins, amount]
''',
        reference='''
def coinChange(coins, amount):
    inf = amount + 1
    dp = [0] + [inf] * amount
    for x in range(1, amount + 1):
        for c in coins:
            if c <= x and dp[x - c] + 1 < dp[x]:
                dp[x] = dp[x - c] + 1
    return -1 if dp[amount] == inf else dp[amount]
''',
        oracle='''
def coinChange(coins, amount):
    if amount == 0:
        return 0
    level, frontier, seen = 0, {0}, {0}
    while frontier:
        level += 1
        nxt = set()
        for value in frontier:
            for c in coins:
                total = value + c
                if total == amount:
                    return level
                if total < amount and total not in seen:
                    seen.add(total)
                    nxt.add(total)
        frontier = nxt
    return -1
''',
    ),
    dict(
        slug="word-break", topics=["dynamic-programming"], entry="wordBreak",
        params=[("s", "string"), ("wordDict", "string[]")], returns="bool",
        summary=summary("判断字符串 s 能否被拆分成一个或多个字典中的单词（单词可重复使用）。", "Decide whether s can be split into one or more dictionary words, reusing words freely."),
        constraints=[("1 ≤ |s| ≤ 300，1 ≤ 字典大小 ≤ 1000，1 ≤ 单词长度 ≤ 20，均为小写字母，单词互不相同", "1 ≤ |s| ≤ 300, 1 ≤ dictionary size ≤ 1000, 1 ≤ word length ≤ 20, lowercase, distinct words")],
        hints=[("dp[i] 表示前 i 个字符能否被拆分。", "Let dp[i] say whether the first i characters can be split."),
               ("dp[i] 为真，当存在 j < i 使 dp[j] 为真且 s[j:i] 在字典中。", "dp[i] is true when some j < i has dp[j] true and s[j:i] in the dictionary."),
               ("把字典放进集合；只需检查长度不超过最长单词的 s[j:i]。", "Put the dictionary in a set and only check s[j:i] no longer than the longest word.")],
        explanation=("前缀 DP，时间 O(n × L)（L 为最长单词长度），空间 O(n)。", "Prefix DP in O(n × L) time for longest word length L, O(n) space."),
        boundary=[["a", ["a"]], ["a", ["b"]], ["aaaa", ["aa"]], ["aaa", ["aa"]], ["catsandog", ["cats", "dog", "sand", "and", "cat"]]],
        inputs=[{"type": "string", "minLength": 1, "maxLength": 300, "smallMaxLength": 10, "largeLength": 300, "alphabet": "ab"},
                {"type": "string[]", "minLength": 1, "maxLength": 1000, "smallMaxLength": 4, "largeLength": 20, "word": {"minLength": 1, "maxLength": 20, "smallMaxLength": 3, "alphabet": "ab"}}],
        hooks='''
def adjust(args, rng, size):
    s, words = args
    words = sorted({w for w in words if w})
    if not words:
        words = ["a"]
    if rng.random() < 0.5:
        pieces = []
        while sum(map(len, pieces)) < len(s):
            pieces.append(rng.choice(words))
        s = "".join(pieces)[:300]
    if size == "large" and rng.random() < 0.5:
        s = "a" * 299 + "b"
        words = ["a", "aa", "aaa", "aaaa", "aaaaa"]
    return [s, words]
''',
        reference='''
def wordBreak(s, wordDict):
    words = set(wordDict)
    longest = max(map(len, words))
    ok = [True] + [False] * len(s)
    for i in range(1, len(s) + 1):
        for j in range(max(0, i - longest), i):
            if ok[j] and s[j:i] in words:
                ok[i] = True
                break
    return ok[-1]
''',
        oracle='''
def wordBreak(s, wordDict):
    reachable = {0}
    frontier = [0]
    while frontier:
        start = frontier.pop()
        for w in wordDict:
            if s.startswith(w, start) and start + len(w) not in reachable:
                reachable.add(start + len(w))
                frontier.append(start + len(w))
    return len(s) in reachable
''',
    ),
    dict(
        slug="longest-increasing-subsequence", topics=["dynamic-programming"], entry="lengthOfLIS",
        params=[("nums", "int[]")], returns="int",
        summary=summary("求数组中最长严格递增子序列的长度（子序列可以不连续）。进阶：O(n log n)。", "Return the length of the longest strictly increasing subsequence; it need not be contiguous. Follow-up: O(n log n)."),
        constraints=[("1 ≤ n ≤ 2500，-10⁴ ≤ nums[i] ≤ 10⁴", "1 ≤ n ≤ 2500, -10⁴ ≤ nums[i] ≤ 10⁴")],
        hints=[("dp[i] = 以 nums[i] 结尾的最长递增子序列长度。", "dp[i] = length of the longest increasing subsequence ending at nums[i]."),
               ("dp[i] = 1 + max(dp[j])，其中 j < i 且 nums[j] < nums[i]；答案是所有 dp[i] 的最大值。O(n²)。", "dp[i] = 1 + max(dp[j]) over j < i with nums[j] < nums[i]; the answer is the maximum dp[i]. O(n²)."),
               ("O(n log n)：tails[k] 记录长度为 k+1 的递增子序列的最小结尾，用二分查找替换。", "O(n log n): tails[k] holds the smallest ending of an increasing subsequence of length k+1; update it by binary search.")],
        explanation=("耐心排序：维护各长度递增子序列的最小结尾，二分更新。时间 O(n log n)，空间 O(n)。", "Patience sorting keeps the smallest ending for each length and updates it by binary search. O(n log n) time, O(n) space."),
        boundary=[[[1]], [[2, 2]], [[1, 2]], [[2, 1]], [[0, 1, 0, 3, 2, 3]]],
        inputs=[{"type": "int[]", "minLength": 1, "maxLength": 2500, "smallMaxLength": 9, "largeLength": 2500, "min": -10000, "max": 10000, "smallMin": -5, "smallMax": 5}],
        reference='''
import bisect
def lengthOfLIS(nums):
    tails = []
    for x in nums:
        i = bisect.bisect_left(tails, x)
        if i == len(tails):
            tails.append(x)
        else:
            tails[i] = x
    return len(tails)
''',
        oracle='''
def lengthOfLIS(nums):
    best = [1] * len(nums)
    for i in range(len(nums)):
        for j in range(i):
            if nums[j] < nums[i]:
                best[i] = max(best[i], best[j] + 1)
    return max(best)
''',
    ),
    dict(
        slug="maximum-product-subarray", topics=["dynamic-programming"], entry="maxProduct",
        params=[("nums", "int[]")], returns="int",
        summary=summary("求乘积最大的非空连续子数组，返回这个乘积。保证任何子数组的乘积都在 32 位整数范围内。", "Return the largest product of a non-empty contiguous subarray; every subarray product fits in a 32-bit integer."),
        constraints=[("1 ≤ n ≤ 2×10⁴，-10 ≤ nums[i] ≤ 10", "1 ≤ n ≤ 2×10⁴, -10 ≤ nums[i] ≤ 10")],
        hints=[("和最大子数组和不同：负数乘负数会变成正数。", "Unlike the maximum sum, a negative times a negative is positive."),
               ("以 i 结尾时，同时记录最大乘积和最小乘积。", "For subarrays ending at i, track both the largest and the smallest product."),
               ("新的最大值 = max(x, x·prevMax, x·prevMin)，最小值同理；遇到 0 会自然重置。", "New max = max(x, x·prevMax, x·prevMin), and likewise the minimum; a 0 resets both naturally.")],
        explanation=("同时维护以当前位置结尾的最大和最小乘积。时间 O(n)，空间 O(1)。", "Track the largest and smallest product ending at each position. O(n) time, O(1) space."),
        boundary=[[[-2]], [[0]], [[-2, 0, -1]], [[2, 3, -2, 4]], [[-2, -3, -4]]],
        inputs=[{"type": "int[]", "minLength": 1, "smallMaxLength": 8, "largeLength": 20000, "min": -3, "max": 3, "smallMin": -3, "smallMax": 3}],
        hooks='''
def adjust(args, rng, size):
    nums = args[0]
    if size == "large":
        nums = [0 if i % 18 == 17 else x for i, x in enumerate(nums)]
    return [nums]

def valid(args):
    nums = args[0]
    run = 1
    for x in nums:
        run = 1 if x == 0 else run * abs(x)
        if run > 2 ** 31 - 1:
            return False
    return True
''',
        reference='''
def maxProduct(nums):
    best = high = low = nums[0]
    for x in nums[1:]:
        candidates = (x, x * high, x * low)
        high, low = max(candidates), min(candidates)
        best = max(best, high)
    return best
''',
        oracle='''
def maxProduct(nums):
    best = nums[0]
    for i in range(len(nums)):
        product = 1
        for j in range(i, len(nums)):
            product *= nums[j]
            best = max(best, product)
    return best
''',
    ),
    dict(
        slug="partition-equal-subset-sum", topics=["dynamic-programming"], entry="canPartition",
        params=[("nums", "int[]")], returns="bool",
        summary=summary("判断能否把正整数数组分成两个和相等的子集。", "Decide whether the positive integers can be split into two subsets with equal sums."),
        constraints=[("1 ≤ n ≤ 200，1 ≤ nums[i] ≤ 100", "1 ≤ n ≤ 200, 1 ≤ nums[i] ≤ 100")],
        hints=[("总和为奇数时直接不可能。否则问题变成：能否选出一些数，和为总和的一半？", "An odd total is impossible. Otherwise: can some numbers sum to half the total?"),
               ("这是 0-1 背包：每个数最多用一次，dp[t] 表示能否凑出和 t。", "That is a 0-1 knapsack: each number is used at most once, and dp[t] says whether t is reachable."),
               ("对每个数，t 从大到小更新 dp[t] |= dp[t - num]，倒序保证每个数只用一次。", "For each number update dp[t] |= dp[t - num] with t decreasing, so each number is used once.")],
        explanation=("0-1 背包可行性 DP，倒序更新一维数组。时间 O(n × sum)，空间 O(sum)。", "A 0-1 knapsack feasibility DP updating one array backwards. O(n × sum) time, O(sum) space."),
        boundary=[[[1]], [[1, 1]], [[1, 2]], [[2, 2, 3, 5]], [[100, 100]]],
        inputs=[{"type": "int[]", "minLength": 1, "maxLength": 200, "smallMaxLength": 8, "largeLength": 200, "min": 1, "max": 100, "smallMin": 1, "smallMax": 9}],
        reference='''
def canPartition(nums):
    total = sum(nums)
    if total % 2:
        return False
    target = total // 2
    reach = [True] + [False] * target
    for x in nums:
        for t in range(target, x - 1, -1):
            if reach[t - x]:
                reach[t] = True
    return reach[target]
''',
        oracle='''
def canPartition(nums):
    sums = {0}
    for x in nums:
        sums |= {s + x for s in sums}
    total = sum(nums)
    return total % 2 == 0 and total // 2 in sums
''',
    ),
    dict(
        slug="longest-valid-parentheses", topics=["dynamic-programming"], entry="longestValidParentheses",
        params=[("s", "string")], returns="int",
        summary=summary("只含 '(' 和 ')' 的字符串中，求最长的合法（正确配对）括号子串的长度。", "In a string of '(' and ')', return the length of the longest well-formed parentheses substring."),
        constraints=[("0 ≤ |s| ≤ 3×10⁴，s[i] 为 '(' 或 ')'", "0 ≤ |s| ≤ 3×10⁴, s[i] is '(' or ')'")],
        hints=[("dp[i] = 以 s[i] 结尾的最长合法子串长度；只有 s[i] == ')' 时才可能非零。", "dp[i] = longest valid substring ending at s[i]; only s[i] == ')' can be non-zero."),
               ("若 s[i-1] == '('，dp[i] = dp[i-2] + 2；若 s[i-1] == ')'，看 dp[i-1] 前面那个字符是不是 '('。", "If s[i-1] == '(', dp[i] = dp[i-2] + 2; if s[i-1] == ')', check whether the character before dp[i-1]'s run is '('."),
               ("也可以用栈：栈底保存“最后一个未匹配的位置”，匹配时用 i - 栈顶 更新答案。", "Or use a stack whose bottom holds the last unmatched index; on a match update the answer with i - top.")],
        explanation=("用栈记录未匹配位置，或用以 i 结尾的 DP。时间 O(n)，空间 O(n)。", "A stack of unmatched indices, or DP over substrings ending at i. O(n) time and space."),
        boundary=[[""], ["("], [")"], ["()"], [")()())"], ["(()"], ["()(()"]],
        inputs=[{"type": "string", "minLength": 0, "smallMaxLength": 10, "largeLength": 20000, "alphabet": "()"}],
        reference='''
def longestValidParentheses(s):
    stack, best = [-1], 0
    for i, ch in enumerate(s):
        if ch == "(":
            stack.append(i)
        else:
            stack.pop()
            if not stack:
                stack.append(i)
            else:
                best = max(best, i - stack[-1])
    return best
''',
        oracle='''
def longestValidParentheses(s):
    def valid(t):
        depth = 0
        for ch in t:
            depth += 1 if ch == "(" else -1
            if depth < 0:
                return False
        return depth == 0
    best = 0
    for i in range(len(s)):
        for j in range(i + 2, len(s) + 1, 2):
            if valid(s[i:j]):
                best = max(best, j - i)
    return best
''',
    ),
    dict(
        slug="unique-paths", topics=["dynamic-programming"], entry="uniquePaths",
        params=[("m", "int"), ("n", "int")], returns="int",
        summary=summary("机器人在 m×n 网格左上角，每次只能向右或向下走一步，求到达右下角的不同路径数。", "A robot at the top-left of an m×n grid moves only right or down; count the distinct paths to the bottom-right."),
        constraints=[("1 ≤ m, n ≤ 100，答案 ≤ 2×10⁹", "1 ≤ m, n ≤ 100, answer ≤ 2×10⁹")],
        hints=[("到达格子 (i, j) 的最后一步来自上方或左方。", "The last move into (i, j) comes from above or from the left."),
               ("paths[i][j] = paths[i-1][j] + paths[i][j-1]，第一行和第一列都是 1。", "paths[i][j] = paths[i-1][j] + paths[i][j-1], with the first row and column all 1."),
               ("一维数组即可：row[j] += row[j-1]。也可以直接用组合数 C(m+n-2, m-1)。", "One row suffices: row[j] += row[j-1]. Or use the binomial C(m+n-2, m-1).")],
        explanation=("网格 DP，用一维数组滚动。时间 O(mn)，空间 O(n)。", "Grid DP with one rolling row. O(mn) time, O(n) space."),
        boundary=[[1, 1], [1, 5], [5, 1], [2, 2], [3, 7]],
        inputs=[{"type": "int", "min": 1, "max": 100, "smallMin": 1, "smallMax": 6}, {"type": "int", "min": 1, "max": 100, "smallMin": 1, "smallMax": 6}],
        hooks='''
import math
def valid(args):
    m, n = args
    return math.comb(m + n - 2, m - 1) <= 2 * 10 ** 9
''',
        reference='''
def uniquePaths(m, n):
    row = [1] * n
    for _ in range(1, m):
        for j in range(1, n):
            row[j] += row[j - 1]
    return row[-1]
''',
        oracle='''
def uniquePaths(m, n):
    from functools import lru_cache
    @lru_cache(maxsize=None)
    def walk(i, j):
        if i == m - 1 and j == n - 1:
            return 1
        total = 0
        if i + 1 < m:
            total += walk(i + 1, j)
        if j + 1 < n:
            total += walk(i, j + 1)
        return total
    return walk(0, 0)
''',
    ),
    dict(
        slug="minimum-path-sum", topics=["dynamic-programming"], entry="minPathSum",
        params=[("grid", "int[][]")], returns="int",
        summary=summary("在非负整数网格中，从左上角走到右下角，每次只能向右或向下，求路径上数字之和的最小值。", "In a grid of non-negative integers, walk from the top-left to the bottom-right moving only right or down; return the smallest path sum."),
        constraints=[("1 ≤ m, n ≤ 200，0 ≤ grid[i][j] ≤ 200", "1 ≤ m, n ≤ 200, 0 ≤ grid[i][j] ≤ 200")],
        hints=[("到达 (i, j) 的最小路径和，取决于从上方和从左方到达的最小值。", "The best sum into (i, j) depends on the best from above and from the left."),
               ("best[i][j] = grid[i][j] + min(best[i-1][j], best[i][j-1])；第一行、第一列只能单向累加。", "best[i][j] = grid[i][j] + min(best[i-1][j], best[i][j-1]); the first row and column accumulate in one direction."),
               ("可以只用一行数组滚动。", "One rolling row is enough.")],
        explanation=("网格 DP，O(mn) 时间，O(n) 空间。", "Grid DP in O(mn) time and O(n) space."),
        boundary=[[[[0]]], [[[5]]], [[[1, 2, 3]]], [[[1], [2], [3]]], [[[1, 3, 1], [1, 5, 1], [4, 2, 1]]]],
        inputs=[{"type": "int[][]", "minLength": 1, "maxLength": 200, "smallMaxLength": 4, "largeLength": 150, "row": {"minLength": 1, "maxLength": 200, "smallMaxLength": 4, "largeLength": 150}, "cell": {"min": 0, "max": 200}}],
        reference='''
def minPathSum(grid):
    n = len(grid[0])
    row = [0] * n
    for i, values in enumerate(grid):
        for j, v in enumerate(values):
            if i == 0 and j == 0:
                row[j] = v
            elif i == 0:
                row[j] = row[j - 1] + v
            elif j == 0:
                row[j] = row[j] + v
            else:
                row[j] = min(row[j], row[j - 1]) + v
    return row[-1]
''',
        oracle='''
import itertools
def minPathSum(grid):
    m, n = len(grid), len(grid[0])
    best = None
    for downs in itertools.combinations(range(m + n - 2), m - 1):
        i = j = 0
        total = grid[0][0]
        downs = set(downs)
        for step in range(m + n - 2):
            if step in downs:
                i += 1
            else:
                j += 1
            total += grid[i][j]
        best = total if best is None else min(best, total)
    return best
''',
    ),
    dict(
        slug="longest-palindromic-substring", topics=["dynamic-programming"], entry="longestPalindrome",
        params=[("s", "string")], returns="string", comparator={"kind": "validator", "name": "longest-palindromic-substring"},
        summary=summary("返回 s 中最长的回文子串。长度相同的最长回文子串有多个时，返回任意一个都算正确。", "Return the longest palindromic substring of s; when several have the maximum length, any of them is accepted."),
        constraints=[("1 ≤ |s| ≤ 1000，由数字和英文字母组成", "1 ≤ |s| ≤ 1000, digits and English letters")],
        hints=[("回文串关于中心对称。一个长度为 n 的字符串有多少个可能的中心？", "A palindrome mirrors around its center. How many possible centers does a string of length n have?"),
               ("2n - 1 个：每个字符本身，以及每两个相邻字符之间。", "2n - 1: every character, and every gap between adjacent characters."),
               ("从每个中心向两侧扩展，直到两端字符不同，记录最长的一段。也可以用 dp[i][j] 表示 s[i..j] 是否回文。", "Expand from each center until the ends differ and keep the longest; or let dp[i][j] say whether s[i..j] is a palindrome.")],
        explanation=("中心扩展法，时间 O(n²)，空间 O(1)；区间 DP 同为 O(n²) 但需要 O(n²) 空间。", "Center expansion in O(n²) time and O(1) space; interval DP is also O(n²) but needs O(n²) space."),
        boundary=[["a"], ["ab"], ["aa"], ["aba"], ["abba"], ["cbbd"]],
        inputs=[{"type": "string", "minLength": 1, "maxLength": 1000, "smallMaxLength": 9, "largeLength": 1000, "alphabet": "ab", "smallAlphabet": "abc"}],
        perCaseMs=3000,
        reference='''
def longestPalindrome(s):
    best = (0, 1)
    for center in range(2 * len(s) - 1):
        left = center // 2
        right = left + center % 2
        while left >= 0 and right < len(s) and s[left] == s[right]:
            left -= 1
            right += 1
        if right - left - 1 > best[1] - best[0]:
            best = (left + 1, right)
    return s[best[0]:best[1]]
''',
        oracle='''
def longestPalindrome(s):
    for length in range(len(s), 0, -1):
        for i in range(len(s) - length + 1):
            piece = s[i:i + length]
            if piece == piece[::-1]:
                return piece
''',
    ),
    dict(
        slug="longest-common-subsequence", topics=["dynamic-programming"], entry="longestCommonSubsequence",
        params=[("text1", "string"), ("text2", "string")], returns="int",
        summary=summary("返回两个字符串的最长公共子序列的长度（子序列可以不连续但要保持相对顺序）。", "Return the length of the longest common subsequence of two strings; a subsequence keeps relative order but need not be contiguous."),
        constraints=[("1 ≤ |text1|, |text2| ≤ 1000，只含小写字母", "1 ≤ |text1|, |text2| ≤ 1000, lowercase letters")],
        hints=[("dp[i][j] = text1 前 i 个字符与 text2 前 j 个字符的 LCS 长度。", "dp[i][j] = LCS length of the first i characters of text1 and the first j of text2."),
               ("末尾字符相同：dp[i][j] = dp[i-1][j-1] + 1；否则取 max(dp[i-1][j], dp[i][j-1])。", "Equal last characters: dp[i][j] = dp[i-1][j-1] + 1; otherwise max(dp[i-1][j], dp[i][j-1])."),
               ("dp[0][*] = dp[*][0] = 0；可以用一维数组加一个变量保存左上角的值。", "dp[0][*] = dp[*][0] = 0; one row plus a variable for the upper-left value suffices.")],
        explanation=("双序列 DP，时间 O(mn)，空间可降到 O(min(m, n))。", "Two-sequence DP in O(mn) time; space reduces to O(min(m, n))."),
        boundary=[["a", "a"], ["a", "b"], ["abc", "abc"], ["abc", "def"], ["abcde", "ace"]],
        inputs=[{"type": "string", "minLength": 1, "maxLength": 1000, "smallMaxLength": 7, "largeLength": 1000, "alphabet": "abcd", "smallAlphabet": "abc"},
                {"type": "string", "minLength": 1, "maxLength": 1000, "smallMaxLength": 7, "largeLength": 1000, "alphabet": "abcd", "smallAlphabet": "abc"}],
        perCaseMs=4000,
        reference='''
def longestCommonSubsequence(text1, text2):
    prev = [0] * (len(text2) + 1)
    for a in text1:
        cur = [0]
        for j, b in enumerate(text2):
            cur.append(prev[j] + 1 if a == b else max(prev[j + 1], cur[j]))
        prev = cur
    return prev[-1]
''',
        oracle='''
def longestCommonSubsequence(text1, text2):
    from functools import lru_cache
    @lru_cache(maxsize=None)
    def lcs(i, j):
        if i == len(text1) or j == len(text2):
            return 0
        if text1[i] == text2[j]:
            return 1 + lcs(i + 1, j + 1)
        return max(lcs(i + 1, j), lcs(i, j + 1))
    return lcs(0, 0)
''',
    ),
    dict(
        slug="edit-distance", topics=["dynamic-programming"], entry="minDistance",
        params=[("word1", "string"), ("word2", "string")], returns="int",
        summary=summary("把 word1 变成 word2 所需的最少操作数，每次操作可以插入、删除或替换一个字符。", "Return the fewest single-character insertions, deletions, or replacements that turn word1 into word2."),
        constraints=[("0 ≤ |word1|, |word2| ≤ 500，只含小写字母", "0 ≤ |word1|, |word2| ≤ 500, lowercase letters")],
        hints=[("dp[i][j] = 把 word1 前 i 个字符变成 word2 前 j 个字符的最少操作数。", "dp[i][j] = fewest operations turning the first i characters of word1 into the first j of word2."),
               ("末尾相同时 dp[i][j] = dp[i-1][j-1]；否则 1 + min(删除 dp[i-1][j]，插入 dp[i][j-1]，替换 dp[i-1][j-1])。", "With equal last characters dp[i][j] = dp[i-1][j-1]; otherwise 1 + min(delete dp[i-1][j], insert dp[i][j-1], replace dp[i-1][j-1])."),
               ("边界：dp[i][0] = i（全部删除），dp[0][j] = j（全部插入）。", "Bases: dp[i][0] = i (delete everything) and dp[0][j] = j (insert everything).")],
        explanation=("双序列 DP，时间 O(mn)，空间可降到 O(n)。", "Two-sequence DP in O(mn) time, reducible to O(n) space."),
        boundary=[["", ""], ["a", ""], ["", "abc"], ["a", "a"], ["horse", "ros"], ["intention", "execution"]],
        inputs=[{"type": "string", "minLength": 0, "maxLength": 500, "smallMaxLength": 6, "largeLength": 500, "alphabet": "abcd", "smallAlphabet": "abc"},
                {"type": "string", "minLength": 0, "maxLength": 500, "smallMaxLength": 6, "largeLength": 500, "alphabet": "abcd", "smallAlphabet": "abc"}],
        perCaseMs=3000,
        reference='''
def minDistance(word1, word2):
    prev = list(range(len(word2) + 1))
    for i, a in enumerate(word1, 1):
        cur = [i]
        for j, b in enumerate(word2, 1):
            if a == b:
                cur.append(prev[j - 1])
            else:
                cur.append(1 + min(prev[j], cur[j - 1], prev[j - 1]))
        prev = cur
    return prev[-1]
''',
        oracle='''
def minDistance(word1, word2):
    from functools import lru_cache
    @lru_cache(maxsize=None)
    def cost(i, j):
        if i == len(word1):
            return len(word2) - j
        if j == len(word2):
            return len(word1) - i
        if word1[i] == word2[j]:
            return cost(i + 1, j + 1)
        return 1 + min(cost(i + 1, j), cost(i, j + 1), cost(i + 1, j + 1))
    return cost(0, 0)
''',
    ),
]
