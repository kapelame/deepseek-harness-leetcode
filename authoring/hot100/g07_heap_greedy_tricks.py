"""Hot 100 groups 堆 / 贪心算法 / 技巧."""

ORIGINAL = ("（本课程原创简述，完整题面见 LeetCode 官方页面。）", " (Original summary written for Learn; see LeetCode for the official statement.)")


def summary(zh, en):
    return (zh + ORIGINAL[0], en + ORIGINAL[1])


PROBLEMS = [
    dict(
        slug="kth-largest-element-in-an-array", topics=["heap"], entry="findKthLargest",
        params=[("nums", "int[]"), ("k", "int")], returns="int",
        summary=summary("返回数组中第 k 大的元素（按排序后的位置，不是第 k 个不同的值）。尝试不完全排序。", "Return the k-th largest element by sorted position, not the k-th distinct value. Try not to sort everything."),
        constraints=[("1 ≤ k ≤ n ≤ 10⁵，-10⁴ ≤ nums[i] ≤ 10⁴", "1 ≤ k ≤ n ≤ 10⁵, -10⁴ ≤ nums[i] ≤ 10⁴")],
        hints=[("排序后取下标 n-k 是 O(n log n)。只需要前 k 大的话，要保存多少个数？", "Sorting and reading index n-k costs O(n log n). If only the top k matter, how many numbers must you keep?"),
               ("维护一个大小为 k 的最小堆：堆顶是当前前 k 大中最小的那个。", "Keep a min-heap of size k: its top is the smallest of the current top k."),
               ("新数比堆顶大就替换堆顶；最后堆顶就是答案。也可以用快速选择，平均 O(n)。", "Replace the top when a new number is larger; the final top is the answer. Quickselect averages O(n) as well.")],
        explanation=("大小为 k 的最小堆，时间 O(n log k)，空间 O(k)；快速选择平均 O(n)。", "A size-k min-heap runs in O(n log k) time and O(k) space; quickselect averages O(n)."),
        boundary=[[[1], 1], [[2, 1], 1], [[2, 1], 2], [[3, 3, 3], 2], [[-10000, 10000], 2]],
        inputs=[{"type": "int[]", "minLength": 1, "smallMaxLength": 9, "largeLength": 20000, "min": -10000, "max": 10000, "smallMin": -5, "smallMax": 5}, {"type": "int", "min": 1, "max": 1}],
        hooks='''
def adjust(args, rng, size):
    nums, _ = args
    return [nums, rng.randint(1, len(nums))]
''',
        reference='''
import heapq
def findKthLargest(nums, k):
    heap = nums[:k]
    heapq.heapify(heap)
    for x in nums[k:]:
        if x > heap[0]:
            heapq.heapreplace(heap, x)
    return heap[0]
''',
        oracle='''
def findKthLargest(nums, k):
    values = list(nums)
    for _ in range(k - 1):
        values.remove(max(values))
    return max(values)
''',
    ),
    dict(
        slug="top-k-frequent-elements", topics=["heap"], entry="topKFrequent",
        params=[("nums", "int[]"), ("k", "int")], returns="int[]", comparator={"kind": "unordered"},
        summary=summary("返回出现频率最高的 k 个元素，顺序不限。保证答案唯一（第 k 名与第 k+1 名频率不同）。", "Return the k most frequent elements in any order. The answer is guaranteed unique, so ranks k and k+1 differ in frequency."),
        constraints=[("1 ≤ n ≤ 10⁵，-10⁴ ≤ nums[i] ≤ 10⁴，k 不超过不同元素个数", "1 ≤ n ≤ 10⁵, -10⁴ ≤ nums[i] ≤ 10⁴, k is at most the number of distinct values")],
        hints=[("先用哈希表统计每个数出现的次数。", "Count each value's occurrences with a hash map first."),
               ("在 (频率, 值) 上维护大小为 k 的最小堆，得到频率前 k 的值。", "Keep a size-k min-heap over (frequency, value) to retain the top k."),
               ("线性做法：桶排序，bucket[f] 存放出现 f 次的值，从高频桶向低频收集。", "Linear alternative: bucket[f] holds values occurring f times; collect from the highest bucket down.")],
        explanation=("计数 + 大小为 k 的堆，时间 O(n log k)；桶排序可做到 O(n)。", "Counting plus a size-k heap runs in O(n log k); bucket sort reaches O(n)."),
        boundary=[[[1], 1], [[1, 1, 2], 1], [[1, 2], 2], [[4, 4, 4, 5, 5, 6], 2]],
        inputs=[{"type": "int[]", "minLength": 1, "smallMaxLength": 10, "largeLength": 20000, "min": -10000, "max": 10000, "smallMin": 0, "smallMax": 4}, {"type": "int", "min": 1, "max": 1}],
        hooks='''
from collections import Counter
def adjust(args, rng, size):
    nums, _ = args
    if size == "large":
        nums = [rng.randint(-300, 300) for _ in nums]
    counts = sorted(Counter(nums).values(), reverse=True)
    options = [k for k in range(1, len(counts) + 1) if k == len(counts) or counts[k - 1] != counts[k]]
    return [nums, rng.choice(options)]
''',
        reference='''
import heapq
from collections import Counter
def topKFrequent(nums, k):
    return [value for value, _ in heapq.nlargest(k, Counter(nums).items(), key=lambda item: item[1])]
''',
        oracle='''
def topKFrequent(nums, k):
    counts = {}
    for x in nums:
        counts[x] = counts.get(x, 0) + 1
    ordered = sorted(counts, key=lambda x: -counts[x])
    return ordered[:k]
''',
    ),
    dict(
        slug="best-time-to-buy-and-sell-stock", topics=["greedy"], entry="maxProfit",
        params=[("prices", "int[]")], returns="int",
        summary=summary("给定每天的股价，只能买入一次、之后某天卖出一次，求最大利润；无法获利则返回 0。", "Given daily prices, buy once and sell once on a later day; return the maximum profit, or 0 if no profit is possible."),
        constraints=[("1 ≤ n ≤ 10⁵，0 ≤ prices[i] ≤ 10⁴", "1 ≤ n ≤ 10⁵, 0 ≤ prices[i] ≤ 10⁴")],
        hints=[("如果确定在第 i 天卖出，应该在哪天买入？", "If you sell on day i, on which day should you have bought?"),
               ("在第 i 天之前价格最低的那天。", "On the cheapest day before day i."),
               ("从左到右维护历史最低价，用 prices[i] - 最低价 更新最大利润。", "Scan left to right keeping the lowest price so far and update the best profit with prices[i] - lowest.")],
        explanation=("一次遍历维护最低买入价与最大差值。时间 O(n)，空间 O(1)。", "One pass tracks the lowest buying price and the best difference. O(n) time, O(1) space."),
        boundary=[[[5]], [[1, 2]], [[2, 1]], [[3, 3, 3]], [[0, 10000]]],
        inputs=[{"type": "int[]", "minLength": 1, "smallMaxLength": 9, "largeLength": 20000, "min": 0, "max": 10000, "smallMin": 0, "smallMax": 9}],
        reference='''
def maxProfit(prices):
    lowest, best = prices[0], 0
    for p in prices[1:]:
        best = max(best, p - lowest)
        lowest = min(lowest, p)
    return best
''',
        oracle='''
def maxProfit(prices):
    return max([0] + [prices[j] - prices[i] for i in range(len(prices)) for j in range(i + 1, len(prices))])
''',
    ),
    dict(
        slug="jump-game", topics=["greedy"], entry="canJump",
        params=[("nums", "int[]")], returns="bool",
        summary=summary("从下标 0 出发，nums[i] 表示在位置 i 最多能向前跳几步。判断能否到达最后一个下标。", "Starting at index 0, nums[i] is the farthest jump from position i; decide whether the last index is reachable."),
        constraints=[("1 ≤ n ≤ 10⁴，0 ≤ nums[i] ≤ 10⁵", "1 ≤ n ≤ 10⁴, 0 ≤ nums[i] ≤ 10⁵")],
        hints=[("与其记录每一种跳法，不如记录“目前能到达的最远位置”。", "Instead of tracking every jump sequence, track the farthest reachable position."),
               ("遍历 i 时，如果 i 超过了最远可达位置，说明 i 永远到不了。", "If i ever exceeds the farthest reachable position, i can never be reached."),
               ("否则用 i + nums[i] 更新最远位置；最远位置 ≥ n-1 即可返回 true。", "Otherwise update the farthest with i + nums[i]; return true once it reaches n-1.")],
        explanation=("贪心维护最远可达下标，一次扫描。时间 O(n)，空间 O(1)。", "Greedily maintain the farthest reachable index in one scan. O(n) time, O(1) space."),
        boundary=[[[0]], [[1, 0]], [[0, 1]], [[2, 0, 0]], [[1, 0, 1]]],
        inputs=[{"type": "int[]", "minLength": 1, "smallMaxLength": 8, "largeLength": 10000, "min": 0, "max": 4, "smallMin": 0, "smallMax": 3}],
        reference='''
def canJump(nums):
    reach = 0
    for i, step in enumerate(nums):
        if i > reach:
            return False
        reach = max(reach, i + step)
    return True
''',
        oracle='''
def canJump(nums):
    ok = [False] * len(nums)
    ok[-1] = True
    for i in range(len(nums) - 2, -1, -1):
        ok[i] = any(ok[j] for j in range(i + 1, min(len(nums), i + nums[i] + 1)))
    return ok[0]
''',
    ),
    dict(
        slug="jump-game-ii", topics=["greedy"], entry="jump",
        params=[("nums", "int[]")], returns="int",
        summary=summary("规则同“跳跃游戏”，保证一定能到达最后一个下标，求最少跳跃次数。", "Same rules as Jump Game, with the last index guaranteed reachable; return the fewest jumps."),
        constraints=[("1 ≤ n ≤ 10⁴，0 ≤ nums[i] ≤ 1000，保证可以到达终点", "1 ≤ n ≤ 10⁴, 0 ≤ nums[i] ≤ 1000, the end is reachable")],
        hints=[("把“跳 k 次能到达的位置”看成一层，这是一种 BFS。", "Treat the positions reachable in k jumps as one level, a BFS."),
               ("第 k 层是一个连续区间；下一层的右端是这一层所有位置能跳到的最远处。", "Level k is a contiguous range; the next level ends at the farthest point reachable from it."),
               ("遍历时维护当前层的右端 end 和下一层的最远 far；走到 end 时跳数加一，end = far。", "While scanning keep the current level's end and the next level's far; on reaching end, add a jump and set end = far.")],
        explanation=("按层的贪心（隐式 BFS），一次扫描。时间 O(n)，空间 O(1)。", "Level-by-level greed, an implicit BFS, in one scan. O(n) time, O(1) space."),
        boundary=[[[0]], [[1, 0]], [[2, 1]], [[1, 1, 1]], [[3, 0, 0, 0]]],
        inputs=[{"type": "int[]", "minLength": 1, "smallMaxLength": 8, "largeLength": 10000, "min": 1, "max": 3, "smallMin": 0, "smallMax": 3}],
        hooks='''
def valid(args):
    nums = args[0]
    reach = 0
    for i, step in enumerate(nums):
        if i > reach:
            return False
        reach = max(reach, i + step)
    return True
''',
        reference='''
def jump(nums):
    jumps = end = far = 0
    for i in range(len(nums) - 1):
        far = max(far, i + nums[i])
        if i == end:
            jumps += 1
            end = far
    return jumps
''',
        oracle='''
def jump(nums):
    n = len(nums)
    best = [0] + [None] * (n - 1)
    for i in range(n):
        if best[i] is None:
            continue
        for j in range(i + 1, min(n, i + nums[i] + 1)):
            if best[j] is None or best[j] > best[i] + 1:
                best[j] = best[i] + 1
    return best[-1]
''',
    ),
    dict(
        slug="partition-labels", topics=["greedy"], entry="partitionLabels",
        params=[("s", "string")], returns="int[]",
        summary=summary("把字符串划分成尽可能多的片段，使每个字母只出现在其中一个片段里。按顺序返回各片段的长度。", "Split the string into as many parts as possible so that each letter appears in only one part; return the part lengths in order."),
        constraints=[("1 ≤ |s| ≤ 500，只含小写字母", "1 ≤ |s| ≤ 500, lowercase letters")],
        hints=[("一个片段包含字母 c，就必须延伸到 c 最后一次出现的位置。", "A part containing letter c must extend to c's last occurrence."),
               ("先记录每个字母最后出现的下标。", "Record each letter's last index first."),
               ("扫描时维护当前片段必须到达的最远位置 end；当 i == end 时可以切一刀。", "While scanning keep end, how far the current part must reach; cut when i == end.")],
        explanation=("贪心：片段在“已见字母的最后出现位置的最大值”处结束。时间 O(n)，空间 O(1)。", "Greedy: a part ends at the maximum last occurrence of the letters seen so far. O(n) time, O(1) space."),
        boundary=[["a"], ["ab"], ["aa"], ["abca"], ["eccbbbbdec"]],
        inputs=[{"type": "string", "minLength": 1, "maxLength": 500, "smallMaxLength": 10, "largeLength": 500, "alphabet": "abcdefghijklmnopqrstuvwxyz", "smallAlphabet": "abcd"}],
        reference='''
def partitionLabels(s):
    last = {ch: i for i, ch in enumerate(s)}
    out, start, end = [], 0, 0
    for i, ch in enumerate(s):
        end = max(end, last[ch])
        if i == end:
            out.append(end - start + 1)
            start = i + 1
    return out
''',
        oracle='''
def partitionLabels(s):
    out, start = [], 0
    while start < len(s):
        end = start
        while any(ch in s[end + 1:] for ch in set(s[start:end + 1])):
            end += 1
        out.append(end - start + 1)
        start = end + 1
    return out
''',
    ),
    dict(
        slug="single-number", topics=["tricks"], entry="singleNumber",
        params=[("nums", "int[]")], returns="int",
        summary=summary("数组中除了一个元素只出现一次外，其余元素都恰好出现两次。找出那个只出现一次的元素，要求 O(n) 时间、O(1) 额外空间。", "Every element appears twice except one that appears once; find it in O(n) time and O(1) extra space."),
        constraints=[("1 ≤ n ≤ 3×10⁴，-3×10⁴ ≤ nums[i] ≤ 3×10⁴", "1 ≤ n ≤ 3×10⁴, -3×10⁴ ≤ nums[i] ≤ 3×10⁴")],
        hints=[("哈希表计数可以做，但需要 O(n) 空间。", "Counting with a hash map works but takes O(n) space."),
               ("有没有一种运算，满足 a ⊕ a = 0 且 a ⊕ 0 = a？", "Is there an operation with a ⊕ a = 0 and a ⊕ 0 = a?"),
               ("异或满足交换律和结合律：把所有数异或起来，成对的数互相抵消。", "XOR is commutative and associative: XOR everything and the pairs cancel.")],
        explanation=("所有元素异或，成对元素抵消，剩下的就是答案。时间 O(n)，空间 O(1)。", "XOR all elements; pairs cancel and the single value remains. O(n) time, O(1) space."),
        boundary=[[[1]], [[2, 2, 1]], [[-1, 5, -1]], [[0, 7, 7]]],
        inputs=[{"type": "int[]", "minLength": 1, "smallMaxLength": 4, "largeLength": 10000, "min": -30000, "max": 30000, "smallMin": -5, "smallMax": 5, "distinct": True}],
        hooks='''
def adjust(args, rng, size):
    values = args[0]
    single, pairs = values[0], values[1:]
    nums = pairs + pairs + [single]
    rng.shuffle(nums)
    return [nums]
''',
        reference='''
def singleNumber(nums):
    result = 0
    for x in nums:
        result ^= x
    return result
''',
        oracle='''
def singleNumber(nums):
    for x in nums:
        if nums.count(x) == 1:
            return x
''',
    ),
    dict(
        slug="majority-element", topics=["tricks"], entry="majorityElement",
        params=[("nums", "int[]")], returns="int",
        summary=summary("返回数组中出现次数超过 ⌊n/2⌋ 的元素（保证存在）。进阶：O(n) 时间、O(1) 空间。", "Return the element that appears more than ⌊n/2⌋ times; it always exists. Follow-up: O(n) time, O(1) space."),
        constraints=[("1 ≤ n ≤ 5×10⁴，-10⁹ ≤ nums[i] ≤ 10⁹", "1 ≤ n ≤ 5×10⁴, -10⁹ ≤ nums[i] ≤ 10⁹")],
        hints=[("排序后中间的元素一定是众数，但这需要 O(n log n)。", "After sorting, the middle element is the majority, but that costs O(n log n)."),
               ("想象让不同的数两两“抵消”：众数比其他所有数加起来还多，抵消后一定剩下它。", "Imagine cancelling pairs of different values: the majority outnumbers all others combined, so it survives."),
               ("Boyer–Moore 投票：维护候选和计数，计数为 0 时换候选，相同加一、不同减一。", "Boyer–Moore voting: keep a candidate and a count; switch candidates at count 0, add one for a match, subtract one otherwise.")],
        explanation=("摩尔投票，一次遍历，时间 O(n)，空间 O(1)。", "Boyer–Moore voting in one pass, O(n) time, O(1) space."),
        boundary=[[[1]], [[2, 2, 1]], [[3, 3, 4]], [[-5, -5, -5, 1, 1]]],
        inputs=[{"type": "int[]", "minLength": 1, "smallMaxLength": 9, "largeLength": 20000, "min": -1000000000, "max": 1000000000, "smallMin": -3, "smallMax": 3}],
        hooks='''
def adjust(args, rng, size):
    nums = args[0]
    winner = rng.choice(nums)
    count = len(nums) // 2 + 1
    nums = [winner] * count + nums[:len(nums) - count]
    rng.shuffle(nums)
    return [nums]
''',
        reference='''
def majorityElement(nums):
    candidate, count = None, 0
    for x in nums:
        if count == 0:
            candidate = x
        count += 1 if x == candidate else -1
    return candidate
''',
        oracle='''
def majorityElement(nums):
    for x in nums:
        if nums.count(x) * 2 > len(nums):
            return x
''',
    ),
    dict(
        slug="sort-colors", topics=["tricks"], entry="sortColors",
        params=[("nums", "int[]")], returns="int[]", shape={"kind": "in-place", "param": 0},
        summary=summary("数组只含 0、1、2（代表三种颜色），原地把它排成 0…0 1…1 2…2，不能使用库函数排序。尝试一次遍历。", "The array holds only 0, 1, and 2 (three colors); sort it in place into 0…0 1…1 2…2 without a library sort. Try one pass."),
        constraints=[("1 ≤ n ≤ 300，nums[i] ∈ {0, 1, 2}", "1 ≤ n ≤ 300, nums[i] ∈ {0, 1, 2}")],
        hints=[("两遍扫描：先数出 0、1、2 的个数，再依次写回。能一遍完成吗？", "Two passes: count the 0s, 1s, and 2s, then write them back. Can one pass do it?"),
               ("荷兰国旗问题：维护三个区域 [0, low) 全是 0，(high, n-1] 全是 2，中间是待处理或 1。", "Dutch national flag: keep [0, low) all 0, (high, n-1] all 2, and the middle unprocessed or 1."),
               ("指针 i 从左向右：遇 0 与 low 交换并都前进；遇 2 与 high 交换、high 后退（i 不动）；遇 1 只前进。", "Move i rightward: on 0 swap with low and advance both; on 2 swap with high and retreat high, keeping i; on 1 just advance.")],
        explanation=("三指针划分（荷兰国旗），一次遍历原地完成。时间 O(n)，空间 O(1)。", "Three-pointer partitioning, the Dutch national flag, in one in-place pass. O(n) time, O(1) space."),
        boundary=[[[0]], [[2, 0]], [[1, 1]], [[2, 1, 0]], [[2, 2, 0, 0, 1]]],
        inputs=[{"type": "int[]", "minLength": 1, "maxLength": 300, "smallMaxLength": 9, "largeLength": 300, "min": 0, "max": 2}],
        reference='''
def sortColors(nums):
    low, i, high = 0, 0, len(nums) - 1
    while i <= high:
        if nums[i] == 0:
            nums[low], nums[i] = nums[i], nums[low]
            low += 1
            i += 1
        elif nums[i] == 2:
            nums[high], nums[i] = nums[i], nums[high]
            high -= 1
        else:
            i += 1
''',
        oracle='''
def sortColors(nums):
    counts = [nums.count(c) for c in (0, 1, 2)]
    nums[:] = [0] * counts[0] + [1] * counts[1] + [2] * counts[2]
''',
    ),
    dict(
        slug="next-permutation", topics=["tricks"], entry="nextPermutation",
        params=[("nums", "int[]")], returns="int[]", shape={"kind": "in-place", "param": 0},
        summary=summary("原地把数组改成字典序中的下一个排列；如果已经是最大排列，就改成最小排列（升序）。只能用 O(1) 额外空间。", "Rearrange the array in place into the next permutation in lexicographic order; if it is the largest, wrap around to the smallest (ascending). Use O(1) extra space."),
        constraints=[("1 ≤ n ≤ 100，0 ≤ nums[i] ≤ 100", "1 ≤ n ≤ 100, 0 ≤ nums[i] ≤ 100")],
        hints=[("从右往左看，最长的非递增后缀已经是它能达到的最大排列。", "From the right, the longest non-increasing suffix is already at its largest arrangement."),
               ("找到后缀前的那个位置 i（nums[i] < nums[i+1]），在后缀里找最右边一个比 nums[i] 大的数 j，交换二者。", "Take the position i just before that suffix (nums[i] < nums[i+1]), find the rightmost j in the suffix with nums[j] > nums[i], and swap them."),
               ("交换后后缀仍是非递增的，把它反转成升序即可；若不存在 i，直接整体反转。", "The suffix stays non-increasing after the swap, so reverse it to ascending; if no i exists, reverse the whole array.")],
        explanation=("找到最右的上升点，与后缀中最小的更大值交换，再反转后缀。时间 O(n)，空间 O(1)。", "Find the rightmost ascent, swap it with the smallest larger value in the suffix, and reverse the suffix. O(n) time, O(1) space."),
        boundary=[[[1]], [[1, 2]], [[2, 1]], [[1, 1, 5]], [[3, 2, 1]], [[1, 5, 1]]],
        inputs=[{"type": "int[]", "minLength": 1, "maxLength": 100, "smallMaxLength": 6, "largeLength": 100, "min": 0, "max": 100, "smallMin": 0, "smallMax": 3}],
        reference='''
def nextPermutation(nums):
    i = len(nums) - 2
    while i >= 0 and nums[i] >= nums[i + 1]:
        i -= 1
    if i >= 0:
        j = len(nums) - 1
        while nums[j] <= nums[i]:
            j -= 1
        nums[i], nums[j] = nums[j], nums[i]
    nums[i + 1:] = reversed(nums[i + 1:])
''',
        oracle='''
import itertools
def nextPermutation(nums):
    if len(nums) > 7:
        raise ValueError("oracle only handles small inputs")
    ordered = sorted(set(itertools.permutations(nums)))
    current = tuple(nums)
    index = ordered.index(current)
    nums[:] = list(ordered[(index + 1) % len(ordered)])
''',
    ),
    dict(
        slug="find-the-duplicate-number", topics=["tricks"], entry="findDuplicate",
        params=[("nums", "int[]")], returns="int",
        summary=summary("数组有 n+1 个整数，都在 [1, n] 范围内，恰好有一个数重复出现（可能出现多次）。不修改数组、只用 O(1) 额外空间，找出这个重复的数。",
                        "The array has n+1 integers in [1, n] and exactly one value repeats, possibly several times. Find it without modifying the array, using O(1) extra space."),
        constraints=[("1 ≤ n ≤ 10⁵，nums.length = n + 1，1 ≤ nums[i] ≤ n", "1 ≤ n ≤ 10⁵, nums.length = n + 1, 1 ≤ nums[i] ≤ n")],
        hints=[("把下标 i 看成链表节点，nums[i] 看成 next 指针，会得到什么结构？", "Treat index i as a list node and nums[i] as its next pointer. What structure appears?"),
               ("从 0 出发沿 next 走，一定会进入环；重复的数就是环的入口（有两个节点指向它）。", "Walking from 0 along next must enter a cycle; the duplicate is the cycle entry, since two nodes point to it."),
               ("用 Floyd 判圈找到相遇点，再从起点与相遇点同速前进，相遇处即答案。", "Use Floyd's algorithm to find the meeting point, then walk from the start and from the meeting point at equal speed; they meet at the answer.")],
        explanation=("把数组看成函数 f(i) = nums[i] 构成的链表，重复值是环入口，Floyd 判圈 O(n) 时间、O(1) 空间。也可以对值域二分计数。", "View the array as the list f(i) = nums[i]; the duplicate is the cycle entry, found by Floyd's algorithm in O(n) time and O(1) space. Binary search over the value range also works."),
        boundary=[[[1, 1]], [[1, 3, 4, 2, 2]], [[3, 1, 3, 4, 2]], [[2, 2, 2, 2]]],
        inputs=[{"type": "int[]", "minLength": 1}],
        hooks='''
def adjust(args, rng, size):
    n = rng.randint(1, 7) if size == "small" else 20000
    nums = list(range(1, n + 1))
    duplicate = rng.randint(1, n)
    extra = rng.randint(1, max(1, n // 3))
    positions = rng.sample(range(n), min(extra, n))
    nums.append(duplicate)
    for p in positions:
        if nums[p] != duplicate:
            nums[p] = duplicate
    rng.shuffle(nums)
    return [nums]
''',
        reference='''
def findDuplicate(nums):
    slow = fast = 0
    while True:
        slow = nums[slow]
        fast = nums[nums[fast]]
        if slow == fast:
            break
    slow = 0
    while slow != fast:
        slow = nums[slow]
        fast = nums[fast]
    return slow
''',
        oracle='''
def findDuplicate(nums):
    for i, x in enumerate(nums):
        if x in nums[i + 1:]:
            return x
''',
    ),
]
