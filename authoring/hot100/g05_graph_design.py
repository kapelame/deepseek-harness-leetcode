"""Hot 100 图论 problems and the data-structure design problems (146, 155, 208, 295)."""

ORIGINAL = ("（本课程原创简述，完整题面见 LeetCode 官方页面。）", " (Original summary written for Learn; see LeetCode for the official statement.)")


def summary(zh, en):
    return (zh + ORIGINAL[0], en + ORIGINAL[1])


DESIGN_PARAMS = [("operations", "string[]"), ("arguments", "json")]

PROBLEMS = [
    dict(
        slug="number-of-islands", topics=["graph"], entry="numIslands",
        params=[("grid", "string[][]")], returns="int",
        summary=summary("网格中 \"1\" 表示陆地、\"0\" 表示水。上下左右相连的陆地组成一个岛屿，统计岛屿数量。", "In a grid, \"1\" is land and \"0\" is water. Land cells connected up, down, left, or right form an island; count the islands."),
        constraints=[("1 ≤ m, n ≤ 300，grid[i][j] 为 \"0\" 或 \"1\"", "1 ≤ m, n ≤ 300, grid[i][j] is \"0\" or \"1\"")],
        hints=[("每遇到一块还没访问过的陆地，就发现了一个新岛屿。", "Every unvisited land cell you meet starts a new island."),
               ("从它出发用 DFS 或 BFS 把整个岛屿标记为已访问。", "From it, mark the whole island visited with DFS or BFS."),
               ("可以直接把访问过的 \"1\" 改成 \"0\"，省去 visited 数组；用显式栈避免深递归。", "You can overwrite visited \"1\" cells with \"0\" instead of a visited array, and use an explicit stack to avoid deep recursion.")],
        explanation=("扫描网格，遇到陆地就计数并用 BFS/DFS 淹没整个连通块。每个格子访问常数次，时间 O(mn)，空间 O(mn)。",
                     "Scan the grid; each land cell found increments the count and a BFS/DFS sinks its whole component. Every cell is touched a constant number of times, O(mn) time and space."),
        boundary=[[[["0"]]], [[["1"]]], [[["1", "0", "1"]]], [[["1"], ["1"], ["0"], ["1"]]], [[["1", "1"], ["1", "1"]]]],
        inputs=[{"type": "string[][]", "minLength": 1, "maxLength": 300, "smallMaxLength": 5, "largeLength": 200, "row": {"minLength": 1, "maxLength": 300, "smallMaxLength": 5, "largeLength": 200}, "cell": {"alphabet": "01", "maxLength": 1}}],
        hooks='''
def adjust(args, rng, size):
    grid = args[0]
    return [[[("1" if rng.random() < 0.45 else "0") for _ in row] for row in grid]]
''',
        reference='''
def numIslands(grid):
    rows, cols = len(grid), len(grid[0])
    count = 0
    for i in range(rows):
        for j in range(cols):
            if grid[i][j] == "1":
                count += 1
                grid[i][j] = "0"
                stack = [(i, j)]
                while stack:
                    r, c = stack.pop()
                    for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                        if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == "1":
                            grid[nr][nc] = "0"
                            stack.append((nr, nc))
    return count
''',
        oracle='''
def numIslands(grid):
    cells = [(i, j) for i, row in enumerate(grid) for j, v in enumerate(row) if v == "1"]
    parent = {cell: cell for cell in cells}
    def find(x):
        while parent[x] != x:
            x = parent[x]
        return x
    for i, j in cells:
        for other in ((i + 1, j), (i, j + 1)):
            if other in parent:
                parent[find(other)] = find((i, j))
    return len({find(cell) for cell in cells})
''',
    ),
    dict(
        slug="rotting-oranges", topics=["graph"], entry="orangesRotting",
        params=[("grid", "int[][]")], returns="int",
        summary=summary("网格中 0 为空、1 为新鲜橘子、2 为腐烂橘子。每分钟，腐烂橘子会让上下左右相邻的新鲜橘子腐烂。返回所有橘子都腐烂所需的最少分钟数；不可能则返回 -1。",
                        "In a grid, 0 is empty, 1 a fresh orange, and 2 a rotten one. Each minute, rotten oranges rot their fresh neighbors up, down, left, and right. Return the minutes until no fresh orange remains, or -1 if that never happens."),
        constraints=[("1 ≤ m, n ≤ 10，grid[i][j] ∈ {0, 1, 2}", "1 ≤ m, n ≤ 10, grid[i][j] ∈ {0, 1, 2}")],
        hints=[("所有腐烂橘子同时向外扩散。这是哪种搜索？", "All rotten oranges spread at the same time. Which search is that?"),
               ("多源 BFS：把所有初始腐烂的橘子一起放进队列，按层扩散，层数就是分钟数。", "Multi-source BFS: start with every rotten orange in the queue and spread level by level; the levels are minutes."),
               ("BFS 结束后若仍有新鲜橘子，返回 -1；没有新鲜橘子时答案为 0。", "If a fresh orange remains after the BFS, return -1; with no fresh oranges at all the answer is 0.")],
        explanation=("多源 BFS 按层推进，层数即时间，最后检查是否还有新鲜橘子。时间 O(mn)，空间 O(mn)。",
                     "Multi-source BFS advances level by level, levels being minutes, then checks for remaining fresh oranges. O(mn) time and space."),
        boundary=[[[[0]]], [[[1]]], [[[2]]], [[[2, 1]]], [[[1, 0, 2]]], [[[2, 1, 1], [0, 1, 1], [1, 0, 1]]]],
        inputs=[{"type": "int[][]", "minLength": 1, "maxLength": 10, "smallMaxLength": 4, "largeLength": 10, "row": {"minLength": 1, "maxLength": 10, "smallMaxLength": 4, "largeLength": 10}, "cell": {"min": 0, "max": 2}}],
        reference='''
from collections import deque
def orangesRotting(grid):
    rows, cols = len(grid), len(grid[0])
    queue = deque((i, j) for i in range(rows) for j in range(cols) if grid[i][j] == 2)
    fresh = sum(row.count(1) for row in grid)
    minutes = 0
    while queue and fresh:
        minutes += 1
        for _ in range(len(queue)):
            r, c = queue.popleft()
            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                    grid[nr][nc] = 2
                    fresh -= 1
                    queue.append((nr, nc))
    return -1 if fresh else minutes
''',
        oracle='''
def orangesRotting(grid):
    grid = [row[:] for row in grid]
    minutes = 0
    while True:
        changes = []
        for i, row in enumerate(grid):
            for j, v in enumerate(row):
                if v == 1 and any(0 <= i + di < len(grid) and 0 <= j + dj < len(row) and grid[i + di][j + dj] == 2
                                  for di, dj in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                    changes.append((i, j))
        if not changes:
            break
        for i, j in changes:
            grid[i][j] = 2
        minutes += 1
    return -1 if any(1 in row for row in grid) else minutes
''',
    ),
    dict(
        slug="course-schedule", topics=["graph"], entry="canFinish",
        params=[("numCourses", "int"), ("prerequisites", "int[][]")], returns="bool",
        summary=summary("共有 numCourses 门课，[a, b] 表示学 a 之前必须先学完 b。判断能否学完所有课程。", "There are numCourses courses; [a, b] means b must be finished before a. Report whether all courses can be finished."),
        constraints=[("1 ≤ numCourses ≤ 2000，0 ≤ 先修关系数 ≤ 5000，关系互不重复", "1 ≤ numCourses ≤ 2000, 0 ≤ prerequisite pairs ≤ 5000, all pairs distinct")],
        hints=[("把课程看成有向图的节点、先修关系看成边。什么情况下学不完？", "Treat courses as nodes and prerequisites as directed edges. When is finishing impossible?"),
               ("当且仅当图中有环。", "Exactly when the graph has a cycle."),
               ("拓扑排序（Kahn 算法）：不断取出入度为 0 的课程并删去它的出边，最后看取出的课程数是否等于总数。", "Topological sort (Kahn): repeatedly take a course with in-degree 0 and remove its edges; check whether every course was taken.")],
        explanation=("Kahn 拓扑排序：入度为 0 的节点入队，出队时减少后继的入度；能全部出队说明无环。时间 O(V + E)，空间 O(V + E)。",
                     "Kahn's topological sort: enqueue in-degree-0 nodes and decrement successors on dequeue; dequeuing all nodes means no cycle. O(V + E) time and space."),
        boundary=[[1, []], [2, [[1, 0]]], [2, [[1, 0], [0, 1]]], [3, [[0, 0]]], [3, [[1, 0], [2, 1], [0, 2]]]],
        inputs=[{"type": "int", "min": 1, "max": 2000}, {"type": "int[][]"}],
        hooks='''
def adjust(args, rng, size):
    n = rng.randint(1, 6) if size == "small" else 2000
    edges = rng.randint(0, min(8, n * n)) if size == "small" else 5000
    order = list(range(n))
    rng.shuffle(order)
    rank = {course: i for i, course in enumerate(order)}
    pairs = set()
    tries = 0
    while len(pairs) < edges and tries < edges * 20:
        tries += 1
        a, b = rng.randrange(n), rng.randrange(n)
        if a != b and rank[b] < rank[a]:
            pairs.add((a, b))
    pairs = [list(p) for p in pairs]
    if pairs and rng.random() < 0.4:
        a, b = rng.choice(pairs)
        if [b, a] not in pairs:
            pairs.append([b, a])
    rng.shuffle(pairs)
    return [n, pairs]
''',
        reference='''
from collections import deque
def canFinish(numCourses, prerequisites):
    indegree = [0] * numCourses
    after = [[] for _ in range(numCourses)]
    for a, b in prerequisites:
        after[b].append(a)
        indegree[a] += 1
    queue = deque(i for i in range(numCourses) if indegree[i] == 0)
    taken = 0
    while queue:
        course = queue.popleft()
        taken += 1
        for nxt in after[course]:
            indegree[nxt] -= 1
            if indegree[nxt] == 0:
                queue.append(nxt)
    return taken == numCourses
''',
        oracle='''
def canFinish(numCourses, prerequisites):
    remaining = set(range(numCourses))
    while remaining:
        free = [c for c in remaining if not any(a == c and b in remaining for a, b in prerequisites)]
        if not free:
            return False
        remaining -= set(free)
    return True
''',
    ),
    dict(
        slug="implement-trie-prefix-tree", topics=["design"], entry="Trie",
        params=DESIGN_PARAMS, returns="json",
        shape={"kind": "design", "className": "Trie", "constructorParams": [],
               "methods": [{"name": "insert", "params": [{"name": "word", "type": "string"}], "returns": "void"},
                           {"name": "search", "params": [{"name": "word", "type": "string"}], "returns": "bool"},
                           {"name": "startsWith", "params": [{"name": "prefix", "type": "string"}], "returns": "bool"}]},
        summary=summary("实现前缀树 Trie：insert 插入单词，search 判断单词是否被插入过，startsWith 判断是否有已插入的单词以给定前缀开头。",
                        "Implement a prefix tree: insert adds a word, search reports whether a word was inserted, and startsWith reports whether any inserted word begins with a prefix."),
        constraints=[("1 ≤ 单词与前缀长度 ≤ 2000，只含小写字母；调用总次数 ≤ 3×10⁴", "1 ≤ word and prefix length ≤ 2000, lowercase letters; at most 3×10⁴ calls")],
        hints=[("用集合保存单词能实现 search，但 startsWith 会很慢。", "A set of words handles search, but startsWith would be slow."),
               ("每个节点有最多 26 个孩子（按字母索引）和一个“是否为单词结尾”的标记。", "Each node has up to 26 children indexed by letter and an end-of-word flag."),
               ("search 要求走完单词且结尾标记为真；startsWith 只要求能走完前缀。", "search needs to walk the whole word and find the end flag set; startsWith only needs to walk the prefix.")],
        explanation=("字典树按字符逐层分支，三种操作都只与字符串长度 L 有关，时间 O(L)，空间与插入字符总数成正比。",
                     "A trie branches one character per level, so every operation costs O(L) for a string of length L; space grows with the total inserted characters."),
        boundary=[[["Trie", "search"], [[], ["a"]]], [["Trie", "insert", "search", "startsWith"], [[], ["a"], ["a"], ["a"]]],
                  [["Trie", "insert", "search", "search", "startsWith"], [[], ["apple"], ["app"], ["apple"], ["app"]]],
                  [["Trie", "insert", "insert", "search", "startsWith"], [[], ["ab"], ["abc"], ["ab"], ["abcd"]]]],
        inputs=[{"type": "string[]"}, {"type": "json"}],
        hooks='''
def adjust(args, rng, size):
    count = rng.randint(1, 10) if size == "small" else 4000
    alphabet = "ab" if size == "small" else "abcd"
    words = []
    ops, values = ["Trie"], [[]]
    for _ in range(count):
        kind = rng.choice(["insert", "search", "startsWith"])
        if words and rng.random() < 0.5:
            base = rng.choice(words)
            word = base[:rng.randint(1, len(base))] if kind == "startsWith" else base
        else:
            word = "".join(rng.choice(alphabet) for _ in range(rng.randint(1, 4 if size == "small" else 12)))
        if kind == "insert":
            words.append(word)
        ops.append(kind)
        values.append([word])
    return [ops, values]
''',
        reference='''
class Trie:
    def __init__(self):
        self.root = {}

    def insert(self, word):
        node = self.root
        for ch in word:
            node = node.setdefault(ch, {})
        node["$"] = True

    def _walk(self, text):
        node = self.root
        for ch in text:
            node = node.get(ch)
            if node is None:
                return None
        return node

    def search(self, word):
        node = self._walk(word)
        return node is not None and "$" in node

    def startsWith(self, prefix):
        return self._walk(prefix) is not None
''',
        oracle='''
class Trie:
    def __init__(self):
        self.words = []

    def insert(self, word):
        self.words.append(word)

    def search(self, word):
        return word in self.words

    def startsWith(self, prefix):
        return any(w.startswith(prefix) for w in self.words)
''',
    ),
    dict(
        slug="min-stack", topics=["design"], entry="MinStack",
        params=DESIGN_PARAMS, returns="json",
        shape={"kind": "design", "className": "MinStack", "constructorParams": [],
               "methods": [{"name": "push", "params": [{"name": "val", "type": "int"}], "returns": "void"},
                           {"name": "pop", "params": [], "returns": "void"},
                           {"name": "top", "params": [], "returns": "int"},
                           {"name": "getMin", "params": [], "returns": "int"}]},
        summary=summary("设计一个栈，除了 push、pop、top 外，还能在 O(1) 时间内返回当前栈中的最小元素 getMin。pop、top、getMin 只会在栈非空时调用。",
                        "Design a stack that supports push, pop, and top, and returns the current minimum with getMin in O(1) time. pop, top, and getMin are only called on a non-empty stack."),
        constraints=[("-2³¹ ≤ val ≤ 2³¹-1，调用总次数 ≤ 3×10⁴", "-2³¹ ≤ val ≤ 2³¹-1, at most 3×10⁴ calls")],
        hints=[("只用一个变量记录最小值，pop 掉最小值之后怎么办？", "With one variable for the minimum, what happens after popping the minimum?"),
               ("让每个栈元素同时记住“压入它时栈中的最小值”。", "Let every stack entry remember the minimum at the time it was pushed."),
               ("压入 (val, min(val, 当前最小值))；getMin 就是栈顶记录的最小值，pop 后自然恢复。", "Push (val, min(val, current minimum)); getMin reads the top's recorded minimum and recovers automatically after pop.")],
        explanation=("辅助信息与元素一同入栈：每个位置保存到该位置为止的最小值，所有操作 O(1)。空间 O(n)。",
                     "Store auxiliary data with each entry: every position keeps the minimum up to itself, so all operations are O(1). O(n) space."),
        boundary=[[["MinStack", "push", "getMin"], [[], [5], []]], [["MinStack", "push", "push", "pop", "getMin"], [[], [1], [0], [], []]],
                  [["MinStack", "push", "push", "push", "getMin", "pop", "top", "getMin"], [[], [-2], [0], [-3], [], [], [], []]],
                  [["MinStack", "push", "push", "getMin", "pop", "getMin"], [[], [2], [2], [], [], []]]],
        inputs=[{"type": "string[]"}, {"type": "json"}],
        hooks='''
def adjust(args, rng, size):
    count = rng.randint(1, 12) if size == "small" else 8000
    low, high = (-5, 5) if size == "small" else (-2147483648, 2147483647)
    ops, values, depth = ["MinStack"], [[]], 0
    for _ in range(count):
        kind = "push" if depth == 0 else rng.choice(["push", "push", "pop", "top", "getMin"])
        ops.append(kind)
        if kind == "push":
            values.append([rng.randint(low, high)])
            depth += 1
        else:
            values.append([])
            if kind == "pop":
                depth -= 1
    return [ops, values]
''',
        reference='''
class MinStack:
    def __init__(self):
        self.items = []

    def push(self, val):
        self.items.append((val, val if not self.items else min(val, self.items[-1][1])))

    def pop(self):
        self.items.pop()

    def top(self):
        return self.items[-1][0]

    def getMin(self):
        return self.items[-1][1]
''',
        oracle='''
class MinStack:
    def __init__(self):
        self.items = []

    def push(self, val):
        self.items.append(val)

    def pop(self):
        self.items.pop()

    def top(self):
        return self.items[-1]

    def getMin(self):
        return min(self.items)
''',
    ),
    dict(
        slug="lru-cache", topics=["design"], entry="LRUCache",
        params=DESIGN_PARAMS, returns="json",
        shape={"kind": "design", "className": "LRUCache", "constructorParams": [{"name": "capacity", "type": "int"}],
               "methods": [{"name": "get", "params": [{"name": "key", "type": "int"}], "returns": "int"},
                           {"name": "put", "params": [{"name": "key", "type": "int"}, {"name": "value", "type": "int"}], "returns": "void"}]},
        summary=summary("实现容量为 capacity 的 LRU（最近最少使用）缓存：get 返回键对应的值（不存在为 -1），put 写入或更新键值；超出容量时淘汰最久未被访问的键。get 和 put 都应为 O(1)。",
                        "Implement an LRU cache with a given capacity: get returns a key's value or -1, and put inserts or updates a key; when over capacity, evict the least recently used key. Both operations should be O(1)."),
        constraints=[("1 ≤ capacity ≤ 3000，0 ≤ key ≤ 10⁴，0 ≤ value ≤ 10⁵，调用总次数 ≤ 2×10⁵", "1 ≤ capacity ≤ 3000, 0 ≤ key ≤ 10⁴, 0 ≤ value ≤ 10⁵, at most 2×10⁵ calls")],
        hints=[("需要两种能力：按键快速查找，以及快速找到并删除最久未用的键。", "You need two abilities: fast lookup by key, and fast removal of the least recently used key."),
               ("哈希表负责查找；双向链表按使用时间排序，最近使用的放在一端。", "A hash map handles lookup; a doubly linked list orders keys by use with the most recent at one end."),
               ("get 和更新时把节点移到“最近”一端；插入新键超容量时删除“最久”一端的节点。Python 也可以用 OrderedDict.move_to_end。", "On get or update move the node to the recent end; on insert over capacity remove the node at the old end. In Python, OrderedDict.move_to_end does the same.")],
        explanation=("哈希表 + 双向链表：哈希表定位节点，链表维护使用顺序，移动与删除都是 O(1)。",
                     "Hash map plus doubly linked list: the map finds nodes and the list keeps usage order, so moves and removals are O(1)."),
        boundary=[[["LRUCache", "get"], [[1], [1]]], [["LRUCache", "put", "put", "get"], [[1], [1, 1], [2, 2], [1]]],
                  [["LRUCache", "put", "put", "get", "put", "get", "get"], [[2], [1, 1], [2, 2], [1], [3, 3], [2], [3]]],
                  [["LRUCache", "put", "put", "put", "get"], [[2], [1, 1], [1, 5], [2, 2], [1]]]],
        inputs=[{"type": "string[]"}, {"type": "json"}],
        hooks='''
def adjust(args, rng, size):
    capacity = rng.randint(1, 3) if size == "small" else 100
    count = rng.randint(1, 12) if size == "small" else 8000
    keys = 5 if size == "small" else 300
    ops, values = ["LRUCache"], [[capacity]]
    for _ in range(count):
        if rng.random() < 0.5:
            ops.append("get")
            values.append([rng.randrange(keys)])
        else:
            ops.append("put")
            values.append([rng.randrange(keys), rng.randint(0, 100000)])
    return [ops, values]
''',
        reference='''
from collections import OrderedDict
class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.items = OrderedDict()

    def get(self, key):
        if key not in self.items:
            return -1
        self.items.move_to_end(key)
        return self.items[key]

    def put(self, key, value):
        self.items[key] = value
        self.items.move_to_end(key)
        if len(self.items) > self.capacity:
            self.items.popitem(last=False)
''',
        oracle='''
class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.order = []
        self.values = {}

    def get(self, key):
        if key not in self.values:
            return -1
        self.order.remove(key)
        self.order.append(key)
        return self.values[key]

    def put(self, key, value):
        if key in self.values:
            self.order.remove(key)
        self.order.append(key)
        self.values[key] = value
        if len(self.order) > self.capacity:
            old = self.order.pop(0)
            del self.values[old]
''',
    ),
    dict(
        slug="find-median-from-data-stream", topics=["design"], entry="MedianFinder",
        params=DESIGN_PARAMS, returns="json", comparator={"kind": "float", "tolerance": 0.00001},
        shape={"kind": "design", "className": "MedianFinder", "constructorParams": [],
               "methods": [{"name": "addNum", "params": [{"name": "num", "type": "int"}], "returns": "void"},
                           {"name": "findMedian", "params": [], "returns": "float"}]},
        summary=summary("设计数据结构，支持不断加入整数（addNum）并随时返回当前所有数的中位数（findMedian；偶数个时取中间两数的平均值）。findMedian 只在至少加入一个数之后调用。",
                        "Design a structure that keeps accepting integers (addNum) and returns the median of everything so far at any time (findMedian; the mean of the middle two for an even count). findMedian is only called after at least one addNum."),
        constraints=[("-10⁵ ≤ num ≤ 10⁵，调用总次数 ≤ 5×10⁴；答案误差不超过 10⁻⁵", "-10⁵ ≤ num ≤ 10⁵, at most 5×10⁴ calls; answers within 10⁻⁵ are accepted")],
        hints=[("每次查询都排序太慢。中位数只关心“中间”的位置。", "Sorting on every query is too slow. The median only cares about the middle."),
               ("把数分成较小的一半和较大的一半：较小一半用大顶堆，较大一半用小顶堆。", "Split the numbers into a smaller half in a max-heap and a larger half in a min-heap."),
               ("保持两个堆大小相差不超过 1，且小半边的最大值 ≤ 大半边的最小值；中位数由两个堆顶决定。", "Keep their sizes within one and the smaller half's maximum ≤ the larger half's minimum; the heap tops give the median.")],
        explanation=("双堆维护两半：addNum O(log n)，findMedian O(1)。", "Two heaps keep the halves: addNum is O(log n) and findMedian O(1)."),
        boundary=[[["MedianFinder", "addNum", "findMedian"], [[], [1], []]], [["MedianFinder", "addNum", "addNum", "findMedian"], [[], [1], [2], []]],
                  [["MedianFinder", "addNum", "addNum", "findMedian", "addNum", "findMedian"], [[], [1], [2], [], [3], []]],
                  [["MedianFinder", "addNum", "addNum", "findMedian"], [[], [-100000], [100000], []]]],
        inputs=[{"type": "string[]"}, {"type": "json"}],
        hooks='''
def adjust(args, rng, size):
    count = rng.randint(1, 12) if size == "small" else 8000
    low, high = (-5, 5) if size == "small" else (-100000, 100000)
    ops, values, added = ["MedianFinder"], [[]], 0
    for _ in range(count):
        if added and rng.random() < 0.4:
            ops.append("findMedian")
            values.append([])
        else:
            ops.append("addNum")
            values.append([rng.randint(low, high)])
            added += 1
    return [ops, values]
''',
        reference='''
import heapq
class MedianFinder:
    def __init__(self):
        self.low = []
        self.high = []

    def addNum(self, num):
        heapq.heappush(self.low, -num)
        heapq.heappush(self.high, -heapq.heappop(self.low))
        if len(self.high) > len(self.low):
            heapq.heappush(self.low, -heapq.heappop(self.high))

    def findMedian(self):
        if len(self.low) > len(self.high):
            return float(-self.low[0])
        return (-self.low[0] + self.high[0]) / 2
''',
        oracle='''
class MedianFinder:
    def __init__(self):
        self.values = []

    def addNum(self, num):
        self.values.append(num)

    def findMedian(self):
        ordered = sorted(self.values)
        n = len(ordered)
        return float(ordered[n // 2]) if n % 2 else (ordered[n // 2 - 1] + ordered[n // 2]) / 2
''',
    ),
]
