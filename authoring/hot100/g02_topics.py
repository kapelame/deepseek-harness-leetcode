"""Topics 数组技巧 / 矩阵 with lessons and seeded variants."""

PROBLEMS = []

TOPICS = [
    dict(
        id="array-techniques", order=7,
        title=("数组技巧：前缀和与原地操作", "Array techniques: prefix sums and in-place work"),
        summary=("把“区间和”变成两个前缀和之差，把数组本身当作哈希表或缓冲区，在 O(n) 时间、O(1) 额外空间内解决数组问题。",
                 "Turn range sums into a difference of two prefix sums, and use the array itself as a hash table or buffer to solve array problems in O(n) time and O(1) extra space."),
        prerequisites=["hashing"],
        problems=["subarray-sum-equals-k"],
        variants=["array-subarrays-divisible-by-k", "array-max-circular-subarray"],
        lesson=dict(
            motivation=("一家商店记录了每天的盈亏 `[3, -1, 2, -4, 5]`。老板问：“有多少段连续的日子，盈亏总和恰好是 1？”\n\n逐段求和需要枚举所有起点和终点，n 天就是 O(n²) 段，每段再求和更慢。\n\n关键观察：任意一段的和，都等于“到结尾为止的累计和”减去“到开头之前的累计和”。只要记录每个累计和出现过几次，就能在一次扫描中回答问题。",
                        "A shop logs daily profit and loss `[3, -1, 2, -4, 5]`. The owner asks: \"How many runs of consecutive days add up to exactly 1?\"\n\nSumming every run means enumerating all starts and ends, O(n²) runs for n days, and summing each run is slower still.\n\nThe key observation: the sum of any run equals the running total at its end minus the running total just before its start. Count how often each running total has appeared and a single scan answers the question."),
            strategy=("**前缀和**：`prefix[i]` 表示前 i 个元素之和，区间 `[l, r]` 的和 = `prefix[r+1] - prefix[l]`。\n\n**前缀和 + 哈希计数**：扫描时维护当前前缀和 s 与一个计数表；以当前位置结尾、和为 k 的子数组个数 = 之前出现过的 `s - k` 的次数。计数表初始包含 `{0: 1}`（空前缀）。\n\n**前缀积/后缀积**：把“除自身以外”拆成左侧部分 × 右侧部分，两遍扫描完成。\n\n**原地技巧**：用读写双指针压缩数组；用翻转实现轮转；把值 v 交换到下标 v-1，让数组充当哈希表。\n\n**复杂度**：都是 O(n) 时间；前缀和计数需要 O(n) 空间，原地技巧只需 O(1)。",
                      "**Prefix sums**: `prefix[i]` is the sum of the first i elements, so the sum of `[l, r]` is `prefix[r+1] - prefix[l]`.\n\n**Prefix sums + hash counts**: while scanning keep the running sum s and a count table; the subarrays ending here with sum k number exactly the earlier occurrences of `s - k`. Seed the table with `{0: 1}` for the empty prefix.\n\n**Prefix/suffix products**: split \"everything except me\" into a left part times a right part and finish in two passes.\n\n**In-place tricks**: compact with read/write pointers, rotate with reversals, and swap value v to index v-1 so the array acts as a hash table.\n\n**Complexity**: all run in O(n) time; prefix counting needs O(n) space, the in-place tricks O(1)."),
            example=dict(
                title=("例：nums = [3, -1, 2, -4, 5]，k = 1", "Example: nums = [3, -1, 2, -4, 5], k = 1"),
                body=("计数表记录每个前缀和出现的次数；每一步把 count[s - k] 加到答案上。", "The table counts each prefix sum; every step adds count[s - k] to the answer."),
                columns=["x", "s", "s-k", "count before", "answer"],
                trace=[
                    ({"x": "3", "s": "3", "s-k": "2", "count before": "{0:1}", "answer": "0"}, ("2 没出现过，没有以这里结尾的答案。", "2 has not appeared; nothing ends here.")),
                    ({"x": "-1", "s": "2", "s-k": "1", "count before": "{0:1, 3:1}", "answer": "0"}, ("1 没出现过。", "1 has not appeared.")),
                    ({"x": "2", "s": "4", "s-k": "3", "count before": "{0:1, 3:1, 2:1}", "answer": "1"}, ("3 出现过一次：子数组 [-1, 2] 的和为 1。", "3 appeared once: the subarray [-1, 2] sums to 1.")),
                    ({"x": "-4", "s": "0", "s-k": "-1", "count before": "{0:1, 3:1, 2:1, 4:1}", "answer": "1"}, ("-1 没出现过。", "-1 has not appeared.")),
                    ({"x": "5", "s": "5", "s-k": "4", "count before": "{0:2, 3:1, 2:1, 4:1}", "answer": "2"}, ("4 出现过一次：子数组 [-4, 5] 的和为 1。", "4 appeared once: the subarray [-4, 5] sums to 1.")),
                ],
            ),
            check=[
                dict(id="empty-prefix", prompt=("为什么计数表要以 {0: 1} 开始？", "Why does the count table start as {0: 1}?"),
                     options=[("为了让和为 k、从下标 0 开始的子数组也能被计数", "So subarrays that start at index 0 and sum to k are counted too"),
                              ("为了避免除以零", "To avoid dividing by zero"),
                              ("因为数组至少有一个元素", "Because the array has at least one element")],
                     answer=0, explanation=("从下标 0 开始的子数组对应“空前缀”，其前缀和为 0。", "A subarray starting at index 0 pairs with the empty prefix, whose sum is 0.")),
                dict(id="negatives", prompt=("数组含负数时，为什么双指针滑动窗口不能统计和为 k 的子数组？", "With negative numbers, why can a sliding window not count subarrays summing to k?"),
                     options=[("窗口扩大时和不一定变大，无法单调地决定移动哪一端", "Growing the window does not always increase the sum, so there is no monotone rule for which end to move"),
                              ("负数会让前缀和溢出", "Negative numbers overflow the prefix sums"),
                              ("滑动窗口只能处理字符串", "Sliding windows only work on strings")],
                     answer=0, explanation=("滑动窗口依赖“扩大必增、缩小必减”的单调性，负数打破了它；前缀和计数不依赖单调性。", "A sliding window relies on growing raising the sum and shrinking lowering it; negatives break that, while prefix counting needs no monotonicity.")),
            ],
            practice="subarray-sum-equals-k",
            reflection=("用自己的话解释：为什么“之前出现过多少次 s - k”恰好等于“以当前位置结尾、和为 k 的子数组个数”？", "In your own words: why does the number of earlier occurrences of s - k equal the number of subarrays ending here that sum to k?"),
        ),
    ),
    dict(
        id="matrix", order=8,
        title=("矩阵：边界、坐标变换与有序结构", "Matrices: bounds, coordinate maps, and sorted structure"),
        summary=("把矩阵问题拆成坐标变换、按层遍历和利用行列有序性三类，用边界变量和不变量避免越界与重复。",
                 "Split matrix problems into coordinate maps, layer-by-layer walks, and searches that exploit sorted rows and columns, using bound variables and invariants to avoid overruns and repeats."),
        prerequisites=["two-pointers"],
        problems=["spiral-matrix"],
        variants=["matrix-rotate-counterclockwise", "matrix-count-not-greater"],
        lesson=dict(
            motivation=("一张照片存成 n×n 的像素矩阵，你要把它顺时针旋转 90 度，但内存紧张，不能复制一份。\n\n直接写 `new[j][n-1-i] = old[i][j]` 需要第二个矩阵。原地交换又容易把还没处理的格子覆盖掉。\n\n把旋转拆成两个简单的、天然原地的操作——沿对角线翻转和左右翻转——问题就变得机械而可靠。很多矩阵题都是这样：找到正确的坐标变换或遍历顺序，代码就只剩边界管理。",
                        "A photo is stored as an n×n pixel matrix and must be rotated 90 degrees clockwise, but memory is tight, so you cannot copy it.\n\nWriting `new[j][n-1-i] = old[i][j]` needs a second matrix, and swapping in place easily overwrites cells not processed yet.\n\nSplit the rotation into two simple operations that are naturally in place, a diagonal flip and a left-right flip, and the task becomes mechanical and reliable. Many matrix problems work this way: find the right coordinate map or traversal order and only bound bookkeeping remains."),
            strategy=("**坐标变换**：顺时针旋转 = 转置 + 每行翻转；逆时针旋转 = 转置 + 每列翻转（或每行翻转 + 转置）。先在纸上验证 (i, j) 的去向。\n\n**按层遍历**：用 top、bottom、left、right 四个边界描述“还没访问的矩形”，每走完一条边就收缩对应边界；只剩一行或一列时要防止重复。\n\n**原地标记**：需要“先记录、后修改”时，可用第一行、第一列充当标记数组。\n\n**行列有序**：从右上角（或左下角）出发，每次比较都能排除一整行或一整列，O(m + n)。\n\n**不变量**：遍历时始终明确“哪些格子已处理、哪些未处理”。",
                      "**Coordinate maps**: clockwise rotation = transpose + reverse each row; counter-clockwise = transpose + reverse each column (or reverse each row, then transpose). Check where (i, j) goes on paper first.\n\n**Layer walks**: describe the unvisited rectangle with top, bottom, left, and right bounds and shrink one after each side; guard against repeats when one row or column remains.\n\n**In-place markers**: when you must record before modifying, the first row and column can serve as the marker arrays.\n\n**Sorted rows and columns**: start at the top-right (or bottom-left); each comparison discards a whole row or column, O(m + n).\n\n**Invariant**: always know which cells are processed and which are not."),
            example=dict(
                title=("例：螺旋遍历 [[1,2,3],[4,5,6],[7,8,9]]", "Example: spiral walk of [[1,2,3],[4,5,6],[7,8,9]]"),
                body=("四个边界围出尚未访问的矩形。", "Four bounds enclose the unvisited rectangle."),
                columns=["side", "output", "bounds after"],
                trace=[
                    ({"side": "top →", "output": "1 2 3", "bounds after": "top=1"}, ("走完上边，上边界下移。", "After the top side, the top bound moves down.")),
                    ({"side": "right ↓", "output": "6 9", "bounds after": "right=1"}, ("走完右边，右边界左移。", "After the right side, the right bound moves left.")),
                    ({"side": "bottom ←", "output": "8 7", "bounds after": "bottom=1"}, ("还有多于一行，才走下边。", "Walk the bottom only while more than one row remains.")),
                    ({"side": "left ↑", "output": "4", "bounds after": "left=1"}, ("左边只剩中间行。", "Only the middle row remains on the left side.")),
                    ({"side": "center", "output": "5", "bounds after": "done"}, ("边界交错前输出最后一个格子。", "The last cell is emitted before the bounds cross.")),
                ],
            ),
            check=[
                dict(id="rotation-map", prompt=("n×n 矩阵顺时针旋转 90 度后，原来的 (i, j) 去了哪里？", "After a 90-degree clockwise rotation of an n×n matrix, where does (i, j) go?"),
                     options=[("(j, n-1-i)", "(j, n-1-i)"), ("(n-1-j, i)", "(n-1-j, i)"), ("(n-1-i, n-1-j)", "(n-1-i, n-1-j)")],
                     answer=0, explanation=("第 i 行变成倒数第 i 列，第 j 列变成第 j 行。", "Row i becomes column n-1-i and column j becomes row j.")),
                dict(id="staircase", prompt=("在行列都递增的矩阵中，从右上角开始，若当前值大于 target，应该怎么移动？", "In a matrix sorted along rows and columns, starting at the top-right, which way do you move when the value exceeds target?"),
                     options=[("向左，因为这一列剩下的值都更大", "Left, because the rest of this column is larger"),
                              ("向下，因为下面的值更小", "Down, because values below are smaller"),
                              ("向右", "Right")],
                     answer=0, explanation=("当前列向下只会更大，所以整列都可以排除。", "The column only grows downward, so the whole column is ruled out.")),
            ],
            practice="spiral-matrix",
            reflection=("螺旋遍历中，为什么只剩一行或一列时要跳过“下边”和“左边”？举一个会出错的例子。", "In the spiral walk, why skip the bottom and left sides when only one row or column remains? Give an input that would go wrong otherwise."),
        ),
    ),
]

VARIANTS = [
    dict(
        id="array-subarrays-divisible-by-k", parent="subarray-sum-equals-k", topic="array-techniques",
        title=("和可被 K 整除的子数组", "Subarrays with Sums Divisible by K"),
        summary=("统计和能被 k 整除的连续非空子数组个数。", "Count non-empty contiguous subarrays whose sum is divisible by k."),
        statement=("给定整数数组 `nums`（可含负数）和正整数 `k`，返回和能被 `k` 整除的**连续非空**子数组的个数。\n\n注意：负数的余数需要规范到 `0..k-1` 再比较。",
                   "Given an integer array `nums` (negatives allowed) and a positive integer `k`, return the number of **non-empty contiguous** subarrays whose sum is divisible by `k`.\n\nNote: normalize remainders of negative numbers into `0..k-1` before comparing them."),
        difficulty="medium", skills=["prefix sums", "remainder counting"],
        differences=[("reasoning", ("目标从“差恰好等于 k”变成“差是 k 的倍数”，要比较的是前缀和的余数而不是前缀和本身。", "The target changes from a difference of exactly k to a difference that is a multiple of k, so prefix-sum remainders are compared instead of the sums.")),
                     ("constraints", ("负数让余数可能为负，必须规范化后再计数。", "Negative numbers can make remainders negative, so they must be normalized before counting."))],
        transfer=("“区间和 = 两个前缀和之差”加“哈希计数”的骨架不变；变化在于计数的键：两个前缀和之差能被 k 整除，当且仅当它们对 k 的余数相同。",
                  "The skeleton of range sum = difference of prefix sums plus hash counting stays; the key changes: two prefix sums differ by a multiple of k exactly when their remainders modulo k match."),
        entry="subarraysDivByK", params=[("nums", "int[]"), ("k", "int")], returns="int",
        constraints=[("1 ≤ n ≤ 3×10⁴，-10⁴ ≤ nums[i] ≤ 10⁴，2 ≤ k ≤ 10⁴", "1 ≤ n ≤ 3×10⁴, -10⁴ ≤ nums[i] ≤ 10⁴, 2 ≤ k ≤ 10⁴")],
        examples=[[[4, 5, 0, -2, -3, 1], 5], [[-1, 2, 9], 2]],
        boundary=[[[5], 5], [[1], 2], [[-5], 5], [[0, 0], 3], [[-1, -1], 2]],
        inputs=[{"type": "int[]", "minLength": 1, "smallMaxLength": 10, "largeLength": 20000, "min": -10000, "max": 10000, "smallMin": -6, "smallMax": 6},
                {"type": "int", "min": 2, "max": 10000, "smallMin": 2, "smallMax": 6}],
        hints=[("a 与 b 的差能被 k 整除，等价于什么？", "When is a - b divisible by k?"),
               ("等价于 a mod k == b mod k。把前缀和换成前缀和的余数来计数。", "Exactly when a mod k == b mod k. Count prefix-sum remainders instead of prefix sums."),
               ("初始 count[0] = 1；每一步答案加上 count[s mod k]（规范到非负），再把它加一。", "Start with count[0] = 1; each step add count[s mod k] (normalized to be non-negative), then increment it.")],
        reference='''
def subarraysDivByK(nums, k):
    counts = [0] * k
    counts[0] = 1
    total = 0
    answer = 0
    for x in nums:
        total = (total + x) % k
        answer += counts[total]
        counts[total] += 1
    return answer
''',
        oracle='''
def subarraysDivByK(nums, k):
    return sum(1 for i in range(len(nums)) for j in range(i, len(nums)) if sum(nums[i:j + 1]) % k == 0)
''',
        mutants={
            "exact-sum": '''
def subarraysDivByK(nums, k):
    counts = {0: 1}
    total = 0
    answer = 0
    for x in nums:
        total += x
        answer += counts.get(total - k, 0)
        counts[total] = counts.get(total, 0) + 1
    return answer
''',
            "raw-remainder": '''
import math
def subarraysDivByK(nums, k):
    counts = {0: 1}
    total = 0
    answer = 0
    for x in nums:
        total += x
        key = int(math.fmod(total, k))
        answer += counts.get(key, 0)
        counts[key] = counts.get(key, 0) + 1
    return answer
''',
            "no-empty-prefix": '''
def subarraysDivByK(nums, k):
    counts = {}
    total = 0
    answer = 0
    for x in nums:
        total = (total + x) % k
        answer += counts.get(total, 0)
        counts[total] = counts.get(total, 0) + 1
    return answer
''',
        },
    ),
    dict(
        id="array-max-circular-subarray", parent="maximum-subarray", topic="array-techniques",
        title=("环形子数组的最大和", "Maximum Sum of a Circular Subarray"),
        summary=("数组首尾相连成环，求和最大的非空连续子数组（每个元素至多用一次）。", "The array wraps around; return the largest sum of a non-empty contiguous subarray, using each element at most once."),
        statement=("给定首尾相连的环形整数数组 `nums`，求和最大的**非空**连续子数组。子数组可以跨过末尾回到开头，但每个元素至多出现一次。\n\n返回这个最大和。",
                   "Given a circular integer array `nums` whose end connects to its start, find the **non-empty** contiguous subarray with the largest sum. A subarray may wrap from the end back to the start, but each element appears at most once.\n\nReturn that maximum sum."),
        difficulty="medium", skills=["Kadane's algorithm", "complement reasoning"],
        differences=[("input-structure", ("数组变成环形，最优子数组可能跨越首尾。", "The array becomes circular, so the best subarray may wrap around the ends.")),
                     ("reasoning", ("跨越首尾的子数组 = 总和 − 中间某段不选的子数组，需要同时求最小子数组和，并处理全为负数的情况。", "A wrapping subarray equals the total minus some middle part left out, so the minimum subarray sum is needed too, along with the all-negative case."))],
        transfer=("Kadane“以当前位置结尾的最佳值”的递推保留，并对称地用于求最小和；新增的思考是用补集把环形情况化归为线性情况。",
                  "Kadane's best-ending-here recurrence carries over and is mirrored for the minimum; the new step reduces the circular case to the linear one through the complement."),
        entry="maxSubarraySumCircular", params=[("nums", "int[]")], returns="int",
        constraints=[("1 ≤ n ≤ 3×10⁴，-3×10⁴ ≤ nums[i] ≤ 3×10⁴", "1 ≤ n ≤ 3×10⁴, -3×10⁴ ≤ nums[i] ≤ 3×10⁴")],
        examples=[[[5, -3, 5]], [[-3, -2, -3]], [[1, -2, 3, -2]]],
        boundary=[[[-1]], [[7]], [[-2, -3]], [[3, -1, 2, -1]], [[30000, -30000, 30000]]],
        inputs=[{"type": "int[]", "minLength": 1, "smallMaxLength": 9, "largeLength": 20000, "min": -30000, "max": 30000, "smallMin": -6, "smallMax": 6}],
        hints=[("最优子数组要么不跨越首尾，要么跨越。前一种就是普通的最大子数组和。", "The best subarray either wraps or it does not; the second case is the ordinary maximum subarray."),
               ("跨越首尾的子数组，等于总和减去中间一段被“丢掉”的子数组。让丢掉的部分尽量小。", "A wrapping subarray is the total minus a middle part that is left out; make the left-out part as small as possible."),
               ("答案 = max(最大子数组和, 总和 − 最小子数组和)；但如果所有数都为负，只能取前者。", "Answer = max(max subarray, total − min subarray), except when all numbers are negative, where only the former counts.")],
        reference='''
def maxSubarraySumCircular(nums):
    best_max = cur_max = nums[0]
    best_min = cur_min = nums[0]
    for x in nums[1:]:
        cur_max = max(x, cur_max + x)
        best_max = max(best_max, cur_max)
        cur_min = min(x, cur_min + x)
        best_min = min(best_min, cur_min)
    total = sum(nums)
    if best_max < 0:
        return best_max
    return max(best_max, total - best_min)
''',
        oracle='''
def maxSubarraySumCircular(nums):
    n = len(nums)
    best = None
    for start in range(n):
        total = 0
        for length in range(1, n + 1):
            total += nums[(start + length - 1) % n]
            best = total if best is None else max(best, total)
    return best
''',
        mutants={
            "linear-only": '''
def maxSubarraySumCircular(nums):
    best = cur = nums[0]
    for x in nums[1:]:
        cur = max(x, cur + x)
        best = max(best, cur)
    return best
''',
            "missing-all-negative": '''
def maxSubarraySumCircular(nums):
    best_max = cur_max = nums[0]
    best_min = cur_min = nums[0]
    for x in nums[1:]:
        cur_max = max(x, cur_max + x)
        best_max = max(best_max, cur_max)
        cur_min = min(x, cur_min + x)
        best_min = min(best_min, cur_min)
    return max(best_max, sum(nums) - best_min)
''',
        },
    ),
    dict(
        id="matrix-rotate-counterclockwise", parent="rotate-image", topic="matrix",
        title=("逆时针旋转图像", "Rotate an Image Counter-clockwise"),
        summary=("把 n×n 矩阵原地逆时针旋转 90 度。", "Rotate an n×n matrix 90 degrees counter-clockwise in place."),
        statement=("给定 n×n 整数矩阵 `matrix`，将它**逆时针**旋转 90 度。\n\n必须原地修改 `matrix`，不能分配另一个矩阵；函数不返回值。",
                   "Given an n×n integer matrix `matrix`, rotate it 90 degrees **counter-clockwise**.\n\nModify `matrix` in place without allocating another matrix; the function returns nothing."),
        difficulty="medium", skills=["coordinate transforms", "in-place swaps"],
        differences=[("output", ("旋转方向相反，(i, j) 去到 (n-1-j, i)。", "The direction is reversed, so (i, j) moves to (n-1-j, i).")),
                     ("reasoning", ("需要重新推导由哪两个原地翻转组合而成。", "You must re-derive which two in-place flips compose the rotation."))],
        transfer=("“把旋转拆成两个天然原地的翻转”的方法保留；需要重新验证翻转的组合与顺序。",
                  "Splitting a rotation into two naturally in-place flips carries over; the combination and order of the flips must be re-derived."),
        entry="rotateLeft", params=[("matrix", "int[][]")], returns="int[][]", shape={"kind": "in-place", "param": 0},
        constraints=[("1 ≤ n ≤ 20，-1000 ≤ matrix[i][j] ≤ 1000", "1 ≤ n ≤ 20, -1000 ≤ matrix[i][j] ≤ 1000")],
        examples=[[[[1, 2], [3, 4]]], [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]]],
        boundary=[[[[1]]], [[[0, 1], [2, 3]]], [[[5, 1, 9, 11], [2, 4, 8, 10], [13, 3, 6, 7], [15, 14, 12, 16]]]],
        inputs=[{"type": "int[][]", "minLength": 1, "maxLength": 20, "smallMaxLength": 5, "largeLength": 20, "row": {"minLength": 1, "maxLength": 20}, "cell": {"min": -1000, "max": 1000}}],
        hooks='''
def adjust(args, rng, size):
    n = len(args[0])
    return [[[rng.randint(-1000, 1000) for _ in range(n)] for _ in range(n)]]
''',
        hints=[("逆时针旋转后，第一行变成了哪里？", "After a counter-clockwise rotation, where does the first row go?"),
               ("第一行变成第一列（自下而上读）。试试先转置，再看还差什么。", "The first row becomes the first column, read bottom to top. Try transposing first and see what is left."),
               ("转置后再上下翻转（翻转行的顺序）即可；或先左右翻转每行再转置。", "After transposing, reverse the order of the rows; or reverse each row first and then transpose.")],
        reference='''
def rotateLeft(matrix):
    n = len(matrix)
    for i in range(n):
        for j in range(i + 1, n):
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
    matrix.reverse()
''',
        oracle='''
def rotateLeft(matrix):
    n = len(matrix)
    copy = [row[:] for row in matrix]
    for i in range(n):
        for j in range(n):
            matrix[n - 1 - j][i] = copy[i][j]
''',
        mutants={
            "clockwise": '''
def rotateLeft(matrix):
    n = len(matrix)
    for i in range(n):
        for j in range(i + 1, n):
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
    for row in matrix:
        row.reverse()
''',
            "transpose-only": '''
def rotateLeft(matrix):
    n = len(matrix)
    for i in range(n):
        for j in range(i + 1, n):
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
''',
        },
    ),
    dict(
        id="matrix-count-not-greater", parent="search-a-2d-matrix-ii", topic="matrix",
        title=("有序矩阵中不大于目标的元素个数", "Count Elements Not Greater Than a Target"),
        summary=("行列均递增的矩阵中，统计 ≤ target 的元素个数。", "Count elements ≤ target in a matrix sorted along rows and columns."),
        statement=("矩阵 `matrix` 每行从左到右非递减、每列从上到下非递减。给定 `target`，返回矩阵中**小于或等于** `target` 的元素个数。\n\n要求时间复杂度 O(m + n)。",
                   "Each row of `matrix` is non-decreasing left to right and each column is non-decreasing top to bottom. Given `target`, return how many elements are **less than or equal to** `target`.\n\nAim for O(m + n) time."),
        difficulty="medium", skills=["staircase search", "counting with monotone structure"],
        differences=[("output", ("从“是否存在”变成“有多少个”，需要在走阶梯时累加整段的数量。", "The question changes from whether the target exists to how many elements qualify, so whole segments are added while walking the staircase.")),
                     ("reasoning", ("必须想清楚每一步排除掉的那一行或一列中，有多少元素满足条件。", "You must work out how many elements of the row or column discarded at each step satisfy the condition."))],
        transfer=("从角落出发、每次比较排除一行或一列的阶梯搜索保留；新增的是在排除时计数。",
                  "The staircase walk from a corner that discards a row or column per comparison carries over; the addition is counting while discarding."),
        entry="countNotGreater", params=[("matrix", "int[][]"), ("target", "int")], returns="int",
        constraints=[("1 ≤ m, n ≤ 300，-10⁹ ≤ 元素, target ≤ 10⁹", "1 ≤ m, n ≤ 300, -10⁹ ≤ values, target ≤ 10⁹")],
        examples=[[[[1, 4, 7], [2, 5, 8], [3, 6, 9]], 5], [[[1, 1], [1, 1]], 1]],
        boundary=[[[[1]], 0], [[[1]], 1], [[[1, 2], [2, 3]], 2], [[[-5, -5]], -6]],
        inputs=[{"type": "int[][]", "minLength": 1, "maxLength": 300, "smallMaxLength": 5, "largeLength": 300, "row": {"minLength": 1, "maxLength": 300, "smallMaxLength": 5, "largeLength": 300}, "cell": {"min": 0, "max": 3}},
                {"type": "int", "min": -10, "max": 1000}],
        hooks='''
def adjust(args, rng, size):
    grid, _ = args
    rows, cols = len(grid), len(grid[0])
    out = [[0] * cols for _ in range(rows)]
    for i in range(rows):
        for j in range(cols):
            base = max(out[i - 1][j] if i else -10, out[i][j - 1] if j else -10)
            out[i][j] = base + rng.randint(0, 2)
    flat = [x for row in out for x in row]
    target = rng.choice(flat) if rng.random() < 0.6 else rng.randint(-12, flat[-1] + 2)
    return [out, target]
''',
        hints=[("从左下角出发：当前值 ≤ target 时，这一列在它上面的元素都满足条件吗？", "Start at the bottom-left: when the value is ≤ target, do all elements above it in this column qualify?"),
               ("是的：这一列从顶到当前行都 ≤ target，可以一次加上 i + 1 个，然后右移。", "Yes: the column from the top down to this row is ≤ target, so add i + 1 at once and move right."),
               ("当前值 > target 时上移一行；走出矩阵时结束，共 O(m + n) 步。", "When the value exceeds target, move up a row; stop when you leave the matrix, O(m + n) steps.")],
        reference='''
def countNotGreater(matrix, target):
    i, j = len(matrix) - 1, 0
    count = 0
    while i >= 0 and j < len(matrix[0]):
        if matrix[i][j] <= target:
            count += i + 1
            j += 1
        else:
            i -= 1
    return count
''',
        oracle='''
def countNotGreater(matrix, target):
    return sum(1 for row in matrix for x in row if x <= target)
''',
        mutants={
            "strict": '''
def countNotGreater(matrix, target):
    i, j = len(matrix) - 1, 0
    count = 0
    while i >= 0 and j < len(matrix[0]):
        if matrix[i][j] < target:
            count += i + 1
            j += 1
        else:
            i -= 1
    return count
''',
            "off-by-one": '''
def countNotGreater(matrix, target):
    i, j = len(matrix) - 1, 0
    count = 0
    while i >= 0 and j < len(matrix[0]):
        if matrix[i][j] <= target:
            count += i
            j += 1
        else:
            i -= 1
    return count
''',
            "exists-only": '''
def countNotGreater(matrix, target):
    return 1 if any(x <= target for row in matrix for x in row) else 0
''',
        },
    ),
]
