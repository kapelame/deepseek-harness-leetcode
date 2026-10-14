"""Hot 100 groups 哈希 / 双指针 / 滑动窗口 / 子串 (problems not shipped before)."""

PROBLEMS = [
    dict(
        slug="longest-consecutive-sequence", topics=["hashing"], entry="longestConsecutive",
        params=[("nums", "int[]")], returns="int",
        summary=("给定一个未排序的整数数组，求数值上连续的最长整数序列的长度（元素在原数组中的位置不要求相邻）。要求 O(n) 时间。（本课程原创简述，完整题面见 LeetCode 官方页面。）",
                 "Given an unsorted integer array, return the length of the longest run of consecutive integer values; positions in the array do not matter. Aim for O(n) time. (Original summary written for Learn; see LeetCode for the official statement.)"),
        constraints=[("0 ≤ n ≤ 10⁵，-10⁹ ≤ nums[i] ≤ 10⁹", "0 ≤ n ≤ 10⁵, -10⁹ ≤ nums[i] ≤ 10⁹")],
        hints=[("排序能做，但要 O(n log n)。不排序时，怎样快速知道 x+1 是否存在？", "Sorting works but costs O(n log n). Without sorting, how can you tell quickly whether x+1 exists?"),
               ("把所有数放进集合。只有 x-1 不在集合中时，x 才是一段连续序列的起点。", "Put every number in a set. x starts a run only when x-1 is not in the set."),
               ("对每个起点向上数 x+1, x+2, … 直到断开；每个数只会被数一次，总共 O(n)。", "From each start, count x+1, x+2, … until the run breaks; every number is counted once, O(n) overall.")],
        explanation=("用哈希集合判断存在性，只从序列起点（x-1 不存在）开始向上扩展，每个元素至多访问两次，时间 O(n)，空间 O(n)。",
                     "A hash set answers membership; extending only from run starts (x-1 absent) visits each element at most twice, O(n) time and space."),
        boundary=[[[]], [[7]], [[1, 1, 1]], [[-1000000000, 1000000000]], [[5, 4, 3, 2, 1]]],
        inputs=[{"type": "int[]", "minLength": 0, "smallMaxLength": 12, "largeLength": 20000, "min": -1000000000, "max": 1000000000, "smallMin": -3, "smallMax": 12}],
        reference='''
def longestConsecutive(nums):
    values = set(nums)
    best = 0
    for x in values:
        if x - 1 not in values:
            y = x
            while y + 1 in values:
                y += 1
            best = max(best, y - x + 1)
    return best
''',
        oracle='''
def longestConsecutive(nums):
    best = 0
    for x in nums:
        length = 1
        while x + length in nums:
            length += 1
        best = max(best, length)
    return best
''',
    ),
    dict(
        slug="move-zeroes", topics=["two-pointers"], entry="moveZeroes",
        params=[("nums", "int[]")], returns="int[]", shape={"kind": "in-place", "param": 0},
        summary=("原地把数组中所有的 0 移到末尾，同时保持非零元素的相对顺序。不要返回新数组。（本课程原创简述，完整题面见 LeetCode 官方页面。）",
                 "Move every 0 to the end of the array in place while keeping the non-zero elements in their original order. Do not return a new array. (Original summary written for Learn; see LeetCode for the official statement.)"),
        constraints=[("1 ≤ n ≤ 10⁴，-2³¹ ≤ nums[i] ≤ 2³¹-1", "1 ≤ n ≤ 10⁴, -2³¹ ≤ nums[i] ≤ 2³¹-1")],
        hints=[("能否用一个指针记录“下一个非零元素该放的位置”？", "Can one pointer remember where the next non-zero element should go?"),
               ("从左到右扫描，遇到非零元素就放到写指针处，写指针后移。", "Scan left to right; each non-zero element goes to the write position, which then advances."),
               ("扫描结束后，把写指针之后的位置全部填 0；或者在扫描时直接交换。", "After the scan, fill everything after the write position with 0, or swap during the scan.")],
        explanation=("读写双指针：读指针遍历数组，写指针指向下一个非零元素的位置；交换保证顺序不变。时间 O(n)，额外空间 O(1)。",
                     "Read and write pointers: the reader scans, the writer marks where the next non-zero belongs; swapping keeps the order. O(n) time, O(1) extra space."),
        boundary=[[[0]], [[1]], [[0, 0, 1]], [[1, 2, 3]], [[0, -1, 0, -2]]],
        inputs=[{"type": "int[]", "minLength": 1, "smallMaxLength": 10, "largeLength": 10000, "min": -5, "max": 5, "smallMin": -2, "smallMax": 3}],
        reference='''
def moveZeroes(nums):
    write = 0
    for read in range(len(nums)):
        if nums[read] != 0:
            nums[write], nums[read] = nums[read], nums[write]
            write += 1
''',
        oracle='''
def moveZeroes(nums):
    kept = [x for x in nums if x != 0]
    nums[:] = kept + [0] * (len(nums) - len(kept))
''',
    ),
    dict(
        slug="container-with-most-water", topics=["two-pointers"], entry="maxArea",
        params=[("height", "int[]")], returns="int",
        summary=("给定每个位置竖线的高度，选两条线与 x 轴围成容器，求能装的最多的水（面积 = 两线距离 × 较矮线的高度）。（本课程原创简述，完整题面见 LeetCode 官方页面。）",
                 "Given the heights of vertical lines, pick two lines that form a container with the x-axis and return the largest area (distance × the shorter height). (Original summary written for Learn; see LeetCode for the official statement.)"),
        constraints=[("2 ≤ n ≤ 10⁵，0 ≤ height[i] ≤ 10⁴", "2 ≤ n ≤ 10⁵, 0 ≤ height[i] ≤ 10⁴")],
        hints=[("从最宽的容器（两端）开始。接下来移动哪一端才可能更好？", "Start with the widest container, both ends. Moving which end could possibly help?"),
               ("面积受较矮的那条线限制；移动较高的那条只会让宽度变小、高度不变或更小。", "The shorter line limits the area; moving the taller one shrinks the width without raising the limit."),
               ("每一步移动较矮的一端，并更新最大面积，直到两指针相遇。", "Each step, move the shorter end inward and update the best area until the pointers meet.")],
        explanation=("左右双指针从两端向内收缩，每次移动较矮的一侧，因为保留它不可能得到更大的面积。时间 O(n)，空间 O(1)。",
                     "Two pointers move inward from both ends, always moving the shorter side, since keeping it can never produce a larger area. O(n) time, O(1) space."),
        boundary=[[[1, 1]], [[0, 0]], [[10000, 1, 10000]], [[1, 2, 3, 4, 5]], [[5, 4, 3, 2, 1]]],
        inputs=[{"type": "int[]", "minLength": 2, "smallMaxLength": 10, "largeLength": 20000, "min": 0, "max": 10000, "smallMin": 0, "smallMax": 9}],
        reference='''
def maxArea(height):
    left, right = 0, len(height) - 1
    best = 0
    while left < right:
        best = max(best, (right - left) * min(height[left], height[right]))
        if height[left] < height[right]:
            left += 1
        else:
            right -= 1
    return best
''',
        oracle='''
def maxArea(height):
    return max((j - i) * min(height[i], height[j]) for i in range(len(height)) for j in range(i + 1, len(height)))
''',
    ),
    dict(
        slug="trapping-rain-water", topics=["two-pointers"], entry="trap",
        params=[("height", "int[]")], returns="int",
        summary=("给定宽度为 1 的柱子高度，计算下雨后柱子之间能接住多少单位的雨水。（本课程原创简述，完整题面见 LeetCode 官方页面。）",
                 "Given the heights of bars of width 1, compute how many units of rain water are trapped between them. (Original summary written for Learn; see LeetCode for the official statement.)"),
        constraints=[("1 ≤ n ≤ 2×10⁴，0 ≤ height[i] ≤ 10⁵", "1 ≤ n ≤ 2×10⁴, 0 ≤ height[i] ≤ 10⁵")],
        hints=[("位置 i 上方的水有多高？它由左右两侧的什么决定？", "How high does water stand above position i? What on its left and right decides that?"),
               ("水位 = min(左侧最高, 右侧最高)，水量 = 水位 - height[i]。可以预先算出前缀最大和后缀最大。", "Level = min(highest on the left, highest on the right); water = level - height[i]. Precompute prefix and suffix maxima."),
               ("双指针优化：维护 leftMax 和 rightMax，较小的一侧可以直接结算，空间降到 O(1)。", "Two-pointer version: keep leftMax and rightMax; the smaller side can be settled immediately, giving O(1) space.")],
        explanation=("每个位置的水位由两侧最高柱子中较矮者决定。双指针从两端向内，较低一侧的最大值已经确定水位，逐格结算。时间 O(n)，空间 O(1)。",
                     "Each position's level is the lower of the tallest bars on its two sides. Moving two pointers inward, the lower side's maximum already fixes the level, so it is settled cell by cell. O(n) time, O(1) space."),
        boundary=[[[0]], [[5]], [[2, 0, 2]], [[1, 2, 3, 4]], [[4, 3, 2, 1]], [[3, 0, 0, 0, 3]]],
        inputs=[{"type": "int[]", "minLength": 1, "smallMaxLength": 10, "largeLength": 20000, "min": 0, "max": 100000, "smallMin": 0, "smallMax": 6}],
        reference='''
def trap(height):
    left, right = 0, len(height) - 1
    left_max = right_max = 0
    water = 0
    while left < right:
        if height[left] < height[right]:
            left_max = max(left_max, height[left])
            water += left_max - height[left]
            left += 1
        else:
            right_max = max(right_max, height[right])
            water += right_max - height[right]
            right -= 1
    return water
''',
        oracle='''
def trap(height):
    total = 0
    for i in range(len(height)):
        level = min(max(height[:i + 1]), max(height[i:]))
        total += level - height[i]
    return total
''',
    ),
    dict(
        slug="find-all-anagrams-in-a-string", topics=["sliding-window"], entry="findAnagrams",
        params=[("s", "string"), ("p", "string")], returns="int[]", comparator={"kind": "unordered"},
        summary=("在字符串 s 中找出所有是 p 的字母异位词（字符相同、顺序可不同）的子串，返回这些子串的起始下标，顺序不限。（本课程原创简述，完整题面见 LeetCode 官方页面。）",
                 "Find every substring of s that is an anagram of p (same letters in any order) and return their start indices in any order. (Original summary written for Learn; see LeetCode for the official statement.)"),
        constraints=[("1 ≤ |s|, |p| ≤ 3×10⁴，只含小写字母", "1 ≤ |s|, |p| ≤ 3×10⁴, lowercase letters only")],
        hints=[("异位词的长度一定等于 |p|。需要检查的子串有什么共同点？", "An anagram must have length |p|. What do all the candidate substrings have in common?"),
               ("用长度固定为 |p| 的窗口在 s 上滑动，维护窗口内 26 个字母的计数。", "Slide a window of fixed length |p| over s and keep counts of its 26 letters."),
               ("窗口每右移一格，加入一个字符、移出一个字符；计数与 p 的计数相同则记录起点。", "Each shift adds one character and removes one; record the start whenever the counts equal p's counts.")],
        explanation=("定长滑动窗口维护字母计数，每次移动 O(1) 更新，比较 26 个计数即可判断异位词。时间 O(26·|s|)，空间 O(1)。",
                     "A fixed-length sliding window keeps letter counts updated in O(1) per move; comparing 26 counts detects an anagram. O(26·|s|) time, O(1) space."),
        boundary=[["a", "a"], ["a", "ab"], ["aaaa", "aa"], ["abc", "d"], ["ab", "ba"]],
        inputs=[{"type": "string", "minLength": 1, "smallMaxLength": 12, "largeLength": 30000, "alphabet": "abc", "smallAlphabet": "ab"},
                {"type": "string", "minLength": 1, "smallMaxLength": 4, "largeLength": 1000, "alphabet": "abc", "smallAlphabet": "ab"}],
        reference='''
def findAnagrams(s, p):
    if len(p) > len(s):
        return []
    need = [0] * 26
    have = [0] * 26
    for ch in p:
        need[ord(ch) - 97] += 1
    out = []
    for i, ch in enumerate(s):
        have[ord(ch) - 97] += 1
        if i >= len(p):
            have[ord(s[i - len(p)]) - 97] -= 1
        if i >= len(p) - 1 and have == need:
            out.append(i - len(p) + 1)
    return out
''',
        oracle='''
def findAnagrams(s, p):
    target = sorted(p)
    return [i for i in range(len(s) - len(p) + 1) if sorted(s[i:i + len(p)]) == target]
''',
    ),
    dict(
        slug="subarray-sum-equals-k", topics=["array-techniques"], entry="subarraySum",
        params=[("nums", "int[]"), ("k", "int")], returns="int",
        summary=("统计数组中和恰好为 k 的连续非空子数组的个数。元素可以为负数。（本课程原创简述，完整题面见 LeetCode 官方页面。）",
                 "Count the non-empty contiguous subarrays whose sum is exactly k. Elements may be negative. (Original summary written for Learn; see LeetCode for the official statement.)"),
        constraints=[("1 ≤ n ≤ 2×10⁴，-1000 ≤ nums[i] ≤ 1000，-10⁷ ≤ k ≤ 10⁷", "1 ≤ n ≤ 2×10⁴, -1000 ≤ nums[i] ≤ 1000, -10⁷ ≤ k ≤ 10⁷")],
        hints=[("有负数时滑动窗口不再适用。子数组的和能用两个前缀和表示吗？", "With negative numbers a sliding window fails. Can a subarray sum be written with two prefix sums?"),
               ("sum(i..j) = prefix[j+1] - prefix[i]。要它等于 k，就是找之前出现过多少次 prefix - k。", "sum(i..j) = prefix[j+1] - prefix[i]. For it to equal k, count how often prefix - k appeared before."),
               ("用哈希表记录每个前缀和出现的次数，初始放入 {0: 1}，边扫描边累加答案。", "Keep a hash map of prefix-sum counts, starting with {0: 1}, and accumulate the answer while scanning.")],
        explanation=("前缀和加哈希计数：扫描到当前前缀和 s 时，之前出现的 s-k 的次数就是以当前位置结尾、和为 k 的子数组数。时间 O(n)，空间 O(n)。",
                     "Prefix sums with a hash count: at prefix sum s, the earlier occurrences of s-k are exactly the subarrays ending here with sum k. O(n) time and space."),
        boundary=[[[0], 0], [[1], 1], [[1], 0], [[0, 0, 0], 0], [[1, -1, 1, -1], 0], [[-1000, 1000], 0]],
        inputs=[{"type": "int[]", "minLength": 1, "smallMaxLength": 10, "largeLength": 20000, "min": -1000, "max": 1000, "smallMin": -3, "smallMax": 3},
                {"type": "int", "min": -10000000, "max": 10000000, "smallMin": -4, "smallMax": 4}],
        hooks='''
def adjust(args, rng, size):
    nums, k = args
    if size == "large":
        left = rng.randrange(len(nums))
        right = rng.randrange(left, min(len(nums), left + 50))
        k = sum(nums[left:right + 1])
    return [nums, k]
''',
        reference='''
def subarraySum(nums, k):
    counts = {0: 1}
    total = 0
    answer = 0
    for x in nums:
        total += x
        answer += counts.get(total - k, 0)
        counts[total] = counts.get(total, 0) + 1
    return answer
''',
        oracle='''
def subarraySum(nums, k):
    return sum(1 for i in range(len(nums)) for j in range(i, len(nums)) if sum(nums[i:j + 1]) == k)
''',
    ),
    dict(
        slug="sliding-window-maximum", topics=["sliding-window"], entry="maxSlidingWindow",
        params=[("nums", "int[]"), ("k", "int")], returns="int[]",
        summary=("一个长度为 k 的窗口从左向右滑过数组，返回每个窗口位置中的最大值。（本课程原创简述，完整题面见 LeetCode 官方页面。）",
                 "A window of size k slides across the array from left to right; return the maximum of each window position. (Original summary written for Learn; see LeetCode for the official statement.)"),
        constraints=[("1 ≤ n ≤ 10⁵，-10⁴ ≤ nums[i] ≤ 10⁴，1 ≤ k ≤ n", "1 ≤ n ≤ 10⁵, -10⁴ ≤ nums[i] ≤ 10⁴, 1 ≤ k ≤ n")],
        hints=[("每次重新扫描窗口要 O(nk)。哪些元素永远不可能再成为最大值？", "Rescanning each window costs O(nk). Which elements can never be the maximum again?"),
               ("如果右边来了一个更大的数，它左边更小的数在之后的窗口里都没用了。", "When a larger number arrives on the right, smaller numbers to its left are useless for every later window."),
               ("维护一个下标双端队列，对应的值单调递减；队首是当前最大值，过期时从队首弹出。", "Keep a deque of indices with decreasing values; the front is the current maximum and is popped when it leaves the window.")],
        explanation=("单调递减双端队列：新元素入队前弹出所有不大于它的队尾，队首超出窗口时弹出。每个下标进出一次，时间 O(n)，空间 O(k)。",
                     "A decreasing deque: before pushing, pop every tail that is not larger; pop the front once it leaves the window. Each index enters and leaves once, O(n) time, O(k) space."),
        boundary=[[[1], 1], [[1, -1], 1], [[9, 8, 7], 3], [[1, 3, 1, 2, 0, 5], 3], [[-10000, -10000], 2]],
        inputs=[{"type": "int[]", "minLength": 1, "smallMaxLength": 10, "largeLength": 20000, "min": -10000, "max": 10000, "smallMin": -5, "smallMax": 5},
                {"type": "int", "min": 1, "max": 1}],
        hooks='''
def adjust(args, rng, size):
    nums, _ = args
    k = rng.randint(1, len(nums)) if size == "small" else rng.randint(len(nums) // 4, len(nums) // 2)
    return [nums, k]
''',
        reference='''
from collections import deque
def maxSlidingWindow(nums, k):
    window = deque()
    out = []
    for i, x in enumerate(nums):
        while window and nums[window[-1]] <= x:
            window.pop()
        window.append(i)
        if window[0] <= i - k:
            window.popleft()
        if i >= k - 1:
            out.append(nums[window[0]])
    return out
''',
        oracle='''
def maxSlidingWindow(nums, k):
    return [max(nums[i:i + k]) for i in range(len(nums) - k + 1)]
''',
    ),
    dict(
        slug="minimum-window-substring", topics=["sliding-window"], entry="minWindow",
        params=[("s", "string"), ("t", "string")], returns="string",
        summary=("在 s 中找出包含 t 全部字符（包括重复次数）的最短子串；不存在则返回空字符串。测试数据保证答案唯一。（本课程原创简述，完整题面见 LeetCode 官方页面。）",
                 "Find the shortest substring of s that contains every character of t, counting duplicates; return an empty string if none exists. Tests guarantee the answer is unique. (Original summary written for Learn; see LeetCode for the official statement.)"),
        constraints=[("1 ≤ |s|, |t| ≤ 10⁵，由大小写英文字母组成", "1 ≤ |s|, |t| ≤ 10⁵, upper- and lowercase English letters")],
        hints=[("先找到一个包含 t 的窗口，再想办法让它变短。", "First find any window that contains t, then try to shrink it."),
               ("右指针扩张直到窗口满足条件，然后左指针尽量收缩，并记录最短的满足窗口。", "Grow the right end until the window qualifies, then shrink from the left as far as possible, recording the shortest qualifying window."),
               ("用计数表和一个“还缺几个字符”的变量，在 O(1) 内判断窗口是否满足条件。", "Use a count table plus a 'characters still missing' counter to test the window in O(1).")],
        explanation=("可变长滑动窗口：右扩满足覆盖条件后左缩到不能再缩，用缺失计数在 O(1) 判断是否覆盖。每个字符进出窗口各一次，时间 O(|s|+|t|)。",
                     "A variable sliding window: extend right until t is covered, then shrink left as far as possible; a missing-count makes the coverage test O(1). Each character enters and leaves once, O(|s|+|t|) time."),
        boundary=[["a", "a"], ["a", "aa"], ["a", "b"], ["ab", "b"], ["aA", "A"]],
        inputs=[{"type": "string", "minLength": 1, "smallMaxLength": 12, "largeLength": 60000, "alphabet": "abcdefgh", "smallAlphabet": "abcA"},
                {"type": "string", "minLength": 1, "smallMaxLength": 3, "largeLength": 3, "alphabet": "abcdefgh", "smallAlphabet": "abcA"}],
        hooks='''
from collections import Counter

def _windows(s, t):
    need = Counter(t)
    best = None
    for length in range(len(t), len(s) + 1):
        hits = [i for i in range(len(s) - length + 1) if not (need - Counter(s[i:i + length]))]
        if hits:
            return hits
    return []

def _unique_large(s, t):
    need = Counter(t)
    missing = len(t)
    have = Counter()
    left = 0
    best = None
    for right, ch in enumerate(s):
        have[ch] += 1
        if have[ch] <= need[ch]:
            missing -= 1
        while missing == 0:
            if best is None or right - left + 1 < best:
                best = right - left + 1
            have[s[left]] -= 1
            if have[s[left]] < need[s[left]]:
                missing += 1
            left += 1
    if best is None:
        return True
    window = Counter(s[:best])
    count = 1 if not (need - window) else 0
    for i in range(best, len(s)):
        window[s[i]] += 1
        window[s[i - best]] -= 1
        if not (need - window):
            count += 1
            if count > 1:
                return False
    return count == 1

def adjust(args, rng, size):
    s, t = args
    if size != "large":
        return [s, t]
    chars = list(s)
    left = rng.randrange(0, len(chars) - 1200)
    right = left + rng.randint(2, 1000)
    chars[left] = "Y"
    chars[right] = "Z"
    between = chars[left + 1:right]
    extra = rng.sample(between, min(4, len(between)))
    return ["".join(chars), "Y" + "".join(extra) + "Z"]

def valid(args):
    s, t = args
    if len(s) <= 40:
        return len(_windows(s, t)) <= 1
    return _unique_large(s, t)
''',
        reference='''
from collections import Counter
def minWindow(s, t):
    need = Counter(t)
    missing = len(t)
    left = 0
    best = (0, 0)
    for right, ch in enumerate(s, 1):
        if need[ch] > 0:
            missing -= 1
        need[ch] -= 1
        if missing == 0:
            while need[s[left]] < 0:
                need[s[left]] += 1
                left += 1
            if best == (0, 0) or right - left < best[1] - best[0]:
                best = (left, right)
            need[s[left]] += 1
            missing += 1
            left += 1
    return s[best[0]:best[1]]
''',
        oracle='''
from collections import Counter
def minWindow(s, t):
    need = Counter(t)
    for length in range(len(t), len(s) + 1):
        for i in range(len(s) - length + 1):
            if not (need - Counter(s[i:i + length])):
                return s[i:i + length]
    return ""
''',
    ),
]
