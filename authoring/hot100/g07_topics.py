"""Topics 堆 / 贪心 / 技巧 with lessons and seeded variants."""

PROBLEMS = []

TOPICS = [
    dict(
        id="heap", order=13,
        title=("堆：只关心“当前最大/最小”的有序结构", "Heaps: ordered structures that only track the current extreme"),
        summary=("当只需要反复取出最大（或最小）的元素、或只保留前 k 个时，用堆代替完整排序：插入和弹出 O(log n)，查看堆顶 O(1)。",
                 "When you repeatedly need the largest or smallest element, or only the top k, use a heap instead of a full sort: insert and pop in O(log n), peek in O(1)."),
        prerequisites=["hashing"],
        problems=["kth-largest-element-in-an-array"],
        variants=["heap-running-kth-largest", "heap-top-k-frequent-words"],
        lesson=dict(
            motivation=("一场比赛有 10 万名选手陆续交卷，主办方只想实时显示前 10 名的最低分（入围线）。\n\n每来一份成绩就把所有成绩重新排序，太慢了。其实只需要保留当前的前 10 名，并能随时知道其中最低的是谁——新成绩比它高就把它挤掉。\n\n“随时知道最小（或最大）的那个、并能快速替换”正是堆擅长的事。",
                        "A contest receives 100,000 submissions over time, and the organizers only want to show the lowest score among the current top 10, the cut-off line.\n\nRe-sorting every score on each submission is too slow. All you need is to keep the current top 10 and always know the lowest of them; a higher new score pushes it out.\n\nAlways knowing the smallest (or largest) element and replacing it quickly is exactly what a heap does."),
            strategy=("**堆的操作**：push / pop 为 O(log n)，查看堆顶 O(1)，建堆 O(n)。Python 的 heapq 是最小堆，最大堆可以存相反数。\n\n**前 k 大**：维护大小为 k 的**最小**堆，堆顶就是第 k 大；新元素比堆顶大才替换。总时间 O(n log k)。\n\n**按频率取前 k**：先用哈希表计数，再对 (频率, 值) 用大小为 k 的堆。\n\n**多路归并 / 动态中位数**：堆维护 k 个候选头；两个堆分别保存较小一半和较大一半。\n\n**比较**：只需要前 k 个时，堆比完整排序 O(n log n) 更省；需要全部有序时直接排序。",
                      "**Heap operations**: push and pop are O(log n), peeking O(1), building O(n). Python's heapq is a min-heap; store negatives for a max-heap.\n\n**Top k**: keep a size-k **min**-heap; its top is the k-th largest, replaced only when a new element is larger. O(n log k) overall.\n\n**Top k by frequency**: count with a hash map, then use a size-k heap over (frequency, value).\n\n**k-way merges and running medians**: a heap holds the k candidate heads; two heaps hold the smaller and larger halves.\n\n**When to use**: when only the top k matter, a heap beats a full O(n log n) sort; when everything must be ordered, just sort."),
            example=dict(
                title=("例：nums = [3, 2, 1, 5, 6, 4]，k = 2", "Example: nums = [3, 2, 1, 5, 6, 4], k = 2"),
                body=("最小堆只保留目前最大的 2 个数。", "The min-heap keeps only the two largest numbers so far."),
                columns=["x", "heap", "top"],
                trace=[
                    ({"x": "3, 2", "heap": "[2, 3]", "top": "2"}, ("前 k 个直接放入。", "The first k go straight in.")),
                    ({"x": "1", "heap": "[2, 3]", "top": "2"}, ("1 不比堆顶大，丢弃。", "1 is not above the top, so it is dropped.")),
                    ({"x": "5", "heap": "[3, 5]", "top": "3"}, ("5 > 2，替换堆顶。", "5 > 2, so it replaces the top.")),
                    ({"x": "6", "heap": "[5, 6]", "top": "5"}, ("6 > 3，替换堆顶。", "6 > 3, so it replaces the top.")),
                    ({"x": "4", "heap": "[5, 6]", "top": "5"}, ("4 不比 5 大；第 2 大是 5。", "4 is not above 5; the second largest is 5.")),
                ],
            ),
            check=[
                dict(id="min-heap", prompt=("求第 k 大时，为什么用大小为 k 的最小堆而不是最大堆？", "For the k-th largest, why a size-k min-heap rather than a max-heap?"),
                     options=[("最小堆的堆顶正好是前 k 大中最小的，即第 k 大，也是最该被挤出的那个", "Its top is the smallest of the top k, which is both the answer and the element to evict"),
                              ("最小堆插入更快", "Min-heaps insert faster"),
                              ("Python 只支持最小堆", "Python only supports min-heaps")],
                     answer=0, explanation=("新元素只需与“前 k 大里最弱的”比较，这正是最小堆的堆顶。", "A newcomer only competes with the weakest of the top k, exactly the min-heap's top.")),
                dict(id="complexity", prompt=("n 个元素、大小为 k 的堆，求前 k 大的总时间是多少？", "With n elements and a size-k heap, what is the total time for the top k?"),
                     options=[("O(n log k)", "O(n log k)"), ("O(n log n)", "O(n log n)"), ("O(nk)", "O(nk)")],
                     answer=0, explanation=("每个元素至多一次 O(log k) 的堆操作。", "Each element costs at most one O(log k) heap operation.")),
            ],
            practice="kth-largest-element-in-an-array",
            reflection=("如果数据是一个无限的流，你会如何随时回答“当前第 k 大是多少”？说明堆里保存什么、何时更新。", "If the data were an endless stream, how would you answer 'what is the k-th largest now' at any moment? Say what the heap holds and when it changes."),
        ),
    ),
    dict(
        id="greedy", order=14,
        title=("贪心：每一步做局部最优，并证明它不会错过全局最优", "Greedy: take the locally best step and prove it never loses the global best"),
        summary=("贪心算法每一步只看当前最好的选择，不回头。关键不是写代码，而是论证：为什么这样选不会错过更好的答案（交换论证或不变量）。",
                 "A greedy algorithm takes the best-looking step each time and never looks back. The hard part is not the code but the argument that this choice never misses a better answer, by an exchange argument or an invariant."),
        prerequisites=["array-techniques"],
        problems=["best-time-to-buy-and-sell-stock"],
        variants=["greedy-stock-unlimited", "greedy-farthest-reach"],
        lesson=dict(
            motivation=("你在规划一次只买一次、卖一次的股票交易，手里有过去一个月的价格。\n\n枚举所有“买入日、卖出日”组合是 O(n²)。换个角度：如果我决定在今天卖出，最好的买入日一定是今天之前价格最低的那天——这个结论不需要回头修改，所以只要边走边记住“目前最低价”。\n\n这就是贪心：每一步做一个当前看来最好的、并且可以证明不会出错的决定。",
                        "You plan a single buy and a single sell and have a month of past prices.\n\nTrying every buy-day and sell-day pair is O(n²). Look at it differently: if you sell today, the best buy day is the cheapest day before today. That conclusion never needs revisiting, so you only remember the lowest price so far as you walk.\n\nThat is greed: at each step make the decision that looks best now and that you can prove is never wrong."),
            strategy=("**常见模式**：\n- 维护“到目前为止最好的东西”（最低价、最远可达位置），一次扫描。\n- 按层推进的贪心（跳跃游戏 II）：本层能到达的范围决定下一层。\n- 区间类：先确定每个元素的“最后出现位置”或按端点排序，再线性扫描。\n\n**如何证明**：\n- **交换论证**：假设最优解在某一步与贪心选择不同，把它换成贪心选择后不会变差。\n- **不变量**：说明扫描到 i 时维护的量（如最远可达位置）始终正确。\n\n**警惕**：很多看似可以贪心的问题其实需要动态规划（例如有冷冻期的股票）。写之前先找反例。",
                      "**Common patterns**:\n- Track the best thing so far (lowest price, farthest reach) in one scan.\n- Level-by-level greed (Jump Game II): the reach of one level defines the next.\n- Interval problems: find each element's last occurrence or sort by endpoint, then scan linearly.\n\n**How to prove it**:\n- **Exchange argument**: if an optimal solution differs from the greedy choice at some step, swapping in the greedy choice does not make it worse.\n- **Invariant**: show the quantity maintained at index i, such as the farthest reach, is always correct.\n\n**Beware**: many problems that look greedy need dynamic programming, such as stock trading with a cooldown. Look for a counterexample before coding."),
            example=dict(
                title=("例：prices = [7, 1, 5, 3, 6, 4]", "Example: prices = [7, 1, 5, 3, 6, 4]"),
                body=("维护目前最低价和最大利润。", "Track the lowest price so far and the best profit."),
                columns=["price", "lowest", "best profit"],
                trace=[
                    ({"price": "7", "lowest": "7", "best profit": "0"}, ("第一天只能买。", "On the first day you can only buy.")),
                    ({"price": "1", "lowest": "1", "best profit": "0"}, ("出现更低的买入价。", "A cheaper buying price appears.")),
                    ({"price": "5", "lowest": "1", "best profit": "4"}, ("今天卖出可赚 4。", "Selling today earns 4.")),
                    ({"price": "3", "lowest": "1", "best profit": "4"}, ("赚 2，不如之前。", "Earns 2, worse than before.")),
                    ({"price": "6", "lowest": "1", "best profit": "5"}, ("今天卖出可赚 5，更新答案。", "Selling today earns 5, a new best.")),
                ],
            ),
            check=[
                dict(id="why-safe", prompt=("为什么“以今天卖出时，最佳买入日是此前最低价那天”可以不加回溯地使用？", "Why can 'the best buy day before today is the cheapest one' be used without backtracking?"),
                     options=[("最低价只会随着向右扫描而变得更低，之前的结论对今天仍成立", "The lowest price only decreases as the scan moves right, so earlier conclusions stay valid"),
                              ("因为股价总是上涨", "Because prices always rise"),
                              ("因为答案总是在最后一天", "Because the answer is always on the last day")],
                     answer=0, explanation=("“此前最低价”是一个前缀最小值，可以在线维护，不需要回头。", "The lowest earlier price is a prefix minimum maintained online, never revisited.")),
                dict(id="counterexample", prompt=("“跳跃游戏 II”中，每次都跳到当前能到的最远位置，为什么可能不是最少跳数？", "In Jump Game II, why might always jumping as far as possible not give the fewest jumps?"),
                     options=[("跳到最远处的落点本身可能跳不远；应该选“下一跳能到最远”的落点", "The farthest landing spot may itself jump poorly; choose the spot whose next jump reaches farthest"),
                              ("因为最远位置可能越界", "Because the farthest position may be out of range"),
                              ("它总是最少跳数", "It always gives the fewest jumps")],
                     answer=0, explanation=("正确的贪心是按层推进：在本层所有位置中，取能让下一层到达最远的。", "The correct greed advances by levels, using the positions in this level that make the next level reach farthest.")),
            ],
            practice="best-time-to-buy-and-sell-stock",
            reflection=("用交换论证解释“划分字母区间”的贪心为什么正确：为什么片段必须延伸到已见字母的最后出现位置，且不能更早结束？", "Use an exchange argument for Partition Labels: why must a part extend to the last occurrence of every letter seen, and why can it not end earlier?"),
        ),
    ),
    dict(
        id="tricks", order=15,
        title=("技巧：位运算、投票与原地划分", "Tricks: bit operations, voting, and in-place partitioning"),
        summary=("一些问题有专门的小技巧：异或抵消成对元素，摩尔投票找众数，三指针原地划分，把数组看成链表用快慢指针找重复。它们都能在 O(n) 时间、O(1) 空间内完成。",
                 "Some problems have dedicated tricks: XOR cancels pairs, Boyer–Moore voting finds a majority, three pointers partition in place, and viewing an array as a linked list finds a duplicate with fast/slow pointers. All run in O(n) time and O(1) space."),
        prerequisites=["two-pointers", "linked-list"],
        problems=["single-number"],
        variants=["tricks-two-singles", "tricks-majority-third"],
        lesson=dict(
            motivation=("一个仓库里每种零件都恰好成对入库，只有一件落单了。清点员只带了一个计算器，没有纸可以记录。\n\n要找出落单的那件，常规做法是记录每种零件出现的次数——这需要“纸”（额外空间）。\n\n异或运算有一个神奇的性质：a ⊕ a = 0。把所有零件编号依次异或，成对的互相抵消，最后计算器上剩下的就是落单的那件。很多“O(1) 空间”的要求，都要靠这样的数学性质来满足。",
                        "A warehouse receives every part in pairs except one lonely item, and the clerk has only a calculator, no paper to write on.\n\nThe usual approach counts each part type, which needs paper, extra space.\n\nXOR has a remarkable property: a ⊕ a = 0. XOR every part number in turn and the pairs cancel; what remains on the calculator is the lonely part. Many O(1)-space requirements are met by mathematical properties like this."),
            strategy=("**异或**：a ⊕ a = 0，a ⊕ 0 = a，满足交换律和结合律。全部异或可消去成对元素；两个落单数时，用异或结果的某个 1 位把数分成两组。\n\n**摩尔投票**：不同的元素两两抵消。出现次数 > n/2 的元素抵消后一定剩下；推广到 > n/3 时维护两个候选，最后再计数验证。\n\n**荷兰国旗**：low、i、high 三个指针把数组分成 0、1、未处理、2 四个区域，一次遍历原地排序。\n\n**数组即链表**：值域为 [1, n] 时，把 i → nums[i] 看成 next 指针，重复值就是环的入口，用 Floyd 判圈。\n\n**下一个排列**：找最右的上升点，与后缀中最小的较大值交换，再反转后缀。",
                      "**XOR**: a ⊕ a = 0 and a ⊕ 0 = a, commutative and associative. XORing everything cancels pairs; with two lonely numbers, a set bit of the XOR splits the values into two groups.\n\n**Boyer–Moore voting**: different elements cancel in pairs. An element appearing more than n/2 times survives; for more than n/3, keep two candidates and verify with a final count.\n\n**Dutch national flag**: pointers low, i, and high split the array into 0s, 1s, unprocessed, and 2s for a one-pass in-place sort.\n\n**Array as a linked list**: with values in [1, n], treat i → nums[i] as next pointers; the duplicate is the cycle entry, found with Floyd's algorithm.\n\n**Next permutation**: find the rightmost ascent, swap it with the smallest larger value in the suffix, then reverse the suffix."),
            example=dict(
                title=("例：摩尔投票 nums = [2, 2, 1, 1, 1, 2, 2]", "Example: Boyer–Moore voting on [2, 2, 1, 1, 1, 2, 2]"),
                body=("计数为 0 时更换候选；相同加一，不同减一。", "At count 0 switch candidates; add one for a match, subtract one otherwise."),
                columns=["x", "candidate", "count"],
                trace=[
                    ({"x": "2, 2", "candidate": "2", "count": "2"}, ("候选 2 获得两票。", "Candidate 2 gains two votes.")),
                    ({"x": "1, 1", "candidate": "2", "count": "0"}, ("两个 1 抵消两个 2。", "Two 1s cancel two 2s.")),
                    ({"x": "1", "candidate": "1", "count": "1"}, ("计数为 0，换成候选 1。", "The count is 0, so 1 becomes the candidate.")),
                    ({"x": "2", "candidate": "1", "count": "0"}, ("被抵消。", "Cancelled.")),
                    ({"x": "2", "candidate": "2", "count": "1"}, ("最终候选 2 就是众数。", "The final candidate, 2, is the majority.")),
                ],
            ),
            check=[
                dict(id="xor", prompt=("为什么把所有数异或起来就能得到只出现一次的数？", "Why does XORing all numbers yield the one that appears once?"),
                     options=[("异或满足交换律与结合律，成对的数 a ⊕ a = 0 互相抵消，0 ⊕ x = x", "XOR is commutative and associative, pairs give a ⊕ a = 0, and 0 ⊕ x = x"),
                              ("异或相当于求和再取模", "XOR is a sum modulo something"),
                              ("因为只出现一次的数最大", "Because the single number is the largest")],
                     answer=0, explanation=("顺序无关，所有成对的数都会消成 0。", "Order does not matter, so every pair collapses to 0.")),
                dict(id="verify", prompt=("推广到“出现次数 > n/3”时，为什么最后还要再数一遍两个候选？", "When generalizing to more than n/3, why recount the two candidates at the end?"),
                     options=[("投票只保证真正的答案一定在候选中，但候选不一定都满足条件", "Voting only guarantees the true answers are among the candidates, not that both qualify"),
                              ("为了排序输出", "To sort the output"),
                              ("投票过程会改变数组", "Voting modifies the array")],
                     answer=0, explanation=("例如 [1, 2, 3] 结束时也会留下候选，但没有任何数超过 n/3。", "For [1, 2, 3], candidates remain at the end although no value exceeds n/3.")),
            ],
            practice="single-number",
            reflection=("解释“寻找重复数”中，为什么把 i → nums[i] 看成链表后，重复的数正好是环的入口。", "Explain why, viewing i → nums[i] as a linked list in Find the Duplicate Number, the duplicate is exactly the cycle entry."),
        ),
    ),
]

VARIANTS = [
    dict(
        id="heap-running-kth-largest", parent="kth-largest-element-in-an-array", topic="heap",
        title=("前缀中的第 k 大", "k-th Largest of Every Prefix"),
        summary=("对每个长度至少为 k 的前缀，求其中第 k 大的元素。", "For every prefix of length at least k, report its k-th largest element."),
        statement=("给定整数数组 `nums` 和整数 `k`。对每个 `i ≥ k - 1`，求前缀 `nums[0..i]` 中第 `k` 大的元素（按排序后的位置计，重复值分别计数）。\n\n按 `i` 递增的顺序返回这些答案组成的数组，长度为 `n - k + 1`。",
                   "Given an integer array `nums` and an integer `k`, for each `i ≥ k - 1` find the `k`-th largest element of the prefix `nums[0..i]`, counting repeated values separately.\n\nReturn these answers in increasing order of `i`, an array of length `n - k + 1`."),
        difficulty="medium", skills=["min-heap of size k", "streaming"],
        differences=[("output", ("从一个答案变成每个前缀一个答案，数据像流一样到来。", "From one answer to one per prefix, as if the data arrived as a stream.")),
                     ("reasoning", ("不能每次重新计算；需要在线维护大小为 k 的堆，并在每一步读出堆顶。", "Recomputing each time is too slow; maintain a size-k heap online and read its top at each step."))],
        transfer=("“大小为 k 的最小堆，堆顶就是第 k 大”这一不变量不变；新增的是在每次插入后立即输出堆顶。",
                  "The invariant that a size-k min-heap's top is the k-th largest carries over; the addition is emitting the top after every insertion."),
        entry="kthLargestPrefixes", params=[("nums", "int[]"), ("k", "int")], returns="int[]",
        constraints=[("1 ≤ k ≤ n ≤ 2×10⁴，-10⁴ ≤ nums[i] ≤ 10⁴", "1 ≤ k ≤ n ≤ 2×10⁴, -10⁴ ≤ nums[i] ≤ 10⁴")],
        examples=[[[4, 5, 8, 2, 3, 10], 3], [[1, 1, 1], 1]],
        boundary=[[[5], 1], [[3, 1], 2], [[1, 2, 3], 3], [[-10000, 10000], 1]],
        inputs=[{"type": "int[]", "minLength": 1, "smallMaxLength": 9, "largeLength": 20000, "min": -10000, "max": 10000, "smallMin": -4, "smallMax": 4}, {"type": "int", "min": 1, "max": 1}],
        hooks='''
def adjust(args, rng, size):
    nums, _ = args
    k = rng.randint(1, len(nums)) if size == "small" else rng.randint(len(nums) // 4, len(nums) // 2)
    return [nums, k]
''',
        hints=[("对单个数组，第 k 大可以用大小为 k 的最小堆求出。数据一个个到来时还成立吗？", "For one array, a size-k min-heap gives the k-th largest. Does that still work when data arrives one value at a time?"),
               ("成立：每来一个数，若堆不满就放入，否则与堆顶比较、更大时替换。", "Yes: push while the heap holds fewer than k, otherwise replace the top when the newcomer is larger."),
               ("当堆中恰有 k 个元素后，每一步的堆顶就是该前缀的答案。", "Once the heap holds k elements, its top after each step is that prefix's answer.")],
        reference='''
import heapq
def kthLargestPrefixes(nums, k):
    heap, out = [], []
    for x in nums:
        if len(heap) < k:
            heapq.heappush(heap, x)
        elif x > heap[0]:
            heapq.heapreplace(heap, x)
        if len(heap) == k:
            out.append(heap[0])
    return out
''',
        oracle='''
def kthLargestPrefixes(nums, k):
    return [sorted(nums[:i + 1], reverse=True)[k - 1] for i in range(k - 1, len(nums))]
''',
        mutants={
            "kth-smallest": '''
import heapq
def kthLargestPrefixes(nums, k):
    out = []
    for i in range(k - 1, len(nums)):
        out.append(heapq.nsmallest(k, nums[:i + 1])[-1])
    return out
''',
            "max-heap-top": '''
def kthLargestPrefixes(nums, k):
    out, best = [], None
    for i, x in enumerate(nums):
        best = x if best is None else max(best, x)
        if i >= k - 1:
            out.append(best)
    return out
''',
        },
    ),
    dict(
        id="heap-top-k-frequent-words", parent="top-k-frequent-elements", topic="heap",
        title=("前 k 个高频单词", "Top k Frequent Words"),
        summary=("返回出现次数最多的 k 个单词，按频率降序；频率相同按字典序升序。", "Return the k most frequent words by descending frequency, breaking ties by ascending lexicographic order."),
        statement=("给定单词列表 `words` 和整数 `k`，返回出现次数最多的 `k` 个**不同**单词。\n\n结果按出现次数**从高到低**排列；次数相同的单词按**字典序从小到大**排列。",
                   "Given a list of `words` and an integer `k`, return the `k` most frequent **distinct** words.\n\nOrder the result by frequency **from high to low**; words with equal frequency go in **ascending lexicographic** order."),
        difficulty="medium", skills=["counting", "heap with composite keys", "tie-breaking"],
        differences=[("output", ("结果的顺序有严格要求，频率相同还要按字典序排。", "The output order is strict, with lexicographic tie-breaking among equal frequencies.")),
                     ("input-structure", ("元素从整数变成字符串。", "Elements change from integers to strings."))],
        transfer=("“先计数、再用堆取前 k”的结构不变；变化在于比较规则：键为 (-频率, 单词)，并且需要按该规则输出有序结果。",
                  "Count first, then take the top k with a heap; what changes is the comparison key, (-frequency, word), and the result must come out in that order."),
        entry="topKFrequentWords", params=[("words", "string[]"), ("k", "int")], returns="string[]",
        constraints=[("1 ≤ |words| ≤ 500，1 ≤ 单词长度 ≤ 10，小写字母；1 ≤ k ≤ 不同单词数", "1 ≤ |words| ≤ 500, 1 ≤ word length ≤ 10, lowercase; 1 ≤ k ≤ number of distinct words")],
        examples=[[["i", "love", "leetcode", "i", "love", "coding"], 2], [["b", "a", "b", "a", "c"], 3]],
        boundary=[[["a"], 1], [["b", "a"], 2], [["a", "a", "b"], 1], [["c", "b", "a"], 1]],
        inputs=[{"type": "string[]", "minLength": 1, "maxLength": 500, "smallMaxLength": 8, "largeLength": 500, "word": {"minLength": 1, "maxLength": 3, "smallMaxLength": 2, "alphabet": "abc"}}, {"type": "int", "min": 1, "max": 1}],
        hooks='''
def adjust(args, rng, size):
    words, _ = args
    words = [w if w else "a" for w in words]
    return [words, rng.randint(1, len(set(words)))]
''',
        hints=[("先用哈希表统计每个单词的次数。", "Count each word with a hash map first."),
               ("排序键可以写成 (-次数, 单词)：次数大的在前，次数相同时字典序小的在前。", "Use the key (-count, word): higher counts first, and smaller words first among ties."),
               ("排序后取前 k 个；或用 heapq.nsmallest(k, ..., key=...)，复杂度 O(n log k)。", "Sort and take the first k, or use heapq.nsmallest(k, ..., key=...) for O(n log k).")],
        reference='''
import heapq
from collections import Counter
def topKFrequentWords(words, k):
    counts = Counter(words)
    return heapq.nsmallest(k, counts, key=lambda w: (-counts[w], w))
''',
        oracle='''
def topKFrequentWords(words, k):
    distinct = sorted(set(words))
    distinct.sort(key=lambda w: -words.count(w))
    return distinct[:k]
''',
        mutants={
            "no-tie-break": '''
from collections import Counter
def topKFrequentWords(words, k):
    return [w for w, _ in Counter(words).most_common(k)]
''',
            "reverse-ties": '''
from collections import Counter
def topKFrequentWords(words, k):
    counts = Counter(words)
    return sorted(counts, key=lambda w: (-counts[w], [-ord(c) for c in w]))[:k]
''',
        },
    ),
    dict(
        id="greedy-stock-unlimited", parent="best-time-to-buy-and-sell-stock", topic="greedy",
        title=("可多次交易的买卖股票", "Stock Trading with Unlimited Transactions"),
        summary=("可以进行任意多次买卖（同一时间最多持有一股），求最大总利润。", "Make as many trades as you like, holding at most one share at a time, and return the maximum total profit."),
        statement=("给定数组 `prices`，`prices[i]` 是第 `i` 天的股价。你可以进行**任意多次**交易，但任何时候最多持有一股（必须先卖出才能再买入），同一天可以先卖后买。\n\n返回能获得的最大总利润。",
                   "Given `prices`, where `prices[i]` is the price on day `i`, you may trade **any number of times** but hold at most one share at a time, so you must sell before buying again; selling and buying on the same day is allowed.\n\nReturn the maximum total profit."),
        difficulty="medium", skills=["greedy", "decomposing profit into daily gains"],
        differences=[("constraints", ("交易次数从一次变为不限次数。", "The number of trades goes from one to unlimited.")),
                     ("reasoning", ("最优策略变成“把每一段上涨都吃下”，答案是所有正的相邻差之和。", "The best strategy captures every rise, so the answer is the sum of all positive day-to-day differences."))],
        transfer=("“一次扫描、只看当前与过去的价格”的贪心思路保留；新的论证是：任何一次长交易的利润都等于其中每天涨幅之和，所以收集每个正涨幅不会更差。",
                  "The one-scan greedy over current and past prices carries over; the new argument is that a long trade's profit equals the sum of its daily changes, so collecting every positive change is never worse."),
        entry="maxProfitUnlimited", params=[("prices", "int[]")], returns="int",
        constraints=[("1 ≤ n ≤ 3×10⁴，0 ≤ prices[i] ≤ 10⁴", "1 ≤ n ≤ 3×10⁴, 0 ≤ prices[i] ≤ 10⁴")],
        examples=[[[7, 1, 5, 3, 6, 4]], [[1, 2, 3, 4, 5]], [[7, 6, 4, 3, 1]]],
        boundary=[[[5]], [[1, 2]], [[2, 1]], [[1, 5, 1, 5]], [[3, 3, 3]]],
        inputs=[{"type": "int[]", "minLength": 1, "smallMaxLength": 8, "largeLength": 20000, "min": 0, "max": 10000, "smallMin": 0, "smallMax": 9}],
        hints=[("把一次从第 i 天到第 j 天的交易利润写成每天涨跌的和。", "Write the profit of a trade from day i to day j as the sum of daily changes."),
               ("既然可以无限次交易，任何正的单日涨幅都可以单独赚到。", "With unlimited trades, every positive one-day rise can be captured on its own."),
               ("答案 = Σ max(0, prices[i] - prices[i-1])。", "Answer = Σ max(0, prices[i] - prices[i-1]).")],
        reference='''
def maxProfitUnlimited(prices):
    return sum(max(0, b - a) for a, b in zip(prices, prices[1:]))
''',
        oracle='''
def maxProfitUnlimited(prices):
    from functools import lru_cache
    @lru_cache(maxsize=None)
    def best(i, holding):
        if i == len(prices):
            return 0
        skip = best(i + 1, holding)
        if holding:
            return max(skip, prices[i] + best(i + 1, False))
        return max(skip, -prices[i] + best(i + 1, True))
    return best(0, False)
''',
        mutants={
            "single-trade": '''
def maxProfitUnlimited(prices):
    lowest, best = prices[0], 0
    for p in prices[1:]:
        best = max(best, p - lowest)
        lowest = min(lowest, p)
    return best
''',
            "range": '''
def maxProfitUnlimited(prices):
    return max(prices) - min(prices)
''',
        },
    ),
    dict(
        id="greedy-farthest-reach", parent="jump-game", topic="greedy",
        title=("能到达的最远下标", "Farthest Reachable Index"),
        summary=("规则同跳跃游戏，返回从下标 0 出发能到达的最大下标。", "With Jump Game's rules, return the largest index reachable from index 0."),
        statement=("给定非负整数数组 `nums`，从下标 `0` 出发，在位置 `i` 时可以向右跳到 `i + 1` 到 `i + nums[i]` 之间的任意位置。\n\n返回能够到达的**最大下标**（不会超过 `n - 1`）。",
                   "Given a non-negative integer array `nums`, start at index `0`; from position `i` you may jump right to any position between `i + 1` and `i + nums[i]`.\n\nReturn the **largest index** you can reach, never more than `n - 1`."),
        difficulty="easy", skills=["greedy reach", "invariants"],
        differences=[("output", ("从“能否到达终点”变成“最远能到哪里”，需要在无法继续时返回当前可达边界。", "From whether the end is reachable to how far you can get, returning the reachable boundary when progress stops.")),
                     ("reasoning", ("要正确处理被 0 卡住的情况，以及可达范围超过末尾时的截断。", "Handle getting stuck behind zeros and clamp a reach that runs past the end."))],
        transfer=("“维护最远可达位置、遇到超过它的 i 就停止”的扫描不变；只是返回值从布尔改为该最远位置。",
                  "The scan that keeps the farthest reach and stops at an index beyond it is unchanged; only the result changes from a boolean to that reach."),
        entry="farthestIndex", params=[("nums", "int[]")], returns="int",
        constraints=[("1 ≤ n ≤ 10⁴，0 ≤ nums[i] ≤ 10⁵", "1 ≤ n ≤ 10⁴, 0 ≤ nums[i] ≤ 10⁵")],
        examples=[[[2, 3, 1, 1, 4]], [[3, 2, 1, 0, 4]], [[0, 5]]],
        boundary=[[[0]], [[1, 0]], [[1, 0, 9]], [[100000, 0, 0]], [[1, 1, 0, 1]]],
        inputs=[{"type": "int[]", "minLength": 1, "smallMaxLength": 8, "largeLength": 10000, "min": 0, "max": 3, "smallMin": 0, "smallMax": 3}],
        hints=[("在跳跃游戏中你维护了什么量？", "What quantity did you maintain in Jump Game?"),
               ("最远可达位置 reach。当 i > reach 时，后面的位置都到不了。", "The farthest reach. When i > reach, nothing beyond is reachable."),
               ("扫描结束或遇到 i > reach 时，返回 min(reach, n - 1)。", "When the scan ends or i > reach, return min(reach, n - 1).")],
        reference='''
def farthestIndex(nums):
    reach = 0
    for i, step in enumerate(nums):
        if i > reach:
            break
        reach = max(reach, i + step)
    return min(reach, len(nums) - 1)
''',
        oracle='''
def farthestIndex(nums):
    reached = {0}
    frontier = [0]
    while frontier:
        i = frontier.pop()
        for j in range(i + 1, min(len(nums), i + nums[i] + 1)):
            if j not in reached:
                reached.add(j)
                frontier.append(j)
    return max(reached)
''',
        mutants={
            "end-or-zero": '''
def farthestIndex(nums):
    reach = 0
    for i, step in enumerate(nums):
        if i > reach:
            return 0
        reach = max(reach, i + step)
    return len(nums) - 1
''',
            "unclamped": '''
def farthestIndex(nums):
    reach = 0
    for i, step in enumerate(nums):
        if i > reach:
            break
        reach = max(reach, i + step)
    return reach
''',
        },
    ),
    dict(
        id="tricks-two-singles", parent="single-number", topic="tricks",
        title=("两个只出现一次的数", "Two Numbers That Appear Once"),
        summary=("除了两个数各出现一次外，其余数都恰好出现两次。按升序返回这两个数。", "Every number appears twice except two that appear once; return those two in ascending order."),
        statement=("整数数组 `nums` 中恰有两个元素只出现一次，其余所有元素都恰好出现两次。找出这两个只出现一次的元素，按**升序**返回。\n\n要求 O(n) 时间、O(1) 额外空间。",
                   "In the integer array `nums`, exactly two elements appear once and every other element appears exactly twice. Return those two elements in **ascending** order.\n\nUse O(n) time and O(1) extra space."),
        difficulty="medium", skills=["XOR", "bit partitioning"],
        differences=[("output", ("要找两个数，而不是一个。", "Two numbers must be found instead of one.")),
                     ("reasoning", ("全部异或得到的是两个答案的异或值，需要用其中一个为 1 的二进制位把所有数分成两组。", "XORing everything yields the XOR of the two answers; a set bit of it splits all numbers into two groups."))],
        transfer=("“异或抵消成对元素”的性质保持不变；新的步骤是分组：两个答案在某一位上不同，按该位分组后，每组恰好包含一个答案和若干成对元素。",
                  "The pair-cancelling property of XOR carries over; the new step splits by a bit where the two answers differ, so each group holds one answer plus pairs."),
        entry="singleNumbers", params=[("nums", "int[]")], returns="int[]",
        constraints=[("2 ≤ n ≤ 3×10⁴，-2³¹ ≤ nums[i] ≤ 2³¹-1", "2 ≤ n ≤ 3×10⁴, -2³¹ ≤ nums[i] ≤ 2³¹-1")],
        examples=[[[1, 2, 1, 3, 2, 5]], [[-1, 0]], [[0, 1]]],
        boundary=[[[1, 2]], [[-2147483648, 2147483647]], [[4, 4, 7, 9]], [[0, -1, 0, 5]]],
        inputs=[{"type": "int[]", "minLength": 2, "smallMaxLength": 5, "largeLength": 10000, "min": -1000000000, "max": 1000000000, "smallMin": -6, "smallMax": 6, "distinct": True}],
        hooks='''
def adjust(args, rng, size):
    values = args[0]
    a, b, pairs = values[0], values[1], values[2:]
    nums = pairs + pairs + [a, b]
    rng.shuffle(nums)
    return [nums]
''',
        hints=[("全部异或后得到 x = a ⊕ b。x 一定不为 0，为什么？", "XOR everything to get x = a ⊕ b. Why is x never 0?"),
               ("取 x 的最低位 1：lowbit = x & -x。a 和 b 在这一位上一定不同。", "Take the lowest set bit, lowbit = x & -x; a and b differ in that bit."),
               ("按 (num & lowbit) 是否为 0 把所有数分成两组，各自异或得到 a 和 b，排序后返回。", "Split all numbers by whether num & lowbit is zero, XOR each group to get a and b, then sort them.")],
        reference='''
def singleNumbers(nums):
    x = 0
    for v in nums:
        x ^= v
    low = x & -x
    a = b = 0
    for v in nums:
        if v & low:
            a ^= v
        else:
            b ^= v
    return sorted([a, b])
''',
        oracle='''
def singleNumbers(nums):
    return sorted(v for v in set(nums) if nums.count(v) == 1)
''',
        mutants={
            "single-xor": '''
def singleNumbers(nums):
    x = 0
    for v in nums:
        x ^= v
    return [0, x] if x >= 0 else [x, 0]
''',
            "unsorted": '''
def singleNumbers(nums):
    x = 0
    for v in nums:
        x ^= v
    low = x & -x
    a = b = 0
    for v in nums:
        if v & low:
            a ^= v
        else:
            b ^= v
    return [a, b]
''',
        },
    ),
    dict(
        id="tricks-majority-third", parent="majority-element", topic="tricks",
        title=("出现超过 n/3 次的元素", "Elements Appearing More Than n/3 Times"),
        summary=("返回所有出现次数严格大于 ⌊n/3⌋ 的元素，按升序排列。", "Return every element appearing strictly more than ⌊n/3⌋ times, in ascending order."),
        statement=("给定长度为 `n` 的整数数组 `nums`，返回所有出现次数**严格大于** `⌊n/3⌋` 的元素，按**升序**排列（可能为空）。\n\n要求 O(n) 时间、O(1) 额外空间。",
                   "Given an integer array `nums` of length `n`, return every element that appears **strictly more than** `⌊n/3⌋` times, in **ascending** order; the result may be empty.\n\nUse O(n) time and O(1) extra space."),
        difficulty="medium", skills=["Boyer–Moore voting", "verification pass"],
        differences=[("constraints", ("阈值从 n/2 降到 n/3，最多可能有两个答案，也可能没有。", "The threshold drops from n/2 to n/3, so there may be up to two answers, or none.")),
                     ("reasoning", ("需要同时维护两个候选，并在最后计数验证，因为答案不保证存在。", "Two candidates must be kept and verified by counting at the end, since an answer is not guaranteed."))],
        transfer=("“不同元素互相抵消”的投票思想保留；推广为每次用三个不同元素一起抵消，因此保留两个候选，并补上验证步骤。",
                  "The idea of cancelling different elements carries over, generalized to cancelling three distinct values at a time, which leaves two candidates and adds a verification pass."),
        entry="majorityThird", params=[("nums", "int[]")], returns="int[]",
        constraints=[("1 ≤ n ≤ 5×10⁴，-10⁹ ≤ nums[i] ≤ 10⁹", "1 ≤ n ≤ 5×10⁴, -10⁹ ≤ nums[i] ≤ 10⁹")],
        examples=[[[3, 2, 3]], [[1]], [[1, 2]], [[1, 2, 3]]],
        boundary=[[[5, 5]], [[1, 1, 2, 2, 3]], [[1, 2, 3, 4]], [[2, 2, 1, 1, 1, 2, 2]]],
        inputs=[{"type": "int[]", "minLength": 1, "smallMaxLength": 9, "largeLength": 20000, "min": -1000000000, "max": 1000000000, "smallMin": 0, "smallMax": 3}],
        hooks='''
def adjust(args, rng, size):
    nums = args[0]
    if size == "large" and rng.random() < 0.7:
        heavy = [rng.randint(-1000000000, 1000000000) for _ in range(rng.randint(1, 2))]
        count = len(nums) // 3 + 1
        planted = [h for h in heavy for _ in range(count)]
        nums = planted + nums[:len(nums) - len(planted)]
        rng.shuffle(nums)
    return [nums]
''',
        hints=[("出现次数 > n/3 的元素最多有几个？", "How many elements can appear more than n/3 times?"),
               ("最多两个。维护两个候选及其计数：遇到候选之一加一；遇到计数为 0 的空位就占用；否则两个计数都减一。", "At most two. Keep two candidates with counts: a match increments, an empty slot (count 0) is taken, otherwise both counts decrement."),
               ("投票结束后，再遍历一次统计两个候选的真实次数，只保留超过 ⌊n/3⌋ 的，并排序返回。", "After voting, count both candidates again, keep those above ⌊n/3⌋, and return them sorted.")],
        reference='''
def majorityThird(nums):
    a, b, ca, cb = None, None, 0, 0
    for x in nums:
        if x == a:
            ca += 1
        elif x == b:
            cb += 1
        elif ca == 0:
            a, ca = x, 1
        elif cb == 0:
            b, cb = x, 1
        else:
            ca -= 1
            cb -= 1
    limit = len(nums) // 3
    return sorted(c for c in {a, b} if c is not None and nums.count(c) > limit)
''',
        oracle='''
def majorityThird(nums):
    limit = len(nums) // 3
    return sorted(v for v in set(nums) if nums.count(v) > limit)
''',
        mutants={
            "half-only": '''
def majorityThird(nums):
    return sorted(v for v in set(nums) if nums.count(v) * 2 > len(nums))
''',
            "non-strict": '''
def majorityThird(nums):
    limit = len(nums) // 3
    return sorted(v for v in set(nums) if nums.count(v) >= limit)
''',
            "no-verify": '''
def majorityThird(nums):
    a, b, ca, cb = None, None, 0, 0
    for x in nums:
        if x == a:
            ca += 1
        elif x == b:
            cb += 1
        elif ca == 0:
            a, ca = x, 1
        elif cb == 0:
            b, cb = x, 1
        else:
            ca -= 1
            cb -= 1
    return sorted(c for c in {a, b} if c is not None)
''',
        },
    ),
]
