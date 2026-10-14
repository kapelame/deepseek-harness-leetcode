"""Hot 100 groups 普通数组 / 矩阵."""

ORIGINAL = ("（本课程原创简述，完整题面见 LeetCode 官方页面。）", " (Original summary written for Learn; see LeetCode for the official statement.)")


def summary(zh, en):
    return (zh + ORIGINAL[0], en + ORIGINAL[1])


PROBLEMS = [
    dict(
        slug="maximum-subarray", topics=["array-techniques"], entry="maxSubArray",
        params=[("nums", "int[]")], returns="int",
        summary=summary("求和最大的连续非空子数组，返回这个最大和。", "Return the largest sum of any non-empty contiguous subarray."),
        constraints=[("1 ≤ n ≤ 10⁵，-10⁴ ≤ nums[i] ≤ 10⁴", "1 ≤ n ≤ 10⁵, -10⁴ ≤ nums[i] ≤ 10⁴")],
        hints=[("以位置 i 结尾的最大子数组，与以 i-1 结尾的最大子数组有什么关系？", "How does the best subarray ending at i relate to the best one ending at i-1?"),
               ("如果以 i-1 结尾的最大和是负数，把它接上只会更差。", "If the best sum ending at i-1 is negative, extending it only hurts."),
               ("cur = max(nums[i], cur + nums[i])，同时用 best 记录所有 cur 的最大值。", "cur = max(nums[i], cur + nums[i]); track best as the maximum cur seen.")],
        explanation=("Kadane 算法：以当前位置结尾的最大和要么从当前元素重新开始，要么接上前一个最大和。时间 O(n)，空间 O(1)。",
                     "Kadane's algorithm: the best sum ending here either restarts at this element or extends the previous best. O(n) time, O(1) space."),
        boundary=[[[-1]], [[5]], [[-3, -2, -5]], [[1, -1, 1]], [[10000, -10000, 10000]]],
        inputs=[{"type": "int[]", "minLength": 1, "smallMaxLength": 10, "largeLength": 20000, "min": -10000, "max": 10000, "smallMin": -6, "smallMax": 6}],
        reference='''
def maxSubArray(nums):
    best = cur = nums[0]
    for x in nums[1:]:
        cur = max(x, cur + x)
        best = max(best, cur)
    return best
''',
        oracle='''
def maxSubArray(nums):
    return max(sum(nums[i:j + 1]) for i in range(len(nums)) for j in range(i, len(nums)))
''',
    ),
    dict(
        slug="merge-intervals", topics=["array-techniques"], entry="merge",
        params=[("intervals", "int[][]")], returns="int[][]", comparator={"kind": "unordered"},
        summary=summary("合并所有重叠（包括端点相接）的区间，返回互不重叠且覆盖全部输入的区间，顺序不限。",
                        "Merge all overlapping intervals, including ones that only touch at an endpoint, and return non-overlapping intervals that cover the input, in any order."),
        constraints=[("1 ≤ n ≤ 10⁴，0 ≤ start ≤ end ≤ 10⁴", "1 ≤ n ≤ 10⁴, 0 ≤ start ≤ end ≤ 10⁴")],
        hints=[("如果区间按起点排好序，哪些区间可能会重叠？", "If intervals are sorted by start, which ones can overlap?"),
               ("排序后，新区间只可能和结果中的最后一个区间重叠。", "After sorting, a new interval can only overlap the last interval in the result."),
               ("起点 ≤ 上一个终点就合并（终点取较大值），否则追加新区间。", "Merge when its start ≤ the last end (keep the larger end); otherwise append it.")],
        explanation=("按起点排序后线性扫描，每个区间要么扩展结果中最后一个区间，要么开启新区间。时间 O(n log n)，空间 O(n)。",
                     "Sort by start and scan once; each interval either extends the last merged interval or starts a new one. O(n log n) time, O(n) space."),
        boundary=[[[[1, 1]]], [[[1, 4], [4, 5]]], [[[1, 4], [2, 3]]], [[[5, 6], [1, 2]]], [[[0, 0], [0, 0]]]],
        inputs=[{"type": "int[][]", "minLength": 1, "smallMaxLength": 6, "largeLength": 8000, "row": {"minLength": 2, "maxLength": 2, "smallMaxLength": 2, "largeLength": 2}, "cell": {"min": 0, "max": 10000}}],
        hooks='''
def adjust(args, rng, size):
    intervals = args[0]
    limit = 20 if size == "small" else 10000
    out = []
    for _ in intervals:
        a = rng.randint(0, limit)
        b = min(limit, a + rng.randint(0, 3 if size == "small" else 30))
        out.append([a, b])
    return [out]
''',
        reference='''
def merge(intervals):
    out = []
    for start, end in sorted(intervals):
        if out and start <= out[-1][1]:
            out[-1][1] = max(out[-1][1], end)
        else:
            out.append([start, end])
    return out
''',
        oracle='''
def merge(intervals):
    parts = [list(item) for item in intervals]
    changed = True
    while changed:
        changed = False
        for i in range(len(parts)):
            for j in range(i + 1, len(parts)):
                a, b = parts[i], parts[j]
                if a[0] <= b[1] and b[0] <= a[1]:
                    parts[i] = [min(a[0], b[0]), max(a[1], b[1])]
                    parts.pop(j)
                    changed = True
                    break
            if changed:
                break
    return parts
''',
    ),
    dict(
        slug="rotate-array", topics=["array-techniques"], entry="rotate",
        params=[("nums", "int[]"), ("k", "int")], returns="int[]", shape={"kind": "in-place", "param": 0},
        summary=summary("把数组原地向右轮转 k 步（最后一个元素移到最前面，重复 k 次）。", "Rotate the array to the right by k steps in place (the last element moves to the front, k times)."),
        constraints=[("1 ≤ n ≤ 10⁵，-2³¹ ≤ nums[i] ≤ 2³¹-1，0 ≤ k ≤ 10⁵", "1 ≤ n ≤ 10⁵, -2³¹ ≤ nums[i] ≤ 2³¹-1, 0 ≤ k ≤ 10⁵")],
        hints=[("k 可能大于数组长度。轮转 n 步之后数组会怎样？", "k may exceed the length. What does rotating by n steps do?"),
               ("轮转后，原来的最后 k 个元素到了最前面。能否用“翻转”做到？", "After rotation, the last k elements come first. Can reversals achieve that?"),
               ("先整体翻转，再分别翻转前 k 个和后 n-k 个，k 先对 n 取模。", "Reverse the whole array, then reverse the first k and the last n-k, with k taken modulo n.")],
        explanation=("三次翻转：整体翻转后，前 k 个与后 n-k 个各自翻转回正确顺序。时间 O(n)，额外空间 O(1)。",
                     "Three reversals: reverse everything, then reverse the first k and the remaining n-k back into order. O(n) time, O(1) extra space."),
        boundary=[[[1], 0], [[1], 5], [[1, 2], 3], [[1, 2, 3], 3], [[-1, -100, 3, 99], 2]],
        inputs=[{"type": "int[]", "minLength": 1, "smallMaxLength": 8, "largeLength": 20000, "min": -1000, "max": 1000, "smallMin": -9, "smallMax": 9},
                {"type": "int", "min": 0, "max": 100000, "smallMin": 0, "smallMax": 12}],
        reference='''
def rotate(nums, k):
    n = len(nums)
    k %= n
    def reverse(i, j):
        while i < j:
            nums[i], nums[j] = nums[j], nums[i]
            i += 1
            j -= 1
    reverse(0, n - 1)
    reverse(0, k - 1)
    reverse(k, n - 1)
''',
        oracle='''
def rotate(nums, k):
    for _ in range(k):
        nums.insert(0, nums.pop())
''',
    ),
    dict(
        slug="product-of-array-except-self", topics=["array-techniques"], entry="productExceptSelf",
        params=[("nums", "int[]")], returns="int[]",
        summary=summary("对每个位置，返回数组中除它以外所有元素的乘积。不能使用除法，要求 O(n)。",
                        "For each position, return the product of every other element. Do not use division; aim for O(n)."),
        constraints=[("2 ≤ n ≤ 10⁵，-30 ≤ nums[i] ≤ 30，任意前缀或后缀的乘积都在 32 位整数范围内", "2 ≤ n ≤ 10⁵, -30 ≤ nums[i] ≤ 30, every prefix or suffix product fits in a 32-bit integer")],
        hints=[("“除自己以外的乘积”可以拆成左边部分和右边部分的乘积吗？", "Can 'product of everything else' split into a left part and a right part?"),
               ("answer[i] = 前缀积(0..i-1) × 后缀积(i+1..n-1)。", "answer[i] = prefix product (0..i-1) × suffix product (i+1..n-1)."),
               ("第一遍从左写入前缀积，第二遍从右乘上后缀积，只用一个变量保存后缀积。", "First pass writes prefix products left to right; second pass multiplies suffix products right to left using a single variable.")],
        explanation=("两遍扫描：先在答案数组中存前缀积，再从右向左乘以累积的后缀积。时间 O(n)，除输出外 O(1) 空间。",
                     "Two passes: store prefix products in the answer, then multiply by a running suffix product from the right. O(n) time, O(1) extra space besides the output."),
        boundary=[[[1, 2]], [[0, 0]], [[0, 4, 5]], [[-1, 1, 0, -3, 3]], [[1, 1, 1, 1]]],
        inputs=[{"type": "int[]", "minLength": 2, "smallMaxLength": 8, "largeLength": 20000, "min": -1, "max": 1, "smallMin": -3, "smallMax": 3}],
        hooks='''
def valid(args):
    nums = args[0]
    product = 1
    for x in nums:
        product *= x
        if abs(product) > 2 ** 31 - 1:
            return False
    product = 1
    for x in reversed(nums):
        product *= x
        if abs(product) > 2 ** 31 - 1:
            return False
    return True
''',
        reference='''
def productExceptSelf(nums):
    n = len(nums)
    out = [1] * n
    for i in range(1, n):
        out[i] = out[i - 1] * nums[i - 1]
    suffix = 1
    for i in range(n - 1, -1, -1):
        out[i] *= suffix
        suffix *= nums[i]
    return out
''',
        oracle='''
def productExceptSelf(nums):
    out = []
    for i in range(len(nums)):
        product = 1
        for j, x in enumerate(nums):
            if j != i:
                product *= x
        out.append(product)
    return out
''',
    ),
    dict(
        slug="first-missing-positive", topics=["array-techniques"], entry="firstMissingPositive",
        params=[("nums", "int[]")], returns="int",
        summary=summary("找出数组中没有出现的最小正整数。要求 O(n) 时间、O(1) 额外空间。",
                        "Return the smallest positive integer missing from the array, in O(n) time and O(1) extra space."),
        constraints=[("1 ≤ n ≤ 10⁵，-2³¹ ≤ nums[i] ≤ 2³¹-1", "1 ≤ n ≤ 10⁵, -2³¹ ≤ nums[i] ≤ 2³¹-1")],
        hints=[("答案一定在 1..n+1 之间。为什么？", "The answer is always in 1..n+1. Why?"),
               ("能否把数组本身当作哈希表，让值 v 放到下标 v-1 上？", "Can the array itself act as a hash table, putting value v at index v-1?"),
               ("不断交换，直到 nums[i] 不在 1..n 或已经在正确位置；最后第一个 nums[i] ≠ i+1 的位置给出答案。", "Keep swapping until nums[i] is outside 1..n or already in place; the first i with nums[i] ≠ i+1 gives the answer.")],
        explanation=("原地哈希：把每个 1..n 范围内的值交换到它对应的下标，再扫描找到第一个不匹配的位置。每次交换都把一个值放到最终位置，时间 O(n)，额外空间 O(1)。",
                     "In-place hashing: swap each value in 1..n to its own index, then scan for the first mismatch. Every swap settles one value, O(n) time, O(1) extra space."),
        boundary=[[[1]], [[2]], [[-1]], [[1, 1]], [[3, 4, -1, 1]], [[1, 2, 3]]],
        inputs=[{"type": "int[]", "minLength": 1, "smallMaxLength": 10, "largeLength": 20000, "min": -5, "max": 20000, "smallMin": -2, "smallMax": 10}],
        reference='''
def firstMissingPositive(nums):
    n = len(nums)
    for i in range(n):
        while 1 <= nums[i] <= n and nums[nums[i] - 1] != nums[i]:
            j = nums[i] - 1
            nums[i], nums[j] = nums[j], nums[i]
    for i in range(n):
        if nums[i] != i + 1:
            return i + 1
    return n + 1
''',
        oracle='''
def firstMissingPositive(nums):
    x = 1
    while x in nums:
        x += 1
    return x
''',
    ),
    dict(
        slug="set-matrix-zeroes", topics=["matrix"], entry="setZeroes",
        params=[("matrix", "int[][]")], returns="int[][]", shape={"kind": "in-place", "param": 0},
        summary=summary("如果矩阵中某个元素为 0，就把它所在的整行和整列都置为 0。原地修改。",
                        "If an element is 0, set its whole row and column to 0, modifying the matrix in place."),
        constraints=[("1 ≤ m, n ≤ 200，-2³¹ ≤ matrix[i][j] ≤ 2³¹-1", "1 ≤ m, n ≤ 200, -2³¹ ≤ matrix[i][j] ≤ 2³¹-1")],
        hints=[("边扫描边置零会污染后面的判断。需要先记住什么？", "Zeroing while scanning corrupts later checks. What must you remember first?"),
               ("记录哪些行、哪些列需要清零，再统一处理。", "Record which rows and columns must be cleared, then clear them."),
               ("O(1) 空间：用第一行、第一列做标记，另用两个变量记录第一行、第一列自身是否含 0。", "O(1) space: use the first row and column as markers, plus two flags for whether they contain a 0 themselves.")],
        explanation=("先标记再清零：第一行、第一列充当标记数组，两个布尔变量记录它们本身是否需要清零。时间 O(mn)，额外空间 O(1)。",
                     "Mark, then clear: the first row and column hold the markers and two flags remember whether they must be cleared themselves. O(mn) time, O(1) extra space."),
        boundary=[[[[0]]], [[[1]]], [[[1, 0], [1, 1]]], [[[0, 1, 2], [3, 4, 5]]], [[[1], [0], [1]]]],
        inputs=[{"type": "int[][]", "minLength": 1, "maxLength": 200, "smallMaxLength": 5, "largeLength": 150, "row": {"minLength": 1, "maxLength": 200, "smallMaxLength": 5, "largeLength": 150}, "cell": {"min": 0, "max": 40}}],
        reference='''
def setZeroes(matrix):
    rows, cols = len(matrix), len(matrix[0])
    zero_rows = set()
    zero_cols = set()
    for i in range(rows):
        for j in range(cols):
            if matrix[i][j] == 0:
                zero_rows.add(i)
                zero_cols.add(j)
    for i in range(rows):
        for j in range(cols):
            if i in zero_rows or j in zero_cols:
                matrix[i][j] = 0
''',
        oracle='''
def setZeroes(matrix):
    original = [row[:] for row in matrix]
    for i, row in enumerate(original):
        for j, value in enumerate(row):
            if value == 0:
                for c in range(len(row)):
                    matrix[i][c] = 0
                for r in range(len(original)):
                    matrix[r][j] = 0
''',
    ),
    dict(
        slug="spiral-matrix", topics=["matrix"], entry="spiralOrder",
        params=[("matrix", "int[][]")], returns="int[]",
        summary=summary("按顺时针螺旋顺序（从左上角开始，向右、向下、向左、向上循环）返回矩阵中的所有元素。",
                        "Return all elements of the matrix in clockwise spiral order, starting at the top-left and turning right, down, left, up."),
        constraints=[("1 ≤ m, n ≤ 10，-100 ≤ matrix[i][j] ≤ 100", "1 ≤ m, n ≤ 10, -100 ≤ matrix[i][j] ≤ 100")],
        hints=[("把螺旋看成一层一层剥开的边框。", "Think of the spiral as peeling off one border layer at a time."),
               ("维护上、下、左、右四条边界，每走完一条边就收缩对应边界。", "Keep top, bottom, left, and right bounds; shrink the matching bound after each side."),
               ("只剩一行或一列时，注意不要重复访问。", "When a single row or column remains, avoid visiting it twice.")],
        explanation=("模拟四条边界：依次输出上边、右边、下边、左边并收缩边界，直到边界交错。时间 O(mn)，额外空间 O(1)。",
                     "Simulate four bounds: emit the top, right, bottom, and left sides and shrink the bounds until they cross. O(mn) time, O(1) extra space."),
        boundary=[[[[1]]], [[[1, 2, 3]]], [[[1], [2], [3]]], [[[1, 2], [3, 4]]], [[[1, 2, 3], [4, 5, 6]]]],
        inputs=[{"type": "int[][]", "minLength": 1, "maxLength": 10, "smallMaxLength": 5, "largeLength": 10, "row": {"minLength": 1, "maxLength": 10, "smallMaxLength": 5, "largeLength": 10}, "cell": {"min": -100, "max": 100}}],
        reference='''
def spiralOrder(matrix):
    top, bottom, left, right = 0, len(matrix) - 1, 0, len(matrix[0]) - 1
    out = []
    while top <= bottom and left <= right:
        for j in range(left, right + 1):
            out.append(matrix[top][j])
        for i in range(top + 1, bottom + 1):
            out.append(matrix[i][right])
        if top < bottom and left < right:
            for j in range(right - 1, left - 1, -1):
                out.append(matrix[bottom][j])
            for i in range(bottom - 1, top, -1):
                out.append(matrix[i][left])
        top, bottom, left, right = top + 1, bottom - 1, left + 1, right - 1
    return out
''',
        oracle='''
def spiralOrder(matrix):
    rows, cols = len(matrix), len(matrix[0])
    seen = [[False] * cols for _ in range(rows)]
    moves = [(0, 1), (1, 0), (0, -1), (-1, 0)]
    i = j = d = 0
    out = []
    for _ in range(rows * cols):
        out.append(matrix[i][j])
        seen[i][j] = True
        ni, nj = i + moves[d][0], j + moves[d][1]
        if not (0 <= ni < rows and 0 <= nj < cols and not seen[ni][nj]):
            d = (d + 1) % 4
            ni, nj = i + moves[d][0], j + moves[d][1]
        i, j = ni, nj
    return out
''',
    ),
    dict(
        slug="rotate-image", topics=["matrix"], entry="rotate",
        params=[("matrix", "int[][]")], returns="int[][]", shape={"kind": "in-place", "param": 0},
        summary=summary("把 n×n 矩阵原地顺时针旋转 90 度，不要另开一个矩阵。",
                        "Rotate an n×n matrix 90 degrees clockwise in place, without allocating another matrix."),
        constraints=[("1 ≤ n ≤ 20，-1000 ≤ matrix[i][j] ≤ 1000", "1 ≤ n ≤ 20, -1000 ≤ matrix[i][j] ≤ 1000")],
        hints=[("顺时针旋转后，元素 (i, j) 去了哪里？", "After a clockwise rotation, where does element (i, j) go?"),
               ("旋转 = 转置（沿主对角线翻转）+ 每行左右翻转。", "Rotation = transpose (flip across the main diagonal) + reverse each row."),
               ("也可以按层，每次把四个对应位置循环交换。", "Alternatively, rotate layer by layer, cycling four matching cells at a time.")],
        explanation=("先转置再翻转每一行，两步都是原地交换。时间 O(n²)，额外空间 O(1)。",
                     "Transpose, then reverse every row; both steps swap in place. O(n²) time, O(1) extra space."),
        boundary=[[[[1]]], [[[1, 2], [3, 4]]], [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]]],
        inputs=[{"type": "int[][]", "minLength": 1, "maxLength": 20, "smallMaxLength": 5, "largeLength": 20, "row": {"minLength": 1, "maxLength": 20}, "cell": {"min": -1000, "max": 1000}}],
        hooks='''
def adjust(args, rng, size):
    n = len(args[0])
    return [[[rng.randint(-1000, 1000) for _ in range(n)] for _ in range(n)]]
''',
        reference='''
def rotate(matrix):
    n = len(matrix)
    for i in range(n):
        for j in range(i + 1, n):
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
    for row in matrix:
        row.reverse()
''',
        oracle='''
def rotate(matrix):
    n = len(matrix)
    copy = [row[:] for row in matrix]
    for i in range(n):
        for j in range(n):
            matrix[j][n - 1 - i] = copy[i][j]
''',
    ),
    dict(
        slug="search-a-2d-matrix-ii", topics=["matrix"], entry="searchMatrix",
        params=[("matrix", "int[][]"), ("target", "int")], returns="bool",
        summary=summary("矩阵每行从左到右递增、每列从上到下递增，判断 target 是否在矩阵中。",
                        "Each row increases left to right and each column increases top to bottom; report whether target is in the matrix."),
        constraints=[("1 ≤ m, n ≤ 300，-10⁹ ≤ 元素, target ≤ 10⁹", "1 ≤ m, n ≤ 300, -10⁹ ≤ values, target ≤ 10⁹")],
        hints=[("从哪个角出发，比较一次就能排除一整行或一整列？", "From which corner does one comparison eliminate a whole row or column?"),
               ("从右上角开始：当前值比 target 大就左移（这一列都更大），比 target 小就下移。", "Start at the top-right: if the value is larger than target move left (the column is larger), if smaller move down."),
               ("每一步排除一行或一列，最多走 m + n 步。", "Each step eliminates a row or a column, so at most m + n steps.")],
        explanation=("从右上角出发的阶梯搜索：比较结果决定排除当前列还是当前行。时间 O(m + n)，空间 O(1)。",
                     "Staircase search from the top-right corner: each comparison discards the current column or row. O(m + n) time, O(1) space."),
        boundary=[[[[1]], 1], [[[1]], 0], [[[1, 4], [2, 5]], 3], [[[-5]], -5]],
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
            out[i][j] = base + rng.randint(1, 3)
    flat = [x for row in out for x in row]
    target = rng.choice(flat) if rng.random() < 0.5 else rng.randint(-12, flat[-1] + 2)
    return [out, target]
''',
        reference='''
def searchMatrix(matrix, target):
    i, j = 0, len(matrix[0]) - 1
    while i < len(matrix) and j >= 0:
        if matrix[i][j] == target:
            return True
        if matrix[i][j] > target:
            j -= 1
        else:
            i += 1
    return False
''',
        oracle='''
def searchMatrix(matrix, target):
    return any(target in row for row in matrix)
''',
    ),
]
